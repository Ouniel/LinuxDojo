/**
 * 进程管理命令模块
 * 包含作业控制、进程监控、信号处理等相关命令
 */

import { jobs } from './jobs.js'
import { bg } from './bg.js'
import { fg } from './fg.js'
import { nohup } from './nohup.js'
// 从system模块导入进程相关命令
import { ps } from '../system/ps.js'
import { top } from '../system/top.js'
import { kill } from '../system/kill.js'

export const processCommands = {
  jobs,
  bg,
  fg,
  nohup,
  // 直接导入实际的命令对象，确保包含完整的options配置
  ps: {
    ...ps,
    category: 'process' // 覆盖分类为process
  },
  top: {
    ...top,
    category: 'process' // 覆盖分类为process
  },
  kill: {
    ...kill,
    category: 'process' // 覆盖分类为process
  }
}


// 获取所有进程管理命令列表
export function getProcessCommands() {
  return Object.keys(processCommands).map(name => ({
    name,
    ...processCommands[name],
    category: 'process'
  }))
}

// 搜索进程管理命令
export function searchProcessCommands(query) {
  const commands = getProcessCommands()
  const lowerQuery = query.toLowerCase()
  
  return commands.filter(cmd => 
    cmd.name.toLowerCase().includes(lowerQuery) ||
    cmd.description.toLowerCase().includes(lowerQuery) ||
    (cmd.examples && cmd.examples.some(example => example.toLowerCase().includes(lowerQuery)))
  )
}

// 按功能分组的进程命令
export const processCommandGroups = {
  jobControl: {
    name: 'Job Control|作业控制',
    commands: ['jobs', 'bg', 'fg'],
    description: 'Manage background and foreground jobs|管理后台和前台作业'
  },
  processMonitoring: {
    name: 'Process Monitoring|进程监控',
    commands: ['ps', 'top'],
    description: 'View and monitor system processes|查看和监控系统进程'
  },
  processControl: {
    name: 'Process Control|进程控制',
    commands: ['kill'],
    description: 'Control and terminate processes|控制和终止进程'
  }
}

// 进程管理相关的帮助信息
export const processHelp = {
  overview: `进程管理命令帮助

Linux进程管理基础：
- 每个运行的程序都是一个进程
- 进程有唯一的进程ID (PID)
- 进程可以在前台或后台运行
- 作业是shell管理的进程组

作业控制：
- jobs: 显示当前shell的作业列表
- bg: 将停止的作业放到后台运行
- fg: 将作业放到前台运行
- Ctrl+Z: 暂停前台作业
- Ctrl+C: 终止前台作业

进程监控：
- ps: 显示进程快照
- top: 实时显示进程状态
- htop: 增强版的top (如果安装)

进程控制：
- kill: 发送信号给进程
- killall: 按名称终止进程
- pkill: 按模式终止进程`,

  jobControl: `作业控制详解

作业规范格式：
- %n     : 作业号n
- %str   : 命令以str开头的作业
- %?str  : 命令包含str的作业
- %+     : 当前作业 (默认)
- %-     : 前一个作业

常用操作：
1. 启动后台作业：
   command &

2. 暂停前台作业：
   Ctrl+Z

3. 恢复后台运行：
   bg %1

4. 恢复前台运行：
   fg %1

5. 查看作业状态：
   jobs -l

作业状态说明：
- Running: 正在运行
- Stopped: 已暂停
- Done: 已完成
- Terminated: 被终止
- Killed: 被强制终止`,

  signals: `进程信号说明

常用信号：
- SIGTERM (15): 正常终止请求
- SIGKILL (9):  强制终止 (不可捕获)
- SIGSTOP (19): 暂停进程 (不可捕获)
- SIGCONT (18): 继续执行
- SIGHUP (1):   挂起信号
- SIGINT (2):   中断信号 (Ctrl+C)
- SIGQUIT (3):  退出信号 (Ctrl+\\)
- SIGTSTP (20): 终端暂停 (Ctrl+Z)

使用示例：
- kill -TERM 1234  # 正常终止进程1234
- kill -KILL 1234  # 强制终止进程1234
- kill -STOP 1234  # 暂停进程1234
- kill -CONT 1234  # 继续进程1234`
}

// 作业控制辅助函数
export const jobControlUtils = {
  // 创建新作业
  createJob(command, pid, context) {
    const jobs = context.jobs || []
    const newId = Math.max(0, ...jobs.map(j => j.id)) + 1
    
    const job = {
      id: newId,
      pid: pid,
      pgid: pid,
      command: command,
      state: command.endsWith('&') ? 'running' : 'foreground',
      status: 'Running',
      startTime: new Date()
    }
    
    if (job.state === 'running') {
      jobs.unshift(job)
      context.jobs = jobs
      return `[${newId}] ${pid}`
    }
    
    return null
  },
  
  // 更新作业状态
  updateJobStatus(jobId, newState, signal, context) {
    const jobs = context.jobs || []
    const job = jobs.find(j => j.id === jobId)
    
    if (job) {
      job.state = newState
      job.status = getStatusText(newState)
      if (signal) {
        job.signal = signal
      }
      job.updateTime = new Date()
    }
    
    return job
  },
  
  // 清理完成的作业
  cleanupJobs(context) {
    const jobs = context.jobs || []
    const activeJobs = jobs.filter(job => 
      job.state !== 'done' && job.state !== 'terminated' && job.state !== 'killed'
    )
    
    context.jobs = activeJobs
    return jobs.length - activeJobs.length // 返回清理的作业数
  }
}

// 获取状态文本
function getStatusText(state) {
  const statusMap = {
    'running': 'Running',
    'stopped': 'Stopped',
    'done': 'Done',
    'terminated': 'Terminated',
    'killed': 'Killed',
    'foreground': 'Foreground'
  }
  
  return statusMap[state] || state
}

export default processCommands