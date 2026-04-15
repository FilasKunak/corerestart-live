// @ts-check
const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────────────────────
// TEST 1 – Homepage (Coming Soon) loads correctly
// ─────────────────────────────────────────────────────────────
test('TEST 1 - Homepage loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // "CoreRestart Live" visible somewhere on page
  await expect(page.getByText('CoreRestart', { exact: false }).first()).toBeVisible();

  // "Připravujeme pro vás" heading visible (case-insensitive)
  await expect(page.locator('text=/připravujeme/i').first()).toBeVisible();

  // Email input from SmartEmailing form (loads async – wait up to 12 s)
  const emailInput = page.locator(
    'input[type="email"], input[type="text"][name*="email"], input[name="email"]'
  ).first();
  await emailInput.waitFor({ state: 'visible', timeout: 12000 });
  await expect(emailInput).toBeVisible();

  await page.screenshot({ path: 'tests/screenshots/01-homepage.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// TEST 2 – Homepage email form is functional
// ─────────────────────────────────────────────────────────────
test('TEST 2 - Homepage email form is functional', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Wait for SmartEmailing to inject the form
  await page.waitForFunction(() => {
    return !!document.querySelector(
      'input[type="email"], input[type="text"][name*="email"], input[name="email"]'
    );
  }, { timeout: 12000 });

  const emailInput = page.locator(
    'input[type="email"], input[type="text"][name*="email"], input[name="email"]'
  ).first();
  await expect(emailInput).toBeVisible();

  // Submit button exists and is visible
  const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
  await expect(submitBtn).toBeVisible();

  await page.screenshot({ path: 'tests/screenshots/02-homepage-form.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// TEST 3 – Livestream page loads correctly
// ─────────────────────────────────────────────────────────────
test('TEST 3 - Livestream page loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/vysilani-1');

  // Wait for JS to resolve the phase (loading disappears)
  await page.waitForFunction(() => {
    const el = document.getElementById('phase-loading');
    return !el || el.classList.contains('hidden') || el.style.display === 'none';
  }, { timeout: 8000 });

  // Page title contains "CoreRestart Live"
  await expect(page).toHaveTitle(/CoreRestart Live/i);

  // Either countdown or live player is visible – one must be shown
  const countdown = page.locator('#phase-countdown');
  const live      = page.locator('#phase-live');
  const countdownVisible = await countdown.isVisible();
  const liveVisible      = await live.isVisible();
  expect(
    countdownVisible || liveVisible,
    'Either the countdown or the live player should be visible'
  ).toBeTruthy();

  // No native video controls (timeline must be hidden)
  await expect(page.locator('video[controls]')).toHaveCount(0);

  await page.screenshot({ path: 'tests/screenshots/03-livestream.png', fullPage: true });
});

// ─────────────────────────────────────────────────────────────
// TEST 4 – No timeline / seek bar on livestream page
// ─────────────────────────────────────────────────────────────
test('TEST 4 - No timeline on livestream page (critical)', async ({ page }) => {
  await page.goto('http://localhost:3000/vysilani-1');

  // Wait for JS phase resolution
  await page.waitForFunction(() => {
    const el = document.getElementById('phase-loading');
    return !el || el.classList.contains('hidden') || el.style.display === 'none';
  }, { timeout: 8000 });

  // 1. <video> must NOT have native controls attribute
  await expect(page.locator('video[controls]')).toHaveCount(0);

  // 2. Any range inputs present must be volume controls only – never seek/timeline
  const rangeInputs = page.locator('input[type="range"]');
  const count = await rangeInputs.count();
  for (let i = 0; i < count; i++) {
    const el       = rangeInputs.nth(i);
    const id       = (await el.getAttribute('id'))         ?? '';
    const label    = (await el.getAttribute('aria-label')) ?? '';
    const cls      = (await el.getAttribute('class'))      ?? '';
    const combined = [id, label, cls].join(' ').toLowerCase();
    expect(
      combined,
      `Range input #${i} looks like a seek/timeline control`
    ).not.toMatch(/seek|timeline|progress|scrub|position/);
  }

  // 3. No dedicated seek-bar elements (native shadow-DOM controls not stripped)
  await expect(page.locator('[class*="timeline"], [class*="seekbar"], [class*="seek-bar"], [id*="timeline"]')).toHaveCount(0);
});
