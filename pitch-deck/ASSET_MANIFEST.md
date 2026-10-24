# Screenshot asset manifest

All assets are 1600×900 PNG captures from the running local prototype.

## `01-campaign-menu.png`

Campaign selection with all four wings, eight-defect count, Guided/Challenge choice, and the core product statement. Primary use: title slide.

## `02-level1-split-start.png`

Default 57/43 Gamer/Coder layout before an incident. Primary use: product concept and role explanation.

## `03-under-the-hood.png`

Judge drawer showing the runtime data path, active export, live/candidate revisions, QuickJS limits, and captured-event count. Primary use: architecture slide.

## `04-live-incident.png`

The bridge boundary failure immediately after gameplay reproduces it. The red overlay and incident evidence are visible. Primary use: problem slide.

## `05-coder-diagnosis.png`

Reported incident with source location, contextual hint, highlighted file, replay controls, and test explorer. Primary use: debugging pipeline slide.

## `06-detached-coder.png`

Full-width Coder role window connected to the authoritative host. Primary use: synchronization and collaboration slide.

## `07-tests-passed.png`

Edited bridge rule with `4/4 PASSED`, candidate diff, and deploy button enabled while the world remains unchanged. Primary use: technical depth slide.

## `08-patch-deployed.png`

Candidate v1 deployed and awaiting Gamer verification. Primary use: first half of deployment/verification slide.

## `09-second-incident.png`

Gate incident produced after the bridge patch was verified. Primary use: backup slide for sequential defects and regression coverage.

## `10-wing-stabilized.png`

Both Level 1 incidents verified with the green completion overlay. Primary use: second half of deployment/verification slide.

## `11-campaign-progress.png`

Campaign menu after Transit Wing completion. Primary use: closing slide background.

## `12-signal-wing.png`

Violet Signal Wing world with its sequence validator source visible. Primary use: campaign breadth slide.

## `13-cargo-wing.png`

Amber Cargo Wing world with crates, plates, conveyors, and occupancy source. Primary use: campaign breadth slide.

## `14-reactor-wing.png`

Red/green Reactor Wing world with valves, lasers, patrol marker, and state-transition source. Primary use: campaign breadth slide.

## Capture notes

- The captures use Guided mode.
- Browser viewport: 1600×900.
- Reduced motion is enabled for stable screenshots.
- LocalStorage is cleared before capture, then Level 1 is completed to obtain the campaign-progress state.
- Regenerate all images with `node pitch-deck/capture-screenshots.mjs`.

