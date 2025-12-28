# Abitur-Planer Blankenese

Eine moderne Web-App zur Prognose der Abiturnote für Schüler*innen des Gymnasiums Blankenese in Hamburg.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1-cyan)

## 🎯 Features

### ✨ Kernfunktionen
- **📚 Profilwahl**: Auswahl aus 5 Profilen (Humanities, Kosmopolit, Kultur!, Netzwerk Erde, Wissenschaft in Bewegung)
- **🎓 Kernfach-Konfiguration**: Festlegung von zwei Kernfächern auf erhöhtem Niveau (eA) und einem auf grundlegendem Niveau (gA)
- **📝 Prüfungsfächer-Auswahl**: Intelligente Validierung aller Hamburg-Abitur-Constraints
- **📊 Noten-Matrix**: Übersichtliche Eingabe für alle 4 Semester (S1-S4)
- **🤖 Auto-Prognose**: Automatische Fortschreibung bisheriger Noten basierend auf Durchschnitt
- **🧮 Optimierungsalgorithmus**: Automatische Auswahl der besten 32-40 Noten für Block I
- **📈 Abiturberechnung**: Vollständige Berechnung von Block I, Block II und Gesamtqualifikation
- **💾 Speichern & Laden**: Persistierung deiner Berechnungen mit InstantDB

### 🎨 Besondere Features
- **Echtzeit-Validierung**: Sofortiges Feedback bei Regelverstößen
- **Interaktive Szenarien**: Was-wäre-wenn Analyse durch anpassbare Prüfungsnoten
- **Detaillierte Aufschlüsselung**: Transparente Darstellung aller Berechnungsschritte
- **Optimale Fächerauswahl**: Intelligenter Greedy-Algorithmus für beste Notenauswahl
- **Responsive Design**: Funktioniert auf Desktop, Tablet und Mobile

## 🚀 Tech Stack

- **Frontend**: React 19 + Vite 7
- **Styling**: Tailwind CSS 4
- **Backend**: InstantDB (real-time database)
- **Icons**: Lucide React
- **Build Tool**: Vite mit HMR
- **Package Manager**: npm

## 📋 Entwicklungsstand

### ✅ Fertig (Version 1.0)
- [x] Projekt-Setup mit Vite + React + Tailwind
- [x] InstantDB Integration & Schema
- [x] Profildaten aus Wegweiser übertragen
- [x] Profil-Auswahl UI (alle 5 Profile)
- [x] Kernfach-Auswahl UI mit Validierung
- [x] Prüfungsfächer-Auswahl mit vollständiger Constraint-Validierung
- [x] Noten-Matrix für S1-S4 mit Auto-Prognose
- [x] Block I Berechnung mit Optimierungsalgorithmus
- [x] Block II Berechnung (Abiturprüfungen)
- [x] Gesamtqualifikation und Notentabelle
- [x] Warnungen bei Regelverstößen
- [x] Ergebnis-Dashboard mit Visualisierung
- [x] **Persistierung mit InstantDB (Speichern & Laden)**

### 📅 Geplante Erweiterungen (Version 2.0)

#### Speicher- und Datenverwaltung
- [ ] **Auto-Save Funktion**: Automatisches Speichern bei Änderungen
- [ ] **Versionierung**: Änderungshistorie für gespeicherte Berechnungen
- [ ] **Export/Import**: JSON-Download und Upload für Offline-Backup
- [ ] **Datenmigration**: Update-Mechanismus für Schemaänderungen

#### Erweiterte Analyse-Features
- [ ] **Vergleichs-Modus**: Zwei oder mehr Szenarien nebeneinander vergleichen
- [ ] **Statistiken und Trend-Analysen**: Visualisierung der Notenentwicklung über Semester
- [ ] **Was-wäre-wenn-Rechner**: Interaktive Simulation verschiedener Notenszenarien
- [ ] **Zielvorgaben**: Berechnung benötigter Punkte für Wunschnote

#### Sharing und Kollaboration
- [ ] **Teilbare Links**: Öffentliche oder geschützte Links für Prognosen
- [ ] **PDF-Export**: Professionell formatierter Download der Abiturberechnung
- [ ] **Screenshot-Funktion**: Direkte Bildexporte der Ergebnisse

