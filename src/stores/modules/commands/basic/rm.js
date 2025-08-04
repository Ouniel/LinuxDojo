/**
 * rm - 删除文件或目录
 */

export const rm = {
  options: [
    {
      name: 'files',
      type: 'input',
      flag: 'files',
      inputKey: 'files',
      description: 'Files or directories to remove|要删除的文件或目录',
      placeholder: 'file1.txt file2.txt directory',
      required: true,
      group: 'target'
    },
    {
      name: '-r',
      flag: '-r',
      type: 'boolean',
      description: 'Remove directories and their contents recursively|递归删除目录及其内容',
      group: 'options'
    },
    {
      name: '-f',
      flag: '-f',
      type: 'boolean',
      description: 'Ignore nonexistent files, never prompt|忽略不存在的文件，从不提示',
      group: 'options'
    },
    {
      name: '-i',
      flag: '-i',
      type: 'boolean',
      description: 'Prompt before every removal|每次删除前提示',
      group: 'options'
    },
    {
      name: '-v',
      flag: '-v',
      type: 'boolean',
      description: 'Explain what is being done|详细说明正在执行的操作',
      group: 'output'
    },
    {
      name: '-d',
      flag: '-d',
      type: 'boolean',
      description: 'Remove empty directories|删除空目录',
      group: 'options'
    }
  ],
  
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return rm.help
    }

    if (args.length === 0) {
      throw new Error('rm: missing operand\nTry \'rm --help\' for more information.')
    }

    const recursive = args.includes('-r') || args.includes('-R') || args.includes('--recursive') || args.includes('-rf')
    const force = args.includes('-f') || args.includes('--force') || args.includes('-rf')
    const interactive = args.includes('-i') || args.includes('--interactive')
    const verbose = args.includes('-v') || args.includes('--verbose')
    const dir = args.includes('-d') || args.includes('--dir')
    const oneFileSystem = args.includes('--one-file-system')
    const preserveRoot = !args.includes('--no-preserve-root')
    
    const files = args.filter(arg => !arg.startsWith('-'))
    
    if (files.length === 0) {
      throw new Error('rm: missing operand\nTry \'rm --help\' for more information.')
    }
    
    const results = []
    
    for (const filename of files) {
      // 保护根目录
      if (preserveRoot && (filename === '/' || filename === '/*')) {
        throw new Error(`rm: it is dangerous to operate recursively on '${filename}'\nrm: use --no-preserve-root to override this failsafe`)
      }

      // 检查是否是目录
      const fileInfo = fs.getFileInfo ? fs.getFileInfo(filename) : null
      if (fileInfo && fileInfo.type === 'directory' && !recursive && !dir) {
        if (!force) {
          throw new Error(`rm: cannot remove '${filename}': Is a directory`)
        }
        continue
      }
      
      // 交互式确认
      if (interactive && !force) {
        // 在模拟环境中跳过交互确认
        // 实际环境中这里会提示用户确认
      }
      
      const success = fs.removeFile(filename, { recursive, force })
      if (!success && !force) {
        throw new Error(`rm: cannot remove '${filename}': No such file or directory`)
      }
      
      if (verbose && success) {
        if (fileInfo && fileInfo.type === 'directory') {
          results.push(`removed directory '${filename}'`)
        } else {
          results.push(`removed '${filename}'`)
        }
      }
    }
    
    return results.join('\n')
  },
  description: 'Remove files and directories|删除文件或目录',
  category: 'file',
  requiresArgs: true,
  examples: [
    'rm file.txt',
    'rm file1.txt file2.txt',
    'rm -r directory',
    'rm -rf directory',
    'rm -v file.txt',
    'rm -i file.txt',
    'rm -d empty_directory'
  ],
  help: `Usage: rm [OPTION]... [FILE]...|用法: rm [选项]... [文件]...
Remove (unlink) the FILE(s).|删除（取消链接）文件。

  -f, --force           ignore nonexistent files and arguments, never prompt|忽略不存在的文件和参数，从不提示
  -i                    prompt before every removal|每次删除前提示
  -r, -R, --recursive   remove directories and their contents recursively|递归删除目录及其内容
  -d, --dir             remove empty directories|删除空目录
  -v, --verbose         explain what is being done|详细说明正在执行的操作
      --help            display this help and exit|显示此帮助信息并退出
      --version         output version information and exit|输出版本信息并退出

By default, rm does not remove directories. Use the --recursive (-r or -R)|默认情况下，rm不删除目录。使用--recursive (-r或-R)
option to remove each listed directory, too, along with all of its contents.|选项来删除列出的每个目录及其所有内容。

Examples|示例:
  rm file.txt                Remove a single file|删除单个文件
  rm file1 file2 file3       Remove multiple files|删除多个文件
  rm -r directory            Remove directory and its contents|删除目录及其内容
  rm -f file.txt             Force remove without prompting|强制删除而不提示
  rm -v file.txt             Remove with verbose output|删除并显示详细输出`
}