// client/src/config.js

// This detects if the browser is running on your local machine
const isLocalhost = window.location.hostname === "localhost" || 
                    window.location.hostname === "127.0.0.1";

export const API_URL = isLocalhost 
  ? "http://localhost:5000"                      // Use this when on your laptop
  : `http://${window.location.hostname}:5000`;   // Use this when on your phone