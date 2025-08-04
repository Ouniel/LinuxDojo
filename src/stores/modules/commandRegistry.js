/**
 * 统一命令注册器
 * 整合所有命令模块，提供统一的命令管理接口
 */

import { basicCommands } from './commands/basic/index.js'
import { systemCommands } from './commands/system/index.js'
import { networkCommands } from './commands/network/index.js'
import { textCommands } from './commands/text/index.js'
import { fileCommands } from './commands/file/index.js'
import { helpCommands } from './commands/help.js'
import { permissionCommands } from './commands/permission/index.js'
import { processCommands } from './commands/process/index.js'

/**
 * 命令注册表
 */
export class CommandRegistry {
  constructor() {
    this.commands = new Map()
    this.categories = new Map()
    this.aliases = new Map()
    
    // 注册所有命令模块
    this.registerCommands()
  }

  /**
   * 注册所有命令模块
   */
  registerCommands() {
    const modules = [
      { commands: basicCommands, category: 'basic' },
      { commands: systemCommands, category: 'system' },
      { commands: networkCommands, category: 'network' },
      { commands: textCommands, category: 'text' },
      { commands: fileCommands, category: 'file' },
      { commands: helpCommands, category: 'help' },
      { commands: permissionCommands, category: 'permission' },
      { commands: processCommands, category: 'process' }
    ]

    modules.forEach(({ commands, category }) => {
      Object.entries(commands).forEach(([name, config]) => {
        this.registerCommand(name, {
          ...config,
          category: config.category || category
        })
      })
    })

    // 注册命令别名
    this.registerAliases()
  }

  /**
   * 注册单个命令
   */
  registerCommand(name, config) {
    // 验证命令配置
    if (!config.handler || typeof config.handler !== 'function') {
      throw new Error(`Command ${name} must have a handler function`)
    }

    this.commands.set(name, {
      name,
      handler: config.handler,
      description: config.description || 'No description available',
      category: config.category || 'misc',
      requiresArgs: config.requiresArgs || false,
      examples: config.examples || [],
      aliases: config.aliases || [],
      hidden: config.hidden || false,
      // 保存完整的命令配置，包括 options
      options: config.options || [],
      parameters: config.parameters || [],
      help: config.help || {},
      usage: config.usage || `${name} [options]`
    })

    // 按类别分组
    const category = config.category || 'misc'
    if (!this.categories.has(category)) {
      this.categories.set(category, [])
    }
    this.categories.get(category).push(name)

    // 注册别名
    if (config.aliases) {
      config.aliases.forEach(alias => {
        this.aliases.set(alias, name)
      })
    }
  }

  /**
   * 注册命令别名
   */
  registerAliases() {
    const commonAliases = {
      'll': 'ls',
      'la': 'ls',
      'dir': 'ls',
      'type': 'cat',
      'copy': 'cp',
      'move': 'mv',
      'del': 'rm',
      'remove': 'rm',
      'md': 'mkdir',
      'rd': 'rmdir',
      'cls': 'clear',
      'h': 'help',
      '?': 'help'
    }

    Object.entries(commonAliases).forEach(([alias, command]) => {
      if (this.commands.has(command)) {
        this.aliases.set(alias, command)
      }
    })
  }

  /**
   * 获取命令处理器
   */
  getCommand(name) {
    // 检查别名
    const actualName = this.aliases.get(name) || name
    return this.commands.get(actualName)
  }

  /**
   * 检查命令是否存在
   */
  hasCommand(name) {
    const actualName = this.aliases.get(name) || name
    return this.commands.has(actualName)
  }

  /**
   * 获取所有命令名称
   */
  getAllCommands() {
    return Array.from(this.commands.keys())
  }

  /**
   * 按类别获取命令
   */
  getCommandsByCategory(category) {
    return this.categories.get(category) || []
  }

  /**
   * 获取所有类别
   */
  getAllCategories() {
    return Array.from(this.categories.keys())
  }

  /**
   * 搜索命令
   */
  searchCommands(query) {
    const results = []
    const lowerQuery = query.toLowerCase()

    this.commands.forEach((config, name) => {
      if (config.hidden) return

      let score = 0
      
      // 命令名匹配
      if (name.toLowerCase().includes(lowerQuery)) {
        score += name.toLowerCase() === lowerQuery ? 100 : 50
      }

      // 描述匹配
      if (config.description.toLowerCase().includes(lowerQuery)) {
        score += 20
      }

      // 别名匹配
      if (config.aliases.some(alias => alias.toLowerCase().includes(lowerQuery))) {
        score += 30
      }

      // 示例匹配
      if (config.examples.some(example => example.toLowerCase().includes(lowerQuery))) {
        score += 10
      }

      if (score > 0) {
        results.push({ name, config, score })
      }
    })

    return results
      .sort((a, b) => b.score - a.score)
      .map(result => ({ name: result.name, config: result.config }))
  }

