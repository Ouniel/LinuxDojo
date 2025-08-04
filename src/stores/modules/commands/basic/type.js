import { formatHelp } from '../utils/helpFormatter.js'

export const type = {
  name: 'type',
  description: 'Display information about command type|显示命令类型信息',
  
  options: [
    // 显示选项组
    {
      flag: '-a',
      description: '显示所有包含指定名称的位置',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-t',
      description: '仅显示命令类型（alias、keyword、function、builtin、file）',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-p',
      description: '如果是外部命令，显示其路径',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-P',
      description: '强制搜索PATH，即使命令是内置命令',
      type: 'boolean',
      group: '显示选项'
    },
    
    // 输入参数
    {
      inputKey: 'command_names',
      description: '要查询的命令名称',
      type: 'input',
      placeholder: '命令名（如 ls cd echo，支持多个）',
      required: true
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
      all: false,
      type: false,
      path: false,
      forcePath: false
    }
    
    const commands = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-a') {
        options.all = true
      } else if (arg === '-t') {
        options.type = true
      } else if (arg === '-p') {
        options.path = true
      } else if (arg === '-P') {
        options.forcePath = true
      } else if (arg === '--help') {
        return formatHelp({
          name: 'type',
          description: 'Display information about command type|显示命令类型信息',
          usage: 'type [OPTIONS] COMMAND...|type [选项] 命令...',
          options: [
            '-a                   Display all locations containing an executable named NAME|显示所有包含指定名称的位置',
            '-t                   Output a single word describing the type of COMMAND|仅显示命令类型',
            '-p                   Display the name of the disk file if COMMAND is not a builtin|如果是外部命令，显示其路径',
            '-P                   Force a PATH search for each NAME|强制搜索PATH',
            '--help               Show this help|显示此帮助'
          ],
          examples: [
            'type ls|显示ls命令的类型信息',
            'type -t cd|仅显示cd命令的类型',
            'type -a echo|显示echo命令的所有位置'
          ],
          notes: [
            'Command types: alias, keyword, function, builtin, file|命令类型：别名、关键字、函数、内置、文件',
            'Results are simulated in this environment|在此环境中结果是模拟的'
          ]
        })
      } else if (!arg.startsWith('-')) {
        commands.push(arg)
      }
    }
    
    if (commands.length === 0) {
      return 'type: missing command name\nUsage: type [OPTIONS] COMMAND...'
    }
    
    // 模拟的命令类型数据
    const commandTypes = {
      // Shell 内置命令
      'cd': { type: 'builtin', description: 'cd is a shell builtin' },
      'pwd': { type: 'builtin', description: 'pwd is a shell builtin' },
      'echo': { type: 'builtin', description: 'echo is a shell builtin', path: '/bin/echo' },
      'exit': { type: 'builtin', description: 'exit is a shell builtin' },
      'export': { type: 'builtin', description: 'export is a shell builtin' },
      'source': { type: 'builtin', description: 'source is a shell builtin' },
      'history': { type: 'builtin', description: 'history is a shell builtin' },
      'alias': { type: 'builtin', description: 'alias is a shell builtin' },
      'unalias': { type: 'builtin', description: 'unalias is a shell builtin' },
      'type': { type: 'builtin', description: 'type is a shell builtin' },
      'help': { type: 'builtin', description: 'help is a shell builtin' },
      'read': { type: 'builtin', description: 'read is a shell builtin' },
      'test': { type: 'builtin', description: 'test is a shell builtin' },
      'true': { type: 'builtin', description: 'true is a shell builtin' },
      'false': { type: 'builtin', description: 'false is a shell builtin' },
      
      // Shell 关键字
      'if': { type: 'keyword', description: 'if is a shell keyword' },
      'then': { type: 'keyword', description: 'then is a shell keyword' },
      'else': { type: 'keyword', description: 'else is a shell keyword' },
      'elif': { type: 'keyword', description: 'elif is a shell keyword' },
      'fi': { type: 'keyword', description: 'fi is a shell keyword' },
      'for': { type: 'keyword', description: 'for is a shell keyword' },
      'while': { type: 'keyword', description: 'while is a shell keyword' },
      'do': { type: 'keyword', description: 'do is a shell keyword' },
      'done': { type: 'keyword', description: 'done is a shell keyword' },
      'case': { type: 'keyword', description: 'case is a shell keyword' },
      'esac': { type: 'keyword', description: 'esac is a shell keyword' },
      'function': { type: 'keyword', description: 'function is a shell keyword' },
      
      // 外部命令
      'ls': { type: 'file', description: 'ls is /bin/ls', path: '/bin/ls' },
      'cat': { type: 'file', description: 'cat is /bin/cat', path: '/bin/cat' },
      'grep': { type: 'file', description: 'grep is /bin/grep', path: '/bin/grep' },
      'find': { type: 'file', description: 'find is /usr/bin/find', path: '/usr/bin/find' },
      'sed': { type: 'file', description: 'sed is /bin/sed', path: '/bin/sed' },
      'awk': { type: 'file', description: 'awk is /usr/bin/awk', path: '/usr/bin/awk' },
      'sort': { type: 'file', description: 'sort is /usr/bin/sort', path: '/usr/bin/sort' },
      'uniq': { type: 'file', description: 'uniq is /usr/bin/uniq', path: '/usr/bin/uniq' },
      'wc': { type: 'file', description: 'wc is /usr/bin/wc', path: '/usr/bin/wc' },
      'head': { type: 'file', description: 'head is /usr/bin/head', path: '/usr/bin/head' },
      'tail': { type: 'file', description: 'tail is /usr/bin/tail', path: '/usr/bin/tail' },
      'cut': { type: 'file', description: 'cut is /usr/bin/cut', path: '/usr/bin/cut' },
      'tr': { type: 'file', description: 'tr is /usr/bin/tr', path: '/usr/bin/tr' },
      'tar': { type: 'file', description: 'tar is /bin/tar', path: '/bin/tar' },
      'gzip': { type: 'file', description: 'gzip is /bin/gzip', path: '/bin/gzip' },
      'gunzip': { type: 'file', description: 'gunzip is /bin/gunzip', path: '/bin/gunzip' },
      'zip': { type: 'file', description: 'zip is /usr/bin/zip', path: '/usr/bin/zip' },
      'unzip': { type: 'file', description: 'unzip is /usr/bin/unzip', path: '/usr/bin/unzip' },
      'chmod': { type: 'file', description: 'chmod is /bin/chmod', path: '/bin/chmod' },
      'chown': { type: 'file', description: 'chown is /bin/chown', path: '/bin/chown' },
      'chgrp': { type: 'file', description: 'chgrp is /bin/chgrp', path: '/bin/chgrp' },
      'ps': { type: 'file', description: 'ps is /bin/ps', path: '/bin/ps' },
      'top': { type: 'file', description: 'top is /usr/bin/top', path: '/usr/bin/top' },
      'kill': { type: 'file', description: 'kill is /bin/kill', path: '/bin/kill' },
      'killall': { type: 'file', description: 'killall is /usr/bin/killall', path: '/usr/bin/killall' },
      'man': { type: 'file', description: 'man is /usr/bin/man', path: '/usr/bin/man' },
      'which': { type: 'file', description: 'which is /usr/bin/which', path: '/usr/bin/which' },
      'whereis': { type: 'file', description: 'whereis is /usr/bin/whereis', path: '/usr/bin/whereis' },
      'gcc': { type: 'file', description: 'gcc is /usr/bin/gcc', path: '/usr/bin/gcc' },
      'make': { type: 'file', description: 'make is /usr/bin/make', path: '/usr/bin/make' },
      'git': { type: 'file', description: 'git is /usr/bin/git', path: '/usr/bin/git' },
      'vim': { type: 'file', description: 'vim is /usr/bin/vim', path: '/usr/bin/vim' },
      'nano': { type: 'file', description: 'nano is /usr/bin/nano', path: '/usr/bin/nano' },
      'python': { type: 'file', description: 'python is /usr/bin/python', path: '/usr/bin/python' },
      'python3': { type: 'file', description: 'python3 is /usr/bin/python3', path: '/usr/bin/python3' },
      'node': { type: 'file', description: 'node is /usr/bin/node', path: '/usr/bin/node' },
      'npm': { type: 'file', description: 'npm is /usr/bin/npm', path: '/usr/bin/npm' }
    }
    
    const results = []
    
    for (const command of commands) {
      const info = commandTypes[command]
      
      if (!info) {
        results.push(`type: ${command}: not found`)
        continue
      }
      
      if (options.type) {
        // 仅显示类型
        results.push(info.type)
      } else if (options.path) {
        // 显示路径（仅对外部命令）
        if (info.type === 'file' && info.path) {
          results.push(info.path)
        } else if (info.type === 'builtin') {
          // 内置命令没有路径
          continue
        }
      } else if (options.forcePath) {
        // 强制搜索PATH
        if (info.path) {
          results.push(info.path)
        }
      } else {
        // 默认显示完整描述
        results.push(info.description)
        
        // 如果使用-a选项，显示所有位置
        if (options.all && info.path && info.type === 'builtin') {
          results.push(`${command} is ${info.path}`)
        }
      }
    }
    
    return results.join('\n')
  }
}