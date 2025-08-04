/**
 * chmod - 修改文件权限
 */

export const chmod = {
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return chmod.help
    }

    if (args.length < 2) {
      return 'chmod: missing operand\nTry \'chmod --help\' for more information.'
    }

    const recursive = args.includes('-R') || args.includes('--recursive')
    const verbose = args.includes('-v') || args.includes('--verbose')
    const changes = args.includes('-c') || args.includes('--changes')
    
    // 过滤选项参数
    const filteredArgs = args.filter(arg => !arg.startsWith('-'))
    
    if (filteredArgs.length < 2) {
      return 'chmod: missing operand\nTry \'chmod --help\' for more information.'
    }

    const mode = filteredArgs[0]
    const files = filteredArgs.slice(1)

    try {
      const results = []
      
      for (const file of files) {
        const result = changePermissions(file, mode, { recursive, verbose, changes }, fs)
        if (result) results.push(result)
      }

      return results.length > 0 ? results.join('\n') : ''
    } catch (error) {
      return `chmod: ${error.message}`
    }
  },
  description: 'Change file and directory permissions|修改文件和目录的访问权限',
  category: 'basic',
  requiresArgs: true,
  options: [
    {
      flag: '-R',
      longFlag: '--recursive',
      description: '递归更改文件和目录',
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
      description: '权限模式 (如: 755, u+x, a=r)',
      type: 'input',
      inputKey: 'mode',
      placeholder: '755 或 u+x 或 a=r',
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
    'chmod 755 script.sh',
    'chmod u+x file.txt',
    'chmod -R 644 directory/',
    'chmod a-w file.txt',
    'chmod u=rwx,g=rx,o=r file.txt'
  ],
  help: `Usage|用法: chmod [OPTION]... MODE[,MODE]... FILE...
  or|或:  chmod [OPTION]... OCTAL-MODE FILE...
  or|或:  chmod [OPTION]... --reference=RFILE FILE...

Change the mode of each FILE to MODE.|将每个文件的权限模式更改为MODE。
With --reference, change the mode of each FILE to that of RFILE.|使用--reference时，将每个文件的权限模式更改为RFILE的权限模式。

  -c, --changes          like verbose but report only when a change is made|类似verbose但仅在发生更改时报告
  -f, --silent, --quiet  suppress most error messages|抑制大多数错误消息
  -v, --verbose          output a diagnostic for every file processed|为每个处理的文件输出诊断信息
  -R, --recursive        change files and directories recursively|递归更改文件和目录
      --help     display this help and exit|显示此帮助信息并退出
      --version  output version information and exit|输出版本信息并退出

Each MODE is of the form '[ugoa]*([-+=]([rwxXst]*|[ugo]))+|[-+=][0-7]+'.|每个MODE的格式为'[ugoa]*([-+=]([rwxXst]*|[ugo]))+|[-+=][0-7]+'。

EXAMPLES|示例:
  chmod 644 files   Give read and write permission to owner and group, read to others.|给所有者和组读写权限，给其他人读权限
  chmod u+x file    Give execute permission to the owner.|给所有者执行权限
  chmod -R 755 dir  Give rwx to owner, and rx to group and others; do this to the contents of 'dir' recursively.|给所有者rwx权限，给组和其他人rx权限；递归应用到'dir'的内容

Numeric mode|数字模式:
  0 = ---   (no permissions)|无权限
  1 = --x   (execute only)|仅执行权限
  2 = -w-   (write only)|仅写权限
  3 = -wx   (write and execute)|写和执行权限
  4 = r--   (read only)|仅读权限
  5 = r-x   (read and execute)|读和执行权限
  6 = rw-   (read and write)|读和写权限
  7 = rwx   (read, write, and execute)|读、写和执行权限

Symbolic mode|符号模式:
  u = user/owner permissions|用户/所有者权限
  g = group permissions|组权限
  o = other permissions|其他用户权限
  a = all permissions (user, group, and other)|所有权限（用户、组和其他）
  
  + = add permissions|添加权限
  - = remove permissions|移除权限
  = = set permissions exactly|精确设置权限
  
  r = read permission|读权限
  w = write permission|写权限
  x = execute permission|执行权限`
}

