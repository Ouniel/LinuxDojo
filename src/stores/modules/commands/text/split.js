import { formatHelp } from '../utils/helpFormatter.js'

export const split = {
  name: 'split',
  description: 'Split a file into pieces|将文件分割成片段',
  
  options: [
    // 分割方式组
    {
      flag: '-l',
      longFlag: '--lines',
      description: '按行数分割（每个文件包含指定行数）',
      type: 'input',
      inputKey: 'lines_count',
      placeholder: '行数（默认1000）',
      default: '1000',
      group: '分割方式'
    },
    {
      flag: '-b',
      longFlag: '--bytes',
      description: '按字节数分割',
      type: 'input',
      inputKey: 'bytes_size',
      placeholder: '字节数（如 1K, 2M, 3G）',
      group: '分割方式'
    },
    {
      flag: '-C',
      longFlag: '--line-bytes',
      description: '按行字节数分割（保持行完整）',
      type: 'input',
      inputKey: 'line_bytes_size',
      placeholder: '字节数（如 1K, 2M, 3G）',
      group: '分割方式'
    },
    
    // 命名选项组
    {
      flag: '-d',
      longFlag: '--numeric-suffixes',
      description: '使用数字后缀而非字母后缀',
      type: 'boolean',
      group: '命名选项'
    },
    {
      flag: '-a',
      longFlag: '--suffix-length',
      description: '指定后缀长度',
      type: 'input',
      inputKey: 'suffix_length',
      placeholder: '后缀长度（默认2）',
      default: '2',
      group: '命名选项'
    },
    
    // 输出选项组
    {
      flag: '--verbose',
      description: '显示详细信息（为每个输出文件打印消息）',
      type: 'boolean',
      group: '输出选项'
    },
    
    // 输入参数
    {
      inputKey: 'input_file',
      description: '要分割的输入文件',
      type: 'input',
      placeholder: '输入文件路径',
      required: true
    },
    {
      inputKey: 'output_prefix',
      description: '输出文件前缀',
      type: 'input',
      placeholder: '输出前缀（默认为 "x"）',
      default: 'x',
      required: false
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
        name: 'split',
        description: 'Split a file into pieces|将文件分割成片段',
        usage: 'split [OPTIONS] [INPUT [PREFIX]]|split [选项] [输入文件] [前缀]',
        options: [
          '-l, --lines=NUMBER       Put NUMBER lines per output file|每个输出文件包含NUMBER行',
          '-b, --bytes=SIZE         Put SIZE bytes per output file|每个输出文件包含SIZE字节',
          '-C, --line-bytes=SIZE    Put at most SIZE bytes of lines per output file|每个输出文件最多包含SIZE字节的行',
          '-d, --numeric-suffixes   Use numeric suffixes instead of alphabetic|使用数字后缀而非字母后缀',
          '-a, --suffix-length=N    Use suffixes of length N (default 2)|使用长度为N的后缀（默认2）',
          '--verbose                Print a diagnostic message for each output file|为每个输出文件打印诊断信息'
        ],
        examples: [
          'split -l 100 file.txt|每100行分割一次',
          'split -b 1M large.txt part_|按1MB分割文件',
          'split -d -a 3 file.txt|使用3位数字后缀',
          'split -C 1K data.txt chunk_|按1KB行字节数分割',
          'split --verbose -l 50 log.txt section_|详细模式分割日志文件'
        ],
        notes: [
          'SIZE may be followed by:|SIZE可以跟随：',
          'K (1024), M (1024*1024), G (1024*1024*1024)|K（1024），M（1024*1024），G（1024*1024*1024）',
          'Default output files: xaa, xab, xac, ...|默认输出文件：xaa, xab, xac, ...',
          'With -d option: x00, x01, x02, ...|使用-d选项：x00, x01, x02, ...'
        ]
      })
    }
    
    const options = {
      lines: 1000,        // 默认每1000行分割一次
      bytes: null,        // 按字节分割
      lineBytes: null,    // 按行字节数分割
      numeric: false,     // 使用数字后缀
      suffixLength: 2,    // 后缀长度
      verbose: false      // 详细输出
    }
    
    let inputFile = ''
    let outputPrefix = 'x'  // 默认输出前缀
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-l' || arg === '--lines') {
        if (i + 1 < args.length) {
          options.lines = parseInt(args[++i]) || 1000
          options.bytes = null
          options.lineBytes = null
        }
      } else if (arg.startsWith('-l')) {
        options.lines = parseInt(arg.substring(2)) || 1000
        options.bytes = null
        options.lineBytes = null
      } else if (arg === '-b' || arg === '--bytes') {
        if (i + 1 < args.length) {
          const sizeStr = args[++i]
          options.bytes = parseSizeString(sizeStr)
          options.lines = null
          options.lineBytes = null
        }
      } else if (arg.startsWith('-b')) {
        options.bytes = parseSizeString(arg.substring(2))
        options.lines = null
        options.lineBytes = null
      } else if (arg === '-C' || arg === '--line-bytes') {
        if (i + 1 < args.length) {
          const sizeStr = args[++i]
          options.lineBytes = parseSizeString(sizeStr)
          options.lines = null
          options.bytes = null
        }
      } else if (arg.startsWith('-C')) {
        options.lineBytes = parseSizeString(arg.substring(2))
        options.lines = null
        options.bytes = null
      } else if (arg === '-d' || arg === '--numeric-suffixes') {
        options.numeric = true
      } else if (arg === '-a' || arg === '--suffix-length') {
        if (i + 1 < args.length) {
          options.suffixLength = parseInt(args[++i]) || 2
        }
      } else if (arg.startsWith('-a')) {
        options.suffixLength = parseInt(arg.substring(2)) || 2
      } else if (arg === '--verbose') {
        options.verbose = true
      } else if (arg.startsWith('-')) {
        return `split: invalid option: ${arg}`
      } else {
        if (!inputFile) {
          inputFile = arg
        } else if (outputPrefix === 'x') {
          outputPrefix = arg
        }
      }
    }
    
    // 解析大小字符串（如 1K, 2M, 3G）
    function parseSizeString(sizeStr) {
      if (!sizeStr) return null
      
      const match = sizeStr.match(/^(\d+)([KMG]?)$/i)
      if (!match) return parseInt(sizeStr) || null
      
      const num = parseInt(match[1])
      const unit = match[2].toUpperCase()
      
      switch (unit) {
        case 'K': return num * 1024
        case 'M': return num * 1024 * 1024
        case 'G': return num * 1024 * 1024 * 1024
        default: return num
      }
    }
    
    // 生成后缀
    function generateSuffix(index, length, numeric) {
      if (numeric) {
        return index.toString().padStart(length, '0')
      } else {
        let suffix = ''
        let num = index
        for (let i = 0; i < length; i++) {
          suffix = String.fromCharCode(97 + (num % 26)) + suffix
          num = Math.floor(num / 26)
        }
        return suffix
      }
    }
    
    if (!inputFile) {
      return 'split: missing file operand\nUsage: split [OPTIONS] [INPUT [PREFIX]]'
    }
    
    // 模拟文件内容
    const content = getMockFileContent(inputFile)
    
    if (!content) {
      return `split: cannot open '${inputFile}' for reading: No such file or directory`
    }
    
    const results = []
    let fileIndex = 0
    
    if (options.lines) {
      // 按行分割
      const lines = content.split('\n').filter(line => line.trim() !== '')
      const totalFiles = Math.ceil(lines.length / options.lines)
      
      for (let i = 0; i < lines.length; i += options.lines) {
        const suffix = generateSuffix(fileIndex, options.suffixLength, options.numeric)
        const filename = outputPrefix + suffix
        
        if (options.verbose) {
          const chunkLines = Math.min(options.lines, lines.length - i)
          results.push(`creating '${filename}' (${chunkLines} lines)`)
        }
        
        fileIndex++
      }
      
      if (!options.verbose) {
        results.push(`split: created ${totalFiles} output files`)
      }
    } else if (options.bytes) {
      // 按字节分割
      const totalFiles = Math.ceil(content.length / options.bytes)
      
      for (let i = 0; i < content.length; i += options.bytes) {
        const suffix = generateSuffix(fileIndex, options.suffixLength, options.numeric)
        const filename = outputPrefix + suffix
        
        if (options.verbose) {
          const chunkSize = Math.min(options.bytes, content.length - i)
          results.push(`creating '${filename}' (${chunkSize} bytes)`)
        }
        
        fileIndex++
      }
      
      if (!options.verbose) {
        results.push(`split: created ${totalFiles} output files`)
      }
    } else if (options.lineBytes) {
      // 按行字节数分割
      const lines = content.split('\n').filter(line => line.trim() !== '')
      let currentSize = 0
      let filesCreated = 0
      
      for (const line of lines) {
        const lineSize = line.length + 1 // +1 for newline
        
        if (currentSize + lineSize > options.lineBytes && currentSize > 0) {
          // 创建新文件
          const suffix = generateSuffix(filesCreated, options.suffixLength, options.numeric)
          const filename = outputPrefix + suffix
          
          if (options.verbose) {
            results.push(`creating '${filename}' (${currentSize} bytes)`)
          }
          
          filesCreated++
          currentSize = lineSize
        } else {
          currentSize += lineSize
        }
      }
      
      // 处理最后一个块
      if (currentSize > 0) {
        const suffix = generateSuffix(filesCreated, options.suffixLength, options.numeric)
        const filename = outputPrefix + suffix
        
        if (options.verbose) {
          results.push(`creating '${filename}' (${currentSize} bytes)`)
        }
        filesCreated++
      }
      
      if (!options.verbose) {
        results.push(`split: created ${filesCreated} output files`)
      }
    }
    
    return results.join('\n')
  }
}

