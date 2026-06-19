import { test, expect } from '@playwright/test'

test('WebKit smoke test — page loads and scrolls without errors', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

  await page.goto('/')

  // Assert page title contains "Kelly Battistoni"
  await expect(page).toHaveTitle(/Kelly Battistoni/)

  // Assert hero section is visible
  await expect(page.locator('section[aria-label="Hero"]')).toBeVisible()

  // Scroll to bottom of page
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

  // Wait briefly for scroll-triggered animations to settle
  await page.waitForTimeout(500)

  // Assert no console errors during scroll
  expect(consoleErrors).toHaveLength(0)

  // Assert Stack section is visible after scroll
  await expect(page.locator('#stack')).toBeVisible()
})
