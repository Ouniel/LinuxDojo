import { formatHelp } from '../utils/helpFormatter.js'

export const history = {
  name: 'history',
  description: 'Display or manipulate the history list|显示或操作历史列表',
  
  options: [
    // 操作选项组
    {
      flag: '-c',
      description: '清除历史列表',
      type: 'boolean',
      group: '操作选项'
    },
    {
      flag: '-d',
      description: '删除指定偏移处的历史条目',
      type: 'number',
      inputKey: 'delete_offset',
      placeholder: '要删除的历史条目编号',
      group: '操作选项'
    },
    {
      flag: '-a',
      description: '将新历史行追加到历史文件',
      type: 'boolean',
      group: '操作选项'
    },
    {
      flag: '-r',
      description: '读取历史文件并追加到历史列表',
      type: 'boolean',
      group: '操作选项'
    },
    {
      flag: '-w',
      description: '将当前历史写入历史文件',
      type: 'boolean',
      group: '操作选项'
    },
    {
      flag: '-s',
      description: '将参数作为单个条目存储在历史中',
      type: 'input',
      inputKey: 'substitute_entry',
      placeholder: '要添加到历史的命令',
      group: '操作选项'
    },
    
    // 输入参数
    {
      inputKey: 'number_of_commands',
      description: '显示最后N个命令（留空显示所有）',
      type: 'number',
      placeholder: '命令数量（如 10）',
      required: false
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
    const options = {
      clear: false,
      delete: null,
      append: false,
      read: false,
      write: false,
      substitute: null,
      number: null
    }
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-c') {
        options.clear = true
      } else if (arg === '-d') {
        options.delete = parseInt(args[++i])
      } else if (arg === '-a') {
        options.append = true
      } else if (arg === '-r') {
        options.read = true
      } else if (arg === '-w') {
        options.write = true
      } else if (arg === '-s') {
        options.substitute = args.slice(i + 1).join(' ')
        break
      } else if (arg === '--help') {
        return formatHelp({
          name: 'history',
          description: 'Display or manipulate the history list|显示或操作历史列表',
          usage: 'history [OPTIONS] [N]|history [选项] [N]',
          options: [
            '-c                   Clear the history list|清除历史列表',
            '-d OFFSET            Delete history entry at OFFSET|删除指定偏移处的历史条目',
            '-a                   Append new history lines to history file|将新历史行追加到历史文件',
            '-r                   Read history file and append to history list|读取历史文件并追加到历史列表',
            '-w                   Write current history to history file|将当前历史写入历史文件',
            '-s                   Store args as single entry in history|将参数作为单个条目存储在历史中',
            'N                    Display last N commands|显示最后N个命令',
            '--help               Show this help|显示此帮助'
          ],
          examples: [
            'history|显示所有历史命令',
            'history 10|显示最后10个命令',
            'history -c|清除历史记录',
            'history -d 5|删除第5个历史条目'
          ],
          notes: [
            'History is stored in ~/.bash_history by default|历史默认存储在~/.bash_history中',
            'Use !n to execute command number n|使用!n执行第n个命令',
            'Use !! to execute last command|使用!!执行上一个命令'
          ]
        })
      } else if (!arg.startsWith('-') && /^\d+$/.test(arg)) {
        options.number = parseInt(arg)
      }
    }
    
    // 模拟的命令历史
    const commandHistory = [
      'ls -la',
      'cd /home/user',
      'pwd',
      'cat file.txt',
      'grep "pattern" file.txt',
      'find . -name "*.js"',
      'ps aux | grep node',
      'kill -9 1234',
      'tar -czf backup.tar.gz documents/',
      'ssh user@server.com',
      'wget https://example.com/file.zip',
      'chmod 755 script.sh',
      './script.sh',
      'git status',
      'git add .',
      'git commit -m "Update files"',
      'git push origin main',
      'npm install',
      'npm run build',
      'docker ps',
      'docker run -d nginx',
      'systemctl status nginx',
      'tail -f /var/log/nginx/access.log',
      'top',
      'htop',
      'df -h',
      'du -sh *',
      'mount | grep ext4',
      'who',
      'w',
      'uptime',
      'date',
      'cal',
      'history'
    ]
    
    // 处理选项
    if (options.clear) {
      return 'history: history list cleared'
    }
    
    if (options.delete !== null) {
      if (options.delete < 1 || options.delete > commandHistory.length) {
        return `history: ${options.delete}: history position out of range`
      }
      return `history: deleted entry ${options.delete}`
    }
    
    if (options.append) {
      return 'history: new history lines appended to history file'
    }
    
    if (options.read) {
      return 'history: history file read and appended to history list'
    }
    
    if (options.write) {
      return 'history: current history written to history file'
    }
    
    if (options.substitute) {
      commandHistory.push(options.substitute)
      return `history: "${options.substitute}" added to history`
    }
    
    // 显示历史
    const results = []
    let startIndex = 0
    let endIndex = commandHistory.length
    
    if (options.number) {
      startIndex = Math.max(0, commandHistory.length - options.number)
    }
    
    for (let i = startIndex; i < endIndex; i++) {
      const lineNumber = (i + 1).toString().padStart(5)
      results.push(`${lineNumber}  ${commandHistory[i]}`)
    }
    
    return results.join('\n')
  }
}