#!/usr/bin/env node

/**
 * 批量更新命令帮助信息为双语格式的脚本
 * 将所有命令的description和help信息更新为"英文|中文"格式
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 双语翻译映射
const translations = {
  // 基础命令
  'Display file contents': '显示文件内容',
  'Change directory': '切换目录',
  'Create directories': '创建目录',
  'Create empty files': '创建空文件',
  'Remove files and directories': '删除文件和目录',
  'Copy files and directories': '复制文件和目录',
  'Move/rename files and directories': '移动/重命名文件和目录',
  'Print working directory': '显示当前工作目录',
  'Find files and directories': '查找文件和目录',
  'Change file permissions': '修改文件权限',
  'Change file ownership': '修改文件所有者',
  'Create links': '创建链接',
  
  // 文本处理命令
  'Search text patterns': '搜索文本模式',
  'Stream editor': '流编辑器',
  'Text processing tool': '文本处理工具',
  'Sort lines': '排序行',
  'Remove duplicate lines': '删除重复行',
  'Count words, lines, characters': '统计单词、行、字符',
  
  // 系统命令
  'Display running processes': '显示运行进程',
  'Display system processes': '显示系统进程',
  'Terminate processes': '终止进程',
  'Display filesystem usage': '显示文件系统使用情况',
  'Display directory usage': '显示目录使用情况',
  
  // 网络命令
  'Test network connectivity': '测试网络连通性',
  'HTTP client tool': 'HTTP客户端工具',
  'Download files': '下载文件',
  'Display network connections': '显示网络连接',
  'Remote login': '远程登录',
  
  // 文件操作命令
  'Archive files': '归档文件',
  'Create ZIP archives': '创建ZIP归档',
  'Extract ZIP archives': '解压ZIP归档',
  'Compress files': '压缩文件',
  
  // 权限管理命令
  'Set default permissions': '设置默认权限',
  'Switch user': '切换用户',
  'Execute as another user': '以其他用户身份执行',
  
  // 进程管理命令
  'Display job status': '显示作业状态',
  'Put jobs in background': '将作业放到后台',
  'Bring jobs to foreground': '将作业放到前台'
}

// 更新单个文件的函数
function updateCommandFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    let modified = false
    
    // 更新description字段
    const descriptionRegex = /description:\s*['"`]([^'"`]+)['"`]/g
    content = content.replace(descriptionRegex, (match, desc) => {
      // 如果已经是双语格式，跳过
      if (desc.includes('|')) {
        return match
      }
      
      const translation = translations[desc] || desc
      const bilingualDesc = `${desc}|${translation}`
      modified = true
      return match.replace(desc, bilingualDesc)
    })
    
    // 更新help字段中的常用短语
    const helpUpdates = [
      { en: 'Usage:', zh: '用法:' },
      { en: 'Examples:', zh: '示例:' },
      { en: 'Options:', zh: '选项:' },
      { en: 'Exit Status:', zh: '退出状态:' },
      { en: 'display this help and exit', zh: '显示此帮助信息并退出' },
      { en: 'output version information and exit', zh: '输出版本信息并退出' }
    ]
    
    helpUpdates.forEach(({ en, zh }) => {
      const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?!\\|)`, 'g')
      if (content.match(regex)) {
        content = content.replace(regex, `${en}|${zh}`)
        modified = true
      }
    })
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`✅ Updated: ${filePath}`)
      return true
    } else {
      console.log(`⏭️  Skipped: ${filePath} (already bilingual or no changes needed)`)
      return false
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message)
    return false
  }
}

// 递归查找所有命令文件
function findCommandFiles(dir) {
  const files = []
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory() && item !== 'utils') {
      files.push(...findCommandFiles(fullPath))
    } else if (stat.isFile() && item.endsWith('.js') && item !== 'index.js') {
      files.push(fullPath)
    }
  }
  
  return files
}

// 主函数
function main() {
  console.log('🚀 Starting bilingual help update process...\n')
  
  const commandsDir = path.join(__dirname, '../src/stores/modules/commands')
  const commandFiles = findCommandFiles(commandsDir)
  
  console.log(`📁 Found ${commandFiles.length} command files to process\n`)
  
  let updatedCount = 0
  let skippedCount = 0
  
  for (const file of commandFiles) {
    const relativePath = path.relative(commandsDir, file)
    if (updateCommandFile(file)) {
      updatedCount++
    } else {
      skippedCount++
    }
  }
  
  console.log('\n📊 Summary:')
  console.log(`✅ Updated: ${updatedCount} files`)
  console.log(`⏭️  Skipped: ${skippedCount} files`)
  console.log(`📁 Total: ${commandFiles.length} files`)
  
  if (updatedCount > 0) {
    console.log('\n🎉 Bilingual help update completed successfully!')
    console.log('All command descriptions and help text now support both English and Chinese.')
  } else {
    console.log('\n✨ All files are already up to date!')
  }
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { updateCommandFile, findCommandFiles }