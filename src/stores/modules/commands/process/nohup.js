import { formatHelp } from '../utils/helpFormatter.js'

export const nohup = {
  name: 'nohup',
  description: 'Run commands immune to hangups|运行不受挂起信号影响的命令',
  
  options: [
    // 输入参数
    {
      inputKey: 'command',
      description: '要运行的命令',
      type: 'input',
      placeholder: '命令名称（如 python, make, ./script.sh）',
      required: true
    },
    {
      inputKey: 'command_args',
      description: '命令参数',
      type: 'input',
      placeholder: '命令参数（如 server.py --port 8080）',
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
    if (args.length === 0 || args[0] === '--help') {
      return formatHelp({
        name: 'nohup',
        description: 'Run commands immune to hangups|运行不受挂起信号影响的命令',
        usage: 'nohup COMMAND [ARG]...|nohup 命令 [参数]...',
        options: [
          '--help               Show this help|显示此帮助'
        ],
        examples: [
          'nohup long-running-script.sh &|在后台运行长时间脚本',
          'nohup python server.py > server.log 2>&1 &|运行服务器并重定向输出',
          'nohup make -j4|运行编译任务不受终端关闭影响'
        ],
        notes: [
          'Output is redirected to nohup.out if not redirected|如果未重定向，输出将重定向到nohup.out',
          'Command continues running after terminal closes|命令在终端关闭后继续运行',
          'SIGHUP signal is ignored|忽略SIGHUP信号',
          'Usually combined with & to run in background|通常与&结合在后台运行'
        ]
      })
    }
    
    const command = args[0]
    const commandArgs = args.slice(1)
    
    // 检查输出重定向
    let outputFile = 'nohup.out'
    let hasRedirection = false
    
    // 简单检查是否有重定向
    for (let i = 0; i < commandArgs.length; i++) {
      if (commandArgs[i] === '>' || commandArgs[i] === '>>') {
        hasRedirection = true
        break
      }
    }
    
    const results = []
    
    // 模拟nohup行为
    results.push(`nohup: ignoring input and appending output to '${hasRedirection ? 'specified file' : outputFile}'`)
    
    // 模拟命令执行
    const fullCommand = [command, ...commandArgs].join(' ')
    results.push(`Starting command: ${fullCommand}`)
    results.push(`Process ID: ${Math.floor(Math.random() * 10000) + 1000}`)
    
    // 如果没有重定向，创建nohup.out文件
    if (!hasRedirection) {
      const nohupPath = resolvePath(outputFile, currentPath)
      if (nohupPath.parent) {
        const timestamp = new Date().toISOString()
        const logContent = `[${timestamp}] Command started: ${fullCommand}\n[${timestamp}] Process running with nohup...\n`
        
        // 创建或追加到nohup.out文件
        if (nohupPath.item) {
          nohupPath.item.content += logContent
        } else {
          nohupPath.parent.children[outputFile] = {
            type: 'file',
            content: logContent,
            permissions: 'rw-r--r--',
            owner: 'user',
            group: 'user',
            size: logContent.length,
            modified: new Date().toISOString()
          }
        }
        
        results.push(`Output will be written to: ${currentPath}/${outputFile}`)
      }
    }
    
    // 模拟常见命令的执行
    if (command === 'sleep') {
      const seconds = parseInt(commandArgs[0]) || 10
      results.push(`Sleeping for ${seconds} seconds in background...`)
    } else if (command === 'python' || command === 'node') {
      results.push(`Running ${command} script in background...`)
    } else if (command === 'make') {
      results.push(`Running make command in background...`)
    } else {
      results.push(`Running '${command}' in background...`)
    }
    
    results.push(`Command is now running independently of terminal`)
    results.push(`Use 'jobs' to see background processes`)
    results.push(`Use 'ps' to see all processes`)
    
    return results.join('\n')
  }
}