  /**
   * 获取命令自动补全建议
   */
  getCompletions(partial) {
    const suggestions = []
    const lowerPartial = partial.toLowerCase()

    // 命令名补全
    this.commands.forEach((config, name) => {
      if (!config.hidden && name.toLowerCase().startsWith(lowerPartial)) {
        suggestions.push({
          text: name,
          type: 'command',
          description: config.description
        })
      }
    })

    // 别名补全
    this.aliases.forEach((command, alias) => {
      if (alias.toLowerCase().startsWith(lowerPartial)) {
        const config = this.commands.get(command)
        if (config && !config.hidden) {
          suggestions.push({
            text: alias,
            type: 'alias',
            description: `Alias for ${command}`
          })
        }
      }
    })

    return suggestions.sort((a, b) => a.text.localeCompare(b.text))
  }

  /**
   * 获取命令统计信息
   */
  getStats() {
    const stats = {
      totalCommands: this.commands.size,
      totalAliases: this.aliases.size,
      categories: {}
    }

    this.categories.forEach((commands, category) => {
      stats.categories[category] = commands.length
    })

    return stats
  }

  /**
   * 验证命令参数
   */
  validateCommand(name, args) {
    const command = this.getCommand(name)
    if (!command) {
      return { valid: false, error: `Command not found: ${name}` }
    }

    if (command.requiresArgs && args.length === 0) {
      return { 
        valid: false, 
        error: `Command '${name}' requires arguments. Use 'help ${name}' for usage information.` 
      }
    }

    return { valid: true }
  }

  /**
   * 执行命令
   */
  async executeCommand(name, args, context, filesystem) {
    const validation = this.validateCommand(name, args)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const command = this.getCommand(name)
    
    try {
      // 记录命令执行
      this.recordCommandExecution(name, args)
      
      // 执行命令
      const result = await command.handler(args, context, filesystem)
      
      // 处理不同的返回格式
      let output, exitCode = 0
      
      if (typeof result === 'string') {
        // 简单字符串返回
        output = result
      } else if (result && typeof result === 'object') {
        if (result.output !== undefined) {
          // 对象格式：{output: "...", exitCode: 0}
          output = result.output
          exitCode = result.exitCode || 0
        } else {
          // 其他对象格式，转换为字符串
          output = JSON.stringify(result, null, 2)
        }
      } else {
        // 其他类型，转换为字符串
        output = String(result || '')
      }
      
      return {
        success: exitCode === 0,
        output: output,
        exitCode: exitCode,
        command: name,
        args: args
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: `Error: ${error.message}`,
        exitCode: 1,
        command: name,
        args: args
      }
    }
  }

  /**
   * 记录命令执行统计
   */
  recordCommandExecution(name, args) {
    // 这里可以添加统计逻辑
    // 例如：记录命令使用频率、学习进度等
    console.debug(`Command executed: ${name} ${args.join(' ')}`)
  }

  /**
   * 导出命令配置（用于调试）
   */
  exportConfig() {
    const config = {
      commands: {},
      categories: {},
      aliases: {}
    }

    this.commands.forEach((commandConfig, name) => {
      config.commands[name] = {
        description: commandConfig.description,
        category: commandConfig.category,
        requiresArgs: commandConfig.requiresArgs,
        examples: commandConfig.examples,
        aliases: commandConfig.aliases
      }
    })

    this.categories.forEach((commands, category) => {
      config.categories[category] = commands
    })

    this.aliases.forEach((command, alias) => {
      config.aliases[alias] = command
    })

    return config
  }
}

// 创建全局命令注册表实例
export const commandRegistry = new CommandRegistry()

// 导出便捷函数
export const getCommand = (name) => commandRegistry.getCommand(name)
export const hasCommand = (name) => commandRegistry.hasCommand(name)
export const getAllCommands = () => commandRegistry.getAllCommands()
export const searchCommands = (query) => commandRegistry.searchCommands(query)
export const getCompletions = (partial) => commandRegistry.getCompletions(partial)
export const executeCommand = (name, args, context, filesystem) => 
  commandRegistry.executeCommand(name, args, context, filesystem)