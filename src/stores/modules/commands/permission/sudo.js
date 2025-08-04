/**
 * sudo - Execute commands as another user|以其他用户身份执行命令
 */

export const sudo = {
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return sudo.help
    }

    if (args.length === 0) {
      return 'usage: sudo -h | -K | -k | -V|用法: sudo -h | -K | -k | -V\nusage: sudo -v [-AknS] [-g group] [-h host] [-p prompt] [-u user]|用法: sudo -v [-AknS] [-g 组] [-h 主机] [-p 提示] [-u 用户]\nusage: sudo -l [-AknS] [-g group] [-h host] [-p prompt] [-U user] [-u user] [command]|用法: sudo -l [-AknS] [-g 组] [-h 主机] [-p 提示] [-U 用户] [-u 用户] [命令]\nusage: sudo [-AbEHknPS] [-r role] [-t type] [-C num] [-g group] [-h host] [-p prompt] [-T timeout] [-u user] [VAR=value] [-i|-s] [<command>]|用法: sudo [-AbEHknPS] [-r 角色] [-t 类型] [-C 数字] [-g 组] [-h 主机] [-p 提示] [-T 超时] [-u 用户] [变量=值] [-i|-s] [<命令>]'
    }

    // 解析选项
    const user = getUserOption(args, ['-u', '--user'])
    const group = getUserOption(args, ['-g', '--group'])
    const list = args.includes('-l') || args.includes('--list')
    const validate = args.includes('-v') || args.includes('--validate')
    const kill = args.includes('-k') || args.includes('--reset-timestamp')
    const killAll = args.includes('-K') || args.includes('--remove-timestamp')
    const background = args.includes('-b') || args.includes('--background')
    const shell = args.includes('-s') || args.includes('--shell')
    const login = args.includes('-i') || args.includes('--login')
    const preserveEnv = args.includes('-E') || args.includes('--preserve-env')
    const nonInteractive = args.includes('-n') || args.includes('--non-interactive')
    const prompt = getUserOption(args, ['-p', '--prompt'])
    const timeout = getUserOption(args, ['-T', '--command-timeout'])

    const currentUser = context.user || 'user'
    const targetUser = user || 'root'

    try {
      if (list) {
        return listSudoPrivileges(currentUser, targetUser, context)
      } else if (validate) {
        return validateSudoAccess(currentUser, context)
      } else if (kill) {
        return resetTimestamp(currentUser)
      } else if (killAll) {
        return removeAllTimestamps(currentUser)
      } else {
        // 执行命令
        const command = getCommand(args)
        if (!command && !shell && !login) {
          return 'sudo: no command specified'
        }

        return executeSudoCommand(currentUser, targetUser, command, {
          group,
          background,
          shell,
          login,
          preserveEnv,
          nonInteractive,
          prompt,
          timeout
        }, context, fs)
      }
    } catch (error) {
      return `sudo: ${error.message}`
    }
  },
  description: 'Execute commands as another user|以其他用户身份执行命令',
  category: 'permission',
  requiresArgs: false,
  options: [
    {
      flag: '-u',
      longFlag: '--user',
      description: '以指定用户身份运行命令',
      type: 'input',
      inputKey: 'user',
      placeholder: 'root',
      group: '用户选项'
    },
    {
      flag: '-g',
      longFlag: '--group',
      description: '以指定组身份运行命令',
      type: 'input',
      inputKey: 'group',
      placeholder: 'wheel',
      group: '用户选项'
    },
    {
      flag: '-l',
      longFlag: '--list',
      description: '列出用户的sudo权限',
      type: 'boolean',
      group: '信息选项'
    },
    {
      flag: '-v',
      longFlag: '--validate',
      description: '更新用户时间戳而不运行命令',
      type: 'boolean',
      group: '认证选项'
    },
    {
      flag: '-k',
      longFlag: '--reset-timestamp',
      description: '使时间戳文件无效',
      type: 'boolean',
      group: '认证选项'
    },
    {
      flag: '-K',
      longFlag: '--remove-timestamp',
      description: '完全删除时间戳文件',
      type: 'boolean',
      group: '认证选项'
    },
    {
      flag: '-s',
      longFlag: '--shell',
      description: '以目标用户身份运行shell',
      type: 'boolean',
      group: '执行选项'
    },
    {
      flag: '-i',
      longFlag: '--login',
      description: '以目标用户身份运行登录shell',
      type: 'boolean',
      group: '执行选项'
    },
    {
      flag: '-b',
      longFlag: '--background',
      description: '在后台运行命令',
      type: 'boolean',
      group: '执行选项'
    },
    {
      flag: '-E',
      longFlag: '--preserve-env',
      description: '运行命令时保留用户环境',
      type: 'boolean',
      group: '环境选项'
    },
    {
      flag: '-n',
      longFlag: '--non-interactive',
      description: '非交互模式，不使用提示',
      type: 'boolean',
      group: '执行选项'
    },
    {
      flag: '-p',
      longFlag: '--prompt',
      description: '使用指定的密码提示',
      type: 'input',
      inputKey: 'prompt',
      placeholder: 'Password: ',
      group: '认证选项'
    },
    {
      flag: '-T',
      longFlag: '--command-timeout',
      description: '命令超时时间（秒）',
      type: 'number',
      inputKey: 'timeout',
      placeholder: '300',
      group: '执行选项'
    },
    {
      description: '要执行的命令',
      type: 'input',
      inputKey: 'command',
      placeholder: 'ls /root',
      required: false
    }
  ],
  examples: [
    'sudo ls /root',
    'sudo -u alice cat /home/alice/file.txt',
    'sudo -l',
    'sudo -s',
    'sudo -i'
  ],
  help: `Usage: sudo -h | -K | -k | -V
       sudo -v [-AknS] [-g group] [-h host] [-p prompt] [-u user]
       sudo -l [-AknS] [-g group] [-h host] [-p prompt] [-U user] [-u user] [command]
       sudo [-AbEHknPS] [-r role] [-t type] [-C num] [-g group] [-h host] [-p prompt]
            [-T timeout] [-u user] [VAR=value] [-i|-s] [<command>]

用法: sudo -h | -K | -k | -V
     sudo -v [-AknS] [-g 组] [-h 主机] [-p 提示] [-u 用户]
     sudo -l [-AknS] [-g 组] [-h 主机] [-p 提示] [-U 用户] [-u 用户] [命令]
     sudo [-AbEHknPS] [-r 角色] [-t 类型] [-C 数字] [-g 组] [-h 主机] [-p 提示]
          [-T 超时] [-u 用户] [变量=值] [-i|-s] [<命令>]

Options|选项:
  -A, --askpass                 use a helper program for password prompting|使用辅助程序进行密码提示
  -b, --background              run command in the background|在后台运行命令
  -B, --bell                    ring bell when prompting|提示时响铃
  -C, --close-from=num          close all file descriptors >= num|关闭所有文件描述符 >= num
  -E, --preserve-env            preserve user environment when running command|运行命令时保留用户环境
      --preserve-env=list       preserve specific environment variables|保留特定环境变量
  -e, --edit                    edit files instead of running a command|编辑文件而不是运行命令
  -g, --group=group             run command as the specified group name or ID|以指定组名或ID运行命令
  -H, --set-home                set HOME variable to target user's home dir|将HOME变量设置为目标用户的主目录
  -h, --help                    display help message and exit|显示帮助信息并退出
  -h, --host=host               run command on host (if supported by plugin)|在主机上运行命令（如果插件支持）
  -i, --login                   run login shell as the target user; a command may also be specified|以目标用户身份运行登录shell；也可以指定命令
  -K, --remove-timestamp        remove timestamp file completely|完全删除时间戳文件
  -k, --reset-timestamp         invalidate timestamp file|使时间戳文件无效
  -l, --list                    list user's privileges or check a specific command; use twice for longer format|列出用户权限或检查特定命令；使用两次获得更长格式
  -n, --non-interactive         non-interactive mode, no prompts are used|非交互模式，不使用提示
  -P, --preserve-groups         preserve group vector instead of setting to target's|保留组向量而不是设置为目标的
  -p, --prompt=prompt           use the specified password prompt|使用指定的密码提示
  -r, --role=role               create SELinux security context with specified role|使用指定角色创建SELinux安全上下文
  -S, --stdin                   read password from standard input|从标准输入读取密码
  -s, --shell                   run shell as the target user; a command may also be specified|以目标用户身份运行shell；也可以指定命令
  -t, --type=type               create SELinux security context with specified type|使用指定类型创建SELinux安全上下文
  -T, --command-timeout=timeout terminate command after the specified time limit|在指定时间限制后终止命令
  -U, --other-user=user         in list mode, display privileges for user|在列表模式下，显示用户的权限
  -u, --user=user               run command (or edit file) as specified user name or ID|以指定用户名或ID运行命令（或编辑文件）
  -V, --version                 display version information and exit|显示版本信息并退出
  -v, --validate                update user's timestamp without running a command|更新用户时间戳而不运行命令
  --                            stop processing command line arguments|停止处理命令行参数

Examples|示例:
  sudo ls /root                 # List root directory as root|以root身份列出root目录
  sudo -u alice whoami          # Run whoami as user alice|以用户alice身份运行whoami
  sudo -g wheel id              # Run id with group wheel|以wheel组运行id
  sudo -s                       # Start shell as root|以root身份启动shell
  sudo -i                       # Start login shell as root|以root身份启动登录shell
  sudo -l                       # List current user's sudo privileges|列出当前用户的sudo权限

Note: This is a simulation. In a real system, proper sudoers configuration
and authentication would be required.
注意：这是一个模拟。在真实系统中，需要适当的sudoers配置和身份验证。`
}

