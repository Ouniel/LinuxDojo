import { formatHelp } from '../utils/helpFormatter.js'

export const xargs = {
  name: 'xargs',
  description: 'Build and execute command lines from standard input|从标准输入构建和执行命令行',
  
  options: [
    // 参数控制组
    {
      flag: '-n',
      longFlag: '--max-args',
      description: '每个命令最多使用指定数量的参数',
      type: 'input',
      inputKey: 'max_args',
      placeholder: '最大参数数（如 1, 5）',
      group: '参数控制'
    },
    {
      flag: '-L',
      longFlag: '--max-lines',
      description: '最多使用指定数量的非空输入行',
      type: 'input',
      inputKey: 'max_lines',
      placeholder: '最大行数（如 1, 3）',
      group: '参数控制'
    },
    {
      flag: '-P',
      longFlag: '--max-procs',
      description: '同时运行最多指定数量的进程',
      type: 'input',
      inputKey: 'max_procs',
      placeholder: '最大进程数（如 1, 4）',
      group: '参数控制'
    },
    {
      flag: '-s',
      longFlag: '--max-chars',
      description: '限制命令行的最大字符数',
      type: 'input',
      inputKey: 'max_chars',
      placeholder: '最大字符数（如 1000）',
      group: '参数控制'
    },
    
    // 分隔符选项组
    {
      flag: '-d',
      longFlag: '--delimiter',
      description: '项目由指定字符分隔',
      type: 'input',
      inputKey: 'delimiter_char',
      placeholder: '分隔符（如 , ; :）',
      group: '分隔符选项'
    },
    {
      flag: '-0',
      longFlag: '--null',
      description: '项目由空字符（\\0）分隔',
      type: 'boolean',
      group: '分隔符选项'
    },
    
    // 执行选项组
    {
      flag: '-p',
      longFlag: '--interactive',
      description: '运行命令前提示确认',
      type: 'boolean',
      group: '执行选项'
    },
    {
      flag: '-t',
      longFlag: '--verbose',
      description: '执行前打印命令',
      type: 'boolean',
      group: '执行选项'
    },
    {
      flag: '-r',
      longFlag: '--no-run-if-empty',
      description: '如果输入为空则不运行命令',
      type: 'boolean',
      group: '执行选项'
    },
    {
      flag: '-x',
      longFlag: '--exit',
      description: '如果大小超过限制则退出',
      type: 'boolean',
      group: '执行选项'
    },
    
    // 替换选项组
    {
      flag: '-I',
      longFlag: '--replace',
      description: '用输入项替换指定字符串',
      type: 'input',
      inputKey: 'replace_str',
      placeholder: '替换字符串（如 {}）',
      group: '替换选项'
    },
    {
      flag: '-i',
      description: '等同于 -I{}',
      type: 'boolean',
      group: '替换选项'
    },
    
    // 输入参数
    {
      inputKey: 'command',
      description: '要执行的命令（默认为echo）',
      type: 'input',
      placeholder: '命令（如 ls -l, rm, mkdir）',
      required: false
    },
    {
      inputKey: 'input_data',
      description: '模拟标准输入数据',
      type: 'input',
      placeholder: '输入数据（用空格或换行分隔）',
      group: '输入选项'
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
        name: 'xargs',
        description: 'Build and execute command lines from standard input|从标准输入构建和执行命令行',
        usage: 'xargs [OPTION]... [COMMAND [INITIAL-ARGS]...]|xargs [选项]... [命令 [初始参数]...]',
        options: [
          '-n, --max-args=MAX-ARGS    Use at most MAX-ARGS arguments per command line|每个命令行最多使用MAX-ARGS个参数',
          '-L, --max-lines=MAX-LINES  Use at most MAX-LINES nonblank input lines per command|每个命令最多使用MAX-LINES个非空输入行',
          '-P, --max-procs=MAX-PROCS  Run up to MAX-PROCS processes at a time|同时运行最多MAX-PROCS个进程',
          '-s, --max-chars=MAX-CHARS  Limit length of command plus arguments|限制命令加参数的长度',
          '-d, --delimiter=CHARACTER  Items in input stream are separated by CHARACTER|输入流中的项目由CHARACTER分隔',
          '-0, --null                 Items are separated by a null character|项目由空字符分隔',
          '-p, --interactive          Prompt the user about whether to run each command|提示用户是否运行每个命令',
          '-t, --verbose              Print the command line on stderr before executing|执行前在stderr上打印命令行',
          '-r, --no-run-if-empty      Do not run command if input is empty|如果输入为空则不运行命令',
          '-x, --exit                 Exit if the size is exceeded|如果大小超过限制则退出',
          '-I, --replace=R            Replace R in INITIAL-ARGS with names read from input|用从输入读取的名称替换INITIAL-ARGS中的R',
          '-i, --replace              Equivalent to -I{}|等同于-I{}'
        ],
        examples: [
          'find . -name "*.txt" | xargs ls -l|列出所有.txt文件',
          'echo "1 2 3" | xargs -n 1 echo|分别echo每个数字',
          'find . -name "*.bak" | xargs rm|删除所有.bak文件',
          'echo "a b c" | xargs -I {} echo "Item: {}"|使用替换字符串',
          'find . -print0 | xargs -0 ls -l|处理包含空格的文件名',
          'echo "file1 file2" | xargs -t cp -t /backup/|详细模式复制文件'
        ]
      })
    }
    
    // 解析选项
    let maxArgs = null
    let maxLines = null
    let maxProcs = 1
    let maxChars = null
    let delimiter = null
    let nullDelimiter = false
    let interactive = false
    let verbose = false
    let noRunIfEmpty = false
    let exit = false
    let replaceStr = null
    let command = []
    let inputData = 'file1.txt file2.txt file3.txt\ndir1 dir2 dir3'
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-n' || arg === '--max-args') {
        if (i + 1 < args.length) {
          maxArgs = parseInt(args[++i])
          if (isNaN(maxArgs) || maxArgs <= 0) {
            return 'xargs: invalid number for -n option'
          }
        }
      } else if (arg === '-L' || arg === '--max-lines') {
        if (i + 1 < args.length) {
          maxLines = parseInt(args[++i])
          if (isNaN(maxLines) || maxLines <= 0) {
            return 'xargs: invalid number for -L option'
          }
        }
      } else if (arg === '-P' || arg === '--max-procs') {
        if (i + 1 < args.length) {
          maxProcs = parseInt(args[++i])
          if (isNaN(maxProcs) || maxProcs < 0) {
            return 'xargs: invalid number for -P option'
          }
        }
      } else if (arg === '-s' || arg === '--max-chars') {
        if (i + 1 < args.length) {
          maxChars = parseInt(args[++i])
          if (isNaN(maxChars) || maxChars <= 0) {
            return 'xargs: invalid number for -s option'
          }
        }
      } else if (arg === '-d' || arg === '--delimiter') {
        if (i + 1 < args.length) {
          delimiter = args[++i]
        }
      } else if (arg === '-0' || arg === '--null') {
        nullDelimiter = true
      } else if (arg === '-p' || arg === '--interactive') {
        interactive = true
      } else if (arg === '-t' || arg === '--verbose') {
        verbose = true
      } else if (arg === '-r' || arg === '--no-run-if-empty') {
        noRunIfEmpty = true
      } else if (arg === '-x' || arg === '--exit') {
        exit = true
      } else if (arg === '-I' || arg === '--replace') {
        if (i + 1 < args.length) {
          replaceStr = args[++i]
        }
      } else if (arg === '-i' || arg === '--replace') {
        replaceStr = '{}'
      } else if (arg.startsWith('--input=')) {
        inputData = arg.split('=')[1]
      } else if (arg.startsWith('-')) {
        return `xargs: invalid option: ${arg}`
      } else {
        command = args.slice(i)
        break
      }
    }
    
    // 默认命令是 echo
    if (command.length === 0) {
      command = ['echo']
    }
    
    // 分割输入数据
    let inputItems
    if (nullDelimiter) {
      inputItems = inputData.split('\0').filter(item => item !== '')
    } else if (delimiter) {
      inputItems = inputData.split(delimiter).filter(item => item !== '')
    } else {
      // 默认按空白字符分割
      inputItems = inputData.trim().split(/\s+/).filter(item => item !== '')
    }
    
    if (inputItems.length === 0 && noRunIfEmpty) {
      return ''
    }
    
    const results = []
    let currentBatch = []
    
    // 处理输入项目
    for (let i = 0; i < inputItems.length; i++) {
      currentBatch.push(inputItems[i])
      
      // 检查是否需要执行当前批次
      const shouldExecute = 
        (maxArgs && currentBatch.length >= maxArgs) ||
        (maxLines && currentBatch.length >= maxLines) ||
        (i === inputItems.length - 1)
      
      if (shouldExecute) {
        let fullCommand
        
        if (replaceStr) {
          // 使用替换字符串
          fullCommand = command.map(arg => 
            arg.replace(new RegExp(escapeRegExp(replaceStr), 'g'), currentBatch.join(' '))
          )
        } else {
          // 直接添加参数
          fullCommand = [...command, ...currentBatch]
        }
        
        const commandStr = fullCommand.join(' ')
        
        // 检查命令长度限制
        if (maxChars && commandStr.length > maxChars) {
          if (exit) {
            results.push(`xargs: command too long, exiting`)
            break
          } else {
            results.push(`xargs: command too long: ${commandStr}`)
            currentBatch = []
            continue
          }
        }
        
        if (verbose) {
          results.push(`+ ${commandStr}`)
        }
        
        if (interactive) {
          results.push(`${commandStr} ?... [Simulated: y]`)
        }
        
        // 模拟命令执行
        const output = simulateCommandExecution(fullCommand)
        if (output) {
          results.push(output)
        }
        
        currentBatch = []
      }
    }
    
    return results.join('\n')
  }
}

