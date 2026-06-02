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

export const requestVoiceReport = async (text) => {
  return plannedResponse("ElevenLabs Voice");
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
