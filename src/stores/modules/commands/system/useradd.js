/**
 * useradd 命令实现
 * 添加用户账户
 */

export const useradd = {
  name: 'useradd',
  description: 'Add user account|添加用户账户',
  category: 'system',
  options: [
    {
      name: '-d, --home-dir',
      description: '指定新账户的主目录',
      type: 'input',
      placeholder: '输入主目录路径 (如: /home/john)',
      group: 'directory'
    },
    {
      name: '-s, --shell',
      description: '指定新账户的登录shell',
      type: 'select',
      options: ['/bin/bash', '/bin/sh', '/bin/zsh', '/bin/fish', '/bin/false', '/usr/sbin/nologin'],
      group: 'account'
    },
    {
      name: '-u, --uid',
      description: '指定新账户的用户ID',
      type: 'input',
      placeholder: '输入UID (如: 1001)',
      group: 'account'
    },
    {
      name: '-g, --gid',
      description: '指定主组的名称或ID',
      type: 'input',
      placeholder: '输入组名或GID (如: users, 1000)',
      group: 'group'
    },
    {
      name: '-G, --groups',
      description: '指定附加组列表（逗号分隔）',
      type: 'input',
      placeholder: '输入组列表 (如: wheel,audio,video)',
      group: 'group'
    },
    {
      name: '-c, --comment',
      description: '指定GECOS字段（用户全名等信息）',
      type: 'input',
      placeholder: '输入用户信息 (如: "John Doe")',
      group: 'info'
    },
    {
      name: '-m, --create-home',
      description: '创建用户的主目录',
      type: 'flag',
      group: 'directory'
    },
    {
      name: '-M, --no-create-home',
      description: '不创建用户的主目录',
      type: 'flag',
      group: 'directory'
    },
    {
      name: '-r, --system',
      description: '创建系统账户',
      type: 'flag',
      group: 'account'
    },
    {
      name: '-e, --expiredate',
      description: '设置账户过期日期',
      type: 'input',
      placeholder: '输入日期 (如: 2024-12-31)',
      group: 'security'
    },
    {
      name: '-f, --inactive',
      description: '设置密码非活动期（天数）',
      type: 'input',
      placeholder: '输入天数 (如: 30, -1表示禁用)',
      group: 'security'
    },
    {
      name: '-k, --skel',
      description: '指定包含骨架文件的目录',
      type: 'input',
      placeholder: '输入骨架目录路径 (默认: /etc/skel)',
      group: 'directory'
    },
    {
      name: '-N, --no-user-group',
      description: '不创建与用户同名的组',
      type: 'flag',
      group: 'group'
    },
    {
      name: '-U, --user-group',
      description: '创建与用户同名的组',
      type: 'flag',
      group: 'group'
    },
    {
      name: 'USERNAME',
      description: '要创建的用户名',
      type: 'input',
      placeholder: '输入用户名 (如: john)',
      group: 'target'
    },
    {
      name: '--help',
      description: '显示帮助信息',
      type: 'flag',
      group: 'help'
    },
    {
      name: '--version',
      description: '显示版本信息',
      type: 'flag',
      group: 'help'
    }
  ],
  
  async handler(args, context, fs) {
    const { currentPath } = context
    const fileSystem = fs.fileSystem || fs
    
    // 简化的路径解析函数
    const resolvePath = (filename, basePath) => {
      const pathParts = basePath.split('/').filter(part => part !== '')
      let current = fileSystem['/']
      
      for (const part of pathParts) {
        if (current.children && current.children[part]) {
          current = current.children[part]
        } else {
          return { item: null }
        }
      }
      
      if (current.children && current.children[filename]) {
        return { item: current.children[filename] }
      }
      
      return { item: null }
    }
    try {
      // 检查权限
      const currentUser = context.user || 'user'
      if (currentUser !== 'root') {
        return {
          output: 'useradd: Permission denied. Only root can add users.|useradd: 权限被拒绝。只有root可以添加用户。',
          exitCode: 1
        }
      }
      
      // 解析选项
      let username = null
      let homeDir = null
      let shell = '/bin/bash'
      let uid = null
      let gid = null
      let groups = []
      let comment = ''
      let createHome = true
      let system = false
      let expireDate = null
      let inactive = null
      let skeleton = '/etc/skel'
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        if (arg === '-d' || arg === '--home-dir') {
          if (i + 1 < args.length) {
            homeDir = args[++i]
          }
        } else if (arg === '-s' || arg === '--shell') {
          if (i + 1 < args.length) {
            shell = args[++i]
          }
        } else if (arg === '-u' || arg === '--uid') {
          if (i + 1 < args.length) {
            uid = parseInt(args[++i])
            if (isNaN(uid) || uid < 0) {
              return {
                output: 'useradd: invalid UID value|useradd: 无效的UID值',
                exitCode: 1
              }
            }
          }
        } else if (arg === '-g' || arg === '--gid') {
          if (i + 1 < args.length) {
            gid = args[++i]
          }
        } else if (arg === '-G' || arg === '--groups') {
          if (i + 1 < args.length) {
            groups = args[++i].split(',')
          }
        } else if (arg === '-c' || arg === '--comment') {
          if (i + 1 < args.length) {
            comment = args[++i]
          }
        } else if (arg === '-M' || arg === '--no-create-home') {
          createHome = false
        } else if (arg === '-m' || arg === '--create-home') {
          createHome = true
        } else if (arg === '-r' || arg === '--system') {
          system = true
        } else if (arg === '-e' || arg === '--expiredate') {
          if (i + 1 < args.length) {
            expireDate = args[++i]
          }
        } else if (arg === '-f' || arg === '--inactive') {
          if (i + 1 < args.length) {
            inactive = parseInt(args[++i])
            if (isNaN(inactive) || inactive < -1) {
              return {
                output: 'useradd: invalid inactive value|useradd: 无效的非活动值',
                exitCode: 1
              }
            }
          }
        } else if (arg === '-k' || arg === '--skel') {
          if (i + 1 < args.length) {
            skeleton = args[++i]
          }
        } else if (arg === '--help') {
          return {
            output: this.help.zh,
            exitCode: 0
          }
        } else if (arg.startsWith('-')) {
          return {
            output: `useradd: invalid option: ${arg}|useradd: 无效选项: ${arg}`,
            exitCode: 1
          }
        } else {
          username = arg
        }
      }
      
      if (!username) {
        return {
          output: 'useradd: missing username|useradd: 缺少用户名',
          exitCode: 1
        }
      }
      
      // 验证用户名
      if (!/^[a-z_][a-z0-9_-]*$/.test(username)) {
        return {
          output: `useradd: invalid username '${username}'|useradd: 无效的用户名 '${username}'`,
          exitCode: 1
        }
      }
      
      // 检查用户是否已存在
      const existingUsers = ['root', 'daemon', 'bin', 'sys', 'sync', 'games', 'man', 'lp', 'mail', 'news', 'uucp', 'proxy', 'www-data', 'backup', 'list', 'irc', 'gnats', 'nobody']
      if (existingUsers.includes(username)) {
        return {
          output: `useradd: user '${username}' already exists|useradd: 用户 '${username}' 已存在`,
          exitCode: 9
        }
      }
      
      // 设置默认值
      if (!homeDir) {
        homeDir = system ? `/var/lib/${username}` : `/home/${username}`
      }
      
      if (!uid) {
        uid = system ? Math.floor(Math.random() * 500) + 100 : Math.floor(Math.random() * 60000) + 1000
      }
      
      if (!gid) {
        gid = system ? uid : uid
      }
      
      // 创建用户
      const result = this.createUser({
        username,
        uid,
        gid,
        homeDir,
        shell,
        comment,
        groups,
        createHome,
        system,
        expireDate,
        inactive,
        skeleton
      })
      
      return {
        output: result,
        exitCode: 0
      }
      
    } catch (error) {
      return {
        output: `useradd: ${error.message}`,
        exitCode: 1
      }
    }
  },
  
  createUser(options) {
    const {
      username,
      uid,
      gid,
      homeDir,
      shell,
      comment,
      groups,
      createHome,
      system,
      expireDate,
      inactive,
      skeleton
    } = options
    
    const results = []
    
    // 模拟创建用户过程
    results.push(`Creating user account '${username}'|正在创建用户账户 '${username}'`)
    
    // 添加到 /etc/passwd
    const passwdEntry = `${username}:x:${uid}:${gid}:${comment}:${homeDir}:${shell}`
    results.push(`Adding entry to /etc/passwd: ${passwdEntry}`)
    results.push(`添加条目到 /etc/passwd: ${passwdEntry}`)
    
    // 添加到 /etc/shadow
    const shadowEntry = `${username}:!:${Math.floor(Date.now() / 86400000)}:0:99999:7:::`
    results.push(`Adding entry to /etc/shadow: ${username}:!:...`)
    results.push(`添加条目到 /etc/shadow: ${username}:!:...`)
    
    // 创建主组
    results.push(`Creating group '${username}' with GID ${gid}`)
    results.push(`创建组 '${username}'，GID为 ${gid}`)
    
    // 添加到附加组
    if (groups.length > 0) {
      results.push(`Adding user to groups: ${groups.join(', ')}`)
      results.push(`将用户添加到组: ${groups.join(', ')}`)
    }
    
    // 创建主目录
    if (createHome) {
      results.push(`Creating home directory: ${homeDir}`)
      results.push(`创建主目录: ${homeDir}`)
      
      results.push(`Copying files from ${skeleton} to ${homeDir}`)
      results.push(`从 ${skeleton} 复制文件到 ${homeDir}`)
      
      results.push(`Setting ownership of ${homeDir} to ${username}:${username}`)
      results.push(`设置 ${homeDir} 的所有者为 ${username}:${username}`)
      
      results.push(`Setting permissions of ${homeDir} to 755`)
      results.push(`设置 ${homeDir} 的权限为 755`)
    }
    
    // 设置过期日期
    if (expireDate) {
      results.push(`Setting account expiration date: ${expireDate}`)
      results.push(`设置账户过期日期: ${expireDate}`)
    }
    
    // 设置非活动期
    if (inactive !== null) {
      results.push(`Setting password inactive period: ${inactive} days`)
      results.push(`设置密码非活动期: ${inactive} 天`)
    }
    
    // 系统账户特殊处理
    if (system) {
      results.push(`Created system account '${username}'`)
      results.push(`已创建系统账户 '${username}'`)
    } else {
      results.push(`Created user account '${username}'`)
      results.push(`已创建用户账户 '${username}'`)
    }
    
    // 提示设置密码
    results.push('')
    results.push(`Note: Use 'passwd ${username}' to set the password`)
    results.push(`注意: 使用 'passwd ${username}' 设置密码`)
    
    return results.join('\n')
  },
  
  help: {
    'en': `useradd - Add user account

SYNOPSIS
    useradd [options] username

DESCRIPTION
    useradd is a low level utility for adding users. It adds entries to the
    system account files. The useradd command creates a user account using
    the default values from the system and command line arguments.

OPTIONS
    -d, --home-dir HOME_DIR   Home directory of the new account
    -s, --shell SHELL         Login shell of the new account
    -u, --uid UID             User ID of the new account
    -g, --gid GROUP           Name or ID of the primary group
    -G, --groups GROUPS       List of supplementary groups
    -c, --comment COMMENT     GECOS field of the new account
    -m, --create-home         Create the user's home directory
    -M, --no-create-home      Do not create the user's home directory
    -r, --system              Create a system account
    -e, --expiredate DATE     Expiration date of the new account
    -f, --inactive INACTIVE   Password inactivity period
    -k, --skel SKEL_DIR       Directory containing skeleton files

EXAMPLES
    useradd john                    # Add user john with defaults
    useradd -m -s /bin/bash john    # Add user with home directory
    useradd -r -s /bin/false daemon # Add system account
    useradd -u 1001 -g users john   # Add user with specific UID/GID
    useradd -G wheel,audio john     # Add user to supplementary groups
    useradd -c "John Doe" john      # Add user with comment
    useradd -e 2024-12-31 john      # Add user with expiration date

FILES
    /etc/passwd         User account information
    /etc/shadow         Secure user account information
    /etc/group          Group account information
    /etc/gshadow        Secure group account information
    /etc/default/useradd Default values for account creation
    /etc/skel/          Directory containing default files

NOTES
    - Only root can add users
    - Username must be valid (lowercase, start with letter/underscore)
    - UID must be unique
    - Home directory is created with skeleton files if -m is used
    - System accounts typically have UID < 1000
    - Use passwd command to set password after creation`,

    'zh': `useradd - 添加用户账户

语法
    useradd [选项] 用户名

描述
    useradd 是添加用户的底层工具。它向系统账户文件添加条目。
    useradd 命令使用系统默认值和命令行参数创建用户账户。

选项
    -d, --home-dir 主目录     新账户的主目录
    -s, --shell 外壳         新账户的登录外壳
    -u, --uid UID           新账户的用户ID
    -g, --gid 组            主组的名称或ID
    -G, --groups 组列表      附加组列表
    -c, --comment 注释       新账户的GECOS字段
    -m, --create-home       创建用户的主目录
    -M, --no-create-home    不创建用户的主目录
    -r, --system            创建系统账户
    -e, --expiredate 日期    新账户的过期日期
    -f, --inactive 非活动期  密码非活动期
    -k, --skel 骨架目录      包含骨架文件的目录

示例
    useradd john                    # 使用默认值添加用户john
    useradd -m -s /bin/bash john    # 添加用户并创建主目录
    useradd -r -s /bin/false daemon # 添加系统账户
    useradd -u 1001 -g users john   # 添加指定UID/GID的用户
    useradd -G wheel,audio john     # 添加用户到附加组
    useradd -c "张三" john          # 添加带注释的用户
    useradd -e 2024-12-31 john      # 添加带过期日期的用户

文件
    /etc/passwd         用户账户信息
    /etc/shadow         安全用户账户信息
    /etc/group          组账户信息
    /etc/gshadow        安全组账户信息
    /etc/default/useradd 账户创建的默认值
    /etc/skel/          包含默认文件的目录

注意
    - 只有root可以添加用户
    - 用户名必须有效（小写，以字母/下划线开头）
    - UID必须唯一
    - 如果使用-m，主目录将用骨架文件创建
    - 系统账户通常UID < 1000
    - 创建后使用passwd命令设置密码`
  },
  
  examples: [
    {
      command: 'useradd john',
      description: 'Add user john with default settings|使用默认设置添加用户john'
    },
    {
      command: 'useradd -m john',
      description: 'Add user john and create home directory|添加用户john并创建主目录'
    },
    {
      command: 'useradd -r daemon',
      description: 'Add system account daemon|添加系统账户daemon'
    },
    {
      command: 'useradd -u 1001 -g users john',
      description: 'Add user with specific UID and primary group|添加指定UID和主组的用户'
    },
    {
      command: 'useradd -G wheel,audio john',
      description: 'Add user to supplementary groups|添加用户到附加组'
    }
  ]
}

export default useradd