/**
 * htop 命令实现
 * 交互式进程查看器
 */

export const htop = {
  name: 'htop',
  description: 'Interactive process viewer|交互式进程查看器',
  category: 'system',
  options: [
    {
      name: '-d, --delay',
      description: '设置更新间隔，以十分之一秒为单位',
      type: 'input',
      placeholder: '输入延迟时间 (如: 5 表示0.5秒)',
      group: 'display'
    },
    {
      name: '-u, --user',
      description: '仅显示指定用户的进程',
      type: 'input',
      placeholder: '输入用户名 (如: root, user)',
      group: 'filter'
    },
    {
      name: '-s, --sort-key',
      description: '按指定列排序',
      type: 'select',
      options: ['cpu', 'mem', 'pid', 'user', 'time', 'command'],
      group: 'display'
    },
    {
      name: '-t, --tree',
      description: '显示进程树视图',
      type: 'flag',
      group: 'display'
    },
    {
      name: '-C, --no-color',
      description: '禁用颜色显示',
      type: 'flag',
      group: 'display'
    },
    {
      name: '-p, --pid',
      description: '仅显示指定PID的进程',
      type: 'input',
      placeholder: '输入进程ID (如: 1234)',
      group: 'filter'
    },
    {
      name: '--help',
      description: '显示帮助信息',
      type: 'flag',
      group: 'help'
    },
    {
      name: '--version',
      description: '显示版本信息',
      type: 'flag',
      group: 'help'
    }
  ],
  
  async handler(args, context, fs) {
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
    try {
      // 解析选项
      let delay = 1.5
      let user = null
      let sortKey = 'cpu'
      let treeView = false
      let showHelp = false
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        if (arg === '-d' || arg === '--delay') {
          if (i + 1 < args.length) {
            delay = parseFloat(args[++i])
            if (isNaN(delay) || delay <= 0) {
              return {
                output: 'htop: invalid delay value|htop: 无效的延迟值',
                exitCode: 1
              }
            }
          }
        } else if (arg === '-u' || arg === '--user') {
          if (i + 1 < args.length) {
            user = args[++i]
          }
        } else if (arg === '-s' || arg === '--sort-key') {
          if (i + 1 < args.length) {
            sortKey = args[++i].toLowerCase()
          }
        } else if (arg === '-t' || arg === '--tree') {
          treeView = true
        } else if (arg === '--help') {
          showHelp = true
        } else if (arg.startsWith('-')) {
          return {
            output: `htop: invalid option: ${arg}|htop: 无效选项: ${arg}`,
            exitCode: 1
          }
        }
      }
      
      if (showHelp) {
        return {
          output: this.help.zh,
          exitCode: 0
        }
      }
      
      // 生成htop界面模拟
      const output = this.generateHtopInterface(delay, user, sortKey, treeView)
      
      return {
        output: output,
        exitCode: 0
      }
      
    } catch (error) {
      return {
        output: `htop: ${error.message}`,
        exitCode: 1
      }
    }
  },
  
  generateHtopInterface(delay, user, sortKey, treeView) {
    const now = new Date()
    const uptime = '2 days, 14:32:15'
    const loadAvg = '0.15, 0.18, 0.12'
    
    let output = []
    
    // 标题栏
    output.push('htop 3.2.1 - ' + now.toLocaleString())
    output.push('Uptime: ' + uptime + '  Load average: ' + loadAvg)
    output.push('')
    
    // CPU使用率条
    output.push('CPU[||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||  85.2%]')
    output.push('Mem[||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||      75.8%]')
    output.push('Swp[||||||||||||||||||||                                             32.1%]')
    output.push('')
    
    // 任务统计
    output.push('Tasks: 156 total, 2 running, 154 sleeping, 0 stopped, 0 zombie')
    output.push('')
    
    // 表头
    if (treeView) {
      output.push('  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command')
    } else {
      output.push('  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command')
    }
    
    output.push('─'.repeat(80))
    
    // 进程列表
    const processes = this.generateProcessList(user, sortKey, treeView)
    output.push(...processes)
    
    output.push('')
    output.push('F1Help F2Setup F3Search F4Filter F5Tree F6SortBy F7Nice- F8Nice+ F9Kill F10Quit')
    output.push('')
    output.push('[Note: This is a simulation. In real htop, you can interact with processes]')
    output.push('[注意: 这是模拟界面。在真实的htop中，您可以与进程交互]')
    
    return output.join('\n')
  },
  
  generateProcessList(user, sortKey, treeView) {
    const processes = [
      { pid: 1, user: 'root', pri: 20, ni: 0, virt: '225M', res: '9.2M', shr: '6.4M', state: 'S', cpu: 0.0, mem: 0.2, time: '0:01.23', command: 'systemd' },
      { pid: 2, user: 'root', pri: 20, ni: 0, virt: '0', res: '0', shr: '0', state: 'S', cpu: 0.0, mem: 0.0, time: '0:00.01', command: '[kthreadd]' },
      { pid: 1234, user: 'user', pri: 20, ni: 0, virt: '2.1G', res: '145M', shr: '89M', state: 'S', cpu: 15.2, mem: 3.6, time: '2:34.56', command: 'firefox' },
      { pid: 2345, user: 'user', pri: 20, ni: 0, virt: '1.2G', res: '234M', shr: '45M', state: 'R', cpu: 25.8, mem: 5.8, time: '1:23.45', command: 'chrome' },
      { pid: 3456, user: 'user', pri: 20, ni: 0, virt: '456M', res: '67M', shr: '23M', state: 'S', cpu: 5.4, mem: 1.7, time: '0:45.67', command: 'code' },
      { pid: 4567, user: 'root', pri: 20, ni: 0, virt: '123M', res: '12M', shr: '8M', state: 'S', cpu: 2.1, mem: 0.3, time: '0:12.34', command: 'sshd' },
      { pid: 5678, user: 'user', pri: 20, ni: 0, virt: '89M', res: '23M', shr: '15M', state: 'S', cpu: 1.2, mem: 0.6, time: '0:05.67', command: 'bash' },
      { pid: 6789, user: 'user', pri: 20, ni: 0, virt: '67M', res: '34M', shr: '12M', state: 'S', cpu: 0.8, mem: 0.8, time: '0:02.34', command: 'vim' }
    ]
    
    // 过滤用户
    let filteredProcesses = processes
    if (user) {
      filteredProcesses = processes.filter(p => p.user === user)
    }
    
    // 排序
    switch (sortKey) {
      case 'cpu':
        filteredProcesses.sort((a, b) => b.cpu - a.cpu)
        break
      case 'mem':
        filteredProcesses.sort((a, b) => b.mem - a.mem)
        break
      case 'pid':
        filteredProcesses.sort((a, b) => a.pid - b.pid)
        break
      case 'user':
        filteredProcesses.sort((a, b) => a.user.localeCompare(b.user))
        break
    }
    
    const result = []
    for (const proc of filteredProcesses.slice(0, 15)) { // 显示前15个进程
      const line = treeView && proc.pid > 100 ? 
        `  ${proc.pid.toString().padStart(5)} ${proc.user.padEnd(8)} ${proc.pri.toString().padStart(3)} ${proc.ni.toString().padStart(3)} ${proc.virt.padStart(6)} ${proc.res.padStart(6)} ${proc.shr.padStart(6)} ${proc.state} ${proc.cpu.toFixed(1).padStart(4)}% ${proc.mem.toFixed(1).padStart(4)}% ${proc.time.padStart(8)} ├─ ${proc.command}` :
        `  ${proc.pid.toString().padStart(5)} ${proc.user.padEnd(8)} ${proc.pri.toString().padStart(3)} ${proc.ni.toString().padStart(3)} ${proc.virt.padStart(6)} ${proc.res.padStart(6)} ${proc.shr.padStart(6)} ${proc.state} ${proc.cpu.toFixed(1).padStart(4)}% ${proc.mem.toFixed(1).padStart(4)}% ${proc.time.padStart(8)} ${proc.command}`
      
      result.push(line)
    }
    
    return result
  },
  
  help: {
    'en': `htop - Interactive process viewer

SYNOPSIS
    htop [options]

DESCRIPTION
    htop is an interactive process viewer for Unix systems. It is a text-mode
    application and requires ncurses. htop is similar to top, but allows you
    to scroll vertically and horizontally.

OPTIONS
    -d, --delay=DELAY     Set the delay between updates, in tenths of seconds
    -u, --user=USERNAME   Show only processes of a given user
    -s, --sort-key=COLUMN Sort by this column
    -t, --tree            Show tree view of processes

INTERACTIVE COMMANDS
    F1, h, ?    Show help screen
    F2, S       Setup screen
    F3, /       Search for a process
    F4, \\       Filter processes
    F5, t       Tree view toggle
    F6, <, >    Sort by column
    F7, ]       Increase nice value
    F8, [       Decrease nice value
    F9, k       Kill process
    F10, q      Quit

EXAMPLES
    htop                    # Start htop
    htop -d 5               # Update every 0.5 seconds
    htop -u root            # Show only root processes
    htop -s cpu             # Sort by CPU usage
    htop -t                 # Start in tree view

NOTES
    - Use arrow keys to navigate
    - Space to tag processes
    - Enter to trace process
    - Colors indicate different process states`,

    'zh': `htop - 交互式进程查看器

语法
    htop [选项]

描述
    htop 是Unix系统的交互式进程查看器。它是一个文本模式应用程序，
    需要ncurses。htop类似于top，但允许您垂直和水平滚动。

选项
    -d, --delay=延迟      设置更新间隔，以十分之一秒为单位
    -u, --user=用户名     仅显示指定用户的进程
    -s, --sort-key=列     按此列排序
    -t, --tree            显示进程树视图

交互命令
    F1, h, ?    显示帮助屏幕
    F2, S       设置屏幕
    F3, /       搜索进程
    F4, \\       过滤进程
    F5, t       切换树视图
    F6, <, >    按列排序
    F7, ]       增加nice值
    F8, [       减少nice值
    F9, k       终止进程
    F10, q      退出

示例
    htop                    # 启动htop
    htop -d 5               # 每0.5秒更新一次
    htop -u root            # 仅显示root进程
    htop -s cpu             # 按CPU使用率排序
    htop -t                 # 以树视图启动

注意
    - 使用方向键导航
    - 空格键标记进程
    - 回车键跟踪进程
    - 颜色表示不同的进程状态`
  },
  
  examples: [
    {
      command: 'htop',
      description: 'Start interactive process viewer|启动交互式进程查看器'
    },
    {
      command: 'htop -d 5',
      description: 'Update every 0.5 seconds|每0.5秒更新一次'
    },
    {
      command: 'htop -u root',
      description: 'Show only root processes|仅显示root进程'
    },
    {
      command: 'htop -s mem',
      description: 'Sort by memory usage|按内存使用率排序'
    },
    {
      command: 'htop -t',
      description: 'Start in tree view|以树视图启动'
    }
  ]
}

export default htop