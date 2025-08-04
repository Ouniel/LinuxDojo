import { formatHelp } from '../utils/helpFormatter.js'

export const who = {
  name: 'who',
  description: 'Show who is logged on|显示已登录的用户',
  
  options: [
    // 显示选项组
    {
      flag: '-a',
      longFlag: '--all',
      description: '显示所有信息（等同于 -b -d --login -p -r -t -T -u）',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-H',
      longFlag: '--heading',
      description: '显示列标题行',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-s',
      longFlag: '--short',
      description: '仅显示名称、行和时间（默认）',
      type: 'boolean',
      group: '显示选项'
    },
    
    // 用户信息组
    {
      flag: '-u',
      longFlag: '--users',
      description: '列出已登录用户的详细信息',
      type: 'boolean',
      group: '用户信息'
    },
    {
      flag: '-T',
      longFlag: '--mesg',
      description: '显示用户消息状态（+, -, ?）',
      type: 'boolean',
      group: '用户信息'
    },
    {
      flag: '-w',
      longFlag: '--writable',
      description: '显示用户终端是否可写',
      type: 'boolean',
      group: '用户信息'
    },
    
    // 系统信息组
    {
      flag: '-b',
      longFlag: '--boot',
      description: '显示上次系统启动时间',
      type: 'boolean',
      group: '系统信息'
    },
    {
      flag: '-r',
      longFlag: '--runlevel',
      description: '显示当前运行级别',
      type: 'boolean',
      group: '系统信息'
    },
    {
      flag: '-t',
      longFlag: '--time',
      description: '显示上次系统时钟更改时间',
      type: 'boolean',
      group: '系统信息'
    },
    
    // 进程信息组
    {
      flag: '-l',
      longFlag: '--login',
      description: '显示系统登录进程',
      type: 'boolean',
      group: '进程信息'
    },
    {
      flag: '-p',
      longFlag: '--process',
      description: '显示由init生成的活动进程',
      type: 'boolean',
      group: '进程信息'
    },
    {
      flag: '-d',
      longFlag: '--dead',
      description: '显示死进程',
      type: 'boolean',
      group: '进程信息'
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
        name: 'who',
        description: 'Show who is logged on|显示已登录的用户',
        usage: 'who [OPTIONS] [FILE | ARG1 ARG2]|who [选项] [文件 | 参数1 参数2]',
        options: [
          '-a, --all            Same as -b -d --login -p -r -t -T -u|等同于-b -d --login -p -r -t -T -u',
          '-b, --boot           Time of last system boot|上次系统启动时间',
          '-d, --dead           Print dead processes|打印死进程',
          '-H, --heading        Print line of column headings|打印列标题行',
          '-l, --login          Print system login processes|打印系统登录进程',
          '-p, --process        Print active processes spawned by init|打印由init生成的活动进程',
          '-r, --runlevel       Print current runlevel|打印当前运行级别',
          '-s, --short          Print only name, line, and time (default)|仅打印名称、行和时间（默认）',
          '-t, --time           Print last system clock change|打印上次系统时钟更改',
          '-u, --users          List users logged in|列出已登录用户',
          '-T, -w, --mesg       Add user\'s message status as +, - or ?|添加用户消息状态为+、-或?'
        ],
        examples: [
          'who|显示已登录用户',
          'who -H|显示带标题的用户列表',
          'who -u|显示用户详细信息',
          'who -a|显示所有信息',
          'who -b|显示系统启动时间'
        ],
        notes: [
          'Default behavior shows logged in users|默认行为显示已登录用户',
          'Information is simulated in this environment|在此环境中信息是模拟的'
        ]
      })
    }
    
    const options = {
      all: false,
      boot: false,
      dead: false,
      heading: false,
      login: false,
      process: false,
      runlevel: false,
      short: false,
      time: false,
      users: false,
      message: false,
      writable: false
    }
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-a' || arg === '--all') {
        options.all = true
      } else if (arg === '-b' || arg === '--boot') {
        options.boot = true
      } else if (arg === '-d' || arg === '--dead') {
        options.dead = true
      } else if (arg === '-H' || arg === '--heading') {
        options.heading = true
      } else if (arg === '-l' || arg === '--login') {
        options.login = true
      } else if (arg === '-p' || arg === '--process') {
        options.process = true
      } else if (arg === '-r' || arg === '--runlevel') {
        options.runlevel = true
      } else if (arg === '-s' || arg === '--short') {
        options.short = true
      } else if (arg === '-t' || arg === '--time') {
        options.time = true
      } else if (arg === '-u' || arg === '--users') {
        options.users = true
      } else if (arg === '-T' || arg === '-w' || arg === '--mesg' || arg === '--message' || arg === '--writable') {
        options.message = true
        options.writable = true
      } else if (arg.startsWith('-')) {
        return `who: invalid option: ${arg}`
      }
    }
    
    // 如果使用-a选项，启用所有选项
    if (options.all) {
      options.boot = true
      options.dead = true
      options.login = true
      options.process = true
      options.runlevel = true
      options.time = true
      options.users = true
      options.message = true
      options.writable = true
    }
    
    const results = []
    const now = new Date()
    
    // 添加标题行
    if (options.heading) {
      if (options.message) {
        results.push('NAME       LINE         TIME             COMMENT')
      } else {
        results.push('NAME     LINE         TIME         COMMENT')
      }
    }
    
    // 模拟的登录用户数据
    const loggedInUsers = [
      {
        name: 'user',
        line: 'console',
        time: new Date(now.getTime() - 3600000), // 1小时前
        host: 'localhost',
        pid: 1234,
        status: '+'
      },
      {
        name: 'admin',
        line: 'pts/0',
        time: new Date(now.getTime() - 1800000), // 30分钟前
        host: '192.168.1.100',
        pid: 2345,
        status: '+'
      },
      {
        name: 'guest',
        line: 'pts/1',
        time: new Date(now.getTime() - 900000), // 15分钟前
        host: '192.168.1.101',
        pid: 3456,
        status: '-'
      }
    ]
    
    // 显示系统启动时间
    if (options.boot) {
      const bootTime = new Date(now.getTime() - 86400000) // 1天前
      results.push(`         system boot  ${bootTime.toISOString().slice(0, 16).replace('T', ' ')}`)
    }
    
    // 显示运行级别
    if (options.runlevel) {
      results.push(`         run-level 5  ${now.toISOString().slice(0, 16).replace('T', ' ')}`)
    }
    
    // 显示时钟更改
    if (options.time) {
      results.push(`         clock change ${now.toISOString().slice(0, 16).replace('T', ' ')}`)
    }
    
    // 显示登录用户
    for (const user of loggedInUsers) {
      let line = ''
      
      if (options.message || options.writable) {
        line = `${user.name.padEnd(8)} ${user.status} ${user.line.padEnd(12)} ${user.time.toISOString().slice(0, 16).replace('T', ' ')}`
      } else {
        line = `${user.name.padEnd(8)} ${user.line.padEnd(12)} ${user.time.toISOString().slice(0, 16).replace('T', ' ')}`
      }
      
      if (user.host && user.host !== 'localhost') {
        line += ` (${user.host})`
      }
      
      if (options.users && user.pid) {
        line += `   ${user.pid}`
      }
      
      results.push(line)
    }
    
    // 显示登录进程
    if (options.login) {
      results.push('LOGIN    tty1         2024-01-01 00:00             id=1')
      results.push('LOGIN    tty2         2024-01-01 00:00             id=2')
    }
    
    // 显示死进程
    if (options.dead) {
      results.push('         term/0       2024-01-01 12:00   1234 id=t0  term=0 exit=0')
    }
    
    // 显示活动进程
    if (options.process) {
      results.push('         ?            2024-01-01 00:00   1 id=si   term=0 exit=0')
    }
    
    return results.join('\n')
  }
}