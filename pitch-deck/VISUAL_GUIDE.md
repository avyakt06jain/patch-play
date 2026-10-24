# Visual direction

## Format

- Use 16:9 widescreen.
- Keep a 0.55-inch safe margin.
- Use one dominant screenshot per slide when possible.
- Avoid decorative stock images. The running prototype already supplies the strongest visual evidence.

## Color system

- Base background: `#070D16`
- Raised navy: `#0E1B29`
- Gamer cyan: `#52DFE1`
- Coder amber: `#FFC078`
- Failure red: `#FA7285`
- Verified green: `#72E5A0`
- Main text: `#DCEBF0`
- Muted text: `#7890A1`

Use cyan and amber to distinguish roles. Reserve red for an actual failure state. Reserve green for a passing test, deployed repair, or player verification.

## Typography

- Titles: Bahnschrift Semibold, Aptos Display Semibold, or another condensed geometric sans. Use 32–38 pt.
- Cover title: 50–58 pt.
- Body text: Aptos, Arial, or Inter if available. Use 19–23 pt.
- Code and technical labels: Consolas or JetBrains Mono. Use at least 16 pt.
- Keep slide titles short and remove trailing periods.

## Screenshot treatment

- Preserve the 16:9 aspect ratio whenever a screenshot is the hero image.
- For partial crops, retain role headers and the semantic status color.
- Use a one-point border matching the relevant role color.
- Add a soft shadow only when the screenshot sits on the navy background.
- Never stretch screenshots. Crop from quiet outer margins instead.
- Do not place explanatory text over code, incident details, test results, or victory overlays.

## Recommended visual rhythm

- Slides 1 and 10 use full-bleed screenshots.
- Slides 2, 3, 4, 5, 8, and 9 use one screenshot beside a concise text block.
- Slide 6 uses a two-state comparison.
- Slide 7 uses a three-image campaign strip.

## Animation

- Use simple appear or fade transitions only.
- On slide 4, reveal the five process steps one at a time while keeping the screenshot static.
- On slide 6, reveal deployment first and verification second.
- Avoid animating screenshots, code, or UI elements independently.

