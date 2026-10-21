import json
import re
import glob

with open('frontend/src/i18n/locales/en.json', encoding='utf-8') as f:
    en_data = json.load(f)

def has_key(d, path):
    parts = path.split('.')
    cur = d
    for p in parts:
        if not isinstance(cur, dict) or p not in cur:
            return False
        cur = cur[p]
    return True

with open('frontend/src/i18n/locales/te.json', encoding='utf-8') as f:
    te_data = json.load(f)

with open('frontend/src/i18n/locales/hi.json', encoding='utf-8') as f:
    hi_data = json.load(f)

def get_all_keys(d, prefix=""):
    keys = set()
    for k, v in d.items():
        full = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys.update(get_all_keys(v, full))
        else:
            keys.add(full)
    return keys

en_keys = get_all_keys(en_data)
te_keys = get_all_keys(te_data)
hi_keys = get_all_keys(hi_data)

print(f"Key counts -> English: {len(en_keys)}, Telugu: {len(te_keys)}, Hindi: {len(hi_keys)}")
diff_en_te = en_keys - te_keys
diff_te_en = te_keys - en_keys
diff_en_hi = en_keys - hi_keys
diff_hi_en = hi_keys - en_keys

if diff_en_te:
    print(f"Missing in Telugu: {diff_en_te}")
if diff_te_en:
    print(f"Extra in Telugu: {diff_te_en}")
if diff_en_hi:
    print(f"Missing in Hindi: {diff_en_hi}")
if diff_hi_en:
    print(f"Extra in Hindi: {diff_hi_en}")

all_ts_files = glob.glob('frontend/src/**/*.tsx', recursive=True) + glob.glob('frontend/src/**/*.ts', recursive=True)
missing = []
used_keys = set()

for path in all_ts_files:
    if 'locales' in path:
        continue
    with open(path, encoding='utf-8') as f:
        content = f.read()
    matches = re.findall(r"\bt\(\s*['\"]([a-zA-Z0-9_\.-]+)['\"]", content)
    for m in matches:
        used_keys.add(m)
        if not has_key(en_data, m):
            missing.append((path, m, "en"))
        if not has_key(te_data, m):
            missing.append((path, m, "te"))
        if not has_key(hi_data, m):
            missing.append((path, m, "hi"))

print('Total unique keys used in source code:', len(used_keys))
print('Missing translation keys count:', len(missing))
for p, m, lang in missing:
    print(f'MISSING in {lang}: {p} -> {m}')

if not diff_en_te and not diff_en_hi and not missing:
    print("ALL TRANSLATION DICTIONARIES HAVE PERFECT STRUCTURAL AND CODE PARITY!")
else:
    print("PARITY ISSUES DETECTED!")

