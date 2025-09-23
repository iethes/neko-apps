const { chromium } = require('playwright');

async function basicCDPTest() {
  console.log('🔧 Basic CDP Connection Test');
  console.log('============================\n');
  
  try {
    // Connect to Chrome via CDP
    console.log('📡 Connecting to Chrome at localhost:9223...');
    const browser = await chromium.connectOverCDP('http://localhost:9223');
    console.log('✅ Connected successfully!');
    
    // Get browser version
    const version = browser.version();
    console.log(`🌐 Browser version: ${version}`);
    
    // Get contexts
    const contexts = browser.contexts();
    console.log(`📋 Active contexts: ${contexts.length}`);
    
    // Use first context or create new one
    let context = contexts[0];
    if (!context) {
      context = await browser.newContext();
      console.log('🆕 Created new context');
    }
    
    // Get or create page
    let page = context.pages()[0];
    if (!page) {
      page = await context.newPage();
      console.log('🆕 Created new page');
    }
    
    // Simple navigation test
    console.log('🌐 Navigating to Google...');
    await page.goto('https://www.google.com');
    
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Simple interaction test
    console.log('🔍 Testing search box interaction...');
    const searchBox = await page.locator('textarea[name="q"], input[name="q"]').first();
    if (await searchBox.isVisible()) {
      await searchBox.fill('Playwright CDP test');
      console.log('✅ Successfully filled search box');
    }
    
    console.log('\n🎉 Basic CDP test completed successfully!');
    
  } catch (error) {
    console.error('❌ Basic CDP test failed:', error.message);
    
    // Quick troubleshooting
    console.log('\n🔧 Quick checks:');
    console.log('• Is Docker running? docker ps');
    console.log('• Is the service up? docker-compose ps');
    console.log('• Test CDP endpoint: curl http://localhost:9223/json');
  }
}

basicCDPTest();
