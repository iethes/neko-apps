const { chromium } = require('playwright');

async function testCDPConnection() {
  console.log('🚀 Starting CDP connection test...');
  
  // Configuration for the remote Chrome instance
  const CDP_HOST = 'localhost';
  const CDP_PORT = 9223; // The socat proxy port from docker-compose.yaml
  const CDP_URL = `http://${CDP_HOST}:${CDP_PORT}`;
  
  let browser = null;
  let context = null;
  let page = null;
  
  try {
    console.log(`📡 Connecting to Chrome DevTools at ${CDP_URL}...`);
    
    // Connect to the existing Chrome instance via CDP
    browser = await chromium.connectOverCDP(CDP_URL);
    console.log('✅ Successfully connected to Chrome via CDP!');
    
    // Get all contexts (browser tabs/windows)
    const contexts = browser.contexts();
    console.log(`📋 Found ${contexts.length} browser context(s)`);
    
    if (contexts.length > 0) {
      // Use existing context
      context = contexts[0];
      console.log('🔄 Using existing browser context');
    } else {
      // Create new context if none exists
      context = await browser.newContext();
      console.log('🆕 Created new browser context');
    }
    
    // Get existing pages or create a new one
    const pages = context.pages();
    if (pages.length > 0) {
      page = pages[0];
      console.log('🔄 Using existing page');
    } else {
      page = await context.newPage();
      console.log('🆕 Created new page');
    }
    
    // Test basic page operations
    console.log('\n🧪 Testing basic page operations...');
    
    // Navigate to a test page
    console.log('🌐 Navigating to example.com...');
    await page.goto('https://example.com', { waitUntil: 'networkidle' });
    
    // Get page title
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);
    
    // Get page URL
    const url = page.url();
    console.log(`🔗 Current URL: ${url}`);
    
    // Take a screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'cdp-test-screenshot.png', fullPage: true });
    console.log('✅ Screenshot saved as cdp-test-screenshot.png');
    
    // Test JavaScript execution
    console.log('⚡ Testing JavaScript execution...');
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log(`🤖 User Agent: ${userAgent}`);
    
    // Test DOM manipulation
    console.log('🔧 Testing DOM manipulation...');
    await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) {
        h1.style.color = 'red';
        h1.style.fontSize = '3em';
      }
    });
    
    // Wait a moment to see the changes
    await page.waitForTimeout(2000);
    
    // Take another screenshot to show the changes
    console.log('📸 Taking screenshot after DOM changes...');
    await page.screenshot({ path: 'cdp-test-modified.png', fullPage: true });
    console.log('✅ Modified screenshot saved as cdp-test-modified.png');
    
    // Test network monitoring
    console.log('🌐 Testing network monitoring...');
    page.on('request', request => {
      console.log(`📤 Request: ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      console.log(`📥 Response: ${response.status()} ${response.url()}`);
    });
    
    // Navigate to trigger network events
    await page.goto('https://httpbin.org/json', { waitUntil: 'networkidle' });
    
    // Get JSON content
    const jsonContent = await page.textContent('pre');
    console.log('📄 JSON Response:', jsonContent);
    
    console.log('\n✅ All CDP tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during CDP testing:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Troubleshooting information
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Make sure the Docker container is running: docker-compose up -d');
    console.log('2. Check if Chrome is accessible: curl http://localhost:9223/json/version');
    console.log('3. Verify port 9223 is exposed and accessible');
    console.log('4. Check Docker logs: docker-compose logs neko');
    
  } finally {
    // Note: We don't close the browser since it's a remote instance
    // The browser will continue running in the Docker container
    console.log('\n🏁 Test completed. Remote browser remains running.');
  }
}

// Additional utility function to check CDP endpoint
async function checkCDPEndpoint() {
  console.log('🔍 Checking CDP endpoint availability...');
  
  try {
    const response = await fetch('http://localhost:9223/json/version');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ CDP endpoint is accessible');
      console.log('📋 Browser info:', JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log('❌ CDP endpoint returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ CDP endpoint is not accessible:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🎯 Neko Chrome CDP Test Suite');
  console.log('================================\n');
  
  // First check if the endpoint is available
  const isEndpointAvailable = await checkCDPEndpoint();
  
  if (isEndpointAvailable) {
    await testCDPConnection();
  } else {
    console.log('\n❌ Cannot proceed with tests - CDP endpoint is not available');
    console.log('💡 Make sure to start the Docker container first:');
    console.log('   docker-compose up -d');
  }
}

// Run the tests
main().catch(console.error);
