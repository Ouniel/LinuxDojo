/**
 * groupadd 命令实现
 * 添加用户组
 */

export const groupadd = {
  name: 'groupadd',
  description: 'Add a group to the system|向系统添加用户组',
  category: 'system',
  options: [
    {
      name: '-g, --gid',
      description: '为新组指定GID',
      type: 'input',
      placeholder: '输入GID (如: 1500)',
      group: 'identity'
    },
    {
      name: '-r, --system',
      description: '创建系统组（GID通常小于1000）',
      type: 'boolean',
      group: 'type'
    },
    {
      name: '-f, --force',
      description: '如果组已存在则成功退出',
      type: 'boolean',
      group: 'behavior'
    },
    {
      name: '-o, --non-unique',
      description: '允许创建具有重复GID的组',
      type: 'boolean',
      group: 'behavior'
    },
    {
      name: '-K, --key',
      description: '覆盖/etc/login.defs中的默认值',
      type: 'input',
      placeholder: '输入键值对 (如: GID_MIN=1000)',
      group: 'config'
    },
    {
      name: '-p, --password',
      description: '为组设置加密密码',
      type: 'input',
      placeholder: '输入加密密码',
      group: 'security'
    },
    {
      name: 'GROUP',
      description: '要创建的组名',
      type: 'input',
      placeholder: '输入组名 (如: developers)',
      group: 'target'
    },
    {
      name: '--help',
      description: '显示帮助信息',
      type: 'boolean',
      group: 'help'
    },
    {
      name: '--version',
      description: '显示版本信息',
      type: 'boolean',
      group: 'help'
    }
  ],
  
  async handler(args, context) {
    const { currentPath } = context
    try {
      if (args.length === 0) {
        return {
          output: 'groupadd: missing group name\ngroupadd: 缺少组名',
          exitCode: 1
        }
      }
      
      // 解析选项
      let groupName = null
      let gid = null
      let system = false
      let force = false
      let nonUnique = false
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        if (arg === '-g' || arg === '--gid') {
          if (i + 1 < args.length) {
            gid = parseInt(args[++i])
            if (isNaN(gid) || gid < 0) {
              return {
                output: 'groupadd: invalid group ID\ngroupadd: 无效的组ID',
                exitCode: 1
              }
            }
          } else {
            return {
              output: 'groupadd: option requires an argument -- g\ngroupadd: 选项需要参数 -- g',
              exitCode: 1
            }
          }
        } else if (arg === '-r' || arg === '--system') {
          system = true
        } else if (arg === '-f' || arg === '--force') {
          force = true
        } else if (arg === '-o' || arg === '--non-unique') {
          nonUnique = true
        } else if (arg === '--help') {
          return {
            output: this.help.zh,
            exitCode: 0
          }
        } else if (arg.startsWith('-')) {
          return {
            output: `groupadd: invalid option: ${arg}\ngroupadd: 无效选项: ${arg}`,
            exitCode: 1
          }
        } else if (!groupName) {
          groupName = arg
        } else {
          return {
            output: `groupadd: too many arguments\ngroupadd: 参数过多`,
            exitCode: 1
          }
        }
      }
      
      if (!groupName) {
        return {
          output: 'groupadd: missing group name\ngroupadd: 缺少组名',
          exitCode: 1
        }
      }
      
      // 验证组名
      if (!groupadd.isValidGroupName(groupName)) {
        return {
          output: `groupadd: invalid group name '${groupName}'\ngroupadd: 无效的组名 '${groupName}'`,
          exitCode: 1
        }
      }
      
      // 模拟添加组
      return {
        output: groupadd.addGroup(groupName, { gid, system, force, nonUnique }),
        exitCode: 0
      }
      
    } catch (error) {
      return {
        output: `groupadd: ${error.message}`,
        exitCode: 1
      }
    }
  },
  
  isValidGroupName(name) {
    // 组名验证规则
    if (name.length === 0 || name.length > 32) {
      return false
    }
    
    // 不能以数字开头
    if (/^[0-9]/.test(name)) {
      return false
    }
    
    // 只能包含字母、数字、下划线和连字符
    if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(name)) {
      return false
    }
    
    return true
  },
  
  addGroup(groupName, options) {
    const { gid, system, force, nonUnique } = options
    const results = []
    
    // 检查组是否已存在
    const existingGroups = ['root', 'daemon', 'bin', 'sys', 'adm', 'tty', 'disk', 'lp', 'mail', 'news', 'uucp', 'man', 'proxy', 'kmem', 'dialout', 'fax', 'voice', 'cdrom', 'floppy', 'tape', 'sudo', 'audio', 'dip', 'www-data', 'backup', 'operator', 'list', 'irc', 'src', 'gnats', 'shadow', 'utmp', 'video', 'sasl', 'plugdev', 'staff', 'games', 'users', 'nogroup']
    
    if (existingGroups.includes(groupName)) {
      if (!force) {
        results.push(`groupadd: group '${groupName}' already exists`)
        results.push(`groupadd: 组 '${groupName}' 已存在`)
        return results.join('\n')
      } else {
        results.push(`groupadd: group '${groupName}' already exists, but continuing due to --force`)
        results.push(`groupadd: 组 '${groupName}' 已存在，但由于--force继续`)
      }
    }
    
    // 生成或验证GID
    let assignedGid = gid
    if (!assignedGid) {
      if (system) {
        // 系统组通常使用100-999的GID
        assignedGid = Math.floor(Math.random() * 900) + 100
      } else {
        // 普通组通常使用1000+的GID
        assignedGid = Math.floor(Math.random() * 9000) + 1000
      }
    }
    
    // 检查GID冲突
    if (!nonUnique && this.isGidInUse(assignedGid)) {
      results.push(`groupadd: GID '${assignedGid}' already exists`)
      results.push(`groupadd: GID '${assignedGid}' 已存在`)
      return results.join('\n')
    }
    
    // 模拟添加组到系统
    results.push(`Adding group '${groupName}' (GID ${assignedGid})...`)
    results.push(`正在添加组 '${groupName}' (GID ${assignedGid})...`)
    
    if (system) {
      results.push(`Creating system group '${groupName}'`)
      results.push(`正在创建系统组 '${groupName}'`)
    }
    
    // 模拟更新系统文件
    results.push('Updating /etc/group...')
    results.push('正在更新 /etc/group...')
    results.push('Updating /etc/gshadow...')
    results.push('正在更新 /etc/gshadow...')
    
    results.push(`Group '${groupName}' created successfully.`)
    results.push(`组 '${groupName}' 创建成功。`)
    
    // 显示组信息
    results.push('')
    results.push('Group information:|组信息:')
    results.push(`  Group name: ${groupName}|  组名: ${groupName}`)
    results.push(`  Group ID: ${assignedGid}|  组ID: ${assignedGid}`)
    results.push(`  System group: ${system ? 'Yes' : 'No'}|  系统组: ${system ? '是' : '否'}`)
    
    return results.join('\n')
  },
  
  isGidInUse(gid) {
    // 模拟检查GID是否已被使用
    const commonGids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 15, 20, 21, 22, 25, 26, 27, 29, 30, 33, 34, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 50, 60, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130]
    return commonGids.includes(gid)
  },
  
  help: {
    'en': `groupadd - Add a group to the system

SYNOPSIS
    groupadd [options] group

DESCRIPTION
    groupadd creates a new group account using the values specified on the
    command line plus the default values from the system. The new group will
    be entered into the system files as needed.

OPTIONS
    -g, --gid GID           Use GID for the new group
    -r, --system            Create a system group
    -f, --force             Exit successfully if the group already exists
    -o, --non-unique        Allow to create groups with duplicate GID
    -K, --key KEY=VALUE     Override defaults from /etc/login.defs
    -p, --password PASSWORD Set encrypted password for the group

EXAMPLES
    groupadd developers         # Create group 'developers'
    groupadd -g 1500 staff      # Create group 'staff' with GID 1500
    groupadd -r system-service  # Create system group
    groupadd -f existing-group  # Force creation even if group exists

FILES
    /etc/group              Group account information
    /etc/gshadow            Secure group account information
    /etc/login.defs         Shadow password suite configuration

NOTES
    - Group names must be unique
    - Group names should start with a letter or underscore
    - System groups typically have GIDs below 1000
    - Regular groups typically have GIDs 1000 and above
    - Use 'groupdel' to remove groups
    - Use 'groupmod' to modify existing groups

EXIT VALUES
    0    Success
    2    Invalid command syntax
    3    Invalid argument to option
    4    GID not unique (when -o not used)
    9    Group name not unique
    10   Can't update group file`,

    'zh': `groupadd - 向系统添加用户组

语法
    groupadd [选项] 组名

描述
    groupadd 使用命令行指定的值加上系统默认值创建新的组账户。
    新组将根据需要输入到系统文件中。

选项
    -g, --gid GID           为新组使用指定的GID
    -r, --system            创建系统组
    -f, --force             如果组已存在则成功退出
    -o, --non-unique        允许创建具有重复GID的组
    -K, --key 键=值         覆盖/etc/login.defs中的默认值
    -p, --password 密码     为组设置加密密码

示例
    groupadd developers         # 创建组'developers'
    groupadd -g 1500 staff      # 创建GID为1500的组'staff'
    groupadd -r system-service  # 创建系统组
    groupadd -f existing-group  # 强制创建，即使组已存在

文件
    /etc/group              组账户信息
    /etc/gshadow            安全组账户信息
    /etc/login.defs         影子密码套件配置

注意
    - 组名必须唯一
    - 组名应以字母或下划线开头
    - 系统组通常具有低于1000的GID
    - 普通组通常具有1000及以上的GID
    - 使用'groupdel'删除组
    - 使用'groupmod'修改现有组

退出值
    0    成功
    2    无效的命令语法
    3    选项的无效参数
    4    GID不唯一（未使用-o时）
    9    组名不唯一
    10   无法更新组文件`
  },
  
  examples: [
    {
      command: 'groupadd developers',
      description: 'Create a new group called developers|创建名为developers的新组'
    },
    {
      command: 'groupadd -g 1500 staff',
      description: 'Create group staff with specific GID 1500|创建GID为1500的staff组'
    },
    {
      command: 'groupadd -r system-service',
      description: 'Create a system group|创建系统组'
    },
    {
      command: 'groupadd -f existing-group',
      description: 'Force creation even if group exists|强制创建，即使组已存在'
    }
  ]
}

export default groupadd