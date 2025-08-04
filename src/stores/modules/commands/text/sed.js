/**
 * sed - 流编辑器，用于过滤和转换文本
 */

export const sed = {
  name: 'sed',
  description: 'Stream editor for filtering and transforming text|流编辑器，用于过滤和转换文本',
  
  options: [
    {
      name: '脚本选项',
      type: 'group',
      options: [
        {
          name: '-e, --expression',
          type: 'input',
          description: '添加脚本到要执行的命令中',
          placeholder: '脚本表达式（如：s/old/new/g）',
          flag: '-e'
        },
        {
          name: '-f, --file',
          type: 'input',
          description: '从文件中读取脚本',
          placeholder: '脚本文件路径',
          flag: '-f'
        }
      ]
    },
    {
      name: '输出控制',
      type: 'group',
      options: [
        {
          name: '-n, --quiet',
          type: 'checkbox',
          description: '抑制模式空间的自动打印',
          flag: '-n'
        },
        {
          name: '-i, --in-place',
          type: 'input',
          description: '就地编辑文件',
          placeholder: '备份后缀（可选）',
          flag: '-i'
        }
      ]
    },
    {
      name: '正则表达式',
      type: 'group',
      options: [
        {
          name: '-E, --regexp-extended',
          type: 'checkbox',
          description: '在脚本中使用扩展正则表达式',
          flag: '-E'
        },
        {
          name: '-r',
          type: 'checkbox',
          description: '使用扩展正则表达式（同 -E）',
          flag: '-r'
        }
      ]
    },
    {
      name: '处理选项',
      type: 'group',
      options: [
        {
          name: '-s, --separate',
          type: 'checkbox',
          description: '将文件视为独立的，而不是连续流',
          flag: '-s'
        },
        {
          name: '-u, --unbuffered',
          type: 'checkbox',
          description: '最小化数据加载并频繁刷新输出缓冲区',
          flag: '-u'
        },
        {
          name: '-z, --null-data',
          type: 'checkbox',
          description: '用NUL字符分隔行',
          flag: '-z'
        }
      ]
    },
    {
      name: 'sed脚本命令',
      type: 'input',
      description: 'sed脚本命令',
      placeholder: 'sed命令（如：s/old/new/g, /pattern/d）',
      position: 'arg'
    },
    {
      name: '文件',
      type: 'input',
      description: '要处理的文件',
      placeholder: '文件路径（支持多个文件，用空格分隔）',
      position: 'end'
    }
  ],

  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return sed.help
    }

    if (args.length === 0) {
      throw new Error('sed: missing script\nTry \'sed --help\' for more information.')
    }

    const inPlace = args.includes('-i') || args.includes('--in-place')
    const quiet = args.includes('-n') || args.includes('--quiet') || args.includes('--silent')
    const extendedRegex = args.includes('-E') || args.includes('-r') || args.includes('--regexp-extended')
    const separate = args.includes('-s') || args.includes('--separate')
    const unbuffered = args.includes('-u') || args.includes('--unbuffered')
    
    // 获取脚本和文件参数
    let scriptIndex = 0
    for (let i = 0; i < args.length; i++) {
      if (!args[i].startsWith('-') && !isOptionValue(args[i], args, i)) {
        scriptIndex = i
        break
      }
    }

    if (scriptIndex >= args.length) {
      throw new Error('sed: missing script\nTry \'sed --help\' for more information.')
    }

    const script = args[scriptIndex]
    const files = args.slice(scriptIndex + 1).filter(arg => !arg.startsWith('-'))

    // 如果没有指定文件，从标准输入读取
    if (files.length === 0) {
      files.push('-')
    }

    const results = []

    for (const file of files) {
      let content
      let filename = file

      if (file === '-') {
        content = context.stdin || 'Sample input text\nAnother line of text\nFinal line'
        filename = '(standard input)'
      } else {
        content = fs.getFileContent(file)
        if (content === null) {
          throw new Error(`sed: can't read ${file}: No such file or directory`)
        }
      }

      const lines = content.split('\n')
      const processedLines = []
      let printByDefault = !quiet

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i]
        let shouldPrint = printByDefault
        let modified = false

        // 解析sed脚本
        const commands = parseScript(script)
        
        for (const command of commands) {
          const result = executeCommand(command, line, i + 1, lines.length, extendedRegex)
          if (result.newLine !== undefined) {
            line = result.newLine
            modified = true
          }
          if (result.print !== undefined) {
            shouldPrint = result.print
          }
          if (result.delete) {
            shouldPrint = false
            break
          }
          if (result.quit) {
            if (shouldPrint) {
              processedLines.push(line)
            }
            break
          }
        }

        if (shouldPrint) {
          processedLines.push(line)
        }
      }

      const output = processedLines.join('\n')

      if (inPlace && file !== '-') {
        // 在实际环境中会直接修改文件
        fs.writeFile(file, output)
        // 不输出到标准输出
      } else {
        results.push(output)
      }
    }

    return results.join('\n')
  },

  category: 'text',
  requiresArgs: true,
  examples: [
    'sed "s/old/new/" file.txt',
    'sed "s/old/new/g" file.txt',
    'sed -n "1,5p" file.txt',
    'sed "/pattern/d" file.txt',
    'sed -i "s/old/new/g" file.txt',
    'sed "2d" file.txt',
    'sed "1i\\New first line" file.txt',
    'sed "\\$a\\New last line" file.txt'
  ],
  help: `Usage: sed [OPTION]... {script-only-if-no-other-script} [input-file]...

  -n, --quiet, --silent
                 suppress automatic printing of pattern space
  -e script, --expression=script
                 add the script to the commands to be executed
  -f script-file, --file=script-file
                 add the contents of script-file to the commands to be executed
  --follow-symlinks
                 follow symlinks when processing in place
  -i[SUFFIX], --in-place[=SUFFIX]
                 edit files in place (makes backup if SUFFIX supplied)
  -l N, --line-length=N
                 specify the desired line-wrap length for the 'l' command
  --posix
                 disable all GNU extensions
  -E, -r, --regexp-extended
                 use extended regular expressions in the script
  -s, --separate
                 consider files as separate rather than as a single, continuous long stream
  --sandbox
                 operate in sandbox mode (disable e/r/w commands)
  -u, --unbuffered
                 load minimal amounts of data from the input files and flush the output buffers more often
  -z, --null-data
                 separate lines by NUL characters
      --help     display this help and exit
      --version  output version information and exit

If no -e, --expression, -f, or --file option is given, then the first non-option argument is taken as the sed script to interpret.
All remaining arguments are names of input files; if no input files are specified, then the standard input is read.

GNU sed home page: <https://www.gnu.org/software/sed/>.
General help using GNU software: <https://www.gnu.org/gethelp/>.

Common sed commands:
  s/regexp/replacement/    substitute first match of regexp with replacement
  s/regexp/replacement/g   substitute all matches of regexp with replacement
  /pattern/d               delete lines matching pattern
  /pattern/p               print lines matching pattern
  1,5p                     print lines 1 through 5
  1d                       delete first line
  \\$d                       delete last line
  i\\text                   insert text before current line
  a\\text                   append text after current line
  c\\text                   replace current line with text
  q                        quit (exit sed)
  n                        read next line into pattern space
  N                        append next line to pattern space
  h                        copy pattern space to hold space
  H                        append pattern space to hold space
  g                        copy hold space to pattern space
  G                        append hold space to pattern space
  x                        exchange pattern and hold spaces`
}

