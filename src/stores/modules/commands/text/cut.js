/**
 * cut - 从每行中提取部分内容
 */

export const cut = {
  name: 'cut',
  description: 'Remove sections from each line of files|从文件的每行中删除部分内容',
  usage: 'cut OPTION... [FILE]...',
  category: 'text',
  
  options: [
    // 选择模式组
    {
      flag: '-f',
      longFlag: '--fields',
      description: '选择字段（如：1,3,5-7）',
      type: 'input',
      inputKey: 'fields',
      placeholder: '字段范围（如：1,3,5-7）',
      group: '选择模式'
    },
    {
      flag: '-c',
      longFlag: '--characters',
      description: '选择字符（如：1-10,15-20）',
      type: 'input',
      inputKey: 'characters',
      placeholder: '字符范围（如：1-10,15-20）',
      group: '选择模式'
    },
    {
      flag: '-b',
      longFlag: '--bytes',
      description: '选择字节（如：1-5,10-）',
      type: 'input',
      inputKey: 'bytes',
      placeholder: '字节范围（如：1-5,10-）',
      group: '选择模式'
    },
    
    // 分隔符选项组
    {
      flag: '-d',
      longFlag: '--delimiter',
      description: '输入字段分隔符',
      type: 'input',
      inputKey: 'delimiter',
      placeholder: '分隔符（如：:, ,, \\t）',
      group: '分隔符选项'
    },
    {
      longFlag: '--output-delimiter',
      description: '输出字段分隔符',
      type: 'input',
      inputKey: 'output_delimiter',
      placeholder: '输出分隔符（如：,, |）',
      group: '分隔符选项'
    },
    
    // 过滤选项组
    {
      flag: '-s',
      longFlag: '--only-delimited',
      description: '只输出包含分隔符的行',
      type: 'boolean',
      group: '过滤选项'
    },
    {
      longFlag: '--complement',
      description: '输出选定字段的补集',
      type: 'boolean',
      group: '过滤选项'
    },
    {
      flag: '-n',
      description: '与-b一起使用：不分割多字节字符',
      type: 'boolean',
      group: '过滤选项'
    },
    
    // 输入参数
    {
      inputKey: 'files',
      description: '要处理的文件',
      type: 'input',
      placeholder: '文件路径（支持多个文件，用空格分隔）'
    }
  ],
  
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return cut.help
    }

    let fields = null
    let characters = null
    let bytes = null
    let delimiter = '\t'
    let onlyDelimited = false
    let outputDelimiter = null
    let complement = false
    let noSplitMultibyte = false
    const files = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-f' && i + 1 < args.length) {
        fields = args[i + 1]
        i++
      } else if (arg.startsWith('-f')) {
        fields = arg.substring(2)
      } else if (arg === '--fields' && i + 1 < args.length) {
        fields = args[i + 1]
        i++
      } else if (arg === '-c' && i + 1 < args.length) {
        characters = args[i + 1]
        i++
      } else if (arg.startsWith('-c')) {
        characters = arg.substring(2)
      } else if (arg === '--characters' && i + 1 < args.length) {
        characters = args[i + 1]
        i++
      } else if (arg === '-b' && i + 1 < args.length) {
        bytes = args[i + 1]
        i++
      } else if (arg.startsWith('-b')) {
        bytes = arg.substring(2)
      } else if (arg === '--bytes' && i + 1 < args.length) {
        bytes = args[i + 1]
        i++
      } else if (arg === '-d' && i + 1 < args.length) {
        delimiter = args[i + 1]
        i++
      } else if (arg.startsWith('-d')) {
        delimiter = arg.substring(2)
      } else if (arg === '--delimiter' && i + 1 < args.length) {
        delimiter = args[i + 1]
        i++
      } else if (arg === '--output-delimiter' && i + 1 < args.length) {
        outputDelimiter = args[i + 1]
        i++
      } else if (arg.startsWith('--output-delimiter=')) {
        outputDelimiter = arg.substring('--output-delimiter='.length)
      } else if (arg === '-s' || arg === '--only-delimited') {
        onlyDelimited = true
      } else if (arg === '--complement') {
        complement = true
      } else if (arg === '-n') {
        noSplitMultibyte = true
      } else if (!arg.startsWith('-')) {
        files.push(arg)
      }
    }
    
    // 验证必需的选项
    if (!fields && !characters && !bytes) {
      throw new Error('cut: you must specify a list of bytes, characters, or fields|必须指定字节、字符或字段列表\nTry \'cut --help\' for more information.|尝试 \'cut --help\' 获取更多信息')
    }
    
    // 如果没有指定文件，从标准输入读取
    if (files.length === 0) {
      files.push('-')
    }
    
    let output = ''
    
    for (const filename of files) {
      let content
      
      if (filename === '-') {
        content = context.stdin || 'field1:field2:field3\nvalue1:value2:value3\ntest:data:example'
      } else {
        content = fs.getFileContent(filename)
        if (content === null) {
          output += `cut: ${filename}: No such file or directory|文件或目录不存在\n`
          continue
        }
      }
      
      const lines = content.split('\n')
      
      for (const line of lines) {
        if (line === '' && lines.indexOf(line) === lines.length - 1) continue
        
        let result = ''
        
        if (fields) {
          // 字段模式
          if (onlyDelimited && line.indexOf(delimiter) === -1) {
            continue // 跳过不包含分隔符的行
          }
          
          const parts = line.split(delimiter)
          const fieldRanges = parseRanges(fields)
          const selectedFields = []
          
          if (complement) {
            // 补集模式：选择未指定的字段
            const selectedIndices = new Set()
            for (const range of fieldRanges) {
              for (let i = range.start; i <= range.end && i <= parts.length; i++) {
                selectedIndices.add(i - 1)
              }
            }
            
            for (let i = 0; i < parts.length; i++) {
              if (!selectedIndices.has(i)) {
                selectedFields.push(parts[i])
              }
            }
          } else {
            // 正常模式：选择指定的字段
            for (const range of fieldRanges) {
              for (let i = range.start; i <= range.end && i <= parts.length; i++) {
                if (parts[i - 1] !== undefined) {
                  selectedFields.push(parts[i - 1])
                }
              }
            }
          }
          
          result = selectedFields.join(outputDelimiter || delimiter)
        } else if (characters) {
          // 字符模式
          const charRanges = parseRanges(characters)
          const selectedChars = []
          
          if (complement) {
            // 补集模式：选择未指定的字符
            const selectedIndices = new Set()
            for (const range of charRanges) {
              for (let i = range.start; i <= range.end && i <= line.length; i++) {
                selectedIndices.add(i - 1)
              }
            }
            
            for (let i = 0; i < line.length; i++) {
              if (!selectedIndices.has(i)) {
                selectedChars.push(line[i])
              }
            }
          } else {
            // 正常模式：选择指定的字符
            for (const range of charRanges) {
              for (let i = range.start; i <= range.end && i <= line.length; i++) {
                if (line[i - 1] !== undefined) {
                  selectedChars.push(line[i - 1])
                }
              }
            }
          }
          
          result = selectedChars.join('')
        } else if (bytes) {
          // 字节模式（在JavaScript中与字符模式相同）
          const byteRanges = parseRanges(bytes)
          const selectedBytes = []
          
          if (complement) {
            // 补集模式：选择未指定的字节
            const selectedIndices = new Set()
            for (const range of byteRanges) {
              for (let i = range.start; i <= range.end && i <= line.length; i++) {
                selectedIndices.add(i - 1)
              }
            }
            
            for (let i = 0; i < line.length; i++) {
              if (!selectedIndices.has(i)) {
                selectedBytes.push(line[i])
              }
            }
          } else {
            // 正常模式：选择指定的字节
            for (const range of byteRanges) {
              for (let i = range.start; i <= range.end && i <= line.length; i++) {
                if (line[i - 1] !== undefined) {
                  selectedBytes.push(line[i - 1])
                }
              }
            }
          }
          
          result = selectedBytes.join('')
        }
        
        output += result + '\n'
      }
    }
    
    return output.trim()
  },
  requiresArgs: false,
  examples: [
    'cut -f1,3 file.txt              # Extract fields 1 and 3|提取字段1和3',
    'cut -c1-10 file.txt             # Extract characters 1-10|提取字符1-10',
    'cut -d: -f1 /etc/passwd         # Extract first field using : as delimiter|使用:作为分隔符提取第一个字段',
    'cut -b1-5 file.txt              # Extract bytes 1-5|提取字节1-5',
    'cut -f2- --output-delimiter=" " file.txt  # Extract from field 2 to end, space-separated|从字段2到末尾，空格分隔',
    'cut --complement -f2 file.txt   # Extract all fields except field 2|提取除字段2外的所有字段',
    'cut -s -d: -f1 /etc/passwd      # Only lines containing delimiter|只处理包含分隔符的行'
  ],
  help: `Usage: cut OPTION... [FILE]...
用法: cut 选项... [文件]...

Print selected parts of lines from each FILE to standard output.
将每个文件中行的选定部分打印到标准输出。

With no FILE, or when FILE is -, read standard input.
没有文件或文件为-时，从标准输入读取。

Mandatory arguments to long options are mandatory for short options too.
长选项的必需参数对短选项也是必需的。

  -b, --bytes=LIST        select only these bytes|仅选择这些字节
  -c, --characters=LIST   select only these characters|仅选择这些字符
  -d, --delimiter=DELIM   use DELIM instead of TAB for field delimiter|使用DELIM而不是TAB作为字段分隔符
  -f, --fields=LIST       select only these fields; also print any line|仅选择这些字段；也打印任何
                            that contains no delimiter character, unless|不包含分隔符字符的行，除非
                            the -s option is specified|指定了-s选项
  -n                      with -b: don't split multibyte characters|与-b一起：不分割多字节字符
      --complement        complement the set of selected bytes, characters|补充选定字节、字符
                            or fields|或字段的集合
  -s, --only-delimited    do not print lines not containing delimiters|不打印不包含分隔符的行
      --output-delimiter=STRING  use STRING as the output delimiter|使用STRING作为输出分隔符
                            the default is to use the input delimiter|默认使用输入分隔符
      --help              display this help and exit|显示此帮助信息并退出

Use one, and only one of -b, -c or -f. Each LIST is made up of one
range, or many ranges separated by commas. Selected input is written
in the same order that it is read, and is written exactly once.
使用-b、-c或-f中的一个且仅一个。每个LIST由一个范围或由逗号分隔的多个范围组成。
选定的输入按读取的相同顺序写入，且只写入一次。

Each range is one of:
每个范围是以下之一：

  N     N'th byte, character or field, counted from 1|第N个字节、字符或字段，从1开始计数
  N-    from N'th byte, character or field, to end of line|从第N个字节、字符或字段到行尾
  N-M   from N'th to M'th (included) byte, character or field|从第N个到第M个（包含）字节、字符或字段
  -M    from first to M'th (included) byte, character or field|从第一个到第M个（包含）字节、字符或字段

Examples|示例:
  cut -f1,3 file.txt              Extract fields 1 and 3|提取字段1和3
  cut -c1-10 file.txt             Extract characters 1-10|提取字符1-10
  cut -d: -f1 /etc/passwd         Extract first field using : as delimiter|使用:作为分隔符提取第一个字段
  cut -b1-5 file.txt              Extract bytes 1-5|提取字节1-5
  cut -f2- --output-delimiter=' ' file.txt  Extract from field 2 to end, space-separated|从字段2到末尾，空格分隔
  cut --complement -f2 file.txt   Extract all fields except field 2|提取除字段2外的所有字段`
}

// 解析范围字符串
function parseRanges(rangeStr) {
  const ranges = []
  const parts = rangeStr.split(',')
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-')
      ranges.push({
        start: start === '' ? 1 : parseInt(start),
        end: end === '' ? Infinity : parseInt(end)
      })
    } else {
      const num = parseInt(part)
      ranges.push({ start: num, end: num })
    }
  }
  
  return ranges
}