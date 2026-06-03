const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src');
const excludeDirs = ['node_modules', '.git', 'dist'];

function shouldExclude(dir) {
  return excludeDirs.some(exclude => dir.includes(exclude));
}

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 移除导入路径末尾的 .ts 扩展名
  const regex = /from\s+['"]([^'"]+)\.ts['"]/g;

  content = content.replace(regex, (match, importPath) => {
    // 也修复反斜杠问题
    importPath = importPath.replace(/\\/g, '/');
    changed = true;
    console.log(`🔄 ${filePath.replace(__dirname, '')} -> ${importPath}.ts -> ${importPath}`);
    return `from '${importPath}'`;
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
  }

  return changed;
}

function processDirectory(dir) {
  if (shouldExclude(dir)) return;

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.ts')) {
      fixImports(fullPath);
    }
  });
}

console.log('🚀 开始修复导入路径...');
processDirectory(rootDir);
console.log('✅ 修复完成!');