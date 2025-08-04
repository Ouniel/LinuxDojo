/**
 * 验证双语帮助系统的完整性
 * 检查所有命令是否都有正确的双语描述格式
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 命令模块路径
const commandsPath = path.join(__dirname, '../src/stores/modules/commands');

// 需要检查的命令文件
const commandFiles = [
  'basic.js',
  'text.js', 
  'system.js',
  'network.js',
  'help.js'
];

// 需要检查的子目录
const commandDirs = [
  'basic',
  'text', 
  'system',
  'network',
  'file',
  'permission',
  'process'
];

// 验证双语格式的正则表达式
const bilingualPattern = /^[^|]+\|[^|]+$/;

// 验证结果统计
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

console.log('🔍 开始验证双语帮助系统...\n');

// 验证单个文件
function verifyFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 查找所有的 description 字段
    const descriptionMatches = content.match(/description:\s*['"`]([^'"`]+)['"`]/g);
    
    if (descriptionMatches) {
      descriptionMatches.forEach(match => {
        results.total++;
        
        // 提取描述内容
        const descMatch = match.match(/description:\s*['"`]([^'"`]+)['"`]/);
        if (descMatch) {
          const description = descMatch[1];
          
          if (bilingualPattern.test(description)) {
            results.passed++;
            console.log(`✅ ${relativePath}: "${description}"`);
          } else {
            results.failed++;
            results.errors.push({
              file: relativePath,
              description: description,
              issue: '缺少双语格式 (English|中文)'
            });
            console.log(`❌ ${relativePath}: "${description}" - 缺少双语格式`);
          }
        }
      });
    }
    
    // 检查帮助文本中的双语内容
    const helpMatches = content.match(/help:\s*['"`]([^'"`]*(?:\n[^'"`]*)*?)['"`]/gs);
    if (helpMatches) {
      helpMatches.forEach(match => {
        const helpContent = match.match(/help:\s*['"`]([\s\S]*?)['"`]/)[1];
        const lines = helpContent.split('\n');
        
        lines.forEach(line => {
          if (line.includes('|') && !line.includes('Usage|用法') && !line.includes('Options|选项') && !line.includes('Examples|示例')) {
            // 这是一个双语行，验证格式
            if (bilingualPattern.test(line.trim())) {
              console.log(`✅ ${relativePath} (help): "${line.trim()}"`);
            } else {
              console.log(`⚠️  ${relativePath} (help): "${line.trim()}" - 可能的格式问题`);
            }
          }
        });
      });
    }
    
  } catch (error) {
    console.error(`❌ 读取文件失败: ${relativePath} - ${error.message}`);
    results.errors.push({
      file: relativePath,
      issue: `文件读取错误: ${error.message}`
    });
  }
}

// 验证主命令文件
commandFiles.forEach(file => {
  const filePath = path.join(commandsPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`\n📁 检查文件: ${file}`);
    verifyFile(filePath, file);
  }
});

// 验证子目录中的命令文件
commandDirs.forEach(dir => {
  const dirPath = path.join(commandsPath, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`\n📁 检查目录: ${dir}/`);
    
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(dirPath, file);
        verifyFile(filePath, `${dir}/${file}`);
      }
    });
  }
});

// 输出验证结果
console.log('\n' + '='.repeat(60));
console.log('📊 验证结果统计:');
console.log(`总计检查: ${results.total} 个描述`);
console.log(`✅ 通过: ${results.passed} 个`);
console.log(`❌ 失败: ${results.failed} 个`);

if (results.failed > 0) {
  console.log('\n❌ 需要修复的问题:');
  results.errors.forEach((error, index) => {
    console.log(`${index + 1}. ${error.file}`);
    if (error.description) {
      console.log(`   描述: "${error.description}"`);
    }
    console.log(`   问题: ${error.issue}`);
    console.log('');
  });
}

const successRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
console.log(`\n🎯 成功率: ${successRate}%`);

if (results.failed === 0) {
  console.log('\n🎉 所有命令的双语帮助系统验证通过！');
} else {
  console.log('\n⚠️  发现问题，请根据上述信息进行修复。');
}