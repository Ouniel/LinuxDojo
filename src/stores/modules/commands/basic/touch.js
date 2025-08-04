/**
 * touch - 创建空文件或更新文件时间戳
 */

export const touch = {
  options: [
    {
      name: 'files',
      type: 'input',
      flag: 'files',
      inputKey: 'files',
      description: 'Files to create or update|要创建或更新的文件',
      placeholder: 'file1.txt file2.txt',
      required: true,
      group: 'target'
    },
    {
      name: '-c',
      flag: '-c',
      type: 'boolean',
      description: 'Do not create any files|不创建任何文件',
      group: 'options'
    },
    {
      name: '-a',
      flag: '-a',
      type: 'boolean',
      description: 'Change only the access time|仅更改访问时间',
      group: 'time'
    },
    {
      name: '-m',
      flag: '-m',
      type: 'boolean',
      description: 'Change only the modification time|仅更改修改时间',
      group: 'time'
    },
    {
      name: '-d',
      type: 'input',
      flag: '-d',
      inputKey: 'date_string',
      description: 'Parse STRING and use it instead of current time|解析字符串并使用它代替当前时间',
      placeholder: '2023-12-25 12:00:00',
      group: 'time'
    },
    {
      name: '-t',
      type: 'input',
      flag: '-t',
      inputKey: 'timestamp',
      description: 'Use timestamp format [[CC]YY]MMDDhhmm[.ss]|使用时间戳格式',
      placeholder: '202312251200',
      group: 'time'
    },
    {
      name: '-r',
      type: 'input',
      flag: '-r',
      inputKey: 'reference_file',
      description: 'Use this file\'s times instead of current time|使用此文件的时间代替当前时间',
      placeholder: 'reference_file.txt',
      group: 'time'
    }
  ],
  
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return touch.help
    }

    if (args.length === 0) {
      throw new Error('touch: missing file operand\nTry \'touch --help\' for more information.')
    }

    const noCreate = args.includes('-c') || args.includes('--no-create')
    const accessOnly = args.includes('-a')
    const modifyOnly = args.includes('-m')
    const reference = args.includes('-r') ? args[args.indexOf('-r') + 1] : null
    const dateString = args.includes('-d') ? args[args.indexOf('-d') + 1] : null
    const timeString = args.includes('-t') ? args[args.indexOf('-t') + 1] : null
    
    const files = args.filter(arg => 
      !arg.startsWith('-') && 
      arg !== reference && 
      arg !== dateString && 
      arg !== timeString
    )
    
    if (files.length === 0) {
      throw new Error('touch: missing file operand\nTry \'touch --help\' for more information.')
    }
    
    for (const filename of files) {
      // 如果文件存在，更新时间戳；如果不存在，创建空文件
      const exists = fs.getFileContent(filename) !== null
      if (exists) {
        // 更新时间戳（在模拟环境中简化处理）
        const content = fs.getFileContent(filename)
        fs.writeFile(filename, content)
      } else {
        if (!noCreate) {
          fs.createFile(filename, '')
        }
      }
    }
    
    return ''
  },
  description: 'Create empty files or update timestamps|创建空文件或更新文件时间戳',
  category: 'file',
  requiresArgs: true,
  examples: [
    'touch newfile.txt',
    'touch file1.txt file2.txt file3.txt',
    'touch -c existing_file.txt',
    'touch -a file.txt',
    'touch -m file.txt',
    'touch -t 202312251200 file.txt',
    'touch -d "2023-12-25 12:00:00" file.txt'
  ],
  help: `Usage: touch [OPTION]... FILE...|用法: touch [选项]... 文件...
Update the access and modification times of each FILE to the current time.|将每个文件的访问和修改时间更新为当前时间。

A FILE argument that does not exist is created empty, unless -c or -h|不存在的文件参数将创建为空文件，除非指定了-c或-h
is supplied.|选项。

Options|选项:
  -a                     change only the access time|仅更改访问时间
  -c, --no-create        do not create any files|不创建任何文件
  -d, --date=STRING      parse STRING and use it instead of current time|解析字符串并使用它代替当前时间
  -m                     change only the modification time|仅更改修改时间
  -r, --reference=FILE   use this file's times instead of current time|使用此文件的时间代替当前时间
  -t STAMP               use [[CC]YY]MMDDhhmm[.ss] instead of current time|使用指定格式的时间戳
      --help             display this help and exit|显示此帮助信息并退出
      --version          output version information and exit|输出版本信息并退出

Examples|示例:
  touch file.txt                    Create empty file or update timestamp|创建空文件或更新时间戳
  touch file1 file2 file3           Create/update multiple files|创建/更新多个文件
  touch -c file.txt                 Update timestamp only if file exists|仅在文件存在时更新时间戳
  touch -t 202312251200 file.txt    Set specific timestamp|设置特定时间戳`
}