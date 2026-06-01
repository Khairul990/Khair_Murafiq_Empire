import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './services/firebaseConfig'

import AuthPage from './pages/AuthPage'
import DashboardLayout from './components/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import MonitoringPage from './pages/MonitoringPage'
import StaffPage from './pages/StaffPage'
import TasksPage from './pages/TasksPage'
import FinancePage from './pages/FinancePage'
import WhatsAppPage from './pages/WhatsAppPage'
import SocialPage from './pages/SocialPage'
import AffiliatePage from './pages/AffiliatePage'
import GoalsPage from './pages/GoalsPage'
import ReportsPage from './pages/ReportsPage'
import SafetyPage from './pages/SafetyPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.email === 'khairul2052007@gmail.com') {
          setUser(firebaseUser)
        } else {
          // Immediately sign out unauthorized users
          await signOut(auth)
          setUser(null)
          alert("Access Denied — Owner only.")
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-dark flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <Route path="*" element={<AuthPage />} />
        ) : (
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/whatsapp" element={<WhatsAppPage />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/affiliate" element={<AffiliatePage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )
}
