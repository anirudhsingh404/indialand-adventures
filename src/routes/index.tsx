import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, Compass, LogOut, MapPin, Menu, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import heroImage from "@/assets/india-land-hero.jpg";
import jaipurImage from "@/assets/jaipur-hawa-mahal.jpg";
import keralaImage from "@/assets/kerala-backwaters.jpg";
import ladakhImage from "@/assets/ladakh-road.jpg";
import kolkataImage from "@/assets/kolkata.jpg";
import varanasiImage from "@/assets/varanasi.jpg";
import goaImage from "@/assets/goa.jpg";
import hampiImage from "@/assets/hampi.jpg";
import { Button } from "@/components/ui/button";
import { PlanOverlay } from "@/components/PlanOverlay";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { destinations, featuredCities } from "@/lib/destinations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "India Land — Plan Your Journey Across India" },
      { name: "description", content: "Search any city in India for top-rated places, scam alerts, public transport directions and live weather." },
      { property: "og:title", content: "India Land — Plan Your Journey Across India" },
      { property: "og:description", content: "Search any city in India for top-rated places, scam alerts, public transport directions and live weather." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IndiaLandHome,
});

const topPlaces = [
  { city: "Jaipur", state: "Rajasthan", label: "Heritage", image: jaipurImage },
  { city: "Kolkata", state: "West Bengal", label: "Culture", image: kolkataImage },
  { city: "Varanasi", state: "Uttar Pradesh", label: "Spiritual", image: varanasiImage },
  { city: "Goa", state: "Goa", label: "Coastal", image: goaImage },
  { city: "Hampi", state: "Karnataka", label: "Ruins", image: hampiImage },
  { city: "Alleppey", state: "Kerala", label: "Backwaters", image: keralaImage },
  { city: "Leh", state: "Ladakh", label: "Himalayan", image: ladakhImage },
];

const typingPhrases = ["Kolkata, West Bengal", "Hawa Mahal, Jaipur", "Munnar, Kerala", "Rishikesh, Uttarakhand", "Darjeeling", "Hampi ruins", "Andaman Islands", "Khajuraho temples", "Shillong, Meghalaya", "Mysuru Palace"];

