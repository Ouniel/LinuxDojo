/**
 * du - 显示目录空间使用情况
 */

export const du = {
  options: [
    {
      name: '-0, --null',
      description: '每个输出行以NUL结尾，而不是换行符',
      type: 'flag',
      group: 'output'
    },
    {
      name: '-a, --all',
      description: '显示所有文件的大小，不仅仅是目录',
      type: 'flag',
      group: 'display'
    },
    {
      name: '--apparent-size',
      description: '显示表面大小，而不是磁盘使用量',
      type: 'flag',
      group: 'display'
    },
    {
      name: '-B, --block-size',
      description: '指定块大小单位',
      type: 'input',
      placeholder: '输入块大小 (如: 1K, 1M, 1G)',
      group: 'format'
    },
    {
      name: '-b, --bytes',
      description: '以字节为单位显示大小',
      type: 'flag',
      group: 'format'
    },
    {
      name: '-c, --total',
      description: '显示总计',
      type: 'flag',
      group: 'display'
    },
    {
      name: '-d, --max-depth',
      description: '限制显示的目录深度',
      type: 'input',
      placeholder: '输入最大深度 (如: 1, 2, 3)',
      group: 'display'
    },
    {
      name: '-h, --human-readable',
      description: '以人类可读格式显示大小 (1024的幂)',
      type: 'flag',
      group: 'format'
    },
    {
      name: '-H, --si',
      description: '以SI单位显示大小 (1000的幂)',
      type: 'flag',
      group: 'format'
    },
    {
      name: '-k, --kilobytes',
      description: '以千字节为单位显示',
      type: 'flag',
      group: 'format'
    },
    {
      name: '-L, --dereference',
      description: '解引用所有符号链接',
      type: 'flag',
      group: 'links'
    },
    {
      name: '-l, --count-links',
      description: '如果硬链接，多次计算大小',
      type: 'flag',
      group: 'links'
    },
    {
      name: '-m, --megabytes',
      description: '以兆字节为单位显示',
      type: 'flag',
      group: 'format'
    },
    {
      name: '-S, --separate-dirs',
      description: '对于目录不包含子目录的大小',
      type: 'flag',
      group: 'display'
    },
    {
      name: '-s, --summarize',
      description: '仅显示每个参数的总计',
      type: 'flag',
      group: 'display'
    },
    {
      name: '--time',
      description: '显示最后修改时间',
      type: 'select',
      options: ['', 'atime', 'access', 'use', 'ctime', 'status'],
      group: 'time'
    },
    {
      name: '--time-style',
      description: '时间显示格式',
      type: 'select',
      options: ['full-iso', 'long-iso', 'iso', '+FORMAT'],
      group: 'time'
    },
    {
      name: '-x, --one-file-system',
      description: '跳过不同文件系统上的目录',
      type: 'flag',
      group: 'filter'
    },
    {
      name: '--exclude',
      description: '排除匹配模式的文件',
      type: 'input',
      placeholder: '输入排除模式 (如: "*.tmp")',
      group: 'filter'
    },
    {
      name: '--exclude-from',
      description: '从文件中读取排除模式',
      type: 'input',
      placeholder: '输入包含排除模式的文件路径',
      group: 'filter'
    },
    {
      name: 'FILE',
      description: '指定要分析的文件或目录',
      type: 'input',
      placeholder: '输入文件或目录路径 (默认为当前目录)',
      group: 'target'
    },
    {
      name: '--help',
      description: '显示帮助信息',
      type: 'flag',
      group: 'help'
    },
    {
      name: '--version',
      description: '显示版本信息',
      type: 'flag',
      group: 'help'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return du.help
    }

    const humanReadable = args.includes('-h') || args.includes('--human-readable')
    const si = args.includes('-H') || args.includes('--si')
    const kilobytes = args.includes('-k') || args.includes('--kilobytes')
    const megabytes = args.includes('-m') || args.includes('--megabytes')
    const blockSize = getOptionValue(args, '-B') || getOptionValue(args, '--block-size')
    const summarize = args.includes('-s') || args.includes('--summarize')
    const maxDepth = getOptionValue(args, '-d') || getOptionValue(args, '--max-depth')
    const all = args.includes('-a') || args.includes('--all')
    const apparent = args.includes('--apparent-size')
    const bytes = args.includes('-b') || args.includes('--bytes')
    const count = args.includes('-c') || args.includes('--total')
    const dereference = args.includes('-L') || args.includes('--dereference')
    const oneFileSystem = args.includes('-x') || args.includes('--one-file-system')
    const exclude = getOptionValue(args, '--exclude')
    const excludeFrom = getOptionValue(args, '--exclude-from')
    const time = getOptionValue(args, '--time')
    const timeStyle = getOptionValue(args, '--time-style')
    const nullTerminated = args.includes('-0') || args.includes('--null')
    
    // 获取目标目录
    let targets = args.filter(arg => 
      !arg.startsWith('-') && 
      !isOptionValue(arg, args)
    )

    if (targets.length === 0) {
      targets = ['.']
    }

    const results = []
    let grandTotal = 0

    for (const target of targets) {
      try {
        const usage = calculateDirectoryUsage(target, fs, {
          maxDepth: maxDepth ? parseInt(maxDepth) : null,
          all,
          apparent,
          oneFileSystem,
          exclude,
          excludeFrom,
          summarize
        })

        const formatted = formatUsageOutput(usage, {
          humanReadable,
          si,
          kilobytes,
          megabytes,
          blockSize,
          bytes,
          time,
          timeStyle,
          nullTerminated
        })

        results.push(...formatted)
        grandTotal += usage.reduce((sum, item) => sum + item.size, 0)
      } catch (error) {
        results.push(`du: ${target}: ${error.message}`)
      }
    }

    // 添加总计
    if (count && targets.length > 1) {
      const totalFormatted = formatSize(grandTotal, {
        humanReadable,
        si,
        kilobytes,
        megabytes,
        blockSize,
        bytes
      })
      results.push(`${totalFormatted}\ttotal`)
    }

    return results.join(nullTerminated ? '\0' : '\n')
  },
  description: 'Display directory space usage|显示目录空间使用情况',
  category: 'system',
  requiresArgs: false,
  examples: [
    'du',
    'du -h',
    'du -s',
    'du -a',
    'du -d 1',
    'du -h /home',
    'du -sh *',
    'du --max-depth=2'
  ],
  help: `Usage: du [OPTION]... [FILE]...
  or:  du [OPTION]... --files0-from=F
Summarize disk usage of the set of FILEs, recursively for directories.

Mandatory arguments to long options are mandatory for short options too.
  -0, --null            end each output line with NUL, not newline
  -a, --all             write counts for all files, not just directories
      --apparent-size   print apparent sizes, rather than disk usage; although
                          the apparent size is usually smaller, it may be
                          larger due to holes in ('sparse') files, internal
                          fragmentation, indirect blocks, and the like
  -B, --block-size=SIZE  scale sizes by SIZE before printing them; e.g.,
                           '-BM' prints sizes in units of 1,048,576 bytes;
                           see SIZE format below
  -b, --bytes           equivalent to '--apparent-size --block-size=1'
  -c, --total           produce a grand total
  -D, --dereference-args  dereference only symlinks that are listed on the
                          command line
  -d, --max-depth=N     print the total for a directory (or file, with --all)
                          only if it is N or fewer levels below the command
                          line argument;  --max-depth=0 is the same as
                          --summarize
      --files0-from=F   summarize disk usage of the NUL-terminated file
                          names specified in file F;
                          if F is -, then read names from standard input
  -H, --si              like -h, but use powers of 1000 not 1024
  -h, --human-readable  print sizes in human readable format (e.g., 1K 234M 2G)
      --inodes          list inode usage information instead of block usage
  -k, --kilobytes       like --block-size=1K
  -L, --dereference     dereference all symbolic links
  -l, --count-links     count sizes many times if hard linked
  -m, --megabytes       like --block-size=1M
  -P, --no-dereference  don't follow any symbolic links (this is the default)
  -S, --separate-dirs   for directories do not include size of subdirectories
  -s, --summarize       display only a total for each argument
      --time            show time of the last modification of any file in the
                          directory, or any of its subdirectories
      --time=WORD       show time as WORD instead of modification time:
                          atime, access, use, ctime or status
      --time-style=STYLE  show times using STYLE, which can be:
                            full-iso, long-iso, iso, or +FORMAT;
                            FORMAT is interpreted like in 'date'
  -t, --threshold=SIZE  exclude entries smaller than SIZE if positive,
                          or entries greater than SIZE if negative
      --exclude=PATTERN  exclude files that match PATTERN
      --exclude-from=FILE  exclude files that match any pattern in FILE
  -x, --one-file-system    skip directories on different file systems
  -X, --exclude-from=FILE  exclude files that match any pattern in FILE
      --help     display this help and exit
      --version  output version information and exit

Display values are in units of the first available SIZE from --block-size,
and the DU_BLOCK_SIZE, BLOCK_SIZE and BLOCKSIZE environment variables.
Otherwise, units default to 1024 bytes (or 512 if POSIXLY_CORRECT is set).

The SIZE argument is an integer and optional unit (example: 10K is 10*1024).
Units are K,M,G,T,P,E,Z,Y (powers of 1024) or KB,MB,... (powers of 1000).

Examples:
  du                    Show disk usage for current directory
  du -h                 Show disk usage in human readable format
  du -s                 Show only total for each argument
  du -a                 Show usage for all files, not just directories
  du -d 1               Show usage with max depth of 1 level
  du -h /home           Show usage for /home directory
  du -sh *              Show summary for all items in current directory`
}

