import { destinations } from "./destinations";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const UA = { "User-Agent": "IndiaLand/1.0 (travel planner; contact: indialand-adventures.lovable.app)", Accept: "application/json" };

async function getJson(url: string) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Request failed [${res.status}] ${url}: ${body.slice(0, 300)}`);
    throw new Error(`Place data request failed [${res.status}]`);
  }
  return res.json();
}

/** Free geocoding via OpenStreetMap Nominatim */
async function geocode(q: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(q)}`;
  const arr = (await getJson(url)) as Array<{ lat: string; lon: string; display_name: string }>;
  if (!arr[0]) return null;
  return { lat: Number(arr[0].lat), lng: Number(arr[0].lon), name: arr[0].display_name };
}

export type PlaceResult = {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  ratingCount: number;
  type: string | null;
  summary: string | null;
  mapsUrl: string | null;
  lat: number;
  lng: number;
  photoName: string | null;
  photoUri: string | null;
  score: number;
};

const SKIP = /\b(school|college|university|hospital|station|railway|airport|company|constituency|ward|bank|hotel|district|village|suburb|neighbourhood|locality|road|street|metro|office|stadium|election|club|clinic|institute)\b/i;

type WikiPage = {
  pageid: number;
  title: string;
  description?: string;
  extract?: string;
  coordinates?: { lat: number; lon: number }[];
  thumbnail?: { source: string };
  pageviews?: Record<string, number | null>;
};

const WIKI = "https://en.wikipedia.org/w/api.php";
const DETAIL_PROPS = {
  prop: "coordinates|pageimages|description|extracts|pageviews",
  piprop: "thumbnail", pithumbsize: "800", exintro: "1", explaintext: "1", exsentences: "2", exlimit: "max", pvipdays: "30", colimit: "max", pilimit: "max",
};

/** Tourist spots tagged in OpenStreetMap (free Overpass API), returned as English Wikipedia titles. */
async function osmAttractionTitles(lat: number, lng: number) {
  const a = `around:20000,${lat},${lng}`;
  const q = `[out:json][timeout:20];(nwr(${a})[tourism][wikipedia];nwr(${a})[historic][wikipedia];nwr(${a})[amenity=place_of_worship][wikipedia];nwr(${a})[leisure~"park|garden|nature_reserve"][wikipedia];);out tags 200;`;
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { ...UA, "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(q)}`,
      signal: AbortSignal.timeout(22000),
    });
    if (!res.ok) return [];
    const j = (await res.json()) as { elements: { tags?: Record<string, string> }[] };
    return j.elements.map((e) => e.tags?.["wikipedia"] ?? "").filter((w) => w.startsWith("en:")).map((w) => w.slice(3));
  } catch {
    return [];
  }
}

async function wikiDetails(titles: string[]) {
  const out: WikiPage[] = [];
  for (let i = 0; i < titles.length; i += 20) {
    const p = new URLSearchParams({ action: "query", format: "json", formatversion: "2", redirects: "1", titles: titles.slice(i, i + 20).join("|"), ...DETAIL_PROPS });
    const j = await getJson(`${WIKI}?${p}`).catch(() => null);
    out.push(...((j?.query?.pages ?? []) as WikiPage[]));
  }
  return out;
}

async function wikiNearby(lat: number, lng: number) {
  const p = new URLSearchParams({ action: "query", format: "json", formatversion: "2", generator: "geosearch", ggscoord: `${lat}|${lng}`, ggsradius: "10000", ggslimit: "100", ...DETAIL_PROPS });
  const j = await getJson(`${WIKI}?${p}`).catch(() => null);
  return ((j?.query?.pages ?? []) as WikiPage[]).filter((pg) => !SKIP.test(`${pg.title} ${pg.description ?? ""}`));
}

/** Free place data: OpenStreetMap + Wikipedia, ranked by how many people read about each place. */
export const searchPlaces = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ query: z.string().trim().min(2).max(80), pageToken: z.string().max(500).optional() }).parse(d))
  .handler(async ({ data }) => {
    const loc = await geocode(`${data.query}, India`);
    if (!loc) return { places: [] as PlaceResult[], nextPageToken: null };
    const q = data.query.toLowerCase();
    const names = q.split(",").map((x) => x.trim());
    const curated = destinations.find((d) => names.includes(d.city.toLowerCase()))?.places ?? [];
    const osm = await osmAttractionTitles(loc.lat, loc.lng);
    let pages = await wikiDetails([...new Set([...curated, ...osm])]);
    pages = pages.filter((p) => p.coordinates?.[0] && !/disambiguation/i.test(p.description ?? ""));
    if (pages.length < 20) pages.push(...(await wikiNearby(loc.lat, loc.lng)));
    const seen = new Set<number>();
    const all: PlaceResult[] = pages
      .filter((p) => p.coordinates?.[0] && !seen.has(p.pageid) && seen.add(p.pageid) && !names.includes(p.title.toLowerCase()) && !/^(state|capital|city|district|union territory) /i.test(p.description ?? ""))
      .map((p) => {
        const c = p.coordinates![0]!;
        const views = Object.values(p.pageviews ?? {}).reduce<number>((acc, v) => acc + (v ?? 0), 0);
        return {
          id: String(p.pageid),
          name: p.title.replace(/,\s*[^,]+$/, "").replace(/\s*\([^)]*\)$/, ""),
          address: loc.name.split(",").slice(0, 2).join(","),
          rating: null,
          ratingCount: views,
          type: p.description ?? null,
          summary: p.extract ?? null,
          mapsUrl: `https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lon}#map=17/${c.lat}/${c.lon}`,
          lat: c.lat,
          lng: c.lon,
          photoName: null,
          photoUri: p.thumbnail?.source ?? null,
          score: views + (p.thumbnail ? 500 : 0),
        };
      })
      .sort((a, b) => b.score - a.score);
    const offset = Number(data.pageToken ?? 0) || 0;
    return { places: all.slice(offset, offset + 20), nextPageToken: offset + 20 < all.length ? String(offset + 20) : null };
  });

