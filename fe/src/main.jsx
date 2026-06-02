import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AppToaster } from '@/components/ui'
import { ensureProdEnvironmentOnStartup } from './services/api'
import './styles/design-tokens.css'
import './index.css'

ensureProdEnvironmentOnStartup()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppToaster />
    <App />
  </React.StrictMode>,
)
