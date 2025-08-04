/**
 * mkdir - 创建目录
 */

export const mkdir = {
  options: [
    {
      name: 'directories',
      type: 'input',
      flag: 'directories',
      inputKey: 'directories',
      description: 'Directories to create|要创建的目录',
      placeholder: 'dir1 dir2 dir3',
      required: true,
      group: 'target'
    },
    {
      name: '-p',
      flag: '-p',
      type: 'boolean',
      description: 'Create parent directories as needed|根据需要创建父目录',
      group: 'options'
    },
    {
      name: '-v',
      flag: '-v',
      type: 'boolean',
      description: 'Print a message for each created directory|为每个创建的目录打印消息',
      group: 'output'
    },
    {
      name: '-m',
      type: 'input',
      flag: '-m',
      inputKey: 'mode',
      description: 'Set file mode (permissions)|设置文件模式（权限）',
      placeholder: '755',
      group: 'permissions'
    }
  ],
  
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return mkdir.help
    }

    if (args.length === 0) {
      throw new Error('mkdir: missing operand\nTry \'mkdir --help\' for more information.')
    }

    const parents = args.includes('-p') || args.includes('--parents')
    const verbose = args.includes('-v') || args.includes('--verbose')
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
    'mkdir dir1 dir2 dir3',
    'mkdir -p path/to/deep/directory',
    'mkdir -v newdir',
    'mkdir -m 755 newdir',
    'mkdir -pv path/to/directory'
  ],
  help: `Usage: mkdir [OPTION]... DIRECTORY...|用法: mkdir [选项]... 目录...
Create the DIRECTORY(ies), if they do not already exist.|创建目录（如果不存在）。

  -m, --mode=MODE   set file mode (as in chmod)|设置文件模式（如chmod）
  -p, --parents     no error if existing, make parent directories as needed|如果存在则不报错，根据需要创建父目录
  -v, --verbose     print a message for each created directory|为每个创建的目录打印消息
      --help        display this help and exit|显示此帮助信息并退出
      --version     output version information and exit|输出版本信息并退出

Examples|示例:
  mkdir newdir              Create directory 'newdir'|创建目录'newdir'
  mkdir dir1 dir2           Create multiple directories|创建多个目录
  mkdir -p a/b/c            Create nested directories|创建嵌套目录
  mkdir -v newdir           Create directory with verbose output|创建目录并显示详细输出
  mkdir -m 755 newdir       Create directory with specific permissions|创建具有特定权限的目录`
}