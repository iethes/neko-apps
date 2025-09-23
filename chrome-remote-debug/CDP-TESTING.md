# Chrome DevTools Protocol (CDP) Testing with Playwright

This directory contains test scripts to connect to the Neko Chrome browser instance using Playwright and the Chrome DevTools Protocol.

## Setup

### 1. Start the Docker Container

First, make sure the Neko Chrome container is running:

```bash
docker-compose up -d
```

### 2. Install Dependencies

Install the required Node.js dependencies:

```bash
npm install
```

### 3. Verify CDP Connection

Check if the Chrome DevTools Protocol endpoint is accessible:

```bash
node check-cdp.js
```

This will verify that:
- The CDP endpoint is reachable at `localhost:9223`
- Chrome is running with remote debugging enabled
- You can see available browser tabs/pages

## Running Tests

### Basic Test

Run a simple connection and navigation test:

```bash
npm run test-basic
# or
node test-basic-cdp.js
```

### Comprehensive Test

Run the full test suite with screenshots, DOM manipulation, and network monitoring:

```bash
npm run test
# or
node test-cdp.js
```

## What the Tests Do

### Basic Test (`test-basic-cdp.js`)
- Connects to Chrome via CDP
- Shows browser version and active contexts
- Navigates to Google
- Tests basic interaction with search box

### Comprehensive Test (`test-cdp.js`)
- All basic test functionality plus:
- Takes screenshots before and after DOM changes
- Demonstrates JavaScript execution in the browser
- Monitors network requests and responses
- Tests navigation to different pages
- Shows how to manipulate page elements

### CDP Checker (`check-cdp.js`)
- Verifies CDP endpoint accessibility
- Shows browser version information
- Lists all available browser tabs/pages
- Provides troubleshooting information

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Playwright    │───▶│   Socat Proxy    │───▶│  Chrome Browser │
│   Test Script   │    │  (Port 9223)     │    │  (Port 9222)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

- **Chrome Browser**: Runs inside Docker with `--remote-debugging-port=9222`
- **Socat Proxy**: Forwards external connections from port 9223 to Chrome's internal port 9222
- **Playwright**: Connects to the proxy port 9223 to control Chrome via CDP

## Troubleshooting

### Connection Issues

If you get connection errors:

1. **Check if container is running:**
   ```bash
   docker-compose ps
   ```

2. **Check container logs:**
   ```bash
   docker-compose logs neko
   ```

3. **Test CDP endpoint manually:**
   ```bash
   curl http://localhost:9223/json/version
   ```

4. **Verify port mapping:**
   ```bash
   docker port $(docker-compose ps -q neko)
   ```

### Common Issues

- **Port 9223 not accessible**: Make sure the Docker container is running and port mapping is correct
- **Chrome not starting**: Check the supervisord logs in the container
- **Socat proxy not working**: Verify the proxy service is running in supervisord

### Accessing the Browser

You can also access the browser through:
- **Neko Web Interface**: http://localhost:8080 (password: neko/admin)
- **DevTools UI**: http://localhost:9223 (if Chrome DevTools frontend is available)

## Advanced Usage

### Custom Test Scripts

You can create your own test scripts by following this pattern:

```javascript
const { chromium } = require('playwright');

async function myTest() {
  const browser = await chromium.connectOverCDP('http://localhost:9223');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages()[0] || await context.newPage();
  
  // Your test code here
  await page.goto('https://example.com');
  // ...
}

myTest();
```

### Multiple Browser Contexts

You can create multiple browser contexts for testing different scenarios:

```javascript
const context1 = await browser.newContext();
const context2 = await browser.newContext();
```

### Network Interception

Monitor and modify network requests:

```javascript
await page.route('**/*', route => {
  console.log('Request:', route.request().url());
  route.continue();
});
```

## Files

- `package.json` - Node.js dependencies and scripts
- `test-cdp.js` - Comprehensive CDP test suite
- `test-basic-cdp.js` - Simple connection test
- `check-cdp.js` - CDP endpoint verification
- `docker-compose.yaml` - Docker configuration with Chrome and socat proxy
- `supervisord.conf` - Chrome and proxy service configuration
