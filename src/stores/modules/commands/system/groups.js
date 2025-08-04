import { formatHelp } from '../utils/helpFormatter.js'

export const groups = {
  name: 'groups',
  description: 'Print group memberships for users|打印用户的组成员身份',
  
  options: [
    // 输入参数
    {
      inputKey: 'usernames',
      description: '要查询的用户名',
      type: 'input',
      placeholder: '用户名（支持多个用户，用空格分隔，留空显示当前用户）',
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
    if (args.length === 0) {
      return formatHelp({
        name: 'groups',
        description: 'Print group memberships for users|打印用户的组成员身份',
        usage: 'groups [USER...]|groups [用户...]',
        options: [
          '--help               Show this help|显示此帮助'
        ],
        examples: [
          'groups|显示当前用户的组',
          'groups user1 user2|显示指定用户的组',
          'groups root|显示root用户的组',
          'groups admin guest|显示多个用户的组',
          'groups www-data|显示web服务用户的组'
        ],
        notes: [
          'If no users are specified, shows groups for current user|如果未指定用户，显示当前用户的组',
          'Groups are simulated in this environment|在此环境中组是模拟的',
          'Output format: username : group1 group2 group3|输出格式：用户名 : 组1 组2 组3'
        ]
      })
    }
    
    const users = []
    
    // 解析参数
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '--help') {
        return formatHelp({
          name: 'groups',
          description: 'Print group memberships for users|打印用户的组成员身份',
          usage: 'groups [USER...]|groups [用户...]',
          options: [
            '--help               Show this help|显示此帮助'
          ],
          examples: [
            'groups|显示当前用户的组',
            'groups user1 user2|显示指定用户的组',
            'groups root|显示root用户的组'
          ],
          notes: [
            'If no users are specified, shows groups for current user|如果未指定用户，显示当前用户的组',
            'Groups are simulated in this environment|在此环境中组是模拟的'
          ]
        })
      } else if (!arg.startsWith('-')) {
        users.push(arg)
      }
    }
    
    // 模拟的用户组数据
    const userGroups = {
      'root': ['root', 'wheel', 'admin'],
      'user': ['user', 'users', 'wheel'],
      'admin': ['admin', 'users', 'wheel', 'sudo'],
      'guest': ['guest', 'users'],
      'www-data': ['www-data', 'users'],
      'mysql': ['mysql'],
      'postgres': ['postgres'],
      'nginx': ['nginx', 'www-data'],
      'developer': ['developer', 'users', 'docker', 'sudo'],
      'tester': ['tester', 'users', 'qa'],
      'operator': ['operator', 'users', 'monitoring']
    }
    
    const results = []
    
    if (users.length === 0) {
      // 如果没有指定用户，显示当前用户的组
      const currentUser = 'user' // 模拟当前用户
      const groups = userGroups[currentUser] || ['users']
      results.push(groups.join(' '))
    } else {
      // 显示指定用户的组
      for (const username of users) {
        const groups = userGroups[username]
        
        if (!groups) {
          results.push(`groups: '${username}': no such user`)
          continue
        }
        
        if (users.length === 1) {
          results.push(groups.join(' '))
        } else {
          results.push(`${username} : ${groups.join(' ')}`)
        }
      }
    }
    
    return results.join('\n')
  }
}