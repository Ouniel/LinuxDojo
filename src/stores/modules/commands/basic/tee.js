/**
 * tee - 读取标准输入并写入标准输出和文件
 */

export const tee = {
  options: [
    {
      flag: '-a',
      longFlag: '--append',
      description: 'Append to the given FILEs, do not overwrite|追加到给定的文件，不覆盖',
      type: 'boolean'
    },
    {
      flag: '-i',
      longFlag: '--ignore-interrupts',
      description: 'Ignore interrupt signals|忽略中断信号',
      type: 'boolean'
    },
    {
      flag: '-p',
      description: 'Diagnose errors writing to non pipes|诊断写入非管道的错误',
      type: 'boolean'
    },
    {
      flag: '--output-error',
      description: 'Set behavior on write error|设置写入错误时的行为',
      type: 'select',
      options: ['warn', 'warn-nopipe', 'exit', 'exit-nopipe']
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return tee.help
    }

    let append = args.includes('-a') || args.includes('--append')
    let ignoreInterrupts = args.includes('-i') || args.includes('--ignore-interrupts')
    
    // 过滤出文件名
    const files = args.filter(arg => !arg.startsWith('-'))
    
    // 模拟从标准输入读取的内容
    const input = context.input || 'Sample input for tee command demonstration.\nThis is line 2.\nThis is line 3.'
    
    // 写入文件
    for (const filename of files) {
      try {
        if (append) {
          // 追加模式
          const existingContent = fs.getFileContent(filename) || ''
          fs.writeFile(filename, existingContent + input)
        } else {
          // 覆盖模式
          fs.writeFile(filename, input)
        }
      } catch (error) {
        return `tee: ${filename}: Permission denied`
      }
    }
    
    // 返回输入内容（写入标准输出）
    return input
  },
  description: 'Read from standard input and write to standard output and files|从标准输入读取并写入标准输出和文件',
  category: 'basic',
  supportsPipe: true,
  examples: [
    'echo "hello" | tee file.txt',
    'ls | tee -a output.txt',
    'cat file1.txt | tee file2.txt file3.txt',
    'tee --help'
  ],
  help: `Usage: tee [OPTION]... [FILE]...|用法: tee [选项]... [文件]...
Copy standard input to each FILE, and also to standard output.|将标准输入复制到每个文件，同时也复制到标准输出。

  -a, --append              append to the given FILEs, do not overwrite|追加到给定的文件，不覆盖
  -i, --ignore-interrupts   ignore interrupt signals|忽略中断信号
  -p                        diagnose errors writing to non pipes|诊断写入非管道的错误
      --output-error[=MODE] set behavior on write error.  See MODE below|设置写入错误时的行为。见下面的MODE
      --help                display this help and exit|显示此帮助信息并退出
      --version             output version information and exit|输出版本信息并退出

MODE determines behavior with write errors on the outputs:|MODE确定输出写入错误时的行为：
  'warn'         diagnose errors writing to any output|诊断写入任何输出的错误
  'warn-nopipe'  diagnose errors writing to any output not a pipe|诊断写入任何非管道输出的错误
  'exit'         exit on error writing to any output|写入任何输出出错时退出
  'exit-nopipe'  exit on error writing to any output not a pipe|写入任何非管道输出出错时退出

The default MODE for the -p option is 'warn-nopipe'.|选项-p的默认MODE是'warn-nopipe'。
The default operation when --output-error is not specified, is to|未指定--output-error时的默认操作是
exit immediately on error writing to a pipe, and diagnose errors|在写入管道出错时立即退出，并诊断
writing to non pipe outputs.|写入非管道输出的错误。

Examples|示例:
  echo "hello" | tee file.txt           Write to file and stdout|写入文件和标准输出
  ls | tee -a output.txt                Append ls output to file|将ls输出追加到文件
  cat input.txt | tee file1.txt file2.txt  Copy to multiple files|复制到多个文件
  ps aux | tee processes.txt            Save process list to file|将进程列表保存到文件

Note: In this simulated environment, tee writes to the virtual filesystem.|注意：在此模拟环境中，tee写入虚拟文件系统。`
}