// 解析sed脚本
function parseScript(script) {
  const commands = []
  let i = 0
  
  while (i < script.length) {
    const command = parseCommand(script, i)
    commands.push(command)
    i = command.endIndex
  }
  
  return commands
}

// 解析单个命令
function parseCommand(script, startIndex) {
  let i = startIndex
  const command = {
    address: null,
    action: null,
    parameters: [],
    endIndex: script.length
  }
  
  // 跳过空白字符
  while (i < script.length && /\s/.test(script[i])) {
    i++
  }
  
  // 解析地址
  if (i < script.length && /\d/.test(script[i])) {
    let address = ''
    while (i < script.length && /[\d,\$]/.test(script[i])) {
      address += script[i]
      i++
    }
    command.address = address
  } else if (i < script.length && script[i] === '/') {
    // 正则表达式地址
    i++ // 跳过开始的 /
    let pattern = ''
    while (i < script.length && script[i] !== '/') {
      pattern += script[i]
      i++
    }
    if (i < script.length) i++ // 跳过结束的 /
    command.address = new RegExp(pattern)
  }
  
  // 跳过空白字符
  while (i < script.length && /\s/.test(script[i])) {
    i++
  }
  
  // 解析动作
  if (i < script.length) {
    command.action = script[i]
    i++
    
    // 解析参数
    if (command.action === 's') {
      // 替换命令 s/pattern/replacement/flags
      const delimiter = script[i]
      i++ // 跳过分隔符
      
      let pattern = ''
      while (i < script.length && script[i] !== delimiter) {
        if (script[i] === '\\' && i + 1 < script.length) {
          pattern += script[i] + script[i + 1]
          i += 2
        } else {
          pattern += script[i]
          i++
        }
      }
      i++ // 跳过分隔符
      
      let replacement = ''
      while (i < script.length && script[i] !== delimiter) {
        if (script[i] === '\\' && i + 1 < script.length) {
          replacement += script[i] + script[i + 1]
          i += 2
        } else {
          replacement += script[i]
          i++
        }
      }
      i++ // 跳过分隔符
      
      let flags = ''
      while (i < script.length && /[gip123456789]/.test(script[i])) {
        flags += script[i]
        i++
      }
      
      command.parameters = [pattern, replacement, flags]
    } else if (['i', 'a', 'c'].includes(command.action)) {
      // 插入、追加、更改命令
      if (i < script.length && script[i] === '\\') {
        i++ // 跳过反斜杠
      }
      let text = script.substring(i)
      command.parameters = [text]
      i = script.length
    }
  }
  
  command.endIndex = i
  return command
}

