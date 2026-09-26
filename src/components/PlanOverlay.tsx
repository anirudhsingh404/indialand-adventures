import { Link } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Bus, Car, CloudSun, Droplets, ExternalLink, Footprints, Loader2, MapPin, Navigation, Star, TrainFront, Wind, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getDirections, getPlacePhoto, getTravelAdvice, getWeather, searchPlaces, type PlaceResult } from "@/lib/travel.functions";

export function PlanOverlay({ query, onClose }: { query: string; onClose: () => void }) {
  const { user, ready } = useAuth();
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <div className="animate-overlay-in fixed inset-0 z-[70] overflow-y-auto bg-ink text-cream" role="dialog" aria-modal="true" aria-label={`Trip plan for ${query}`}>
      <div className="sticky top-0 z-10 border-b border-cream/10 bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">Your trip plan</p>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">{query}</h2>
          </div>
          <Button variant="ghost" className="size-11 px-0 text-cream hover:bg-cream/10" aria-label="Close" onClick={onClose}><X className="size-6" /></Button>
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10">
        {!ready ? <Spinner label="Checking your account" /> : !user ? (
          <div className="animate-rise-in mx-auto max-w-lg rounded-xl border border-cream/15 bg-cream/5 p-8 text-center">
            <h3 className="font-display text-3xl font-semibold">Sign in to plan {query}</h3>
            <p className="mt-3 text-cream/65">Live places with ratings, scam alerts, public transport directions and real-time weather are available to members.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild className="bg-saffron text-ink hover:bg-saffron/90"><Link to="/auth">Sign in or sign up</Link></Button>
            </div>
          </div>
        ) : <PlanContent query={query} />}
      </div>
    </div>
  );
}

function Spinner({ label }: { label: string }) {
  return <p className="flex items-center gap-2 py-6 text-cream/60"><Loader2 className="size-4 animate-spin" /> {label}…</p>;
}

