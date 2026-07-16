
import React from 'react';
import ReactDOM from 'react-dom/client';
import { nativeService } from './services/nativeService';
import App from './App';
import './index.css';

nativeService.initialize();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
