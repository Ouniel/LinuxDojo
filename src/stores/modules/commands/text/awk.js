/**
 * awk - 文本处理工具
 */

export const awk = {
  name: 'awk',
  description: 'Pattern scanning and processing language|文本处理工具',
  
  options: [
    {
      name: '程序选项',
      type: 'group',
      options: [
        {
          name: '-f, --file',
          type: 'input',
          description: '从文件中读取AWK程序',
          placeholder: '程序文件路径',
          flag: '-f'
        }
      ]
    },
    {
      name: '字段分隔符',
      type: 'group',
      options: [
        {
          name: '-F, --field-separator',
          type: 'input',
          description: '指定字段分隔符',
          placeholder: '分隔符（如：:, ,, \\t）',
          defaultValue: ' ',
          flag: '-F'
        }
      ]
    },
    {
      name: '变量赋值',
      type: 'group',
      options: [
        {
          name: '-v, --assign',
          type: 'input',
          description: '设置变量值',
          placeholder: '变量=值（如：OFS=,, RS=\\n）',
          flag: '-v'
        }
      ]
    },
    {
      name: '兼容性选项',
      type: 'group',
      options: [
        {
          name: '--traditional',
          type: 'checkbox',
          description: '使用传统AWK兼容模式',
          flag: '--traditional'
        },
        {
          name: '--posix',
          type: 'checkbox',
          description: '使用POSIX兼容模式',
          flag: '--posix'
        },
        {
          name: '--gnu-compat',
          type: 'checkbox',
          description: '使用GNU兼容模式',
          flag: '--gnu-compat'
        }
      ]
    },
    {
      name: '调试选项',
      type: 'group',
      options: [
        {
          name: '--lint',
          type: 'checkbox',
          description: '启用语法检查警告',
          flag: '--lint'
        },
        {
          name: '--profile',
          type: 'input',
          description: '生成性能分析文件',
          placeholder: '分析文件路径（可选）',
          flag: '--profile'
        }
      ]
    },
    {
      name: 'AWK程序',
      type: 'input',
      description: 'AWK程序代码',
      placeholder: 'AWK程序代码（如：{print $1}, /pattern/{print}）',
      position: 'arg'
    },
    {
      name: '文件',
      type: 'input',
      description: '要处理的文件',
      placeholder: '文件路径（支持多个文件，用空格分隔）',
      position: 'end'
    }
  ],

  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return awk.help
    }

    if (args.length === 0) {
      throw new Error('awk: missing program text\nTry \'awk --help\' for more information.')
    }

    const fieldSeparator = getOptionValue(args, '-F') || ' '
    const outputFieldSeparator = getOptionValue(args, '-v', 'OFS') || ' '
    const recordSeparator = getOptionValue(args, '-v', 'RS') || '\n'
    const outputRecordSeparator = getOptionValue(args, '-v', 'ORS') || '\n'
    
    // 获取程序和文件参数
    let programIndex = 0
    for (let i = 0; i < args.length; i++) {
      if (!args[i].startsWith('-') && !isOptionValue(args[i], args, i)) {
        programIndex = i
        break
      }
    }

    if (programIndex >= args.length) {
      throw new Error('awk: missing program text\nTry \'awk --help\' for more information.')
    }

    const program = args[programIndex]
    const files = args.slice(programIndex + 1).filter(arg => !arg.startsWith('-'))

    // 如果没有指定文件，从标准输入读取
    if (files.length === 0) {
      files.push('-')
    }

    const results = []
    let totalNR = 0 // 总记录数

    for (const file of files) {
      let content
      let filename = file

      if (file === '-') {
        content = context.stdin || 'field1 field2 field3\nvalue1 value2 value3\ntest data here'
        filename = '(standard input)'
      } else {
        content = fs.getFileContent(file)
        if (content === null) {
          throw new Error(`awk: ${file}: No such file or directory`)
        }
      }

      const records = content.split(recordSeparator).filter(record => record !== '')
      
      for (let i = 0; i < records.length; i++) {
        const record = records[i]
        totalNR++
        
        // 分割字段
        const fields = splitFields(record, fieldSeparator)
        
        // 创建AWK执行环境
        const awkContext = {
          NR: totalNR,        // 总记录数
          FNR: i + 1,         // 文件内记录数
          NF: fields.length,  // 字段数
          FILENAME: filename,
          FS: fieldSeparator,
          OFS: outputFieldSeparator,
          RS: recordSeparator,
          ORS: outputRecordSeparator,
          fields: ['', ...fields], // AWK字段从$1开始，$0是整行
          $0: record
        }
        
        // 为字段创建访问器
        for (let j = 0; j < fields.length; j++) {
          awkContext[`$${j + 1}`] = fields[j]
        }

        try {
          const output = executeAwkProgram(program, awkContext)
          if (output !== null && output !== undefined) {
            results.push(output)
          }
        } catch (e) {
          throw new Error(`awk: ${e.message}`)
        }
      }
    }

    return results.join(outputRecordSeparator)
  },

  category: 'text',
  requiresArgs: true,
  examples: [
    'awk \'{print $1}\' file.txt',
    'awk \'{print NR, $0}\' file.txt',
    'awk -F: \'{print $1}\' /etc/passwd',
    'awk \'NR==1 {print}\' file.txt',
    'awk \'{sum += $1} END {print sum}\' numbers.txt',
    'awk \'length($0) > 80\' file.txt',
    'awk \'/pattern/ {print $2}\' file.txt',
    'awk \'BEGIN {print "Start"} {print} END {print "End"}\' file.txt'
  ],
  help: `Usage: awk [POSIX or GNU style options] -f progfile [--] file ...
       awk [POSIX or GNU style options] [--] 'program' file ...

POSIX options:          GNU long options: (standard)
   -f progfile             --file=progfile
   -F fs                   --field-separator=fs
   -v var=val              --assign=var=val
   -m[fr] val
   -O                      --optimize
   -W option               --traditional, --posix, --gnu-compat

GNU long options: (extensions)
   --bignum                --characters-as-bytes
   --csv                   --dump-po=file
   --exec=file             --gen-pot
   --help                  --include=file
   --lint[=fatal]          --lint-old
   --load=file             --non-decimal-data
   --pretty-print[=file]   --profile[=file]
   --re-interval           --sandbox
   --source=program        --traditional
   --use-lc-numeric        --version

For bug reporting instructions, please see:
http://www.gnu.org/software/gawk/

AWK Program Structure:
  BEGIN { action }        # executed before processing any input
  pattern { action }      # executed for each input line matching pattern
  END { action }          # executed after processing all input

Built-in Variables:
  NR      Number of records processed
  FNR     Number of records in current file
  NF      Number of fields in current record
  FILENAME Current filename
  FS      Field separator (default: space)
  OFS     Output field separator (default: space)
  RS      Record separator (default: newline)
  ORS     Output record separator (default: newline)
  $0      Entire current record
  $1, $2... Individual fields

Built-in Functions:
  length(s)       Length of string s
  substr(s,i,n)   Substring of s starting at i, length n
  index(s,t)      Position of string t in s
  split(s,a,fs)   Split string s into array a using separator fs
  gsub(r,s,t)     Global substitution of regex r with s in t
  sub(r,s,t)      Substitute first occurrence of regex r with s in t
  match(s,r)      Match string s against regex r
  sprintf(fmt,...)Format string
  print           Print current record
  printf(fmt,...) Formatted print

Operators:
  Arithmetic: +, -, *, /, %, ^
  Comparison: <, <=, ==, !=, >=, >
  Logical: &&, ||, !
  Pattern matching: ~, !~
  Assignment: =, +=, -=, *=, /=, %=, ^=

Examples:
  awk '{print $1}'                    Print first field
  awk 'NR==1'                         Print first line
  awk '/pattern/'                     Print lines matching pattern
  awk '{sum+=$1} END {print sum}'     Sum first field
  awk -F: '{print $1}' /etc/passwd    Use : as field separator`
}

