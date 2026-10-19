"""Small, pinned Emscripten 4.0.23 correction; fail on unexpected upstream code."""
from pathlib import Path

import sys
target = Path(sys.argv[1]).resolve() / 'src/lib/libglemu.js'
original = '            GLctx.vertexAttrib4fv(this.colorLocation, [1,1,1,1]);'
corrected = '''            // OGA 2026-10-19: a_color can be optimized out of the shader.
            if (this.colorLocation >= 0) GLctx.vertexAttrib4fv(this.colorLocation, [1,1,1,1]);'''
text = target.read_text(encoding='utf-8')
if corrected not in text:
    if text.count(original) != 1: raise SystemExit('Unexpected libglemu version; do not patch blindly')
    target.write_text(text.replace(original, corrected), encoding='utf-8')
    # CMake does not track JS library source; force the dependent executable link.
    print('Applied missing-attribute guard for pinned Emscripten 4.0.23')
else:
    print('Pinned Emscripten guard already applied')
