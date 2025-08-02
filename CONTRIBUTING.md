# Contributing to The Adventurers Guild

First off, thank you for considering contributing! Your help is essential for making the guild a legendary place for developers. All contributions are welcome, from fixing a typo to implementing a major new feature.

This document is the Guild's official charter for new adventurers. It outlines how you can find a quest and submit your work for review.

## Finding a Quest

The first step on your adventure is to find a quest that suits your skills. All available quests are listed on our **[GitHub Issues page](https://github.com/your-username/adventurers-guild-website/issues)**.

We use labels to categorize quests by difficulty and type:

*   **E-Rank (good first issue):** Perfect for new adventurers! These are simple, well-defined tasks that are a great way to learn the codebase.
*   **D-Rank (help wanted):** These are a bit more involved but are still great for those looking to make a meaningful contribution.
*   **C-Rank (feature):** A request to build a new feature for the guild.
*   **B-Rank (bug):** A known issue or a gremlin in the code that needs to be squashed.
*   **A-Rank (refactor):** A quest to improve the structure or performance of existing code.
*   **S-Rank (epic):** A major, complex quest that may require significant effort and planning.

Before starting a quest, please leave a comment on the issue to let the guild masters (maintainers) know you're taking it on. This prevents multiple adventurers from working on the same quest.

## The Forging Process (Your Development Workflow)

Once you've chosen a quest, it's time to begin your work.

### 1. Claim Your Quest (Fork & Clone)

First, you'll need your own copy of the guild's archives (the repository).

*   **Fork** the repository to your own GitHub account.
*   **Clone** your fork to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/adventurers-guild-website.git
    cd adventurers-guild-website
    ```

### 2. Prepare Your Tools (Installation)

The guild uses `pnpm` for managing dependencies. Prepare your development environment with a single command:

```bash
pnpm install
```

This will install all the necessary tools and libraries for the project.

### 2.1. Set Up Environment Variables (Email & API Keys)

The guild's email system requires SMTP configuration. Create a `.env.local` file in the root directory:

```bash
# SMTP Configuration for Email Sending
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=your-email@gmail.com

# Next.js
NEXT_PUBLIC_APP_URL=https://adventurersguild.vercel.app
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

#### Testing Email Functionality:
1. Update `.env.local` with real email credentials
2. Run the development server: `npm run dev`
3. Go to the waitlist section and test the email form
4. Check your inbox for the welcome email

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
pnpm dev
```

This will start the website on `http://localhost:3000`. The server will automatically reload as you make changes to the code.

### 5. Craft Your Solution

This is where you work your magic! Write the code to complete your quest.

*   Follow the existing code style and conventions.
*   Keep your code clean, readable, and add comments for any complex logic.
*   Ensure the website runs without errors after your changes.

### 6. Submit Your Work for Review (Open a Pull Request)

Once your quest is complete, it's time to submit your work to the guild for review.

*   **Commit** your changes with a clear and descriptive message:
    ```bash
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

A guild master will review your PR, provide feedback, and, once approved, merge your contribution into the main codebase. Congratulations, adventurer—your legend grows!