// 获取用户选项值
function getUserOption(args, options) {
  for (const option of options) {
    const index = args.indexOf(option)
    if (index !== -1 && index + 1 < args.length) {
      return args[index + 1]
    }
  }
  return null
}

// 获取要执行的命令
function getCommand(args) {
  const optionsWithValues = ['-u', '--user', '-g', '--group', '-p', '--prompt', '-T', '--command-timeout']
  const filteredArgs = []
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    // 跳过选项
    if (arg.startsWith('-')) {
      // 如果是带值的选项，也跳过下一个参数
      if (optionsWithValues.includes(arg) && i + 1 < args.length) {
        i++ // 跳过选项值
      }
      continue
    }
    
    filteredArgs.push(arg)
  }
  
  return filteredArgs.join(' ')
}

// 列出sudo权限
function listSudoPrivileges(currentUser, targetUser, context) {
  const results = []
  
  results.push(`Matching Defaults entries for ${currentUser} on this host:|此主机上${currentUser}的匹配默认条目:`)
  results.push('    env_reset, mail_badpass, secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin')
  results.push('')
  
  // 模拟sudoers配置
  const sudoRules = getSudoRules(currentUser)
  
  if (sudoRules.length === 0) {
    results.push(`User ${currentUser} may not run sudo on this host.|用户${currentUser}不能在此主机上运行sudo。`)
  } else {
    results.push(`User ${currentUser} may run the following commands on this host:|用户${currentUser}可以在此主机上运行以下命令:`)
    for (const rule of sudoRules) {
      results.push(`    ${rule}`)
    }
  }
  
  return results.join('\n')
}

