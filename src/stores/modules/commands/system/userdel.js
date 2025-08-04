/**
 * userdel 命令实现
 * 删除用户账户
 */

export const userdel = {
  name: 'userdel',
  description: 'Delete user account|删除用户账户',
  category: 'system',
  options: [
    {
      name: '-r, --remove',
      description: '删除主目录和邮件池',
      type: 'flag',
      group: 'cleanup'
    },
    {
      name: '-R, --root',
      description: '在指定根目录中应用更改',
      type: 'input',
      placeholder: '输入根目录路径 (如: /mnt/chroot)',
      group: 'system'
    },
    {
      name: '-f, --force',
      description: '强制删除，即使用户正在使用',
      type: 'flag',
      group: 'force'
    },
    {
      name: '-Z, --selinux-user',
      description: '删除用户的SELinux用户映射',
      type: 'flag',
      group: 'security'
    },
    {
      name: '--extrausers',
      description: '使用额外用户数据库',
      type: 'flag',
      group: 'system'
    },
    {
      name: 'USERNAME',
      description: '要删除的用户名',
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
          output: 'userdel: Permission denied. Only root can delete users.|userdel: 权限被拒绝。只有root可以删除用户。',
          exitCode: 1
        }
      }
      
      // 解析选项
      let username = null
      let removeHome = false
      let removeAll = false
      let force = false
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        if (arg === '-r' || arg === '--remove') {
          removeHome = true
        } else if (arg === '-R' || arg === '--root') {
          removeAll = true
        } else if (arg === '-f' || arg === '--force') {
          force = true
        } else if (arg === '--help') {
          return {
            output: this.help.zh,
            exitCode: 0
          }
        } else if (arg.startsWith('-')) {
          return {
            output: `userdel: invalid option: ${arg}|userdel: 无效选项: ${arg}`,
            exitCode: 1
          }
        } else {
          username = arg
        }
      }
      
      if (!username) {
        return {
          output: 'userdel: missing username|userdel: 缺少用户名',
          exitCode: 1
        }
      }
      
      // 检查用户是否存在
      const systemUsers = ['root', 'daemon', 'bin', 'sys', 'sync', 'games', 'man', 'lp', 'mail', 'news', 'uucp', 'proxy', 'www-data', 'backup', 'list', 'irc', 'gnats', 'nobody']
      if (!systemUsers.includes(username) && Math.random() > 0.7) {
        return {
          output: `userdel: user '${username}' does not exist|userdel: 用户 '${username}' 不存在`,
          exitCode: 6
        }
      }
      
      // 检查是否为系统关键用户
      const criticalUsers = ['root', 'daemon', 'bin', 'sys']
      if (criticalUsers.includes(username) && !force) {
        return {
          output: `userdel: cannot remove system user '${username}'|userdel: 无法删除系统用户 '${username}'`,
          exitCode: 8
        }
      }
      
      // 检查用户是否正在使用
      if (Math.random() > 0.8 && !force) {
        return {
          output: `userdel: user '${username}' is currently used by process ${Math.floor(Math.random() * 10000) + 1000}|userdel: 用户 '${username}' 正被进程 ${Math.floor(Math.random() * 10000) + 1000} 使用`,
          exitCode: 8
        }
      }
      
      // 删除用户
      const result = this.deleteUser({
        username,
        removeHome,
        removeAll,
        force
      })
      
      return {
        output: result,
        exitCode: 0
      }
      
    } catch (error) {
      return {
        output: `userdel: ${error.message}`,
        exitCode: 1
      }
    }
  },
  
  deleteUser(options) {
    const { username, removeHome, removeAll, force } = options
    const results = []
    
    // 模拟删除用户过程
    results.push(`Deleting user account '${username}'|正在删除用户账户 '${username}'`)
    
    // 从 /etc/passwd 删除
    results.push(`Removing entry from /etc/passwd for user '${username}'`)
    results.push(`从 /etc/passwd 删除用户 '${username}' 的条目`)
    
    // 从 /etc/shadow 删除
    results.push(`Removing entry from /etc/shadow for user '${username}'`)
    results.push(`从 /etc/shadow 删除用户 '${username}' 的条目`)
    
    // 从 /etc/group 删除
    results.push(`Removing user '${username}' from all groups`)
    results.push(`从所有组中删除用户 '${username}'`)
    
    // 删除主组（如果没有其他成员）
    results.push(`Removing group '${username}' if empty`)
    results.push(`如果组 '${username}' 为空则删除`)
    
    // 处理主目录
    const homeDir = `/home/${username}`
    if (removeHome || removeAll) {
      results.push(`Removing home directory: ${homeDir}`)
      results.push(`删除主目录: ${homeDir}`)
      
      results.push(`Removing all files in ${homeDir}`)
      results.push(`删除 ${homeDir} 中的所有文件`)
    } else {
      results.push(`Home directory ${homeDir} not removed`)
      results.push(`主目录 ${homeDir} 未删除`)
      results.push(`Use 'userdel -r ${username}' to remove home directory`)
      results.push(`使用 'userdel -r ${username}' 删除主目录`)
    }
    
    // 处理邮件池
    const mailSpool = `/var/mail/${username}`
    if (removeAll) {
      results.push(`Removing mail spool: ${mailSpool}`)
      results.push(`删除邮件池: ${mailSpool}`)
    }
    
    // 查找并报告用户拥有的文件
    if (!removeAll) {
      const userFiles = [
        '/tmp/user_temp_file',
        '/var/log/user.log',
        '/opt/user_data'
      ]
      
      if (userFiles.length > 0) {
        results.push('')
        results.push(`Warning: Files owned by '${username}' still exist:`)
        results.push(`警告: 仍存在由 '${username}' 拥有的文件:`)
        userFiles.forEach(file => {
          results.push(`  ${file}`)
        })
        results.push(`Use 'find / -user ${username}' to locate all files`)
        results.push(`使用 'find / -user ${username}' 定位所有文件`)
      }
    }
    
    // 终止用户进程
    if (force) {
      results.push(`Terminating all processes owned by '${username}'`)
      results.push(`终止所有由 '${username}' 拥有的进程`)
    }
    
    results.push('')
    results.push(`User account '${username}' has been deleted`)
    results.push(`用户账户 '${username}' 已被删除`)
    
    return results.join('\n')
  },
  
  help: {
    'en': `userdel - Delete user account

SYNOPSIS
    userdel [options] username

DESCRIPTION
    userdel is a low level utility for removing users. It modifies the
    system account files, deleting all entries that refer to the user.
    The named user must exist.

OPTIONS
    -r, --remove          Remove home directory and mail spool
    -R, --root CHROOT_DIR Apply changes in the CHROOT_DIR directory
    -f, --force           Force removal of files, even if not owned by user

ARGUMENTS
    username              User account to delete

EXAMPLES
    userdel john                # Delete user john (keep home directory)
    userdel -r john             # Delete user john and home directory
    userdel -f john             # Force delete user john

EXIT VALUES
    0    Success
    1    Can't update password file
    2    Invalid command syntax
    6    Specified user doesn't exist
    8    User currently logged in
    10   Can't update group file
    12   Can't remove home directory

FILES
    /etc/passwd         User account information
    /etc/shadow         Secure user account information
    /etc/group          Group account information
    /etc/gshadow        Secure group account information

NOTES
    - Only root can delete users
    - User must not be currently logged in (unless -f is used)
    - Home directory is preserved unless -r is specified
    - Files owned by the user outside home directory remain
    - Use 'find / -user username' to locate remaining files
    - System users should be deleted with caution

WARNINGS
    - Deleting a user account is irreversible
    - All user data in home directory will be lost with -r
    - Running processes owned by user may cause issues
    - Check for important files before deletion`,

    'zh': `userdel - 删除用户账户

语法
    userdel [选项] 用户名

描述
    userdel 是删除用户的底层工具。它修改系统账户文件，
    删除所有引用该用户的条目。指定的用户必须存在。

选项
    -r, --remove          删除主目录和邮件池
    -R, --root 根目录     在指定根目录中应用更改
    -f, --force           强制删除文件，即使不属于用户

参数
    用户名                要删除的用户账户

示例
    userdel john                # 删除用户john（保留主目录）
    userdel -r john             # 删除用户john和主目录
    userdel -f john             # 强制删除用户john

退出值
    0    成功
    1    无法更新密码文件
    2    无效的命令语法
    6    指定的用户不存在
    8    用户当前已登录
    10   无法更新组文件
    12   无法删除主目录

文件
    /etc/passwd         用户账户信息
    /etc/shadow         安全用户账户信息
    /etc/group          组账户信息
    /etc/gshadow        安全组账户信息

注意
    - 只有root可以删除用户
    - 用户不能当前登录（除非使用-f）
    - 除非指定-r，否则保留主目录
    - 用户在主目录外拥有的文件仍然存在
    - 使用 'find / -user 用户名' 定位剩余文件
    - 系统用户应谨慎删除

警告
    - 删除用户账户是不可逆的
    - 使用-r会丢失主目录中的所有用户数据
    - 用户拥有的运行进程可能导致问题
    - 删除前检查重要文件`
  },
  
  examples: [
    {
      command: 'userdel john',
      description: 'Delete user john (keep home directory)|删除用户john（保留主目录）'
    },
    {
      command: 'userdel -r john',
      description: 'Delete user john and home directory|删除用户john和主目录'
    },
    {
      command: 'userdel -f john',
      description: 'Force delete user john|强制删除用户john'
    }
  ]
}

export default userdel