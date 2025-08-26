# API Documentation

This document provides detailed information about the API endpoints used in The Adventurers Guild platform.

## Authentication Endpoints

### Sign Up
```
POST /api/auth/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "student" // or "company"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "student"
    }
  }
}
```

### Sign In
```
POST /api/auth/signin
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "student"
    },
    "session": "session_token"
  }
}
```

### Sign Out
```
POST /api/auth/signout
```

**Response:**
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

## User Endpoints

### Get Current User
```
GET /api/user
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "rank": "F",
    "xp": 0,
    "avatar_url": "https://example.com/avatar.jpg",
    "bio": "Software developer",
    "github_url": "https://github.com/username",
    "linkedin_url": "https://linkedin.com/in/username",
    "location": "New York, NY",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

### Update User Profile
```
PUT /api/user
```

**Request Body:**
```json
{
  "name": "John Smith",
  "bio": "Senior software developer",
  "github_url": "https://github.com/newusername",
  "linkedin_url": "https://linkedin.com/in/newusername",
  "location": "San Francisco, CA"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Smith",
      "role": "student",
      "rank": "F",
      "xp": 0,
      "avatar_url": "https://example.com/avatar.jpg",
      "bio": "Senior software developer",
      "github_url": "https://github.com/newusername",
      "linkedin_url": "https://linkedin.com/in/newusername",
      "location": "San Francisco, CA",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-02T00:00:00Z"
    }
  }
}
```

## Quest Endpoints

### Get All Quests
```
GET /api/quests
```

**Query Parameters:**
- `status`: Filter by quest status (draft, active, in_progress, completed, cancelled)
- `difficulty`: Filter by difficulty (F, D, C, B, A, S)
- `category`: Filter by category
- `limit`: Number of quests to return (default: 10)
- `offset`: Number of quests to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "quests": [
      {
        "id": "uuid",
        "title": "Build a React Component",
        "description": "Create a reusable React component for a dashboard",
        "requirements": "Experience with React and TypeScript",
        "difficulty": "B",
        "xp_reward": 150,
        "skill_rewards": {
          "frontend": 100,
          "typescript": 50
        },
        "budget": 500.00,
        "payment_amount": 425.00,
        "deadline": "2023-12-31T23:59:59Z",
        "status": "active",
        "company_id": "uuid",
        "assigned_to": null,
        "max_applicants": 1,
        "tags": ["react", "typescript", "frontend"],
        "is_featured": false,
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

### Get Quest by ID
```
GET /api/quests/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Build a React Component",
    "description": "Create a reusable React component for a dashboard",
    "requirements": "Experience with React and TypeScript",
    "difficulty": "B",
    "xp_reward": 150,
    "skill_rewards": {
      "frontend": 100,
      "typescript": 50
    },
    "budget": 500.00,
    "payment_amount": 425.00,
    "deadline": "2023-12-31T23:59:59Z",
    "status": "active",
    "company_id": "uuid",
    "company": {
      "name": "Tech Corp",
      "logo_url": "https://example.com/logo.png"
    },
    "assigned_to": null,
    "max_applicants": 1,
    "tags": ["react", "typescript", "frontend"],
    "attachments": [],
    "is_featured": false,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

### Create Quest
```
POST /api/quests
```

