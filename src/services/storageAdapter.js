import { firebaseService } from './firebaseService'

const storageMode = 'firebase'

const localFallback = {
  get: (key) => {
    try {
      const val = localStorage.getItem(key)
      return val ? JSON.parse(val) : []
    } catch { return [] }
  },
  save: (key, data) => {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

const cloudOperation = async (cloudFn, localKey, allData) => {
  if (storageMode === 'firebase') {
    try {
      await cloudFn()
      localFallback.save(localKey, allData)
    } catch (err) {
      console.warn('Cloud save failed. Local fallback used.', err)
      alert('Cloud save failed. Local fallback used.')
      localFallback.save(localKey, allData)
    }
  } else {
    localFallback.save(localKey, allData)
  }
}

export const storageAdapter = {
  getMode: () => storageMode,

  getProjects: async () => {
    if (storageMode === 'firebase') {
      try {
        return await firebaseService.getProjects()
      } catch (err) {
        console.warn('Firebase read failed. Showing local backup data.', err)
        return localFallback.get('km_empire_projects')
      }
    }
    return localFallback.get('km_empire_projects')
  },
  saveProject: async (project, allProjects) => {
    await cloudOperation(() => firebaseService.saveProject(project), 'km_empire_projects', allProjects)
  },
  deleteProject: async (id, allProjects) => {
    await cloudOperation(() => firebaseService.deleteProject(id), 'km_empire_projects', allProjects)
  },

  getTasks: async () => {
    if (storageMode === 'firebase') {
      try {
        return await firebaseService.getTasks()
      } catch (err) {
        console.warn('Firebase read failed. Showing local backup data.', err)
        return localFallback.get('km_empire_tasks')
      }
    }
    return localFallback.get('km_empire_tasks')
  },
  saveTask: async (task, allTasks) => {
    await cloudOperation(() => firebaseService.saveTask(task), 'km_empire_tasks', allTasks)
  },
  deleteTask: async (id, allTasks) => {
    await cloudOperation(() => firebaseService.deleteTask(id), 'km_empire_tasks', allTasks)
  },

  getAlerts: async () => {
    if (storageMode === 'firebase') {
      try {
        return await firebaseService.getAlerts()
      } catch (err) {
        console.warn('Firebase read failed. Showing local backup data.', err)
        return localFallback.get('km_empire_alerts')
      }
    }
    return localFallback.get('km_empire_alerts')
  },
  saveAlert: async (alert, allAlerts) => {
    await cloudOperation(() => firebaseService.saveAlert(alert), 'km_empire_alerts', allAlerts)
  },
  deleteAlert: async (id, allAlerts) => {
    await cloudOperation(() => firebaseService.deleteAlert(id), 'km_empire_alerts', allAlerts)
  },

  getReports: async () => {
    if (storageMode === 'firebase') {
      try {
        return await firebaseService.getReports()
      } catch (err) {
        console.warn('Firebase read failed. Showing local backup data.', err)
        return localFallback.get('km_empire_reports')
      }
    }
    return localFallback.get('km_empire_reports')
  },
  saveReport: async (report, allReports) => {
    await cloudOperation(() => firebaseService.saveReport(report), 'km_empire_reports', allReports)
  },
  deleteReport: async (id, allReports) => {
    await cloudOperation(() => firebaseService.deleteReport(id), 'km_empire_reports', allReports)
  },

  getWebsiteEvents: async () => {
    if (storageMode === 'firebase') {
      try { return await firebaseService.getWebsiteEvents() }
      catch (err) { return localFallback.get('control_website_events') }
    }
    return localFallback.get('control_website_events')
  },
  saveWebsiteEvent: async (event, allEvents) => {
    await cloudOperation(() => firebaseService.saveWebsiteEvent(event), 'control_website_events', allEvents)
  },
  getWebsiteErrors: async () => {
    if (storageMode === 'firebase') {
      try { return await firebaseService.getWebsiteErrors() }
      catch (err) { return localFallback.get('control_website_errors') }
    }
    return localFallback.get('control_website_errors')
  },
  getWebsiteHealth: async () => {
    if (storageMode === 'firebase') {
      try { return await firebaseService.getWebsiteHealth() }
      catch (err) { return localFallback.get('control_website_health') }
    }
    return localFallback.get('control_website_health')
  }
}
