/**
 * tail - 输出文件的最后几行
 */

export const tail = {
  name: 'tail',
  description: 'Output the last part of files|输出文件的末尾部分',
  
  options: [
    {
      name: '输出控制',
      type: 'group',
      options: [
        {
          name: '-n, --lines',
          type: 'input',
          description: '显示最后N行（默认10行）',
          placeholder: '行数（如：5, 20, +10）',
          defaultValue: '10',
          flag: '-n'
        },
        {
          name: '-c, --bytes',
          type: 'input',
          description: '显示最后N个字节',
          placeholder: '字节数（如：100, 1K, 1M）',
          flag: '-c'
        }
      ]
    },
    {
      name: '跟踪选项',
      type: 'group',
      options: [
        {
          name: '-f, --follow',
          type: 'checkbox',
          description: '跟踪文件增长（实时显示新增内容）',
          flag: '-f'
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
      return tail.help
    }

    let lines = 10 // 默认显示10行
    let bytes = null
    let quiet = false
    let verbose = false
    let follow = false
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
      } else if (arg === '-f' || arg === '--follow') {
        follow = true
      } else if (arg.match(/^-\d+$/)) {
        lines = parseInt(arg.substring(1))
      } else if (!arg.startsWith('-')) {
        files.push(arg)
      }
    }
    
    // 如果没有指定文件，从标准输入读取
    if (files.length === 0) {
      return 'tail: missing file operand\nTry \'tail --help\' for more information.'
    }
    
    let output = ''
    const multipleFiles = files.length > 1
    
    for (let i = 0; i < files.length; i++) {
      const filename = files[i]
      const content = fs.getFileContent(filename)
      
      if (content === null) {
        output += `tail: cannot open '${filename}' for reading: No such file or directory\n`
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
        if (bytes > content.length) {
          result = content
        } else {
          result = content.substring(content.length - bytes)
        }
      } else {
        // 按行数截取
        const contentLines = content.split('\n')
        
        // 如果内容以换行符结尾，移除最后的空行
        if (contentLines[contentLines.length - 1] === '') {
          contentLines.pop()
        }
        
        if (lines >= contentLines.length) {
          result = contentLines.join('\n')
        } else {
          result = contentLines.slice(-lines).join('\n')
        }
        
        // 如果原内容不为空，确保结果有适当的换行符
        if (result.length > 0 && content.endsWith('\n')) {
          result += '\n'
        }
      }
      
      output += result
      
      // 在多文件情况下，除了最后一个文件，都添加换行符分隔
      if (multipleFiles && i < files.length - 1) {
        output += '\n'
      }
    }
    
    // 如果使用了-f选项，添加提示信息
    if (follow) {
      output += '\n[Note: -f (follow) option is simulated - file monitoring not available in this environment]'
    }
    
    return output
  },
  description: 'Output the last part of files|输出文件的末尾部分',
  category: 'text',
  supportsPipe: true,
  examples: [
    'tail file.txt',
    'tail -n 5 file.txt',
    'tail -c 100 file.txt',
    'tail -f logfile.txt',
    'tail -n 20 file1.txt file2.txt',
    'tail --help'
  ],
  help: `Usage: tail [OPTION]... [FILE]...|用法: tail [选项]... [文件]...
Print the last 10 lines of each FILE to standard output.|将每个文件的最后10行打印到标准输出。
With more than one FILE, precede each with a header giving the file name.|如果有多个文件，在每个文件前加上显示文件名的标题。

  -c, --bytes=[+]NUM       output the last NUM bytes; or use -c +NUM to|输出最后NUM个字节；或使用-c +NUM
                             output starting with byte NUM of each file|从每个文件的第NUM个字节开始输出
  -f, --follow[={name|descriptor}]|跟踪文件增长
                           output appended data as the file grows;|当文件增长时输出追加的数据；
                             an absent option argument means 'descriptor'|缺少选项参数意味着'descriptor'
  -n, --lines=[+]NUM       output the last NUM lines, instead of the last 10;|输出最后NUM行，而不是最后10行；
                             or use -n +NUM to output starting with line NUM|或使用-n +NUM从第NUM行开始输出
  -q, --quiet, --silent    never output headers giving file names|从不输出显示文件名的标题
  -v, --verbose            always output headers giving file names|总是输出显示文件名的标题
      --help               display this help and exit|显示此帮助信息并退出

NUM may have a multiplier suffix:|NUM可以有乘数后缀：
b 512, kB 1000, K 1024, MB 1000*1000, M 1024*1024,|b 512, kB 1000, K 1024, MB 1000*1000, M 1024*1024,
GB 1000*1000*1000, G 1024*1024*1024, and so on for T, P, E, Z, Y.|GB 1000*1000*1000, G 1024*1024*1024，T、P、E、Z、Y等以此类推。

Examples|示例:
  tail file.txt             Show last 10 lines of file.txt|显示file.txt的最后10行
  tail -n 5 file.txt        Show last 5 lines|显示最后5行
  tail -c 100 file.txt      Show last 100 bytes|显示最后100个字节
  tail -f logfile.txt       Follow file growth (simulated)|跟踪文件增长（模拟）
  tail -n 20 *.txt          Show last 20 lines of all .txt files|显示所有.txt文件的最后20行`
}