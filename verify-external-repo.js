// Script to verify external repository structure
// Run this in the browser console to check if the external repository exists

console.log('🔍 Verifying external repository structure...');

const baseUrl = 'https://raw.githubusercontent.com/peka01/helpdoc/main/ntr-test';
const testFiles = [
  'help-config.json',
  'docs/sv/overview.md',
  'docs/en/overview.md'
];

async function testFile(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const content = await response.text();
      console.log(`✅ ${url} - Status: ${response.status}, Length: ${content.length}`);
      if (url.endsWith('.json')) {
        try {
          const json = JSON.parse(content);
          console.log(`   📋 JSON structure:`, Object.keys(json));
        } catch (e) {
          console.log(`   ❌ Invalid JSON:`, e.message);
        }
      }
      return true;
    } else {
      console.log(`❌ ${url} - Status: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${url} - Error:`, error.message);
    return false;
  }
}

async function verifyRepository() {
  console.log(`🌐 Testing base URL: ${baseUrl}`);
  
  let successCount = 0;
  for (const file of testFiles) {
    const fullUrl = `${baseUrl}/${file}`;
    const success = await testFile(fullUrl);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Results: ${successCount}/${testFiles.length} files found`);
  
  if (successCount === 0) {
    console.log('\n❌ No files found. Possible issues:');
    console.log('1. Repository does not exist: peka01/helpdoc');
    console.log('2. Branch name is incorrect (should be "main")');
    console.log('3. Path structure is different than expected');
    console.log('4. Repository is private or access is restricted');
  } else if (successCount < testFiles.length) {
    console.log('\n⚠️ Some files missing. Check repository structure.');
  } else {
    console.log('\n✅ All files found! Repository structure is correct.');
  }
}

// Run verification
verifyRepository();
