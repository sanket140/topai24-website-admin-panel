// fix-alias-imports.js
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('./src');

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      fixImports(fullPath);
    }
  });
}

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const importRegex = /from\s+['"]@\/(.*?)['"]/g;

  content = content.replace(importRegex, (match, p1) => {
    const importFullPath = path.join(SRC_DIR, p1);
    let relativePath = path.relative(path.dirname(filePath), importFullPath);
    if (!relativePath.startsWith('.')) relativePath = './' + relativePath;
    relativePath = relativePath.replace(/\\/g, '/'); // Windows fix
    return `from '${relativePath}'`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed imports in: ${filePath}`);
}

walkDir(SRC_DIR);
console.log('All @/ imports converted to relative paths!');
