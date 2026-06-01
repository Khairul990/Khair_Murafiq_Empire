/**
 * FIREBASE SERVICE (PLACEHOLDER)
 * 
 * IMPORTANT: Firebase private keys, service accounts, or sensitive tokens 
 * must NEVER be stored in frontend code or GitHub.
 * 
 * This file is a safe placeholder. Currently, it interacts with localStorage.
 * When Firebase is officially connected, the actual Firestore config and 
 * initialization will be injected here using environment variables (e.g., import.meta.env).
 */

// Helper to inject standard fields
const withStandardFields = (data) => ({
  ...data,
  ownerId: 'khairul2052007@gmail.com', // Placeholder owner
  source: 'local',
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

export const firebaseService = {
  // PROJECTS
  getProjects: async () => {
    const data = localStorage.getItem('km_empire_projects')
    return data ? JSON.parse(data) : []
  },
  saveProject: async (project) => {
    // In future: await setDoc(doc(db, "control_projects", project.id), withStandardFields(project))
    console.log("Mock Firebase: Saved Project", project.id)
    return project
  },
  deleteProject: async (id) => {
    // In future: await deleteDoc(doc(db, "control_projects", id))
    console.log("Mock Firebase: Deleted Project", id)
  },

  // TASKS
  getTasks: async () => {
    const data = localStorage.getItem('km_empire_tasks')
    return data ? JSON.parse(data) : []
  },
  saveTask: async (task) => {
    // In future: await setDoc(doc(db, "control_tasks", task.id), withStandardFields(task))
    console.log("Mock Firebase: Saved Task", task.id)
    return task
  },
  deleteTask: async (id) => {
    // In future: await deleteDoc(doc(db, "control_tasks", id))
    console.log("Mock Firebase: Deleted Task", id)
  },

  // ALERTS
  getAlerts: async () => {
    const data = localStorage.getItem('km_empire_alerts')
    return data ? JSON.parse(data) : []
  },
  saveAlert: async (alert) => {
    // In future: await setDoc(doc(db, "control_alerts", alert.id), withStandardFields(alert))
    console.log("Mock Firebase: Saved Alert", alert.id)
    return alert
  },
  deleteAlert: async (id) => {
    // In future: await deleteDoc(doc(db, "control_alerts", id))
    console.log("Mock Firebase: Deleted Alert", id)
  }
}
