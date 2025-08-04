/**
 * umask - 设置或显示文件创建掩码
 */

export const umask = {
  handler: (args, terminalContext, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return umask.help
    }

    // 解析选项
    const symbolic = args.includes('-S') || args.includes('--symbolic')
    const print = args.includes('-p') || args.includes('--print')

    // 过滤选项参数
    const filteredArgs = args.filter(arg => !arg.startsWith('-'))

    // 获取当前umask值（模拟）
    const currentUmask = terminalContext.umask || '0022'

    try {
      if (filteredArgs.length === 0) {
        // 显示当前umask
        if (symbolic) {
          return formatSymbolicUmask(currentUmask)
        } else if (print) {
          return `umask ${currentUmask}`
        } else {
          return currentUmask
        }
      } else {
        // 设置新的umask
        const newUmask = filteredArgs[0]
        const validatedUmask = validateUmask(newUmask)
        
        if (!validatedUmask) {
          return `umask: invalid mode: '${newUmask}'|umask: 无效模式: '${newUmask}'`
        }

        // 更新terminalContext中的umask
        terminalContext.umask = validatedUmask

        if (print) {
          return `umask ${validatedUmask}`
        } else {
          return '' // 设置成功，无输出
        }
      }
    } catch (error) {
      return `umask: ${error.message}`
    }
  },
  description: 'Set or display file creation mask|设置或显示文件创建掩码',
  category: 'permission',
  requiresArgs: false,
  options: [
    {
      flag: '-S',
      longFlag: '--symbolic',
      description: '以符号形式显示掩码',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-p',
      longFlag: '--print',
      description: '以可重用的形式输出',
      type: 'boolean',
      group: '显示选项'
    },
    {
      description: '新的掩码值 (八进制如022或符号如u=rwx,g=rx,o=)',
      type: 'input',
      inputKey: 'mask_value',
      placeholder: '022 或 u=rwx,g=rx,o=',
      required: false
    }
  ],
  examples: [
    'umask',
    'umask -S',
    'umask 0077',
    'umask u=rwx,g=,o=',
    'umask -p'
  ],
  help: `Usage: umask [-p] [-S] [mode]

Display or set file mode creation mask.

Options:
  -p    if MODE is omitted, output in a form that may be reused as input
  -S    makes the output symbolic; otherwise an octal number is output

MODE is either an octal number or a symbolic mode string.

If MODE is omitted, prints the current value of the mask.

The mask is used to set the file permissions for newly created files.
The mask is subtracted from the default permissions (666 for files, 777 for directories).

Examples:
  umask           # Display current mask
  umask -S        # Display in symbolic form
  umask 022       # Set mask to 022 (files: 644, dirs: 755)
  umask 077       # Set mask to 077 (files: 600, dirs: 700)
  umask u=rwx,g=rx,o=rx  # Set mask symbolically

Common umask values:
  022 - Default for most systems (files: 644, dirs: 755)
  002 - Group writable (files: 664, dirs: 775)
  077 - Private to user only (files: 600, dirs: 700)
  000 - No restrictions (files: 666, dirs: 777)`
}

// 验证umask值
function validateUmask(umask) {
  // 处理八进制数字
  if (/^[0-7]{3,4}$/.test(umask)) {
    // 确保是4位数字格式
    return umask.length === 3 ? `0${umask}` : umask
  }

  // 处理符号模式
  if (umask.includes('=') || umask.includes('+') || umask.includes('-')) {
    return parseSymbolicUmask(umask)
  }

  return null
}

// 解析符号umask
function parseSymbolicUmask(symbolic) {
  try {
    // 这是一个简化的符号解析器
    // 实际实现会更复杂
    const parts = symbolic.split(',')
    let userMask = 0, groupMask = 0, otherMask = 0

    for (const part of parts) {
      const match = part.match(/^([ugo]*)([=+-])([rwx]*)$/)
      if (!match) continue

      const [, who, op, perms] = match
      const permValue = calculatePermValue(perms)

      if (who.includes('u') || who === '') {
        userMask = op === '=' ? (7 - permValue) : userMask
      }
      if (who.includes('g') || who === '') {
        groupMask = op === '=' ? (7 - permValue) : groupMask
      }
      if (who.includes('o') || who === '') {
        otherMask = op === '=' ? (7 - permValue) : otherMask
      }
    }

    return `0${userMask}${groupMask}${otherMask}`
  } catch (error) {
    return null
  }
}

// 计算权限值
function calculatePermValue(perms) {
  let value = 0
  if (perms.includes('r')) value += 4
  if (perms.includes('w')) value += 2
  if (perms.includes('x')) value += 1
  return value
}

// 格式化符号umask
function formatSymbolicUmask(octalUmask) {
  const digits = octalUmask.slice(-3).split('').map(Number)
  const [user, group, other] = digits

  const formatPerms = (mask) => {
    const perms = 7 - mask // umask是反向的
    return [
      perms & 4 ? 'r' : '-',
      perms & 2 ? 'w' : '-',
      perms & 1 ? 'x' : '-'
    ].join('')
  }

  return `u=${formatPerms(user)},g=${formatPerms(group)},o=${formatPerms(other)}`
}