export const getPlacePhoto = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ name: z.string().max(300) }).parse(d))
  .handler(async () => ({ uri: null as string | null }));

const WMO: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers", 81: "Rain showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with hail",
};

/** Free real-time weather via Open-Meteo (no key) */
export const getWeather = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).parse(d))
  .handler(async ({ data }) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${data.lat}&longitude=${data.lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=Asia%2FKolkata`;
    const j = await getJson(url);
    const c = j.current ?? {};
    const d = j.daily ?? {};
    return {
      temp: c.temperature_2m ?? null,
      feelsLike: c.apparent_temperature ?? null,
      condition: WMO[c.weather_code as number] ?? "—",
      icon: null as string | null,
      humidity: c.relative_humidity_2m ?? null,
      wind: c.wind_speed_10m ?? null,
      rainChance: c.precipitation_probability ?? null,
      forecast: ((d.time ?? []) as string[]).map((date, i) => ({
        date,
        max: d.temperature_2m_max?.[i] ?? null,
        min: d.temperature_2m_min?.[i] ?? null,
        condition: WMO[d.weather_code?.[i] as number] ?? "",
        icon: null as string | null,
      })),
    };
  });

export type TransitStep = {
  mode: string;
  instruction: string;
  duration: string;
  distance: string;
  line: string | null;
  vehicle: string | null;
  from: string | null;
  to: string | null;
  departure: string | null;
  arrival: string | null;
  stops: number | null;
};

function fmtDur(s: number) {
  const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
  return h ? `${h} hr ${m} min` : `${m} min`;
}
function fmtDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

/** Free road routing via the public OSRM server (OpenStreetMap data). */
export const getDirections = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        origin: z.union([z.object({ lat: z.number(), lng: z.number() }), z.object({ address: z.string().trim().min(2).max(160) })]),
        destination: z.object({ lat: z.number(), lng: z.number() }),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const mode: string = "DRIVE";
    const o = "address" in data.origin ? await geocode(data.origin.address) : data.origin;
    if (!o) return { mode, found: false as const };
    const url = `https://router.project-osrm.org/route/v1/driving/${o.lng},${o.lat};${data.destination.lng},${data.destination.lat}?overview=false&steps=true`;
    const j = await getJson(url).catch(() => null);
    const route = j?.routes?.[0];
    if (!route) return { mode, found: false as const };
    type S = { distance: number; duration: number; name?: string; maneuver?: { type?: string; modifier?: string } };
    const raw: S[] = route.legs?.flatMap((l: { steps?: S[] }) => l.steps ?? []) ?? [];
    const steps: TransitStep[] = raw
      .filter((s) => s.distance > 50 || s.maneuver?.type === "arrive")
      .slice(0, 12)
      .map((s) => {
        const t = s.maneuver?.type ?? "continue";
        const verb = t === "depart" ? "Head out" : t === "arrive" ? "Arrive at destination" : `${t.replace(/^\w/, (c) => c.toUpperCase())}${s.maneuver?.modifier ? ` ${s.maneuver.modifier}` : ""}`;
        return {
          mode: "DRIVE",
          instruction: s.name && t !== "arrive" ? `${verb} on ${s.name}` : verb,
          duration: fmtDur(s.duration), distance: fmtDist(s.distance),
          line: null, vehicle: null, from: null, to: null, departure: null, arrival: null, stops: null,
        };
      });
    return { mode, found: true as const, duration: fmtDur(route.duration), distance: fmtDist(route.distance), steps };
  });

