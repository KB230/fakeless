---
name: Listing Check product decisions
description: Non-obvious product/trust rules for the counterfeit screening app
---

- Vision API: user chose to supply their own OpenAI key (OPENAI_API_KEY secret) instead of Replit AI Integrations.
  **Why:** user's explicit choice during setup (Nov 2026). **How to apply:** don't switch to the managed AI integration without asking.
- Live checks must never pass on demo references or sample codes; they route to manual review.
  **Why:** spec requires demo references/results to stay separate from live checks. **How to apply:** keep this rule when adding profiles; only `referenceStatus: "documented"` profiles can pass live.
