import { formatHelp } from '../utils/helpFormatter.js'

export const killall = {
  name: 'killall',
  description: 'Kill processes by name|按名称终止进程',
  
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
      flag: '-e',
      longFlag: '--exact',
      description: '要求完全匹配进程名称',
      type: 'boolean',
      group: '匹配选项'
    },
    {
      flag: '-u',
      longFlag: '--user',
      description: '仅终止指定用户的进程',
      type: 'input',
      inputKey: 'target_user',
      placeholder: '用户名',
      group: '匹配选项'
    },
    
    // 时间过滤组
    {
      flag: '-y',
      longFlag: '--younger-than',
      description: '终止比指定时间新的进程',
      type: 'input',
      inputKey: 'younger_than',
      placeholder: '时间（秒）',
      group: '时间过滤'
    },
    {
      flag: '-o',
      longFlag: '--older-than',
      description: '终止比指定时间旧的进程',
      type: 'input',
      inputKey: 'older_than',
      placeholder: '时间（秒）',
      group: '时间过滤'
    },
    
    // 行为选项组
    {
      flag: '-i',
      longFlag: '--interactive',
      description: '终止前询问确认',
      type: 'boolean',
      group: '行为选项'
    },
    {
      flag: '-w',
      longFlag: '--wait',
      description: '等待进程完全终止',
      type: 'boolean',
      group: '行为选项'
    },
    
    // 输出选项组
    {
      flag: '-q',
      longFlag: '--quiet',
      description: '静默模式（不显示错误信息）',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '-v',
      longFlag: '--verbose',
      description: '详细模式（显示终止的进程信息）',
      type: 'boolean',
      group: '输出选项'
    },
    
    // 输入参数
    {
      inputKey: 'process_names',
      description: '要终止的进程名称',
      type: 'input',
      placeholder: '进程名称（支持多个，用空格分隔）',
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
        name: 'killall',
        description: 'Kill processes by name|按名称终止进程',
        usage: 'killall [OPTIONS] NAME...|killall [选项] 名称...',
        options: [
          '-s, --signal SIGNAL  Send specified signal|发送指定信号',
          '-e, --exact          Require exact match for very long names|要求完全匹配长名称',
          '-i, --interactive    Ask for confirmation before killing|终止前询问确认',
          '-q, --quiet          Don\'t print complaints|不打印错误信息',
          '-v, --verbose        Report if the signal was successfully sent|报告信号是否成功发送',
          '-w, --wait           Wait for processes to die|等待进程死亡',
          '-y, --younger-than   Kill processes younger than specified time|终止比指定时间新的进程',
          '-o, --older-than     Kill processes older than specified time|终止比指定时间旧的进程',
          '-u, --user USER      Kill only processes owned by specified user|仅终止指定用户的进程'
        ],
        examples: [
          'killall firefox|终止所有firefox进程',
          'killall -9 chrome|强制终止所有chrome进程',
          'killall -u user vim|终止用户user的所有vim进程',
          'killall -i httpd|交互式终止httpd进程',
          'killall -s KILL nginx|发送KILL信号终止nginx'
        ],
        notes: [
          'Common signals: TERM (15), KILL (9), HUP (1), INT (2)|常用信号：TERM (15), KILL (9), HUP (1), INT (2)',
          'Use with caution as it affects all matching processes|小心使用，因为它会影响所有匹配的进程',
          'Process termination is simulated in this environment|在此环境中进程终止是模拟的'
        ]
      })
    }
    
    const options = {
      signal: 'TERM',
      exact: false,
      interactive: false,
      quiet: false,
      verbose: false,
      wait: false,
      younger: null,
      older: null,
      user: null
    }
    
    const processNames = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-s' || arg === '--signal') {
        options.signal = args[++i] || 'TERM'
      } else if (arg.startsWith('-s')) {
        options.signal = arg.slice(2)
      } else if (arg === '-e' || arg === '--exact') {
        options.exact = true
      } else if (arg === '-i' || arg === '--interactive') {
        options.interactive = true
      } else if (arg === '-q' || arg === '--quiet') {
        options.quiet = true
      } else if (arg === '-v' || arg === '--verbose') {
        options.verbose = true
      } else if (arg === '-w' || arg === '--wait') {
        options.wait = true
      } else if (arg === '-y' || arg === '--younger-than') {
        options.younger = args[++i]
      } else if (arg === '-o' || arg === '--older-than') {
        options.older = args[++i]
      } else if (arg === '-u' || arg === '--user') {
        options.user = args[++i]
      } else if (arg === '-9') {
        options.signal = 'KILL'
      } else if (arg.startsWith('-') && /^\d+$/.test(arg.slice(1))) {
        // 数字信号，如 -15
        options.signal = arg.slice(1)
      } else if (arg.startsWith('-')) {
        return `killall: invalid option: ${arg}`
      } else {
        processNames.push(arg)
      }
    }
    
    if (processNames.length === 0) {
      return 'killall: no process name specified\nUsage: killall [OPTIONS] NAME...'
    }
    
    // 模拟的进程列表
    const processes = [
      { pid: 1234, name: 'firefox', user: 'user', age: 3600 },
      { pid: 1235, name: 'firefox', user: 'user', age: 1800 },
      { pid: 2345, name: 'chrome', user: 'admin', age: 7200 },
      { pid: 3456, name: 'vim', user: 'user', age: 900 },
      { pid: 4567, name: 'httpd', user: 'root', age: 86400 },
      { pid: 5678, name: 'nginx', user: 'nginx', age: 43200 },
      { pid: 6789, name: 'node', user: 'user', age: 300 },
      { pid: 7890, name: 'apache2', user: 'www-data', age: 21600 }
    ]
    
    const results = []
    let totalKilled = 0
    
    for (const processName of processNames) {
      let matchingProcesses = processes.filter(proc => {
        // 名称匹配
        const nameMatch = options.exact 
          ? proc.name === processName 
          : proc.name.includes(processName)
        
        if (!nameMatch) return false
        
        // 用户过滤
        if (options.user && proc.user !== options.user) return false
        
        // 年龄过滤
        if (options.younger && proc.age > parseInt(options.younger)) return false
        if (options.older && proc.age < parseInt(options.older)) return false
        
        return true
      })
      
      if (matchingProcesses.length === 0) {
        if (!options.quiet) {
          results.push(`killall: ${processName}: no process found`)
        }
        continue
      }
      
      for (const proc of matchingProcesses) {
        if (options.interactive) {
          // 在实际实现中，这里会提示用户确认
          results.push(`Kill ${proc.name} (${proc.pid})? (y/N) y`)
        }
        
        // 模拟发送信号
        const signalName = isNaN(options.signal) ? options.signal : `SIG${options.signal}`
        
        if (options.verbose) {
          results.push(`Killed ${proc.name} (${proc.pid}) with signal ${signalName}`)
        }
        
        totalKilled++
      }
      
      if (options.wait) {
        results.push(`Waiting for ${matchingProcesses.length} processes to terminate...`)
        // 模拟等待
        results.push(`All ${processName} processes terminated`)
      }
    }
    
    if (!options.quiet && totalKilled > 0) {
      results.push(`killall: Killed ${totalKilled} process(es)`)
    }
    
    return results.length > 0 ? results.join('\n') : ''
  }
}