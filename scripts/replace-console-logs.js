#!/usr/bin/env node

/**
 * Script to replace all console.log/error/warn/info/debug with logger
 * Usage: node scripts/replace-console-logs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TypeScript files with console.log
const srcDir = path.join(__dirname, '..', 'src');
const files = [];

function findFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (/console\.(log|error|warn|info|debug)/.test(content)) {
        files.push(fullPath);
      }
    }
  }
}

findFiles(srcDir);

console.log(`Found ${files.length} files with console.log statements`);

// Files already processed manually
const processedFiles = [
  'src/services/subscription.service.ts',
  'src/app.ts',
  'src/config/database.ts'
];

const filesToProcess = files.filter(f => !processedFiles.some(p => f.includes(p)));

console.log(`Processing ${filesToProcess.length} files...`);

let totalReplacements = 0;

filesToProcess.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let replacements = 0;
  const originalContent = content;

  // Check if logger is already imported
  const hasLoggerImport = /import\s+logger\s+from\s+['"]\.\.?\/.*logger['"]/.test(content);
  
  // Add logger import if not present
  if (!hasLoggerImport && /console\.(log|error|warn|info|debug)/.test(content)) {
    // Find the last import statement
    const importRegex = /^import\s+.*from\s+['"].*['"];?$/gm;
    const imports = content.match(importRegex) || [];
    if (imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertIndex = lastImportIndex + lastImport.length;
      
      // Determine relative path to logger
      const fileDir = path.dirname(file);
      const loggerPath = path.relative(fileDir, path.join(__dirname, '..', 'src', 'utils', 'logger'));
      const loggerImportPath = loggerPath.replace(/\\/g, '/').replace(/^\.\.\//, '').replace(/^src\//, '../').replace(/^utils\//, './utils/');
      
      // Fix path if needed
      let finalLoggerPath = loggerImportPath;
      if (!finalLoggerPath.startsWith('.')) {
        finalLoggerPath = '../utils/logger';
      }
      
      content = content.slice(0, insertIndex) + '\nimport logger from \'' + finalLoggerPath + '\';' + content.slice(insertIndex);
      replacements++;
    }
  }

  // Replace console.log with logger.info
  content = content.replace(/console\.log\(/g, 'logger.info(');
  replacements += (originalContent.match(/console\.log\(/g) || []).length;

  // Replace console.error with logger.error
  content = content.replace(/console\.error\(/g, 'logger.error(');
  replacements += (originalContent.match(/console\.error\(/g) || []).length;

  // Replace console.warn with logger.warn
  content = content.replace(/console\.warn\(/g, 'logger.warn(');
  replacements += (originalContent.match(/console\.warn\(/g) || []).length;

  // Replace console.info with logger.info
  content = content.replace(/console\.info\(/g, 'logger.info(');
  replacements += (originalContent.match(/console\.info\(/g) || []).length;

  // Replace console.debug with logger.debug
  content = content.replace(/console\.debug\(/g, 'logger.debug(');
  replacements += (originalContent.match(/console\.debug\(/g) || []).length;

  // Update error logging to include error object properly
  // Pattern: logger.error('message', error) -> logger.error('message', { error: error.message, stack: error.stack })
  content = content.replace(/logger\.error\(([^,]+),\s*(error|err|e)(\s*as\s+Error)?\)/g, (match, message, errorVar) => {
    return `logger.error(${message}, { error: ${errorVar}.message, stack: ${errorVar}.stack })`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ ${file}: ${replacements} replacements`);
    totalReplacements += replacements;
  }
});

console.log(`\n✅ Total: ${totalReplacements} console statements replaced`);
console.log(`Processed ${filesToProcess.length} files`);
