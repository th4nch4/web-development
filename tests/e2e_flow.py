"""Tes E2E: memainkan semua pelajaran seperti juri, di layar HP dan laptop.

Butuh Python + Playwright (pip install playwright). Jalankan dari folder proyek:
    python tests/e2e_flow.py --out <folder-screenshot>

Yang diperiksa:
- tidak ada error JavaScript di console,
- tidak ada permintaan jaringan ke luar (semua berjalan di browser),
- satu pelajaran bisa diselesaikan, progres dan XP tersimpan, rapor terisi,
- setiap soal tampil bersama HP simulasi dan halamannya tidak pernah digulir; HP dan pertanyaan tetap
  di tempat, hanya daftar jawaban yang boleh digulir,
- tidak ada jendela bawaan browser (alert/confirm); keluar dari pelajaran memakai dialog sendiri,
- Pengaturan terbuka sebagai jendela di tengah, streak api bertambah saat jawaban benar,
- soal suara di materi tetap bisa dijawab walau perangkat tidak punya suara (teksnya ditampilkan),
- semuanya juga dimainkan sekali dalam bahasa English (isi dari js/en/).
"""
import argparse
import pathlib
import re
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
# Semua ukuran dalam bahasa Indonesia, lalu satu putaran English di ukuran HP.
RUNS = [(name, viewport, "id") for name, viewport in VIEWPORTS.items()] + [("hp-en", VIEWPORTS["hp"], "en")]


def launch(p):
    try:
        return p.chromium.launch()
    except Exception:  # browser bawaan Playwright belum di-install: pakai Edge
        return p.chromium.launch(channel="msedge")


def watch(page, problems):
    page.on("console", lambda m: m.type == "error" and problems.append(f"console: {m.text}"))
    page.on("pageerror", lambda e: problems.append(f"pageerror: {e}"))
    page.on("request", lambda r: not r.url.startswith("file:") and problems.append(f"request keluar: {r.url}"))
    page.on("dialog", lambda d: (problems.append(f"jendela bawaan browser: {d.message}"), d.dismiss()))


def press(page):
    """Klik tombol utama setelah jeda pengaman klik ganda selesai."""
    page.wait_for_selector("#primary:not([data-cooldown])")
    page.click("#primary")


def check(condition, message, problems):
    if not condition:
        problems.append(message)


def fits_screen(page):
    """Soal harus muat satu layar: halaman dan area pelajaran tidak bisa digulir (daftar jawaban boleh)."""
    return page.evaluate("""() => {
        const main = document.getElementById('lesson');
        return document.documentElement.scrollHeight <= innerHeight && main.scrollHeight <= main.clientHeight;
    }""")


def answers_scroll_alone(page):
    """Gulir daftar jawaban sampai bawah: HP simulasi dan pertanyaan tidak ikut bergeser."""
    return page.evaluate("""() => {
        const top = (s) => { const n = document.querySelector(s); return n ? n.getBoundingClientRect().top : 0; };
        const before = [top('#phone-slot'), top('.task-title')];
        const list = document.querySelector('.task-slot > .options');
        list.scrollTop = list.scrollHeight;
        const after = [top('#phone-slot'), top('.task-title')];
        list.scrollTop = 0;
        return before.every((value, i) => Math.abs(value - after[i]) < 1);
    }""")


# Pilihan di soal pertama diacak; cocokkan teksnya dengan bagian pesan yang mencurigakan.
FIND_IDS = """() => {
    const suspicious = new Set([...document.querySelectorAll('.part')].filter((p) => p.dataset.flag)
      .map((p) => /^(Pengirim|File):/.test(p.dataset.label) ? p.dataset.label : `"${p.dataset.label}"`));
    return [...document.querySelectorAll('.options-find .option')]
      .filter((o) => suspicious.has(o.querySelector('strong').textContent)).map((o) => o.dataset.id);
}"""


def solve_find(page, scenario, wrong):
    ids = page.evaluate(FIND_IDS)
    if scenario["flags"] and not wrong:
        if len(ids) != len(scenario["flags"]) and len(ids) == 0:
            raise AssertionError(f"{scenario['id']}: bagian mencurigakan tidak muncul di pilihan")
        for option_id in ids:
            page.click(f'.option[data-id="{option_id}"]')
    else:
        page.click('.option[data-id="none"]')


def solve_flags(page, scenario, wrong):
    flags = scenario["flags"] or ["none"]
    if wrong:
        flags = ["none"] if scenario["flags"] else ["siapa"]
    for flag in flags:
        page.click(f'.option[data-id="{flag}"]')
    press(page)


def solve_match(page, scenario, wrong):
    flags = scenario["flags"]
    if wrong:  # satu pasangan salah dulu, harus bergetar dan tetap bisa diselesaikan
        page.click(f'.match-part[data-flag="{flags[0]}"]')
        page.click(f'.match-question[data-flag="{flags[1]}"]')
    for flag in flags:
        page.click(f'.match-part[data-flag="{flag}"]')
        page.click(f'.match-question[data-flag="{flag}"]')


