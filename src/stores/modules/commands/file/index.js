/**
 * 文件操作命令模块
 * 包含文件压缩、解压、归档等高级文件操作命令
 */

import { tar } from './tar.js'
import { zip } from './zip.js'
import { unzip } from './unzip.js'
import { gzip } from './gzip.js'
import { gunzip } from './gunzip.js'
import { zcat } from './zcat.js'
import { compress } from './compress.js'
import { uncompress } from './uncompress.js'
import { openssl } from './openssl.js'

export const fileCommands = {
  tar,
  zip,
  unzip,
  gzip,
  gunzip,
  zcat,
  compress,
  uncompress,
  openssl
}

// 命令已经通过fileCommands对象导出，无需重复导出

// 获取所有文件操作命令列表
export function getFileCommands() {
  return Object.keys(fileCommands).map(name => ({
    name,
    ...fileCommands[name],
    category: 'file'
  }))
}

// 搜索文件操作命令
export function searchFileCommands(query) {
  const commands = getFileCommands()
  const lowerQuery = query.toLowerCase()

  return commands.filter(cmd =>
    cmd.name.toLowerCase().includes(lowerQuery) ||
    cmd.description.toLowerCase().includes(lowerQuery) ||
    cmd.examples.some(example => example.toLowerCase().includes(lowerQuery))
  )
}

// 按功能分组的命令
export const fileCommandGroups = {
  compression: {
    name: 'Compression Tools|压缩工具',
    commands: ['gzip', 'gunzip', 'zcat', 'compress', 'uncompress'],
    description: 'File compression and decompression tools|文件压缩和解压工具'
  },
  archive: {
    name: 'Archive Tools|归档工具',
    commands: ['tar', 'zip', 'unzip'],
    description: 'File and directory archiving tools|文件和目录归档工具'
  }
}

export default fileCommands