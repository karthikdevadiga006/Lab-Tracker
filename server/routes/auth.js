const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SECRET = process.env.JWT_SECRET || "labsecret123";

// Register (run once to create teacher account)
router.post("/register", async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: "User already exists" });
    const user = await User.create({ username, password, isAdmin: isAdmin || false });
    res.json({ message: "Teacher account created", id: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "7d" });
    res.json({ token, username: user.username, isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