**Request Body:**
```json
{
  "title": "Build a React Component",
  "description": "Create a reusable React component for a dashboard",
  "requirements": "Experience with React and TypeScript",
  "difficulty": "B",
  "xp_reward": 150,
  "skill_rewards": {
    "frontend": 100,
    "typescript": 50
  },
  "budget": 500.00,
  "deadline": "2023-12-31T23:59:59Z",
  "max_applicants": 1,
  "tags": ["react", "typescript", "frontend"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quest created successfully",
  "data": {
    "id": "uuid",
    "title": "Build a React Component",
    "description": "Create a reusable React component for a dashboard",
    "requirements": "Experience with React and TypeScript",
    "difficulty": "B",
    "xp_reward": 150,
    "skill_rewards": {
      "frontend": 100,
      "typescript": 50
    },
    "budget": 500.00,
    "payment_amount": 425.00,
    "deadline": "2023-12-31T23:59:59Z",
    "status": "draft",
    "company_id": "uuid",
    "assigned_to": null,
    "max_applicants": 1,
    "tags": ["react", "typescript", "frontend"],
    "is_featured": false,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

### Update Quest
```
PUT /api/quests/{id}
```

**Request Body:**
```json
{
  "title": "Build a React Component - Updated",
  "description": "Create a reusable React component for a dashboard with tests",
  "requirements": "Experience with React, TypeScript, and Jest",
  "difficulty": "B",
  "xp_reward": 200,
  "skill_rewards": {
    "frontend": 120,
    "typescript": 60,
    "testing": 20
  },
  "budget": 600.00,
  "deadline": "2024-01-15T23:59:59Z",
  "max_applicants": 1,
  "tags": ["react", "typescript", "frontend", "testing"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quest updated successfully",
  "data": {
    "id": "uuid",
    "title": "Build a React Component - Updated",
    "description": "Create a reusable React component for a dashboard with tests",
    "requirements": "Experience with React, TypeScript, and Jest",
    "difficulty": "B",
    "xp_reward": 200,
    "skill_rewards": {
      "frontend": 120,
      "typescript": 60,
      "testing": 20
    },
    "budget": 600.00,
    "payment_amount": 510.00,
    "deadline": "2024-01-15T23:59:59Z",
    "status": "draft",
    "company_id": "uuid",
    "assigned_to": null,
    "max_applicants": 1,
    "tags": ["react", "typescript", "frontend", "testing"],
    "is_featured": false,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-02T00:00:00Z"
  }
}
```

### Delete Quest
```
DELETE /api/quests/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Quest deleted successfully"
}
```

### Apply for Quest
```
POST /api/quests/{id}/apply
```

**Request Body:**
```json
{
  "cover_letter": "I'm excited to work on this project because...",
  "proposed_timeline": "I can complete this project in 2 weeks"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": "uuid",
    "quest_id": "uuid",
    "user_id": "uuid",
    "cover_letter": "I'm excited to work on this project because...",
    "proposed_timeline": "I can complete this project in 2 weeks",
    "status": "pending",
    "applied_at": "2023-01-01T00:00:00Z"
  }
}
```

### Submit Quest Completion
```
POST /api/quests/{id}/submit
```

**Request Body:**
```json
{
  "submission_url": "https://github.com/username/project",
  "description": "I've completed the project as requested. Here are the key features implemented..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quest submission received",
  "data": {
    "id": "uuid",
    "quest_id": "uuid",
    "user_id": "uuid",
    "submission_url": "https://github.com/username/project",
    "description": "I've completed the project as requested. Here are the key features implemented...",
    "status": "pending",
    "submitted_at": "2023-01-01T00:00:00Z"
  }
}
```

## Quest Application Endpoints

### Get Quest Applications
```
GET /api/quest-applications
```

**Query Parameters:**
- `quest_id`: Filter by quest ID
- `user_id`: Filter by user ID
- `status`: Filter by status (pending, approved, rejected, revision_requested)

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "uuid",
        "quest_id": "uuid",
        "user_id": "uuid",
        "user": {
          "name": "John Doe",
          "avatar_url": "https://example.com/avatar.jpg"
        },
        "cover_letter": "I'm excited to work on this project because...",
        "proposed_timeline": "I can complete this project in 2 weeks",
        "status": "pending",
        "applied_at": "2023-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Update Application Status
```
PUT /api/quest-applications/{id}/status
```

**Request Body:**
```json
{
  "status": "approved", // or "rejected" or "revision_requested"
  "reviewer_notes": "Great application! Let's move forward."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application status updated",
  "data": {
    "id": "uuid",
    "quest_id": "uuid",
    "user_id": "uuid",
    "cover_letter": "I'm excited to work on this project because...",
    "proposed_timeline": "I can complete this project in 2 weeks",
    "status": "approved",
    "reviewer_notes": "Great application! Let's move forward.",
    "reviewed_at": "2023-01-01T00:00:00Z"
  }
}
```

## Quest Submission Endpoints

### Get Quest Submissions
```
GET /api/quest-submissions
```

**Query Parameters:**
- `quest_id`: Filter by quest ID
- `user_id`: Filter by user ID
- `status`: Filter by status (pending, approved, rejected, revision_requested)

**Response:**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "uuid",
        "quest_id": "uuid",
        "user_id": "uuid",
        "user": {
          "name": "John Doe",
          "avatar_url": "https://example.com/avatar.jpg"
        },
        "submission_url": "https://github.com/username/project",
        "description": "I've completed the project as requested...",
        "status": "pending",
        "submitted_at": "2023-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Update Submission Status
```
PUT /api/quest-submissions/{id}/status
```

**Request Body:**
```json
{
  "status": "approved", // or "rejected" or "revision_requested"
  "feedback": "Excellent work! The implementation is solid.",
  "rating": 5 // 1-5 star rating
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission status updated",
  "data": {
    "id": "uuid",
    "quest_id": "uuid",
    "user_id": "uuid",
    "submission_url": "https://github.com/username/project",
    "description": "I've completed the project as requested...",
    "status": "approved",
    "feedback": "Excellent work! The implementation is solid.",
    "rating": 5,
    "reviewed_at": "2023-01-01T00:00:00Z"
  }
}
```

## Skill Endpoints

### Get Skill Categories
```
GET /api/skills/categories
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Frontend Development",
        "description": "Building user interfaces for web applications",
        "icon": "code",
        "color": "blue",
        "max_skill_points": 3000,
        "created_at": "2023-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Get Skills by Category
```
GET /api/skills/categories/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "uuid",
      "name": "Frontend Development",
      "description": "Building user interfaces for web applications",
      "icon": "code",
      "color": "blue",
      "max_skill_points": 3000,
      "created_at": "2023-01-01T00:00:00Z"
    },
    "skills": [
      {
        "id": "uuid",
        "category_id": "uuid",
        "name": "React Mastery",
        "description": "Build dynamic user interfaces with React",
        "max_level": 5,
        "points_per_level": 100,
        "icon": "code",
        "color": "blue",
        "is_active": true,
        "created_at": "2023-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Unlock Skill
```
POST /api/user-skills/unlock
```

**Request Body:**
```json
{
  "skill_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Skill unlocked successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "skill_id": "uuid",
    "level": 1,
    "skill_points": 100,
    "is_unlocked": true,
    "unlocked_at": "2023-01-01T00:00:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

## Error Responses

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes:
- `VALIDATION_ERROR`: Input data validation failed
- `AUTHENTICATION_ERROR`: User not authenticated
- `AUTHORIZATION_ERROR`: User not authorized for this action
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (e.g., duplicate entry)
- `INTERNAL_ERROR`: Server-side error
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Rate Limiting

All API endpoints are rate-limited to prevent abuse:
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

Exceeding these limits will result in a 429 (Too Many Requests) response.

## Authentication

Most endpoints require authentication via HTTP Bearer token:
```
Authorization: Bearer <token>
```

Tokens are obtained through the authentication endpoints and are valid for 24 hours.

## Versioning

The API is currently at version 1. All endpoints are prefixed with `/api/v1`:
```
https://api.adventurersguild.vercel.app/api/v1/quests
```

Future versions will be released as needed with proper deprecation notices.