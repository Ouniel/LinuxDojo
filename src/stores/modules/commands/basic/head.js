/**
 * head - 输出文件的前几行
 */

export const head = {
  name: 'head',
  description: 'Output the first part of files|输出文件的开头部分',
  
  options: [
    {
      name: '输出控制',
      type: 'group',
      options: [
        {
          name: '-n, --lines',
          type: 'input',
          description: '显示前N行（默认10行）',
          placeholder: '行数（如：5, 20）',
          defaultValue: '10',
          flag: '-n'
        },
        {
          name: '-c, --bytes',
          type: 'input',
          description: '显示前N个字节',
          placeholder: '字节数（如：100, 1K, 1M）',
          flag: '-c'
        }
      ]
    },
    {
      name: '显示选项',
      type: 'group',
      options: [
        {
          name: '-q, --quiet',
          type: 'checkbox',
          description: '静默模式（不显示文件名标题）',
          flag: '-q'
        },
        {
          name: '-v, --verbose',
          type: 'checkbox',
          description: '详细模式（总是显示文件名标题）',
          flag: '-v'
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
      return head.help
    }

    let lines = 10 // 默认显示10行
    let bytes = null
    let quiet = false
    let verbose = false
    const files = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-n' && i + 1 < args.length) {
        lines = parseInt(args[i + 1])
        i++ // 跳过下一个参数
      } else if (arg.startsWith('-n')) {
        lines = parseInt(arg.substring(2))
      } else if (arg === '-c' && i + 1 < args.length) {
        bytes = parseInt(args[i + 1])
        i++
      } else if (arg.startsWith('-c')) {
        bytes = parseInt(arg.substring(2))
      } else if (arg === '-q' || arg === '--quiet' || arg === '--silent') {
        quiet = true
      } else if (arg === '-v' || arg === '--verbose') {
        verbose = true
      } else if (arg.match(/^-\d+$/)) {
        lines = parseInt(arg.substring(1))
      } else if (!arg.startsWith('-')) {
        files.push(arg)
      }
    }
    
    // 如果没有指定文件，从标准输入读取
    if (files.length === 0) {
      return 'head: missing file operand\nTry \'head --help\' for more information.'
    }
    
    let output = ''
    const multipleFiles = files.length > 1
    
    for (let i = 0; i < files.length; i++) {
      const filename = files[i]
      const content = fs.getFileContent(filename)
      
      if (content === null) {
        output += `head: cannot open '${filename}' for reading: No such file or directory\n`
        continue
      }
      
      // 添加文件头（如果有多个文件或使用-v选项）
      if ((multipleFiles || verbose) && !quiet) {
        if (i > 0) output += '\n'
        output += `==> ${filename} <==\n`
      }
      
      let result = ''
      
      if (bytes !== null) {
        // 按字节数截取
        result = content.substring(0, bytes)
      } else {
        // 按行数截取
        const contentLines = content.split('\n')
        result = contentLines.slice(0, lines).join('\n')
        
        // 如果原内容以换行符结尾且我们截取了完整的行，保持换行符
        if (contentLines.length > lines && result.length > 0) {
          result += '\n'
        }
      }
      
      output += result
      
      // 在多文件情况下，除了最后一个文件，都添加换行符分隔
      if (multipleFiles && i < files.length - 1) {
        output += '\n'
      }
    }
    
    return output
  },
  description: 'Output the first part of files|输出文件的开头部分',
  category: 'text',
  supportsPipe: true,
  examples: [
    'head file.txt',
    'head -n 5 file.txt',
    'head -c 100 file.txt',
    'head -n 20 file1.txt file2.txt',
    'head --help'
  ],
  help: `Usage: head [OPTION]... [FILE]...|用法: head [选项]... [文件]...
Print the first 10 lines of each FILE to standard output.|将每个文件的前10行打印到标准输出。
With more than one FILE, precede each with a header giving the file name.|如果有多个文件，在每个文件前加上显示文件名的标题。

  -c, --bytes=[-]NUM       print the first NUM bytes of each file;|打印每个文件的前NUM个字节；
                             with the leading '-', print all but the last|如果前面有'-'，则打印除最后
                             NUM bytes of each file|NUM个字节之外的所有字节
  -n, --lines=[-]NUM       print the first NUM lines instead of the first 10;|打印前NUM行而不是前10行；
                             with the leading '-', print all but the last|如果前面有'-'，则打印除最后
                             NUM lines of each file|NUM行之外的所有行
  -q, --quiet, --silent    never print headers giving file names|从不打印显示文件名的标题
  -v, --verbose            always print headers giving file names|总是打印显示文件名的标题
      --help               display this help and exit|显示此帮助信息并退出

NUM may have a multiplier suffix:|NUM可以有乘数后缀：
b 512, kB 1000, K 1024, MB 1000*1000, M 1024*1024,|b 512, kB 1000, K 1024, MB 1000*1000, M 1024*1024,
GB 1000*1000*1000, G 1024*1024*1024, and so on for T, P, E, Z, Y.|GB 1000*1000*1000, G 1024*1024*1024，T、P、E、Z、Y等以此类推。

Examples|示例:
  head file.txt             Show first 10 lines of file.txt|显示file.txt的前10行
  head -n 5 file.txt        Show first 5 lines|显示前5行
  head -c 100 file.txt      Show first 100 bytes|显示前100个字节
  head -n 20 *.txt          Show first 20 lines of all .txt files|显示所有.txt文件的前20行`
}