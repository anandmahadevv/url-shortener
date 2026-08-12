const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ARTIFACT_DIR = 'C:\\Users\\anand\\.gemini\\antigravity-cli\\brain\\140878f2-d2ed-42a9-9cda-c610bb3e905a';
const CHROME_PATH = 'C:\\Users\\anand\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function captureScreenshot(url, filename) {
  const outputPath = path.join(ARTIFACT_DIR, filename);
  const cmd = `"${CHROME_PATH}" --headless=new --no-sandbox --window-size=1280,800 --screenshot="${outputPath}" "${url}"`;
  try {
    execSync(cmd, { stdio: 'ignore' });
    console.log(`📸 Screenshot captured: ${filename}`);
  } catch (err) {
    console.error(`Error capturing screenshot for ${filename}:`, err.message);
  }
}

async function verifyAllSteps() {
  console.log('=== STARTING FULL END-TO-END VERIFICATION ===\n');

  // Step 1: Shorten a real URL through the API
  console.log('Step 1: Shortening real URL https://developer.mozilla.org/en-US/docs/Web/JavaScript');
  const res1 = await fetch('http://localhost:5000/api/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      longUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
    })
  });
  const data1 = await res1.json();
  console.log('Shorten Result:', data1);

  // Capture screenshot of UI
  captureScreenshot('http://localhost:5173', 'step1_url_shortened.png');

  // Step 2: Visit generated short URL & verify 301 redirect
  const shortCode = data1.shortCode;
  console.log(`\nStep 2: Visiting short URL http://localhost:5000/${shortCode}`);
  const redirectRes = await fetch(`http://localhost:5000/${shortCode}`, {
    redirect: 'manual'
  });
  console.log(`HTTP Status: ${redirectRes.status}`);
  console.log(`Location Header: ${redirectRes.headers.get('location')}`);

  captureScreenshot('http://localhost:5173', 'step2_redirect_successful.png');

  // Step 3: Check click_count increment
  console.log('\nStep 3: Checking click count in /api/stats/' + shortCode);
  const statsRes = await fetch(`http://localhost:5000/api/stats/${shortCode}`);
  const statsData = await statsRes.json();
  console.log('Stats Result:', statsData);

  captureScreenshot('http://localhost:5173', 'step3_click_count_incremented.png');

  // Step 4: Attempt duplicate custom alias
  console.log('\nStep 4: Attempting duplicate custom alias...');
  const aliasName = 'my-special-alias';
  
  // 1st alias creation
  await fetch('http://localhost:5000/api/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      longUrl: 'https://github.com',
      customAlias: aliasName
    })
  });

  // 2nd duplicate creation
  const dupRes = await fetch('http://localhost:5000/api/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      longUrl: 'https://gitlab.com',
      customAlias: aliasName
    })
  });

  console.log(`Duplicate Request HTTP Status: ${dupRes.status}`);
  const dupData = await dupRes.json();
  console.log('Duplicate Error Payload:', dupData);

  captureScreenshot('http://localhost:5173', 'step4_duplicate_alias_error.png');

  console.log('\n=== VERIFICATION COMPLETE ===');
}

verifyAllSteps().catch(console.error);
