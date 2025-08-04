import { formatHelp } from '../utils/helpFormatter.js'

export const paste = {
  name: 'paste',
  description: 'Merge lines of files|合并文件的行',
  
  options: [
    // 分隔符选项组
    {
      flag: '-d',
      longFlag: '--delimiters',
      description: '指定分隔符字符',
      type: 'input',
      inputKey: 'delimiter',
      placeholder: '分隔符（默认为制表符，如 "," 或 "|"）',
      default: '\t',
      group: '分隔符选项'
    },
    
    // 模式选项组
    {
      flag: '-s',
      longFlag: '--serial',
      description: '串行模式（将每个文件的所有行合并为一行）',
      type: 'boolean',
      group: '模式选项'
    },
    
    // 输入参数
    {
      inputKey: 'input_files',
      description: '要合并的文件',
      type: 'input',
      placeholder: '文件路径（支持多个文件，用空格分隔）',
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
        name: 'paste',
        description: 'Merge lines of files|合并文件的行',
        usage: 'paste [OPTIONS] [FILE...]|paste [选项] [文件...]',
        options: [
          '-d, --delimiters=LIST Use characters from LIST as delimiters|使用LIST中的字符作为分隔符',
          '-s, --serial          Paste one file at a time|一次粘贴一个文件'
        ],
        examples: [
          'paste file1.txt file2.txt|合并两个文件的行',
          'paste -d "," file1.txt file2.txt|使用逗号作为分隔符',
          'paste -s file.txt|将文件的所有行合并为一行',
          'paste -d "|" data1.txt data2.txt|使用竖线作为分隔符',
          'paste -s -d ":" list.txt|用冒号连接所有行'
        ],
        notes: [
          'Default delimiter is TAB|默认分隔符是制表符',
          'Use "-" to read from stdin|使用"-"从标准输入读取',
          'In serial mode, all lines from each file are joined into one line|串行模式下，每个文件的所有行合并为一行'
        ]
      })
    }
    
    const options = {
      delimiter: '\t',
      serial: false
    }
    
    const files = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-d' || arg === '--delimiters') {
        if (i + 1 < args.length) {
          options.delimiter = args[++i]
        }
      } else if (arg.startsWith('-d')) {
        options.delimiter = arg.substring(2)
      } else if (arg.startsWith('--delimiters=')) {
        options.delimiter = arg.substring('--delimiters='.length)
      } else if (arg === '-s' || arg === '--serial') {
        options.serial = true
      } else if (arg.startsWith('-')) {
        return `paste: invalid option: ${arg}`
      } else {
        files.push(arg)
      }
    }
    
    if (files.length === 0) {
      return 'paste: missing file operand\nUsage: paste [OPTIONS] [FILE...]'
    }
    
    // 模拟文件内容
    const fileContents = []
    
    for (const filename of files) {
      if (filename === '-') {
        return 'paste: reading from stdin not supported in this environment'
      }
      
      const content = getMockFileContent(filename)
      
      if (!content) {
        return `paste: ${filename}: No such file or directory`
      }
      
      const lines = content.split('\n').filter(line => line.trim() !== '')
      fileContents.push(lines)
    }
    
    const results = []
    
    if (options.serial) {
      // 串行模式：每个文件的所有行合并为一行
      for (let i = 0; i < fileContents.length; i++) {
        const lines = fileContents[i]
        if (lines.length > 0) {
          results.push(lines.join(options.delimiter))
        }
      }
    } else {
      // 并行模式：对应行合并
      const maxLines = Math.max(...fileContents.map(lines => lines.length))
      
      for (let i = 0; i < maxLines; i++) {
        const rowData = []
        
        for (const lines of fileContents) {
          rowData.push(i < lines.length ? lines[i] : '')
        }
        
        results.push(rowData.join(options.delimiter))
      }
    }
    
    return results.join('\n')
  }
}

function getMockFileContent(filename) {
  // 模拟文件内容
  const mockFiles = {
    'file1.txt': `apple
banana
cherry
date`,
    
    'file2.txt': `red
yellow
red
brown`,
    
    'data1.txt': `Name
Alice
Bob
Charlie`,
    
    'data2.txt': `Age
25
30
35`,
    
    'list.txt': `item1
item2
item3
item4`,
    
    'numbers.txt': `1
2
3
4
5`,
    
    'letters.txt': `a
b
c
d
e`
  }
  
  return mockFiles[filename] || mockFiles['file1.txt']
}