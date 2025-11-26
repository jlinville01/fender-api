// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Path to the JSON data file
const DATA_FILE = path.join(__dirname, "test-data.json");

// In-memory store
let guitars = [];
let nextId = 1;

// ---------- Helper functions ----------

// Load guitars from JSON file into memory
function loadGuitarsFromFile() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);

    // Normalize and add IDs to each guitar
    guitars = data.map((guitar, index) => ({
      id: index + 1,
      // Keep all original properties from JSON
      ...guitar,
      // Add a neckLength field (not in original JSON) – you can update later via PUT
      neckLength: guitar.neckLength || null,
    }));

    // Set nextId to max existing id + 1
    nextId = guitars.reduce((max, g) => Math.max(max, g.id), 0) + 1;

    console.log(`Loaded ${guitars.length} guitars from test-data.json`);
  } catch (err) {
    console.error("Error loading data from test-data.json:", err);
    guitars = [];
    nextId = 1;
  }
}

// Save current in-memory guitars back to JSON file
function saveGuitarsToFile() {
  try {
    // Strip out id & neckLength if you only want original fields in the file:
    // Here we keep everything, including id & neckLength.
    fs.writeFileSync(DATA_FILE, JSON.stringify(guitars, null, 2), "utf-8");
    console.log("Saved guitars to test-data.json");
  } catch (err) {
    console.error("Error saving data to test-data.json:", err);
  }
}

// Initialize data at startup
loadGuitarsFromFile();

// Middleware to parse JSON bodies
app.use(express.json());

// ---------- ROUTES ----------

// Simple health-check
app.get("/", (req, res) => {
  res.send("Fender Guitars API is running 🎸");
});

// GET /guitars – return all guitars
app.get("/guitars", (req, res) => {
  res.json(guitars);
});

// GET /guitars/:id – return one guitar by id
app.get("/guitars/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const guitar = guitars.find((g) => g.id === id);

  if (!guitar) {
    return res.status(404).json({ error: "Guitar not found" });
  }

  res.json(guitar);
});

// POST /guitars – add new guitar
// Required params in JSON body:
//   name          (guitar name)
//   neck          (neck material)
//   neckLength    (neck length)
//   body          (body material)
//   pickups       (pickups)
app.post("/guitars", (req, res) => {
  const { name, neck, neckLength, body, pickups } = req.body;

  if (!name || !neck || !neckLength || !body || !pickups) {
    return res.status(400).json({
      error:
        "Missing required fields. Required: name, neck, neckLength, body, pickups",
    });
  }

  const newGuitar = {
    id: nextId++,
    name,
    neck,
    neckLength,
    body,
    pickups,
  };

  guitars.push(newGuitar);
  saveGuitarsToFile();

  res.status(201).json(newGuitar);
});

// PUT /guitars/:id – edit an existing guitar
// You can send any subset of fields: name, neck, neckLength, body, pickups
app.put("/guitars/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const guitar = guitars.find((g) => g.id === id);

  if (!guitar) {
    return res.status(404).json({ error: "Guitar not found" });
  }

  const { name, neck, neckLength, body, pickups } = req.body;

  if (name !== undefined) guitar.name = name;
  if (neck !== undefined) guitar.neck = neck;
  if (neckLength !== undefined) guitar.neckLength = neckLength;
  if (body !== undefined) guitar.body = body;
  if (pickups !== undefined) guitar.pickups = pickups;

  saveGuitarsToFile();

  res.json(guitar);
});

// DELETE /guitars/:id – delete a guitar
app.delete("/guitars/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = guitars.findIndex((g) => g.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Guitar not found" });
  }

  const deleted = guitars.splice(index, 1)[0];
  saveGuitarsToFile();

  res.json({ message: "Guitar deleted", guitar: deleted });
});

// POST /refresh – reload data from test-data.json (discard in-memory changes)
app.post("/refresh", (req, res) => {
  loadGuitarsFromFile();
  res.json({
    message: "Data reloaded from test-data.json",
    count: guitars.length,
  });
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`Fender Guitars API listening on http://localhost:${PORT}`);
});
