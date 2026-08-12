const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\anand\\.gemini\\antigravity-cli\\brain\\140878f2-d2ed-42a9-9cda-c610bb3e905a';

async function captureThemeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });

  try {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // 1. Capture Light Theme ("White Theme")
    const lightBtn = page.locator('button[title="White / Light Theme"]');
    if (await lightBtn.isVisible()) {
      await lightBtn.click();
      await page.waitForTimeout(1000);
    }

    const lightPath = path.join(ARTIFACT_DIR, 'light_theme_preview.png');
    await page.screenshot({ path: lightPath, fullPage: true });
    console.log(`📸 Saved Light Theme Screenshot: ${lightPath}`);

    // 2. Capture Dark Theme
    const darkBtn = page.locator('button[title="Dark OLED Theme"]');
    if (await darkBtn.isVisible()) {
      await darkBtn.click();
      await page.waitForTimeout(1000);
    }

    const darkPath = path.join(ARTIFACT_DIR, 'dark_theme_preview.png');
    await page.screenshot({ path: darkPath, fullPage: true });
    console.log(`📸 Saved Dark Theme Screenshot: ${darkPath}`);

  } catch (err) {
    console.error('Error during theme screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

captureThemeScreenshots();
