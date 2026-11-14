type CityCenter = { name: string; lat: number; lng: number; metro: boolean };

const cityCenters: CityCenter[] = [
  { name: "Kolkata", lat: 22.5726, lng: 88.3639, metro: true },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873, metro: true },
  { name: "Mumbai", lat: 19.076, lng: 72.8777, metro: true },
  { name: "Delhi", lat: 28.6139, lng: 77.209, metro: true },
  { name: "Varanasi", lat: 25.3176, lng: 82.9739, metro: false },
  { name: "Goa", lat: 15.4909, lng: 73.8278, metro: false },
  { name: "Kochi", lat: 9.9312, lng: 76.2673, metro: true },
  { name: "Leh", lat: 34.1526, lng: 77.5771, metro: false },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946, metro: true },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867, metro: true },
  { name: "Chennai", lat: 13.0827, lng: 80.2707, metro: true },
  { name: "Udaipur", lat: 24.5854, lng: 73.7125, metro: false },
  { name: "Agra", lat: 27.1767, lng: 78.0081, metro: false },
  { name: "Amritsar", lat: 31.634, lng: 74.8723, metro: false },
  { name: "Rishikesh", lat: 30.0869, lng: 78.2676, metro: false },
  { name: "Shimla", lat: 31.1048, lng: 77.1734, metro: false },
  { name: "Munnar", lat: 10.0889, lng: 77.0595, metro: false },
  { name: "Mysuru", lat: 12.2958, lng: 76.6394, metro: false },
  { name: "Shillong", lat: 25.5788, lng: 91.8933, metro: false },
  { name: "Darjeeling", lat: 27.041, lng: 88.2663, metro: false },
  { name: "Madurai", lat: 9.9252, lng: 78.1198, metro: false },
  { name: "Hampi", lat: 15.335, lng: 76.46, metro: false },
];

function nearestCity(lat: number, lng: number) {
  let closest: CityCenter | undefined;
  let distance = Number.POSITIVE_INFINITY;
  for (const city of cityCenters) {
    const next = (city.lat - lat) ** 2 + (city.lng - lng) ** 2;
    if (next < distance) {
      closest = city;
      distance = next;
    }
  }
  return closest && distance < 3.24 ? closest : undefined;
}

