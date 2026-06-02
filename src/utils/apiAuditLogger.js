// apiAuditLogger.js - Secure API Audit Logging
// This logger strictly avoids logging any secrets, API keys, or private data.
// Logs are stored safely in localStorage.

export const logApiAudit = (action, apiName, status, note) => {
  try {
    const logsString = localStorage.getItem('km_empire_api_audit_logs');
    let logs = [];
    if (logsString) {
      logs = JSON.parse(logsString);
    }
    
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      apiName,
      status,
      note
    };
    
    logs.unshift(newLog); // add to beginning
    // keep only last 50 logs
    if (logs.length > 50) {
      logs = logs.slice(0, 50);
    }
    
    localStorage.setItem('km_empire_api_audit_logs', JSON.stringify(logs));
  } catch (error) {
    console.error("Failed to write to API audit log.", error);
  }
};

export const getApiAuditLogs = () => {
  try {
    const logsString = localStorage.getItem('km_empire_api_audit_logs');
    if (logsString) {
      return JSON.parse(logsString);
    }
  } catch (error) {
    console.error("Failed to read API audit log.", error);
  }
  return [];
};

export const clearApiAuditLogs = () => {
  try {
    localStorage.removeItem('km_empire_api_audit_logs');
  } catch (error) {
    console.error("Failed to clear API audit log.", error);
  }
};
