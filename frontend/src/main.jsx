import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuditProvider from './Context/AuditProvider.jsx'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <AuditProvider>
    <App />
   <ToastContainer
    position="top-center"
    autoClose={2000}
    hideProgressBar={true}
    closeOnClick
    pauseOnHover
    toastClassName="small-toast"
    bodyClassName="small-toast-body"
/>
    </AuditProvider>
  </StrictMode>,
)
