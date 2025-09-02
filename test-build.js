// Simple test to check Vite build output
console.log('Testing Vite build configuration...');

// Check if the main.tsx file exists
const fs = require('fs');
const path = require('path');

const mainFile = path.join(__dirname, 'src', 'main.tsx');
const htmlFile = path.join(__dirname, 'index.html');

console.log('Main.tsx exists:', fs.existsSync(mainFile));
console.log('Index.html exists:', fs.existsSync(htmlFile));

if (fs.existsSync(htmlFile)) {
  const htmlContent = fs.readFileSync(htmlFile, 'utf8');
  console.log('HTML content:', htmlContent);
}
