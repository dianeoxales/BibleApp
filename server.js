const express = require("express"); // import express library (used to create server)
const cors = require("cors"); // import CORS (cross origin resource sharing) so frontent and backend can talk
const path = require("path"); // help safely build file paths
const fs = require("fs"); // read and write onto files 


const app = express(); // creates express application which creates the server
app.use(cors()); // enable CORS for incoming requests
app.use(express.json()); // allow the backend to read JSON data from request bodies 

// Serve all files in frontend folder as static files 
app.use(express.static(path.join(__dirname, "../frontend")));

// data for random verses 
const books = ["John", "Psalms", "Proverbs", "Romans", "Matthew"];
const chapters = {
  John: 3,
  Psalms: 23,
  Proverbs: 3,
  Romans: 8,
  Matthew: 5
}; // maps each book to a specific chapter 

app.get("/verse", async (req, res) => { // defines a GET Api endpoint at /verse
  try {
    const book = books[Math.floor(Math.random() * books.length)]; // pick random book 
    const chapter = chapters[book]; // gets the chapter number that book belongs to
    const verseNumber = Math.floor(Math.random() * 5) + 1; // picks random verse between 1 and 5

    const url = `https://bible-api.com/${book}%20${chapter}:${verseNumber}`; // the url for the external bible API
    const response = await fetch(url); // send request to bible API and you are not a client
    const data = await response.json(); // converts into Javascript

    res.json({
      reference: data.reference,
      text: data.text
    }); // send data back to the front end using json
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not get verse" });
  }
});
// reads the verse reference from the URL query string
app.get("/search", async (req, res) => {
  try {
    const ref = req.query.ref;

    if (!ref) { // validates input 
      return res.status(400).json({ error: "No verse provided" });
    }

    const url = `https://bible-api.com/${encodeURIComponent(ref)}`; // encodes the verse so no spaces /symbols dont break the url
    const response = await fetch(url); // call the bible API and convert its response
    const data = await response.json();

    if (data.error) {
      return res.status(404).json({ error: "Verse not found" });
    } // handles case where verse doesnt exist

    res.json({
      reference: data.reference,
      text: data.text
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to search verse" });
  }
});

app.post("/favourites", (req, res) => {
  const { reference, text } = req.body;

  if (!reference || !text) {
    return res.status(400).json({ error: "Invalid verse data" });
  }

  const favourites = JSON.parse(
    fs.readFileSync("favourites.json", "utf8")
  );

  // Prevent duplicates
  const exists = favourites.some(v => v.reference === reference);
  if (exists) {
    return res.json({ message: "Already saved" });
  }

  favourites.push({ reference, text });

  fs.writeFileSync("favourites.json", JSON.stringify(favourites, null, 2));

  res.json({ message: "Saved to favourites" });
});

app.get("/favourites", (req, res) => {
  const favourites = JSON.parse(
    fs.readFileSync("favourites.json", "utf8")
  );
  res.json(favourites);
});

app.delete("/favourites", (req, res) => {
  const { reference } = req.body;

  if (!reference) {
    return res.status(400).json({ error: "Reference required" });
  }

  const favourites = JSON.parse(
    fs.readFileSync("favourites.json", "utf8")
  );

  const updatedFavourites = favourites.filter(
    v => v.reference !== reference
  );

  fs.writeFileSync(
    "favourites.json",
    JSON.stringify(updatedFavourites, null, 2)
  );

  res.json({ message: "Favourite deleted" });
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});