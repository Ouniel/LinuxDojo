import { formatHelp } from '../utils/helpFormatter.js'

export const test = {
  name: 'test',
  description: 'Evaluate conditional expressions|评估条件表达式',
  
  options: [
    // 文件测试组
    {
      flag: '-f',
      description: '测试文件是否存在且为普通文件',
      type: 'input',
      inputKey: 'file_path',
      placeholder: '文件路径',
      group: '文件测试'
    },
    {
      flag: '-d',
      description: '测试目录是否存在',
      type: 'input',
      inputKey: 'directory_path',
      placeholder: '目录路径',
      group: '文件测试'
    },
    {
      flag: '-e',
      description: '测试文件或目录是否存在',
      type: 'input',
      inputKey: 'path',
      placeholder: '文件或目录路径',
      group: '文件测试'
    },
    {
      flag: '-r',
      description: '测试文件是否可读',
      type: 'input',
      inputKey: 'readable_file',
      placeholder: '文件路径',
      group: '文件测试'
    },
    {
      flag: '-w',
      description: '测试文件是否可写',
      type: 'input',
      inputKey: 'writable_file',
      placeholder: '文件路径',
      group: '文件测试'
    },
    {
      flag: '-x',
      description: '测试文件是否可执行',
      type: 'input',
      inputKey: 'executable_file',
      placeholder: '文件路径',
      group: '文件测试'
    },
    {
      flag: '-s',
      description: '测试文件是否存在且大小大于0',
      type: 'input',
      inputKey: 'non_empty_file',
      placeholder: '文件路径',
      group: '文件测试'
    },
    
    // 字符串测试组
    {
      flag: '-z',
      description: '测试字符串长度是否为0',
      type: 'input',
      inputKey: 'zero_length_string',
      placeholder: '字符串',
      group: '字符串测试'
    },
    {
      flag: '-n',
      description: '测试字符串长度是否不为0',
      type: 'input',
      inputKey: 'non_zero_string',
      placeholder: '字符串',
      group: '字符串测试'
    },
    
    // 数值比较组
    {
      inputKey: 'comparison_expression',
      description: '数值比较表达式',
      type: 'input',
      placeholder: '比较表达式（如 5 -eq 5, 10 -gt 3）',
      group: '数值比较'
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
        name: 'test',
        description: 'Evaluate conditional expressions|评估条件表达式',
        usage: 'test EXPRESSION|test 表达式',
        options: [
          'FILE TESTS:',
          '-f FILE             True if file exists and is regular file|如果文件存在且为普通文件则为真',
          '-d FILE             True if file exists and is directory|如果文件存在且为目录则为真',
          '-e FILE             True if file exists|如果文件存在则为真',
          '-r FILE             True if file is readable|如果文件可读则为真',
          '-w FILE             True if file is writable|如果文件可写则为真',
          '-x FILE             True if file is executable|如果文件可执行则为真',
          '-s FILE             True if file exists and is not empty|如果文件存在且不为空则为真',
          '',
          'STRING TESTS:',
          '-z STRING           True if string is empty|如果字符串为空则为真',
          '-n STRING           True if string is not empty|如果字符串不为空则为真',
          'STRING1 = STRING2   True if strings are equal|如果字符串相等则为真',
          'STRING1 != STRING2  True if strings are not equal|如果字符串不相等则为真',
          '',
          'INTEGER TESTS:',
          'INT1 -eq INT2       True if integers are equal|如果整数相等则为真',
          'INT1 -ne INT2       True if integers are not equal|如果整数不相等则为真',
          'INT1 -lt INT2       True if INT1 is less than INT2|如果INT1小于INT2则为真',
          'INT1 -le INT2       True if INT1 is less than or equal to INT2|如果INT1小于等于INT2则为真',
          'INT1 -gt INT2       True if INT1 is greater than INT2|如果INT1大于INT2则为真',
          'INT1 -ge INT2       True if INT1 is greater than or equal to INT2|如果INT1大于等于INT2则为真'
        ],
        examples: [
          'test -f /etc/passwd|测试文件是否存在',
          'test -d /home|测试目录是否存在',
          'test -z "$var"|测试变量是否为空',
          'test 5 -eq 5|测试数值是否相等',
          'test "hello" = "hello"|测试字符串是否相等'
        ]
      })
    }
    
    // 解析表达式
    const expression = args.join(' ')
    
    try {
      const result = evaluateExpression(args, fileSystem, currentPath)
      return result ? '' : 'test: expression evaluated to false'
    } catch (error) {
      return `test: ${error.message}`
    }
  }
}

