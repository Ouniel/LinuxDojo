/**
 * csplit - 根据上下文分割文件
 */

export const csplit = {
  name: 'csplit',
  description: 'Split a file into sections determined by context lines|根据上下文行将文件分割成多个部分',
  usage: 'csplit [OPTION]... FILE PATTERN...',
  category: 'text',
  
  options: [
    // 输出选项组
    {
      flag: '-f',
      longFlag: '--prefix',
      description: '输出文件的前缀名',
      type: 'input',
      inputKey: 'prefix',
      placeholder: '前缀名（默认：xx）',
      group: '输出选项'
    },
    {
      flag: '-n',
      longFlag: '--digits',
      description: '输出文件名中数字的位数',
      type: 'input',
      inputKey: 'digits',
      placeholder: '位数（默认：2）',
      group: '输出选项'
    },
    {
      flag: '-b',
      longFlag: '--suffix-format',
      description: '输出文件名的后缀格式',
      type: 'input',
      inputKey: 'suffix_format',
      placeholder: '格式（如：%02d.txt）',
      group: '输出选项'
    },
    
    // 处理选项组
    {
      flag: '-k',
      longFlag: '--keep-files',
      description: '出错时保留输出文件',
      type: 'boolean',
      group: '处理选项'
    },
    {
      flag: '-s',
      longFlag: '--quiet',
      description: '不输出文件大小信息',
      type: 'boolean',
      group: '处理选项'
    },
    {
      flag: '-z',
      longFlag: '--elide-empty-files',
      description: '删除空的输出文件',
      type: 'boolean',
      group: '处理选项'
    },
    
    // 模式选项组
    {
      longFlag: '--suppress-matched',
      description: '不在输出文件中包含匹配的行',
      type: 'boolean',
      group: '模式选项'
    },
    
    // 输入参数
    {
      inputKey: 'file',
      description: '要分割的文件',
      type: 'input',
      placeholder: '文件路径（使用 - 表示标准输入）'
    },
    {
      inputKey: 'patterns',
      description: '分割模式',
      type: 'input',
      placeholder: '模式（如：/pattern/ 或 行号）'
    }
  ],

  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return csplit.help
    }

    if (args.length < 2) {
      throw new Error('csplit: missing operand after \'csplit\'|缺少 \'csplit\' 后的操作数\ncsplit: Try \'csplit --help\' for more information.|尝试 \'csplit --help\' 获取更多信息')
    }

    // 解析选项
    let prefix = 'xx'
    let digits = 2
    let suffixFormat = null
    let keepFiles = args.includes('-k') || args.includes('--keep-files')
    let quiet = args.includes('-s') || args.includes('--quiet')
    let elideEmpty = args.includes('-z') || args.includes('--elide-empty-files')
    let suppressMatched = args.includes('--suppress-matched')
    
    // 解析选项值
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if ((arg === '-f' || arg === '--prefix') && i + 1 < args.length) {
        prefix = args[i + 1]
        i++
      } else if ((arg === '-n' || arg === '--digits') && i + 1 < args.length) {
        digits = parseInt(args[i + 1]) || 2
        i++
      } else if ((arg === '-b' || arg === '--suffix-format') && i + 1 < args.length) {
        suffixFormat = args[i + 1]
        i++
      }
    }
    
    // 获取文件名和模式
    const nonOptionArgs = args.filter(arg => 
      !arg.startsWith('-') && 
      !isOptionValue(arg, args)
    )
    
    if (nonOptionArgs.length < 2) {
      throw new Error('csplit: missing operand|缺少操作数\nTry \'csplit --help\' for more information.|尝试 \'csplit --help\' 获取更多信息')
    }

    const fileName = nonOptionArgs[0]
    const patterns = nonOptionArgs.slice(1)
    
    // 读取文件内容
    let content
    if (fileName === '-') {
      content = context.stdin || `Line 1: Header
Line 2: Content A
Line 3: Content A continued
Line 4: SECTION_BREAK
Line 5: Content B
Line 6: Content B continued
Line 7: SECTION_BREAK
Line 8: Content C
Line 9: Content C continued
Line 10: End`
    } else {
      content = fs.getFileContent(fileName)
      if (content === null) {
        throw new Error(`csplit: ${fileName}: No such file or directory|文件或目录不存在`)
      }
    }
    
    const lines = content.split('\n')
    if (lines.length === 0) {
      return ''
    }
    
    // 解析模式
    const splitPoints = []
    let currentLine = 0
    
    for (const pattern of patterns) {
      const trimmed = pattern.trim()
      
      if (/^\d+$/.test(trimmed)) {
        // 行号模式
        const lineNum = parseInt(trimmed)
        if (lineNum > currentLine && lineNum <= lines.length) {
          splitPoints.push({ line: lineNum - 1, type: 'line' })
          currentLine = lineNum - 1
        }
      } else if (trimmed.startsWith('/') && trimmed.endsWith('/')) {
        // 正则表达式模式
        const regex = new RegExp(trimmed.slice(1, -1))
        for (let i = currentLine; i < lines.length; i++) {
          if (regex.test(lines[i])) {
            splitPoints.push({ line: i, type: 'regex', pattern: regex, matched: lines[i] })
            currentLine = i + 1
            break
          }
        }
      } else if (trimmed.startsWith('%') && trimmed.endsWith('%')) {
        // 跳过模式（不分割，但跳过到匹配行）
        const regex = new RegExp(trimmed.slice(1, -1))
        for (let i = currentLine; i < lines.length; i++) {
          if (regex.test(lines[i])) {
            currentLine = i + 1
            break
          }
        }
      } else if (trimmed.includes('*')) {
        // 重复模式
        const [basePattern, repeatStr] = trimmed.split('*')
        const repeat = parseInt(repeatStr) || 1
        
        if (basePattern.startsWith('/') && basePattern.endsWith('/')) {
          const regex = new RegExp(basePattern.slice(1, -1))
          for (let r = 0; r < repeat && currentLine < lines.length; r++) {
            for (let i = currentLine; i < lines.length; i++) {
              if (regex.test(lines[i])) {
                splitPoints.push({ line: i, type: 'regex', pattern: regex, matched: lines[i] })
                currentLine = i + 1
                break
              }
            }
          }
        }
      } else {
        // 字符串匹配模式
        for (let i = currentLine; i < lines.length; i++) {
          if (lines[i].includes(trimmed)) {
            splitPoints.push({ line: i, type: 'string', pattern: trimmed, matched: lines[i] })
            currentLine = i + 1
            break
          }
        }
      }
    }
    
    // 添加文件结尾作为最后一个分割点
    if (splitPoints.length === 0 || splitPoints[splitPoints.length - 1].line < lines.length - 1) {
      splitPoints.push({ line: lines.length, type: 'end' })
    }
    
    // 生成输出文件
    const outputFiles = []
    let startLine = 0
    let fileIndex = 0
    
    for (const splitPoint of splitPoints) {
      const endLine = splitPoint.line
      
      if (startLine < endLine) {
        let sectionLines = lines.slice(startLine, endLine)
        
        // 如果不抑制匹配行，且当前分割点有匹配行，则包含它
        if (!suppressMatched && splitPoint.matched !== undefined) {
          sectionLines.push(splitPoint.matched)
        }
        
        const sectionContent = sectionLines.join('\n')
        
        // 生成文件名
        let fileName
        if (suffixFormat) {
          fileName = prefix + suffixFormat.replace(/%0?(\d*)d/, (match, width) => {
            const w = parseInt(width) || digits
            return fileIndex.toString().padStart(w, '0')
          })
        } else {
          fileName = prefix + fileIndex.toString().padStart(digits, '0')
        }
        
        // 检查是否应该删除空文件
        if (!elideEmpty || sectionContent.trim().length > 0) {
          outputFiles.push({
            name: fileName,
            content: sectionContent,
            size: sectionContent.length
          })
        }
        
        fileIndex++
      }
      
      startLine = splitPoint.line
      if (splitPoint.type !== 'end' && !suppressMatched) {
        startLine++ // 跳过匹配行（如果不抑制的话，它已经被包含在上一个文件中）
      }
    }
    
    // 生成输出
    const results = []
    let totalBytes = 0
    
    for (const file of outputFiles) {
      // 模拟写入文件（在实际实现中，这里会写入文件系统）
      if (!quiet) {
        results.push(`${file.size}`)
      }
      totalBytes += file.size
      
      // 在演示中，我们显示文件内容而不是实际创建文件
      results.push(`--- ${file.name} ---`)
      results.push(file.content)
      results.push('')
    }
    
    if (!quiet && outputFiles.length > 1) {
      results.push(`Total: ${totalBytes} bytes in ${outputFiles.length} files|总计: ${totalBytes} 字节，${outputFiles.length} 个文件`)
    }
    
    return results.join('\n').trim()
  },
  requiresArgs: false,
  examples: [
    'csplit file.txt 10                    # Split at line 10|在第10行分割',
    'csplit file.txt /pattern/             # Split at lines matching pattern|在匹配模式的行分割',
    'csplit file.txt 10 20 30              # Split at multiple line numbers|在多个行号分割',
    'csplit file.txt /start/ /end/         # Split between patterns|在模式之间分割',
    'csplit -f part file.txt /section/     # Use "part" as filename prefix|使用"part"作为文件名前缀',
    'csplit -n 3 file.txt /pattern/        # Use 3 digits in filename|文件名使用3位数字',
    'csplit -s file.txt /pattern/          # Suppress size output|抑制大小输出',
    'csplit -z file.txt /pattern/          # Remove empty output files|删除空的输出文件'
  ],
  help: `Usage: csplit [OPTION]... FILE PATTERN...
用法: csplit [选项]... 文件 模式...

Output pieces of FILE separated by PATTERN(s) to files 'xx00', 'xx01', ...,
and output byte counts of each piece to standard output.
将由模式分隔的文件片段输出到文件'xx00'、'xx01'...，
并将每个片段的字节数输出到标准输出。

Output file options|输出文件选项:
  -f, --prefix=PREFIX   use PREFIX instead of 'xx'|使用前缀而不是'xx'
  -n, --digits=DIGITS   use specified number of digits instead of 2|使用指定的数字位数而不是2
  -b, --suffix-format=FORMAT  use sprintf FORMAT instead of %02d|使用sprintf格式而不是%02d

Processing options|处理选项:
  -k, --keep-files      do not remove output files on errors|出错时不删除输出文件
  -s, --quiet, --silent do not print counts of output file sizes|不打印输出文件大小的计数
  -z, --elide-empty-files  remove empty output files|删除空的输出文件

Pattern options|模式选项:
      --suppress-matched  suppress the lines matching PATTERN|抑制匹配模式的行
      --help              display this help and exit|显示此帮助信息并退出

Each PATTERN may be:
每个模式可以是:

  INTEGER             copy up to but not including specified line number|复制到但不包括指定行号
  /REGEXP/[OFFSET]    copy up to but not including a matching line|复制到但不包括匹配行
  %REGEXP%[OFFSET]    skip to, but not including a matching line|跳过到但不包括匹配行
  {INTEGER}           repeat the previous pattern specified number of times|重复前一个模式指定次数
  {*}                 repeat the previous pattern as many times as possible|尽可能多次重复前一个模式

A line OFFSET is a required '+' or '-' followed by a positive integer.
行偏移是必需的'+'或'-'后跟正整数。

Examples|示例:
  csplit file.txt 10                    Split at line 10|在第10行分割
  csplit file.txt /pattern/             Split at lines matching pattern|在匹配模式的行分割
  csplit file.txt 10 20 30              Split at multiple line numbers|在多个行号分割
  csplit file.txt /start/ /end/         Split between patterns|在模式之间分割
  csplit -f part file.txt /section/     Use "part" as filename prefix|使用"part"作为文件名前缀
  csplit -n 3 file.txt /pattern/        Use 3 digits in filename|文件名使用3位数字
  csplit -s file.txt /pattern/          Suppress size output|抑制大小输出
  csplit -z file.txt /pattern/          Remove empty output files|删除空的输出文件`
}

// 检查参数是否是选项值
function isOptionValue(arg, args) {
  const index = args.indexOf(arg)
  if (index === 0) return false
  
  const prevArg = args[index - 1]
  return ['-f', '--prefix', '-n', '--digits', '-b', '--suffix-format'].includes(prevArg)
}