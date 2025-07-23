const { pool } = require("../config/db.js");
const bcrypt = require("bcrypt");

// A function to find a user by their email or username (used for registration and login)
async function findOne(email, username) {
  const query = "SELECT * FROM users WHERE email = $1 OR username = $2";
  const { rows } = await pool.query(query, [email, username]);

  return rows[0];
}

async function create(username, email, password) {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const query =
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at";
  const { rows } = await pool.query(query, [username, email, hashedPassword]);

  return rows[0]; // Returns the newly created user object
}

module.exports = {
  findOne,
  create,
};
