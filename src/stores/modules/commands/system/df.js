/**
 * df - 显示文件系统磁盘空间使用情况
 */

export const df = {
  options: [
    {
      name: '-a, --all',
      description: '包含伪文件系统、重复和不可访问的文件系统',
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
      name: '-i, --inodes',
      description: '显示inode信息而不是块使用情况',
      type: 'flag',
      group: 'display'
    },
    {
      name: '-k, --kilobytes',
      description: '以千字节为单位显示',
      type: 'flag',
      group: 'format'
    },
    {
      name: '-l, --local',
      description: '仅显示本地文件系统',
      type: 'flag',
      group: 'filter'
    },
    {
      name: '-m, --megabytes',
      description: '以兆字节为单位显示',
      type: 'flag',
      group: 'format'
    },
    {
      name: '-P, --portability',
      description: '使用POSIX输出格式',
      type: 'flag',
      group: 'format'
    },
    {
      name: '-t, --type',
      description: '仅显示指定类型的文件系统',
      type: 'input',
      placeholder: '输入文件系统类型 (如: ext4, tmpfs)',
      group: 'filter'
    },
    {
      name: '-T, --print-type',
      description: '显示文件系统类型',
      type: 'flag',
      group: 'display'
    },
    {
      name: '-x, --exclude-type',
      description: '排除指定类型的文件系统',
      type: 'input',
      placeholder: '输入要排除的文件系统类型',
      group: 'filter'
    },
    {
      name: '--sync',
      description: '在获取使用信息前调用sync',
      type: 'flag',
      group: 'system'
    },
    {
      name: '--total',
      description: '显示总计信息',
      type: 'flag',
      group: 'display'
    },
    {
      name: 'FILE',
      description: '指定要查看的文件或目录',
      type: 'input',
      placeholder: '输入文件或目录路径',
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
      return df.help
    }

    const humanReadable = args.includes('-h') || args.includes('--human-readable')
    const si = args.includes('-H') || args.includes('--si')
    const inodes = args.includes('-i') || args.includes('--inodes')
    const kilobytes = args.includes('-k') || args.includes('--kilobytes')
    const megabytes = args.includes('-m') || args.includes('--megabytes')
    const blockSize = getOptionValue(args, '-B') || getOptionValue(args, '--block-size')
    const fsType = args.includes('-T') || args.includes('--print-type')
    const allFilesystems = args.includes('-a') || args.includes('--all')
    const localOnly = args.includes('-l') || args.includes('--local')
    const excludeType = getOptionValue(args, '-x') || getOptionValue(args, '--exclude-type')
    const includeType = getOptionValue(args, '-t') || getOptionValue(args, '--type')
    const portability = args.includes('-P') || args.includes('--portability')
    const sync = args.includes('--sync')
    const total = args.includes('--total')
    
    // 获取指定的文件系统或目录
    const targets = args.filter(arg => 
      !arg.startsWith('-') && 
      !isOptionValue(arg, args)
    )

    // 生成文件系统数据
    let filesystems = generateFilesystemData()
    
    // 过滤文件系统
    if (!allFilesystems) {
      filesystems = filesystems.filter(fs => !fs.pseudo)
    }
    
    if (localOnly) {
      filesystems = filesystems.filter(fs => fs.local)
    }
    
    if (excludeType) {
      const excludeTypes = excludeType.split(',')
      filesystems = filesystems.filter(fs => !excludeTypes.includes(fs.type))
    }
    
    if (includeType) {
      const includeTypes = includeType.split(',')
      filesystems = filesystems.filter(fs => includeTypes.includes(fs.type))
    }
    
    // 如果指定了目标，只显示相关的文件系统
    if (targets.length > 0) {
      const targetFilesystems = []
      for (const target of targets) {
        const fs = findFilesystemForPath(filesystems, target)
        if (fs && !targetFilesystems.find(f => f.device === fs.device)) {
          targetFilesystems.push(fs)
        }
      }
      filesystems = targetFilesystems
    }
    
    // 格式化输出
    let output = ''
    
    if (inodes) {
      output = formatInodesOutput(filesystems, fsType, portability)
    } else {
      output = formatSpaceOutput(filesystems, {
        humanReadable,
        si,
        kilobytes,
        megabytes,
        blockSize,
        fsType,
        portability
      })
    }
    
    // 添加总计行
    if (total && filesystems.length > 1) {
      const totalStats = calculateTotal(filesystems)
      output += '\n' + formatTotalLine(totalStats, {
        humanReadable,
        si,
        kilobytes,
        megabytes,
        blockSize,
        inodes
      })
    }
    
    return output
  },
  description: 'Display filesystem disk space usage|显示文件系统磁盘空间使用情况',
  category: 'system',
  requiresArgs: false,
  examples: [
    'df                           # Show disk usage for all filesystems|显示所有文件系统的磁盘使用情况',
    'df -h                        # Show disk usage in human readable format|以人类可读格式显示磁盘使用情况',
    'df -H                        # Show disk usage in SI units|以SI单位显示磁盘使用情况',
    'df -i                        # Show inode usage instead of disk usage|显示inode使用情况而非磁盘使用情况',
    'df -T                        # Show filesystem types|显示文件系统类型',
    'df -a                        # Include pseudo filesystems|包含伪文件系统',
    'df -l                        # Show only local filesystems|只显示本地文件系统',
    'df -t ext4                   # Show only ext4 filesystems|只显示ext4文件系统',
    'df /home                     # Show disk usage for /home directory|显示/home目录的磁盘使用情况'
  ],
  help: `Usage: df [OPTION]... [FILE]...
Show information about the file system on which each FILE resides,
or all file systems by default.

Mandatory arguments to long options are mandatory for short options too.
  -a, --all             include pseudo, duplicate, inaccessible file systems
  -B, --block-size=SIZE  scale sizes by SIZE before printing them; e.g.,
                           '-BM' prints sizes in units of 1,048,576 bytes;
                           see SIZE format below
  -h, --human-readable  print sizes in powers of 1024 (e.g., 1023M)
  -H, --si              print sizes in powers of 1000 (e.g., 1.1G)
  -i, --inodes          list inode information instead of block usage
  -k, --kilobytes       like --block-size=1K
  -l, --local           limit listing to local file systems
      --no-sync         do not invoke sync before getting usage info (default)
      --output[=FIELD_LIST]  use the output format defined by FIELD_LIST,
                               or print all fields if FIELD_LIST is omitted.
  -P, --portability     use the POSIX output format
      --sync            invoke sync before getting usage info
      --total           elide all entries insignificant to available space,
                          and produce a grand total
  -t, --type=TYPE       limit listing to file systems of type TYPE
  -T, --print-type      print file system type
  -x, --exclude-type=TYPE   limit listing to file systems not of type TYPE
  -v                    (ignored)
      --help     display this help and exit
      --version  output version information and exit

Display values are in units of the first available SIZE from --block-size,
and the DF_BLOCK_SIZE, BLOCK_SIZE and BLOCKSIZE environment variables.
Otherwise, units default to 1024 bytes (or 512 if POSIXLY_CORRECT is set).

The SIZE argument is an integer and optional unit (example: 10K is 10*1024).
Units are K,M,G,T,P,E,Z,Y (powers of 1024) or KB,MB,... (powers of 1000).

Examples:
  df                    Show disk usage for all mounted filesystems
  df -h                 Show disk usage in human readable format
  df -i                 Show inode usage instead of disk usage
  df -T                 Show filesystem types
  df /home              Show disk usage for /home directory
  df -t ext4            Show only ext4 filesystems
  df -x tmpfs           Exclude tmpfs filesystems`
}

