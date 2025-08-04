/**
 * grep - 搜索文本模式
 */

export const grep = {
  options: [
    // 搜索模式组
    {
      inputKey: 'search_pattern',
      description: '要搜索的模式（支持正则表达式）',
      type: 'input',
      placeholder: '搜索模式（如 "hello", "^start", "end$"）',
      required: true
    },
    {
      inputKey: 'target_files',
      description: '要搜索的文件或目录',
      type: 'input',
      placeholder: '文件路径（如 file.txt, *.log, /path/to/dir）',
      required: false
    },
    
    // 匹配选项组
    {
      flag: '-i',
      longFlag: '--ignore-case',
      description: '忽略大小写进行匹配',
      type: 'boolean',
      group: '匹配选项'
    },
    {
      flag: '-v',
      longFlag: '--invert-match',
      description: '反向匹配，显示不包含模式的行',
      type: 'boolean',
      group: '匹配选项'
    },
    {
      flag: '-w',
      longFlag: '--word-regexp',
      description: '只匹配完整的单词',
      type: 'boolean',
      group: '匹配选项'
    },
    {
      flag: '-x',
      longFlag: '--line-regexp',
      description: '只匹配完整的行',
      type: 'boolean',
      group: '匹配选项'
    },
    {
      flag: '-F',
      longFlag: '--fixed-strings',
      description: '将模式视为固定字符串而非正则表达式',
      type: 'boolean',
      group: '匹配选项'
    },
    {
      flag: '-E',
      longFlag: '--extended-regexp',
      description: '使用扩展正则表达式',
      type: 'boolean',
      group: '匹配选项'
    },
    
    // 输出控制组
    {
      flag: '-n',
      longFlag: '--line-number',
      description: '显示匹配行的行号',
      type: 'boolean',
      group: '输出控制'
    },
    {
      flag: '-c',
      longFlag: '--count',
      description: '只显示匹配行的数量',
      type: 'boolean',
      group: '输出控制'
    },
    {
      flag: '-l',
      longFlag: '--files-with-matches',
      description: '只显示包含匹配的文件名',
      type: 'boolean',
      group: '输出控制'
    },
    {
      flag: '-L',
      longFlag: '--files-without-match',
      description: '只显示不包含匹配的文件名',
      type: 'boolean',
      group: '输出控制'
    },
    {
      flag: '-o',
      longFlag: '--only-matching',
      description: '只显示匹配的部分',
      type: 'boolean',
      group: '输出控制'
    },
    {
      flag: '-q',
      longFlag: '--quiet',
      description: '静默模式，不输出任何内容',
      type: 'boolean',
      group: '输出控制'
    },
    {
      flag: '-H',
      longFlag: '--with-filename',
      description: '显示文件名',
      type: 'boolean',
      group: '输出控制'
    },
    {
      flag: '-h',
      longFlag: '--no-filename',
      description: '不显示文件名',
      type: 'boolean',
      group: '输出控制'
    },
    
    // 上下文控制组
    {
      flag: '-A',
      longFlag: '--after-context',
      description: '显示匹配行后的N行',
      type: 'number',
      inputKey: 'after_context',
      placeholder: '行数（如 3）',
      group: '上下文控制'
    },
    {
      flag: '-B',
      longFlag: '--before-context',
      description: '显示匹配行前的N行',
      type: 'number',
      inputKey: 'before_context',
      placeholder: '行数（如 2）',
      group: '上下文控制'
    },
    {
      flag: '-C',
      longFlag: '--context',
      description: '显示匹配行前后的N行',
      type: 'number',
      inputKey: 'context_lines',
      placeholder: '行数（如 5）',
      group: '上下文控制'
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
      flag: '-R',
      longFlag: '--dereference-recursive',
      description: '递归搜索并跟随符号链接',
      type: 'boolean',
      group: '搜索选项'
    },
    {
      flag: '--include',
      description: '只搜索匹配模式的文件',
      type: 'input',
      inputKey: 'include_pattern',
      placeholder: '文件模式（如 "*.txt"）',
      group: '搜索选项'
    },
    {
      flag: '--exclude',
      description: '排除匹配模式的文件',
      type: 'input',
      inputKey: 'exclude_pattern',
      placeholder: '文件模式（如 "*.log"）',
      group: '搜索选项'
    },
    {
      flag: '--exclude-dir',
      description: '排除匹配模式的目录',
      type: 'input',
      inputKey: 'exclude_dir_pattern',
      placeholder: '目录模式（如 ".git"）',
      group: '搜索选项'
    },
    
    // 显示选项组
    {
      flag: '--color',
      description: '高亮显示匹配的文本',
      type: 'select',
      inputKey: 'color_option',
      options: ['auto', 'always', 'never'],
      optionLabels: ['自动', '总是', '从不'],
      default: 'auto',
      group: '显示选项'
    }
  ],
  handler: (args, terminalContext, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return grep.help
    }

    if (args.length === 0) {
      throw new Error('grep: missing pattern\nTry \'grep --help\' for more information.')
    }

    const ignoreCase = args.includes('-i') || args.includes('--ignore-case')
    const lineNumber = args.includes('-n') || args.includes('--line-number')
    const count = args.includes('-c') || args.includes('--count')
    const invert = args.includes('-v') || args.includes('--invert-match')
    const recursive = args.includes('-r') || args.includes('-R') || args.includes('--recursive')
    const wholeLine = args.includes('-x') || args.includes('--line-regexp')
    const wholeWord = args.includes('-w') || args.includes('--word-regexp')
    const fixedStrings = args.includes('-F') || args.includes('--fixed-strings')
    const extendedRegexp = args.includes('-E') || args.includes('--extended-regexp')
    const basicRegexp = args.includes('-G') || args.includes('--basic-regexp')
    const onlyMatching = args.includes('-o') || args.includes('--only-matching')
    const quiet = args.includes('-q') || args.includes('--quiet') || args.includes('--silent')
    const filesWithMatches = args.includes('-l') || args.includes('--files-with-matches')
    const filesWithoutMatch = args.includes('-L') || args.includes('--files-without-match')
    const withFilename = args.includes('-H') || args.includes('--with-filename')
    const noFilename = args.includes('-h') || args.includes('--no-filename')
    const beforeContext = args.includes('-B') ? parseInt(args[args.indexOf('-B') + 1]) : 0
    const afterContext = args.includes('-A') ? parseInt(args[args.indexOf('-A') + 1]) : 0
    const context = args.includes('-C') ? parseInt(args[args.indexOf('-C') + 1]) : 0
    const color = args.includes('--color=always') || args.includes('--color=auto')

    // 过滤出非选项参数
    const nonOptionArgs = args.filter(arg => 
      !arg.startsWith('-') && 
      !isContextNumber(arg, args)
    )

    if (nonOptionArgs.length === 0) {
      throw new Error('grep: missing pattern\nTry \'grep --help\' for more information.')
    }

    const pattern = nonOptionArgs[0]
    const files = nonOptionArgs.slice(1)

    // 如果没有指定文件，从标准输入读取
    if (files.length === 0) {
      files.push('-') // 表示标准输入
    }

    let totalMatches = 0
    const results = []

    for (const file of files) {
      let content
      let filename = file

      if (file === '-') {
        // 从标准输入读取（在模拟环境中使用示例内容）
        content = terminalContext.stdin || 'Sample input text\nAnother line of text\nFinal line'
        filename = '(standard input)'
      } else {
        content = fs.getFileContent(file)
        if (content === null) {
          results.push(`grep: ${file}: No such file or directory`)
          continue
        }
      }

      const lines = content.split('\n')
      let matchCount = 0
      const matchedLines = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        let isMatch = false

        try {
          if (fixedStrings) {
            // 固定字符串搜索
            const searchText = ignoreCase ? line.toLowerCase() : line
            const searchPattern = ignoreCase ? pattern.toLowerCase() : pattern
            isMatch = searchText.includes(searchPattern)
          } else {
            // 正则表达式搜索
            let regexFlags = ignoreCase ? 'i' : ''
            let regexPattern = pattern

            if (wholeLine) {
              regexPattern = '^' + regexPattern + '$'
            } else if (wholeWord) {
              regexPattern = '\\b' + regexPattern + '\\b'
            }

            const regex = new RegExp(regexPattern, regexFlags)
            isMatch = regex.test(line)
          }

          if (invert) {
            isMatch = !isMatch
          }

          if (isMatch) {
            matchCount++
            totalMatches++

            if (!count && !quiet && !filesWithMatches && !filesWithoutMatch) {
              let output = ''

              // 添加文件名
              if (files.length > 1 && !noFilename || withFilename) {
                output += filename + ':'
              }

              // 添加行号
              if (lineNumber) {
                output += (i + 1) + ':'
              }

              // 添加匹配的行
              if (onlyMatching && !fixedStrings) {
                try {
                  const regex = new RegExp(pattern, ignoreCase ? 'gi' : 'g')
                  const matches = line.match(regex)
                  if (matches) {
                    output += matches.join('\n')
                  }
                } catch (e) {
                  output += line
                }
              } else {
                output += line
              }

              matchedLines.push({
                lineNumber: i + 1,
                content: output,
                originalLine: line
              })
            }
          }
        } catch (e) {
          throw new Error(`grep: invalid regular expression: ${e.message}`)
        }
      }

      // 输出结果
      if (count) {
        let output = ''
        if (files.length > 1 && !noFilename || withFilename) {
          output += filename + ':'
        }
        output += matchCount
        results.push(output)
      } else if (filesWithMatches) {
        if (matchCount > 0) {
          results.push(filename)
        }
      } else if (filesWithoutMatch) {
        if (matchCount === 0) {
          results.push(filename)
        }
      } else if (!quiet) {
        // 处理上下文显示
        const contextBefore = context || beforeContext
        const contextAfter = context || afterContext

        if (contextBefore > 0 || contextAfter > 0) {
          const processedLines = new Set()
          
          for (const match of matchedLines) {
            const lineNum = match.lineNumber - 1
            const start = Math.max(0, lineNum - contextBefore)
            const end = Math.min(lines.length - 1, lineNum + contextAfter)

            for (let j = start; j <= end; j++) {
              if (!processedLines.has(j)) {
                processedLines.add(j)
                let output = ''
                
                if (files.length > 1 && !noFilename || withFilename) {
                  output += filename + ':'
                }
                
                if (lineNumber) {
                  output += (j + 1) + ':'
                }
                
                if (j === lineNum) {
                  output += lines[j] // 匹配行
                } else {
                  output += lines[j] // 上下文行
                }
                
                results.push(output)
              }
            }
          }
        } else {
          results.push(...matchedLines.map(m => m.content))
        }
      }
    }

    if (quiet) {
      return totalMatches > 0 ? '' : null
    }

    return results.join('\n')
  },
  description: 'Search for patterns in text|搜索文本模式',
  category: 'text',
  requiresArgs: true,
  examples: [
    'grep "pattern" file.txt',
    'grep -i "pattern" file.txt',
    'grep -n "pattern" file.txt',
    'grep -r "pattern" directory/',
    'grep -v "pattern" file.txt',
    'grep -c "pattern" file.txt',
    'grep -l "pattern" *.txt',
    'grep -A 3 -B 2 "pattern" file.txt'
  ],
  help: `Usage: grep [OPTION]... PATTERN [FILE]...|用法: grep [选项]... 模式 [文件]...
Search for PATTERN in each FILE or standard input.|在每个文件或标准输入中搜索模式。
PATTERN is, by default, a basic regular expression (BRE).|默认情况下，模式是基本正则表达式(BRE)。

Example: grep -i 'hello world' menu.h main.c|示例: grep -i 'hello world' menu.h main.c

Regexp selection and interpretation:|正则表达式选择和解释:
  -E, --extended-regexp     PATTERN is an extended regular expression (ERE)|模式是扩展正则表达式(ERE)
  -F, --fixed-strings       PATTERN is a set of newline-separated strings|模式是换行符分隔的字符串集合
  -G, --basic-regexp        PATTERN is a basic regular expression (BRE)|模式是基本正则表达式(BRE)
  -P, --perl-regexp         PATTERN is a Perl regular expression|模式是Perl正则表达式
  -e, --regexp=PATTERN      use PATTERN for matching|使用指定模式进行匹配
  -f, --file=FILE           obtain PATTERN from FILE|从文件中获取模式
  -i, --ignore-case         ignore case distinctions|忽略大小写区别
  -w, --word-regexp         force PATTERN to match only whole words|强制模式只匹配完整单词
  -x, --line-regexp         force PATTERN to match only whole lines|强制模式只匹配完整行
  -z, --null-data           a data line ends in 0 byte, not newline|数据行以0字节结尾，而不是换行符

Miscellaneous:|其他选项:
  -s, --no-messages         suppress error messages|抑制错误消息
  -v, --invert-match        select non-matching lines|选择不匹配的行
  -V, --version             display version information and exit|显示版本信息并退出
      --help                display this help text and exit|显示此帮助文本并退出

Output control:|输出控制:
  -m, --max-count=NUM       stop after NUM matches|在NUM次匹配后停止
  -b, --byte-offset         print the byte offset with output lines|打印输出行的字节偏移量
  -n, --line-number         print line number with output lines|打印输出行的行号
      --line-buffered       flush output on every line|每行刷新输出
  -H, --with-filename       print the file name for each match|为每个匹配打印文件名
  -h, --no-filename         suppress the file name prefix on output|抑制输出中的文件名前缀
      --label=LABEL         use LABEL as the standard input file name prefix|使用标签作为标准输入文件名前缀
  -o, --only-matching       show only the part of a line matching PATTERN|只显示匹配模式的行的部分
  -q, --quiet, --silent     suppress all normal output|抑制所有正常输出
      --binary-files=TYPE   assume that binary files are TYPE|假设二进制文件是指定类型
  -a, --text                equivalent to --binary-files=text|等同于--binary-files=text
  -I                        equivalent to --binary-files=without-match|等同于--binary-files=without-match
  -d, --directories=ACTION  how to handle directories|如何处理目录
  -D, --devices=ACTION      how to handle devices, FIFOs and sockets|如何处理设备、FIFO和套接字
  -r, --recursive           like --directories=recurse|类似于--directories=recurse
  -R, --dereference-recursive  likewise, but follow all symlinks|同样，但跟随所有符号链接
      --include=FILE_PATTERN  search only files that match FILE_PATTERN|只搜索匹配文件模式的文件
      --exclude=FILE_PATTERN  skip files and directories matching FILE_PATTERN|跳过匹配文件模式的文件和目录
      --exclude-from=FILE   skip files matching any file pattern from FILE|跳过匹配文件中任何文件模式的文件
      --exclude-dir=PATTERN  directories that match PATTERN will be skipped|匹配模式的目录将被跳过
  -L, --files-without-match  print only names of FILEs containing no match|只打印不包含匹配的文件名
  -l, --files-with-matches  print only names of FILEs containing matches|只打印包含匹配的文件名
  -c, --count               print only a count of matching lines per FILE|只打印每个文件的匹配行数
  -T, --initial-tab         make tabs line up (if needed)|使制表符对齐(如果需要)
  -Z, --null                print 0 byte after FILE name|在文件名后打印0字节

Context control:|上下文控制:
  -B, --before-context=NUM  print NUM lines of leading context|打印NUM行前导上下文
  -A, --after-context=NUM   print NUM lines of trailing context|打印NUM行尾随上下文
  -C, --context=NUM         print NUM lines of output context|打印NUM行输出上下文
  -NUM                      same as --context=NUM|与--context=NUM相同
      --color[=WHEN],
      --colour[=WHEN]       use markers to highlight the matching strings|使用标记突出显示匹配的字符串
  -U, --binary              do not strip CR characters at EOL (MSDOS/Windows)|不在行尾删除CR字符(MSDOS/Windows)
  -P, --perl-regexp         PATTERN is a Perl regular expression|模式是Perl正则表达式

When FILE is -, read standard input. With no FILE, read . if a command-line -r is given, - otherwise.|当文件是-时，读取标准输入。没有文件时，如果给出命令行-r则读取.，否则读取-。
If fewer than two FILEs are given, assume -h.|如果给出少于两个文件，假设-h。
Exit status is 0 if any line is selected, 1 otherwise; if any error occurs and -q is not given, the exit status is 2.|如果选择了任何行，退出状态为0，否则为1；如果发生任何错误且未给出-q，退出状态为2。`
}

// 辅助函数：检查参数是否是上下文数字
function isContextNumber(arg, args) {
  const index = args.indexOf(arg)
  if (index === 0) return false
  
  const prevArg = args[index - 1]
  return prevArg === '-A' || prevArg === '-B' || prevArg === '-C'
}