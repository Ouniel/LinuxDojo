/**
 * 软件包管理命令模块
 * 包含各种Linux发行版的包管理工具
 */

import { apt } from './apt.js'
import { yum } from './yum.js'

export const packageCommands = {
  apt,
  yum
}

export default packageCommands

// 获取所有软件包管理命令列表
export function getPackageCommands() {
  return Object.keys(packageCommands).map(name => ({
    name,
    ...packageCommands[name],
    category: 'package'
  }))
}

// 搜索软件包管理命令
export function searchPackageCommands(query) {
  const commands = getPackageCommands()
  const lowerQuery = query.toLowerCase()
  
  return commands.filter(cmd => 
    cmd.name.toLowerCase().includes(lowerQuery) ||
    cmd.description.toLowerCase().includes(lowerQuery)
  )
}
