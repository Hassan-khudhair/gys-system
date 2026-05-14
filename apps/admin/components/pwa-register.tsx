"use client";

import { useEffect } from "react";

/**
 * Registers the service worker after the page has fully loaded so it
 * doesn't compete with critical resources during hydration.
 *
 * On update detection the new SW is told to skip waiting immediately,
 * then the page reloads once to pick up the fresh version.
 */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const run = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          // Never serve the SW file from the HTTP cache — always check
          // the network so users get SW updates on every new deploy.
          updateViaCache: "none",
        });

        // When the browser detects a new SW version, activate it right away.
        reg.addEventListener("updatefound", () => {
          const next = reg.installing;
          if (!next) return;

          next.addEventListener("statechange", () => {
            if (next.state === "installed" && navigator.serviceWorker.controller) {
              // New SW is installed and an old one is controlling the page.
              // Signal the new SW to skip its waiting phase.
              next.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        // When the controlling SW changes (new one took over), reload once
        // so the page is served by the fresh SW.
        let reloading = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!reloading) {
            reloading = true;
            window.location.reload();
          }
        });
      } catch {
        // Registration failure is expected in plain-HTTP dev environments
        // (browsers require HTTPS for SW except on localhost).
        // Do nothing — the app works without a SW.
      }
    };

    // Defer until the page is idle so SW registration doesn't slow
    // down the initial paint or React hydration.
    if (document.readyState === "complete") {
      run();
    } else {
      window.addEventListener("load", run, { once: true });
    }
  }, []);

  return null;
}
