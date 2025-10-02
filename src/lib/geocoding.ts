/**
 * Geocoding service using OpenStreetMap Nominatim API
 * Converts location names/addresses to latitude/longitude coordinates
 */

export interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
  importance?: number;
}

export interface GeocodingError {
  error: string;
}

/**
 * Geocode a location string to coordinates using Nominatim API
 * @param query - Location name or address (e.g., "Friedrichshafen", "Berlin, Germany")
 * @param countryCode - Optional country code to limit results (e.g., "de" for Germany)
 * @returns Promise with coordinates or error
 */
export async function geocodeLocation(
  query: string, 
  countryCode: string = 'de'
): Promise<GeocodingResult | GeocodingError> {
  if (!query || query.trim().length === 0) {
    return { error: 'Bitte geben Sie einen Ort ein' };
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&countrycodes=${countryCode}&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Fliegerevents App (contact: admin@fliegerevents.de)'
      }
    });

    if (!response.ok) {
      return { error: `API-Fehler: ${response.status}` };
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      return { error: `Ort "${query}" nicht gefunden` };
    }

    const result = data[0];
    return {
      lat: result.lat,
      lon: result.lon,
      display_name: result.display_name,
      place_id: result.place_id,
      importance: result.importance
    };

  } catch (error) {
    console.error('Geocoding error:', error);
    return { error: 'Fehler beim Abrufen der Koordinaten' };
  }
}

/**
 * Batch geocode multiple locations
 * @param locations - Array of location strings
 * @param delay - Delay between requests in ms (to respect rate limits)
 * @returns Promise with array of results
 */
export async function geocodeMultipleLocations(
  locations: string[], 
  delay: number = 1000
): Promise<(GeocodingResult | GeocodingError)[]> {
  const results: (GeocodingResult | GeocodingError)[] = [];
  
  for (let i = 0; i < locations.length; i++) {
    const result = await geocodeLocation(locations[i]);
    results.push(result);
    
    // Add delay between requests to respect Nominatim's usage policy
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

/**
 * Check if a geocoding result is successful
 */
export function isGeocodingSuccess(result: GeocodingResult | GeocodingError): result is GeocodingResult {
  return 'lat' in result && 'lon' in result;
}
