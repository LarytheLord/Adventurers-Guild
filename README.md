# The Adventurers Guild: Code Your Adventure. Master the Digital Frontier.

[![GitHub contributors](https://img.shields.io/github/contributors/LarytheLord/adventurers-guild?style=flat-square)](https://github.com/LarytheLord/adventurers-guild/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) [![Discord](https://img.shields.io/discord/7hQYkEx5?label=Discord&logo=discord&style=flat-square)](https://discord.gg/7hQYkEx5)
[![Website](https://img.shields.io/badge/Website-Live-blue?style=flat-square)](https://adventurersguild.vercel.app)
[![Join GSSoC '25!](https://img.shields.io/badge/GSSoC%20'25-Project%20Admin-green?style=flat-square)](https://gssoc.tech/) ---

## 🗺️ Overview: Your Quest for Digital Mastery Begins Here

Welcome to **The Adventurers Guild**, your digital guild hall where aspiring tech pioneers embark on real-world quests to forge their skills and conquer the digital frontier!

This open-source project is revolutionizing computer science education by transforming traditional learning into an immersive, merit-based adventure. Instead of slaying dragons, you'll be squashing bugs and building epic features. Our core mission is to empower tech enthusiasts to gain **real-world practical skills** by engaging in **commissioned "Quests" from companies and organizations.**

Imagine:
* Students becoming **Guild Adventurers**, earning **Experience Points (XP)** and ascending through a transparent **F-to-S Ranking System**.
* This progression unlocks privileges, including the ability to **choose and undertake real-world digital projects (Quests)** commissioned by external clients.
* The Guild acts as a **trusted intermediary**, ensuring quality delivery and a sustainable revenue model.

This repository contains the codebase for the Adventurers Guild platform, a community-driven effort to build the future of EdTech and talent development. Join us, and let's craft a world where every line of code leads to real impact!

---

## 🎯 The Problem We're Solving: Bridging the Digital Skills Chasm

The current landscape of computer science education often leaves students with a strong theoretical foundation but a critical lack of **hands-on, industry-relevant experience.** This creates a significant gap:

* **Unprepared Graduates:** Many students struggle to apply classroom knowledge to real-world scenarios.
* **Passive Learning:** Traditional methods can lead to disengagement and missed opportunities for practical skill development.
* **Talent Shortage:** Companies face challenges finding junior talent with verifiable project experience and practical problem-solving acumen.

---

## ✨ Our Solution: The Guild System - Gamified, Real-World Mastery

The Adventurers Guild addresses these challenges head-on by creating a vibrant, incentivized ecosystem designed for genuine skill development:

### **1. Gamified Progression:**
* **Adventurers:** Students join our community as dedicated Guild Adventurers.
* **XP & Ranks:** They earn **Experience Points (XP)** for completing Quests, mastering skills, and contributing to the Guild. This fuels their progression through a transparent **F, E, D, C, B, A, S Ranking System.**
* **Merit-Based Access:** Higher ranks unlock greater privileges, including access to more complex, prestigious, and higher-value commissioned Quests.

### **2. Commissioned Quests from Companies:**
* **Real-World Projects:** External companies, startups, NGOs, and individuals commission genuine digital projects (e.g., app development, data analysis, cybersecurity audits, custom software modules).
* **Rank-Based Selection:** Adventurers gain the unique ability to **choose commissions based on their current rank and below**, ensuring challenges are appropriate yet push their boundaries.
* **Guild as Intermediary:** The Adventurers Guild acts as the trusted middleman, managing project scope, quality assurance, and delivery to ensure successful outcomes for both clients and Adventurers.

### **3. Sustainable Revenue Model:**
* We generate revenue by taking a **service fee (e.g., 15-30%)** on successfully completed commissioned projects.
* This revenue funds platform development, operations, and community growth, creating a self-sustaining ecosystem.
* Adventurers are compensated for their work, creating a win-win scenario for skill development and economic opportunity.

### **4. Diverse Expeditions & Community:**
* Beyond client commissions, Adventurers engage in internal "Quests" like **Bug Bounty Brigades**, **Digital Archaeology Expeditions**, and **Narrative-Driven Hackathons.**
* A strong emphasis on **collaboration, peer-to-peer learning, and mentorship** across all ranks, fostering a supportive and engaging environment.

---

## 🛠️ Key Features (Under Development)

Our platform is being built incrementally, with these core features driving our vision:

* **🎮 Skill Tree & Developer Progression System:** Visual skill progression with categories like Frontend, Backend, AI, DevOps. Earn Skill Points (SP) from completing quests and unlock new skill branches with a gamified interface.
* **Interactive Quest Board:** Browse, filter, and accept available commissioned projects.
* **Adventurer Profile & Dashboard:** Track XP, current rank, completed Quests, and skill progression.
* **XP & Ranking Engine:** Backend system for calculating and managing Adventurer ranks.
* **Client Portal:** Interface for companies to submit, manage, and approve Quests.
* **Team Collaboration Tools:** Integrated features for group project management and communication.
* **Quality Assurance Module:** Tools and processes to ensure high-quality project deliverables.

---

## 🚀 Technology Stack

The Adventurers Guild is being built with modern, scalable technologies. We welcome contributions across our stack!

* **Frontend:** React, Next.js, Tailwind CSS
* **Backend:** Node.js (Express.js), Python (Flask/Django)
* **Database:** PostgreSQL, MongoDB, Firebase/Firestore
* **Deployment:** Vercel, AWS
* **Version Control:** Git, GitHub
* **Communication:** Discord

---

## ✨ We're Part of GirlScript Summer of Code 2025 (GSSoC '25)!

We're incredibly excited and honored to announce that **The Adventurers Guild has been selected as an official project for GSSoC '25!** As a Project Admin, [Your Name] will be leading the charge to guide new contributors.

This partnership brings:
* A structured program for contributions.
* Access to a wider pool of talented developers.
* Dedicated mentorship for project growth.

If you're a GSSoC '25 participant looking for an impactful open-source project, look no further!

---

## 🧑‍💻 Getting Started (For Developers & Contributors)

Ready to wield your skills and contribute to the future of EdTech? Welcome to **The Digital Forge!**

1.  **Join Our Discord Server:** This is our primary communication hub for contributors, discussions, and real-time support. It's the best place to get started and meet the community.
    * 🔗 [**Join The Digital Forge Discord**](https://discord.gg/7hQYkEx5)

2.  **Prerequisites:** Ensure you have the following installed on your system:
    * Node.js (LTS version recommended)
    * npm or Yarn
    * Git
    * [Any specific database client or other tools you use, e.g., Docker Desktop if applicable]

3.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/LarytheLord/adventurers-guild.git](https://github.com/LarytheLord/adventurers-guild.git)
    cd adventurers-guild
    ```

4.  **Install Dependencies:**
    ```bash
    npm install # or yarn install
    ```

5.  **Set Up Environment Variables:**
    * Create a `.env.local` file in the root directory of the project.
    * Refer to our [`CONTRIBUTING.md`](CONTRIBUTING.md) for the required variables (e.g., database credentials, API keys).
    
    **For Email Functionality (SMTP Setup):**
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
    
    **Gmail Setup (Recommended):**
    1. Enable 2-Factor Authentication on your Gmail account
    2. Generate App Password: Google Account → Security → 2-Step Verification → App passwords
    3. Select "Mail" and generate a 16-character password
    4. Use this password in `SMTP_PASS` (not your regular Gmail password)
    
    **⚠️ Security Note:** Never commit `.env.local` to Git (it's already in `.gitignore`)

6.  **Run Locally:**
    ```bash
    npm run dev # or yarn dev
    ```
    This command will typically start the development server, and you can access the application in your browser at `http://localhost:3000` (or as specified in the console).

---

## 🤝 Contributing

We welcome contributions from developers, designers, writers, and strategists of all skill levels! Whether you're an S-Rank Master or an F-Rank Apprentice eager to learn, there's a place for you in the Forge.

Please refer to our comprehensive [`CONTRIBUTING.md`](CONTRIBUTING.md) for detailed guidelines on:

* Code of Conduct
* Branching Strategy
* Pull Request Process
* Issue Management
* Setting up your specific development environment
* How to claim issues (especially for GSSoC '25 participants!)

---

## 🗺️ Roadmap: Our Expedition Ahead

Our expedition is just beginning. Key milestones for the Guild include:

* Full implementation of the Interactive Quest Board and comprehensive Adventurer Profile system.
* Robust real-time XP tracking and dynamic rank progression system.
* Securing and successfully completing initial commissioned projects with external clients.
* Expanding to a broader university network and establishing new Guild chapters.
* Developing advanced AI-driven Quest matching algorithms for optimal Adventurer-Quest pairings.
* Implementation of advanced team collaboration and project management features.
* Introduction of mentorship programs within the Guild ranks.

---

## ⚖️ License

This project is currently under discussion for its open-source license. We intend to use a widely recognized open-source license (e.g., **MIT License**). Please check back for updates in the [License](License) file.

---

## 🌐 Connect With Us

Join our community and follow our journey!

* **Website:** [The Adventurers Guild](https://adventurersguild.vercel.app)
* **Discord (The Digital Forge):** [Join our Community!](https://discord.gg/7hQYkEx5)
* **LinkedIn (Company Page):** [The Adventurers Guild](https://linkedin.com/company/Adventurers-Guild)
* **LinkedIn (My Personal Profile):** [Your Personal Portfolio/LinkedIn](https://abikhn.vercel.app) ---
