import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import MobileHeader from './components/layout/MobileHeader'
import Dashboard from './pages/Dashboard'
import SupervisorChat from './pages/SupervisorChat'
import KnowledgeChat from './pages/KnowledgeChat'
import FileWorkspace from './pages/FileWorkspace'
import CalendarPage from './pages/CalendarPage'
import JiraPage from './pages/JiraPage'
import { SidebarProvider, useSidebar } from './context/SidebarContext'

function Layout() {
  const { open, close } = useSidebar()

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
        className="flex-1 min-h-screen overflow-hidden flex flex-col"
        style={{ marginLeft: 'var(--sidebar-width)' }}
      >
        {/* Mobile top header */}
        <MobileHeader />

        <div className="flex-1 p-3 md:p-5 pt-0 md:pt-5">
          <div className="min-h-[calc(100dvh-3.5rem)] md:min-h-[calc(100dvh-2.5rem)] panel overflow-hidden">
            <Routes>
              <Route path="/"                   element={<Dashboard />}        />
              <Route path="/chat/supervisor"    element={<SupervisorChat />}   />
              <Route path="/chat/knowledge"     element={<KnowledgeChat />}    />
              <Route path="/workspace/files"    element={<FileWorkspace />}    />
              <Route path="/workspace/calendar" element={<CalendarPage />}     />
              <Route path="/workspace/jira"     element={<JiraPage />}         />
              <Route path="*"                   element={<Dashboard />}        />
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
      <SidebarProvider>
        <Layout />
      </SidebarProvider>
    </BrowserRouter>
  )
}
