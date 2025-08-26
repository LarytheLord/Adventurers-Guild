# Contributing to The Adventurers Guild

First off, thank you for considering contributing! Your help is essential for making the guild a legendary place for developers. All contributions are welcome, from fixing a typo to implementing a major new feature.

This document is the Guild's official charter for new adventurers. It outlines how you can find a quest and submit your work for review.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Finding a Quest

The first step on your adventure is to find a quest that suits your skills. All available quests are listed on our **[GitHub Issues page](https://github.com/LarytheLord/adventurers-guild/issues)**.

We use labels to categorize quests by difficulty and type:

*   **E-Rank (good first issue):** Perfect for new adventurers! These are simple, well-defined tasks that are a great way to learn the codebase.
*   **D-Rank (help wanted):** These are a bit more involved but are still great for those looking to make a meaningful contribution.
*   **C-Rank (feature):** A request to build a new feature for the guild.
*   **B-Rank (bug):** A known issue or a gremlin in the code that needs to be squashed.
*   **A-Rank (refactor):** A quest to improve the structure or performance of existing code.
*   **S-Rank (epic):** A major, complex quest that may require significant effort and planning.

Before starting a quest, please leave a comment on the issue to let the guild masters (maintainers) know you're taking it on. This prevents multiple adventurers from working on the same quest.

## Project Structure

Understanding the project structure is key to contributing effectively:

```
adventurers-guild/
├── app/                 # Next.js 13+ app directory with pages and layouts
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   └── [feature]/      # Feature-specific components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and service integrations
├── public/             # Static assets
├── styles/             # Global and component-specific styles
├── types/              # TypeScript type definitions
└── ...
```

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

The guild uses `pnpm` for managing dependencies. Prepare your development environment with a single command:

```bash
pnpm install
```

This will install all the necessary tools and libraries for the project.

If you don't have pnpm installed:
```bash
npm install -g pnpm
```

### 2.1. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration (get from project dashboard)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration (for email functionality)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=your-email@gmail.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: For file uploads
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=quest-files
```

#### Gmail SMTP Setup (Recommended):

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings → Security → 2-Step Verification → App passwords
   - Select "Mail" and generate a 16-character password
   - Use this password in `SMTP_PASS` (not your regular Gmail password)
3. **Update `.env.local`** with your credentials

#### Security Notes:
- ⚠️ **Never commit `.env.local` to Git** (it's already in `.gitignore`)
- Use app passwords instead of regular passwords
- For production, consider services like SendGrid, Mailgun, or AWS SES

### 3. Database Setup (Supabase)

To run the project locally with database functionality:

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start the Supabase local development stack:
   ```bash
   supabase start
   ```

3. Apply the database schema:
   ```bash
   supabase db push
   ```

### 4. Create a Quest Branch

Never work directly on the `main` branch. Create a new branch specifically for your quest. This keeps the archives clean and makes your work easier to review.

Choose a descriptive branch name, like:
`feature/add-quest-filters` or `fix/header-alignment-bug`

```bash
git checkout -b your-branch-name
```

### 5. Ignite the Forge (Run the Dev Server)

Now you're ready to start the local development server and see the website in action.

```bash
pnpm dev
```

This will start the website on `http://localhost:3000`. The server will automatically reload as you make changes to the code.

### 6. Craft Your Solution

This is where you work your magic! Write the code to complete your quest.

#### Code Style Guidelines:
*   Follow the existing code style and conventions.
*   Use TypeScript for type safety.
*   Keep your code clean, readable, and add comments for any complex logic.
*   Ensure the website runs without errors after your changes.
*   Write semantic HTML for accessibility.
*   Use Tailwind CSS utility classes for styling.

#### Component Structure:
*   Use functional components with TypeScript interfaces.
*   Implement proper error handling.
*   Use React hooks appropriately.
*   Follow the existing patterns in the codebase.

#### Testing Your Changes:
*   Test your changes across different screen sizes.
*   Check for accessibility issues.
*   Validate forms and user inputs.
*   Ensure all links and navigation work correctly.

### 7. Quality Assurance

Before submitting your work, ensure it meets our quality standards:

1. **Linting:**
   ```bash
   pnpm lint
   ```

2. **Type Checking:**
   ```bash
   pnpm build
   ```

3. **Test on Multiple Devices:**
   * Test on mobile, tablet, and desktop
   * Check light and dark mode
   * Verify all interactive elements work

### 8. Submit Your Work for Review (Open a Pull Request)

Once your quest is complete, it's time to submit your work to the guild for review.

*   **Commit** your changes with a clear and descriptive message following [Conventional Commits](https://www.conventionalcommits.org/):
    ```bash
    git commit -m "feat: Add filtering to the quest board"
    ```
    
    Common commit types:
    * `feat:` A new feature
    * `fix:` A bug fix
    * `docs:` Documentation changes
    * `style:` Code style changes (formatting, missing semicolons, etc.)
    * `refactor:` Code refactoring
    * `test:` Adding or updating tests
    * `chore:` Maintenance tasks

*   **Push** your branch to your fork on GitHub:
    ```bash
    git push -u origin your-branch-name
    ```

*   **Open a Pull Request (PR)** from your fork to the `main` branch of the original repository.

In your PR description, please include:
*   A link to the issue/quest you are solving (e.g., "Closes #42").
*   A clear description of the changes you made.
*   Any screenshots or GIFs that demonstrate your work, if applicable.
*   Notes for reviewers (if any special considerations are needed).

A guild master will review your PR, provide feedback, and, once approved, merge your contribution into the main codebase. Congratulations, adventurer—your legend grows!

## Development Best Practices

### Component Development
1. Use TypeScript interfaces for props
2. Implement proper error boundaries
3. Handle loading states gracefully
4. Use React Context for shared state
5. Follow accessibility guidelines

### UI/UX Guidelines
1. Maintain consistent spacing and typography
2. Ensure responsive design works on all devices
3. Follow the existing color scheme and design system
4. Implement proper focus states for keyboard navigation
5. Use appropriate ARIA attributes for accessibility

### Performance Considerations
1. Optimize images using Next.js Image component
2. Implement code splitting for large components
3. Use React.memo for performance optimization
4. Minimize bundle size by removing unused dependencies
5. Lazy load components that are not immediately visible

### Security Practices
1. Validate all user inputs with Zod
2. Sanitize user-generated content with DOMPurify
3. Implement proper authentication checks
4. Use environment variables for sensitive data
5. Follow OWASP security guidelines

## Testing

We use the following testing approaches:

1. **Unit Testing:** Test individual components and functions
2. **Integration Testing:** Test how components work together
3. **End-to-End Testing:** Test complete user workflows

To run tests:
```bash
pnpm test
```

## Getting Help

If you need help with your quest:

1. **Check the Documentation:**
   * [README.md](README.md)
   * [RESPONSIVE_DESIGN.md](RESPONSIVE_DESIGN.md)
   * [project_improvements.md](project_improvements.md)

2. **Join Our Community:**
   * [Discord Server](https://discord.gg/7hQYkEx5) - Real-time help and discussion
   * GitHub Discussions - Longer-form questions and ideas

3. **Ask for Help:**
   * Comment on the issue you're working on
   * Tag maintainers in your PR if you need feedback
   * Share your progress and challenges in Discord

## Recognition

All contributors will be recognized in:

* Our README contributors list
* Our Discord #hall-of-fame channel
* Special badges on your Guild profile (coming soon)

We also participate in [GirlScript Summer of Code 2025](https://gssoc.tech/), where active contributors can earn additional recognition.

## License

By contributing to The Adventurers Guild, you agree that your contributions will be licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

Happy coding, adventurer! May your quests be successful and your contributions legendary! 🗡️✨