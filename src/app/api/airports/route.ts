import { NextRequest, NextResponse } from 'next/server';

interface Airport {
  icao: string;
  iata: string | null;
  name: string;
  lat: number;
  lon: number;
  type: string;
  municipality: string | null;
  country: string | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const minLat = searchParams.get('minLat');
  const maxLat = searchParams.get('maxLat');
  const minLon = searchParams.get('minLon');
  const maxLon = searchParams.get('maxLon');
  const loadAll = searchParams.get('loadAll') === 'true';
  
  // Bounding Box für Filterung
  const bounds = minLat && maxLat && minLon && maxLon ? {
    minLat: parseFloat(minLat),
    maxLat: parseFloat(maxLat),
    minLon: parseFloat(minLon),
    maxLon: parseFloat(maxLon),
  } : null;

  // Bounding Box für Deutschland und umliegende Länder (Mitteleuropa)
  // ca. 47-55°N, 5-15°E (Deutschland, Österreich, Schweiz, Frankreich, Belgien, Niederlande, Luxemburg, Polen, Tschechien, Dänemark)
  const centralEuropeBounds = {
    minLat: 47.0,
    maxLat: 55.0,
    minLon: 5.0,
    maxLon: 15.0,
  };
  try {
    // Lade die CSV-Datei von GitHub
    const response = await fetch('https://raw.githubusercontent.com/komed3/airportmap-database/master/airport.csv', {
      next: { revalidate: 86400 } // Cache für 24 Stunden
    });

    if (!response.ok) {
      throw new Error('Fehler beim Laden der Flughafen-Daten');
    }

    const csvText = await response.text();
    
    // Parse CSV
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    
    const airports: Airport[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Einfaches CSV-Parsing (berücksichtigt Anführungszeichen)
      const values: string[] = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue);
      
      if (values.length < headers.length) continue;
      
      const icao = values[0]?.replace(/"/g, '') || '';
      const iata = values[1]?.replace(/"/g, '') || null;
      const name = values[4]?.replace(/"/g, '') || '';
      const latStr = values[8]?.replace(/"/g, '') || '';
      const lonStr = values[9]?.replace(/"/g, '') || '';
      const type = values[5]?.replace(/"/g, '') || '';
      const municipality = values[16]?.replace(/"/g, '') || null;
      const country = values[14]?.replace(/"/g, '') || null;
      
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      
      // Nur Flughäfen mit gültigen Koordinaten hinzufügen
      if (icao && !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
        // Nur europäische Flughäfen (ungefähr: 35-72°N, -10°W bis 40°E)
        const isInEurope = lat >= 35 && lat <= 72 && lon >= -10 && lon <= 40;
        
        if (!isInEurope) continue;
        
        // Wenn loadAll=true, lade alle Flugplätze von Deutschland und umliegenden Ländern
        if (loadAll) {
          const isInCentralEurope = lat >= centralEuropeBounds.minLat && 
                                   lat <= centralEuropeBounds.maxLat && 
                                   lon >= centralEuropeBounds.minLon && 
                                   lon <= centralEuropeBounds.maxLon;
          
          if (isInCentralEurope) {
            airports.push({
              icao,
              iata: iata && iata !== 'NULL' ? iata : null,
              name,
              lat,
              lon,
              type,
              municipality,
              country,
            });
          }
        } else if (bounds) {
          // Filter nach Bounding Box, falls vorhanden
          if (lat >= bounds.minLat && lat <= bounds.maxLat && 
              lon >= bounds.minLon && lon <= bounds.maxLon) {
            airports.push({
              icao,
              iata: iata && iata !== 'NULL' ? iata : null,
              name,
              lat,
              lon,
              type,
              municipality,
              country,
            });
          }
        } else {
          // Keine Bounds = alle europäischen Flughäfen (Fallback)
          airports.push({
            icao,
            iata: iata && iata !== 'NULL' ? iata : null,
            name,
            lat,
            lon,
            type,
            municipality,
            country,
          });
        }
      }
    }
    
    return NextResponse.json({ airports }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('Fehler beim Laden der Flughäfen:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Flughäfen', airports: [] },
      { status: 500 }
    );
  }
}

