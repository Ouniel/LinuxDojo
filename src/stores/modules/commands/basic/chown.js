/**
 * chown - 修改文件所有者和组
 */

export const chown = {
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return chown.help
    }

    if (args.length < 2) {
      return 'chown: missing operand\nTry \'chown --help\' for more information.'
    }

    const recursive = args.includes('-R') || args.includes('--recursive')
    const verbose = args.includes('-v') || args.includes('--verbose')
    const changes = args.includes('-c') || args.includes('--changes')
    const dereference = !args.includes('-h') && !args.includes('--no-dereference')
    
    // 过滤选项参数
    const filteredArgs = args.filter(arg => !arg.startsWith('-'))
    
    if (filteredArgs.length < 2) {
      return 'chown: missing operand\nTry \'chown --help\' for more information.'
    }

    const ownerGroup = filteredArgs[0]
    const files = filteredArgs.slice(1)

    try {
      const results = []
      
      for (const file of files) {
        const result = changeOwnership(file, ownerGroup, { recursive, verbose, changes, dereference }, fs)
        if (result) results.push(result)
      }

      return results.length > 0 ? results.join('\n') : ''
    } catch (error) {
      return `chown: ${error.message}`
    }
  },
  description: 'Change file and directory owner and group|修改文件和目录的所有者和组',
  category: 'basic',
  requiresArgs: true,
  options: [
    {
      flag: '-R',
      longFlag: '--recursive',
      description: '递归操作文件和目录',
      type: 'boolean',
      group: '操作选项'
    },
    {
      flag: '-v',
      longFlag: '--verbose',
      description: '显示详细的处理信息',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '-c',
      longFlag: '--changes',
      description: '仅在发生更改时报告',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '-f',
      longFlag: '--silent',
      description: '抑制大多数错误消息',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '-h',
      longFlag: '--no-dereference',
      description: '影响符号链接而不是引用的文件',
      type: 'boolean',
      group: '操作选项'
    },
    {
      description: '所有者和组 (如: user, user:group, :group)',
      type: 'input',
      inputKey: 'owner_group',
      placeholder: 'user:group 或 user 或 :group',
      required: true
    },
    {
      description: '目标文件或目录',
      type: 'input',
      inputKey: 'files',
      placeholder: 'file.txt 或 directory/',
      required: true
    }
  ],
  examples: [
    'chown user file.txt',
    'chown user:group file.txt',
    'chown :group file.txt',
    'chown -R user:group directory/',
    'chown --reference=ref_file target_file'
  ],
  help: `Usage|用法: chown [OPTION]... [OWNER][:[GROUP]] FILE...
  or|或:  chown [OPTION]... --reference=RFILE FILE...

Change the owner and/or group of each FILE to OWNER and/or GROUP.|将每个文件的所有者和/或组更改为OWNER和/或GROUP。
With --reference, change the owner and group of each FILE to those of RFILE.|使用--reference时，将每个文件的所有者和组更改为RFILE的所有者和组。

  -c, --changes          like verbose but report only when a change is made|类似verbose但仅在发生更改时报告
  -f, --silent, --quiet  suppress most error messages|抑制大多数错误消息
  -v, --verbose          output a diagnostic for every file processed|为每个处理的文件输出诊断信息
      --dereference      affect the referent of each symbolic link (this is the default), rather than the symbolic link itself|影响每个符号链接的引用对象（这是默认行为），而不是符号链接本身
  -h, --no-dereference   affect symbolic links instead of any referenced file|影响符号链接而不是任何引用的文件
  -R, --recursive        operate on files and directories recursively|递归操作文件和目录
      --reference=RFILE  use RFILE's owner and group rather than specifying OWNER:GROUP values|使用RFILE的所有者和组而不是指定OWNER:GROUP值
      --help     display this help and exit|显示此帮助信息并退出
      --version  output version information and exit|输出版本信息并退出

Owner is unchanged if missing. Group is unchanged if missing, but changed to login group if implied by a ':' following a symbolic OWNER.|如果缺少所有者则保持不变。如果缺少组则保持不变，但如果符号OWNER后跟':'则更改为登录组。
OWNER and GROUP may be numeric as well as symbolic.|OWNER和GROUP可以是数字或符号形式。

EXAMPLES|示例:
  chown root /u        Change the owner of /u to "root".|将/u的所有者更改为"root"
  chown root:staff /u  Likewise, but also change its group to "staff".|同样，但也将其组更改为"staff"
  chown -hR root /u    Change the owner of /u and subfiles to "root".|将/u及其子文件的所有者更改为"root"`
}

