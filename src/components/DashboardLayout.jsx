import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import EmpireAssistant from './EmpireAssistant'

export default function DashboardLayout() {
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-empire-dark bg-empire-pattern flex overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      {/* Main content area */}
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'} min-w-0`}>
        <Topbar onToggleAssistant={() => setAssistantOpen(!assistantOpen)} />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto empire-scrollbar relative">
          <Outlet />
        </main>
      </div>
      {/* Floating Assistant Button */}
      <EmpireAssistant open={assistantOpen} onToggle={() => setAssistantOpen(!assistantOpen)} />
    </div>
  )
}
