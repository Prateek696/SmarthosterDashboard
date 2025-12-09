
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import ReactGA from "react-ga4";
import ErrorBoundary from './components/ErrorBoundary';

// Suppress React DevTools Image constructor error (known issue with DevTools)
if (typeof window !== 'undefined') {
  // Catch and suppress React DevTools errors that don't affect app functionality
  window.addEventListener('error', (event) => {
    if (event.message?.includes("Failed to construct 'Image'") && 
        event.filename?.includes('installHook')) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  // Also suppress in console
  const originalError = window.console.error;
  window.console.error = (...args: any[]) => {
    const errorMessage = args[0]?.toString() || '';
    if (errorMessage.includes("Failed to construct 'Image'") && 
        (errorMessage.includes("installHook") || args.some(arg => arg?.stack?.includes('installHook')))) {
      return; // Suppress React DevTools error
    }
    originalError.apply(window.console, args);
  };
}

// Initialize Google Analytics
ReactGA.initialize("G-0LH860VBV3");

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
