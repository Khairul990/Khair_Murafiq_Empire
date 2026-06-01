# KM Control Room - Security Plan

## Current Security Status
- **Environment Variables**: `.env` is properly ignored by Git, ensuring keys don't leak.
- **Frontend Code**: Clean. No Firebase private keys, service accounts, or Admin SDKs are stored in the frontend.
- **Data Location**: Currently `localStorage` only. Storage mode remains `'local'`.
- **Firebase Connection**: Web App Config is verified and connected, but NOT active for dashboard data.

## What is Protected Now
- **GitHub Repository**: Protected from secret leaks via `.gitignore`.
- **Local Application**: Protected from casual local access by a Demo Local login guard on `App.jsx`.
- **Dangerous Actions**: Edit and Delete actions have a secondary check requiring the local session token.

## What is Still Demo/Local
- The "Login System" relies on a hardcoded password (`demo123`) and sets a simple flag in `localStorage` (`km_empire_owner_session`).
- This means anyone with knowledge of the password or how to use Chrome DevTools can bypass the login wall on their local machine.

## Why Firebase Auth is Required
- Local storage flags cannot cryptographically verify a user's identity across the internet.
- Firebase Auth will issue a secure JWT (JSON Web Token) that the backend (Firestore) can trust to explicitly identify `khairul2052007@gmail.com`.

## Why Firestore Rules are Required
- Even if the React app hides the data, an attacker with the Firebase Web Config (which is public) can use a REST API to query the database directly.
- Firestore Security Rules act as a bouncer AT THE DATABASE LEVEL, ensuring that only requests accompanied by the Owner's JWT are allowed to read or write the `control_*` collections.

## What Must NEVER Be Stored in Frontend/GitHub
- `service-account.json`
- Firebase Admin SDK private keys
- Vercel deployment tokens
- GitHub Personal Access Tokens (PAT)
- WhatsApp API keys

## Safe Next Steps Before Migration
1. Implement Firebase Authentication (Email/Password) in the frontend.
2. Verify the Owner (`khairul2052007@gmail.com`) can successfully log in and receive a secure token.
3. Deploy the `firestore.rules.example` to the live Firebase project.
4. Only AFTER rules and auth are active, switch `storageMode` to `'firebase'` and migrate the data.
