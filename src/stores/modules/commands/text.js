/**
 * 文本处理命令模块
 */

export const textCommands = {
  grep: {
    handler: (args, context, fs) => {
      if (args.length === 0) {
        throw new Error('grep: missing pattern\nTry \'grep --help\' for more information.')
      }

      const ignoreCase = args.includes('-i')
      const lineNumbers = args.includes('-n')
      const invertMatch = args.includes('-v')
      const wordMatch = args.includes('-w')
      const recursive = args.includes('-r') || args.includes('-R')
      const countOnly = args.includes('-c')
      const filesOnly = args.includes('-l')
      const quiet = args.includes('-q')
      const color = args.includes('--color') || args.includes('--color=always')
      
      let pattern = args.find(arg => !arg.startsWith('-'))
      if (!pattern) {
        throw new Error('grep: missing pattern\nTry \'grep --help\' for more information.')
      }
      
      const files = args.filter(arg => !arg.startsWith('-') && arg !== pattern)
      
      // 如果有stdin输入，处理stdin
      if (context.stdin && files.length === 0) {
        return processGrepContent(context.stdin, pattern, {
          ignoreCase, lineNumbers, invertMatch, wordMatch, countOnly, filesOnly, quiet, color
        }, '<stdin>')
      }
      
      if (files.length === 0) {
        throw new Error('grep: no files specified')
      }
      
      const results = []
      let totalMatches = 0
      
      for (const filename of files) {
        const content = fs.getFileContent(filename)
        if (content === null) {
          if (!quiet) {
            results.push(`grep: ${filename}: No such file or directory`)
          }
          continue
        }
        
        const result = processGrepContent(content, pattern, {
          ignoreCase, lineNumbers, invertMatch, wordMatch, countOnly, filesOnly, quiet, color
        }, filename, files.length > 1)
        
        if (result) {
          results.push(result)
          if (countOnly) {
            totalMatches += parseInt(result.split(':')[1] || result)
          }
        }
      }
      
      return results.join('\n')
    },
    description: 'Search text patterns in files|在文件中搜索文本模式',
    category: 'text',
    supportsPipe: true,
    examples: [
      'grep "pattern" file.txt',
      'grep -i "pattern" file.txt',
      'grep -n "pattern" file.txt',
      'grep -r "pattern" .',
      'cat file.txt | grep "pattern"'
    ]
  },

  wc: {
    handler: (args, context, fs) => {
      const lines = args.includes('-l')
      const words = args.includes('-w')
      const chars = args.includes('-c') || args.includes('-m')
      const bytes = args.includes('-c')
      
      // 如果没有指定选项，默认显示行数、单词数、字符数
      const showAll = !lines && !words && !chars && !bytes
      
      const files = args.filter(arg => !arg.startsWith('-'))
      
      // 如果有stdin输入，处理stdin
      if (context.stdin && files.length === 0) {
        const stats = getTextStats(context.stdin)
        return formatWcOutput(stats, showAll, lines, words, chars, '<stdin>')
      }
      
      if (files.length === 0) {
        throw new Error('wc: missing file operand\nTry \'wc --help\' for more information.')
      }
      
      const results = []
      let totalStats = { lines: 0, words: 0, chars: 0 }
      
      for (const filename of files) {
        const content = fs.getFileContent(filename)
        if (content === null) {
          results.push(`wc: ${filename}: No such file or directory`)
          continue
        }
        
        const stats = getTextStats(content)
        totalStats.lines += stats.lines
        totalStats.words += stats.words
        totalStats.chars += stats.chars
        
        results.push(formatWcOutput(stats, showAll, lines, words, chars, filename))
      }
      
      // 如果有多个文件，显示总计
      if (files.length > 1) {
        results.push(formatWcOutput(totalStats, showAll, lines, words, chars, 'total'))
      }
      
      return results.join('\n')
    },
    description: 'Count lines, words, and characters in files|统计文件的行数、单词数、字符数',
    category: 'text',
    supportsPipe: true,
    examples: [
      'wc file.txt',
      'wc -l file.txt',
      'wc -w file.txt',
      'wc -c file.txt',
      'cat file.txt | wc -l'
    ]
  },

  sort: {
    handler: (args, context, fs) => {
      const reverse = args.includes('-r')
      const numeric = args.includes('-n')
      const unique = args.includes('-u')
      const ignoreCase = args.includes('-f')
      const randomSort = args.includes('-R')
      
      const files = args.filter(arg => !arg.startsWith('-'))
      
      let content = ''
      
      // 如果有stdin输入，处理stdin
      if (context.stdin && files.length === 0) {
        content = context.stdin
      } else if (files.length > 0) {
        const fileContents = []
        for (const filename of files) {
          const fileContent = fs.getFileContent(filename)
          if (fileContent === null) {
            throw new Error(`sort: ${filename}: No such file or directory`)
          }
          fileContents.push(fileContent)
        }
        content = fileContents.join('\n')
      } else {
        throw new Error('sort: missing file operand\nTry \'sort --help\' for more information.')
      }
      
      let lines = content.split('\n').filter(line => line !== '' || content.endsWith('\n'))
      
      // 排序
      if (randomSort) {
        lines = shuffleArray([...lines])
      } else if (numeric) {
        lines.sort((a, b) => {
          const numA = parseFloat(a) || 0
          const numB = parseFloat(b) || 0
          return numA - numB
        })
      } else {
        lines.sort((a, b) => {
          const strA = ignoreCase ? a.toLowerCase() : a
          const strB = ignoreCase ? b.toLowerCase() : b
          return strA.localeCompare(strB)
        })
      }
      
      if (reverse) {
        lines.reverse()
      }
      
      // 去重
      if (unique) {
        lines = [...new Set(lines)]
      }
      
      return lines.join('\n')
    },
    description: 'Sort lines of text files|对文本行进行排序',
    category: 'text',
    supportsPipe: true,
    examples: [
      'sort file.txt',
      'sort -r file.txt',
      'sort -n numbers.txt',
      'sort -u file.txt',
      'cat file.txt | sort'
    ]
  },

  uniq: {
    handler: (args, context, fs) => {
      const countDuplicates = args.includes('-c')
      const duplicatesOnly = args.includes('-d')
      const uniqueOnly = args.includes('-u')
      const ignoreCase = args.includes('-i')
      
      const files = args.filter(arg => !arg.startsWith('-'))
      
      let content = ''
      
      // 如果有stdin输入，处理stdin
      if (context.stdin && files.length === 0) {
        content = context.stdin
      } else if (files.length > 0) {
        const filename = files[0]
        content = fs.getFileContent(filename)
        if (content === null) {
          throw new Error(`uniq: ${filename}: No such file or directory`)
        }
      } else {
        throw new Error('uniq: missing file operand\nTry \'uniq --help\' for more information.')
      }
      
      const lines = content.split('\n')
      const result = []
      const counts = new Map()
      
      // 统计连续重复行
      let currentLine = ''
      let currentCount = 0
      
      for (const line of lines) {
        const compareLine = ignoreCase ? line.toLowerCase() : line
        const compareCurrentLine = ignoreCase ? currentLine.toLowerCase() : currentLine
        
        if (compareLine === compareCurrentLine) {
          currentCount++
        } else {
          if (currentLine !== '') {
            counts.set(currentLine, currentCount)
          }
          currentLine = line
          currentCount = 1
        }
      }
      
      // 处理最后一行
      if (currentLine !== '') {
        counts.set(currentLine, currentCount)
      }
      
      // 生成输出
      for (const [line, count] of counts) {
        if (duplicatesOnly && count === 1) continue
        if (uniqueOnly && count > 1) continue
        
        if (countDuplicates) {
          result.push(`${count.toString().padStart(7)} ${line}`)
        } else {
          result.push(line)
        }
      }
      
      return result.join('\n')
    },
    description: 'Report or omit repeated lines|报告或删除重复行',
    category: 'text',
    supportsPipe: true,
    examples: [
      'uniq file.txt',
      'uniq -c file.txt',
      'uniq -d file.txt',
      'uniq -u file.txt',
      'sort file.txt | uniq'
    ]
  },

  head: {
    handler: (args, context, fs) => {
      let numLines = 10
      const files = []
      
      // 解析参数
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (arg === '-n' && i + 1 < args.length) {
          numLines = parseInt(args[i + 1])
          i++ // 跳过下一个参数
        } else if (arg.startsWith('-n')) {
          numLines = parseInt(arg.substring(2))
        } else if (arg.match(/^-\d+$/)) {
          numLines = parseInt(arg.substring(1))
        } else if (!arg.startsWith('-')) {
          files.push(arg)
        }
      }
      
      if (isNaN(numLines) || numLines < 0) {
        throw new Error('head: invalid number of lines')
      }
      
      // 如果有stdin输入，处理stdin
      if (context.stdin && files.length === 0) {
        const lines = context.stdin.split('\n')
        return lines.slice(0, numLines).join('\n')
      }
      
      if (files.length === 0) {
        throw new Error('head: missing file operand\nTry \'head --help\' for more information.')
      }
      
      const results = []
      
      for (let i = 0; i < files.length; i++) {
        const filename = files[i]
        const content = fs.getFileContent(filename)
        
        if (content === null) {
          results.push(`head: ${filename}: No such file or directory`)
          continue
        }
        
        const lines = content.split('\n')
        const output = lines.slice(0, numLines).join('\n')
        
        if (files.length > 1) {
          if (i > 0) results.push('')
          results.push(`==> ${filename} <==`)
          results.push(output)
        } else {
          results.push(output)
        }
      }
      
      return results.join('\n')
    },
    description: 'Display first lines of files|显示文件的前几行',
    category: 'text',
    supportsPipe: true,
    examples: [
      'head file.txt',
      'head -n 5 file.txt',
      'head -20 file.txt',
      'cat file.txt | head -n 3'
    ]
  },

  tail: {
    handler: (args, context, fs) => {
      let numLines = 10
      const files = []
      
      // 解析参数
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (arg === '-n' && i + 1 < args.length) {
          numLines = parseInt(args[i + 1])
          i++ // 跳过下一个参数
        } else if (arg.startsWith('-n')) {
          numLines = parseInt(arg.substring(2))
        } else if (arg.match(/^-\d+$/)) {
          numLines = parseInt(arg.substring(1))
        } else if (!arg.startsWith('-')) {
          files.push(arg)
        }
      }
      
      if (isNaN(numLines) || numLines < 0) {
        throw new Error('tail: invalid number of lines')
      }
      
      // 如果有stdin输入，处理stdin
      if (context.stdin && files.length === 0) {
        const lines = context.stdin.split('\n')
        return lines.slice(-numLines).join('\n')
      }
      
      if (files.length === 0) {
        throw new Error('tail: missing file operand\nTry \'tail --help\' for more information.')
      }
      
      const results = []
      
      for (let i = 0; i < files.length; i++) {
        const filename = files[i]
        const content = fs.getFileContent(filename)
        
        if (content === null) {
          results.push(`tail: ${filename}: No such file or directory`)
          continue
        }
        
        const lines = content.split('\n')
        const output = lines.slice(-numLines).join('\n')
        
        if (files.length > 1) {
          if (i > 0) results.push('')
          results.push(`==> ${filename} <==`)
          results.push(output)
        } else {
          results.push(output)
        }
      }
      
      return results.join('\n')
    },
    description: 'Display last lines of files|显示文件的后几行',
    category: 'text',
    supportsPipe: true,
    examples: [
      'tail file.txt',
      'tail -n 5 file.txt',
      'tail -20 file.txt',
      'cat file.txt | tail -n 3'
    ]
  },

  cut: {
    handler: (args, context, fs) => {
      let delimiter = '\t'
      let fields = []
      let characters = []
      let bytes = []
      
      const files = []
      
      // 解析参数
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (arg === '-d' && i + 1 < args.length) {
          delimiter = args[i + 1]
          i++
        } else if (arg === '-f' && i + 1 < args.length) {
          fields = parseRanges(args[i + 1])
          i++
        } else if (arg === '-c' && i + 1 < args.length) {
          characters = parseRanges(args[i + 1])
          i++
        } else if (arg === '-b' && i + 1 < args.length) {
          bytes = parseRanges(args[i + 1])
          i++
        } else if (!arg.startsWith('-')) {
          files.push(arg)
        }
      }
      
      if (fields.length === 0 && characters.length === 0 && bytes.length === 0) {
        throw new Error('cut: you must specify a list of bytes, characters, or fields\nTry \'cut --help\' for more information.')
      }
      
      let content = ''
      
      // 如果有stdin输入，处理stdin
      if (context.stdin && files.length === 0) {
        content = context.stdin
      } else if (files.length > 0) {
        const fileContents = []
        for (const filename of files) {
          const fileContent = fs.getFileContent(filename)
          if (fileContent === null) {
            throw new Error(`cut: ${filename}: No such file or directory`)
          }
          fileContents.push(fileContent)
        }
        content = fileContents.join('\n')
      } else {
        throw new Error('cut: missing file operand\nTry \'cut --help\' for more information.')
      }
      
      const lines = content.split('\n')
      const results = []
      
      for (const line of lines) {
        if (fields.length > 0) {
          const parts = line.split(delimiter)
          const selectedParts = fields.map(f => parts[f - 1] || '').filter(p => p !== '')
          results.push(selectedParts.join(delimiter))
        } else if (characters.length > 0) {
          const selectedChars = characters.map(c => line[c - 1] || '').join('')
          results.push(selectedChars)
        } else if (bytes.length > 0) {
          const selectedBytes = bytes.map(b => line[b - 1] || '').join('')
          results.push(selectedBytes)
        }
      }
      
      return results.join('\n')
    },
    description: 'Extract specified fields or characters from each line|从每行中提取指定的字段或字符',
    category: 'text',
    supportsPipe: true,
    examples: [
      'cut -f1,3 file.txt',
      'cut -d"," -f2 file.csv',
      'cut -c1-10 file.txt',
      'echo "hello world" | cut -d" " -f2'
    ]
  }
}

