// eslint-disable-next-line no-undef
const fs = require('fs');
// eslint-disable-next-line no-undef
const path = require('path');

console.log('Bat dau don dep code...\n');

function removeEmojis(text) {
  return text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
}

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    content = content.replace(/\/\/.*$/gm, '');
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    content = content.replace(/console\.log\([^)]*\);?\s*/g, (match) => {
      if (/[\u{1F300}-\u{1F9FF}]/u.test(match)) {
        return '';
      }
      return match;
    });
    
    content = removeEmojis(content);
    content = content.replace(/\n{3,}/g, '\n\n');
    content = content.replace(/[ \t]+$/gm, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Da xu ly: ' + path.basename(filePath));
    
  } catch (error) {
    console.error('Loi:', error.message);
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.match(/\.(js|jsx|ts|tsx)$/)) {
      cleanFile(filePath);
    }
  });
}

// eslint-disable-next-line no-undef
const srcDir = path.join(process.cwd(), 'src');

if (fs.existsSync(srcDir)) {
  console.log('Dang xu ly thu muc src...\n');
  scanDirectory(srcDir);
  console.log('\nHoan tat!');
  console.log('Da xoa:');
  console.log('  - Comments');
  console.log('  - Console.log co emoji');
  console.log('  - Emoji icons');
} else {
  console.error('Khong tim thay thu muc src');
}