/**
 * passwd 命令实现
 * 更改用户密码
 */

export const passwd = {
  name: 'passwd',
  description: 'Change user password|更改用户密码',
  category: 'system',
  options: [
    {
      name: '-d, --delete',
      description: '删除密码（使账户无密码）',
      type: 'flag',
      group: 'modify'
    },
    {
      name: '-e, --expire',
      description: '强制密码过期',
      type: 'flag',
      group: 'modify'
    },
    {
      name: '-i, --inactive',
      description: '设置密码过期后的非活动期（天数）',
      type: 'input',
      placeholder: '输入天数 (如: 30)',
      group: 'modify'
    },
    {
      name: '-l, --lock',
      description: '锁定密码',
      type: 'flag',
      group: 'modify'
    },
    {
      name: '-u, --unlock',
      description: '解锁密码',
      type: 'flag',
      group: 'modify'
    },
    {
      name: '-S, --status',
      description: '显示账户状态信息',
      type: 'flag',
      group: 'info'
    },
    {
      name: '-q, --quiet',
      description: '安静模式（减少输出信息）',
      type: 'flag',
      group: 'output'
    },
    {
      name: '-n, --minimum',
      description: '设置密码最小使用天数',
      type: 'input',
      placeholder: '输入最小天数 (如: 0)',
      group: 'policy'
    },
    {
      name: '-x, --maximum',
      description: '设置密码最大使用天数',
      type: 'input',
      placeholder: '输入最大天数 (如: 99999)',
      group: 'policy'
    },
    {
      name: '-w, --warning',
      description: '设置密码过期警告天数',
      type: 'input',
      placeholder: '输入警告天数 (如: 7)',
      group: 'policy'
    },
    {
      name: 'USERNAME',
      description: '要更改密码的用户名（仅root可用）',
      type: 'input',
      placeholder: '输入用户名 (默认为当前用户)',
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
      // 解析选项
      let username = null
      let delete_ = false
      let expire = false
      let inactive = null
      let lock = false
      let unlock = false
      let status = false
      let quiet = false
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        if (arg === '-d' || arg === '--delete') {
          delete_ = true
        } else if (arg === '-e' || arg === '--expire') {
          expire = true
        } else if (arg === '-i' || arg === '--inactive') {
          if (i + 1 < args.length) {
            inactive = parseInt(args[++i])
            if (isNaN(inactive) || inactive < 0) {
              return {
                output: 'passwd: invalid inactive value|passwd: 无效的非活动值',
                exitCode: 1
              }
            }
          }
        } else if (arg === '-l' || arg === '--lock') {
          lock = true
        } else if (arg === '-u' || arg === '--unlock') {
          unlock = true
        } else if (arg === '-S' || arg === '--status') {
          status = true
        } else if (arg === '-q' || arg === '--quiet') {
          quiet = true
        } else if (arg === '--help') {
          return {
            output: this.help.zh,
            exitCode: 0
          }
        } else if (arg.startsWith('-')) {
          return {
            output: `passwd: invalid option: ${arg}|passwd: 无效选项: ${arg}`,
            exitCode: 1
          }
        } else {
          username = arg
        }
      }
      
      // 获取当前用户
      const currentUser = context.user || 'user'
      const targetUser = username || currentUser
      
      // 检查权限
      if (username && currentUser !== 'root' && currentUser !== username) {
        return {
          output: 'passwd: Permission denied|passwd: 权限被拒绝',
          exitCode: 1
        }
      }
      
      const results = []
      
      // 处理状态查询
      if (status) {
        const statusInfo = this.getUserPasswordStatus(targetUser)
        results.push(statusInfo)
        return {
          output: results.join('\n'),
          exitCode: 0
        }
      }
      
      // 处理锁定/解锁
      if (lock) {
        if (currentUser !== 'root') {
          return {
            output: 'passwd: Only root can lock passwords|passwd: 只有root可以锁定密码',
            exitCode: 1
          }
        }
        results.push(`Password locked for user ${targetUser}|用户 ${targetUser} 的密码已锁定`)
        return {
          output: results.join('\n'),
          exitCode: 0
        }
      }
      
      if (unlock) {
        if (currentUser !== 'root') {
          return {
            output: 'passwd: Only root can unlock passwords|passwd: 只有root可以解锁密码',
            exitCode: 1
          }
        }
        results.push(`Password unlocked for user ${targetUser}|用户 ${targetUser} 的密码已解锁`)
        return {
          output: results.join('\n'),
          exitCode: 0
        }
      }
      
      // 处理删除密码
      if (delete_) {
        if (currentUser !== 'root') {
          return {
            output: 'passwd: Only root can delete passwords|passwd: 只有root可以删除密码',
            exitCode: 1
          }
        }
        results.push(`Password deleted for user ${targetUser}|用户 ${targetUser} 的密码已删除`)
        return {
          output: results.join('\n'),
          exitCode: 0
        }
      }
      
      // 处理过期设置
      if (expire) {
        if (currentUser !== 'root' && currentUser !== targetUser) {
          return {
            output: 'passwd: Permission denied|passwd: 权限被拒绝',
            exitCode: 1
          }
        }
        results.push(`Password expired for user ${targetUser}|用户 ${targetUser} 的密码已过期`)
        return {
          output: results.join('\n'),
          exitCode: 0
        }
      }
      
      // 处理非活动期设置
      if (inactive !== null) {
        if (currentUser !== 'root') {
          return {
            output: 'passwd: Only root can set inactive period|passwd: 只有root可以设置非活动期',
            exitCode: 1
          }
        }
        results.push(`Inactive period set to ${inactive} days for user ${targetUser}|用户 ${targetUser} 的非活动期设置为 ${inactive} 天`)
        return {
          output: results.join('\n'),
          exitCode: 0
        }
      }
      
      // 默认：更改密码
      results.push(this.simulatePasswordChange(targetUser, currentUser, quiet))
      
      return {
        output: results.join('\n'),
        exitCode: 0
      }
      
    } catch (error) {
      return {
        output: `passwd: ${error.message}`,
        exitCode: 1
      }
    }
  },
  
  // 获取用户密码状态
  getUserPasswordStatus(username) {
    const statuses = ['P', 'L', 'NP'] // Password set, Locked, No password
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const lastChange = '2024-01-15'
    const minDays = '0'
    const maxDays = '99999'
    const warnDays = '7'
    const inactiveDays = '-1'
    
    const statusText = {
      'P': 'Password set, SHA512 crypt|密码已设置，SHA512加密',
      'L': 'Password locked|密码已锁定',
      'NP': 'No password set|未设置密码'
    }
    
    return `${username} ${status} ${lastChange} ${minDays} ${maxDays} ${warnDays} ${inactiveDays}
Status: ${statusText[status]}`
  },
  
  // 模拟密码更改过程
  simulatePasswordChange(targetUser, currentUser, quiet) {
    const results = []
    
    if (!quiet) {
      if (currentUser === targetUser) {
        results.push(`Changing password for ${targetUser}.`)
        results.push('为用户 ' + targetUser + ' 更改密码。')
      } else {
        results.push(`Changing password for user ${targetUser}.`)
        results.push('为用户 ' + targetUser + ' 更改密码。')
      }
    }
    
    // 模拟密码输入过程
    if (currentUser !== 'root' && currentUser === targetUser) {
      results.push('Current password: [Hidden input]')
      results.push('当前密码: [隐藏输入]')
    }
    
    results.push('New password: [Hidden input]')
    results.push('新密码: [隐藏输入]')
    results.push('Retype new password: [Hidden input]')
    results.push('重新输入新密码: [隐藏输入]')
    
    // 模拟密码强度检查
    const strengthChecks = [
      'Password strength: Good|密码强度: 良好',
      'Password contains dictionary words|密码包含字典单词',
      'Password is too short|密码太短',
      'Password lacks uppercase letters|密码缺少大写字母',
      'Password lacks numbers|密码缺少数字',
      'Password lacks special characters|密码缺少特殊字符'
    ]
    
    const randomCheck = strengthChecks[Math.floor(Math.random() * strengthChecks.length)]
    results.push(randomCheck)
    
    // 模拟成功或失败
    const success = Math.random() > 0.3 // 70% 成功率
    
    if (success) {
      results.push(`passwd: password updated successfully|passwd: 密码更新成功`)
      
      // 记录到系统日志（模拟）
      if (!quiet) {
        results.push(`Password changed for ${targetUser}|${targetUser} 的密码已更改`)
      }
    } else {
      results.push('passwd: Authentication token manipulation error|passwd: 认证令牌操作错误')
      results.push('passwd: password unchanged|passwd: 密码未更改')
    }
    
    return results.join('\n')
  },
  
  help: {
    'en': `passwd - Change user password

SYNOPSIS
    passwd [options] [username]

DESCRIPTION
    The passwd command changes passwords for user accounts. A normal user
    may only change the password for their own account, while the superuser
    may change the password for any account.

OPTIONS
    -d, --delete          Delete the password (make account passwordless)
    -e, --expire          Force password expiration
    -i, --inactive=DAYS   Set password inactive after expiration
    -l, --lock            Lock the password
    -u, --unlock          Unlock the password
    -S, --status          Display account status information
    -q, --quiet           Quiet mode

ARGUMENTS
    username              User whose password to change (root only)

EXAMPLES
    passwd                    # Change current user's password
    passwd john               # Change john's password (root only)
    passwd -S john            # Show john's password status
    passwd -l john            # Lock john's account (root only)
    passwd -u john            # Unlock john's account (root only)
    passwd -d john            # Delete john's password (root only)

SECURITY
    - Passwords are not echoed to the terminal
    - Password strength is checked
    - Changes are logged to system logs
    - Only root can modify other users' passwords

NOTES
    - Use strong passwords with mixed case, numbers, and symbols
    - Regular password changes improve security
    - Locked accounts cannot log in
    - Expired passwords force change at next login`,

    'zh': `passwd - 更改用户密码

语法
    passwd [选项] [用户名]

描述
    passwd 命令更改用户账户的密码。普通用户只能更改自己账户的密码，
    而超级用户可以更改任何账户的密码。

选项
    -d, --delete          删除密码（使账户无密码）
    -e, --expire          强制密码过期
    -i, --inactive=天数   设置密码过期后的非活动期
    -l, --lock            锁定密码
    -u, --unlock          解锁密码
    -S, --status          显示账户状态信息
    -q, --quiet           安静模式

参数
    用户名                要更改密码的用户（仅root）

示例
    passwd                    # 更改当前用户的密码
    passwd john               # 更改john的密码（仅root）
    passwd -S john            # 显示john的密码状态
    passwd -l john            # 锁定john的账户（仅root）
    passwd -u john            # 解锁john的账户（仅root）
    passwd -d john            # 删除john的密码（仅root）

安全性
    - 密码不会回显到终端
    - 检查密码强度
    - 更改记录到系统日志
    - 只有root可以修改其他用户的密码

注意
    - 使用包含大小写、数字和符号的强密码
    - 定期更改密码提高安全性
    - 锁定的账户无法登录
    - 过期的密码在下次登录时强制更改`
  },
  
  examples: [
    {
      command: 'passwd',
      description: 'Change current user password|更改当前用户密码'
    },
    {
      command: 'passwd john',
      description: 'Change password for user john|更改用户john的密码'
    },
    {
      command: 'passwd -S john',
      description: 'Show password status for john|显示john的密码状态'
    },
    {
      command: 'passwd -l john',
      description: 'Lock password for john|锁定john的密码'
    },
    {
      command: 'passwd -e john',
      description: 'Expire password for john|使john的密码过期'
    }
  ]
}

export default passwd