function mapSearch(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export type TransitFallback = {
  id: string;
  name: string;
  kind: "Metro" | "Railway" | "Bus stand" | "Local bus";
  lat: number;
  lng: number;
  fallback: true;
  searchUrl: string;
};

export function fallbackTransit(lat: number, lng: number): TransitFallback[] {
  const city = nearestCity(lat, lng);
  const place = city?.name ?? "your area";
  const queries = [
    ...(city?.metro ? [[`Metro stations in ${place}`, "Metro"] as const] : []),
    [`Railway stations near ${place}`, "Railway"] as const,
    [`Bus stations and bus terminals in ${place}`, "Bus stand"] as const,
    [`Local buses and shared taxis in ${place}`, "Local bus"] as const,
  ];
  return queries.map(([name, kind], i) => ({
    id: `offline-transit-${i}`,
    name,
    kind,
    lat,
    lng,
    fallback: true,
    searchUrl: mapSearch(name),
  }));
}

export type HotelFallback = {
  id: string;
  name: string;
  kind: string;
  stars: null;
  tier: "backpacker" | "comfort" | "luxury";
  lat: number;
  lng: number;
  nightly: number;
  website: string;
  mapsUrl: string;
  fallback: true;
};

export function fallbackHotels(lat: number, lng: number): HotelFallback[] {
  const place = nearestCity(lat, lng)?.name ?? "your area";
  const options = [
    ["Hostels & dorm beds", "hostel", 700, "backpacker"],
    ["Guest houses & homestays", "guest house", 1500, "backpacker"],
    ["Budget hotels", "budget hotel", 2500, "comfort"],
    ["Hotels across all price ranges", "hotel", 5000, "comfort"],
  ] as const;
  return options.map(([label, kind, nightly, tier], i) => {
    const name = `${label} near ${place}`;
    const url = mapSearch(`${kind} near ${place}, India`);
    return {
      id: `offline-stay-${i}`,
      name,
      kind,
      stars: null,
      tier,
      lat,
      lng,
      nightly,
      website: url,
      mapsUrl: url,
      fallback: true,
    };
  });
}

export type EateryFallback = {
  id: string;
  name: string;
  kind: string;
  cuisine: string | null;
  veg: boolean;
  label: "Popular" | "Underrated gem";
  mapsUrl: string;
  fallback: true;
};

type FoodSuggestion = [name: string, cuisine: string, label: EateryFallback["label"], veg?: boolean];

const foodSuggestions: Record<string, FoodSuggestion[]> = {
  Kolkata: [["K.C. Das", "Bengali sweets", "Popular", true], ["Peter Cat", "Chelo kebab", "Popular"], ["Dacre Lane", "Kolkata street food", "Underrated gem"], ["Tewari Brothers", "Kachori and sweets", "Underrated gem", true]],
  Jaipur: [["Laxmi Misthan Bhandar", "Rajasthani thali and sweets", "Popular", true], ["Rawat Mishtan Bhandar", "Pyaaz kachori", "Popular", true], ["Masala Chowk", "Local street food", "Underrated gem"], ["Sodhani Sweets", "Rajasthani snacks", "Underrated gem", true]],
  Mumbai: [["Ashok Vada Pav", "Vada pav", "Popular", true], ["Bademiya", "Kebabs", "Popular"], ["Aaswad", "Maharashtrian food", "Underrated gem"], ["Elco Pani Puri Centre", "Chaat", "Underrated gem", true]],
  Delhi: [["Karim's", "Mughlai", "Popular"], ["Paranthe Wali Gali", "Punjabi street food", "Popular", true], ["Sita Ram Diwan Chand", "Chole bhature", "Underrated gem", true], ["Jung Bahadur Kachori Wala", "Kachori", "Underrated gem", true]],
  Varanasi: [["Kashi Chat Bhandar", "Banarasi chaat", "Popular", true], ["Blue Lassi Shop", "Lassi", "Popular", true], ["Deena Chaat Bhandar", "Chaat", "Underrated gem", true], ["Shreeji Sweets", "Banarasi sweets", "Underrated gem", true]],
  Goa: [["Vinayak Family Restaurant", "Goan seafood", "Popular"], ["Ritz Classic", "Goan fish thali", "Popular"], ["Anand Seafood Restaurant", "Local seafood", "Underrated gem"], ["Cafe Tato", "Goan snacks", "Underrated gem", true]],
  Kochi: [["Kayees Rahmathulla Cafe", "Malabar biryani", "Popular"], ["Dhe Puttu", "Kerala cuisine", "Popular"], ["Pai Brothers Fast Food", "Kerala vegetarian", "Underrated gem", true], ["Sree Krishna Inn", "South Indian", "Underrated gem", true]],
  Leh: [["Tibetan Kitchen", "Tibetan and Ladakhi", "Popular"], ["Lamayuru Restaurant", "Ladakhi cuisine", "Popular"], ["Amdo Cafe", "Tibetan momos", "Underrated gem"], ["Bon Appetit", "Ladakhi and continental", "Underrated gem"]],
  Bengaluru: [["Vidyarthi Bhavan", "Masala dosa", "Popular", true], ["Mavalli Tiffin Rooms", "South Indian", "Popular", true], ["CTR (Shri Sagar)", "Benne dosa", "Underrated gem", true], ["Brahmin's Coffee Bar", "Idli and coffee", "Underrated gem", true]],
  Hyderabad: [["Paradise", "Hyderabadi biryani", "Popular"], ["Shah Ghouse", "Biryani and haleem", "Popular"], ["Cafe Bahar", "Hyderabadi cuisine", "Underrated gem"], ["Govind Dosa", "Street food", "Underrated gem", true]],
  Chennai: [["Murugan Idli Shop", "South Indian", "Popular", true], ["Ratna Cafe", "Sambar idli", "Popular", true], ["Mami Tiffin Stall", "Tamil tiffin", "Underrated gem", true], ["Sangeetha Veg Restaurant", "South Indian", "Underrated gem", true]],
  Agra: [["Deviram Sweets", "Bedai and jalebi", "Popular", true], ["Panchi Petha", "Agra petha", "Popular", true], ["Shankara Vegis Restaurant", "North Indian", "Underrated gem", true], ["Joney's Place", "Local Indian food", "Underrated gem", true]],
  Amritsar: [["Kesar Da Dhaba", "Punjabi thali", "Popular", true], ["Bharawan Da Dhaba", "Punjabi vegetarian", "Popular", true], ["Beera Chicken House", "Tandoori chicken", "Underrated gem"], ["Giani Tea Stall", "Tea and snacks", "Underrated gem", true]],
  Rishikesh: [["Chotiwala Restaurant", "North Indian", "Popular", true], ["The 60's Cafe", "Cafe and international", "Popular"], ["Chandreshwar Sweets", "Indian snacks", "Underrated gem", true], ["Free Spirit Cafe", "Cafe food", "Underrated gem", true]],
  Shimla: [["Baljees", "Indian and bakery", "Popular", true], ["Indian Coffee House", "South Indian and cafe", "Popular", true], ["Wake & Bake Cafe", "Cafe and pancakes", "Underrated gem", true], ["Himachali Rasoi", "Himachali cuisine", "Underrated gem"]],
  Munnar: [["Rapsy Restaurant", "Kerala and local food", "Popular"], ["Saravana Bhavan", "South Indian", "Popular", true], ["S N Restaurant", "Kerala meals", "Underrated gem", true], ["Hot Chicken", "Local Kerala dishes", "Underrated gem"]],
  Mysuru: [["Vinayaka Mylari", "Mysore masala dosa", "Popular", true], ["Hotel RRR", "Andhra meals", "Popular"], ["Mahesh Prasad", "South Indian", "Underrated gem", true], ["Hotel Original Mylari", "Mysore dosa", "Underrated gem", true]],
  Shillong: [["Trattoria", "Khasi cuisine", "Popular"], ["Cafe Shillong", "Khasi and cafe food", "Popular"], ["Jiva Grill", "Local and Indian food", "Underrated gem"], ["Bamboo Hut Cafe", "Khasi food", "Underrated gem"]],
  Darjeeling: [["Kunga Restaurant", "Tibetan momos and thukpa", "Popular"], ["Glenary's", "Bakery and cafe", "Popular"], ["Boney's Snack Bar", "Local snacks", "Underrated gem"], ["Sonam's Kitchen", "Tibetan breakfast", "Underrated gem"]],
  Madurai: [["Murugan Idli Shop", "South Indian", "Popular", true], ["Amma Mess", "Madurai non-veg", "Popular"], ["Konar Mess", "Jigarthanda and local food", "Underrated gem"], ["Sree Sabarees", "South Indian", "Underrated gem", true]],
  Hampi: [["Mango Tree Restaurant", "Indian and international", "Popular", true], ["Gopi Guest House Restaurant", "Cafe and Indian", "Popular", true], ["Hampi Paradise Restaurant", "Local Indian food", "Underrated gem", true], ["Laughing Buddha Cafe", "Cafe and local food", "Underrated gem"]],
  Udaipur: [["Natraj Dining Hall", "Rajasthani thali", "Popular", true], ["Paliwal Restaurant", "Local Rajasthani", "Popular", true], ["Khamma Ghani Restaurant", "Rajasthani cuisine", "Underrated gem"], ["Shree Thaker Bhojanalay", "Vegetarian thali", "Underrated gem", true]],
};

export function fallbackEateries(lat: number, lng: number): EateryFallback[] {
  const city = nearestCity(lat, lng)?.name;
  const suggestions = city ? foodSuggestions[city] : undefined;
  const rows = suggestions ?? [
    [`Popular restaurants near ${city ?? "your destination"}`, "Local restaurants", "Popular"],
    [`Street food near ${city ?? "your destination"}`, "Street food", "Underrated gem", true],
    [`Vegetarian food near ${city ?? "your destination"}`, "Vegetarian restaurants", "Underrated gem", true],
  ] satisfies FoodSuggestion[];
  return rows.map(([name, cuisine, label, veg], i) => ({
    id: `offline-food-${i}`,
    name,
    kind: "restaurant",
    cuisine,
    veg: veg ?? false,
    label,
    mapsUrl: mapSearch(`${name}, ${city ?? "India"}`),
    fallback: true,
  }));
}