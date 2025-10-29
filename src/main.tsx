
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(<App />);

  // Register service worker for PWA functionality
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope);
          
          // Check for updates when page becomes visible (better for battery life)
          document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
              registration.update();
            }
          });
          
          // Also check periodically but less aggressively (every 30 minutes)
          setInterval(() => {
            registration.update();
          }, 30 * 60 * 1000); // 30 minutes
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
  