// 生成文件系统数据
function generateFilesystemData() {
  return [
    {
      device: '/dev/sda1',
      mountpoint: '/',
      type: 'ext4',
      totalBlocks: 20971520,    // 20GB in 1K blocks
      usedBlocks: 8388608,      // 8GB used
      availableBlocks: 11534336, // Available
      totalInodes: 1310720,
      usedInodes: 524288,
      availableInodes: 786432,
      local: true,
      pseudo: false
    },
    {
      device: '/dev/sda2',
      mountpoint: '/home',
      type: 'ext4',
      totalBlocks: 52428800,    // 50GB
      usedBlocks: 31457280,     // 30GB used
      availableBlocks: 18350080, // Available
      totalInodes: 3276800,
      usedInodes: 1638400,
      availableInodes: 1638400,
      local: true,
      pseudo: false
    },
    {
      device: 'tmpfs',
      mountpoint: '/tmp',
      type: 'tmpfs',
      totalBlocks: 2097152,     // 2GB
      usedBlocks: 102400,       // 100MB used
      availableBlocks: 1994752,
      totalInodes: 512000,
      usedInodes: 1024,
      availableInodes: 510976,
      local: true,
      pseudo: true
    },
    {
      device: '/dev/sdb1',
      mountpoint: '/var',
      type: 'ext4',
      totalBlocks: 10485760,    // 10GB
      usedBlocks: 6291456,      // 6GB used
      availableBlocks: 3670016,
      totalInodes: 655360,
      usedInodes: 327680,
      availableInodes: 327680,
      local: true,
      pseudo: false
    },
    {
      device: 'proc',
      mountpoint: '/proc',
      type: 'proc',
      totalBlocks: 0,
      usedBlocks: 0,
      availableBlocks: 0,
      totalInodes: 0,
      usedInodes: 0,
      availableInodes: 0,
      local: true,
      pseudo: true
    },
    {
      device: 'sysfs',
      mountpoint: '/sys',
      type: 'sysfs',
      totalBlocks: 0,
      usedBlocks: 0,
      availableBlocks: 0,
      totalInodes: 0,
      usedInodes: 0,
      availableInodes: 0,
      local: true,
      pseudo: true
    }
  ]
}

