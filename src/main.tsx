import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from '@/Context/AuthProvider';
import { QueryProvider } from './lib/react-query/QueryProvider';
import './index.css';
import { ThemeProvider } from 'next-themes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>
);