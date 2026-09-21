# p5.js Instance Mode – Mein Setup

Diese Seite zeigt drei unabhängige p5-Zeichnungen gleichzeitig (`canvas1`, `canvas2`,
`canvas3`). Damit das geht, läuft p5 im **Instance Mode** statt im normalen globalen Modus.

---

## Warum Instance Mode?

Im normalen ("globalen") p5-Modus gibt es nur eine `setup()`- und eine `draw()`-Funktion.
Das reicht für eine Zeichnung – aber ich will drei verschiedene auf einer Seite haben.
Würde ich dreimal `setup()`/`draw()` global schreiben, würde die letzte Definition die
vorherigen einfach überschreiben.

Die Lösung: Jeder Sketch wird in eine eigene Funktion verpackt, die ein `p`-Objekt bekommt.
Alle p5-Befehle laufen dann über `p.` (z. B. `p.createCanvas()` statt `createCanvas()`).
So hat jeder Sketch sein eigenes, unabhängiges `p` und die drei stören sich nicht.

---

## Meine Dateien

| Datei        | Aufgabe                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| `index.html` | Bindet p5, `Ball.js` und die drei Sketch-Dateien ein, definiert den Button und die drei `<div>`-Container |
| `Ball.js`    | Klasse `Ball`, die einen zeichenbaren Ball kapselt (Position, Farbe, `update()`, `draw()`)                |
| `sketch.js`  | Zeichnet **einen** Ball in `canvas1`                                                                      |
| `sketch2.js` | Zeichnet **mehrere** Bälle in `canvas2`; per Klick kommt ein neuer dazu                                   |
| `sketch3.js` | Wechselt bei Klick die Hintergrundfarbe von `canvas3`                                                     |

---

## Wie jede Instanz mit dem Button kommuniziert

Jeder Sketch entscheidet selbst, was beim Klick auf `#button` passieren soll – dafür
bekommt er eine eigene Methode `p.clicked`, die man von aussen (aus `index.html`) aufrufen
kann:

```js
// sketch2.js
function sketch2(p) {
  let balls = [];

  p.setup = function () {
    p.createCanvas(300, 300);
    balls.push(new Ball(p, p.width / 2, p.height / 2, p.width * 0.15, p.color(230, 57, 70)));
  };

  p.draw = function () {
    p.background("#83f283");
    for (b of balls) {
      b.update();
      b.draw();
    }
  };

  // von aussen aufrufbare Funktion
  p.clicked = function () {
    balls.push(new Ball(p, p.width / 2, p.height / 2, p.width * 0.15, p.color(p.random(100, 255), 100, 100)));
  };
}

const mySketch2 = new p5(sketch2, document.getElementById("canvas2"));
```

Wichtig dabei:

- **`new p5(...)` wird in einer Variable gespeichert** (`mySketch2`). Nur so kann ich von
  aussen auf die Instanz und ihre `p.clicked`-Methode zugreifen.
- Diese Variable ist **global**, weil sie ausserhalb jeder Funktion in `sketch2.js` steht.

Im HTML wird der Button dann mit genau dieser Instanz verdrahtet:

```html
<script>
  document.querySelector("#button").addEventListener("click", () => {
    mySketch2.clicked();
  });
</script>
```

Dieser Listener steht bewusst **ganz unten** in `index.html`, nach allen drei
Sketch-Dateien – sonst gäbe es `mySketch2` zum Zeitpunkt der Registrierung noch nicht.

`sketch3.js` macht es aktuell etwas anders: Es registriert seinen eigenen
`addEventListener` direkt in `setup()`, statt eine `p.clicked`-Methode anzubieten. Beides
funktioniert – der `p.clicked`-Ansatz aus `sketch2.js` ist aber die sauberere Variante,
weil die ganze Klick-Logik an einer Stelle (`index.html`) gebündelt ist, statt über mehrere
Dateien verstreut zu sein.

---

## Wenn ich einen vierten Sketch hinzufügen will

1. Neue Datei `sketch4.js` nach dem Muster von `sketch.js`/`sketch2.js`/`sketch3.js`
   anlegen, mit eigenem Funktionsnamen (`sketch4`) und eigener Instanz-Variable
   (`mySketch4`).
2. Neues `<div id="canvas4"></div>` in `index.html` einfügen.
3. `<script src="sketch4.js"></script>` **nach** den anderen Sketch-Skripten einbinden.
4. Falls der Button auch `sketch4` beeinflussen soll: `p.clicked` in `sketch4.js`
   definieren und `mySketch4.clicked();` im Listener in `index.html` ergänzen.
