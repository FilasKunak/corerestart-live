// @ts-check
const { test, expect } = require('@playwright/test');

const URL = 'http://localhost:3000/exkluzivni-nabidka.html';

// ─────────────────────────────────────────────────────────────
// TEST 1 – Stránka se načte a má správný titulek
// ─────────────────────────────────────────────────────────────
test('TEST 1 - Stránka se načte a má správný titulek', async ({ page }) => {
  await page.goto(URL);

  await expect(page).toHaveTitle(/Exkluzivní nabídka/i);

  // Header je viditelný
  await expect(page.locator('.site-header')).toBeVisible();

  // Logo text CoreRestart
  await expect(page.locator('.logo-name')).toContainText('CoreRestart');

  // FyzioKlub tag
  await expect(page.locator('.logo-tag')).toContainText('FyzioKlub');

  await page.screenshot({ path: 'tests/screenshots/exkluzivni-01-header.png', fullPage: false });
});

// ─────────────────────────────────────────────────────────────
// TEST 2 – Hero sekce je viditelná
// ─────────────────────────────────────────────────────────────
test('TEST 2 - Hero sekce je viditelná', async ({ page }) => {
  await page.goto(URL);

  // Badge "Exkluzivní nabídka pro členy"
  await expect(page.locator('.hero-badge')).toBeVisible();
  await expect(page.locator('.hero-badge')).toContainText('Exkluzivní nabídka');

  // Nadpis H1
  await expect(page.locator('.hero h1')).toBeVisible();
  await expect(page.locator('.hero h1')).toContainText('FyzioKlubu');

  // Zlatý accent "ZDARMA!"
  await expect(page.locator('.hero h1 .accent')).toContainText('ZDARMA!');

  // Popis pod nadpisem
  await expect(page.locator('.hero-sub')).toBeVisible();
  await expect(page.locator('.hero-note')).toBeVisible();

  await page.screenshot({ path: 'tests/screenshots/exkluzivni-02-hero.png', fullPage: false });
});

// ─────────────────────────────────────────────────────────────
// TEST 3 – Intro sekce je viditelná
// ─────────────────────────────────────────────────────────────
test('TEST 3 - Intro sekce je viditelná', async ({ page }) => {
  await page.goto(URL);

  await expect(page.locator('.section-intro')).toBeVisible();
  await expect(page.locator('.section-intro p')).toContainText('pěti specializovaných cvičebních výzev');
});

// ─────────────────────────────────────────────────────────────
// TEST 4 – Všech 5 programů je přítomno
// ─────────────────────────────────────────────────────────────
test('TEST 4 - Všech 5 programů je přítomno', async ({ page }) => {
  await page.goto(URL);

  const blocks = page.locator('.program-block');
  await expect(blocks).toHaveCount(5);

  // Titulky všech výzev
  const titles = page.locator('.program-title');
  await expect(titles.nth(0)).toContainText('Transformační FyzioVýzva');
  await expect(titles.nth(1)).toContainText('FyzioVýzva pro krční páteř');
  await expect(titles.nth(2)).toContainText('FyzioVýzva pro seniory');
  await expect(titles.nth(3)).toContainText('FyzioYóga 30+30');
  await expect(titles.nth(4)).toContainText('FyzioVýzva pro chodidla');

  await page.screenshot({ path: 'tests/screenshots/exkluzivni-03-programs.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// TEST 5 – Bonusy a ceny ZDARMA jsou přítomny
// ─────────────────────────────────────────────────────────────
test('TEST 5 - Bonusy a ceny ZDARMA jsou přítomny', async ({ page }) => {
  await page.goto(URL);

  // Musí existovat alespoň několik bonus-item prvků
  const bonusItems = page.locator('.bonus-item');
  const count = await bonusItems.count();
  expect(count).toBeGreaterThanOrEqual(10);

  // Všechny položky s .free textem
  const freeLabels = page.locator('.bonus-price .free');
  const freeCount = await freeLabels.count();
  expect(freeCount).toBeGreaterThanOrEqual(10);

  // Všechny .free prvky obsahují "ZDARMA"
  for (let i = 0; i < freeCount; i++) {
    await expect(freeLabels.nth(i)).toContainText('ZDARMA');
  }
});

// ─────────────────────────────────────────────────────────────
// TEST 6 – 5. výzva (coming soon) obsahuje správné info
// ─────────────────────────────────────────────────────────────
test('TEST 6 - Pátá výzva je označena jako připravujeme', async ({ page }) => {
  await page.goto(URL);

  // Placeholder label
  await expect(page.locator('.placeholder-label')).toContainText('Spouštíme podzim 2026');

  // Program tag pro 5. výzvu
  const fifthTag = page.locator('.program-block').nth(4).locator('.program-tag');
  await expect(fifthTag).toContainText('Připravujeme');
});

// ─────────────────────────────────────────────────────────────
// TEST 7 – Footer je viditelný a obsahuje správný text
// ─────────────────────────────────────────────────────────────
test('TEST 7 - Footer je viditelný', async ({ page }) => {
  await page.goto(URL);

  await expect(page.locator('.site-footer')).toBeVisible();
  await expect(page.locator('.site-footer')).toContainText('CoreRestart');
  await expect(page.locator('.site-footer')).toContainText('FyzioKlub');

  // Odkaz na corerestart.cz
  const footerLink = page.locator('.site-footer a');
  await expect(footerLink).toBeVisible();
  await expect(footerLink).toContainText('corerestart.cz');
});

// ─────────────────────────────────────────────────────────────
// TEST 8 – Fade-up animace se spustí při scrollu (Chromium)
// ─────────────────────────────────────────────────────────────
test('TEST 8 - Fade-up elementy získají třídu visible při scrollu', async ({ page }) => {
  await page.goto(URL);

  // Scrollujeme postupně po krocích – IntersectionObserver se spustí spolehlivěji
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  const step = 400;
  for (let pos = 0; pos <= pageHeight; pos += step) {
    await page.evaluate((y) => window.scrollTo(0, y), pos);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(400);

  // Alespoň polovina fade-up prvků musí mít třídu visible
  const total = await page.locator('.fade-up').count();
  const visible = await page.locator('.fade-up.visible').count();
  expect(visible).toBeGreaterThan(total / 2);
});

// ─────────────────────────────────────────────────────────────
// TEST 9 – Responzivní layout na mobilu (375px)
// ─────────────────────────────────────────────────────────────
test('TEST 9 - Responzivní layout na mobilu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(URL);

  // Stránka se načte bez JS chyb
  const errors = [];
  page.on('pageerror', err => errors.push(err));

  // Header je viditelný na mobilu
  await expect(page.locator('.site-header')).toBeVisible();

  // Programy jsou viditelné
  await expect(page.locator('.program-block').first()).toBeVisible();

  expect(errors.length).toBe(0);

  await page.screenshot({ path: 'tests/screenshots/exkluzivni-09-mobile.png', fullPage: true });
});
