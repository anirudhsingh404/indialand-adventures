import { describe, expect, it } from "vitest";
import { fallbackEateries, fallbackHotels, fallbackTransit } from "./travel-fallbacks";

describe("offline travel recommendations", () => {
  it("offers metro, rail, bus, and map-search links for Kolkata transport", () => {
    const results = fallbackTransit(22.5726, 88.3639);
    const kinds = results.map((result) => result.kind);

    expect(kinds).toContain("Metro");
    expect(kinds).toContain("Railway");
    expect(kinds).toContain("Bus stand");
    expect(results.every((result) => result.searchUrl.includes("google.com/maps/search/"))).toBe(true);
  });

  it("offers multiple stay types with budget estimates and map searches", () => {
    const results = fallbackHotels(22.5726, 88.3639);

    expect(results).toHaveLength(4);
    expect(results[0]?.nightly).toBe(700);
    expect(results.map((result) => result.kind)).toContain("guest house");
    expect(results.every((result) => result.mapsUrl.includes("google.com/maps/search/"))).toBe(true);
  });

  it("keeps popular and underrated food picks available offline", () => {
    const results = fallbackEateries(22.5726, 88.3639);

    expect(results.map((result) => result.name)).toContain("K.C. Das");
    expect(results.some((result) => result.label === "Popular")).toBe(true);
    expect(results.some((result) => result.label === "Underrated gem")).toBe(true);
    expect(results.every((result) => result.mapsUrl.includes("google.com/maps/search/"))).toBe(true);
  });
});