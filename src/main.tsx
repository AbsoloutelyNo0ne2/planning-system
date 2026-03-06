/**
 * @fileoverview Application Entry Point
 * 
 * PURPOSE:
 * Initializes React and renders the App component.
 * Sets up strict mode and error boundaries.
 * 
 * LAYER STATUS: Layer 1-3 Complete
 * NEXT: Layer 4 - Add store providers
 */

import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components';
import './styles/index.css';

// SECTION: Root Element
// Lines 16-25: Get root DOM node
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// SECTION: Render
// Lines 28-40: Mount React app
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// SECTION MAP:
// Lines 1-15: File header
// Lines 16-25: Root element setup
// Lines 28-40: React render
