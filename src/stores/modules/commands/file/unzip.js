/**
 * unzip - 解压ZIP归档文件
 */

export const unzip = {
  options: [
    // 基本操作
    {
      name: '-l',
      flag: '-l',
      type: 'boolean',
      description: 'List files (short format)|列出文件（简短格式）',
      group: 'operation'
    },
    {
      name: '-v',
      flag: '-v',
      type: 'boolean',
      description: 'List verbosely/show version info|详细列出/显示版本信息',
      group: 'operation'
    },
    {
      name: '-t',
      flag: '-t',
      type: 'boolean',
      description: 'Test compressed archive data|测试压缩归档数据',
      group: 'operation'
    },
    {
      name: '-Z',
      flag: '-Z',
      type: 'boolean',
      description: 'ZipInfo mode|ZipInfo模式',
      group: 'operation'
    },
    // 解压控制
    {
      name: '-d',
      flag: '-d',
      type: 'input',
      inputKey: 'extract_directory',
      description: 'Extract files into directory|解压文件到目录',
      placeholder: '/path/to/directory',
      group: 'extraction'
    },
    {
      name: '-o',
      flag: '-o',
      type: 'boolean',
      description: 'Overwrite files WITHOUT prompting|覆盖文件不提示',
      group: 'extraction'
    },
    {
      name: '-n',
      flag: '-n',
      type: 'boolean',
      description: 'Never overwrite existing files|从不覆盖现有文件',
      group: 'extraction'
    },
    {
      name: '-u',
      flag: '-u',
      type: 'boolean',
      description: 'Update files, create if necessary|更新文件，必要时创建',
      group: 'extraction'
    },
    {
      name: '-f',
      flag: '-f',
      type: 'boolean',
      description: 'Freshen existing files, create none|刷新现有文件，不创建新文件',
      group: 'extraction'
    },
    // 路径处理
    {
      name: '-j',
      flag: '-j',
      type: 'boolean',
      description: 'Junk paths (do not make directories)|丢弃路径（不创建目录）',
      group: 'path'
    },
    {
      name: '-C',
      flag: '-C',
      type: 'boolean',
      description: 'Match filenames case-insensitively|不区分大小写匹配文件名',
      group: 'path'
    },
    {
      name: '-L',
      flag: '-L',
      type: 'boolean',
      description: 'Make (some) names lowercase|将（某些）名称转为小写',
      group: 'path'
    },
    {
      name: '-U',
      flag: '-U',
      type: 'boolean',
      description: 'Make (some) names uppercase|将（某些）名称转为大写',
      group: 'path'
    },
    // 输出控制
    {
      name: '-q',
      flag: '-q',
      type: 'boolean',
      description: 'Quiet mode|安静模式',
      group: 'output'
    },
    {
      name: '-p',
      flag: '-p',
      type: 'boolean',
      description: 'Extract files to pipe, no messages|解压文件到管道，无消息',
      group: 'output'
    },
    {
      name: '-c',
      flag: '-c',
      type: 'boolean',
      description: 'Extract files to stdout/screen|解压文件到标准输出/屏幕',
      group: 'output'
    },
    // 文件选择
    {
      name: '-x',
      flag: '-x',
      type: 'input',
      inputKey: 'exclude_pattern',
      description: 'Exclude files pattern|排除文件模式',
      placeholder: '*.tmp',
      group: 'filter'
    },
    // 安全
    {
      name: '-P',
      flag: '-P',
      type: 'input',
      inputKey: 'password',
      description: 'Use password to decrypt files|使用密码解密文件',
      placeholder: 'password',
      group: 'security'
    },
    // 权限
    {
      name: '-X',
      flag: '-X',
      type: 'boolean',
      description: 'Restore UID/GID info|恢复UID/GID信息',
      group: 'permissions'
    },
    {
      name: '-K',
      flag: '-K',
      type: 'boolean',
      description: 'Keep setuid/setgid/tacky permissions|保持setuid/setgid/粘滞权限',
      group: 'permissions'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return unzip.help
    }

    if (args.length === 0) {
      return 'unzip error: need at least one argument|unzip 错误: 至少需要一个参数\nFor help, type: unzip -h|获取帮助，输入: unzip -h'
    }

    // 解析选项
    const list = args.includes('-l') || args.includes('--list')
    const test = args.includes('-t') || args.includes('--test')
    const verbose = args.includes('-v') || args.includes('--verbose')
    const quiet = args.includes('-q') || args.includes('--quiet')
    const overwrite = args.includes('-o') || args.includes('--overwrite')
    const never = args.includes('-n') || args.includes('--never-overwrite')
    const update = args.includes('-u') || args.includes('--update')
    const freshen = args.includes('-f') || args.includes('--freshen')
    const junkPaths = args.includes('-j') || args.includes('--junk-paths')
    const caseInsensitive = args.includes('-C') || args.includes('--case-insensitive')
    const lowercase = args.includes('-L') || args.includes('--lowercase')
    const uppercase = args.includes('-U') || args.includes('--uppercase')

    // 获取目标目录
    let targetDir = '.'
    const dirIndex = args.indexOf('-d')
    if (dirIndex !== -1 && dirIndex + 1 < args.length) {
      targetDir = args[dirIndex + 1]
    }

    // 获取排除模式
    const excludePatterns = []
    let excludeIndex = args.indexOf('-x')
    while (excludeIndex !== -1 && excludeIndex + 1 < args.length) {
      excludePatterns.push(args[excludeIndex + 1])
      excludeIndex = args.indexOf('-x', excludeIndex + 2)
    }

    // 过滤选项参数
    const filteredArgs = args.filter((arg, index) => {
      if (arg.startsWith('-') && arg !== '-d' && arg !== '-x') return false
      if (index > 0 && (args[index - 1] === '-d' || args[index - 1] === '-x')) return false
      return true
    })

    if (filteredArgs.length === 0) {
      return 'unzip error: Missing archive filename|unzip 错误: 缺少归档文件名'
    }

    const archiveFile = filteredArgs[0]
    const specificFiles = filteredArgs.slice(1)

    try {
      if (list) {
        return listZipContents(archiveFile, { verbose }, fs)
      } else if (test) {
        return testZipIntegrity(archiveFile, fs)
      } else {
        return extractZipArchive(archiveFile, specificFiles, {
          targetDir,
          verbose,
          quiet,
          overwrite,
          never,
          update,
          freshen,
          junkPaths,
          caseInsensitive,
          lowercase,
          uppercase,
          excludePatterns
        }, fs)
      }
    } catch (error) {
      return `unzip error: ${error.message}`
    }
  },
  description: 'Extract ZIP archive files|解压ZIP归档文件',
  category: 'file',
  requiresArgs: true,
  examples: [
    'unzip archive.zip',
    'unzip -l archive.zip',
    'unzip -d /tmp archive.zip',
    'unzip archive.zip file1.txt file2.txt',
    'unzip -j archive.zip'
  ],
  help: `Usage: unzip [-Z] [-opts[modifiers]] file[.zip] [list] [-x xlist] [-d exdir]

Default action is to extract files in zipfile into exdir (current directory if not specified).

  -Z   ZipInfo mode (just "unzip -Z" for usage)
  -l   list files (short format)
  -f   freshen existing files, create none
  -t   test compressed archive data
  -u   update files, create if necessary
  -v   list verbosely/show version info
  -z   display archive comment only
  -p   extract files to pipe, no messages
  -o   overwrite files WITHOUT prompting
  -n   never overwrite existing files
  -j   junk paths (do not make directories)
  -C   match filenames case-insensitively
  -L   make (some) names lowercase
  -U   make (some) names uppercase
  -X   restore UID/GID info
  -V   retain VMS version numbers
  -K   keep setuid/setgid/tacky permissions
  -M   pipe through "more" pager
  -O CHARSET  specify a character encoding for DOS, Windows and OS/2 archives
  -I CHARSET  specify a character encoding for UNIX and other archives

  -q   quiet mode (-qq => quieter)
  -a   auto-convert any text files
  -aa  treat ALL files as text
  -b   treat ALL files as binary
  -bb  treat ALL files as binary and junk PKWARE extra fields
  -c   extract files to stdout/screen ("CRT")
  -cc  extract files to stdout, allow control chars
  -d   extract files into exdir
  -e   extract files into exdir (same as -d)
  -x   exclude files that follow (in xlist)
  -P   use password to decrypt files (NOT secure)

Examples:
  unzip data1 -x joe   => extract all files except joe from zipfile data1.zip
  unzip -p foo | more  => send contents of foo.zip via pipe into program more
  unzip -fo foo ReadMe => quietly replace existing ReadMe if archive file newer

Type 'unzip -Z' for ZipInfo-mode usage.`
}

