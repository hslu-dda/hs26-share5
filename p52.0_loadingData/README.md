# COVID-19 Kantons-Visualisierung – README

Dieser Sketch (p5.js) zeichnet für jede Woche und jeden Schweizer Kanton ein kleines Rechteck, dessen Höhe zeigt, wie hoch der gemeldete Wert (`value`) in dieser Woche und diesem Kanton war. Am Ende entsteht eine Art "Heatmap-Streifen" mit einer Zeile pro Woche und einer Spalte pro Kanton.

Der Code benutzt zwei Bibliotheken:

- **p5.js** – für `createCanvas`, `draw`, `rect`, `text`, `map`, `loadImage`, usw.
- **d3.js** – nur für zwei Dinge: CSV einlesen (`d3.csv`) und Daten gruppieren (`d3.group`), plus eine Hilfsskala (`d3.scaleBand`).

---

## 1. Globale Variablen

```javascript
let data; // alle Zeilen aus dem CSV, roh (nach dem Einlesen)
let datatable = []; // aufbereitete Tabelle: eine Zeile pro Woche, Kantone als Spalten
let cantonCodes; // Liste aller Kantonskürzel, z.B. ["AG", "BE", "ZH", ...]
let xScale; // d3-Skala, die Kantone auf x-Positionen auf der Canvas abbildet
let minValue, maxValue; // kleinster/grösster value über alle Daten (für die Balkenhöhe)
```

---

## 2. `setup()` – wird einmal am Anfang ausgeführt

### 2.1 CSV laden und sortieren

```javascript
data = await d3.csv("assets/COVID19_oblig.csv");
data.sort((a, b) => a.temporal.localeCompare(b.temporal));
```

- `d3.csv(...)` liest die CSV-Datei ein und wandelt sie in ein Array von Objekten um. Jede Zeile im CSV wird zu einem Objekt, z.B.:
  ```javascript
  { temporal: "2021-W03", georegion: "ZH", georegion_type: "canton", value: "123" }
  ```
- `await` ist nötig, weil das Laden der Datei Zeit braucht. Der Code wartet, bis die Datei fertig geladen ist, bevor es weitergeht. Deshalb ist `setup()` als `async function` markiert.
- `.sort(...)` sortiert alle Zeilen nach dem Feld `temporal` (der Woche), alphabetisch/chronologisch aufsteigend. `localeCompare` vergleicht zwei Texte und sagt, welcher "kleiner" ist.

### 2.2 Gruppieren mit `d3.group`

```javascript
let grouped = d3.group(
  data,
  (d) => d.temporal,
  (d) => d.georegion,
);
```

`d3.group()` nimmt ein Array und teilt es in **verschachtelte Gruppen** auf, basierend auf den Funktionen, die man ihm mitgibt.

- Erste Funktion `(d) => d.temporal` → gruppiere zuerst nach Woche.
- Zweite Funktion `(d) => d.georegion` → gruppiere innerhalb jeder Woche nochmal nach Kanton.

Das Ergebnis ist eine sogenannte **Map** (nicht zu verwechseln mit der `.map()`-Array-Methode von vorher – das ist ein anderes Konzept mit dem gleichen Namen). Man kann sie sich so vorstellen:

```
"2021-W01" →
    "ZH" → [ {Zeile mit ZH, Woche 1} ]
    "BE" → [ {Zeile mit BE, Woche 1} ]
    ...
"2021-W02" →
    "ZH" → [ {Zeile mit ZH, Woche 2} ]
    ...
```

Jede Woche zeigt auf eine weitere Map, die jeden Kanton auf ein Array von (normalerweise genau einer) Zeile abbildet.

### 2.3 Die verschachtelte Struktur in eine flache Tabelle umwandeln

```javascript
for (let [week, cantons] of grouped) {
  let row = { temporal: week };
  for (let [canton, rows] of cantons) {
    row[canton] = Number(rows[0].value);
  }
  datatable.push(row);
}
```

- `for (let [week, cantons] of grouped)` geht durch die äussere Map. `[week, cantons]` ist **Destructuring**: jeder Eintrag einer Map besteht aus einem Schlüssel (hier `week`, z.B. `"2021-W01"`) und einem Wert (hier `cantons`, die innere Map). Diese Schreibweise packt beide direkt in zwei Variablen aus.
- Für jede Woche wird ein neues Objekt `row` erstellt, das erstmal nur `{ temporal: week }` enthält.
- Die innere Schleife geht durch alle Kantone dieser Woche und liest den Wert aus: `rows[0].value` ist der `value` der ersten (und einzigen) Zeile für diesen Kanton/diese Woche. `Number(...)` wandelt den Text (z.B. `"123"`) in eine echte Zahl um, damit man später rechnen kann.
- `row[canton] = ...` fügt eine neue Eigenschaft zum Objekt hinzu, benannt nach dem Kantonskürzel. Am Ende sieht eine Zeile z.B. so aus:
  ```javascript
  { temporal: "2021-W01", ZH: 123, BE: 87, LU: 45, ... }
  ```
