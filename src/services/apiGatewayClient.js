// apiGatewayClient.js - Secure Frontend API Gateway
// This client NEVER holds any real API keys or tokens.
// It securely routes requests to the backend Serverless Gateway.

import { logApiAudit } from '../utils/apiAuditLogger';

const plannedResponse = (serviceName) => {
  logApiAudit(`api_gateway_planned_mode`, serviceName, 'success', `Planned mode check for ${serviceName}. No real API call made.`);
  return {
    ok: false,
    mode: "planned",
    message: "Serverless API gateway is not connected yet."
  };
};

export const requestElevenLabsVoice = async (text) => {
  try {
    logApiAudit(`premium_voice_requested`, 'ElevenLabs', 'info', `Requesting premium voice for ${text.length} chars`);
    const response = await fetch('/api/voice-gateway', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
      logApiAudit(`premium_voice_failed`, 'ElevenLabs', 'error', `HTTP Error: ${response.status}`);
      return { ok: false, message: `Gateway HTTP Error ${response.status}` };
    }
    
    const data = await response.json();
    if (data.ok) {
      logApiAudit(`premium_voice_success`, 'ElevenLabs', 'success', 'Premium voice synthesized successfully');
    } else {
      logApiAudit(`premium_voice_failed`, 'ElevenLabs', 'error', data.message || 'Unknown ElevenLabs error');
    }
    return data;
  } catch (error) {
    logApiAudit(`premium_voice_failed`, 'ElevenLabs', 'error', error.message);
    return { ok: false, message: 'Network or gateway error' };
  }
};

export const requestAIResponse = async (prompt) => {
  return plannedResponse("AI Brain");
};

export const requestWhatsAppAlert = async (payload) => {
  return plannedResponse("WhatsApp");
};

export const requestUptimeCheck = async (url) => {
  return plannedResponse("Uptime Monitor");
};

export const requestGitHubStatus = async (repo) => {
  return plannedResponse("GitHub API");
};

export const requestVercelStatus = async (projectId) => {
  return plannedResponse("Vercel API");
};
