// 网络命令模块 - 重构为模块化结构
import { networkCommands } from './network/index.js'

// 导出网络命令
export { networkCommands }

// 为了保持向后兼容，也可以直接导出
export const {
  ping,
  curl,
  wget,
  netstat,
  ssh
} = networkCommands