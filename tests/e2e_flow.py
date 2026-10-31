"""Tes E2E: memainkan semua pelajaran seperti juri, di layar HP dan laptop.

Butuh Python + Playwright (pip install playwright). Jalankan dari folder proyek:
    python tests/e2e_flow.py --out <folder-screenshot>

Yang diperiksa:
- tidak ada error JavaScript di console,
- tidak ada permintaan jaringan ke luar (semua berjalan di browser),
- satu pelajaran bisa diselesaikan, progres dan XP tersimpan, rapor terisi,
- setiap soal tampil bersama HP simulasi dan muat satu layar tanpa gulir.
"""
import argparse
import pathlib
import sys
import tempfile

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
# "promax" = perkiraan layar iPhone 18 Pro Max (1320 x 2868 piksel / 3).
# "safari" = perkiraan area halaman Safari di iPhone 17 (layar dikurangi bar atas dan bawah browser).
VIEWPORTS = {
    "hp": {"width": 375, "height": 812},
    "promax": {"width": 440, "height": 956},
    "safari": {"width": 402, "height": 681},
    "laptop": {"width": 1280, "height": 800},
}


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


def fits_screen(page):
    """Soal harus muat satu layar: halaman dan area pelajaran tidak bisa digulir."""
    return page.evaluate("""() => {
        const main = document.getElementById('lesson');
        return document.documentElement.scrollHeight <= innerHeight && main.scrollHeight <= main.clientHeight;
    }""")


def play_lesson(page, scenario, wrong, shot, problems):
    """Mainkan satu pelajaran. wrong=True memilih jawaban keliru untuk menguji jalur salah."""
    page.wait_for_selector(".task-title")  # soal tampil bersama HP, tanpa harus mengetuk dulu
    focused = page.evaluate("() => document.activeElement.classList.contains('task-title')")
    check(focused, f"{scenario['id']}: fokus tidak ada di soal", problems)
    check(fits_screen(page), f"{scenario['id']}: soal tanda bahaya perlu digulir", problems)
    page.locator(".tap").first.click()  # memeriksa boleh, tidak wajib
    page.wait_for_selector(".inspect-card")
    shot("1-periksa")
    check(fits_screen(page), f"{scenario['id']}: hasil periksa membuat soal perlu digulir", problems)

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
    check(fits_screen(page), f"{scenario['id']}: soal tindakan perlu digulir", problems)
    page.click(f'.option[data-id="{index}"]')
    press(page)
    shot("3-tindakan")
    press(page)
    page.wait_for_selector(".done")
    shot("4-selesai")


def check_help_pages(page, name, out, problems):
    """Bantuan bisa dicapai dari bar atas beranda: "Lagi ragu?" tidak pernah bilang aman, "Telanjur?" terbuka."""
    page.click('.help-nav a[href="ragu.html"]')
    page.wait_for_selector(".doubt-item")
    ids = page.evaluate("() => QUESTIONS.map((q) => q.id)")
    for qid in ids:
        page.check(f'input[name="q-{qid}"][value="tidak"]')
    verdict = page.locator("#verdict")
    check("verdict-none-found" in verdict.get_attribute("class"), f"{name}: semua 'tidak' tidak menghasilkan none-found", problems)
    check("pasti aman" in verdict.inner_text() and "belum berarti" in verdict.inner_text(),
          f"{name}: hasil 'tidak ketemu tanda' harus menegaskan belum tentu aman", problems)
    page.check(f'input[name="q-{ids[-1]}"][value="ya"]')
    check("verdict-danger" in verdict.get_attribute("class"), f"{name}: jawaban 'ya' tidak memicu peringatan", problems)
    page.screenshot(path=out / f"{name}-ragu.png", full_page=True)
    page.click(".verdict-link")
    page.wait_for_selector(".situation")
    page.screenshot(path=out / f"{name}-telanjur.png", full_page=True)
    page.click(".back-link")
    page.wait_for_selector("#units .node")


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
            check_help_pages(page, name, out, problems)
            scenarios = page.evaluate("() => SCENARIOS")
            page.click("a.node-current")

            for number, scenario in enumerate(scenarios, start=1):
                page.wait_for_selector(".phone")
                wrong = number == 2  # pelajaran 2 sengaja dijawab salah

                def shot(step, n=number):
                    if name == "hp" or n in (1, 2):
                        page.screenshot(path=out / f"{name}-L{n}-{step}.png", full_page=True)

                play_lesson(page, scenario, wrong, shot, problems)
                press(page)  # "Pelajaran berikutnya", atau "Lihat rapor" setelah yang terakhir

            page.wait_for_selector(".q-list")
            xp = page.evaluate("() => JSON.parse(localStorage.getItem('cekdulu.progress.v1')).xp")
            if xp <= 0:
                problems.append(f"{name}: XP tidak tersimpan")
            page.screenshot(path=out / f"{name}-6-rapor.png", full_page=True)
            page.click(".back-link")
            page.wait_for_selector("a.node-trophy")
            page.screenshot(path=out / f"{name}-5-jalur-selesai.png", full_page=True)
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
