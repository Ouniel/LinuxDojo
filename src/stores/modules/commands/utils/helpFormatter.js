/**
 * 双语帮助信息格式化工具
 * 处理中英文双语帮助信息的显示和格式化
 */

// 解析双语文本
export function parseBilingualText(text) {
  if (typeof text !== 'string') return { en: text, zh: text }
  
  const parts = text.split('|')
  if (parts.length === 2) {
    return {
      en: parts[0].trim(),
      zh: parts[1].trim()
    }
  }
  
  // 如果没有分隔符，默认为英文
  return {
    en: text.trim(),
    zh: text.trim()
  }
}

// 格式化双语帮助信息
export function formatBilingualHelp(helpText, language = 'both') {
  const lines = helpText.split('\n')
  const formattedLines = []
  
  for (const line of lines) {
    if (line.includes('|')) {
      const { en, zh } = parseBilingualText(line)
      
      switch (language) {
        case 'en':
          formattedLines.push(en)
          break
        case 'zh':
          formattedLines.push(zh)
          break
        case 'both':
        default:
          formattedLines.push(`${en} | ${zh}`)
          break
      }
    } else {
      formattedLines.push(line)
    }
  }
  
  return formattedLines.join('\n')
}

// 格式化命令描述
export function formatDescription(description, language = 'both') {
  const { en, zh } = parseBilingualText(description)
  
  switch (language) {
    case 'en':
      return en
    case 'zh':
      return zh
    case 'both':
    default:
      return `${en} | ${zh}`
  }
}

// 格式化选项说明
export function formatOptionDescription(option, description) {
  const { en, zh } = parseBilingualText(description)
  return `  ${option.padEnd(20)} ${en} | ${zh}`
}

// 创建双语帮助模板
export function createBilingualHelp(config) {
  const {
    usage,
    description,
    options = [],
    examples = [],
    notes = []
  } = config
  
  const helpSections = []
  
  // Usage section
  if (usage) {
    const { en: usageEn, zh: usageZh } = parseBilingualText(usage)
    helpSections.push(`Usage|用法: ${usageEn} | ${usageZh}`)
  }
  
  // Description section
  if (description) {
    helpSections.push('')
    const { en: descEn, zh: descZh } = parseBilingualText(description)
    helpSections.push(`${descEn} | ${descZh}`)
  }
  
  // Options section
  if (options.length > 0) {
    helpSections.push('')
    helpSections.push('Options|选项:')
    for (const option of options) {
      if (typeof option === 'string') {
        helpSections.push(`  ${option}`)
      } else {
        const { flag, desc } = option
        helpSections.push(formatOptionDescription(flag, desc))
      }
    }
  }
  
  // Examples section
  if (examples.length > 0) {
    helpSections.push('')
    helpSections.push('Examples|示例:')
    for (const example of examples) {
      if (typeof example === 'string') {
        helpSections.push(`  ${example}`)
      } else {
        const { cmd, desc } = example
        const { en: descEn, zh: descZh } = parseBilingualText(desc)
        helpSections.push(`  ${cmd.padEnd(30)} # ${descEn} | ${descZh}`)
      }
    }
  }
  
  // Notes section
  if (notes.length > 0) {
    helpSections.push('')
    helpSections.push('Notes|注意:')
    for (const note of notes) {
      const { en, zh } = parseBilingualText(note)
      helpSections.push(`  ${en} | ${zh}`)
    }
  }
  
  return helpSections.join('\n')
}

// 双语错误信息
export const bilingualErrors = {
  fileNotFound: (filename) => `File not found: ${filename}|文件未找到: ${filename}`,
  permissionDenied: (action) => `Permission denied: ${action}|权限被拒绝: ${action}`,
  invalidOption: (option) => `Invalid option: ${option}|无效选项: ${option}`,
  missingArgument: (arg) => `Missing required argument: ${arg}|缺少必需参数: ${arg}`,
  commandNotFound: (cmd) => `Command not found: ${cmd}|命令未找到: ${cmd}`,
  directoryNotFound: (dir) => `Directory not found: ${dir}|目录未找到: ${dir}`,
  fileExists: (filename) => `File already exists: ${filename}|文件已存在: ${filename}`,
  notADirectory: (path) => `Not a directory: ${path}|不是目录: ${path}`,
  isADirectory: (path) => `Is a directory: ${path}|是一个目录: ${path}`,
  operationNotPermitted: (op) => `Operation not permitted: ${op}|操作不被允许: ${op}`
}

// 双语成功信息
export const bilingualSuccess = {
  fileCreated: (filename) => `File created: ${filename}|文件已创建: ${filename}`,
  directoryCreated: (dirname) => `Directory created: ${dirname}|目录已创建: ${dirname}`,
  fileCopied: (src, dest) => `Copied ${src} to ${dest}|已复制 ${src} 到 ${dest}`,
  fileMoved: (src, dest) => `Moved ${src} to ${dest}|已移动 ${src} 到 ${dest}`,
  fileDeleted: (filename) => `File deleted: ${filename}|文件已删除: ${filename}`,
  permissionChanged: (filename) => `Permission changed: ${filename}|权限已修改: ${filename}`,
  ownerChanged: (filename) => `Owner changed: ${filename}|所有者已修改: ${filename}`
}

// 格式化帮助信息的简化函数
export function formatHelp(helpText, language = 'both') {
  return formatBilingualHelp(helpText, language)
}

export default {
  parseBilingualText,
  formatBilingualHelp,
  formatDescription,
  formatOptionDescription,
  createBilingualHelp,
  formatHelp,
  bilingualErrors,
  bilingualSuccess
}
