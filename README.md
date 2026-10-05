# hs26-share5

Repo für die Inputs von hs26-share5. Jeder Ordner enthält ein Beispiel.

## Beispiele ansehen

Alle Beispiele laufen direkt im Browser:

**https://hslu-dda.github.io/hs26-share5/**

Die Übersichtsseite listet alle Ordner automatisch auf. Ein einzelnes Beispiel erreichst du unter `https://hslu-dda.github.io/hs26-share5/<ordnername>/`.

## Lokal starte n

Repo klonen und den Ordner eines Beispiels mit einem lokalen Server öffnen, zum Beispiel mit der VS-Code-Erweiterung **Live Server**.

```bash
git clone https://github.com/hslu-dda/hs26-share5.git
```

---

# Git & GitHub Cheatsheet für Creative Coders

Git speichert Versionen deines Codes. GitHub ist einer der (propriäteren) Orte im Internet, wo diese Versionen liegen.
Alle Befehle tippst du ins Terminal (in VS Code: _Terminal → New Terminal_).

---

## Die wichtigsten Begriffe

| Begriff               | Bedeutung                                                       |
| --------------------- | --------------------------------------------------------------- |
| **Repository (Repo)** | Ein Projektordner, den Git überwacht                            |
| **Commit**            | Ein gespeicherter Zwischenstand (wie ein Speicherpunkt im Game) |
| **Branch**            | Eine Parallelversion deines Projekts zum Ausprobieren           |
| **Remote / origin**   | Die Kopie deines Repos auf GitHub                               |
| **Clone**             | Ein Repo von GitHub auf deinen Computer kopieren                |
| **Push / Pull**       | Hochladen zu GitHub / Herunterladen von GitHub                  |

---

## 0. Einmalig einrichten

```bash
git config --global user.name "Dein Name"
git config --global user.email "deine@email.ch"
```

Nimm dieselbe E-Mail wie bei deinem GitHub-Account.

---

## 1. Repositories holen und aktuell halten

**Einmal klonen:**

```bash
cd ~/Documents                  # oder eben euer wunschpfad wohin der Ordner soll
git clone https://github.com/USER/REPO.git
```

**Updates holen :**

```bash
cd REPO   # nicht nötig im terminal von VS code weil ihr ja schon da seid
git pull
```

> ⚠️ **Wichtig:** Ändere nichts direkt in Repos, an denen ihr nicht arbeitet. Also z.b in unseren.
> Vielmehr kopiere Beispiele, die du verändern willst, in deinen **eigenen** Projektordner. Sonst kann `git pull` Konflikte geben.

---

## 2. Eigenes Projekt tracken

**Projekt starten** (einmal pro Projekt, im Projektordner):

```bash
cd mein-projekt
git init
printf ".DS_Store\nnode_modules/\n" > .gitignore
```

Die letzte Zeile erstellt eine `.gitignore`-Datei, damit Mac-Systemdateien (`.DS_Store`) und `node_modules/` nicht im Repo landen.

**Der tägliche Ablauf:**

```bash
git status                       # Was hat sich geändert?
git add .                        # Alle Änderungen vormerken
git commit -m "Partikel bewegen sich jetzt"   # Speicherpunkt setzen
```

Tipp: Lieber oft committen, mit kurzer, klarer Nachricht.

**Verlauf ansehen:**

```bash
git log --oneline
```

**Einen Commit rückgängig machen** (die ID findest du mit `git log --oneline`):

```bash
git revert 4492880a # die nummer ist deine id
```

Das erstellt einen neuen Commit, der die Änderungen aufhebt. Nichts wird gelöscht, darum ist es auch sicher, wenn der Commit schon auf GitHub ist.

**Eine Datei auf den letzten Commit zurücksetzen 💀:**

```bash
git restore sketch.js
```

---

## 3. Eigenes Projekt auf GitHub

1. Auf github.com: **New repository** → Namen geben → **ohne** README erstellen
2. Die angezeigte URL kopieren, dann:

```bash
git remote add origin https://github.com/DEINNAME/mein-projekt.git
git branch -M main
git push -u origin main
```

Danach reicht nach jedem Commit:

```bash
git push
```

Beim ersten Push öffnet sich meist ein Browserfenster zum Einloggen.

---

## 4. Branches: Experimente ohne Risiko

```bash
git branch                       # Welche Branches gibt es? (* = aktueller)
git switch -c experiment         # Neuen Branch erstellen und wechseln
git switch main                  # Zurück zu main
git switch experiment            # Wieder zum Experiment
```

**Experiment hat geklappt? In main übernehmen:**

```bash
git switch main
git merge experiment
```

**Experiment war nichts? Löschen:**

```bash
git branch -D experiment
```

**Branch auf GitHub hochladen:**

```bash
git push -u origin experiment
```

> Vor dem Wechseln immer committen – sonst nimmt Git deine offenen Änderungen mit oder verweigert den Wechsel.

---

## 5. Nützlich: `.gitignore`

Eine Datei namens `.gitignore` im Projektordner sagt Git, was es ignorieren soll:

```
.DS_Store
node_modules/
*.mp4
```

Grosse Videos, Exporte und Systemdateien gehören nicht ins Repo.

---

## Spickzettel in einem Blick

| Ich will …            | Befehl                              |
| --------------------- | ----------------------------------- |
| Repo herunterladen    | `git clone URL`                     |
| Updates holen         | `git pull`                          |
| Status sehen          | `git status`                        |
| Speicherpunkt setzen  | `git add .` → `git commit -m "..."` |
| Hochladen             | `git push`                          |
| Neuen Branch          | `git switch -c name`                |
| Branch wechseln       | `git switch name`                   |
| Branch zusammenführen | `git merge name`                    |
| Verlauf               | `git log --oneline`                 |
| Änderungen verwerfen  | `git restore datei`                 |
