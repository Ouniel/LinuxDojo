/**
 * diff - 比较文件差异
 */

export const diff = {
  name: 'diff',
  description: 'Compare files line by line|逐行比较文件',
  usage: 'diff [OPTION]... FILES',
  category: 'text',
  
  options: [
    // 输出格式组
    {
      flag: '-u',
      longFlag: '--unified',
      description: '统一格式输出（显示上下文）',
      type: 'boolean',
      group: '输出格式'
    },
    {
      flag: '-c',
      longFlag: '--context',
      description: '上下文格式输出',
      type: 'boolean',
      group: '输出格式'
    },
    {
      flag: '-y',
      longFlag: '--side-by-side',
      description: '并排格式输出',
      type: 'boolean',
      group: '输出格式'
    },
    {
      flag: '-q',
      longFlag: '--brief',
      description: '仅报告文件是否不同',
      type: 'boolean',
      group: '输出格式'
    },
    {
      flag: '-s',
      longFlag: '--report-identical-files',
      description: '报告两个文件相同时',
      type: 'boolean',
      group: '输出格式'
    },
    
    // 比较选项组
    {
      flag: '-i',
      longFlag: '--ignore-case',
      description: '忽略大小写差异',
      type: 'boolean',
      group: '比较选项'
    },
    {
      flag: '-w',
      longFlag: '--ignore-all-space',
      description: '忽略所有空白字符',
      type: 'boolean',
      group: '比较选项'
    },
    {
      flag: '-b',
      longFlag: '--ignore-space-change',
      description: '忽略空白数量的更改',
      type: 'boolean',
      group: '比较选项'
    },
    {
      flag: '-B',
      longFlag: '--ignore-blank-lines',
      description: '忽略空白行的变化',
      type: 'boolean',
      group: '比较选项'
    },
    {
      flag: '-E',
      longFlag: '--ignore-tab-expansion',
      description: '忽略制表符展开引起的更改',
      type: 'boolean',
      group: '比较选项'
    },
    {
      flag: '-Z',
      longFlag: '--ignore-trailing-space',
      description: '忽略行尾的空白',
      type: 'boolean',
      group: '比较选项'
    },
    
    // 目录选项组
    {
      flag: '-r',
      longFlag: '--recursive',
      description: '递归比较子目录',
      type: 'boolean',
      group: '目录选项'
    },
    {
      flag: '-N',
      longFlag: '--new-file',
      description: '将缺失的文件视为空文件',
      type: 'boolean',
      group: '目录选项'
    },
    {
      longFlag: '--exclude',
      description: '排除匹配模式的文件',
      type: 'input',
      inputKey: 'exclude_pattern',
      placeholder: '排除模式（如：*.tmp, *.log）',
      group: '目录选项'
    },
    
    // 输出控制组
    {
      flag: '-t',
      longFlag: '--expand-tabs',
      description: '在输出中将制表符展开为空格',
      type: 'boolean',
      group: '输出控制'
    },
    {
      flag: '-T',
      longFlag: '--initial-tab',
      description: '通过前置制表符使制表符对齐',
      type: 'boolean',
      group: '输出控制'
    },
    {
      longFlag: '--width',
      description: '输出列数（默认130）',
      type: 'input',
      inputKey: 'width',
      placeholder: '列数（如：80, 120）',
      group: '输出控制'
    },
    
    // 输入参数
    {
      inputKey: 'file1',
      description: '第一个要比较的文件',
      type: 'input',
      placeholder: '文件1路径'
    },
    {
      inputKey: 'file2',
      description: '第二个要比较的文件',
      type: 'input',
      placeholder: '文件2路径'
    }
  ],

  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return diff.help
    }

    if (args.length < 2) {
      throw new Error('diff: missing operand after \'diff\'|缺少 \'diff\' 后的操作数\ndiff: Try \'diff --help\' for more information.|尝试 \'diff --help\' 获取更多信息')
    }

    let unified = args.includes('-u') || args.includes('--unified')
    let contextFormat = args.includes('-c') || args.includes('--context')
    let brief = args.includes('-q') || args.includes('--brief')
    let reportIdentical = args.includes('-s') || args.includes('--report-identical-files')
    let ignoreCase = args.includes('-i') || args.includes('--ignore-case')
    let ignoreAllSpace = args.includes('-w') || args.includes('--ignore-all-space')
    let ignoreSpaceChange = args.includes('-b') || args.includes('--ignore-space-change')
    let ignoreBlankLines = args.includes('-B') || args.includes('--ignore-blank-lines')
    let ignoreTabExpansion = args.includes('-E') || args.includes('--ignore-tab-expansion')
    let ignoreTrailingSpace = args.includes('-Z') || args.includes('--ignore-trailing-space')
    let recursive = args.includes('-r') || args.includes('--recursive')
    let newFile = args.includes('-N') || args.includes('--new-file')
    let showSideBySide = args.includes('-y') || args.includes('--side-by-side')
    let expandTabs = args.includes('-t') || args.includes('--expand-tabs')
    let initialTab = args.includes('-T') || args.includes('--initial-tab')
    
    // 获取选项值
    const excludePattern = getOptionValue(args, '--exclude')
    const width = getOptionValue(args, '--width') || 130
    
    // 过滤出文件名
    const files = args.filter(arg => 
      !arg.startsWith('-') && 
      !isOptionValue(arg, args)
    )
    
    if (files.length < 2) {
      throw new Error('diff: missing operand|缺少操作数\nTry \'diff --help\' for more information.|尝试 \'diff --help\' 获取更多信息')
    }

    const file1 = files[0]
    const file2 = files[1]
    
    let content1, content2
    
    if (file1 === '-') {
      content1 = context.stdin || 'Line 1 from stdin\nLine 2 from stdin\nLine 3 from stdin'
    } else {
      content1 = fs.getFileContent(file1)
      if (content1 === null) {
        if (newFile) {
          content1 = ''
        } else {
          throw new Error(`diff: ${file1}: No such file or directory|文件或目录不存在`)
        }
      }
    }
    
    if (file2 === '-') {
      content2 = context.stdin || 'Line 1 from stdin\nLine 2 modified\nLine 3 from stdin\nLine 4 added'
    } else {
      content2 = fs.getFileContent(file2)
      if (content2 === null) {
        if (newFile) {
          content2 = ''
        } else {
          throw new Error(`diff: ${file2}: No such file or directory|文件或目录不存在`)
        }
      }
    }
    
    // 如果文件相同
    if (content1 === content2) {
      if (reportIdentical) {
        return `Files ${file1} and ${file2} are identical|文件 ${file1} 和 ${file2} 相同`
      }
      return ''
    }
    
    if (brief) {
      return `Files ${file1} and ${file2} differ|文件 ${file1} 和 ${file2} 不同`
    }
    
    const lines1 = content1.split('\n')
    const lines2 = content2.split('\n')
    
    // 预处理行（根据选项）
    const processLine = (line) => {
      let processed = line
      
      if (ignoreCase) {
        processed = processed.toLowerCase()
      }
      
      if (ignoreAllSpace) {
        processed = processed.replace(/\s+/g, '')
      } else if (ignoreSpaceChange) {
        processed = processed.replace(/\s+/g, ' ').trim()
      }
      
      if (ignoreTrailingSpace) {
        processed = processed.replace(/\s+$/, '')
      }
      
      if (ignoreTabExpansion) {
        processed = processed.replace(/\t/g, '        ') // 8 spaces
      }
      
      if (expandTabs) {
        processed = processed.replace(/\t/g, '        ') // 8 spaces
      }
      
      return processed
    }
    
    const processedLines1 = lines1.map(processLine)
    const processedLines2 = lines2.map(processLine)
    
    // 如果忽略空白行，过滤掉空白行
    let filteredLines1 = lines1
    let filteredLines2 = lines2
    let filteredProcessed1 = processedLines1
    let filteredProcessed2 = processedLines2
    
    if (ignoreBlankLines) {
      const nonBlankIndices1 = []
      const nonBlankIndices2 = []
      
      filteredLines1 = lines1.filter((line, i) => {
        if (line.trim() !== '') {
          nonBlankIndices1.push(i)
          return true
        }
        return false
      })
      
      filteredLines2 = lines2.filter((line, i) => {
        if (line.trim() !== '') {
          nonBlankIndices2.push(i)
          return true
        }
        return false
      })
      
      filteredProcessed1 = nonBlankIndices1.map(i => processedLines1[i])
      filteredProcessed2 = nonBlankIndices2.map(i => processedLines2[i])
    }
    
    if (unified) {
      return generateUnifiedDiff(file1, file2, filteredLines1, filteredLines2, filteredProcessed1, filteredProcessed2)
    } else if (contextFormat) {
      return generateContextDiff(file1, file2, filteredLines1, filteredLines2, filteredProcessed1, filteredProcessed2)
    } else if (showSideBySide) {
      return generateSideBySideDiff(file1, file2, filteredLines1, filteredLines2, filteredProcessed1, filteredProcessed2, parseInt(width))
    } else {
      return generateNormalDiff(file1, file2, filteredLines1, filteredLines2, filteredProcessed1, filteredProcessed2)
    }
  },
  requiresArgs: false,
  examples: [
    'diff file1.txt file2.txt        # Compare two files|比较两个文件',
    'diff -u file1.txt file2.txt     # Unified diff format|统一diff格式',
    'diff -c file1.txt file2.txt     # Context diff format|上下文diff格式',
    'diff -q file1.txt file2.txt     # Brief comparison|简要比较',
    'diff -i file1.txt file2.txt     # Ignore case differences|忽略大小写差异',
    'diff -w file1.txt file2.txt     # Ignore all whitespace|忽略所有空白',
    'diff -B file1.txt file2.txt     # Ignore blank lines|忽略空白行',
    'diff -y file1.txt file2.txt     # Side-by-side format|并排格式'
  ],
  help: `Usage: diff [OPTION]... FILES
用法: diff [选项]... 文件

Compare FILES line by line.
逐行比较文件。

Output format options|输出格式选项:
  -u, --unified             output unified diff format|输出统一diff格式
  -c, --context             output context diff format|输出上下文diff格式
  -y, --side-by-side        output in two columns|以两列输出
  -q, --brief               report only when files differ|仅在文件不同时报告
  -s, --report-identical-files  report when two files are the same|报告两个文件相同时

Comparison options|比较选项:
  -i, --ignore-case         ignore case differences|忽略大小写差异
  -w, --ignore-all-space    ignore all white space|忽略所有空白
  -b, --ignore-space-change ignore changes in the amount of white space|忽略空白数量的更改
  -B, --ignore-blank-lines  ignore changes where lines are all blank|忽略所有行都为空白的更改
  -E, --ignore-tab-expansion ignore changes due to tab expansion|忽略制表符展开引起的更改
  -Z, --ignore-trailing-space ignore white space at line end|忽略行尾的空白

Directory options|目录选项:
  -r, --recursive           recursively compare any subdirectories found|递归比较找到的任何子目录
  -N, --new-file            treat absent files as empty|将缺失的文件视为空文件
      --exclude=PAT         exclude files that match PAT|排除匹配PAT的文件

Output control|输出控制:
  -t, --expand-tabs         expand tabs to spaces in output|在输出中将制表符展开为空格
  -T, --initial-tab         make tabs line up by prepending a tab|通过前置制表符使制表符对齐
      --width=NUM           output at most NUM (default 130) print columns|最多输出NUM列
      --help                display this help and exit|显示此帮助信息并退出

Examples|示例:
  diff file1.txt file2.txt        Compare two files|比较两个文件
  diff -u file1.txt file2.txt     Unified diff format|统一diff格式
  diff -c file1.txt file2.txt     Context diff format|上下文diff格式
  diff -q file1.txt file2.txt     Brief comparison|简要比较
  diff -i file1.txt file2.txt     Ignore case differences|忽略大小写差异
  diff -w file1.txt file2.txt     Ignore all whitespace|忽略所有空白
  diff -B file1.txt file2.txt     Ignore blank lines|忽略空白行
  diff -y file1.txt file2.txt     Side-by-side format|并排格式`
}

