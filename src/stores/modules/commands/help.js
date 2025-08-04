/**
 * 帮助和学习相关命令模块
 */

export const helpCommands = {
  help: {
    handler: (args, context, fs) => {
      if (args.length > 0) {
        // 显示特定命令的帮助
        const command = args[0]
        return getCommandHelp(command)
      }

      // 显示所有命令的分类列表
      return `Linux Dojo - 可用命令列表

📁 文件操作 (File Operations):
  ls      - 列出目录内容
  cat     - 显示文件内容
  pwd     - 显示当前目录
  cd      - 切换目录
  mkdir   - 创建目录
  touch   - 创建空文件
  rm      - 删除文件或目录
  cp      - 复制文件或目录
  mv      - 移动/重命名文件

💻 系统信息 (System Information):
  ps      - 显示进程信息
  whoami  - 显示当前用户
  uname   - 显示系统信息
  date    - 显示系统日期
  uptime  - 显示系统运行时间
  free    - 显示内存使用情况
  df      - 显示磁盘空间使用情况
  top     - 显示运行中的进程
  kill    - 终止进程

📝 文本处理 (Text Processing):
  grep    - 搜索文本模式
  sort    - 排序文本行
  wc      - 统计字符/行数
  head    - 显示文件开头部分
  tail    - 显示文件结尾部分
  cut     - 提取文本列
  uniq    - 报告或忽略重复行
  tr      - 转换或删除字符

🌐 网络工具 (Network Tools):
  ping    - 测试网络连通性
  curl    - URL数据传输工具
  wget    - 下载文件
  netstat - 显示网络连接
  ssh     - SSH远程连接
  scp     - SCP文件传输

🎓 学习工具 (Learning Tools):
  tutorial - 开始交互式教程
  progress - 查看学习进度
  hint     - 获取命令提示
  example  - 查看命令示例
  quiz     - 开始命令测验

💡 使用技巧:
  - 使用 'help <命令名>' 查看特定命令的详细帮助
  - 使用 Tab 键进行命令自动补全
  - 使用 | 进行管道操作，如: ls | grep txt
  - 使用 > 进行输出重定向，如: ls > files.txt
  - 使用 history 查看命令历史

开始你的 Linux 学习之旅吧！ 🚀`
    },
    description: 'Display help information|显示帮助信息',
    category: 'help',
    examples: [
      'help',
      'help ls',
      'help grep'
    ]
  },

  tutorial: {
    handler: (args, context, fs) => {
      const lessons = [
        'basic-navigation',
        'file-operations',
        'text-processing',
        'system-info',
        'network-tools'
      ]

      if (args.length === 0) {
        return `🎓 Linux Dojo 交互式教程

可用教程模块:
1. basic-navigation  - 基础导航 (ls, cd, pwd)
2. file-operations   - 文件操作 (cat, cp, mv, rm)
3. text-processing   - 文本处理 (grep, sort, wc)
4. system-info      - 系统信息 (ps, top, free)
5. network-tools    - 网络工具 (ping, curl, wget)

使用方法: tutorial <模块名>
例如: tutorial basic-navigation

💡 提示: 完成所有教程可以解锁高级功能！`
      }

      const lesson = args[0]
      if (!lessons.includes(lesson)) {
        return `❌ 未找到教程模块: ${lesson}
可用模块: ${lessons.join(', ')}`
      }

      return getTutorialContent(lesson)
    },
    description: 'Start interactive tutorial|开始交互式教程',
    category: 'help',
    examples: [
      'tutorial',
      'tutorial basic-navigation'
    ]
  },

  progress: {
    handler: (args, context, fs) => {
      // 这里应该从学习进度存储中获取数据
      const stats = {
        commandsLearned: 15,
        totalCommands: 45,
        tutorialsCompleted: 2,
        totalTutorials: 5,
        quizzesPassed: 3,
        totalQuizzes: 10,
        level: 'Beginner',
        xp: 250,
        nextLevelXp: 500
      }

      const progressBar = '█'.repeat(Math.floor(stats.xp / stats.nextLevelXp * 20)) + 
                         '░'.repeat(20 - Math.floor(stats.xp / stats.nextLevelXp * 20))

      return `🎯 学习进度报告

👤 等级: ${stats.level}
⭐ 经验值: ${stats.xp}/${stats.nextLevelXp} XP
📊 进度: [${progressBar}] ${Math.floor(stats.xp / stats.nextLevelXp * 100)}%

📈 统计信息:
  📚 已学命令: ${stats.commandsLearned}/${stats.totalCommands} (${Math.floor(stats.commandsLearned / stats.totalCommands * 100)}%)
  🎓 完成教程: ${stats.tutorialsCompleted}/${stats.totalTutorials} (${Math.floor(stats.tutorialsCompleted / stats.totalTutorials * 100)}%)
  🧠 通过测验: ${stats.quizzesPassed}/${stats.totalQuizzes} (${Math.floor(stats.quizzesPassed / stats.totalQuizzes * 100)}%)

🏆 成就:
  ✅ 初学者 - 学会基础命令
  ✅ 探索者 - 完成第一个教程
  🔒 文件大师 - 掌握所有文件操作命令
  🔒 文本专家 - 精通文本处理工具

💡 建议: 继续完成教程来提升你的技能！`
    },
    description: 'View learning progress|查看学习进度',
    category: 'help',
    examples: ['progress']
  },

  hint: {
    handler: (args, context, fs) => {
      const hints = [
        "💡 使用 'ls -la' 可以显示隐藏文件和详细信息",
        "💡 使用 'cd ..' 返回上级目录",
        "💡 使用 Tab 键可以自动补全命令和文件名",
        "💡 使用 '|' 可以将一个命令的输出传递给另一个命令",
        "💡 使用 'grep' 可以在文件中搜索特定文本",
        "💡 使用 'history' 可以查看之前执行的命令",
        "💡 使用 'man <命令>' 可以查看命令的详细手册",
        "💡 使用 'ctrl+c' 可以中断正在运行的命令",
        "💡 使用 '>' 可以将命令输出重定向到文件",
        "💡 使用 'find' 可以搜索文件和目录"
      ]

      const randomHint = hints[Math.floor(Math.random() * hints.length)]
      return `🔍 每日提示\n\n${randomHint}\n\n想要更多提示？使用 'tutorial' 开始学习！`
    },
    description: 'Get random learning tips|获取随机学习提示',
    category: 'help',
    examples: ['hint']
  },

  example: {
    handler: (args, context, fs) => {
      if (args.length === 0) {
        return `📚 命令示例查看器

使用方法: example <命令名>

可查看示例的命令:
  ls, cat, grep, sort, find, ps, curl, ping 等

例如: example grep`
      }

      const command = args[0]
      return getCommandExamples(command)
    },
    description: 'View command usage examples|查看命令使用示例',
    category: 'help',
    requiresArgs: true,
    examples: [
      'example grep',
      'example ls'
    ]
  },

  quiz: {
    handler: (args, context, fs) => {
      const quizzes = [
        {
          question: "哪个命令用于列出目录内容？",
          options: ["a) list", "b) ls", "c) dir", "d) show"],
          answer: "b",
          explanation: "ls 命令用于列出目录中的文件和子目录"
        },
        {
          question: "如何显示当前工作目录？",
          options: ["a) pwd", "b) cwd", "c) dir", "d) path"],
          answer: "a",
          explanation: "pwd (print working directory) 显示当前工作目录的完整路径"
        },
        {
          question: "哪个命令用于在文件中搜索文本？",
          options: ["a) find", "b) search", "c) grep", "d) look"],
          answer: "c",
          explanation: "grep 命令用于在文件中搜索匹配指定模式的文本行"
        }
      ]

      const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)]
      
      return `🧠 Linux 命令测验

${randomQuiz.question}

${randomQuiz.options.join('\n')}

请输入你的答案 (a/b/c/d): 

💡 提示: 这是一个模拟测验。在真实环境中，你可以输入答案并获得即时反馈！

正确答案: ${randomQuiz.answer}
解释: ${randomQuiz.explanation}`
    },
    description: 'Start command knowledge quiz|开始命令知识测验',
    category: 'help',
    examples: ['quiz']
  },

  man: {
    handler: (args, context, fs) => {
      if (args.length === 0) {
        return "What manual page do you want?"
      }

      const command = args[0]
      return getManualPage(command)
    },
    description: 'Display command manual pages|显示命令手册页',
    category: 'help',
    requiresArgs: true,
    examples: [
      'man ls',
      'man grep'
    ]
  },

  history: {
    handler: (args, context, fs) => {
      // 这里应该从命令历史存储中获取数据
      const mockHistory = [
        'ls',
        'cd Documents',
        'cat notes.txt',
        'grep "Linux" notes.txt',
        'ps aux',
        'help',
        'tutorial basic-navigation'
      ]

      return mockHistory.map((cmd, index) => 
        `${(index + 1).toString().padStart(4)} ${cmd}`
      ).join('\n')
    },
    description: 'Display command history|显示命令历史',
    category: 'help',
    examples: ['history']
  }
}

