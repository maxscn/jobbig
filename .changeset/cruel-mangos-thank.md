---
"@jobbig/drizzle": patch
"@jobbig/core": patch
---

Drizzle changes: broader type signature, since I can't get it to work otherwise. Core changes: If no match job, we should still schedule the run without type validation.