function evaluateExpression(args, fileSystem, currentPath) {
  if (args.length === 1) {
    // 单个参数：测试字符串是否非空
    return args[0] !== ''
  }
  
  if (args.length === 2) {
    const [operator, operand] = args
    
    switch (operator) {
      case '-z':
        return operand === ''
      case '-n':
        return operand !== ''
      case '-f':
        return isRegularFile(operand, fileSystem)
      case '-d':
        return isDirectory(operand, fileSystem)
      case '-e':
        return exists(operand, fileSystem)
      case '-r':
        return isReadable(operand, fileSystem)
      case '-w':
        return isWritable(operand, fileSystem)
      case '-x':
        return isExecutable(operand, fileSystem)
      case '-s':
        return isNonEmpty(operand, fileSystem)
      default:
        throw new Error(`unknown unary operator: ${operator}`)
    }
  }
  
  if (args.length === 3) {
    const [left, operator, right] = args
    
    switch (operator) {
      case '=':
        return left === right
      case '!=':
        return left !== right
      case '-eq':
        return parseInt(left) === parseInt(right)
      case '-ne':
        return parseInt(left) !== parseInt(right)
      case '-lt':
        return parseInt(left) < parseInt(right)
      case '-le':
        return parseInt(left) <= parseInt(right)
      case '-gt':
        return parseInt(left) > parseInt(right)
      case '-ge':
        return parseInt(left) >= parseInt(right)
      default:
        throw new Error(`unknown binary operator: ${operator}`)
    }
  }
  
  throw new Error('invalid expression')
}

function isRegularFile(path, fileSystem) {
  // 模拟文件系统检查
  const commonFiles = [
    '/etc/passwd', '/etc/hosts', '/etc/fstab', '/etc/group',
    '/bin/bash', '/bin/sh', '/usr/bin/vim', '/usr/bin/nano',
    'file.txt', 'document.pdf', 'script.sh', 'config.json'
  ]
  return commonFiles.includes(path) || path.match(/\.(txt|pdf|sh|json|js|py|c|cpp|h)$/)
}

function isDirectory(path, fileSystem) {
  // 模拟目录检查
  const commonDirs = [
    '/', '/home', '/usr', '/etc', '/var', '/tmp', '/bin', '/sbin',
    '/usr/bin', '/usr/sbin', '/home/user', '/var/log', '/opt'
  ]
  return commonDirs.includes(path) || path.endsWith('/')
}

function exists(path, fileSystem) {
  return isRegularFile(path, fileSystem) || isDirectory(path, fileSystem)
}

function isReadable(path, fileSystem) {
  // 大多数文件都是可读的
  return exists(path, fileSystem)
}

function isWritable(path, fileSystem) {
  // 模拟写权限检查
  const readOnlyPaths = ['/etc/passwd', '/bin/bash', '/usr/bin/vim']
  return exists(path, fileSystem) && !readOnlyPaths.includes(path)
}

function isExecutable(path, fileSystem) {
  // 模拟执行权限检查
  const executablePaths = [
    '/bin/bash', '/bin/sh', '/usr/bin/vim', '/usr/bin/nano',
    'script.sh'
  ]
  return executablePaths.includes(path) || path.endsWith('.sh')
}

function isNonEmpty(path, fileSystem) {
  // 模拟文件大小检查
  const emptyFiles = ['empty.txt', '/dev/null']
  return exists(path, fileSystem) && !emptyFiles.includes(path)
}