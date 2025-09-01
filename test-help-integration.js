// Test script to verify help system integration
// Run with: node test-help-integration.js

async function testHelpIntegration() {
  console.log('Testing help system integration...\n');

  try {
    // Test 1: Fetch help configuration
    console.log('1. Testing help configuration fetch...');
    const configResponse = await fetch('/helpdocs/ntr-test/help-config.json');
    if (configResponse.ok) {
      const config = await configResponse.json();
      console.log('✅ Help configuration loaded successfully');
      console.log('   Available apps:', Object.keys(config.apps));
      console.log('   Available locales:', Object.keys(config.apps['ntr-app'].locales));
      console.log('   Swedish sections:', Object.keys(config.apps['ntr-app'].locales['sv-se'].file_paths));
      console.log('   English sections:', Object.keys(config.apps['ntr-app'].locales['en-se'].file_paths));
    } else {
      console.log('❌ Failed to load help configuration:', configResponse.status, configResponse.statusText);
    }

    // Test 2: Fetch a specific help content file
    console.log('\n2. Testing help content fetch...');
    const contentResponse = await fetch('/helpdocs/ntr-test/docs/sv/overview.md');
    if (contentResponse.ok) {
      const content = await contentResponse.text();
      console.log('✅ Help content loaded successfully');
      console.log('   Content length:', content.length, 'characters');
      console.log('   First 100 chars:', content.substring(0, 100) + '...');
    } else {
      console.log('❌ Failed to load help content:', contentResponse.status, contentResponse.statusText);
    }

    // Test 3: Test the integration script pattern
    console.log('\n3. Testing integration script pattern...');
    const config = await fetch('/helpdocs/ntr-test/help-config.json').then(r => r.json());
    const filePath = config.apps['ntr-app'].locales['sv-se'].file_paths['overview'];
    const content = await fetch(`/helpdocs/ntr-test/${filePath}`);
    
    if (content.ok) {
      console.log('✅ Integration script pattern works correctly');
      console.log('   Resolved file path:', filePath);
      console.log('   Content loaded successfully');
    } else {
      console.log('❌ Integration script pattern failed:', content.status, content.statusText);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }

  console.log('\nTest completed.');
}

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testHelpIntegration();
} else {
  // Browser environment
  testHelpIntegration();
}
