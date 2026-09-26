import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

function mapsHeaders(extra: Record<string, string> = {}) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const mapsKey = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovableKey || !mapsKey) throw new Error("Google Maps is not connected");
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": mapsKey,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function mapsFetch(path: string, init: RequestInit) {
  const res = await fetch(`${GATEWAY_URL}${path}`, init);
  if (!res.ok) {
    const body = await res.text();
    console.error(`Maps request failed [${res.status}]: ${body}`);
    throw new Error(`Maps request failed [${res.status}]`);
  }
  return res.json();
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

type RawPlace = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  primaryTypeDisplayName?: { text: string };
  editorialSummary?: { text: string };
  googleMapsUri?: string;
  location?: { latitude: number; longitude: number };
  photos?: { name: string }[];
};

async function photoUri(name: string) {
  try {
    const data = await mapsFetch(`/places/v1/${name}/media?maxWidthPx=800&skipHttpRedirect=true`, {
      headers: mapsHeaders(),
    });
    return (data.photoUri as string) ?? null;
  } catch {
    return null;
  }
}

export const searchPlaces = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ query: z.string().trim().min(2).max(80), pageToken: z.string().max(500).optional() }).parse(d))
  .handler(async ({ data }) => {
    const body: Record<string, unknown> = {
      textQuery: `top tourist attractions in ${data.query}, India`,
      pageSize: 20,
      languageCode: "en",
      regionCode: "IN",
    };
    if (data.pageToken) body.pageToken = data.pageToken;
    const json = await mapsFetch("/places/v1/places:searchText", {
      method: "POST",
      headers: mapsHeaders({
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.editorialSummary,places.googleMapsUri,places.location,places.photos,nextPageToken",
      }),
      body: JSON.stringify(body),
    });
    const raw: RawPlace[] = json.places ?? [];
    const places: PlaceResult[] = raw
      .filter((p) => p.location)
      .map((p) => {
        const rating = p.rating ?? null;
        const count = p.userRatingCount ?? 0;
        return {
          id: p.id,
          name: p.displayName?.text ?? "Unnamed place",
          address: p.formattedAddress ?? "",
          rating,
          ratingCount: count,
          type: p.primaryTypeDisplayName?.text ?? null,
          summary: p.editorialSummary?.text ?? null,
          mapsUrl: p.googleMapsUri ?? null,
          lat: p.location!.latitude,
          lng: p.location!.longitude,
          photoName: p.photos?.[0]?.name ?? null,
          photoUri: null,
          score: (rating ?? 0) * Math.log10(count + 10),
        };
      })
      .sort((a, b) => b.score - a.score);
    // Photos for the top 8 only, to keep usage bounded
    await Promise.all(
      places.slice(0, 8).map(async (p) => {
        if (p.photoName) p.photoUri = await photoUri(p.photoName);
      }),
    );
    return { places, nextPageToken: (json.nextPageToken as string | undefined) ?? null };
  });

export const getPlacePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ name: z.string().regex(/^places\/[^/]+\/photos\/[^/]+$/) }).parse(d))
  .handler(async ({ data }) => ({ uri: await photoUri(data.name) }));

