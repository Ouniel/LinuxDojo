/**
 * wc - 统计文件的行数、单词数和字符数
 */

export const wc = {
  name: 'wc',
  description: 'Print newline, word, and byte counts for each file|统计文件的行数、单词数和字符数',
  usage: 'wc [OPTION]... [FILE]...',
  category: 'text',
  
  options: [
    // 统计选项组
    {
      flag: '-l',
      longFlag: '--lines',
      description: '只显示行数',
      type: 'boolean',
      group: '统计选项'
    },
    {
      flag: '-w',
      longFlag: '--words',
      description: '只显示单词数',
      type: 'boolean',
      group: '统计选项'
    },
    {
      flag: '-c',
      longFlag: '--bytes',
      description: '只显示字节数',
      type: 'boolean',
      group: '统计选项'
    },
    {
      flag: '-m',
      longFlag: '--chars',
      description: '只显示字符数',
      type: 'boolean',
      group: '统计选项'
    },
    {
      flag: '-L',
      longFlag: '--max-line-length',
      description: '显示最大行长度',
      type: 'boolean',
      group: '统计选项'
    },
    
    // 输入选项组
    {
      longFlag: '--files0-from',
      description: '从指定文件读取以NUL分隔的文件名',
      type: 'input',
      inputKey: 'files0_from',
      placeholder: '文件名或-（标准输入）',
      group: '输入选项'
    },
    
    // 输入参数
    {
      inputKey: 'files',
      description: '要统计的文件',
      type: 'input',
      placeholder: '文件路径（支持多个文件，用空格分隔）'
    }
  ],
  
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return wc.help
    }

    const lines = args.includes('-l') || args.includes('--lines')
    const words = args.includes('-w') || args.includes('--words')
    const chars = args.includes('-c') || args.includes('--bytes')
    const characters = args.includes('-m') || args.includes('--chars')
    const maxLineLength = args.includes('-L') || args.includes('--max-line-length')
    const files0From = getOptionValue(args, '--files0-from')
    
    // 如果没有指定任何计数选项，默认显示行数、单词数和字符数
    const showAll = !lines && !words && !chars && !characters && !maxLineLength
    
    // 获取输入文件
    let files = args.filter(arg => 
      !arg.startsWith('-') && 
      !isOptionValue(arg, args)
    )

    // 处理 --files0-from 选项
    if (files0From) {
      let fileListContent
      if (files0From === '-') {
        fileListContent = context.stdin || ''
      } else {
        fileListContent = fs.getFileContent(files0From)
        if (fileListContent === null) {
          throw new Error(`wc: ${files0From}: No such file or directory|文件或目录不存在`)
        }
      }
      files = fileListContent.split('\0').filter(f => f !== '')
    }

    // 如果没有指定文件，从标准输入读取
    if (files.length === 0) {
      files.push('-')
    }

    const results = []
    let totalLines = 0
    let totalWords = 0
    let totalChars = 0
    let totalBytes = 0
    let totalMaxLength = 0

    for (const file of files) {
      let content
      let filename = file

      if (file === '-') {
        content = context.stdin || 'Hello world\nThis is a test file\nWith multiple lines\nAnd various words'
        filename = ''
      } else {
        content = fs.getFileContent(file)
        if (content === null) {
          results.push(`wc: ${file}: No such file or directory|文件或目录不存在`)
          continue
        }
      }

      // 计算统计信息
      const stats = calculateStats(content)
      
      // 累计总数
      totalLines += stats.lines
      totalWords += stats.words
      totalChars += stats.characters
      totalBytes += stats.bytes
      totalMaxLength = Math.max(totalMaxLength, stats.maxLineLength)

      // 格式化输出
      const output = formatOutput(stats, {
        lines: showAll || lines,
        words: showAll || words,
        chars: chars,
        characters: characters,
        maxLineLength
      })

      if (filename) {
        results.push(`${output} ${filename}`)
      } else {
        results.push(output)
      }
    }

    // 如果有多个文件，显示总计
    if (files.length > 1 && !files.includes('-')) {
      const totalStats = {
        lines: totalLines,
        words: totalWords,
        characters: totalChars,
        bytes: totalBytes,
        maxLineLength: totalMaxLength
      }

      const totalOutput = formatOutput(totalStats, {
        lines: showAll || lines,
        words: showAll || words,
        chars: chars,
        characters: characters,
        maxLineLength
      })

      results.push(`${totalOutput} total`)
    }

    return results.join('\n')
  },
  requiresArgs: false,
  examples: [
    'wc file.txt                     # Count lines, words, and bytes|统计行数、单词数和字节数',
    'wc -l file.txt                  # Count only lines|只统计行数',
    'wc -w file.txt                  # Count only words|只统计单词数',
    'wc -c file.txt                  # Count only bytes|只统计字节数',
    'wc -m file.txt                  # Count only characters|只统计字符数',
    'wc -L file.txt                  # Show maximum line length|显示最大行长度',
    'wc file1.txt file2.txt          # Count for multiple files with total|统计多个文件并显示总计',
    'cat file.txt | wc               # Count from standard input|从标准输入统计'
  ],
  help: `Usage: wc [OPTION]... [FILE]...
用法: wc [选项]... [文件]...

Print newline, word, and byte counts for each FILE, and a total line if more than one FILE is specified.
打印每个文件的行数、单词数和字节数，如果指定了多个文件则显示总计。

A word is a non-zero-length sequence of characters delimited by white space.
单词是由空白字符分隔的非零长度字符序列。

With no FILE, or when FILE is -, read standard input.
如果没有文件或文件为-，则从标准输入读取。

Options|选项:
  -c, --bytes            print the byte counts|显示字节数
  -m, --chars            print the character counts|显示字符数
  -l, --lines            print the newline counts|显示行数
  -L, --max-line-length  print the maximum display width|显示最大行长度
  -w, --words            print the word counts|显示单词数
      --files0-from=F    read input from the files specified by NUL-terminated names|从指定文件读取以NUL分隔的文件名
      --help             display this help and exit|显示帮助信息并退出

Examples|示例:
  wc file.txt                      Count lines, words, and bytes|统计行数、单词数和字节数
  wc -l file.txt                   Count only lines|只统计行数
  wc -w file.txt                   Count only words|只统计单词数
  wc -c file.txt                   Count only bytes|只统计字节数
  wc -m file.txt                   Count only characters|只统计字符数
  wc -L file.txt                   Show maximum line length|显示最大行长度
  wc file1.txt file2.txt           Count for multiple files with total|统计多个文件并显示总计
  echo "hello world" | wc          Count from standard input|从标准输入统计`
}

