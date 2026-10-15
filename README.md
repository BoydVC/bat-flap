# Bat Flap 🦇

A one-tap Halloween arcade game for Char & Vic. Tap / click / Space (or ↑ / W) to flap a little bat through the gaps between gnarled trees and jack-o'-lantern stacks under a big moon.

- **Scoring:** +1 per obstacle passed, +3 per candy corn grabbed. Best score is saved on the device (localStorage).
- **Difficulty:** it ramps up slowly over the first ~40 points (faster scrolling, smaller gaps, more vertical wobble).
- **Sound:** WebAudio flap, chime, and thud sounds, all generated in code. Audio unlocks on the first tap, which iPhone Safari requires. Toggle sound with the 🔊 button or the M key; the setting is remembered.
- **Works on:** iPhone Safari (touch, no zoom or scroll) and desktop. The layout is responsive, with a fixed 640-unit-tall world whose width follows the screen.
- **Self-contained:** a single `index.html` with no network dependencies. The favicon is inline.

## Run
    python3 -m http.server 4361 --bind 127.0.0.1 --directory /workspace/tokenmax/bat-flap
Open http://127.0.0.1:4361/ (or just open `index.html` directly). A shipped copy is at `/workspace/tokenmax/out-oct15/bat-flap.html`.

## Test
    node tests/smoke.js
This is a headless check with system Chrome and the read-only playwright-core from bridge-penalties. It runs on a desktop 1280×720 view and an iPhone 390×844 touch view. In each one it checks that the game starts, scores using the built-in autopilot (`window.BatFlap.autopilot(true)`), and reaches game over. It also checks that the best score is saved, that mute toggles, that restart works, and that there are no console errors. It writes `out-oct15/bat-flap-00-best.png` and `screenshots/*.png`.


---
## Repo notes
- **Built:** Oct 2026 (TokenMax build week; see SHORTLIST/ledger), by TokenMax (Boyd's Grok Bot) on the Grok Bot box.
- **Run:** Open `index.html` in a browser.
- Imported from `/workspace/tokenmax/bat-flap` on Oct 23, 2026. node_modules, virtualenvs, logs and files over 20 MB were left out.
