/**
 * sort - 对文本行进行排序
 */

export const sort = {
  name: 'sort',
  description: 'Sort lines of text files|对文本行进行排序',
  usage: 'sort [OPTION]... [FILE]...',
  category: 'text',
  
  options: [
    // 排序选项组
    {
      flag: '-r',
      longFlag: '--reverse',
      description: '逆序排序',
      type: 'boolean',
      group: '排序选项'
    },
    {
      flag: '-n',
      longFlag: '--numeric-sort',
      description: '按数值排序',
      type: 'boolean',
      group: '排序选项'
    },
    {
      flag: '-h',
      longFlag: '--human-numeric-sort',
      description: '按人类可读数字排序（如：2K, 1G）',
      type: 'boolean',
      group: '排序选项'
    },
    {
      flag: '-M',
      longFlag: '--month-sort',
      description: '按月份排序',
      type: 'boolean',
      group: '排序选项'
    },
    {
      flag: '-V',
      longFlag: '--version-sort',
      description: '按版本号排序',
      type: 'boolean',
      group: '排序选项'
    },
    {
      flag: '-R',
      longFlag: '--random-sort',
      description: '随机排序',
      type: 'boolean',
      group: '排序选项'
    },
    
    // 字符处理组
    {
      flag: '-f',
      longFlag: '--ignore-case',
      description: '忽略大小写',
      type: 'boolean',
      group: '字符处理'
    },
    {
      flag: '-b',
      longFlag: '--ignore-leading-blanks',
      description: '忽略前导空白',
      type: 'boolean',
      group: '字符处理'
    },
    {
      flag: '-d',
      longFlag: '--dictionary-order',
      description: '字典序（仅考虑空白和字母数字字符）',
      type: 'boolean',
      group: '字符处理'
    },
    
    // 字段和键组
    {
      flag: '-t',
      longFlag: '--field-separator',
      description: '指定字段分隔符',
      type: 'input',
      inputKey: 'field_separator',
      placeholder: '分隔符（如：:, ,, \\t）',
      group: '字段和键'
    },
    {
      flag: '-k',
      longFlag: '--key',
      description: '按指定键排序',
      type: 'input',
      inputKey: 'sort_key',
      placeholder: '键定义（如：2, 1,3, 2n）',
      group: '字段和键'
    },
    
    // 输出控制组
    {
      flag: '-u',
      longFlag: '--unique',
      description: '去除重复行',
      type: 'boolean',
      group: '输出控制'
    },
    {
      flag: '-o',
      longFlag: '--output',
      description: '输出到文件',
      type: 'input',
      inputKey: 'output_file',
      placeholder: '输出文件路径',
      group: '输出控制'
    },
    {
      flag: '-s',
      longFlag: '--stable',
      description: '稳定排序（保持相等元素的原始顺序）',
      type: 'boolean',
      group: '输出控制'
    },
    
    // 检查选项组
    {
      flag: '-c',
      longFlag: '--check',
      description: '检查是否已排序',
      type: 'boolean',
      group: '检查选项'
    },
    {
      flag: '-C',
      longFlag: '--check=quiet',
      description: '静默检查是否已排序',
      type: 'boolean',
      group: '检查选项'
    },
    {
      flag: '-m',
      longFlag: '--merge',
      description: '合并已排序的文件',
      type: 'boolean',
      group: '检查选项'
    },
    
    // 输入参数
    {
      inputKey: 'files',
      description: '要排序的文件',
      type: 'input',
      placeholder: '文件路径（支持多个文件，用空格分隔）'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return sort.help
    }

    const reverse = args.includes('-r') || args.includes('--reverse')
    const numeric = args.includes('-n') || args.includes('--numeric-sort')
    const unique = args.includes('-u') || args.includes('--unique')
    const ignoreCase = args.includes('-f') || args.includes('--ignore-case')
    const dictionary = args.includes('-d') || args.includes('--dictionary-order')
    const ignoreLeading = args.includes('-b') || args.includes('--ignore-leading-blanks')
    const monthSort = args.includes('-M') || args.includes('--month-sort')
    const humanNumeric = args.includes('-h') || args.includes('--human-numeric-sort')
    const versionSort = args.includes('-V') || args.includes('--version-sort')
    const randomSort = args.includes('-R') || args.includes('--random-sort')
    const stable = args.includes('-s') || args.includes('--stable')
    const check = args.includes('-c') || args.includes('--check')
    const checkQuiet = args.includes('-C') || args.includes('--check=quiet')
    const merge = args.includes('-m') || args.includes('--merge')
    
    // 获取字段分隔符和排序键
    const fieldSeparator = getOptionValue(args, '-t') || /\s+/
    const sortKeys = getSortKeys(args)
    const outputFile = getOptionValue(args, '-o')
    
    // 获取输入文件
    const files = args.filter(arg => 
      !arg.startsWith('-') && 
      !isOptionValue(arg, args)
    )

    // 如果没有指定文件，从标准输入读取
    if (files.length === 0) {
      files.push('-')
    }

    let allLines = []

    // 读取所有文件内容
    for (const file of files) {
      let content
      
      if (file === '-') {
        content = context.stdin || 'zebra\napple\nbanana\ncherry\n10\n2\n100'
      } else {
        content = fs.getFileContent(file)
        if (content === null) {
          throw new Error(`sort: ${file}: No such file or directory|文件或目录不存在`)
        }
      }

      const lines = content.split('\n').filter(line => line !== '')
      allLines.push(...lines)
    }

    // 检查是否已排序
    if (check || checkQuiet) {
      const sorted = [...allLines]
      sortLines(sorted, {
        reverse, numeric, ignoreCase, dictionary, ignoreLeading,
        monthSort, humanNumeric, versionSort, randomSort,
        fieldSeparator, sortKeys
      })
      
      const isAlreadySorted = JSON.stringify(allLines) === JSON.stringify(sorted)
      
      if (!isAlreadySorted) {
        if (!checkQuiet) {
          return 'sort: disorder detected|检测到无序'
        }
        return null
      }
      return ''
    }

    // 执行排序
    sortLines(allLines, {
      reverse, numeric, ignoreCase, dictionary, ignoreLeading,
      monthSort, humanNumeric, versionSort, randomSort, stable,
      fieldSeparator, sortKeys
    })

    // 去重
    if (unique) {
      allLines = [...new Set(allLines)]
    }

    const result = allLines.join('\n')

    // 输出到文件
    if (outputFile) {
      fs.writeFile(outputFile, result)
      return ''
    }

    return result
  },
  requiresArgs: false,
  examples: [
    'sort file.txt                    # Sort lines in file|对文件中的行进行排序',
    'sort -r file.txt                 # Sort in reverse order|按逆序排序',
    'sort -n numbers.txt              # Sort numerically|按数值排序',
    'sort -u file.txt                 # Sort and remove duplicates|排序并去重',
    'sort -k2 file.txt                # Sort by 2nd field|按第2个字段排序',
    'sort -t: -k3 /etc/passwd         # Sort by 3rd field using : as delimiter|使用:作为分隔符按第3字段排序',
    'sort -h sizes.txt                # Sort human readable numbers|按人类可读数字排序',
    'sort -M months.txt               # Sort by month names|按月份名称排序'
  ],
  help: `Usage: sort [OPTION]... [FILE]...
用法: sort [选项]... [文件]...

Write sorted concatenation of all FILE(s) to standard output.
将所有文件的内容排序后连接输出到标准输出。

With no FILE, or when FILE is -, read standard input.
如果没有文件或文件为-，则从标准输入读取。

Ordering options|排序选项:
  -b, --ignore-leading-blanks  ignore leading blanks|忽略前导空白
  -d, --dictionary-order      consider only blanks and alphanumeric characters|仅考虑空白和字母数字字符
  -f, --ignore-case           fold lower case to upper case characters|忽略大小写
  -g, --general-numeric-sort  compare according to general numerical value|按通用数值比较
  -h, --human-numeric-sort    compare human readable numbers (e.g., 2K 1G)|比较人类可读数字
  -M, --month-sort            compare (unknown) < 'JAN' < ... < 'DEC'|按月份排序
  -n, --numeric-sort          compare according to string numerical value|按数值排序
  -r, --reverse               reverse the result of comparisons|逆序排序
  -R, --random-sort           shuffle, but group identical keys|随机排序
  -V, --version-sort          natural sort of (version) numbers within text|版本号排序

Other options|其他选项:
  -c, --check                 check for sorted input; do not sort|检查是否已排序
  -k, --key=KEYDEF            sort via a key; KEYDEF gives location and type|按指定键排序
  -o, --output=FILE           write result to FILE instead of standard output|输出到文件
  -t, --field-separator=SEP   use SEP instead of non-blank to blank transition|使用指定字段分隔符
  -u, --unique                output only the first of an equal run|去除重复行
      --help                  display this help and exit|显示帮助信息并退出

Examples|示例:
  sort file.txt                     Sort lines in file|对文件中的行排序
  sort -r file.txt                  Sort in reverse order|逆序排序
  sort -n numbers.txt               Sort numerically|按数值排序
  sort -u file.txt                  Sort and remove duplicates|排序并去重
  sort -k2 file.txt                 Sort by 2nd field|按第2个字段排序
  sort -t: -k3 /etc/passwd          Sort by 3rd field using : as delimiter|使用:分隔符按第3字段排序`
}

