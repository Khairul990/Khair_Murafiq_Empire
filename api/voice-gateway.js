// Placeholder for Future Vercel Serverless Function
// Real API keys will be injected from Vercel Environment Variables, NEVER exposed in the frontend.

export default function handler(req, res) {
  res.status(200).json({
    ok: false,
    mode: "planned",
    connected: false,
    message: "Voice API gateway not connected yet. Server-side environment variables required."
  });
}
