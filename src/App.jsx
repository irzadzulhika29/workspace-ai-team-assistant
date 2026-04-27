import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import MobileHeader from './components/layout/MobileHeader'
import Dashboard from './pages/Dashboard'
import SupervisorChat from './pages/SupervisorChat'
import FileWorkspace from './pages/FileWorkspace'
import CalendarPage from './pages/CalendarPage'
import JiraPage from './pages/JiraPage'
import IntegrationsPage from './pages/IntegrationsPage'
import TokenMonitorPage from './pages/TokenMonitorPage'
import EmailPage from './pages/EmailPage'
import DebugAuthPage from './pages/DebugAuthPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { SidebarProvider, useSidebar } from './context/SidebarContext'
import { AuthProvider } from './context/AuthContext'

function Layout() {
  const { open, collapsed, close } = useSidebar()

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      <Sidebar />

      <main
        className={`flex-1 min-h-screen overflow-hidden flex flex-col transition-all duration-300`}
        style={{ marginLeft: collapsed ? '72px' : '240px' }}
      >
        {/* Mobile top header */}
        <MobileHeader />

        <div className="flex-1 p-3 md:p-6 pt-0 md:pt-6">
          <div className="min-h-[calc(100dvh-3.5rem)] md:min-h-[calc(100dvh-2.5rem)] overflow-hidden rounded-[1.25rem] bg-white/70 backdrop-blur-md shadow-[0_20px_40px_rgba(25,28,29,0.05)]">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat/supervisor" element={<SupervisorChat />} />
              <Route path="/workspace/files" element={<FileWorkspace />} />
              <Route path="/workspace/calendar" element={<CalendarPage />} />
              <Route path="/workspace/jira" element={<JiraPage />} />
              <Route path="/workspace/email" element={<EmailPage />} />
              <Route path="/debug/auth" element={<DebugAuthPage />} />
              <Route path="/monitoring/tokens" element={<TokenMonitorPage />} />
              <Route path="/settings/integrations" element={<IntegrationsPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<SidebarProvider><Layout /></SidebarProvider>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat/supervisor" element={<SupervisorChat />} />
              <Route path="/workspace/files" element={<FileWorkspace />} />
              <Route path="/workspace/calendar" element={<CalendarPage />} />
              <Route path="/workspace/jira" element={<JiraPage />} />
              <Route path="/workspace/email" element={<EmailPage />} />
              <Route path="/debug/auth" element={<DebugAuthPage />} />
              <Route path="/monitoring/tokens" element={<TokenMonitorPage />} />
              <Route path="/settings/integrations" element={<IntegrationsPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
