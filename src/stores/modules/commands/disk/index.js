/**
 * 磁盘管理命令模块
 * 包含磁盘分区、文件系统管理等命令
 */

import { fdisk } from './fdisk.js'
import { parted } from './parted.js'
import { mkfs } from './mkfs.js'
import { fsck } from './fsck.js'

export const diskCommands = {
  fdisk,
  parted,
  mkfs,
  fsck
}

export default diskCommands

// 获取所有磁盘管理命令列表
export function getDiskCommands() {
  return Object.keys(diskCommands).map(name => ({
    name,
    ...diskCommands[name],
    category: 'disk'
  }))
}

// 搜索磁盘管理命令
export function searchDiskCommands(query) {
  const commands = getDiskCommands()
  const lowerQuery = query.toLowerCase()
  
  return commands.filter(cmd => 
    cmd.name.toLowerCase().includes(lowerQuery) ||
    cmd.description.toLowerCase().includes(lowerQuery)
  )
}
