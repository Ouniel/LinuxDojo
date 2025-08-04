/**
 * join - 连接两个文件的行
 */

export const join = {
  name: 'join',
  description: 'Join lines of two files on a common field|基于公共字段连接两个文件的行',
  usage: 'join [OPTION]... FILE1 FILE2',
  category: 'text',
  
  options: [
    // 连接字段组
    {
      flag: '-1',
      description: '指定文件1的连接字段号（从1开始）',
      type: 'input',
      inputKey: 'field1',
      placeholder: '字段号（如：1, 2, 3）',
      group: '连接字段'
    },
    {
      flag: '-2',
      description: '指定文件2的连接字段号（从1开始）',
      type: 'input',
      inputKey: 'field2',
      placeholder: '字段号（如：1, 2, 3）',
      group: '连接字段'
    },
    {
      flag: '-j',
      description: '指定两个文件的公共连接字段号',
      type: 'input',
      inputKey: 'common_field',
      placeholder: '字段号（如：1, 2, 3）',
      group: '连接字段'
    },
    
    // 输出选项组
    {
      flag: '-o',
      description: '指定输出格式（如：1.1,2.2表示文件1字段1和文件2字段2）',
      type: 'input',
      inputKey: 'output_format',
      placeholder: '输出格式（如：1.1,1.2,2.1,2.2）',
      group: '输出选项'
    },
    {
      flag: '-t',
      description: '指定字段分隔符',
      type: 'input',
      inputKey: 'separator',
      placeholder: '分隔符（如：, | :）',
      group: '输出选项'
    },
    {
      flag: '-e',
      description: '替换缺失字段的字符串',
      type: 'input',
      inputKey: 'empty_string',
      placeholder: '替换字符串（如：NULL, N/A）',
      group: '输出选项'
    },
    
    // 处理选项组
    {
      flag: '-a',
      description: '输出文件1中不匹配的行',
      type: 'input',
      inputKey: 'unpairable1',
      placeholder: '文件号（1或2）',
      group: '处理选项'
    },
    {
      flag: '-v',
      description: '仅输出不匹配的行',
      type: 'input',
      inputKey: 'suppress_matched',
      placeholder: '文件号（1或2）',
      group: '处理选项'
    },
    {
      flag: '-i',
      longFlag: '--ignore-case',
      description: '比较字段时忽略大小写',
      type: 'boolean',
      group: '处理选项'
    },
    
    // 检查选项组
    {
      longFlag: '--check-order',
      description: '检查输入是否已排序',
      type: 'boolean',
      group: '检查选项'
    },
    {
      longFlag: '--nocheck-order',
      description: '不检查输入是否已排序',
      type: 'boolean',
      group: '检查选项'
    },
    {
      longFlag: '--header',
      description: '将第一行视为字段标题',
      type: 'boolean',
      group: '检查选项'
    },
    
    // 输入参数
    {
      inputKey: 'file1',
      description: '第一个要连接的文件',
      type: 'input',
      placeholder: '文件1路径'
    },
    {
      inputKey: 'file2',
      description: '第二个要连接的文件',
      type: 'input',
      placeholder: '文件2路径'
    }
  ],

  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return join.help
    }

    if (args.length < 2) {
      throw new Error('join: missing operand after \'join\'|缺少 \'join\' 后的操作数\njoin: Try \'join --help\' for more information.|尝试 \'join --help\' 获取更多信息')
    }

    // 解析选项
    let field1 = 1
    let field2 = 1
    let outputFormat = null
    let separator = ' '
    let emptyString = ''
    let unpairable1 = false
    let unpairable2 = false
    let suppressMatched1 = false
    let suppressMatched2 = false
    let ignoreCase = args.includes('-i') || args.includes('--ignore-case')
    let checkOrder = args.includes('--check-order')
    let noCheckOrder = args.includes('--nocheck-order')
    let header = args.includes('--header')
    
    // 解析选项值
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-1' && i + 1 < args.length) {
        field1 = parseInt(args[i + 1]) || 1
        i++
      } else if (arg === '-2' && i + 1 < args.length) {
        field2 = parseInt(args[i + 1]) || 1
        i++
      } else if (arg === '-j' && i + 1 < args.length) {
        field1 = field2 = parseInt(args[i + 1]) || 1
        i++
      } else if (arg === '-o' && i + 1 < args.length) {
        outputFormat = args[i + 1]
        i++
      } else if (arg === '-t' && i + 1 < args.length) {
        separator = args[i + 1]
        i++
      } else if (arg === '-e' && i + 1 < args.length) {
        emptyString = args[i + 1]
        i++
      } else if (arg === '-a' && i + 1 < args.length) {
        const fileNum = parseInt(args[i + 1])
        if (fileNum === 1) unpairable1 = true
        else if (fileNum === 2) unpairable2 = true
        i++
      } else if (arg === '-v' && i + 1 < args.length) {
        const fileNum = parseInt(args[i + 1])
        if (fileNum === 1) suppressMatched1 = true
        else if (fileNum === 2) suppressMatched2 = true
        i++
      }
    }
    
    // 获取文件名
    const files = args.filter(arg => 
      !arg.startsWith('-') && 
      !isOptionValue(arg, args)
    )
    
    if (files.length < 2) {
      throw new Error('join: missing operand|缺少操作数\nTry \'join --help\' for more information.|尝试 \'join --help\' 获取更多信息')
    }

    const file1Path = files[0]
    const file2Path = files[1]
    
    // 读取文件内容
    let content1, content2
    
    if (file1Path === '-') {
      content1 = context.stdin || 'id1 name1 value1\nid2 name2 value2\nid3 name3 value3'
    } else {
      content1 = fs.getFileContent(file1Path)
      if (content1 === null) {
        throw new Error(`join: ${file1Path}: No such file or directory|文件或目录不存在`)
      }
    }
    
    if (file2Path === '-') {
      content2 = context.stdin || 'id1 desc1 extra1\nid2 desc2 extra2\nid4 desc4 extra4'
    } else {
      content2 = fs.getFileContent(file2Path)
      if (content2 === null) {
        throw new Error(`join: ${file2Path}: No such file or directory|文件或目录不存在`)
      }
    }
    
    const lines1 = content1.trim().split('\n').filter(line => line.trim())
    const lines2 = content2.trim().split('\n').filter(line => line.trim())
    
    if (lines1.length === 0 || lines2.length === 0) {
      return ''
    }
    
    // 解析行为字段数组
    const parseFields = (line, sep) => {
      if (sep === ' ') {
        return line.trim().split(/\s+/)
      } else {
        return line.split(sep)
      }
    }
    
    const records1 = lines1.map(line => parseFields(line, separator))
    const records2 = lines2.map(line => parseFields(line, separator))
    
    // 处理标题行
    let headerLine = ''
    let startIndex1 = 0
    let startIndex2 = 0
    
    if (header && records1.length > 0 && records2.length > 0) {
      if (outputFormat) {
        const formatParts = outputFormat.split(',')
        const headerParts = []
        for (const part of formatParts) {
          const [fileNum, fieldNum] = part.split('.')
          if (fileNum === '1' && parseInt(fieldNum) <= records1[0].length) {
            headerParts.push(records1[0][parseInt(fieldNum) - 1] || '')
          } else if (fileNum === '2' && parseInt(fieldNum) <= records2[0].length) {
            headerParts.push(records2[0][parseInt(fieldNum) - 1] || '')
          }
        }
        headerLine = headerParts.join(separator)
      } else {
        const joinField = records1[0][field1 - 1] || ''
        const otherFields1 = records1[0].filter((_, i) => i !== field1 - 1)
        const otherFields2 = records2[0].filter((_, i) => i !== field2 - 1)
        headerLine = [joinField, ...otherFields1, ...otherFields2].join(separator)
      }
      startIndex1 = 1
      startIndex2 = 1
    }
    
    const result = []
    if (headerLine) {
      result.push(headerLine)
    }
    
    // 执行连接操作
    const dataRecords1 = records1.slice(startIndex1)
    const dataRecords2 = records2.slice(startIndex2)
    
    // 创建索引映射
    const index2 = new Map()
    for (let i = 0; i < dataRecords2.length; i++) {
      const record = dataRecords2[i]
      const key = record[field2 - 1] || ''
      const normalizedKey = ignoreCase ? key.toLowerCase() : key
      
      if (!index2.has(normalizedKey)) {
        index2.set(normalizedKey, [])
      }
      index2.get(normalizedKey).push(i)
    }
    
    const matched2 = new Set()
    
    // 处理文件1的每一行
    for (let i = 0; i < dataRecords1.length; i++) {
      const record1 = dataRecords1[i]
      const key1 = record1[field1 - 1] || ''
      const normalizedKey1 = ignoreCase ? key1.toLowerCase() : key1
      
      const matchingIndices = index2.get(normalizedKey1) || []
      
      if (matchingIndices.length > 0) {
        // 找到匹配
        for (const j of matchingIndices) {
          matched2.add(j)
          const record2 = dataRecords2[j]
          
          if (!suppressMatched1 && !suppressMatched2) {
            if (outputFormat) {
              result.push(formatOutput(outputFormat, record1, record2, separator, emptyString))
            } else {
              const joinField = key1
              const otherFields1 = record1.filter((_, idx) => idx !== field1 - 1)
              const otherFields2 = record2.filter((_, idx) => idx !== field2 - 1)
              result.push([joinField, ...otherFields1, ...otherFields2].join(separator))
            }
          }
        }
      } else {
        // 文件1中没有匹配的行
        if ((unpairable1 || suppressMatched2) && !suppressMatched1) {
          if (outputFormat) {
            result.push(formatOutput(outputFormat, record1, [], separator, emptyString))
          } else {
            result.push(record1.join(separator))
          }
        }
      }
    }
    
    // 处理文件2中未匹配的行
    if (unpairable2 || suppressMatched1) {
      for (let i = 0; i < dataRecords2.length; i++) {
        if (!matched2.has(i) && !suppressMatched2) {
          const record2 = dataRecords2[i]
          if (outputFormat) {
            result.push(formatOutput(outputFormat, [], record2, separator, emptyString))
          } else {
            result.push(record2.join(separator))
          }
        }
      }
    }
    
    return result.join('\n')
  },
  requiresArgs: false,
  examples: [
    'join file1.txt file2.txt           # Join files on first field|基于第一个字段连接文件',
    'join -1 2 -2 1 file1.txt file2.txt # Join file1 field 2 with file2 field 1|连接文件1的第2字段和文件2的第1字段',
    'join -t: file1.txt file2.txt       # Use colon as field separator|使用冒号作为字段分隔符',
    'join -o 1.1,2.2 file1.txt file2.txt # Output file1 field1 and file2 field2|输出文件1字段1和文件2字段2',
    'join -a1 file1.txt file2.txt       # Include unmatched lines from file1|包含文件1中不匹配的行',
    'join -v1 file1.txt file2.txt       # Only unmatched lines from file1|仅显示文件1中不匹配的行',
    'join -i file1.txt file2.txt        # Ignore case when comparing|比较时忽略大小写',
    'join -e NULL file1.txt file2.txt   # Replace empty fields with NULL|用NULL替换空字段'
  ],
  help: `Usage: join [OPTION]... FILE1 FILE2
用法: join [选项]... 文件1 文件2

For each pair of input lines with identical join fields, write a line to
standard output.  The default join field is the first, delimited by blanks.
对于每对具有相同连接字段的输入行，向标准输出写入一行。
默认连接字段是第一个，由空白分隔。

Join field options|连接字段选项:
  -1 FIELD              join on this FIELD of file 1|基于文件1的此字段连接
  -2 FIELD              join on this FIELD of file 2|基于文件2的此字段连接
  -j FIELD              equivalent to '-1 FIELD -2 FIELD'|等同于'-1 字段 -2 字段'

Output options|输出选项:
  -o FORMAT             obey FORMAT while constructing output line|构造输出行时遵循格式
  -t CHAR               use CHAR as input and output field separator|使用字符作为输入和输出字段分隔符
  -e STRING             replace missing input fields with STRING|用字符串替换缺失的输入字段

Processing options|处理选项:
  -a FILENUM            also print unpairable lines from file FILENUM|也打印文件FILENUM中不可配对的行
  -v FILENUM            like -a FILENUM, but suppress joined lines|类似-a FILENUM，但抑制连接的行
  -i, --ignore-case     ignore differences in case when comparing fields|比较字段时忽略大小写差异

Check options|检查选项:
      --check-order     check that the input is correctly sorted|检查输入是否正确排序
      --nocheck-order   do not check that the input is correctly sorted|不检查输入是否正确排序
      --header          treat the first line in each file as field headers|将每个文件的第一行视为字段标题
      --help            display this help and exit|显示此帮助信息并退出

Unless -t CHAR is given, leading blanks separate fields and are ignored,
else fields are separated by CHAR.  Any FIELD is a field number counted
from 1.  FORMAT is one or more comma or blank separated specifications,
each being 'FILENUM.FIELD' or '0'.  Default FORMAT outputs the join field,
the remaining fields from FILE1, then the remaining fields from FILE2.
除非给出-t字符，否则前导空白分隔字段并被忽略，
否则字段由字符分隔。任何字段都是从1开始计数的字段号。
格式是一个或多个逗号或空白分隔的规范，
每个都是'文件号.字段'或'0'。默认格式输出连接字段，
文件1的其余字段，然后是文件2的其余字段。

Examples|示例:
  join file1.txt file2.txt           Join files on first field|基于第一个字段连接文件
  join -1 2 -2 1 file1.txt file2.txt Join file1 field 2 with file2 field 1|连接文件1的第2字段和文件2的第1字段
  join -t: file1.txt file2.txt       Use colon as field separator|使用冒号作为字段分隔符
  join -o 1.1,2.2 file1.txt file2.txt Output file1 field1 and file2 field2|输出文件1字段1和文件2字段2
  join -a1 file1.txt file2.txt       Include unmatched lines from file1|包含文件1中不匹配的行
  join -v1 file1.txt file2.txt       Only unmatched lines from file1|仅显示文件1中不匹配的行
  join -i file1.txt file2.txt        Ignore case when comparing|比较时忽略大小写
  join -e NULL file1.txt file2.txt   Replace empty fields with NULL|用NULL替换空字段`
}

// 格式化输出
function formatOutput(format, record1, record2, separator, emptyString) {
  const parts = format.split(',')
  const output = []
  
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed === '0') {
      // 连接字段
      const field1 = record1.length > 0 ? record1[0] : ''
      const field2 = record2.length > 0 ? record2[0] : ''
      output.push(field1 || field2 || emptyString)
    } else if (trimmed.includes('.')) {
      const [fileNum, fieldNum] = trimmed.split('.')
      const fieldIndex = parseInt(fieldNum) - 1
      
      if (fileNum === '1' && record1.length > fieldIndex && fieldIndex >= 0) {
        output.push(record1[fieldIndex] || emptyString)
      } else if (fileNum === '2' && record2.length > fieldIndex && fieldIndex >= 0) {
        output.push(record2[fieldIndex] || emptyString)
      } else {
        output.push(emptyString)
      }
    } else {
      output.push(emptyString)
    }
  }
  
  return output.join(separator)
}

// 检查参数是否是选项值
function isOptionValue(arg, args) {
  const index = args.indexOf(arg)
  if (index === 0) return false
  
  const prevArg = args[index - 1]
  return ['-1', '-2', '-j', '-o', '-t', '-e', '-a', '-v'].includes(prevArg)
}