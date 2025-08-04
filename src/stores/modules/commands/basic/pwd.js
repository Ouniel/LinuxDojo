/**
 * pwd - 显示当前工作目录
 */

export const pwd = {
  options: [
    {
      flag: '-L',
      longFlag: '--logical',
      description: '打印$PWD的值（如果它指向当前工作目录）',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-P',
      longFlag: '--physical',
      description: '打印物理目录，不包含符号链接',
      type: 'boolean',
      group: '显示选项'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return pwd.help
    }

    const logical = args.includes('-L') || args.includes('--logical')
    const physical = args.includes('-P') || args.includes('--physical')

    try {
      // 确保context存在并有currentPath属性
      let currentPath = '/home/favork' // 默认路径
      
      if (context && context.currentPath) {
        currentPath = context.currentPath
      } else if (fs && fs.currentPath) {
        currentPath = fs.currentPath
      }
      
      // 物理路径模式（解析符号链接）
      if (physical) {
        // 模拟解析符号链接
        currentPath = resolvePath(currentPath)
      }
      
      return currentPath
    } catch (error) {
      return `pwd: ${error.message}`
    }
  },
  description: 'Print current working directory|显示当前工作目录的完整路径',
  category: 'basic',
  requiresArgs: false,
  examples: [
    'pwd',
    'pwd -P',
    'pwd -L'
  ],
  help: `pwd: pwd [-LP]
    Print the full filename of the current working directory.|打印当前工作目录的完整文件名。
    
    Options|选项:
      -L        print the value of $PWD if it names the current working directory|如果$PWD指向当前工作目录则打印其值
      -P        print the physical directory, without any symbolic links|打印物理目录，不包含符号链接
      
    By default, \`pwd' behaves as if \`-L' were specified.|默认情况下，\`pwd'的行为就像指定了\`-L'选项。
    
    Exit Status|退出状态:
    Returns 0 unless an invalid option is given or the current directory cannot be read.|返回0，除非给出了无效选项或无法读取当前目录。`
}

function resolvePath(path) {
  // 简单的路径解析模拟
  return path.replace(/\/\.\//g, '/').replace(/\/[^\/]+\/\.\.\//g, '/')
}