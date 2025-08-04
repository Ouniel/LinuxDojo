/**
 * less - 分页显示文件内容（增强版）
 */

export const less = {
  name: 'less',
  description: 'View file contents page by page (enhanced)|分页查看文件内容（增强版）',
  
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
          name: '-N, --LINE-NUMBERS',
          type: 'checkbox',
          description: '显示行号',
          flag: '-N'
        },
        {
          name: '-S, --chop-long-lines',
          type: 'checkbox',
          description: '截断（截取）长行',
          flag: '-S'
        },
        {
          name: '-s, --squeeze-blank-lines',
          type: 'checkbox',
          description: '将多个空行压缩为一行',
          flag: '-s'
        },
        {
          name: '-r, --raw-control-chars',
          type: 'checkbox',
          description: '显示原始控制字符',
          flag: '-r'
        }
      ]
    },
    {
      name: '搜索选项',
      type: 'group',
      options: [
        {
          name: '-i, --ignore-case',
          type: 'checkbox',
          description: '搜索时忽略大小写',
          flag: '-i'
        }
      ]
    },
    {
      name: '文件',
      type: 'input',
      description: '要查看的文件',
      placeholder: '文件路径（支持多个文件，用空格分隔）',
      position: 'end'
    }
  ],
  
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return less.help
    }

    let linesPerPage = 24 // 默认每页24行
    let ignoreCase = false
    let lineNumbers = false
    let squeeze = false
    let chopLongLines = false
    let rawControlChars = false
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
      } else if (arg === '-i' || arg === '--ignore-case') {
        ignoreCase = true
      } else if (arg === '-N' || arg === '--LINE-NUMBERS') {
        lineNumbers = true
      } else if (arg === '-S' || arg === '--chop-long-lines') {
        chopLongLines = true
      } else if (arg === '-s' || arg === '--squeeze-blank-lines') {
        squeeze = true
      } else if (arg === '-r' || arg === '--raw-control-chars') {
        rawControlChars = true
      } else if (!arg.startsWith('-')) {
        files.push(arg)
      }
    }
    
    if (files.length === 0) {
      return 'less: missing file operand\nTry \'less --help\' for more information.'
    }
    
    let output = ''
    
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      const filename = files[fileIndex]
      const content = fs.getFileContent(filename)
      
      if (content === null) {
        output += `less: ${filename}: No such file or directory\n`
        continue
      }
      
      // 如果有多个文件，显示文件名
      if (files.length > 1) {
        if (fileIndex > 0) output += '\n'
        output += `${filename} (file ${fileIndex + 1} of ${files.length})\n`
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
      
      // 处理长行截断
      if (chopLongLines) {
        const maxWidth = 80
        lines = lines.map(line => line.length > maxWidth ? line.substring(0, maxWidth) : line)
      }
      
      // 分页显示
      let currentLine = 0
      while (currentLine < lines.length) {
        const pageLines = lines.slice(currentLine, currentLine + linesPerPage)
        
        // 添加行号（如果启用）
        if (lineNumbers) {
          pageLines.forEach((line, index) => {
            const lineNum = (currentLine + index + 1).toString().padStart(6)
            output += `${lineNum}  ${line}\n`
          })
        } else {
          output += pageLines.join('\n')
          if (pageLines.length > 0) output += '\n'
        }
        
        currentLine += linesPerPage
        
        // 如果还有更多内容，显示分页提示
        if (currentLine < lines.length) {
          const percentage = Math.round((currentLine / lines.length) * 100)
          output += `\n:${filename} (${percentage}%) [Press SPACE for next page, 'q' to quit, 'h' for help]`
          
          // 在实际的less命令中，这里会等待用户输入
          // 在模拟环境中，我们直接显示所有内容
          output += '\n[Simulated: Showing all content]\n'
        }
      }
      
      // 文件结束标记
      if (files.length > 1 && fileIndex < files.length - 1) {
        output += '\n(END of file - press SPACE for next file)\n'
      } else {
        output += '\n(END)\n'
      }
    }
    
    return output
  },
  description: 'View file contents page by page (enhanced)|分页查看文件内容（增强版）',
  category: 'text',
  supportsPipe: true,
  examples: [
    'less file.txt',
    'less -N file.txt',
    'less -S file.txt',
    'less -i file.txt',
    'less file1.txt file2.txt',
    'less --help'
  ],
  help: `Usage: less [options] [file...]|用法: less [选项] [文件...]

View file contents page by page with enhanced navigation.|分页查看文件内容，具有增强的导航功能。

Options|选项:
  -i, --ignore-case         ignore case in searches|搜索时忽略大小写
  -N, --LINE-NUMBERS        display line numbers|显示行号
  -S, --chop-long-lines     chop (truncate) long lines|截断长行
  -s, --squeeze-blank-lines squeeze multiple blank lines into one|将多个空行压缩为一行
  -r, --raw-control-chars   display raw control characters|显示原始控制字符
  -n, --lines=NUMBER        specify the number of lines per screenful|指定每屏的行数
      --help                display this help and exit|显示此帮助信息并退出

Interactive commands (in real less):|交互式命令（在真实的less中）：
  SPACE, f, ^F              forward one screen|向前一屏
  b, ^B                     backward one screen|向后一屏
  ENTER, e, ^E, j, ^N       forward one line|向前一行
  y, ^Y, k, ^K, ^P          backward one line|向后一行
  d, ^D                     forward half screen|向前半屏
  u, ^U                     backward half screen|向后半屏
  g, <, ESC-<               go to first line|跳到第一行
  G, >, ESC->               go to last line|跳到最后一行
  /pattern                  search forward for pattern|向前搜索模式
  ?pattern                  search backward for pattern|向后搜索模式
  n                         repeat previous search|重复上一次搜索
  N                         repeat previous search in reverse direction|反向重复上一次搜索
  q, :q, :Q, ZZ             quit|退出
  h, H                      display help|显示帮助
  =, ^G, :f                 show current file name and stats|显示当前文件名和统计信息

Note: This is a simulated version that displays all content.|注意：这是一个显示所有内容的模拟版本。
In a real terminal, less would provide interactive navigation.|在真实终端中，less会提供交互式导航。

Examples|示例:
  less file.txt              View file.txt page by page|分页查看file.txt
  less -N file.txt           View with line numbers|显示行号查看
  less -S file.txt           Chop long lines|截断长行
  less -i file.txt           Case-insensitive search|不区分大小写搜索
  less *.txt                 View all .txt files|查看所有.txt文件`
}