// 辅助函数
function getCommandHelp(command) {
  const helpTexts = {
    ls: `📁 ls - 列出目录内容

语法: ls [选项] [文件...]

常用选项:
  -l    使用长格式显示详细信息
  -a    显示所有文件，包括隐藏文件
  -h    以人类可读的格式显示文件大小
  -t    按修改时间排序
  -r    反向排序

示例:
  ls              列出当前目录内容
  ls -l           显示详细信息
  ls -la          显示所有文件的详细信息
  ls *.txt        列出所有 .txt 文件`,

    grep: `🔍 grep - 搜索文本模式

语法: grep [选项] 模式 [文件...]

常用选项:
  -i    忽略大小写
  -n    显示行号
  -v    显示不匹配的行
  -r    递归搜索目录

示例:
  grep "hello" file.txt       在文件中搜索 "hello"
  grep -i "Hello" file.txt    忽略大小写搜索
  grep -n "error" log.txt     显示匹配行的行号
  cat file.txt | grep "word"  在管道中使用`,

    cat: `📄 cat - 显示文件内容

语法: cat [选项] [文件...]

常用选项:
  -n    显示行号
  -b    只对非空行显示行号
  -s    压缩多个空行为一个

示例:
  cat file.txt           显示文件内容
  cat file1.txt file2.txt 显示多个文件内容
  cat -n file.txt        显示带行号的内容`
  }

  return helpTexts[command] || `❌ 没有找到命令 '${command}' 的帮助信息。\n使用 'help' 查看所有可用命令。`
}

