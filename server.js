
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.disable("x-powered-by");

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// Create the database directory if it does not exist.
const databaseDirectory = path.join(__dirname, "database");
fs.mkdirSync(databaseDirectory, { recursive: true });

// Initialize SQLite database.
const db = new Database(path.join(databaseDirectory, "users.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create the table first, including the name column.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migrate databases created by the earlier version.
const columns = db.prepare("PRAGMA table_info(users)").all();
const hasNameColumn = columns.some((column) => column.name === "name");

if (!hasNameColumn) {
  db.exec("ALTER TABLE users ADD COLUMN name TEXT NOT NULL DEFAULT ''");
}

console.log("SQLite database initialized.");

// Require a sufficiently long secret in .env.
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  console.error(
    "Missing or weak SESSION_SECRET. Configure it in your .env file."
  );
  process.exit(1);
}

// Session configuration.
app.use(
  session({
    name: "auth.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 1000
    }
  })
);

// Limit repeated authentication attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

// Serve frontend files.
app.use(express.static(path.join(__dirname, "public")));

// Generate a CSRF token for the current session.
app.get("/api/csrf-token", (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }

  res.json({ csrfToken: req.session.csrfToken });
});

// Validate CSRF tokens on requests that change data.
function requireCsrf(req, res, next) {
  const token = req.get("X-CSRF-Token");
  const expected = req.session.csrfToken;

  if (typeof token !== "string" || typeof expected !== "string") {
    return res.status(403).json({
      error: "Request could not be verified. Refresh the page and try again."
    });
  }

  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);

  if (
    tokenBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(tokenBuffer, expectedBuffer)
  ) {
    return res.status(403).json({
      error: "Request could not be verified. Refresh the page and try again."
    });
  }

  next();
}

function isValidEmail(email) {
  return (
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

// Regenerate the session after successful authentication.
function createUserSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) return reject(error);

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email
      };

      // New token for the new session.
      req.session.csrfToken = crypto.randomBytes(32).toString("hex");

      req.session.save((saveError) => {
        if (saveError) return reject(saveError);
        resolve();
      });
    });
  });
}

// Health check.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// REGISTER
app.post("/api/register", authLimiter, requireCsrf, async (req, res) => {
  const { name, email, password, confirmPassword } = req.body || {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return res.status(400).json({
      error: "Please complete all fields."
    });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (cleanName.length < 2 || cleanName.length > 80) {
    return res.status(400).json({
      error: "Name must be between 2 and 80 characters."
    });
  }

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({
      error: "Please enter a valid email address."
    });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      error:
        "Password needs at least 8 characters, a number and a special character."
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      error: "Passwords do not match."
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash)
      VALUES (?, ?, ?)
    `).run(cleanName, cleanEmail, passwordHash);

    const user = {
      id: result.lastInsertRowid,
      name: cleanName,
      email: cleanEmail
    };

    await createUserSession(req, user);

    return res.status(201).json({
      message: "Account created successfully!"
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        error: "An account with this email already exists. Please log in."
      });
    }

    console.error("Registration failed:", error.message);

    return res.status(500).json({
      error: "Could not create your account. Please try again."
    });
  }
});

// LOGIN
app.post("/api/login", authLimiter, requireCsrf, async (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({
      error: "Please enter your email and password."
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({
      error: "Please enter a valid email and password."
    });
  }

  try {
    const user = db.prepare(`
      SELECT id, name, email, password_hash
      FROM users
      WHERE email = ?
    `).get(cleanEmail);

    if (
      !user ||
      !(await bcrypt.compare(password, user ? user.password_hash : ""))
    ) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    await createUserSession(req, user);

    return res.json({ message: "Login successful!" });
  } catch (error) {
    console.error("Login failed:", error.message);

    return res.status(500).json({
      error: "Could not log in right now. Please try again."
    });
  }
});

// Get the logged-in user's information.
app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      error: "Please log in first."
    });
  }

  res.json({ user: req.session.user });
});

// LOGOUT
app.post("/api/logout", requireCsrf, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("auth.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    });

    res.json({ message: "Logged out successfully." });
  });
});

// Return JSON errors for API requests, including malformed JSON.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  console.error("Request error:", error.message);

  if (req.path.startsWith("/api/")) {
    const status = error.status || error.statusCode || 500;

    return res.status(status >= 400 && status < 600 ? status : 500).json({
      error:
        status === 413
          ? "Request is too large."
          : status === 400
            ? "Invalid request. Please check your input."
            : "An unexpected server error occurred."
    });
  }

  res.status(500).send("An unexpected server error occurred.");
});

// JSON response for unknown routes.
app.use((req, res) => {
  res.status(404).json({ error: "Resource not found." });
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
