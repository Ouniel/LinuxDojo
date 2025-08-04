import { formatHelp } from '../utils/helpFormatter.js'

export const watch = {
  name: 'watch',
  description: 'Execute a program periodically, showing output fullscreen|定期执行程序并全屏显示输出',
  
  options: [
    // 时间选项组
    {
      flag: '-n',
      longFlag: '--interval',
      description: '指定更新间隔秒数（默认2秒）',
      type: 'input',
      inputKey: 'interval_seconds',
      placeholder: '间隔秒数（如 1, 5）',
      group: '时间选项'
    },
    {
      flag: '-p',
      longFlag: '--precise',
      description: '尝试以精确间隔运行命令',
      type: 'boolean',
      group: '时间选项'
    },
    
    // 显示选项组
    {
      flag: '-d',
      longFlag: '--differences',
      description: '高亮显示连续更新之间的差异',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-t',
      longFlag: '--no-title',
      description: '关闭显示间隔、命令和时间的标题',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-b',
      longFlag: '--beep',
      description: '如果命令有非零退出状态则发出蜂鸣声',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-e',
      longFlag: '--errexit',
      description: '如果命令有非零退出状态则冻结更新',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-g',
      longFlag: '--chgexit',
      description: '当命令输出改变时退出',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-c',
      longFlag: '--color',
      description: '解释ANSI颜色和样式序列',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-x',
      longFlag: '--exec',
      description: '将命令传递给exec而不是sh -c',
      type: 'boolean',
      group: '显示选项'
    },
    
    // 输入参数
    {
      inputKey: 'command',
      description: '要定期执行的命令',
      type: 'input',
      placeholder: '命令（如 date, uptime, ps aux）',
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
        name: 'watch',
        description: 'Execute a program periodically, showing output fullscreen|定期执行程序并全屏显示输出',
        usage: 'watch [OPTION]... COMMAND|watch [选项]... 命令',
        options: [
          '-n, --interval=SECS    Specify update interval in seconds (default: 2)|指定更新间隔秒数（默认: 2）',
          '-d, --differences      Highlight differences between successive updates|高亮显示连续更新之间的差异',
          '-p, --precise          Attempt run command in precise intervals|尝试以精确间隔运行命令',
          '-t, --no-title         Turn off header showing interval, command, and time|关闭显示间隔、命令和时间的标题',
          '-b, --beep             Beep if command has a non-zero exit|如果命令有非零退出状态则发出蜂鸣声',
          '-e, --errexit          Freeze updates on command error, exit on keypress|如果命令有非零退出状态则冻结更新',
          '-g, --chgexit          Exit when output from command changes|当命令输出改变时退出',
          '-c, --color            Interpret ANSI color and style sequences|解释ANSI颜色和样式序列',
          '-x, --exec             Pass command to exec instead of "sh -c"|将命令传递给exec而不是sh -c'
        ],
        examples: [
          'watch date|每2秒显示当前日期时间',
          'watch -n 1 uptime|每秒显示系统运行时间',
          'watch -d "ps aux"|显示进程列表并高亮变化',
          'watch -n 5 df -h|每5秒显示磁盘使用情况',
          'watch -t free -m|显示内存使用情况（无标题）',
          'watch -g "ls -l /tmp"|当/tmp目录内容改变时退出'
        ]
      })
    }
    
    // 解析选项
    let interval = 2
    let differences = false
    let precise = false
    let noTitle = false
    let beep = false
    let errexit = false
    let chgexit = false
    let color = false
    let exec = false
    let command = []
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-n' || arg === '--interval') {
        if (i + 1 < args.length) {
          interval = parseFloat(args[++i])
          if (isNaN(interval) || interval <= 0) {
            return 'watch: invalid interval'
          }
        } else {
          return 'watch: option requires an argument -- n'
        }
      } else if (arg.startsWith('--interval=')) {
        interval = parseFloat(arg.split('=')[1])
        if (isNaN(interval) || interval <= 0) {
          return 'watch: invalid interval'
        }
      } else if (arg === '-d' || arg === '--differences') {
        differences = true
      } else if (arg === '-p' || arg === '--precise') {
        precise = true
      } else if (arg === '-t' || arg === '--no-title') {
        noTitle = true
      } else if (arg === '-b' || arg === '--beep') {
        beep = true
      } else if (arg === '-e' || arg === '--errexit') {
        errexit = true
      } else if (arg === '-g' || arg === '--chgexit') {
        chgexit = true
      } else if (arg === '-c' || arg === '--color') {
        color = true
      } else if (arg === '-x' || arg === '--exec') {
        exec = true
      } else if (arg.startsWith('-')) {
        return `watch: invalid option: ${arg}`
      } else {
        command = args.slice(i)
        break
      }
    }
    
    if (command.length === 0) {
      return 'watch: no command specified'
    }
    
    const commandStr = command.join(' ')
    const timestamp = new Date().toLocaleString()
    
    let output = []
    
    // 显示标题（除非使用了 -t 选项）
    if (!noTitle) {
      output.push(`Every ${interval}s: ${commandStr}`)
      output.push('')
      output.push(`${timestamp}`)
      output.push('')
    }
    
    // 模拟命令执行结果
    const mockOutput = getMockCommandOutput(commandStr)
    output.push(mockOutput)
    
    // 添加说明信息
    output.push('')
    output.push('--- Watch Simulation ---')
    output.push(`Command: ${commandStr}`)
    output.push(`Interval: ${interval} seconds`)
    
    if (differences) {
      output.push('Differences highlighting: enabled')
    }
    if (precise) {
      output.push('Precise timing: enabled')
    }
    if (beep) {
      output.push('Beep on error: enabled')
    }
    if (errexit) {
      output.push('Exit on error: enabled')
    }
    if (chgexit) {
      output.push('Exit on change: enabled')
    }
    if (color) {
      output.push('Color interpretation: enabled')
    }
    if (exec) {
      output.push('Direct exec: enabled')
    }
    
    output.push('')
    output.push('[In a real environment, this would continuously update]')
    output.push('[Press Ctrl+C to stop watch]')
    
    return output.join('\n')
  }
}

