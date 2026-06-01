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

import { db, auth } from './firebaseConfig'
import { doc, setDoc, getDoc, collection, writeBatch, getDocs } from 'firebase/firestore'

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
  },

  // CONNECTION TEST
  testFirebaseConnection: async () => {
    try {
      if (!db) return { success: false, message: 'Missing env config' }
      
      const testRef = doc(db, 'control_connection_tests', 'latest_test')
      await setDoc(testRef, {
        status: "success",
        source: "connection_test",
        testedAt: new Date().toISOString()
      })
      
      const snap = await getDoc(testRef)
      if (snap.exists() && snap.data().status === 'success') {
        return { success: true, message: 'Connected' }
      }
      
      return { success: false, message: 'Failed' }
    } catch (error) {
      console.error("Firebase Test Error:", error)
      if (error.code === 'permission-denied') return { success: false, message: 'Permission denied' }
      if (error.code?.includes('network')) return { success: false, message: 'Network error' }
      if (error.message?.includes('Missing or insufficient permissions')) return { success: false, message: 'Permission denied' }
      return { success: false, message: 'Failed' }
    }
  },

  // MIGRATION
  migrateDataToFirestore: async (localData) => {
    try {
      if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') {
        throw new Error("Access Denied: Owner only")
      }
      
      const email = auth.currentUser.email
      const migratedAt = new Date().toISOString()
      let batch = writeBatch(db)
      let operationCount = 0
      
      const commitBatchIfNeeded = async () => {
        if (operationCount >= 450) {
          await batch.commit()
          batch = writeBatch(db)
          operationCount = 0
        }
      }

      const migrateCollection = async (items, collectionName) => {
        if (!items || !items.length) return 0
        for (const item of items) {
          const docId = String(item.id || item.timestamp || Date.now() + Math.random().toString(36).substring(7))
          const docRef = doc(db, collectionName, docId)
          batch.set(docRef, {
            ...item,
            ownerEmail: email,
            createdAt: item.createdAt || migratedAt,
            updatedAt: item.updatedAt || migratedAt,
            source: "local_migration",
            migratedAt: migratedAt,
            originalLocalId: item.id || null
          })
          operationCount++
          await commitBatchIfNeeded()
        }
        return items.length
      }
      
      const projectsCount = await migrateCollection(localData.projects, 'control_projects')
      const tasksCount = await migrateCollection(localData.tasks, 'control_tasks')
      const alertsCount = await migrateCollection(localData.alerts, 'control_alerts')
      
      const reportsData = [...(localData.finance || []), ...(localData.social_posts || [])]
      const reportsCount = await migrateCollection(reportsData, 'control_reports')
      
      const settingsData = [...(localData.goals || []), ...(localData.settings ? [localData.settings] : [])]
      const settingsCount = await migrateCollection(settingsData, 'control_settings')
      
      // Activity Log
      const logRef = doc(db, 'control_activity_logs', `migration_${Date.now()}`)
      batch.set(logRef, {
        action: "local_to_firestore_migration",
        ownerEmail: email,
        migratedAt: migratedAt,
        status: "success",
        counts: {
          projects: projectsCount,
          tasks: tasksCount,
          alerts: alertsCount,
          reports: reportsCount,
          settings: settingsCount
        }
      })
      operationCount++
      
      if (operationCount > 0) {
        await batch.commit()
      }
      
      return { success: true, counts: { projects: projectsCount, tasks: tasksCount, alerts: alertsCount, reports: reportsCount, settings: settingsCount } }
    } catch (error) {
      console.error("Migration Error:", error)
      return { success: false, error: error.message }
    }
  },

  verifyMigration: async () => {
    try {
      const [proj, task, alrt] = await Promise.all([
        getDocs(collection(db, 'control_projects')),
        getDocs(collection(db, 'control_tasks')),
        getDocs(collection(db, 'control_alerts'))
      ])
      return { success: true, projects: proj.size, tasks: task.size, alerts: alrt.size }
    } catch (error) {
      console.error("Verification Error:", error)
      return { success: false, error: error.message }
    }
  }
}
