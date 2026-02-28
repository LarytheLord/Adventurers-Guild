-- Seed Data for The Adventurers Guild
-- Purpose: Populate database with realistic sample data for demos and testing

-- Clear existing data (be careful in production!)
TRUNCATE TABLE public.quest_submissions CASCADE;
TRUNCATE TABLE public.quest_completions CASCADE;
TRUNCATE TABLE public.quest_assignments CASCADE;
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.quests CASCADE;
TRUNCATE TABLE public.team_members CASCADE;
TRUNCATE TABLE public.teams CASCADE;
TRUNCATE TABLE public.skill_progress CASCADE;
TRUNCATE TABLE public.skills CASCADE;
TRUNCATE TABLE public.skill_categories CASCADE;
TRUNCATE TABLE public.adventurer_profiles CASCADE;
TRUNCATE TABLE public.company_profiles CASCADE;
TRUNCATE TABLE public.users CASCADE;

-- Insert sample users (companies and adventurers)
INSERT INTO public.users (id, name, email, role, rank, xp, skill_points, level, is_verified, bio, location, github, linkedin) VALUES
-- Companies
('11111111-1111-1111-1111-111111111111', 'Knight Medicare', 'contact@knightmedicare.com', 'company', 'S', 0, 0, 1, true, 'Leading healthcare technology company', 'Ahmedabad, India', 'knight-medicare', 'knight-medicare'),
('22222222-2222-2222-2222-222222222222', 'Open Paws Animal Shelter', 'hello@openpaws.org', 'company', 'A', 0, 0, 1, true, 'Non-profit animal welfare organization', 'Mumbai, India', 'open-paws', 'open-paws'),
('33333333-3333-3333-3333-333333333333', 'TechVenture Startup', 'founders@techventure.io', 'company', 'B', 0, 0, 1, false, 'Early-stage SaaS startup', 'Bangalore, India', 'techventure', 'techventure-startup'),

-- Adventurers (various ranks)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Priya Sharma', 'priya.sharma@example.com', 'adventurer', 'S', 15000, 120, 15, true, 'Full-stack developer specializing in React and Node.js', 'Gandhinagar, India', 'priya-dev', 'priya-sharma-dev'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Raj Patel', 'raj.patel@example.com', 'adventurer', 'A', 8500, 75, 10, true, 'Backend specialist with expertise in Python and Django', 'Ahmedabad, India', 'raj-codes', 'raj-patel-eng'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ananya Desai', 'ananya.desai@example.com', 'adventurer', 'B', 4200, 45, 7, true, 'Frontend developer passionate about UI/UX', 'Surat, India', 'ananya-ui', 'ananya-desai'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Arjun Kumar', 'arjun.kumar@example.com', 'adventurer', 'C', 2100, 28, 5, true, 'CS student learning full-stack development', 'Vadodara, India', 'arjun-learns', 'arjun-kumar-cs'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Neha Singh', 'neha.singh@example.com', 'adventurer', 'D', 900, 15, 3, true, 'Aspiring mobile developer', 'Rajkot, India', 'neha-mobile', 'neha-singh-dev'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Karan Mehta', 'karan.mehta@example.com', 'adventurer', 'E', 350, 8, 2, false, 'Junior developer eager to learn', 'Bhavnagar, India', 'karan-dev', 'karan-mehta'),
('99999999-9999-9999-9999-999999999999', 'Sanya Joshi', 'sanya.joshi@example.com', 'adventurer', 'F', 100, 3, 1, false, 'Brand new to programming, ready to start my journey!', 'Gandhinagar, India', 'sanya-codes', 'sanya-joshi'),

-- Demo account
('demoDemo-demo-demo-demo-demoDemoDemo', 'Demo Adventurer', 'demo@adventurersguild.com', 'adventurer', 'C', 2500, 30, 5, true, 'Demo account - explore the platform!', 'Demo City', 'demo-adventurer', 'demo-adventurer');

-- Insert company profiles
INSERT INTO public.company_profiles (user_id, company_name, company_website, company_description, industry, size, is_verified, quests_posted, total_spent) VALUES
('11111111-1111-1111-1111-111111111111', 'Knight Medicare', 'https://knightmedicare.com', 'Healthcare technology platform connecting patients with doctors', 'Healthcare Tech', 'small', true, 8, 125000.00),
('22222222-2222-2222-2222-222222222222', 'Open Paws Animal Shelter', 'https://openpaws.org', 'Animal welfare organization helping stray animals find homes', 'Non-Profit', 'startup', true, 5, 45000.00),
('33333333-3333-3333-3333-333333333333', 'TechVenture Startup', 'https://techventure.io', 'Building next-generation project management tools', 'SaaS', 'startup', false, 2, 18000.00);

