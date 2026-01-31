// Lightweight console suppressions for known harmless warnings
const originalError = console.error;

console.error = function(...args) {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress known harmless warnings with quick string checks
    if (message.includes("setOpenResourceHandler") || 
        message.includes("A listener indicated an asynchronous response") ||
        message.includes("Multiple GoTrueClient instances detected")) {
      return;
    }
  }
  originalError.apply(console, args);
};

export {};