function getTutorialContent(lesson) {
  const tutorials = {
    'basic-navigation': `🎓 基础导航教程

欢迎来到 Linux 基础导航教程！

第1步: 查看当前位置
输入: pwd
这会显示你当前所在的目录路径。

第2步: 列出文件和目录
输入: ls
这会显示当前目录中的所有文件和文件夹。

第3步: 查看详细信息
输入: ls -l
这会显示文件的详细信息，包括权限、大小和修改时间。

第4步: 切换目录
输入: cd Documents
这会进入 Documents 目录。

第5步: 返回上级目录
输入: cd ..
这会返回到上一级目录。

🎯 练习任务:
1. 使用 pwd 查看当前位置
2. 使用 ls 列出所有文件
3. 进入任意一个目录
4. 再次使用 pwd 确认位置变化

完成后输入 'progress' 查看你的学习进度！`,

    'file-operations': `🎓 文件操作教程

学习如何创建、复制、移动和删除文件！

第1步: 创建文件
输入: touch myfile.txt
这会创建一个名为 myfile.txt 的空文件。

第2步: 查看文件内容
输入: cat myfile.txt
由于文件是空的，不会显示任何内容。

第3步: 复制文件
输入: cp myfile.txt backup.txt
这会创建 myfile.txt 的副本。

第4步: 重命名文件
输入: mv backup.txt mybackup.txt
这会将 backup.txt 重命名为 mybackup.txt。

第5步: 删除文件
输入: rm mybackup.txt
这会删除 mybackup.txt 文件。

⚠️  注意: rm 命令会永久删除文件，请谨慎使用！

🎯 练习任务:
1. 创建一个新文件
2. 复制这个文件
3. 重命名副本
4. 删除原文件`
  }

  return tutorials[lesson] || `❌ 教程内容未找到: ${lesson}`
}

function getCommandExamples(command) {
  const examples = {
    grep: `📚 grep 命令示例

基础搜索:
  grep "error" log.txt
  # 在 log.txt 中搜索包含 "error" 的行

忽略大小写:
  grep -i "ERROR" log.txt
  # 搜索 "error"，忽略大小写

显示行号:
  grep -n "function" script.js
  # 显示匹配行的行号

反向搜索:
  grep -v "debug" log.txt
  # 显示不包含 "debug" 的行

管道使用:
  ps aux | grep "node"
  # 在进程列表中搜索 node 进程

递归搜索:
  grep -r "TODO" src/
  # 在 src 目录中递归搜索 "TODO"`,

    ls: `📚 ls 命令示例

基础列表:
  ls
  # 列出当前目录内容

详细信息:
  ls -l
  # 显示详细信息（权限、大小、日期）

显示隐藏文件:
  ls -a
  # 显示所有文件，包括隐藏文件

组合选项:
  ls -la
  # 显示所有文件的详细信息

按时间排序:
  ls -lt
  # 按修改时间排序显示

人类可读格式:
  ls -lh
  # 以 KB、MB 等格式显示文件大小`
  }

  return examples[command] || `❌ 没有找到命令 '${command}' 的示例。\n使用 'example' 查看可用的示例命令。`
}

function getManualPage(command) {
  const manPages = {
    ls: `LS(1)                    User Commands                   LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

DESCRIPTION
       List  information  about  the FILEs (the current directory by
       default).  Sort entries alphabetically if none of -cftuvSUX
       nor --sort is specified.

       -a, --all
              do not ignore entries starting with .

       -l     use a long listing format

       -h, --human-readable
              with -l and/or -s, print human readable sizes

EXAMPLES
       ls -l
              List files in long format

       ls -la
              List all files in long format

SEE ALSO
       dir(1), vdir(1)`,

    grep: `GREP(1)                   User Commands                  GREP(1)

NAME
       grep - print lines matching a pattern

SYNOPSIS
       grep [OPTIONS] PATTERN [FILE...]

DESCRIPTION
       grep searches the named input FILEs for lines containing a
       match to the given PATTERN.

       -i, --ignore-case
              Ignore case distinctions

       -n, --line-number
              Prefix each line of output with the line number

       -v, --invert-match
              Invert the sense of matching

EXAMPLES
       grep "hello" file.txt
              Search for "hello" in file.txt

       grep -i "error" log.txt
              Case-insensitive search for "error"`
  }

  return manPages[command] || `No manual entry for ${command}`
}