-- Insert adventurer profiles
INSERT INTO public.adventurer_profiles (user_id, specialization, primary_skills, availability_status, quest_completion_rate, total_quests_completed, current_streak, max_streak) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Full-Stack Development', ARRAY['React', 'Node.js', 'PostgreSQL', 'TypeScript'], 'available', 95.50, 28, 7, 12),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Backend Development', ARRAY['Python', 'Django', 'PostgreSQL', 'Redis'], 'busy', 92.30, 22, 5, 9),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Frontend Development', ARRAY['React', 'CSS', 'Figma', 'JavaScript'], 'available', 88.00, 15, 4, 6),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Full-Stack Development', ARRAY['JavaScript', 'React', 'Express'], 'available', 83.30, 9, 3, 4),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Mobile Development', ARRAY['React Native', 'JavaScript'], 'available', 75.00, 4, 2, 2),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Frontend Development', ARRAY['HTML', 'CSS', 'JavaScript'], 'available', 66.70, 2, 1, 1),
('99999999-9999-9999-9999-999999999999', 'Learning', ARRAY['HTML', 'CSS'], 'available', 0.00, 0, 0, 0),
('demoDemo-demo-demo-demo-demoDemoDemo', 'Full-Stack Development', ARRAY['React', 'Node.js', 'MongoDB'], 'available', 85.70, 10, 3, 5);

-- Insert skill categories
INSERT INTO public.skill_categories (id, name, description, icon) VALUES
('cat-1111-1111-1111-111111111111', 'Frontend Development', 'Client-side web development skills', '🎨'),
('cat-2222-2222-2222-222222222222', 'Backend Development', 'Server-side development skills', '⚙️'),
('cat-3333-3333-3333-333333333333', 'Database', 'Database design and management', '🗄️'),
('cat-4444-4444-4444-444444444444', 'DevOps', 'Deployment and infrastructure', '🚀'),
('cat-5555-5555-5555-555555555555', 'Mobile Development', 'Mobile app development', '📱');

-- Insert skills
INSERT INTO public.skills (id, name, description, category_id) VALUES
-- Frontend
('skill-001', 'React', 'Modern JavaScript library for building user interfaces', 'cat-1111-1111-1111-111111111111'),
('skill-002', 'Vue.js', 'Progressive JavaScript framework', 'cat-1111-1111-1111-111111111111'),
('skill-003', 'CSS/Tailwind', 'Styling and design systems', 'cat-1111-1111-1111-111111111111'),
('skill-004', 'TypeScript', 'Typed JavaScript', 'cat-1111-1111-1111-111111111111'),
-- Backend
('skill-005', 'Node.js', 'JavaScript runtime for server-side development', 'cat-2222-2222-2222-222222222222'),
('skill-006', 'Python/Django', 'Python web framework', 'cat-2222-2222-2222-222222222222'),
('skill-007', 'Express.js', 'Node.js web framework', 'cat-2222-2222-2222-222222222222'),
-- Database
('skill-008', 'PostgreSQL', 'Advanced relational database', 'cat-3333-3333-3333-333333333333'),
('skill-009', 'MongoDB', 'NoSQL document database', 'cat-3333-3333-3333-333333333333'),
('skill-010', 'Redis', 'In-memory data store', 'cat-3333-3333-3333-333333333333'),
-- DevOps
('skill-011', 'Docker', 'Containerization platform', 'cat-4444-4444-4444-444444444444'),
('skill-012', 'AWS', 'Cloud infrastructure', 'cat-4444-4444-4444-444444444444'),
-- Mobile
('skill-013', 'React Native', 'Cross-platform mobile development', 'cat-5555-5555-5555-555555555555'),
('skill-014', 'Flutter', 'Cross-platform mobile framework', 'cat-5555-5555-5555-555555555555');

-- Insert sample quests (various statuses and difficulties)
INSERT INTO public.quests (id, title, description, detailed_description, quest_type, status, difficulty, xp_reward, skill_points_reward, monetary_reward, required_skills, required_rank, max_participants, quest_category, company_id, deadline) VALUES
-- Available quests
('quest-001', 'Build Patient Dashboard UI', 'Create a responsive dashboard for patients to view their medical records and appointments', 
'We need a clean, intuitive dashboard interface using React and Tailwind CSS. The dashboard should display:\n- Upcoming appointments\n- Medical history\n- Prescription records\n- Doctor notes\n\nDesign should be mobile-first and accessible.', 
'commission', 'available', 'C', 1200, 15, 12000.00, 
ARRAY['React', 'CSS/Tailwind', 'TypeScript'], 'D', 1, 'frontend', 
'11111111-1111-1111-1111-111111111111', NOW() + INTERVAL '14 days'),