- `datatable.push(row)` hängt diese fertige Zeile an die grosse Tabelle an.

**Kurz gesagt:** Aus "eine Zeile pro Kanton+Woche im CSV" wird "eine Zeile pro Woche, mit allen Kantonen als Spalten" – eine typische Umformung von einem _langen_ in ein _breites_ Datenformat.

### 2.4 Nur Wochenwerte behalten

```javascript
datatable = datatable.filter((row) => row.temporal.includes("-W"));
datatable.sort((a, b) => a.temporal.localeCompare(b.temporal));
```

Das CSV enthält vermutlich auch Monats- oder Jahreswerte (z.B. `"2021-12"` oder `"2021"`). `.filter(...)` behält nur die Zeilen, deren `temporal`-Wert die Zeichenfolge `"-W"` enthält (also Wochenangaben wie `"2021-W03"`). Danach wird nochmals sortiert, damit die Reihenfolge stimmt.

### 2.5 Kantonskürzel bestimmen

```javascript
cantonCodes = [...new Set(data.filter((d) => d.georegion_type === "canton").map((d) => d.georegion))].sort();
```

1. `filter` → nur Zeilen mit `georegion_type === "canton"` behalten (Liechtenstein `"FL"` z.B. hat `"country"` und fliegt raus).
2. `map` → aus jeder Zeile nur das Kürzel (`georegion`) rausziehen.
3. `new Set(...)` → Duplikate entfernen (jeder Kanton kommt sonst einmal pro Woche vor).
4. `[...Set]` → das Set zurück in ein normales Array verwandeln (Sets haben keine Array-Methoden wie `.sort()`).
5. `.sort()` → alphabetisch sortieren.

Ergebnis: `["AG", "AR", "BE", ..., "ZH"]` – jeder Kanton genau einmal.

### 2.6 Die x-Skala mit `d3.scaleBand`

```javascript
xScale = d3.scaleBand().domain(cantonCodes).range([0, width]).padding(0.1);
```

Eine **Skala** in d3 ist eine Funktion, die Werte aus einem "Eingabebereich" (Domain) auf einen "Ausgabebereich" (Range) abbildet.

- `d3.scaleBand()` ist eine spezielle Skala für **kategorische** Werte (Texte, keine Zahlen) wie Kantonskürzel. Sie teilt den verfügbaren Platz in gleich breite "Bänder" auf – ein Band pro Kategorie.
- `.domain(cantonCodes)` sagt: "Ich habe diese Kategorien" (z.B. `["AG", "BE", ..., "ZH"]`, 26 Stück).
- `.range([0, width])` sagt: "Verteile sie über den Platz von x=0 bis x=width (800px)".
- `.padding(0.1)` fügt einen kleinen Abstand zwischen den Bändern ein, damit die Rechtecke nicht direkt aneinanderkleben.

Danach kann man `xScale("ZH")` aufrufen und bekommt die x-Position zurück, an der das Band für `"ZH"` beginnt. `xScale.bandwidth()` gibt die Breite eines einzelnen Bandes zurück (also wie breit jede Kantons-Spalte ist).

**Warum das nützlich ist:** Ohne `scaleBand` müsste man von Hand ausrechnen `x = index * (width / anzahlKantone)`. `scaleBand` macht das automatisch und übernimmt auch das Padding.

### 2.7 Minimum und Maximum aller Werte finden

```javascript
let allValues = [];
for (let row of datatable) {
  for (let canton of cantonCodes) {
    allValues.push(row[canton]);
  }
}
minValue = Math.min(...allValues);
maxValue = Math.max(...allValues);
```

- Doppelte Schleife: für jede Woche (`row`) und für jeden Kanton wird der Wert `row[canton]` in ein grosses Array `allValues` gesammelt.
- `Math.min(...allValues)` und `Math.max(...allValues)` finden das kleinste bzw. grösste Element. Der Spread-Operator `...` ist hier nötig, weil `Math.min`/`Math.max` einzelne Zahlen als Argumente erwarten, nicht ein Array – `...allValues` "entpackt" das Array in einzelne Argumente.

