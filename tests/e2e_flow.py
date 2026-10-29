"""Tes E2E: memainkan semua pelajaran seperti juri, di layar HP dan laptop.

Butuh Python + Playwright (pip install playwright). Jalankan dari folder proyek:
    python tests/e2e_flow.py --out <folder-screenshot>

Yang diperiksa:
- tidak ada error JavaScript di console,
- tidak ada permintaan jaringan ke luar (semua berjalan di browser),
- satu pelajaran bisa diselesaikan, progres dan XP tersimpan, rapor terisi.
"""
import argparse
import pathlib
import sys
import tempfile

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
VIEWPORTS = {"hp": {"width": 375, "height": 812}, "laptop": {"width": 1280, "height": 800}}


def launch(p):
    try:
        return p.chromium.launch()
    except Exception:  # browser bawaan Playwright belum di-install: pakai Edge
        return p.chromium.launch(channel="msedge")


def watch(page, problems):
    page.on("console", lambda m: m.type == "error" and problems.append(f"console: {m.text}"))
    page.on("pageerror", lambda e: problems.append(f"pageerror: {e}"))
    page.on("request", lambda r: not r.url.startswith("file:") and problems.append(f"request keluar: {r.url}"))


def press(page):
    """Klik tombol utama setelah jeda pengaman klik ganda selesai."""
    page.wait_for_selector("#primary:not([data-cooldown])")
    page.click("#primary")


def check(condition, message, problems):
    if not condition:
        problems.append(message)


def play_lesson(page, scenario, wrong, shot, problems):
    """Mainkan satu pelajaran. wrong=True memilih jawaban keliru untuk menguji jalur salah."""
    page.locator(".tap").first.click()
    shot("1-periksa")
    press(page)
    focused = page.evaluate("() => document.activeElement.classList.contains('task-title')")
    check(focused, f"{scenario['id']}: fokus tidak pindah ke soal", problems)

    flags = scenario["flags"] or ["none"]
    if wrong:
        flags = ["none"] if scenario["flags"] else ["siapa"]
    for flag in flags:
        page.click(f'.option[data-id="{flag}"]')
    page.wait_for_selector("#primary:not([data-cooldown])")
    page.dblclick("#primary")  # klik ganda tidak boleh melompati umpan balik
    if page.locator('.option[data-id="none"]').count() != 1:
        raise AssertionError(f"{scenario['id']}: klik ganda melompati umpan balik")
    shot("2-tanda")
    press(page)

    index = next(i for i, a in enumerate(scenario["actions"]) if a["correct"] != wrong)
    page.click(f'.option[data-id="{index}"]')
    press(page)
    shot("3-tindakan")
    press(page)
    page.wait_for_selector(".done")
    shot("4-selesai")


def run(out):
    problems = []
    with sync_playwright() as p:
        browser = launch(p)
        for name, viewport in VIEWPORTS.items():
            # reduced_motion: screenshot tidak tertangkap di tengah animasi, sekaligus menguji mode itu.
            page = browser.new_context(viewport=viewport, reduced_motion="reduce").new_page()
            watch(page, problems)
            page.goto((ROOT / "index.html").as_uri())
            page.screenshot(path=out / f"{name}-0-jalur.png", full_page=True)
            scenarios = page.evaluate("() => SCENARIOS")

            for number, scenario in enumerate(scenarios, start=1):
                page.click("a.node-current")
                page.wait_for_selector(".phone")
                wrong = number == 2  # pelajaran 2 sengaja dijawab salah

                def shot(step, n=number):
                    if name == "hp" or n in (1, 2):
                        page.screenshot(path=out / f"{name}-L{n}-{step}.png", full_page=True)

                play_lesson(page, scenario, wrong, shot, problems)
                press(page)
                page.wait_for_selector("#units .node")

            page.screenshot(path=out / f"{name}-5-jalur-selesai.png", full_page=True)
            xp = page.evaluate("() => JSON.parse(localStorage.getItem('cekdulu.progress.v1')).xp")
            if xp <= 0:
                problems.append(f"{name}: XP tidak tersimpan")
            page.click("a.node-trophy")
            page.wait_for_selector(".q-list")
            page.screenshot(path=out / f"{name}-6-rapor.png", full_page=True)
            print(f"{name}: 6 pelajaran selesai, XP = {xp}")
        browser.close()
    return problems


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default=tempfile.mkdtemp(prefix="cekdulu-e2e-"))
    out = pathlib.Path(parser.parse_args().out)
    out.mkdir(parents=True, exist_ok=True)
    problems = run(out)
    print(f"Screenshot: {out}")
    if problems:
        print("GAGAL:")
        print("\n".join(f"- {item}" for item in problems))
        sys.exit(1)
    print("LULUS: tanpa error console dan tanpa permintaan jaringan keluar.")


if __name__ == "__main__":
    main()
