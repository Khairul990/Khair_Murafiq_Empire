# Khair Murafiq Empire OS - Future Firebase Architecture

This document describes the intended Firestore structure once the local-first application is migrated to Firebase.

## Standard Fields
Every document in every collection MUST implement these standard fields for security and auditing:
- `id` (String): Unique identifier
- `ownerId` (String): Placeholder for the authenticated user email (`khairul2052007@gmail.com`) or UID.
- `createdAt` (ISO String / Firestore Timestamp)
- `updatedAt` (ISO String / Firestore Timestamp)
- `source` (String): Indicates data origin (e.g., 'local' or 'firebase')

## Collections

### 1. `control_projects`
Stores all websites and primary apps.
- `name` (String)
- `type` (String)
- `status` (String)
- `liveUrl`, `adminUrl`, `githubUrl`, `vercelUrl`, `firebaseRoot` (String)
- `notes` (String)

### 2. `control_alerts`
Stores system and manual alerts tied to projects.
- `websiteId` / `projectId` (String)
- `projectName` (String)
- `alertType` (String)
- `severity` (String: Low, Medium, High, Critical)
- `status` (String: New, Seen, Fixed, Ignored)
- `message` (String)

### 3. `control_tasks`
Stores the Task Manager items.
- `websiteId` / `projectId` (String)
- `projectName` (String)
- `title` (String)
- `description` (String)
- `assignedTo` (String)
- `priority` (String: Low, Medium, High, Critical)
- `status` (String: Pending, Working, Review, Done)
- `dueDate` (String)

### 4. `control_settings`
Stores user preferences.
- `ecoMode` (Boolean)
- `language` (String)

### 5. `control_activity_logs`
Stores system and manual actions.
- `action` (String)
- `details` (String)

### 6. `control_reports`
Stores analytical reports or finance snapshots.
- `type` (String)
- `data` (Object)
