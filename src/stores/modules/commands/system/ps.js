/**
 * ps - 显示当前运行的进程
 */

export const ps = {
  name: 'ps',
  description: 'Display information about running processes|显示当前运行的进程',
  usage: 'ps [options]',
  category: 'system',
  options: [
    {
      flag: '-A',
      longFlag: '--all',
      description: '显示所有进程',
      type: 'boolean',
      group: '选择选项'
    },
    {
      flag: '-e',
      description: '显示所有进程',
      type: 'boolean',
      group: '选择选项'
    },
    {
      flag: '-f',
      longFlag: '--full',
      description: '完整格式，包括命令行',
      type: 'boolean',
      group: '输出格式'
    },
    {
      flag: '-l',
      longFlag: '--long',
      description: '长格式',
      type: 'boolean',
      group: '输出格式'
    },
    {
      flag: '-u',
      longFlag: '--user',
      description: '面向用户的格式',
      type: 'boolean',
      group: '输出格式'
    },
    {
      flag: '-F',
      longFlag: '--extra-full',
      description: '额外完整格式',
      type: 'boolean',
      group: '输出格式'
    },
    {
      flag: 'aux',
      description: 'BSD格式显示所有进程',
      type: 'boolean',
      group: '输出格式'
    },
    {
      flag: '-H',
      longFlag: '--forest',
      description: '显示进程树',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-T',
      longFlag: '--show-threads',
      description: '显示线程',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '--no-headers',
      description: '不显示表头',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '--sort',
      description: '按指定字段排序',
      type: 'select',
      inputKey: 'sort_field',
      options: ['%cpu', '%mem', 'pid', 'ppid', 'user', 'time', 'command'],
      optionLabels: ['CPU使用率', '内存使用率', '进程ID', '父进程ID', '用户', '运行时间', '命令'],
      group: '排序选项'
    },
    {
      flag: '-o',
      longFlag: '--format',
      description: '自定义输出列',
      type: 'input',
      inputKey: 'columns',
      placeholder: 'pid,ppid,user,cmd',
      group: '输出格式'
    },
    {
      flag: '-p',
      longFlag: '--pid',
      description: '指定进程ID',
      type: 'input',
      inputKey: 'pid_list',
      placeholder: '1234,5678',
      group: '选择选项'
    },
    {
      flag: '-U',
      longFlag: '--User',
      description: '指定用户',
      type: 'input',
      inputKey: 'user_list',
      placeholder: 'root,user',
      group: '选择选项'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return ps.help
    }

    const allProcesses = args.includes('-A') || args.includes('-e') || args.includes('--all')
    const fullFormat = args.includes('-f') || args.includes('--full')
    const longFormat = args.includes('-l') || args.includes('--long')
    const userFormat = args.includes('-u') || args.includes('--user')
    const extraFullFormat = args.includes('-F') || args.includes('--extra-full')
    const bsdFormat = args.includes('aux')
    const forest = args.includes('-H') || args.includes('--forest')
    const threads = args.includes('-T') || args.includes('--show-threads')
    const noHeaders = args.includes('--no-headers')
    const sortBy = getOptionValue(args, '--sort')
    const columns = getOptionValue(args, '-o') || getOptionValue(args, '--format')
    
    // 模拟进程数据
    const processes = generateMockProcesses()
    
    // 过滤进程
    let filteredProcesses = processes
    if (!allProcesses) {
      // 默认只显示当前用户的进程
      filteredProcesses = processes.filter(p => p.user === 'user')
    }
    
    // 排序
    if (sortBy) {
      filteredProcesses = sortProcesses(filteredProcesses, sortBy)
    }
    
    // 格式化输出
    let output = ''
    
    if (bsdFormat) {
      output = formatBSDStyle(filteredProcesses, noHeaders)
    } else if (fullFormat) {
      output = formatFullStyle(filteredProcesses, noHeaders)
    } else if (longFormat) {
      output = formatLongStyle(filteredProcesses, noHeaders)
    } else if (userFormat) {
      output = formatUserStyle(filteredProcesses, noHeaders)
    } else if (extraFullFormat) {
      output = formatExtraFullStyle(filteredProcesses, noHeaders)
    } else if (columns) {
      output = formatCustomColumns(filteredProcesses, columns, noHeaders)
    } else {
      output = formatDefaultStyle(filteredProcesses, noHeaders)
    }
    
    return output
  },
  requiresArgs: false,
  examples: [
    'ps                           # Show current user processes|显示当前用户进程',
    'ps -A                        # Show all processes|显示所有进程',
    'ps -ef                       # Show all processes in full format|以完整格式显示所有进程',
    'ps aux                       # Show all processes in BSD format|以BSD格式显示所有进程',
    'ps -u username               # Show processes for specific user|显示特定用户的进程',
    'ps --forest                  # Show process tree|显示进程树',
    'ps -o pid,ppid,cmd           # Show custom columns|显示自定义列',
    'ps --sort=-%cpu              # Sort by CPU usage|按CPU使用率排序'
  ],
  help: `Usage: ps [options]

Basic options:
 -A, -e               all processes
 -a                   all with tty, except session leaders
  a                   all with tty, including other users
 -d                   all except session leaders
 -N, --deselect       negate selection
  r                   only running processes
  T                   all processes on this terminal
  x                   processes without controlling ttys

Selection by list:
 -C <command>         command name
 -G, --Group <GID>    real group id or name
 -g, --group <group>  session or effective group name
 -p, --pid <PID>      process id
     --ppid <PID>     parent process id
 -q, --quick-pid <PID>
                      process id (quick mode)
 -s, --sid <session>  session id
 -t, --tty <tty>      terminal
 -u, --user <UID>     effective user id or name
 -U, --User <UID>     real user id or name

  The selection options take as their argument either:
    a comma-separated list e.g. '-u root,nobody' or
    a blank-separated list e.g. '-u root nobody'

Output formats:
 -F                   extra full
 -f                   full-format, including command lines
 -j                   jobs format
  j                   BSD job control format
 -l                   long format
  l                   BSD long format
 -M, Z                add security data (for SELinux)
 -O <format>          preloaded with default columns
  O <format>          as -O, with BSD personality
 -o, o, --format <format>
                      user-defined format
  s                   signal format
  u                   user-oriented format
  v                   virtual memory format
  X                   register format
 -y                   do not show flags, show rss vs. addr (used with -l)
     --context        display security context (for SELinux)
     --headers        repeat header lines, one per page
     --no-headers     do not print header at all
     --cols, --columns, --width <num>
                      set screen width
     --rows, --lines <num>
                      set screen height

Show threads:
  H                   as if they were processes
 -L                   possibly with LWP and NLWP columns
 -m, m                after processes
 -T                   possibly with SPID column

Miscellaneous options:
 -c                   show scheduling class with -l option
  c                   show true command name
  e                   show the environment after command
  k,    --sort        specify sort order as: [+|-]key[,[+|-]key[,...]]
  L                   show format specifiers
  n                   display numeric uid and wchan
  S,    --cumulative  include some dead child process data
 -y                   do not show flags, show rss (only with -l)
 -V, V, --version     display version information and exit
 -w, w                unlimited output width

        --help <simple|list|output|threads|misc|all>
                      display help and exit

For more details see ps(1).`
}

