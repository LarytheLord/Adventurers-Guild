// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'password123';

async function main() {
  console.log('🌱 Seeding database...');

  // Hash the default password
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.questCompletion.deleteMany();
  await prisma.questSubmission.deleteMany();
  await prisma.questAssignment.deleteMany();
  await prisma.skillProgress.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.skillCategory.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.adventurerProfile.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.quest.deleteMany();
  await prisma.user.deleteMany();

  console.log('  Cleared existing data');

  // ── Users ────────────────────────────────────────────────
  const users = await Promise.all([
    // Companies
    prisma.user.create({
      data: {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Knight Medicare',
        email: 'contact@knightmedicare.com',
        passwordHash,
        role: 'company',
        rank: 'S',
        isVerified: true,
        bio: 'Leading healthcare technology company',
        location: 'Ahmedabad, India',
        github: 'knight-medicare',
        linkedin: 'knight-medicare',
      },
    }),
    prisma.user.create({
      data: {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Open Paws Animal Shelter',
        email: 'hello@openpaws.org',
        passwordHash,
        role: 'company',
        rank: 'A',
        isVerified: true,
        bio: 'Non-profit animal welfare organization',
        location: 'Mumbai, India',
        github: 'open-paws',
        linkedin: 'open-paws',
      },
    }),
    prisma.user.create({
      data: {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'TechVenture Startup',
        email: 'founders@techventure.io',
        passwordHash,
        role: 'company',
        rank: 'B',
        bio: 'Early-stage SaaS startup',
        location: 'Bangalore, India',
        github: 'techventure',
        linkedin: 'techventure-startup',
      },
    }),
    // Adventurers
    prisma.user.create({
      data: {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        passwordHash,
        role: 'adventurer',
        rank: 'S',
        xp: 15000,
        skillPoints: 120,
        level: 15,
        isVerified: true,
        bio: 'Full-stack developer specializing in React and Node.js',
        location: 'Gandhinagar, India',
        github: 'priya-dev',
        linkedin: 'priya-sharma-dev',
      },
    }),
    prisma.user.create({
      data: {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Raj Patel',
        email: 'raj.patel@example.com',
        passwordHash,
        role: 'adventurer',
        rank: 'A',
        xp: 8500,
        skillPoints: 75,
        level: 10,
        isVerified: true,
        bio: 'Backend specialist with expertise in Python and Django',
        location: 'Ahmedabad, India',
        github: 'raj-codes',
        linkedin: 'raj-patel-eng',
      },
    }),
    prisma.user.create({
      data: {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'Ananya Desai',
        email: 'ananya.desai@example.com',
        passwordHash,
        role: 'adventurer',
        rank: 'B',
        xp: 4200,
        skillPoints: 45,
        level: 7,
        isVerified: true,
        bio: 'Frontend developer passionate about UI/UX',
        location: 'Surat, India',
        github: 'ananya-ui',
        linkedin: 'ananya-desai',
      },
    }),
    prisma.user.create({
      data: {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        name: 'Arjun Kumar',
        email: 'arjun.kumar@example.com',
        passwordHash,
        role: 'adventurer',
        rank: 'C',
        xp: 2100,
        skillPoints: 28,
        level: 5,
        isVerified: true,
        bio: 'CS student learning full-stack development',
        location: 'Vadodara, India',
        github: 'arjun-learns',
        linkedin: 'arjun-kumar-cs',
      },
    }),
    prisma.user.create({
      data: {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        name: 'Neha Singh',
        email: 'neha.singh@example.com',
        passwordHash,
        role: 'adventurer',
        rank: 'D',
        xp: 900,
        skillPoints: 15,
        level: 3,
        isVerified: true,
        bio: 'Aspiring mobile developer',
        location: 'Rajkot, India',
        github: 'neha-mobile',
        linkedin: 'neha-singh-dev',
      },
    }),
    prisma.user.create({
      data: {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        name: 'Karan Mehta',
        email: 'karan.mehta@example.com',
        passwordHash,
        role: 'adventurer',
        rank: 'E',
        xp: 350,
        skillPoints: 8,
        level: 2,
        bio: 'Junior developer eager to learn',
        location: 'Bhavnagar, India',
        github: 'karan-dev',
        linkedin: 'karan-mehta',
      },
    }),
    prisma.user.create({
      data: {
        id: '99999999-9999-9999-9999-999999999999',
        name: 'Sanya Joshi',
        email: 'sanya.joshi@example.com',
        passwordHash,
        role: 'adventurer',
        rank: 'F',
        xp: 100,
        skillPoints: 3,
        level: 1,
        bio: 'Brand new to programming, ready to start my journey!',
        location: 'Gandhinagar, India',
        github: 'sanya-codes',
        linkedin: 'sanya-joshi',
      },
    }),
    // Demo account
    prisma.user.create({
      data: {
        id: 'de00de00-de00-de00-de00-de00de00de00',
        name: 'Demo Adventurer',
        email: 'demo@adventurersguild.com',
        passwordHash,
        role: 'adventurer',
        rank: 'C',
        xp: 2500,
        skillPoints: 30,
        level: 5,
        isVerified: true,
        bio: 'Demo account - explore the platform!',
        location: 'Demo City',
        github: 'demo-adventurer',
        linkedin: 'demo-adventurer',
      },
    }),
    // Admin account
    prisma.user.create({
      data: {
        id: 'adadadad-adad-adad-adad-adadadadadad',
        name: 'Admin',
        email: 'admin@adventurersguild.com',
        passwordHash,
        role: 'admin',
        rank: 'S',
        isVerified: true,
        bio: 'Platform administrator',
        location: 'System',
      },
    }),
  ]);
  console.log(`  Created ${users.length} users`);

  // ── Company Profiles ──────────────────────────────────────
  await prisma.companyProfile.createMany({
    data: [
      {
        userId: '11111111-1111-1111-1111-111111111111',
        companyName: 'Knight Medicare',
        companyWebsite: 'https://knightmedicare.com',
        companyDescription: 'Healthcare technology platform connecting patients with doctors',
        industry: 'Healthcare Tech',
        size: 'small',
        isVerified: true,
        questsPosted: 8,
        totalSpent: 125000.0,
      },
      {
        userId: '22222222-2222-2222-2222-222222222222',
        companyName: 'Open Paws Animal Shelter',
        companyWebsite: 'https://openpaws.org',
        companyDescription: 'Animal welfare organization helping stray animals find homes',
        industry: 'Non-Profit',
        size: 'startup',
        isVerified: true,
        questsPosted: 5,
        totalSpent: 45000.0,
      },
      {
        userId: '33333333-3333-3333-3333-333333333333',
        companyName: 'TechVenture Startup',
        companyWebsite: 'https://techventure.io',
        companyDescription: 'Building next-generation project management tools',
        industry: 'SaaS',
        size: 'startup',
        isVerified: false,
        questsPosted: 2,
        totalSpent: 18000.0,
      },
    ],
  });
  console.log('  Created company profiles');

  // ── Adventurer Profiles ───────────────────────────────────
  await prisma.adventurerProfile.createMany({
    data: [
      { userId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', specialization: 'Full-Stack Development', primarySkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'], availabilityStatus: 'available', questCompletionRate: 95.5, totalQuestsCompleted: 28, currentStreak: 7, longestStreak: 12, streakMultiplier: 1.35 },
      { userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', specialization: 'Backend Development', primarySkills: ['Python', 'Django', 'PostgreSQL', 'Redis'], availabilityStatus: 'busy', questCompletionRate: 92.3, totalQuestsCompleted: 22, currentStreak: 5, longestStreak: 9, streakMultiplier: 1.25 },
      { userId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', specialization: 'Frontend Development', primarySkills: ['React', 'CSS', 'Figma', 'JavaScript'], availabilityStatus: 'available', questCompletionRate: 88.0, totalQuestsCompleted: 15, currentStreak: 4, longestStreak: 6, streakMultiplier: 1.2 },
      { userId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', specialization: 'Full-Stack Development', primarySkills: ['JavaScript', 'React', 'Express'], availabilityStatus: 'available', questCompletionRate: 83.3, totalQuestsCompleted: 9, currentStreak: 3, longestStreak: 4, streakMultiplier: 1.15 },
      { userId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', specialization: 'Mobile Development', primarySkills: ['React Native', 'JavaScript'], availabilityStatus: 'available', questCompletionRate: 75.0, totalQuestsCompleted: 4, currentStreak: 2, longestStreak: 2, streakMultiplier: 1.1 },
      { userId: 'ffffffff-ffff-ffff-ffff-ffffffffffff', specialization: 'Frontend Development', primarySkills: ['HTML', 'CSS', 'JavaScript'], availabilityStatus: 'available', questCompletionRate: 66.7, totalQuestsCompleted: 2, currentStreak: 1, longestStreak: 1, streakMultiplier: 1.05 },
      { userId: '99999999-9999-9999-9999-999999999999', specialization: 'Learning', primarySkills: ['HTML', 'CSS'], availabilityStatus: 'available', questCompletionRate: 0, totalQuestsCompleted: 0, currentStreak: 0, longestStreak: 0, streakMultiplier: 1.0 },
      { userId: 'de00de00-de00-de00-de00-de00de00de00', specialization: 'Full-Stack Development', primarySkills: ['React', 'Node.js', 'MongoDB'], availabilityStatus: 'available', questCompletionRate: 85.7, totalQuestsCompleted: 10, currentStreak: 3, longestStreak: 5, streakMultiplier: 1.15 },
    ],
  });
  console.log('  Created adventurer profiles');

  // ── Skill Categories ──────────────────────────────────────
  await prisma.skillCategory.createMany({
    data: [
      { id: 'ca100000-1111-1111-1111-111111111111', name: 'Frontend Development', description: 'Client-side web development skills', icon: '🎨' },
      { id: 'ca200000-2222-2222-2222-222222222222', name: 'Backend Development', description: 'Server-side development skills', icon: '⚙️' },
      { id: 'ca300000-3333-3333-3333-333333333333', name: 'Database', description: 'Database design and management', icon: '🗄️' },
      { id: 'ca400000-4444-4444-4444-444444444444', name: 'DevOps', description: 'Deployment and infrastructure', icon: '🚀' },
      { id: 'ca500000-5555-5555-5555-555555555555', name: 'Mobile Development', description: 'Mobile app development', icon: '📱' },
    ],
  });
  console.log('  Created skill categories');

  // ── Skills ────────────────────────────────────────────────
  await prisma.skill.createMany({
    data: [
      { id: '00000001-0000-0000-0000-000000000001', name: 'React', description: 'Modern JavaScript library for building user interfaces', categoryId: 'ca100000-1111-1111-1111-111111111111' },
      { id: '00000002-0000-0000-0000-000000000002', name: 'Vue.js', description: 'Progressive JavaScript framework', categoryId: 'ca100000-1111-1111-1111-111111111111' },
      { id: '00000003-0000-0000-0000-000000000003', name: 'CSS/Tailwind', description: 'Styling and design systems', categoryId: 'ca100000-1111-1111-1111-111111111111' },
      { id: '00000004-0000-0000-0000-000000000004', name: 'TypeScript', description: 'Typed JavaScript', categoryId: 'ca100000-1111-1111-1111-111111111111' },
      { id: '00000005-0000-0000-0000-000000000005', name: 'Node.js', description: 'JavaScript runtime for server-side development', categoryId: 'ca200000-2222-2222-2222-222222222222' },
      { id: '00000006-0000-0000-0000-000000000006', name: 'Python/Django', description: 'Python web framework', categoryId: 'ca200000-2222-2222-2222-222222222222' },
      { id: '00000007-0000-0000-0000-000000000007', name: 'Express.js', description: 'Node.js web framework', categoryId: 'ca200000-2222-2222-2222-222222222222' },
      { id: '00000008-0000-0000-0000-000000000008', name: 'PostgreSQL', description: 'Advanced relational database', categoryId: 'ca300000-3333-3333-3333-333333333333' },
      { id: '00000009-0000-0000-0000-000000000009', name: 'MongoDB', description: 'NoSQL document database', categoryId: 'ca300000-3333-3333-3333-333333333333' },
      { id: '00000010-0000-0000-0000-000000000010', name: 'Redis', description: 'In-memory data store', categoryId: 'ca300000-3333-3333-3333-333333333333' },
      { id: '00000011-0000-0000-0000-000000000011', name: 'Docker', description: 'Containerization platform', categoryId: 'ca400000-4444-4444-4444-444444444444' },
      { id: '00000012-0000-0000-0000-000000000012', name: 'AWS', description: 'Cloud infrastructure', categoryId: 'ca400000-4444-4444-4444-444444444444' },
      { id: '00000013-0000-0000-0000-000000000013', name: 'React Native', description: 'Cross-platform mobile development', categoryId: 'ca500000-5555-5555-5555-555555555555' },
      { id: '00000014-0000-0000-0000-000000000014', name: 'Flutter', description: 'Cross-platform mobile framework', categoryId: 'ca500000-5555-5555-5555-555555555555' },
    ],
  });
  console.log('  Created skills');

  // ── Quests ────────────────────────────────────────────────
  const now = new Date();
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

  await prisma.quest.createMany({
    data: [
      { id: 'a0000001-0000-0000-0000-000000000001', title: 'Build Patient Dashboard UI', description: 'Create a responsive dashboard for patients to view their medical records and appointments', detailedDescription: 'We need a clean, intuitive dashboard interface using React and Tailwind CSS.', questType: 'commission', status: 'available', difficulty: 'C', xpReward: 1200, skillPointsReward: 15, monetaryReward: 12000, requiredSkills: ['React', 'CSS/Tailwind', 'TypeScript'], requiredRank: 'D', maxParticipants: 1, questCategory: 'frontend', companyId: '11111111-1111-1111-1111-111111111111', deadline: daysFromNow(14) },
      { id: 'a0000002-0000-0000-0000-000000000002', title: 'Implement User Authentication API', description: 'Build secure authentication endpoints with JWT tokens', detailedDescription: 'Create REST API endpoints for user authentication with JWT, bcrypt, rate limiting.', questType: 'commission', status: 'available', difficulty: 'B', xpReward: 1800, skillPointsReward: 22, monetaryReward: 18000, requiredSkills: ['Node.js', 'Express.js', 'PostgreSQL'], requiredRank: 'C', maxParticipants: 1, questCategory: 'backend', companyId: '11111111-1111-1111-1111-111111111111', deadline: daysFromNow(21) },
      { id: 'a0000003-0000-0000-0000-000000000003', title: 'Create Donation Page for Animal Shelter', description: 'Simple donation page with payment integration', detailedDescription: 'Build a donation landing page with hero section, amount selection, and Stripe integration.', questType: 'commission', status: 'available', difficulty: 'D', xpReward: 900, skillPointsReward: 12, monetaryReward: 9000, requiredSkills: ['React', 'CSS/Tailwind'], requiredRank: 'E', maxParticipants: 1, questCategory: 'frontend', companyId: '22222222-2222-2222-2222-222222222222', deadline: daysFromNow(10) },
      { id: 'a0000004-0000-0000-0000-000000000004', title: 'Build Task Management API', description: 'RESTful API for task management features', detailedDescription: 'Create backend API with CRUD, assignment, status tracking, due dates, and comments.', questType: 'commission', status: 'available', difficulty: 'C', xpReward: 1500, skillPointsReward: 18, monetaryReward: 15000, requiredSkills: ['Python/Django', 'PostgreSQL'], requiredRank: 'C', maxParticipants: 1, questCategory: 'backend', companyId: '33333333-3333-3333-3333-333333333333', deadline: daysFromNow(20) },
      { id: 'a0000005-0000-0000-0000-000000000005', title: 'Fix Mobile Responsive Issues', description: 'Make website mobile-friendly', detailedDescription: 'Fix navigation overlap, image scaling, and form usability on mobile.', questType: 'bug_bounty', status: 'available', difficulty: 'E', xpReward: 600, skillPointsReward: 8, monetaryReward: 6000, requiredSkills: ['CSS/Tailwind'], requiredRank: 'F', maxParticipants: 1, questCategory: 'frontend', companyId: '33333333-3333-3333-3333-333333333333', deadline: daysFromNow(7) },
      { id: 'a0000006-0000-0000-0000-000000000006', title: 'Database Schema Optimization', description: 'Optimize slow database queries', detailedDescription: 'Analyze and optimize slow queries, add indexes, improve performance.', questType: 'code_refactor', status: 'in_progress', difficulty: 'A', xpReward: 2200, skillPointsReward: 28, monetaryReward: 22000, requiredSkills: ['PostgreSQL'], requiredRank: 'B', maxParticipants: 1, questCategory: 'backend', companyId: '11111111-1111-1111-1111-111111111111', deadline: daysFromNow(15) },
      { id: 'a0000007-0000-0000-0000-000000000007', title: 'Create Blog Component Library', description: 'Reusable React components for blog', detailedDescription: 'Build article card, author bio, related posts, social share, comment section.', questType: 'commission', status: 'review', difficulty: 'C', xpReward: 1300, skillPointsReward: 16, monetaryReward: 13000, requiredSkills: ['React', 'TypeScript'], requiredRank: 'D', maxParticipants: 1, questCategory: 'frontend', companyId: '22222222-2222-2222-2222-222222222222', deadline: daysFromNow(5) },
      { id: 'a0000008-0000-0000-0000-000000000008', title: 'Setup CI/CD Pipeline', description: 'Automated deployment pipeline', detailedDescription: 'GitHub Actions for tests, Docker builds, AWS deploy, security scans.', questType: 'code_refactor', status: 'completed', difficulty: 'B', xpReward: 1600, skillPointsReward: 20, monetaryReward: 16000, requiredSkills: ['Docker', 'AWS'], requiredRank: 'B', maxParticipants: 1, questCategory: 'fullstack', companyId: '11111111-1111-1111-1111-111111111111', deadline: daysAgo(5) },
      { id: 'a0000009-0000-0000-0000-000000000009', title: 'Add Dark Mode Support', description: 'Implement theme switching', detailedDescription: 'Theme context provider, CSS variables, persistent preference, smooth transitions.', questType: 'commission', status: 'completed', difficulty: 'D', xpReward: 800, skillPointsReward: 10, monetaryReward: 8000, requiredSkills: ['React', 'CSS/Tailwind'], requiredRank: 'E', maxParticipants: 1, questCategory: 'frontend', companyId: '22222222-2222-2222-2222-222222222222', deadline: daysAgo(12) },
      { id: 'a0000010-0000-0000-0000-000000000010', title: 'Email Notification Service', description: 'Send automated emails', detailedDescription: 'Nodemailer service for welcome, password reset, weekly digest, Handlebars templates.', questType: 'commission', status: 'completed', difficulty: 'C', xpReward: 1400, skillPointsReward: 17, monetaryReward: 14000, requiredSkills: ['Node.js'], requiredRank: 'C', maxParticipants: 1, questCategory: 'backend', companyId: '33333333-3333-3333-3333-333333333333', deadline: daysAgo(20) },
    ],
  });
  console.log('  Created 10 quests');

  // ── Quest Assignments ─────────────────────────────────────
  await prisma.questAssignment.createMany({
    data: [
      { id: 'b0000001-0000-0000-0000-de00de00de00', questId: 'a0000006-0000-0000-0000-000000000006', userId: 'de00de00-de00-de00-de00-de00de00de00', status: 'in_progress', assignedAt: daysAgo(3), startedAt: daysAgo(2), progress: 65 },
      { id: 'b0000001-0000-0000-0000-000000000001', questId: 'a0000006-0000-0000-0000-000000000006', userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', status: 'in_progress', assignedAt: daysAgo(5), startedAt: daysAgo(4), progress: 70 },
      { id: 'b0000002-0000-0000-0000-000000000002', questId: 'a0000007-0000-0000-0000-000000000007', userId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', status: 'submitted', assignedAt: daysAgo(10), startedAt: daysAgo(9), completedAt: daysAgo(1), progress: 100 },
      { id: 'b0000003-0000-0000-0000-000000000003', questId: 'a0000008-0000-0000-0000-000000000008', userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', status: 'completed', assignedAt: daysAgo(15), startedAt: daysAgo(14), completedAt: daysAgo(5), progress: 100 },
      { id: 'b0000004-0000-0000-0000-000000000004', questId: 'a0000009-0000-0000-0000-000000000009', userId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', status: 'completed', assignedAt: daysAgo(20), startedAt: daysAgo(19), completedAt: daysAgo(12), progress: 100 },
    ],
  });
  console.log('  Created quest assignments');

  // ── Quest Completions ─────────────────────────────────────
  await prisma.questCompletion.createMany({
    data: [
      { id: 'c0000001-0000-0000-0000-de00de00de00', questId: 'a0000009-0000-0000-0000-000000000009', userId: 'de00de00-de00-de00-de00-de00de00de00', completionDate: daysAgo(12), xpEarned: 800, skillPointsEarned: 10, qualityScore: 9 },
      { id: 'c0000002-0000-0000-0000-de00de00de00', questId: 'a0000010-0000-0000-0000-000000000010', userId: 'de00de00-de00-de00-de00-de00de00de00', completionDate: daysAgo(20), xpEarned: 1400, skillPointsEarned: 17, qualityScore: 8 },
      { id: 'c0000001-0000-0000-0000-000000000001', questId: 'a0000008-0000-0000-0000-000000000008', userId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', completionDate: daysAgo(5), xpEarned: 1600, skillPointsEarned: 20, qualityScore: 9 },
      { id: 'c0000002-0000-0000-0000-000000000002', questId: 'a0000009-0000-0000-0000-000000000009', userId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', completionDate: daysAgo(12), xpEarned: 800, skillPointsEarned: 10, qualityScore: 8 },
    ],
  });
  console.log('  Created quest completions');

  // ── Notifications ─────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: 'de00de00-de00-de00-de00-de00de00de00', title: 'New Quest Available!', message: 'A new quest matching your skills has been posted: "Build Task Management API"', type: 'quest_assigned', data: { questId: 'a0000004-0000-0000-0000-000000000004' }, createdAt: daysAgo(2) },
      { userId: 'de00de00-de00-de00-de00-de00de00de00', title: 'Quest Completed!', message: 'Congratulations! You completed "Add Dark Mode Support" and earned 800 XP!', type: 'quest_completed', data: { questId: 'a0000009-0000-0000-0000-000000000009', xp: 800 }, createdAt: daysAgo(12) },
      { userId: 'de00de00-de00-de00-de00-de00de00de00', title: 'Rank Up!', message: 'Amazing! You\'ve reached C-Rank! Keep up the great work!', type: 'rank_up', data: { new_rank: 'C', old_rank: 'D' }, createdAt: daysAgo(15) },
    ],
  });
  console.log('  Created notifications');

  // ── Transactions ──────────────────────────────────────────
  await prisma.transaction.createMany({
    data: [
      { fromUserId: '11111111-1111-1111-1111-111111111111', toUserId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', questId: 'a0000008-0000-0000-0000-000000000008', amount: 16000, currency: 'INR', status: 'completed', paymentMethod: 'stripe', transactionId: 'txn_abc123def456', description: 'Payment for Setup CI/CD Pipeline quest', createdAt: daysAgo(5), completedAt: daysAgo(5) },
      { fromUserId: '22222222-2222-2222-2222-222222222222', toUserId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', questId: 'a0000009-0000-0000-0000-000000000009', amount: 8000, currency: 'INR', status: 'completed', paymentMethod: 'stripe', transactionId: 'txn_ghi789jkl012', description: 'Payment for Add Dark Mode Support quest', createdAt: daysAgo(12), completedAt: daysAgo(12) },
      { fromUserId: '33333333-3333-3333-3333-333333333333', toUserId: 'de00de00-de00-de00-de00-de00de00de00', questId: 'a0000010-0000-0000-0000-000000000010', amount: 14000, currency: 'INR', status: 'completed', paymentMethod: 'stripe', transactionId: 'txn_mno345pqr678', description: 'Payment for Email Notification Service quest', createdAt: daysAgo(20), completedAt: daysAgo(20) },
    ],
  });
  console.log('  Created transactions');

  console.log('\n✅ Seed complete!');
  console.log('\n📋 Test accounts (all use password: password123):');
  console.log('  Admin:      admin@adventurersguild.com');
  console.log('  Demo:       demo@adventurersguild.com');
  console.log('  Company:    contact@knightmedicare.com');
  console.log('  Adventurer: priya.sharma@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
