import { formatHelp } from '../utils/helpFormatter.js'

export const locate = {
  options: [
    {
      flag: '-i',
      longFlag: '--ignore-case',
      description: 'Ignore case distinctions|忽略大小写',
      type: 'boolean'
    },
    {
      flag: '-b',
      longFlag: '--basename',
      description: 'Match only basename|仅匹配基本名称',
      type: 'boolean'
    },
    {
      flag: '-c',
      longFlag: '--count',
      description: 'Output count of matching entries|输出匹配条目数',
      type: 'boolean'
    },
    {
      flag: '-r',
      longFlag: '--regex',
      description: 'Use regex pattern|使用正则表达式模式',
      type: 'boolean'
    },
    {
      flag: '-l',
      longFlag: '--limit',
      description: 'Limit output to N entries|限制输出N个条目',
      type: 'string',
      placeholder: 'N'
    }
  ],
  name: 'locate',
  description: 'Find files by name|通过名称查找文件',
  category: 'basic',
  requiresArgs: true,
  examples: [
    'locate filename',
    'locate -i FILE',
    'locate -c "*.txt"',
    'locate -r "^/home.*\\.txt$"'
  ],
  help: `Usage: locate [OPTION]... PATTERN...|用法: locate [选项]... 模式...
Locate files by name|通过名称定位文件

  -i, --ignore-case     ignore case distinctions|忽略大小写区别
  -b, --basename        match only the base name|仅匹配基本名称
  -c, --count           only print number of found entries|仅打印找到的条目数
  -l, --limit N         limit to N entries|限制为N个条目
  -r, --regex           interpret PATTERN as basic regular expression|将模式解释为基本正则表达式
      --help            display this help and exit|显示此帮助信息并退出

Examples|示例:
  locate filename       Find files containing 'filename'|查找包含'filename'的文件
  locate -i FILE        Case-insensitive search|不区分大小写搜索
  locate -c "*.txt"     Count txt files|统计txt文件数量
  locate -r "^/home.*\\.txt$"  Regex search|正则表达式搜索`,
  
  handler(args, context, fs) {
    const { currentPath } = context
    const fileSystem = fs.fileSystem || fs
    const options = {
      ignoreCase: false,
      basename: false,
      count: false,
      limit: null,
      regex: false
    }
    
    const files = []
    let searchPattern = ''
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-i' || arg === '--ignore-case') {
        options.ignoreCase = true
      } else if (arg === '-b' || arg === '--basename') {
        options.basename = true
      } else if (arg === '-c' || arg === '--count') {
        options.count = true
      } else if (arg === '-l' || arg === '--limit') {
        options.limit = parseInt(args[++i]) || 10
      } else if (arg === '-r' || arg === '--regex') {
        options.regex = true
      } else if (arg === '--help') {
        return formatHelp({
          name: 'locate',
          description: 'Find files by name|通过名称查找文件',
          usage: 'locate [OPTIONS] PATTERN|locate [选项] 模式',
          options: [
            '-i, --ignore-case    Ignore case distinctions|忽略大小写',
            '-b, --basename       Match only basename|仅匹配基本名称',
            '-c, --count          Output count of matching entries|输出匹配条目数',
            '-l, --limit N        Limit output to N entries|限制输出N个条目',
            '-r, --regex          Use regex pattern|使用正则表达式模式',
            '--help               Show this help|显示此帮助'
          ],
          examples: [
            'locate filename|查找文件名',
            'locate -i FILE|忽略大小写查找',
            'locate -c "*.txt"|统计txt文件数量'
          ]
        })
      } else if (!arg.startsWith('-')) {
        searchPattern = arg
        break
      }
    }
    
    if (!searchPattern) {
      return 'locate: missing search pattern\nUsage: locate [OPTIONS] PATTERN'
    }
    
    // 递归搜索文件系统
    function searchFiles(dir, path = '') {
      for (const [name, item] of Object.entries(dir)) {
        const fullPath = path ? `${path}/${name}` : `/${name}`
        
        let matchName = options.basename ? name : fullPath
        let pattern = searchPattern
        
        if (options.ignoreCase) {
          matchName = matchName.toLowerCase()
          pattern = pattern.toLowerCase()
        }
        
        let matches = false
        if (options.regex) {
          try {
            const regex = new RegExp(pattern, options.ignoreCase ? 'i' : '')
            matches = regex.test(matchName)
          } catch (e) {
            return `locate: invalid regex pattern: ${searchPattern}`
          }
        } else {
          matches = matchName.includes(pattern)
        }
        
        if (matches) {
          files.push(fullPath)
        }
        
        // 如果是目录，递归搜索
        if (item.type === 'directory' && item.children) {
          const result = searchFiles(item.children, fullPath)
          if (typeof result === 'string') return result // 错误信息
        }
      }
    }
    
    const result = searchFiles(fileSystem)
    if (typeof result === 'string') return result
    
    if (options.count) {
      return files.length.toString()
    }
    
    if (options.limit && files.length > options.limit) {
      files.splice(options.limit)
    }
    
    return files.length > 0 ? files.join('\n') : `locate: no entries found for pattern: ${searchPattern}`
  }
}