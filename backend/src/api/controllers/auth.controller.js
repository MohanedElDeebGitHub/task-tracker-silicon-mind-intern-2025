const { pool } = require("../../config/db.js");
const { findOne, create } = require("../../models/user.model.js");

async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUsers = await findOne(email, username);
    if (existingUsers) {
      return res.status(409).json({ error: "User already exists" });
    }

    const newUser = await create(username, email, password);
    return res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      created_at: newUser.created_at,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function login(req, res) {
  res.status(200).send("Login endpoint hit.");
}

module.exports = { register, login };
