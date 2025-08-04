/**
 * id - 显示用户和组ID
 */

export const id = {
  name: 'id',
  description: 'Print user and group IDs|显示用户和组ID',
  category: 'system',
  options: [
    {
      flag: '-a',
      description: '忽略，为了与其他版本兼容',
      type: 'boolean',
      group: 'compatibility'
    },
    {
      flag: '-Z',
      longFlag: '--context',
      description: '仅打印进程的安全上下文',
      type: 'boolean',
      group: 'security'
    },
    {
      flag: '-g',
      longFlag: '--group',
      description: '仅打印有效组ID',
      type: 'boolean',
      group: 'display'
    },
    {
      flag: '-G',
      longFlag: '--groups',
      description: '打印所有组ID',
      type: 'boolean',
      group: 'display'
    },
    {
      flag: '-n',
      longFlag: '--name',
      description: '对于-ugG，打印名称而不是数字',
      type: 'boolean',
      group: 'format'
    },
    {
      flag: '-r',
      longFlag: '--real',
      description: '对于-ugG，打印真实ID而不是有效ID',
      type: 'boolean',
      group: 'format'
    },
    {
      flag: '-u',
      longFlag: '--user',
      description: '仅打印有效用户ID',
      type: 'boolean',
      group: 'display'
    },
    {
      flag: '-z',
      longFlag: '--zero',
      description: '用NUL字符分隔条目，而不是空白',
      type: 'boolean',
      group: 'format'
    },
    {
      inputKey: 'username',
      description: '指定要查看的用户名',
      type: 'input',
      placeholder: '输入用户名 (默认为当前用户)',
      group: 'target'
    },
    {
      flag: '--help',
      description: '显示帮助信息',
      type: 'boolean',
      group: 'help'
    },
    {
      flag: '--version',
      description: '显示版本信息',
      type: 'boolean',
      group: 'help'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return id.help
    }

    let showUser = args.includes('-u') || args.includes('--user')
    let showGroup = args.includes('-g') || args.includes('--group')
    let showGroups = args.includes('-G') || args.includes('--groups')
    let showNames = args.includes('-n') || args.includes('--name')
    let showReal = args.includes('-r') || args.includes('--real')
    let showContext = args.includes('-Z') || args.includes('--context')
    
    // 过滤出用户名
    const users = args.filter(arg => !arg.startsWith('-'))
    const targetUser = users.length > 0 ? users[0] : 'favork'
    
    // 模拟的用户信息
    const userInfo = {
      uid: 1000,
      gid: 1000,
      username: 'favork',
      groupname: 'favork',
      groups: [
        { gid: 1000, name: 'favork' },
        { gid: 4, name: 'adm' },
        { gid: 24, name: 'cdrom' },
        { gid: 27, name: 'sudo' },
        { gid: 30, name: 'dip' },
        { gid: 46, name: 'plugdev' },
        { gid: 120, name: 'lpadmin' },
        { gid: 131, name: 'lxd' },
        { gid: 132, name: 'sambashare' }
      ]
    }
    
    if (users.length > 0 && targetUser !== 'favork') {
      return `id: '${targetUser}': no such user`
    }
    
    if (showUser) {
      if (showNames) {
        return userInfo.username
      } else {
        return userInfo.uid.toString()
      }
    }
    
    if (showGroup) {
      if (showNames) {
        return userInfo.groupname
      } else {
        return userInfo.gid.toString()
      }
    }
    
    if (showGroups) {
      if (showNames) {
        return userInfo.groups.map(g => g.name).join(' ')
      } else {
        return userInfo.groups.map(g => g.gid).join(' ')
      }
    }
    
    if (showContext) {
      return 'unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023'
    }
    
    // 默认输出格式
    const groupsStr = userInfo.groups.map(g => `${g.gid}(${g.name})`).join(',')
    return `uid=${userInfo.uid}(${userInfo.username}) gid=${userInfo.gid}(${userInfo.groupname}) groups=${groupsStr}`
  },
  usage: 'id [选项] [用户名]',
  supportsPipe: true,
  examples: [
    'id',
    'id -u',
    'id -g',
    'id -G',
    'id -un',
    'id --help'
  ],
  help: `Usage: id [OPTION]... [USER]|用法: id [选项]... [用户]
Print user and group IDs for USER, or for the current user.|打印用户的用户和组ID，或当前用户的。

  -a             ignore, for compatibility with other versions|忽略，为了与其他版本兼容
  -Z, --context  print only the security context of the process|仅打印进程的安全上下文
  -g, --group    print only the effective group ID|仅打印有效组ID
  -G, --groups   print all group IDs|打印所有组ID
  -n, --name     print a name instead of a number, for -ugG|对于-ugG，打印名称而不是数字
  -r, --real     print the real ID instead of the effective ID, with -ugG|对于-ugG，打印真实ID而不是有效ID
  -u, --user     print only the effective user ID|仅打印有效用户ID
  -z, --zero     delimit entries with NUL characters, not whitespace;|用NUL字符分隔条目，而不是空白；
                   not permitted in default format|在默认格式中不允许
      --help     display this help and exit|显示此帮助信息并退出
      --version  output version information and exit|输出版本信息并退出

Without any OPTION, print some useful set of identified information.|没有任何选项时，打印一些有用的标识信息集合。

Examples|示例:
  id                        Show all user and group information|显示所有用户和组信息
  id -u                     Show only user ID|仅显示用户ID
  id -un                    Show only username|仅显示用户名
  id -g                     Show only group ID|仅显示组ID
  id -gn                    Show only group name|仅显示组名
  id -G                     Show all group IDs|显示所有组ID
  id -Gn                    Show all group names|显示所有组名

Note: This is a simulated environment with predefined user information.|注意：这是一个具有预定义用户信息的模拟环境。`
}