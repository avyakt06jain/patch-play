# Reliable 90-second demo

## Preparation

- Run `npm run dev` and open the printed local URL.
- Use Chrome at 1440×900 or 1600×900.
- Choose Guided mode and Level 01.
- Keep the default split view.
- Reset the level immediately before presenting.
- Avoid opening detached windows during the timed demo.

## Demo sequence

### 0–15 seconds — Produce the failure

Move to the access token, activate the optional scanner, and enter all three bridge tiles. The third tile triggers `BRG-101` and returns the player to the checkpoint.

Say: “The player reached the documented safe boundary, but the live rule collapsed the bridge.”

### 15–28 seconds — Report the incident

Click **REPORT TO DEV_02**.

Point to:

- observed `true`
- expected `false`
- `shouldCollapse`
- `bridge.controller.ts:3`
- the captured movement trace

Say: “The report contains evidence and a boundary clue, but it does not reveal the completed patch.”

### 28–45 seconds — Edit the real module

Change:

```ts
return stepsOnBridge >= maxSafeSteps;
```

to:

```ts
return stepsOnBridge > maxSafeSteps;
```

Say: “This TypeScript module controls both the game and the tests.”

### 45–58 seconds — Test the candidate

Click **TEST CANDIDATE**. Show `4/4 PASSED` and the four boundary cases.

Say: “Testing creates confidence but leaves the live world unchanged.”

### 58–70 seconds — Deploy

Click **DEPLOY v1**. Show the live revision and the verification banner.

Say: “Deployment replaces the live bundle only because the exact candidate passed.”

### 70–85 seconds — Verify in the world

Cross the bridge again. The bridge remains stable and incident 2 unlocks.

Say: “The player repeats the failed action. This physical verification unlocks the next defect.”

### 85–90 seconds — Close

Point to `BRG-101` marked complete and `GATE-102` becoming active.

Say: “The next test run must preserve this bridge fix while repairing the gate.”

## Recovery plan

- If movement focus is lost, click an empty area of the Gamer panel and continue.
- If the code editor captures the keyboard, click the world before using WASD.
- If a wrong edit causes a compiler error, click **RESTORE**, make the one-character change again, and rerun the candidate.
- If the path becomes confusing, press `R` to return to the latest checkpoint.
- If anything unexpected persists, use **RESET LEVEL**. The demo returns to a deterministic baseline.

