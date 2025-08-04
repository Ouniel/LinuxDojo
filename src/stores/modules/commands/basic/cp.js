/**
 * cp - 复制文件或目录
 */

export const cp = {
  options: [
    {
      flag: '-a',
      longFlag: '--archive',
      description: 'Same as -dR --preserve=all|等同于 -dR --preserve=all',
      type: 'boolean'
    },
    {
      flag: '-b',
      longFlag: '--backup',
      description: 'Make a backup of each existing destination file|为每个已存在的目标文件创建备份',
      type: 'boolean'
    },
    {
      flag: '-d',
      longFlag: '--no-dereference',
      description: 'Same as --no-dereference --preserve=links|等同于 --no-dereference --preserve=links',
      type: 'boolean'
    },
    {
      flag: '-f',
      longFlag: '--force',
      description: 'If an existing destination file cannot be opened, remove it and try again|如果无法打开已存在的目标文件，删除它并重试',
      type: 'boolean'
    },
    {
      flag: '-i',
      longFlag: '--interactive',
      description: 'Prompt before overwrite|覆盖前提示确认',
      type: 'boolean'
    },
    {
      flag: '-l',
      longFlag: '--link',
      description: 'Hard link files instead of copying|创建硬链接而不是复制',
      type: 'boolean'
    },
    {
      flag: '-L',
      longFlag: '--dereference',
      description: 'Always follow symbolic links in SOURCE|总是跟随源文件中的符号链接',
      type: 'boolean'
    },
    {
      flag: '-n',
      longFlag: '--no-clobber',
      description: 'Do not overwrite an existing file|不覆盖已存在的文件',
      type: 'boolean'
    },
    {
      flag: '-P',
      longFlag: '--no-dereference',
      description: 'Never follow symbolic links in SOURCE|从不跟随源文件中的符号链接',
      type: 'boolean'
    },
    {
      flag: '-p',
      longFlag: '--preserve',
      description: 'Same as --preserve=mode,ownership,timestamps|等同于 --preserve=mode,ownership,timestamps',
      type: 'boolean'
    },
    {
      flag: '-R',
      longFlag: '--recursive',
      description: 'Copy directories recursively|递归复制目录',
      type: 'boolean'
    },
    {
      flag: '-r',
      longFlag: '--recursive',
      description: 'Copy directories recursively|递归复制目录',
      type: 'boolean'
    },
    {
      flag: '-s',
      longFlag: '--symbolic-link',
      description: 'Make symbolic links instead of copying|创建符号链接而不是复制',
      type: 'boolean'
    },
    {
      flag: '-u',
      longFlag: '--update',
      description: 'Copy only when the SOURCE file is newer than the destination file|仅当源文件比目标文件新时才复制',
      type: 'boolean'
    },
    {
      flag: '-v',
      longFlag: '--verbose',
      description: 'Explain what is being done|详细说明正在执行的操作',
      type: 'boolean'
    },
    {
      flag: '-x',
      longFlag: '--one-file-system',
      description: 'Stay on this file system|保持在此文件系统上',
      type: 'boolean'
    },
    {
      flag: '-t',
      longFlag: '--target-directory',
      description: 'Copy all SOURCE arguments into DIRECTORY|将所有源参数复制到目录中',
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
      return cp.help
    }

    if (args.length < 2) {
      throw new Error('cp: missing destination file operand after \'' + (args[0] || '') + '\'\nTry \'cp --help\' for more information.')
    }

    const recursive = args.includes('-r') || args.includes('-R') || args.includes('--recursive')
    const verbose = args.includes('-v') || args.includes('--verbose')
    const interactive = args.includes('-i') || args.includes('--interactive')
    const force = args.includes('-f') || args.includes('--force')
    const noClobber = args.includes('-n') || args.includes('--no-clobber')
    const update = args.includes('-u') || args.includes('--update')
    const archive = args.includes('-a') || args.includes('--archive')
    const preserveLinks = args.includes('-d') || args.includes('--no-dereference')
    const preserveAll = args.includes('-p') || args.includes('--preserve')
    const backup = args.includes('-b') || args.includes('--backup')
    const targetDirectory = args.includes('-t') ? args[args.indexOf('-t') + 1] : null
    
    const files = args.filter(arg => 
      !arg.startsWith('-') && 
      arg !== targetDirectory
    )
    
    if (files.length < 2 && !targetDirectory) {
      throw new Error('cp: missing file operand\nTry \'cp --help\' for more information.')
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
      throw new Error('cp: missing file operand\nTry \'cp --help\' for more information.')
    }
    
    const results = []
    
    for (const source of sources) {
      // 检查源文件是否存在
      const sourceContent = fs.getFileContent(source)
      if (sourceContent === null) {
        throw new Error(`cp: cannot stat '${source}': No such file or directory`)
      }
      
      // 确定最终目标路径
      let finalDestination = destination
      const sourceInfo = fs.getFileInfo ? fs.getFileInfo(source) : null
      const destInfo = fs.getFileInfo ? fs.getFileInfo(destination) : null
      
      // 如果目标是目录，则在目录中创建同名文件
      if (destInfo && destInfo.type === 'directory') {
        const sourceName = source.split('/').pop()
        finalDestination = destination.endsWith('/') ? 
          destination + sourceName : 
          destination + '/' + sourceName
      }
      
      // 检查是否需要递归复制目录
      if (sourceInfo && sourceInfo.type === 'directory' && !recursive) {
        throw new Error(`cp: -r not specified; omitting directory '${source}'`)
      }
      
      // 检查目标文件是否已存在
      const finalDestContent = fs.getFileContent(finalDestination)
      if (finalDestContent !== null) {
        if (noClobber) {
          continue // 跳过已存在的文件
        }
        if (interactive && !force) {
          // 在模拟环境中跳过交互确认
          // 实际环境中这里会提示用户确认
        }
      }
      
      // 执行复制
      const success = fs.copyFile(source, finalDestination, { recursive })
      if (!success) {
        throw new Error(`cp: cannot create regular file '${finalDestination}': Permission denied`)
      }
      
      if (verbose) {
        results.push(`'${source}' -> '${finalDestination}'`)
      }
    }
    
    return results.join('\n')
  },
  description: 'Copy files or directories|复制文件或目录',
  category: 'file',
  requiresArgs: true,
  examples: [
    'cp source.txt dest.txt',
    'cp file1.txt file2.txt backup/',
    'cp -r sourcedir destdir',
    'cp -v file.txt backup.txt',
    'cp -i file.txt existing.txt',
    'cp -u newer.txt older.txt',
    'cp -a directory/ backup_directory/'
  ],
  help: `Usage|用法: cp [OPTION]... [-T] SOURCE DEST
  or|或:  cp [OPTION]... SOURCE... DIRECTORY
  or|或:  cp [OPTION]... -t DIRECTORY SOURCE...
Copy SOURCE to DEST, or multiple SOURCE(s) to DIRECTORY.|将源文件复制到目标位置，或将多个源文件复制到目录中。

Mandatory arguments to long options are mandatory for short options too.|长选项的必需参数对短选项也是必需的。
  -a, --archive                same as -dR --preserve=all|等同于 -dR --preserve=all
      --attributes-only        don't copy the file data, just the attributes|不复制文件数据，只复制属性
      --backup[=CONTROL]       make a backup of each existing destination file|为每个已存在的目标文件创建备份
  -b                           like --backup but does not accept an argument|类似 --backup 但不接受参数
      --copy-contents          copy contents of special files when recursive|递归时复制特殊文件的内容
  -d                           same as --no-dereference --preserve=links|等同于 --no-dereference --preserve=links
  -f, --force                  if an existing destination file cannot be opened, remove it and try again|如果无法打开已存在的目标文件，删除它并重试
  -i, --interactive            prompt before overwrite|覆盖前提示确认
  -H                           follow command-line symbolic links in SOURCE|跟随源文件中的命令行符号链接
  -l, --link                   hard link files instead of copying|创建硬链接而不是复制
  -L, --dereference            always follow symbolic links in SOURCE|总是跟随源文件中的符号链接
  -n, --no-clobber             do not overwrite an existing file|不覆盖已存在的文件
  -P, --no-dereference         never follow symbolic links in SOURCE|从不跟随源文件中的符号链接
  -p                           same as --preserve=mode,ownership,timestamps|等同于 --preserve=mode,ownership,timestamps
      --preserve[=ATTR_LIST]   preserve the specified attributes|保留指定的属性
      --no-preserve=ATTR_LIST  don't preserve the specified attributes|不保留指定的属性
      --parents                use full source file name under DIRECTORY|在目录下使用完整的源文件名
  -R, -r, --recursive          copy directories recursively|递归复制目录
      --reflink[=WHEN]         control clone/CoW copies|控制克隆/写时复制
      --remove-destination     remove each existing destination file before attempting to open it|在尝试打开前删除每个已存在的目标文件
      --sparse=WHEN            control creation of sparse files|控制稀疏文件的创建
      --strip-trailing-slashes  remove any trailing slashes from each SOURCE argument|从每个源参数中删除尾随斜杠
  -s, --symbolic-link          make symbolic links instead of copying|创建符号链接而不是复制
  -S, --suffix=SUFFIX          override the usual backup suffix|覆盖通常的备份后缀
  -t, --target-directory=DIRECTORY  copy all SOURCE arguments into DIRECTORY|将所有源参数复制到目录中
  -T, --no-target-directory    treat DEST as a normal file|将目标视为普通文件
  -u, --update                 copy only when the SOURCE file is newer than the destination file|仅当源文件比目标文件新时才复制
  -v, --verbose                explain what is being done|详细说明正在执行的操作
  -x, --one-file-system        stay on this file system|保持在此文件系统上
  -Z                           set SELinux security context of destination file to default type|将目标文件的SELinux安全上下文设置为默认类型
      --context[=CTX]          like -Z, or if CTX is specified then set the SELinux or SMACK security context to CTX|类似 -Z，或如果指定了CTX则设置SELinux或SMACK安全上下文
      --help                   display this help and exit|显示此帮助信息并退出
      --version                output version information and exit|输出版本信息并退出

Examples|示例:
  cp file1 file2               Copy file1 to file2|将file1复制为file2
  cp file1 file2 dir/          Copy file1 and file2 to dir/|将file1和file2复制到dir/目录
  cp -r dir1/ dir2/            Copy directory recursively|递归复制目录
  cp -v file1 file2            Copy with verbose output|复制时显示详细输出`
}