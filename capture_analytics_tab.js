const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\anand\\.gemini\\antigravity-cli\\brain\\140878f2-d2ed-42a9-9cda-c610bb3e905a';

async function captureAnalytics() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

  try {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Click Analytics tab
    const analyticsTab = page.locator('button:has-text("Analytics")');
    if (await analyticsTab.isVisible()) {
      await analyticsTab.click();
      await page.waitForTimeout(1000);
    }

    const screenshotPath = path.join(ARTIFACT_DIR, 'analytics_dashboard_preview.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Saved Analytics Dashboard Screenshot: ${screenshotPath}`);
  } catch (err) {
    console.error('Error capturing analytics screenshot:', err);
  } finally {
    await browser.close();
  }
}

captureAnalytics();
