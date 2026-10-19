# Browser restoration implementation

The game is by Goldtree Enterprises. This work continues the community port by
hyperlogic and its existing Emscripten support. Original copyright headers,
LICENSE, historical notices and the upstream README are preserved.

The source files in `../src` and `../CMakeLists.txt`, plus `web/`, are copied
from the tested 19 October 2026 corresponding-source package (only two trailing
whitespace occurrences in menu.cpp were removed). This
commit reorganizes them for source review; it does not change the live game.
`vendor/libyaml` contains the same pinned 0.2.5 dependency source and license.

- `web/`: standalone shell, browser-local pilot persistence, and the optional
  versioned host iframe bridge. It can run on localhost without the archive site.
- `scripts/stage-runtime.py`: selects 493 runtime files from the repository,
  applies six small versioned overrides, and verifies every SHA-256.
- `runtime-overrides/`: sound-disabled initial config and five files restored
  from the historical source release; upstream asset originals stay in place.
- `ASSET-MANIFEST.json`: per-file provenance and hashes. Its scope text is updated
  from the early custom-match prototype; runtime bytes are unchanged.
- `licenses/`: original source notices and dependency licenses, retained
  separately. No replacement blanket license is introduced.
- `tests/persistence.mjs`: browser-storage round-trip, malformed/oversized/path
  rejection and blocked-storage tests; run after staging runtime.

Follow [the root build instructions](../BUILD.md). The shared archive website UI
is maintained in a separate project and is not needed to build this shell.

## Validation and limitations

The published build passed natural custom-match win/loss, results/restart,
pilot/stat/settings persistence, key remapping and text export tests. The ten
tournament stages and ending were tested with the original `-nuke` shortcut;
this is not a naturally played full campaign. Android testing was reported
successful by the site owner. iOS and SDK setup on a fresh machine are untested.
There are no mid-battle/campaign checkpoints, cloud saves or multiplayer; MP3
music and tournament movies are excluded. Effects are present, muted by default.

[Play the published build](https://oldgamesarchive.org/games/cylindrix).