// 生成统一格式diff
function generateUnifiedDiff(file1, file2, lines1, lines2, processedLines1, processedLines2) {
  const diffs = computeDiff(processedLines1, processedLines2)
  let output = `--- ${file1}\n+++ ${file2}\n`
  
  let line1 = 0, line2 = 0
  
  for (const diff of diffs) {
    if (diff.type === 'equal') {
      line1 += diff.count1 || 0
      line2 += diff.count2 || 0
      continue
    }
    
    // 输出hunk头
    const start1 = line1 + 1
    const start2 = line2 + 1
    const count1 = diff.count1 || 0
    const count2 = diff.count2 || 0
    
    output += `@@ -${start1},${count1} +${start2},${count2} @@\n`
    
    if (diff.type === 'delete') {
      for (const line of diff.lines1 || []) {
        output += `-${line}\n`
      }
      line1 += count1
    } else if (diff.type === 'insert') {
      for (const line of diff.lines2 || []) {
        output += `+${line}\n`
      }
      line2 += count2
    } else if (diff.type === 'change') {
      for (const line of diff.lines1 || []) {
        output += `-${line}\n`
      }
      for (const line of diff.lines2 || []) {
        output += `+${line}\n`
      }
      line1 += count1
      line2 += count2
    }
  }
  
  return output.trim()
}

