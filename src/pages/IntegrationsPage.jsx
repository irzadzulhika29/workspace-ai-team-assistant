import React, { useState, useEffect } from 'react'
import { FileSpreadsheet, Calendar, FileText, LogIn, CheckCircle2, X, Loader2 } from 'lucide-react'

export default function IntegrationsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedIntegration, setSelectedIntegration] = useState(null)
  const [docs, setDocs] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/google/status', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.connected) {
        setUser({
          name: data.name,
          email: data.email,
          picture: data.picture
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/api/auth/google'
  }

  const handleConfigure = async (integrationId) => {
    setSelectedIntegration(integrationId)
    setLoadingDocs(true)
    
    try {
      const response = await fetch(`http://localhost:3001/api/google/${integrationId}`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.files) {
        setDocs(data.files)
      }
    } catch (error) {
      console.error(`Error fetching ${integrationId}:`, error)
    } finally {
      setLoadingDocs(false)
    }
  }

  const closeModal = () => {
    setSelectedIntegration(null)
    setDocs([])
  }

  const integrations = [
    {
      id: 'sheets',
      name: 'Google Sheets',
      icon: FileSpreadsheet,
      description: 'Connect and manage your spreadsheets',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      status: 'available'
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      icon: Calendar,
      description: 'Sync your calendar events',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      status: 'available'
    },
    {
      id: 'docs',
      name: 'Google Docs',
      icon: FileText,
      description: 'Access and edit your documents',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      status: 'available'
    }
  ]

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-600 mt-1">
          Connect your Google services to enhance your workspace
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Auth Status */}
        {!user ? (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <LogIn className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sign in with Google
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your Google account to access Sheets, Calendar, and Docs
                </p>
                <button
                  onClick={handleGoogleLogin}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in with Google
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Connected as {user.name}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
            </div>
          </div>
        )}

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon
            return (
              <div
                key={integration.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 ${integration.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${integration.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {integration.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {integration.description}
                </p>
                <button
                  disabled={!user}
                  onClick={() => handleConfigure(integration.id)}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    user
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {user ? 'Configure' : 'Sign in required'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal for showing docs/sheets/calendar */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedIntegration === 'docs' && 'Google Docs'}
                {selectedIntegration === 'sheets' && 'Google Sheets'}
                {selectedIntegration === 'calendar' && 'Google Calendar'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingDocs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : docs.length > 0 ? (
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                        {doc.modifiedTime && (
                          <p className="text-sm text-gray-500">
                            Modified: {new Date(doc.modifiedTime).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <a
                        href={doc.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Open
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No files found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
