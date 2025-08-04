/**
 * find - 在目录树中搜索文件和目录
 */

export const find = {
  options: [
    // 搜索条件组
    {
      flag: '-name',
      description: '按文件名搜索（支持通配符）',
      type: 'input',
      inputKey: 'search_name',
      placeholder: '文件名模式（如 *.txt）',
      group: '搜索条件'
    },
    {
      flag: '-iname',
      description: '按文件名搜索（忽略大小写）',
      type: 'input',
      inputKey: 'search_iname',
      placeholder: '文件名模式（如 *.TXT）',
      group: '搜索条件'
    },
    {
      flag: '-type',
      description: '按文件类型搜索',
      type: 'select',
      inputKey: 'file_type',
      options: ['f', 'd', 'l', 'b', 'c', 'p', 's'],
      optionLabels: ['普通文件', '目录', '符号链接', '块设备', '字符设备', '管道', '套接字'],
      group: '搜索条件'
    },
    {
      flag: '-size',
      description: '按文件大小搜索',
      type: 'input',
      inputKey: 'file_size',
      placeholder: '大小（如 +1M, -100k, 50c）',
      group: '搜索条件'
    },
    {
      flag: '-user',
      description: '按文件所有者搜索',
      type: 'input',
      inputKey: 'file_user',
      placeholder: '用户名',
      group: '搜索条件'
    },
    {
      flag: '-group',
      description: '按文件所属组搜索',
      type: 'input',
      inputKey: 'file_group',
      placeholder: '组名',
      group: '搜索条件'
    },
    {
      flag: '-perm',
      description: '按文件权限搜索',
      type: 'input',
      inputKey: 'file_perm',
      placeholder: '权限（如 755, -644）',
      group: '搜索条件'
    },
    
    // 时间条件组
    {
      flag: '-mtime',
      description: '按修改时间搜索（天数）',
      type: 'input',
      inputKey: 'mtime',
      placeholder: '天数（如 +7, -1, 0）',
      group: '时间条件'
    },
    {
      flag: '-atime',
      description: '按访问时间搜索（天数）',
      type: 'input',
      inputKey: 'atime',
      placeholder: '天数（如 +30, -7）',
      group: '时间条件'
    },
    {
      flag: '-ctime',
      description: '按状态改变时间搜索（天数）',
      type: 'input',
      inputKey: 'ctime',
      placeholder: '天数（如 +1, -3）',
      group: '时间条件'
    },
    
    // 搜索选项组
    {
      flag: '-maxdepth',
      description: '限制搜索的最大深度',
      type: 'number',
      inputKey: 'max_depth',
      placeholder: '最大深度（如 2）',
      group: '搜索选项'
    },
    {
      flag: '-mindepth',
      description: '限制搜索的最小深度',
      type: 'number',
      inputKey: 'min_depth',
      placeholder: '最小深度（如 1）',
      group: '搜索选项'
    },
    {
      flag: '-empty',
      description: '搜索空文件或空目录',
      type: 'boolean',
      group: '搜索选项'
    },
    {
      flag: '-readable',
      description: '搜索可读文件',
      type: 'boolean',
      group: '搜索选项'
    },
    {
      flag: '-writable',
      description: '搜索可写文件',
      type: 'boolean',
      group: '搜索选项'
    },
    {
      flag: '-executable',
      description: '搜索可执行文件',
      type: 'boolean',
      group: '搜索选项'
    },
    
    // 动作选项组
    {
      flag: '-print',
      description: '打印找到的文件路径（默认动作）',
      type: 'boolean',
      group: '动作选项'
    },
    {
      flag: '-ls',
      description: '以ls -l格式显示找到的文件',
      type: 'boolean',
      group: '动作选项'
    },
    {
      flag: '-delete',
      description: '删除找到的文件（危险操作）',
      type: 'boolean',
      group: '动作选项'
    },
    {
      flag: '-exec',
      description: '对找到的文件执行命令',
      type: 'input',
      inputKey: 'exec_command',
      placeholder: '命令（如 grep -l "pattern" {} \\;）',
      group: '动作选项'
    },
    
    // 搜索路径
    {
      inputKey: 'search_path',
      description: '搜索起始路径',
      type: 'input',
      placeholder: '路径（默认为当前目录 .）',
      required: false
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return find.help
    }

    // 解析参数
    const paths = []
    const expressions = []
    let i = 0
    
    // 分离路径和表达式
    while (i < args.length) {
      const arg = args[i]
      if (arg.startsWith('-') || expressions.length > 0) {
        expressions.push(...args.slice(i))
        break
      } else {
        paths.push(arg)
      }
      i++
    }

    // 默认路径为当前目录
    if (paths.length === 0) {
      paths.push('.')
    }

    try {
      const results = []
      
      for (const path of paths) {
        const searchResults = performFind(path, expressions, fs, context)
        results.push(...searchResults)
      }

      return results.join('\n')
    } catch (error) {
      return `find: ${error.message}`
    }
  },
  description: 'Search for files and directories in directory tree|在目录树中搜索文件和目录',
  category: 'basic',
  requiresArgs: false,
  examples: [
    'find . -name "*.txt"',
    'find /home -type f -name "*.log"',
    'find . -size +1M',
    'find . -mtime -7',
    'find . -name "*.js" -exec grep -l "function" {} \\;'
  ],
  help: `Usage|用法: find [-H] [-L] [-P] [-Olevel] [-D help|tree|search|stat|rates|opt|exec] [path...] [expression]

default path is the current directory; default expression is -print|默认路径为当前目录；默认表达式为-print
expression may consist of: operators, options, tests, and actions|表达式可包含：操作符、选项、测试和动作

operators (decreasing precedence; -and is implicit where no others are given)|操作符（优先级递减；未指定其他操作符时隐含-and）:
      ( EXPR )   ! EXPR   -not EXPR   EXPR1 -a EXPR2   EXPR1 -and EXPR2
      EXPR1 -o EXPR2   EXPR1 -or EXPR2   EXPR1 , EXPR2

positional options (always true)|位置选项（总是为真）: -daystart -follow -regextype

normal options (always true, specified before other expressions)|普通选项（总是为真，在其他表达式之前指定）:
      -depth --help -maxdepth LEVELS -mindepth LEVELS -mount -noleaf
      --version -xdev -ignore_readdir_race -noignore_readdir_race

tests (N can be +N or -N or N)|测试（N可以是+N或-N或N）: -amin N -anewer FILE -atime N -cmin N
      -cnewer FILE -ctime N -empty -false -fstype TYPE -gid N -group NAME
      -ilname PATTERN -iname PATTERN -inum N -iwholename PATTERN -iregex PATTERN
      -links N -lname PATTERN -mmin N -mtime N -name PATTERN -newer FILE
      -nouser -nogroup -path PATTERN -perm [-/]MODE -regex PATTERN
      -readable -writable -executable
      -wholename PATTERN -size N[bcwkMG] -true -type [bcdpflsD] -uid N
      -used N -user NAME -xtype [bcdpflsD]

actions|动作: -delete -print0 -printf FORMAT -fprintf FILE FORMAT -print 
         -fprint0 FILE -fprint FILE -ls -fls FILE -prune -quit
         -exec COMMAND ; -exec COMMAND {} + -ok COMMAND ;
         -execdir COMMAND ; -execdir COMMAND {} + -okdir COMMAND ;

Examples|示例:
  find . -name "*.txt"                    Find all .txt files|查找所有.txt文件
  find /home -type f -name "*.log"        Find all .log files in /home|在/home中查找所有.log文件
  find . -size +1M                        Find files larger than 1MB|查找大于1MB的文件
  find . -mtime -7                        Find files modified in last 7 days|查找最近7天修改的文件
  find . -name "*.js" -exec grep -l "function" {} \\;  Execute command on found files|对找到的文件执行命令`
}

