const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src');
const excludeDirs = ['node_modules', '.git', 'dist'];

function shouldExclude(dir) {
  return excludeDirs.some(exclude => dir.includes(exclude));
}

function convertImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 匹配 from 'src/xxx' 的导入语句
  const regex = /from\s+['"]src\/([^'"]+)['"]/g;

  content = content.replace(regex, (match, importPath) => {
    const targetPath = path.join(rootDir, importPath);
    
    if (!fs.existsSync(targetPath) && !fs.existsSync(targetPath + '.ts') && !fs.existsSync(targetPath + '.js')) {
      console.log(`⚠️  目标文件不存在: ${targetPath}`);
      return match;
    }

    const fileDir = path.dirname(filePath);
    let relativePath = path.relative(fileDir, targetPath);
    
    // 确保路径以 ./ 或 ../ 开头
    if (!relativePath.startsWith('.') && !relativePath.startsWith('/')) {
      relativePath = './' + relativePath;
    }

    // 转换反斜杠为正斜杠
    relativePath = relativePath.replace(/\\/g, '/');

    changed = true;
    console.log(`🔄 ${filePath.replace(__dirname, '')} -> ${importPath} -> ${relativePath}`);
    return `from '${relativePath}'`;
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
      convertImports(fullPath);
    }
  });
}

console.log('🚀 开始转换 src/xxx 导入路径...');
processDirectory(rootDir);
console.log('✅ 转换完成!');