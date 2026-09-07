# Mini-Boilerplate: Tailwind + Swiss Confederation Designsystem

Reduziertes Boilerplate ohne p5.js und ohne Datenladen — Fokus liegt
ausschliesslich auf dem Zusammenspiel von **Tailwind** und dem
**Swiss Confederation Designsystem** für ein **responsives Layout**
(`section`, `container`, `container--grid`, `grid--responsive-cols-*`).

Siehe auch die offizielle Doku:
[HTML Structure](https://swiss.github.io/designsystem/?path=/docs/doc-for-developers-html-structure--docs) /
[Layouts – General](https://swiss.github.io/designsystem/?path=/docs/layouts-general--docs).

## Setup (einmalig)

Voraussetzung: [Node.js](https://nodejs.org/) (LTS-Version reicht).

```bash
npm install
npm run build-css
```

Das erzeugt `dist/main.css` aus den Design-System-Quellen (`css/`) + dem
Tailwind-Theme (`tailwind.config.js`).

## Während der Entwicklung

```bash
npm run watch-css
```

baut `dist/main.css` automatisch neu, sobald ihr `css/*.postcss`,
`tailwind.config.js` oder `index.html` ändert.

Öffnet `index.html` am besten mit der VS-Code-Erweiterung **Live Server**
(Rechtsklick auf `index.html` → "Open with Live Server").

## Struktur

```
index.html              Hauptseite: section/container/grid-Beispiele
css/                     Design-System-Quellen (PostCSS), unverändert aus
                         github.com/swiss/designsystem übernommen
tailwind.config.js       Tailwind-Theme des Designsystems
postcss.config.js        PostCSS-Pipeline (postcss-import, tailwindcss,
                         autoprefixer, cssnano)
dist/
  main.css               Generierte CSS-Datei (durch npm run build-css)
assets/
  logos/BundLogo.svg     Logo Schweizerische Eidgenossenschaft
```

## Was kommt von Tailwind, was vom Designsystem?

Für die Erklärung im Unterricht hilfreich: Tailwind liefert nur die
**generischen Bausteine** (Utility-Klassen, Build-Pipeline, Config-Format).
Alle **Klassennamen und Design-Entscheidungen**, die ihr im HTML seht
(`container`, `card`, `top-bar`, `grid--responsive-cols-2`, …), stammen aus
dem Swiss Confederation Designsystem und liegen unverändert als PostCSS-
Quelltext in `css/` vor.

**Direkt von Tailwind (generisch, in jedem Tailwind-Projekt gleich):**

| Datei/Zeile | Was |
|---|---|
| `postcss.config.js` → `tailwindcss`, `tailwindcss/nesting` | Tailwind-Plugins für PostCSS |
| `postcss.config.js` → `postcss-import`, `autoprefixer`, `cssnano` | allgemeine PostCSS-Plugins (kein Tailwind, aber Standard-Werkzeuge jeder CSS-Build-Pipeline) |
| `css/main.postcss` → `@import 'tailwindcss/base'` / `components` / `utilities` | die drei Tailwind-Layer selbst |
| `tailwind.config.js` → Grundstruktur (`content`, `theme`, `theme.extend`, `corePlugins`) | Tailwind-Config-Format |
| jede Utility-Klasse im HTML wie `flex`, `p-4`, `text-3xl`, `hidden`, `md:inline`, `gap-4` | von Tailwind generierte Utility-Klassen (Namen/Werte kommen zwar aus dem Theme, aber das Utility-Prinzip selbst ist Tailwind) |

**Vom Swiss Confederation Designsystem (projektspezifisch, 1:1 aus [github.com/swiss/designsystem](https://github.com/swiss/designsystem) übernommen):**

| Datei/Ordner | Was |
|---|---|
| `css/skins/*.postcss` | Farbthemen (default / intranet / freebrand) als CSS-Variablen |
| `css/foundations/*.postcss` | Basis-Stile: Icons, Typografie, Fonts, Spacings, Backgrounds, Colors, Global-Resets — nutzen intern `@apply`, definieren aber eigene, designsystem-spezifische Klassen (z.B. `.icon`, `.icon--lg`) |
| `css/layouts/*.postcss` | Layout-Bausteine: `container`, `container--grid`, `grid--responsive-cols-*`, `section`, `ratio`, `sticky` — das eigentliche Responsive-Konzept dieses Boilerplates |
| `css/components/*.postcss` | UI-Komponenten wie `btn`, `card`, `accordion`, `table`, `badge`, … |
| `css/navigations/*.postcss` | Navigations-Komponenten (`main-navigation`, `meta-navigation`, …) |
| `css/sections/*.postcss` | Seitenbereiche (`top-bar`, `top-header`, `footer`, `hero`, …) |
| `css/print.postcss`, `css/storybook.postcss` | Druck-Stile bzw. Storybook-spezifische Hilfsstile |
| `tailwind.config.js` → Werte innerhalb von `theme` (Farben als `var(--color-primary-500)`, `fontSize`, `fontFamily`, `boxShadow`, `borderRadius`, `screens`, `container`) | die eigentlichen Design-Tokens des Bundes — Tailwind liefert nur den Mechanismus, die Werte kommen vom Designsystem |

Kurz gesagt: **Ordnerstruktur, Klassennamen und Design-Tokens** → Designsystem.
**Build-Mechanik und das Utility-Prinzip** → Tailwind.

## Die wichtigsten Layout-Klassen

- `.section` / `.section--default` — steuert vertikale Abstände
- `.container` — steuert horizontale Abstände + maximale Breite
- `.container--grid` — macht aus `.container` ein 12-Spalten-Grid
- `.container__full`, `.container__center--xs/sm/md` — Platzierung
  innerhalb des 12-Spalten-Grids
- `.grid--responsive-cols-2/3/4` — 1 Spalte mobil, mehr Spalten ab
  grösseren Breakpoints
- `.grid--responsive-cols-1/3-2/3` (und weitere Kombinationen) — feste
  Spaltenverhältnisse für z.B. Sidebar-Layouts
- `.gap--responsive` — Abstand zwischen Grid-Elementen, wächst mit dem
  Breakpoint

Passt in `index.html` Inhalte/Boxen an, um die Layout-Klassen selbst
auszuprobieren — die eigentliche Logik steckt komplett im CSS, es braucht
kein JavaScript.

## Design-System-Komponenten & Icons

Alle Komponenten-Klassen (`btn`, `card`, `input`, `select`, `navbar`,
`accordion`, `table`, `badge`, …) stehen unverändert zur Verfügung — siehe
[Designsystem-Dokumentation](https://github.com/swiss/designsystem).

## Tailwind-Theme anpassen

Farben, Schriftgrössen, Radien usw. sind in `tailwind.config.js` definiert
(1:1 aus dem Original-Designsystem übernommen). Eigene Werte gehören unter
`theme.extend` (siehe Kommentare dort), damit das Designsystem-Theme
darunter nicht überschrieben wird.
