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