('quest-002', 'Implement User Authentication API', 'Build secure authentication endpoints with JWT tokens',
'Create REST API endpoints for user authentication:\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/refresh\n- GET /api/auth/me\n\nRequirements:\n- JWT token-based auth\n- Password hashing with bcrypt\n- Rate limiting\n- Input validation',
'commission', 'available', 'B', 1800, 22, 18000.00,
ARRAY['Node.js', 'Express.js', 'PostgreSQL'], 'C', 1, 'backend',
'11111111-1111-1111-1111-111111111111', NOW() + INTERVAL '21 days'),

('quest-003', 'Create Donation Page for Animal Shelter', 'Simple donation page with payment integration',
'Build a donation landing page for our animal shelter:\n- Hero section with impact stories\n- Donation amount selection\n- Stripe payment integration\n- Thank you page with receipt\n\nDesign should be warm and emotional to connect with donors.',
'commission', 'available', 'D', 900, 12, 9000.00,
ARRAY['React', 'CSS/Tailwind'], 'E', 1, 'frontend',
'22222222-2222-2222-2222-222222222222', NOW() + INTERVAL '10 days'),

('quest-004', 'Build Task Management API', 'RESTful API for task management features',
'Create backend API for our task management SaaS:\n- CRUD operations for tasks\n- Task assignment to users\n- Status tracking (todo, in progress, done)\n- Due date management\n- Comments on tasks\n\nShould support filtering and pagination.',
'commission', 'available', 'C', 1500, 18, 15000.00,
ARRAY['Python/Django', 'PostgreSQL'], 'C', 1, 'backend',
'33333333-3333-3333-3333-333333333333', NOW() + INTERVAL '20 days'),

('quest-005', 'Fix Mobile Responsive Issues', 'Make website mobile-friendly',
'Our website has several responsive design issues on mobile:\n- Navigation menu overlaps content\n- Images don''t scale properly\n- Forms are hard to use on small screens\n\nNeed someone to fix these CSS issues and ensure mobile-first design.',
'bug_bounty', 'available', 'E', 600, 8, 6000.00,
ARRAY['CSS/Tailwind'], 'F', 1, 'frontend',
'33333333-3333-3333-3333-333333333333', NOW() + INTERVAL '7 days'),

-- In progress quests
('quest-006', 'Database Schema Optimization', 'Optimize slow database queries',
'Several queries in our application are running slowly:\n- User dashboard query (3+ seconds)\n- Report generation (10+ seconds)\n- Search functionality (2+ seconds)\n\nNeed to analyze and optimize these queries, add proper indexes, and improve performance.',
'code_refactor', 'in_progress', 'A', 2200, 28, 22000.00,
ARRAY['PostgreSQL'], 'B', 1, 'backend',
'11111111-1111-1111-1111-111111111111', NOW() + INTERVAL '15 days'),

-- Review quests
('quest-007', 'Create Blog Component Library', 'Reusable React components for blog',
'Build a set of reusable components:\n- Article card\n- Author bio\n- Related posts\n- Social share buttons\n- Comment section\n\nAll components should be documented and typed with TypeScript.',
'commission', 'review', 'C', 1300, 16, 13000.00,
ARRAY['React', 'TypeScript'], 'D', 1, 'frontend',
'22222222-2222-2222-2222-222222222222', NOW() + INTERVAL '5 days'),

-- Completed quests
('quest-008', 'Setup CI/CD Pipeline', 'Automated deployment pipeline',
'Successfully setup GitHub Actions workflow for:\n- Running tests on PR\n- Building Docker images\n- Deploying to AWS\n- Running security scans',
'code_refactor', 'completed', 'B', 1600, 20, 16000.00,
ARRAY['Docker', 'AWS'], 'B', 1, 'fullstack',
'11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 days'),

