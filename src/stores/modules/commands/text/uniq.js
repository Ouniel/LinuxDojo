/**
 * uniq - 报告或省略重复行
 */

export const uniq = {
  name: 'uniq',
  description: 'Report or omit repeated lines|报告或省略重复行',
  usage: 'uniq [OPTION]... [INPUT [OUTPUT]]',
  category: 'text',
  
  options: [
    // 输出控制组
    {
      flag: '-c',
      longFlag: '--count',
      description: '在行前显示出现次数',
      type: 'boolean',
      group: '输出控制'
    },
    {
      flag: '-d',
      longFlag: '--repeated',
      description: '只显示重复行',
      type: 'boolean',
      group: '输出控制'
    },
    {
      flag: '-u',
      longFlag: '--unique',
      description: '只显示唯一行（非重复行）',
      type: 'boolean',
      group: '输出控制'
    },
    
    // 比较选项组
    {
      flag: '-i',
      longFlag: '--ignore-case',
      description: '比较时忽略大小写',
      type: 'boolean',
      group: '比较选项'
    },
    {
      flag: '-f',
      longFlag: '--skip-fields',
      description: '比较时跳过前N个字段',
      type: 'input',
      inputKey: 'skip_fields',
      placeholder: '要跳过的字段数（如：1, 2）',
      group: '比较选项'
    },
    {
      flag: '-s',
      longFlag: '--skip-chars',
      description: '比较时跳过前N个字符',
      type: 'input',
      inputKey: 'skip_chars',
      placeholder: '要跳过的字符数（如：5, 10）',
      group: '比较选项'
    },
    {
      flag: '-w',
      longFlag: '--check-chars',
      description: '最多比较N个字符',
      type: 'input',
      inputKey: 'check_chars',
      placeholder: '要比较的字符数（如：10, 20）',
      group: '比较选项'
    },
    
    // 格式选项组
    {
      flag: '-z',
      longFlag: '--zero-terminated',
      description: '使用NUL字符作为行分隔符',
      type: 'boolean',
      group: '格式选项'
    },
    
    // 输入参数
    {
      inputKey: 'input_file',
      description: '输入文件',
      type: 'input',
      placeholder: '输入文件路径（默认为标准输入）'
    },
    {
      inputKey: 'output_file',
      description: '输出文件',
      type: 'input',
      placeholder: '输出文件路径（默认为标准输出）'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return uniq.help
    }

    const count = args.includes('-c') || args.includes('--count')
    const repeated = args.includes('-d') || args.includes('--repeated')
    const unique = args.includes('-u') || args.includes('--unique')
    const ignoreCase = args.includes('-i') || args.includes('--ignore-case')
    const skipFields = getOptionValue(args, '-f') || getOptionValue(args, '--skip-fields') || 0
    const skipChars = getOptionValue(args, '-s') || getOptionValue(args, '--skip-chars') || 0
    const checkChars = getOptionValue(args, '-w') || getOptionValue(args, '--check-chars')
    const zeroTerminated = args.includes('-z') || args.includes('--zero-terminated')
    
    // 获取输入和输出文件
    const files = args.filter(arg => 
      !arg.startsWith('-') && 
      !isOptionValue(arg, args)
    )

    let inputFile = '-'
    let outputFile = null

    if (files.length >= 1) {
      inputFile = files[0]
    }
    if (files.length >= 2) {
      outputFile = files[1]
    }

    // 读取输入
    let content
    if (inputFile === '-') {
      content = context.stdin || 'apple\napple\nbanana\nbanana\nbanana\ncherry\ncherry\ndate'
    } else {
      content = fs.getFileContent(inputFile)
      if (content === null) {
        throw new Error(`uniq: ${inputFile}: No such file or directory|文件或目录不存在`)
      }
    }

    const separator = zeroTerminated ? '\0' : '\n'
    const lines = content.split(separator).filter(line => line !== '' || zeroTerminated)
    
    if (lines.length === 0) {
      return ''
    }

    const results = []
    let currentLine = null
    let currentCount = 0
    let currentNormalized = null

    for (const line of lines) {
      const normalized = normalizeLine(line, {
        ignoreCase,
        skipFields: parseInt(skipFields),
        skipChars: parseInt(skipChars),
        checkChars: checkChars ? parseInt(checkChars) : null
      })

      if (currentNormalized === null || normalized !== currentNormalized) {
        // 处理前一组
        if (currentLine !== null) {
          processGroup(currentLine, currentCount, results, { count, repeated, unique })
        }
        
        // 开始新组
        currentLine = line
        currentCount = 1
        currentNormalized = normalized
      } else {
        // 同一组
        currentCount++
      }
    }

    // 处理最后一组
    if (currentLine !== null) {
      processGroup(currentLine, currentCount, results, { count, repeated, unique })
    }

    const output = results.join(separator)

    // 输出到文件
    if (outputFile) {
      fs.writeFile(outputFile, output)
      return ''
    }

    return output
  },
  requiresArgs: false,
  examples: [
    'uniq file.txt                   # Remove adjacent duplicate lines|移除相邻的重复行',
    'uniq -c file.txt                # Count occurrences of each line|统计每行出现次数',
    'uniq -d file.txt                # Show only duplicate lines|只显示重复行',
    'uniq -u file.txt                # Show only unique lines|只显示唯一行',
    'uniq -i file.txt                # Ignore case when comparing|比较时忽略大小写',
    'uniq -f 1 file.txt              # Skip first field when comparing|比较时跳过第一个字段',
    'uniq -s 5 file.txt              # Skip first 5 characters|跳过前5个字符',
    'sort file.txt | uniq            # Remove all duplicate lines|移除所有重复行'
  ],
  help: `Usage: uniq [OPTION]... [INPUT [OUTPUT]]
用法: uniq [选项]... [输入文件 [输出文件]]

Filter adjacent matching lines from INPUT (or standard input), writing to OUTPUT (or standard output).
过滤输入文件中相邻的重复行，输出到指定文件或标准输出。

With no options, matching lines are merged to the first occurrence.
如果没有选项，重复行将合并为第一次出现的行。

Options|选项:
  -c, --count           prefix lines by the number of occurrences|在行前显示出现次数
  -d, --repeated        only print duplicate lines, one for each group|只显示重复行
  -f, --skip-fields=N   avoid comparing the first N fields|比较时跳过前N个字段
  -i, --ignore-case     ignore differences in case when comparing|比较时忽略大小写
  -s, --skip-chars=N    avoid comparing the first N characters|比较时跳过前N个字符
  -u, --unique          only print unique lines|只显示唯一行
  -w, --check-chars=N   compare no more than N characters in lines|最多比较N个字符
      --help            display this help and exit|显示帮助信息并退出

Note|注意: 'uniq' does not detect repeated lines unless they are adjacent.
'uniq'只能检测相邻的重复行。
You may want to sort the input first, or use 'sort -u' without 'uniq'.
你可能需要先对输入排序，或者直接使用'sort -u'而不用'uniq'。

Examples|示例:
  uniq file.txt                    Remove adjacent duplicate lines|移除相邻重复行
  sort file.txt | uniq             Remove all duplicate lines|移除所有重复行
  uniq -c file.txt                 Count occurrences of each line|统计每行出现次数
  uniq -d file.txt                 Show only duplicate lines|只显示重复行
  uniq -u file.txt                 Show only unique lines|只显示唯一行
  uniq -f 1 file.txt               Skip first field when comparing|比较时跳过第一个字段
  uniq -s 5 file.txt               Skip first 5 characters when comparing|比较时跳过前5个字符`
}

