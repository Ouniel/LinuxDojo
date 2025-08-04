import { formatHelp } from '../utils/helpFormatter.js'

export const expr = {
  name: 'expr',
  description: 'Evaluate expressions|计算表达式',
  
  options: [
    // 算术操作组
    {
      flag: '+',
      description: '加法运算',
      type: 'boolean',
      group: '算术操作'
    },
    {
      flag: '-',
      description: '减法运算',
      type: 'boolean',
      group: '算术操作'
    },
    {
      flag: '*',
      description: '乘法运算（需要转义）',
      type: 'boolean',
      group: '算术操作'
    },
    {
      flag: '/',
      description: '除法运算',
      type: 'boolean',
      group: '算术操作'
    },
    {
      flag: '%',
      description: '取余运算',
      type: 'boolean',
      group: '算术操作'
    },
    
    // 比较操作组
    {
      flag: '=',
      description: '等于比较',
      type: 'boolean',
      group: '比较操作'
    },
    {
      flag: '!=',
      description: '不等于比较',
      type: 'boolean',
      group: '比较操作'
    },
    {
      flag: '<',
      description: '小于比较',
      type: 'boolean',
      group: '比较操作'
    },
    {
      flag: '<=',
      description: '小于等于比较',
      type: 'boolean',
      group: '比较操作'
    },
    {
      flag: '>',
      description: '大于比较',
      type: 'boolean',
      group: '比较操作'
    },
    {
      flag: '>=',
      description: '大于等于比较',
      type: 'boolean',
      group: '比较操作'
    },
    
    // 字符串操作组
    {
      flag: 'length',
      description: '计算字符串长度',
      type: 'boolean',
      group: '字符串操作'
    },
    {
      flag: 'substr',
      description: '提取子字符串',
      type: 'boolean',
      group: '字符串操作'
    },
    {
      flag: 'index',
      description: '查找字符在字符串中的位置',
      type: 'boolean',
      group: '字符串操作'
    },
    {
      flag: ':',
      description: '正则表达式匹配',
      type: 'boolean',
      group: '字符串操作'
    },
    
    // 逻辑操作组
    {
      flag: '|',
      description: '逻辑或操作',
      type: 'boolean',
      group: '逻辑操作'
    },
    {
      flag: '&',
      description: '逻辑与操作',
      type: 'boolean',
      group: '逻辑操作'
    },
    
    // 输入参数
    {
      inputKey: 'expression',
      description: '要计算的表达式',
      type: 'input',
      placeholder: '表达式（如 1 + 2 或 length "hello"）',
      required: true
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
        name: 'expr',
        description: 'Evaluate expressions|计算表达式',
        usage: 'expr EXPRESSION|expr 表达式',
        options: [
          'ARITHMETIC OPERATORS:',
          '+                   Addition|加法',
          '-                   Subtraction|减法',
          '*                   Multiplication (quote in shell)|乘法（在shell中需要引用）',
          '/                   Division|除法',
          '%                   Remainder|取余',
          '',
          'COMPARISON OPERATORS:',
          '=                   Equal|等于',
          '!=                  Not equal|不等于',
          '<                   Less than|小于',
          '<=                  Less than or equal|小于等于',
          '>                   Greater than|大于',
          '>=                  Greater than or equal|大于等于',
          '',
          'STRING OPERATORS:',
          'length STRING       Length of STRING|字符串长度',
          'substr STRING POS LENGTH  Extract substring|提取子字符串',
          'index STRING CHARS  Index of first CHARS in STRING|字符在字符串中的索引',
          'STRING : REGEXP     Match STRING against REGEXP|正则表达式匹配',
          '',
          'LOGICAL OPERATORS:',
          '|                   Logical OR|逻辑或',
          '&                   Logical AND|逻辑与'
        ],
        examples: [
          'expr 1 + 2|计算 1 + 2',
          'expr 10 - 3|计算 10 - 3',
          'expr 4 \\* 5|计算 4 * 5',
          'expr 15 / 3|计算 15 / 3',
          'expr length "hello"|计算字符串长度',
          'expr substr "hello" 2 3|提取子字符串'
        ]
      })
    }
    
    try {
      const result = evaluateExpression(args)
      return result.toString()
    } catch (error) {
      return `expr: ${error.message}`
    }
  }
}