// 执行查找操作
function performFind(startPath, expressions, fs, context) {
  const results = []
  const options = parseExpressions(expressions)
  
  // 模拟文件系统遍历
  const files = generateFileList(startPath, options.maxdepth, options.mindepth)
  
  for (const file of files) {
    if (matchesCriteria(file, options)) {
      if (options.action === 'print' || !options.action) {
        results.push(file.path)
      } else if (options.action === 'ls') {
        results.push(formatLsOutput(file))
      } else if (options.action === 'exec') {
        const execResult = executeCommand(options.execCommand, file)
        if (execResult) results.push(execResult)
      }
    }
  }
  
  return results
}

// 解析find表达式
function parseExpressions(expressions) {
  const options = {
    name: null,
    type: null,
    size: null,
    mtime: null,
    atime: null,
    ctime: null,
    user: null,
    group: null,
    perm: null,
    maxdepth: Infinity,
    mindepth: 0,
    action: 'print',
    execCommand: null,
    empty: false,
    readable: false,
    writable: false,
    executable: false
  }

  for (let i = 0; i < expressions.length; i++) {
    const expr = expressions[i]
    
    switch (expr) {
      case '-name':
        options.name = expressions[++i]
        break
      case '-iname':
        options.name = expressions[++i]
        options.nameIgnoreCase = true
        break
      case '-type':
        options.type = expressions[++i]
        break
      case '-size':
        options.size = expressions[++i]
        break
      case '-mtime':
        options.mtime = parseInt(expressions[++i])
        break
      case '-atime':
        options.atime = parseInt(expressions[++i])
        break
      case '-ctime':
        options.ctime = parseInt(expressions[++i])
        break
      case '-user':
        options.user = expressions[++i]
        break
      case '-group':
        options.group = expressions[++i]
        break
      case '-perm':
        options.perm = expressions[++i]
        break
      case '-maxdepth':
        options.maxdepth = parseInt(expressions[++i])
        break
      case '-mindepth':
        options.mindepth = parseInt(expressions[++i])
        break
      case '-empty':
        options.empty = true
        break
      case '-readable':
        options.readable = true
        break
      case '-writable':
        options.writable = true
        break
      case '-executable':
        options.executable = true
        break
      case '-print':
        options.action = 'print'
        break
      case '-ls':
        options.action = 'ls'
        break
      case '-exec':
        options.action = 'exec'
        const execArgs = []
        i++
        while (i < expressions.length && expressions[i] !== ';') {
          execArgs.push(expressions[i])
          i++
        }
        options.execCommand = execArgs
        break
      case '-delete':
        options.action = 'delete'
        break
    }
  }

  return options
}

