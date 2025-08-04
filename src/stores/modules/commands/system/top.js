/**
 * top - 显示和更新排序的运行进程
 */

export const top = {
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return top.help
    }

    const batchMode = args.includes('-b') || args.includes('--batch')
    const iterations = getOptionValue(args, '-n') || getOptionValue(args, '--iterations') || (batchMode ? 1 : null)
    const delay = getOptionValue(args, '-d') || getOptionValue(args, '--delay') || 3.0
    const pid = getOptionValue(args, '-p') || getOptionValue(args, '--pid')
    const user = getOptionValue(args, '-u') || getOptionValue(args, '--user')
    const sortField = getOptionValue(args, '-o') || getOptionValue(args, '--sort-override') || 'cpu'
    const threads = args.includes('-H') || args.includes('--threads')
    const idle = !args.includes('-i') && !args.includes('--idle')
    
    // 生成系统信息和进程数据
    const systemInfo = generateSystemInfo()
    const processes = generateTopProcesses()
    
    // 过滤进程
    let filteredProcesses = processes
    
    if (pid) {
      const pids = pid.split(',').map(p => parseInt(p.trim()))
      filteredProcesses = processes.filter(p => pids.includes(p.pid))
    }
    
    if (user) {
      filteredProcesses = processes.filter(p => p.user === user)
    }
    
    if (!idle) {
      filteredProcesses = processes.filter(p => p.cpu > 0 || p.stat.includes('R'))
    }
    
    // 排序进程
    filteredProcesses = sortTopProcesses(filteredProcesses, sortField)
    
    // 格式化输出
    let output = ''
    
    // 系统信息头部
    output += formatSystemHeader(systemInfo)
    output += '\n'
    
    // 进程列表
    output += formatProcessList(filteredProcesses, threads)
    
    if (batchMode) {
      return output
    } else {
      // 交互模式提示
      output += '\n\n--- Interactive mode simulation ---'
      output += '\nPress q to quit, h for help, k to kill process'
      output += `\nRefresh every ${delay} seconds`
      if (iterations) {
        output += ` for ${iterations} iterations`
      }
      return output
    }
  },
  description: 'Display and update sorted information of running processes|显示和更新排序的运行进程',
  category: 'system',
  requiresArgs: false,
  options: [
    {
      flag: '-b',
      longFlag: '--batch',
      description: '以批处理模式运行',
      type: 'boolean',
      group: '运行模式'
    },
    {
      flag: '-n',
      longFlag: '--iterations',
      description: '最大迭代次数',
      type: 'number',
      inputKey: 'iterations',
      placeholder: '1',
      group: '运行控制'
    },
    {
      flag: '-d',
      longFlag: '--delay',
      description: '更新间隔时间（秒）',
      type: 'number',
      inputKey: 'delay',
      placeholder: '3.0',
      group: '运行控制'
    },
    {
      flag: '-p',
      longFlag: '--pid',
      description: '监控指定进程ID',
      type: 'input',
      inputKey: 'pid_list',
      placeholder: '1234,5678',
      group: '进程选择'
    },
    {
      flag: '-u',
      longFlag: '--user',
      description: '显示指定用户的进程',
      type: 'input',
      inputKey: 'username',
      placeholder: 'root',
      group: '进程选择'
    },
    {
      flag: '-o',
      longFlag: '--sort-override',
      description: '按指定字段排序',
      type: 'select',
      inputKey: 'sort_field',
      options: ['%cpu', '%mem', 'pid', 'ppid', 'user', 'time', 'command'],
      optionLabels: ['CPU使用率', '内存使用率', '进程ID', '父进程ID', '用户', '运行时间', '命令'],
      default: '%cpu',
      group: '显示选项'
    },
    {
      flag: '-H',
      longFlag: '--threads',
      description: '显示单独的线程',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-i',
      longFlag: '--idle',
      description: '不显示空闲进程',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-c',
      longFlag: '--command-name',
      description: '显示命令名称/行',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-s',
      longFlag: '--secure',
      description: '以安全模式运行',
      type: 'boolean',
      group: '安全选项'
    },
    {
      flag: '-w',
      longFlag: '--width',
      description: '覆盖输出宽度',
      type: 'number',
      inputKey: 'width',
      placeholder: '80',
      group: '显示选项'
    },
    {
      flag: '-1',
      longFlag: '--single-cpu-toggle',
      description: '单CPU切换（显示单独的CPU）',
      type: 'boolean',
      group: '显示选项'
    }
  ],
  examples: [
    'top                          # Display running processes interactively|交互式显示运行进程',
    'top -b                       # Run in batch mode|以批处理模式运行',
    'top -n 1                     # Run for 1 iteration only|只运行1次迭代',
    'top -d 5                     # Update every 5 seconds|每5秒更新一次',
    'top -p 1234                  # Monitor specific process|监控特定进程',
    'top -u username              # Show processes for user|显示特定用户的进程',
    'top -o %MEM                  # Sort by memory usage|按内存使用率排序',
    'top -H                       # Show individual threads|显示单独的线程'
  ],
  help: `Usage: top [options]

Options:
  -b, --batch               use batch mode operation
  -c, --command-name        show command name/line
  -d, --delay=SECS          delay time interval as:  -d ss.t (secs.tenths)
  -e, --scale-summary-mem=k scale summary memory to KiB/MiB/GiB/TiB/PiB
  -e, --scale-task-mem=k    scale task memory to KiB/MiB/GiB/TiB/PiB
  -H, --threads             show individual threads
  -i, --idle                do not show idle processes
  -n, --iterations=N        maximum iterations limit as:  -n number
  -o, --sort-override=FIELD force sorting on field name
  -O, --list-fields         list all field names and exit
  -p, --pid=PIDLIST         monitor only processes with specified process IDs
  -s, --secure              run in secure mode (disables kill, renice)
  -S, --accum-time-toggle   cumulative time mode toggle
  -u, --user=USERNAME       monitor only processes owned by USERNAME
  -U, --filter-any-user=U   show only processes owned by specified user(s)
  -w, --width[=COLUMNS]     override output width
  -1, --single-cpu-toggle   single cpu toggle (show individual CPUs)

Interactive commands:
  h,?   Help
  k     Kill a process
  q     Quit
  r     Renice a process
  s     Change delay time
  u     Show processes for a user
  1     Toggle single/separate CPU states
  c     Toggle command name/line
  f     Choose display fields
  o     Change sort field
  R     Reverse sort order
  W     Write configuration file

Sort field codes:
  %CPU  CPU usage
  %MEM  Memory usage
  TIME+ CPU Time, hundredths
  PID   Process Id
  PPID  Parent Process Id
  UID   User Id
  USER  User Name
  PR    Priority
  NI    Nice Value
  VIRT  Virtual Memory
  RES   Resident Memory
  SHR   Shared Memory
  S     Process Status
  COMMAND  Command Name/Line

For more details see top(1).`
}

