# Browser build from the release source package

Download and extract `cylindrix-browser-source-2026-10-19.zip` from this repository, or the corresponding source link in README.md. Run the commands below from the extracted directory. The package contains the modified game sources, staged runtime files, libyaml 0.2.5 source, original notices and the exact Emscripten compatibility patch. No account credentials are required. In this initial publication the browser changes are distributed in the source archive; the top-level upstream C++ tree has not been replaced. Build the archive's `game` directory for the browser preview.

1. Install Git, Python 3, CMake and Ninja.
2. Obtain emsdk at commit `3b3963d86a5c97adaf6eaa845cdfe0b811c2f960`, install and activate **4.0.23**. Use the SDK environment for the following commands. Emscripten downloads its pinned SDL2 port on first use.
3. Run `python scripts/patch-emscripten.py /path/to/emsdk/upstream/emscripten`. The patch checks the exact original expression and is idempotent.
4. Run `emcmake cmake -S game -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DCYLINDRIX_YAML_SOURCE=<absolute path>/vendor/libyaml -DCYLINDRIX_WEB_ASSETS=<absolute path>/runtime -DCYLINDRIX_WEB_PREVIEW=OFF`.
5. Run `cmake --build build --parallel 4`, then copy `web/index.html`, `web/bridge.js` and `web/persistence.js` into `build/`.
6. Serve `build/` over localhost HTTP. Open its index page and select Start prototype. Do not open it as a `file:` URL.

The native Windows build additionally requires the original pinned vcpkg dependencies and the documented pkgconf acquisition fix; it is not required to compile this browser package. Browser music support is intentionally excluded. The diagnostic exports are read-only except the documented input/lifecycle API; they do not force a game outcome.

The 19 October source candidate (SHA-256 `db0d5db932e583fef05e07c73f1227b036c41f91bbdaf703ebc5a359683466f2`, 6,232,825 bytes) was independently configured and compiled in a separate build directory using the installed pinned toolchain. Its JS, WASM and preloaded data hashes matched the accepted build byte for byte. This verifies rebuilding from the exported sources on the prepared machine; downloading/setup on a completely fresh machine has not been tested.

Keep original notices and the asset manifest with any redistributed build. The archive's older README and asset-staging description refer to a custom-match-only phase; the source and unchanged curated assets in this archive implement and have been tested through both single-player modes. The repository README records the current scope and validation limits.
