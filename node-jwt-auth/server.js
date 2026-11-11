require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Root Directory & Status Route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to the Modular JWT Auth API!",
    endpoints: {
      register: "POST /api/register",
      login: "POST /api/login",
      refreshToken: "POST /api/refresh",
      logout: "POST /api/logout",
      forgotPassword: "POST /api/forgot-password",
      resetPassword: "POST /api/reset-password",
      protectedDashboard: "GET /api/protected-dashboard",
    },
  });
});

// Mount all authentication routes under the /api prefix
app.use("/api", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
