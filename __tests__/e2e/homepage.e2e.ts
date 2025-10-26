// __tests__/e2e/homepage.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API responses for the page
    await page.route('**/api/send-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Welcome email sent successfully!' }),
      });
    });

    await page.goto('http://localhost:3000');
  });

  test('should load the homepage with all sections', async ({ page }) => {
    // Verify the page has loaded
    await expect(page).toHaveTitle(/Adventurers Guild/);

    // Check for key sections
    await expect(page.locator('text=ADVENTURERS GUILD')).toBeVisible();
    await expect(page.locator('text=FORGING DIGITAL PIONEERS')).toBeVisible();
    await expect(page.locator('text=JOIN THE GUILD')).toBeVisible();
    await expect(page.locator('text=ENTER GUILD')).toBeVisible();
    
    // Check for navigation
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=How It Works')).toBeVisible();
    await expect(page.locator('text=Benefits')).toBeVisible();
    await expect(page.locator('text=Testimonials')).toBeVisible();
  });

  test('should navigate to home page when "ENTER GUILD" is clicked', async ({ page }) => {
    await page.click('text=ENTER GUILD');
    await expect(page).toHaveURL(/.*\/home/);
  });

  test('should have working email subscription form', async ({ page }) => {
    // Fill in the subscription form
    await page.fill('input[placeholder="e.g., adventurer@email.com"]', 'test@example.com');
    await page.click('text=ENLIST NOW');

    // Wait for success message
    await expect(page.locator('text=Successfully Invited!')).toBeVisible();
  });

  test('should have working mobile menu', async ({ page }) => {
    // Make sure we're in mobile view
    await page.setViewportSize({ width: 375, height: 812 });

    // Click the mobile menu button
    await page.click('button:has(svg)'); // Menu button with SVG icon

    // Check if mobile menu is visible
    await expect(page.locator('text=How It Works')).toBeVisible();
    await expect(page.locator('text=Benefits')).toBeVisible();
    await expect(page.locator('text=Testimonials')).toBeVisible();
  });
});