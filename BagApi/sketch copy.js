let data;

async function setup() {
  createCanvas(600, 400);
  try {
    const response = await fetch("https://api.idd.bag.admin.ch/api/v1/data/sets");
    data = await response.json(); // <- dieser Schritt hat gefehlt
    console.log(data);
  } catch (err) {
    console.error("Fetch fehlgeschlagen:", err);
  }
}

function draw() {
  background(240);
  text(data ? "Daten geladen, siehe Konsole" : "lädt...", 20, 20);
}
