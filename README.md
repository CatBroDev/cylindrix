# Cylindrix browser restoration

An unofficial browser port of Cylindrix, the 1995 vehicle-combat game, continuing [hyperlogic/cylindrix](https://github.com/hyperlogic/cylindrix). The original game, art and community port belong to their respective authors. Old Games Archive contributes compatibility fixes, a reproducible browser build and player integration.

**Status: browser preview, 19 October 2026.** Custom matches have reached natural wins/losses and can restart. The ten-stage tournament passes transition/ending tests using the upstream debug shortcut, separately from ordinary gameplay tests. Pilot creation, cumulative statistics, keyboard settings, reload persistence and text-report export have passed browser tests. Physical Android/iOS acceptance remains pending; desktop touch emulation is recorded separately.

## Play and source

- **[Play the browser preview](https://preview.oldgamesarchive.org/games/cylindrix?preview=true)**
- [中文介绍与操作说明](https://preview.oldgamesarchive.org/zh-cn/games/cylindrix?preview=true)
- [Download the exact corresponding source package](https://assets-preview.oldgamesarchive.org/games/native/cylindrix/c68709c087adb082627943439b11ad7811711519237bc4f35655f9c3be3eddd8/source.zip), also mirrored as `cylindrix-browser-source-2026-10-19.zip` in this repository.
- [Build instructions](BUILD.md) and [original upstream README](README.upstream.md).

The preview supports both Custom Game and Tournament Game. It is not yet published to the production game catalogue. The repository retains upstream history and attribution; the browser source archive additionally includes the exact curated runtime, dependency source and license notices needed to reproduce this build.

## What changed

- Restore a Windows x64 baseline and fix pointer-width sound handles and conflicting declarations.
- Reuse the upstream OpenGL renderer with current Emscripten/SDL2, including resize handling and checked legacy-GL compatibility.
- Keep the original 30-Hz simulation with browser frame scheduling.
- Add explicit keyboard/touch lifetime, mute, pause/resume and stop/dispose operations.
- Repair config writes and cumulative pilot statistics; restore them from validated browser-local storage.
- Yield instead of blocking the browser when menus wait for sound or key input.
- Normalize DOS separators inside level records so later tournament stages can load their models.
- Use the website's existing player shell, language dictionaries and configurable touch controls through a versioned iframe protocol.
- Stage the reviewed runtime used by both single-player modes. MP3 music, tournament movies and unused files are excluded; upstream originals remain untouched.

This is a restoration of existing code, not a new game or an official release. The upstream port already included browser work before these changes.

## Controls

Arrow keys move and turn; Ctrl fires the laser; Space fires a missile; S switches air/ground mode; X uses the special weapon; V changes the view. A/Z change air speed, Alt plus a direction sidesteps. Enter selects menu items and Esc opens the game menu. F1–F12 issue wingman orders. These mappings come from the original controls reference and the pinned configuration.

Audio starts muted. The browser build currently provides original WAV effects, with no MP3 soundtrack. Pilot records, cumulative statistics and settings persist in local browser storage when it is available. Battles and tournament stages cannot be resumed midway. No server or cloud saves are used.

## Sources and licensing

- Upstream commit: `ee13bd95036331520181eeefe6f12d0638b1ffe8`.
- [Original programmer's release statement](https://www.hardcrawler.com/cylindrix/).
- Historical source archive SHA-256: `50e72af49706b1bba89b2f87143cf154dc6e21b41bf141df7b725ef4a5a9cf08` (outer ZIP).
- Every staged runtime file has a hash and a provenance category in the release asset manifest.

Preserve all original notices. Original source headers specify GNU Library GPL version 2; upstream LICENSE contains LGPL 2.1, while the historical COPYING contains GPLv2. These records are retained separately rather than replaced with a newly invented blanket license. New changes to existing code follow the original file's terms. A release must include its corresponding modified source, build recipe, dependency versions, notices and asset manifest alongside the executable files.

## Contributing

This fork is maintained by [Old Games Archive](https://oldgamesarchive.org). Reproducible bug reports should include the game mode, level, browser, input device and steps to reproduce. Please do not include personal data or browser-storage contents.

Upstream contributions will be split into small, independently reviewable fixes. No upstream pull request has been submitted for this preview. The website and its shared player UI are maintained separately.

## Reproduction and evidence

The corresponding source package is 6,232,825 bytes; SHA-256: `db0d5db932e583fef05e07c73f1227b036c41f91bbdaf703ebc5a359683466f2`. Rebuilding the exported source in a separate build directory with the pinned toolchain reproduced JS/WASM/data byte for byte. The source archive's earlier asset-staging description still says custom matches; the unchanged curated assets were subsequently tested through all ten tournament stages. This README describes the current scope.

Acceptance covers natural custom-match wins/losses, results/restart, pilot persistence, key remapping, text export, the ten-stage transition test, multi-touch input, pause/resume and audio disposal. Tournament transitions were accelerated with the original `-nuke` debug shortcut; this is not a claim of a naturally played full campaign. Physical phone testing and fresh-machine SDK installation remain unverified.
