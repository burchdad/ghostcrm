// Suppress known harmless console warnings from browser extensions and third-party scripts
const originalError = console.error;
const originalWarn = console.warn;

console.error = function(...args) {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress React Developer Tools conflicts (browser extension issue)
    if (message.includes("registered with setOpenResourceHandler for all schemes")) {
      return;
    }
    // Suppress async listener timeout (browser extension issue)  
    if (message.includes("A listener indicated an asynchronous response by returning true")) {
      return;
    }
    // Suppress GoTrueClient multiple instances warning (expected with SSR)
    if (message.includes("Multiple GoTrueClient instances detected")) {
      return;
    }
  }
  originalError.apply(console, args);
};

console.warn = function(...args) {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress CSS preload warnings (handled by our optimization)
    if (message.includes("was preloaded using link preload but not used")) {
      return;
    }
  }
  originalWarn.apply(console, args);
};

export {};