import { firebaseService } from './firebaseService'

/**
 * STORAGE ADAPTER
 * 
 * Safely routes data requests between 'local' (localStorage) and 'firebase' (Firestore).
 * For now, storageMode MUST stay "local".
 */

// Toggle this to 'firebase' later to switch the entire app's data source.
const storageMode = 'local'

export const storageAdapter = {
  getMode: () => storageMode,

  getProjects: async () => {
    if (storageMode === 'firebase') return firebaseService.getProjects()
    
    // Local Mode
    const stored = localStorage.getItem('km_empire_projects')
    return stored ? JSON.parse(stored) : []
  },

  getTasks: async () => {
    if (storageMode === 'firebase') return firebaseService.getTasks()
    
    // Local Mode
    const stored = localStorage.getItem('km_empire_tasks')
    return stored ? JSON.parse(stored) : []
  },

  getAlerts: async () => {
    if (storageMode === 'firebase') return firebaseService.getAlerts()
    
    // Local Mode
    const stored = localStorage.getItem('km_empire_alerts')
    return stored ? JSON.parse(stored) : []
  }

  // Future mapping: saveProject, saveTask, saveAlert, etc.
}
