# Fliegerevents

Eine moderne Webanwendung für Flugtage und Luftfahrt-Events, entwickelt mit Next.js, TypeScript, Tailwind CSS und MongoDB.

## Features

- 🎯 **Event-Verwaltung**: Erstellen, anzeigen und verwalten von Fliegerevents
- 👤 **Benutzerauthentifizierung**: Sichere Anmeldung und Registrierung
- 📍 **Standort-basierte Suche**: Events nach Ort und Typ filtern
- 📱 **Responsive Design**: Optimiert für Desktop und Mobile
- 🎨 **Moderne UI**: Schönes Design mit Tailwind CSS
- 🔒 **Sicherheit**: Passwort-Verschlüsselung und Authentifizierung

## Technologie-Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Datenbank**: MongoDB mit Mongoose
- **Authentifizierung**: NextAuth.js
- **Icons**: Lucide React

## Installation

### Voraussetzungen

- Node.js (Version 18 oder höher)
- MongoDB (lokal oder Cloud-Instanz)
- npm oder yarn

### 1. Repository klonen

\`\`\`bash
git clone <repository-url>
cd fliegerevents
\`\`\`

### 2. Abhängigkeiten installieren

\`\`\`bash
npm install
\`\`\`

### 3. Umgebungsvariablen konfigurieren

Erstellen Sie eine \`.env.local\` Datei im Projektverzeichnis:

\`\`\`env
MONGODB_URI=mongodb://localhost:27017/fliegerevents
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
\`\`\`

**Wichtige Hinweise:**
- Ersetzen Sie \`your-secret-key-here\` mit einem sicheren geheimen Schlüssel
- Verwenden Sie für die Produktion eine echte MongoDB-Instanz (z.B. MongoDB Atlas)

### 4. MongoDB starten

Stellen Sie sicher, dass MongoDB läuft:

\`\`\`bash
# Lokal
mongod

# Oder mit Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
\`\`\`

### 5. Anwendung starten

\`\`\`bash
npm run dev
\`\`\`

Die Anwendung ist nun unter [http://localhost:3000](http://localhost:3000) verfügbar.

## Verwendung

### Erste Schritte

1. **Registrierung**: Erstellen Sie ein neues Benutzerkonto
2. **Anmeldung**: Melden Sie sich mit Ihren Anmeldedaten an
3. **Event erstellen**: Klicken Sie auf "Event erstellen" um ein neues Event hinzuzufügen
4. **Events durchsuchen**: Nutzen Sie die Filter und Suchfunktionen

### Event-Typen

- **Flugtag**: Öffentliche Flugtage mit Vorführungen
- **Luftfahrt-Event**: Verschiedene Luftfahrt-Veranstaltungen
- **Workshop**: Lehrveranstaltungen und Schulungen
- **Vereinsveranstaltung**: Events von Flugsportvereinen
- **Sonstiges**: Andere luftfahrtbezogene Events

## Projektstruktur

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentifizierung
│   │   └── events/        # Event-Management
│   ├── auth/              # Authentifizierungsseiten
│   └── events/            # Event-Seiten
├── components/            # React-Komponenten
├── lib/                   # Utility-Funktionen
├── models/                # MongoDB-Modelle
└── types/                 # TypeScript-Typdefinitionen
\`\`\`

## API-Endpunkte

### Authentifizierung
- \`POST /api/auth/register\` - Benutzerregistrierung
- \`POST /api/auth/[...nextauth]\` - NextAuth.js Endpunkte

### Events
- \`GET /api/events\` - Alle Events abrufen
- \`POST /api/events\` - Neues Event erstellen
- \`GET /api/events/[id]\` - Event-Details abrufen
- \`PUT /api/events/[id]\` - Event aktualisieren
- \`DELETE /api/events/[id]\` - Event löschen

## Entwicklung

### Code-Qualität

\`\`\`bash
# Linting
npm run lint

# Type-Checking
npm run type-check
\`\`\`

### Build für Produktion

\`\`\`bash
npm run build
npm start
\`\`\`

## Beitragen

1. Fork des Repositories
2. Feature-Branch erstellen (\`git checkout -b feature/AmazingFeature\`)
3. Änderungen committen (\`git commit -m 'Add some AmazingFeature'\`)
4. Branch pushen (\`git push origin feature/AmazingFeature\`)
5. Pull Request erstellen

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe die \`LICENSE\` Datei für Details.

## Support

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im Repository oder kontaktieren Sie den Entwickler.

---

**Entwickelt mit ❤️ für die Flieger-Community**