// 分割字段
function splitFields(record, separator) {
  if (separator === ' ') {
    // 默认分隔符：连续空白字符
    return record.trim().split(/\s+/).filter(field => field !== '')
  } else if (separator.length === 1) {
    // 单字符分隔符
    return record.split(separator)
  } else {
    // 正则表达式分隔符
    try {
      const regex = new RegExp(separator)
      return record.split(regex)
    } catch (e) {
      return record.split(separator)
    }
  }
}

// 执行AWK程序
function executeAwkProgram(program, context) {
  // 简化的AWK程序解析和执行
  // 这里实现基本的AWK功能
  
  // 处理BEGIN和END块
  const beginMatch = program.match(/BEGIN\s*\{([^}]*)\}/)
  const endMatch = program.match(/END\s*\{([^}]*)\}/)
  
  let output = []
  
  // 执行BEGIN块（只在第一条记录时执行）
  if (beginMatch && context.NR === 1) {
    const beginAction = beginMatch[1]
    const beginResult = executeAction(beginAction, context)
    if (beginResult) output.push(beginResult)
  }
  
  // 执行主程序
  let shouldExecute = true
  
  // 检查模式匹配
  const patternMatch = program.match(/^([^{]+)\s*\{/)
  if (patternMatch) {
    const pattern = patternMatch[1].trim()
    shouldExecute = evaluatePattern(pattern, context)
  }
  
  if (shouldExecute) {
    // 提取动作部分
    let action = program
    if (program.includes('{')) {
      const actionMatch = program.match(/\{([^}]*)\}/)
      if (actionMatch) {
        action = actionMatch[1]
      }
    } else {
      // 如果没有动作，默认打印整行
      action = 'print'
    }
    
    const result = executeAction(action, context)
    if (result) output.push(result)
  }
  
  // 执行END块（只在最后一条记录时执行）
  if (endMatch && context.NR === context.totalRecords) {
    const endAction = endMatch[1]
    const endResult = executeAction(endAction, context)
    if (endResult) output.push(endResult)
  }
  
  return output.length > 0 ? output.join('\n') : null
}

