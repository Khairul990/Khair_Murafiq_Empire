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
import { doc, setDoc, getDoc, collection, writeBatch, getDocs, deleteDoc } from 'firebase/firestore'

// Helper to inject standard fields
const withStandardFields = (data) => ({
  ...data,
  ownerId: 'khairul2052007@gmail.com', // Placeholder owner
  source: 'local',
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

const getCollectionData = async (colName) => {
  if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') {
    throw new Error("Access Denied: Owner only")
  }
  const snapshot = await getDocs(collection(db, colName))
  const data = []
  snapshot.forEach(d => {
    const docData = d.data()
    data.push({ ...docData, id: docData.id || d.id }) // Ensure id exists
  })
  return data.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
}

export const firebaseService = {
  // PROJECTS
  getProjects: async () => await getCollectionData('control_projects'),
  saveProject: async (project) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') throw new Error("Access Denied")
    await setDoc(doc(db, "control_projects", String(project.id)), withStandardFields(project))
    return project
  },
  deleteProject: async (id) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') throw new Error("Access Denied")
    await deleteDoc(doc(db, "control_projects", String(id)))
  },

  // TASKS
  getTasks: async () => await getCollectionData('control_tasks'),
  saveTask: async (task) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') throw new Error("Access Denied")
    await setDoc(doc(db, "control_tasks", String(task.id)), withStandardFields(task))
    return task
  },
  deleteTask: async (id) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') throw new Error("Access Denied")
    await deleteDoc(doc(db, "control_tasks", String(id)))
  },

  // ALERTS
  getAlerts: async () => await getCollectionData('control_alerts'),
  saveAlert: async (alert) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') throw new Error("Access Denied")
    await setDoc(doc(db, "control_alerts", String(alert.id)), withStandardFields(alert))
    return alert
  },
  deleteAlert: async (id) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') throw new Error("Access Denied")
    await deleteDoc(doc(db, "control_alerts", String(id)))
  },

  // REPORTS (Social, Finance, etc)
  getReports: async () => await getCollectionData('control_reports'),
  saveReport: async (report) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') throw new Error("Access Denied")
    await setDoc(doc(db, "control_reports", String(report.id)), withStandardFields(report))
    return report
  },
  deleteReport: async (id) => {
    if (!auth.currentUser || auth.currentUser.email !== 'khairul2052007@gmail.com') throw new Error("Access Denied")
    await deleteDoc(doc(db, "control_reports", String(id)))
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
        let successCount = 0
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          
          // Filter out invalid items
          if (!item || typeof item !== 'object') continue

          const safeId = String(item.id || item.taskId || item.projectId || item.timestamp || `${collectionName}_${i}_${Date.now()}_${Math.random().toString(36).substring(7)}`)
          const docRef = doc(db, collectionName, safeId)
          
          batch.set(docRef, {
            ...item,
            ownerEmail: email,
            createdAt: item.createdAt || migratedAt,
            updatedAt: item.updatedAt || migratedAt,
            source: "local_migration",
            migratedAt: migratedAt,
            originalLocalId: item.id || item.taskId || item.projectId || null
          })
          
          successCount++
          operationCount++
          await commitBatchIfNeeded()
        }
        return successCount
      }
      
      const normalizeData = (data) => {
        if (!data) return []
        if (Array.isArray(data)) return data
        if (typeof data === 'object') return Object.values(data)
        return []
      }
      
      const safeProjects = normalizeData(localData.projects)
      const safeTasks = normalizeData(localData.tasks)
      const safeAlerts = normalizeData(localData.alerts)
      const safeFinance = normalizeData(localData.finance)
      const safeSocial = normalizeData(localData.social_posts)
      const safeGoals = normalizeData(localData.goals)
      
      let safeSettings = []
      if (localData.settings) {
        if (Array.isArray(localData.settings)) safeSettings = localData.settings
        else if (typeof localData.settings === 'object') safeSettings = [localData.settings]
      }

      const projectsCount = await migrateCollection(safeProjects, 'control_projects')
      const tasksCount = await migrateCollection(safeTasks, 'control_tasks')
      const alertsCount = await migrateCollection(safeAlerts, 'control_alerts')
      
      const reportsData = [...safeFinance, ...safeSocial]
      const reportsCount = await migrateCollection(reportsData, 'control_reports')
      
      const settingsData = [...safeGoals, ...safeSettings]
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
