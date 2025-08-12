// MUST BE FIRST: Load polyfills before any other imports
const { TextEncoder, TextDecoder } = require("util");
const { TransformStream } = require("web-streams-polyfill");

// Apply polyfills to all possible global contexts
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}
if (typeof global.TransformStream === "undefined") {
  global.TransformStream = TransformStream;
}

if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
  globalThis.TextDecoder = TextDecoder;
}
if (typeof globalThis.TransformStream === "undefined") {
  globalThis.TransformStream = TransformStream;
}

if (typeof window !== "undefined") {
  if (typeof window.TextEncoder === "undefined") {
    window.TextEncoder = TextEncoder;
  }
  if (typeof window.TextDecoder === "undefined") {
    window.TextDecoder = TextDecoder;
  }
  if (typeof window.TransformStream === "undefined") {
    window.TransformStream = TransformStream;
  }
}

// NOW it's safe to import modules that depend on TextEncoder
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Import MSW server for API mocking
import { server } from "./mocks/server";

// Establish API mocking before all tests.
beforeAll(() => {
  server.listen();
});

// Reset any request handlers that we may add during tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});

// Clean up after the tests are finished.
afterAll(() => {
  server.close();
});
