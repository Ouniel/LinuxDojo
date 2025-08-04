export const comm = {
  name: 'comm',
  description: 'Compare two sorted files line by line|逐行比较两个已排序的文件',
  
  options: [
    {
      name: '列控制',
      type: 'group',
      options: [
        {
          name: '-1',
          type: 'checkbox',
          description: '不显示第1列（仅在文件1中的行）',
          flag: '-1'
        },
        {
          name: '-2',
          type: 'checkbox',
          description: '不显示第2列（仅在文件2中的行）',
          flag: '-2'
        },
        {
          name: '-3',
          type: 'checkbox',
          description: '不显示第3列（两文件共有的行）',
          flag: '-3'
        },
        {
          name: '-12',
          type: 'checkbox',
          description: '不显示第1和第2列',
          flag: '-12'
        },
        {
          name: '-13',
          type: 'checkbox',
          description: '不显示第1和第3列',
          flag: '-13'
        },
        {
          name: '-23',
          type: 'checkbox',
          description: '不显示第2和第3列',
          flag: '-23'
        },
        {
          name: '-123',
          type: 'checkbox',
          description: '不显示所有列',
          flag: '-123'
        }
      ]
    },
    {
      name: '格式选项',
      type: 'group',
      options: [
        {
          name: '--output-delimiter',
          type: 'input',
          description: '指定输出分隔符',
          placeholder: '分隔符（默认为制表符）',
          defaultValue: '\t',
          flag: '--output-delimiter'
        }
      ]
    },
    {
      name: '文件1',
      type: 'input',
      description: '第一个已排序的文件',
      placeholder: '文件1路径',
      position: 'arg'
    },
    {
      name: '文件2',
      type: 'input',
      description: '第二个已排序的文件',
      placeholder: '文件2路径',
      position: 'end'
    }
  ],
  
  handler: (args, context, fs) => {
    if (args.includes('--help')) {
      return comm.help
    }

    if (args.length === 0) {
      return 'comm: exactly two file arguments required\nUsage: comm [OPTIONS] FILE1 FILE2'
    }
    
    const options = {
      suppress1: false,  // 不显示仅在文件1中的行
      suppress2: false,  // 不显示仅在文件2中的行
      suppress3: false,  // 不显示两个文件共有的行
      outputDelimiter: '\t'
    }
    
    const files = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-1') {
        options.suppress1 = true
      } else if (arg === '-2') {
        options.suppress2 = true
      } else if (arg === '-3') {
        options.suppress3 = true
      } else if (arg === '-12') {
        options.suppress1 = true
        options.suppress2 = true
      } else if (arg === '-13') {
        options.suppress1 = true
        options.suppress3 = true
      } else if (arg === '-23') {
        options.suppress2 = true
        options.suppress3 = true
      } else if (arg === '-123') {
        options.suppress1 = true
        options.suppress2 = true
        options.suppress3 = true
      } else if (arg === '--output-delimiter') {
        if (i + 1 < args.length) {
          options.outputDelimiter = args[++i]
        }
      } else if (arg.startsWith('--output-delimiter=')) {
        options.outputDelimiter = arg.substring('--output-delimiter='.length)
      } else if (arg.startsWith('-')) {
        return `comm: invalid option: ${arg}`
      } else {
        files.push(arg)
      }
    }
    
    if (files.length !== 2) {
      return 'comm: exactly two file arguments required\nUsage: comm [OPTIONS] FILE1 FILE2'
    }
    
    const [file1, file2] = files
    
    // 模拟文件内容
    const content1 = getMockFileContent(file1)
    const content2 = getMockFileContent(file2)
    
    if (!content1) {
      return `comm: ${file1}: No such file or directory`
    }
    if (!content2) {
      return `comm: ${file2}: No such file or directory`
    }
    
    const lines1 = content1.split('\n').filter(line => line.trim() !== '')
    const lines2 = content2.split('\n').filter(line => line.trim() !== '')
    
    const results = []
    let i = 0, j = 0
    
    // 比较两个文件的行
    while (i < lines1.length || j < lines2.length) {
      const line1 = i < lines1.length ? lines1[i] : null
      const line2 = j < lines2.length ? lines2[j] : null
      
      if (line1 === null) {
        // 文件1已结束，剩余的都是文件2独有的
        if (!options.suppress2) {
          const prefix = options.suppress1 ? '' : options.outputDelimiter
          results.push(prefix + line2)
        }
        j++
      } else if (line2 === null) {
        // 文件2已结束，剩余的都是文件1独有的
        if (!options.suppress1) {
          results.push(line1)
        }
        i++
      } else if (line1 < line2) {
        // 文件1的行小于文件2的行，文件1独有
        if (!options.suppress1) {
          results.push(line1)
        }
        i++
      } else if (line1 > line2) {
        // 文件1的行大于文件2的行，文件2独有
        if (!options.suppress2) {
          const prefix = options.suppress1 ? '' : options.outputDelimiter
          results.push(prefix + line2)
        }
        j++
      } else {
        // 两行相等，共有行
        if (!options.suppress3) {
          let prefix = ''
          if (!options.suppress1) prefix += options.outputDelimiter
          if (!options.suppress2) prefix += options.outputDelimiter
          results.push(prefix + line1)
        }
        i++
        j++
      }
    }
    
    return results.join('\n')
  },

  category: 'text',
  requiresArgs: true,
  examples: [
    'comm file1.txt file2.txt',
    'comm -12 file1.txt file2.txt',
    'comm -3 file1.txt file2.txt',
    'comm -1 sorted1.txt sorted2.txt',
    'comm --output-delimiter="," file1.txt file2.txt'
  ],
  help: `Usage: comm [OPTIONS] FILE1 FILE2

Compare two sorted files line by line.

Options:
  -1                    Suppress column 1 (lines unique to FILE1)
  -2                    Suppress column 2 (lines unique to FILE2)
  -3                    Suppress column 3 (lines common to both)
  -12                   Suppress columns 1 and 2
  -13                   Suppress columns 1 and 3
  -23                   Suppress columns 2 and 3
  -123                  Suppress all columns
  --output-delimiter=STR Use STR as delimiter

Output has 3 columns:
  Column 1: lines unique to FILE1
  Column 2: lines unique to FILE2
  Column 3: lines common to both files

Note: Files must be sorted before using comm.

Examples:
  comm file1.txt file2.txt              Compare two files
  comm -12 file1.txt file2.txt          Only show common lines
  comm -3 file1.txt file2.txt           Show different lines
  comm -1 sorted1.txt sorted2.txt       Show file2 unique and common lines
  comm --output-delimiter="," file1.txt file2.txt  Use comma as delimiter`
}

function getMockFileContent(filename) {
  // 模拟已排序的文件内容
  const mockFiles = {
    'file1.txt': `apple
banana
cherry
grape
orange`,
    
    'file2.txt': `banana
cherry
date
elderberry
grape`,
    
    'sorted1.txt': `alpha
beta
gamma
theta
zeta`,
    
    'sorted2.txt': `beta
delta
gamma
lambda
zeta`,
    
    'list1.txt': `item1
item2
item3
item5`,
    
    'list2.txt': `item2
item3
item4
item5`
  }
  
  return mockFiles[filename] || mockFiles['file1.txt']
}