// 列出ZIP内容
function listZipContents(archiveFile, options, fs) {
  const results = []
  
  results.push(`Archive:  ${archiveFile}|归档:  ${archiveFile}`)
  
  if (options.verbose) {
    results.push(' Length   Method    Size  Cmpr    Date    Time   CRC-32   Name| 长度     方法      大小  压缩    日期      时间   CRC-32   名称')
    results.push('--------  ------  ------- ---- ---------- ----- --------  ----')
  }

  // 模拟ZIP归档内容
  const archiveContents = [
    { name: 'README.md', size: 1024, compressed: 512, method: 'deflate', ratio: 50, date: '01-15-2024', time: '10:30', crc: 'a1b2c3d4' },
    { name: 'src/', size: 0, compressed: 0, method: 'stored', ratio: 0, date: '01-15-2024', time: '10:25', crc: '00000000' },
    { name: 'src/main.js', size: 2048, compressed: 1024, method: 'deflate', ratio: 50, date: '01-15-2024', time: '10:28', crc: 'e5f6g7h8' },
    { name: 'src/utils.js', size: 1536, compressed: 768, method: 'deflate', ratio: 50, date: '01-15-2024', time: '10:27', crc: 'i9j0k1l2' },
    { name: 'package.json', size: 512, compressed: 256, method: 'deflate', ratio: 50, date: '01-15-2024', time: '10:15', crc: 'm3n4o5p6' }
  ]

  let totalSize = 0
  let totalCompressed = 0

  for (const item of archiveContents) {
    totalSize += item.size
    totalCompressed += item.compressed

    if (options.verbose) {
      results.push(`${item.size.toString().padStart(8)}  ${item.method.padEnd(6)} ${item.compressed.toString().padStart(7)} ${item.ratio.toString().padStart(3)}% ${item.date} ${item.time} ${item.crc}  ${item.name}`)
    } else {
      results.push(`  ${item.size.toString().padStart(8)}  ${item.date} ${item.time}   ${item.name}`)
    }
  }

  if (options.verbose) {
    results.push('--------          ------- ---                            -------')
    const overallRatio = totalSize > 0 ? Math.round((1 - totalCompressed / totalSize) * 100) : 0
    results.push(`${totalSize.toString().padStart(8)}          ${totalCompressed.toString().padStart(7)} ${overallRatio.toString().padStart(3)}%                            ${archiveContents.length} files|${archiveContents.length} 个文件`)
  } else {
    results.push('--------                   -------')
    results.push(`${totalSize.toString().padStart(8)}                   ${archiveContents.length} files|${archiveContents.length} 个文件`)
  }

  return results.join('\n')
}

