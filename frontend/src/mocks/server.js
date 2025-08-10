import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// This configures a request mocking server with the given request handlers for Node.js environment (tests)
export const server = setupServer(...handlers);

// Export for testing utilities
export { handlers } from './handlers';