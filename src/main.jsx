import React from 'react'
import ReactDOM from 'react-dom/client'
import Popup from './Popup'
import './index.css'

// Make sure the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root')
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <Popup />
      </React.StrictMode>
    )
  } else {
    // Log error to extension's error reporting system instead of console
    chrome.runtime.sendMessage({
      type: 'ERROR',
      error: 'Root element not found in popup'
    });
  }
})
