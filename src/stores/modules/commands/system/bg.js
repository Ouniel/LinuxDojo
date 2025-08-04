/**
 * bg 命令实现
 * 将作业放到后台运行
 */

export const bg = {
  name: 'bg',
  description: 'Put jobs in the background|将作业放到后台运行',
  category: 'system',
  
  options: [
    {
      name: 'job_spec',
      type: 'input',
      description: '作业规范 (可选)',
      placeholder: '%1, %2, ...',
      flag: '',
      required: false
    }
  ],

  examples: [
    'bg',
    'bg %1',
    'bg %2'
  ],

  handler: async (args, context, filesystem) => {
    const jobSpec = args[0] || '%1'
    
    // 模拟后台作业管理
    const jobs = [
      { id: 1, command: 'sleep 100', status: 'Stopped' },
      { id: 2, command: 'find / -name "*.log"', status: 'Stopped' },
      { id: 3, command: 'tail -f /var/log/syslog', status: 'Running' }
    ]

    if (jobSpec === '%1' || jobSpec === '1') {
      return {
        output: `[1]+ sleep 100 &`,
        exitCode: 0
      }
    } else if (jobSpec === '%2' || jobSpec === '2') {
      return {
        output: `[2]+ find / -name "*.log" &`,
        exitCode: 0
      }
    } else if (jobSpec === '%3' || jobSpec === '3') {
      return {
        output: `[3]+ tail -f /var/log/syslog &`,
        exitCode: 0
      }
    } else if (!args.length) {
      // 默认将最近停止的作业放到后台
      return {
        output: `[1]+ sleep 100 &`,
        exitCode: 0
      }
    } else {
      return {
        output: `bg: ${jobSpec}: no such job`,
        exitCode: 1
      }
    }
  }
}

export default bg