// 生成上下文格式diff
function generateContextDiff(file1, file2, lines1, lines2, processedLines1, processedLines2) {
  let output = `*** ${file1}\n--- ${file2}\n`
  
  const diffs = computeDiff(processedLines1, processedLines2)
  
  for (const diff of diffs) {
    if (diff.type === 'delete') {
      output += `***************\n`
      output += `*** ${diff.start1 + 1},${diff.start1 + (diff.count1 || 0)} ****\n`
      for (const line of diff.lines1 || []) {
        output += `- ${line}\n`
      }
    } else if (diff.type === 'insert') {
      output += `***************\n`
      output += `--- ${diff.start2 + 1},${diff.start2 + (diff.count2 || 0)} ----\n`
      for (const line of diff.lines2 || []) {
        output += `+ ${line}\n`
      }
    } else if (diff.type === 'change') {
      output += `***************\n`
      output += `*** ${diff.start1 + 1},${diff.start1 + (diff.count1 || 0)} ****\n`
      for (const line of diff.lines1 || []) {
        output += `! ${line}\n`
      }
      output += `--- ${diff.start2 + 1},${diff.start2 + (diff.count2 || 0)} ----\n`
      for (const line of diff.lines2 || []) {
        output += `! ${line}\n`
      }
    }
  }
  
  return output.trim()
}