// 生成模拟进程数据
function generateMockProcesses() {
  return [
    {
      pid: 1,
      ppid: 0,
      user: 'root',
      uid: 0,
      gid: 0,
      cpu: 0.0,
      mem: 0.1,
      vsz: 225280,
      rss: 9472,
      tty: '?',
      stat: 'Ss',
      start: '12:00',
      time: '00:00:02',
      command: '/sbin/init',
      args: '/sbin/init splash'
    },
    {
      pid: 2,
      ppid: 0,
      user: 'root',
      uid: 0,
      gid: 0,
      cpu: 0.0,
      mem: 0.0,
      vsz: 0,
      rss: 0,
      tty: '?',
      stat: 'S',
      start: '12:00',
      time: '00:00:00',
      command: '[kthreadd]',
      args: '[kthreadd]'
    },
    {
      pid: 1234,
      ppid: 1,
      user: 'user',
      uid: 1000,
      gid: 1000,
      cpu: 2.5,
      mem: 1.2,
      vsz: 524288,
      rss: 24576,
      tty: 'pts/0',
      stat: 'S+',
      start: '12:30',
      time: '00:01:15',
      command: 'bash',
      args: '-bash'
    },
    {
      pid: 5678,
      ppid: 1234,
      user: 'user',
      uid: 1000,
      gid: 1000,
      cpu: 15.2,
      mem: 3.8,
      vsz: 1048576,
      rss: 98304,
      tty: 'pts/0',
      stat: 'R+',
      start: '13:15',
      time: '00:05:42',
      command: 'node',
      args: 'node server.js'
    },
    {
      pid: 9999,
      ppid: 1,
      user: 'www-data',
      uid: 33,
      gid: 33,
      cpu: 0.8,
      mem: 2.1,
      vsz: 786432,
      rss: 53248,
      tty: '?',
      stat: 'S',
      start: '12:05',
      time: '00:02:30',
      command: 'nginx',
      args: 'nginx: worker process'
    }
  ]
}

