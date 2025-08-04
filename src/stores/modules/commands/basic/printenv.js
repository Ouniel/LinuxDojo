import { formatHelp } from '../utils/helpFormatter.js'

export const printenv = {
  name: 'printenv',
  description: 'Print environment variables|打印环境变量',
  
  options: [
    // 输出选项组
    {
      flag: '-0',
      longFlag: '--null',
      description: '用空字符而不是换行符结束每行',
      type: 'boolean',
      group: '输出选项'
    },
    
    // 输入参数
    {
      inputKey: 'variable_names',
      description: '要显示的环境变量名',
      type: 'input',
      placeholder: '变量名（支持多个，用空格分隔，留空显示所有）',
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
      null: false
    }
    
    const variables = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '-0' || arg === '--null') {
        options.null = true
      } else if (arg === '--help') {
        return formatHelp({
          name: 'printenv',
          description: 'Print environment variables|打印环境变量',
          usage: 'printenv [OPTIONS] [VARIABLE...]|printenv [选项] [变量...]',
          options: [
            '-0, --null           End each output line with NUL, not newline|用空字符而不是换行符结束每行',
            '--help               Show this help|显示此帮助'
          ],
          examples: [
            'printenv|显示所有环境变量',
            'printenv PATH|显示PATH变量',
            'printenv HOME USER|显示HOME和USER变量'
          ]
        })
      } else if (!arg.startsWith('-')) {
        variables.push(arg)
      }
    }
    
    // 模拟的环境变量
    const envVars = {
      'PATH': '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
      'HOME': '/home/user',
      'USER': 'user',
      'SHELL': '/bin/bash',
      'LANG': 'en_US.UTF-8',
      'PWD': currentPath,
      'TERM': 'xterm-256color',
      'EDITOR': 'vim',
      'PS1': '\\u@\\h:\\w\\$ ',
      'HISTSIZE': '1000',
      'HISTFILESIZE': '2000',
      'LS_COLORS': 'di=34:ln=35:so=32:pi=33:ex=31:bd=34;46:cd=34;43:su=30;41:sg=30;46:tw=30;42:ow=30;43'
    }
    
    const results = []
    const separator = options.null ? '\0' : '\n'
    
    if (variables.length === 0) {
      // 显示所有环境变量
      for (const [name, value] of Object.entries(envVars)) {
        results.push(`${name}=${value}`)
      }
    } else {
      // 显示指定的环境变量
      for (const varName of variables) {
        if (envVars.hasOwnProperty(varName)) {
          results.push(envVars[varName])
        } else {
          // printenv 对于不存在的变量不输出任何内容，也不报错
          // 这里我们跳过不存在的变量
        }
      }
    }
    
    return results.join(separator)
  }
}