/**
 * echo - 显示文本行
 */

export const echo = {
  options: [
    {
      flag: '-n',
      description: 'Do not output the trailing newline|不输出尾随的换行符',
      type: 'boolean'
    },
    {
      flag: '-e',
      description: 'Enable interpretation of backslash escapes|启用反斜杠转义的解释',
      type: 'boolean'
    },
    {
      flag: '-E',
      description: 'Disable interpretation of backslash escapes (default)|禁用反斜杠转义的解释（默认）',
      type: 'boolean'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return echo.help
    }

    let output = ''
    let enableInterpretation = false
    let disableInterpretation = false
    let suppressNewline = false
    
    // 解析选项
    const filteredArgs = []
    for (const arg of args) {
      if (arg === '-e') {
        enableInterpretation = true
      } else if (arg === '-E') {
        disableInterpretation = true
      } else if (arg === '-n') {
        suppressNewline = true
      } else if (!arg.startsWith('-')) {
        filteredArgs.push(arg)
      }
    }
    
    // 连接所有参数
    output = filteredArgs.join(' ')
    
    // 处理转义序列
    if (enableInterpretation && !disableInterpretation) {
      output = output
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\b/g, '\b')
        .replace(/\\f/g, '\f')
        .replace(/\\v/g, '\v')
        .replace(/\\a/g, '\a')
        .replace(/\\\\/g, '\\')
        .replace(/\\0/g, '\0')
    }
    
    // 处理换行
    if (!suppressNewline) {
      output += '\n'
    }
    
    return output
  },
  description: 'Display a line of text|显示一行文本',
  category: 'basic',
  supportsPipe: true,
  examples: [
    'echo "Hello World"',
    'echo -n "No newline"',
    'echo -e "Line1\\nLine2"',
    'echo --help'
  ],
  help: `Usage: echo [SHORT-OPTION]... [STRING]...|用法: echo [短选项]... [字符串]...
  or:  echo LONG-OPTION|或者: echo 长选项

Echo the STRINGs to standard output.|将字符串输出到标准输出。

  -n             do not output the trailing newline|不输出尾随的换行符
  -e             enable interpretation of backslash escapes|启用反斜杠转义的解释
  -E             disable interpretation of backslash escapes (default)|禁用反斜杠转义的解释（默认）
      --help     display this help and exit|显示此帮助信息并退出

If -e is in effect, the following sequences are recognized:|如果-e生效，识别以下序列：

  \\\\      backslash|反斜杠
  \\a      alert (BEL)|警报（BEL）
  \\b      backspace|退格
  \\f      form feed|换页
  \\n      new line|换行
  \\r      carriage return|回车
  \\t      horizontal tab|水平制表符
  \\v      vertical tab|垂直制表符
  \\0      null character|空字符

Examples|示例:
  echo Hello World              Output: Hello World|输出: Hello World
  echo -n "No newline"          Output without newline|输出不带换行符
  echo -e "Line1\\nLine2"        Output on two lines|输出两行
  echo -e "Tab\\tSeparated"      Output with tab|输出带制表符`
}