// 生成并排格式diff
function generateSideBySideDiff(file1, file2, lines1, lines2, processedLines1, processedLines2, width = 130) {
  let output = ''
  const colWidth = Math.floor((width - 3) / 2) // 3 for separator
  const maxLen = Math.max(lines1.length, lines2.length)
  
  for (let i = 0; i < maxLen; i++) {
    const line1 = lines1[i] || ''
    const line2 = lines2[i] || ''
    const processed1 = processedLines1[i] || ''
    const processed2 = processedLines2[i] || ''
    
    const truncated1 = line1.length > colWidth ? line1.substring(0, colWidth - 3) + '...' : line1
    const truncated2 = line2.length > colWidth ? line2.substring(0, colWidth - 3) + '...' : line2
    
    if (processed1 === processed2) {
      output += `${truncated1.padEnd(colWidth)} | ${truncated2}\n`
    } else if (line1 === '') {
      output += `${' '.repeat(colWidth)} > ${truncated2}\n`
    } else if (line2 === '') {
      output += `${truncated1.padEnd(colWidth)} <\n`
    } else {
      output += `${truncated1.padEnd(colWidth)} | ${truncated2}\n`
    }
  }
  
  return output.trim()
}

// 生成普通格式diff
function generateNormalDiff(file1, file2, lines1, lines2, processedLines1, processedLines2) {
  const diffs = computeDiff(processedLines1, processedLines2)
  let output = ''
  
  for (const diff of diffs) {
    if (diff.type === 'delete') {
      const start = diff.start1 + 1
      const end = diff.start1 + (diff.count1 || 0)
      output += `${start}${end > start ? ',' + end : ''}d${diff.start2}\n`
      for (const line of diff.lines1 || []) {
        output += `< ${line}\n`
      }
    } else if (diff.type === 'insert') {
      const start = diff.start2 + 1
      const end = diff.start2 + (diff.count2 || 0)
      output += `${diff.start1}a${start}${end > start ? ',' + end : ''}\n`
      for (const line of diff.lines2 || []) {
        output += `> ${line}\n`
      }
    } else if (diff.type === 'change') {
      const start1 = diff.start1 + 1
      const end1 = diff.start1 + (diff.count1 || 0)
      const start2 = diff.start2 + 1
      const end2 = diff.start2 + (diff.count2 || 0)
      output += `${start1}${end1 > start1 ? ',' + end1 : ''}c${start2}${end2 > start2 ? ',' + end2 : ''}\n`
      for (const line of diff.lines1 || []) {
        output += `< ${line}\n`
      }
      output += `---\n`
      for (const line of diff.lines2 || []) {
        output += `> ${line}\n`
      }
    }
  }
  
  return output.trim()
}

