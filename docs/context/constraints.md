# Constraints

## Strict Rules
- **Approval**: ALL non-trivial changes require explicit user approval.
- **Decision Format**: Use the Approach/Files/Options/Question format for strategy presentation.

## Execution Risks (Cons)
- **Data Mapping "Hell"**: Matching different names for one item across platforms.
- **API Fragility**: Direct dependency on 3rd party API structures; updates require code changes.
- **User Retention**: High risk of users leaving the app to complete purchases (mitigated by Deep Links).

## Technical Constraints
- **Search Orchestration**: All searches MUST be split into Phase 1/2 to maintain sub-second "time to first result" (TTFR).
- **Selective Routing**: Avoid broad "all-platform" searches; use AI intent to limit platform tasks to relevant categories.
- **Next.js 16**: Breaking changes from standard docs.
- **Mobile-First**: UI must be optimized for performance and mobile usage.
- **Search-Triggered**: Logic must avoid persistent database storage where possible to minimize costs, except for price history tracking.
