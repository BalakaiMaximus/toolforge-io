#!/bin/bash
# Rename _next to next in the dist folder and update all references

if [ -d "dist/_next" ]; then
  mv dist/_next dist/next
  
  # Update all HTML files to reference next instead of _next
  find dist -name "*.html" -type f -exec sed -i '' 's/\/_next\//\/next\//g' {} \;
  
  echo "Renamed _next to next and updated references"
fi
