import { formatHelp } from '../utils/helpFormatter.js'

export const unalias = {
  name: 'unalias',
  description: 'Remove command aliases|删除命令别名',
  
  options: [
    // 操作选项组
    {
      flag: '-a',
      description: '删除所有别名',
      type: 'boolean',
      group: '操作选项'
    },
    
    // 输入参数
    {
      inputKey: 'alias_names',
      description: '要删除的别名名称',
      type: 'input',
      placeholder: '别名名称（如 ll la，支持多个）',
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
      all: false
    }
    
    const aliasNames = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-a') {
        options.all = true
      } else if (arg === '--help') {
        return formatHelp({
          name: 'unalias',
          description: 'Remove command aliases|删除命令别名',
          usage: 'unalias [OPTIONS] NAME...|unalias [选项] 名称...',
          options: [
            '-a                   Remove all aliases|删除所有别名',
            '--help               Show this help|显示此帮助'
          ],
          examples: [
            'unalias ll|删除别名ll',
            'unalias ll la|删除多个别名',
            'unalias -a|删除所有别名'
          ],
          notes: [
            'Removes aliases created by alias command|删除由alias命令创建的别名',
            'Returns error if alias does not exist|如果别名不存在则返回错误',
            'Use alias command to view existing aliases|使用alias命令查看现有别名'
          ]
        })
      } else if (!arg.startsWith('-')) {
        aliasNames.push(arg)
      }
    }
    
    // 模拟的别名数据库（与alias命令共享）
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
    
    if (options.all) {
      // 删除所有别名
      const count = Object.keys(aliases).length
      // 在实际实现中，这里会清空别名数据库
      return `unalias: removed ${count} aliases`
    }
    
    if (aliasNames.length === 0) {
      return 'unalias: usage: unalias [-a] name [name ...]'
    }
    
    const results = []
    let hasError = false
    
    for (const name of aliasNames) {
      if (aliases[name]) {
        // 在实际实现中，这里会从别名数据库中删除
        results.push(`unalias: removed alias '${name}'`)
      } else {
        results.push(`unalias: ${name}: not found`)
        hasError = true
      }
    }
    
    return results.join('\n')
  }
}