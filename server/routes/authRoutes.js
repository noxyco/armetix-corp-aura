const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const User = require("../models/User");

// --- 1. Transparent Middleware (Does nothing but let you pass) ---
const authMiddleware = (req, res, next) => {
  next();
};

const isAdmin = (req, res, next) => {
  next();
};

// --- 2. Routes ---
router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/create-employee", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json({ message: "Utilisateur créé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
