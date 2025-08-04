/**
 * whoami - 显示当前用户名
 */

export const whoami = {
  options: [
    {
      flag: '--help',
      description: 'Display this help and exit|显示此帮助信息并退出',
      type: 'boolean',
      group: 'help'
    },
    {
      flag: '--version',
      description: 'Output version information and exit|输出版本信息并退出',
      type: 'boolean',
      group: 'help'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return whoami.help
    }

    if (args.includes('--version')) {
      return 'whoami (GNU coreutils) 8.32\nCopyright (C) 2020 Free Software Foundation, Inc.'
    }

    // 在模拟环境中，返回固定的用户名
    return 'favork'
  },
  name: 'whoami',
  description: 'Print effective userid|显示有效用户ID',
  category: 'system',
  usage: 'whoami [OPTION]...',
  difficulty: 1,
  supportsPipe: true,
  examples: [
    'whoami',
    'whoami --help',
    'whoami --version'
  ],
  help: `Usage: whoami [OPTION]...|用法: whoami [选项]...
Print the user name associated with the current effective user ID.|打印与当前有效用户ID关联的用户名。
Same as id -un.|与id -un相同。

      --help     display this help and exit|显示此帮助信息并退出
      --version  output version information and exit|输出版本信息并退出

Examples|示例:
  whoami                     Print current username|打印当前用户名

Note: In this simulated environment, always returns 'favork'.|注意：在此模拟环境中，总是返回'favork'。`
}
