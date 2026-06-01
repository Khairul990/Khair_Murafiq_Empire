const LOG_KEY = 'km_empire_assistant_audit_logs';

export const addAuditLog = (action, status, source = 'assistant', note = '') => {
  try {
    let logs = [];
    const existing = localStorage.getItem(LOG_KEY);
    if (existing) {
      logs = JSON.parse(existing);
    }
    
    const newLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      action,
      timestamp: new Date().toISOString(),
      source,
      status,
      note
    };
    
    logs.unshift(newLog); // Add to beginning
    
    // Keep only last 50 logs to save space
    if (logs.length > 50) {
      logs = logs.slice(0, 50);
    }
    
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error("Failed to save audit log:", error);
  }
};

export const getAuditLogs = () => {
  try {
    const existing = localStorage.getItem(LOG_KEY);
    if (existing) {
      return JSON.parse(existing);
    }
  } catch (error) {
    console.error("Failed to read audit logs:", error);
  }
  return [];
};

export const clearAuditLogs = () => {
  try {
    localStorage.removeItem(LOG_KEY);
  } catch (error) {
    console.error("Failed to clear audit logs:", error);
  }
};
