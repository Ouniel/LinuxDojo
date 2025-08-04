/**
 * 增强的命令处理器
 * 替换原有的大型CommandProcessor.js，提供更好的架构和性能
 */

import { commandRegistry } from '../stores/modules/commandRegistry.js'
import { PerformanceManager } from './PerformanceManager.js'

export class EnhancedCommandProcessor {
  constructor() {
    this.performanceManager = new PerformanceManager()
    this.commandHistory = []
    this.maxHistorySize = 1000
    this.pipes = []
    this.redirections = []
  }

  /**
   * 处理命令输入
   */
  async processCommand(input, context, filesystem) {
    const startTime = performance.now()
    
    try {
      // 预处理输入
      const processedInput = this.preprocessInput(input)
      
      // 解析命令
      const parsedCommands = this.parseCommand(processedInput)
      
      // 执行命令链
      const result = await this.executeCommandChain(parsedCommands, context, filesystem)
      
      // 记录到历史
      this.addToHistory(input, result)
      
      // 性能监控
      const executionTime = performance.now() - startTime
      this.performanceManager.recordCommandExecution(input, executionTime)
      
      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error.message,
        input: input,
        timestamp: new Date().toISOString()
      }
      
      this.addToHistory(input, errorResult)
      return errorResult
    }
  }

  /**
   * 预处理输入
   */
  preprocessInput(input) {
    return input
      .trim()
      .replace(/\s+/g, ' ') // 合并多个空格
      .replace(/\t/g, ' ')  // 替换制表符
  }

  /**
   * 解析命令（支持管道和重定向）
   */
  parseCommand(input) {
    const commands = []
    
    // 检查是否包含管道
    if (input.includes('|')) {
      const parts = input.split('|').map(part => part.trim())
      parts.forEach((part, index) => {
        const parsed = this.parseSingleCommand(part)
        parsed.isPiped = index > 0
        parsed.pipeIndex = index
        commands.push(parsed)
      })
    } else {
      commands.push(this.parseSingleCommand(input))
    }
    
    return commands
  }

  /**
   * 解析单个命令
   */
  parseSingleCommand(input) {
    const parts = this.tokenize(input)
    const command = {
      name: parts[0] || '',
      args: parts.slice(1),
      redirections: [],
      background: false,
      isPiped: false,
      pipeIndex: 0
    }

    // 处理重定向
    command.args = this.parseRedirections(command.args, command.redirections)
    
    // 处理后台执行
    if (command.args[command.args.length - 1] === '&') {
      command.background = true
      command.args.pop()
    }

    return command
  }

  /**
   * 标记化输入（处理引号）
   */
  tokenize(input) {
    const tokens = []
    let current = ''
    let inQuotes = false
    let quoteChar = ''

    for (let i = 0; i < input.length; i++) {
      const char = input[i]
      
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true
        quoteChar = char
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false
        quoteChar = ''
      } else if (char === ' ' && !inQuotes) {
        if (current) {
          tokens.push(current)
          current = ''
        }
      } else {
        current += char
      }
    }

    if (current) {
      tokens.push(current)
    }

    return tokens
  }

  /**
   * 解析重定向
   */
  parseRedirections(args, redirections) {
    const filteredArgs = []
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      
      if (arg === '>') {
        redirections.push({
          type: 'output',
          target: args[i + 1],
          append: false
        })
        i++ // 跳过下一个参数
      } else if (arg === '>>') {
        redirections.push({
          type: 'output',
          target: args[i + 1],
          append: true
        })
        i++
      } else if (arg === '<') {
        redirections.push({
          type: 'input',
          target: args[i + 1]
        })
        i++
      } else if (arg.startsWith('>')) {
        redirections.push({
          type: 'output',
          target: arg.substring(1),
          append: false
        })
      } else if (arg.startsWith('>>')) {
        redirections.push({
          type: 'output',
          target: arg.substring(2),
          append: true
        })
      } else {
        filteredArgs.push(arg)
      }
    }
    
    return filteredArgs
  }

  /**
   * 执行命令链
   */
  async executeCommandChain(commands, context, filesystem) {
    let previousOutput = null
    let finalResult = null

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      
      // 如果是管道命令，将前一个命令的输出作为输入
      if (command.isPiped && previousOutput) {
        command.pipeInput = previousOutput
      }

      const result = await this.executeSingleCommand(command, context, filesystem)
      
      if (!result.success) {
        return result
      }

      previousOutput = result.output
      finalResult = result
    }

    return finalResult
  }

  /**
   * 执行单个命令
   */
  async executeSingleCommand(command, context, filesystem) {
    const { name, args, redirections, pipeInput } = command

    // 检查命令是否存在
    if (!commandRegistry.hasCommand(name)) {
      throw new Error(`Command not found: ${name}`)
    }

    // 准备执行上下文
    const executionContext = {
      ...context,
      pipeInput,
      redirections,
      command: name,
      args
    }

    // 执行命令
    const result = await commandRegistry.executeCommand(name, args, executionContext, filesystem)

    // 处理重定向
    if (redirections.length > 0 && result.success) {
      result.output = await this.handleRedirections(result.output, redirections, filesystem)
    }

    return result
  }

  /**
   * 处理重定向
   */
  async handleRedirections(output, redirections, filesystem) {
    for (const redirection of redirections) {
      if (redirection.type === 'output') {
        try {
          const content = redirection.append ? 
            (filesystem.readFile(redirection.target) || '') + output :
            output

          filesystem.writeFile(redirection.target, content)
          return `Output redirected to ${redirection.target}`
        } catch (error) {
          throw new Error(`Redirection failed: ${error.message}`)
        }
      }
    }
    
    return output
  }

  /**
   * 添加到历史记录
   */
  addToHistory(input, result) {
    const historyEntry = {
      input,
      result,
      timestamp: new Date().toISOString(),
      success: result.success
    }

    this.commandHistory.unshift(historyEntry)
    
    // 限制历史记录大小
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory = this.commandHistory.slice(0, this.maxHistorySize)
    }
  }

  /**
   * 获取命令历史
   */
  getHistory(limit = 50) {
    return this.commandHistory.slice(0, limit)
  }

  /**
   * 清除历史记录
   */
  clearHistory() {
    this.commandHistory = []
  }

  /**
   * 获取命令建议
   */
  getCommandSuggestions(partial) {
    return commandRegistry.getCompletions(partial)
  }

  /**
   * 搜索命令
   */
  searchCommands(query) {
    return commandRegistry.searchCommands(query)
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return this.performanceManager.getStats()
  }

  /**
   * 验证命令语法
   */
  validateCommandSyntax(input) {
    try {
      const commands = this.parseCommand(input)
      const errors = []

      commands.forEach((command, index) => {
        if (!command.name) {
          errors.push(`Command ${index + 1}: Missing command name`)
        }

        if (!commandRegistry.hasCommand(command.name)) {
          errors.push(`Command ${index + 1}: Unknown command '${command.name}'`)
        }

        // 验证重定向
        command.redirections.forEach(redirection => {
          if (!redirection.target) {
            errors.push(`Command ${index + 1}: Missing redirection target`)
          }
        })
      })

      return {
        valid: errors.length === 0,
        errors
      }
    } catch (error) {
      return {
        valid: false,
        errors: [error.message]
      }
    }
  }

  /**
   * 获取命令帮助
   */
  getCommandHelp(commandName) {
    const command = commandRegistry.getCommand(commandName)
    if (!command) {
      return null
    }

    return {
      name: commandName,
      description: command.description,
      category: command.category,
      examples: command.examples,
      requiresArgs: command.requiresArgs
    }
  }

  /**
   * 获取命令选项（用于参数构建器）
   */
  getCommandOptions(commandName) {
    // 直接从命令模块获取原始命令对象
    const allCommands = commandRegistry.commands
    const command = allCommands.get(commandName)
    
    if (!command) {
      return null
    }

    // 尝试从原始命令对象获取 options
    const originalCommand = this.getOriginalCommand(commandName)
    if (originalCommand && originalCommand.options) {
      return {
        name: commandName,
        description: command.description,
        category: command.category,
        options: originalCommand.options,
        examples: originalCommand.examples || command.examples
      }
    }

    return {
      name: commandName,
      description: command.description,
      category: command.category,
      options: [],
      examples: command.examples
    }
  }

  /**
   * 获取原始命令对象（包含 options）
   */
  async getOriginalCommand(commandName) {
    try {
      // 动态导入命令模块来获取完整的命令对象
      const { allCommands } = await import('../stores/modules/commands/index.js')
      return allCommands[commandName]
    } catch (error) {
      console.warn(`Failed to get original command for ${commandName}:`, error)
      return null
    }
  }

  /**
   * 获取所有命令的选项信息
   */
  async getAllCommandOptions() {
    const commandOptions = {}
    const allCommandNames = commandRegistry.getAllCommands()
    
    for (const commandName of allCommandNames) {
      const options = await this.getCommandOptions(commandName)
      if (options) {
        commandOptions[commandName] = options
      }
    }
    
    return commandOptions
  }

  /**
   * 导出处理器状态（用于调试）
   */
  exportState() {
    return {
      historySize: this.commandHistory.length,
      performanceStats: this.getPerformanceStats(),
      commandStats: commandRegistry.getStats()
    }
  }
}

// 创建全局实例
export const enhancedCommandProcessor = new EnhancedCommandProcessor()