// 计算目录使用情况
function calculateDirectoryUsage(path, fs, options) {
  const usage = []
  
  // 模拟目录结构和大小
  const mockStructure = generateMockDirectoryStructure(path)
  
  function processDirectory(dirPath, currentDepth = 0) {
    const items = mockStructure[dirPath] || []
    let totalSize = 0
    
    for (const item of items) {
      const itemPath = `${dirPath}/${item.name}`.replace('//', '/')
      
      if (item.type === 'file') {
        totalSize += item.size
        
        if (options.all) {
          usage.push({
            path: itemPath,
            size: item.size,
            type: 'file',
            mtime: item.mtime
          })
        }
      } else if (item.type === 'directory') {
        if (options.maxDepth === null || currentDepth < options.maxDepth) {
          const subDirSize = processDirectory(itemPath, currentDepth + 1)
          totalSize += subDirSize
          
          if (!options.summarize || currentDepth === 0) {
            usage.push({
              path: itemPath,
              size: subDirSize,
              type: 'directory',
              mtime: item.mtime
            })
          }
        }
      }
    }
    
    return totalSize
  }
  
  const totalSize = processDirectory(path)
  
  if (options.summarize) {
    return [{
      path: path,
      size: totalSize,
      type: 'directory',
      mtime: new Date()
    }]
  }
  
  // 添加根目录总计
  usage.push({
    path: path,
    size: totalSize,
    type: 'directory',
    mtime: new Date()
  })
  
  return usage.sort((a, b) => a.path.localeCompare(b.path))
}

