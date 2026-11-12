import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/manrope';
import '@fontsource-variable/imbue/opsz.css';
import './styles.css';
import App from './App';

// Restore scroll position on refresh: the sequence reconstructs its state from it.
if ('scrollRestoration' in history) history.scrollRestoration = 'auto';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
