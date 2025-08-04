/**
 * fg - 将作业放到前台运行|Move job to the foreground
 */

export const fg = {
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return fg.help
    }

    try {
      const jobSpec = args[0] || '%+'  // 默认使用当前作业
      const jobId = parseJobSpec(jobSpec)
      
      return foregroundJob(jobId, context)
    } catch (error) {
      return `fg: ${error.message}`
    }
  },
  description: 'Move job to the foreground|将作业放到前台运行',
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
    'fg',
    'fg %1',
    'fg %vim',
    'fg %?file'
  ],
  help: `Usage: fg [job_spec]|用法: fg [作业规范]

Move job to the foreground.|将作业移到前台运行。

Place the job identified by JOB_SPEC in the foreground, making it the
current job. If JOB_SPEC is not present, the shell's notion of the
current job is used.|将JOB_SPEC标识的作业放到前台，使其成为当前作业。如果未提供JOB_SPEC，则使用shell的当前作业概念。

Job specifications:|作业规范:
  %n     Job number n|作业号n
  %str   Job whose command begins with str|命令以str开头的作业
  %?str  Job whose command contains str|命令包含str的作业
  %+     Current job (default)|当前作业(默认)
  %-     Previous job|前一个作业

Exit Status:|退出状态:
Status of command placed in foreground, or failure if an error occurs.|前台命令的状态，或发生错误时失败。

Examples:|示例:
  fg              # Bring current job to foreground|将当前作业移到前台
  fg %1           # Bring job 1 to foreground|将作业1移到前台
  fg %vim         # Bring job starting with 'vim'|将以'vim'开头的作业移到前台
  fg %?file       # Bring job containing 'file'|将包含'file'的作业移到前台`
}

// 解析作业规范（与bg.js相同的函数）
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

// 将作业放到前台
function foregroundJob(jobSpec, context) {
  const jobs = context.jobs || []
  
  if (jobs.length === 0) {
    return 'fg: no current job|fg: 没有当前作业'
  }
  
  let targetJob = null
  
  if (jobSpec === 'current') {
    targetJob = jobs.find(job => job.current) || jobs[0]
  } else if (jobSpec === 'previous') {
    targetJob = jobs.find(job => job.previous) || jobs[1]
  } else if (typeof jobSpec === 'number') {
    targetJob = jobs.find(job => job.id === jobSpec)
    if (!targetJob) {
      return `fg: %${jobSpec}: no such job|fg: %${jobSpec}: 没有此作业`
    }
  } else if (typeof jobSpec === 'object') {
    if (jobSpec.type === 'prefix') {
      targetJob = jobs.find(job => job.command.startsWith(jobSpec.value))
    } else if (jobSpec.type === 'contains') {
      targetJob = jobs.find(job => job.command.includes(jobSpec.value))
    }
    
    if (!targetJob) {
      const specStr = jobSpec.type === 'prefix' ? jobSpec.value : `?${jobSpec.value}`
      return `fg: %${specStr}: no such job|fg: %${specStr}: 没有此作业`
    }
  }
  
  if (!targetJob) {
    return 'fg: no current job|fg: 没有当前作业'
  }
  
  // 显示正在前台运行的命令
  const commandDisplay = targetJob.command.replace(/ &$/, '')
  const result = [commandDisplay]
  
  // 如果作业是停止状态，恢复运行
  if (targetJob.state === 'stopped') {
    targetJob.state = 'running'
    targetJob.status = 'Running|运行中'
    delete targetJob.signal
    result.push('(resumed)|(已恢复)')
  }
  
  // 模拟前台运行的输出
  result.push(simulateForegroundExecution(targetJob, context))
  
  // 从作业列表中移除（因为现在在前台运行）
  const jobIndex = jobs.findIndex(job => job.id === targetJob.id)
  if (jobIndex !== -1) {
    jobs.splice(jobIndex, 1)
  }
  
  // 更新作业列表
  updateJobList(context, jobs)
  
  return result.join('\n')
}

// 模拟前台执行
function simulateForegroundExecution(job, context) {
  const command = job.command.replace(/ &$/, '').trim()
  const [cmd, ...args] = command.split(' ')
  
  // 根据命令类型模拟不同的输出
  switch (cmd) {
    case 'sleep':
      const seconds = args[0] || '1'
      return `Sleeping for ${seconds} seconds... (Press Ctrl+C to interrupt)|休眠${seconds}秒... (按Ctrl+C中断)`
    
    case 'vim':
    case 'nano':
    case 'emacs':
      const filename = args[0] || 'untitled'
      return `Opening ${filename} in ${cmd}... (Press Ctrl+Z to suspend)|在${cmd}中打开${filename}... (按Ctrl+Z暂停)`
    
    case 'find':
      return `Searching... (Press Ctrl+C to stop)|搜索中... (按Ctrl+C停止)\n/home/user/file1.txt\n/home/user/file2.txt\n/var/log/system.log`
    
    case 'grep':
      return `Searching for pattern... (Press Ctrl+C to stop)|搜索模式中... (按Ctrl+C停止)\nfile1.txt:matching line 1\nfile2.txt:matching line 2`
    
    case 'tail':
      if (args.includes('-f')) {
        return `Following file... (Press Ctrl+C to stop)|跟踪文件... (按Ctrl+C停止)\nLine 1\nLine 2\nLine 3\n...`
      }
      return `Last 10 lines of file|文件的最后10行`
    
    case 'watch':
      return `Watching command output... (Press Ctrl+C to stop)|监视命令输出... (按Ctrl+C停止)\nEvery 2.0s: ${args.slice(1).join(' ')}\n\nOutput refreshing...|输出刷新中...`
    
    case 'ping':
      const host = args[0] || 'localhost'
      return `PING ${host} (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.123 ms\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.089 ms\n^C\n--- ${host} ping statistics ---\n2 packets transmitted, 2 packets received, 0.0% packet loss`
    
    case 'top':
    case 'htop':
      return `System monitor running... (Press 'q' to quit)|系统监视器运行中... (按'q'退出)\n\nPID  USER     PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND\n1234 user     20   0  123456   1234   1234 R  12.5  2.3   0:01.23 ${cmd}`
    
    case 'less':
    case 'more':
      const file = args[0] || 'file'
      return `Viewing ${file}... (Press 'q' to quit, space for next page)|查看${file}... (按'q'退出，空格翻页)\n\nFile content here...|文件内容...\n(END)|(结束)`
    
    default:
      // 对于其他命令，模拟一般的执行过程
      if (command.includes('|') || command.includes('>')) {
        return `Executing pipeline: ${command}|执行管道: ${command}\nProcessing... Done.|处理中... 完成。`
      } else {
        return `Executing: ${command}|执行: ${command}\nCommand completed successfully.|命令执行成功。`
      }
  }
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

// 前台作业控制相关的辅助函数
export const foregroundJobHelpers = {
  // 检查作业是否可以前台运行
  canForeground(job) {
    return job.state === 'stopped' || job.state === 'running'
  },
  
  // 获取作业的显示命令（移除后台标记）
  getDisplayCommand(job) {
    return job.command.replace(/ &$/, '').trim()
  },
  
  // 模拟键盘中断信号
  simulateInterrupt(job) {
    return {
      ...job,
      state: 'terminated',
      status: 'Terminated|已终止',
      signal: 'SIGINT',
      exitCode: 130
    }
  },
  
  // 模拟暂停信号
  simulateSuspend(job) {
    return {
      ...job,
      state: 'stopped',
      status: 'Stopped|已停止',
      signal: 'SIGTSTP'
    }
  }
}
