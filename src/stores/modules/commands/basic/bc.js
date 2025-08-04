import { formatHelp } from '../utils/helpFormatter.js'

export const bc = {
  name: 'bc',
  description: 'An arbitrary precision calculator language|任意精度计算器语言',
  
  options: [
    // 基本选项组
    {
      flag: '-l',
      longFlag: '--mathlib',
      description: '加载数学库（定义标准数学函数）',
      type: 'boolean',
      group: '基本选项'
    },
    {
      flag: '-i',
      longFlag: '--interactive',
      description: '强制交互模式',
      type: 'boolean',
      group: '基本选项'
    },
    {
      flag: '-q',
      longFlag: '--quiet',
      description: '不显示GNU bc的欢迎信息',
      type: 'boolean',
      group: '基本选项'
    },
    {
      flag: '-s',
      longFlag: '--standard',
      description: '使用标准数学库',
      type: 'boolean',
      group: '基本选项'
    },
    {
      flag: '-w',
      longFlag: '--warn',
      description: '显示POSIX bc的警告',
      type: 'boolean',
      group: '基本选项'
    },
    
    // 输入选项组
    {
      inputKey: 'expression',
      description: '要计算的数学表达式',
      type: 'input',
      placeholder: '数学表达式（如 2+3*4 或 scale=2; 22/7）',
      group: '输入选项'
    },
    {
      inputKey: 'file',
      description: '包含bc脚本的文件',
      type: 'input',
      placeholder: '文件路径',
      group: '输入选项'
    },
    
    // 精度选项组
    {
      inputKey: 'scale',
      description: '设置小数点后位数',
      type: 'input',
      placeholder: '小数位数（如 2）',
      group: '精度选项'
    }
  ],
  
  handler(args, context, fs) {
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
    if (args.length === 0) {
      return formatHelp({
        name: 'bc',
        description: 'An arbitrary precision calculator language|任意精度计算器语言',
        usage: 'bc [OPTION]... [FILE]...|bc [选项]... [文件]...',
        options: [
          '-l, --mathlib       Load the standard math library|加载标准数学库',
          '-i, --interactive   Force interactive mode|强制交互模式',
          '-q, --quiet         Do not print the normal GNU bc welcome|不显示GNU bc欢迎信息',
          '-s, --standard      Use the standard math library|使用标准数学库',
          '-w, --warn          Give warnings for extensions to POSIX bc|显示POSIX bc扩展的警告',
          '',
          'BUILT-IN VARIABLES:',
          'scale               Number of digits after decimal point|小数点后位数',
          'ibase               Input number base (2-16)|输入数字进制',
          'obase               Output number base (2-999)|输出数字进制',
          '',
          'BUILT-IN FUNCTIONS (with -l):',
          's(x)                Sine of x (x in radians)|正弦函数',
          'c(x)                Cosine of x (x in radians)|余弦函数',
          'a(x)                Arctangent of x|反正切函数',
          'l(x)                Natural logarithm of x|自然对数',
          'e(x)                Exponential function|指数函数',
          'j(n,x)              Bessel function|贝塞尔函数'
        ],
        examples: [
          'bc -l|启动bc并加载数学库',
          'echo "2+3*4" | bc|计算表达式',
          'echo "scale=2; 22/7" | bc|设置精度并计算',
          'echo "sqrt(2)" | bc -l|计算平方根',
          'echo "obase=16; 255" | bc|转换为16进制'
        ]
      })
    }
    
    // 解析选项
    let mathLib = false
    let interactive = false
    let quiet = false
    let standard = false
    let warn = false
    let expressions = []
    let files = []
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-l' || arg === '--mathlib') {
        mathLib = true
      } else if (arg === '-i' || arg === '--interactive') {
        interactive = true
      } else if (arg === '-q' || arg === '--quiet') {
        quiet = true
      } else if (arg === '-s' || arg === '--standard') {
        standard = true
      } else if (arg === '-w' || arg === '--warn') {
        warn = true
      } else if (!arg.startsWith('-')) {
        // 检查是否是文件或表达式
        if (arg.includes('=') || arg.includes('+') || arg.includes('-') || 
            arg.includes('*') || arg.includes('/') || arg.includes('(')) {
          expressions.push(arg)
        } else {
          files.push(arg)
        }
      }
    }
    
    let output = []
    
    if (!quiet) {
      output.push('bc 1.07.1')
      output.push('Copyright 1991-1994, 1997, 1998, 2000, 2004, 2006, 2008, 2012-2017 Free Software Foundation, Inc.')
      output.push('This is free software with ABSOLUTELY NO WARRANTY.')
      output.push('For details type `warranty\'.')
    }
    
    // 处理表达式
    if (expressions.length > 0) {
      for (const expr of expressions) {
        try {
          const result = evaluateExpression(expr, mathLib)
          output.push(result)
        } catch (error) {
          output.push(`bc: ${error.message}`)
        }
      }
    }
    
    // 处理文件
    if (files.length > 0) {
      for (const file of files) {
        output.push(`bc: processing file ${file}`)
        output.push('(file content would be processed here)')
      }
    }
    
    if (interactive || (expressions.length === 0 && files.length === 0)) {
      output.push('')
      output.push('Interactive mode - enter expressions:')
      output.push('Examples:')
      output.push('  2+3*4')
      output.push('  scale=2; 22/7')
      if (mathLib) {
        output.push('  sqrt(2)')
        output.push('  s(3.14159/2)')
      }
      output.push('  quit')
    }
    
    return output.join('\n')
  }
}

