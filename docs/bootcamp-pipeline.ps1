<#
Bootcamp E2E pipeline runner (manual validation)

Runs:
- Onboard 5 students via /api/onboard (Bearer secret)
- Verify tutorial gating + INTERN quest 403
- Complete Tutorial 1 + Tutorial 2 (claim -> submit -> admin QA approve -> company approve)
- Verify eligibleForRealQuests unlocks real BOOTCAMP quests
- Party formation for BOOTCAMP E-rank quest (max participants 2)
- Verify XP/rank via /api/users/me/stats (DB-backed)

Prereqs:
- App running (npm run dev)
- DB pushed/seeded
- .env.local includes DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, BOOTCAMP_WEBHOOK_SECRET

Usage:
  pwsh -File .\docs\bootcamp-pipeline.ps1 -BaseUrl http://localhost:3000 -BootcampWebhookSecret $env:BOOTCAMP_WEBHOOK_SECRET
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string]$BaseUrl = 'http://localhost:3000',

  [Parameter(Mandatory = $true)]
  [string]$BootcampWebhookSecret,

  [Parameter(Mandatory = $false)]
  [string]$Cohort = 'test-cohort-1',

  [Parameter(Mandatory = $false)]
  [ValidateSet('beginner','animal_advocacy','climate_action','ai_safety','hybrid')]
  [string]$BootcampTrack = 'beginner',

  [Parameter(Mandatory = $false)]
  [string]$InitialPassword = 'password123',

  [Parameter(Mandatory = $false)]
  [int]$StudentCount = 5,

  [Parameter(Mandatory = $false)]
  [string]$AdminEmail = 'admin@adventurersguild.com',

  [Parameter(Mandatory = $false)]
  [string]$CompanyEmail = 'contact@knightmedicare.com',

  [Parameter(Mandatory = $false)]
  [string]$SeedPassword = 'password123'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Normalize-BaseUrl([string]$u) {
  $u = $u.Trim()
  if ($u.EndsWith('/')) { return $u.Substring(0, $u.Length - 1) }
  return $u
}

$BaseUrl = Normalize-BaseUrl $BaseUrl

function Write-Step([string]$title) {
  Write-Host "\n=== $title ===" -ForegroundColor Cyan
}

function Assert-True([bool]$cond, [string]$message) {
  if (-not $cond) { throw "ASSERT FAILED: $message" }
  Write-Host "PASS: $message" -ForegroundColor Green
}

function Invoke-ApiJson {
  param(
    [Parameter(Mandatory=$true)][ValidateSet('GET','POST','PUT','PATCH','DELETE')][string]$Method,
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$false)][Microsoft.PowerShell.Commands.WebRequestSession]$Session,
    [Parameter(Mandatory=$false)][hashtable]$Headers,
    [Parameter(Mandatory=$false)]$Body
  )

  $uri = "$BaseUrl$Path"

  $sc = $null
  $rh = $null
  $params = @{
    Uri = $uri
    Method = $Method
    SkipHttpErrorCheck = $true
    StatusCodeVariable = 'sc'
    ResponseHeadersVariable = 'rh'
  }
  if ($Session) { $params.WebSession = $Session }
  if ($Headers) { $params.Headers = $Headers }

  if ($null -ne $Body) {
    $params.Body = ($Body | ConvertTo-Json -Depth 10)
    $params.ContentType = 'application/json'
  }

  $json = Invoke-RestMethod @params

  return [pscustomobject]@{
    Status  = [int]$sc
    Headers = $rh
    Json    = $json
  }
}

function New-Session() {
  return [Microsoft.PowerShell.Commands.WebRequestSession]::new()
}

