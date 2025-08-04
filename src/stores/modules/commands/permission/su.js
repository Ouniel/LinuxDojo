/**
 * su - Switch user identity|切换用户身份
 */

// 模拟密码验证
function simulatePasswordAuth(currentUser, targetUser) {
  // 在真实系统中，这里会进行实际的密码验证
  // 这里我们模拟一个简单的验证过程
  
  if (targetUser === 'root') {
    // 模拟需要root密码
    return {
      success: true,
      message: `Password: \n(Simulating password authentication for root|模拟root密码验证)`
    }
  } else {
    // 模拟需要目标用户密码
    return {
      success: true,
      message: `Password: \n(Simulating password authentication for ${targetUser}|模拟${targetUser}的密码验证)`
    }
  }
}

// 执行用户切换
function switchUser(currentUser, targetUser, options, context) {
  const { login, shell, command, preserve, fast, group } = options
  
  let result = []
  
  // 显示切换信息
  if (login) {
    result.push(`Switching to login shell for ${targetUser}|切换到${targetUser}的登录shell`)
  } else {
    result.push(`Switching to ${targetUser}|切换到${targetUser}`)
  }
  
  // 显示环境信息
  if (preserve) {
    result.push(`Preserving current environment|保持当前环境`)
  } else if (login) {
    result.push(`Loading ${targetUser}'s environment|加载${targetUser}的环境`)
  }
  
  // 显示shell信息
  if (shell !== '/bin/bash') {
    result.push(`Using shell: ${shell}|使用shell: ${shell}`)
  }
  
  // 显示组信息
  if (group) {
    result.push(`Setting primary group to: ${group}|设置主组为: ${group}`)
  }
  
  // 如果有命令要执行
  if (command) {
    result.push(`Executing command as ${targetUser}: ${command}|以${targetUser}身份执行命令: ${command}`)
    result.push(`Command output (simulated)|命令输出（模拟）:`)
    result.push(`$ ${command}`)
    
    // 模拟命令执行结果
    if (command.includes('whoami')) {
      result.push(targetUser)
    } else if (command.includes('pwd')) {
      result.push(targetUser === 'root' ? '/root' : `/home/${targetUser}`)
    } else if (command.includes('id')) {
      const uid = targetUser === 'root' ? '0' : '1000'
      const gid = group || (targetUser === 'root' ? '0' : '1000')
      result.push(`uid=${uid}(${targetUser}) gid=${gid}(${group || targetUser})`)
    } else {
      result.push(`(Command executed as ${targetUser}|命令以${targetUser}身份执行)`)
    }
  } else {
    // 模拟shell提示符变化
    const prompt = targetUser === 'root' ? '#' : '$'
    result.push(``)
    result.push(`New shell session started as ${targetUser}|以${targetUser}身份启动新shell会话`)
    result.push(`Use 'exit' to return to previous user|使用'exit'返回到之前的用户`)
    result.push(`${targetUser}@localhost:${targetUser === 'root' ? '/root' : '/home/' + targetUser}${prompt}`)
  }
  
  return result.join('\n')
}

