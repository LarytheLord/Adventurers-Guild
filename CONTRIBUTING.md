# Contributing to The Adventurers Guild

First off, thank you for considering contributing! Your help is essential for making the guild a legendary place for developers. All contributions are welcome, from fixing a typo to implementing a major new feature.

This document is the Guild's official charter for new adventurers. It outlines how you can find a quest and submit your work for review.

## Finding a Quest

The first step on your adventure is to find a quest that suits your skills. All available quests are listed on our **[GitHub Issues page](https://github.com/LarytheLord/adventurers-guild-website/issues)**.

We use labels to categorize quests by difficulty and type:

*   **F-Rank (good first issue):** Perfect for new adventurers! These are simple, well-defined tasks that are a great way to learn the codebase.
*   **E-Rank (help wanted):** These are a bit more involved but are still great for those looking to make a meaningful contribution.
*   **D-Rank (bug):** A known issue or a gremlin in the code that needs to be squashed.
*   **C-Rank (feature):** A request to build a new feature for the guild.
*   **B-Rank (refactor):** A quest to improve the structure or performance of existing code.
*   **A-Rank (enhancement):** A significant improvement to existing functionality.
*   **S-Rank (epic):** A major, complex quest that may require significant effort and planning.

Before starting a quest, please leave a comment on the issue to let the guild masters (maintainers) know you're taking it on. This prevents multiple adventurers from working on the same quest.

## The Forging Process (Your Development Workflow)

Once you've chosen a quest, it's time to begin your work.

### 1. Claim Your Quest (Fork & Clone)

First, you'll need your own copy of the guild's archives (the repository).

*   **Fork** the repository to your own GitHub account.
*   **Clone** your fork to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/adventurers-guild.git
    cd adventurers-guild
    ```

### 2. Prepare Your Tools (Installation)

The guild uses `npm` for managing dependencies. Prepare your development environment with a single command:

```bash
npm install
```

This will install all the necessary tools and libraries for the project.

### 2.1. Set Up Environment Variables (Email & API Keys)

The guild's email system requires SMTP configuration. Create a `.env.local` file in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@adventurersguild.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# DevSync Integration (optional)
NEXT_PUBLIC_DEVSYNC_API_URL=https://api.devsync.codes
DEVSYNC_API_KEY=your-devsync-api-key
```

#### Gmail SMTP Setup (Recommended):

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings → Security → 2-Step Verification → App passwords
   - Select "Mail" and generate a 16-character password
   - Use this password in `SMTP_PASS` (not your regular Gmail password)
3. **Update `.env.local`** with your credentials

#### Alternative Email Providers:

**Outlook/Hotmail:**
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

**Yahoo:**
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

#### Security Notes:
- ⚠️ **Never commit `.env.local` to Git** (it's already in `.gitignore`)
- Use app passwords instead of regular passwords
- For production, consider services like SendGrid, Mailgun, or AWS SES

### 3. Create a Quest Branch

Never work directly on the `main` branch. Create a new branch specifically for your quest. This keeps the archives clean and makes your work easier to review.

Choose a descriptive branch name, like:
`feature/add-quest-filters` or `fix/header-alignment-bug`

```bash
git checkout -b your-branch-name
```

### 4. Ignite the Forge (Run the Dev Server)

Now you're ready to start the local development server and see the website in action.

```bash
npm run dev
```

This will start the website on `http://localhost:3000`. The server will automatically reload as you make changes to the code.

### 5. Craft Your Solution

This is where you work your magic! Write the code to complete your quest.

*   Follow the existing code style and conventions.
*   Keep your code clean, readable, and add comments for any complex logic.
*   Ensure the website runs without errors after your changes.
*   Test your changes thoroughly before submitting.

### 6. Test Your Changes

Before submitting your work, make sure to test it:

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (if applicable)
npm run test
```

### 7. Submit Your Work for Review (Open a Pull Request)

Once your quest is complete, it's time to submit your work to the guild for review.

*   **Commit** your changes with a clear and descriptive message:
    ```bash
    git add .
    git commit -m "feat: Add filtering to the quest board"
    ```
*   **Push** your branch to your fork on GitHub:
    ```bash
    git push -u origin your-branch-name
    ```
*   **Open a Pull Request (PR)** from your fork to the `main` branch of the original repository.

In your PR description, please include:
*   A link to the issue/quest you are solving (e.g., "Closes #42").
*   A clear description of the changes you made.
*   Any screenshots or GIFs that demonstrate your work, if applicable.
*   The rank of your contribution (F-S rank) based on complexity

A guild master will review your PR, provide feedback, and, once approved, merge your contribution into the main codebase. Congratulations, adventurer—your legend grows!

## Code Standards

### TypeScript
- Use TypeScript for all new code
- Define proper interfaces for complex objects
- Use type guards when working with potentially undefined values
- Follow naming conventions (camelCase for variables, PascalCase for components)

### React Components
- Use functional components with hooks
- Keep components focused on a single responsibility
- Use shadcn/ui components when possible for consistency
- Follow accessibility best practices

### Styling
- Use Tailwind CSS for styling
- Follow the existing design system
- Use responsive design patterns
- Maintain consistent spacing and typography

### Git Commit Messages
We follow the conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation updates
- `style:` for styling changes
- `refactor:` for code restructuring
- `test:` for adding or modifying tests
- `chore:` for maintenance tasks

### Pull Request Guidelines
- Keep pull requests focused on a single issue or feature
- Include tests for new functionality when applicable
- Update documentation if your changes affect user-facing features
- Reference any related issues in your PR description

## Development Philosophy

The Adventurers Guild follows these core principles:

### 1. Progressive Enhancement
- Build features that work without JavaScript first
- Enhance with JavaScript for better user experience
- Ensure accessibility is maintained throughout

### 2. Performance First
- Optimize for Core Web Vitals
- Lazy-load components when appropriate
- Minimize bundle sizes

### 3. User-Centric Design
- Prioritize user experience over technical elegance
- Consider all user types (adventurers, companies, admins)
- Ensure responsive design for all device sizes

### 4. Security Consciousness
- Validate all inputs
- Sanitize user content
- Follow security best practices
- Protect user privacy

## Where to Get Help

If you need assistance:

1. Check the [Contributor Onboarding Guide](./docs/contributor-onboarding.md)
2. Join our Discord community (link in README)
3. Create an issue for technical questions
4. Ask in the discussions tab for broader questions

## Recognition

- Contributors are acknowledged in the README
- Outstanding contributions may lead to core team membership
- Contributors can showcase their work on the Adventurers Guild platform

Remember: Every contribution, no matter how small, makes the Adventurers Guild stronger. Happy coding, adventurer!
