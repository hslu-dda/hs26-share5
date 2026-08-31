# Boilerplate: p5.js + CSV-Daten + Swiss Confederation Designsystem (mit Tailwind-Build)

Diese Version hat einen **echten Tailwind-/PostCSS-Build** (wie im
Original-Repo [swiss/designsystem](https://github.com/swiss/designsystem)),
statt einer vorkompilierten Datei mit fester Klassen-Auswahl. Das heisst:
**alle** Tailwind-Utility-Klassen stehen zur Verfügung – ihr müsst nach
Änderungen an eurem HTML/JS aber einmal neu bauen (siehe unten).

## Setup (einmalig)

Voraussetzung: [Node.js](https://nodejs.org/) (LTS-Version reicht).

```bash
npm install
npm run build-css
```

Das erzeugt `dist/main.css` aus den Design-System-Quellen (`css/`) + eurem
Tailwind-Theme (`tailwind.config.js`).

## Während der Entwicklung

```bash
npm run watch-css
```

baut `dist/main.css` automatisch neu, sobald ihr `css/*.postcss`,
`tailwind.config.js`, `index.html` oder Dateien in `js/` ändert (Tailwind
scannt `index.html` und `js/**/*.js` nach benutzten Klassen — siehe
`content` in `tailwind.config.js`).

Parallel dazu braucht ihr einen **lokalen Webserver** für die Seite selbst
(weil die CSV-Datei per `fetch()` nachgeladen wird):

```bash
python3 -m http.server 8000
```
→ [http://localhost:8000](http://localhost:8000)

Oder Node: `npx serve .` — oder die VS-Code-Erweiterung "Live Server".

## Struktur

```
index.html              Hauptseite
css/                     Design-System-Quellen (PostCSS), unverändert aus
                         github.com/swiss/designsystem übernommen
tailwind.config.js       Tailwind-Theme des Designsystems, `content` zeigt
                         auf index.html + js/**/*.js (statt auf .vue-Dateien)
postcss.config.js        PostCSS-Pipeline (postcss-import, tailwindcss,
                         autoprefixer, cssnano)
dist/
  main.css               Generierte CSS-Datei (durch npm run build-css)
  fonts/                  Schriftdateien (Noto Sans), statisch, nicht Teil
                         des Builds
js/
  data.js                Liest eine .csv-Datei ein (via PapaParse) und
                         befüllt die Filter-Dropdowns
  sketch.js               p5.js-Sketch, zeichnet die gefilterte Zeitreihe
assets/
  icons/                 Alle Icons des Designsystems als einzelne SVGs
  logos/BundLogo.svg     Logo Schweizerische Eidgenossenschaft
data/
  beispiel.csv            Beispieldaten: gemeldete Gonorrhoe-Fälle (BAG)
  metadata.json            Beschreibung der Spalten in beispiel.csv
```

## Eigene CSV-Datei verwenden

Entweder:
- `data/beispiel.csv` durch die eigene ersetzen (gleicher Dateiname), oder
- über das Datei-Auswahlfeld auf der Seite die eigene `.csv`-Datei laden.

Die **erste Zeile** wird als Spaltenüberschrift verwendet (Komma-getrennt).
`data.js` verwendet [PapaParse](https://www.papaparse.com/) und wandelt jede
Zeile in ein JavaScript-Objekt um, z.B.:

```js
{
  valueCategory: "cases",
  temporal: "2013-M01",
  temporal_type: "month",
  georegion: "CHFL",
  agegroup: "all",
  sex: "all",
  value: 171,
  ...
}
```

Diese Liste liegt zunächst komplett in `tableData`. Die beiden Dropdowns
("Geo-Region", "Wert-Kategorie") werden automatisch aus den in den Daten
vorkommenden Werten befüllt. `applyFilters()` filtert danach zusätzlich auf
`temporal_type = "month"`, `agegroup = "all"` und `sex = "all"`, damit eine
einfache monatliche Gesamt-Zeitreihe entsteht — das Ergebnis liegt in
`filteredData` und wird an `onDataLoaded(data)` in `sketch.js` übergeben.

Passt die Filter-Logik in `data.js` gerne an eure eigene CSV-Struktur an,
falls die Spaltennamen anders heissen.

**Format-Beispiel `beispiel.csv`:** Das mitgelieferte Beispiel folgt dem
Datenformat des BAG-Infektionskrankheiten-Dashboards (siehe
`data/metadata.json` für die genaue Spaltenbeschreibung: `value`,
`incValue`, `valueMean3y`, Geo-Regionen, Altersgruppen, Geschlecht, usw.).

## p5.js

`js/sketch.js` ist ein ganz normaler p5.js-Sketch im "globalen Modus"
(`setup()` / `draw()`), genau wie im
[p5.js Web Editor](https://editor.p5js.org/). Aktuell wird ein
Liniendiagramm der Spalte `value` über die Zeit (`temporal`) gezeichnet.
Ändert `valueKey` in `drawLineChart()`, um z.B. stattdessen `incValue` oder
`valueMean3y` darzustellen.

## Design-System-Komponenten & Icons

Alle Komponenten-Klassen (`btn`, `card`, `input`, `select`, `navbar`,
`accordion`, `table`, `badge`, …) stehen unverändert zur Verfügung — siehe
[Designsystem-Dokumentation](https://github.com/swiss/designsystem).

Icons liegen als einzelne SVG-Dateien in `assets/icons/` und lassen sich
direkt inline verwenden:

```html
<svg class="icon icon--lg text-primary-500" viewBox="0 0 24 24">
  <path d="m9.772 17.729-4.913-4.912.531-.531 4.382 4.383 9.382-9.383.531.531z"/>
</svg>
```

## Tailwind-Theme anpassen

Farben, Schriftgrössen, Radien usw. sind in `tailwind.config.js` definiert
(1:1 aus dem Original-Designsystem übernommen). Wollt ihr z.B. eine eigene
Akzentfarbe hinzufügen, ergänzt sie unter `theme.extend.colors` und baut
danach neu (`npm run build-css`).
