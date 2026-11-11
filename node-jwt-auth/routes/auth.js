const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Access secret keys from process.env
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// In-memory databases
const users = [];
let refreshTokens = [];

// --- HELPER FUNCTIONS ---
const generateAccessToken = (user) => {
  return jwt.sign({ username: user.username }, JWT_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ username: user.username }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Invalid or expired access token." });
    }

    req.user = decodedUser;
    next();
  });
};

// --- ROUTES ---

// 1. REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });

    res
      .status(201)
      .json({ message: `User @${username} registered successfully!` });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens.push(refreshToken);

    res.json({
      message: `User @${username} logged in successfully!`,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. REFRESH TOKEN
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res
      .status(403)
      .json({ error: "Invalid refresh token (not found or logged out)" });
  }

  jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decodedUser) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Refresh token expired or invalid" });
    }

    const newAccessToken = generateAccessToken({
      username: decodedUser.username,
    });
    res.json({ accessToken: newAccessToken });
  });
});

// 4. LOGOUT
router.post("/logout", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token required" });
  }

  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.json({ message: "Logged out successfully!" });
});

// 5. FORGOT PASSWORD
router.post("/forgot-password", (req, res) => {
  const { username } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const secret = JWT_SECRET + user.password;
  const resetToken = jwt.sign({ username: user.username }, secret, {
    expiresIn: "10m",
  });

  res.json({
    message:
      "Password reset token generated successfully (Valid for 10 minutes).",
    resetToken,
  });
});

// 6. RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { username, resetToken, newPassword } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const secret = JWT_SECRET + user.password;
    jwt.verify(resetToken, secret);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    refreshTokens = [];

    res.json({
      message:
        "Password has been reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired password reset token." });
  }
});

// 7. PROTECTED DASHBOARD
router.get("/protected-dashboard", authenticateToken, (req, res) => {
  res.json({
    message: "Welcome to the secure dashboard!",
    user: req.user,
  });
});

module.exports = router;
