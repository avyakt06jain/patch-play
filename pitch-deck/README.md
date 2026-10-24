# PATCH//PLAY pitch-deck kit

This folder contains a focused seven-slide hackathon pitch plan. The main deck uses only four prototype screenshots.

Start with:

1. `SLIDE_PLAN.md` for the exact seven-slide structure, copy, placement, and image selection.
2. `TALK_TRACK.md` for the four-minute spoken pitch.
3. `DEMO_SCRIPT.md` for the separate 90-second live demonstration.
4. `VISUAL_GUIDE.md` for color, typography, spacing, and screenshot treatment.
5. `ASSET_MANIFEST.md` for the four selected screenshots and optional backup captures.
6. `SUBMISSION_COPY.md` for form text and the technical stack.

## Main-deck screenshots

- `04-live-incident.png`
- `02-level1-split-start.png`
- `07-tests-passed.png`
- `10-wing-stabilized.png`

The other captures remain available only for judge questions or future deck versions. Do not place them in the seven-slide deck.

All screenshots came directly from the running v3 prototype at 1600×900. Regenerate them from the repository root with:

```bash
node pitch-deck/capture-screenshots.mjs
```