function evaluateExpression(expr, mathLib) {
  // 简化的bc表达式计算器
  try {
    // 处理scale设置
    if (expr.includes('scale=')) {
      const scaleMatch = expr.match(/scale\s*=\s*(\d+)/)
      if (scaleMatch) {
        const scale = parseInt(scaleMatch[1])
        const remaining = expr.replace(/scale\s*=\s*\d+\s*;?\s*/, '')
        if (remaining) {
          const result = calculateExpression(remaining, mathLib)
          return result.toFixed(scale)
        }
        return `scale set to ${scale}`
      }
    }
    
    // 处理进制转换
    if (expr.includes('obase=')) {
      const obaseMatch = expr.match(/obase\s*=\s*(\d+)/)
      if (obaseMatch) {
        const base = parseInt(obaseMatch[1])
        const remaining = expr.replace(/obase\s*=\s*\d+\s*;?\s*/, '')
        if (remaining) {
          const result = calculateExpression(remaining, mathLib)
          return parseInt(result).toString(base).toUpperCase()
        }
        return `output base set to ${base}`
      }
    }
    
    // 普通表达式计算
    const result = calculateExpression(expr, mathLib)
    return result.toString()
    
  } catch (error) {
    throw new Error(`syntax error: ${expr}`)
  }
}

function calculateExpression(expr, mathLib) {
  // 移除空格
  expr = expr.replace(/\s+/g, '')
  
  // 处理数学函数（如果加载了数学库）
  if (mathLib) {
    // sqrt函数
    expr = expr.replace(/sqrt\(([^)]+)\)/g, (match, arg) => {
      const value = calculateExpression(arg, mathLib)
      return Math.sqrt(value)
    })
    
    // 三角函数
    expr = expr.replace(/s\(([^)]+)\)/g, (match, arg) => {
      const value = calculateExpression(arg, mathLib)
      return Math.sin(value)
    })
    
    expr = expr.replace(/c\(([^)]+)\)/g, (match, arg) => {
      const value = calculateExpression(arg, mathLib)
      return Math.cos(value)
    })
    
    expr = expr.replace(/a\(([^)]+)\)/g, (match, arg) => {
      const value = calculateExpression(arg, mathLib)
      return Math.atan(value)
    })
    
    // 对数和指数函数
    expr = expr.replace(/l\(([^)]+)\)/g, (match, arg) => {
      const value = calculateExpression(arg, mathLib)
      return Math.log(value)
    })
    
    expr = expr.replace(/e\(([^)]+)\)/g, (match, arg) => {
      const value = calculateExpression(arg, mathLib)
      return Math.exp(value)
    })
  }
  
  // 简单的表达式求值
  try {
    // 安全的数学表达式求值
    const sanitized = expr.replace(/[^0-9+\-*/.()]/g, '')
    return Function('"use strict"; return (' + sanitized + ')')()
  } catch {
    throw new Error('invalid expression')
  }
}