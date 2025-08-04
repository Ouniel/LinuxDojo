import { defineStore } from 'pinia'
import { ref } from 'vue'
import { allCommands } from './modules/commands/index.js'

export const useCommandsStore = defineStore('commands', () => {
  const commands = ref(allCommands)
  
  const getCommand = (name) => {
    return commands.value[name]
  }
  
  const executeCommand = (name, args, context, fs) => {
    const command = getCommand(name)
    if (!command) {
      return `Command '${name}' not found. Type 'help' for available commands.`
    }
    
    try {
      if (command.handler) {
        return command.handler(args, context, fs)
      } else if (command.execute) {
        // 向后兼容旧的 execute 方法
        return command.execute(args, context)
      } else {
        return `Command '${name}' has no handler function.`
      }
    } catch (error) {
      return `Error executing command '${name}': ${error.message}`
    }
  }
  
  const getCommandsByCategory = (category) => {
    return Object.values(commands.value).filter(cmd => cmd.category === category)
  }
  
  const getAllCategories = () => {
    const categories = new Set()
    Object.values(commands.value).forEach(cmd => {
      categories.add(cmd.category)
    })
    return Array.from(categories).sort()
  }
  
  const searchCommands = (query) => {
    const lowerQuery = query.toLowerCase()
    return Object.values(commands.value).filter(cmd => 
      cmd.name.toLowerCase().includes(lowerQuery) ||
      cmd.description.toLowerCase().includes(lowerQuery)
    )
  }
  
  return {
    commands,
    getCommand,
    executeCommand,
    getCommandsByCategory,
    getAllCategories,
    searchCommands
  }
})