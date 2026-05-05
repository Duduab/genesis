import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nProvider } from './i18n/I18nContext'
import { RouterProvider } from './router'
import { AuthProvider } from './auth/AuthContext'
import { ActiveOrganizationProvider } from './context/ActiveOrganizationContext'
import { ActiveBusinessProvider } from './context/ActiveBusinessContext'
import { ThemeProvider } from './theme/ThemeContext'
import { genesisQueryClient } from './queryClient'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={genesisQueryClient}>
      <ThemeProvider>
        <I18nProvider>
          <RouterProvider>
            <AuthProvider>
              <ActiveOrganizationProvider>
                <ActiveBusinessProvider>
                  <App />
                </ActiveBusinessProvider>
              </ActiveOrganizationProvider>
            </AuthProvider>
          </RouterProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
