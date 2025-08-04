import { formatHelp } from '../utils/helpFormatter.js'

export const alias = {
  name: 'alias',
  description: 'Create or display aliases|创建或显示别名',
  
  options: [
    // 显示选项组
    {
      flag: '-p',
      description: '以可重用格式打印所有别名',
      type: 'boolean',
      group: '显示选项'
    },
    
    // 输入参数
    {
      inputKey: 'alias_definition',
      description: '别名定义（格式：name=value）',
      type: 'input',
      placeholder: '别名定义（如 ll="ls -l" 或留空显示所有别名）',
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
      print: false
    }
    
    const aliasDefinitions = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-p') {
        options.print = true
      } else if (arg === '--help') {
        return formatHelp({
          name: 'alias',
          description: 'Create or display aliases|创建或显示别名',
          usage: 'alias [OPTIONS] [NAME[=VALUE]...]|alias [选项] [名称[=值]...]',
          options: [
            '-p                   Print all aliases in reusable format|以可重用格式打印所有别名',
            '--help               Show this help|显示此帮助'
          ],
          examples: [
            'alias|显示所有别名',
            'alias ll="ls -l"|创建别名ll',
            'alias -p|以可重用格式显示别名',
            'alias grep|显示grep别名'
          ],
          notes: [
            'Without arguments, displays all aliases|不带参数时显示所有别名',
            'Aliases are temporary and lost when shell exits|别名是临时的，shell退出时丢失',
            'Use unalias to remove aliases|使用unalias删除别名'
          ]
        })
      } else if (!arg.startsWith('-')) {
        aliasDefinitions.push(arg)
      }
    }
    
    // 模拟的别名数据库
    const aliases = {
      'll': 'ls -l',
      'la': 'ls -la',
      'l': 'ls -CF',
      'ls': 'ls --color=auto',
      'grep': 'grep --color=auto',
      'fgrep': 'fgrep --color=auto',
      'egrep': 'egrep --color=auto',
      'dir': 'dir --color=auto',
      'vdir': 'vdir --color=auto',
      'rm': 'rm -i',
      'cp': 'cp -i',
      'mv': 'mv -i',
      'df': 'df -h',
      'du': 'du -h',
      'free': 'free -h',
      'ps': 'ps aux',
      'psg': 'ps aux | grep',
      'h': 'history',
      'c': 'clear',
      'q': 'exit',
      'vi': 'vim',
      'nano': 'nano -w',
      'mkdir': 'mkdir -pv',
      'wget': 'wget -c',
      'ping': 'ping -c 5',
      'ports': 'netstat -tulanp',
      'meminfo': 'free -m -l -t',
      'psmem': 'ps auxf | sort -nr -k 4',
      'pscpu': 'ps auxf | sort -nr -k 3',
      'cpuinfo': 'lscpu',
      'gpumeminfo': 'grep -i --color memory /proc/meminfo',
      'whatsmyip': 'curl http://ipecho.net/plain; echo',
      'speed': 'speedtest-cli --server 2406 --simple',
      'ipe': 'curl ipinfo.io/ip',
      'ipi': 'ipconfig getifaddr en0',
      'path': 'echo -e ${PATH//:/\\n}',
      'now': 'date +"%T"',
      'nowtime': 'date +"%d-%m-%Y %T"',
      'nowdate': 'date +"%d-%m-%Y"'
    }
    
    // 如果没有参数，显示所有别名
    if (aliasDefinitions.length === 0) {
      const results = []
      for (const [name, value] of Object.entries(aliases)) {
        if (options.print) {
          results.push(`alias ${name}='${value}'`)
        } else {
          results.push(`${name}='${value}'`)
        }
      }
      return results.join('\n')
    }
    
    const results = []
    
    for (const definition of aliasDefinitions) {
      if (definition.includes('=')) {
        // 创建新别名
        const [name, ...valueParts] = definition.split('=')
        const value = valueParts.join('=').replace(/^['"]|['"]$/g, '') // 移除引号
        aliases[name] = value
        results.push(`alias ${name}='${value}'`)
      } else {
        // 显示指定别名
        const name = definition
        if (aliases[name]) {
          if (options.print) {
            results.push(`alias ${name}='${aliases[name]}'`)
          } else {
            results.push(`${name}='${aliases[name]}'`)
          }
        } else {
          results.push(`alias: ${name}: not found`)
        }
      }
    }
    
    return results.join('\n')
  }
}