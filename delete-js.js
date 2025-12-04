const fs = require('fs');
const path = require('path');

function deleteJsFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      deleteJsFiles(filePath);
    } else if (file.endsWith('.js')) {
      console.log(`Deleting: ${filePath}`);
      fs.unlinkSync(filePath);
    }
  });
}

console.log('Deleting JavaScript files from src...');
deleteJsFiles(path.join(__dirname, 'src'));

console.log('Deleting JavaScript files from tests...');
deleteJsFiles(path.join(__dirname, 'tests'));

console.log('Done!');
