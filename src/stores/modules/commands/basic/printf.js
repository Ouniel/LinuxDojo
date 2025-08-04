/**
 * printf - 格式化并打印数据
 */

export const printf = {
  options: [
    {
      flag: '-v',
      longFlag: '--assign',
      description: 'Assign output to variable VAR|将输出分配给变量VAR',
      type: 'string',
      placeholder: 'VAR'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return printf.help
    }

    if (args.length === 0) {
      return 'printf: usage: printf [-v var] format [arguments]'
    }

    const format = args[0]
    const values = args.slice(1)
    let output = ''
    let valueIndex = 0
    
    for (let i = 0; i < format.length; i++) {
      const char = format[i]
      
      if (char === '\\') {
        // 处理转义序列
        if (i + 1 < format.length) {
          const nextChar = format[i + 1]
          switch (nextChar) {
            case 'n':
              output += '\n'
              break
            case 't':
              output += '\t'
              break
            case 'r':
              output += '\r'
              break
            case 'b':
              output += '\b'
              break
            case 'f':
              output += '\f'
              break
            case 'v':
              output += '\v'
              break
            case 'a':
              output += '\a'
              break
            case '\\':
              output += '\\'
              break
            case '0':
              output += '\0'
              break
            default:
              output += nextChar
              break
          }
          i++ // 跳过下一个字符
        } else {
          output += char
        }
      } else if (char === '%') {
        // 处理格式说明符
        if (i + 1 < format.length) {
          const nextChar = format[i + 1]
          
          if (nextChar === '%') {
            output += '%'
            i++
          } else {
            // 解析格式说明符
            let formatSpec = '%'
            let j = i + 1
            
            // 跳过标志
            while (j < format.length && '+-# 0'.includes(format[j])) {
              formatSpec += format[j]
              j++
            }
            
            // 跳过宽度
            while (j < format.length && /\d/.test(format[j])) {
              formatSpec += format[j]
              j++
            }
            
            // 跳过精度
            if (j < format.length && format[j] === '.') {
              formatSpec += format[j]
              j++
              while (j < format.length && /\d/.test(format[j])) {
                formatSpec += format[j]
                j++
              }
            }
            
            // 获取转换说明符
            if (j < format.length) {
              const conversion = format[j]
              formatSpec += conversion
              
              const value = valueIndex < values.length ? values[valueIndex] : ''
              valueIndex++
              
              try {
                switch (conversion) {
                  case 'd':
                  case 'i':
                    output += parseInt(value || '0').toString()
                    break
                  case 'o':
                    output += parseInt(value || '0').toString(8)
                    break
                  case 'x':
                    output += parseInt(value || '0').toString(16)
                    break
                  case 'X':
                    output += parseInt(value || '0').toString(16).toUpperCase()
                    break
                  case 'f':
                  case 'F':
                    output += parseFloat(value || '0').toFixed(6)
                    break
                  case 'e':
                    output += parseFloat(value || '0').toExponential()
                    break
                  case 'E':
                    output += parseFloat(value || '0').toExponential().toUpperCase()
                    break
                  case 'g':
                    const num = parseFloat(value || '0')
                    output += num < 0.0001 || num >= 1000000 ? num.toExponential() : num.toString()
                    break
                  case 'G':
                    const numG = parseFloat(value || '0')
                    output += numG < 0.0001 || numG >= 1000000 ? numG.toExponential().toUpperCase() : numG.toString()
                    break
                  case 'c':
                    if (value) {
                      const charCode = parseInt(value)
                      output += isNaN(charCode) ? value.charAt(0) : String.fromCharCode(charCode)
                    }
                    break
                  case 's':
                    output += value || ''
                    break
                  default:
                    output += formatSpec
                    break
                }
              } catch (e) {
                output += value || ''
              }
              
              i = j
            } else {
              output += char
            }
          }
        } else {
          output += char
        }
      } else {
        output += char
      }
    }
    
    return output
  },
  description: 'Format and print data|格式化并打印数据',
  category: 'basic',
  supportsPipe: true,
  examples: [
    'printf "Hello %s\\n" "World"',
    'printf "%d + %d = %d\\n" 2 3 5',
    'printf "%.2f\\n" 3.14159',
    'printf "%x\\n" 255',
    'printf --help'
  ],
  help: `Usage: printf FORMAT [ARGUMENT]...|用法: printf 格式 [参数]...
  or:  printf OPTION|或者: printf 选项

Print ARGUMENT(s) according to FORMAT, or execute according to OPTION:|根据格式打印参数，或根据选项执行：

      --help     display this help and exit|显示此帮助信息并退出

FORMAT controls the output as in C printf.  Interpreted sequences are:|格式控制输出，如C printf。解释的序列有：

  \\"      double quote|双引号
  \\\\      backslash|反斜杠
  \\a      alert (BEL)|警报（BEL）
  \\b      backspace|退格
  \\f      form feed|换页
  \\n      new line|换行
  \\r      carriage return|回车
  \\t      horizontal tab|水平制表符
  \\v      vertical tab|垂直制表符
  \\0      null character|空字符

and all C format specifications ending with one of diouxXeEfFgGcs,|以及所有以diouxXeEfFgGcs之一结尾的C格式规范，
with ARGUMENTs converted to proper type first.  Variable widths are handled.|参数首先转换为适当的类型。处理可变宽度。

Format specifiers:|格式说明符：
  %d, %i    signed decimal integer|有符号十进制整数
  %o        unsigned octal integer|无符号八进制整数
  %x, %X    unsigned hexadecimal integer|无符号十六进制整数
  %f, %F    floating point number|浮点数
  %e, %E    scientific notation|科学记数法
  %g, %G    shorter of %f and %e|%f和%e中较短的
  %c        single character|单个字符
  %s        string|字符串
  %%        literal %|字面量%

Examples|示例:
  printf "Hello %s\\n" "World"           Output: Hello World|输出: Hello World
  printf "%d + %d = %d\\n" 2 3 5         Output: 2 + 3 = 5|输出: 2 + 3 = 5
  printf "%.2f\\n" 3.14159               Output: 3.14|输出: 3.14
  printf "%x\\n" 255                     Output: ff|输出: ff`
}