import { formatHelp } from '../utils/helpFormatter.js'

export const egrep = {
  name: 'egrep',
  description: 'Search text using extended regular expressions|使用扩展正则表达式搜索文本',
  
  options: [
    // 匹配选项组
    {
      flag: '-i',
      longFlag: '--ignore-case',
      description: '忽略大小写区别',
      type: 'boolean',
      group: '匹配选项'
    },
    {
      flag: '-v',
      longFlag: '--invert-match',
      description: '反向匹配（显示不匹配的行）',
      type: 'boolean',
      group: '匹配选项'
    },
    {
      flag: '-x',
      longFlag: '--line-regexp',
      description: '匹配整行',
      type: 'boolean',
      group: '匹配选项'
    },
    {
      flag: '-w',
      longFlag: '--word-regexp',
      description: '匹配整个单词',
      type: 'boolean',
      group: '匹配选项'
    },
    
    // 输出选项组
    {
      flag: '-n',
      longFlag: '--line-number',
      description: '显示行号',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '-c',
      longFlag: '--count',
      description: '只显示匹配行的数量',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '-l',
      longFlag: '--files-with-matches',
      description: '只显示包含匹配的文件名',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '-L',
      longFlag: '--files-without-match',
      description: '只显示不包含匹配的文件名',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '-q',
      longFlag: '--quiet',
      description: '静默模式（不输出内容）',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '--color',
      description: '高亮显示匹配的文本',
      type: 'boolean',
      group: '输出选项'
    },
    
    // 搜索选项组
    {
      flag: '-r',
      longFlag: '--recursive',
      description: '递归搜索目录',
      type: 'boolean',
      group: '搜索选项'
    },
    {
      flag: '-A',
      longFlag: '--after-context',
      description: '显示匹配行后的指定行数',
      type: 'input',
      inputKey: 'after_lines',
      placeholder: '行数（如 3）',
      group: '搜索选项'
    },
    {
      flag: '-B',
      longFlag: '--before-context',
      description: '显示匹配行前的指定行数',
      type: 'input',
      inputKey: 'before_lines',
      placeholder: '行数（如 3）',
      group: '搜索选项'
    },
    {
      flag: '-C',
      longFlag: '--context',
      description: '显示匹配行前后的指定行数',
      type: 'input',
      inputKey: 'context_lines',
      placeholder: '行数（如 3）',
      group: '搜索选项'
    },
    
    // 输入参数
    {
      inputKey: 'search_pattern',
      description: '扩展正则表达式搜索模式',
      type: 'input',
      placeholder: '正则表达式（如 "^[0-9]+" 或 "error|warning"）',
      required: true
    },
    {
      inputKey: 'target_files',
      description: '要搜索的文件',
      type: 'input',
      placeholder: '文件路径（支持多个文件，用空格分隔）',
      required: true
    }
  ],
  
  handler(args, context, fs) {
    const { currentPath } = context
    const fileSystem = fs.fileSystem || fs
    
    // 简化的路径解析函数
    const resolvePath = (filename, basePath) => {
      const pathParts = basePath.split('/').filter(part => part !== '')
      let current = fileSystem['/']
      
      for (const part of pathParts) {
        if (current.children && current.children[part]) {
          current = current.children[part]
        } else {
          return { item: null }
        }
      }
      
      if (current.children && current.children[filename]) {
        return { item: current.children[filename] }
      }
      
      return { item: null }
    }
    if (args.length === 0) {
      return formatHelp({
        name: 'egrep',
        description: 'Search text using extended regular expressions|使用扩展正则表达式搜索文本',
        usage: 'egrep [OPTIONS] PATTERN [FILE...]|egrep [选项] 模式 [文件...]',
        options: [
          '-i, --ignore-case        Ignore case distinctions|忽略大小写',
          '-n, --line-number        Print line numbers|打印行号',
          '-c, --count              Print count of matching lines|打印匹配行数',
          '-v, --invert-match       Invert match|反向匹配',
          '-x, --line-regexp        Match whole line|匹配整行',
          '-w, --word-regexp        Match whole words|匹配整词',
          '-r, --recursive          Search recursively|递归搜索',
          '-l, --files-with-matches Print filenames with matches|打印有匹配的文件名',
          '-L, --files-without-match Print filenames without matches|打印无匹配的文件名',
          '-q, --quiet              Suppress output|静默模式',
          '-A, --after-context=NUM  Print NUM lines after matches|打印匹配后NUM行',
          '-B, --before-context=NUM Print NUM lines before matches|打印匹配前NUM行',
          '-C, --context=NUM        Print NUM lines around matches|打印匹配前后NUM行',
          '--color                  Highlight matches|高亮匹配'
        ],
        examples: [
          'egrep "^[0-9]+" file.txt|匹配以数字开头的行',
          'egrep -i "error|warning" log.txt|忽略大小写匹配错误或警告',
          'egrep -n "function.*\\(" code.js|显示行号匹配函数定义',
          'egrep -C 2 "pattern" file.txt|显示匹配行前后2行',
          'egrep -r "TODO" src/|递归搜索目录中的TODO'
        ]
      })
    }
    
    const options = {
      ignoreCase: false,
      lineNumber: false,
      count: false,
      invert: false,
      wholeLine: false,
      wholeWord: false,
      recursive: false,
      filesWithMatches: false,
      filesWithoutMatches: false,
      quiet: false,
      color: false,
      afterContext: 0,
      beforeContext: 0,
      context: 0
    }
    
    let pattern = ''
    const files = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-i' || arg === '--ignore-case') {
        options.ignoreCase = true
      } else if (arg === '-n' || arg === '--line-number') {
        options.lineNumber = true
      } else if (arg === '-c' || arg === '--count') {
        options.count = true
      } else if (arg === '-v' || arg === '--invert-match') {
        options.invert = true
      } else if (arg === '-x' || arg === '--line-regexp') {
        options.wholeLine = true
      } else if (arg === '-w' || arg === '--word-regexp') {
        options.wholeWord = true
      } else if (arg === '-r' || arg === '--recursive') {
        options.recursive = true
      } else if (arg === '-l' || arg === '--files-with-matches') {
        options.filesWithMatches = true
      } else if (arg === '-L' || arg === '--files-without-match') {
        options.filesWithoutMatches = true
      } else if (arg === '-q' || arg === '--quiet') {
        options.quiet = true
      } else if (arg === '--color') {
        options.color = true
      } else if (arg === '-A' || arg === '--after-context') {
        if (i + 1 < args.length) {
          options.afterContext = parseInt(args[++i]) || 0
        }
      } else if (arg === '-B' || arg === '--before-context') {
        if (i + 1 < args.length) {
          options.beforeContext = parseInt(args[++i]) || 0
        }
      } else if (arg === '-C' || arg === '--context') {
        if (i + 1 < args.length) {
          const contextLines = parseInt(args[++i]) || 0
          options.afterContext = contextLines
          options.beforeContext = contextLines
        }
      } else if (arg.startsWith('-')) {
        return `egrep: invalid option: ${arg}`
      } else {
        if (!pattern) {
          pattern = arg
        } else {
          files.push(arg)
        }
      }
    }
    
    if (!pattern) {
      return 'egrep: missing pattern\nUsage: egrep [OPTIONS] PATTERN [FILE...]'
    }
    
    // 如果没有指定文件，使用示例文件
    if (files.length === 0) {
      files.push('sample.txt')
    }
    
    let regex
    try {
      let regexPattern = pattern
      
      if (options.wholeLine) {
        regexPattern = `^${regexPattern}$`
      }
      if (options.wholeWord) {
        regexPattern = `\\b${regexPattern}\\b`
      }
      
      const flags = options.ignoreCase ? 'gi' : 'g'
      regex = new RegExp(regexPattern, flags)
    } catch (e) {
      return `egrep: invalid regular expression: ${pattern}`
    }
    
    const results = []
    let totalMatches = 0
    
    for (const filename of files) {
      // 模拟文件内容
      const content = getMockFileContent(filename)
      
      if (!content) {
        if (!options.quiet) {
          results.push(`egrep: ${filename}: No such file or directory`)
        }
        continue
      }
      
      const lines = content.split('\n')
      const matches = []
      let matchCount = 0
      const matchedLines = new Set()
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const isMatch = regex.test(line)
        
        if (options.invert ? !isMatch : isMatch) {
          matchCount++
          matchedLines.add(i)
          
          if (!options.count && !options.filesWithMatches && !options.filesWithoutMatches && !options.quiet) {
            // 添加上下文行
            const contextStart = Math.max(0, i - options.beforeContext)
            const contextEnd = Math.min(lines.length - 1, i + options.afterContext)
            
            for (let j = contextStart; j <= contextEnd; j++) {
              let output = lines[j]
              let prefix = ''
              
              if (files.length > 1) {
                prefix = `${filename}:`
              }
              
              if (options.lineNumber) {
                prefix += `${j + 1}:`
              }
              
              if (j === i) {
                // 匹配行
                output = prefix + output
              } else {
                // 上下文行
                output = prefix.replace(':', '-') + output
              }
              
              matches.push(output)
            }
            
            if (options.afterContext > 0 || options.beforeContext > 0) {
              matches.push('--')
            }
          }
        }
        
        // 重置正则表达式的lastIndex
        regex.lastIndex = 0
      }
      
      totalMatches += matchCount
      
      if (options.count) {
        let output = matchCount.toString()
        if (files.length > 1) {
          output = `${filename}:${output}`
        }
        results.push(output)
      } else if (options.filesWithMatches && matchCount > 0) {
        results.push(filename)
      } else if (options.filesWithoutMatches && matchCount === 0) {
        results.push(filename)
      } else if (!options.quiet && !options.filesWithMatches && !options.filesWithoutMatches) {
        results.push(...matches)
      }
    }
    
    if (options.quiet) {
      return totalMatches > 0 ? '' : 'No matches found'
    }
    
    return results.length > 0 ? results.join('\n') : 'No matches found'
  }
}

function getMockFileContent(filename) {
  // 模拟文件内容
  const mockFiles = {
    'sample.txt': `This is line 1
This is line 2 with ERROR message
Line 3 contains warning information
Line 4 has some data: 12345
Another line with numbers 67890
Final line of the sample file`,
    
    'log.txt': `2023-01-01 10:00:00 INFO: Application started
2023-01-01 10:01:00 ERROR: Database connection failed
2023-01-01 10:02:00 WARNING: Retrying connection
2023-01-01 10:03:00 INFO: Connection established
2023-01-01 10:04:00 ERROR: Query timeout
2023-01-01 10:05:00 INFO: Application running normally`,
    
    'code.js': `function calculateSum(a, b) {
  return a + b;
}

function processData(data) {
  // TODO: implement data processing
  return data.map(item => item * 2);
}

const result = calculateSum(10, 20);
console.log('Result:', result);`,
    
    'data.txt': `apple
banana
cherry
date
elderberry
fig
grape
honeydew`
  }
  
  return mockFiles[filename] || mockFiles['sample.txt']
}