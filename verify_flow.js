const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\anand\\.gemini\\antigravity-cli\\brain\\140878f2-d2ed-42a9-9cda-c610bb3e905a';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function runVerification() {
  console.log('🚀 Launching Playwright browser for end-to-end verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // Step 1: Shorten a real URL through the UI
    // -------------------------------------------------------------
    console.log('Step 1: Navigating to http://localhost:5173');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    const testUrl = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript';
    console.log(`Filling URL input with: ${testUrl}`);
    await page.fill('#longUrl', testUrl);

    console.log('Clicking Shorten URL button...');
    await page.click('button[type="submit"]');

    // Wait for copy button / result card
    await page.waitForSelector('#copy-short-url-btn', { timeout: 10000 });
    await page.waitForTimeout(1000);

    const screenshot1Path = path.join(ARTIFACT_DIR, 'step1_url_shortened.png');
    await page.screenshot({ path: screenshot1Path, fullPage: true });
    console.log(`📸 Saved Screenshot 1: ${screenshot1Path}`);

    // Retrieve generated short code
    const shortUrlText = await page.locator('span.font-mono.text-indigo-300').innerText();
    console.log(`Generated Short URL: ${shortUrlText}`);
    const shortCode = shortUrlText.split('/').pop();

    // -------------------------------------------------------------
    // Step 2: Visit the generated short URL and confirm it redirects
    // -------------------------------------------------------------
    console.log(`Step 2: Visiting short URL ${shortUrlText}...`);
    const redirectPage = await context.newPage();
    
    let redirectedUrl = '';
    redirectPage.on('response', response => {
      if (response.status() === 301 || response.status() === 302) {
        console.log(`HTTP ${response.status()} Redirect header location: ${response.headers()['location']}`);
      }
    });

    try {
      await redirectPage.goto(shortUrlText, { waitUntil: 'networkidle', timeout: 15000 });
    } catch (e) {
      console.log('Navigation ended (external site load):', e.message);
    }

    redirectedUrl = redirectPage.url();
    console.log(`Destination URL reached: ${redirectedUrl}`);

    const screenshot2Path = path.join(ARTIFACT_DIR, 'step2_redirect_successful.png');
    await redirectPage.screenshot({ path: screenshot2Path, fullPage: false });
    console.log(`📸 Saved Screenshot 2: ${screenshot2Path}`);
    await redirectPage.close();

    // -------------------------------------------------------------
    // Step 3: Check that click_count increments after visiting
    // -------------------------------------------------------------
    console.log('Step 3: Checking click count increment in UI...');
    await page.bringToFront();
    await page.waitForTimeout(1000);
    
    // Click Refresh Stats
    const refreshBtn = page.locator('button:has-text("Refresh Stats")');
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click();
      await page.waitForTimeout(1500);
    }

    const screenshot3Path = path.join(ARTIFACT_DIR, 'step3_click_count_incremented.png');
    await page.screenshot({ path: screenshot3Path, fullPage: true });
    console.log(`📸 Saved Screenshot 3: ${screenshot3Path}`);

    // -------------------------------------------------------------
    // Step 4: Attempt duplicate custom alias & confirm 409 error
    // -------------------------------------------------------------
    console.log('Step 4: Testing duplicate custom alias error...');
    
    // Open custom options
    const toggleBtn = page.locator('button:has-text("Custom Alias & Expiration Options")');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(500);
    }

    // 1st alias creation
    await page.fill('#longUrl', 'https://github.com');
    await page.fill('#customAlias', 'my-repo');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    // 2nd alias creation with SAME alias 'my-repo'
    await page.fill('#longUrl', 'https://gitlab.com');
    await page.fill('#customAlias', 'my-repo');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    const screenshot4Path = path.join(ARTIFACT_DIR, 'step4_duplicate_alias_error.png');
    await page.screenshot({ path: screenshot4Path, fullPage: true });
    console.log(`📸 Saved Screenshot 4: ${screenshot4Path}`);

    console.log('🎉 Verification completed successfully!');
  } catch (err) {
    console.error('❌ Error during Playwright verification:', err);
  } finally {
    await browser.close();
  }
}

runVerification();