// 生成模拟目录结构
function generateMockDirectoryStructure(basePath) {
  const structure = {}
  
  // 根据路径生成不同的结构
  if (basePath === '.' || basePath === '/') {
    structure[basePath] = [
      { name: 'home', type: 'directory', size: 0, mtime: new Date('2024-01-15') },
      { name: 'var', type: 'directory', size: 0, mtime: new Date('2024-01-10') },
      { name: 'usr', type: 'directory', size: 0, mtime: new Date('2024-01-05') },
      { name: 'etc', type: 'directory', size: 0, mtime: new Date('2024-01-01') },
      { name: 'tmp', type: 'directory', size: 0, mtime: new Date('2024-01-20') }
    ]
    
    structure[`${basePath}/home`] = [
      { name: 'user', type: 'directory', size: 0, mtime: new Date('2024-01-15') },
      { name: 'admin', type: 'directory', size: 0, mtime: new Date('2024-01-12') }
    ]
    
    structure[`${basePath}/home/user`] = [
      { name: 'Documents', type: 'directory', size: 0, mtime: new Date('2024-01-15') },
      { name: 'Downloads', type: 'directory', size: 0, mtime: new Date('2024-01-14') },
      { name: 'Pictures', type: 'directory', size: 0, mtime: new Date('2024-01-13') },
      { name: '.bashrc', type: 'file', size: 3584, mtime: new Date('2024-01-10') },
      { name: '.profile', type: 'file', size: 807, mtime: new Date('2024-01-10') }
    ]
    
    structure[`${basePath}/home/user/Documents`] = [
      { name: 'report.pdf', type: 'file', size: 2048576, mtime: new Date('2024-01-15') },
      { name: 'notes.txt', type: 'file', size: 15360, mtime: new Date('2024-01-14') },
      { name: 'project', type: 'directory', size: 0, mtime: new Date('2024-01-12') }
    ]
    
    structure[`${basePath}/home/user/Documents/project`] = [
      { name: 'src', type: 'directory', size: 0, mtime: new Date('2024-01-12') },
      { name: 'README.md', type: 'file', size: 4096, mtime: new Date('2024-01-12') },
      { name: 'package.json', type: 'file', size: 1024, mtime: new Date('2024-01-11') }
    ]
    
    structure[`${basePath}/home/user/Documents/project/src`] = [
      { name: 'main.js', type: 'file', size: 8192, mtime: new Date('2024-01-12') },
      { name: 'utils.js', type: 'file', size: 4096, mtime: new Date('2024-01-11') },
      { name: 'components', type: 'directory', size: 0, mtime: new Date('2024-01-10') }
    ]
    
    structure[`${basePath}/var`] = [
      { name: 'log', type: 'directory', size: 0, mtime: new Date('2024-01-20') },
      { name: 'cache', type: 'directory', size: 0, mtime: new Date('2024-01-19') },
      { name: 'lib', type: 'directory', size: 0, mtime: new Date('2024-01-10') }
    ]
    
    structure[`${basePath}/var/log`] = [
      { name: 'syslog', type: 'file', size: 10485760, mtime: new Date('2024-01-20') },
      { name: 'auth.log', type: 'file', size: 2097152, mtime: new Date('2024-01-20') },
      { name: 'nginx', type: 'directory', size: 0, mtime: new Date('2024-01-19') }
    ]
  } else {
    // 为其他路径生成简单结构
    structure[basePath] = [
      { name: 'file1.txt', type: 'file', size: 1024, mtime: new Date('2024-01-15') },
      { name: 'file2.txt', type: 'file', size: 2048, mtime: new Date('2024-01-14') },
      { name: 'subdir', type: 'directory', size: 0, mtime: new Date('2024-01-13') }
    ]
    
    structure[`${basePath}/subdir`] = [
      { name: 'nested.txt', type: 'file', size: 512, mtime: new Date('2024-01-13') }
    ]
  }
  
  return structure
}