// 执行命令
function executeCommand(command, line, lineNumber, totalLines, extendedRegex) {
  const result = {
    newLine: undefined,
    print: undefined,
    delete: false,
    quit: false
  }
  
  // 检查地址匹配
  if (!matchesAddress(command.address, line, lineNumber, totalLines)) {
    return result
  }
  
  switch (command.action) {
    case 's': // 替换
      const [pattern, replacement, flags] = command.parameters
      const global = flags.includes('g')
      const ignoreCase = flags.includes('i')
      const print = flags.includes('p')
      
      try {
        const regexFlags = ignoreCase ? 'i' : ''
        const regex = new RegExp(pattern, global ? regexFlags + 'g' : regexFlags)
        const newLine = line.replace(regex, replacement)
        
        if (newLine !== line) {
          result.newLine = newLine
          if (print) {
            result.print = true
          }
        }
      } catch (e) {
        throw new Error(`sed: invalid regular expression: ${e.message}`)
      }
      break
      
    case 'd': // 删除
      result.delete = true
      break
      
    case 'p': // 打印
      result.print = true
      break
      
    case 'q': // 退出
      result.quit = true
      break
      
    case 'i': // 插入
      // 在实际实现中需要处理插入逻辑
      break
      
    case 'a': // 追加
      // 在实际实现中需要处理追加逻辑
      break
      
    case 'c': // 更改
      result.newLine = command.parameters[0]
      break
  }
  
  return result
}

// 检查地址是否匹配
function matchesAddress(address, line, lineNumber, totalLines) {
  if (!address) return true
  
  if (typeof address === 'string') {
    if (address === '$') {
      return lineNumber === totalLines
    } else if (address.includes(',')) {
      const [start, end] = address.split(',')
      const startNum = start === '$' ? totalLines : parseInt(start)
      const endNum = end === '$' ? totalLines : parseInt(end)
      return lineNumber >= startNum && lineNumber <= endNum
    } else {
      return lineNumber === parseInt(address)
    }
  } else if (address instanceof RegExp) {
    return address.test(line)
  }
  
  return false
}

// 检查参数是否是选项值
function isOptionValue(arg, args, index) {
  if (index === 0) return false
  const prevArg = args[index - 1]
  return prevArg === '-e' || prevArg === '-f' || prevArg === '-i'
}