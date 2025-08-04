/**
 * kill - 终止进程
 */

export const kill = {
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return kill.help
    }

    // 列出所有信号
    if (args.includes('-l') || args.includes('--list')) {
      return listSignals()
    }

    // 解析信号
    let signal = 'TERM' // 默认信号
    let pids = []
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg.startsWith('-') && arg !== '-l' && arg !== '--list' && arg !== '--help') {
        // 信号参数
        if (arg.startsWith('--signal=')) {
          signal = arg.substring(9)
        } else if (arg === '-s' || arg === '--signal') {
          if (i + 1 < args.length) {
            signal = args[i + 1]
            i++ // 跳过下一个参数
          }
        } else {
          // -SIGNAL 格式
          signal = arg.substring(1)
        }
      } else if (!arg.startsWith('-')) {
        // PID参数
        const pid = parseInt(arg)
        if (isNaN(pid)) {
          throw new Error(`kill: ${arg}: arguments must be process or job IDs`)
        }
        pids.push(pid)
      }
    }

    if (pids.length === 0) {
      throw new Error('kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]')
    }

    // 验证信号
    const validSignal = validateSignal(signal)
    if (!validSignal) {
      throw new Error(`kill: ${signal}: invalid signal specification`)
    }

    // 模拟终止进程
    const results = []
    for (const pid of pids) {
      const result = simulateKill(pid, validSignal)
      if (result.error) {
        results.push(`kill: (${pid}) - ${result.error}`)
      } else {
        results.push(`Process ${pid} terminated with signal ${validSignal.name}`)
      }
    }

    return results.join('\n')
  },
  description: 'Terminate processes by PID|终止进程',
  category: 'system',
  requiresArgs: true,
  options: [
    {
      flag: '-l',
      longFlag: '--list',
      description: '列出所有信号名称',
      type: 'boolean',
      group: '信息选项'
    },
    {
      flag: '-s',
      longFlag: '--signal',
      description: '指定要发送的信号',
      type: 'select',
      inputKey: 'signal_name',
      options: ['TERM', 'KILL', 'HUP', 'INT', 'QUIT', 'USR1', 'USR2', 'STOP', 'CONT'],
      optionLabels: ['TERM (终止)', 'KILL (强制终止)', 'HUP (挂起)', 'INT (中断)', 'QUIT (退出)', 'USR1 (用户信号1)', 'USR2 (用户信号2)', 'STOP (停止)', 'CONT (继续)'],
      default: 'TERM',
      group: '信号选项'
    },
    {
      flag: '-n',
      description: '指定信号编号',
      type: 'select',
      inputKey: 'signal_number',
      options: ['1', '2', '3', '9', '15', '18', '19'],
      optionLabels: ['1 (HUP)', '2 (INT)', '3 (QUIT)', '9 (KILL)', '15 (TERM)', '18 (CONT)', '19 (STOP)'],
      group: '信号选项'
    },
    {
      flag: '-1',
      description: '发送SIGHUP信号',
      type: 'boolean',
      group: '常用信号'
    },
    {
      flag: '-2',
      description: '发送SIGINT信号',
      type: 'boolean',
      group: '常用信号'
    },
    {
      flag: '-9',
      description: '发送SIGKILL信号（强制终止）',
      type: 'boolean',
      group: '常用信号'
    },
    {
      flag: '-15',
      description: '发送SIGTERM信号（正常终止）',
      type: 'boolean',
      group: '常用信号'
    },
    {
      flag: '-TERM',
      description: '发送SIGTERM信号',
      type: 'boolean',
      group: '常用信号'
    },
    {
      flag: '-KILL',
      description: '发送SIGKILL信号',
      type: 'boolean',
      group: '常用信号'
    },
    {
      flag: '-HUP',
      description: '发送SIGHUP信号',
      type: 'boolean',
      group: '常用信号'
    },
    {
      flag: '-INT',
      description: '发送SIGINT信号',
      type: 'boolean',
      group: '常用信号'
    },
    {
      description: '进程ID列表',
      type: 'input',
      inputKey: 'pid_list',
      placeholder: '1234 5678',
      required: true
    }
  ],
  examples: [
    'kill 1234                    # Send SIGTERM to process 1234|向进程1234发送SIGTERM信号',
    'kill -9 1234                 # Send SIGKILL to process 1234|向进程1234发送SIGKILL信号',
    'kill -KILL 1234              # Send SIGKILL to process 1234|向进程1234发送SIGKILL信号',
    'kill -s TERM 1234            # Send SIGTERM to process 1234|向进程1234发送SIGTERM信号',
    'kill -l                      # List all signal names|列出所有信号名称',
    'kill --signal=HUP 1234       # Send SIGHUP to process 1234|向进程1234发送SIGHUP信号'
  ],
  help: `Usage: kill [options] <pid> [...]
       kill -l [signal]

Options:
  -s, --signal=SIGNAL    specify the signal to send
  -n, --signal=SIGNUM    specify the signal number to send
  -l, --list[=SIGNAL]    list signal names, or convert a signal number to a name
      --help             display this help and exit
      --version          output version information and exit

SIGNAL may be a signal name like 'HUP', or a signal number like '1',
or an exit status of a process terminated by a signal.
PID is a process ID.  Negative PID values may be used to choose whole
process groups; see the PGID column in ps command output.

Common signals:
  1) SIGHUP      2) SIGINT      3) SIGQUIT     4) SIGILL      5) SIGTRAP
  6) SIGABRT     7) SIGBUS      8) SIGFPE      9) SIGKILL    10) SIGUSR1
 11) SIGSEGV    12) SIGUSR2    13) SIGPIPE    14) SIGALRM    15) SIGTERM
 16) SIGSTKFLT  17) SIGCHLD    18) SIGCONT    19) SIGSTOP    20) SIGTSTP
 21) SIGTTIN    22) SIGTTOU    23) SIGURG     24) SIGXCPU    25) SIGXFSZ
 26) SIGVTALRM  27) SIGPROF    28) SIGWINCH   29) SIGIO      30) SIGPWR
 31) SIGSYS

Examples:
  kill 1234                    Send SIGTERM to process 1234
  kill -9 1234                 Send SIGKILL to process 1234
  kill -KILL 1234              Send SIGKILL to process 1234
  kill -s TERM 1234            Send SIGTERM to process 1234
  kill -l                      List all signal names
  kill -l 9                    Show name of signal 9 (KILL)

Note: SIGKILL (9) and SIGSTOP (19) cannot be caught or ignored.`
}

