const { pool } = require("../config/db.js");
const bcrypt = require("bcrypt");

// A function to find a user by their email or username (used for registration and login)
async function findOneByEmailUsername(email, username) {
  const query = "SELECT * FROM users WHERE email = $1 OR username = $2";
  const { rows } = await pool.query(query, [email, username]);

  return rows[0];
}

async function findOneByEmail(email) {
  const query = "SELECT * FROM users WHERE email = $1";
  const { rows } = await pool.query(query, [email]);

  return rows[0];
}

async function findOneByUsername(username) {
  const query = "SELECT * FROM users WHERE username = $1";
  const { rows } = await pool.query(query, [username]);

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

async function getUser(email, password) {
  const userQuery = "SELECT * FROM users WHERE email = $1";
  const { rows } = await pool.query(userQuery, [email]);
  const user = rows[0];

  if (!user) {
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return null;
  }

  delete user.password;
  return user;
}

module.exports = {
  findOneByEmail,
  findOneByUsername,
  create,
  getUser,
};
