/**
 * tr - 转换或删除字符
 */

export const tr = {
  name: 'tr',
  description: 'Translate or delete characters|转换或删除字符',
  usage: 'tr [OPTION]... SET1 [SET2]',
  category: 'text',
  
  options: [
    // 操作模式组
    {
      flag: '-d',
      longFlag: '--delete',
      description: '删除字符集1中的字符',
      type: 'boolean',
      group: '操作模式'
    },
    {
      flag: '-s',
      longFlag: '--squeeze-repeats',
      description: '压缩重复字符为单个字符',
      type: 'boolean',
      group: '操作模式'
    },
    {
      flag: '-c',
      longFlag: '--complement',
      description: '使用字符集1的补集',
      type: 'boolean',
      group: '操作模式'
    },
    {
      flag: '-t',
      longFlag: '--truncate-set1',
      description: '将集合1截断为集合2的长度',
      type: 'boolean',
      group: '操作模式'
    },
    
    // 字符集组
    {
      inputKey: 'set1',
      description: '源字符集',
      type: 'input',
      placeholder: '字符集1（如：a-z, [:lower:], aeiou）',
      group: '字符集'
    },
    {
      inputKey: 'set2',
      description: '目标字符集',
      type: 'input',
      placeholder: '字符集2（如：A-Z, [:upper:], AEIOU）',
      group: '字符集'
    }
  ],

  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return tr.help
    }

    if (args.length === 0) {
      throw new Error('tr: missing operand|缺少操作数\nTry \'tr --help\' for more information.|尝试 \'tr --help\' 获取更多信息')
    }

    let deleteChars = args.includes('-d') || args.includes('--delete')
    let squeezeRepeats = args.includes('-s') || args.includes('--squeeze-repeats')
    let complement = args.includes('-c') || args.includes('--complement')
    let truncateSet1 = args.includes('-t') || args.includes('--truncate-set1')
    
    // 过滤出字符集参数
    const sets = args.filter(arg => !arg.startsWith('-'))
    
    if (deleteChars && sets.length < 1) {
      throw new Error('tr: missing operand after \'-d\'|缺少 \'-d\' 后的操作数\nTry \'tr --help\' for more information.|尝试 \'tr --help\' 获取更多信息')
    }
    
    if (!deleteChars && sets.length < 2) {
      throw new Error('tr: missing operand|缺少操作数\nTry \'tr --help\' for more information.|尝试 \'tr --help\' 获取更多信息')
    }

    // 从标准输入读取（在模拟环境中，我们假设有输入）
    const input = context.stdin || 'Sample input text for tr command demonstration.\nThis is line 2.\nAAA BBB CCC'
    
    let result = input
    
    if (deleteChars) {
      // 删除模式
      const deleteSet = expandCharacterSet(sets[0])
      const deleteCharsArray = complement ? 
        getAllCharsExcept(deleteSet) : 
        deleteSet.split('')
      
      for (const char of deleteCharsArray) {
        result = result.replace(new RegExp(escapeRegExp(char), 'g'), '')
      }
    } else {
      // 转换模式
      const set1 = expandCharacterSet(sets[0])
      const set2 = expandCharacterSet(sets[1])
      
      let fromChars = set1.split('')
      let toChars = set2.split('')
      
      if (complement) {
        fromChars = getAllCharsExcept(set1).split('')
        // 如果使用complement，通常用set2的最后一个字符填充
        if (toChars.length > 0) {
          const lastChar = toChars[toChars.length - 1]
          toChars = fromChars.map(() => lastChar)
        }
      }
      
      if (truncateSet1 && fromChars.length > toChars.length) {
        fromChars = fromChars.slice(0, toChars.length)
      } else if (!truncateSet1 && toChars.length < fromChars.length) {
        // 用最后一个字符填充set2
        const lastChar = toChars[toChars.length - 1] || ''
        while (toChars.length < fromChars.length) {
          toChars.push(lastChar)
        }
      }
      
      // 执行字符转换
      for (let i = 0; i < fromChars.length && i < toChars.length; i++) {
        const fromChar = fromChars[i]
        const toChar = toChars[i]
        result = result.replace(new RegExp(escapeRegExp(fromChar), 'g'), toChar)
      }
    }
    
    if (squeezeRepeats) {
      // 压缩重复字符
      if (deleteChars) {
        // 在删除模式下，压缩剩余的字符
        result = result.replace(/(.)\1+/g, '$1')
      } else {
        // 在转换模式下，压缩set2中的字符
        const set2 = expandCharacterSet(sets[1])
        const squeezeChars = set2.split('')
        
        for (const char of squeezeChars) {
          const regex = new RegExp(escapeRegExp(char) + '+', 'g')
          result = result.replace(regex, char)
        }
      }
    }
    
    return result
  },
  requiresArgs: false,
  examples: [
    'tr a-z A-Z                     # Convert lowercase to uppercase|将小写转换为大写',
    'tr -d aeiou                    # Delete all vowels|删除所有元音',
    'tr -s " "                      # Squeeze multiple spaces to single space|将多个空格压缩为单个空格',
    'tr "[:lower:]" "[:upper:]"     # Convert using character classes|使用字符类转换',
    'tr -cd "[:alnum:]"             # Delete all non-alphanumeric characters|删除所有非字母数字字符',
    'tr -t abc xyz                  # Truncate set1 to length of set2|将集合1截断为集合2的长度',
    'echo "hello" | tr l L          # Replace l with L|将l替换为L'
  ],
  help: `Usage: tr [OPTION]... SET1 [SET2]
用法: tr [选项]... 集合1 [集合2]

Translate, squeeze, and/or delete characters from standard input, writing to standard output.
从标准输入转换、压缩和/或删除字符，写入标准输出。

Options|选项:
  -c, -C, --complement    use the complement of SET1|使用集合1的补集
  -d, --delete            delete characters in SET1, do not translate|删除集合1中的字符，不转换
  -s, --squeeze-repeats   replace each sequence of a repeated character|将每个重复字符序列
                            that is listed in the last specified SET,|替换为该集合中的单个字符
                            with a single occurrence of that character|（在最后指定的集合中列出）
  -t, --truncate-set1     first truncate SET1 to length of SET2|首先将集合1截断为集合2的长度
      --help              display this help and exit|显示此帮助信息并退出

SETs are specified as strings of characters. Most represent themselves.
集合指定为字符串。大多数字符代表它们自己。

Interpreted sequences are|解释的序列有:
  \\NNN            character with octal value NNN (1 to 3 octal digits)|八进制值NNN的字符
  \\\\              backslash|反斜杠
  \\a              audible BEL|响铃
  \\b              backspace|退格
  \\f              form feed|换页
  \\n              new line|换行
  \\r              return|回车
  \\t              horizontal tab|水平制表符
  \\v              vertical tab|垂直制表符
  CHAR1-CHAR2     all characters from CHAR1 to CHAR2 in ascending order|从CHAR1到CHAR2的所有字符
  [CHAR*]         in SET2, copies of CHAR until length of SET1|在集合2中，CHAR的副本直到集合1的长度
  [:alnum:]       all letters and digits|所有字母和数字
  [:alpha:]       all letters|所有字母
  [:blank:]       all horizontal whitespace|所有水平空白字符
  [:cntrl:]       all control characters|所有控制字符
  [:digit:]       all digits|所有数字
  [:graph:]       all printable characters, not including space|所有可打印字符，不包括空格
  [:lower:]       all lower case letters|所有小写字母
  [:print:]       all printable characters, including space|所有可打印字符，包括空格
  [:punct:]       all punctuation characters|所有标点字符
  [:space:]       all horizontal or vertical whitespace|所有水平或垂直空白字符
  [:upper:]       all upper case letters|所有大写字母
  [:xdigit:]      all hexadecimal digits|所有十六进制数字

Examples|示例:
  tr a-z A-Z                    Convert lowercase to uppercase|将小写转换为大写
  tr -d aeiou                   Delete all vowels|删除所有元音
  tr -s ' '                     Squeeze multiple spaces to single space|将多个空格压缩为单个空格
  tr "[:lower:]" "[:upper:]"    Convert using character classes|使用字符类转换
  tr -cd "[:alnum:]"            Delete all non-alphanumeric characters|删除所有非字母数字字符`
}

