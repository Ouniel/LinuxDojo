export const read = {
  name: 'read',
  description: 'Read a line from standard input and assign to variables|从标准输入读取一行并赋值给变量',
  
  options: [
    {
      name: '提示选项',
      type: 'group',
      options: [
        {
          name: '-p',
          type: 'input',
          description: '读取前显示提示符',
          placeholder: '提示文本（如 "Enter name: "）',
          flag: '-p'
        }
      ]
    },
    {
      name: '时间选项',
      type: 'group',
      options: [
        {
          name: '-t',
          type: 'input',
          description: '设置读取超时时间（秒）',
          placeholder: '超时秒数（如 10）',
          flag: '-t'
        }
      ]
    },
    {
      name: '分隔符选项',
      type: 'group',
      options: [
        {
          name: '-d',
          type: 'input',
          description: '使用指定字符作为行分隔符',
          placeholder: '分隔符（默认为换行符）',
          flag: '-d'
        },
        {
          name: '-n',
          type: 'input',
          description: '读取指定数量的字符',
          placeholder: '字符数（如 5）',
          flag: '-n'
        }
      ]
    },
    {
      name: '模式选项',
      type: 'group',
      options: [
        {
          name: '-s',
          type: 'checkbox',
          description: '静默模式（不回显输入）',
          flag: '-s'
        },
        {
          name: '-a',
          type: 'checkbox',
          description: '读取到数组变量',
          flag: '-a'
        },
        {
          name: '-r',
          type: 'checkbox',
          description: '原始模式（不解释反斜杠转义）',
          flag: '-r'
        },
        {
          name: '-e',
          type: 'checkbox',
          description: '使用readline进行输入编辑',
          flag: '-e'
        },
        {
          name: '-i',
          type: 'input',
          description: '使用指定文本作为readline的初始文本',
          placeholder: '初始文本',
          flag: '-i'
        },
        {
          name: '-u',
          type: 'input',
          description: '从指定文件描述符读取',
          placeholder: '文件描述符（如 3）',
          flag: '-u'
        }
      ]
    },
    {
      name: '变量名',
      type: 'input',
      description: '要赋值的变量名（默认为REPLY）',
      placeholder: '变量名（如 name, first last）',
      position: 'end'
    }
  ],

  handler: (args, context, fs) => {
    if (args.includes('--help')) {
      return read.help
    }

    // 解析选项
    let prompt = ''
    let timeout = null
    let delimiter = '\n'
    let numChars = null
    let silent = false
    let arrayMode = false
    let rawMode = false
    let readline = false
    let initialText = ''
    let fileDescriptor = 0
    let variableNames = []
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-p') {
        if (i + 1 < args.length) {
          prompt = args[++i]
        }
      } else if (arg === '-t') {
        if (i + 1 < args.length) {
          timeout = parseInt(args[++i])
          if (isNaN(timeout) || timeout < 0) {
            return 'read: invalid timeout value'
          }
        }
      } else if (arg === '-d') {
        if (i + 1 < args.length) {
          delimiter = args[++i]
        }
      } else if (arg === '-n') {
        if (i + 1 < args.length) {
          numChars = parseInt(args[++i])
          if (isNaN(numChars) || numChars <= 0) {
            return 'read: invalid character count'
          }
        }
      } else if (arg === '-s') {
        silent = true
      } else if (arg === '-a') {
        arrayMode = true
      } else if (arg === '-r') {
        rawMode = true
      } else if (arg === '-e') {
        readline = true
      } else if (arg === '-i') {
        if (i + 1 < args.length) {
          initialText = args[++i]
        }
      } else if (arg === '-u') {
        if (i + 1 < args.length) {
          fileDescriptor = parseInt(args[++i])
          if (isNaN(fileDescriptor) || fileDescriptor < 0) {
            return 'read: invalid file descriptor'
          }
        }
      } else if (arg.startsWith('-')) {
        return `read: invalid option: ${arg}`
      } else {
        variableNames.push(arg)
      }
    }
    
    // 默认变量名
    if (variableNames.length === 0) {
      variableNames = ['REPLY']
    }
    
    let output = []
    
    // 显示提示符
    if (prompt) {
      output.push(`${prompt}`)
    }
    
    // 模拟读取过程
    const simulatedInput = getSimulatedInput(prompt, timeout, silent, numChars, delimiter)
    
    if (timeout) {
      output.push(`[Reading with ${timeout}s timeout...]`)
    }
    
    if (silent) {
      output.push('[Silent mode - input would not be echoed]')
    }
    
    if (readline) {
      output.push('[Using readline for input editing]')
      if (initialText) {
        output.push(`[Initial text: "${initialText}"]`)
      }
    }
    
    if (fileDescriptor !== 0) {
      output.push(`[Reading from file descriptor ${fileDescriptor}]`)
    }
    
    output.push(`Simulated input: ${simulatedInput}`)
    
    // 处理输入并赋值给变量
    if (arrayMode && variableNames.length === 1) {
      // 数组模式
      const values = simulatedInput.split(/\s+/).filter(v => v !== '')
      output.push(`Array ${variableNames[0]}=(${values.join(' ')})`)
    } else {
      // 普通模式 - 分割输入
      let inputValues
      
      if (numChars) {
        // 按字符数读取
        inputValues = [simulatedInput.substring(0, numChars)]
      } else if (delimiter !== '\n') {
        // 按指定分隔符分割
        inputValues = simulatedInput.split(delimiter)
      } else {
        // 按空白字符分割
        inputValues = simulatedInput.trim().split(/\s+/)
      }
      
      // 赋值给变量
      for (let i = 0; i < variableNames.length; i++) {
        let value = ''
        
        if (i < inputValues.length) {
          if (i === variableNames.length - 1) {
            // 最后一个变量获得所有剩余值
            value = inputValues.slice(i).join(' ')
          } else {
            value = inputValues[i]
          }
        }
        
        // 处理反斜杠转义（除非是原始模式）
        if (!rawMode) {
          value = processEscapes(value)
        }
        
        output.push(`${variableNames[i]}="${value}"`)
      }
    }
    
    return output.join('\n')
  },

  category: 'basic',
  requiresArgs: false,
  examples: [
    'read name',
    'read -p "Enter your name: " name',
    'read first last',
    'read -t 10 input',
    'read -s password',
    'read -a array',
    'read -n 5 chars',
    'read -d ":" field'
  ],
  help: `Usage: read [OPTION]... [NAME]...

Read a line from standard input and assign to variables.

Options:
  -p PROMPT          Display PROMPT before reading
  -t TIMEOUT         Timeout in seconds
  -d DELIM           Use DELIM as line delimiter instead of newline
  -n NCHARS          Read at most NCHARS characters
  -s                 Silent mode (don't echo input)
  -a ARRAY           Read into array variable ARRAY
  -r                 Raw mode (don't interpret backslash escapes)
  -e                 Use readline for input editing
  -i TEXT            Use TEXT as initial text for readline
  -u FD              Read from file descriptor FD

Examples:
  read name                    Read input to variable name
  read -p "Enter name: " name  Read with prompt
  read first last              Read two words to different variables
  read -t 10 input             Read with 10 second timeout
  read -s password             Silent read for password
  read -a array                Read into array
  read -n 5 chars              Read 5 characters
  read -d ":" field            Use colon as delimiter`
}

function getSimulatedInput(prompt, timeout, silent, numChars, delimiter) {
  // 模拟用户输入
  const sampleInputs = [
    'hello world',
    'John Doe 25 Engineer',
    'apple banana cherry',
    'user@example.com',
    'password123',
    'first second third fourth',
    'test input data',
    'sample text for read command'
  ]
  
  let input = sampleInputs[Math.floor(Math.random() * sampleInputs.length)]
  
  // 如果指定了字符数限制
  if (numChars) {
    input = input.substring(0, numChars)
  }
  
  // 如果指定了分隔符，可能需要调整输入格式
  if (delimiter && delimiter !== '\n' && delimiter !== ' ') {
    input = input.replace(/\s+/g, delimiter)
  }
  
  return input
}

function processEscapes(text) {
  // 处理常见的反斜杠转义序列
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\v/g, '\v')
    .replace(/\\a/g, '\a')
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
}