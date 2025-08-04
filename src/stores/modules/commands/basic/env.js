/**
 * env - 显示环境变量或在修改的环境中运行程序
 */

export const env = {
  options: [
    {
      flag: '-i',
      longFlag: '--ignore-environment',
      description: 'Start with an empty environment|从空环境开始',
      type: 'boolean',
      group: 'environment'
    },
    {
      flag: '-0',
      longFlag: '--null',
      description: 'End each output line with NUL, not newline|每个输出行以NUL结尾',
      type: 'boolean',
      group: 'output'
    },
    {
      flag: '-u',
      longFlag: '--unset',
      description: 'Remove variable from the environment|从环境中删除变量',
      type: 'input',
      placeholder: 'VARIABLE_NAME',
      group: 'environment'
    },
    {
      flag: '-C',
      longFlag: '--chdir',
      description: 'Change working directory to DIR|将工作目录更改为DIR',
      type: 'input',
      placeholder: '/path/to/directory',
      group: 'environment'
    },
    {
      flag: '-S',
      longFlag: '--split-string',
      description: 'Process and split S into separate arguments|处理并将S分割为单独的参数',
      type: 'input',
      placeholder: 'string_to_split',
      group: 'processing'
    },
    {
      flag: '-v',
      longFlag: '--debug',
      description: 'Print verbose information for each processing step|为每个处理步骤打印详细信息',
      type: 'boolean',
      group: 'output'
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
      inputKey: 'environment_vars',
      description: 'Environment variables (NAME=VALUE)|环境变量（名称=值）',
      type: 'input',
      required: false,
      placeholder: 'PATH=/usr/bin HOME=/tmp'
    },
    {
      inputKey: 'command',
      description: 'Command to run with modified environment|使用修改环境运行的命令',
      type: 'input',
      required: false,
      placeholder: 'ls -la'
    }
  ],
  name: 'env',
  usage: 'env [OPTION]... [-] [NAME=VALUE]... [COMMAND [ARG]...]',
  difficulty: 3,
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return env.help
    }

    let ignoreEnvironment = args.includes('-i') || args.includes('--ignore-environment')
    let nullTerminate = args.includes('-0') || args.includes('--null')
    let unsetVars = []
    let setVars = {}
    let command = null
    let commandArgs = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-u' && i + 1 < args.length) {
        unsetVars.push(args[i + 1])
        i++
      } else if (arg.startsWith('-u')) {
        unsetVars.push(arg.substring(2))
      } else if (arg.includes('=')) {
        const [key, value] = arg.split('=', 2)
        setVars[key] = value
      } else if (!arg.startsWith('-') && !command) {
        command = arg
        commandArgs = args.slice(i + 1)
        break
      }
    }
    
    // 模拟的环境变量
    let environment = {
      'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      'HOME': '/home/favork',
      'USER': 'favork',
      'LOGNAME': 'favork',
      'SHELL': '/bin/bash',
      'TERM': 'xterm-256color',
      'LANG': 'en_US.UTF-8',
      'LC_ALL': 'en_US.UTF-8',
      'PWD': '/home/favork',
      'OLDPWD': '/home/favork',
      'HOSTNAME': 'linux-dojo',
      'EDITOR': 'vim',
      'PAGER': 'less',
      'MANPATH': '/usr/local/man:/usr/local/share/man:/usr/share/man',
      'XDG_CONFIG_HOME': '/home/favork/.config',
      'XDG_DATA_HOME': '/home/favork/.local/share',
      'XDG_CACHE_HOME': '/home/favork/.cache',
      'DISPLAY': ':0',
      'SSH_TTY': '/dev/pts/0',
      'MAIL': '/var/mail/favork',
      'HISTSIZE': '1000',
      'HISTFILESIZE': '2000',
      'PS1': '\\u@\\h:\\w\\$ ',
      'DEBIAN_FRONTEND': 'noninteractive'
    }
    
    if (ignoreEnvironment) {
      environment = {}
    }
    
    // 取消设置变量
    for (const varName of unsetVars) {
      delete environment[varName]
    }
    
    // 设置新变量
    Object.assign(environment, setVars)
    
    if (command) {
      // 如果指定了命令，在模拟环境中运行
      return `[Simulated] Running '${command}' with modified environment:\n${Object.entries(environment).map(([k, v]) => `${k}=${v}`).join('\n')}`
    } else {
      // 显示环境变量
      const terminator = nullTerminate ? '\0' : '\n'
      return Object.entries(environment)
        .map(([key, value]) => `${key}=${value}`)
        .join(terminator)
    }
  },
  description: 'Display environment variables or run program in modified environment|显示环境变量或在修改的环境中运行程序',
  category: 'system',
  supportsPipe: true,
  examples: [
    'env',
    'env PATH=/usr/bin ls',
    'env -i HOME=/tmp bash',
    'env -u PATH printenv',
    'env --help'
  ],
  help: `Usage: env [OPTION]... [-] [NAME=VALUE]... [COMMAND [ARG]...]|用法: env [选项]... [-] [名称=值]... [命令 [参数]...]
Set each NAME to VALUE in the environment and run COMMAND.|在环境中将每个名称设置为值并运行命令。

  -i, --ignore-environment  start with an empty environment|从空环境开始
  -0, --null                end each output line with NUL, not newline|每个输出行以NUL结尾，而不是换行符
  -u, --unset=NAME          remove variable from the environment|从环境中删除变量
  -C, --chdir=DIR           change working directory to DIR|将工作目录更改为DIR
  -S, --split-string=S      process and split S into separate arguments;|处理并将S分割为单独的参数；
                            used to pass multiple arguments on shebang lines|用于在shebang行上传递多个参数
      --block-signal[=SIG]  block delivery of SIG signal(s) to COMMAND|阻止向命令传递SIG信号
      --default-signal[=SIG]  reset handling of SIG signal(s) to the default|将SIG信号的处理重置为默认值
      --ignore-signal[=SIG] set handling of SIG signal(s) to do nothing|将SIG信号的处理设置为不执行任何操作
      --list-signal-handling  list non default signal handling to stderr|将非默认信号处理列表输出到stderr
  -v, --debug               print verbose information for each processing step|为每个处理步骤打印详细信息
      --help                display this help and exit|显示此帮助信息并退出
      --version             output version information and exit|输出版本信息并退出

A mere - implies -i.  If no COMMAND, print the resulting environment.|单独的-意味着-i。如果没有命令，打印结果环境。

Examples|示例:
  env                           Display all environment variables|显示所有环境变量
  env PATH=/usr/bin ls          Run ls with modified PATH|使用修改的PATH运行ls
  env -i HOME=/tmp bash         Start bash with empty environment except HOME|启动bash，除了HOME外环境为空
  env -u PATH printenv          Run printenv without PATH variable|运行printenv但不包含PATH变量
  env VAR1=value1 VAR2=value2 command  Set multiple variables|设置多个变量
  env -0                        Display variables separated by null bytes|显示由空字节分隔的变量

Note: In this simulated environment, commands are not actually executed.|注意：在此模拟环境中，命令实际上不会被执行。
Environment variables are simulated with typical Linux values.|环境变量使用典型的Linux值进行模拟。`
}