('quest-009', 'Add Dark Mode Support', 'Implement theme switching',
'Added dark mode toggle with:\n- Theme context provider\n- CSS variables for colors\n- Persistent theme preference\n- Smooth transitions',
'commission', 'completed', 'D', 800, 10, 8000.00,
ARRAY['React', 'CSS/Tailwind'], 'E', 1, 'frontend',
'22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '12 days'),

('quest-010', 'Email Notification Service', 'Send automated emails',
'Built email service using Nodemailer:\n- Welcome emails\n- Password reset\n- Weekly digest\n- Template system with Handlebars',
'commission', 'completed', 'C', 1400, 17, 14000.00,
ARRAY['Node.js'], 'C', 1, 'backend',
'33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '20 days');

-- Demo account quest assignments and completions
INSERT INTO public.quest_assignments (id, quest_id, user_id, status, assigned_at, started_at, progress) VALUES
('assign-demo-1', 'quest-006', 'demoDemo-demo-demo-demo-demoDemoDemo', 'in_progress', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 65.00);

INSERT INTO public.quest_completions (id, quest_id, user_id, completion_date, xp_earned, skill_points_earned, quality_score) VALUES
('complete-demo-1', 'quest-009', 'demoDemo-demo-demo-demo-demoDemoDemo', NOW() - INTERVAL '12 days', 800, 10, 9),
('complete-demo-2', 'quest-010', 'demoDemo-demo-demo-demo-demoDemoDemo', NOW() - INTERVAL '20 days', 1400, 17, 8);

-- Real adventurer assignments
INSERT INTO public.quest_assignments (id, quest_id, user_id, status, assigned_at, started_at, completed_at, progress) VALUES
('assign-001', 'quest-006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'in_progress', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NULL, 70.00),
('assign-002', 'quest-007', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'submitted', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '1 day', 100.00),
('assign-003', 'quest-008', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'completed', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '5 days', 100.00),
('assign-004', 'quest-009', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'completed', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days', NOW() - INTERVAL '12 days', 100.00);

-- Quest completions
INSERT INTO public.quest_completions (id, quest_id, user_id, completion_date, xp_earned, skill_points_earned, quality_score) VALUES
('complete-001', 'quest-008', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '5 days', 1600, 20, 9),
('complete-002', 'quest-009', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW() - INTERVAL '12 days', 800, 10, 8);

-- Notifications for demo account
INSERT INTO public.notifications (user_id, title, message, type, data, created_at) VALUES
('demoDemo-demo-demo-demo-demoDemoDemo', '🎯 New Quest Available!', 'A new quest matching your skills has been posted: "Build Task Management API"', 'quest_assigned', '{"quest_id": "quest-004"}', NOW() - INTERVAL '2 days'),
('demoDemo-demo-demo-demo-demoDemoDemo', '🎉 Quest Completed!', 'Congratulations! You completed "Add Dark Mode Support" and earned 800 XP!', 'quest_completed', '{"quest_id": "quest-009", "xp": 800}', NOW() - INTERVAL '12 days'),
('demoDemo-demo-demo-demo-demoDemoDemo', '⬆️ Rank Up!', 'Amazing! You''ve reached C-Rank! Keep up the great work!', 'rank_up', '{"new_rank": "C", "old_rank": "D"}', NOW() - INTERVAL '15 days');

-- Transactions
INSERT INTO public.transactions (from_user_id, to_user_id, quest_id, amount, currency, status, payment_method, transaction_id, description, created_at, completed_at) VALUES
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'quest-008', 16000.00, 'INR', 'completed', 'stripe', 'txn_abc123def456', 'Payment for Setup CI/CD Pipeline quest', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'quest-009', 8000.00, 'INR', 'completed', 'stripe', 'txn_ghi789jkl012', 'Payment for Add Dark Mode Support quest', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
('33333333-3333-3333-3333-333333333333', 'demoDemo-demo-demo-demo-demoDemoDemo', 'quest-010', 14000.00, 'INR', 'completed', 'stripe', 'txn_mno345pqr678', 'Payment for Email Notification Service quest', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days');

-- Print summary
DO $$
BEGIN
    RAISE NOTICE '✅ Seed data inserted successfully!';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   - Users: % (% adventurers, % companies)', 
        (SELECT COUNT(*) FROM public.users),
        (SELECT COUNT(*) FROM public.users WHERE role = 'adventurer'),
        (SELECT COUNT(*) FROM public.users WHERE role = 'company');
    RAISE NOTICE '   - Quests: % (% available, % in progress, % completed)', 
        (SELECT COUNT(*) FROM public.quests),
        (SELECT COUNT(*) FROM public.quests WHERE status = 'available'),
        (SELECT COUNT(*) FROM public.quests WHERE status = 'in_progress'),
        (SELECT COUNT(*) FROM public.quests WHERE status = 'completed');
    RAISE NOTICE '   - Skills: % across % categories', 
        (SELECT COUNT(*) FROM public.skills),
        (SELECT COUNT(*) FROM public.skill_categories);
    RAISE NOTICE '';
    RAISE NOTICE '🎮 Demo Account:';
    RAISE NOTICE '   Email: demo@adventurersguild.com';
    RAISE NOTICE '   Rank: C';
    RAISE NOTICE '   XP: 2500';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for demo!';
END $$;