// 排序函数
function sortLines(lines, options) {
  const {
    reverse, numeric, ignoreCase, dictionary, ignoreLeading,
    monthSort, humanNumeric, versionSort, randomSort, stable,
    fieldSeparator, sortKeys
  } = options

  lines.sort((a, b) => {
    let result = 0

    if (randomSort) {
      return Math.random() - 0.5
    }

    // 如果指定了排序键，使用键排序
    if (sortKeys.length > 0) {
      for (const key of sortKeys) {
        const aValue = extractKeyValue(a, key, fieldSeparator)
        const bValue = extractKeyValue(b, key, fieldSeparator)
        result = compareValues(aValue, bValue, key.options || options)
        if (result !== 0) break
      }
    } else {
      // 使用整行排序
      result = compareValues(a, b, options)
    }

    return reverse ? -result : result
  })
}

// 提取排序键值
function extractKeyValue(line, key, fieldSeparator) {
  const fields = splitLine(line, fieldSeparator)
  const startField = key.startField - 1
  const endField = key.endField ? key.endField - 1 : startField
  
  if (startField >= fields.length) return ''
  
  let value = ''
  for (let i = startField; i <= Math.min(endField, fields.length - 1); i++) {
    if (i > startField) value += ' '
    value += fields[i] || ''
  }
  
  return value
}

