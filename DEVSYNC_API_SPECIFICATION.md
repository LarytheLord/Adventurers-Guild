# DevSync Integration API Specification

## Overview
This document outlines the API endpoints required to integrate DevSync functionality into The Adventurers Guild platform. The integration will enable real-time collaboration, code review, and project management features.

## Authentication
All API endpoints require authentication using NextAuth.js session tokens or API keys.

## Base URL
`https://api.devsync.codes` (or self-hosted equivalent)

## API Endpoints

### Quest-to-Project Conversion

#### POST /api/integrations/devsync/create-project
Create a DevSync project from an Adventurers Guild quest

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "quest_id": "string",
  "company_id": "string",
  "project_title": "string",
  "project_description": "string",
  "adventurer_ids": ["string"],
  "initial_files": [
    {
      "path": "string",
      "content": "string",
      "language": "string"
    }
  ],
  "collaboration_settings": {
    "enable_realtime_editing": true,
    "enable_code_reviews": true,
    "enable_version_control": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "project_id": "string",
  "project_url": "string",
  "collaboration_token": "string"
}
```

#### PUT /api/integrations/devsync/projects/{projectId}
Update a DevSync project linked to a quest

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "project_title": "string",
  "project_description": "string",
  "status": "active|paused|completed",
  "deadline": "ISO 8601 date string"
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "string",
    "updated_at": "ISO 8601 date string"
  }
}
```

### Real-Time Collaboration

#### POST /api/integrations/devsync/projects/{projectId}/sessions
Start a real-time collaboration session

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "session_type": "coding|review|meeting",
  "participants": ["string"], // user IDs
  "duration_estimate_minutes": 60,
  "quest_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "string",
  "session_url": "string",
  "connect_token": "string"
}
```

#### GET /api/integrations/devsync/projects/{projectId}/activity
Get real-time activity feed for a project

**Headers:**
- `Authorization: Bearer {token}`

**Query Parameters:**
- `limit`: number (default 50)
- `offset`: number (default 0)
- `since`: ISO 8601 date string (optional)

**Response:**
```json
{
  "success": true,
  "activities": [
    {
      "id": "string",
      "type": "file_change|comment|review|merge|participant_joined|participant_left",
      "user": {
        "id": "string",
        "name": "string",
        "avatar": "string"
      },
      "timestamp": "ISO 8601 date string",
      "details": {
        "file_path": "string",
        "change_summary": "string",
        "comment": "string"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 200
  }
}
```

### Code Review & Quality Assurance

#### POST /api/integrations/devsync/projects/{projectId}/reviews
Submit a code review for a project

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "reviewer_id": "string",
  "review_type": "general|technical|security|performance",
  "rating": 1-10,
  "comments": [
    {
      "file_path": "string",
      "line_number": "number",
      "comment": "string",
      "severity": "low|medium|high|critical"
    }
  ],
  "overall_feedback": "string",
  "quest_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "review_id": "string",
  "average_rating": 1-10
}
```

#### GET /api/integrations/devsync/projects/{projectId}/reviews
Get all reviews for a project

**Headers:**
- `Authorization: Bearer {token}`

**Query Parameters:**
- `review_type`: string (optional)
- `min_rating`: number (optional)
- `limit`: number (default 10)
- `offset`: number (default 0)

**Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "id": "string",
      "reviewer": {
        "id": "string",
        "name": "string",
        "role": "string"
      },
      "rating": 1-10,
      "review_type": "string",
      "comments": [
        {
          "file_path": "string",
          "line_number": "number",
          "comment": "string",
          "severity": "string"
        }
      ],
      "overall_feedback": "string",
      "created_at": "ISO 8601 date string"
    }
  ]
}
```

### File Management

#### POST /api/integrations/devsync/projects/{projectId}/files
Upload a file to a project

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data` (for file uploads)
- Or `Content-Type: application/json` (for text content)

**Request Body:**
```json
{
  "file_path": "string",
  "content": "string",
  "encoding": "utf-8|base64" (default utf-8)
}
```

**Response:**
```json
{
  "success": true,
  "file_id": "string",
  "file_path": "string",
  "size": "number",
  "uploaded_at": "ISO 8601 date string"
}
```

#### GET /api/integrations/devsync/projects/{projectId}/files
Get all files in a project

**Headers:**
- `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "id": "string",
      "path": "string",
      "size": "number",
      "language": "string",
      "last_modified": "ISO 8601 date string",
      "download_url": "string"
    }
  ]
}
```

### Version Control Integration

#### POST /api/integrations/devsync/projects/{projectId}/commits
Create a commit for a project

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "commit_message": "string",
  "author_id": "string",
  "files_changed": [
    {
      "path": "string",
      "change_type": "added|modified|deleted",
      "diff": "string" (optional)
    }
  ],
  "quest_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "commit_id": "string",
  "committed_at": "ISO 8601 date string"
}
```

#### GET /api/integrations/devsync/projects/{projectId}/commits
Get commit history for a project

**Headers:**
- `Authorization: Bearer {token}`

**Query Parameters:**
- `limit`: number (default 50)
- `offset`: number (default 0)

**Response:**
```json
{
  "success": true,
  "commits": [
    {
      "id": "string",
      "message": "string",
      "author": {
        "id": "string",
        "name": "string"
      },
      "files_changed": [
        {
          "path": "string",
          "change_type": "string"
        }
      ],
      "committed_at": "ISO 8601 date string"
    }
  ]
}
```

### Webhook Endpoints

#### PUT /api/webhooks/devsync
Handle webhooks from DevSync platform

**Headers:**
- `X-DevSync-Signature`: string (signature for verification)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "event_type": "project_status_change|file_uploaded|code_review_submitted|commit_created|session_ended",
  "event_data": {
    // Event-specific data
  },
  "timestamp": "ISO 8601 date string",
  "project_id": "string",
  "quest_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "processed": true
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "string",
  "error_code": "string",
  "details": {
    // Optional error details
  }
}
```

Common error codes:
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `PROJECT_NOT_FOUND`: Project does not exist
- `QUEST_NOT_FOUND`: Quest does not exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTEGRATION_ERROR`: DevSync platform error

## Rate Limits

- General API requests: 1000/hour per user
- File upload requests: 100/hour per user
- Real-time session creation: 50/hour per user

## Security Considerations

1. All API calls must be made over HTTPS
2. Authentication tokens should have limited scope
3. Input validation required for all parameters
4. Rate limiting to prevent abuse
5. Signature verification for webhook requests
6. Sensitive data should be encrypted in transit and at rest

## Implementation Notes

1. The Adventurers Guild platform will need to implement the webhook endpoint to receive notifications from DevSync
2. Project IDs from DevSync will need to be stored in the quest metadata for tracking
3. Authentication between platforms will use OAuth 2.0 or API keys depending on the integration requirements
4. The real-time collaboration features may require WebSocket connections for optimal performance