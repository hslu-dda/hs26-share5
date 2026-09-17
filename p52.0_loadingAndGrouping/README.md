# Chlamydiose-Sketch – Schritt für Schritt erklärt

Dieses README erklärt den gesamten p5/d3-Sketch: wie die Daten geladen, gefiltert und
gruppiert werden (`setup()`), und wie daraus eine Kalender-artige Grafik gezeichnet wird
(`draw()`).

---

## Globale Variablen

```js
let chlamydiosis;
let cMonthlyCases;
let cYearly;
let groupedArray = [];
```

- `chlamydiosis` – die komplette, ungefilterte CSV-Tabelle als Array von Objekten.
- `cMonthlyCases` – nur die Zeilen mit `valueCategory === "cases"` und `temporal_type === "month"`.
- `cYearly` – analog, aber für Jahreswerte.
- `groupedArray` – das Endergebnis: ein Array mit einem Objekt pro Monat, das `cases`,
  `min_value_5y`, `median_value_5y` und `max_value_5y` gleichzeitig enthält.

Diese Variablen sind global (ausserhalb von `setup()`/`draw()` deklariert), damit `draw()`
später auf `groupedArray` zugreifen kann, obwohl es in `setup()` befüllt wurde.

---

## `setup()` – Daten laden und aufbereiten

### 1. Canvas erstellen und CSV laden

```js
createCanvas(800, 600);
chlamydiosis = await d3.csv("assets/CHLAMYDIOSIS_oblig/data.csv");
```

`d3.csv(...)` lädt die Datei und wandelt sie in ein Array von Objekten um – eine Zeile im
CSV wird ein Objekt, jede Spalte ein Feld. Das Schlüsselwort `await` sorgt dafür, dass das
Programm hier wartet, bis die Datei tatsächlich geladen ist, bevor es weitermacht (deshalb
muss `setup()` als `async function` deklariert sein).

### 2. Nach `cases` und Monat filtern

```js
cMonthlyCases = d3.filter(chlamydiosis, (d) => d.valueCategory === "cases" && d.temporal_type === "month");
```

`d3.filter` (bzw. das eingebaute `.filter()`) geht jede Zeile durch und behält nur die,
für die die Bedingung `true` ergibt. Hier: nur Zeilen, die tatsächliche Fallzahlen sind
(nicht Min/Median/Max) und die pro Monat (nicht pro Jahr) vorliegen.

### 3. Nochmal filtern, für Monatsdaten allgemein

```js
let monthly = chlamydiosis.filter((d) => d.temporal_type === "month");
```

Diese Variable ist bewusst **nicht** auf `valueCategory === "cases"` eingeschränkt, weil wir
gleich alle vier Kategorien (`cases`, `min_value_5y`, `median_value_5y`, `max_value_5y`)
gemeinsam brauchen, um sie pro Monat zusammenzuführen.

### 4. Nach Monat gruppieren

```js
let grouped = d3.group(monthly, (d) => d.temporal);
```

`d3.group(daten, schlüsselFunktion)` sortiert jede Zeile in einen "Topf", basierend auf dem
Rückgabewert der Schlüsselfunktion – hier `d.temporal` (der Monat, z.B. `"2017-M01"`).

Ergebnis ist eine **Map**: pro Monat ein Eintrag, der Wert ist ein Array mit allen Zeilen,
die zu diesem Monat gehören (1 Zeile vor 2017, 4 Zeilen ab 2017, weil es die
5-Jahres-Statistik erst ab da gibt).

### 5. Pro Monat ein einheitliches Objekt bauen

```js
for (let [temporal, rows] of grouped) {
  let obj = {
    temporal: temporal,
    cases: null,
    min_value_5y: null,
    median_value_5y: null,
    max_value_5y: null,
  };

  for (let row of rows) {
    obj[row.valueCategory] = +row.value;
  }

  groupedArray.push(obj);
}
```

Eine `Map` lässt sich mit `for...of` durchlaufen; man bekommt dabei bei jedem Durchgang ein
Paar `[schlüssel, wert]`, hier benannt als `[temporal, rows]`.

Für jeden Monat wird zuerst ein Objekt mit **allen vier Feldern** angelegt, auf `null`
vorbefüllt. Das ist wichtig: Monate vor 2017 haben in `rows` nur eine Zeile (`cases`) – ohne
diese Vorbefüllung würden die anderen drei Felder im Objekt komplett fehlen, statt sauber
auf `null` zu stehen. So sehen später alle Monats-Objekte gleich aufgebaut aus.

Die innere Schleife `for (let row of rows)` trägt dann die tatsächlich vorhandenen Werte ein:
`obj[row.valueCategory] = +row.value;` heisst "leg im Objekt ein Feld mit dem Namen aus
`row.valueCategory` an" (z.B. `obj.cases = 958`). Das `+` wandelt den String aus dem CSV in
eine Zahl um.

### 6. Sortieren

```js
groupedArray.sort((a, b) => a.temporal.localeCompare(b.temporal));
```

Die Reihenfolge der Map entspricht nicht zwingend der zeitlichen Reihenfolge, daher wird
`groupedArray` am Ende explizit nach `temporal` sortiert. `localeCompare` vergleicht zwei
Strings alphabetisch – das funktioniert hier korrekt, weil das Format `JJJJ-Mmm` so aufgebaut
ist, dass alphabetische Sortierung gleich chronologischer Sortierung ist.