function Sign-In {
  param(
    [Parameter(Mandatory=$true)][Microsoft.PowerShell.Commands.WebRequestSession]$Session,
    [Parameter(Mandatory=$true)][string]$Email,
    [Parameter(Mandatory=$true)][string]$Password
  )

  # 1) Fetch CSRF token
  $csrf = Invoke-RestMethod -Uri "$BaseUrl/api/auth/csrf" -WebSession $Session
  if (-not $csrf.csrfToken) { throw 'Failed to fetch CSRF token from NextAuth' }

  # 2) Credentials callback (form-encoded)
  $form = @{
    csrfToken  = $csrf.csrfToken
    email      = $Email
    password   = $Password
    callbackUrl = "$BaseUrl/dashboard"
    json       = 'true'
  }

  try {
    Invoke-WebRequest -Uri "$BaseUrl/api/auth/callback/credentials" -Method POST -Body $form -ContentType 'application/x-www-form-urlencoded' -WebSession $Session -MaximumRedirection 0 | Out-Null
  } catch {
    # NextAuth commonly returns 302; Invoke-WebRequest may throw depending on redirects.
    # Cookies are still stored in $Session.
  }

  $cookies = $Session.Cookies.GetCookies([Uri]$BaseUrl)
  $hasSessionCookie = $false
  foreach ($c in $cookies) {
    if ($c.Name -like '*session-token*') { $hasSessionCookie = $true }
  }
  if (-not $hasSessionCookie) {
    throw "Login failed for $Email (no session-token cookie set)"
  }
}

# Seed company userId referenced by prisma/seed.ts
$SeedCompanyId = '33333333-3333-3333-3333-333333333333'

Write-Step 'Step 0: Login admin + company'
$adminSession = New-Session
Sign-In -Session $adminSession -Email $AdminEmail -Password $SeedPassword
Write-Host "Admin logged in: $AdminEmail" -ForegroundColor Green

$companySession = New-Session
Sign-In -Session $companySession -Email $CompanyEmail -Password $SeedPassword
Write-Host "Company logged in: $CompanyEmail" -ForegroundColor Green

Write-Step 'Step 0.1: Create 1 INTERN quest for 403 direct-URL test'
$internQuest = Invoke-ApiJson -Method POST -Path '/api/admin/quests' -Session $adminSession -Body @{
  title = 'INTERN: Direct URL Gate Test'
  description = 'INTERN quest used to verify bootcamp students get 403 on direct access.'
  questType = 'learning'
  difficulty = 'F'
  xpReward = 100
  questCategory = 'backend'
  track = 'INTERN'
  source = 'CLIENT_PORTAL'
  status = 'available'
  companyId = $SeedCompanyId
  requiredSkills = @()
  maxParticipants = 1
}
Assert-True ($internQuest.Status -eq 201) "Created INTERN quest (status=201)"
$internQuestId = $internQuest.Json.quest.id

Write-Step 'Step 0.2: Create tutorial quests + a real BOOTCAMP quest + an E-rank party quest'
# Tutorial 1 (F) and Tutorial 2 (E) are source=TUTORIAL so they show pre-unlock.
$tut1 = Invoke-ApiJson -Method POST -Path '/api/admin/quests' -Session $adminSession -Body @{
  title = 'Tutorial: First Blood'
  description = 'Bootcamp tutorial quest 1.'
  questType = 'learning'
  difficulty = 'F'
  xpReward = 600
  questCategory = 'backend'
  track = 'BOOTCAMP'
  source = 'TUTORIAL'
  status = 'available'
  companyId = $SeedCompanyId
  requiredSkills = @()
  maxParticipants = 999
}
Assert-True ($tut1.Status -eq 201) 'Created Tutorial 1'
$tut1Id = $tut1.Json.quest.id

$tut2 = Invoke-ApiJson -Method POST -Path '/api/admin/quests' -Session $adminSession -Body @{
  title = 'Tutorial: Party Up'
  description = 'Bootcamp tutorial quest 2.'
  questType = 'learning'
  difficulty = 'E'
  xpReward = 600
  questCategory = 'backend'
  track = 'BOOTCAMP'
  source = 'TUTORIAL'
  status = 'available'
  companyId = $SeedCompanyId
  requiredSkills = @()
  maxParticipants = 999
}
Assert-True ($tut2.Status -eq 201) 'Created Tutorial 2'
$tut2Id = $tut2.Json.quest.id

$realQuest = Invoke-ApiJson -Method POST -Path '/api/admin/quests' -Session $adminSession -Body @{
  title = 'BOOTCAMP: Real Quest (Unlock Test)'
  description = 'Non-tutorial bootcamp quest that should only appear after tutorials.'
  questType = 'learning'
  difficulty = 'F'
  xpReward = 250
  questCategory = 'backend'
  track = 'BOOTCAMP'
  source = 'CLIENT_PORTAL'
  status = 'available'
  companyId = $SeedCompanyId
  requiredSkills = @()
  maxParticipants = 5
}
Assert-True ($realQuest.Status -eq 201) 'Created real BOOTCAMP quest'
$realQuestId = $realQuest.Json.quest.id

