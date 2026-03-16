import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ensureProdEnvironmentOnStartup } from './services/api'
import './index.css'

ensureProdEnvironmentOnStartup()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
