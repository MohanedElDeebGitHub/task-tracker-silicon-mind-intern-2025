        module.exports = {
          testEnvironment: 'jest-fixed-jsdom',
          setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
          moduleNameMapper: {
            "^react-router$": "<rootDir>/node_modules/react-router"
          }
        };