/**
 * cat - 显示文件内容
 */

export const cat = {
  options: [
    {
      name: 'files',
      type: 'input',
      flag: 'files',
      inputKey: 'files',
      description: 'Files to display|要显示的文件',
      placeholder: 'file1.txt file2.txt',
      required: false,
      group: 'input'
    },
    {
      name: '-n',
      flag: '-n',
      type: 'boolean',
      description: 'Number all output lines|为所有输出行编号',
      group: 'format'
    },
    {
      name: '-E',
      flag: '-E',
      type: 'boolean',
      description: 'Display $ at end of each line|在每行末尾显示 $',
      group: 'format'
    },
    {
      name: '-T',
      flag: '-T',
      type: 'boolean',
      description: 'Display TAB characters as ^I|将TAB字符显示为 ^I',
      group: 'format'
    },
    {
      name: '-A',
      flag: '-A',
      type: 'boolean',
      description: 'Show all non-printing characters (equivalent to -vET)|显示所有非打印字符（等同于 -vET）',
      group: 'format'
    }
  ],
  
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return cat.help
    }

    // 如果没有参数且没有stdin，从stdin读取（模拟交互模式）
    if (args.length === 0 && !context.stdin) {
      return 'cat: reading from stdin (press Ctrl+C to exit)'
    }

    if (context.stdin) {
      return context.stdin
    }

    const results = []
    const showLineNumbers = args.includes('-n')
    const showEnds = args.includes('-E')
    const showTabs = args.includes('-T')
    const showAll = args.includes('-A')
    
    const files = args.filter(arg => !arg.startsWith('-'))
    
    for (const filename of files) {
      const content = fs.getFileContent(filename)
      if (content === null) {
        throw new Error(`cat: ${filename}: No such file or directory`)
      }
      
      let processedContent = content
      
      if (showTabs || showAll) {
        processedContent = processedContent.replace(/\t/g, '^I')
      }
      
      if (showEnds || showAll) {
        processedContent = processedContent.replace(/$/gm, '$')
      }
      
      if (showLineNumbers) {
        const lines = processedContent.split('\n')
        processedContent = lines.map((line, index) => 
          `${(index + 1).toString().padStart(6)}  ${line}`
        ).join('\n')
      }
      
      results.push(processedContent)
    }
    
    return results.join('')
  },
  description: 'Display file contents|显示文件内容',
  category: 'file',
  supportsPipe: true,
  supportsRedirect: true,
  examples: [
    'cat file.txt',
    'cat file1.txt file2.txt',
    'cat -n file.txt',
    'cat -E file.txt',
    'cat -T file.txt',
    'cat -A file.txt'
  ],
  help: `Usage: cat [OPTION]... [FILE]...|用法: cat [选项]... [文件]...
Concatenate FILE(s) to standard output.|将文件连接到标准输出。

  -A, --show-all           equivalent to -vET|等同于 -vET
  -E, --show-ends          display $ at end of each line|在每行末尾显示 $
  -n, --number             number all output lines|为所有输出行编号
  -T, --show-tabs          display TAB characters as ^I|将TAB字符显示为 ^I
      --help               display this help and exit|显示此帮助信息并退出

With no FILE, or when FILE is -, read standard input.|没有文件或文件为 - 时，读取标准输入。

Examples|示例:
  cat f - g    Output f's contents, then standard input, then g's contents.|输出f的内容，然后是标准输入，再然后是g的内容。
  cat          Copy standard input to standard output.|将标准输入复制到标准输出。`
}