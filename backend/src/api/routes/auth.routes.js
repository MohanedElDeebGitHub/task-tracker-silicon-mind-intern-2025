const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller.js");

router.post("/register", (req, res) => {
  authController.register(req, res);
});

router.post("/login", (req, res) => {
  authController.login(req, res);
});

module.exports = router;