// 修改所有权的主要函数
function changeOwnership(filePath, ownerGroup, options, fs) {
  const results = []
  
  // 获取文件信息
  const fileInfo = getFileInfo(filePath, fs)
  if (!fileInfo) {
    throw new Error(`cannot access '${filePath}': No such file or directory`)
  }

  // 解析所有者和组
  const { owner, group } = parseOwnerGroup(ownerGroup)
  
  const oldOwner = fileInfo.owner
  const oldGroup = fileInfo.group
  const newOwner = owner || oldOwner
  const newGroup = group || oldGroup

  // 验证用户和组是否存在
  if (owner && !userExists(owner)) {
    throw new Error(`invalid user: '${owner}'`)
  }
  
  if (group && !groupExists(group)) {
    throw new Error(`invalid group: '${group}'`)
  }

  // 模拟所有权修改
  const success = setFileOwnership(filePath, newOwner, newGroup, fs)
  
  if (success) {
    const ownerChanged = oldOwner !== newOwner
    const groupChanged = oldGroup !== newGroup
    
    if (options.verbose || (options.changes && (ownerChanged || groupChanged))) {
      let changeMsg = `ownership of '${filePath}'`
      
      if (ownerChanged && groupChanged) {
        changeMsg += ` changed from ${oldOwner}:${oldGroup} to ${newOwner}:${newGroup}`
      } else if (ownerChanged) {
        changeMsg += ` changed from ${oldOwner} to ${newOwner}`
      } else if (groupChanged) {
        changeMsg += ` group changed from ${oldGroup} to ${newGroup}`
      } else {
        changeMsg += ` retained as ${newOwner}:${newGroup}`
      }
      
      results.push(changeMsg)
    }
    
    // 递归处理目录
    if (options.recursive && fileInfo.type === 'directory') {
      const children = getDirectoryContents(filePath, fs)
      for (const child of children) {
        const childPath = `${filePath}/${child}`
        const childResult = changeOwnership(childPath, ownerGroup, options, fs)
        if (childResult) results.push(childResult)
      }
    }
  } else {
    throw new Error(`changing ownership of '${filePath}': Operation not permitted`)
  }

  return results.join('\n')
}

// 解析所有者和组字符串
function parseOwnerGroup(ownerGroup) {
  let owner = null
  let group = null
  
  if (ownerGroup.includes(':')) {
    const parts = ownerGroup.split(':')
    owner = parts[0] || null
    group = parts[1] || null
  } else if (ownerGroup.includes('.')) {
    // 支持旧式的 owner.group 格式
    const parts = ownerGroup.split('.')
    owner = parts[0] || null
    group = parts[1] || null
  } else {
    owner = ownerGroup
  }
  
  return { owner, group }
}

// 检查用户是否存在
function userExists(username) {
  // 模拟系统用户列表
  const systemUsers = [
    'root', 'daemon', 'bin', 'sys', 'sync', 'games', 'man', 'lp', 'mail',
    'news', 'uucp', 'proxy', 'www-data', 'backup', 'list', 'irc', 'gnats',
    'nobody', 'systemd-network', 'systemd-resolve', 'syslog', 'messagebus',
    'user', 'admin', 'guest', 'test'
  ]
  
  // 也支持数字UID
  if (/^\d+$/.test(username)) {
    return parseInt(username) >= 0 && parseInt(username) <= 65535
  }
  
  return systemUsers.includes(username)
}

// 检查组是否存在
function groupExists(groupname) {
  // 模拟系统组列表
  const systemGroups = [
    'root', 'daemon', 'bin', 'sys', 'adm', 'tty', 'disk', 'lp', 'mail',
    'news', 'uucp', 'man', 'proxy', 'kmem', 'dialout', 'fax', 'voice',
    'cdrom', 'floppy', 'tape', 'sudo', 'audio', 'dip', 'www-data',
    'backup', 'operator', 'list', 'irc', 'src', 'gnats', 'shadow',
    'utmp', 'video', 'sasl', 'plugdev', 'staff', 'games', 'users',
    'nogroup', 'systemd-journal', 'systemd-network', 'systemd-resolve',
    'input', 'kvm', 'render', 'crontab', 'netdev', 'messagebus',
    'user', 'admin', 'guest', 'test'
  ]
  
  // 也支持数字GID
  if (/^\d+$/.test(groupname)) {
    return parseInt(groupname) >= 0 && parseInt(groupname) <= 65535
  }
  
  return systemGroups.includes(groupname)
}

// 获取文件信息（模拟）
function getFileInfo(filePath, fs) {
  // 模拟文件信息
  const sampleFiles = {
    'file.txt': { owner: 'user', group: 'user', type: 'file', mode: 0o644 },
    'script.sh': { owner: 'user', group: 'user', type: 'file', mode: 0o755 },
    'directory': { owner: 'user', group: 'user', type: 'directory', mode: 0o755 },
    'system.log': { owner: 'root', group: 'root', type: 'file', mode: 0o644 },
    'config.conf': { owner: 'root', group: 'admin', type: 'file', mode: 0o640 }
  }
  
  const fileName = filePath.split('/').pop()
  return sampleFiles[fileName] || { owner: 'user', group: 'user', type: 'file', mode: 0o644 }
}

// 设置文件所有权（模拟）
function setFileOwnership(filePath, owner, group, fs) {
  // 在真实实现中，这里会调用系统API修改文件所有权
  // 这里只是模拟成功
  return true
}

// 获取目录内容（模拟）
function getDirectoryContents(dirPath, fs) {
  // 模拟目录内容
  return ['file1.txt', 'file2.txt', 'subdir']
}