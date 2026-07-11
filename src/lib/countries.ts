import type { CountryLocation } from "./types";

/**
 * Representative coordinates (usually the capital) and a rough pollen "climate profile"
 * per country, used only as the offline seasonal-estimate fallback when live station data
 * isn't available (see seasonalModel.ts). Intensity is a relative ceiling, not a scientific
 * measurement — tune it in Settings if it doesn't match what you experience locally.
 */
export const COUNTRIES: CountryLocation[] = [
  { id: "gb", name: "United Kingdom", region: "Europe", lat: 51.5072, lon: -0.1276, hemisphere: "N", climate: { intensity: { tree: 1.1, grass: 1.4, weed: 0.7 } } },
  { id: "ie", name: "Ireland", region: "Europe", lat: 53.3498, lon: -6.2603, hemisphere: "N", climate: { intensity: { tree: 1.0, grass: 1.4, weed: 0.6 } } },
  { id: "fr", name: "France", region: "Europe", lat: 48.8566, lon: 2.3522, hemisphere: "N", climate: { intensity: { tree: 1.2, grass: 1.2, weed: 1.0 } } },
  { id: "de", name: "Germany", region: "Europe", lat: 52.52, lon: 13.405, hemisphere: "N", climate: { intensity: { tree: 1.2, grass: 1.2, weed: 1.1 } } },
  { id: "nl", name: "Netherlands", region: "Europe", lat: 52.3676, lon: 4.9041, hemisphere: "N", climate: { intensity: { tree: 1.1, grass: 1.4, weed: 0.8 } } },
  { id: "be", name: "Belgium", region: "Europe", lat: 50.8503, lon: 4.3517, hemisphere: "N", climate: { intensity: { tree: 1.1, grass: 1.3, weed: 0.9 } } },
  { id: "es", name: "Spain", region: "Europe", lat: 40.4168, lon: -3.7038, hemisphere: "N", climate: { intensity: { tree: 1.3, grass: 1.0, weed: 0.9 } } },
  { id: "pt", name: "Portugal", region: "Europe", lat: 38.7223, lon: -9.1393, hemisphere: "N", climate: { intensity: { tree: 1.2, grass: 1.0, weed: 0.7 } } },
  { id: "it", name: "Italy", region: "Europe", lat: 41.9028, lon: 12.4964, hemisphere: "N", climate: { intensity: { tree: 1.3, grass: 1.0, weed: 0.9 } } },
  { id: "ch", name: "Switzerland", region: "Europe", lat: 46.9480, lon: 7.4474, hemisphere: "N", climate: { intensity: { tree: 1.2, grass: 1.1, weed: 0.8 } } },
  { id: "at", name: "Austria", region: "Europe", lat: 48.2082, lon: 16.3738, hemisphere: "N", climate: { intensity: { tree: 1.2, grass: 1.1, weed: 1.0 } } },
  { id: "pl", name: "Poland", region: "Europe", lat: 52.2297, lon: 21.0122, hemisphere: "N", climate: { intensity: { tree: 1.1, grass: 1.1, weed: 1.2 } } },
  { id: "cz", name: "Czechia", region: "Europe", lat: 50.0755, lon: 14.4378, hemisphere: "N", climate: { intensity: { tree: 1.1, grass: 1.1, weed: 1.1 } } },
  { id: "hu", name: "Hungary", region: "Europe", lat: 47.4979, lon: 19.0402, hemisphere: "N", climate: { intensity: { tree: 1.0, grass: 1.0, weed: 1.4 } } },
  { id: "se", name: "Sweden", region: "Europe", lat: 59.3293, lon: 18.0686, hemisphere: "N", climate: { intensity: { tree: 1.2, grass: 1.0, weed: 0.5 } } },
  { id: "no", name: "Norway", region: "Europe", lat: 59.9139, lon: 10.7522, hemisphere: "N", climate: { intensity: { tree: 1.1, grass: 0.9, weed: 0.4 } } },
  { id: "dk", name: "Denmark", region: "Europe", lat: 55.6761, lon: 12.5683, hemisphere: "N", climate: { intensity: { tree: 1.1, grass: 1.2, weed: 0.6 } } },
  { id: "fi", name: "Finland", region: "Europe", lat: 60.1699, lon: 24.9384, hemisphere: "N", climate: { intensity: { tree: 1.2, grass: 0.9, weed: 0.4 } } },
  { id: "gr", name: "Greece", region: "Europe", lat: 37.9838, lon: 23.7275, hemisphere: "N", climate: { intensity: { tree: 1.1, grass: 0.9, weed: 0.8 } } },
  { id: "ro", name: "Romania", region: "Europe", lat: 44.4268, lon: 26.1025, hemisphere: "N", climate: { intensity: { tree: 1.0, grass: 1.0, weed: 1.4 } } },
  { id: "ua", name: "Ukraine", region: "Europe", lat: 50.4501, lon: 30.5234, hemisphere: "N", climate: { intensity: { tree: 1.0, grass: 1.0, weed: 1.3 } } },
  { id: "ru", name: "Russia", region: "Europe/Asia", lat: 55.7558, lon: 37.6173, hemisphere: "N", climate: { intensity: { tree: 1.1, grass: 0.9, weed: 1.0 } } },
  { id: "us", name: "United States", region: "North America", lat: 38.9072, lon: -77.0369, hemisphere: "N", climate: { intensity: { tree: 1.2, grass: 1.2, weed: 1.3 } } },
  { id: "ca", name: "Canada", region: "North America", lat: 45.4215, lon: -75.6972, hemisphere: "N", climate: { intensity: { tree: 1.1, grass: 1.0, weed: 1.1 } } },
  { id: "mx", name: "Mexico", region: "North America", lat: 19.4326, lon: -99.1332, hemisphere: "N", climate: { intensity: { tree: 0.9, grass: 0.9, weed: 0.9 }, tropical: true } },
  { id: "br", name: "Brazil", region: "South America", lat: -15.7939, lon: -47.8828, hemisphere: "S", climate: { intensity: { tree: 0.6, grass: 0.8, weed: 0.6 }, tropical: true } },
  { id: "ar", name: "Argentina", region: "South America", lat: -34.6037, lon: -58.3816, hemisphere: "S", climate: { intensity: { tree: 1.0, grass: 1.2, weed: 1.0 } } },
  { id: "cl", name: "Chile", region: "South America", lat: -33.4489, lon: -70.6693, hemisphere: "S", climate: { intensity: { tree: 0.9, grass: 1.0, weed: 0.8 } } },
  { id: "co", name: "Colombia", region: "South America", lat: 4.7110, lon: -74.0721, hemisphere: "N", climate: { intensity: { tree: 0.6, grass: 0.7, weed: 0.5 }, tropical: true } },
  { id: "pe", name: "Peru", region: "South America", lat: -12.0464, lon: -77.0428, hemisphere: "S", climate: { intensity: { tree: 0.6, grass: 0.7, weed: 0.5 }, tropical: true } },
  { id: "za", name: "South Africa", region: "Africa", lat: -25.7479, lon: 28.2293, hemisphere: "S", climate: { intensity: { tree: 0.9, grass: 1.1, weed: 0.9 } } },
  { id: "eg", name: "Egypt", region: "Africa", lat: 30.0444, lon: 31.2357, hemisphere: "N", climate: { intensity: { tree: 0.5, grass: 0.5, weed: 1.0 } } },
  { id: "ng", name: "Nigeria", region: "Africa", lat: 9.0765, lon: 7.3986, hemisphere: "N", climate: { intensity: { tree: 0.5, grass: 0.6, weed: 0.6 }, tropical: true } },
  { id: "ke", name: "Kenya", region: "Africa", lat: -1.2921, lon: 36.8219, hemisphere: "S", climate: { intensity: { tree: 0.6, grass: 0.8, weed: 0.6 }, tropical: true } },
  { id: "ma", name: "Morocco", region: "Africa", lat: 33.9716, lon: -6.8498, hemisphere: "N", climate: { intensity: { tree: 0.8, grass: 0.7, weed: 0.7 } } },
  { id: "ae", name: "United Arab Emirates", region: "Middle East", lat: 24.4539, lon: 54.3773, hemisphere: "N", climate: { intensity: { tree: 0.4, grass: 0.3, weed: 0.6 } } },
  { id: "sa", name: "Saudi Arabia", region: "Middle East", lat: 24.7136, lon: 46.6753, hemisphere: "N", climate: { intensity: { tree: 0.4, grass: 0.3, weed: 0.7 } } },
  { id: "il", name: "Israel", region: "Middle East", lat: 31.7683, lon: 35.2137, hemisphere: "N", climate: { intensity: { tree: 0.9, grass: 0.8, weed: 0.9 } } },
  { id: "tr", name: "Türkiye", region: "Middle East", lat: 39.9334, lon: 32.8597, hemisphere: "N", climate: { intensity: { tree: 1.1, grass: 1.0, weed: 1.1 } } },
  { id: "in", name: "India", region: "Asia", lat: 28.6139, lon: 77.2090, hemisphere: "N", climate: { intensity: { tree: 0.7, grass: 0.9, weed: 0.8 }, tropical: true } },
  { id: "cn", name: "China", region: "Asia", lat: 39.9042, lon: 116.4074, hemisphere: "N", climate: { intensity: { tree: 1.1, grass: 1.0, weed: 1.1 } } },
  { id: "jp", name: "Japan", region: "Asia", lat: 35.6762, lon: 139.6503, hemisphere: "N", climate: { intensity: { tree: 1.4, grass: 0.9, weed: 0.7 } } },
  { id: "kr", name: "South Korea", region: "Asia", lat: 37.5665, lon: 126.9780, hemisphere: "N", climate: { intensity: { tree: 1.2, grass: 0.8, weed: 0.8 } } },
  { id: "th", name: "Thailand", region: "Asia", lat: 13.7563, lon: 100.5018, hemisphere: "N", climate: { intensity: { tree: 0.5, grass: 0.7, weed: 0.5 }, tropical: true } },
  { id: "id", name: "Indonesia", region: "Asia", lat: -6.2088, lon: 106.8456, hemisphere: "S", climate: { intensity: { tree: 0.4, grass: 0.6, weed: 0.4 }, tropical: true } },
  { id: "sg", name: "Singapore", region: "Asia", lat: 1.3521, lon: 103.8198, hemisphere: "N", climate: { intensity: { tree: 0.4, grass: 0.5, weed: 0.4 }, tropical: true } },
  { id: "my", name: "Malaysia", region: "Asia", lat: 3.1390, lon: 101.6869, hemisphere: "N", climate: { intensity: { tree: 0.4, grass: 0.6, weed: 0.4 }, tropical: true } },
  { id: "ph", name: "Philippines", region: "Asia", lat: 14.5995, lon: 120.9842, hemisphere: "N", climate: { intensity: { tree: 0.4, grass: 0.6, weed: 0.4 }, tropical: true } },
  { id: "vn", name: "Vietnam", region: "Asia", lat: 21.0278, lon: 105.8342, hemisphere: "N", climate: { intensity: { tree: 0.5, grass: 0.7, weed: 0.5 }, tropical: true } },
  { id: "pk", name: "Pakistan", region: "Asia", lat: 33.6844, lon: 73.0479, hemisphere: "N", climate: { intensity: { tree: 0.8, grass: 0.8, weed: 1.0 } } },
  { id: "au", name: "Australia", region: "Oceania", lat: -35.2809, lon: 149.1300, hemisphere: "S", climate: { intensity: { tree: 1.0, grass: 1.4, weed: 0.9 } } },
  { id: "nz", name: "New Zealand", region: "Oceania", lat: -41.2865, lon: 174.7762, hemisphere: "S", climate: { intensity: { tree: 0.9, grass: 1.3, weed: 0.6 } } },
];

export const DEFAULT_COUNTRY_ID = "gb";

export function findCountry(id: string): CountryLocation | undefined {
  return COUNTRIES.find((c) => c.id === id);
}