function useTypewriter(words: string[], paused: boolean) {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    if (paused) return;
    const word = words[i % words.length] ?? "";
    let delay = deleting ? 45 : 95;
    if (!deleting && text === word) delay = 1500;
    if (deleting && text === "") delay = 350;
    const t = window.setTimeout(() => {
      if (!deleting && text === word) setDeleting(true);
      else if (deleting && text === "") { setDeleting(false); setI((n) => n + 1); }
      else setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
    }, delay);
    return () => window.clearTimeout(t);
  }, [text, deleting, i, words, paused]);
  return text;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function IndiaLandHome() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [planFor, setPlanFor] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const typed = useTypewriter(typingPhrases, focused || query.length > 0);
  useReveal();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > window.innerHeight * 0.45);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const suggestions = useMemo(() => {
    const n = query.trim().toLowerCase();
    if (!n) return [];
    return destinations.filter((d) => [d.city, d.state, ...d.places].some((v) => v.toLowerCase().includes(n))).slice(0, 6);
  }, [query]);

  const openPlan = (value: string) => {
    const v = value.trim();
    if (v.length < 2) return;
    setQuery(v);
    setPlanFor(v);
  };
  const closePlan = useCallback(() => setPlanFor(null), []);

  const signOut = async () => { await supabase.auth.signOut(); };

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
              <a href="#planner" className="transition-colors hover:text-ink">Plan</a>
              <a href="#discover" className="transition-colors hover:text-ink">Discover</a>
              <a href="#regions" className="transition-colors hover:text-ink">Top places</a>
            </nav>
            <div className="hidden items-center gap-2 sm:flex">
              {user ? (
                <>
                  <span className="max-w-40 truncate text-sm text-ink/60">{user.email}</span>
                  <Button variant="ghost" className="gap-2" onClick={signOut}><LogOut className="size-4" /> Sign out</Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
                  <Button asChild><Link to="/auth">Sign up</Link></Button>
                </>
              )}
            </div>
            <Button variant="ghost" className="size-10 px-0 sm:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
          {menuOpen && (
            <nav className="animate-rise-in mt-2 grid rounded-lg border border-border bg-cream/95 p-2 shadow-lg backdrop-blur-xl sm:hidden" aria-label="Mobile navigation">
              {[["Plan", "#planner"], ["Discover", "#discover"], ["Top places", "#regions"]].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-3 text-sm font-semibold hover:bg-ink/5">{label}</a>
              ))}
              {user ? <button onClick={signOut} className="rounded-md px-3 py-3 text-left text-sm font-semibold hover:bg-ink/5">Sign out</button>
                : <Link to="/auth" className="rounded-md px-3 py-3 text-sm font-semibold hover:bg-ink/5">Sign in / Sign up</Link>}
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
            <p className="animate-rise-in max-w-[46ch] text-base leading-relaxed text-cream/90 sm:text-lg" style={{ animationDelay: ".3s" }}>Every city, every landmark. Top-rated places, scam alerts, public transport and live weather — in one plan.</p>
            <a href="#planner" className="animate-rise-in flex w-fit items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-cream/80" style={{ animationDelay: ".5s" }}>
              Explore <ArrowDown className="animate-cue size-4" />
            </a>
          </div>
        </div>
      </section>

      <section id="planner" className="scroll-mt-24 bg-cream">
        <div className="reveal mx-auto max-w-[1440px] px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta sm:text-sm">Where to next</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">Plan a visit anywhere in India</h2>
          <form className="mt-8 rounded-xl border border-border/70 bg-card/70 p-3 shadow-[0_24px_80px_-46px_var(--ink)] backdrop-blur-xl" onSubmit={(e) => { e.preventDefault(); openPlan(query); }}>
            <div className="flex flex-col gap-3 md:flex-row">
              <label className="relative flex min-h-16 flex-1 items-center gap-3 rounded-lg border border-border/70 bg-cream/70 px-4 transition-shadow focus-within:shadow-[0_0_0_3px_var(--saffron)]">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <span className="sr-only">Search any city, state or place in India</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} className="relative z-10 w-full bg-transparent text-lg font-semibold outline-none" />
                {!query && !focused && (
                  <span aria-hidden className="pointer-events-none absolute left-12 text-lg font-semibold text-muted-foreground">
                    Try “{typed}<span className="animate-caret ml-0.5 inline-block h-5 w-0.5 translate-y-0.5 bg-terracotta" />”
                  </span>
                )}
              </label>
              <Button type="submit" className="min-h-16 gap-2 px-8 text-base transition-transform hover:scale-[1.02]"><Compass className="size-5" /> Plan a visit</Button>
            </div>
            {suggestions.length > 0 && (
              <div className="animate-rise-in mt-3 grid gap-1 border-t border-border/70 px-1 pt-3 sm:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((d) => (
                  <Button key={d.city} type="button" variant="ghost" className="h-auto justify-start gap-3 px-3 py-2 text-left" onClick={() => openPlan(`${d.city}, ${d.state}`)}>
                    <MapPin className="size-4 shrink-0 text-terracotta" />
                    <span><strong>{d.city}</strong><span className="block text-xs font-normal text-muted-foreground">{d.state}</span></span>
                  </Button>
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2 px-1 pb-1">
              {featuredCities.map((city, i) => {
                const item = destinations.find((d) => d.city === city);
                return (
                  <Button key={city} type="button" variant="ghost" className="animate-rise-in min-h-8 rounded-full border border-border/60 px-3 py-1 text-xs" style={{ animationDelay: `${i * 70}ms` }} onClick={() => openPlan(item ? `${city}, ${item.state}` : city)}>
                    {city}{item ? `, ${item.state}` : ""}
                  </Button>
                );
              })}
            </div>
          </form>
          <p className="mt-3 text-sm text-muted-foreground">Any city, town or landmark works — results come live with ratings, directions and weather.</p>
        </div>
      </section>

      <div className="overflow-hidden border-y border-border/60 bg-sand/40 py-4" aria-hidden>
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-display text-2xl text-ink/50">
          {[...Array(2)].flatMap((_, k) => ["Agra", "Amritsar", "Rishikesh", "Darjeeling", "Munnar", "Mysuru", "Khajuraho", "Shillong", "Andaman", "Jaisalmer", "Ooty", "Madurai", "Pondicherry", "Gangtok", "Manali", "Kaziranga"].map((c) => <span key={`${k}-${c}`}>{c} ·</span>))}
        </div>
      </div>

      <section id="discover" className="bg-cream">
        <div className="reveal mx-auto max-w-[1440px] px-5 py-16 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Browse by mood</h2>
            <span className="hidden text-sm font-semibold text-muted-foreground sm:block">Tap to plan</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[["Heritage", "Forts, palaces, old cities", "Heritage forts in Rajasthan"], ["Coastal", "Beaches, islands, backwaters", "Beaches in Goa"], ["Himalayan", "Peaks, valleys, monasteries", "Himachal Pradesh"], ["Spiritual", "Temples, ghats, monasteries", "Varanasi"]].map(([title, copy, q], i) => (
              <button key={title} onClick={() => openPlan(q!)} className="animate-float-y rounded-xl border border-border/60 bg-card/65 p-5 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-terracotta/50 hover:shadow-lg" style={{ animationDelay: `${i * 0.6}s` }}>
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="regions" className="bg-cream">
        <div className="reveal mx-auto max-w-[1440px] px-5 pb-20 sm:px-6 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta sm:text-sm">Top places</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">From around India</h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {topPlaces.map((d, i) => (
              <button key={d.city} className={`group text-left ${i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`} onClick={() => openPlan(`${d.city}, ${d.state}`)}>
                <div className={`overflow-hidden rounded-xl bg-sand ${i === 0 ? "aspect-square sm:aspect-auto sm:h-[calc(100%-4.5rem)]" : "aspect-square"}`}>
                  <img src={d.image} alt={`${d.city}, ${d.state}`} width={1024} height={1024} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div><h3 className="font-display text-2xl font-semibold transition-colors group-hover:text-terracotta">{d.city}</h3><p className="text-sm text-muted-foreground">{d.state}</p></div>
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-terracotta">{d.label}</span>
                </div>
              </button>
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

      {planFor && <PlanOverlay query={planFor} onClose={closePlan} />}
    </main>
  );
}
