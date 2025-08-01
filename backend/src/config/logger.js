const winston = require('winston');

// Define the format for the logs
const logFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = winston.createLogger({
  level: 'info', // Log only messages with level 'info' and above
  format: winston.format.combine(
    winston.format.colorize(), // Add color to the log levels
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // Log the full stack trace on errors
    logFormat
  ),
  transports: [
    // - Write all logs with level `info` and below to the console
    new winston.transports.Console(),
  ],
});

module.exports = logger;