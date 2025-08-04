/**
 * 基础文件操作命令模块
 */

export const basicCommands = {
  ls: {
    handler: (args, context, fs) => {
      const files = fs.getCurrentDirectoryContents
      const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al')
      const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al')
      const showHidden = args.includes('-A')
      
      let fileList = [...files]
      
      // 添加 . 和 .. 目录（如果使用 -a）
      if (showAll) {
        fileList = [
          { name: '.', type: 'directory', permissions: 'drwxr-xr-x', size: 4096, modified: new Date().toISOString() },
          { name: '..', type: 'directory', permissions: 'drwxr-xr-x', size: 4096, modified: new Date().toISOString() },
          ...fileList
        ]
      } else if (showHidden) {
        // -A 显示隐藏文件但不显示 . 和 ..
        fileList = fileList.filter(f => f.name.startsWith('.') && f.name !== '.' && f.name !== '..')
      } else {
        // 默认不显示隐藏文件
        fileList = fileList.filter(f => !f.name.startsWith('.'))
      }
      
      if (longFormat) {
        const totalBlocks = Math.ceil(fileList.reduce((sum, f) => sum + (f.size || 0), 0) / 1024)
        let output = `total ${totalBlocks}\n`
        
        fileList.forEach(file => {
          const permissions = file.permissions || (file.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--')
          const links = file.type === 'directory' ? '2' : '1'
          const size = (file.size || 0).toString()
          const date = formatDate(file.modified || new Date().toISOString())
          
          output += `${permissions} ${links.padStart(2)} favork favork ${size.padStart(8)} ${date} ${file.name}\n`
        })
        return output.trim()
      }
      
      // 简单格式，按列显示
      const names = fileList.map(f => f.name)
      if (names.length === 0) return ''
      
      // 计算列宽
      const terminalWidth = 80
      const maxNameLength = Math.max(...names.map(n => n.length))
      const columnWidth = maxNameLength + 2
      const columnsPerRow = Math.floor(terminalWidth / columnWidth) || 1
      
      const rows = []
      for (let i = 0; i < names.length; i += columnsPerRow) {
        const row = names.slice(i, i + columnsPerRow)
        rows.push(row.map(name => name.padEnd(columnWidth)).join('').trim())
      }
      
      return rows.join('\n')
    },
    description: 'List directory contents|列出目录内容',
    category: 'file',
    supportsPipe: true,
    examples: [
      'ls',
      'ls -l',
      'ls -la'
    ]
  },

  cat: {
    handler: (args, context, fs) => {
      // 如果没有参数且没有stdin，从stdin读取（模拟交互模式）
      if (args.length === 0 && !context.stdin) {
        return 'cat: reading from stdin (press Ctrl+C to exit)'
      }

      if (context.stdin) {
        return context.stdin
      }

      const results = []
      const showLineNumbers = args.includes('-n')
      const showEnds = args.includes('-E')
      const showTabs = args.includes('-T')
      const showAll = args.includes('-A')
      
      const files = args.filter(arg => !arg.startsWith('-'))
      
      for (const filename of files) {
        const content = fs.getFileContent(filename)
        if (content === null) {
          throw new Error(`cat: ${filename}: No such file or directory`)
        }
        
        let processedContent = content
        
        if (showTabs || showAll) {
          processedContent = processedContent.replace(/\t/g, '^I')
        }
        
        if (showEnds || showAll) {
          processedContent = processedContent.replace(/$/gm, '$')
        }
        
        if (showLineNumbers) {
          const lines = processedContent.split('\n')
          processedContent = lines.map((line, index) => 
            `${(index + 1).toString().padStart(6)}  ${line}`
          ).join('\n')
        }
        
        results.push(processedContent)
      }
      
      return results.join('')
    },
    description: 'Display file contents|显示文件内容',
    category: 'file',
    supportsPipe: true,
    supportsRedirect: true,
    examples: [
      'cat file.txt',
      'cat file1.txt file2.txt',
      'cat -n file.txt'
    ]
  },

  pwd: {
    handler: (args, context, fs) => {
      return fs.currentPath === '/home/favork' ? '/home/favork' : fs.currentPath
    },
    description: 'Print current working directory|显示当前目录',
    category: 'file',
    examples: ['pwd']
  },

  cd: {
    handler: (args, context, fs) => {
      if (args.length === 0) {
        // cd 不带参数，切换到家目录
        const success = fs.changeDirectory('/home/favork')
        if (!success) {
          throw new Error('cd: could not change to home directory')
        }
        return ''
      }

      const target = args[0]
      let actualTarget = target

      // 处理特殊路径
      if (target === '~') {
        actualTarget = '/home/favork'
      } else if (target === '-') {
        // cd - 切换到上一个目录（简化实现）
        actualTarget = '/home/favork'
      }

      const success = fs.changeDirectory(actualTarget)
      
      if (!success) {
        throw new Error(`cd: ${target}: No such file or directory`)
      }
      
      return ''
    },
    description: 'Change directory|切换目录',
    category: 'file',
    examples: [
      'cd',
      'cd ~',
      'cd Documents',
      'cd ..',
      'cd -'
    ]
  },

  mkdir: {
    handler: (args, context, fs) => {
      if (args.length === 0) {
        throw new Error('mkdir: missing operand\nTry \'mkdir --help\' for more information.')
      }

      const parents = args.includes('-p')
      const verbose = args.includes('-v')
      const mode = args.includes('-m') ? args[args.indexOf('-m') + 1] : null
      
      const dirs = args.filter(arg => !arg.startsWith('-') && arg !== mode)
      
      if (dirs.length === 0) {
        throw new Error('mkdir: missing operand\nTry \'mkdir --help\' for more information.')
      }

      const results = []
      
      for (const dirname of dirs) {
        const success = fs.createDirectory(dirname, { parents })
        if (!success) {
          if (parents) {
            throw new Error(`mkdir: cannot create directory '${dirname}': Permission denied`)
          } else {
            throw new Error(`mkdir: cannot create directory '${dirname}': File exists`)
          }
        }
        
        if (verbose) {
          results.push(`mkdir: created directory '${dirname}'`)
        }
      }
      
      return results.join('\n')
    },
    description: 'Create directories|创建目录',
    category: 'file',
    requiresArgs: true,
    examples: [
      'mkdir newdir',
      'mkdir dir1 dir2',
      'mkdir -p path/to/dir',
      'mkdir -v newdir'
    ]
  },

  touch: {
    handler: (args, context, fs) => {
      if (args.length === 0) {
        throw new Error('touch: missing file operand\nTry \'touch --help\' for more information.')
      }

      const files = args.filter(arg => !arg.startsWith('-'))
      
      for (const filename of files) {
        // 如果文件存在，更新时间戳；如果不存在，创建空文件
        const exists = fs.getFileContent(filename) !== null
        if (exists) {
          // 更新时间戳（在模拟环境中简化处理）
          const content = fs.getFileContent(filename)
          fs.writeFile(filename, content)
        } else {
          fs.createFile(filename, '')
        }
      }
      
      return ''
    },
    description: 'Create empty files or update timestamps|创建空文件或更新文件时间戳',
    category: 'file',
    requiresArgs: true,
    examples: [
      'touch newfile.txt',
      'touch file1.txt file2.txt'
    ]
  },

  rm: {
    handler: (args, context, fs) => {
      if (args.length === 0) {
        throw new Error('rm: missing operand\nTry \'rm --help\' for more information.')
      }

      const recursive = args.includes('-r') || args.includes('-R') || args.includes('-rf')
      const force = args.includes('-f') || args.includes('-rf')
      const interactive = args.includes('-i')
      const verbose = args.includes('-v')
      
      const files = args.filter(arg => !arg.startsWith('-'))
      
      if (files.length === 0) {
        throw new Error('rm: missing operand\nTry \'rm --help\' for more information.')
      }
      
      const results = []
      
      for (const filename of files) {
        // 检查是否是目录
        const fileInfo = fs.getFileInfo ? fs.getFileInfo(filename) : null
        if (fileInfo && fileInfo.type === 'directory' && !recursive) {
          if (!force) {
            throw new Error(`rm: cannot remove '${filename}': Is a directory`)
          }
          continue
        }
        
        const success = fs.removeFile(filename, { recursive, force })
        if (!success && !force) {
          throw new Error(`rm: cannot remove '${filename}': No such file or directory`)
        }
        
        if (verbose && success) {
          results.push(`removed '${filename}'`)
        }
      }
      
      return results.join('\n')
    },
    description: 'Remove files or directories|删除文件或目录',
    category: 'file',
    requiresArgs: true,
    examples: [
      'rm file.txt',
      'rm -r directory',
      'rm -rf directory',
      'rm -v file.txt'
    ]
  },

  cp: {
    handler: (args, context, fs) => {
      if (args.length < 2) {
        throw new Error('cp: missing destination file operand after \'' + (args[0] || '') + '\'\nTry \'cp --help\' for more information.')
      }

      const recursive = args.includes('-r') || args.includes('-R')
      const verbose = args.includes('-v')
      const interactive = args.includes('-i')
      const force = args.includes('-f')
      
      const files = args.filter(arg => !arg.startsWith('-'))
      const source = files[0]
      const destination = files[1]
      
      if (!source || !destination) {
        throw new Error('cp: missing file operand\nTry \'cp --help\' for more information.')
      }
      
      const success = fs.copyFile(source, destination, { recursive })
      if (!success) {
        throw new Error(`cp: cannot stat '${source}': No such file or directory`)
      }
      
      if (verbose) {
        return `'${source}' -> '${destination}'`
      }
      
      return ''
    },
    description: 'Copy files or directories|复制文件或目录',
    category: 'file',
    requiresArgs: true,
    examples: [
      'cp source.txt dest.txt',
      'cp -r sourcedir destdir',
      'cp -v file.txt backup.txt'
    ]
  },

  mv: {
    handler: (args, context, fs) => {
      if (args.length < 2) {
        throw new Error('mv: missing destination file operand after \'' + (args[0] || '') + '\'\nTry \'mv --help\' for more information.')
      }

      const verbose = args.includes('-v')
      const interactive = args.includes('-i')
      const force = args.includes('-f')
      
      const files = args.filter(arg => !arg.startsWith('-'))
      const source = files[0]
      const destination = files[1]
      
      if (!source || !destination) {
        throw new Error('mv: missing file operand\nTry \'mv --help\' for more information.')
      }
      
      const success = fs.moveFile(source, destination)
      if (!success) {
        throw new Error(`mv: cannot stat '${source}': No such file or directory`)
      }
      
      if (verbose) {
        return `'${source}' -> '${destination}'`
      }
      
      return ''
    },
    description: 'Move/rename files or directories|移动/重命名文件或目录',
    category: 'file',
    requiresArgs: true,
    examples: [
      'mv oldname.txt newname.txt',
      'mv file.txt /path/to/destination/',
      'mv -v file.txt newfile.txt'
    ]
  }
}

// 工具函数
function formatSize(size) {
  if (size < 1024) return size.toString()
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}K`
  return `${(size / (1024 * 1024)).toFixed(1)}M`
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 180) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).replace(',', '')
  }
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit', 
    year: 'numeric' 
  }).replace(',', '')
}