// 简单的diff算法
function computeDiff(lines1, lines2) {
  const diffs = []
  let i = 0, j = 0
  
  while (i < lines1.length || j < lines2.length) {
    if (i >= lines1.length) {
      // 只剩下lines2的内容
      diffs.push({
        type: 'insert',
        start1: i,
        start2: j,
        count1: 0,
        count2: lines2.length - j,
        lines2: lines2.slice(j)
      })
      break
    } else if (j >= lines2.length) {
      // 只剩下lines1的内容
      diffs.push({
        type: 'delete',
        start1: i,
        start2: j,
        count1: lines1.length - i,
        count2: 0,
        lines1: lines1.slice(i)
      })
      break
    } else if (lines1[i] === lines2[j]) {
      // 相同的行
      i++
      j++
    } else {
      // 找到差异
      let nextMatch1 = -1, nextMatch2 = -1
      
      // 在lines2中寻找lines1[i]
      for (let k = j + 1; k < Math.min(j + 10, lines2.length); k++) {
        if (lines1[i] === lines2[k]) {
          nextMatch2 = k
          break
        }
      }
      
      // 在lines1中寻找lines2[j]
      for (let k = i + 1; k < Math.min(i + 10, lines1.length); k++) {
        if (lines1[k] === lines2[j]) {
          nextMatch1 = k
          break
        }
      }
      
      if (nextMatch2 !== -1 && (nextMatch1 === -1 || nextMatch2 - j <= nextMatch1 - i)) {
        // 插入
        diffs.push({
          type: 'insert',
          start1: i,
          start2: j,
          count1: 0,
          count2: nextMatch2 - j,
          lines2: lines2.slice(j, nextMatch2)
        })
        j = nextMatch2
      } else if (nextMatch1 !== -1) {
        // 删除
        diffs.push({
          type: 'delete',
          start1: i,
          start2: j,
          count1: nextMatch1 - i,
          count2: 0,
          lines1: lines1.slice(i, nextMatch1)
        })
        i = nextMatch1
      } else {
        // 更改
        diffs.push({
          type: 'change',
          start1: i,
          start2: j,
          count1: 1,
          count2: 1,
          lines1: [lines1[i]],
          lines2: [lines2[j]]
        })
        i++
        j++
      }
    }
  }
  
  return diffs
}

// 获取选项值
function getOptionValue(args, option) {
  const index = args.indexOf(option)
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1]
  }
  
  // 检查长选项格式 --option=value
  for (const arg of args) {
    if (arg.startsWith(option + '=')) {
      return arg.substring(option.length + 1)
    }
  }
  
  return null
}

// 检查参数是否是选项值
function isOptionValue(arg, args) {
  const index = args.indexOf(arg)
  if (index === 0) return false
  
  const prevArg = args[index - 1]
  return ['--exclude', '--width'].includes(prevArg)
}