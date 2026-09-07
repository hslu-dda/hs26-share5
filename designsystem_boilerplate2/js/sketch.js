/**
 * sketch.js
 * ---------------------------------------------------------------
 * Einfache p5.js-Sketch im "globalen Modus" (setup/draw), wie man
 * es aus dem p5.js Web Editor kennt. Die Daten kommen aus data.js
 * (globale Variable `filteredData`, wird per CSV-Import + Filter
 * befüllt) und werden hier als Zeitreihen-Liniendiagramm gezeichnet.
 * ---------------------------------------------------------------
 */

async function setup() {
  const canvas = createCanvas(800, 400);
  canvas.parent('canvas-holder'); // Canvas in den <div id="canvas-holder"> einhängen
  noLoop(); // wir zeichnen neu, sobald neue/gefilterte Daten da sind

  // Beim Start automatisch die mitgelieferte Beispieldatei laden (siehe data.js)
  await loadCsvFromUrl('data/beispiel.csv');
}

function draw() {
  background(255);
  drawLineChart(filteredData);
}

/**
 * Wird von data.js aufgerufen, sobald neue/gefilterte Daten
 * vorliegen. Hier: einfach neu zeichnen.
 */
function onDataLoaded(data) {
  redraw();
}

/**
 * Einfaches Liniendiagramm der Spalte "value" über "temporal"
 * (z.B. "2013-M01", "2013-M02", ...). Passe `valueKey` an, wenn du
 * z.B. stattdessen "incValue" oder "valueMean3y" zeichnen willst.
 */
function drawLineChart(data) {
  if (!data || data.length === 0) {
    fill(120);
    textAlign(CENTER, CENTER);
    text('Noch keine Daten für diese Auswahl …', width / 2, height / 2);
    return;
  }

  const valueKey = 'value';
  const values = data.map((d) => Number(d[valueKey]) || 0);
  const maxValue = Math.max(...values, 1);

  const marginLeft = 60;
  const marginBottom = 40;
  const marginTop = 20;
  const marginRight = 20;
  const chartWidth = width - marginLeft - marginRight;
  const chartHeight = height - marginTop - marginBottom;

  push();
  translate(marginLeft, marginTop);

  // Achsen
  stroke(200);
  line(0, chartHeight, chartWidth, chartHeight);
  line(0, 0, 0, chartHeight);

  // Y-Achsen-Beschriftung (min/max)
  noStroke();
  fill(120);
  textAlign(RIGHT, CENTER);
  textSize(11);
  text(maxValue, -8, 0);
  text(0, -8, chartHeight);

  // Linie zeichnen
  noFill();
  stroke('#dc0018'); // Primärfarbe des Bundes (Rot) – gerne anpassen
  strokeWeight(2);
  beginShape();
  data.forEach((row, i) => {
    const x = map(i, 0, data.length - 1, 0, chartWidth);
    const y = map(Number(row[valueKey]) || 0, 0, maxValue, chartHeight, 0);
    vertex(x, y);
  });
  endShape();

  // X-Achsen-Beschriftung: nur ein paar Labels, sonst wird's zu voll
  noStroke();
  fill(80);
  textAlign(CENTER, TOP);
  const labelStep = Math.ceil(data.length / 8);
  data.forEach((row, i) => {
    if (i % labelStep === 0 || i === data.length - 1) {
      const x = map(i, 0, data.length - 1, 0, chartWidth);
      text(row.temporal, x, chartHeight + 8);
    }
  });

  pop();
}