$partyQuest = Invoke-ApiJson -Method POST -Path '/api/admin/quests' -Session $adminSession -Body @{
  title = 'BOOTCAMP: E-Rank Pair Quest'
  description = 'Bootcamp pair quest for party formation testing.'
  questType = 'learning'
  difficulty = 'E'
  xpReward = 300
  questCategory = 'backend'
  track = 'BOOTCAMP'
  source = 'CLIENT_PORTAL'
  status = 'available'
  companyId = $SeedCompanyId
  requiredSkills = @()
  maxParticipants = 2
}
Assert-True ($partyQuest.Status -eq 201) 'Created BOOTCAMP party quest'
$partyQuestId = $partyQuest.Json.quest.id

Write-Step 'Step 1: Onboard students'
$students = @()
for ($i = 1; $i -le $StudentCount; $i++) {
  $email = "test$i@bootcamp.dev"
  $studentId = ('BC{0:D3}' -f $i)

  $resp = Invoke-ApiJson -Method POST -Path '/api/onboard' -Headers @{
    Authorization = "Bearer $BootcampWebhookSecret"
  } -Body @{
    name = "Test Student $i"
    email = $email
    bootcampStudentId = $studentId
    cohort = $Cohort
    bootcampTrack = $BootcampTrack
    bootcampWeek = 1
    initialPassword = $InitialPassword
  }

  Assert-True ($resp.Status -in 201,200) "Onboarded $email (status=$($resp.Status))"

  $students += [pscustomobject]@{
    Index = $i
    Email = $email
    AdventurerId = $resp.Json.adventurerId
    Session = $null
  }
}

Write-Step 'Step 2: Verify gating (quest list + INTERN quest 403)'
foreach ($s in $students) {
  $sess = New-Session
  Sign-In -Session $sess -Email $s.Email -Password $InitialPassword
  $s.Session = $sess

  $q = Invoke-ApiJson -Method GET -Path '/api/quests?status=available&limit=50' -Session $sess
  Assert-True ($q.Status -eq 200) "Fetched quest list for $($s.Email)"

  $quests = @($q.Json.quests)
  Assert-True ($quests.Count -ge 1) "Has at least 1 visible quest (tutorials)"

  $nonBootcamp = $quests | Where-Object { $_.track -ne 'BOOTCAMP' }
  Assert-True ($nonBootcamp.Count -eq 0) "Only sees BOOTCAMP track quests"

  $nonTutorial = $quests | Where-Object { $_.source -ne 'TUTORIAL' }
  Assert-True ($nonTutorial.Count -eq 0) "Only sees TUTORIAL quests before unlock"

  $internDirect = Invoke-ApiJson -Method GET -Path ("/api/quests/$internQuestId") -Session $sess
  Assert-True ($internDirect.Status -eq 403) "Direct INTERN quest access returns 403"
}

function Complete-QuestFlow {
  param(
    [Parameter(Mandatory=$true)][Microsoft.PowerShell.Commands.WebRequestSession]$StudentSession,
    [Parameter(Mandatory=$true)][string]$QuestId,
    [Parameter(Mandatory=$true)][string]$QuestLabel
  )

  # Claim
  $claim = Invoke-ApiJson -Method POST -Path '/api/quests/assignments' -Session $StudentSession -Body @{ questId = $QuestId }
  Assert-True ($claim.Status -eq 201) "Claimed $QuestLabel"
  $assignmentId = $claim.Json.assignment.id

  # Submit
  $submit = Invoke-ApiJson -Method POST -Path '/api/quests/submissions' -Session $StudentSession -Body @{
    assignmentId = $assignmentId
    submissionContent = "https://example.com/submission/$assignmentId"
    submissionNotes = 'Automated bootcamp pipeline validation'
  }
  Assert-True ($submit.Status -eq 201) "Submitted $QuestLabel"
  $submissionId = $submit.Json.submission.id

  # Admin QA approve (pending_admin_review -> review)
  $qa = Invoke-ApiJson -Method PATCH -Path ("/api/admin/qa-queue/$assignmentId") -Session $adminSession -Body @{ action = 'approve' }
  Assert-True ($qa.Status -eq 200) "Admin QA approved $QuestLabel (forwarded to client review)"

  # Company approve (review -> completed) + XP grant
  $approve = Invoke-ApiJson -Method POST -Path '/api/qa/reviews' -Session $companySession -Body @{
    submissionId = $submissionId
    quality_score = 90
    status = 'approved'
    review_notes = "Approved: $QuestLabel"
  }
  Assert-True ($approve.Status -eq 200) "Company approved $QuestLabel (completed + XP granted)"

  return [pscustomobject]@{ AssignmentId = $assignmentId; SubmissionId = $submissionId }
}

