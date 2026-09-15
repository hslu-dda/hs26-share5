# p5.js Instance Mode – Wie dieses Projekt aufgebaut ist

Dieses Projekt zeigt drei verschiedene Grafiken (Balken, Kreise, Linie) auf **einer** Seite,
die alle dieselben Daten anzeigen. Damit das funktioniert, wird p5 im **Instance Mode**
statt im gewohnten "globalen" Modus benutzt. Dieses README erklärt, was das bedeutet und
warum es dafür eine eigene `main.js` braucht.

---

## Das Problem: Warum reicht der normale p5-Modus hier nicht?

Normalerweise schreibt man p5-Code so:

```js
function setup() {
  createCanvas(300, 300);
}

function draw() {
  background(240);
  rect(10, 10, 50, 50);
}
```

Das nennt man **Global Mode**: es gibt nur **eine** `setup()`-Funktion, nur **eine**
`draw()`-Funktion, und `createCanvas`, `rect`, `background` usw. sind globale Funktionen.

Das funktioniert super, solange man **eine** Zeichnung auf der Seite hat. Sobald man aber,
wie hier, **drei unabhängige Zeichnungen** gleichzeitig auf derselben Seite haben will,
gibt es ein Problem: Es kann nur eine globale `setup()`- und `draw()`-Funktion geben.
Schreibt man drei davon, überschreibt die letzte einfach die vorherigen.

---

## Die Lösung: Instance Mode

Im **Instance Mode** verpackt man den Sketch in eine eigene Funktion, die ein Argument
`p` bekommt (der Name ist frei wählbar, `p` ist nur Konvention):

```js
function sketch1(p) {
  p.setup = function () {
    p.createCanvas(300, 300);
  };

  p.draw = function () {
    p.background(240);
    p.rect(10, 10, 50, 50);
  };
}
```

Der entscheidende Unterschied: Statt `createCanvas(...)` steht jetzt `p.createCanvas(...)`,
statt `rect(...)` steht `p.rect(...)`. Jede p5-Funktion "hängt" jetzt an diesem `p`-Objekt,
statt global zu sein.

Damit dieser Sketch tatsächlich läuft, muss man eine **neue p5-Instanz** davon erzeugen:

```js
new p5(sketch1, "canvas1");
```

- Erstes Argument: die Sketch-Funktion (hier `sketch1`), die p5 aufruft und mit `p` befüllt.
- Zweites Argument: die `id` eines HTML-Elements (`<div id="canvas1">`), in das genau dieser
  Sketch sein Canvas hineinzeichnet.

Weil jede Instanz ihr **eigenes** `p`-Objekt bekommt, können `sketch1`, `sketch2` und
`sketch3` völlig unabhängig voneinander laufen – jede hat ihre eigene `setup()`, ihre eigene
`draw()`, ihre eigene Canvas-Grösse, ohne sich gegenseitig zu überschreiben. Genau das siehst
du in `sketch1.js`, `sketch2.js` und `sketch3.js`: drei fast identisch aufgebaute Funktionen,
die aber jede für sich ein eigenständiges kleines p5-Programm sind.

---

## Warum gibt es `main.js`?

`main.js` ist die Datei, die das **Ganze zusammensetzt**. Sie übernimmt drei Aufgaben, die
keine einzelne der drei Sketch-Dateien allein übernehmen kann:

### 1. Gemeinsame Daten bereitstellen

```js
let sharedData = [];

function generateRandomData(n = 20) {
  return Array.from({ length: n }, () => Math.random() * 100);
}

sharedData = generateRandomData();
```

Alle drei Sketches sollen **dieselben** Daten zeigen (nur eben anders dargestellt: als
Balken, Kreise, Linie). Diese Daten müssen also an einer zentralen Stelle liegen, auf die
alle drei zugreifen können – nicht in `sketch1.js`, `sketch2.js` oder `sketch3.js`, weil
sonst jede Datei ihre eigene, unabhängige Kopie hätte. `sharedData` ist deshalb eine globale
Variable in `main.js`, und `sketch1`–`3` lesen sie einfach mit (`sharedData.length`,
`sharedData[i]`), ohne sie selbst zu verändern.

### 2. Die drei Instanzen tatsächlich starten

```js
new p5(sketch1, "canvas1");
new p5(sketch2, "canvas2");
new p5(sketch3, "canvas3");
```

Die Funktionen `sketch1`, `sketch2`, `sketch3` in ihren jeweiligen Dateien **definieren**
nur, wie gezeichnet wird – sie tun von selbst noch gar nichts. Erst `new p5(...)` erzeugt
wirklich eine laufende p5-Instanz daraus und verbindet sie mit einem `<div>` in der HTML-Seite.
Diese drei Zeilen müssen irgendwo passieren, nachdem alle drei Sketch-Dateien geladen sind –
deshalb steht `main.js` in `index.html` bewusst **nach** `sketch1.js`, `sketch2.js` und
`sketch3.js`.

### 3. Interaktion (Button) verdrahten

```js
document.getElementById("reloadBtn").addEventListener("click", () => {
  sharedData = generateRandomData();
});
```

Der Button gehört zu keinem der drei Sketches allein, sondern soll **alle drei gleichzeitig**
beeinflussen. `main.js` ist der neutrale Ort dafür: bei einem Klick wird einfach `sharedData`
neu befüllt. Weil `draw()` in p5 laufend (z.B. 60× pro Sekunde) neu ausgeführt wird, lesen
alle drei Sketches im nächsten Frame automatisch die neuen Werte – man muss die Sketches
nicht aktiv "benachrichtigen".

---

## Zusammengefasst: Aufgabenteilung der Dateien

| Datei                                      | Aufgabe                                                                                                                                               |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`                               | Bindet p5, d3, die drei Sketch-Dateien und `main.js` ein (in dieser Reihenfolge) und stellt die drei `<div>`-Container sowie den Button bereit        |
| `sketch1.js` / `sketch2.js` / `sketch3.js` | Definieren je **eine** Sketch-Funktion (`setup`/`draw` über `p.`), die beschreibt, _wie_ etwas gezeichnet wird – unabhängig voneinander               |
| `main.js`                                  | Hält die **gemeinsamen Daten** (`sharedData`), **startet** die drei p5-Instanzen mit `new p5(...)` und **verdrahtet** die Nutzer-Interaktion (Button) |

Die Trennung lohnt sich, weil sie zwei Dinge sauber auseinanderhält: _"wie sieht eine
einzelne Grafik aus"_ (in den `sketchX.js`-Dateien) und _"wie hängt das Ganze zusammen"_
(in `main.js`). Möchtest du eine vierte Grafik hinzufügen, brauchst du nur eine neue
`sketch4.js` und eine zusätzliche Zeile `new p5(sketch4, "canvas4")` in `main.js` – die
bestehenden drei Sketches bleiben komplett unverändert.