// 信号定义
const SIGNALS = {
  1: { name: 'HUP', description: 'Hangup|挂起' },
  2: { name: 'INT', description: 'Interrupt|中断' },
  3: { name: 'QUIT', description: 'Quit|退出' },
  4: { name: 'ILL', description: 'Illegal instruction|非法指令' },
  5: { name: 'TRAP', description: 'Trace/breakpoint trap|跟踪/断点陷阱' },
  6: { name: 'ABRT', description: 'Aborted|中止' },
  7: { name: 'BUS', description: 'Bus error|总线错误' },
  8: { name: 'FPE', description: 'Floating point exception|浮点异常' },
  9: { name: 'KILL', description: 'Killed|强制终止' },
  10: { name: 'USR1', description: 'User defined signal 1|用户定义信号1' },
  11: { name: 'SEGV', description: 'Segmentation fault|段错误' },
  12: { name: 'USR2', description: 'User defined signal 2|用户定义信号2' },
  13: { name: 'PIPE', description: 'Broken pipe|管道破裂' },
  14: { name: 'ALRM', description: 'Alarm clock|闹钟' },
  15: { name: 'TERM', description: 'Terminated|终止' },
  16: { name: 'STKFLT', description: 'Stack fault|栈错误' },
  17: { name: 'CHLD', description: 'Child exited|子进程退出' },
  18: { name: 'CONT', description: 'Continued|继续' },
  19: { name: 'STOP', description: 'Stopped (signal)|停止(信号)' },
  20: { name: 'TSTP', description: 'Stopped|停止' },
  21: { name: 'TTIN', description: 'Stopped (tty input)|停止(终端输入)' },
  22: { name: 'TTOU', description: 'Stopped (tty output)|停止(终端输出)' },
  23: { name: 'URG', description: 'Urgent I/O condition|紧急I/O条件' },
  24: { name: 'XCPU', description: 'CPU time limit exceeded|CPU时间限制超出' },
  25: { name: 'XFSZ', description: 'File size limit exceeded|文件大小限制超出' },
  26: { name: 'VTALRM', description: 'Virtual timer expired|虚拟定时器过期' },
  27: { name: 'PROF', description: 'Profiling timer expired|性能分析定时器过期' },
  28: { name: 'WINCH', description: 'Window changed|窗口改变' },
  29: { name: 'IO', description: 'I/O possible|I/O可能' },
  30: { name: 'PWR', description: 'Power failure|电源故障' },
  31: { name: 'SYS', description: 'Bad system call|错误的系统调用' }
}

// 列出所有信号
function listSignals() {
  const lines = []
  
  // 按行显示信号，每行5个
  const signalNumbers = Object.keys(SIGNALS).map(n => parseInt(n)).sort((a, b) => a - b)
  
  for (let i = 0; i < signalNumbers.length; i += 5) {
    const line = signalNumbers.slice(i, i + 5).map(num => {
      const signal = SIGNALS[num]
      return `${num.toString().padStart(2)}) SIG${signal.name}`
    }).join('  ')
    lines.push(line)
  }
  
  return lines.join('\n')
}

// 验证信号
function validateSignal(signal) {
  // 数字信号
  const sigNum = parseInt(signal)
  if (!isNaN(sigNum)) {
    if (SIGNALS[sigNum]) {
      return { number: sigNum, name: SIGNALS[sigNum].name }
    }
    return null
  }
  
  // 信号名称
  let sigName = signal.toUpperCase()
  if (sigName.startsWith('SIG')) {
    sigName = sigName.substring(3)
  }
  
  // 查找信号
  for (const [num, sig] of Object.entries(SIGNALS)) {
    if (sig.name === sigName) {
      return { number: parseInt(num), name: sig.name }
    }
  }
  
  return null
}

// 模拟终止进程
function simulateKill(pid, signal) {
  // 模拟的进程列表
  const mockProcesses = [
    { pid: 1, name: 'init', user: 'root', protected: true },
    { pid: 1234, name: 'node', user: 'user', protected: false },
    { pid: 5678, name: 'chrome', user: 'user', protected: false },
    { pid: 9999, name: 'nginx', user: 'www-data', protected: false }
  ]
  
  const process = mockProcesses.find(p => p.pid === pid)
  
  if (!process) {
    return { error: 'No such process' }
  }
  
  // 检查权限
  if (process.protected && signal.name === 'KILL') {
    return { error: 'Operation not permitted' }
  }
  
  // 特殊进程保护
  if (pid === 1 && (signal.name === 'KILL' || signal.name === 'TERM')) {
    return { error: 'Operation not permitted' }
  }
  
  // 模拟成功
  return { success: true }
}