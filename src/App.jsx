import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import SupervisorChat from './pages/SupervisorChat'
import KnowledgeChat from './pages/KnowledgeChat'
import FileWorkspace from './pages/FileWorkspace'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen w-full">
        {/* Persistent sidebar */}
        <Sidebar />

        {/* Main content — offset by sidebar width */}
        <main
          className="flex-1 min-h-screen bg-surface overflow-hidden"
          style={{ marginLeft: 'var(--sidebar-width)' }}
        >
          <Routes>
            <Route path="/"                 element={<Dashboard />}        />
            <Route path="/chat/supervisor"  element={<SupervisorChat />}   />
            <Route path="/chat/knowledge"   element={<KnowledgeChat />}    />
            <Route path="/workspace/files"  element={<FileWorkspace />}    />
            {/* Fallback → Dashboard */}
            <Route path="*"                 element={<Dashboard />}        />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