#### Fachliche Erweiterungen
- [ ] **Wahlbereich-Konfiguration**: Integration zusätzlicher Wahlfächer
- [ ] **Besondere Lernleistung (BLL)**: Integration der BLL in die Berechnung
- [ ] **Seminarfach**: Support für Seminarfächer in verschiedenen Profilen
- [ ] **Sprachdiplome**: Berücksichtigung von Sprachzertifikaten

#### UI/UX Verbesserungen
- [ ] **Dark Mode**: Dunkles Farbschema für Augen-schonendes Arbeiten
- [ ] **Onboarding-Tutorial**: Geführte Tour für neue Nutzer
- [ ] **Keyboard Shortcuts**: Schnellzugriff über Tastaturkürzel
- [ ] **Progressive Web App (PWA)**: Installation als native App
- [ ] **Offline-Modus**: Funktionsfähigkeit ohne Internetverbindung

#### Validierung und Feedback
- [ ] **Erweiterte Validierung**: Zusätzliche Constraints aus Prüfungsordnung
- [ ] **Tipps und Empfehlungen**: KI-basierte Vorschläge zur Notenverbesserung
- [ ] **Warnsystem**: Frühzeitige Warnungen bei Risiko des Nichtbestehens

## 🏃 Entwicklung starten

```bash
# Dependencies installieren
npm install

# Umgebungsvariable setzen (.env Datei bereits vorhanden)
# VITE_INSTANT_APP_ID ist bereits konfiguriert

# Dev-Server starten
npm run dev
# → öffnet http://localhost:5173

# Build für Production
npm run build

# Production Build lokal testen
npm run preview
```

## 📖 Abitur-Regelwerk

Die App basiert auf dem "Wegweiser zur Profiloberstufe" des Gymnasiums Blankenese und implementiert das **Hamburger Abitur-Regelwerk** vollständig:

### Block I (Semesternoten) - max. 600 Punkte
- **Anzahl**: Mindestens 32, höchstens 40 Semesterergebnisse
- **Pflichteinbringung**:
  - Alle 4 Abiturprüfungsfächer (je 4 Semester)
  - Alle 3 Kernfächer (je 4 Semester)
  - Mind. ein Fach aus: Kunst/Musik/Theater
  - Mind. ein Fach aus: Geschichte/Geographie/PGW
  - Mind. ein Fach aus: Physik/Chemie/Biologie
- **Doppelzählung**:
  - Profilgebendes Prüfungsfach zählt doppelt
  - Schriftliches eA-Kernfach zählt doppelt
- **Formel**: `E = P × 40 / S`
  - E = Ergebnis (max. 600)
  - P = Summe aller Punkte (inkl. Doppelzählungen)
  - S = Anzahl der Noten (inkl. Doppelzählungen)
- **Bestehen**: Mindestens 200 Punkte, max. 20% unter 5 Punkten

### Block II (Abiturprüfungen) - max. 300 Punkte
- **Prüfungen**: 3 schriftlich + 1 mündlich
- **Gewichtung**: Jede Prüfung zählt 5-fach
- **Formel**: `E = 5 × (PF1 + PF2 + PF3 + PF4)`
- **Bestehen**: Mindestens 100 Punkte, in zwei Fächern (davon eins eA) mind. 5 Punkte

### Gesamtqualifikation - max. 900 Punkte
- **Berechnung**: Block I + Block II
- **Notentabelle**:
  - 823-900 = 1,0
  - 300 = 4,0 (Mindestpunktzahl zum Bestehen)
- **Bestehen**: Mindestens 300 Punkte gesamt

## 🎯 Verwendung

### Beispiel-Workflow

1. **Profil wählen**: z.B. "Netzwerk Erde"
2. **Kernfächer festlegen**:
   - Deutsch (eA)
   - Mathematik (eA)
   - Englisch (gA)
3. **Prüfungsfächer wählen**:
   - Biologie (schriftlich, eA) - profilgebend
   - Deutsch (schriftlich, eA)
   - Mathematik (schriftlich, gA)
   - Geschichte (mündlich, gA)
4. **Noten eingeben**:
   - Bisherige Noten eintragen
   - "Prognose" für fehlende Semester nutzen
