import { formatHelp } from '../utils/helpFormatter.js'

export const whereis = {
  name: 'whereis',
  description: 'Locate the binary, source, and manual page files for a command|定位命令的二进制文件、源文件和手册页文件',
  
  options: [
    // 搜索类型组
    {
      flag: '-b',
      description: '仅搜索二进制文件',
      type: 'boolean',
      group: '搜索类型'
    },
    {
      flag: '-m',
      description: '仅搜索手册页',
      type: 'boolean',
      group: '搜索类型'
    },
    {
      flag: '-s',
      description: '仅搜索源文件',
      type: 'boolean',
      group: '搜索类型'
    },
    {
      flag: '-u',
      description: '搜索异常条目（缺少某种类型文件的命令）',
      type: 'boolean',
      group: '搜索类型'
    },
    
    // 输入参数
    {
      inputKey: 'command_names',
      description: '要查找的命令名称',
      type: 'input',
      placeholder: '命令名（如 ls gcc vim，支持多个）',
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
      binary: false,
      manual: false,
      source: false,
      unusual: false
    }
    
    const commands = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-b') {
        options.binary = true
      } else if (arg === '-m') {
        options.manual = true
      } else if (arg === '-s') {
        options.source = true
      } else if (arg === '-u') {
        options.unusual = true
      } else if (arg === '--help') {
        return formatHelp({
          name: 'whereis',
          description: 'Locate the binary, source, and manual page files for a command|定位命令的二进制文件、源文件和手册页文件',
          usage: 'whereis [OPTIONS] COMMAND...|whereis [选项] 命令...',
          options: [
            '-b                   Search only for binaries|仅搜索二进制文件',
            '-m                   Search only for manual sections|仅搜索手册页',
            '-s                   Search only for sources|仅搜索源文件',
            '-u                   Search for unusual entries|搜索异常条目',
            '--help               Show this help|显示此帮助'
          ],
          examples: [
            'whereis ls|查找ls命令的位置',
            'whereis -b gcc|仅查找gcc的二进制文件',
            'whereis -m man|仅查找man的手册页'
          ],
          notes: [
            'Searches standard locations for files|在标准位置搜索文件',
            'Results are simulated in this environment|在此环境中结果是模拟的'
          ]
        })
      } else if (!arg.startsWith('-')) {
        commands.push(arg)
      }
    }
    
    if (commands.length === 0) {
      return 'whereis: missing command name\nUsage: whereis [OPTIONS] COMMAND...'
    }
    
    // 如果没有指定特定选项，显示所有类型
    const showAll = !options.binary && !options.manual && !options.source
    
    // 模拟的命令位置数据
    const commandLocations = {
      'ls': {
        binary: ['/bin/ls'],
        manual: ['/usr/share/man/man1/ls.1.gz'],
        source: []
      },
      'cat': {
        binary: ['/bin/cat'],
        manual: ['/usr/share/man/man1/cat.1.gz'],
        source: []
      },
      'grep': {
        binary: ['/bin/grep'],
        manual: ['/usr/share/man/man1/grep.1.gz'],
        source: []
      },
      'gcc': {
        binary: ['/usr/bin/gcc'],
        manual: ['/usr/share/man/man1/gcc.1.gz'],
        source: ['/usr/src/gcc']
      },
      'vim': {
        binary: ['/usr/bin/vim'],
        manual: ['/usr/share/man/man1/vim.1.gz'],
        source: []
      },
      'bash': {
        binary: ['/bin/bash'],
        manual: ['/usr/share/man/man1/bash.1.gz'],
        source: []
      },
      'python': {
        binary: ['/usr/bin/python', '/usr/bin/python3'],
        manual: ['/usr/share/man/man1/python.1.gz'],
        source: []
      },
      'node': {
        binary: ['/usr/bin/node'],
        manual: ['/usr/share/man/man1/node.1.gz'],
        source: []
      },
      'git': {
        binary: ['/usr/bin/git'],
        manual: ['/usr/share/man/man1/git.1.gz'],
        source: []
      },
      'make': {
        binary: ['/usr/bin/make'],
        manual: ['/usr/share/man/man1/make.1.gz'],
        source: []
      },
      'tar': {
        binary: ['/bin/tar'],
        manual: ['/usr/share/man/man1/tar.1.gz'],
        source: []
      },
      'find': {
        binary: ['/usr/bin/find'],
        manual: ['/usr/share/man/man1/find.1.gz'],
        source: []
      },
      'sed': {
        binary: ['/bin/sed'],
        manual: ['/usr/share/man/man1/sed.1.gz'],
        source: []
      },
      'awk': {
        binary: ['/usr/bin/awk'],
        manual: ['/usr/share/man/man1/awk.1.gz'],
        source: []
      },
      'man': {
        binary: ['/usr/bin/man'],
        manual: ['/usr/share/man/man1/man.1.gz'],
        source: []
      }
    }
    
    const results = []
    
    for (const command of commands) {
      const locations = commandLocations[command] || { binary: [], manual: [], source: [] }
      const parts = [command + ':']
      
      if (showAll || options.binary) {
        parts.push(...locations.binary)
      }
      
      if (showAll || options.source) {
        parts.push(...locations.source)
      }
      
      if (showAll || options.manual) {
        parts.push(...locations.manual)
      }
      
      // 检查是否为异常条目（如果启用了-u选项）
      if (options.unusual) {
        const hasAllTypes = locations.binary.length > 0 && 
                           locations.manual.length > 0 && 
                           locations.source.length > 0
        
        if (hasAllTypes) {
          continue // 跳过有完整条目的命令
        }
      }
      
      results.push(parts.join(' '))
    }
    
    return results.join('\n')
  }
}