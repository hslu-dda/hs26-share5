# Borreliose-Sketch – BAG Infectious Diseases Dashboard (IDD)

Dieses Projekt lädt monatliche Fallzahlen zu Lyme-Borreliose über die
[IDD-API](https://api.idd.bag.admin.ch) des BAG und stellt sie als Raster
aus Trend-Pfeilen dar (p5.js), gruppiert nach Jahr/Monat (d3.js).

Weil die API keine POST-Anfragen aus dem Browser zulässt (CORS), läuft
zusätzlich ein kleiner lokaler Proxy-Server (Node/Express), der die Anfrage
stellvertretend ausführt.

Dieses README erklärt zwei Dinge im Detail, weil beide Konzepte über dieses
Projekt hinaus nützlich sind:

1. **Teil 1** – wie die DOM/CSS-Struktur rund um das `<canvas>` aufgebaut ist
   und warum sie so aussieht, wie sie aussieht (Schritt für Schritt).
2. **Teil 2** – warum und wie der Proxy-Server funktioniert (CORS-Problem).

---

## Teil 1: Die DOM-Struktur, Schritt für Schritt

Die Endstruktur sieht so aus:

```
body
└─ h1                          Überschrift
└─ section.spaced              Abstand zur Überschrift
   └─ div.container            zentrierte, responsive Breite (max 55rem)
      └─ div#outer             Rahmen fürs Canvas + Schatten-Overlay
         └─ div#canvas-wrapper scrollbarer Ausschnitt (nur n Zeilen sichtbar)
            └─ canvas           das eigentliche p5-Canvas (volle Höhe = alle Jahre)
```

Jede Ebene hat einen einzigen, klar abgrenzbaren Zweck. Das ist Absicht:
Wenn jedes Element nur _eine_ Aufgabe hat, lässt sich das CSS viel leichter
debuggen, als wenn ein einzelnes Element gleichzeitig zentrieren,
scrollen, Schatten werfen und die Canvas-Grösse bestimmen müsste.

### Schritt 1 – `h1` und `section.spaced`

```html
<h1>Borreliose</h1>
<section class="spaced">...</section>
```

`h1` ist von Natur aus ein Block-Element (nimmt die volle Breite ein).
`text-align: center` auf `body` zentriert seinen _Text-Inhalt_ – dafür
braucht `h1` selbst kein eigenes CSS.

`section.spaced` existiert um einerseits semantisch zu strukturieren und andererseits damit zwischen Überschrift und Canvas ein definierter Abstand liegt (`margin-top: var(--space)`), statt Margins auf mehreren Elementen verteilt zu pflegen.

### Schritt 2 – `.container`: zentrierte, responsive Breite

```css
.container {
  max-width: var(--container-max);
  margin-inline: auto; /* zentriert horizontal */
  padding-inline: var(--space);
  padding-block: var(--space);
}
```

`.container` ist das klassische "responsive Wrapper"-Muster:

- `max-width` verhindert, dass der Inhalt auf sehr breiten Bildschirmen
  unlesbar in die Breite gezogen wird.
- `margin-inline: auto` zentriert das Element horizontal, sobald es
  schmaler ist als sein Elternelement.
- Auf schmalen Bildschirmen (unter `max-width`) nimmt `.container` einfach
  `100%` der verfügbaren Breite ein.

Wichtig: `.container` selbst weiss nichts vom Canvas. Es kümmert sich
ausschliesslich um Zentrierung und Innenabstand – nicht um Scrollen, nicht
um Schatten.

### Schritt 3 – `#outer`: der Rahmen fürs Canvas

```css
#outer {
  position: relative; /* Bezugspunkt für den Schatten  */
  width: 100%;
  max-width: var(--container-max);
  margin-inline: auto;
  overflow: hidden;
}
```

`#outer` ist bewusst **kein** scrollender Container. Seine einzige Aufgabe:

1. Über CSS (nicht über JavaScript!) responsiv breit sein.
2. Als `position: relative`-Bezugspunkt für den Schatten in Schritt 6
   dienen.

### Schritt 4 – `#canvas-wrapper`: der scrollbare Ausschnitt

```css
#canvas-wrapper {
  overflow-y: auto; /* macht den Inhalt vertikal scrollbar */
  overscroll-behavior: contain; /* verhindert "Rubber-Banding" über den Rand hinaus */
  height: 300px; /* Platzhalter, wird von JS überschrieben */
}
```

Das Canvas selbst wird **immer in voller Höhe** gezeichnet (ein Rechteck
pro Monat, für alle Jahre). `#canvas-wrapper` ist der "Sichtausschnitt"
davor: er ist absichtlich niedriger als das Canvas und schneidet den Rest
optisch ab, macht ihn aber über `overflow-y: auto` scrollbar.

Die tatsächliche Höhe (wie viele Zeilen sichtbar sind) wird in
`sketch.js` berechnet, abhängig von der Fensterbreite (siehe
`getVisibleRows()`), und per JavaScript gesetzt:

```js
wrapper.style.height = rW * getVisibleRows() + "px";
```

`overscroll-behavior: contain` :
ohne diese Zeile "federt" der Container beim Scrollen übers Ende hinaus
elastisch zurück (macOS-Trackpad-Verhalten).

### Schritt 5 – Das Canvas selbst

```js
const canvas = createCanvas(canvasWidth, rW * numYears);
canvas.parent("canvas-wrapper");
```

p5.js erzeugt Canvas-Elemente standardmässig direkt in `<body>`.
`canvas.parent("canvas-wrapper")` hängt das Canvas stattdessen gezielt in
unseren Wrapper

Die Canvas-**Breite** (`canvasWidth`) kommt aus `#outer.clientWidth` (also
von aussen, responsiv). Die Canvas-**Höhe** (`rW * numYears`) ist immer die
volle Höhe für _alle_ Jahre – unabhängig davon, wie viele davon gerade
sichtbar sind. Genau dieser Unterschied (volles Canvas + kleiner
Sichtausschnitt) ist es, was das Scrollen ermöglicht.

### Schritt 6 – Der Schatten-Trick (`#outer::after`)

```css
#outer::after {
  content: "";
  position: absolute;
  inset: 0; /* oben/rechts/unten/links = 0, füllt #outer komplett aus */
  pointer-events: none; /* Klicks/Scrollen gehen ungehindert durch */
  box-shadow:
    inset 0 8px 12px -8px rgba(0, 0, 0, 0.4),
    inset 0 -8px 12px -8px rgba(0, 0, 0, 0.4);
  z-index: 10;
}
```

Naheliegend wäre, den Schatten direkt auf `#canvas-wrapper` zu legen. Das
funktioniert aber **nicht zuverlässig**: p5 zeichnet 60× pro Sekunde
`background(240)` und deckt dabei die komplette Canvas-Fläche undurchsichtig
ab – der Schatten würde ständig vom nächsten Frame überzeichnet.

Deshalb liegt der Schatten auf einem eigenen Pseudo-Element (`::after`),
das am **äusseren**, nicht-scrollenden `#outer` hängt:

- `position: absolute; inset: 0` legt das Pseudo-Element exakt über
  `#outer` (dank `position: relative` in Schritt 3).
- Es liegt in einem eigenen Compositing-Layer _über_ dem Canvas, wird also
  nie von dessen Zeichenaufrufen überschrieben.
- `pointer-events: none` ist entscheidend, sonst würde dieser unsichtbare
  Layer das Scrollen im darunterliegenden `#canvas-wrapper` blockieren.

---

## Teil 2: Der Proxy-Server (CORS-Problem)

### Das Problem

Die BAG-API bietet unter `api.idd.bag.admin.ch` u. a. einen
`data-controller` an (laut eigener Doku ausdrücklich **"in development"**).
Ein einfacher `GET`-Request auf diesen Server funktioniert direkt aus dem
Browser problemlos. Ein `POST`-Request mit JSON-Body dagegen scheitert mit
einem CORS-Fehler:

```
Preflight response is not successful. Status code: 404
Fetch API cannot load ... due to access control checks.
```

**Warum der Unterschied?** Ein einfacher `GET` ohne Custom-Header ist ein
sogenannter _"simple request"_ – der Browser schickt ihn direkt ab. Ein
`POST` mit `Content-Type: application/json` ist das nicht: Der Browser
schickt zuerst automatisch eine unsichtbare `OPTIONS`-Anfrage ("Preflight")
an denselben Pfad, um zu fragen "darf diese Website das?". Antwortet der
Server darauf nicht korrekt (hier: 404, weil der Endpoint noch kein
`OPTIONS` unterstützt), bricht der Browser ab, **bevor** der eigentliche
POST-Request überhaupt losgeschickt wird.

Das lässt sich von unserer Seite (Sketch-Code) aus **nicht reparieren** –
das Problem liegt serverseitig bei der BAG-API.

### Die Lösung: ein eigener Proxy

Ein kleiner Node-Server läuft lokal und übernimmt den Request
stellvertretend:

```
Browser (Sketch)  --POST-->  localhost:3000 (unser Proxy)  --POST-->  api.idd.bag.admin.ch
                  <--JSON---                               <--JSON---
```

Der entscheidende Punkt: **Server-zu-Server-Requests unterliegen keinen
CORS-Regeln.** CORS ist eine reine Browser-Sicherheitsmassnahme. Unser
Node-Proxy ist kein Browser – er darf die BAG-API also ganz normal per
`POST` ansprechen. Der Browser wiederum spricht nur noch **unseren
eigenen** Server an (`localhost:3000`), und dafür aktivieren wir CORS
explizit selbst (`app.use(cors())`), weil Sketch (z. B. Port 5500) und
Proxy (Port 3000) zwei unterschiedliche Origins sind.

### Der generische Proxy-Code

```js
app.all("/api/idd/*", async (req, res) => {
  const targetPath = req.originalUrl.replace("/api/idd", "");
  const targetUrl = BASE_URL + targetPath;
  // ... Request 1:1 an die BAG-API weiterreichen ...
});
```

Statt für jeden Endpoint eine eigene Route zu schreiben, fängt diese eine
Route **alles** unter `/api/idd/...` ab und spiegelt den Pfad 1:1 an
`https://api.idd.bag.admin.ch/...` weiter – Methode (`GET`/`POST`) und
Body werden unverändert durchgereicht. Im Sketch entspricht jede
BAG-API-URL also genau derselben URL, nur mit `localhost:3000/api/idd`
davor:

```
https://api.idd.bag.admin.ch/api/v1/data/sets
→ http://localhost:3000/api/idd/api/v1/data/sets

https://api.idd.bag.admin.ch/api/v1/data/lyme_borreliosis/cases/incValue/month
→ http://localhost:3000/api/idd/api/v1/data/lyme_borreliosis/cases/incValue/month
```

### Ausführen

```bash
npm install express cors
node server.js
```

Danach `index.html` z. B. über den VS-Code Live-Server öffnen (nicht per
Doppelklick als `file://`-URL – p5/`fetch` brauchen einen echten
HTTP-Kontext). Der Proxy muss dabei parallel laufen.

### Grenzen dieses Ansatzes

- Der Proxy ist für **lokale Entwicklung** gedacht, nicht für einen
  öffentlichen Produktiveinsatz (`cors()` ohne Einschränkung erlaubt
  _jeder_ Website, ihn zu benutzen).
- Er reicht Fehler der BAG-API im Wesentlichen unverändert durch
  (`res.status(response.status).json(data)`) – schlägt die BAG-API fehl,
  schlägt der Proxy in derselben Form fehl.
- Für den `export-controller` (als "fully functional" dokumentiert, liefert
  ganze CSV-Dateien) wäre in vielen Fällen gar kein Proxy nötig – dieser
  Weg wurde hier bewusst trotzdem gewählt, um gezielt einzelne,
  gefilterte Zeitreihen abzufragen, statt jedes Mal den kompletten
  Datensatz zu laden und selbst zu filtern.

---

## Dateien in diesem Projekt

| Datei        | Zweck                                                   |
| ------------ | ------------------------------------------------------- |
| `index.html` | DOM-Grundgerüst (siehe Teil 1)                          |
| `style.css`  | Layout, Zentrierung, Scroll-Container, Schatten-Overlay |
| `sketch.js`  | p5-Sketch: Daten laden, gruppieren (d3), zeichnen       |
| `server.js`  | lokaler CORS-Proxy zur BAG-API (siehe Teil 2)           |
