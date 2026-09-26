import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Compass, MapPin, Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import heroImage from "@/assets/india-land-hero.jpg";
import jaipurImage from "@/assets/jaipur-hawa-mahal.jpg";
import keralaImage from "@/assets/kerala-backwaters.jpg";
import ladakhImage from "@/assets/ladakh-road.jpg";
import { Button } from "@/components/ui/button";
import { destinations, featuredCities } from "@/lib/destinations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "India Land — Plan Your Journey Across India" },
      { name: "description", content: "Discover cities, landmarks and curated travel ideas for your next journey across India." },
      { property: "og:title", content: "India Land — Plan Your Journey Across India" },
      { property: "og:description", content: "Discover cities, landmarks and curated travel ideas for your next journey across India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IndiaLandHome,
});

const destinationImages = [
  { city: "Jaipur", state: "Rajasthan", label: "Heritage", image: jaipurImage },
  { city: "Alleppey", state: "Kerala", label: "Backwaters", image: keralaImage },
  { city: "Leh", state: "Ladakh", label: "Himalayan", image: ladakhImage },
];

function IndiaLandHome() {
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Kolkata");
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > window.innerHeight * 0.45);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const matchingDestinations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return destinations.slice(0, 6);
    return destinations.filter((destination) =>
      [destination.city, destination.state, ...destination.places]
        .some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [query]);

  const activeDestination = destinations.find((item) => item.city === selectedCity) ?? destinations[0];

  if (!activeDestination) return null;

  const chooseCity = (city: string) => {
    setSelectedCity(city);
    setQuery(city);
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const submitSearch = () => {
    const exact = destinations.find((destination) =>
      destination.city.toLowerCase() === query.trim().toLowerCase(),
    );
    const first = exact ?? matchingDestinations[0];
    if (first) setSelectedCity(first.city);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-cream text-ink antialiased">
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="mt-3 flex h-14 items-center justify-between rounded-lg border border-cream/30 bg-cream/65 px-3 shadow-sm backdrop-blur-xl sm:mt-4 sm:h-16 sm:px-4">
            <a href="#top" aria-label="India Land home" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-md bg-ink font-display text-lg font-semibold text-cream">i</span>
              <span className="flex items-baseline gap-1.5 font-display text-lg sm:text-xl">
                <span className={`font-semibold transition-all duration-700 ${isScrolled ? "max-w-20 opacity-100" : "max-w-0 overflow-hidden opacity-0"}`}>INDIA</span>
                <span className="font-medium text-terracotta">LAND</span>
              </span>
            </a>
            <nav className="hidden items-center gap-7 text-sm font-semibold text-ink/65 md:flex" aria-label="Main navigation">
              <a href="#discover" className="transition-colors hover:text-ink">Discover</a>
              <a href="#planner" className="transition-colors hover:text-ink">Itineraries</a>
              <a href="#regions" className="transition-colors hover:text-ink">Regions</a>
            </nav>
            <div className="hidden sm:block">
              <Button onClick={() => document.querySelector("#planner")?.scrollIntoView({ behavior: "smooth" })}>Plan a trip</Button>
            </div>
            <Button variant="ghost" className="size-10 px-0 sm:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((value) => !value)}>
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
          {menuOpen && (
            <nav className="mt-2 grid rounded-lg border border-border bg-cream/95 p-2 shadow-lg backdrop-blur-xl sm:hidden" aria-label="Mobile navigation">
              {[["Discover", "#discover"], ["Itineraries", "#planner"], ["Regions", "#regions"]].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-3 text-sm font-semibold hover:bg-ink/5">{label}</a>
              ))}
            </nav>
          )}
        </div>
      </header>

      <section id="top" className="relative min-h-[680px] overflow-hidden sm:h-[100svh]">
        <img src={heroImage} alt="The Taj Mahal and Yamuna River glowing at sunrise" width={1920} height={1080} className="animate-slow-drift absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/15 to-cream" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/45 via-transparent to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[680px] max-w-[1440px] flex-col justify-end px-5 pb-14 sm:h-full sm:px-6 sm:pb-16 lg:px-10">
          <p className="animate-rise-in mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream/85 sm:mb-5 sm:text-sm">A travel journal of the subcontinent</p>
          <h1 className="animate-title-in font-display text-[clamp(5rem,19vw,18rem)] font-semibold leading-[.82] text-cream">INDIA</h1>
          <div className="mt-5 flex flex-col gap-5 sm:mt-6 md:flex-row md:items-end md:justify-between">
            <p className="animate-rise-in max-w-[46ch] text-base leading-relaxed text-cream/90 sm:text-lg">Scroll to open the journal. India settles into the masthead while your journey begins—from Himalayan roads to southern backwaters.</p>
            <a href="#planner" className="animate-rise-in flex w-fit items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-cream/80">
              Explore <ArrowDown className="animate-cue size-4" />
            </a>
          </div>
        </div>
      </section>

      <section id="planner" className="scroll-mt-24 bg-cream">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta sm:text-sm">Where to next</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">Plan a visit, city by city</h2>
          <div className="mt-8 rounded-lg border border-border/70 bg-card/70 p-3 shadow-[0_24px_80px_-46px_var(--ink)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row">
              <label className="flex min-h-14 flex-1 items-center gap-3 rounded-md border border-border/70 bg-cream/70 px-4">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <span className="sr-only">Search cities, states or places</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && submitSearch()} className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-muted-foreground" placeholder="Search a city, state or place" />
              </label>
              <Button className="min-h-14 gap-2 px-7" onClick={submitSearch}><Compass className="size-4" /> Plan my visit</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 px-1 pb-1">
              {featuredCities.map((city) => {
                const item = destinations.find((destination) => destination.city === city);
                return (
                  <Button key={city} variant={city === selectedCity ? "soft" : "ghost"} className="min-h-8 rounded-full border border-border/60 px-3 py-1 text-xs" onClick={() => chooseCity(city)}>
                    {city}{item ? `, ${item.state}` : ""}
                  </Button>
                );
              })}
            </div>
            {query.trim() && (
              <div className="mt-3 border-t border-border/70 px-1 pt-3" aria-live="polite">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Matching destinations</p>
                <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                  {matchingDestinations.slice(0, 6).map((destination) => (
                    <Button key={destination.city} variant="ghost" className="h-auto justify-start gap-3 px-3 py-2 text-left" onClick={() => chooseCity(destination.city)}>
                      <MapPin className="size-4 shrink-0 text-terracotta" />
                      <span><strong>{destination.city}</strong><span className="block text-xs font-normal text-muted-foreground">{destination.state} · {destination.places.length} places</span></span>
                    </Button>
                  ))}
                  {matchingDestinations.length === 0 && <p className="py-3 text-sm text-muted-foreground">No match yet. Try a major city, state or landmark.</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="discover" className="bg-cream">
        <div className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Browse by mood</h2>
            <span className="hidden text-sm font-semibold text-muted-foreground sm:block">Four ways into India</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[ ["Heritage", "Forts, palaces, old cities"], ["Coastal", "Beaches, islands, backwaters"], ["Himalayan", "Peaks, valleys, monasteries"], ["Cuisine", "Markets, kitchens, food trails"] ].map(([title, copy]) => (
              <article key={title} className="rounded-lg border border-border/60 bg-card/65 p-5 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1">
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="regions" className="bg-cream">
        <div className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-6 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta sm:text-sm">Top places</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">From around India</h2>
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {destinationImages.map((destination) => (
              <article key={destination.city} className="group cursor-pointer" onClick={() => chooseCity(destination.city === "Alleppey" ? "Kochi" : destination.city)}>
                <div className="aspect-square overflow-hidden rounded-lg bg-sand">
                  <img src={destination.image} alt={`${destination.city}, ${destination.state}`} width={1024} height={1024} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div><h3 className="font-display text-2xl font-semibold">{destination.city}</h3><p className="text-sm text-muted-foreground">{destination.state}</p></div>
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-terracotta">{destination.label}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section ref={resultsRef} className="scroll-mt-20 bg-ink text-cream" aria-live="polite">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-6 lg:px-10 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-saffron sm:text-sm">Your city guide</p>
          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><h2 className="font-display text-4xl font-semibold sm:text-5xl">{activeDestination.city}, {activeDestination.state}</h2><p className="mt-3 max-w-2xl text-cream/65">Start with these {activeDestination.places.length} landmarks, neighbourhoods and experiences.</p></div>
            <span className="text-sm font-semibold text-cream/55">{activeDestination.places.length} curated places</span>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeDestination.places.map((place, index) => (
              <article key={place} className="rounded-lg border border-cream/10 bg-cream/5 p-5 transition-colors hover:bg-cream/10">
                <p className="text-xs font-bold text-saffron">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-display text-xl font-semibold">{place}</h3>
                <p className="mt-2 text-sm text-cream/55">Add to your {activeDestination.city} itinerary</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-cream/10 bg-ink text-cream/65">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <span className="font-display text-xl font-semibold text-cream">INDIA <span className="font-medium text-terracotta">LAND</span></span>
          <p className="text-sm">Every state. A thousand stories. One remarkable journey.</p>
        </div>
      </footer>
    </main>
  );
}
