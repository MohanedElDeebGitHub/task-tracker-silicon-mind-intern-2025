const bcrypt = require("bcrypt");

async function register(req, res) {
  res.status(200).send("Message from controller reg");
}

async function login(req, res) {
  res.status(200).send("Login endpoint hit.");
}

module.exports = { register, login };
