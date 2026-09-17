let data;
let datatable = [];
let cantonCodes;
let xScale;
let minValue, maxValue; // kleinster und grösster value über alle Zeilen/Kantone

async function setup() {
  createCanvas(800, 10000);

  // CSV laden und nach temporal (Zeit) sortieren
  data = await d3.csv("assets/COVID19_oblig.csv");
  data.sort((a, b) => a.temporal.localeCompare(b.temporal));

  // Gruppieren: erst nach Woche, dann nach Kanton
  let grouped = d3.group(
    data,
    (d) => d.temporal,
    (d) => d.georegion,
  );

  // grouped in eine flache Tabelle umwandeln: eine Zeile pro Woche,
  // alle Kantone als Spalten. Werte werden hier direkt in Zahlen
  // umgewandelt (Number), damit wir später problemlos damit rechnen können.
  for (let [week, cantons] of grouped) {
    let row = { temporal: week };
    for (let [canton, rows] of cantons) {
      row[canton] = Number(rows[0].value);
    }
    datatable.push(row);
  }

  // Nur Wochenwerte behalten (Monats-/Jahreswerte rauswerfen)
  datatable = datatable.filter((row) => row.temporal.includes("-W"));
  datatable.sort((a, b) => a.temporal.localeCompare(b.temporal));

  // Alle Kantonskürzel (nur "canton", nicht "country" wie FL)
  cantonCodes = [...new Set(data.filter((d) => d.georegion_type === "canton").map((d) => d.georegion))].sort();

  /* 
  
Die Zeile oben ist ev nicht so gut lesbar. Sie verint verschiedene Schritte in eine Zeile:
Schritt 1: Nur die Zeilen behalten, die ein Kanton sind (keine Länder wie FL)
let nurKantone = data.filter((d) => d.georegion_type === "canton");

// Schritt 2: Aus jeder Zeile nur das Kantonskürzel rausziehen
let alleKuerzel = nurKantone.map((d) => d.georegion);
// alleKuerzel sieht jetzt ungefähr so aus: ["ZH", "BE", "ZH", "ZH", "LU", "BE", ...]
// mit sehr vielen Wiederholungen, weil jeder Kanton pro Woche einmal vorkommt

// Schritt 3: Ein Set aus diesem Array erstellen -> Duplikate verschwinden automatisch
let kuerzelSet = new Set(alleKuerzel);
// kuerzelSet enthält jetzt jedes Kürzel nur einmal, z.B. {ZH, BE, LU}
// ist aber noch kein Array!

// Schritt 4: Das Set zurück in ein Array umwandeln (mit dem Spread-Operator ...)
let kuerzelArray = [...kuerzelSet];
// kuerzelArray ist jetzt z.B. ["ZH", "BE", "LU"]

// Schritt 5: Alphabetisch sortieren
cantonCodes = kuerzelArray.sort();
*/

  // x-Skala: verteilt alle Kantone gleichmässig über die Canvas-Breite
  // https://d3js.org/d3-scale/band
  xScale = d3.scaleBand().domain(cantonCodes).range([0, width]).padding(0.1);

  // Kleinsten und grössten value über alle Zeilen und Kantone finden.
  // Wir sammeln zuerst alle Werte in einem einzigen Array ...
  // let allValues = [];
  // for (let row of datatable) {
  //   for (let canton of cantonCodes) {
  //     allValues.push(row[canton]);
  //   }
  // }
  // // ... und lesen dann Minimum und Maximum daraus aus.
  // minValue = Math.min(...allValues);
  // maxValue = Math.max(...allValues);

  // eigentlich gibts genau dafür auch eine d3 Funktion:
  minValue = d3.min(datatable, (row) => d3.min(cantonCodes, (canton) => row[canton]));
  maxValue = d3.max(datatable, (row) => d3.max(cantonCodes, (canton) => row[canton]));
  console.log("Wertebereich:", minValue, "-", maxValue);
}

function draw() {
  background(220);

  // Kopfzeile: Kantonskürzel
  textAlign(CENTER);
  textSize(10);
  fill(0);
  for (let canton of cantonCodes) {
    let x = xScale(canton);
    let bandWidth = xScale.bandwidth();
    text(canton, x + bandWidth / 2, 20);
  }

  // Rechtecke für die ersten 10 Wochen zeichnen
  noStroke();
  fill(100, 150, 250);

  let y = 30; // Start etwas unterhalb der Kopfzeile
  let rowSpacing = 30; // Abstand zwischen den Wochen-Zeilen

  for (let week of datatable.slice(0, 1000)) {
    for (let canton of cantonCodes) {
      let x = xScale(canton);
      let squareWidth = xScale.bandwidth();
      let value = week[canton]; // ist bereits eine Zahl
      if (value > 0) {
        // map(value, ausgangs-min, ausgangs-max, ziel-min, ziel-max)
        // rechnet den value proportional in eine Höhe zwischen 2 und 25 Pixel um.
        // Kleinster value -> 1px hoch, grösster value -> 25px hoch.
        let rectHeight = map(value, minValue, maxValue, 1, 25);
        rect(x, y, squareWidth, rectHeight);
      }
    }
    y += rowSpacing;
  }
}
