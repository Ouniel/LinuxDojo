/**
 * 统计项目中的所有命令数量
 * 分析命令分布和覆盖情况
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 命令模块路径
const commandsPath = path.join(__dirname, '../src/stores/modules/commands');

// 统计结果
const stats = {
  totalCommands: 0,
  categories: {},
  commandList: [],
  duplicates: [],
  aliases: []
};

console.log('🔍 开始统计项目中的所有命令...\n');

// 分析单个文件中的命令
function analyzeFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 查找导出的命令对象
    const exportMatches = content.match(/export\s+const\s+(\w+Commands)\s*=\s*{([^}]+)}/s);
    if (exportMatches) {
      const commandsObjectName = exportMatches[1];
      const commandsContent = exportMatches[2];
      
      // 提取命令名称
      const commandNames = commandsContent.match(/(\w+):\s*{/g);
      if (commandNames) {
        commandNames.forEach(match => {
          const commandName = match.replace(/:\s*{/, '');
          
          // 检查是否是别名
          const isAlias = content.includes(`${commandName}: {`) && 
                         (content.includes('handler: (args, context, fs) => {') || 
                          content.includes('...gzip,') || 
                          content.includes('reference:'));
          
          const category = relativePath.split('/')[0] || 'unknown';
          
          const command = {
            name: commandName,
            file: relativePath,
            category: category,
            isAlias: isAlias
          };
          
          // 检查重复
          const existing = stats.commandList.find(cmd => cmd.name === commandName);
          if (existing) {
            stats.duplicates.push({
              name: commandName,
              files: [existing.file, relativePath]
            });
          } else {
            stats.commandList.push(command);
            stats.totalCommands++;
            
            if (!stats.categories[category]) {
              stats.categories[category] = 0;
            }
            stats.categories[category]++;
            
            if (isAlias) {
              stats.aliases.push(command);
            }
          }
          
          console.log(`📝 ${commandName} (${category}) - ${relativePath}${isAlias ? ' [别名]' : ''}`);
        });
      }
    }
    
    // 查找单独导出的命令 (支持 handler: 和 execute( 两种格式)
    const handlerMatches = content.match(/export\s+const\s+(\w+)\s*=\s*{[\s\S]*?handler:/g);
    const executeMatches = content.match(/export\s+const\s+(\w+)\s*=\s*{[\s\S]*?execute\s*\(/g);
    
    const allSingleMatches = [...(handlerMatches || []), ...(executeMatches || [])];
    
    if (allSingleMatches.length > 0) {
      allSingleMatches.forEach(match => {
        const commandName = match.match(/export\s+const\s+(\w+)/)[1];
        
        // 避免重复统计
        if (!stats.commandList.find(cmd => cmd.name === commandName)) {
          const category = relativePath.split('/')[0] || 'unknown';
          
          const command = {
            name: commandName,
            file: relativePath,
            category: category,
            isAlias: false
          };
          
          stats.commandList.push(command);
          stats.totalCommands++;
          
          if (!stats.categories[category]) {
            stats.categories[category] = 0;
          }
          stats.categories[category]++;
          
          console.log(`📝 ${commandName} (${category}) - ${relativePath}`);
        }
      });
    }
    
  } catch (error) {
    console.error(`❌ 分析文件失败: ${relativePath} - ${error.message}`);
  }
}

// 递归扫描目录
function scanDirectory(dirPath, relativePath = '') {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;
    
    if (fs.statSync(itemPath).isDirectory()) {
      console.log(`\n📁 扫描目录: ${itemRelativePath}/`);
      scanDirectory(itemPath, itemRelativePath);
    } else if (item.endsWith('.js') && item !== 'index.js') {
      analyzeFile(itemPath, itemRelativePath);
    }
  });
}

// 开始扫描
scanDirectory(commandsPath);

// 输出统计结果
console.log('\n' + '='.repeat(80));
console.log('📊 命令统计结果:');
console.log(`总命令数: ${stats.totalCommands}`);

console.log('\n📋 按类别分布:');
Object.entries(stats.categories)
  .sort(([,a], [,b]) => b - a)
  .forEach(([category, count]) => {
    console.log(`  ${category.padEnd(15)}: ${count.toString().padStart(3)} 个命令`);
  });

if (stats.aliases.length > 0) {
  console.log(`\n🔗 别名命令: ${stats.aliases.length} 个`);
  stats.aliases.forEach(alias => {
    console.log(`  ${alias.name} (${alias.category})`);
  });
}

if (stats.duplicates.length > 0) {
  console.log(`\n⚠️  重复命令: ${stats.duplicates.length} 个`);
  stats.duplicates.forEach(dup => {
    console.log(`  ${dup.name}: ${dup.files.join(', ')}`);
  });
}

// 按字母顺序列出所有命令
console.log('\n📝 所有命令列表 (按字母顺序):');
const sortedCommands = stats.commandList
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((cmd, index) => `${(index + 1).toString().padStart(3)}. ${cmd.name.padEnd(12)} (${cmd.category})${cmd.isAlias ? ' [别名]' : ''}`)
  .join('\n');

console.log(sortedCommands);

// 检查是否达到97个命令的目标
console.log('\n🎯 目标检查:');
if (stats.totalCommands >= 97) {
  console.log(`✅ 已达到目标！当前有 ${stats.totalCommands} 个命令，超过了97个的目标。`);
} else {
  const remaining = 97 - stats.totalCommands;
  console.log(`⚠️  还需要 ${remaining} 个命令才能达到97个的目标。`);
}

// 生成命令覆盖报告
console.log('\n📈 Linux命令覆盖情况:');
const commonLinuxCommands = [
  // 文件操作
  'ls', 'cat', 'cd', 'pwd', 'mkdir', 'rmdir', 'rm', 'cp', 'mv', 'touch', 'find', 'locate',
  'ln', 'chmod', 'chown', 'chgrp', 'umask', 'file', 'stat', 'du', 'df',
  
  // 文本处理
  'grep', 'egrep', 'fgrep', 'sed', 'awk', 'sort', 'uniq', 'cut', 'tr', 'wc', 'head', 'tail',
  'more', 'less', 'diff', 'comm', 'join', 'paste', 'split', 'csplit',
  
  // 压缩归档
  'tar', 'gzip', 'gunzip', 'zcat', 'zip', 'unzip', 'compress', 'uncompress',
  
  // 进程管理
  'ps', 'top', 'htop', 'kill', 'killall', 'pkill', 'pgrep', 'jobs', 'bg', 'fg', 'nohup',
  
  // 系统信息
  'uname', 'whoami', 'who', 'w', 'id', 'groups', 'uptime', 'date', 'cal', 'env', 'printenv',
  'which', 'whereis', 'type', 'history', 'alias', 'unalias',
  
  // 网络工具
  'ping', 'wget', 'curl', 'ssh', 'scp', 'rsync', 'netstat', 'ss', 'telnet', 'ftp',
  
  // 权限和用户
  'su', 'sudo', 'passwd', 'useradd', 'userdel', 'usermod', 'groupadd', 'groupdel',
  
  // 其他常用
  'echo', 'printf', 'read', 'test', 'expr', 'bc', 'sleep', 'watch', 'xargs', 'tee'
];

const implementedCommands = stats.commandList.map(cmd => cmd.name);
const coveredCommands = commonLinuxCommands.filter(cmd => implementedCommands.includes(cmd));
const missingCommands = commonLinuxCommands.filter(cmd => !implementedCommands.includes(cmd));

console.log(`常用Linux命令覆盖率: ${coveredCommands.length}/${commonLinuxCommands.length} (${(coveredCommands.length/commonLinuxCommands.length*100).toFixed(1)}%)`);

if (missingCommands.length > 0) {
  console.log('\n❌ 缺失的常用命令:');
  missingCommands.forEach((cmd, index) => {
    if (index % 8 === 0) console.log('');
    process.stdout.write(`${cmd.padEnd(12)}`);
  });
  console.log('\n');
}

console.log('\n🎉 命令统计完成！');