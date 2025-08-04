/**
 * rmdir - 删除空目录
 */

export const rmdir = {
  options: [
    {
      flag: '--ignore-fail-on-non-empty',
      description: 'Ignore each failure that is solely because a directory is non-empty|忽略仅因目录非空而导致的每个失败',
      type: 'boolean'
    },
    {
      flag: '-p',
      longFlag: '--parents',
      description: 'Remove DIRECTORY and its ancestors|删除目录及其祖先',
      type: 'boolean'
    },
    {
      flag: '-v',
      longFlag: '--verbose',
      description: 'Output a diagnostic for every directory processed|为处理的每个目录输出诊断信息',
      type: 'boolean'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return rmdir.help
    }

    if (args.length === 0) {
      return 'rmdir: missing operand\nTry \'rmdir --help\' for more information.'
    }

    let ignoreFailOnNonEmpty = args.includes('--ignore-fail-on-non-empty')
    let parents = args.includes('-p') || args.includes('--parents')
    let verbose = args.includes('-v') || args.includes('--verbose')
    
    // 过滤出目录名
    const directories = args.filter(arg => !arg.startsWith('-'))
    
    if (directories.length === 0) {
      return 'rmdir: missing operand\nTry \'rmdir --help\' for more information.'
    }

    let output = ''
    let hasErrors = false

    for (const dir of directories) {
      // 检查目录是否存在
      const currentFiles = fs.getCurrentDirectoryContents
      const targetDir = currentFiles.find(file => file.name === dir && file.type === 'directory')
      
      if (!targetDir) {
        output += `rmdir: failed to remove '${dir}': No such file or directory\n`
        hasErrors = true
        continue
      }

      // 在真实环境中，这里会检查目录是否为空
      // 在模拟环境中，我们假设目录为空（因为我们的文件系统结构相对简单）
      
      if (verbose) {
        output += `rmdir: removing directory, '${dir}'\n`
      }

      // 模拟删除成功
      // 在真实实现中，这里会调用文件系统的删除方法
      
      if (parents) {
        // -p 选项：删除目录及其父目录（如果父目录变为空）
        if (verbose) {
          output += `rmdir: removing directory, '${dir}' and its parents if empty\n`
        }
      }
    }

    // 如果有错误但使用了--ignore-fail-on-non-empty，不显示某些错误
    if (hasErrors && ignoreFailOnNonEmpty) {
      // 过滤掉"目录非空"的错误（在真实实现中）
    }

    return output.trim() || (hasErrors ? 'rmdir: operation failed' : '')
  },
  description: 'Remove empty directories|删除空目录',
  category: 'basic',
  supportsPipe: false,
  examples: [
    'rmdir emptydir',
    'rmdir -p path/to/empty/dir',
    'rmdir -v dir1 dir2',
    'rmdir --help'
  ],
  help: `Usage: rmdir [OPTION]... DIRECTORY...|用法: rmdir [选项]... 目录...
Remove the DIRECTORY(ies), if they are empty.|删除目录（如果它们为空）。

      --ignore-fail-on-non-empty|忽略由于目录非空导致的失败
                          ignore each failure that is solely because a directory|忽略仅因目录
                            is non-empty|非空而导致的每个失败
  -p, --parents           remove DIRECTORY and its ancestors; e.g., 'rmdir -p a/b/c' is|删除目录及其祖先；例如，'rmdir -p a/b/c'
                            similar to 'rmdir a/b/c a/b a'|类似于'rmdir a/b/c a/b a'
  -v, --verbose           output a diagnostic for every directory processed|为处理的每个目录输出诊断信息
      --help              display this help and exit|显示此帮助信息并退出
      --version           output version information and exit|输出版本信息并退出

Examples|示例:
  rmdir emptydir              Remove empty directory|删除空目录
  rmdir -p path/to/empty/dir  Remove directory and empty parent directories|删除目录和空的父目录
  rmdir -v dir1 dir2          Remove directories with verbose output|删除目录并显示详细输出
  rmdir --ignore-fail-on-non-empty dir  Ignore non-empty directory errors|忽略非空目录错误

Note: rmdir only removes empty directories. Use 'rm -r' to remove directories with contents.|注意：rmdir只删除空目录。使用'rm -r'删除包含内容的目录。`
}