// 生成文件列表（模拟）
function generateFileList(startPath, maxdepth, mindepth) {
  const files = []
  
  // 模拟文件系统结构
  const sampleFiles = [
    { path: './README.md', type: 'f', size: 1024, mtime: Date.now() - 86400000, user: 'user', group: 'user', perm: '644' },
    { path: './src', type: 'd', size: 4096, mtime: Date.now() - 172800000, user: 'user', group: 'user', perm: '755' },
    { path: './src/main.js', type: 'f', size: 2048, mtime: Date.now() - 3600000, user: 'user', group: 'user', perm: '644' },
    { path: './src/utils.js', type: 'f', size: 1536, mtime: Date.now() - 7200000, user: 'user', group: 'user', perm: '644' },
    { path: './docs', type: 'd', size: 4096, mtime: Date.now() - 259200000, user: 'user', group: 'user', perm: '755' },
    { path: './docs/guide.txt', type: 'f', size: 3072, mtime: Date.now() - 432000000, user: 'user', group: 'user', perm: '644' },
    { path: './logs', type: 'd', size: 4096, mtime: Date.now() - 86400000, user: 'user', group: 'user', perm: '755' },
    { path: './logs/app.log', type: 'f', size: 10240, mtime: Date.now() - 1800000, user: 'user', group: 'user', perm: '644' },
    { path: './logs/error.log', type: 'f', size: 512, mtime: Date.now() - 3600000, user: 'user', group: 'user', perm: '644' },
    { path: './config.json', type: 'f', size: 256, mtime: Date.now() - 604800000, user: 'user', group: 'user', perm: '644' },
    { path: './package.json', type: 'f', size: 512, mtime: Date.now() - 172800000, user: 'user', group: 'user', perm: '644' },
    { path: './node_modules', type: 'd', size: 4096, mtime: Date.now() - 259200000, user: 'user', group: 'user', perm: '755' },
    { path: './test', type: 'd', size: 4096, mtime: Date.now() - 86400000, user: 'user', group: 'user', perm: '755' },
    { path: './test/test.js', type: 'f', size: 1024, mtime: Date.now() - 43200000, user: 'user', group: 'user', perm: '644' },
    { path: './images', type: 'd', size: 4096, mtime: Date.now() - 432000000, user: 'user', group: 'user', perm: '755' },
    { path: './images/logo.png', type: 'f', size: 51200, mtime: Date.now() - 604800000, user: 'user', group: 'user', perm: '644' },
    { path: './images/banner.jpg', type: 'f', size: 102400, mtime: Date.now() - 1209600000, user: 'user', group: 'user', perm: '644' }
  ]

  // 根据起始路径过滤
  for (const file of sampleFiles) {
    const depth = file.path.split('/').length - 1
    if (depth >= mindepth && depth <= maxdepth) {
      if (startPath === '.' || file.path.startsWith(startPath)) {
        files.push(file)
      }
    }
  }

  return files
}

