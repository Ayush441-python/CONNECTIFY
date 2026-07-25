import {ClerkProvider} from '@clerk/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider afterSignOutUrl="/">
<ErrorBoundary>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
</ClerkProvider>
  </StrictMode>
);