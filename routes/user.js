const router = require("express").Router();
const { User } = require("../models");
const { signToken, authMiddleware } = require("../utils/auth");

// Get current authenticated user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.getOne(req.user.id);
    if (!user) return res.status(401).json({ message: "Token expired" });
    return res.status(200).json({ user });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET a user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.getOne(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "No user found with this id" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET all users (auth protected)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Register (Create new user)
router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = signToken(user);
    res.status(200).json({ token, user });  // 🔁 changed from userData → user
  } catch (err) {
    res.status(400).json(err);
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const user = await User.update(req.body, {
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({ message: "No user found with this id" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(400).json({ message: "Incorrect email or password" });
    }

    const validPassword = await user.checkPassword(req.body.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Incorrect email or password" });
    }

    const token = signToken(user);
    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Login error", error: err.message });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.status(204).end();
});

module.exports = router;
