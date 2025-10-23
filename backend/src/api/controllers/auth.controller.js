const logger = require("../../config/logger.js");
const { body, validationResult } = require("express-validator");

const {
  findOneByEmail,
  findOneByUsername,
  create,
  getUser,
} = require("../../models/user.model.js");
const jwt = require("jsonwebtoken");

// ------------------ VALIDATION MIDDLEWARES ------------------

// Register validation
const validateRegister = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required.")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be 3–20 characters long.")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, or underscores."),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format."),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6, max: 255 })
    .withMessage("Password must be at least 6 and at most 255 characters long.")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/)
    .withMessage("Password must contain both letters and numbers."),
];

// Login validation
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email format."),
  body("password").notEmpty().withMessage("Password is required."),
];

// ------------------ HELPERS ------------------
function checkValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  return null;
}

// ------------------ CONTROLLERS ------------------
async function register(req, res) {
  try {
    const validationError = checkValidation(req, res);
    if (validationError) return validationError;

    const { username, email, password } = req.body;

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
    logger.error("Error during registration:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function login(req, res) {
  try {
    const validationError = checkValidation(req, res);
    if (validationError) return validationError;

    const { email, password } = req.body;

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
    logger.error("Error occurred during login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { register, login, validateRegister, validateLogin };