function getMockCommandOutput(command) {
  const now = new Date()
  
  if (command.includes('date')) {
    return now.toLocaleString()
  } else if (command.includes('uptime')) {
    const uptime = Math.floor(Date.now() / 1000)
    const hours = Math.floor(uptime / 3600) % 24
    const minutes = Math.floor(uptime / 60) % 60
    return `${hours}:${minutes.toString().padStart(2, '0')} up 1 day, 2:34, 1 user, load average: 0.15, 0.05, 0.01`
  } else if (command.includes('ps')) {
    return `PID TTY      TIME CMD
1234 pts/0    00:00:01 bash
5678 pts/0    00:00:00 watch
9012 pts/0    00:00:00 ps`
  } else if (command.includes('df')) {
    return `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1       20971520 9437184  10485760  48% /
tmpfs            1048576    1024   1047552   1% /tmp`
  } else if (command.includes('free')) {
    return `              total        used        free      shared  buff/cache   available
Mem:           4194304     2097152   1048576      16384      1048576     1048576
Swap:          2097152           0   2097152`
  } else if (command.includes('ls')) {
    return `total 12
drwxr-xr-x 2 user user 4096 ${now.toLocaleDateString()} file1.txt
-rw-r--r-- 1 user user 1024 ${now.toLocaleDateString()} file2.txt
-rwxr-xr-x 1 user user 2048 ${now.toLocaleDateString()} script.sh`
  } else if (command.includes('netstat')) {
    return `Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 192.168.1.100:22        192.168.1.1:54321       ESTABLISHED
tcp        0      0 192.168.1.100:80        192.168.1.50:45678      TIME_WAIT`
  } else if (command.includes('top') || command.includes('htop')) {
    return `Tasks: 123 total,   1 running, 122 sleeping,   0 stopped,   0 zombie
%Cpu(s):  5.2 us,  2.1 sy,  0.0 ni, 92.1 id,  0.6 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   4096.0 total,   1024.0 free,   2048.0 used,   1024.0 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   1024.0 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1234 user      20   0  123456   12345   1234 S   2.3   0.3   0:01.23 bash
 5678 user      20   0   98765    9876    987 R   1.0   0.2   0:00.12 top`
  } else {
    return `Mock output for command: ${command}
Timestamp: ${now.toLocaleString()}
Status: Running normally`
  }
}