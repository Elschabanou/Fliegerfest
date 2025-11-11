const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB URI aus .env.local
const MONGODB_URI = 'mongodb+srv://fliegerevents:FliegereventsPW2024!@library.ljxjrqs.mongodb.net/Fliegerfest?retryWrites=true&w=majority';

const PlaneSchema = new mongoose.Schema({
  hersteller: String,
  modell: String,
  bauweise: String,
  motorisierung: String,
  leistung: String,
  herkunftsland: String,
  markt: String,
  besonderheiten: String,
  imageurl: String // Extra Feld für Bild-URLs
});

const Plane = mongoose.model('Plane', PlaneSchema, 'planes');

async function importPlanes() {
  try {
    console.log('Verbinde mit MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB verbunden');

    // CSV-Datei einlesen
    const csvPath = path.join('C:', 'Users', 'felix', 'Downloads', 'ul-flugzeuge-europa.csv');
    console.log('Lese CSV-Datei:', csvPath);

    if (!fs.existsSync(csvPath)) {
      throw new Error('CSV-Datei nicht gefunden: ' + csvPath);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    console.log(`Gefunden: ${lines.length - 1} Datensätze (inkl. Header)`);

    // Header überspringen und Daten parsen
    const planes = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // CSV parsen (vereinfacht - geht von korrekt formatierten Daten aus)
      const columns = line.split(',');

      // Besonderheiten können Kommas enthalten - letzte Spalte zusammensetzen
      let besonderheiten = '';
      if (columns.length > 8) {
        besonderheiten = columns.slice(7).join(',');
        columns.splice(7);
        columns.push(besonderheiten);
      }

      const plane = {
        hersteller: columns[0]?.replace(/"/g, '').trim() || '',
        modell: columns[1]?.replace(/"/g, '').trim() || '',
        bauweise: columns[2]?.replace(/"/g, '').trim() || '',
        motorisierung: columns[3]?.replace(/"/g, '').trim() || '',
        leistung: columns[4]?.replace(/"/g, '').trim() || '',
        herkunftsland: columns[5]?.replace(/"/g, '').trim() || '',
        markt: columns[6]?.replace(/"/g, '').trim() || '',
        besonderheiten: columns[7]?.replace(/"/g, '').trim() || '',
        imageurl: '' // Leeres Feld für spätere Bild-URLs
      };

      planes.push(plane);
    }

    console.log(`Parsed ${planes.length} Flugzeuge`);

    // Vorherige Daten löschen
    console.log('Lösche vorhandene Daten...');
    await Plane.deleteMany({});
    console.log('✅ Vorhandene Daten gelöscht');

    // Neue Daten einfügen
    console.log('Füge neue Daten ein...');
    const result = await Plane.insertMany(planes);
    console.log(`✅ ${result.length} Flugzeuge erfolgreich importiert`);

    // Beispiel für ein importiertes Flugzeug anzeigen
    const sample = await Plane.findOne();
    console.log('\nBeispiel-Eintrag:');
    console.log(JSON.stringify(sample, null, 2));

  } catch (error) {
    console.error('❌ Fehler beim Import:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Verbindung geschlossen');
  }
}

importPlanes();
