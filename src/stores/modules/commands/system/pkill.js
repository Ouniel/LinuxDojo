import { formatHelp } from '../utils/helpFormatter.js'

export const pkill = {
  name: 'pkill',
  description: 'Kill processes based on name and other attributes|根据名称和其他属性终止进程',
  
  options: [
    // 信号选项组
    {
      flag: '-s',
      longFlag: '--signal',
      description: '指定要发送的信号',
      type: 'select',
      inputKey: 'signal_type',
      options: [
        { value: 'TERM', label: 'TERM (15) - 正常终止' },
        { value: 'KILL', label: 'KILL (9) - 强制终止' },
        { value: 'HUP', label: 'HUP (1) - 挂起' },
        { value: 'INT', label: 'INT (2) - 中断' },
        { value: 'QUIT', label: 'QUIT (3) - 退出' },
        { value: 'USR1', label: 'USR1 (10) - 用户定义信号1' },
        { value: 'USR2', label: 'USR2 (12) - 用户定义信号2' }
      ],
      default: 'TERM',
      group: '信号选项'
    },
    {
      flag: '-9',
      description: '发送KILL信号（强制终止）',
      type: 'boolean',
      group: '信号选项'
    },
    
    // 匹配选项组
    {
      flag: '-f',
      longFlag: '--full',
      description: '使用完整进程命令行进行匹配',
      type: 'boolean',
      group: '匹配选项'
    },
    {
      flag: '-x',
      longFlag: '--exact',
      description: '精确匹配（不使用正则表达式）',
      type: 'boolean',
      group: '匹配选项'
    },
    {
      flag: '-v',
      longFlag: '--inverse',
      description: '反向匹配（选择不匹配的进程）',
      type: 'boolean',
      group: '匹配选项'
    },
    
    // 选择选项组
    {
      flag: '-n',
      longFlag: '--newest',
      description: '仅选择最新的匹配进程',
      type: 'boolean',
      group: '选择选项'
    },
    {
      flag: '-o',
      longFlag: '--oldest',
      description: '仅选择最旧的匹配进程',
      type: 'boolean',
      group: '选择选项'
    },
    
    // 过滤选项组
    {
      flag: '-P',
      longFlag: '--parent',
      description: '仅匹配指定父进程的子进程',
      type: 'input',
      inputKey: 'parent_pid',
      placeholder: '父进程PID',
      group: '过滤选项'
    },
    {
      flag: '-u',
      longFlag: '--uid',
      description: '按有效用户ID匹配',
      type: 'input',
      inputKey: 'user_id',
      placeholder: '用户ID或用户名',
      group: '过滤选项'
    },
    {
      flag: '-g',
      longFlag: '--gid',
      description: '按有效组ID匹配',
      type: 'input',
      inputKey: 'group_id',
      placeholder: '组ID或组名',
      group: '过滤选项'
    },
    {
      flag: '-t',
      longFlag: '--terminal',
      description: '按控制终端匹配',
      type: 'input',
      inputKey: 'terminal',
      placeholder: '终端名（如 pts/0）',
      group: '过滤选项'
    },
    {
      flag: '--session',
      description: '按会话ID匹配',
      type: 'input',
      inputKey: 'session_id',
      placeholder: '会话ID',
      group: '过滤选项'
    },
    
    // 输出选项组
    {
      flag: '-c',
      longFlag: '--count',
      description: '仅显示匹配进程的数量',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '-l',
      longFlag: '--list-name',
      description: '列出进程名和进程ID（不终止）',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '-a',
      longFlag: '--list-full',
      description: '列出完整命令行和进程ID（不终止）',
      type: 'boolean',
      group: '输出选项'
    },
    
    // 输入参数
    {
      inputKey: 'search_pattern',
      description: '进程匹配模式（支持正则表达式）',
      type: 'input',
      placeholder: '进程名或正则表达式（如 "firefox" 或 "python.*script"）',
      required: true
    }
  ],
  
  handler(args, context, fs) {
    const { currentPath } = context
    const fileSystem = fs.fileSystem || fs
    
    // 简化的路径解析函数
    const resolvePath = (filename, basePath) => {
      const pathParts = basePath.split('/').filter(part => part !== '')
      let current = fileSystem['/']
      
      for (const part of pathParts) {
        if (current.children && current.children[part]) {
          current = current.children[part]
        } else {
          return { item: null }
        }
      }
      
      if (current.children && current.children[filename]) {
        return { item: current.children[filename] }
      }
      
      return { item: null }
    }
    if (args.length === 0) {
      return formatHelp({
        name: 'pkill',
        description: 'Kill processes based on name and other attributes|根据名称和其他属性终止进程',
        usage: 'pkill [OPTIONS] PATTERN|pkill [选项] 模式',
        options: [
          '-s, --signal SIGNAL  Send specified signal (default: TERM)|发送指定信号（默认：TERM）',
          '-f, --full           Use full process name to match|使用完整进程名匹配',
          '-x, --exact          Match exactly|精确匹配',
          '-n, --newest         Select only the newest process|仅选择最新进程',
          '-o, --oldest         Select only the oldest process|仅选择最旧进程',
          '-P, --parent PPID    Match only child processes of given parent|仅匹配指定父进程的子进程',
          '--session SID        Match session ID|匹配会话ID',
          '-t, --terminal TTY   Match by controlling terminal|按控制终端匹配',
          '-u, --uid UID        Match by effective user ID|按有效用户ID匹配',
          '-g, --gid GID        Match by effective group ID|按有效组ID匹配',
          '-c, --count          Count of matching processes|匹配进程的数量',
          '-l, --list-name      List process name as well as process ID|列出进程名和进程ID',
          '-a, --list-full      List full command line as well as process ID|列出完整命令行和进程ID',
          '-v, --inverse        Negates the matching|反向匹配'
        ],
        examples: [
          'pkill firefox|终止所有firefox进程',
          'pkill -9 chrome|强制终止所有chrome进程',
          'pkill -u user vim|终止用户user的所有vim进程',
          'pkill -f "python script.py"|终止匹配完整命令行的进程',
          'pkill -l firefox|列出firefox进程而不终止',
          'pkill -n firefox|仅终止最新的firefox进程'
        ],
        notes: [
          'PATTERN can be a regular expression|模式可以是正则表达式',
          'Use pgrep to list matching processes without killing|使用pgrep列出匹配进程而不终止',
          'Process termination is simulated in this environment|在此环境中进程终止是模拟的'
        ]
      })
    }
    
    const options = {
      signal: 'TERM',
      full: false,
      exact: false,
      newest: false,
      oldest: false,
      parent: null,
      session: null,
      terminal: null,
      uid: null,
      gid: null,
      count: false,
      listName: false,
      listFull: false,
      inverse: false
    }
    
    let pattern = ''
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-s' || arg === '--signal') {
        options.signal = args[++i] || 'TERM'
      } else if (arg.startsWith('-s') && arg.length > 2) {
        options.signal = arg.slice(2)
      } else if (arg === '-f' || arg === '--full') {
        options.full = true
      } else if (arg === '-x' || arg === '--exact') {
        options.exact = true
      } else if (arg === '-n' || arg === '--newest') {
        options.newest = true
      } else if (arg === '-o' || arg === '--oldest') {
        options.oldest = true
      } else if (arg === '-P' || arg === '--parent') {
        options.parent = args[++i]
      } else if (arg === '--session') {
        options.session = args[++i]
      } else if (arg === '-t' || arg === '--terminal') {
        options.terminal = args[++i]
      } else if (arg === '-u' || arg === '--uid') {
        options.uid = args[++i]
      } else if (arg === '-g' || arg === '--gid') {
        options.gid = args[++i]
      } else if (arg === '-c' || arg === '--count') {
        options.count = true
      } else if (arg === '-l' || arg === '--list-name') {
        options.listName = true
      } else if (arg === '-a' || arg === '--list-full') {
        options.listFull = true
      } else if (arg === '-v' || arg === '--inverse') {
        options.inverse = true
      } else if (arg === '-9') {
        options.signal = 'KILL'
      } else if (arg.startsWith('-') && /^\d+$/.test(arg.slice(1))) {
        // 数字信号，如 -15
        options.signal = arg.slice(1)
      } else if (arg.startsWith('-')) {
        return `pkill: invalid option: ${arg}`
      } else {
        pattern = arg
        break
      }
    }
    
    if (!pattern) {
      return 'pkill: no pattern specified\nUsage: pkill [OPTIONS] PATTERN'
    }
    
    // 模拟的进程列表
    const processes = [
      { pid: 1234, name: 'firefox', fullCmd: '/usr/bin/firefox --new-window', user: 'user', uid: 1000, gid: 1000, ppid: 1, session: 1234, terminal: 'pts/0', age: 3600 },
      { pid: 1235, name: 'firefox', fullCmd: '/usr/bin/firefox --private-window', user: 'user', uid: 1000, gid: 1000, ppid: 1, session: 1234, terminal: 'pts/0', age: 1800 },
      { pid: 2345, name: 'chrome', fullCmd: '/opt/google/chrome/chrome', user: 'admin', uid: 1001, gid: 1001, ppid: 1, session: 2345, terminal: 'pts/1', age: 7200 },
      { pid: 3456, name: 'vim', fullCmd: 'vim document.txt', user: 'user', uid: 1000, gid: 1000, ppid: 1234, session: 1234, terminal: 'pts/0', age: 900 },
      { pid: 4567, name: 'httpd', fullCmd: '/usr/sbin/httpd -D FOREGROUND', user: 'root', uid: 0, gid: 0, ppid: 1, session: 1, terminal: '?', age: 86400 },
      { pid: 5678, name: 'python', fullCmd: 'python script.py --verbose', user: 'user', uid: 1000, gid: 1000, ppid: 1, session: 1234, terminal: 'pts/2', age: 300 },
      { pid: 6789, name: 'node', fullCmd: 'node server.js --port 3000', user: 'developer', uid: 1002, gid: 1002, ppid: 1, session: 3456, terminal: 'pts/3', age: 1200 }
    ]
    
    // 创建正则表达式
    let regex
    try {
      regex = new RegExp(pattern, 'i')
    } catch (e) {
      return `pkill: invalid regular expression: ${pattern}`
    }
    
    // 过滤匹配的进程
    let matchingProcesses = processes.filter(proc => {
      // 名称或命令行匹配
      const searchText = options.full ? proc.fullCmd : proc.name
      const matches = options.exact ? searchText === pattern : regex.test(searchText)
      
      if (options.inverse) {
        if (matches) return false
      } else {
        if (!matches) return false
      }
      
      // 其他过滤条件
      if (options.parent && proc.ppid !== parseInt(options.parent)) return false
      if (options.session && proc.session !== parseInt(options.session)) return false
      if (options.terminal && proc.terminal !== options.terminal) return false
      if (options.uid && proc.uid !== parseInt(options.uid)) return false
      if (options.gid && proc.gid !== parseInt(options.gid)) return false
      
      return true
    })
    
    // 选择最新或最旧的进程
    if (options.newest && matchingProcesses.length > 0) {
      matchingProcesses = [matchingProcesses.reduce((newest, proc) => 
        proc.age < newest.age ? proc : newest
      )]
    } else if (options.oldest && matchingProcesses.length > 0) {
      matchingProcesses = [matchingProcesses.reduce((oldest, proc) => 
        proc.age > oldest.age ? proc : oldest
      )]
    }
    
    if (matchingProcesses.length === 0) {
      return `pkill: no process found matching criteria`
    }
    
    const results = []
    
    // 仅计数
    if (options.count) {
      return matchingProcesses.length.toString()
    }
    
    // 列出进程
    if (options.listName || options.listFull) {
      for (const proc of matchingProcesses) {
        if (options.listFull) {
          results.push(`${proc.pid} ${proc.fullCmd}`)
        } else {
          results.push(`${proc.pid} ${proc.name}`)
        }
      }
      return results.join('\n')
    }
    
    // 终止进程
    const signalName = isNaN(options.signal) ? options.signal : `SIG${options.signal}`
    
    for (const proc of matchingProcesses) {
      results.push(`pkill: sending signal ${signalName} to process ${proc.pid} (${proc.name})`)
    }
    
    results.push(`pkill: ${matchingProcesses.length} process(es) killed`)
    
    return results.join('\n')
  }
}