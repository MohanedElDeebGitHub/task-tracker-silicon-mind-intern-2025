// Polyfill TextEncoder and TextDecoder for tests
const { TextEncoder, TextDecoder } = require("util");

// Apply polyfills to all possible global contexts
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}

if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
  globalThis.TextDecoder = TextDecoder;
}

if (typeof window !== "undefined") {
  if (typeof window.TextEncoder === "undefined") {
    window.TextEncoder = TextEncoder;
  }
  if (typeof window.TextDecoder === "undefined") {
    window.TextDecoder = TextDecoder;
  }
}

// Additional polyfills can be added here if needed