Diese zwei Werte (`minValue`, `maxValue`) werden später gebraucht, um die Werte proportional in Balkenhöhen (1–25 Pixel) umzurechnen.

---

## 3. `draw()` – wird laufend/wiederholt ausgeführt (p5.js-Standard)

### 3.1 Kopfzeile zeichnen

```javascript
for (let canton of cantonCodes) {
  let x = xScale(canton);
  let bandWidth = xScale.bandwidth();
  text(canton, x + bandWidth / 2, 20);
}
```

Für jeden Kanton wird sein Kürzel als Text über der jeweiligen Spalte ausgegeben. `x + bandWidth / 2` zentriert den Text horizontal in der Mitte des Bandes.

### 3.2 Rechtecke für jede Woche zeichnen

```javascript
let y = 30;
let rowSpacing = 30;

for (let week of datatable.slice(0, 1000)) {
  for (let canton of cantonCodes) {
    let x = xScale(canton);
    let squareWidth = xScale.bandwidth();
    let value = week[canton];
    if (value > 0) {
      let rectHeight = map(value, minValue, maxValue, 1, 25);
      rect(x, y, squareWidth, rectHeight);
    }
  }
  y += rowSpacing;
}
```

- `datatable.slice(0, 1000)` nimmt die ersten 1000 Zeilen (also praktisch alle, falls es weniger Wochen gibt).
- Für jede Woche (`week`) wird `y` um `rowSpacing` (30px) erhöht – so entsteht eine neue Zeile pro Woche, von oben nach unten.
- Für jeden Kanton innerhalb der Woche:
  - `x` und `squareWidth` kommen wieder aus `xScale`.
  - `value` ist die Zahl für diesen Kanton in dieser Woche.
  - Ist der Wert grösser als 0, wird ein Rechteck gezeichnet. `map(value, minValue, maxValue, 1, 25)` (die **p5.js-Funktion** `map`, nicht die Array-Methode!) rechnet den Wert proportional in eine Höhe zwischen 1 und 25 Pixel um: der kleinste vorkommende Wert ergibt ~1px, der grösste ~25px.

**Achtung – Namenskollision:** Es gibt zwei völlig unterschiedliche Dinge, die `map` heissen:

1. Die **Array-Methode** `.map()` (z.B. `data.map((d) => d.georegion)`) – wandelt jedes Element eines Arrays um.
2. Die **p5.js-Funktion** `map(wert, minIn, maxIn, minOut, maxOut)` – rechnet eine Zahl von einem Wertebereich in einen anderen um.

Beide haben nichts miteinander zu tun, ausser dem Namen.

---

## 4. Kurzglossar der wichtigsten Konzepte

| Begriff                | Bedeutung im Sketch                                                        |
| ---------------------- | -------------------------------------------------------------------------- |
| `async` / `await`      | Warten, bis eine Datei (CSV, Bild) fertig geladen ist, bevor es weitergeht |
| `.filter()`            | Nur Elemente behalten, die eine Bedingung erfüllen                         |
| `.map()` (Array)       | Aus jedem Element etwas Neues berechnen (gleiche Anzahl Elemente)          |
| `Set`                  | Eine Sammlung ohne Duplikate                                               |
| `[...set]`             | Spread-Operator: ein Set (oder Array) "auspacken"                          |
| `d3.group()`           | Daten nach einem oder mehreren Kriterien gruppieren (verschachtelte Map)   |
| `d3.scaleBand()`       | Kategorien (z.B. Kantone) gleichmässig über einen Platz verteilen          |
| `map()` (p5.js)        | Eine Zahl proportional von einem Wertebereich in einen anderen umrechnen   |
| Destructuring `[a, b]` | Werte aus einem Array/einer Map-Eintrag direkt in Variablen auspacken      |

---

## 5. Mögliche Stolpersteine / offene Punkte

- `createCanvas(800, 10000)` erzeugt eine sehr hohe Canvas (10'000px), damit Platz für alle Wochen-Zeilen ist. Falls es mehr als ~330 Wochen gibt (`10000 / 30`), würden Zeilen unten abgeschnitten.
- Werte, die genau `0` sind, werden **nicht** gezeichnet (`if (value > 0)`) – das ist Absicht, aber gut zu wissen, falls Balken "fehlen".

```javascript
let alleKuerzel = nurKantone.map((d) => d.georegion);

let alleKuerzel = [];
for (let d of nurKantone) {
  alleKuerzel.push(d.georegion);
}
```

## Resources

- [p5.js 2.0](https://beta.p5js.org/)
- [p5.js Reference](https://p5js.org/reference/)