function simulateCommandExecution(command) {
  const cmd = command[0]
  const args = command.slice(1)
  
  if (cmd === 'echo') {
    return args.join(' ')
  } else if (cmd === 'ls') {
    if (args.includes('-l')) {
      return args.filter(arg => arg !== '-l').map(file => 
        `-rw-r--r-- 1 user user 1024 Jan 1 12:00 ${file}`
      ).join('\n')
    }
    return args.join('  ')
  } else if (cmd === 'rm') {
    return `Removing: ${args.join(', ')}`
  } else if (cmd === 'mkdir') {
    return `Creating directories: ${args.join(', ')}`
  } else if (cmd === 'cp') {
    if (args.length >= 2) {
      const dest = args[args.length - 1]
      const sources = args.slice(0, -1).filter(arg => !arg.startsWith('-'))
      return `Copying ${sources.join(', ')} to ${dest}`
    }
    return `Copying: ${args.join(' ')}`
  } else if (cmd === 'mv') {
    if (args.length >= 2) {
      const dest = args[args.length - 1]
      const sources = args.slice(0, -1).filter(arg => !arg.startsWith('-'))
      return `Moving ${sources.join(', ')} to ${dest}`
    }
    return `Moving: ${args.join(' ')}`
  } else if (cmd === 'chmod') {
    const mode = args[0]
    const files = args.slice(1)
    return `Changing permissions of ${files.join(', ')} to ${mode}`
  } else if (cmd === 'grep') {
    const pattern = args[0]
    const files = args.slice(1)
    return `Searching for '${pattern}' in: ${files.join(', ')}`
  } else {
    return `Executing: ${command.join(' ')}`
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}