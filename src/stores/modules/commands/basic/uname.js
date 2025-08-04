/**
 * uname - 显示系统信息
 */

export const uname = {
  options: [
    {
      flag: '-a',
      longFlag: '--all',
      description: 'Print all information|打印所有信息',
      type: 'boolean',
      group: 'output'
    },
    {
      flag: '-s',
      longFlag: '--kernel-name',
      description: 'Print the kernel name|打印内核名称',
      type: 'boolean',
      group: 'output'
    },
    {
      flag: '-n',
      longFlag: '--nodename',
      description: 'Print the network node hostname|打印网络节点主机名',
      type: 'boolean',
      group: 'output'
    },
    {
      flag: '-r',
      longFlag: '--kernel-release',
      description: 'Print the kernel release|打印内核发行版',
      type: 'boolean',
      group: 'output'
    },
    {
      flag: '-v',
      longFlag: '--kernel-version',
      description: 'Print the kernel version|打印内核版本',
      type: 'boolean',
      group: 'output'
    },
    {
      flag: '-m',
      longFlag: '--machine',
      description: 'Print the machine hardware name|打印机器硬件名称',
      type: 'boolean',
      group: 'output'
    },
    {
      flag: '-p',
      longFlag: '--processor',
      description: 'Print the processor type|打印处理器类型',
      type: 'boolean',
      group: 'output'
    },
    {
      flag: '-i',
      longFlag: '--hardware-platform',
      description: 'Print the hardware platform|打印硬件平台',
      type: 'boolean',
      group: 'output'
    },
    {
      flag: '-o',
      longFlag: '--operating-system',
      description: 'Print the operating system|打印操作系统',
      type: 'boolean',
      group: 'output'
    },
    {
      flag: '--help',
      description: 'Display this help and exit|显示此帮助信息并退出',
      type: 'boolean',
      group: 'help'
    },
    {
      flag: '--version',
      description: 'Output version information and exit|输出版本信息并退出',
      type: 'boolean',
      group: 'help'
    }
  ],
  name: 'uname',
  usage: 'uname [OPTION]...',
  difficulty: 2,
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return uname.help
    }

    const systemInfo = {
      kernel: 'Linux',
      nodename: 'linux-dojo',
      release: '5.15.0-56-generic',
      version: '#62-Ubuntu SMP Tue Nov 22 19:54:14 UTC 2022',
      machine: 'x86_64',
      processor: 'x86_64',
      platform: 'x86_64',
      os: 'GNU/Linux'
    }

    // 如果没有参数，默认显示内核名称
    if (args.length === 0) {
      return systemInfo.kernel
    }

    let output = []
    let showAll = false

    // 解析参数
    for (const arg of args) {
      switch (arg) {
        case '-a':
        case '--all':
          showAll = true
          break
        case '-s':
        case '--kernel-name':
          output.push(systemInfo.kernel)
          break
        case '-n':
        case '--nodename':
          output.push(systemInfo.nodename)
          break
        case '-r':
        case '--kernel-release':
          output.push(systemInfo.release)
          break
        case '-v':
        case '--kernel-version':
          output.push(systemInfo.version)
          break
        case '-m':
        case '--machine':
          output.push(systemInfo.machine)
          break
        case '-p':
        case '--processor':
          output.push(systemInfo.processor)
          break
        case '-i':
        case '--hardware-platform':
          output.push(systemInfo.platform)
          break
        case '-o':
        case '--operating-system':
          output.push(systemInfo.os)
          break
      }
    }

    if (showAll) {
      return `${systemInfo.kernel} ${systemInfo.nodename} ${systemInfo.release} ${systemInfo.version} ${systemInfo.machine} ${systemInfo.processor} ${systemInfo.platform} ${systemInfo.os}`
    }

    return output.length > 0 ? output.join(' ') : systemInfo.kernel
  },
  description: 'Print system information|显示系统信息',
  category: 'system',
  supportsPipe: true,
  examples: [
    'uname',
    'uname -a',
    'uname -r',
    'uname -m',
    'uname --help'
  ],
  help: `Usage: uname [OPTION]...|用法: uname [选项]...
Print certain system information.  With no OPTION, same as -s.|打印某些系统信息。没有选项时，与-s相同。

  -a, --all                print all information, in the following order,|打印所有信息，按以下顺序，
                             except omit -p and -i if unknown:|除非未知，否则省略-p和-i：
  -s, --kernel-name        print the kernel name|打印内核名称
  -n, --nodename           print the network node hostname|打印网络节点主机名
  -r, --kernel-release     print the kernel release|打印内核发行版
  -v, --kernel-version     print the kernel version|打印内核版本
  -m, --machine            print the machine hardware name|打印机器硬件名称
  -p, --processor          print the processor type (non-portable)|打印处理器类型（不可移植）
  -i, --hardware-platform  print the hardware platform (non-portable)|打印硬件平台（不可移植）
  -o, --operating-system   print the operating system|打印操作系统
      --help               display this help and exit|显示此帮助信息并退出
      --version            output version information and exit|输出版本信息并退出

Examples|示例:
  uname                      Print kernel name (Linux)|打印内核名称（Linux）
  uname -a                   Print all system information|打印所有系统信息
  uname -r                   Print kernel release|打印内核发行版
  uname -m                   Print machine hardware name|打印机器硬件名称
  uname -o                   Print operating system|打印操作系统

Note: This is a simulated Linux environment.|注意：这是一个模拟的Linux环境。`
}