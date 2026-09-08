import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupClientApiInterceptor } from './services/clientApiInterceptor.js';

// Activate client API interceptor for static hosting environments (Netlify, Vercel, etc.)
setupClientApiInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

