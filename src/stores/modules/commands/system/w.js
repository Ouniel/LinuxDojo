import { formatHelp } from '../utils/helpFormatter.js'

export const w = {
  name: 'w',
  description: 'Show who is logged on and what they are doing|显示已登录用户及其活动',
  
  options: [
    // 显示格式组
    {
      flag: '-h',
      longFlag: '--no-header',
      description: '不显示标题行（系统信息和列标题）',
      type: 'boolean',
      group: '显示格式'
    },
    {
      flag: '-s',
      longFlag: '--short',
      description: '使用简短格式显示',
      type: 'boolean',
      group: '显示格式'
    },
    {
      flag: '-o',
      longFlag: '--old-style',
      description: '使用旧式输出格式',
      type: 'boolean',
      group: '显示格式'
    },
    
    // 信息选项组
    {
      flag: '-f',
      longFlag: '--from',
      description: '显示远程主机名字段',
      type: 'boolean',
      group: '信息选项'
    },
    
    // 输入参数
    {
      inputKey: 'target_user',
      description: '要查看的特定用户',
      type: 'input',
      placeholder: '用户名（留空显示所有用户）',
      required: false
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
        name: 'w',
        description: 'Show who is logged on and what they are doing|显示已登录用户及其活动',
        usage: 'w [OPTIONS] [USER]|w [选项] [用户]',
        options: [
          '-h, --no-header      Don\'t print header|不打印标题',
          '-s, --short          Use short format|使用简短格式',
          '-f, --from           Show remote hostname field|显示远程主机名字段',
          '-o, --old-style      Old style output|旧式输出'
        ],
        examples: [
          'w|显示所有用户活动',
          'w -s|简短格式显示',
          'w user|显示特定用户活动',
          'w -h|不显示标题行',
          'w -f admin|显示admin用户的详细信息'
        ],
        notes: [
          'Shows system uptime, load average, and user activity|显示系统运行时间、负载平均值和用户活动',
          'Information is simulated in this environment|在此环境中信息是模拟的',
          'IDLE time shows how long user has been inactive|IDLE时间显示用户不活动的时长'
        ]
      })
    }
    
    const options = {
      header: true,
      short: false,
      from: true,
      old: false
    }
    
    const users = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-h' || arg === '--no-header') {
        options.header = false
      } else if (arg === '-s' || arg === '--short') {
        options.short = true
      } else if (arg === '-f' || arg === '--from') {
        options.from = true
      } else if (arg === '-o' || arg === '--old-style') {
        options.old = true
      } else if (arg.startsWith('-')) {
        return `w: invalid option: ${arg}`
      } else {
        users.push(arg)
      }
    }
    
    const results = []
    const now = new Date()
    
    // 显示系统信息标题
    if (options.header) {
      const uptime = '1 day, 2:30'
      const loadAvg = '0.15, 0.12, 0.08'
      const userCount = 3
      
      results.push(` ${now.toTimeString().slice(0, 8)} up ${uptime}, ${userCount} users, load average: ${loadAvg}`)
      
      if (!options.short) {
        if (options.from) {
          results.push('USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT')
        } else {
          results.push('USER     TTY        LOGIN@   IDLE   JCPU   PCPU WHAT')
        }
      } else {
        results.push('USER     TTY        IDLE WHAT')
      }
    }
    
    // 模拟的用户活动数据
    const userActivities = [
      {
        user: 'user',
        tty: 'console',
        from: 'localhost',
        login: '09:30',
        idle: '2:15',
        jcpu: '0.45s',
        pcpu: '0.12s',
        what: 'vim document.txt'
      },
      {
        user: 'admin',
        tty: 'pts/0',
        from: '192.168.1.100',
        login: '10:15',
        idle: '0.00s',
        jcpu: '1.23s',
        pcpu: '0.05s',
        what: 'ssh server.example.com'
      },
      {
        user: 'guest',
        tty: 'pts/1',
        from: '192.168.1.101',
        login: '11:00',
        idle: '15:30',
        jcpu: '0.08s',
        pcpu: '0.01s',
        what: '-bash'
      },
      {
        user: 'developer',
        tty: 'pts/2',
        from: '192.168.1.102',
        login: '08:45',
        idle: '1:05',
        jcpu: '2.34s',
        pcpu: '0.23s',
        what: 'node server.js'
      }
    ]
    
    // 过滤用户（如果指定了特定用户）
    const filteredActivities = users.length > 0 
      ? userActivities.filter(activity => users.includes(activity.user))
      : userActivities
    
    if (filteredActivities.length === 0 && users.length > 0) {
      return `w: user '${users[0]}' not found`
    }
    
    // 显示用户活动
    for (const activity of filteredActivities) {
      let line = ''
      
      if (options.short) {
        line = `${activity.user.padEnd(8)} ${activity.tty.padEnd(10)} ${activity.idle.padEnd(4)} ${activity.what}`
      } else {
        if (options.from) {
          line = `${activity.user.padEnd(8)} ${activity.tty.padEnd(8)} ${activity.from.padEnd(16)} ${activity.login.padEnd(8)} ${activity.idle.padEnd(6)} ${activity.jcpu.padEnd(6)} ${activity.pcpu.padEnd(5)} ${activity.what}`
        } else {
          line = `${activity.user.padEnd(8)} ${activity.tty.padEnd(10)} ${activity.login.padEnd(8)} ${activity.idle.padEnd(6)} ${activity.jcpu.padEnd(6)} ${activity.pcpu.padEnd(5)} ${activity.what}`
        }
      }
      
      results.push(line)
    }
    
    return results.join('\n')
  }
}