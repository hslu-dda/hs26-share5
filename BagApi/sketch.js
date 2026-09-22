// ============================================================================
// Borreliose-Sketch
// Lädt monatliche Fallzahlen über den lokalen Proxy (server.js, siehe
// README Teil 2), gruppiert sie mit d3 nach Jahr/Monat und zeichnet sie
// als Raster aus Trend-Pfeilen. Das Canvas ist immer voll hoch (alle
// Jahre); sichtbar ist nur ein Ausschnitt, der Rest ist scrollbar
// (siehe README Teil 1, #canvas-wrapper).
// ============================================================================

let data; // rohe API-Antwort
let grouped; // d3.group()-Ergebnis: Map<Jahr, Map<Monat, [Eintrag]>>
let rW; // Breite/Höhe eines einzelnen Monats-Rechtecks (quadratisch)
let canvasWidth; // aktuelle, aus #outer ausgelesene Canvas-Breite

// Ab welcher Fensterbreite wie viele Zeilen (Jahre) gleichzeitig sichtbar
// sind. "small" korrespondiert bewusst mit dem @media(max-width: 600px)
// Breakpoint in style.css, damit Padding und Zeilenzahl beim selben
// Schwellenwert gemeinsam umschalten.
const BREAKPOINTS = {
  small: 600, // Handy-Hochformat
};

function getVisibleRows() {
  return window.innerWidth < BREAKPOINTS.small ? 6 : 3;
}

// Liest die AKTUELLE Breite von #outer aus.
function getCanvasWidth() {
  const outer = document.getElementById("outer");
  return outer.clientWidth;
}

async function setup() {
  try {
    // -- 1. Daten über den lokalen Proxy laden (nicht direkt von der
    //    BAG-API, siehe README Teil 2: CORS blockiert POST-Requests aus
    //    dem Browser direkt an api.idd.bag.admin.ch) -----------------------
    const response = await fetch("http://localhost:3000/api/idd/api/v1/data/lyme_borreliosis/cases/incValue/month", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agegroup: "agegroup_tick",
        agegroup_tick: "all",
        country: "CH",
        georegion: "country",
        sex: "all",
      }),
    });
    data = await response.json();

    // data.values
    // {x: 201301, y: 3.63, properties: {...}} -Objekten. x kodiert
    const monthly = data.values;

    // --  Nach Jahr, dann Monat gruppieren -------------------------------
    // d.x / 100 abgerundet  -> Jahr   (201301 -> 2013)
    // d.x % 100             -> Monat  (201301 -> 1)
    grouped = d3.group(
      monthly,
      (d) => Math.floor(d.x / 100),
      (d) => d.x % 100,
    );

    // -- 3. Canvas in voller Höhe erzeugen (alle Jahre) --------------------
    canvasWidth = getCanvasWidth();
    rW = canvasWidth / 12; // 12 Monate pro Zeile
    const numYears = grouped.size;

    const canvas = createCanvas(canvasWidth, rW * numYears);
    canvas.parent("canvas-wrapper"); // hängt das Canvas in unseren Wrapper (index.html)

    // -- 4. Sichtbaren Ausschnitt (Scroll-Höhe) setzen ---------------------
    const wrapper = document.getElementById("canvas-wrapper");
    wrapper.style.height = rW * getVisibleRows() + "px";
  } catch (err) {
    console.error("Fetch zum Proxy fehlgeschlagen:", err);
  }

  textSize(20);
}

function draw() {
  background(240);

  let x = 0;
  let y = 0;

  for (const [year, months] of grouped) {
    x = 0;
    for (const [month, entries] of months) {
      // entries ist ein Array (d3.group liefert IMMER ein Array, auch bei
      // nur einem Treffer) - wir brauchen das erste (und einzige) Element.
      const d = entries[0];

      // Kachel-Hintergrund
      fill(250);
      noStroke();
      rect(x + 5, y + 5, rW - 10);

      // Trend-Pfeil, Farbe je nach Richtung
      if (d.properties.trend === "rising") fill(0, 150, 0);
      else if (d.properties.trend === "falling") fill(200, 0, 0);
      else fill(120); // stagnant oder null

      textAlign(CENTER, CENTER);
      text(arrowGlyph(d.properties.trend), x + rW / 2, y + rW / 2);

      x += rW;
    }
    y += rW;
  }
}

// Unicode-Pfeilglyphen statt selbst gezeichneter Formen - einfacher und
// skaliert automatisch mit textSize().
function arrowGlyph(trend) {
  if (trend === "rising") return "↑";
  if (trend === "falling") return "↓";
  if (trend === "stagnant") return "→";
  return ""; // trend === null -> kein Pfeil
}

// Wird von p5 automatisch bei jeder Fenstergrössen-Änderung aufgerufen.
function windowResized() {
  if (!grouped) return; // Resize, bevor die Daten geladen sind -> abbrechen

  canvasWidth = getCanvasWidth();
  rW = canvasWidth / 12;
  const numYears = grouped.size;

  resizeCanvas(canvasWidth, rW * numYears);
  document.getElementById("canvas-wrapper").style.height = rW * getVisibleRows() + "px";
}