function PlanContent({ query }: { query: string }) {
  const search = useServerFn(searchPlaces);
  const places = useInfiniteQuery({
    queryKey: ["places", query],
    queryFn: ({ pageParam }) => search({ data: { query, pageToken: pageParam || undefined } }),
    initialPageParam: "",
    getNextPageParam: (last) => last.nextPageToken ?? undefined,
  });
  const all = places.data?.pages.flatMap((p) => p.places) ?? [];
  const seen = new Set<string>();
  const list = all.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
  const center = list[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section>
        <div className="flex items-end justify-between gap-3">
          <h3 className="font-display text-3xl font-semibold">Top rated places</h3>
          <span className="text-sm text-cream/55">{list.length} found · sorted by rating</span>
        </div>
        {places.isPending && <Spinner label="Finding the best places" />}
        {places.isError && <p className="mt-4 text-sm text-destructive">Couldn't load places: {places.error.message}</p>}
        {places.data && list.length === 0 && <p className="mt-4 text-cream/60">No places found. Try another city or landmark.</p>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {list.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
        </div>
        {places.hasNextPage && (
          <div className="mt-8 flex justify-center">
            <Button onClick={() => places.fetchNextPage()} disabled={places.isFetchingNextPage} className="bg-saffron text-ink hover:bg-saffron/90">
              {places.isFetchingNextPage ? "Loading…" : "Show more places"}
            </Button>
          </div>
        )}
      </section>
      <aside className="grid content-start gap-5 lg:sticky lg:top-28">
        {center && <WeatherCard lat={center.lat} lng={center.lng} />}
        <AdviceCard place={query} />
      </aside>
    </div>
  );
}

function PlaceCard({ place, index }: { place: PlaceResult; index: number }) {
  const [open, setOpen] = useState(false);
  const photo = useServerFn(getPlacePhoto);
  const lazyPhoto = useQuery({
    queryKey: ["photo", place.photoName],
    queryFn: () => photo({ data: { name: place.photoName! } }),
    enabled: open && !place.photoUri && !!place.photoName,
    staleTime: Infinity,
  });
  const img = place.photoUri ?? lazyPhoto.data?.uri ?? null;
  return (
    <article className="animate-card-in overflow-hidden rounded-xl border border-cream/10 bg-cream/5 transition-all duration-300 hover:-translate-y-1 hover:border-saffron/40 hover:bg-cream/10" style={{ animationDelay: `${Math.min(index % 20, 12) * 60}ms` }}>
      {img && <div className="aspect-[16/9] overflow-hidden"><img src={img} alt={place.name} loading="lazy" className="size-full object-cover transition-transform duration-700 hover:scale-105" /></div>}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-bold text-saffron">{String(index + 1).padStart(2, "0")}{place.type ? ` · ${place.type}` : ""}</p>
          {place.rating != null && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-saffron/15 px-2 py-0.5 text-xs font-bold text-saffron">
              <Star className="size-3 fill-current" /> {place.rating.toFixed(1)} <span className="font-normal text-cream/55">({place.ratingCount.toLocaleString("en-IN")})</span>
            </span>
          )}
        </div>
        <h4 className="mt-2 font-display text-xl font-semibold">{place.name}</h4>
        {place.summary && <p className="mt-1 text-sm text-cream/70">{place.summary}</p>}
        <p className="mt-2 flex gap-1.5 text-xs text-cream/50"><MapPin className="mt-0.5 size-3 shrink-0" />{place.address}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="ghost" className="h-9 gap-2 border border-cream/15 text-cream hover:bg-cream/10" onClick={() => setOpen((v) => !v)}>
            <Navigation className="size-4" /> {open ? "Hide directions" : "How to get there"}
          </Button>
          {place.mapsUrl && <Button asChild variant="ghost" className="h-9 gap-2 text-cream/70 hover:bg-cream/10 hover:text-cream"><a href={place.mapsUrl} target="_blank" rel="noreferrer">Map <ExternalLink className="size-3" /></a></Button>}
        </div>
        {open && <Directions place={place} />}
      </div>
    </article>
  );
}

function Directions({ place }: { place: PlaceResult }) {
  const fn = useServerFn(getDirections);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | { address: string } | null>(null);
  const [text, setText] = useState("");
  const [geoError, setGeoError] = useState("");
  const q = useQuery({
    queryKey: ["dir", place.id, origin],
    queryFn: () => fn({ data: { origin: origin!, destination: { lat: place.lat, lng: place.lng } } }),
    enabled: !!origin,
  });
  const useMyLocation = () => {
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError("Location blocked. Type a starting point instead."),
    );
  };
  const icon = (mode: string, vehicle: string | null) => {
    if (mode === "WALK") return <Footprints className="size-4" />;
    if (mode === "DRIVE") return <Car className="size-4" />;
    if (vehicle && /train|rail|metro|subway/i.test(vehicle)) return <TrainFront className="size-4" />;
    return <Bus className="size-4" />;
  };
  return (
    <div className="animate-rise-in mt-4 rounded-lg border border-cream/10 bg-ink/60 p-4">
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (text.trim().length > 1) setOrigin({ address: text.trim() }); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Starting point, e.g. Howrah Station" className="h-10 flex-1 rounded-md border border-cream/15 bg-cream/5 px-3 text-sm outline-none focus:border-saffron" />
        <Button type="submit" className="h-10 bg-saffron text-ink hover:bg-saffron/90">Go</Button>
        <Button type="button" variant="ghost" className="h-10 text-cream hover:bg-cream/10" onClick={useMyLocation}>Use my location</Button>
      </form>
      {geoError && <p className="mt-2 text-xs text-destructive">{geoError}</p>}
      {q.isFetching && <Spinner label="Finding public transport" />}
      {q.isError && <p className="mt-3 text-xs text-destructive">{q.error.message}</p>}
      {q.data && !q.data.found && <p className="mt-3 text-sm text-cream/60">No route found from there. Try a nearby station or landmark.</p>}
      {q.data?.found && (
        <div className="mt-3">
          <p className="text-sm font-semibold">{q.data.mode === "TRANSIT" ? "Public transport" : "By road (no public transport route available)"} · {q.data.duration} · {q.data.distance}</p>
          <ol className="mt-3 grid gap-2">
            {q.data.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-cream/10 text-saffron">{icon(s.mode, s.vehicle)}</span>
                <div>
                  <p>{s.instruction}{s.duration ? <span className="text-cream/50"> · {s.duration}</span> : null}</p>
                  {s.from && <p className="text-xs text-cream/55">Board at {s.from}{s.departure ? ` (${s.departure})` : ""} → get off at {s.to}{s.arrival ? ` (${s.arrival})` : ""}{s.stops ? ` · ${s.stops} stops` : ""}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function WeatherCard({ lat, lng }: { lat: number; lng: number }) {
  const fn = useServerFn(getWeather);
  const q = useQuery({ queryKey: ["weather", lat.toFixed(2), lng.toFixed(2)], queryFn: () => fn({ data: { lat, lng } }), staleTime: 10 * 60_000 });
  return (
    <div className="animate-rise-in rounded-xl border border-cream/10 bg-gradient-to-br from-teal/30 to-cream/5 p-5">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-saffron"><CloudSun className="size-4" /> Live weather</p>
      {q.isPending && <Spinner label="Loading weather" />}
      {q.isError && <p className="mt-3 text-sm text-cream/60">Weather unavailable right now.</p>}
      {q.data && (
        <>
          <div className="mt-3 flex items-center gap-4">
            {q.data.icon && <img src={q.data.icon} alt="" className="size-14" />}
            <div>
              <p className="font-display text-5xl font-semibold">{q.data.temp != null ? Math.round(q.data.temp) : "–"}°C</p>
              <p className="text-sm text-cream/70">{q.data.condition}{q.data.feelsLike != null ? ` · feels ${Math.round(q.data.feelsLike)}°` : ""}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-cream/65">
            {q.data.humidity != null && <span className="flex items-center gap-1"><Droplets className="size-3" />{q.data.humidity}%</span>}
            {q.data.wind != null && <span className="flex items-center gap-1"><Wind className="size-3" />{q.data.wind} km/h</span>}
            {q.data.rainChance != null && <span>Rain {q.data.rainChance}%</span>}
          </div>
          {q.data.forecast.length > 0 && (
            <div className="mt-4 grid grid-cols-5 gap-1 border-t border-cream/10 pt-3 text-center text-xs">
              {q.data.forecast.map((d) => (
                <div key={d.date}>
                  <p className="text-cream/55">{new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" })}</p>
                  {d.icon && <img src={d.icon} alt={d.condition} className="mx-auto size-7" />}
                  <p className="font-semibold">{d.max != null ? Math.round(d.max) : "–"}°</p>
                  <p className="text-cream/50">{d.min != null ? Math.round(d.min) : "–"}°</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdviceCard({ place }: { place: string }) {
  const fn = useServerFn(getTravelAdvice);
  const q = useQuery({ queryKey: ["advice", place], queryFn: () => fn({ data: { place } }), staleTime: Infinity });
  return (
    <div className="animate-rise-in rounded-xl border border-cream/10 bg-cream/5 p-5">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-terracotta"><AlertTriangle className="size-4" /> Scam alerts & tips</p>
      {q.isPending && <Spinner label="Checking reported scams" />}
      {q.isError && <p className="mt-3 text-sm text-cream/60">{q.error.message}</p>}
      {q.data && (
        <div className="mt-3 grid gap-4 text-sm">
          <ul className="grid gap-3">
            {q.data.scams.map((s) => (
              <li key={s.title} className="rounded-md border-l-2 border-terracotta bg-ink/40 p-3">
                <p className="font-semibold">{s.title}</p>
                <p className="mt-1 text-cream/65">{s.detail}</p>
              </li>
            ))}
          </ul>
          {q.data.gettingThere && <Info title="Getting there" body={q.data.gettingThere} />}
          {q.data.localTransport && <Info title="Local transport" body={q.data.localTransport} />}
          {q.data.bestTime && <Info title="Best time to visit" body={q.data.bestTime} />}
          {q.data.tips.length > 0 && <div><p className="font-semibold text-saffron">Tips</p><ul className="mt-1 list-disc pl-5 text-cream/70">{q.data.tips.map((t) => <li key={t}>{t}</li>)}</ul></div>}
          <p className="text-xs text-cream/40">AI-generated guidance — double-check locally.</p>
        </div>
      )}
    </div>
  );
}

function Info({ title, body }: { title: string; body: string }) {
  return <div><p className="font-semibold text-saffron">{title}</p><p className="mt-1 text-cream/70">{body}</p></div>;
}