// 展开字符集
function expandCharacterSet(set) {
  let result = set
  
  // 处理字符类
  const charClasses = {
    '[:alnum:]': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    '[:alpha:]': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '[:blank:]': ' \t',
    '[:cntrl:]': '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F',
    '[:digit:]': '0123456789',
    '[:graph:]': '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
    '[:lower:]': 'abcdefghijklmnopqrstuvwxyz',
    '[:print:]': ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
    '[:punct:]': '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
    '[:space:]': ' \t\n\r\f\v',
    '[:upper:]': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '[:xdigit:]': '0123456789ABCDEFabcdef'
  }
  
  for (const [className, chars] of Object.entries(charClasses)) {
    result = result.replace(new RegExp('\\[' + className.replace(/[[\]]/g, '\\$&') + '\\]', 'g'), chars)
  }
  
  // 处理范围 (a-z, A-Z, 0-9等)
  result = result.replace(/(.)-(.)/g, (match, start, end) => {
    const startCode = start.charCodeAt(0)
    const endCode = end.charCodeAt(0)
    let range = ''
    
    for (let i = startCode; i <= endCode; i++) {
      range += String.fromCharCode(i)
    }
    
    return range
  })
  
  // 处理转义序列
  result = result
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\v/g, '\v')
    .replace(/\\a/g, '\x07')
    .replace(/\\\\/g, '\\')
  
  return result
}

// 获取除指定字符外的所有字符
function getAllCharsExcept(excludeSet) {
  const excludeChars = excludeSet.split('')
  let result = ''
  
  // 生成ASCII可打印字符
  for (let i = 32; i <= 126; i++) {
    const char = String.fromCharCode(i)
    if (!excludeChars.includes(char)) {
      result += char
    }
  }
  
  return result
}

// 转义正则表达式特殊字符
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}