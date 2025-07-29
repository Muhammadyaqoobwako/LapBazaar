// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Redux setup
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';

// Error boundary
import ErrorBoundary from './components/ErrorBoundary';

// Crucial for user state management:
import { UserProvider } from './context/UserContext'; // <-- IMPORT THIS!

// Internationalization
import './i18n';

// Service worker for PWA
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // Adjusted path

// Analytics (optional)
import { Analytics } from '@vercel/analytics/react';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      {/* Redux Provider and PersistGate */}
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {/* UserProvider wraps the entire app, providing user context to all components */}
          <UserProvider>
            {/* BrowserRouter is inside UserProvider so App can use user context for routing decisions */}
            <BrowserRouter>
              <Analytics /> {/* Analytics can be inside or outside BrowserRouter */}
              <App />
            </BrowserRouter>
          </UserProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker for PWA
serviceWorkerRegistration.register();