def solve_url(page, scenario, wrong):
    index = next(i for i, o in enumerate(scenario["linkQuiz"]["options"]) if o["correct"] != wrong)
    page.click(f'.option[data-id="{index}"]')
    press(page)


def solve_reply(page, scenario, wrong):
    words = scenario["reply"]["words"]
    for word in (list(reversed(words)) if wrong else words):
        page.locator(".reply-bank .tile").filter(has_text=re.compile(f"^{re.escape(word)}$")).first.click()
    press(page)


def solve_action(page, scenario, wrong):
    index = next(i for i, a in enumerate(scenario["actions"]) if a["correct"] != wrong)
    page.click(f'.option[data-id="{index}"]')
    press(page)


SOLVERS = {"find": solve_find, "flags": solve_flags, "match": solve_match,
           "url": solve_url, "reply": solve_reply, "action": solve_action}


def play_lesson(page, scenario, wrong, shot, problems, check_exit=False):
    """Mainkan satu pelajaran sesuai susunan soalnya. wrong=True memilih jawaban keliru.
    check_exit=True: sekalian uji dialog keluar (setelah fokus awal diperiksa)."""
    sid = scenario["id"]
    steps = scenario.get("steps") or ["find", "flags", "action"]
    page.wait_for_selector(".task-title")  # soal tampil bersama HP, tanpa harus mengetuk dulu
    focused = page.evaluate("() => document.activeElement.classList.contains('task-title')")
    check(focused, f"{sid}: fokus tidak ada di soal", problems)
    hinted = page.evaluate("""() => new Set([...document.querySelectorAll('.part-text')]
        .map((t) => { const c = getComputedStyle(t); return c.backgroundColor + c.outlineStyle + c.boxShadow; })).size > 1""")
    check(not hinted, f"{sid}: bagian mencurigakan terlihat beda di pesan", problems)
    if check_exit:
        check_exit_dialog(page, sid, problems)

    for number, step in enumerate(steps, start=1):
        page.wait_for_selector(".task-title:not([data-done])")
        check(fits_screen(page), f"{sid}: soal {step} perlu digulir", problems)
        check(answers_scroll_alone(page), f"{sid}: soal {step}: HP atau pertanyaan ikut tergulir", problems)
        page.evaluate("() => document.querySelector('.task-title').setAttribute('data-done', '')")
        SOLVERS[step](page, scenario, wrong)
        if step == "find":
            page.wait_for_selector("#primary:not([data-cooldown])")
            page.dblclick("#primary")  # klik ganda tidak boleh melompati umpan balik
            if page.locator(".feedback h2").count() != 1:
                raise AssertionError(f"{sid}: klik ganda melompati umpan balik")
        page.wait_for_selector(".feedback h2")
        shot(f"{number}-{step}")
        press(page)  # Lanjut, atau Selesai di soal terakhir
    page.wait_for_selector(".done")
    shot("selesai")


def play_materi(page, out, name, problems):
    """Semua materi phishing: jawab kuis dengan benar, skor tersimpan."""
    for materi in page.evaluate("() => MATERI"):
        page.click(f'a[href="materi.html?m={materi["id"]}"]')
        for step in materi["steps"]:
            page.wait_for_selector(".task-title")
            check(fits_screen(page), f"{name}: materi {materi['id']} perlu digulir", problems)
            if step["type"] == "voice":
                page.wait_for_selector(".voice-card")
                shown = page.evaluate("() => !document.querySelector('.voice-text').hidden || !document.querySelector('.voice-controls').hidden")
                check(shown, f"{name}: soal suara tanpa suara dan tanpa teks", problems)
            if step["type"] in ("quiz", "voice"):
                index = next(i for i, o in enumerate(step["options"]) if o["correct"])
                page.click(f'.option[data-id="{index}"]')
                press(page)
                page.wait_for_selector(".feedback h2")
            press(page)
        page.wait_for_selector("#done-title")
        page.screenshot(path=out / f"{name}-materi-{materi['id']}.png")
        quizzes = sum(1 for step in materi["steps"] if step["type"] != "learn")
        best = page.evaluate(f"() => JSON.parse(localStorage.getItem('cekdulu.progress.v1')).materi['{materi['id']}']")
        check(best == quizzes, f"{name}: skor materi {materi['id']} tidak tersimpan", problems)
        if page.locator("#home:visible").count():
            page.click("#home")  # "Kembali ke beranda"; tombol utama "Lanjut" ke materi berikutnya
        else:
            press(page)  # materi terakhir: tombol utamanya sendiri kembali ke beranda
        page.wait_for_selector("#units .node")


def check_exit_dialog(page, name, problems):
    """Tombol X di tengah pelajaran membuka dialog sendiri; "Lanjut belajar" menutupnya tanpa pindah halaman."""
    url = page.url
    page.click(".lesson-top a.icon-btn")
    page.wait_for_selector("dialog.cek-dialog[open]")
    page.click("dialog.cek-dialog .btn")
    page.wait_for_selector("dialog.cek-dialog", state="detached")
    check(page.url == url, f"{name}: 'Lanjut belajar' malah keluar dari pelajaran", problems)


