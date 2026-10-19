# Build the tracked browser restoration

The restored game code is tracked in `src/` and `CMakeLists.txt`; browser support
is in `browser/`. Run these steps from the repository root. The release ZIP stays
available as an unchanged snapshot; extracting it is no longer required.

1. Install Git, Python 3, CMake and Ninja. Node.js is optional for the storage test.
2. Obtain emsdk at commit `3b3963d86a5c97adaf6eaa845cdfe0b811c2f960`, install and
   activate **4.0.23**, and load its environment. First use downloads pinned SDL2.
3. Run `python browser/scripts/patch-emscripten.py /path/to/emsdk/upstream/emscripten`.
   It verifies the expected expression before patching legacy-GL compatibility.
4. Run `python browser/scripts/stage-runtime.py`. It verifies 493 selected files
   and refuses existing output to avoid overwriting saves. Original assets are
   preserved. Runtime staging requires the original asset bytes; configure Git
   to preserve those files if your checkout applies line-ending conversions.
5. Configure and build (replace the two absolute paths):

```sh
emcmake cmake -S . -B build/browser -G Ninja -DCMAKE_BUILD_TYPE=Release -DCYLINDRIX_YAML_SOURCE=/absolute/repo/browser/vendor/libyaml -DCYLINDRIX_WEB_ASSETS=/absolute/repo/browser/runtime -DCYLINDRIX_WEB_PREVIEW=OFF
cmake --build build/browser --parallel 4
```

6. Copy `browser/web/index.html`, `browser/web/bridge.js`,
   `browser/web/persistence.js` and `browser/notices.txt` to `build/browser/`.
   Copy `cylindrix-browser-source-2026-10-19.zip` there as `source.zip`, retaining
   the matching source-download link for this released revision.
7. Run `python -m http.server 8080 --directory build/browser` and visit
   `http://localhost:8080/`. Click **Start prototype**. Do not use a `file:` URL.
   Sound starts muted. Stop the game and server after testing.

Storage regression: `node browser/tests/persistence.mjs` after staging assets.
Native Windows builds use the original pinned vcpkg dependencies; the browser
build does not require installing vcpkg packages. Browser music is excluded.
`CYLINDRIX_LAB` is optional diagnostic replay and is **OFF** by default.

## Reproducibility and attribution

The tracked game/web implementation matches the published corresponding-source package,
SHA-256 `db0d5db932e583fef05e07c73f1227b036c41f91bbdaf703ebc5a359683466f2`
(6,232,825 bytes). That package was independently rebuilt into byte-identical
JS/WASM/data using the pinned toolchain. The tracked repository layout was also
configured and rebuilt independently: all three generated files match that
published build byte for byte. The storage regression passed. Fresh-machine SDK
setup is not yet tested.

Original game, art and code are credited to their respective authors; this work
continues hyperlogic's port. Retain all source headers, LICENSE, `README.upstream.md`,
`browser/licenses/` and `browser/ASSET-MANIFEST.json` with redistributed builds.
For modified revisions regenerate the corresponding source package as well; the
19 October ZIP only corresponds to the recorded release, not arbitrary changes.
