const jwt = require("jsonwebtoken");
const logger = require('../../config/logger.js');


function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(403)
      .json({ error: "A token is required for authentication" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    logger.error("Error occurred at auth middleware: ", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = verifyToken;
