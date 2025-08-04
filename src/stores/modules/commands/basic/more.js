/**
 * more - 分页显示文件内容
 */

export const more = {
  name: 'more',
  description: 'Display file contents page by page|分页显示文件内容',
  
  options: [
    {
      name: '显示控制',
      type: 'group',
      options: [
        {
          name: '-n, --lines',
          type: 'input',
          description: '指定每屏的行数',
          placeholder: '每页行数（如：20, 30）',
          defaultValue: '24',
          flag: '-n'
        },
        {
          name: '-c, --clean-print',
          type: 'checkbox',
          description: '不滚动，显示文本并清理行尾',
          flag: '-c'
        },
        {
          name: '-s, --squeeze-blank-lines',
          type: 'checkbox',
          description: '将多个空行压缩为一行',
          flag: '-s'
        },
        {
          name: '-u, --plain',
          type: 'checkbox',
          description: '禁止下划线显示',
          flag: '-u'
        }
      ]
    },
    {
      name: '文件',
      type: 'input',
      description: '要显示的文件',
      placeholder: '文件路径（支持多个文件，用空格分隔）',
      position: 'end'
    }
  ],
  
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return more.help
    }

    let linesPerPage = 24 // 默认每页24行
    let clearScreen = false
    let squeeze = false
    const files = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-n' && i + 1 < args.length) {
        linesPerPage = parseInt(args[i + 1])
        i++
      } else if (arg.startsWith('-n')) {
        linesPerPage = parseInt(arg.substring(2))
      } else if (arg.match(/^-\d+$/)) {
        linesPerPage = parseInt(arg.substring(1))
      } else if (arg === '-c') {
        clearScreen = true
      } else if (arg === '-s') {
        squeeze = true
      } else if (!arg.startsWith('-')) {
        files.push(arg)
      }
    }
    
    if (files.length === 0) {
      return 'more: missing file operand\nTry \'more --help\' for more information.'
    }
    
    let output = ''
    
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      const filename = files[fileIndex]
      const content = fs.getFileContent(filename)
      
      if (content === null) {
        output += `more: cannot open ${filename}: No such file or directory\n`
        continue
      }
      
      // 如果有多个文件，显示文件名
      if (files.length > 1) {
        if (fileIndex > 0) output += '\n'
        output += `:::::::::::::::\n${filename}\n:::::::::::::::\n`
      }
      
      let lines = content.split('\n')
      
      // 如果启用了squeeze选项，压缩连续的空行
      if (squeeze) {
        const squeezedLines = []
        let lastWasEmpty = false
        
        for (const line of lines) {
          const isEmpty = line.trim() === ''
          if (!isEmpty || !lastWasEmpty) {
            squeezedLines.push(line)
          }
          lastWasEmpty = isEmpty
        }
        lines = squeezedLines
      }
      
      // 分页显示
      let currentLine = 0
      while (currentLine < lines.length) {
        const pageLines = lines.slice(currentLine, currentLine + linesPerPage)
        output += pageLines.join('\n')
        
        currentLine += linesPerPage
        
        // 如果还有更多内容，显示分页提示
        if (currentLine < lines.length) {
          const remaining = lines.length - currentLine
          const percentage = Math.round((currentLine / lines.length) * 100)
          output += `\n--More--(${percentage}%) [Press SPACE to continue, 'q' to quit]`
          
          // 在实际的more命令中，这里会等待用户输入
          // 在模拟环境中，我们直接显示所有内容
          output += '\n[Simulated: Showing all content]\n'
        } else if (pageLines.length > 0 && !pageLines[pageLines.length - 1].endsWith('\n')) {
          output += '\n'
        }
      }
    }
    
    return output
  },
  description: 'Display file contents page by page|分页显示文件内容',
  category: 'text',
  supportsPipe: true,
  examples: [
    'more file.txt',
    'more -n 20 file.txt',
    'more -s file.txt',
    'more file1.txt file2.txt',
    'more --help'
  ],
  help: `Usage: more [options] [file...]|用法: more [选项] [文件...]

Display file contents page by page.|分页显示文件内容。

Options|选项:
  -n, --lines=NUMBER    specify the number of lines per screenful|指定每屏的行数
  -c, --clean-print     do not scroll, display text and clean line endings|不滚动，显示文本并清理行尾
  -s, --squeeze-blank-lines  squeeze multiple blank lines into one|将多个空行压缩为一行
  -u, --plain           suppress underlining|禁止下划线
      --help            display this help and exit|显示此帮助信息并退出

Interactive commands (in real more):|交互式命令（在真实的more中）：
  SPACE                 display next page|显示下一页
  ENTER                 display next line|显示下一行
  q                     quit|退出
  h                     display help|显示帮助
  /pattern              search for pattern|搜索模式
  n                     repeat previous search|重复上一次搜索
  b                     display previous page|显示上一页

Note: This is a simulated version that displays all content.|注意：这是一个显示所有内容的模拟版本。
In a real terminal, more would wait for user input between pages.|在真实终端中，more会在页面之间等待用户输入。

Examples|示例:
  more file.txt              Display file.txt page by page|分页显示file.txt
  more -n 20 file.txt        Display 20 lines per page|每页显示20行
  more -s file.txt           Squeeze blank lines|压缩空行
  more *.txt                 Display all .txt files|显示所有.txt文件`
}