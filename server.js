require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

// ======================
// SINGLE SECRET (IMPORTANT)
// ======================
const SECRET = process.env.JWT_SECRET || "supersecret";

// ======================
// DATABASE
// ======================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ======================
// AUTH MIDDLEWARE (FIXED)
// ======================
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Invalid token format" });
  }

  const token = parts[1];

  try {
    req.user = jwt.verify(token, SECRET); // 🔥 SAME SECRET USED HERE
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// ======================
// REGISTER
// ======================
app.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1,$2,$3) RETURNING *",
      [email, hashed, role]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// LOGIN
// ======================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET // 🔥 SAME SECRET
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// CREATE QUIZ
// ======================
app.post("/quiz", auth, async (req, res) => {
  try {
    const { title, questions } = req.body;

    const result = await pool.query(
      "INSERT INTO quizzes (title, questions) VALUES ($1,$2) RETURNING *",
      [title, JSON.stringify(questions)]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// GET QUIZZES
// ======================
app.get("/quiz", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM quizzes");

    res.json(
      result.rows.map(q => ({
        ...q,
        questions: JSON.parse(q.questions)
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// SUBMIT QUIZ
// ======================
app.post("/submit", auth, async (req, res) => {
  try {
    const { quizId, score } = req.body;

    await pool.query(
      "INSERT INTO submissions (userid, quizid, score) VALUES ($1,$2,$3)",
      [req.user.id, quizId, score]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// START SERVER
// ======================
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
app.post("/quiz", authenticateToken, async (req, res) => {
  const { title, questions } = req.body;

  const result = await pool.query(
    `INSERT INTO quizzes (id, teacher_id, title, questions)
     VALUES (gen_random_uuid(), $1, $2, $3)
     RETURNING *`,
    [req.user.id, title, JSON.stringify(questions)]
  );

  res.json(result.rows[0]);
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
import dotenv from "dotenv";
dotenv.config();