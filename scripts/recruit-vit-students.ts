#!/usr/bin/env node
/**
 * VIT Student Recruitment Script
 * Sends compelling invitation emails to VIT Chennai students
 *
 * Usage: npx ts-node scripts/recruit-vit-students.ts
 *
 * Rate Limiting: Resend free tier allows ~100 emails/day
 * This script sends in batches with 1-second delays to stay safe
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Resend } from 'resend';
import ExcelJS from 'exceljs';

interface Student {
  email: string;
  fullName: string;
  college: string;
  degree: string;
  linkedIn?: string;
}

interface SendLog {
  timestamp: string;
  email: string;
  name: string;
  status: 'sent' | 'failed';
  error?: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = 'noreply@guilds.work';
const BATCH_SIZE = 50; // Resend free tier ~100/day, we'll do 50/batch with delay
const DELAY_BETWEEN_SENDS_MS = 500; // 500ms between individual sends

if (!RESEND_API_KEY) {
  console.error('❌ Error: RESEND_API_KEY not found in environment variables');
  console.error('Set it in your .env.local file');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);
const logFile = path.join(process.cwd(), 'recruitment-logs.json');

// Load previously sent emails to avoid duplicates
function loadSentLog(): Set<string> {
  if (fs.existsSync(logFile)) {
    const logs: SendLog[] = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
    return new Set(logs.filter(l => l.status === 'sent').map(l => l.email));
  }
  return new Set();
}

// Append to send log
function appendToLog(log: SendLog): void {
  const logs: SendLog[] = fs.existsSync(logFile)
    ? JSON.parse(fs.readFileSync(logFile, 'utf-8'))
    : [];
  logs.push(log);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

// Generate compelling email HTML
function generateEmailHTML(student: Student): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #721FE5 0%, #9D4EDD 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 8px 0 0 0; opacity: 0.95; }
    .content { padding: 30px 0; }
    .section { margin: 20px 0; }
    .section h2 { color: #721FE5; font-size: 18px; margin-top: 0; }
    .highlight { background: #f5f5f5; padding: 15px; border-left: 4px solid #721FE5; margin: 15px 0; }
    .cta-button { display: inline-block; background: #721FE5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 10px 0; }
    .cta-button:hover { background: #5a1a9f; }
    .social-links { display: flex; gap: 15px; margin: 20px 0; }
    .social-links a { color: #721FE5; text-decoration: none; font-weight: 600; }
    .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #666; }
    .footer p { margin: 5px 0; }
    ul { margin: 10px 0; padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎮 Welcome to Adventurers Guild</h1>
      <p>Where Learning Meets Real Opportunities</p>
    </div>

    <div class="content">
      <p>Hey ${student.fullName.split(' ')[0]},</p>

      <p>We're reaching out because we believe you're exactly the kind of ambitious developer/engineer we're looking for.</p>

      <div class="highlight">
        <strong>What if you could:</strong>
        <ul>
          <li>✅ Build real projects and get <strong>paid immediately</strong></li>
          <li>✅ Earn credentials that actually matter (Guild Card portfolio)</li>
          <li>✅ Progress through challenges and unlock better opportunities</li>
          <li>✅ Network with top companies and mentors in tech</li>
          <li>✅ Turn your skills into actual income + career growth</li>
        </ul>
      </div>

      <div class="section">
        <h2>🚀 The Platform</h2>
        <p><strong>Adventurers Guild</strong> is a gamified marketplace where students like you complete quests (real projects from companies) and build a verified portfolio while earning money.</p>
        <p>Think of it as:</p>
        <ul>
          <li><strong>For You:</strong> Real projects → Real payment → Real credentials (not just certificates)</li>
          <li><strong>For Companies:</strong> Vetted student talent at scale with built-in QA workflow</li>
          <li><strong>For India:</strong> Creating a new credentialing standard for tech talent</li>
        </ul>
      </div>

      <div class="section">
        <h2>💰 How It Works</h2>
        <ol>
          <li><strong>Sign Up</strong> on guilds.work (2 min)</li>
          <li><strong>Complete Quests</strong> (projects from real companies)</li>
          <li><strong>Earn XP + Money</strong> (rank up, unlock harder/better paid work)</li>
          <li><strong>Build Your Guild Card</strong> (verified portfolio that companies trust)</li>
          <li><strong>Land Internships/Jobs</strong> (through direct connections or our ecosystem)</li>
        </ol>
      </div>

      <div class="highlight">
        <strong>Right Now, VIT Students Are Getting:</strong>
        <ul>
          <li>Bootcamp access with structured learning paths</li>
          <li>First-mover advantage on the best quests</li>
          <li>Direct mentorship from industry experts</li>
          <li>Internship opportunities starting ₹10k-50k per project</li>
        </ul>
      </div>

      <div class="section">
        <h2>📱 Join the Community</h2>
        <p>We're building this with students like you. The best way to stay updated and ask questions:</p>
        <div class="social-links">
          <a href="https://whatsapp.com/channel/0029Vb8p9Eq5PO19TVAu8G1R">📱 WhatsApp Channel</a>
          <a href="https://www.linkedin.com/company/adventurers-guild/">💼 LinkedIn</a>
          <a href="https://x.com/AdvGuildHQ">𝕏 Follow Us</a>
        </div>
      </div>

      <div class="section" style="text-align: center;">
        <p style="margin: 20px 0;">
          <a href="https://guilds.work" class="cta-button">🎯 Start Your Quest on guilds.work</a>
        </p>
        <p style="font-size: 14px; color: #666;">Takes 2 minutes to create your adventurer profile</p>
      </div>

      <div class="section">
        <h2>❓ Questions?</h2>
        <p>Hit us up on:</p>
        <ul>
          <li><strong>WhatsApp Channel:</strong> <a href="https://whatsapp.com/channel/0029Vb8p9Eq5PO19TVAu8G1R">https://whatsapp.com/channel/0029Vb8p9Eq5PO19TVAu8G1R</a></li>
          <li><strong>Email:</strong> <a href="mailto:abid@guilds.work">abid@guilds.work</a></li>
          <li><strong>Website:</strong> <a href="https://guilds.work">https://guilds.work</a></li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p><strong>Why Us?</strong> We're not a typical job board. We're building a credentialing engine where every project you complete, every quest you finish, adds to your verified portfolio that companies actually trust.</p>
      <p style="margin-top: 15px; font-style: italic;">You're receiving this because you're a top student at VIT Chennai. We're only reaching out to serious builders.</p>
      <p>—</p>
      <p>Adventurers Guild | Building India's Tech Credentialing Standard</p>
      <p><a href="https://guilds.work" style="color: #721FE5;">guilds.work</a> | <a href="https://www.linkedin.com/company/adventurers-guild/" style="color: #721FE5;">LinkedIn</a> | <a href="https://x.com/AdvGuildHQ" style="color: #721FE5;">X/Twitter</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Read Excel file
async function readStudents(): Promise<Student[]> {
  const excelPath = path.join(process.cwd(), 'temp', 'Untitled spreadsheet.xlsx');

  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Excel file not found at: ${excelPath}`);
    process.exit(1);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);
  const worksheet = workbook.worksheets[0];

  const students: Student[] = [];

  worksheet.eachRow((row, rowIndex) => {
    if (rowIndex === 1) return; // Skip header

    const values = row.values as (string | { text: string } | null)[];

    // ExcelJS arrays are 1-indexed with an empty first item
    const email = values[1] as string | undefined;
    const fullName = values[2] as string | undefined;
    const college = values[3] as string | undefined;
    const degree = values[4] as string | undefined;

    // LinkedIn might be a hyperlink object
    let linkedIn = values[5];
    const linkedInUrl = typeof linkedIn === 'object' && linkedIn?.text
      ? (linkedIn.text as string)
      : (linkedIn as string | undefined);

    if (email && fullName) {
      students.push({
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        college: college?.trim() || 'VIT Chennai',
        degree: degree?.trim() || '',
        linkedIn: linkedInUrl?.trim(),
      });
    }
  });

  return students;
}

// Send email via Resend
async function sendEmail(student: Student): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: student.email,
      subject: '🎮 You\'re Invited: Real Projects, Real Pay, Real Credentials',
      html: generateEmailHTML(student),
      replyTo: 'abid@guilds.work',
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMsg };
  }
}

// Main execution
async function main() {
  console.log('📧 VIT Student Recruitment Campaign');
  console.log('=====================================\n');

  // Load students
  console.log('📂 Reading student data...');
  const students = await readStudents();
  console.log(`✅ Found ${students.length} students\n`);

  // Load previously sent
  const sentEmails = loadSentLog();
  const newStudents = students.filter(s => !sentEmails.has(s.email));

  console.log(`📊 Stats:`);
  console.log(`   Total students: ${students.length}`);
  console.log(`   Already sent: ${sentEmails.size}`);
  console.log(`   New to send: ${newStudents.length}\n`);

  if (newStudents.length === 0) {
    console.log('✅ All students have already been contacted!');
    process.exit(0);
  }

  // Cap at 100 per day (Resend free tier limit)
  const DAILY_LIMIT = 100;
  const studentsToSendToday = newStudents.slice(0, DAILY_LIMIT);
  const remaining = newStudents.length - studentsToSendToday.length;

  console.log(`⚠️  Resend free tier limit: ${DAILY_LIMIT} emails/day`);
  console.log(`   Sending today: ${studentsToSendToday.length}`);
  if (remaining > 0) {
    console.log(`   Remaining for tomorrow: ${remaining}`);
  }
  console.log('');

  // Send emails (limited to daily cap)
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < studentsToSendToday.length; i++) {
    const student = studentsToSendToday[i];

    console.log(`[${i + 1}/${studentsToSendToday.length}] Sending to ${student.email}...`);

    const result = await sendEmail(student);

    if (result.success) {
      console.log(`   ✅ Sent to ${student.fullName}`);
      appendToLog({
        timestamp: new Date().toISOString(),
        email: student.email,
        name: student.fullName,
        status: 'sent',
      });
      successCount++;
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
      appendToLog({
        timestamp: new Date().toISOString(),
        email: student.email,
        name: student.fullName,
        status: 'failed',
        error: result.error,
      });
      failureCount++;
    }

    // Rate limiting: wait before next send
    if (i < studentsToSendToday.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_SENDS_MS));
    }
  }

  console.log('\n=====================================');
  console.log(`✅ Daily Campaign Complete!`);
  console.log(`   Sent today: ${successCount}`);
  console.log(`   Failed today: ${failureCount}`);
  if (remaining > 0) {
    console.log(`   \n📅 Schedule for tomorrow:`);
    console.log(`      npx ts-node scripts/recruit-vit-students.ts`);
    console.log(`      (Will send next ${remaining} students)`);
  }
  console.log(`   \n📄 Log: ${logFile}\n`);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
