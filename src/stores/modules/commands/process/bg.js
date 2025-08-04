/**
 * bg - Put jobs in the background|将作业放到后台运行
 */

export const bg = {
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return bg.help
    }

    try {
      const jobSpec = args[0] || '%+'  // 默认使用当前作业
      const jobId = parseJobSpec(jobSpec)
      
      return backgroundJob(jobId, context)
    } catch (error) {
      return `bg: ${error.message}`
    }
  },
  description: 'Put jobs in the background|将作业放到后台运行',
  category: 'process',
  requiresArgs: false,
  options: [
    {
      description: '作业规范 (默认为当前作业)',
      type: 'select',
      inputKey: 'job_spec',
      options: ['%+', '%-', '%1', '%2', '%3', '%vim', '%?file'],
      optionLabels: ['%+ (当前作业)', '%- (前一个作业)', '%1 (作业1)', '%2 (作业2)', '%3 (作业3)', '%vim (vim开头的作业)', '%?file (包含file的作业)'],
      default: '%+',
      required: false,
      group: '作业选择'
    }
  ],
  examples: [
    'bg',
    'bg %1',
    'bg %+',
    'bg %-'
  ],
  help: `Usage: bg [job_spec ...]

Resume jobs in the background.

Resume each suspended job JOB_SPEC in the background, as if it had been
started with '&'. If JOB_SPEC is not present, the shell's notion of the
current job is used.

用法: bg [作业规范 ...]

在后台恢复作业。

在后台恢复每个挂起的作业JOB_SPEC，就像使用'&'启动一样。
如果没有JOB_SPEC，则使用shell的当前作业概念。

Job specifications|作业规范:
  %n     Job number n|作业号n
  %str   Job whose command begins with str|命令以str开头的作业
  %?str  Job whose command contains str|命令包含str的作业
  %+     Current job (default)|当前作业（默认）
  %-     Previous job|前一个作业

Exit Status|退出状态:
Returns success unless job control is not enabled or an error occurs.
除非作业控制未启用或发生错误，否则返回成功。

Examples|示例:
  bg              # Resume current job in background|在后台恢复当前作业
  bg %1           # Resume job 1 in background|在后台恢复作业1
  bg %vim         # Resume job starting with 'vim'|恢复以'vim'开头的作业
  bg %?file       # Resume job containing 'file'|恢复包含'file'的作业

Note: This is a simulation of job control. In a real shell, bg would
resume actual stopped background jobs.
注意：这是作业控制的模拟。在真实shell中，bg会恢复实际停止的后台作业。`
}

// 解析作业规范
function parseJobSpec(jobSpec) {
  if (!jobSpec.startsWith('%')) {
    throw new Error(`${jobSpec}: no such job|${jobSpec}: 没有此作业`)
  }
  
  const spec = jobSpec.slice(1)
  
  // %+ 或空 - 当前作业
  if (spec === '+' || spec === '') {
    return 'current'
  }
  
  // %- - 前一个作业
  if (spec === '-') {
    return 'previous'
  }
  
  // %n - 作业号
  if (/^\d+$/.test(spec)) {
    return parseInt(spec)
  }
  
  // %str - 命令开头匹配
  if (!spec.startsWith('?')) {
    return { type: 'prefix', value: spec }
  }
  
  // %?str - 命令包含匹配
  return { type: 'contains', value: spec.slice(1) }
}

// 将作业放到后台
function backgroundJob(jobSpec, context) {
  const jobs = context.jobs || []
  
  if (jobs.length === 0) {
    return 'bg: no current job|bg: 没有当前作业'
  }
  
  let targetJob = null
  
  if (jobSpec === 'current') {
    targetJob = jobs.find(job => job.current) || jobs[0]
  } else if (jobSpec === 'previous') {
    targetJob = jobs.find(job => job.previous) || jobs[1]
  } else if (typeof jobSpec === 'number') {
    targetJob = jobs.find(job => job.id === jobSpec)
    if (!targetJob) {
      return `bg: %${jobSpec}: no such job|bg: %${jobSpec}: 没有此作业`
    }
  } else if (typeof jobSpec === 'object') {
    if (jobSpec.type === 'prefix') {
      targetJob = jobs.find(job => job.command.startsWith(jobSpec.value))
    } else if (jobSpec.type === 'contains') {
      targetJob = jobs.find(job => job.command.includes(jobSpec.value))
    }
    
    if (!targetJob) {
      const specStr = jobSpec.type === 'prefix' ? jobSpec.value : `?${jobSpec.value}`
      return `bg: %${specStr}: no such job|bg: %${specStr}: 没有此作业`
    }
  }
  
  if (!targetJob) {
    return 'bg: no current job|bg: 没有当前作业'
  }
  
  // 检查作业状态
  if (targetJob.state === 'running') {
    return `bg: job ${targetJob.id} already in background|bg: 作业${targetJob.id}已在后台运行`
  }
  
  if (targetJob.state !== 'stopped') {
    return `bg: job ${targetJob.id} not stopped|bg: 作业${targetJob.id}未停止`
  }
  
  // 恢复作业到后台运行
  targetJob.state = 'running'
  targetJob.status = 'Running|运行中'
  delete targetJob.signal
  
  // 更新作业列表
  updateJobList(context, jobs)
  
  return `[${targetJob.id}]+ ${targetJob.command} &`
}

// 更新作业列表
function updateJobList(context, jobs) {
  context.jobs = jobs
  
  // 更新当前和前一个作业标记
  jobs.forEach(job => {
    delete job.current
    delete job.previous
  })
  
  if (jobs.length > 0) {
    jobs[0].current = true
  }
  if (jobs.length > 1) {
    jobs[1].previous = true
  }
}

// 作业控制相关的辅助函数
export const jobControlHelpers = {
  // 获取作业状态描述
  getJobStatusDescription(job) {
    const statusMap = {
      'running': 'Running',
      'stopped': 'Stopped',
      'done': 'Done',
      'terminated': 'Terminated',
      'killed': 'Killed'
    }
    
    let status = statusMap[job.state] || job.state
    if (job.signal) {
      status += ` (${job.signal})`
    }
    
    return status
  },
  
  // 检查作业是否可以后台运行
  canBackground(job) {
    return job.state === 'stopped'
  },
  
  // 检查作业是否可以前台运行
  canForeground(job) {
    return job.state === 'stopped' || job.state === 'running'
  }
}