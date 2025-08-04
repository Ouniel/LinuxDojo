/**
 * groupdel 命令实现
 * 删除用户组
 */

export const groupdel = {
  name: 'groupdel',
  description: 'Delete a group from the system|从系统中删除用户组',
  category: 'system',
  options: [
    {
      name: '-f, --force',
      description: '强制删除，即使组不存在',
      type: 'flag',
      group: 'behavior'
    },
    {
      name: 'GROUP',
      description: '要删除的组名',
      type: 'input',
      placeholder: '输入组名 (如: developers)',
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
      if (args.length === 0) {
        return {
          output: 'groupdel: missing group name|groupdel: 缺少组名',
          exitCode: 1
        }
      }
      
      // 解析选项
      let groupName = null
      let force = false
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        if (arg === '-f' || arg === '--force') {
          force = true
        } else if (arg === '--help') {
          return {
            output: this.help.zh,
            exitCode: 0
          }
        } else if (arg.startsWith('-')) {
          return {
            output: `groupdel: invalid option: ${arg}|groupdel: 无效选项: ${arg}`,
            exitCode: 1
          }
        } else if (!groupName) {
          groupName = arg
        } else {
          return {
            output: `groupdel: too many arguments|groupdel: 参数过多`,
            exitCode: 1
          }
        }
      }
      
      if (!groupName) {
        return {
          output: 'groupdel: missing group name|groupdel: 缺少组名',
          exitCode: 1
        }
      }
      
      // 模拟删除组
      return {
        output: this.deleteGroup(groupName, { force }),
        exitCode: 0
      }
      
    } catch (error) {
      return {
        output: `groupdel: ${error.message}`,
        exitCode: 1
      }
    }
  },
  
  deleteGroup(groupName, options) {
    const { force } = options
    const results = []
    
    // 检查组是否存在
    const systemGroups = ['root', 'daemon', 'bin', 'sys', 'adm', 'tty', 'disk', 'lp', 'mail', 'news', 'uucp', 'man', 'proxy', 'kmem', 'dialout', 'fax', 'voice', 'cdrom', 'floppy', 'tape', 'sudo', 'audio', 'dip', 'www-data', 'backup', 'operator', 'list', 'irc', 'src', 'gnats', 'shadow', 'utmp', 'video', 'sasl', 'plugdev', 'staff', 'games', 'users', 'nogroup']
    const userGroups = ['developers', 'testers', 'admins', 'guests', 'project1', 'project2']
    const allGroups = [...systemGroups, ...userGroups]
    
    if (!allGroups.includes(groupName)) {
      if (!force) {
        results.push(`groupdel: group '${groupName}' does not exist`)
        results.push(`groupdel: 组 '${groupName}' 不存在`)
        return results.join('\n')
      } else {
        results.push(`groupdel: group '${groupName}' does not exist, but continuing due to --force`)
        results.push(`groupdel: 组 '${groupName}' 不存在，但由于--force继续`)
        return results.join('\n')
      }
    }
    
    // 检查是否为系统关键组
    const criticalGroups = ['root', 'daemon', 'bin', 'sys', 'adm', 'tty', 'disk', 'sudo']
    if (criticalGroups.includes(groupName)) {
      if (!force) {
        results.push(`groupdel: cannot remove the primary group of user '${groupName}'`)
        results.push(`groupdel: 无法删除用户 '${groupName}' 的主组`)
        results.push('This is a critical system group and should not be deleted.')
        results.push('这是一个关键系统组，不应该被删除。')
        return results.join('\n')
      } else {
        results.push(`WARNING: Deleting critical system group '${groupName}'`)
        results.push(`警告: 正在删除关键系统组 '${groupName}'`)
      }
    }
    
    // 检查组是否被用户使用
    const usersInGroup = this.getUsersInGroup(groupName)
    if (usersInGroup.length > 0) {
      results.push(`groupdel: cannot remove the primary group of user '${usersInGroup[0]}'`)
      results.push(`groupdel: 无法删除用户 '${usersInGroup[0]}' 的主组`)
      results.push(`Users in group: ${usersInGroup.join(', ')}`)
      results.push(`组中的用户: ${usersInGroup.join(', ')}`)
      results.push('Remove users from group first or change their primary group.')
      results.push('请先从组中删除用户或更改他们的主组。')
      return results.join('\n')
    }
    
    // 模拟删除组
    results.push(`Removing group '${groupName}'...`)
    results.push(`正在删除组 '${groupName}'...`)
    
    // 模拟更新系统文件
    results.push('Updating /etc/group...')
    results.push('正在更新 /etc/group...')
    results.push('Updating /etc/gshadow...')
    results.push('正在更新 /etc/gshadow...')
    
    results.push(`Group '${groupName}' deleted successfully.`)
    results.push(`组 '${groupName}' 删除成功。`)
    
    return results.join('\n')
  },
  
  getUsersInGroup(groupName) {
    // 模拟获取组中的用户
    const groupUsers = {
      'developers': ['alice', 'bob'],
      'testers': ['charlie'],
      'admins': ['admin'],
      'root': ['root'],
      'sudo': ['admin', 'user1']
    }
    
    return groupUsers[groupName] || []
  },
  
  help: {
    'en': `groupdel - Delete a group from the system

SYNOPSIS
    groupdel [options] group

DESCRIPTION
    groupdel deletes the group account named GROUP. The named group is
    removed from the system files. The files in the user's home directory
    are not removed.

OPTIONS
    -f, --force             Force removal even if group doesn't exist
    -h, --help              Display help message and exit

EXAMPLES
    groupdel developers     # Delete group 'developers'
    groupdel -f old-group   # Force deletion even if group doesn't exist

FILES
    /etc/group              Group account information
    /etc/gshadow            Secure group account information

NOTES
    - Cannot delete a group that is the primary group of any user
    - Remove users from the group first, or change their primary group
    - System groups should be deleted with caution
    - Use 'groupadd' to create new groups
    - Use 'groupmod' to modify existing groups

CAVEATS
    - You may not remove the primary group of any existing user
    - You must change the primary group of any users before removing the group
    - You should manually check all file systems to ensure that no files
      remain owned by this group

EXIT VALUES
    0    Success
    2    Invalid command syntax
    6    Specified group doesn't exist
    8    Can't remove user's primary group
    10   Can't update group file`,

    'zh': `groupdel - 从系统中删除用户组

语法
    groupdel [选项] 组名

描述
    groupdel 删除名为GROUP的组账户。指定的组将从系统文件中删除。
    用户主目录中的文件不会被删除。

选项
    -f, --force             强制删除，即使组不存在
    -h, --help              显示帮助信息并退出

示例
    groupdel developers     # 删除组'developers'
    groupdel -f old-group   # 强制删除，即使组不存在

文件
    /etc/group              组账户信息
    /etc/gshadow            安全组账户信息

注意
    - 无法删除任何用户的主组
    - 首先从组中删除用户，或更改他们的主组
    - 系统组应谨慎删除
    - 使用'groupadd'创建新组
    - 使用'groupmod'修改现有组

注意事项
    - 不能删除任何现有用户的主组
    - 删除组之前必须更改任何用户的主组
    - 应手动检查所有文件系统，确保没有文件仍属于此组

退出值
    0    成功
    2    无效的命令语法
    6    指定的组不存在
    8    无法删除用户的主组
    10   无法更新组文件`
  },
  
  examples: [
    {
      command: 'groupdel developers',
      description: 'Delete the developers group|删除developers组'
    },
    {
      command: 'groupdel -f old-group',
      description: 'Force deletion even if group does not exist|强制删除，即使组不存在'
    }
  ]
}

export default groupdel
