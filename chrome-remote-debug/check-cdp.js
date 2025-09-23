// Simple script to check CDP endpoint without Playwright
const http = require('http');

function checkEndpoint(path = '/json') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 9223,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Checking Chrome DevTools Protocol endpoint...');
  console.log('================================================\n');
  
  try {
    // Check version endpoint
    console.log('📋 Checking browser version...');
    const versionResult = await checkEndpoint('/json/version');
    if (versionResult.status === 200) {
      console.log('✅ Version endpoint accessible');
      console.log('📄 Browser info:');
      console.log(JSON.stringify(versionResult.data, null, 2));
    } else {
      console.log(`❌ Version endpoint returned status: ${versionResult.status}`);
    }
    
    console.log('\n📋 Checking available tabs/pages...');
    const tabsResult = await checkEndpoint('/json');
    if (tabsResult.status === 200) {
      console.log('✅ Tabs endpoint accessible');
      console.log(`📄 Found ${tabsResult.data.length} tab(s):`);
      tabsResult.data.forEach((tab, index) => {
        console.log(`  ${index + 1}. ${tab.title || 'Untitled'} - ${tab.url}`);
        console.log(`     Type: ${tab.type}, ID: ${tab.id}`);
      });
    } else {
      console.log(`❌ Tabs endpoint returned status: ${tabsResult.status}`);
    }
    
    console.log('\n✅ CDP endpoint check completed!');
    console.log('💡 You can now run the Playwright tests:');
    console.log('   npm run test-basic');
    console.log('   npm run test');
    
  } catch (error) {
    console.error('❌ Failed to connect to CDP endpoint:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Start the Docker container: docker-compose up -d');
    console.log('2. Check container status: docker-compose ps');
    console.log('3. Check container logs: docker-compose logs neko');
    console.log('4. Verify port mapping: docker port <container_name>');
    console.log('5. Test with curl: curl http://localhost:9223/json/version');
  }
}

main();
