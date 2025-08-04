/**
 * 系统信息和进程管理命令模块
 */

export const systemCommands = {
  ps: {
    handler: (args, context, fs) => {
      const showAll = args.includes('-a') || args.includes('-A')
      const fullFormat = args.includes('-f')
      const userFormat = args.includes('-u')
      const extendedFormat = args.includes('-x')
      const longFormat = args.includes('-l')
      
      // 模拟进程列表
      const processes = [
        { pid: 1, ppid: 0, user: 'root', cpu: 0.0, mem: 0.1, vsz: 225868, rss: 9416, tty: '?', stat: 'Ss', start: '12:00', time: '00:00:02', command: '/sbin/init' },
        { pid: 2, ppid: 0, user: 'root', cpu: 0.0, mem: 0.0, vsz: 0, rss: 0, tty: '?', stat: 'S', start: '12:00', time: '00:00:00', command: '[kthreadd]' },
        { pid: 1234, ppid: 1, user: 'favork', cpu: 0.2, mem: 1.5, vsz: 123456, rss: 12345, tty: 'pts/0', stat: 'S+', start: '12:30', time: '00:00:01', command: '/bin/bash' },
        { pid: 1235, ppid: 1234, user: 'favork', cpu: 0.1, mem: 0.8, vsz: 67890, rss: 6789, tty: 'pts/0', stat: 'R+', start: '12:31', time: '00:00:00', command: 'ps' }
      ]
      
      let filteredProcesses = processes
      
      if (!showAll && !extendedFormat) {
        filteredProcesses = processes.filter(p => p.user === 'favork' && p.tty !== '?')
      }
      
      if (fullFormat) {
        const header = 'UID        PID  PPID  C STIME TTY          TIME CMD'
        const lines = [header]
        
        filteredProcesses.forEach(p => {
          const uid = p.user.padEnd(8)
          const pid = p.pid.toString().padStart(5)
          const ppid = p.ppid.toString().padStart(5)
          const cpu = p.cpu.toFixed(1).padStart(2)
          const stime = p.start.padEnd(5)
          const tty = p.tty.padEnd(12)
          const time = p.time.padEnd(8)
          const cmd = p.command
          
          lines.push(`${uid} ${pid} ${ppid} ${cpu} ${stime} ${tty} ${time} ${cmd}`)
        })
        
        return lines.join('\n')
      } else if (userFormat) {
        const header = 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND'
        const lines = [header]
        
        filteredProcesses.forEach(p => {
          const user = p.user.padEnd(8)
          const pid = p.pid.toString().padStart(5)
          const cpu = p.cpu.toFixed(1).padStart(4)
          const mem = p.mem.toFixed(1).padStart(4)
          const vsz = p.vsz.toString().padStart(7)
          const rss = p.rss.toString().padStart(6)
          const tty = p.tty.padEnd(8)
          const stat = p.stat.padEnd(4)
          const start = p.start.padEnd(5)
          const time = p.time.padEnd(8)
          const command = p.command
          
          lines.push(`${user} ${pid} ${cpu} ${mem} ${vsz} ${rss} ${tty} ${stat} ${start} ${time} ${command}`)
        })
        
        return lines.join('\n')
      } else {
        const header = '  PID TTY          TIME CMD'
        const lines = [header]
        
        filteredProcesses.forEach(p => {
          const pid = p.pid.toString().padStart(5)
          const tty = p.tty.padEnd(12)
          const time = p.time.padEnd(8)
          const cmd = p.command.split('/').pop()
          
          lines.push(`${pid} ${tty} ${time} ${cmd}`)
        })
        
        return lines.join('\n')
      }
    },
    description: 'Display running processes|显示运行中的进程',
    category: 'system',
    examples: [
      'ps',
      'ps -a',
      'ps -f',
      'ps -u',
      'ps aux'
    ]
  },

  top: {
    handler: (args, context, fs) => {
      const currentTime = new Date().toLocaleTimeString()
      const uptime = '1:23'
      const users = '2'
      const loadAvg = '0.08, 0.12, 0.15'
      
      const header = [
        `top - ${currentTime} up ${uptime}, ${users} users, load average: ${loadAvg}`,
        'Tasks:   6 total,   1 running,   5 sleeping,   0 stopped,   0 zombie',
        '%Cpu(s):  2.3 us,  1.2 sy,  0.0 ni, 96.3 id,  0.2 wa,  0.0 hi,  0.0 si,  0.0 st',
        'MiB Mem :   7982.4 total,   1234.5 free,   2345.6 used,   4402.3 buff/cache',
        'MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   5234.8 avail Mem',
        '',
        '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND'
      ]
      
      const processes = [
        '    1 root      20   0  225868   9416   6784 S   0.0   0.1   0:02.34 systemd',
        '    2 root      20   0       0      0      0 S   0.0   0.0   0:00.01 kthreadd',
        ' 1234 favork    20   0  123456  12345   8901 S   0.2   1.5   0:01.23 bash',
        ' 1235 favork    20   0   67890   6789   4567 R   0.1   0.8   0:00.12 top'
      ]
      
      return [...header, ...processes].join('\n')
    },
    description: 'Display real-time system process information|显示系统进程实时信息',
    category: 'system',
    examples: ['top']
  },

  kill: {
    handler: (args, context, fs) => {
      if (args.length === 0) {
        throw new Error('kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]')
      }
      
      if (args.includes('-l')) {
        return ` 1) SIGHUP       2) SIGINT       3) SIGQUIT      4) SIGILL       5) SIGTRAP
 6) SIGABRT      7) SIGBUS       8) SIGFPE       9) SIGKILL     10) SIGUSR1
11) SIGSEGV     12) SIGUSR2     13) SIGPIPE     14) SIGALRM     15) SIGTERM`
      }
      
      let signal = 'TERM'
      let pids = []
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (arg === '-s' && i + 1 < args.length) {
          signal = args[i + 1]
          i++
        } else if (arg.startsWith('-') && arg !== '-l') {
          signal = arg.substring(1)
        } else if (!isNaN(parseInt(arg))) {
          pids.push(parseInt(arg))
        }
      }
      
      if (pids.length === 0) {
        throw new Error('kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]')
      }
      
      const results = []
      for (const pid of pids) {
        if (pid === 1) {
          results.push(`kill: (${pid}) - Operation not permitted`)
        } else if (pid < 1 || pid > 65535) {
          results.push(`kill: (${pid}) - No such process`)
        }
      }
      
      return results.join('\n')
    },
    description: 'Terminate processes|终止进程',
    category: 'system',
    requiresArgs: true,
    examples: [
      'kill 1234',
      'kill -9 1234',
      'kill -s TERM 1234',
      'kill -l'
    ]
  },

  uname: {
    handler: (args, context, fs) => {
      const systemInfo = {
        kernelName: 'Linux',
        nodename: 'linuxdojo',
        kernelRelease: '5.15.0-generic',
        kernelVersion: '#72-Ubuntu SMP Tue Nov 23 20:14:38 UTC 2021',
        machine: 'x86_64',
        processor: 'x86_64',
        hardwarePlatform: 'x86_64',
        operatingSystem: 'GNU/Linux'
      }
      
      if (args.includes('-a') || args.includes('--all')) {
        return `${systemInfo.kernelName} ${systemInfo.nodename} ${systemInfo.kernelRelease} ${systemInfo.kernelVersion} ${systemInfo.machine} ${systemInfo.processor} ${systemInfo.hardwarePlatform} ${systemInfo.operatingSystem}`
      }
      
      if (args.includes('-s') || args.includes('--kernel-name') || args.length === 0) {
        return systemInfo.kernelName
      }
      
      if (args.includes('-n') || args.includes('--nodename')) {
        return systemInfo.nodename
      }
      
      if (args.includes('-r') || args.includes('--kernel-release')) {
        return systemInfo.kernelRelease
      }
      
      if (args.includes('-v') || args.includes('--kernel-version')) {
        return systemInfo.kernelVersion
      }
      
      if (args.includes('-m') || args.includes('--machine')) {
        return systemInfo.machine
      }
      
      return systemInfo.kernelName
    },
    description: 'Display system information|显示系统信息',
    category: 'system',
    examples: [
      'uname',
      'uname -a',
      'uname -r',
      'uname -m'
    ]
  },

  whoami: {
    handler: (args, context, fs) => {
      return 'favork'
    },
    description: 'Display current username|显示当前用户名',
    category: 'system',
    examples: ['whoami']
  },

  id: {
    handler: (args, context, fs) => {
      const user = args.length > 0 ? args[0] : 'favork'
      
      if (args.includes('-u')) {
        return args.includes('-n') ? user : '1000'
      }
      
      if (args.includes('-g')) {
        return args.includes('-n') ? user : '1000'
      }
      
      if (args.includes('-G')) {
        return args.includes('-n') ? `${user} sudo docker` : '1000 27 999'
      }
      
      return `uid=1000(${user}) gid=1000(${user}) groups=1000(${user}),27(sudo),999(docker)`
    },
    description: 'Display user and group information|显示用户和组信息',
    category: 'system',
    examples: [
      'id',
      'id favork',
      'id -u',
      'id -g'
    ]
  },

  uptime: {
    handler: (args, context, fs) => {
      const currentTime = new Date().toLocaleTimeString()
      const uptime = '1 day, 2:34'
      const users = '2'
      const loadAvg = '0.08, 0.12, 0.15'
      
      return ` ${currentTime} up ${uptime}, ${users} users, load average: ${loadAvg}`
    },
    description: 'Display system uptime|显示系统运行时间',
    category: 'system',
    examples: ['uptime']
  },

  free: {
    handler: (args, context, fs) => {
      const humanReadable = args.includes('-h')
      const showMega = args.includes('-m')
      
      if (humanReadable) {
        return `              total        used        free      shared  buff/cache   available
Mem:           7.8G        2.3G        1.2G        234M        4.4G        5.2G
Swap:          2.0G          0B        2.0G`
      } else if (showMega) {
        return `              total        used        free      shared  buff/cache   available
Mem:           7982        2345        1234         234        4402        5234
Swap:          2048           0        2048`
      } else {
        return `              total        used        free      shared  buff/cache   available
Mem:        8173568     2401280     1264640      239616     4507648     5361152
Swap:       2097152           0     2097152`
      }
    },
    description: 'Display memory usage|显示内存使用情况',
    category: 'system',
    examples: [
      'free',
      'free -h',
      'free -m'
    ]
  },

  df: {
    handler: (args, context, fs) => {
      const humanReadable = args.includes('-h')
      const showType = args.includes('-T')
      
      if (humanReadable) {
        const header = showType ? 
          'Filesystem     Type      Size  Used Avail Use% Mounted on' :
          'Filesystem      Size  Used Avail Use% Mounted on'
        
        const lines = [header]
        
        if (showType) {
          lines.push('/dev/sda1      ext4       20G  8.5G   11G  45% /')
          lines.push('tmpfs          tmpfs     3.9G     0  3.9G   0% /dev/shm')
          lines.push('/dev/sda2      ext4       50G   12G   36G  25% /home')
        } else {
          lines.push('/dev/sda1       20G  8.5G   11G  45% /')
          lines.push('tmpfs          3.9G     0  3.9G   0% /dev/shm')
          lines.push('/dev/sda2       50G   12G   36G  25% /home')
        }
        
        return lines.join('\n')
      } else {
        return `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1      20971520 8912896  11534336  45% /
tmpfs           4086712       0   4086712   0% /dev/shm
/dev/sda2      52428800 12582912  37268992  25% /home`
      }
    },
    description: 'Display filesystem disk space usage|显示文件系统磁盘空间使用情况',
    category: 'system',
    examples: [
      'df',
      'df -h',
      'df -T'
    ]
  },

  du: {
    handler: (args, context, fs) => {
      const humanReadable = args.includes('-h')
      const summarize = args.includes('-s')
      
      const paths = args.filter(arg => !arg.startsWith('-'))
      const targetPath = paths.length > 0 ? paths[0] : '.'
      
      const sizes = {
        '.': 1024,
        './Documents': 512,
        './Downloads': 2048,
        './Pictures': 4096
      }
      
      if (summarize) {
        const totalSize = humanReadable ? '16K' : '16384'
        return `${totalSize}\t${targetPath}`
      }
      
      const results = []
      for (const [path, size] of Object.entries(sizes)) {
        if (path.startsWith(targetPath) || targetPath === '.') {
          const displaySize = humanReadable ? formatSize(size) : size.toString()
          results.push(`${displaySize}\t${path}`)
        }
      }
      
      return results.join('\n')
    },
    description: 'Display directory space usage|显示目录空间使用情况',
    category: 'system',
    examples: [
      'du',
      'du -h',
      'du -s'
    ]
  },

  date: {
    handler: (args, context, fs) => {
      const now = new Date()
      
      if (args.length === 0) {
        return now.toString()
      }
      
      if (args.includes('-u') || args.includes('--utc')) {
        return now.toUTCString()
      }
      
      if (args.includes('-I') || args.includes('--iso-8601')) {
        return now.toISOString().split('T')[0]
      }
      
      // 处理格式化字符串
      const formatArg = args.find(arg => arg.startsWith('+'))
      if (formatArg) {
        const format = formatArg.substring(1)
        return formatDate(now, format)
      }
      
      return now.toString()
    },
    description: 'Display or set system date|显示或设置系统日期',
    category: 'system',
    examples: [
      'date',
      'date -u',
      'date +"%Y-%m-%d %H:%M:%S"',
      'date --iso-8601'
    ]
  },

  env: {
    handler: (args, context, fs) => {
      const environment = {
        'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        'HOME': '/home/favork',
        'USER': 'favork',
        'SHELL': '/bin/bash',
        'TERM': 'xterm-256color',
        'LANG': 'en_US.UTF-8',
        'PWD': fs.currentPath || '/home/favork',
        'OLDPWD': '/home/favork',
        'EDITOR': 'vim',
        'PAGER': 'less'
      }
      
      if (args.length === 0) {
        return Object.entries(environment)
          .map(([key, value]) => `${key}=${value}`)
          .join('\n')
      }
      
      // 处理特定变量查询
      const varName = args[0]
      if (environment[varName]) {
        return environment[varName]
      }
      
      return ''
    },
    description: 'Display environment variables|显示环境变量',
    category: 'system',
    examples: [
      'env',
      'env PATH',
      'env HOME'
    ]
  }
}

// 工具函数
function formatSize(bytes) {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + 'K'
  if (bytes < 1024 * 1024 * 1024) return Math.round(bytes / (1024 * 1024)) + 'M'
  return Math.round(bytes / (1024 * 1024 * 1024)) + 'G'
}

function formatDate(date, format) {
  const replacements = {
    '%Y': date.getFullYear(),
    '%m': String(date.getMonth() + 1).padStart(2, '0'),
    '%d': String(date.getDate()).padStart(2, '0'),
    '%H': String(date.getHours()).padStart(2, '0'),
    '%M': String(date.getMinutes()).padStart(2, '0'),
    '%S': String(date.getSeconds()).padStart(2, '0'),
    '%A': date.toLocaleDateString('en-US', { weekday: 'long' }),
    '%B': date.toLocaleDateString('en-US', { month: 'long' })
  }
  
  let result = format
  for (const [pattern, replacement] of Object.entries(replacements)) {
    result = result.replace(new RegExp(pattern, 'g'), replacement)
  }
  
  return result
}