// 评估模式
function evaluatePattern(pattern, context) {
  if (!pattern || pattern === '') return true
  
  // 数字模式（行号）
  if (/^\d+$/.test(pattern)) {
    return context.NR === parseInt(pattern)
  }
  
  // 范围模式
  if (pattern.includes(',')) {
    const [start, end] = pattern.split(',').map(p => p.trim())
    const startNum = parseInt(start)
    const endNum = parseInt(end)
    return context.NR >= startNum && context.NR <= endNum
  }
  
  // 正则表达式模式
  if (pattern.startsWith('/') && pattern.endsWith('/')) {
    const regex = new RegExp(pattern.slice(1, -1))
    return regex.test(context.$0)
  }
  
  // 条件表达式
  try {
    return evaluateExpression(pattern, context)
  } catch (e) {
    return false
  }
}

// 执行动作
function executeAction(action, context) {
  if (!action || action.trim() === '') return null
  
  // 处理print语句
  if (action.includes('print')) {
    return handlePrint(action, context)
  }
  
  // 处理其他语句
  try {
    return evaluateExpression(action, context)
  } catch (e) {
    return null
  }
}

// 处理print语句
function handlePrint(action, context) {
  const printMatch = action.match(/print\s*(.*)/)
  if (!printMatch) return context.$0
  
  const printArgs = printMatch[1].trim()
  if (!printArgs) return context.$0
  
  // 解析打印参数
  const args = printArgs.split(',').map(arg => arg.trim())
  const values = args.map(arg => {
    if (arg.startsWith('"') && arg.endsWith('"')) {
      return arg.slice(1, -1) // 字符串字面量
    } else if (arg.startsWith('$')) {
      const fieldNum = parseInt(arg.slice(1))
      return context.fields[fieldNum] || ''
    } else if (arg === 'NR') {
      return context.NR.toString()
    } else if (arg === 'NF') {
      return context.NF.toString()
    } else if (arg === 'FILENAME') {
      return context.FILENAME
    } else {
      return evaluateExpression(arg, context) || arg
    }
  })
  
  return values.join(context.OFS)
}

// 评估表达式
function evaluateExpression(expr, context) {
  // 简化的表达式评估
  // 替换AWK变量
  let evaluatedExpr = expr
    .replace(/\$(\d+)/g, (match, num) => `"${context.fields[parseInt(num)] || ''}"`)
    .replace(/\$0/g, `"${context.$0}"`)
    .replace(/\bNR\b/g, context.NR)
    .replace(/\bNF\b/g, context.NF)
    .replace(/\bFILENAME\b/g, `"${context.FILENAME}"`)
  
  try {
    // 注意：在实际环境中需要更安全的表达式评估
    return eval(evaluatedExpr)
  } catch (e) {
    return null
  }
}

// 获取选项值
function getOptionValue(args, option, variable = null) {
  const index = args.indexOf(option)
  if (index !== -1 && index + 1 < args.length) {
    const value = args[index + 1]
    if (variable && value.includes('=')) {
      const [varName, varValue] = value.split('=')
      if (varName === variable) {
        return varValue
      }
    } else if (!variable) {
      return value
    }
  }
  return null
}

// 检查参数是否是选项值
function isOptionValue(arg, args, index) {
  if (index === 0) return false
  const prevArg = args[index - 1]
  return prevArg === '-F' || prevArg === '-v' || prevArg === '-f'
}