// 排序进程
function sortProcesses(processes, sortBy) {
  const keys = sortBy.split(',')
  
  return processes.sort((a, b) => {
    for (const key of keys) {
      let field = key
      let reverse = false
      
      if (field.startsWith('-')) {
        reverse = true
        field = field.substring(1)
      } else if (field.startsWith('+')) {
        field = field.substring(1)
      }
      
      // 处理百分号字段
      if (field.startsWith('%')) {
        field = field.substring(1)
      }
      
      let aVal = a[field]
      let bVal = b[field]
      
      // 数值比较
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        const result = aVal - bVal
        if (result !== 0) {
          return reverse ? -result : result
        }
      } else {
        // 字符串比较
        const result = String(aVal).localeCompare(String(bVal))
        if (result !== 0) {
          return reverse ? -result : result
        }
      }
    }
    return 0
  })
}

// 默认格式
function formatDefaultStyle(processes, noHeaders) {
  let output = ''
  
  if (!noHeaders) {
    output += '    PID TTY          TIME CMD\n'
  }
  
  for (const proc of processes) {
    output += `${proc.pid.toString().padStart(7)} ${proc.tty.padEnd(12)} ${proc.time.padEnd(8)} ${proc.command}\n`
  }
  
  return output.trimEnd()
}

// BSD格式 (aux)
function formatBSDStyle(processes, noHeaders) {
  let output = ''
  
  if (!noHeaders) {
    output += 'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n'
  }
  
  for (const proc of processes) {
    output += `${proc.user.padEnd(12)} ${proc.pid.toString().padStart(5)} ${proc.cpu.toFixed(1).padStart(4)} ${proc.mem.toFixed(1).padStart(4)} ${proc.vsz.toString().padStart(6)} ${proc.rss.toString().padStart(5)} ${proc.tty.padEnd(8)} ${proc.stat.padEnd(4)} ${proc.start.padEnd(5)} ${proc.time.padEnd(8)} ${proc.args}\n`
  }
  
  return output.trimEnd()
}

