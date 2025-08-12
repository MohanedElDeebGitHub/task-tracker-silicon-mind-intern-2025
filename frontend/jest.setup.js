// This file runs before Jest loads any test files
// Load polyfills first
require("./src/setupPolyfills.js");

// Set up Jest environment
const { configure } = require("@testing-library/dom");

configure({ testIdAttribute: "data-testid" });
