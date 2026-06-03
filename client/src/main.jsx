import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import { AppContextProvider } from './context/AppContext.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if(!PUBLISHABLE_KEY) {
    throw new Error('Mssing publishable key')

}

createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <BrowserRouter>
    <AppContextProvider>
          <App />
    </AppContextProvider>
  </BrowserRouter>
  

  </ClerkProvider>,
 
)