function evaluateExpression(tokens) {
  if (tokens.length === 0) {
    throw new Error('empty expression')
  }
  
  // 处理字符串函数
  if (tokens[0] === 'length' && tokens.length === 2) {
    return tokens[1].length
  }
  
  if (tokens[0] === 'substr' && tokens.length === 4) {
    const str = tokens[1]
    const pos = parseInt(tokens[2]) - 1 // expr uses 1-based indexing
    const len = parseInt(tokens[3])
    
    if (pos < 0 || pos >= str.length) {
      return ''
    }
    
    return str.substr(pos, len)
  }
  
  if (tokens[0] === 'index' && tokens.length === 3) {
    const str = tokens[1]
    const chars = tokens[2]
    
    for (let i = 0; i < str.length; i++) {
      if (chars.includes(str[i])) {
        return i + 1 // expr uses 1-based indexing
      }
    }
    
    return 0
  }
  
  // 处理逻辑或操作符 |
  for (let i = 1; i < tokens.length - 1; i++) {
    if (tokens[i] === '|') {
      const left = evaluateExpression(tokens.slice(0, i))
      if (left && left !== 0 && left !== '') {
        return left
      }
      return evaluateExpression(tokens.slice(i + 1))
    }
  }
  
  // 处理逻辑与操作符 &
  for (let i = 1; i < tokens.length - 1; i++) {
    if (tokens[i] === '&') {
      const left = evaluateExpression(tokens.slice(0, i))
      if (!left || left === 0 || left === '') {
        return 0
      }
      const right = evaluateExpression(tokens.slice(i + 1))
      return (right && right !== 0 && right !== '') ? right : 0
    }
  }
  
  // 处理比较操作符
  const comparisonOps = ['=', '!=', '<', '<=', '>', '>=']
  for (let i = 1; i < tokens.length - 1; i++) {
    if (comparisonOps.includes(tokens[i])) {
      const left = evaluateExpression(tokens.slice(0, i))
      const right = evaluateExpression(tokens.slice(i + 1))
      const op = tokens[i]
      
      return compareValues(left, right, op) ? 1 : 0
    }
  }
  
  // 处理正则匹配操作符 :
  for (let i = 1; i < tokens.length - 1; i++) {
    if (tokens[i] === ':') {
      const str = tokens.slice(0, i).join(' ')
      const pattern = tokens.slice(i + 1).join(' ')
      
      try {
        const regex = new RegExp(pattern)
        const match = str.match(regex)
        return match ? match[0].length : 0
      } catch {
        throw new Error('invalid regular expression')
      }
    }
  }
  
  // 处理算术操作符（按优先级）
  // 先处理 + 和 -
  for (let i = tokens.length - 2; i >= 1; i--) {
    if (tokens[i] === '+' || tokens[i] === '-') {
      const left = evaluateExpression(tokens.slice(0, i))
      const right = evaluateExpression(tokens.slice(i + 1))
      const op = tokens[i]
      
      const leftNum = parseNumber(left)
      const rightNum = parseNumber(right)
      
      if (op === '+') {
        return leftNum + rightNum
      } else {
        return leftNum - rightNum
      }
    }
  }
  
  // 再处理 *, /, %
  for (let i = tokens.length - 2; i >= 1; i--) {
    if (tokens[i] === '*' || tokens[i] === '/' || tokens[i] === '%') {
      const left = evaluateExpression(tokens.slice(0, i))
      const right = evaluateExpression(tokens.slice(i + 1))
      const op = tokens[i]
      
      const leftNum = parseNumber(left)
      const rightNum = parseNumber(right)
      
      if (rightNum === 0 && (op === '/' || op === '%')) {
        throw new Error('division by zero')
      }
      
      if (op === '*') {
        return leftNum * rightNum
      } else if (op === '/') {
        return Math.floor(leftNum / rightNum)
      } else {
        return leftNum % rightNum
      }
    }
  }
  
  // 如果只有一个token，返回它
  if (tokens.length === 1) {
    const token = tokens[0]
    
    // 尝试解析为数字
    const num = parseFloat(token)
    if (!isNaN(num)) {
      return num
    }
    
    // 否则返回字符串
    return token
  }
  
  throw new Error('invalid expression')
}

// 解析数字
function parseNumber(value) {
  if (typeof value === 'number') {
    return value
  }
  
  const num = parseFloat(value)
  if (isNaN(num)) {
    throw new Error(`non-numeric argument: ${value}`)
  }
  
  return num
}

// 比较值
function compareValues(left, right, op) {
  // 尝试数值比较
  const leftNum = parseFloat(left)
  const rightNum = parseFloat(right)
  
  if (!isNaN(leftNum) && !isNaN(rightNum)) {
    switch (op) {
      case '=': return leftNum === rightNum
      case '!=': return leftNum !== rightNum
      case '<': return leftNum < rightNum
      case '<=': return leftNum <= rightNum
      case '>': return leftNum > rightNum
      case '>=': return leftNum >= rightNum
    }
  }
  
  // 字符串比较
  const leftStr = String(left)
  const rightStr = String(right)
  
  switch (op) {
    case '=': return leftStr === rightStr
    case '!=': return leftStr !== rightStr
    case '<': return leftStr < rightStr
    case '<=': return leftStr <= rightStr
    case '>': return leftStr > rightStr
    case '>=': return leftStr >= rightStr
  }
  
  return false
}