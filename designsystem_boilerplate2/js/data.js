/**
 * data.js
 * ---------------------------------------------------------------
 * Liest eine CSV-Datei im Browser ein und wandelt sie in ein Array
 * von JavaScript-Objekten um. Nutzt dafür die Bibliothek PapaParse
 * (window.Papa), die in index.html per <script> eingebunden ist.
 *
 * Ergebnis liegt danach in der globalen Variable `tableData`
 * (Array von Objekten, ein Objekt pro CSV-Zeile), z.B.:
 *   [ { valueCategory: "cases", temporal: "2013-M01", value: 171, ... }, ... ]
 *
 * Sobald neue Daten geladen wurden, wird die Funktion
 * `onDataLoaded(data)` aufgerufen (siehe sketch.js) – dort kannst
 * du die p5.js-Visualisierung neu aufbauen.
 *
 * Ausserdem werden die zwei Dropdown-Filter (Geo-Region,
 * Wert-Kategorie) automatisch anhand der geladenen Daten befüllt.
 * ---------------------------------------------------------------
 */

let tableData = [];
let filteredData = [];

const fileInput = document.getElementById('file-input');
const fileStatus = document.getElementById('file-status');
const georegionSelect = document.getElementById('filter-georegion');
const valueCategorySelect = document.getElementById('filter-valuecategory');

// Datei laden, sobald der Nutzer eine neue Datei auswählt
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (results) => onCsvParsed(results.data, file.name),
  });
});

/**
 * Lädt eine CSV-Datei per URL (z.B. die mitgelieferte
 * data/beispiel.csv). Achtung: funktioniert nur, wenn die Seite
 * über einen lokalen Server läuft (siehe README.md) – nicht per
 * Doppelklick auf index.html geöffnet (file://).
 */
function loadCsvFromUrl(url) {
  Papa.parse(url, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (results) => onCsvParsed(results.data, url),
    error: (err) => {
      fileStatus.textContent =
        'Beispieldatei konnte nicht automatisch geladen werden. ' +
        'Läuft die Seite über einen lokalen Server? Siehe README.md. ' +
        'Du kannst stattdessen oben manuell eine Datei auswählen.';
      console.error(err);
    },
  });
}

/** Gemeinsame Verarbeitung nach dem Parsen einer CSV-Datei */
function onCsvParsed(rows, sourceName) {
  tableData = rows;
  fileStatus.textContent = `Geladen: ${sourceName} — ${tableData.length} Zeilen.`;
  console.log('tableData:', tableData);

  populateFilters(tableData);
  applyFilters();
}

/** Dropdown-Optionen aus den eindeutigen Werten der Spalten befüllen */
function populateFilters(data) {
  const georegions = uniqueSorted(data.map((d) => d.georegion));
  const valueCategories = uniqueSorted(data.map((d) => d.valueCategory));

  fillSelect(georegionSelect, georegions, 'CHFL');
  fillSelect(valueCategorySelect, valueCategories, 'cases');
}

function fillSelect(selectEl, values, preferredDefault) {
  selectEl.innerHTML = '';
  values.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  });
  if (values.includes(preferredDefault)) {
    selectEl.value = preferredDefault;
  }
}

function uniqueSorted(arr) {
  return [...new Set(arr.filter((v) => v !== null && v !== undefined))].sort();
}

/**
 * Filtert tableData anhand der Dropdown-Auswahl und zusätzlich auf
 * agegroup = "all" / sex = "all" / temporal_type = "month", damit
 * eine einfache monatliche Gesamt-Zeitreihe übrig bleibt. Passe das
 * gerne an, wenn du z.B. nach Altersgruppe aufschlüsseln willst.
 */
function applyFilters() {
  const georegion = georegionSelect.value;
  const valueCategory = valueCategorySelect.value;

  const baseRows = tableData
    .filter((d) => d.georegion === georegion)
    .filter((d) => d.valueCategory === valueCategory)
    .filter((d) => !d.agegroup || d.agegroup === 'all')
    .filter((d) => !d.sex || d.sex === 'all');

  // Nicht jede Region hat monatliche Werte (z.B. Grossregionen wie
  // "zürich" nur jährlich) – daher feinste vorhandene Granularität wählen.
  const availableTypes = new Set(baseRows.map((d) => d.temporal_type));
  const temporalType = availableTypes.has('month') ? 'month' : 'year';

  filteredData = baseRows
    .filter((d) => d.temporal_type === temporalType)
    .sort((a, b) => String(a.temporal).localeCompare(String(b.temporal)));

    console.log('filteredData:', filteredData);
  if (typeof onDataLoaded === 'function') {
    onDataLoaded(filteredData);
  }
}

georegionSelect.addEventListener('change', applyFilters);
valueCategorySelect.addEventListener('change', applyFilters);

// Beim Start automatisch die mitgelieferte Beispieldatei laden
window.addEventListener('DOMContentLoaded', () => {
  loadCsvFromUrl('data/beispiel.csv');
});
