/**
 * which - 定位命令
 */

export const which = {
  options: [
    {
      flag: '-a',
      longFlag: '--all',
      description: 'Print all matching executables in PATH|打印PATH中所有匹配的可执行文件',
      type: 'boolean',
      group: 'output'
    },
    {
      flag: '--skip-alias',
      description: 'Skip aliases|跳过别名',
      type: 'boolean',
      group: 'search'
    },
    {
      flag: '--skip-functions',
      description: 'Skip shell function lookup|跳过shell函数查找',
      type: 'boolean',
      group: 'search'
    },
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
  parameters: [
    {
      inputKey: 'command_names',
      description: 'Command names to locate|要定位的命令名称',
      type: 'input',
      required: true,
      placeholder: 'ls grep find...'
    }
  ],
  name: 'which',
  usage: 'which [options] [--] COMMAND [...]',
  difficulty: 2,
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return which.help
    }

    if (args.length === 0) {
      return 'which: missing operand\nTry \'which --help\' for more information.'
    }

    // 模拟的命令路径映射
    const commandPaths = {
      // 基础命令
      'ls': '/bin/ls',
      'cat': '/bin/cat',
      'cd': '/bin/cd',
      'pwd': '/bin/pwd',
      'mkdir': '/bin/mkdir',
      'rmdir': '/bin/rmdir',
      'rm': '/bin/rm',
      'cp': '/bin/cp',
      'mv': '/bin/mv',
      'touch': '/bin/touch',
      'chmod': '/bin/chmod',
      'chown': '/bin/chown',
      'ln': '/bin/ln',
      'find': '/usr/bin/find',
      'echo': '/bin/echo',
      'printf': '/usr/bin/printf',
      'head': '/usr/bin/head',
      'tail': '/usr/bin/tail',
      'more': '/usr/bin/more',
      'less': '/usr/bin/less',
      'whoami': '/usr/bin/whoami',
      'uname': '/bin/uname',
      'which': '/usr/bin/which',
      
      // 文本处理命令
      'grep': '/bin/grep',
      'sed': '/bin/sed',
      'awk': '/usr/bin/awk',
      'sort': '/usr/bin/sort',
      'uniq': '/usr/bin/uniq',
      'wc': '/usr/bin/wc',
      'cut': '/usr/bin/cut',
      'tr': '/usr/bin/tr',
      
      // 系统命令
      'ps': '/bin/ps',
      'top': '/usr/bin/top',
      'kill': '/bin/kill',
      'killall': '/usr/bin/killall',
      'df': '/bin/df',
      'du': '/usr/bin/du',
      'free': '/usr/bin/free',
      'uptime': '/usr/bin/uptime',
      
      // 网络命令
      'ping': '/bin/ping',
      'curl': '/usr/bin/curl',
      'wget': '/usr/bin/wget',
      'netstat': '/bin/netstat',
      'ssh': '/usr/bin/ssh',
      'scp': '/usr/bin/scp',
      
      // 压缩命令
      'tar': '/bin/tar',
      'zip': '/usr/bin/zip',
      'unzip': '/usr/bin/unzip',
      'gzip': '/bin/gzip',
      'gunzip': '/bin/gunzip',
      
      // 权限命令
      'su': '/bin/su',
      'sudo': '/usr/bin/sudo',
      'umask': '/usr/bin/umask',
      
      // 进程命令
      'jobs': '/usr/bin/jobs',
      'bg': '/usr/bin/bg',
      'fg': '/usr/bin/fg',
      'nohup': '/usr/bin/nohup',
      
      // 编辑器
      'vi': '/usr/bin/vi',
      'vim': '/usr/bin/vim',
      'nano': '/usr/bin/nano',
      'emacs': '/usr/bin/emacs',
      
      // Shell内置命令
      'bash': '/bin/bash',
      'sh': '/bin/sh',
      'zsh': '/usr/bin/zsh',
      'fish': '/usr/bin/fish'
    }

    let output = ''
    let showAll = args.includes('-a') || args.includes('--all')
    let skipAlias = args.includes('--skip-alias')
    let skipFunctions = args.includes('--skip-functions')
    
    // 过滤出命令名称
    const commands = args.filter(arg => !arg.startsWith('-'))
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      
      if (commandPaths[command]) {
        output += commandPaths[command]
        
        // 如果使用-a选项，可能显示多个路径
        if (showAll) {
          // 模拟可能的额外路径
          const additionalPaths = {
            'python': ['/usr/bin/python', '/usr/bin/python3'],
            'node': ['/usr/bin/node', '/usr/local/bin/node'],
            'npm': ['/usr/bin/npm', '/usr/local/bin/npm']
          }
          
          if (additionalPaths[command]) {
            output += '\n' + additionalPaths[command].join('\n')
          }
        }
      } else {
        // 命令未找到时，which通常不输出任何内容，只设置退出状态
        // 在模拟环境中，我们可以显示一个提示
        if (i === commands.length - 1 && output === '') {
          return `which: no ${command} in (/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin)`
        }
      }
      
      if (i < commands.length - 1) {
        output += '\n'
      }
    }
    
    return output
  },
  description: 'Locate a command|定位命令',
  category: 'system',
  supportsPipe: true,
  examples: [
    'which ls',
    'which -a python',
    'which grep sed awk',
    'which --help'
  ],
  help: `Usage: which [options] [--] COMMAND [...]|用法: which [选项] [--] 命令 [...]
Write the full path of COMMAND(s) to standard output.|将命令的完整路径写入标准输出。

  -a, --all                print all matching executables in PATH, not just the first|打印PATH中所有匹配的可执行文件，不仅仅是第一个
      --skip-alias         skip aliases|跳过别名
      --skip-functions     skip shell function lookup|跳过shell函数查找
      --help               display this help and exit|显示此帮助信息并退出
      --version            output version information and exit|输出版本信息并退出

Examples|示例:
  which ls                   Show path to ls command|显示ls命令的路径
  which -a python            Show all python executables|显示所有python可执行文件
  which grep sed awk         Show paths to multiple commands|显示多个命令的路径
  which nonexistent          Returns nothing if command not found|如果命令未找到则不返回任何内容

Exit status|退出状态:
 0  if all specified commands are found and executable|如果找到所有指定的命令且可执行
 1  if one or more specified commands is nonexistent or not executable|如果一个或多个指定的命令不存在或不可执行
 2  if an invalid option is specified|如果指定了无效选项

Note: This simulates a typical Linux PATH environment.|注意：这模拟了典型的Linux PATH环境。`
}