import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/trips")({
  head: () => ({
    meta: [
      { title: "My trips — India Land" },
      { name: "description", content: "Your saved India Land itineraries." },
      { property: "og:title", content: "My trips — India Land" },
      { property: "og:description", content: "Your saved India Land itineraries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Trips,
});

type Stop = { slot: string; name: string };

function Trips() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_trips").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("saved_trips").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
  const signOut = async () => { qc.clear(); await supabase.auth.signOut(); window.location.href = "/"; };
  return (
    <main className="min-h-screen bg-ink px-5 py-10 text-cream lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-semibold">INDIA <span className="text-terracotta">LAND</span></Link>
          <Button variant="ghost" className="text-cream hover:bg-cream/10" onClick={signOut}>Sign out</Button>
        </div>
        <h1 className="mt-8 font-display text-4xl font-semibold">My trips</h1>
        {q.isPending && <p className="mt-4 text-cream/60">Loading…</p>}
        {q.data?.length === 0 && <p className="mt-4 text-cream/60">No saved trips yet. Search a city on the home page and press Save trip.</p>}
        <div className="mt-6 grid gap-5">
          {q.data?.map((t) => (
            <article key={t.id} className="animate-card-in rounded-xl border border-cream/10 bg-cream/5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">{t.city}</h2>
                  <p className="text-sm capitalize text-cream/60">{t.days} days · {t.budget}{t.interests.length ? ` · ${t.interests.join(", ")}` : ""}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-cream/60 hover:bg-cream/10" aria-label="Delete trip" onClick={() => del.mutate(t.id)}><Trash2 className="size-4" /></Button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(t.plan as { day: number; stops: Stop[] }[]).map((d) => (
                  <div key={d.day} className="rounded-lg bg-ink/50 p-3 text-sm">
                    <p className="font-semibold text-saffron">Day {d.day}</p>
                    {d.stops.map((s) => <p key={s.name}><span className="text-cream/50">{s.slot}:</span> {s.name}</p>)}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
