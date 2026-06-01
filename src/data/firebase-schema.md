# Khair Murafiq Empire OS - Future Firebase Architecture

This document describes the intended Firestore structure once the local-first application is migrated to Firebase.

## Standard Fields
Every document in every collection MUST implement these standard fields:
- `id` (String): Unique identifier (usually auto-generated or slugified name)
- `ownerId` (String): Placeholder for the authenticated user ID (Firebase Auth UID)
- `createdAt` (ISO String / Firestore Timestamp)
- `updatedAt` (ISO String / Firestore Timestamp)
- `source` (String): E.g., 'local' or 'firebase-ready'

## Collections

### 1. `projects`
Stores all websites and primary apps.
- `name` (String)
- `type` (String)
- `status` (String: Development, Live, Maintenance, Warning, Error)
- `liveUrl` (String)
- `adminUrl` (String)
- `repoUrl` (String)
- `vercelUrl` (String)
- `firebaseRoot` (String)
- `notes` (String)

### 2. `alerts`
Stores system and manual alerts tied to projects.
- `projectId` (String)
- `projectName` (String)
- `alertType` (String)
- `severity` (String: Low, Medium, High, Critical)
- `status` (String: New, Reviewing, Fixed, Ignored)
- `message` (String)

### 3. `tasks`
Stores the Task Manager items.
- `title` (String)
- `description` (String)
- `projectId` (String)
- `projectName` (String)
- `priority` (String: Low, Medium, High, Critical)
- `status` (String: Pending, In Progress, Completed, Blocked)
- `dueDate` (String)

### 4. `finance`
Stores income/expense records.
- `type` (String: Income, Expense)
- `amount` (Number)
- `currency` (String)
- `projectId` (String, optional)
- `description` (String)
- `date` (String)

### 5. `goals`
Stores long-term objectives.
- `title` (String)
- `targetDate` (String)
- `progress` (Number)
- `isCompleted` (Boolean)

### 6. `socialPosts`
Stores the Social Planner timeline.
- `platform` (String: LinkedIn, Twitter, etc.)
- `content` (String)
- `scheduledFor` (String)
- `status` (String: Draft, Scheduled, Published)

### 7. `settings`
Stores user preferences.
- `ecoMode` (Boolean)
- `language` (String)
- `theme` (String)

### 8. `activityLogs`
Stores system and manual actions.
- `action` (String)
- `details` (String)
