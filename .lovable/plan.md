# Final India Land showcase readiness

## Goal
Make the main trip-planning experience reliable for a teacher presentation, especially transport, stays, and food when public map data is unavailable.

## Work
- Wire curated offline fallbacks into transport, hotel, and food lookups; clearly label estimates and map-search links, and still prefer live listings when available.
- Fix planner presentation states and ensure budget changes update stays, while preserving existing account and saved-trip behavior.
- Verify destination planning, custom budget, recommendations, saved-trip flow where auth permits, and desktop/mobile layout; fix issues found.
- Update the project roadmap, inspect current build/runtime signals, and commit the finished changes.

## Technical details
Keep the existing TanStack Start server-function boundary and semantic theme tokens. Use only free public data; do not add paid API dependencies or expose secrets. If live transport or hotel schedules/prices are unavailable, present useful nearby search guidance and mark estimates clearly rather than claiming real-time data.