// 工具函数
function processGrepContent(content, pattern, options, filename, showFilename = false) {
  const { ignoreCase, lineNumbers, invertMatch, wordMatch, countOnly, filesOnly, quiet, color } = options
  
  let regex
  try {
    let flags = ignoreCase ? 'gi' : 'g'
    let regexPattern = pattern
    
    if (wordMatch) {
      regexPattern = `\\b${pattern}\\b`
    }
    
    regex = new RegExp(regexPattern, flags)
  } catch (e) {
    throw new Error(`grep: invalid regular expression: ${pattern}`)
  }
  
  const lines = content.split('\n')
  const matches = []
  let matchCount = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const hasMatch = regex.test(line)
    
    if ((hasMatch && !invertMatch) || (!hasMatch && invertMatch)) {
      matchCount++
      
      if (!countOnly && !filesOnly && !quiet) {
        let output = line
        
        if (color && hasMatch && !invertMatch) {
          output = line.replace(regex, '\x1b[31m$&\x1b[0m') // Red color
        }
        
        if (lineNumbers) {
          output = `${i + 1}:${output}`
        }
        
        if (showFilename) {
          output = `${filename}:${output}`
        }
        
        matches.push(output)
      }
    }
  }
  
  if (countOnly) {
    return showFilename ? `${filename}:${matchCount}` : matchCount.toString()
  }
  
  if (filesOnly && matchCount > 0) {
    return filename
  }
  
  if (quiet) {
    return matchCount > 0 ? '' : null
  }
  
  return matches.join('\n')
}

function getTextStats(content) {
  const lines = content.split('\n').length
  const words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length
  const chars = content.length
  
  return { lines, words, chars }
}

function formatWcOutput(stats, showAll, lines, words, chars, filename) {
  const parts = []
  
  if (showAll || lines) parts.push(stats.lines.toString().padStart(8))
  if (showAll || words) parts.push(stats.words.toString().padStart(8))
  if (showAll || chars) parts.push(stats.chars.toString().padStart(8))
  
  parts.push(filename)
  
  return parts.join(' ')
}

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function parseRanges(rangeStr) {
  const ranges = []
  const parts = rangeStr.split(',')
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(n => parseInt(n))
      for (let i = start; i <= end; i++) {
        ranges.push(i)
      }
    } else {
      ranges.push(parseInt(part))
    }
  }
  
  return ranges.filter(n => !isNaN(n))
}