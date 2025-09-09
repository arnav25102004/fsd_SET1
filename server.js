require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ✅ Connect to DB
db.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to DB:", err);
    return;
  }
  console.log("✅ Connected to MySQL database.");
});


//app.get("/", (req, res) => {
  //res.send("🎬 Movie Catalog API is running!");
//});


app.get("/movies", (req, res) => {
  db.query("SELECT * FROM movies", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


app.post("/movies", (req, res) => {
  const { title, director, genre, release_year, rating } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  db.query(
    "INSERT INTO movies (title, director, genre, release_year, rating) VALUES (?, ?, ?, ?, ?)",
    [title, director, genre, release_year, rating],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, ...req.body });
    }
  );
});


app.put("/movies/:id", (req, res) => {
  const { id } = req.params;
  const { title, director, genre, release_year, rating } = req.body;

  db.query(
    "UPDATE movies SET title=?, director=?, genre=?, release_year=?, rating=? WHERE id=?",
    [title, director, genre, release_year, rating, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Movie updated successfully" });
    }
  );
});


// ✅ DELETE movie
app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM movies WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Movie deleted successfully" });
  });
});

app.use(express.static("public"));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});