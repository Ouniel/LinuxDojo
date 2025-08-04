/**
 * fg 命令实现
 * 将作业放到前台运行
 */

export const fg = {
  name: 'fg',
  description: 'Move job to the foreground|将作业放到前台运行',
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
    'fg',
    'fg %1',
    'fg %2'
  ],

  handler: async (args, context, filesystem) => {
    const jobSpec = args[0] || '%1'
    
    // 模拟前台作业管理
    const jobs = [
      { id: 1, command: 'sleep 100', status: 'Running' },
      { id: 2, command: 'find / -name "*.log"', status: 'Stopped' },
      { id: 3, command: 'tail -f /var/log/syslog', status: 'Running' }
    ]

    if (jobSpec === '%1' || jobSpec === '1') {
      return {
        output: `sleep 100\n^C`,
        exitCode: 0
      }
    } else if (jobSpec === '%2' || jobSpec === '2') {
      return {
        output: `find / -name "*.log"\n/var/log/syslog\n/var/log/auth.log\n/var/log/kern.log`,
        exitCode: 0
      }
    } else if (jobSpec === '%3' || jobSpec === '3') {
      return {
        output: `tail -f /var/log/syslog\nJan 15 10:30:15 linux kernel: [12345.678] USB disconnect\n^C`,
        exitCode: 0
      }
    } else if (!args.length) {
      // 默认将最近的作业放到前台
      return {
        output: `sleep 100\n^C`,
        exitCode: 0
      }
    } else {
      return {
        output: `fg: ${jobSpec}: no such job`,
        exitCode: 1
      }
    }
  }
}

export default fg