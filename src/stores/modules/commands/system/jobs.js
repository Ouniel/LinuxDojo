/**
 * jobs 命令实现
 * 显示活动作业状态
 */

export const jobs = {
  name: 'jobs',
  description: 'Display active job status|显示活动作业状态',
  category: 'system',
  
  options: [
    {
      name: '-l',
      type: 'boolean',
      description: '显示进程ID',
      flag: '-l',
      required: false
    },
    {
      name: '-p',
      type: 'boolean', 
      description: '仅显示进程ID',
      flag: '-p',
      required: false
    },
    {
      name: '-n',
      type: 'boolean',
      description: '仅显示状态改变的作业',
      flag: '-n',
      required: false
    },
    {
      name: '-r',
      type: 'boolean',
      description: '仅显示运行中的作业',
      flag: '-r',
      required: false
    },
    {
      name: '-s',
      type: 'boolean',
      description: '仅显示停止的作业',
      flag: '-s',
      required: false
    },
    {
      name: '-x',
      type: 'boolean',
      description: '将作业ID替换为进程组ID',
      flag: '-x',
      required: false
    }
  ],

  examples: [
    'jobs',
    'jobs -l',
    'jobs -p',
    'jobs -r',
    'jobs -s'
  ],

  handler: async (args, context, filesystem) => {
    // 解析参数
    const showPid = args.includes('-l')
    const pidOnly = args.includes('-p')
    const changedOnly = args.includes('-n')
    const runningOnly = args.includes('-r')
    const stoppedOnly = args.includes('-s')
    const replaceJobId = args.includes('-x')
    
    // 模拟作业列表
    const jobs = [
      { id: 1, pid: 12345, command: 'sleep 100', status: 'Stopped', sign: '+' },
      { id: 2, pid: 12346, command: 'find / -name "*.log"', status: 'Running', sign: '-' },
      { id: 3, pid: 12347, command: 'tail -f /var/log/syslog', status: 'Running', sign: '' }
    ]

    let filteredJobs = jobs

    // 应用过滤器
    if (runningOnly) {
      filteredJobs = jobs.filter(job => job.status === 'Running')
    } else if (stoppedOnly) {
      filteredJobs = jobs.filter(job => job.status === 'Stopped')
    }

    if (filteredJobs.length === 0) {
      return {
        output: '',
        exitCode: 0
      }
    }

    // 格式化输出
    let output = []
    
    for (const job of filteredJobs) {
      if (pidOnly) {
        output.push(job.pid.toString())
      } else if (showPid) {
        output.push(`[${job.id}]${job.sign}  ${job.pid} ${job.status.padEnd(10)} ${job.command}`)
      } else {
        output.push(`[${job.id}]${job.sign}  ${job.status.padEnd(10)} ${job.command}`)
      }
    }

    return {
      output: output.join('\n'),
      exitCode: 0
    }
  }
}

export default jobs