// 生成系统信息
function generateSystemInfo() {
  const now = new Date()
  const uptime = '2 days, 14:32'
  const users = 3
  const loadAvg = [0.52, 0.48, 0.51]
  
  return {
    currentTime: now.toTimeString().split(' ')[0],
    uptime,
    users,
    loadAvg,
    tasks: {
      total: 287,
      running: 2,
      sleeping: 283,
      stopped: 0,
      zombie: 2
    },
    cpu: {
      us: 12.5,  // user
      sy: 3.2,   // system
      ni: 0.0,   // nice
      id: 84.1,  // idle
      wa: 0.2,   // wait
      hi: 0.0,   // hardware interrupts
      si: 0.0,   // software interrupts
      st: 0.0    // steal
    },
    memory: {
      total: 8192000,    // KB
      free: 2048000,
      used: 5120000,
      buffCache: 1024000,
      available: 3072000
    },
    swap: {
      total: 2048000,
      free: 2048000,
      used: 0,
      cached: 0
    }
  }
}

// 生成top进程数据
function generateTopProcesses() {
  return [
    {
      pid: 1234,
      user: 'user',
      pr: 20,
      ni: 0,
      virt: 524288,
      res: 98304,
      shr: 24576,
      stat: 'R',
      cpu: 25.3,
      mem: 1.2,
      time: '0:05.42',
      command: 'node server.js'
    },
    {
      pid: 5678,
      user: 'user',
      pr: 20,
      ni: 0,
      virt: 1048576,
      res: 204800,
      shr: 32768,
      stat: 'S',
      cpu: 15.8,
      mem: 2.5,
      time: '0:12.15',
      command: 'chrome --type=renderer'
    },
    {
      pid: 9999,
      user: 'root',
      pr: 20,
      ni: 0,
      virt: 786432,
      res: 53248,
      shr: 16384,
      stat: 'S',
      cpu: 8.2,
      mem: 0.6,
      time: '0:02.30',
      command: 'nginx: worker process'
    },
    {
      pid: 1111,
      user: 'user',
      pr: 20,
      ni: 0,
      virt: 262144,
      res: 32768,
      shr: 12288,
      stat: 'S',
      cpu: 3.1,
      mem: 0.4,
      time: '0:01.05',
      command: 'bash'
    },
    {
      pid: 2222,
      user: 'mysql',
      pr: 20,
      ni: 0,
      virt: 1572864,
      res: 409600,
      shr: 65536,
      stat: 'S',
      cpu: 2.8,
      mem: 5.0,
      time: '1:25.33',
      command: 'mysqld'
    },
    {
      pid: 3333,
      user: 'www-data',
      pr: 20,
      ni: 0,
      virt: 131072,
      res: 16384,
      shr: 8192,
      stat: 'S',
      cpu: 1.5,
      mem: 0.2,
      time: '0:00.45',
      command: 'apache2'
    },
    {
      pid: 4444,
      user: 'user',
      pr: 20,
      ni: 0,
      virt: 65536,
      res: 8192,
      shr: 4096,
      stat: 'S',
      cpu: 0.8,
      mem: 0.1,
      time: '0:00.12',
      command: 'vim'
    },
    {
      pid: 1,
      user: 'root',
      pr: 20,
      ni: 0,
      virt: 225280,
      res: 9472,
      shr: 6144,
      stat: 'S',
      cpu: 0.0,
      mem: 0.1,
      time: '0:00.02',
      command: '/sbin/init'
    }
  ]
}