// 分割行为字段
function splitLine(line, separator) {
  if (separator instanceof RegExp) {
    return line.split(separator).filter(field => field !== '')
  } else {
    return line.split(separator)
  }
}

// 比较值
function compareValues(a, b, options) {
  let aValue = a
  let bValue = b

  // 忽略前导空白
  if (options.ignoreLeading) {
    aValue = aValue.replace(/^\s+/, '')
    bValue = bValue.replace(/^\s+/, '')
  }

  // 字典序
  if (options.dictionary) {
    aValue = aValue.replace(/[^a-zA-Z0-9\s]/g, '')
    bValue = bValue.replace(/[^a-zA-Z0-9\s]/g, '')
  }

  // 忽略大小写
  if (options.ignoreCase) {
    aValue = aValue.toLowerCase()
    bValue = bValue.toLowerCase()
  }

  // 数值排序
  if (options.numeric) {
    const aNum = parseFloat(aValue) || 0
    const bNum = parseFloat(bValue) || 0
    return aNum - bNum
  }

  // 人类可读数值排序
  if (options.humanNumeric) {
    return compareHumanNumeric(aValue, bValue)
  }

  // 月份排序
  if (options.monthSort) {
    return compareMonth(aValue, bValue)
  }

  // 版本排序
  if (options.versionSort) {
    return compareVersion(aValue, bValue)
  }

  // 字符串比较
  return aValue.localeCompare(bValue)
}

