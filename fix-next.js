const fs = require('fs');
const path = require('path');

// Get the project root directory
const projectRoot = process.cwd();
console.log(`[fix-next.js] Project root: ${projectRoot}`);

const distPath = path.join(projectRoot, 'dist');
const oldNextPath = path.join(distPath, '_next');
const newNextPath = path.join(distPath, 'next');

console.log(`[fix-next.js] Looking for _next directory at: ${oldNextPath}`);

if (fs.existsSync(oldNextPath)) {
  try {
    fs.renameSync(oldNextPath, newNextPath);
    console.log('[fix-next.js] Successfully renamed _next to next');
  } catch (err) {
    console.error(`[fix-next.js] Error renaming _next to next: ${err.message}`);
  }
} else {
  console.log('[fix-next.js] _next directory not found, skipping rename.');
}

// Update all HTML files to reference /next/ instead of /_next/
function updateHtmlReferences(dir) {
  console.log(`[fix-next.js] Scanning directory: ${dir}`);
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          // Recurse into subdirectories, but skip the 'next' directory itself to avoid infinite loops or unnecessary processing
          if (file !== 'next') {
            updateHtmlReferences(filePath);
          } else {
            console.log(`[fix-next.js] Skipping directory: ${filePath}`);
          }
        } else if (file.endsWith('.html')) {
          try {
            let content = fs.readFileSync(filePath, 'utf8');
            const updatedContent = content.replace(/\/_next\//g, '/next/');
            if (content !== updatedContent) {
              fs.writeFileSync(filePath, updatedContent);
              console.log(`[fix-next.js] Updated references in: ${filePath}`);
            } else {
              console.log(`[fix-next.js] No references to update in: ${filePath}`);
            }
          } catch (err) {
            console.error(`[fix-next.js] Error updating file ${filePath}: ${err.message}`);
          }
        }
      } catch (statErr) {
        console.error(`[fix-next.js] Error getting stats for ${filePath}: ${statErr.message}`);
      }
    });
  } catch (err) {
    console.error(`[fix-next.js] Error reading directory ${dir}: ${err.message}`);
  }
}

if (fs.existsSync(distPath)) {
  updateHtmlReferences(distPath);
  console.log('[fix-next.js] Finished processing HTML files.');
} else {
  console.log('[fix-next.js] Dist directory not found, skipping HTML updates.');
}

console.log('[fix-next.js] Script finished.');
