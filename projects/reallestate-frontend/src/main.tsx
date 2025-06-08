import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/App.css'
import ErrorBoundary from './components/ErrorBoundary'

// Create the root element
const rootElement = document.getElementById('root') as HTMLElement

// Sanity check in case root is missing
if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html has a div with id="root".')
}

// Render the application
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
