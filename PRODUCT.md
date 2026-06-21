# Product

## Register

product

## Users

Two primary users share the same screen:

1. **Beneficiary / recipient** — a community resident checking whether their stipend arrived, verifying their balance, and occasionally sending XLM. Low crypto familiarity; uses this to confirm money is real and accessible.
2. **NGO / government officer** — an admin or program coordinator funding the pool, enrolling recipients, and monitoring disbursements. Comfortable with forms and data; needs to trust the numbers.

Both use this at a desk or laptop, in a professional or semi-professional setting. Trust and clarity matter more than novelty.

## Product Purpose

Ayuda Direct removes the middleman from Philippine government and NGO cash-assistance programs. A program pool is funded once; enrolled beneficiaries claim their stipend directly from the Soroban smart contract, at most once per period, enforced by the ledger clock. No manual batch runs, no discretionary delays, every disbursement verifiable on-chain.

The frontend is the trust surface: it proves the money is real, the wallet is connected, and the transaction was submitted — without requiring the user to understand blockchain mechanics.

Success looks like: a barangay resident opens the page, sees their balance, sends XLM to another address, and closes the tab — confident the system worked.

## Brand Personality

Trustworthy. Transparent. Direct.

Voice is clear and institutional without being bureaucratic. No marketing fluff; every word earns its place. The tool should feel like a well-built government counter that actually works — not a startup, not a bank, not a crypto exchange.

## Anti-references

- **Generic crypto / neon DeFi**: dark-mode with neon green/purple gradients, speculative energy, rocket emoji, "to the moon" aesthetics.
- **Corporate government portals**: blue-gray bureaucratic forms, thin borders, serif type, dense tables that look like a DMV site.
- **SaaS dashboard clichés**: big hero metrics with tiny labels, sidebar nav, identical card grids, teal/purple accent combos, gradient text.
- **Playful / consumer fintech**: bright colors, rounded bubbly components, feels like GCash or a consumer wallet app.

## Design Principles

1. **The number is the UI.** The balance and the transaction hash are the most important elements on the page. Hierarchy flows from those outward.
2. **Earn trust through precision.** Tight spacing, exact values, no decoration for its own sake. If a pixel doesn't serve communication, remove it.
3. **Civic, not corporate.** Warm and human without being playful. Think: a well-designed public notice, not a startup landing page.
4. **Transparency through structure.** The layout should reveal how the system works — fund, enroll, claim — not hide it behind abstraction.
5. **Actions feel consequential.** Sending XLM is real. The interface should make the weight of that clear: deliberate inputs, clear confirmation, obvious feedback.

## Accessibility & Inclusion

WCAG AA minimum. Consider low digital literacy for some beneficiary users: clear labels, never rely on color alone for state, form errors must be explicit. Reduced-motion preference respected via `prefers-reduced-motion`.
