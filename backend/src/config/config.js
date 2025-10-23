require("dotenv").config();

module.exports = {
  development: {
    username: "postgres",
    password: "password",
    database: "task_tracker_db",
    host: "db", // must match the service name in docker-compose
    dialect: "postgres",
  },

  test: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
  },
};