// 修改权限的主要函数
function changePermissions(filePath, mode, options, fs) {
  const results = []
  
  // 获取文件信息
  const fileInfo = getFileInfo(filePath, fs)
  if (!fileInfo) {
    throw new Error(`cannot access '${filePath}': No such file or directory`)
  }

  const oldMode = fileInfo.mode
  const newMode = calculateNewMode(oldMode, mode)
  
  if (newMode === null) {
    throw new Error(`invalid mode: '${mode}'`)
  }

  // 模拟权限修改
  const success = setFileMode(filePath, newMode, fs)
  
  if (success) {
    if (options.verbose || (options.changes && oldMode !== newMode)) {
      const oldModeStr = formatMode(oldMode)
      const newModeStr = formatMode(newMode)
      results.push(`mode of '${filePath}' changed from ${oldModeStr} (${oldMode}) to ${newModeStr} (${newMode})`)
    }
    
    // 递归处理目录
    if (options.recursive && fileInfo.type === 'directory') {
      const children = getDirectoryContents(filePath, fs)
      for (const child of children) {
        const childPath = `${filePath}/${child}`
        const childResult = changePermissions(childPath, mode, options, fs)
        if (childResult) results.push(childResult)
      }
    }
  } else {
    throw new Error(`changing permissions of '${filePath}': Operation not permitted`)
  }

  return results.join('\n')
}

// 计算新的权限模式
function calculateNewMode(currentMode, modeString) {
  // 处理八进制模式 (如 755, 644)
  if (/^\d{3,4}$/.test(modeString)) {
    return parseInt(modeString, 8)
  }
  
  // 处理符号模式 (如 u+x, g-w, a=r)
  if (/^[ugoa]*[+-=][rwxXst]*$/.test(modeString)) {
    return calculateSymbolicMode(currentMode, modeString)
  }
  
  // 处理复合符号模式 (如 u=rwx,g=rx,o=r)
  if (modeString.includes(',')) {
    let newMode = currentMode
    const modes = modeString.split(',')
    for (const mode of modes) {
      newMode = calculateSymbolicMode(newMode, mode.trim())
      if (newMode === null) return null
    }
    return newMode
  }
  
  return null
}

// 计算符号模式
function calculateSymbolicMode(currentMode, modeString) {
  const match = modeString.match(/^([ugoa]*)([-+=])([rwxXst]*)$/)
  if (!match) return null
  
  const [, who, operator, permissions] = match
  const whoChars = who || 'a' // 默认为所有用户
  
  let permValue = 0
  for (const perm of permissions) {
    switch (perm) {
      case 'r': permValue |= 4; break
      case 'w': permValue |= 2; break
      case 'x': permValue |= 1; break
      case 'X': permValue |= 1; break // 条件执行权限
      case 's': permValue |= 4; break // setuid/setgid
      case 't': permValue |= 1; break // sticky bit
    }
  }
  
  let newMode = currentMode
  
  for (const whoChar of whoChars) {
    let shift = 0
    switch (whoChar) {
      case 'u': shift = 6; break // 用户权限位
      case 'g': shift = 3; break // 组权限位
      case 'o': shift = 0; break // 其他权限位
      case 'a': 
        // 对所有用户应用
        newMode = applyPermissionChange(newMode, operator, permValue, 6) // user
        newMode = applyPermissionChange(newMode, operator, permValue, 3) // group
        newMode = applyPermissionChange(newMode, operator, permValue, 0) // other
        continue
    }
    
    newMode = applyPermissionChange(newMode, operator, permValue, shift)
  }
  
  return newMode
}

// 应用权限变更
function applyPermissionChange(mode, operator, permValue, shift) {
  const mask = 7 << shift // 3位权限掩码
  const shiftedPerm = permValue << shift
  
  switch (operator) {
    case '+':
      return mode | shiftedPerm
    case '-':
      return mode & ~shiftedPerm
    case '=':
      return (mode & ~mask) | shiftedPerm
    default:
      return mode
  }
}

// 格式化权限模式为字符串
function formatMode(mode) {
  const permissions = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx']
  const user = permissions[(mode >> 6) & 7]
  const group = permissions[(mode >> 3) & 7]
  const other = permissions[mode & 7]
  return user + group + other
}

// 获取文件信息（模拟）
function getFileInfo(filePath, fs) {
  // 模拟文件信息
  const sampleFiles = {
    'script.sh': { mode: 0o755, type: 'file', size: 1024 },
    'file.txt': { mode: 0o644, type: 'file', size: 512 },
    'directory': { mode: 0o755, type: 'directory', size: 4096 },
    'readonly.txt': { mode: 0o444, type: 'file', size: 256 },
    'executable': { mode: 0o755, type: 'file', size: 2048 }
  }
  
  const fileName = filePath.split('/').pop()
  return sampleFiles[fileName] || { mode: 0o644, type: 'file', size: 1024 }
}

// 设置文件权限（模拟）
function setFileMode(filePath, mode, fs) {
  // 在真实实现中，这里会调用系统API修改文件权限
  // 这里只是模拟成功
  return true
}

// 获取目录内容（模拟）
function getDirectoryContents(dirPath, fs) {
  // 模拟目录内容
  return ['file1.txt', 'file2.txt', 'subdir']
}