5. **Ergebnis ansehen**:
   - Automatische Berechnung
   - Optimale Fächerauswahl
   - Abiturnote und Punktzahl
   - Detaillierte Aufschlüsselung
6. **Berechnung speichern**:
   - Klick auf "Speichern" in der oberen rechten Ecke
   - Namen vergeben für späteres Wiederfinden
   - Beliebig viele Szenarien speichern

### Speichern & Laden

Die App nutzt **InstantDB** für die Persistierung deiner Berechnungen:

- **Speichern**: Klicke auf den "Speichern"-Button (oben rechts), vergib einen Namen und speichere deine aktuelle Berechnung
- **Laden**: Klicke auf "Laden", um alle gespeicherten Berechnungen zu sehen und eine auszuwählen
- **Verwalten**: In der Laden-Ansicht kannst du Berechnungen umbenennen oder löschen
- **Mehrere Szenarien**: Speichere verschiedene Fächerkombinationen und vergleiche sie

Die Daten werden automatisch mit der InstantDB-Cloud synchronisiert und sind dauerhaft verfügbar.

## 🔧 Projektstruktur

```
src/
├── components/
│   ├── ProfileSelector.jsx          # Profilwahl UI
│   ├── CoreSubjectSelector.jsx      # Kernfach-Konfiguration
│   ├── ExamSubjectSelector.jsx      # Prüfungsfach-Auswahl
│   ├── GradeMatrix.jsx              # Noten-Eingabe mit Auto-Prognose
│   ├── ResultsDashboard.jsx         # Ergebnis-Anzeige
│   └── SaveLoadManager.jsx          # Speichern & Laden Dialog
├── data/
│   ├── profiles.js                  # Profildefinitionen & Konstanten
│   └── examConstraints.js           # Validierungsregeln
├── utils/
│   ├── abiturCalculation.js         # Berechnungs-Engine
│   └── persistence.js               # Speichern/Laden Funktionen
├── lib/
│   └── instantdb.js                 # InstantDB Setup
├── App.jsx                          # Haupt-App mit Workflow
└── main.jsx                         # React Entry Point
```

## 🧮 Algorithmus-Details

### Block I Optimierung (Greedy-Algorithmus)

```javascript
1. Trenne Pflicht- von optionalen Noten
2. Sortiere optionale Noten absteigend
3. Fülle bis Minimum 32 Noten auf
4. Berechne E = P × 40 / S
5. Prüfe iterativ ob Noten 33-40 E verbessern
6. Stoppe wenn weiteres Hinzufügen E verschlechtert
```

### Doppelgewichtung
- Profilgebendes Prüfungsfach: Erhöht P und S jeweils um Notenwert
- Schriftliches eA-Kernfach: Erhöht P und S jeweils um Notenwert
- Beide Faktoren werden in Zähler (P) UND Nenner (S) berücksichtigt

## ⚠️ Wichtige Hinweise

- Die App dient zur **Prognose** und ersetzt nicht die offizielle Berechnung durch die Schule
- Alle Berechnungen basieren auf dem Wegweiser 2023 des Gymnasiums Blankenese
- Bei Änderungen der Prüfungsordnung muss die App aktualisiert werden
- Die `.env` Datei mit der InstantDB App-ID ist bereits vorhanden

## 🤝 Beitragen

Dieses Projekt wurde mit Claude Code entwickelt. Verbesserungsvorschläge sind willkommen!

## 📄 Lizenz

MIT License - Copyright (c) 2025

## 👨‍💻 Entwicklung

Entwickelt mit **Claude Code** (Claude Sonnet 4.5) für das Gymnasium Blankenese, Hamburg.

### Credits
- **Regelwerk**: Gymnasium Blankenese "Wegweiser zur Profiloberstufe"
- **Algorithmus-Konzept**: Gemini (Google)
- **Implementierung**: Claude Code (Anthropic)
- **Tech Stack**: React, Vite, Tailwind CSS, InstantDB

---

**Hinweis**: Diese App wurde entwickelt, um Schüler*innen bei der Planung ihres Abiturs zu unterstützen. Die Berechnungen sind nach bestem Wissen korrekt, aber die offizielle Notenberechnung erfolgt durch die Schule.
