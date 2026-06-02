# Khair Murafiq Empire OS API Environment Setup & Security Guidelines

## 🛡️ 1. Absolute Security Rules

1. **Real API keys must be stored ONLY in:**
   `Vercel Dashboard → Project → Settings → Environment Variables`
2. **Never** use `VITE_` prefix for private API keys, as this exposes them to the frontend/browser.
3. **Never** store API keys in:
   - React components/files (`.js`, `.jsx`, `.ts`, `.tsx`)
   - `localStorage` or `sessionStorage`
   - Firestore client documents
   - GitHub (do not commit `.env.local` with real keys)
   - Screenshots, chat messages, or public docs.

## 🔐 2. Future Server-Side Environment Variables

The serverless backend will require the following exact environment variable names in Vercel:

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `WHATSAPP_TOKEN`
- `GITHUB_TOKEN`
- `VERCEL_TOKEN`
- `UPTIME_API_KEY`

## 🚫 3. Strictly Prohibited Variables

Do **NOT** use these frontend-exposed variables for the services above:

- `VITE_ELEVENLABS_API_KEY`
- `VITE_GEMINI_API_KEY`
- `VITE_OPENAI_API_KEY`
- `VITE_WHATSAPP_TOKEN`
- `VITE_GITHUB_TOKEN`
- `VITE_VERCEL_TOKEN`

## 🔄 4. Future API Connection Flow

1. **Control Room Frontend**: Calls `apiGatewayClient.js` without any keys.
2. **Serverless Gateway**: (Vercel Functions in `api/` folder) receives the request, injects the server-side Environment Variable, and securely calls the Real API Provider.
3. **Real API Provider**: Processes the request.
4. **Serverless Gateway**: Filters/sanitizes the response.
5. **Control Room Frontend**: Receives the safe response.
