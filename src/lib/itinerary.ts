export type Budget = "backpacker" | "comfort" | "luxury";
export const BUDGETS: { id: Budget; label: string; perDay: number; hotel: string }[] = [
  { id: "backpacker", label: "Backpacker", perDay: 2000, hotel: "Hostels & guest houses" },
  { id: "comfort", label: "Comfort", perDay: 6000, hotel: "3-star hotels" },
  { id: "luxury", label: "Luxury", perDay: 18000, hotel: "4–5 star hotels" },
];
export const INTERESTS = ["Heritage", "Temples", "Nature", "Food & markets", "Museums", "Nightlife"] as const;
export const FREE_DAY_LIMIT = 2;

const KEYWORDS: Record<string, RegExp> = {
  Heritage: /fort|palace|monument|heritage|tomb|historic|mahal|haveli|ruins|memorial/i,
  Temples: /temple|mosque|church|cathedral|gurudwara|shrine|ghat|monastery|dargah|mandir/i,
  Nature: /park|garden|lake|beach|hill|falls|river|national|wildlife|valley|island/i,
  "Food & markets": /market|bazaar|street|food|chowk|mall/i,
  Museums: /museum|gallery|science|planetarium|library/i,
  Nightlife: /beach|club|promenade|bar|street|marine drive/i,
};

export type PlanPlace = { id: string; name: string; type: string | null; summary: string | null };

export function matchesInterest(p: PlanPlace, interests: string[]) {
  if (!interests.length) return true;
  const text = `${p.name} ${p.type ?? ""} ${p.summary ?? ""}`;
  return interests.some((i) => KEYWORDS[i]?.test(text));
}

/** Split ranked places into day plans: 3 stops a day, interest matches first. */
export function buildItinerary<T extends PlanPlace>(places: T[], days: number, interests: string[]) {
  const preferred = places.filter((p) => matchesInterest(p, interests));
  const ordered = [...preferred, ...places.filter((p) => !preferred.includes(p))];
  const slots = ["Morning", "Afternoon", "Evening"];
  return Array.from({ length: days }, (_, d) => ({
    day: d + 1,
    stops: ordered.slice(d * 3, d * 3 + 3).map((place, i) => ({ slot: slots[i]!, place })),
  })).filter((d) => d.stops.length > 0);
}

export function estimateCost(budget: Budget, days: number) {
  return (BUDGETS.find((b) => b.id === budget)?.perDay ?? 0) * days;
}

/** Which tier a custom daily budget (INR/person) falls into. */
export function tierForAmount(perDay: number): Budget {
  return perDay < 4000 ? "backpacker" : perDay < 12000 ? "comfort" : "luxury";
}

/** Split a daily budget: 45% stay, 25% food, 15% local travel, 15% tickets. */
export function budgetSplit(perDay: number) {
  const r = (f: number) => Math.round(perDay * f);
  return { stay: r(0.45), food: r(0.25), travel: r(0.15), tickets: r(0.15) };
}

/** Typical nightly price (INR) for a stay type, used to match the user's budget. */
export function estimateNightly(kind: string, stars: number | null) {
  if (/hostel/i.test(kind)) return 700;
  if (/guest|homestay|motel|apartment/i.test(kind)) return 1500;
  if (stars && stars >= 5) return 12000;
  if (stars && stars >= 4) return 7000;
  if (stars && stars >= 3) return 3500;
  return 2500;
}