// 测试ZIP完整性
function testZipIntegrity(archiveFile, fs) {
  const results = []
  
  results.push(`Archive:  ${archiveFile}|归档:  ${archiveFile}`)
  
  // 模拟测试过程
  const testFiles = [
    'README.md',
    'src/',
    'src/main.js',
    'src/utils.js',
    'package.json'
  ]

  for (const file of testFiles) {
    results.push(`    testing: ${file}                 OK|    测试: ${file}                 正常`)
  }

  results.push('No errors detected in compressed data of archive.|归档的压缩数据中未检测到错误。')
  return results.join('\n')
}

// 解压ZIP归档
function extractZipArchive(archiveFile, specificFiles, options, fs) {
  const results = []
  
  if (!options.quiet) {
    results.push(`Archive:  ${archiveFile}|归档:  ${archiveFile}`)
  }

  // 模拟解压过程
  const filesToExtract = specificFiles.length > 0 ? specificFiles : [
    'README.md',
    'src/',
    'src/main.js',
    'src/utils.js',
    'package.json'
  ]

  let extractedCount = 0
  let inflatedBytes = 0

  for (const file of filesToExtract) {
    // 检查排除模式
    if (options.excludePatterns.some(pattern => matchPattern(file, pattern))) {
      continue
    }

    const fileSize = getFileSize(file)
    const action = determineExtractionAction(file, options)
    
    if (action === 'skip') {
      if (options.verbose) {
        results.push(`  skipping: ${file}  (file exists)|  跳过: ${file}  (文件已存在)`)
      }
      continue
    }

    extractedCount++
    inflatedBytes += fileSize

    if (options.verbose || !options.quiet) {
      const actionText = action === 'create' ? 'creating' : 
                        action === 'extract' ? 'extracting' : 
                        action === 'inflate' ? 'inflating' : 'extracting'
      
      let targetPath = file
      if (options.junkPaths) {
        targetPath = file.split('/').pop()
      }
      if (options.lowercase) {
        targetPath = targetPath.toLowerCase()
      }
      if (options.uppercase) {
        targetPath = targetPath.toUpperCase()
      }
      if (options.targetDir !== '.') {
        targetPath = `${options.targetDir}/${targetPath}`
      }

      results.push(`  ${actionText}: ${targetPath}`)
    }
  }

  if (!options.quiet) {
    if (extractedCount === 0) {
      results.push('nothing to extract|没有要解压的内容')
    } else {
      results.push(`${extractedCount} file${extractedCount !== 1 ? 's' : ''} extracted|已解压 ${extractedCount} 个文件`)
    }
  }

  return results.join('\n')
}

// 匹配模式
function matchPattern(filename, pattern) {
  // 简单的通配符匹配
  const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'))
  return regex.test(filename)
}

// 获取文件大小
function getFileSize(filename) {
  // 模拟文件大小
  const sizes = {
    'README.md': 1024,
    'src/': 0,
    'src/main.js': 2048,
    'src/utils.js': 1536,
    'package.json': 512
  }
  return sizes[filename] || Math.floor(Math.random() * 5000) + 100
}

// 确定解压动作
function determineExtractionAction(filename, options) {
  const isDirectory = filename.endsWith('/')
  
  if (isDirectory) {
    return 'create'
  }

  // 模拟文件存在检查
  const fileExists = Math.random() > 0.7 // 30% 概率文件已存在

  if (fileExists) {
    if (options.never) {
      return 'skip'
    }
    if (options.update || options.freshen) {
      // 模拟日期比较
      const archiveNewer = Math.random() > 0.5
      return archiveNewer ? 'extract' : 'skip'
    }
    if (!options.overwrite) {
      return 'skip' // 在实际实现中会提示用户
    }
  }

  // 根据文件类型确定动作
  if (filename.match(/\.(txt|md|js|json|html|css)$/)) {
    return 'inflate' // 文本文件通常被压缩
  }

  return 'extract'
}