export const getWeather = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).parse(d))
  .handler(async ({ data }) => {
    const q = `location.latitude=${data.lat}&location.longitude=${data.lng}`;
    const [now, days] = await Promise.all([
      mapsFetch(`/weather/v1/currentConditions:lookup?${q}`, { headers: mapsHeaders() }),
      mapsFetch(`/weather/v1/forecast/days:lookup?${q}&days=5`, { headers: mapsHeaders() }).catch(() => null),
    ]);
    return {
      temp: now.temperature?.degrees ?? null,
      feelsLike: now.feelsLikeTemperature?.degrees ?? null,
      condition: now.weatherCondition?.description?.text ?? "—",
      icon: now.weatherCondition?.iconBaseUri ? `${now.weatherCondition.iconBaseUri}.svg` : null,
      humidity: now.relativeHumidity ?? null,
      wind: now.wind?.speed?.value ?? null,
      rainChance: now.precipitation?.probability?.percent ?? null,
      forecast: ((days?.forecastDays ?? []) as Array<{
        displayDate?: { year: number; month: number; day: number };
        maxTemperature?: { degrees: number };
        minTemperature?: { degrees: number };
        daytimeForecast?: { weatherCondition?: { description?: { text: string }; iconBaseUri?: string } };
      }>).map((d) => ({
        date: d.displayDate ? `${d.displayDate.year}-${String(d.displayDate.month).padStart(2, "0")}-${String(d.displayDate.day).padStart(2, "0")}` : "",
        max: d.maxTemperature?.degrees ?? null,
        min: d.minTemperature?.degrees ?? null,
        condition: d.daytimeForecast?.weatherCondition?.description?.text ?? "",
        icon: d.daytimeForecast?.weatherCondition?.iconBaseUri ? `${d.daytimeForecast.weatherCondition.iconBaseUri}.svg` : null,
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

export const getDirections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        origin: z.union([z.object({ lat: z.number(), lng: z.number() }), z.object({ address: z.string().trim().min(2).max(160) })]),
        destination: z.object({ lat: z.number(), lng: z.number() }),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const origin = "address" in data.origin
      ? { address: data.origin.address }
      : { location: { latLng: { latitude: data.origin.lat, longitude: data.origin.lng } } };
    const destination = { location: { latLng: { latitude: data.destination.lat, longitude: data.destination.lng } } };
    const mask =
      "routes.duration,routes.distanceMeters,routes.localizedValues,routes.legs.steps.travelMode,routes.legs.steps.navigationInstruction,routes.legs.steps.localizedValues,routes.legs.steps.transitDetails";
    const call = (travelMode: string) =>
      mapsFetch("/routes/directions/v2:computeRoutes", {
        method: "POST",
        headers: mapsHeaders({ "X-Goog-FieldMask": mask }),
        body: JSON.stringify({ origin, destination, travelMode, languageCode: "en-IN", units: "METRIC" }),
      });
    let mode = "TRANSIT";
    let json = await call("TRANSIT").catch(() => ({ routes: [] }));
    if (!json.routes?.length) {
      mode = "DRIVE";
      json = await call("DRIVE").catch(() => ({ routes: [] }));
    }
    const route = json.routes?.[0];
    if (!route) return { mode, found: false as const };
    type RawStep = {
      travelMode?: string;
      navigationInstruction?: { instructions?: string };
      localizedValues?: { staticDuration?: { text: string }; distance?: { text: string } };
      transitDetails?: {
        stopDetails?: { departureStop?: { name: string }; arrivalStop?: { name: string } };
        localizedValues?: { departureTime?: { time?: { text: string } }; arrivalTime?: { time?: { text: string } } };
        headsign?: string;
        stopCount?: number;
        transitLine?: { name?: string; nameShort?: string; vehicle?: { name?: { text: string } } };
      };
    };
    const rawSteps: RawStep[] = route.legs?.flatMap((l: { steps?: RawStep[] }) => l.steps ?? []) ?? [];
    // Merge consecutive walking steps so the list stays readable
    const steps: TransitStep[] = [];
    for (const s of rawSteps) {
      const t = s.transitDetails;
      const step: TransitStep = {
        mode: s.travelMode ?? mode,
        instruction: t
          ? `Take ${t.transitLine?.vehicle?.name?.text ?? "transit"} ${t.transitLine?.nameShort ?? t.transitLine?.name ?? ""} towards ${t.headsign ?? "destination"}`.replace(/\s+/g, " ")
          : s.navigationInstruction?.instructions ?? (s.travelMode === "WALK" ? "Walk" : "Continue"),
        duration: s.localizedValues?.staticDuration?.text ?? "",
        distance: s.localizedValues?.distance?.text ?? "",
        line: t?.transitLine?.nameShort ?? t?.transitLine?.name ?? null,
        vehicle: t?.transitLine?.vehicle?.name?.text ?? null,
        from: t?.stopDetails?.departureStop?.name ?? null,
        to: t?.stopDetails?.arrivalStop?.name ?? null,
        departure: t?.localizedValues?.departureTime?.time?.text ?? null,
        arrival: t?.localizedValues?.arrivalTime?.time?.text ?? null,
        stops: t?.stopCount ?? null,
      };
      const prev = steps[steps.length - 1];
      if (mode === "TRANSIT" && !t && prev && !prev.vehicle) {
        prev.instruction = "Walk";
        continue;
      }
      if (mode === "TRANSIT" && !t) step.instruction = "Walk";
      steps.push(step);
    }
    return {
      mode,
      found: true as const,
      duration: route.localizedValues?.duration?.text ?? "",
      distance: route.localizedValues?.distance?.text ?? "",
      steps: mode === "DRIVE" ? steps.slice(0, 12) : steps,
    };
  });

export const getTravelAdvice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ place: z.string().trim().min(2).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured");
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
      const body = await res.text();
      console.error(`AI request failed [${res.status}]: ${body}`);
      if (res.status === 429) throw new Error("Too many requests, try again shortly");
      if (res.status === 402) throw new Error("AI credits are used up");
      throw new Error("Could not load travel advice");
    }
    const json = await res.json();
    const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}");
    return {
      scams: (parsed.scams ?? []) as { title: string; detail: string }[],
      tips: (parsed.tips ?? []) as string[],
      bestTime: (parsed.bestTime ?? "") as string,
      gettingThere: (parsed.gettingThere ?? "") as string,
      localTransport: (parsed.localTransport ?? "") as string,
    };
  });