def check_settings(page, name, problems):
    """Pengaturan: jendela di tengah dengan tiga tab, bisa ditutup dengan Esc."""
    page.click(".settings-btn")
    page.wait_for_selector("dialog.settings-dialog[open]")
    check(page.locator(".settings-tab").count() == 3, f"{name}: tab pengaturan bukan 3", problems)
    page.click("#set-tab-look")
    check(page.locator("#set-panel-look:visible").count() == 1, f"{name}: tab Tampilan tidak terbuka", problems)
    page.keyboard.press("Escape")
    page.wait_for_selector("dialog.settings-dialog[open]", state="detached")


def check_reset(page, name, problems):
    """Hapus progres lewat Pengaturan > Umum, dengan dialog konfirmasi sendiri."""
    page.click(".settings-btn")
    page.click(".set-reset")
    page.wait_for_selector("dialog.cek-dialog[open]")
    page.click("dialog.cek-dialog .btn-text-danger")
    page.wait_for_selector("a.node-current")
    progress = page.evaluate("() => localStorage.getItem('cekdulu.progress.v1')")
    check(progress is None, f"{name}: progres tidak terhapus", problems)


def tap_quick(page, selector):
    """Klik tombol Ronde Kilat setelah jeda pengaman klik ganda selesai."""
    page.wait_for_selector(f"#buttons:not([data-cooldown]) {selector}")
    page.click(f"#buttons {selector}")


def play_quick(page, unit_id, out, name, problems):
    """Ronde Kilat mode santai: jawab semua dengan benar, skor tersimpan."""
    items = page.evaluate(f"() => QUICK_ROUND.filter((q) => q.unit === {unit_id})")
    page.click(f'a.node-quick[href="kilat.html?unit={unit_id}"]')
    tap_quick(page, ".btn-quiet")  # mode santai, tanpa waktu
    for item in items:
        page.wait_for_selector(".quick-card")
        tap_quick(page, ".btn-scam" if item["scam"] else ".btn-real")
        page.wait_for_selector(".feedback h2")
        check(page.locator(".lesson-footer.is-good").count() == 1, f"{name}: jawaban kilat yang benar dinilai salah", problems)
        tap_quick(page, ".btn")
    page.wait_for_selector("#score-title")
    page.screenshot(path=out / f"{name}-kilat-{unit_id}.png")
    best = page.evaluate(f"() => JSON.parse(localStorage.getItem('cekdulu.progress.v1')).quick['{unit_id}']")
    check(best == len(items), f"{name}: skor Ronde Kilat tidak tersimpan", problems)
    tap_quick(page, ".btn:last-child")  # kembali ke beranda
    page.wait_for_selector("#units .node")


def run(out):
    problems = []
    with sync_playwright() as p:
        browser = launch(p)
        for name, viewport, lang in RUNS:
            # reduced_motion: screenshot tidak tertangkap di tengah animasi, sekaligus menguji mode itu.
            page = browser.new_context(viewport=viewport, reduced_motion="reduce").new_page()
            watch(page, problems)
            page.goto((ROOT / "index.html").as_uri())
            if lang == "en":
                page.evaluate("() => localStorage.setItem('cekdulu.lang', 'en')")
                page.reload()
            check(page.evaluate("() => document.documentElement.lang") == lang, f"{name}: bahasa halaman bukan {lang}", problems)
            page.screenshot(path=out / f"{name}-0-jalur.png", full_page=True)
            check_settings(page, name, problems)
            play_materi(page, out, name, problems)
            scenarios = page.evaluate("() => SCENARIOS")
            page.click("a.node-current")

            for number, scenario in enumerate(scenarios, start=1):
                page.wait_for_selector(".phone")
                wrong = number == 2  # pelajaran 2 sengaja dijawab salah

                def shot(step, n=number):
                    if name == "hp" or n in (1, 2):
                        page.screenshot(path=out / f"{name}-L{n}-{step}.png", full_page=True)

                play_lesson(page, scenario, wrong, shot, problems, check_exit=number == 1)
                if number == 1:
                    streak = page.evaluate("() => Number(document.querySelector('#streak .streak').textContent)")
                    check(streak > 0, f"{name}: streak tidak bertambah setelah jawaban benar", problems)
                press(page)  # "Lanjut" ke pelajaran berikutnya, atau "Lihat rapor" setelah yang terakhir

            page.wait_for_selector(".q-list")
            page.click(".back-link")
            page.wait_for_selector("#units .node")
            for unit_id in (1, 2):
                play_quick(page, unit_id, out, name, problems)
            page.goto((ROOT / "rapor.html").as_uri())
            page.wait_for_selector(".q-list")
            xp = page.evaluate("() => JSON.parse(localStorage.getItem('cekdulu.progress.v1')).xp")
            if xp <= 0:
                problems.append(f"{name}: XP tidak tersimpan")
            page.screenshot(path=out / f"{name}-6-rapor.png", full_page=True)
            page.click(".back-link")
            page.wait_for_selector("a.node-trophy")
            page.screenshot(path=out / f"{name}-5-jalur-selesai.png", full_page=True)
            check_reset(page, name, problems)
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
