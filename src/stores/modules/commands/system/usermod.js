/**
 * usermod 命令实现
 * 修改用户账户
 */

export const usermod = {
  name: 'usermod',
  description: 'Modify user account|修改用户账户',
  category: 'system',
  options: [
    {
      name: '-l, --login',
      description: '更改用户的登录名',
      type: 'input',
      placeholder: '输入新的登录名 (如: newname)',
      group: 'identity'
    },
    {
      name: '-d, --home',
      description: '更改用户的主目录',
      type: 'input',
      placeholder: '输入新的主目录路径 (如: /new/home)',
      group: 'directory'
    },
    {
      name: '-m, --move-home',
      description: '移动主目录的内容到新位置',
      type: 'flag',
      group: 'directory'
    },
    {
      name: '-s, --shell',
      description: '更改用户的登录shell',
      type: 'select',
      options: ['/bin/bash', '/bin/sh', '/bin/zsh', '/bin/fish', '/bin/false', '/usr/sbin/nologin'],
      group: 'account'
    },
    {
      name: '-u, --uid',
      description: '更改用户的UID',
      type: 'input',
      placeholder: '输入新的UID (如: 1001)',
      group: 'identity'
    },
    {
      name: '-g, --gid',
      description: '更改用户的主组',
      type: 'input',
      placeholder: '输入组名或GID (如: staff, 1000)',
      group: 'group'
    },
    {
      name: '-G, --groups',
      description: '设置用户的附加组列表（逗号分隔）',
      type: 'input',
      placeholder: '输入组列表 (如: wheel,audio,video)',
      group: 'group'
    },
    {
      name: '-a, --append',
      description: '将用户追加到附加组（与-G一起使用）',
      type: 'flag',
      group: 'group'
    },
    {
      name: '-c, --comment',
      description: '更改用户的GECOS字段（全名等信息）',
      type: 'input',
      placeholder: '输入用户信息 (如: "John Doe")',
      group: 'info'
    },
    {
      name: '-L, --lock',
      description: '锁定用户账户',
      type: 'flag',
      group: 'security'
    },
    {
      name: '-U, --unlock',
      description: '解锁用户账户',
      type: 'flag',
      group: 'security'
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
      name: '-p, --password',
      description: '设置加密后的密码',
      type: 'input',
      placeholder: '输入加密密码',
      group: 'security'
    },
    {
      name: 'USERNAME',
      description: '要修改的用户名',
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
          output: 'usermod: Permission denied. Only root can modify users.|usermod: 权限被拒绝。只有root可以修改用户。',
          exitCode: 1
        }
      }
      
      // 解析选项
      let username = null
      let newUsername = null
      let homeDir = null
      let moveHome = false
      let shell = null
      let uid = null
      let gid = null
      let groups = null
      let appendGroups = false
      let comment = null
      let lock = false
      let unlock = false
      let expireDate = null
      let inactive = null
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        if (arg === '-l' || arg === '--login') {
          if (i + 1 < args.length) {
            newUsername = args[++i]
          }
        } else if (arg === '-d' || arg === '--home') {
          if (i + 1 < args.length) {
            homeDir = args[++i]
          }
        } else if (arg === '-m' || arg === '--move-home') {
          moveHome = true
        } else if (arg === '-s' || arg === '--shell') {
          if (i + 1 < args.length) {
            shell = args[++i]
          }
        } else if (arg === '-u' || arg === '--uid') {
          if (i + 1 < args.length) {
            uid = parseInt(args[++i])
            if (isNaN(uid) || uid < 0) {
              return {
                output: 'usermod: invalid UID value|usermod: 无效的UID值',
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
        } else if (arg === '-a' || arg === '--append') {
          appendGroups = true
        } else if (arg === '-c' || arg === '--comment') {
          if (i + 1 < args.length) {
            comment = args[++i]
          }
        } else if (arg === '-L' || arg === '--lock') {
          lock = true
        } else if (arg === '-U' || arg === '--unlock') {
          unlock = true
        } else if (arg === '-e' || arg === '--expiredate') {
          if (i + 1 < args.length) {
            expireDate = args[++i]
          }
        } else if (arg === '-f' || arg === '--inactive') {
          if (i + 1 < args.length) {
            inactive = parseInt(args[++i])
            if (isNaN(inactive) || inactive < -1) {
              return {
                output: 'usermod: invalid inactive value|usermod: 无效的非活动值',
                exitCode: 1
              }
            }
          }
        } else if (arg === '--help') {
          return {
            output: this.help.zh,
            exitCode: 0
          }
        } else if (arg.startsWith('-')) {
          return {
            output: `usermod: invalid option: ${arg}|usermod: 无效选项: ${arg}`,
            exitCode: 1
          }
        } else {
          username = arg
        }
      }
      
      if (!username) {
        return {
          output: 'usermod: missing username|usermod: 缺少用户名',
          exitCode: 1
        }
      }
      
      // 检查用户是否存在
      const systemUsers = ['root', 'daemon', 'bin', 'sys', 'sync', 'games', 'man', 'lp', 'mail', 'news', 'uucp', 'proxy', 'www-data', 'backup', 'list', 'irc', 'gnats', 'nobody']
      if (!systemUsers.includes(username) && Math.random() > 0.8) {
        return {
          output: `usermod: user '${username}' does not exist|usermod: 用户 '${username}' 不存在`,
          exitCode: 6
        }
      }
      
      // 验证新用户名
      if (newUsername && !/^[a-z_][a-z0-9_-]*$/.test(newUsername)) {
        return {
          output: `usermod: invalid username '${newUsername}'|usermod: 无效的用户名 '${newUsername}'`,
          exitCode: 1
        }
      }
      
      // 修改用户
      const result = this.modifyUser({
        username,
        newUsername,
        homeDir,
        moveHome,
        shell,
        uid,
        gid,
        groups,
        appendGroups,
        comment,
        lock,
        unlock,
        expireDate,
        inactive
      })
      
      return {
        output: result,
        exitCode: 0
      }
      
    } catch (error) {
      return {
        output: `usermod: ${error.message}`,
        exitCode: 1
      }
    }
  },
  
  modifyUser(options) {
    const {
      username,
      newUsername,
      homeDir,
      moveHome,
      shell,
      uid,
      gid,
      groups,
      appendGroups,
      comment,
      lock,
      unlock,
      expireDate,
      inactive
    } = options
    
    const results = []
    
    // 模拟修改用户过程
    results.push(`Modifying user account '${username}'|正在修改用户账户 '${username}'`)
    
    // 修改用户名
    if (newUsername) {
      results.push(`Changing username from '${username}' to '${newUsername}'`)
      results.push(`将用户名从 '${username}' 更改为 '${newUsername}'`)
      results.push(`Updating /etc/passwd entry`)
      results.push(`更新 /etc/passwd 条目`)
      results.push(`Updating /etc/shadow entry`)
      results.push(`更新 /etc/shadow 条目`)
    }
    
    // 修改UID
    if (uid !== null) {
      results.push(`Changing UID to ${uid}`)
      results.push(`将UID更改为 ${uid}`)
      results.push(`Updating file ownership (this may take time)`)
      results.push(`更新文件所有权（这可能需要时间）`)
    }
    
    // 修改主组
    if (gid) {
      results.push(`Changing primary group to '${gid}'`)
      results.push(`将主组更改为 '${gid}'`)
    }
    
    // 修改附加组
    if (groups) {
      if (appendGroups) {
        results.push(`Appending user to groups: ${groups.join(', ')}`)
        results.push(`将用户添加到组: ${groups.join(', ')}`)
      } else {
        results.push(`Setting user groups to: ${groups.join(', ')}`)
        results.push(`设置用户组为: ${groups.join(', ')}`)
      }
    }
    
    // 修改主目录
    if (homeDir) {
      const oldHome = `/home/${username}`
      results.push(`Changing home directory from '${oldHome}' to '${homeDir}'`)
      results.push(`将主目录从 '${oldHome}' 更改为 '${homeDir}'`)
      
      if (moveHome) {
        results.push(`Moving contents from '${oldHome}' to '${homeDir}'`)
        results.push(`将内容从 '${oldHome}' 移动到 '${homeDir}'`)
        results.push(`Updating file ownership in new home directory`)
        results.push(`更新新主目录中的文件所有权`)
      } else {
        results.push(`Note: Use -m option to move home directory contents`)
        results.push(`注意: 使用 -m 选项移动主目录内容`)
      }
    }
    
    // 修改登录shell
    if (shell) {
      results.push(`Changing login shell to '${shell}'`)
      results.push(`将登录shell更改为 '${shell}'`)
    }
    
    // 修改注释
    if (comment !== null) {
      results.push(`Updating user comment to '${comment}'`)
      results.push(`将用户注释更新为 '${comment}'`)
    }
    
    // 锁定/解锁账户
    if (lock) {
      results.push(`Locking user account '${username}'`)
      results.push(`锁定用户账户 '${username}'`)
      results.push(`Password field in /etc/shadow prefixed with '!'`)
      results.push(`/etc/shadow 中的密码字段前缀为 '!'`)
    }
    
    if (unlock) {
      results.push(`Unlocking user account '${username}'`)
      results.push(`解锁用户账户 '${username}'`)
      results.push(`Removing '!' prefix from password field`)
      results.push(`从密码字段删除 '!' 前缀`)
    }
    
    // 设置过期日期
    if (expireDate) {
      results.push(`Setting account expiration date to '${expireDate}'`)
      results.push(`设置账户过期日期为 '${expireDate}'`)
    }
    
    // 设置非活动期
    if (inactive !== null) {
      results.push(`Setting password inactive period to ${inactive} days`)
      results.push(`设置密码非活动期为 ${inactive} 天`)
    }
    
    // 更新系统文件
    results.push('')
    results.push(`Updated system files:`)
    results.push(`已更新的系统文件:`)
    results.push(`  /etc/passwd`)
    results.push(`  /etc/shadow`)
    if (groups) {
      results.push(`  /etc/group`)
      results.push(`  /etc/gshadow`)
    }
    
    results.push('')
    results.push(`User account '${username}' has been modified`)
    results.push(`用户账户 '${username}' 已被修改`)
    
    return results.join('\n')
  },
  
  help: {
    'en': `usermod - Modify user account

SYNOPSIS
    usermod [options] username

DESCRIPTION
    usermod modifies the system account files to reflect the changes that
    are specified on the command line.

OPTIONS
    -l, --login NEW_LOGIN     New login name
    -d, --home HOME_DIR       New home directory
    -m, --move-home           Move contents of home directory
    -s, --shell SHELL         New login shell
    -u, --uid UID             New UID
    -g, --gid GROUP           New primary group
    -G, --groups GROUPS       New list of supplementary groups
    -a, --append              Append user to supplementary groups
    -c, --comment COMMENT     New value of the GECOS field
    -L, --lock                Lock the user account
    -U, --unlock              Unlock the user account
    -e, --expiredate DATE     Set account expiration date
    -f, --inactive INACTIVE   Set password inactive period

EXAMPLES
    usermod -l newname john         # Change username
    usermod -d /new/home -m john    # Change and move home directory
    usermod -s /bin/zsh john        # Change login shell
    usermod -u 1001 john            # Change UID
    usermod -g staff john           # Change primary group
    usermod -G wheel,audio john     # Set supplementary groups
    usermod -a -G docker john       # Append to supplementary groups
    usermod -c "John Doe" john      # Change comment
    usermod -L john                 # Lock account
    usermod -U john                 # Unlock account
    usermod -e 2024-12-31 john      # Set expiration date

FILES
    /etc/passwd         User account information
    /etc/shadow         Secure user account information
    /etc/group          Group account information
    /etc/gshadow        Secure group account information

NOTES
    - Only root can modify users
    - User must not be currently logged in for some changes
    - Changing UID updates file ownership automatically
    - Use -m with -d to move home directory contents
    - Locked accounts cannot log in
    - Changes take effect immediately

WARNINGS
    - Changing UID may affect file permissions
    - Moving home directory may take time for large directories
    - Some changes require user to log out and back in`,

    'zh': `usermod - 修改用户账户

语法
    usermod [选项] 用户名

描述
    usermod 修改系统账户文件以反映命令行中指定的更改。

选项
    -l, --login 新登录名      新的登录名
    -d, --home 主目录         新的主目录
    -m, --move-home          移动主目录内容
    -s, --shell 外壳         新的登录外壳
    -u, --uid UID           新的UID
    -g, --gid 组            新的主组
    -G, --groups 组列表      新的附加组列表
    -a, --append            将用户追加到附加组
    -c, --comment 注释       GECOS字段的新值
    -L, --lock              锁定用户账户
    -U, --unlock            解锁用户账户
    -e, --expiredate 日期    设置账户过期日期
    -f, --inactive 非活动期  设置密码非活动期

示例
    usermod -l newname john         # 更改用户名
    usermod -d /new/home -m john    # 更改并移动主目录
    usermod -s /bin/zsh john        # 更改登录shell
    usermod -u 1001 john            # 更改UID
    usermod -g staff john           # 更改主组
    usermod -G wheel,audio john     # 设置附加组
    usermod -a -G docker john       # 追加到附加组
    usermod -c "张三" john          # 更改注释
    usermod -L john                 # 锁定账户
    usermod -U john                 # 解锁账户
    usermod -e 2024-12-31 john      # 设置过期日期

文件
    /etc/passwd         用户账户信息
    /etc/shadow         安全用户账户信息
    /etc/group          组账户信息
    /etc/gshadow        安全组账户信息

注意
    - 只有root可以修改用户
    - 某些更改要求用户当前未登录
    - 更改UID会自动更新文件所有权
    - 使用 -m 和 -d 移动主目录内容
    - 锁定的账户无法登录
    - 更改立即生效

警告
    - 更改UID可能影响文件权限
    - 移动大目录可能需要时间
    - 某些更改需要用户重新登录`
  },
  
  examples: [
    {
      command: 'usermod -l newname john',
      description: 'Change username from john to newname|将用户名从john更改为newname'
    },
    {
      command: 'usermod -d /new/home -m john',
      description: 'Change and move home directory|更改并移动主目录'
    },
    {
      command: 'usermod -s /bin/zsh john',
      description: 'Change login shell to zsh|将登录shell更改为zsh'
    },
    {
      command: 'usermod -G wheel,audio john',
      description: 'Set supplementary groups|设置附加组'
    },
    {
      command: 'usermod -L john',
      description: 'Lock user account|锁定用户账户'
    }
  ]
}

export default usermod