async function overpass(q: string) {
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { ...UA, "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(q)}`,
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error("Map data is busy, try again in a moment");
  return ((await res.json()) as { elements: { id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[] }).elements;
}

export type Hotel = { id: string; name: string; kind: string; stars: number | null; tier: "backpacker" | "comfort" | "luxury"; lat: number; lng: number; website: string | null; mapsUrl: string };

/** Free hotel listings from OpenStreetMap, sorted into budget tiers. */
export const getHotels = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ lat: z.number(), lng: z.number() }).parse(d))
  .handler(async ({ data }) => {
    const a = `around:6000,${data.lat},${data.lng}`;
    const els = await overpass(`[out:json][timeout:20];nwr(${a})[tourism~"^(hotel|hostel|guest_house)$"][name];out center tags 150;`);
    const hotels: Hotel[] = els.map((e) => {
      const t = e.tags ?? {};
      const stars = Number.parseFloat(t["stars"] ?? "") || null;
      const kind = t["tourism"] ?? "hotel";
      const tier = kind !== "hotel" ? "backpacker" : stars && stars >= 4 ? "luxury" : "comfort";
      const lat = e.lat ?? e.center?.lat ?? 0, lng = e.lon ?? e.center?.lon ?? 0;
      return { id: String(e.id), name: t["name"]!, kind: kind.replace("_", " "), stars, tier, lat, lng, website: t["website"] ?? null, mapsUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}` };
    });
    return hotels.sort((x, y) => (y.stars ?? 0) - (x.stars ?? 0) || (y.website ? 1 : 0) - (x.website ? 1 : 0));
  });

export type Hub = { id: string; name: string; kind: "Metro" | "Railway" | "Bus stand"; lat: number; lng: number };

/** Nearest metro, railway and bus stations from OpenStreetMap. */
export const getTransitHubs = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ lat: z.number(), lng: z.number() }).parse(d))
  .handler(async ({ data }) => {
    const a = `around:8000,${data.lat},${data.lng}`;
    const els = await overpass(`[out:json][timeout:20];(nwr(${a})[station=subway][name];nwr(${a})[railway=station][name];nwr(${a})[amenity=bus_station][name];);out center tags 120;`);
    const seen = new Set<string>();
    const hubs: Hub[] = [];
    for (const e of els) {
      const t = e.tags ?? {};
      const kind = t["station"] === "subway" || t["subway"] === "yes" ? "Metro" : t["amenity"] === "bus_station" ? "Bus stand" : "Railway";
      const key = `${kind}:${t["name"]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hubs.push({ id: String(e.id), name: t["name"]!, kind, lat: e.lat ?? e.center?.lat ?? 0, lng: e.lon ?? e.center?.lon ?? 0 });
    }
    const dist = (h: Hub) => (h.lat - data.lat) ** 2 + (h.lng - data.lng) ** 2;
    return hubs.sort((x, y) => dist(x) - dist(y)).slice(0, 15);
  });

const GENERIC_ADVICE = {
  scams: [
    { title: "Fake 'official' guides", detail: "People near monuments claim to be government guides. Hire only licensed guides from the ticket counter and agree the fee first." },
    { title: "Auto and taxi overcharging", detail: "Insist on the meter or use app cabs (Uber, Ola, Rapido). Ask locals the usual fare before boarding." },
    { title: "'Closed today' detours", detail: "Strangers say your attraction is closed and offer a shop tour instead. Check timings online and walk on." },
    { title: "Gem and carpet shop commissions", detail: "Drivers take you to shops promising resale profits. Never buy gems as an investment." },
  ],
  tips: ["Carry small cash for autos and stalls; UPI works almost everywhere.", "Buy train tickets on IRCTC or at official counters only.", "Drink sealed bottled water.", "Dress modestly for temples and remove shoes."],
  bestTime: "October to March is pleasant across most of India; hills are best April–June.",
  gettingThere: "Check the nearest airport and main railway station listed under 'Nearby transport'.",
  localTransport: "Metro (where available) is cheapest and fastest; city buses ₹10–40; autos ₹30–150 short rides; app cabs for longer trips.",
};

export const getTravelAdvice = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ place: z.string().trim().min(2).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ...GENERIC_ADVICE, generic: true };
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'You are a careful India travel safety editor. Reply with JSON only: {"scams":[{"title":string,"detail":string}],"tips":[string],"bestTime":string,"gettingThere":string,"localTransport":string}. 4-6 scams that are genuinely reported for that specific place (e.g. fake guides, taxi/auto overcharging, gem scams), each detail under 35 words with how to avoid it. 4 practical tips. gettingThere: nearest airport and main railway station. localTransport: metro/bus/auto/app-cab options and typical fares in INR.',
          },
          { role: "user", content: `Destination: ${data.place}, India` },
        ],
      }),
    });
    if (!res.ok) {
      console.error(`AI request failed [${res.status}]: ${await res.text()}`);
      return { ...GENERIC_ADVICE, generic: true };
    }
    const json = await res.json();
    const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}");
    return {
      scams: (parsed.scams ?? []) as { title: string; detail: string }[],
      tips: (parsed.tips ?? []) as string[],
      bestTime: (parsed.bestTime ?? "") as string,
      gettingThere: (parsed.gettingThere ?? "") as string,
      localTransport: (parsed.localTransport ?? "") as string,
      generic: false,
    };
  });
