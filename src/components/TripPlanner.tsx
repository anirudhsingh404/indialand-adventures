import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { BedDouble, Bus, CalendarDays, ExternalLink, Lock, Save, Sparkles, Star, TrainFront, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BUDGETS, FREE_DAY_LIMIT, INTERESTS, buildItinerary, estimateCost, type Budget } from "@/lib/itinerary";
import { getHotels, getTransitHubs, type PlaceResult } from "@/lib/travel.functions";

const chip = (on: boolean) => `rounded-full border px-3 py-1.5 text-sm transition-all ${on ? "border-saffron bg-saffron text-ink" : "border-cream/20 text-cream/75 hover:border-saffron/60"}`;

function Locked({ what }: { what: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-saffron/40 bg-saffron/5 p-4 text-sm">
      <Lock className="size-4 shrink-0 text-saffron" />
      <span className="flex-1 text-cream/75">{what} unlock with a free account.</span>
      <Link to="/auth" className="font-semibold text-saffron">Sign up</Link>
    </div>
  );
}

export function TripPlanner({ city, places }: { city: string; places: PlaceResult[] }) {
  const { user } = useAuth();
  const [days, setDays] = useState(2);
  const [budget, setBudget] = useState<Budget>("comfort");
  const [interests, setInterests] = useState<string[]>([]);
  const maxDays = user ? 7 : FREE_DAY_LIMIT;
  const effDays = Math.min(days, maxDays);
  const plan = buildItinerary(places, effDays, interests);
  const center = places[0];

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("saved_trips").insert({
        user_id: user!.id, city, days: effDays, budget, interests,
        plan: plan.map((d) => ({ day: d.day, stops: d.stops.map((s) => ({ slot: s.slot, name: s.place.name })) })),
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Trip saved to My trips"),
    onError: (e) => toast.error(e.message),
  });

  return (
    <section className="animate-rise-in mb-10 rounded-2xl border border-cream/10 bg-cream/5 p-5 sm:p-7">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-saffron"><Sparkles className="size-4" /> Plan by your preferences</p>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><CalendarDays className="size-4" /> Days</p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <button key={d} type="button" onClick={() => setDays(d)} className={chip(days === d)} aria-pressed={days === d}>
                {d}{d > maxDays && <Lock className="ml-1 inline size-3" />}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Wallet className="size-4" /> Budget per person</p>
          <div className="flex flex-wrap gap-2">
            {BUDGETS.map((b) => (
              <button key={b.id} type="button" onClick={() => setBudget(b.id)} className={chip(budget === b.id)}>{b.label} · ₹{b.perDay.toLocaleString("en-IN")}/day</button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">What do you want to explore?</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button key={i} type="button" className={chip(interests.includes(i))} onClick={() => setInterests((v) => (v.includes(i) ? v.filter((x) => x !== i) : [...v, i]))}>{i}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-cream/10 pt-5">
        <p className="text-sm text-cream/70">Estimated cost: <span className="font-display text-2xl font-semibold text-cream">₹{estimateCost(budget, effDays).toLocaleString("en-IN")}</span> for {effDays} day{effDays > 1 ? "s" : ""} (stay, food, local travel)</p>
        {user ? (
          <div className="flex gap-2">
            <Button asChild variant="ghost" className="text-cream hover:bg-cream/10"><Link to="/trips">My trips</Link></Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || plan.length === 0} className="gap-2 bg-saffron text-ink hover:bg-saffron/90"><Save className="size-4" /> Save trip</Button>
          </div>
        ) : null}
      </div>
      {!user && days > maxDays && <div className="mt-4"><Locked what={`${days}-day plans, hotel picks and saved trips`} /></div>}

      {places.length === 0 ? <p className="mt-5 text-sm text-cream/60">Your plan appears once places load…</p> : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plan.map((d, i) => (
            <div key={d.day} className="animate-card-in rounded-xl border border-cream/10 bg-ink/50 p-4" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="font-display text-xl font-semibold">Day {d.day}</p>
              <ol className="mt-3 grid gap-3">
                {d.stops.map((s) => (
                  <li key={s.place.id} className="text-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-saffron">{s.slot}</span>
                    <p className="font-semibold">{s.place.name}</p>
                    {s.place.type && <p className="text-xs text-cream/55">{s.place.type}</p>}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      {center && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Hubs lat={center.lat} lng={center.lng} />
          {user ? <Hotels lat={center.lat} lng={center.lng} budget={budget} /> : (
            <div><h4 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold"><BedDouble className="size-5" /> Hotels in your budget</h4><Locked what="Budget hotel picks" /></div>
          )}
        </div>
      )}
    </section>
  );
}

function Hubs({ lat, lng }: { lat: number; lng: number }) {
  const fn = useServerFn(getTransitHubs);
  const q = useQuery({ queryKey: ["hubs", lat.toFixed(3), lng.toFixed(3)], queryFn: () => fn({ data: { lat, lng } }), staleTime: Infinity });
  return (
    <div>
      <h4 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold"><TrainFront className="size-5" /> Nearby public transport</h4>
      {q.isPending && <p className="text-sm text-cream/60">Finding metro, train and bus stations…</p>}
      {q.isError && <p className="text-sm text-cream/60">{q.error.message}</p>}
      {q.data && q.data.length === 0 && <p className="text-sm text-cream/60">No stations mapped nearby — use autos or app cabs.</p>}
      <ul className="grid gap-2">
        {q.data?.map((h) => (
          <li key={h.id} className="flex items-center gap-3 rounded-lg bg-ink/50 px-3 py-2 text-sm">
            {h.kind === "Bus stand" ? <Bus className="size-4 text-saffron" /> : <TrainFront className="size-4 text-saffron" />}
            <span className="flex-1">{h.name}</span>
            <span className="text-xs text-cream/50">{h.kind}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Hotels({ lat, lng, budget }: { lat: number; lng: number; budget: Budget }) {
  const fn = useServerFn(getHotels);
  const q = useQuery({ queryKey: ["hotels", lat.toFixed(3), lng.toFixed(3)], queryFn: () => fn({ data: { lat, lng } }), staleTime: Infinity });
  const list = (q.data ?? []).filter((h) => h.tier === budget).slice(0, 10);
  const label = BUDGETS.find((b) => b.id === budget)?.hotel;
  return (
    <div>
      <h4 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold"><BedDouble className="size-5" /> {label} nearby</h4>
      {q.isPending && <p className="text-sm text-cream/60">Finding stays…</p>}
      {q.isError && <p className="text-sm text-cream/60">{q.error.message}</p>}
      {q.data && list.length === 0 && <p className="text-sm text-cream/60">No listed stays in this budget nearby. Try another budget.</p>}
      <ul className="grid gap-2">
        {list.map((h) => (
          <li key={h.id} className="flex items-center gap-3 rounded-lg bg-ink/50 px-3 py-2 text-sm">
            <span className="flex-1"><span className="font-semibold">{h.name}</span> <span className="text-xs capitalize text-cream/50">· {h.kind}</span></span>
            {h.stars && <span className="flex items-center gap-1 text-xs text-saffron"><Star className="size-3 fill-current" />{h.stars}</span>}
            <a href={h.website ?? h.mapsUrl} target="_blank" rel="noreferrer" className="text-cream/60 hover:text-saffron" aria-label={`Open ${h.name}`}><ExternalLink className="size-4" /></a>
          </li>
        ))}
      </ul>
    </div>
  );
}
