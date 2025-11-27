const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// Change this if you want a different port
const PORT = process.env.PORT || 3000;

// Path to the JSON data file
const DATA_FILE = path.join(__dirname, "test-data.json");

app.use(express.json());

// In-memory store
let guitars = [];
let nextId = 1;

// ---------- HELPER FUNCTIONS ----------

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
    }));

    nextId = guitars.length
      ? Math.max(...guitars.map((p) => p.id)) + 1
      : 1;

    console.log(`Loaded ${guitars.length} guitars from test-data.json`);
  } catch (err) {
    console.error('Error loading guitars from file:', err.message);
    players = [];
    nextId = 1;
  }
}

// Save current in-memory guitars back to JSON file
function saveGuitarsToFile() {
  // Don’t write to disk when running tests
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  try {
    const dataToSave = guitars.map(({ id, ...rest }) => rest);
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
    console.log('Guitars saved to test-data.json');
  } catch (err) {
    console.error('Error saving guitars to file:', err.message);
  }
}

// Initialize data at startup
loadGuitarsFromFile();

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

// OPTIONAL: Refresh data from test-data.json without restarting the server
app.post('/admin/refresh', (req, res) => {
  loadGuitarsFromFile();
  res.json({
    message: 'Guitars reloaded from test-data.json',
    count: guitars.length,
  });
});

// ---------- Start server (only if run directly) ----------
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Fender Guitars API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
