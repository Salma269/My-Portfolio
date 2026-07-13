import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './features/i18n/config';
import { App } from './app/App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
