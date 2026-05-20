import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import SettingsPage from './pages/SettingsPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { SidebarProvider, useSidebar } from './context/SidebarContext'
import { AuthProvider } from './context/AuthContext'

function Layout() {
  const location = useLocation()
  const { open, collapsed, close } = useSidebar()
  const isDashboardRoute = location.pathname === '/'
  const isJiraRoute = location.pathname === '/workspace/jira'
  const isFileWorkspaceRoute = location.pathname === '/workspace/files'
  const isSupervisorRoute = location.pathname === '/chat/supervisor'

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
        className="flex min-h-screen flex-1 flex-col overflow-hidden transition-all duration-300 md:ml-[var(--app-sidebar-offset)]"
        style={{ '--app-sidebar-offset': collapsed ? '72px' : '270px' }}
      >
        {/* Mobile top header */}
        <MobileHeader />

        <div className="flex-1 bg-[#f8f9fd] p-3 pt-0 md:p-6 md:pt-6">
          <div
            className={
              isDashboardRoute || isFileWorkspaceRoute
                ? 'min-h-[calc(100dvh-3.5rem)] md:min-h-[calc(100dvh-2.5rem)]'
                : isJiraRoute
                  ? 'min-h-[calc(100dvh-3.5rem)] md:min-h-[calc(100dvh-2.5rem)]'
                : isSupervisorRoute
                  ? 'h-[calc(100dvh-3.5rem)] overflow-hidden rounded-xl md:h-[calc(100dvh-2.5rem)]'
                : 'min-h-[calc(100dvh-3.5rem)] overflow-hidden rounded-xl md:min-h-[calc(100dvh-2.5rem)]'
            }
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat/supervisor" element={<SupervisorChat />} />
              <Route path="/workspace/files" element={<FileWorkspace />} />
              <Route path="/workspace/calendar" element={<CalendarPage />} />
              <Route path="/workspace/jira" element={<JiraPage />} />
              <Route path="/workspace/email" element={<EmailPage />} />
              <Route path="/debug/auth" element={<DebugAuthPage />} />
              <Route path="/monitoring/tokens" element={<TokenMonitorPage />} />
              <Route path="/settings" element={<SettingsPage />} />
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
            <Route path="/*" element={<SidebarProvider><Layout /></SidebarProvider>} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