// 人类可读数值比较
function compareHumanNumeric(a, b) {
  const parseHuman = (str) => {
    const match = str.match(/^(\d+(?:\.\d+)?)\s*([KMGTPEZY]?)$/i)
    if (!match) return parseFloat(str) || 0
    
    const num = parseFloat(match[1])
    const unit = match[2].toUpperCase()
    const multipliers = { K: 1024, M: 1024**2, G: 1024**3, T: 1024**4, P: 1024**5, E: 1024**6, Z: 1024**7, Y: 1024**8 }
    
    return num * (multipliers[unit] || 1)
  }
  
  return parseHuman(a) - parseHuman(b)
}

// 月份比较
function compareMonth(a, b) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const aMonth = months.indexOf(a.toUpperCase().substr(0, 3))
  const bMonth = months.indexOf(b.toUpperCase().substr(0, 3))
  
  if (aMonth === -1 && bMonth === -1) return a.localeCompare(b)
  if (aMonth === -1) return 1
  if (bMonth === -1) return -1
  
  return aMonth - bMonth
}

// 版本比较
function compareVersion(a, b) {
  const aParts = a.split(/[.-]/).map(part => isNaN(part) ? part : parseInt(part))
  const bParts = b.split(/[.-]/).map(part => isNaN(part) ? part : parseInt(part))
  
  const maxLength = Math.max(aParts.length, bParts.length)
  
  for (let i = 0; i < maxLength; i++) {
    const aPart = aParts[i] || 0
    const bPart = bParts[i] || 0
    
    if (typeof aPart === 'number' && typeof bPart === 'number') {
      if (aPart !== bPart) return aPart - bPart
    } else {
      const result = String(aPart).localeCompare(String(bPart))
      if (result !== 0) return result
    }
  }
  
  return 0
}

// 获取排序键
function getSortKeys(args) {
  const keys = []
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-k' && i + 1 < args.length) {
      const keyDef = args[i + 1]
      keys.push(parseKeyDef(keyDef))
    }
  }
  
  return keys
}

// 解析键定义
function parseKeyDef(keyDef) {
  const parts = keyDef.split(',')
  const startPart = parts[0]
  const endPart = parts[1]
  
  const parseKeyPart = (part) => {
    const match = part.match(/^(\d+)(?:\.(\d+))?([bdfgiMhnRrV]*)$/)
    if (!match) return { field: parseInt(part) || 1 }
    
    return {
      field: parseInt(match[1]),
      char: match[2] ? parseInt(match[2]) : null,
      options: parseKeyOptions(match[3])
    }
  }
  
  const start = parseKeyPart(startPart)
  const end = endPart ? parseKeyPart(endPart) : null
  
  return {
    startField: start.field,
    startChar: start.char,
    endField: end ? end.field : null,
    endChar: end ? end.char : null,
    options: start.options
  }
}

// 解析键选项
function parseKeyOptions(optStr) {
  if (!optStr) return {}
  
  const options = {}
  for (const char of optStr) {
    switch (char) {
      case 'b': options.ignoreLeading = true; break
      case 'd': options.dictionary = true; break
      case 'f': options.ignoreCase = true; break
      case 'g': options.generalNumeric = true; break
      case 'i': options.ignoreNonprinting = true; break
      case 'M': options.monthSort = true; break
      case 'h': options.humanNumeric = true; break
      case 'n': options.numeric = true; break
      case 'R': options.randomSort = true; break
      case 'r': options.reverse = true; break
      case 'V': options.versionSort = true; break
    }
  }
  return options
}

// 获取选项值
function getOptionValue(args, option) {
  const index = args.indexOf(option)
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null
}

// 检查参数是否是选项值
function isOptionValue(arg, args) {
  const index = args.indexOf(arg)
  if (index === 0) return false
  
  const prevArg = args[index - 1]
  return ['-t', '-k', '-o', '-S', '-T'].includes(prevArg)
}