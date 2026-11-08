// Memeriksa js/strings.js (teks tombol dan judul dua bahasa). Jalankan: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const STRINGS = require("../js/strings.js");

const ROOT = path.join(__dirname, "..");
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test("setiap teks punya versi Indonesia dan English dengan isian {..} yang sama", () => {
  Object.entries(STRINGS).forEach(([key, entry]) => {
    assert.deepEqual(Object.keys(entry).sort(), ["en", "id"], `${key}: harus punya tepat id dan en`);
    if (Array.isArray(entry.id)) {
      assert.ok(Array.isArray(entry.en) && entry.id.length > 0 && entry.en.length > 0, `${key}: daftar id dan en tidak boleh kosong`);
      return;
    }
    assert.ok(typeof entry.id === "string" && entry.id && typeof entry.en === "string" && entry.en, `${key}: teks kosong`);
    assert.deepEqual(placeholders(entry.en), placeholders(entry.id), `${key}: isian {..} berbeda`);
  });
});

// Kunci yang dipakai di kode ("prefix.nama" dengan prefix yang ada di STRINGS) dan di HTML (data-i18n).
function usedKeys() {
  const prefixes = new Set(Object.keys(STRINGS).map((key) => key.split(".")[0]));
  const files = [
    ...fs.readdirSync(path.join(ROOT, "js")).filter((f) => f.endsWith(".js") && f !== "strings.js").map((f) => path.join(ROOT, "js", f)),
    ...fs.readdirSync(ROOT).filter((f) => f.endsWith(".html")).map((f) => path.join(ROOT, f))
  ];
  const keys = [];
  files.forEach((file) => {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/["'`]([a-z]+)\.([a-zA-Z]+)["'`]/g)) {
      const [, prefix, name] = match;
      if (prefixes.has(prefix) && !["html", "js", "css"].includes(name)) keys.push({ key: `${prefix}.${name}`, file: path.basename(file) });
    }
  });
  return keys;
}

test("setiap teks yang dipakai di kode dan HTML ada di js/strings.js", () => {
  const used = usedKeys();
  assert.ok(used.length > 100, "pemindaian kunci tidak menemukan apa pun");
  used.forEach(({ key, file }) => assert.ok(STRINGS[key], `${file} memakai "${key}" yang belum ada di js/strings.js`));
});
