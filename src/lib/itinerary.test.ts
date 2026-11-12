import { describe, expect, it } from "vitest";
import { buildItinerary, estimateCost } from "./itinerary";

const p = (name: string) => ({ id: name, name, type: null, summary: null });

describe("itinerary", () => {
  it("puts 3 stops per day", () => {
    const plan = buildItinerary([p("a"), p("b"), p("c"), p("d")], 2, []);
    expect(plan[0]!.stops).toHaveLength(3);
    expect(plan[1]!.stops).toHaveLength(1);
  });
  it("puts interest matches first", () => {
    const plan = buildItinerary([p("City Mall"), p("Amber Fort")], 1, ["Heritage"]);
    expect(plan[0]!.stops[0]!.place.name).toBe("Amber Fort");
  });
  it("comfort costs 6000 INR per day", () => {
    expect(estimateCost("comfort", 3)).toBe(18000);
  });
});

import { budgetSplit, estimateNightly, tierForAmount } from "./itinerary";
describe("custom budget", () => {
  it("₹3,000/day is backpacker, ₹6,000 comfort, ₹15,000 luxury", () => {
    expect(tierForAmount(3000)).toBe("backpacker");
    expect(tierForAmount(6000)).toBe("comfort");
    expect(tierForAmount(15000)).toBe("luxury");
  });
  it("45% of ₹4,000 goes to stay", () => {
    expect(budgetSplit(4000).stay).toBe(1800);
  });
  it("a hostel fits a ₹1,000 stay budget", () => {
    expect(estimateNightly("hostel", null)).toBeLessThanOrEqual(1000);
  });
});