function getMockFileContent(filename) {
  // 模拟文件内容
  const mockFiles = {
    'file.txt': `Line 1: This is the first line of the file
Line 2: Here is some more content
Line 3: Adding more text for demonstration
Line 4: This file will be split into parts
Line 5: Each part will contain specified number of lines
Line 6: Or specified number of bytes
Line 7: The split command is very useful
Line 8: For handling large files
Line 9: It creates multiple smaller files
Line 10: Making them easier to manage`,
    
    'large.txt': `This is a large file that needs to be split.
It contains multiple lines of text.
Each line has different content.
Some lines are longer than others.
This helps demonstrate the splitting functionality.
The file can be split by lines or by bytes.
Line-based splitting preserves line boundaries.
Byte-based splitting may cut lines in the middle.
Choose the appropriate method for your needs.
The split command is very flexible and powerful.`,
    
    'data.txt': `apple,red,sweet
banana,yellow,sweet
cherry,red,tart
date,brown,sweet
elderberry,purple,tart
fig,purple,sweet
grape,green,sweet
honeydew,green,sweet`,
    
    'log.txt': `2023-01-01 10:00:00 INFO: Application started
2023-01-01 10:01:00 DEBUG: Loading configuration
2023-01-01 10:02:00 INFO: Database connected
2023-01-01 10:03:00 WARNING: High memory usage detected
2023-01-01 10:04:00 ERROR: Connection timeout
2023-01-01 10:05:00 INFO: Retrying connection
2023-01-01 10:06:00 INFO: Connection restored
2023-01-01 10:07:00 DEBUG: Processing requests
2023-01-01 10:08:00 INFO: All systems normal
2023-01-01 10:09:00 INFO: Application running smoothly`
  }
  
  return mockFiles[filename] || mockFiles['file.txt']
}