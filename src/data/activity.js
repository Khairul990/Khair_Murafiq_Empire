const ACTIVITY_KEY = 'km_empire_activity_logs'

export const logActivity = (action, details = '') => {
  try {
    let logs = []
    const stored = localStorage.getItem(ACTIVITY_KEY)
    if (stored) {
      logs = JSON.parse(stored)
    }

    const newLog = {
      id: Date.now().toString(),
      action,
      details,
      createdAt: new Date().toISOString()
    }

    logs.unshift(newLog)

    // Keep only the last 100 logs to prevent localStorage bloating
    if (logs.length > 100) {
      logs = logs.slice(0, 100)
    }

    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(logs))
    return newLog
  } catch (error) {
    console.error('Failed to log activity', error)
  }
}

export const getActivities = () => {
  try {
    const stored = localStorage.getItem(ACTIVITY_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

export const clearActivities = () => {
  localStorage.removeItem(ACTIVITY_KEY)
}
