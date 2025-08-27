-- Seed data for Adventurers Guild skill categories and skills

-- Insert skill categories
INSERT INTO public.skill_categories (id, name, description, icon, color, max_skill_points) VALUES
('frontend-category', 'Frontend Development', 'Master the art of creating beautiful, responsive user interfaces', 'Monitor', '#3B82F6', 3000),
('backend-category', 'Backend Development', 'Build robust, scalable server-side applications and APIs', 'Server', '#10B981', 3000),
('database-category', 'Database Management', 'Design, optimize, and maintain database systems', 'Database', '#8B5CF6', 2000),
('devops-category', 'DevOps & Deployment', 'Streamline development workflows and deployment processes', 'Cloud', '#F59E0B', 2000),
('mobile-category', 'Mobile Development', 'Create native and cross-platform mobile applications', 'Smartphone', '#EC4899', 2000),
('ai-category', 'AI & Machine Learning', 'Implement intelligent systems and machine learning models', 'Brain', '#EF4444', 2500),
('design-category', 'UI/UX Design', 'Design beautiful and intuitive user experiences', 'Palette', '#06B6D4', 2000),
('security-category', 'Cybersecurity', 'Protect systems and data from digital threats', 'Shield', '#84CC16', 2000)
ON CONFLICT (id) DO NOTHING;

-- Insert skills
INSERT INTO public.skills (id, category_id, name, description, max_level, points_per_level, prerequisites, icon, color) VALUES
-- Frontend skills
('html-skill', 'frontend-category', 'HTML Mastery', 'Master semantic HTML markup and accessibility', 5, 100, '[]', 'Code', '#3B82F6'),
('css-skill', 'frontend-category', 'CSS Wizardry', 'Advanced CSS layouts, animations, and responsive design', 5, 100, '[]', 'Layout', '#3B82F6'),
('javascript-skill', 'frontend-category', 'JavaScript Expert', 'Modern JavaScript including ES6+ features and patterns', 5, 150, '[]', 'Braces', '#3B82F6'),
('react-skill', 'frontend-category', 'React Mastery', 'Build complex applications with React and its ecosystem', 5, 200, '["javascript-skill"]', 'Atom', '#3B82F6'),
('vue-skill', 'frontend-category', 'Vue.js Proficiency', 'Develop applications using the Vue.js framework', 5, 200, '["javascript-skill"]', 'Vue', '#3B82F6'),
('angular-skill', 'frontend-category', 'Angular Ninja', 'Master the Angular framework and TypeScript', 5, 200, '["javascript-skill"]', 'Angular', '#3B82F6'),

-- Backend skills
('node-skill', 'backend-category', 'Node.js Development', 'Build scalable backend services with Node.js', 5, 200, '["javascript-skill"]', 'Node', '#10B981'),
('python-skill', 'backend-category', 'Python for Backend', 'Develop backend services using Python frameworks', 5, 200, '[]', 'Python', '#10B981'),
('java-skill', 'backend-category', 'Java Backend', 'Build enterprise applications with Java and Spring', 5, 200, '[]', 'Java', '#10B981'),
('express-skill', 'backend-category', 'Express.js Mastery', 'Create REST APIs with Express.js framework', 5, 150, '["node-skill"]', 'Express', '#10B981'),
('django-skill', 'backend-category', 'Django Expert', 'Build web applications with Django framework', 5, 200, '["python-skill"]', 'Django', '#10B981'),
('spring-skill', 'backend-category', 'Spring Framework', 'Develop enterprise applications with Spring', 5, 200, '["java-skill"]', 'Spring', '#10B981'),

-- Database skills
('sql-skill', 'database-category', 'SQL Mastery', 'Write complex queries and optimize database performance', 5, 150, '[]', 'Database', '#8B5CF6'),
('postgres-skill', 'database-category', 'PostgreSQL Expert', 'Advanced PostgreSQL features and administration', 5, 200, '["sql-skill"]', 'Postgres', '#8B5CF6'),
('mongo-skill', 'database-category', 'MongoDB Proficiency', 'Work with NoSQL databases using MongoDB', 5, 200, '[]', 'Mongo', '#8B5CF6'),
('redis-skill', 'database-category', 'Redis Caching', 'Implement caching strategies with Redis', 5, 150, '[]', 'Redis', '#8B5CF6'),

-- DevOps skills
('docker-skill', 'devops-category', 'Docker Containerization', 'Containerize applications with Docker', 5, 150, '[]', 'Docker', '#F59E0B'),
('kubernetes-skill', 'devops-category', 'Kubernetes Orchestration', 'Deploy and manage containerized apps with Kubernetes', 5, 200, '["docker-skill"]', 'Kubernetes', '#F59E0B'),
('ci-cd-skill', 'devops-category', 'CI/CD Pipelines', 'Automate deployment with continuous integration', 5, 200, '[]', 'GitBranch', '#F59E0B'),
('aws-skill', 'devops-category', 'AWS Cloud', 'Deploy and manage applications on AWS', 5, 200, '[]', 'AWS', '#F59E0B'),

-- Mobile skills
('react-native-skill', 'mobile-category', 'React Native', 'Build cross-platform mobile apps with React Native', 5, 200, '["react-skill"]', 'ReactNative', '#EC4899'),
('flutter-skill', 'mobile-category', 'Flutter Development', 'Create beautiful apps with Flutter and Dart', 5, 200, '[]', 'Flutter', '#EC4899'),
('ios-skill', 'mobile-category', 'iOS Development', 'Build native iOS apps with Swift', 5, 200, '[]', 'Apple', '#EC4899'),
('android-skill', 'mobile-category', 'Android Development', 'Develop native Android apps with Kotlin', 5, 200, '[]', 'Android', '#EC4899'),

-- AI skills
('ml-skill', 'ai-category', 'Machine Learning', 'Implement ML algorithms and models', 5, 250, '["python-skill"]', 'Cpu', '#EF4444'),
('dl-skill', 'ai-category', 'Deep Learning', 'Build neural networks with TensorFlow/PyTorch', 5, 300, '["ml-skill"]', 'Network', '#EF4444'),
('nlp-skill', 'ai-category', 'Natural Language Processing', 'Process and analyze human language data', 5, 250, '["ml-skill"]', 'MessageSquare', '#EF4444'),
('cv-skill', 'ai-category', 'Computer Vision', 'Analyze and interpret visual information', 5, 250, '["ml-skill"]', 'Eye', '#EF4444'),

-- Design skills
('ui-design-skill', 'design-category', 'UI Design', 'Create beautiful user interfaces', 5, 150, '[]', 'Layout', '#06B6D4'),
('ux-research-skill', 'design-category', 'UX Research', 'Conduct user research and usability testing', 5, 200, '[]', 'Users', '#06B6D4'),
('figma-skill', 'design-category', 'Figma Mastery', 'Design interfaces with Figma', 5, 150, '[]', 'Figma', '#06B6D4'),
('prototyping-skill', 'design-category', 'Prototyping', 'Create interactive prototypes', 5, 150, '[]', 'Layers', '#06B6D4'),

-- Security skills
('web-security-skill', 'security-category', 'Web Security', 'Protect web applications from common vulnerabilities', 5, 200, '[]', 'Lock', '#84CC16'),
('encryption-skill', 'security-category', 'Encryption', 'Implement cryptographic techniques', 5, 200, '[]', 'Key', '#84CC16'),
('penetration-skill', 'security-category', 'Penetration Testing', 'Identify and exploit system vulnerabilities', 5, 250, '["web-security-skill"]', 'Zap', '#84CC16')
ON CONFLICT (id) DO NOTHING;