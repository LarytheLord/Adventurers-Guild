
import { NextResponse } from 'next/server'

// Mock database
let quests = [
  { title: "Bug Bounty Brigades", description: "Hunt down and squash bugs in existing codebases. A great way to learn and earn XP.", image: "/images/quest-board.png", rank: "C", xp: 500 },
  { title: "Digital Archaeology", description: "Explore and document legacy codebases. Uncover hidden gems and learn from the past.", image: "/images/quest-board.png", rank: "B", xp: 800 },
  { title: "Narrative-Driven Hackathons", description: "Participate in themed hackathons with engaging storylines. Build innovative solutions and win prizes.", image: "/images/quest-board.png", rank: "A", xp: 1200 },
  { title: "UI/UX Redesign Challenge", description: "Redesign the user interface of a popular open-source application. Focus on usability and modern design principles.", image: "/images/quest-board.png", rank: "B", xp: 750 },
  { title: "Open Source Contribution", description: "Contribute to a major open-source project. Add a new feature, fix a critical bug, or improve documentation.", image: "/images/quest-board.png", rank: "S", xp: 2000 },
  { title: "Code Refactoring Quest", description: "Refactor a messy codebase to improve its readability, performance, and maintainability.", image: "/images/quest-board.png", rank: "D", xp: 300 },
];

export async function GET() {
  return NextResponse.json({ quests })
}

export async function POST(request: Request) {
  try {
    const { title, description, rank, xp, image } = await request.json()

    if (!title || !description || !rank || !xp) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    const newQuest = { title, description, rank, xp, image: image || '/images/quest-board.png' };
    quests.push(newQuest);

    return NextResponse.json({ success: true, quest: newQuest })
  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
