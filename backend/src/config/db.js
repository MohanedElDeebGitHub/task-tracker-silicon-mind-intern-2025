const { Pool } = require("pg");
const { Sequelize } = require("sequelize");
require("dotenv").config();

// This will use the DATABASE_URL from your .env file
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
  },
);

module.exports = { pool, sequelize };