// 标准化行用于比较
function normalizeLine(line, options) {
  let normalized = line
  
  // 跳过字段
  if (options.skipFields > 0) {
    const fields = line.split(/\s+/)
    if (fields.length > options.skipFields) {
      normalized = fields.slice(options.skipFields).join(' ')
    } else {
      normalized = ''
    }
  }
  
  // 跳过字符
  if (options.skipChars > 0) {
    normalized = normalized.substring(options.skipChars)
  }
  
  // 限制检查字符数
  if (options.checkChars !== null) {
    normalized = normalized.substring(0, options.checkChars)
  }
  
  // 忽略大小写
  if (options.ignoreCase) {
    normalized = normalized.toLowerCase()
  }
  
  return normalized
}

// 处理一组相同的行
function processGroup(line, count, results, options) {
  const { count: showCount, repeated, unique } = options
  
  // 根据选项决定是否输出
  let shouldOutput = true
  
  if (repeated && count === 1) {
    shouldOutput = false // 只显示重复行，但这行只出现一次
  }
  
  if (unique && count > 1) {
    shouldOutput = false // 只显示唯一行，但这行出现多次
  }
  
  if (shouldOutput) {
    if (showCount) {
      results.push(`${count.toString().padStart(7)} ${line}`)
    } else {
      results.push(line)
    }
  }
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
  return ['-f', '--skip-fields', '-s', '--skip-chars', '-w', '--check-chars'].includes(prevArg)
}