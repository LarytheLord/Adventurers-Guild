/**
 * Smart To-Do List Generator for Quests.
 * Provides context-aware tasks based on quest category, title, and description.
 */
export function generateDefaultTasks(title: string, description: string, category: string): string[] {
  const tasks: string[] = [];
  const normalizedTitle = title.toLowerCase();
  const normalizedDesc = description.toLowerCase();

  // 1. Initial Setup Task
  if (normalizedTitle.includes("next.js") || normalizedTitle.includes("nextjs")) {
    tasks.push("Setup Next.js project with TypeScript and Tailwind CSS");
  } else if (normalizedTitle.includes("react")) {
    tasks.push("Setup React project structure and configure package.json");
  } else {
    tasks.push("Initialize repository and setup project dependencies");
  }

  // 2. Database/Model setup if mentioned
  if (normalizedTitle.includes("prisma") || normalizedDesc.includes("prisma") || normalizedDesc.includes("database") || normalizedDesc.includes("db ")) {
    tasks.push("Design database schema, write Prisma models, and run migrations");
  }

  // 3. Category-Specific Core Tasks
  switch (category.toLowerCase()) {
    case "frontend":
      tasks.push("Create responsive UI layouts based on design specifications");
      if (normalizedTitle.includes("auth") || normalizedDesc.includes("login") || normalizedDesc.includes("signup")) {
        tasks.push("Implement login, signup, and profile UI screens with form validation");
      } else {
        tasks.push("Develop interactive frontend components and manage local/global state");
      }
      tasks.push("Integrate backend API endpoints and handle loading/error states");
      break;

    case "backend":
      if (normalizedTitle.includes("auth") || normalizedDesc.includes("jwt") || normalizedDesc.includes("login")) {
        tasks.push("Implement secure user authentication endpoints (Signup/Login/JWT)");
      } else {
        tasks.push("Develop RESTful API routes and controller logic");
      }
      tasks.push("Configure request body validation using Zod or Joi");
      tasks.push("Implement comprehensive error handling middleware");
      break;

    case "fullstack":
      tasks.push("Implement secure backend APIs and connect database queries");
      tasks.push("Build matching frontend pages and connect them to the backend API");
      if (normalizedTitle.includes("auth")) {
        tasks.push("Implement end-to-end authentication flow and route guards");
      }
      break;

    case "design":
      tasks.push("Research user flows and draft high-fidelity wireframes in Figma");
      tasks.push("Build interactive UI prototype and document design system guidelines");
      tasks.push("Validate designs via peer review or quick usability tests");
      break;

    case "qa":
      tasks.push("Write a comprehensive test plan covering happy paths and edge cases");
      tasks.push("Implement manual test cases and document reproducible steps");
      tasks.push("Write automated end-to-end tests using Playwright or Jest");
      break;

    case "data_science":
    case "analytics":
      tasks.push("Perform exploratory data analysis (EDA) and clean dataset");
      tasks.push("Train predictive model or build statistical analytics queries");
      tasks.push("Create visual charts or an interactive dashboard for results");
      break;

    default:
      tasks.push("Implement core business logic as specified in the quest brief");
      tasks.push("Refactor code for clean architecture and readability");
  }

  // 4. Testing & Documentation Tasks
  if (normalizedTitle.includes("api") || normalizedDesc.includes("api")) {
    tasks.push("Document API endpoints using Postman collection or Swagger spec");
  } else {
    tasks.push("Write unit and integration tests for core logic");
  }

  // 5. Final deployment/verification Task
  tasks.push("Perform self-review, run linters, and verify criteria before submitting");

  return tasks;
}