// 计算统计信息
function calculateStats(content) {
  const lines = content.split('\n')
  const lineCount = content === '' ? 0 : lines.length
  
  // 计算单词数
  const words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length
  
  // 计算字符数和字节数
  const characters = content.length
  const bytes = new Blob([content]).size // 更准确的字节计算
  
  // 计算最大行长度
  const maxLineLength = lines.reduce((max, line) => Math.max(max, line.length), 0)
  
  return {
    lines: lineCount,
    words,
    characters,
    bytes,
    maxLineLength
  }
}

// 格式化输出
function formatOutput(stats, options) {
  const parts = []
  
  if (options.lines) {
    parts.push(stats.lines.toString().padStart(8))
  }
  
  if (options.words) {
    parts.push(stats.words.toString().padStart(8))
  }
  
  if (options.chars) {
    parts.push(stats.bytes.toString().padStart(8))
  }
  
  if (options.characters) {
    parts.push(stats.characters.toString().padStart(8))
  }
  
  if (options.maxLineLength) {
    parts.push(stats.maxLineLength.toString().padStart(8))
  }
  
  return parts.join('')
}

// 获取选项值
function getOptionValue(args, option) {
  const index = args.indexOf(option)
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1]
  }
  
  // 检查长选项格式 --option=value
  for (const arg of args) {
    if (arg.startsWith(option + '=')) {
      return arg.substring(option.length + 1)
    }
  }
  
  return null
}

// 检查参数是否是选项值
function isOptionValue(arg, args) {
  const index = args.indexOf(arg)
  if (index === 0) return false
  
  const prevArg = args[index - 1]
  return prevArg === '--files0-from'
}