# PATCH//PLAY pitch-deck kit

This folder contains everything needed to build a 16:9 hackathon pitch deck without committing to a specific PowerPoint template.

Start with:

1. `SLIDE_PLAN.md` for the exact ten-slide story, on-slide copy, placement, screenshot crop, and speaker intent.
2. `TALK_TRACK.md` for a five-minute spoken pitch.
3. `DEMO_SCRIPT.md` for the reliable 90-second live demonstration.
4. `VISUAL_GUIDE.md` for colors, typography, spacing, and screenshot treatment.
5. `ASSET_MANIFEST.md` to choose the correct prototype screenshot.
6. `SUBMISSION_COPY.md` for hackathon form text and the technical summary.

All images in `assets/screenshots/` came from the running v3 prototype at 1600×900. They are direct browser captures, not mockups. The capture can be reproduced from the repository root with:

```bash
node pitch-deck/capture-screenshots.mjs
```

Recommended deck length: ten slides plus the live demo. At normal pace, the slides take about five minutes. If the judging slot allows only three minutes, use slides 1, 2, 3, 5, 6, 8, and 10.

