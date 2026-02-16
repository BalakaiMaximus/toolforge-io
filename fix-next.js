const fs = require('fs');
const path = require('path');

// Get the project root directory
const projectRoot = process.cwd();
console.log(`Project root: ${projectRoot}`);

const distPath = path.join(projectRoot, 'dist');
const oldNextPath = path.join(distPath, '_next');
const newNextPath = path.join(distPath, 'next');

console.log(`Looking for _next directory at: ${oldNextPath}`);

if (fs.existsSync(oldNextPath)) {
  try {
    fs.renameSync(oldNextPath, newNextPath);
    console.log('Successfully renamed _next to next');
  } catch (err) {
    console.error(`Error renaming _next to next: ${err.message}`);
  }
} else {
  console.log('_next directory not found, skipping rename.');
}

// Update all HTML files to reference /next/ instead of /_next/
function updateHtmlReferences(dir) {
  console.log(`Scanning directory: ${dir}`);
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recurse into subdirectories, but skip the 'next' directory itself to avoid infinite loops or unnecessary processing
        if (file !== 'next') {
          updateHtmlReferences(filePath);
        } else {
          console.log(`Skipping directory: ${filePath}`);
        }
      } else if (file.endsWith('.html')) {
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          const updatedContent = content.replace(/\/_next\//g, '/next/');
          if (content !== updatedContent) {
            fs.writeFileSync(filePath, updatedContent);
            console.log(`Updated references in: ${filePath}`);
          } else {
            console.log(`No references to update in: ${filePath}`);
          }
        } catch (err) {
          console.error(`Error updating file ${filePath}: ${err.message}`);
        }
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dir}: ${err.message}`);
  }
}

if (fs.existsSync(distPath)) {
  updateHtmlReferences(distPath);
  console.log('Finished processing HTML files.');
} else {
  console.log('Dist directory not found, skipping HTML updates.');
}

console.log('Script finished.');
