/**
 * uptime - 显示系统运行时间和负载
 */

export const uptime = {
  name: 'uptime',
  description: 'Show how long the system has been running|显示系统运行时间',
  category: 'system',
  options: [
    {
      name: '-p, --pretty',
      description: '以美观格式显示运行时间',
      type: 'boolean',
      group: 'format'
    },
    {
      name: '-s, --since',
      description: '显示系统启动时间',
      type: 'boolean',
      group: 'display'
    },
    {
      name: '-h, --help',
      description: '显示帮助信息',
      type: 'boolean',
      group: 'help'
    },
    {
      name: '-V, --version',
      description: '显示版本信息',
      type: 'boolean',
      group: 'help'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return uptime.help
    }

    let pretty = args.includes('-p') || args.includes('--pretty')
    let since = args.includes('-s') || args.includes('--since')
    
    // 模拟系统启动时间（假设系统已运行一段时间）
    const now = new Date()
    const bootTime = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 45 * 60 * 1000)) // 7天3小时45分钟前
    
    if (since) {
      return bootTime.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '')
    }
    
    if (pretty) {
      const upSeconds = Math.floor((now - bootTime) / 1000)
      const days = Math.floor(upSeconds / 86400)
      const hours = Math.floor((upSeconds % 86400) / 3600)
      const minutes = Math.floor((upSeconds % 3600) / 60)
      
      let result = 'up '
      if (days > 0) {
        result += `${days} day${days > 1 ? 's' : ''}`
        if (hours > 0 || minutes > 0) result += ', '
      }
      if (hours > 0) {
        result += `${hours} hour${hours > 1 ? 's' : ''}`
        if (minutes > 0) result += ', '
      }
      if (minutes > 0) {
        result += `${minutes} minute${minutes > 1 ? 's' : ''}`
      }
      
      return result
    }
    
    // 默认格式
    const currentTime = now.toTimeString().split(' ')[0]
    const upSeconds = Math.floor((now - bootTime) / 1000)
    const days = Math.floor(upSeconds / 86400)
    const hours = Math.floor((upSeconds % 86400) / 3600)
    const minutes = Math.floor((upSeconds % 3600) / 60)
    
    let uptimeStr = ''
    if (days > 0) {
      uptimeStr += `${days} day${days > 1 ? 's' : ''}, `
    }
    uptimeStr += `${hours}:${minutes.toString().padStart(2, '0')}`
    
    // 模拟用户数和负载平均值
    const users = 2
    const load1 = (Math.random() * 2).toFixed(2)
    const load5 = (Math.random() * 1.5).toFixed(2)
    const load15 = (Math.random() * 1.2).toFixed(2)
    
    return ` ${currentTime} up ${uptimeStr},  ${users} user${users > 1 ? 's' : ''},  load average: ${load1}, ${load5}, ${load15}`
  },
  description: 'Show how long the system has been running|显示系统运行时间',
  category: 'system',
  supportsPipe: true,
  examples: [
    'uptime',
    'uptime -p',
    'uptime -s',
    'uptime --help'
  ],
  help: `Usage: uptime [OPTION]...|用法: uptime [选项]...
Print the current time, the length of time the system has been up,|打印当前时间、系统运行时间、
the number of users on the system, and the average number of jobs|系统上的用户数以及过去1、5和15分钟内
in the run queue over the last 1, 5 and 15 minutes.|运行队列中的平均作业数。

  -p, --pretty   show uptime in pretty format|以美观格式显示运行时间
  -h, --help     display this help and exit|显示此帮助信息并退出
  -s, --since    system up since|系统启动时间
  -V, --version  output version information and exit|输出版本信息并退出

For more details see uptime(1).|更多详细信息请参见uptime(1)。

Examples|示例:
  uptime                    Show system uptime and load|显示系统运行时间和负载
  uptime -p                 Show uptime in pretty format|以美观格式显示运行时间
  uptime -s                 Show system boot time|显示系统启动时间

Output format|输出格式:
The default output shows:|默认输出显示：
- Current time|当前时间
- How long the system has been running|系统运行了多长时间
- Number of users currently logged on|当前登录的用户数
- System load averages for the past 1, 5, and 15 minutes|过去1、5和15分钟的系统负载平均值

Load average represents the average system load over a period of time.|负载平均值表示一段时间内的平均系统负载。
The three numbers represent averages over progressively longer periods.|这三个数字表示逐渐更长时间段的平均值。

Note: This is a simulated environment with mock system statistics.|注意：这是一个具有模拟系统统计信息的模拟环境。`
}