// 查找路径对应的文件系统
function findFilesystemForPath(filesystems, path) {
  // 简单实现：根据路径前缀匹配
  let bestMatch = null
  let bestMatchLength = 0
  
  for (const fs of filesystems) {
    if (path.startsWith(fs.mountpoint) && fs.mountpoint.length > bestMatchLength) {
      bestMatch = fs
      bestMatchLength = fs.mountpoint.length
    }
  }
  
  return bestMatch || filesystems.find(fs => fs.mountpoint === '/')
}

// 格式化空间使用输出
function formatSpaceOutput(filesystems, options) {
  let output = ''
  
  // 表头
  if (options.portability) {
    output += 'Filesystem'
    if (options.fsType) output += ' Type'
    output += ' 1024-blocks Used Available Capacity Mounted on\n'
  } else {
    output += 'Filesystem'
    if (options.fsType) output += '     Type'
    output += '      Size  Used Avail Use% Mounted on\n'
  }
  
  // 数据行
  for (const fs of filesystems) {
    let line = fs.device.padEnd(20)
    
    if (options.fsType) {
      line += fs.type.padEnd(8)
    }
    
    if (options.portability) {
      // POSIX格式：1K块
      line += fs.totalBlocks.toString().padStart(12)
      line += fs.usedBlocks.toString().padStart(8)
      line += fs.availableBlocks.toString().padStart(12)
      line += calculateUsagePercent(fs.usedBlocks, fs.totalBlocks).padStart(9)
    } else {
      // 默认格式
      const size = formatSize(fs.totalBlocks * 1024, options)
      const used = formatSize(fs.usedBlocks * 1024, options)
      const avail = formatSize(fs.availableBlocks * 1024, options)
      const usePercent = calculateUsagePercent(fs.usedBlocks, fs.totalBlocks)
      
      line += size.padStart(8)
      line += used.padStart(6)
      line += avail.padStart(6)
      line += usePercent.padStart(5)
    }
    
    line += ' ' + fs.mountpoint
    output += line + '\n'
  }
  
  return output.trimEnd()
}

// 格式化inode使用输出
function formatInodesOutput(filesystems, fsType, portability) {
  let output = ''
  
  // 表头
  output += 'Filesystem'
  if (fsType) output += '     Type'
  output += '      Inodes   IUsed   IFree IUse% Mounted on\n'
  
  // 数据行
  for (const fs of filesystems) {
    let line = fs.device.padEnd(20)
    
    if (fsType) {
      line += fs.type.padEnd(8)
    }
    
    line += fs.totalInodes.toString().padStart(12)
    line += fs.usedInodes.toString().padStart(8)
    line += fs.availableInodes.toString().padStart(8)
    line += calculateUsagePercent(fs.usedInodes, fs.totalInodes).padStart(5)
    line += ' ' + fs.mountpoint
    
    output += line + '\n'
  }
  
  return output.trimEnd()
}

// 计算使用百分比
function calculateUsagePercent(used, total) {
  if (total === 0) return '0%'
  const percent = Math.round((used / total) * 100)
  return percent + '%'
}

// 格式化大小
function formatSize(bytes, options) {
  if (options.kilobytes) {
    return Math.ceil(bytes / 1024) + 'K'
  }
  
  if (options.megabytes) {
    return Math.ceil(bytes / (1024 * 1024)) + 'M'
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
  return Math.ceil(bytes / 1024) + 'K'
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

// 计算总计
function calculateTotal(filesystems) {
  const realFilesystems = filesystems.filter(fs => !fs.pseudo && fs.totalBlocks > 0)
  
  return realFilesystems.reduce((total, fs) => ({
    totalBlocks: total.totalBlocks + fs.totalBlocks,
    usedBlocks: total.usedBlocks + fs.usedBlocks,
    availableBlocks: total.availableBlocks + fs.availableBlocks,
    totalInodes: total.totalInodes + fs.totalInodes,
    usedInodes: total.usedInodes + fs.usedInodes,
    availableInodes: total.availableInodes + fs.availableInodes
  }), {
    totalBlocks: 0,
    usedBlocks: 0,
    availableBlocks: 0,
    totalInodes: 0,
    usedInodes: 0,
    availableInodes: 0
  })
}

// 格式化总计行
function formatTotalLine(total, options) {
  let line = 'total'.padEnd(20)
  
  if (options.inodes) {
    line += total.totalInodes.toString().padStart(12)
    line += total.usedInodes.toString().padStart(8)
    line += total.availableInodes.toString().padStart(8)
    line += calculateUsagePercent(total.usedInodes, total.totalInodes).padStart(5)
  } else {
    const size = formatSize(total.totalBlocks * 1024, options)
    const used = formatSize(total.usedBlocks * 1024, options)
    const avail = formatSize(total.availableBlocks * 1024, options)
    const usePercent = calculateUsagePercent(total.usedBlocks, total.totalBlocks)
    
    line += size.padStart(8)
    line += used.padStart(6)
    line += avail.padStart(6)
    line += usePercent.padStart(5)
  }
  
  return line
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
  return ['-B', '--block-size', '-x', '--exclude-type', '-t', '--type'].includes(prevArg)
}