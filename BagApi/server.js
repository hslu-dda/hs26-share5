// ============================================================================
// Lokaler CORS-Proxy zur BAG IDD-API
//
// Warum das nötig ist (Details siehe README, Teil 2):
// api.idd.bag.admin.ch erlaubt einfache GET-Requests direkt aus dem
// Browser, blockiert aber POST-Requests mit JSON-Body per CORS-Preflight
// (der data-controller ist laut eigener Doku noch "in development").
// Dieser Server läuft NICHT im Browser und unterliegt deshalb keinen
// CORS-Regeln - er kann die BAG-API also ganz normal per POST ansprechen
// und die Antwort an unseren Sketch weiterreichen.
//
// Nur für lokale Entwicklung gedacht, nicht für einen öffentlichen Server!
// ============================================================================

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json()); // parst eingehende JSON-Bodies in req.body
app.use(cors()); // erlaubt Zugriff von einer anderen Origin (z.B. Live-Server-Port)

const BASE_URL = "https://api.idd.bag.admin.ch";

// Fängt ALLES unter /api/idd/... ab, egal welcher Pfad dahinter kommt, und
// spiegelt Methode + Pfad + Body 1:1 an die echte BAG-API weiter. So muss
// diese Datei nicht angepasst werden, wenn im Sketch ein anderer
// Endpoint (andere Krankheit, export-controller, version-controller, ...)
// angesprochen wird.
app.all("/api/idd/*", async (req, res) => {
  const targetPath = req.originalUrl.replace("/api/idd", "");
  const targetUrl = BASE_URL + targetPath;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      // GET/HEAD dürfen keinen Body haben, sonst 1:1 durchreichen
      body: req.method === "GET" || req.method === "HEAD" ? undefined : JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Proxy läuft auf http://localhost:3000");
});
