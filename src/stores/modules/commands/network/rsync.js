/**
 * rsync 命令实现
 * 远程和本地文件同步工具
 */

export const rsync = {
  name: 'rsync',
  description: 'A fast, versatile, remote (and local) file-copying tool|快速、多功能的远程（和本地）文件复制工具',
  options: [
    {
      name: 'source',
      type: 'input',
      flag: 'source',
      description: 'Source file or directory|源文件或目录',
      placeholder: '/path/to/source or user@host:/path/',
      required: true,
      group: 'target'
    },
    {
      name: 'destination',
      type: 'input',
      flag: 'destination',
      description: 'Destination path|目标路径',
      placeholder: '/path/to/dest or user@host:/path/',
      required: true,
      group: 'target'
    },
    {
      name: '-a',
      type: 'boolean',
      description: 'Archive mode (equals -rlptgoD)|归档模式（等于 -rlptgoD）',
      group: 'mode'
    },
    {
      name: '-r',
      type: 'boolean',
      description: 'Recurse into directories|递归到目录中',
      group: 'mode'
    },
    {
      name: '-v',
      type: 'boolean',
      description: 'Increase verbosity|增加详细程度',
      group: 'output'
    },
    {
      name: '-u',
      type: 'boolean',
      description: 'Skip files that are newer on receiver|跳过接收方较新的文件',
      group: 'behavior'
    },
    {
      name: '-a',
      flag: '-a',
      type: 'boolean',
      description: 'Archive mode (equals -rlptgoD)|归档模式（等于 -rlptgoD）',
      group: 'basic'
    },
    {
      name: '-r',
      flag: '-r',
      type: 'boolean',
      description: 'Recurse into directories|递归到目录中',
      group: 'basic'
    },
    {
      name: '-v',
      flag: '-v',
      type: 'boolean',
      description: 'Increase verbosity|增加详细程度',
      group: 'output'
    },
    {
      name: '-u',
      flag: '-u',
      type: 'boolean',
      description: 'Skip files that are newer on receiver|跳过接收方较新的文件',
      group: 'behavior'
    },
    {
      name: '-n',
      flag: '-n',
      type: 'boolean',
      description: 'Show what would be transferred (dry run)|显示将要传输的内容（试运行）',
      group: 'behavior'
    },
    {
      name: '-z',
      flag: '-z',
      type: 'boolean',
      description: 'Compress file data during transfer|传输期间压缩文件数据',
      group: 'performance'
    },
    {
      name: '--delete',
      flag: '--delete',
      type: 'boolean',
      description: 'Delete files that don\'t exist on sender|删除发送方不存在的文件',
      group: 'behavior'
    },
    {
      name: '--progress',
      flag: '--progress',
      type: 'boolean',
      description: 'Show progress during transfer|传输期间显示进度',
      group: 'output'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return rsync.help
    }
    try {
      // 解析选项
      let archive = false
      let verbose = false
      let recursive = false
      let update = false
      let delete_ = false
      let dryRun = false
      let compress = false
      let progress = false
      let exclude = []
      let include = []
      let rsh = 'ssh'
      let port = null
      let sources = []
      let destination = null
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        if (arg === '-a' || arg === '--archive') {
          archive = true
          recursive = true
        } else if (arg === '-v' || arg === '--verbose') {
          verbose = true
        } else if (arg === '-r' || arg === '--recursive') {
          recursive = true
        } else if (arg === '-u' || arg === '--update') {
          update = true
        } else if (arg === '--delete') {
          delete_ = true
        } else if (arg === '-n' || arg === '--dry-run') {
          dryRun = true
        } else if (arg === '-z' || arg === '--compress') {
          compress = true
        } else if (arg === '--progress') {
          progress = true
        } else if (arg === '--exclude') {
          if (i + 1 < args.length) {
            exclude.push(args[++i])
          }
        } else if (arg === '--include') {
          if (i + 1 < args.length) {
            include.push(args[++i])
          }
        } else if (arg === '-e' || arg === '--rsh') {
          if (i + 1 < args.length) {
            rsh = args[++i]
          }
        } else if (arg.startsWith('--rsh=')) {
          rsh = arg.split('=')[1]
        } else if (arg === '--port') {
          if (i + 1 < args.length) {
            port = parseInt(args[++i])
            if (isNaN(port) || port <= 0 || port > 65535) {
              return 'rsync: invalid port number|rsync: 无效的端口号'
            }
          }
        } else if (arg.startsWith('-')) {
          return `rsync: invalid option: ${arg}|rsync: 无效选项: ${arg}`
        } else {
          if (i === args.length - 1) {
            destination = arg
          } else {
            sources.push(arg)
          }
        }
      }
      
      if (sources.length === 0 || !destination) {
        return 'rsync: missing source or destination|rsync: 缺少源或目标\nUsage: rsync [options] source... destination'
      }
      
      // 解析源和目标
      const parsedSources = sources.map(src => parseLocation(src))
      const parsedDestination = parseLocation(destination)
      
      // 模拟rsync同步
      const results = []
      
      if (dryRun) {
        results.push('[DRY RUN] The following operations would be performed:')
        results.push('[试运行] 将执行以下操作:')
        results.push('')
      }
      
      if (verbose) {
        results.push('rsync options:')
        if (archive) results.push('  Archive mode: enabled (preserves permissions, times, etc.)')
        if (recursive) results.push('  Recursive: enabled')
        if (update) results.push('  Update: only newer files')
        if (delete_) results.push('  Delete: remove files not in source')
        if (compress) results.push('  Compression: enabled')
        if (exclude.length > 0) results.push(`  Exclude patterns: ${exclude.join(', ')}`)
        if (include.length > 0) results.push(`  Include patterns: ${include.join(', ')}`)
        results.push('')
      }
      
      let totalFiles = 0
      let totalBytes = 0
      
      for (const source of parsedSources) {
        const syncInfo = simulateSync(source, parsedDestination, {
          archive,
          verbose,
          recursive,
          update,
          delete: delete_,
          dryRun,
          compress,
          progress,
          exclude,
          include,
          rsh,
          port
        })
        
        results.push(syncInfo.output)
        totalFiles += syncInfo.files
        totalBytes += syncInfo.bytes
      }
      
      // 显示总结
      results.push('')
      results.push(`sent ${totalBytes.toLocaleString()} bytes  received ${Math.floor(totalBytes * 0.1).toLocaleString()} bytes  ${Math.floor(totalBytes * 1.1).toLocaleString()} bytes/sec`)
      results.push(`total size is ${totalBytes.toLocaleString()}  speedup is ${(totalBytes / (totalBytes * 1.1)).toFixed(2)}`)
      
      if (dryRun) {
        results.push('')
        results.push('[Note: This was a dry run. No files were actually transferred.]')
        results.push('[注意: 这是试运行。实际上没有传输文件。]')
      }
      
      return results.join('\n')
      
    } catch (error) {
      return `rsync: ${error.message}`
    }
  },
  description: 'A fast, versatile, remote (and local) file-copying tool|快速、多功能的远程（和本地）文件复制工具',
  category: 'network',
  requiresArgs: false,
  examples: [
    'rsync -av source/ dest/',
    'rsync -av source/ user@host:/path/',
    'rsync -av --delete source/ dest/',
    'rsync -avz --progress source/ user@host:/'
  ],
  
  help: `Usage: rsync [options] source... destination

A fast, versatile, remote (and local) file-copying tool|快速、多功能的远程（和本地）文件复制工具

rsync is a file transfer program capable of efficient remote update
using a fast differencing algorithm.
rsync 是一个文件传输程序，能够使用快速差分算法进行高效的远程更新。

Options|选项:
  -a, --archive         Archive mode (equals -rlptgoD)|归档模式（等于 -rlptgoD）
  -r, --recursive       Recurse into directories|递归到目录中
  -v, --verbose         Increase verbosity|增加详细程度
  -u, --update          Skip files that are newer on receiver|跳过接收方较新的文件
  -n, --dry-run         Show what would be transferred|显示将要传输的内容
  -z, --compress        Compress file data during transfer|传输期间压缩文件数据
  --delete              Delete files that don't exist on sender|删除发送方不存在的文件
  --progress            Show progress during transfer|传输期间显示进度
  --exclude=PATTERN     Exclude files matching PATTERN|排除匹配模式的文件
  --include=PATTERN     Include files matching PATTERN|包含匹配模式的文件
  -e, --rsh=COMMAND     Specify remote shell to use|指定要使用的远程shell

Examples|示例:
  rsync -av source/ dest/                    # Archive sync locally|本地归档同步
  rsync -av source/ user@host:/path/         # Sync to remote host|同步到远程主机
  rsync -av --delete source/ dest/           # Sync and delete extras|同步并删除多余文件
  rsync -avz --progress source/ user@host:/  # Compressed with progress|压缩并显示进度
  rsync -n -av source/ dest/                 # Dry run|试运行

Notes|注意:
  - More efficient than cp for large directory trees|对于大型目录树比cp更高效
  - Only transfers differences between files|只传输文件之间的差异
  - Can resume interrupted transfers|可以恢复中断的传输
  - Supports many advanced options for fine control|支持许多高级选项进行精细控制
  - Trailing slash on source affects behavior|源路径的尾部斜杠影响行为`
}

