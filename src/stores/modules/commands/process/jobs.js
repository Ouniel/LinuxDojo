/**
 * jobs - Display active job status|显示活动作业状态
 */

export const jobs = {
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return jobs.help
    }

    // 解析选项
    const listPids = args.includes('-p')
    const listRunning = args.includes('-r')
    const listStopped = args.includes('-s')
    const longFormat = args.includes('-l')

    try {
      const jobList = getJobList(context)
      
      if (jobList.length === 0) {
        return '' // 没有作业时不输出任何内容
      }

      return formatJobList(jobList, {
        listPids,
        listRunning,
        listStopped,
        longFormat
      })
    } catch (error) {
      return `jobs: ${error.message}`
    }
  },
  description: 'Display active job status|显示活动作业状态',
  category: 'process',
  requiresArgs: false,
  options: [
    {
      flag: '-l',
      description: '除正常信息外还列出进程ID',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-p',
      description: '仅列出进程ID',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-r',
      description: '将输出限制为运行中的作业',
      type: 'boolean',
      group: '过滤选项'
    },
    {
      flag: '-s',
      description: '将输出限制为已停止的作业',
      type: 'boolean',
      group: '过滤选项'
    },
    {
      flag: '-n',
      description: '仅列出自上次通知以来状态已更改的进程',
      type: 'boolean',
      group: '过滤选项'
    },
    {
      description: '作业规范 (如: %1, %vim, %?file)',
      type: 'input',
      inputKey: 'job_spec',
      placeholder: '%1 或 %vim',
      required: false
    }
  ],
  examples: [
    'jobs',
    'jobs -l',
    'jobs -p',
    'jobs -r'
  ],
  help: `Usage: jobs [-lnprs] [jobspec ...]
       jobs -x command [args]

Display status of jobs.

Lists the active jobs. JOBSPEC restricts output to that job.
Without options, the status of all active jobs is displayed.

用法: jobs [-lnprs] [作业规范 ...]
     jobs -x 命令 [参数]

显示作业状态。

列出活动作业。JOBSPEC将输出限制为该作业。
如果没有选项，将显示所有活动作业的状态。

Options|选项:
  -l        lists process IDs in addition to the normal information|除正常信息外还列出进程ID
  -n        list only processes that have changed status since the last notification|仅列出自上次通知以来状态已更改的进程
  -p        lists process IDs only|仅列出进程ID
  -r        restrict output to running jobs|将输出限制为运行中的作业
  -s        restrict output to stopped jobs|将输出限制为已停止的作业
  -x        COMMAND is run after all job specifications that appear in ARGS have been replaced with the process ID of that job's process group leader|在ARGS中出现的所有作业规范都被该作业进程组领导者的进程ID替换后运行COMMAND

Exit Status|退出状态:
Returns success unless an invalid option is given or an error occurs.
If -x is used, returns the exit status of COMMAND.
除非给出无效选项或发生错误，否则返回成功。
如果使用-x，则返回COMMAND的退出状态。

Examples|示例:
  jobs              # Show all active jobs|显示所有活动作业
  jobs -l           # Show jobs with process IDs|显示带进程ID的作业
  jobs -r           # Show only running jobs|仅显示运行中的作业
  jobs -s           # Show only stopped jobs|仅显示已停止的作业
  jobs %1           # Show status of job 1|显示作业1的状态

Note: This is a simulation of job control. In a real shell, jobs would
show actual background processes and stopped jobs.
注意：这是作业控制的模拟。在真实shell中，jobs会显示实际的后台进程和停止的作业。`
}

// 获取作业列表
function getJobList(context) {
  // 模拟作业列表
  const jobs = context.jobs || [
    {
      id: 1,
      pid: 1234,
      pgid: 1234,
      status: 'Running',
      command: 'sleep 100 &',
      state: 'running'
    },
    {
      id: 2,
      pid: 1235,
      pgid: 1235,
      status: 'Stopped',
      command: 'vim file.txt',
      state: 'stopped',
      signal: 'SIGTSTP'
    },
    {
      id: 3,
      pid: 1236,
      pgid: 1236,
      status: 'Running',
      command: 'find / -name "*.log" 2>/dev/null &',
      state: 'running'
    }
  ]
  
  return jobs
}

// 格式化作业列表
function formatJobList(jobs, options) {
  const results = []
  
  // 过滤作业
  let filteredJobs = jobs
  if (options.listRunning) {
    filteredJobs = jobs.filter(job => job.state === 'running')
  } else if (options.listStopped) {
    filteredJobs = jobs.filter(job => job.state === 'stopped')
  }
  
  for (const job of filteredJobs) {
    if (options.listPids) {
      // 只显示PID
      results.push(job.pid.toString())
    } else if (options.longFormat) {
      // 长格式：[job_id] +/- pid status command
      const marker = job.id === 1 ? '+' : (job.id === 2 ? '-' : ' ')
      const signal = job.signal ? ` (${job.signal})` : ''
      results.push(`[${job.id}]${marker}  ${job.pid} ${job.status}${signal}                ${job.command}`)
    } else {
      // 标准格式：[job_id] +/- status command
      const marker = job.id === 1 ? '+' : (job.id === 2 ? '-' : ' ')
      const signal = job.signal ? ` (${job.signal})` : ''
      results.push(`[${job.id}]${marker}  ${job.status}${signal}                ${job.command}`)
    }
  }
  
  return results.join('\n')
}

// 作业状态说明
export const jobStates = {
  running: 'Running|运行中',
  stopped: 'Stopped|已停止',
  done: 'Done|已完成',
  terminated: 'Terminated|已终止',
  killed: 'Killed|已杀死'
}

// 常见信号说明
export const jobSignals = {
  SIGTERM: 'Terminated|已终止',
  SIGKILL: 'Killed|已杀死',
  SIGSTOP: 'Stopped|已停止',
  SIGTSTP: 'Stopped (tty input)|已停止(终端输入)',
  SIGCONT: 'Continued|已继续',
  SIGHUP: 'Hangup|挂起',
  SIGINT: 'Interrupt|中断',
  SIGQUIT: 'Quit|退出'
}
