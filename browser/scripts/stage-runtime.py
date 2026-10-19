"""Stage the reviewed runtime from tracked assets, checking every file hash.

Existing output is refused so development never overwrites saved pilot data.
Original assets remain untouched; build/browser is not a source directory.
"""
from pathlib import Path
import hashlib, json, shutil

browser=Path(__file__).resolve().parents[1]
repo=browser.parent
target=browser/'runtime'
manifest=json.loads((browser/'ASSET-MANIFEST.json').read_text(encoding='utf-8'))
assert not target.exists(), 'browser/runtime already exists; use a fresh checkout to avoid overwriting pilot data'
planned=[]
for entry in manifest['files']:
    path=Path(entry['path'])
    assert not path.is_absolute() and '..' not in path.parts
    override=browser/'runtime-overrides'/path
    source=override if override.is_file() else repo/path
    data=source.read_bytes()
    assert len(data)==entry['bytes'], str(path)
    assert hashlib.sha256(data).hexdigest()==entry['sha256'], str(path)
    planned.append((source,target/path))
target.mkdir()
for source,destination in planned:
    destination.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(source,destination)
print(f'Staged and verified {len(planned)} files in {target}')
