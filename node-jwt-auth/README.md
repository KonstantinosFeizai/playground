# Node.js Modular JWT Authentication API

A robust, production-pattern backend API built with **Node.js** and **Express**, featuring a complete JSON Web Token (JWT) authentication lifecycle. Designed with clean separation of concerns, this project serves as a solid modular template for backend applications.

# Features

- User Registration & Password Hashing : hashes passwords using bcryptjs
- Dual-Token Authentication System :
  - Access Tokens (Short-lived, 15m)
  - Refresh Tokens (Long-lived, 7d)
- Session Revocation (Logout) : Deletes active refresh tokens from server memory.
- Secure Password Reset
- Protected Middleware : Custom express middleware that intercepts requests and verifies `Authorization : Bearer <token> ` headers.

# Tech Stack

- Runtime : Node.js
- Framework : Express.js
- Authentication : jsonwebtoken (JWT)
- Security : bcryptjs
- Env management : dotenv

# API Endpoints

- Base url : http://localhost:3000

1. **Register:** Send a `POST` request to `http://localhost:3000/api/register` with a JSON body (`username`, `password`) to create a user.
2. **Login:** Send a `POST` request to `http://localhost:3000/api/login` with those credentials to receive your `accessToken` and `refreshToken`.
3. **Access Protected Route:** Send a `GET` request to `http://localhost:3000/api/protected-dashboard` with your `accessToken` in the headers:
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer <your_access_token>`
4. **Refresh Token:** When your access token expires, send a `POST` request to `http://localhost:3000/api/refresh` with `{ "refreshToken": "<your_refresh_token>" }` to get a new access token.
5. **Forgot Password:** Send a `POST` request to `http://localhost:3000/api/forgot-password` with `{ "username": "your_username" }` to generate and view your `resetToken`.
6. **Reset Password:** Send a `POST` request to `http://localhost:3000/api/reset-password` with `{ "username": "your_username", "resetToken": "<reset_token>", "newPassword": "new_password" }` to update your password.
7. **Logout:** Send a `POST` request to `http://localhost:3000/api/logout` with `{ "refreshToken": "<your_refresh_token>" }` to revoke your session.