// 格式化使用情况输出
function formatUsageOutput(usage, options) {
  return usage.map(item => {
    let line = ''
    
    // 格式化大小
    const sizeStr = formatSize(item.size, options)
    line += sizeStr
    
    // 添加时间信息
    if (options.time) {
      const timeStr = formatTime(item.mtime, options.timeStyle)
      line += '\t' + timeStr
    }
    
    // 添加路径
    line += '\t' + item.path
    
    return line
  })
}

// 格式化大小
function formatSize(bytes, options) {
  if (options.bytes) {
    return bytes.toString()
  }
  
  if (options.kilobytes) {
    return Math.ceil(bytes / 1024).toString()
  }
  
  if (options.megabytes) {
    return Math.ceil(bytes / (1024 * 1024)).toString()
  }
  
  if (options.blockSize) {
    const size = parseBlockSize(options.blockSize)
    return Math.ceil(bytes / size).toString()
  }
  
  if (options.humanReadable) {
    return formatHumanReadable(bytes, 1024)
  }
  
  if (options.si) {
    return formatHumanReadable(bytes, 1000)
  }
  
  // 默认：1K块
  return Math.ceil(bytes / 1024).toString()
}

// 人类可读格式
function formatHumanReadable(bytes, base) {
  const units = base === 1024 ? ['B', 'K', 'M', 'G', 'T', 'P'] : ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= base && unitIndex < units.length - 1) {
    size /= base
    unitIndex++
  }
  
  if (unitIndex === 0) {
    return size + units[unitIndex]
  } else if (size >= 10) {
    return Math.round(size) + units[unitIndex]
  } else {
    return size.toFixed(1) + units[unitIndex]
  }
}

// 解析块大小
function parseBlockSize(blockSize) {
  const match = blockSize.match(/^(\d+)([KMGTPE]?)B?$/i)
  if (!match) return 1024
  
  const num = parseInt(match[1])
  const unit = match[2].toUpperCase()
  
  const multipliers = { K: 1024, M: 1024**2, G: 1024**3, T: 1024**4, P: 1024**5, E: 1024**6 }
  return num * (multipliers[unit] || 1)
}

// 格式化时间
function formatTime(date, style) {
  if (!style || style === 'long-iso') {
    return date.toISOString().substring(0, 16).replace('T', ' ')
  } else if (style === 'iso') {
    return date.toISOString().substring(0, 10)
  } else if (style === 'full-iso') {
    return date.toISOString()
  } else if (style.startsWith('+')) {
    // 自定义格式（简化实现）
    return date.toISOString().substring(0, 19).replace('T', ' ')
  }
  
  return date.toISOString().substring(0, 16).replace('T', ' ')
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
  return ['-d', '--max-depth', '-B', '--block-size', '--exclude', '--exclude-from', '--time', '--time-style'].includes(prevArg)
}