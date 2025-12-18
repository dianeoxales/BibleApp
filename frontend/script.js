const randomBtn = document.getElementById("getVerseBtn");
const searchBtn = document.getElementById("searchBtn");
const verseInput = document.getElementById("verseInput");

const reference = document.getElementById("reference");
const verseText = document.getElementById("verseText");

const saveBtn = document.getElementById("saveBtn");
const favouritesDiv = document.getElementById("favourites");

// RANDOM VERSE
randomBtn.addEventListener("click", async () => {
  const response = await fetch("/verse");
  const data = await response.json();

  reference.innerText = data.reference;
  verseText.innerText = data.text;
});

// SEARCH VERSE
searchBtn.addEventListener("click", async () => {
  const query = verseInput.value.trim();

  if (!query) {
    verseText.innerText = "Please enter a verse (e.g. John 3:16)";
    return;
  }

  try {
    const response = await fetch(`/search?ref=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.error) {
      reference.innerText = "Not found";
      verseText.innerText = data.error;
    } else {
      reference.innerText = data.reference;
      verseText.innerText = data.text;
    }
  } catch (error) {
    verseText.innerText = "Error searching verse.";
  }
});

saveBtn.addEventListener("click", async () => {
  const referenceText = reference.innerText;
  const verseTextValue = verseText.innerText;

  if (!referenceText || referenceText === "No reference") return;

  await fetch("/favourites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reference: referenceText,
      text: verseTextValue
    })
  });

  loadFavourites();
});

async function loadFavourites() {
  const response = await fetch("/favourites");
  const data = await response.json();

  favouritesDiv.innerHTML = "";

  data.forEach(v => {
    const div = document.createElement("div");
    div.className = "favVerse";

    const title = document.createElement("strong");
    title.innerText = v.reference;

    const text = document.createElement("p");
    text.innerText = v.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "❌ Delete";
    deleteBtn.style.marginTop = "5px";

    deleteBtn.addEventListener("click", async () => {
      await fetch("/favourites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: v.reference })
      });

      loadFavourites(); // refresh list
    });

    div.appendChild(title);
    div.appendChild(text);
    div.appendChild(deleteBtn);
    favouritesDiv.appendChild(div);
  });
}
loadFavourites();