// 完整格式 (-f)
function formatFullStyle(processes, noHeaders) {
  let output = ''
  
  if (!noHeaders) {
    output += 'UID        PID  PPID  C STIME TTY          TIME CMD\n'
  }
  
  for (const proc of processes) {
    output += `${proc.user.padEnd(10)} ${proc.pid.toString().padStart(5)} ${proc.ppid.toString().padStart(5)} ${proc.cpu.toFixed(0).padStart(2)} ${proc.start.padEnd(5)} ${proc.tty.padEnd(12)} ${proc.time.padEnd(8)} ${proc.args}\n`
  }
  
  return output.trimEnd()
}

// 长格式 (-l)
function formatLongStyle(processes, noHeaders) {
  let output = ''
  
  if (!noHeaders) {
    output += 'F S   UID     PID    PPID  C PRI  NI ADDR SZ WCHAN  TTY          TIME CMD\n'
  }
  
  for (const proc of processes) {
    output += `0 ${proc.stat.charAt(0)} ${proc.uid.toString().padStart(5)} ${proc.pid.toString().padStart(7)} ${proc.ppid.toString().padStart(7)} ${proc.cpu.toFixed(0).padStart(2)}  80   0    - ${Math.floor(proc.vsz/1024).toString().padStart(2)} -      ${proc.tty.padEnd(12)} ${proc.time.padEnd(8)} ${proc.command}\n`
  }
  
  return output.trimEnd()
}

// 用户格式 (-u)
function formatUserStyle(processes, noHeaders) {
  let output = ''
  
  if (!noHeaders) {
    output += 'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n'
  }
  
  for (const proc of processes) {
    output += `${proc.user.padEnd(12)} ${proc.pid.toString().padStart(5)} ${proc.cpu.toFixed(1).padStart(4)} ${proc.mem.toFixed(1).padStart(4)} ${proc.vsz.toString().padStart(6)} ${proc.rss.toString().padStart(5)} ${proc.tty.padEnd(8)} ${proc.stat.padEnd(4)} ${proc.start.padEnd(5)} ${proc.time.padEnd(8)} ${proc.command}\n`
  }
  
  return output.trimEnd()
}

// 额外完整格式 (-F)
function formatExtraFullStyle(processes, noHeaders) {
  let output = ''
  
  if (!noHeaders) {
    output += 'UID        PID  PPID  C    SZ   RSS PSR STIME TTY          TIME CMD\n'
  }
  
  for (const proc of processes) {
    output += `${proc.user.padEnd(10)} ${proc.pid.toString().padStart(5)} ${proc.ppid.toString().padStart(5)} ${proc.cpu.toFixed(0).padStart(2)} ${Math.floor(proc.vsz/1024).toString().padStart(5)} ${proc.rss.toString().padStart(5)}   0 ${proc.start.padEnd(5)} ${proc.tty.padEnd(12)} ${proc.time.padEnd(8)} ${proc.args}\n`
  }
  
  return output.trimEnd()
}

// 自定义列格式
function formatCustomColumns(processes, columns, noHeaders) {
  const columnList = columns.split(',').map(col => col.trim())
  let output = ''
  
  if (!noHeaders) {
    output += columnList.map(col => col.toUpperCase()).join(' ').padEnd(80) + '\n'
  }
  
  for (const proc of processes) {
    const values = columnList.map(col => {
      switch (col.toLowerCase()) {
        case 'pid': return proc.pid.toString()
        case 'ppid': return proc.ppid.toString()
        case 'user': return proc.user
        case 'uid': return proc.uid.toString()
        case 'gid': return proc.gid.toString()
        case 'cpu': case '%cpu': return proc.cpu.toFixed(1)
        case 'mem': case '%mem': return proc.mem.toFixed(1)
        case 'vsz': return proc.vsz.toString()
        case 'rss': return proc.rss.toString()
        case 'tty': return proc.tty
        case 'stat': return proc.stat
        case 'start': case 'stime': return proc.start
        case 'time': return proc.time
        case 'cmd': case 'command': return proc.command
        case 'args': return proc.args
        default: return '-'
      }
    })
    output += values.join(' ') + '\n'
  }
  
  return output.trimEnd()
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