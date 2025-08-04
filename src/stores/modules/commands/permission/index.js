/**
 * 权限管理命令模块
 * 包含用户权限、文件权限、访问控制等相关命令
 */

import { umask } from './umask.js'
import { su } from './su.js'
import { sudo } from './sudo.js'
// 从basic模块导入权限相关命令
import { chmod } from '../basic/chmod.js'
import { chown } from '../basic/chown.js'

export const permissionCommands = {
  umask,
  su,
  sudo,
  // 直接导入实际的命令对象，确保包含完整的options配置
  chmod: {
    ...chmod,
    category: 'permission' // 覆盖分类为permission
  },
  chown: {
    ...chown,
    category: 'permission' // 覆盖分类为permission
  }
}

// 命令已经通过permissionCommands对象导出，无需重复导出

// 获取所有权限管理命令列表
export function getPermissionCommands() {
  return Object.keys(permissionCommands).map(name => ({
    name,
    ...permissionCommands[name],
    category: 'permission'
  }))
}

// 搜索权限管理命令
export function searchPermissionCommands(query) {
  const commands = getPermissionCommands()
  const lowerQuery = query.toLowerCase()
  
  return commands.filter(cmd => 
    cmd.name.toLowerCase().includes(lowerQuery) ||
    cmd.description.toLowerCase().includes(lowerQuery) ||
    (cmd.examples && cmd.examples.some(example => example.toLowerCase().includes(lowerQuery)))
  )
}

// 按功能分组的权限命令
export const permissionCommandGroups = {
  userSwitching: {
    name: 'User Switching|用户切换',
    commands: ['su', 'sudo'],
    description: 'Switch user identity and privilege escalation|切换用户身份和权限提升'
  },
  filePermissions: {
    name: 'File Permissions|文件权限',
    commands: ['chmod', 'chown', 'umask'],
    description: 'File and directory permission management|文件和目录权限管理'
  }
}

// 权限相关的帮助信息
export const permissionHelp = {
  overview: `权限管理命令帮助

Linux权限系统基础：
- 每个文件和目录都有所有者(owner)、组(group)和其他用户(others)的权限
- 权限分为读(r)、写(w)、执行(x)三种
- 数字表示法：r=4, w=2, x=1

常用权限值：
- 755: rwxr-xr-x (目录常用)
- 644: rw-r--r-- (文件常用)
- 600: rw------- (私有文件)
- 777: rwxrwxrwx (完全开放，不推荐)

用户切换：
- su: 切换到其他用户
- sudo: 以其他用户身份执行命令

文件权限：
- chmod: 修改文件权限
- chown: 修改文件所有者
- umask: 设置默认权限掩码`,

  security: `权限安全最佳实践：

1. 最小权限原则
   - 只给予必要的最小权限
   - 定期审查权限设置

2. sudo使用建议
   - 优先使用sudo而不是su
   - 配置具体的命令权限而不是ALL
   - 设置合理的超时时间

3. 文件权限建议
   - 敏感文件设置为600或更严格
   - 可执行文件避免给others写权限
   - 目录权限通常比文件权限更宽松

4. umask设置
   - 普通用户建议022
   - 安全要求高的环境使用077
   - 服务器环境根据需要调整`
}

export default permissionCommands