### 7. Textgrösse festlegen

```js
textSize(12);
```

Wird einmalig in `setup()` gesetzt, gilt danach für alle `text()`-Aufrufe in `draw()`.

---

## `draw()` – Die Grafik zeichnen

### Grundidee

Für jeden Monat wird ein kleines Quadrat gezeichnet, in einer Art Kalender-Raster:
alle Monate eines Jahres nebeneinander in einer Zeile, bei Jahreswechsel geht's in der
nächsten Zeile weiter, ganz links beginnend.

### 1. Ausgangswerte

```js
let x = 0;
let y = 0;
let rectwidth = 30;
let lineHeight = textAscent() + textDescent();
let year = groupedArray[0].temporal.split("-")[0];
```

- `x`, `y` – aktuelle Zeichenposition, startet oben links.
- `rectwidth` – Kantenlänge der Quadrate.
- `lineHeight` – Höhe einer Textzeile. `textAscent()` ist der Abstand von der Grundlinie bis
  zur Oberkante des Texts, `textDescent()` der Abstand von der Grundlinie bis zur Unterkante.
  Zusammen ergibt das die volle Zeilenhöhe – robuster als z.B. `textAscent() * 2`, weil es
  auch bei anderer `textSize()` noch stimmt.
- `year` – das Jahr des allerersten Monats in `groupedArray`, als Startwert zum Vergleichen.

### 2. Durch alle Monate gehen

```js
for (let month of groupedArray) {
  let date = month.temporal.split("-");
```

`month.temporal` ist z.B. `"2017-M03"`. `.split("-")` zerlegt den String beim Bindestrich in
ein Array: `["2017", "M03"]`. `date[0]` ist also das Jahr als String.

### 3. Zeilenumbruch bei Jahreswechsel

```js
if (date[0] != year) {
  x = 0;
  y += rectwidth;
}
year = date[0];
```

Sobald sich das Jahr ändert, springt `x` zurück auf `0` (ganz links) und `y` erhöht sich um
eine Quadrat-Höhe (neue Zeile). Danach wird `year` aktualisiert, damit der Vergleich beim
nächsten Monat wieder stimmt.

### 4. Farbe je nach Vergleich mit dem Median

```js
if (month.median_value_5y !== null && month.median_value_5y < month.cases) {
  fill("#dd8c8c");
} else {
  fill("#e1e4e1");
}
```

Rot (`#dd8c8c`), wenn es einen Median-Wert gibt **und** die Fallzahl über diesem Median liegt
(mehr Fälle als in einem "typischen" Jahr). Sonst grau.

Die Prüfung `month.median_value_5y !== null` ist nötig, weil `median_value_5y` für Monate vor
2017 `null` ist. Ohne diese Prüfung würde `null < month.cases` zwar nicht abstürzen (JavaScript
behandelt `null` in Vergleichen wie `0`), aber es würde inhaltlich Unsinn ergeben – ein
"fehlender" Median ist etwas anderes als ein Median von 0.

### 5. Quadrat und Text zeichnen

```js
push();
translate(x, y);
rect(0, 0, rectwidth);
fill(0);
text(month.cases, 0, lineHeight);
text(year, 0, lineHeight * 2);
pop();
```

`push()`/`pop()` merken sich den aktuellen Zeichenzustand (u.a. die Transformation) und
stellen ihn danach wieder her. Dazwischen wird mit `translate(x, y)` der Ursprung an die
aktuelle Position verschoben, sodass `rect(0, 0, rectwidth)` und die `text()`-Aufrufe relativ
dazu einfach bei `(0, 0)` beginnen können, statt jedes Mal `x`/`y` mit einzurechnen.

`rect(0, 0, rectwidth)` zeichnet ein Quadrat (30×30), weil p5 bei nur drei Zahlenargumenten
automatisch Breite = Höhe setzt.

`fill(0)` setzt die Füllfarbe für den nachfolgenden Text auf Schwarz (nur für Text – das
Quadrat selbst hat schon vorher seine Farbe über `fill("#dd8c8c")`/`fill("#e1e4e1")` bekommen).

Die beiden `text()`-Zeilen nutzen `lineHeight` bzw. `lineHeight * 2` als y-Position, damit die
Fallzahl in der ersten und das Jahr in der zweiten Zeile im Quadrat erscheinen.

### 6. Position für das nächste Quadrat

```js
  x += rectwidth;
}
```

Nach jedem Monat rückt `x` um eine Quadratbreite nach rechts, damit der nächste Monat direkt
daneben gezeichnet wird.

---

## Zusammenfassung

1. **`setup()`**: CSV laden → nach Monat filtern → nach `temporal` gruppieren → pro Monat ein
   einheitliches Objekt mit `cases`/`min_value_5y`/`median_value_5y`/`max_value_5y` bauen
   (fehlende Werte = `null`) → sortieren.
2. **`draw()`**: Jedes Monats-Objekt wird als Quadrat gezeichnet, in Zeilen pro Jahr
   angeordnet, mit Fallzahl und Jahr als Text sowie einer Farbe, die zeigt, ob die Fallzahl
   über dem 5-Jahres-Median liegt.
