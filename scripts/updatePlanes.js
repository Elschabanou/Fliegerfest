const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb+srv://fliegerevents:FliegereventsPW2024!@library.ljxjrqs.mongodb.net/Fliegerfest?retryWrites=true&w=majority';

const priceMap = new Map([
  ['BRM Aero|Bristell Classic', 230000],
  ['BRM Aero|Bristell RG', 260000],
  ['BRM Aero|Bristell B8', 240000],
  ['BRM Aero|B23 Energic', 380000],
  ['JMB Aircraft|VL3 Standard', 260000],
  ['JMB Aircraft|VL3 RG', 280000],
  ['JMB Aircraft|Phoenix', 215000],
  ['Comco Ikarus|C42 A', 135000],
  ['Comco Ikarus|C42 CS', 150000],
  ['Comco Ikarus|C42 C', 170000],
  ['Aerospool|WT9 Dynamic UL 600', 240000],
  ['Aerospool|WT9 Dynamic LSA', 255000],
  ['Breezer Aircraft|B400-6 Sport', 165000],
  ['Ellipse Aero|Hype', 230000],
  ['Ellipse Aero|Hype Carbon', 250000],
  ['Shark Aero|Shark 600', 320000],
  ['Tarragon Aircraft|Tarragon', 350000],
  ['Blackwing|BW 650 RG', 330000],
  ['Comco Ikarus|Weitere Modelle', 150000],
  ['Alpi Aviation|Pioneer 300', 200000],
  ['ICP|Savannah SR', 145000],
  ['Evektor|EV97 Eurostar', 160000],
  ['Tecnam|P92 Echo MkII', 180000],
  ['Tecnam|P2002 Sierra MkII', 210000],
  ['Flight Design|CTLS', 230000],
  ['Flight Design|F2', 260000],
  ['Remos|GX', 180000],
  ['Remos|GXeLITE', 190000],
  ['Remos|GXiS', 210000],
  ['Roland Aircraft|Z-602 Economy', 170000],
  ['Roland Aircraft|Z-602 Exclusiv', 190000],
  ['Roland Aircraft|Z-602 RG', 210000],
  ['Magnus Aircraft|Fusion 212', 240000],
  ['Magnus Aircraft|Fusion 213', 250000],
  ['Orličan|M-8 Eagle', 205000],
  ['Direct Fly|Alto NG', 190000],
  ['ATEC|321 Faeta NG', 220000],
  ['Junkers Aircraft|A50 Junior', 250000],
  ['Junkers Aircraft|A50 Heritage', 270000],
  ['Junkers Aircraft|A60', 260000],
  ['Kitplanes for Africa|Explorer UL 600', 185000],
  ['Kitplanes for Africa|Safari', 175000],
  ['Smartaero|Belmont DW200', 200000],
  ['TL Ultralight|TL 3000 Sirius', 225000],
  ['Zlín Aviation|Savage', 150000],
  ['SFS Leichtflugzeugbau|Vagabund', 145000],
  ['F.K. Lightplanes|FK9', 165000],
  ['F.K. Lightplanes|FK14', 190000],
  ['Aeroprakt|A32', 175000],
  ['Aeroprakt|A22 Junior', 150000],
  ['Roland Aircraft|G70', 185000],
  ['Porto Aviation|Risen', 300000],
  ['Spacek|SD-2 Sport', 185000],
  ['Leichtflugzeuge Huber|Superstol', 160000],
  ['AutoGyro|Cavalon', 130000],
  ['Pipistrel|Velis Electro', 210000],
]);

const planeSchema = new mongoose.Schema({}, { strict: false });
const Plane = mongoose.model('Plane', planeSchema, 'planes');

function normalizeLeistung(value) {
  if (!value) return value;
  const clean = value.replace(/[,]/g, '.');
  const rangeMatch = clean.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const start = Math.round(parseFloat(rangeMatch[1]));
    const end = Math.round(parseFloat(rangeMatch[2]));
    return `${start}-${end}`;
  }

  const numbers = clean.match(/\d+(?:\.\d+)?/g);
  if (!numbers) return value;

  const numeric = Math.round(parseFloat(numbers[0]));
  return String(numeric);
}

function deriveType(bauweise = '', modell = '') {
  const text = `${bauweise} ${modell}`.toLowerCase();

  if (
    text.includes('hochdecker') ||
    text.includes('schulterdecker') ||
    text.includes('ul 600') && text.includes('sirius') ||
    text.includes('superstol') ||
    text.includes('c42') ||
    text.includes('savage') ||
    text.includes('explorer') ||
    text.includes('safari') ||
    text.includes('velis') ||
    text.includes('f2') && text.includes('flight design') ||
    text.includes('a50') ||
    text.includes('a60') ||
    text.includes('vagabund') ||
    text.includes('a22') ||
    text.includes('a32') ||
    text.includes('g70') ||
    text.includes('cavalon')
  ) {
    return 'hochdecker';
  }

  if (text.includes('tiefdecker') || text.includes('tandem')) {
    return 'tiefdecker';
  }

  if (text.includes('gyrokopter') || text.includes('tragschrauber')) {
    return 'hochdecker';
  }

  // fallback
  return 'tiefdecker';
}

async function run() {
  const uri = process.env.MONGODB_URI || DEFAULT_URI;

  if (!uri) {
    throw new Error('Keine MongoDB-Verbindungszeichenfolge gefunden.');
  }

  await mongoose.connect(uri);

  const planes = await Plane.find({});

  const operations = planes.map((plane) => {
    const key = `${plane.hersteller || ''}|${plane.modell || ''}`;
    const preis = priceMap.get(key) || 180000;
    const leistung = normalizeLeistung(plane.leistung || '');
    const type = deriveType(plane.bauweise || '', plane.modell || '');

    return {
      updateOne: {
        filter: { _id: plane._id },
        update: {
          $set: {
            preis,
            leistung,
            type,
          },
        },
      },
    };
  });

  if (operations.length > 0) {
    const result = await Plane.bulkWrite(operations);
    console.log(`Aktualisierte Flugzeuge: ${result.modifiedCount}`);
  } else {
    console.log('Keine Flugzeuge gefunden.');
  }
}

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });



