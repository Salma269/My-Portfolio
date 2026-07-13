import { expect, test } from '@playwright/test';

test.describe('public portfolio UX', () => {
  test('renders professional hero scale, core sections, and usable API content', async ({ page, request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/public/content`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');

    await page.goto('/');
    await expect(page).toHaveTitle(/Salma Mohamed Sayed/);
    await expect(page.getByRole('heading', { name: /Salma Mohamed Sayed/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Selected Projects/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Technical Skills/i })).toBeVisible();
    await expect(page.getByRole('navigation').getByText('Admin')).toHaveCount(0);
    await expect(page.locator('.hero__meta a[href^="mailto:"]')).toHaveAttribute('href', /mailto:salmasayed269@gmail\.com/);
    await expect(page.locator('.footer-cv-button')).toHaveAttribute('href', '/cv');
    await expect(page.locator('.hero-bg')).toBeVisible();
    await expect.poll(async () => page.locator('.hero-bg').evaluate((node) => getComputedStyle(node).pointerEvents)).toBe('none');
    if ((page.viewportSize()?.width ?? 0) >= 760) {
      await expect(page.locator('.hero-bg canvas')).toHaveCount(1, { timeout: 15_000 });
    } else {
      await expect(page.locator('.hero-bg__fallback')).toBeVisible();
    }

    const heroFontSize = await page.locator('.hero h1').evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
    expect(heroFontSize).toBeLessThanOrEqual(70);
    expect(heroFontSize).toBeGreaterThanOrEqual(40);

    const primaryButton = page.locator('.primary-button').first();
    await primaryButton.focus();
    await expect(primaryButton).toBeFocused();
    await primaryButton.hover();
    const hoverColor = await primaryButton.evaluate((node) => getComputedStyle(node).color);
    expect(hoverColor).not.toBe('rgb(45, 212, 191)');

    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight * 0.45, behavior: 'instant' }));
    await expect(page.locator('#projects')).toBeVisible();
    await expect(page.locator('.project-card__visual img').first()).toBeVisible();
    await expect.poll(async () => page.locator('.section__heading').first().evaluate((node) => getComputedStyle(node).textAlign)).toBe('center');
  });


  test('serves the CV route and favicon asset', async ({ request, baseURL }) => {
    const cvResponse = await request.get(`${baseURL}/cv`);
    expect(cvResponse.ok()).toBeTruthy();
    expect(cvResponse.headers()['content-type']).toContain('application/pdf');
    const faviconResponse = await request.get(`${baseURL}/favicon.svg`);
    expect(faviconResponse.ok()).toBeTruthy();
    expect(faviconResponse.headers()['content-type']).toContain('image/svg+xml');
  });

  test('supports Arabic/RTL toggle without breaking layout', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /العربية/i }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    if ((page.viewportSize()?.width ?? 0) >= 760) {
      const translateX = await page.locator('.hero-bg canvas').evaluate((node) => {
        const transform = getComputedStyle(node).transform;
        return transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41;
      });
      expect(translateX).toBeLessThan(0);
    }
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('button', { name: /English/i })).toBeVisible();
  });
});

test.describe('admin CMS login', () => {
  test('accepts configured username and password', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'admin login is validated once to avoid rate-limit noise');
    await page.setExtraHTTPHeaders({ 'X-Forwarded-For': `playwright-admin-${Date.now()}-${Math.random()}` });
    await page.goto('/admin/login');
    const username = process.env.ADMIN_USERNAME ?? 'salmasayed';
    const password = process.env.ADMIN_PASSWORD;
    test.skip(!password, 'ADMIN_PASSWORD is required for admin login validation');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password!);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.admin-header .eyebrow')).toHaveText(username);
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await expect(page.getByRole('heading', { name: /Content Studio/i })).toBeVisible();
    await expect(page.locator('.json-editor')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Add project/i })).toBeVisible();
    await expect(page.getByLabel(/Cover image URL/i)).toBeVisible();
    await expect(page.getByLabel(/Gallery image URLs/i)).toBeVisible();
    await page.getByLabel(/Collection/i).selectOption('skills');
    await expect(page.getByRole('button', { name: /Add skill/i })).toBeVisible();
    await page.getByLabel(/Collection/i).selectOption('certifications');
    await expect(page.getByRole('button', { name: /Add certification/i })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
});
