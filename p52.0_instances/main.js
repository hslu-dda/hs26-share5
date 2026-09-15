// ---------------------------------------------------------------
// main.js
// Zentrale Datei: hält die gemeinsamen Daten und startet alle
// drei p5-Instanzen. Jede Instanz bekommt ihre eigene Zeichenlogik
// aus sketch1.js / sketch2.js / sketch3.js.
// ---------------------------------------------------------------

// Gemeinsame Daten, auf die alle drei Sketches lesend zugreifen.
// Weil draw() in p5 laufend neu zeichnet, reicht es, dieses Array
// neu zu befüllen -- die Grafiken aktualisieren sich im nächsten
// Frame von selbst.
let sharedData = [];

// Erzeugt n Zufallswerte zwischen 0 und 100
function generateRandomData(n = 20) {
  return Array.from({ length: n }, () => Math.random() * 100);
}

// -----------------------------------------------------------
// Beispiel für "echte" Daten statt Zufallszahlen (auskommentiert):
// so wie in eurem CSV-Beispiel könnt ihr sharedData stattdessen
// asynchron aus einer CSV-Datei laden.
//
// async function loadRealData() {
//   const rows = await d3.csv("assets/meine-daten.csv");
//   sharedData = rows.map((d) => Number(d.value));
// }
// loadRealData();
// -----------------------------------------------------------

// Startdaten, bevor die Sketches überhaupt zeichnen
sharedData = generateRandomData();

// Drei Instanzen erzeugen: jede bekommt ihre Sketch-Funktion
// (definiert in sketch1.js etc.) und ein eigenes <div> als Ziel.
new p5(sketch1, "canvas1");
new p5(sketch2, "canvas2");
new p5(sketch3, "canvas3");

// Button: neue Zufallsdaten erzeugen. Da alle drei Instanzen
// dieselbe globale Variable sharedData lesen, aktualisieren sich
// automatisch alle drei Grafiken gleichzeitig.
document.getElementById("reloadBtn").addEventListener("click", () => {
  sharedData = generateRandomData();
});