// 获取sudo规则
function getSudoRules(user) {
  const rules = {
    'root': ['(ALL : ALL) ALL'],
    'admin': ['(ALL) ALL'],
    'user': [
      '(root) /bin/ls, /bin/cat, /bin/grep',
      '(ALL) /usr/bin/apt-get, /usr/bin/apt',
      '(www-data) /usr/sbin/service apache2 *'
    ],
    'alice': ['(root) /bin/systemctl restart nginx'],
    'bob': ['(ALL) NOPASSWD: /bin/mount, /bin/umount']
  }
  
  return rules[user] || []
}

// 验证sudo访问权限
function validateSudoAccess(currentUser, context) {
  const rules = getSudoRules(currentUser)
  
  if (rules.length === 0) {
    return `sudo: ${currentUser} is not in the sudoers file. This incident will be reported.|sudo: ${currentUser}不在sudoers文件中。此事件将被报告。`
  }
  
  // 模拟密码验证
  const lastAuth = context.sudoTimestamp || 0
  const now = Date.now()
  const timeout = 15 * 60 * 1000 // 15分钟超时
  
  if (now - lastAuth > timeout) {
    context.sudoTimestamp = now
    return `[sudo] password for ${currentUser}: [authentication successful]|[sudo] ${currentUser}的密码: [认证成功]`
  } else {
    return 'sudo: timestamp updated|sudo: 时间戳已更新'
  }
}

// 重置时间戳
function resetTimestamp(currentUser) {
  return `sudo: timestamp reset for ${currentUser}|sudo: ${currentUser}的时间戳已重置`
}