// 检查文件是否匹配条件
function matchesCriteria(file, options) {
  // 名称匹配
  if (options.name) {
    const fileName = file.path.split('/').pop()
    const pattern = options.name.replace(/\*/g, '.*').replace(/\?/g, '.')
    const regex = new RegExp('^' + pattern + '$', options.nameIgnoreCase ? 'i' : '')
    if (!regex.test(fileName)) return false
  }

  // 类型匹配
  if (options.type && file.type !== options.type) {
    return false
  }

  // 大小匹配
  if (options.size) {
    const sizeMatch = options.size.match(/^([+-]?)(\d+)([bcwkMG]?)$/)
    if (sizeMatch) {
      const [, operator, value, unit] = sizeMatch
      let sizeBytes = parseInt(value)
      
      // 转换单位
      switch (unit) {
        case 'c': sizeBytes *= 1; break
        case 'w': sizeBytes *= 2; break
        case 'k': sizeBytes *= 1024; break
        case 'M': sizeBytes *= 1024 * 1024; break
        case 'G': sizeBytes *= 1024 * 1024 * 1024; break
        default: sizeBytes *= 512; break // 默认块大小
      }
      
      if (operator === '+' && file.size <= sizeBytes) return false
      if (operator === '-' && file.size >= sizeBytes) return false
      if (!operator && file.size !== sizeBytes) return false
    }
  }

  // 修改时间匹配
  if (options.mtime !== null) {
    const daysDiff = Math.floor((Date.now() - file.mtime) / (24 * 60 * 60 * 1000))
    if (options.mtime > 0 && daysDiff !== options.mtime) return false
    if (options.mtime < 0 && daysDiff >= Math.abs(options.mtime)) return false
    if (options.mtime === 0 && daysDiff !== 0) return false
  }

  // 用户匹配
  if (options.user && file.user !== options.user) {
    return false
  }

  // 组匹配
  if (options.group && file.group !== options.group) {
    return false
  }

  // 权限匹配
  if (options.perm && file.perm !== options.perm) {
    return false
  }

  // 空文件匹配
  if (options.empty && file.size > 0) {
    return false
  }

  return true
}

// 格式化ls输出
function formatLsOutput(file) {
  const typeChar = file.type === 'd' ? 'd' : '-'
  const permissions = typeChar + file.perm.split('').map(p => {
    const num = parseInt(p)
    return (num & 4 ? 'r' : '-') + (num & 2 ? 'w' : '-') + (num & 1 ? 'x' : '-')
  }).join('')
  
  const size = file.size.toString().padStart(8)
  const date = new Date(file.mtime).toLocaleDateString()
  const fileName = file.path.split('/').pop()
  
  return `${permissions} 1 ${file.user} ${file.group} ${size} ${date} ${fileName}`
}

// 执行命令
function executeCommand(command, file) {
  if (!command || command.length === 0) return null
  
  const cmd = command.map(arg => arg === '{}' ? file.path : arg).join(' ')
  return `Executing: ${cmd}`
}