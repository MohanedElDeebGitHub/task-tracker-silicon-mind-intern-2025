const { findOneByEmail, findOneByUsername, create, getUser } = require("../../models/user.model.js");
const jwt = require("jsonwebtoken");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username); // 3-20 chars, alphanumeric + underscore
}

function isStrongPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password); // min 6 chars, letters & numbers
}

async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({ error: "Username must be 3–20 characters long and contain only letters, numbers, or underscores." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: "Password must be at least 6 characters long, at max 255 characters long and contain both letters and numbers." });
    }

    const existingUsername = await findOneByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ error: "Username already exists." });
    }

    const existingEmail = await findOneByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: "Email already used before." });
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
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const user = await getUser(email, password);
    if (user == null) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });

    res.status(200).json({
      message: "Login successful.",
      username: user.username,
      token: token,
    });
  } catch (error) {
    console.error("Error occurred during login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { register, login };
