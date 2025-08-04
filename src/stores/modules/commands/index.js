/**
 * 命令模块主入口
 * 整合所有命令模块，提供统一的命令接口
 */

import { basicCommands } from './basic/index.js'
import { textCommands } from './text/index.js'
import { systemCommands } from './system/index.js'
import { networkCommands } from './network/index.js'
import { fileCommands } from './file/index.js'
import { permissionCommands } from './permission/index.js'
import { processCommands } from './process/index.js'

// 所有命令模块
export const commandModules = {
  basic: basicCommands,
  text: textCommands,
  system: systemCommands,
  network: networkCommands,
  file: fileCommands,
  permission: permissionCommands,
  process: processCommands
}

// 合并所有命令
export const allCommands = {
  ...basicCommands,
  ...textCommands,
  ...systemCommands,
  ...networkCommands,
  ...fileCommands,
  ...permissionCommands,
  ...processCommands
}

// 按类别导出
export const commandsByCategory = {
  basic: basicCommands,
  text: textCommands,
  system: systemCommands,
  network: networkCommands,
  file: fileCommands,
  permission: permissionCommands,
  process: processCommands
}

// 获取命令列表
export function getCommandList() {
  return Object.keys(allCommands)
}

// 获取命令信息
export function getCommandInfo(commandName) {
  const command = allCommands[commandName]
  if (!command) {
    return null
  }
  
  return {
    name: commandName,
    description: command.description,
    category: command.category,
    requiresArgs: command.requiresArgs,
    examples: command.examples || []
  }
}

// 获取分类命令列表
export function getCommandsByCategory(category) {
  return commandsByCategory[category] || {}
}

// 搜索命令
export function searchCommands(query) {
  const results = []
  const lowerQuery = query.toLowerCase()
  
  for (const [name, command] of Object.entries(allCommands)) {
    if (name.toLowerCase().includes(lowerQuery) || 
        command.description.toLowerCase().includes(lowerQuery)) {
      results.push({
        name,
        description: command.description,
        category: command.category
      })
    }
  }
  
  return results
}

export default allCommands