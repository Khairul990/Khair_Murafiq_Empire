// Secure Serverless Voice Gateway
// Real API keys are injected from Vercel Environment Variables, NEVER exposed in the frontend.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' });
  }

  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ ok: false, message: 'Invalid or missing text payload' });
  }

  // Safety limit
  if (text.length > 1000) {
    return res.status(400).json({ ok: false, message: 'Text too long (max 1000 chars)' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    return res.status(200).json({
      ok: false,
      message: 'ElevenLabs environment variables not configured'
    });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2', // Good for Bengali and English
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(200).json({
        ok: false,
        message: `ElevenLabs API failed: ${response.status}`,
        details: errorText
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');

    return res.status(200).json({
      ok: true,
      audioBase64: base64Audio
    });

  } catch (error) {
    return res.status(200).json({
      ok: false,
      message: 'Internal Gateway Error',
      error: error.message
    });
  }
}
