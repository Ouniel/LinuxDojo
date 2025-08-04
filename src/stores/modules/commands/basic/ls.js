/**
 * ls - 列出目录内容
 */

import { createBilingualHelp, bilingualErrors } from '../utils/helpFormatter.js'

// 工具函数
function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 180) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).replace(',', '')
  }
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit', 
    year: 'numeric' 
  }).replace(',', '')
}

export const ls = {
  options: [
    // 显示选项组
    {
      flag: '-a',
      longFlag: '--all',
      description: '显示所有文件，包括以点(.)开头的隐藏文件',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-A',
      longFlag: '--almost-all',
      description: '显示所有文件，但不包括.和..',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-d',
      longFlag: '--directory',
      description: '列出目录本身，而不是目录内容',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-R',
      longFlag: '--recursive',
      description: '递归显示子目录',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-F',
      longFlag: '--classify',
      description: '在文件名后添加类型指示符（/=@|）',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '--color',
      description: '使用颜色区分不同类型的文件',
      type: 'select',
      inputKey: 'color_option',
      options: ['auto', 'always', 'never'],
      optionLabels: ['自动', '总是', '从不'],
      default: 'auto',
      group: '显示选项'
    },
    
    // 显示格式组
    {
      flag: '-l',
      description: '使用长格式列出文件详细信息（权限、大小、时间等）',
      type: 'boolean',
      group: '显示格式'
    },
    {
      flag: '-h',
      longFlag: '--human-readable',
      description: '以人类可读的格式显示文件大小（K、M、G）',
      type: 'boolean',
      group: '显示格式'
    },
    {
      flag: '-1',
      description: '每行只显示一个文件',
      type: 'boolean',
      group: '显示格式'
    },
    {
      flag: '-m',
      description: '用逗号分隔的格式显示文件名',
      type: 'boolean',
      group: '显示格式'
    },
    {
      flag: '-x',
      description: '按行而不是按列排列文件',
      type: 'boolean',
      group: '显示格式'
    },
    {
      flag: '-C',
      description: '按列排列文件（默认）',
      type: 'boolean',
      group: '显示格式'
    },
    {
      flag: '-i',
      longFlag: '--inode',
      description: '显示每个文件的inode号',
      type: 'boolean',
      group: '显示格式'
    },
    {
      flag: '-s',
      longFlag: '--size',
      description: '显示每个文件占用的块数',
      type: 'boolean',
      group: '显示格式'
    },
    
    // 排序选项组
    {
      flag: '-t',
      description: '按修改时间排序，最新的在前',
      type: 'boolean',
      group: '排序选项'
    },
    {
      flag: '-S',
      description: '按文件大小排序，从大到小',
      type: 'boolean',
      group: '排序选项'
    },
    {
      flag: '-r',
      longFlag: '--reverse',
      description: '反向排序',
      type: 'boolean',
      group: '排序选项'
    },
    {
      flag: '-c',
      description: '按状态改变时间排序',
      type: 'boolean',
      group: '排序选项'
    },
    {
      flag: '-u',
      description: '按访问时间排序',
      type: 'boolean',
      group: '排序选项'
    },
    {
      flag: '-X',
      description: '按文件扩展名排序',
      type: 'boolean',
      group: '排序选项'
    },
    {
      flag: '--sort',
      description: '指定排序方式',
      type: 'select',
      inputKey: 'sort_option',
      options: ['none', 'size', 'time', 'version', 'extension'],
      optionLabels: ['不排序', '按大小', '按时间', '按版本', '按扩展名'],
      group: '排序选项'
    },
    
    // 时间选项组
    {
      flag: '--time',
      description: '指定显示的时间类型',
      type: 'select',
      inputKey: 'time_option',
      options: ['atime', 'access', 'use', 'ctime', 'status'],
      optionLabels: ['访问时间', '访问时间', '使用时间', '状态改变时间', '状态时间'],
      group: '时间选项'
    },
    {
      flag: '--time-style',
      description: '指定时间显示格式',
      type: 'select',
      inputKey: 'time_style',
      options: ['full-iso', 'long-iso', 'iso', 'locale', '+%Y-%m-%d'],
      optionLabels: ['完整ISO', '长ISO', 'ISO', '本地格式', '自定义格式'],
      group: '时间选项'
    },
    
    // 过滤选项组
    {
      flag: '-B',
      longFlag: '--ignore-backups',
      description: '不列出以~结尾的备份文件',
      type: 'boolean',
      group: '过滤选项'
    },
    {
      flag: '--hide',
      description: '隐藏匹配指定模式的文件',
      type: 'input',
      inputKey: 'hide_pattern',
      placeholder: '文件模式（如 *.tmp）',
      group: '过滤选项'
    },
    {
      flag: '-I',
      longFlag: '--ignore',
      description: '忽略匹配指定模式的文件',
      type: 'input',
      inputKey: 'ignore_pattern',
      placeholder: '文件模式（如 *.log）',
      group: '过滤选项'
    },
    
    // 输入参数
    {
      inputKey: 'target_path',
      description: '要列出内容的目录或文件路径',
      type: 'input',
      placeholder: '路径（默认为当前目录）',
      required: false
    },
    {
      flag: '-w',
      longFlag: '--width',
      description: '指定输出宽度',
      type: 'number',
      inputKey: 'output_width',
      placeholder: '列数（如 80）',
      group: '显示格式'
    }
  ],
  handler: (args, context, filesystem) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return ls.help
    }

    // 检查filesystem是否存在
    if (!filesystem) {
      return 'Error: Filesystem not available'
    }

    // 获取当前目录内容
    const files = filesystem.getCurrentDirectoryContents || []
    const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al')
    const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al')
    const showHidden = args.includes('-A')
    const recursive = args.includes('-R')
    const sortByTime = args.includes('-t')
    const sortBySize = args.includes('-S')
    const reverseSort = args.includes('-r')
    const humanReadable = args.includes('-h')
    const oneColumn = args.includes('-1')
    
    let fileList = [...files]
    
    // 添加 . 和 .. 目录（如果使用 -a）
    if (showAll) {
      fileList = [
        { name: '.', type: 'directory', permissions: 'drwxr-xr-x', size: 4096, modified: new Date().toISOString() },
        { name: '..', type: 'directory', permissions: 'drwxr-xr-x', size: 4096, modified: new Date().toISOString() },
        ...fileList
      ]
    } else if (showHidden) {
      // -A 显示隐藏文件但不显示 . 和 ..
      fileList = fileList.filter(f => f.name.startsWith('.') && f.name !== '.' && f.name !== '..')
    } else {
      // 默认不显示隐藏文件
      fileList = fileList.filter(f => !f.name.startsWith('.'))
    }

    // 排序
    if (sortByTime) {
      fileList.sort((a, b) => new Date(b.modified || 0) - new Date(a.modified || 0))
    } else if (sortBySize) {
      fileList.sort((a, b) => (b.size || 0) - (a.size || 0))
    } else {
      fileList.sort((a, b) => a.name.localeCompare(b.name))
    }

    if (reverseSort) {
      fileList.reverse()
    }
    
    if (longFormat) {
      const totalBlocks = Math.ceil(fileList.reduce((sum, f) => sum + (f.size || 0), 0) / 1024)
      let output = `total ${totalBlocks}\n`
      
      fileList.forEach(file => {
        const permissions = file.permissions || (file.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--')
        const links = file.type === 'directory' ? '2' : '1'
        const size = humanReadable ? formatSize(file.size || 0) : (file.size || 0).toString()
        const date = formatDate(file.modified || new Date().toISOString())
        
        output += `${permissions} ${links.padStart(2)} favork favork ${size.padStart(8)} ${date} ${file.name}\n`
      })
      return output.trim()
    }
    
    // 简单格式
    const names = fileList.map(f => f.name)
    if (names.length === 0) return ''

    if (oneColumn) {
      return names.join('\n')
    }
    
    // 计算列宽
    const terminalWidth = 80
    const maxNameLength = Math.max(...names.map(n => n.length))
    const columnWidth = maxNameLength + 2
    const columnsPerRow = Math.floor(terminalWidth / columnWidth) || 1
    
    const rows = []
    for (let i = 0; i < names.length; i += columnsPerRow) {
      const row = names.slice(i, i + columnsPerRow)
      rows.push(row.map(name => name.padEnd(columnWidth)).join('').trim())
    }
    
    return rows.join('\n')
  },
  description: 'List directory contents|列出目录内容',
  category: 'file',
  supportsPipe: true,
  examples: [
    'ls',
    'ls -l',
    'ls -la',
    'ls -A',
    'ls -t',
    'ls -S',
    'ls -r',
    'ls -1',
    'ls --help'
  ],
  help: `Usage: ls [OPTION]... [FILE]...|用法: ls [选项]... [文件]...
List information about the FILEs (the current directory by default).|列出文件信息（默认为当前目录）。

  -a, --all                  do not ignore entries starting with .|不忽略以.开头的条目
  -A, --almost-all           do not list implied . and ..|不列出隐含的.和..
  -l                         use a long listing format|使用长列表格式
  -1                         list one file per line|每行列出一个文件
  -r, --reverse              reverse order while sorting|排序时反转顺序
  -R, --recursive            list subdirectories recursively|递归列出子目录
  -S                         sort by file size, largest first|按文件大小排序，最大的在前
  -t                         sort by modification time, newest first|按修改时间排序，最新的在前
  -h, --human-readable       with -l, print sizes in human readable format|与-l一起使用，以人类可读格式显示大小
      --help                 display this help and exit|显示此帮助信息并退出

Examples|示例:
  ls          List files in current directory|列出当前目录中的文件
  ls -l       List files with detailed information|列出文件的详细信息
  ls -la      List all files including hidden ones with details|列出所有文件（包括隐藏文件）的详细信息
  ls -A       List all files except . and ..|列出除.和..之外的所有文件
  ls -t       Sort by modification time|按修改时间排序
  ls -S       Sort by file size|按文件大小排序
  ls -1       List one file per line|每行列出一个文件`
}

// 格式化文件大小
function formatSize(bytes) {
  const units = ['B', 'K', 'M', 'G', 'T']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${Math.round(size * 10) / 10}${units[unitIndex]}`
}