// 移除所有时间戳
function removeAllTimestamps(currentUser) {
  return `sudo: timestamps removed for ${currentUser}|sudo: ${currentUser}的时间戳已移除`
}

// 执行sudo命令
function executeSudoCommand(currentUser, targetUser, command, options, context, fs) {
  const results = []
  
  // 检查sudo权限
  const rules = getSudoRules(currentUser)
  if (rules.length === 0) {
    return `sudo: ${currentUser} is not in the sudoers file. This incident will be reported.|sudo: ${currentUser}不在sudoers文件中。此事件将被报告。`
  }
  
  // 验证权限
  if (!checkCommandPermission(currentUser, targetUser, command, rules)) {
    return `sudo: ${currentUser} is not allowed to run '${command}' as ${targetUser} on this host.|sudo: 不允许${currentUser}在此主机上以${targetUser}身份运行'${command}'。`
  }
  
  // 检查认证时间戳
  const authResult = checkAuthentication(currentUser, options, context)
  if (authResult) {
    results.push(authResult)
  }
  
  // 准备执行环境
  const oldContext = { ...context }
  context.user = targetUser
  context.uid = targetUser === 'root' ? 0 : 1000
  context.gid = targetUser === 'root' ? 0 : 1000
  
  if (options.login) {
    context.home = targetUser === 'root' ? '/root' : `/home/${targetUser}`
    context.pwd = context.home
    context.shell = '/bin/bash'
    results.push(`Starting login shell as ${targetUser}|以${targetUser}身份启动登录shell`)
  } else if (options.shell) {
    results.push(`Starting shell as ${targetUser}|以${targetUser}身份启动shell`)
  } else if (!options.preserveEnv) {
    // 重置部分环境变量
    context.path = '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
  }
  
  // 执行命令
  if (command) {
    if (options.background) {
      results.push(`[Running in background] ${command}|[后台运行] ${command}`)
      results.push(`[1] 12345`)
    } else {
      results.push(`Executing as ${targetUser}: ${command}|以${targetUser}身份执行: ${command}`)
      results.push(simulateCommandExecution(command, context, fs))
    }
  } else if (options.shell || options.login) {
    results.push(`${targetUser}@hostname:${context.pwd}# `)
  }
  
  // 恢复上下文（如果不是交互式shell）
  if (command && !options.shell && !options.login) {
    Object.assign(context, oldContext)
  }
  
  return results.join('\n')
}

// 检查命令权限
function checkCommandPermission(user, targetUser, command, rules) {
  // 简化的权限检查
  for (const rule of rules) {
    if (rule.includes('(ALL)') || rule.includes(`(${targetUser})`)) {
      if (rule.includes('ALL') || rule.includes(command.split(' ')[0])) {
        return true
      }
    }
  }
  return false
}

// 检查认证
function checkAuthentication(currentUser, options, context) {
  if (options.nonInteractive) {
    return null // 非交互模式，假设已认证
  }
  
  const lastAuth = context.sudoTimestamp || 0
  const now = Date.now()
  const timeout = 15 * 60 * 1000 // 15分钟超时
  
  if (now - lastAuth > timeout) {
    context.sudoTimestamp = now
    const promptText = options.prompt || `[sudo] password for ${currentUser}: |[sudo] ${currentUser}的密码: `
    return `${promptText}[authentication successful]|[认证成功]`
  }
  
  return null
}

// 模拟命令执行
function simulateCommandExecution(command, context, fs) {
  const [cmd, ...args] = command.split(' ')
  
  // 模拟一些常见命令的输出
  switch (cmd) {
    case 'ls':
      return 'bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var'
    case 'whoami':
      return context.user
    case 'id':
      return `uid=${context.uid}(${context.user}) gid=${context.gid}(${context.user}) groups=${context.gid}(${context.user})`
    case 'pwd':
      return context.pwd || '/root'
    case 'systemctl':
      if (args[0] === 'restart' && args[1]) {
        return `Restarting ${args[1]}... [OK]|正在重启 ${args[1]}... [成功]`
      }
      return 'systemctl: command executed|systemctl: 命令已执行'
    case 'service':
      if (args[1] && args[2]) {
        return `${args[2]} ${args[1]}... [OK]|${args[2]} ${args[1]}... [成功]`
      }
      return 'service: command executed|service: 命令已执行'
    default:
      return `${command}: command executed successfully|${command}: 命令执行成功`
  }
}
