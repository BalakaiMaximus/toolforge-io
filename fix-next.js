const fs = require('fs');
const path = require('path');

// Rename _next to next in dist folder
const distPath = path.join(__dirname, 'dist');
const oldNextPath = path.join(distPath, '_next');
const newNextPath = path.join(distPath, 'next');

if (fs.existsSync(oldNextPath)) {
  fs.renameSync(oldNextPath, newNextPath);
  console.log('Renamed _next to next');
}

// Update all HTML files to reference /next/ instead of /_next/
function updateFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'next') {
      updateFiles(filePath);
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const updated = content.replace(/\/_next\//g, '/next/');
      if (content !== updated) {
        fs.writeFileSync(filePath, updated);
        console.log(`Updated ${filePath}`);
      }
    }
  });
}

updateFiles(distPath);
console.log('Done!');
