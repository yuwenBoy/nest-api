const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src');
const targetFile = 'common/decorators/skip-log.decorator';

function fixSkipLogImport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 检查是否有 skip-log.decorator 的导入
  const regex = /import \{ SkipLog \} from ['"]([^'"]+)skip-log\.decorator['"]/;
  const match = content.match(regex);
  
  if (!match) return false;
  
  const currentPath = match[1];
  
  // 计算正确的相对路径
  const fileDir = path.dirname(filePath);
  const targetFullPath = path.join(rootDir, targetFile);
  let correctPath = path.relative(fileDir, targetFullPath);
  
  // 确保路径以 ./ 或 ../ 开头
  if (!correctPath.startsWith('.') && !correctPath.startsWith('/')) {
    correctPath = './' + correctPath;
  }
  
  // 转换反斜杠为正斜杠
  correctPath = correctPath.replace(/\\/g, '/');
  
  // 移除 .ts 扩展名（如果有）
  if (correctPath.endsWith('.ts')) {
    correctPath = correctPath.slice(0, -3);
  }
  
  if (currentPath !== correctPath) {
    console.log(`🔄 ${filePath.replace(__dirname, '')}`);
    console.log(`   旧路径: ${currentPath}skip-log.decorator`);
    console.log(`   新路径: ${correctPath}`);
    content = content.replace(regex, `import { SkipLog } from '${correctPath}'`);
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return false;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.ts')) {
      fixSkipLogImport(fullPath);
    }
  });
}

console.log('🚀 开始修复 skip-log.decorator 导入路径...');
processDirectory(rootDir);
console.log('✅ 修复完成!');