Write-Step 'Step 3 + 4: Complete Tutorial Quest 1 and 2 for ALL students'
foreach ($s in $students) {
  Write-Host "\n-- Student $($s.Index): $($s.Email) --" -ForegroundColor Yellow

  Complete-QuestFlow -StudentSession $s.Session -QuestId $tut1Id -QuestLabel 'Tutorial 1'
  Complete-QuestFlow -StudentSession $s.Session -QuestId $tut2Id -QuestLabel 'Tutorial 2'

  # Verify unlock: should now see non-tutorial BOOTCAMP quest
  $q2 = Invoke-ApiJson -Method GET -Path '/api/quests?status=available&limit=50' -Session $s.Session
  $quests2 = @($q2.Json.quests)
  $nonTutorial2 = $quests2 | Where-Object { $_.source -ne 'TUTORIAL' }
  Assert-True ($nonTutorial2.Count -ge 1) 'Sees real BOOTCAMP quests after tutorials'

  # Verify can apply to real quest
  $applyReal = Invoke-ApiJson -Method POST -Path '/api/quests/assignments' -Session $s.Session -Body @{ questId = $realQuestId }
  Assert-True ($applyReal.Status -eq 201) 'Can claim a real BOOTCAMP quest after unlock'
}

Write-Step 'Step 6: Party formation (Students 1 + 2)'
$student1 = $students | Where-Object { $_.Index -eq 1 } | Select-Object -First 1
$student2 = $students | Where-Object { $_.Index -eq 2 } | Select-Object -First 1

Assert-True ($null -ne $student1 -and $null -ne $student2) 'Have student 1 and 2'

# Verify rank-up evidence via DB-backed stats endpoint (should be >= E after 2 tutorials at 600xp each)
$stats1 = Invoke-ApiJson -Method GET -Path '/api/users/me/stats' -Session $student1.Session
Assert-True ($stats1.Status -eq 200) 'Fetched /api/users/me/stats for student 1'
Write-Host "Student1 rank=$($stats1.Json.rank) xp=$($stats1.Json.xp)" -ForegroundColor Green
Assert-True ($stats1.Json.rank -in @('E','D','C','B','A','S')) 'Student 1 rank is E or higher'

$partyCreate = Invoke-ApiJson -Method POST -Path '/api/parties' -Session $student1.Session -Body @{ questId = $partyQuestId }
Assert-True ($partyCreate.Status -eq 201) 'Student 1 created party'
$partyId = $partyCreate.Json.party.id

$partyAdd = Invoke-ApiJson -Method POST -Path ("/api/parties/$partyId/members") -Session $student1.Session -Body @{ userId = $student2.AdventurerId }
Assert-True ($partyAdd.Status -eq 201) 'Student 1 added Student 2 to party'

# Both claim and complete the party quest
$flow1 = Complete-QuestFlow -StudentSession $student1.Session -QuestId $partyQuestId -QuestLabel 'Party Quest (Student 1)'
$flow2 = Complete-QuestFlow -StudentSession $student2.Session -QuestId $partyQuestId -QuestLabel 'Party Quest (Student 2)'

Write-Step 'DONE: Pipeline evidence summary'
Write-Host "Onboarded students: $StudentCount" -ForegroundColor Green
Write-Host "Tutorial quests: $tut1Id, $tut2Id" -ForegroundColor Green
Write-Host "Real quest (unlock test): $realQuestId" -ForegroundColor Green
Write-Host "Party quest: $partyQuestId (partyId=$partyId)" -ForegroundColor Green
Write-Host "INTERN 403 quest: $internQuestId" -ForegroundColor Green