// 解析位置（本地或远程）
function parseLocation(location) {
  if (location.includes(':') && !location.startsWith('/')) {
    const [host, path] = location.split(':', 2)
    const userHost = host.includes('@') ? host.split('@') : [null, host]
    return {
      type: 'remote',
      user: userHost[0],
      host: userHost[1] || userHost[0],
      path: path || '~'
    }
  } else {
    return {
      type: 'local',
      path: location
    }
  }
}

// 模拟同步过程
function simulateSync(source, destination, options) {
  const sourceStr = formatLocation(source)
  const destStr = formatLocation(destination)
  
  let result = []
  let files = 0
  let bytes = 0
  
  if (options.verbose) {
    result.push(`building file list ... done`)
    
    if (source.type === 'remote' || destination.type === 'remote') {
      const host = source.type === 'remote' ? source.host : destination.host
      result.push(`opening connection using: ${options.rsh} ${host}`)
    }
  }
  
  // 模拟文件列表
  const mockFiles = [
    { name: 'file1.txt', size: 1024, modified: '2024-01-15 10:30:00' },
    { name: 'file2.txt', size: 2048, modified: '2024-01-16 14:20:00' },
    { name: 'dir1/', size: 0, modified: '2024-01-14 09:15:00' },
    { name: 'dir1/subfile.txt', size: 512, modified: '2024-01-14 09:16:00' }
  ]
  
  for (const file of mockFiles) {
    // 检查排除模式
    if (options.exclude.some(pattern => file.name.includes(pattern))) {
      if (options.verbose) {
        result.push(`skipping ${file.name} (excluded)`)
      }
      continue
    }
    
    // 检查包含模式
    if (options.include.length > 0 && !options.include.some(pattern => file.name.includes(pattern))) {
      continue
    }
    
    // 检查是否需要更新
    if (options.update) {
      // 模拟检查文件时间
      const needUpdate = Math.random() > 0.5
      if (!needUpdate) {
        if (options.verbose) {
          result.push(`${file.name} is uptodate`)
        }
        continue
      }
    }
    
    files++
    bytes += file.size
    
    if (options.verbose || options.progress) {
      const action = options.dryRun ? '[DRY RUN] would sync' : 'syncing'
      result.push(`${action}: ${file.name} (${file.size} bytes)`)
    }
    
    if (options.progress && !options.dryRun) {
      const progress = Math.floor(Math.random() * 100) + 1
      result.push(`  ${file.name}    ${progress}%  ${file.size}B  ${Math.floor(file.size/1024)}KB/s`)
    }
  }
  
  if (options.delete) {
    // 模拟删除不存在的文件
    const deletedFiles = ['old_file.txt', 'temp.bak']
    for (const file of deletedFiles) {
      if (options.verbose) {
        const action = options.dryRun ? '[DRY RUN] would delete' : 'deleting'
        result.push(`${action}: ${file}`)
      }
    }
  }
  
  return {
    output: result.join('\n'),
    files,
    bytes
  }
}

// 格式化位置显示
function formatLocation(location) {
  if (location.type === 'remote') {
    const userPart = location.user ? `${location.user}@` : ''
    return `${userPart}${location.host}:${location.path}`
  } else {
    return location.path
  }
}

export default rsync
