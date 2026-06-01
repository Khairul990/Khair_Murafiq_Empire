import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
  return (
    <BrowserRouter>
      <Routes>
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

