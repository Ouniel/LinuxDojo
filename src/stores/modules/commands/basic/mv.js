/**
 * mv - 移动/重命名文件或目录
 */

export const mv = {
  options: [
    {
      flag: '-b',
      longFlag: '--backup',
      description: 'Make a backup of each existing destination file|为每个已存在的目标文件创建备份',
      type: 'boolean'
    },
    {
      flag: '-f',
      longFlag: '--force',
      description: 'Do not prompt before overwriting|覆盖前不提示',
      type: 'boolean'
    },
    {
      flag: '-i',
      longFlag: '--interactive',
      description: 'Prompt before overwrite|覆盖前提示确认',
      type: 'boolean'
    },
    {
      flag: '-n',
      longFlag: '--no-clobber',
      description: 'Do not overwrite an existing file|不覆盖已存在的文件',
      type: 'boolean'
    },
    {
      flag: '-u',
      longFlag: '--update',
      description: 'Move only when the SOURCE file is newer than the destination file|仅当源文件比目标文件新时才移动',
      type: 'boolean'
    },
    {
      flag: '-v',
      longFlag: '--verbose',
      description: 'Explain what is being done|详细说明正在执行的操作',
      type: 'boolean'
    },
    {
      flag: '-T',
      longFlag: '--no-target-directory',
      description: 'Treat DEST as a normal file|将目标视为普通文件',
      type: 'boolean'
    },
    {
      flag: '-Z',
      longFlag: '--context',
      description: 'Set SELinux security context of destination file to default type|将目标文件的SELinux安全上下文设置为默认类型',
      type: 'boolean'
    },
    {
      flag: '--strip-trailing-slashes',
      description: 'Remove any trailing slashes from each SOURCE argument|从每个源参数中删除尾随斜杠',
      type: 'boolean'
    },
    {
      flag: '-t',
      longFlag: '--target-directory',
      description: 'Move all SOURCE arguments into DIRECTORY|将所有源参数移动到目录中',
      type: 'string',
      placeholder: 'DIRECTORY'
    },
    {
      flag: '-S',
      longFlag: '--suffix',
      description: 'Override the usual backup suffix|覆盖通常的备份后缀',
      type: 'string',
      placeholder: 'SUFFIX'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return mv.help
    }

    if (args.length < 2) {
      throw new Error('mv: missing destination file operand after \'' + (args[0] || '') + '\'\nTry \'mv --help\' for more information.')
    }

    const verbose = args.includes('-v') || args.includes('--verbose')
    const interactive = args.includes('-i') || args.includes('--interactive')
    const force = args.includes('-f') || args.includes('--force')
    const noClobber = args.includes('-n') || args.includes('--no-clobber')
    const update = args.includes('-u') || args.includes('--update')
    const backup = args.includes('-b') || args.includes('--backup')
    const stripTrailingSlashes = args.includes('--strip-trailing-slashes')
    const targetDirectory = args.includes('-t') ? args[args.indexOf('-t') + 1] : null
    const noTargetDirectory = args.includes('-T') || args.includes('--no-target-directory')
    
    const files = args.filter(arg => 
      !arg.startsWith('-') && 
      arg !== targetDirectory
    )
    
    if (files.length < 2 && !targetDirectory) {
      throw new Error('mv: missing file operand\nTry \'mv --help\' for more information.')
    }
    
    let sources, destination
    
    if (targetDirectory) {
      sources = files
      destination = targetDirectory
    } else {
      sources = files.slice(0, -1)
      destination = files[files.length - 1]
    }
    
    if (sources.length === 0) {
      throw new Error('mv: missing file operand\nTry \'mv --help\' for more information.')
    }
    
    const results = []
    
    for (const source of sources) {
      // 检查源文件是否存在
      const sourceContent = fs.getFileContent(source)
      if (sourceContent === null) {
        throw new Error(`mv: cannot stat '${source}': No such file or directory`)
      }
      
      // 确定最终目标路径
      let finalDestination = destination
      const destInfo = fs.getFileInfo ? fs.getFileInfo(destination) : null
      
      // 如果目标是目录且不是单文件操作，则在目录中创建同名文件
      if (destInfo && destInfo.type === 'directory' && !noTargetDirectory) {
        const sourceName = source.split('/').pop()
        finalDestination = destination.endsWith('/') ? 
          destination + sourceName : 
          destination + '/' + sourceName
      }
      
      // 处理尾部斜杠
      if (stripTrailingSlashes) {
        finalDestination = finalDestination.replace(/\/+$/, '')
      }
      
      // 检查是否是同一个文件
      if (source === finalDestination) {
        throw new Error(`mv: '${source}' and '${finalDestination}' are the same file`)
      }
      
      // 检查目标文件是否已存在
      const finalDestContent = fs.getFileContent(finalDestination)
      if (finalDestContent !== null) {
        if (noClobber) {
          continue // 跳过已存在的文件
        }
        if (interactive && !force) {
          // 在模拟环境中跳过交互确认
          // 实际环境中这里会提示用户确认覆盖
        }
        if (update) {
          // 检查文件时间戳（在模拟环境中简化处理）
          // 实际环境中会比较文件的修改时间
        }
      }
      
      // 执行移动操作
      const success = fs.moveFile(source, finalDestination)
      if (!success) {
        throw new Error(`mv: cannot move '${source}' to '${finalDestination}': Permission denied`)
      }
      
      if (verbose) {
        results.push(`'${source}' -> '${finalDestination}'`)
      }
    }
    
    return results.join('\n')
  },
  description: 'Move/rename files or directories|移动/重命名文件或目录',
  category: 'file',
  requiresArgs: true,
  examples: [
    'mv oldname.txt newname.txt',
    'mv file.txt /path/to/destination/',
    'mv file1.txt file2.txt directory/',
    'mv -v file.txt newfile.txt',
    'mv -i file.txt existing.txt',
    'mv -u newer.txt older.txt',
    'mv directory/ new_location/'
  ],
  help: `Usage|用法: mv [OPTION]... [-T] SOURCE DEST
  or|或:  mv [OPTION]... SOURCE... DIRECTORY
  or|或:  mv [OPTION]... -t DIRECTORY SOURCE...
Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY.|将源文件重命名为目标文件，或将源文件移动到目录中。

Mandatory arguments to long options are mandatory for short options too.|长选项的必需参数对短选项也是必需的。
      --backup[=CONTROL]       make a backup of each existing destination file|为每个已存在的目标文件创建备份
  -b                           like --backup but does not accept an argument|类似 --backup 但不接受参数
  -f, --force                  do not prompt before overwriting|覆盖前不提示
  -i, --interactive            prompt before overwrite|覆盖前提示确认
  -n, --no-clobber             do not overwrite an existing file|不覆盖已存在的文件
If you specify more than one of -i, -f, -n, only the final one takes effect.|如果指定多个 -i, -f, -n 选项，只有最后一个生效。
      --strip-trailing-slashes  remove any trailing slashes from each SOURCE argument|从每个源参数中删除尾随斜杠
  -S, --suffix=SUFFIX          override the usual backup suffix|覆盖通常的备份后缀
  -t, --target-directory=DIRECTORY  move all SOURCE arguments into DIRECTORY|将所有源参数移动到目录中
  -T, --no-target-directory    treat DEST as a normal file|将目标视为普通文件
  -u, --update                 move only when the SOURCE file is newer than the destination file|仅当源文件比目标文件新时才移动
  -v, --verbose                explain what is being done|详细说明正在执行的操作
  -Z, --context                set SELinux security context of destination file to default type|将目标文件的SELinux安全上下文设置为默认类型
      --help                   display this help and exit|显示此帮助信息并退出
      --version                output version information and exit|输出版本信息并退出

The backup suffix is '~', unless set with --suffix or SIMPLE_BACKUP_SUFFIX.|备份后缀为'~'，除非通过--suffix或SIMPLE_BACKUP_SUFFIX设置。
The version control method may be selected via the --backup option or through the VERSION_CONTROL environment variable.|版本控制方法可通过--backup选项或VERSION_CONTROL环境变量选择。Here are the values|可选值:

  none, off       never make backups (even if --backup is given)|从不创建备份（即使指定了--backup）
  numbered, t     make numbered backups|创建编号备份
  existing, nil   numbered if numbered backups exist, simple otherwise|如果存在编号备份则使用编号，否则使用简单备份
  simple, never   always make simple backups|总是创建简单备份

Examples|示例:
  mv file1 file2               Rename file1 to file2|将file1重命名为file2
  mv file1 file2 dir/          Move file1 and file2 to dir/|将file1和file2移动到dir/目录
  mv dir1/ dir2/               Rename directory dir1 to dir2|将目录dir1重命名为dir2
  mv -v file1 file2            Move with verbose output|移动时显示详细输出`
}