// 排序top进程
function sortTopProcesses(processes, sortField) {
  return processes.sort((a, b) => {
    let aVal, bVal
    
    switch (sortField.toLowerCase()) {
      case 'cpu':
      case '%cpu':
        aVal = a.cpu
        bVal = b.cpu
        break
      case 'mem':
      case '%mem':
        aVal = a.mem
        bVal = b.mem
        break
      case 'pid':
        aVal = a.pid
        bVal = b.pid
        break
      case 'user':
        aVal = a.user
        bVal = b.user
        break
      case 'time':
      case 'time+':
        aVal = parseTime(a.time)
        bVal = parseTime(b.time)
        break
      case 'virt':
        aVal = a.virt
        bVal = b.virt
        break
      case 'res':
        aVal = a.res
        bVal = b.res
        break
      case 'command':
        aVal = a.command
        bVal = b.command
        break
      default:
        aVal = a.cpu
        bVal = b.cpu
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return bVal - aVal // 降序
    } else {
      return String(aVal).localeCompare(String(bVal))
    }
  })
}

// 解析时间字符串为秒数
function parseTime(timeStr) {
  const parts = timeStr.split(':')
  if (parts.length === 2) {
    const [minutes, seconds] = parts
    return parseInt(minutes) * 60 + parseFloat(seconds)
  }
  return 0
}

// 格式化系统头部信息
function formatSystemHeader(info) {
  let output = ''
  
  // 第一行：时间、运行时间、用户数、负载平均值
  output += `top - ${info.currentTime} up ${info.uptime}, ${info.users} users, load average: ${info.loadAvg.join(', ')}\n`
  
  // 第二行：任务信息
  output += `Tasks: ${info.tasks.total} total, ${info.tasks.running} running, ${info.tasks.sleeping} sleeping, ${info.tasks.stopped} stopped, ${info.tasks.zombie} zombie\n`
  
  // 第三行：CPU信息
  output += `%Cpu(s): ${info.cpu.us.toFixed(1)} us, ${info.cpu.sy.toFixed(1)} sy, ${info.cpu.ni.toFixed(1)} ni, ${info.cpu.id.toFixed(1)} id, ${info.cpu.wa.toFixed(1)} wa, ${info.cpu.hi.toFixed(1)} hi, ${info.cpu.si.toFixed(1)} si, ${info.cpu.st.toFixed(1)} st\n`
  
  // 第四行：内存信息
  const memTotal = Math.floor(info.memory.total / 1024)
  const memFree = Math.floor(info.memory.free / 1024)
  const memUsed = Math.floor(info.memory.used / 1024)
  const memBuffCache = Math.floor(info.memory.buffCache / 1024)
  output += `MiB Mem : ${memTotal.toFixed(1)} total, ${memFree.toFixed(1)} free, ${memUsed.toFixed(1)} used, ${memBuffCache.toFixed(1)} buff/cache\n`
  
  // 第五行：交换分区信息
  const swapTotal = Math.floor(info.swap.total / 1024)
  const swapFree = Math.floor(info.swap.free / 1024)
  const swapUsed = Math.floor(info.swap.used / 1024)
  const swapCached = Math.floor(info.swap.cached / 1024)
  output += `MiB Swap: ${swapTotal.toFixed(1)} total, ${swapFree.toFixed(1)} free, ${swapUsed.toFixed(1)} used. ${Math.floor(info.memory.available / 1024).toFixed(1)} avail Mem`
  
  return output
}

// 格式化进程列表
function formatProcessList(processes, showThreads) {
  let output = '\n'
  
  // 表头
  output += '    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n'
  
  // 进程行
  for (const proc of processes.slice(0, 20)) { // 只显示前20个进程
    const virt = formatMemory(proc.virt)
    const res = formatMemory(proc.res)
    const shr = formatMemory(proc.shr)
    
    output += `${proc.pid.toString().padStart(7)} ${proc.user.padEnd(9)} ${proc.pr.toString().padStart(2)} ${proc.ni.toString().padStart(3)} ${virt.padStart(7)} ${res.padStart(6)} ${shr.padStart(6)} ${proc.stat} ${proc.cpu.toFixed(1).padStart(5)} ${proc.mem.toFixed(1).padStart(5)} ${proc.time.padStart(9)} ${proc.command}\n`
  }
  
  return output.trimEnd()
}

// 格式化内存大小
function formatMemory(bytes) {
  if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(0) + 'g'
  } else if (bytes >= 1024) {
    return (bytes / 1024).toFixed(0) + 'm'
  } else {
    return bytes.toString()
  }
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