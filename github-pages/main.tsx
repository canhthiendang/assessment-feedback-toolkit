import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Home from '../app/page';
import '../app/globals.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('The toolkit could not start because its page container is missing.');
}

createRoot(root).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
