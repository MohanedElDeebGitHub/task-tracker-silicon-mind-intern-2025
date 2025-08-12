// Mock fetch to use our MSW handlers logic without MSW server
import { handlers } from "./handlers";

// Extract handler logic for direct use in tests
export const mockFetch = (url, options = {}) => {
  // Find matching handler
  const method = options.method || "GET";
  const matchingHandler = handlers.find((handler) => {
    const handlerMethod = handler.info.method.toUpperCase();
    const handlerUrl = handler.info.path;

    if (handlerMethod !== method) return false;

    // Simple URL matching (can be enhanced for path parameters)
    if (handlerUrl.includes(":")) {
      // Handle path parameters like /api/tasks/:id
      const pattern = handlerUrl.replace(/:[^/]+/g, "[^/]+");
      const regex = new RegExp(pattern);
      return regex.test(url);
    }

    return url.includes(handlerUrl);
  });

  if (!matchingHandler) {
    return Promise.resolve({
      status: 404,
      json: () => Promise.resolve({ error: "Not found" }),
    });
  }

  // Create mock request object
  const mockRequest = {
    url,
    method,
    headers: {
      get: (name) => options.headers?.[name] || null,
    },
    json: () =>
      options.body
        ? Promise.resolve(JSON.parse(options.body))
        : Promise.resolve({}),
  };

  // Create mock params for path parameters
  const mockParams = {};
  if (matchingHandler.info.path.includes(":")) {
    const pathParts = matchingHandler.info.path.split("/");
    const urlParts = new URL(url).pathname.split("/");

    pathParts.forEach((part, index) => {
      if (part.startsWith(":")) {
        const paramName = part.slice(1);
        mockParams[paramName] = urlParts[index];
      }
    });
  }

  // Call the handler
  try {
    const result = matchingHandler.resolver({
      request: mockRequest,
      params: mockParams,
    });

    // Handle HttpResponse
    if (result && result.status !== undefined) {
      return Promise.resolve({
        status: result.status,
        json: () => Promise.resolve(result.body),
      });
    }

    return result;
  } catch (error) {
    return Promise.resolve({
      status: 500,
      json: () => Promise.resolve({ error: "Internal server error" }),
    });
  }
};

// Mock fetch globally for tests
export const setupMockFetch = () => {
  global.fetch = jest.fn(mockFetch);
};

export const restoreFetch = () => {
  if (global.fetch && global.fetch.mockRestore) {
    global.fetch.mockRestore();
  }
};