export const su = {
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return su.help
    }

    // 解析选项
    const login = args.includes('-') || args.includes('-l') || args.includes('--login')
    const shell = args.includes('-s') || args.includes('--shell')
    const command = args.includes('-c') || args.includes('--command')
    const preserve = args.includes('-p') || args.includes('--preserve-environment')
    const fast = args.includes('-f') || args.includes('--fast')
    const group = args.includes('-g') || args.includes('--group')

    // 获取shell参数
    let targetShell = '/bin/bash'
    const shellIndex = args.findIndex(arg => arg === '-s' || arg === '--shell')
    if (shellIndex !== -1 && shellIndex + 1 < args.length) {
      targetShell = args[shellIndex + 1]
    }

    // 获取命令参数
    let targetCommand = null
    const commandIndex = args.findIndex(arg => arg === '-c' || arg === '--command')
    if (commandIndex !== -1 && commandIndex + 1 < args.length) {
      targetCommand = args[commandIndex + 1]
    }

    // 获取组参数
    let targetGroup = null
    const groupIndex = args.findIndex(arg => arg === '-g' || arg === '--group')
    if (groupIndex !== -1 && groupIndex + 1 < args.length) {
      targetGroup = args[groupIndex + 1]
    }

    // 过滤选项参数
    const filteredArgs = args.filter((arg, index) => {
      if (arg.startsWith('-') && arg !== '-') return false
      if (index > 0) {
        const prevArg = args[index - 1]
        if (prevArg === '-s' || prevArg === '--shell' ||
            prevArg === '-c' || prevArg === '--command' ||
            prevArg === '-g' || prevArg === '--group') {
          return false
        }
      }
      return true
    })

    // 确定目标用户
    const targetUser = filteredArgs.length > 0 ? filteredArgs[0] : 'root'
    const currentUser = context.user || 'user'

    try {
      // 检查权限
      if (currentUser !== 'root' && targetUser !== currentUser) {
        // 模拟密码验证
        const passwordResult = simulatePasswordAuth(currentUser, targetUser)
        if (!passwordResult.success) {
          return passwordResult.message
        }
      }

      // 执行用户切换
      return switchUser(currentUser, targetUser, {
        login,
        shell: targetShell,
        command: targetCommand,
        preserve,
        fast,
        group: targetGroup
      }, context)

    } catch (error) {
      return `su: ${error.message}`
    }
  },
  description: 'Switch user identity|切换用户身份',
  category: 'permission',
  requiresArgs: false,
  options: [
    {
      flag: '-',
      longFlag: '--login',
      description: '使shell成为登录shell',
      type: 'boolean',
      group: '登录选项'
    },
    {
      flag: '-l',
      longFlag: '--login',
      description: '使shell成为登录shell',
      type: 'boolean',
      group: '登录选项'
    },
    {
      flag: '-c',
      longFlag: '--command',
      description: '传递单个命令给shell',
      type: 'input',
      inputKey: 'command',
      placeholder: 'ls -la',
      group: '执行选项'
    },
    {
      flag: '-s',
      longFlag: '--shell',
      description: '指定要运行的shell',
      type: 'select',
      inputKey: 'shell',
      options: ['/bin/bash', '/bin/sh', '/bin/zsh', '/bin/csh', '/bin/tcsh'],
      default: '/bin/bash',
      group: '执行选项'
    },
    {
      flag: '-p',
      longFlag: '--preserve-environment',
      description: '不重置环境变量',
      type: 'boolean',
      group: '环境选项'
    },
    {
      flag: '-f',
      longFlag: '--fast',
      description: '传递-f给shell (适用于csh或tcsh)',
      type: 'boolean',
      group: '执行选项'
    },
    {
      flag: '-g',
      longFlag: '--group',
      description: '指定主组',
      type: 'input',
      inputKey: 'group',
      placeholder: 'wheel',
      group: '用户选项'
    },
    {
      description: '目标用户名 (默认为root)',
      type: 'input',
      inputKey: 'username',
      placeholder: 'root',
      required: false
    }
  ],
  examples: [
    'su',
    'su root',
    'su - alice',
    'su -c "ls -la" root',
    'su -s /bin/zsh bob'
  ],
  help: `Usage: su [options] [-] [user [argument...]]

Change the effective user id and group id to that of USER.
A mere - implies -l.   If USER not given, assume root.

Options:
  -, -l, --login               make the shell a login shell
  -c, --command=COMMAND        pass a single COMMAND to the shell with -c
  --session-command=COMMAND    pass a single COMMAND to the shell with -c
                               and do not create a new session
  -f, --fast                   pass -f to the shell (for csh or tcsh)
  -g, --group=GROUP            specify the primary group
  -G, --supp-group=GROUP       specify a supplemental group
  -m, --preserve-environment   do not reset environment variables
  -p                           same as -m
  -s, --shell=SHELL            run SHELL if /etc/shells allows it
  -P, --pty                    create a new pseudo-terminal
      --help     display this help and exit
      --version  output version information and exit

A mere - implies -l.   If USER not given, assume root.

Examples:
  su                    # Switch to root user
  su alice              # Switch to user alice
  su - bob              # Login as bob with full environment
  su -c "whoami" root   # Run command as root
  su -s /bin/zsh alice  # Switch to alice using zsh shell

Note: This is a simulation. In a real system, you would need proper
authentication and the target user must exist.`
}

