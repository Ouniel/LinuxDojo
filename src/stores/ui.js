import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCommandsStore } from './commands.js'

export const useUIStore = defineStore('ui', () => {
  const commandsStore = useCommandsStore()
  
  // UI状态
  const selectedCommand = ref(null)
  const selectedParameters = ref([])
  const userInputs = ref({})
  const commandOutput = ref('')
  
  // 命令分类定义
  const categories = ref([
    {
      id: 'basic',
      name: '基础命令',
      icon: '📁',
      description: '文件和目录操作的基本命令'
    },
    {
      id: 'text',
      name: '文本处理',
      icon: '📝',
      description: '文本编辑和处理工具'
    },
    {
      id: 'system',
      name: '系统管理',
      icon: '⚙️',
      description: '系统信息和进程管理'
    },
    {
      id: 'network',
      name: '网络工具',
      icon: '🌐',
      description: '网络连接和传输工具'
    },
    {
      id: 'file',
      name: '文件操作',
      icon: '📦',
      description: '文件压缩和归档工具'
    },
    {
      id: 'permission',
      name: '权限管理',
      icon: '🔐',
      description: '用户权限和访问控制'
    },
    {
      id: 'process',
      name: '进程管理',
      icon: '⚡',
      description: '进程控制和作业管理'
    }
  ])
  
  // 将命令对象转换为UI需要的格式
  const commands = computed(() => {
    const commandList = []
    const commandsObj = commandsStore.commands
    
    Object.keys(commandsObj).forEach(name => {
      const cmd = commandsObj[name]
      
      // 确保正确获取命令的选项和参数
      const options = cmd.options || []
      const parameters = cmd.parameters || []
      
      // 调试输出
      if (['id', 'uptime', 'htop', 'passwd', 'useradd', 'userdel', 'usermod', 'groupadd', 'groupdel'].includes(name)) {
        console.log(`UI Store - Command ${name}:`, {
          hasOptions: !!cmd.options,
          optionsLength: options.length,
          options: options,
          fullCommand: cmd
        })
      }
      
      commandList.push({
        id: name,
        name: name,
        description: cmd.description || `${name} 命令`,
        category: cmd.category || 'basic',
        icon: getCommandIcon(name),
        difficulty: getCommandDifficulty(name),
        isHot: isHotCommand(name),
        parameters: parameters,
        options: options,
        // 添加其他有用的信息
        examples: cmd.examples || [],
        help: cmd.help || '',
        usage: cmd.usage || `${name} [选项]`
      })
    })
    
    return commandList
  })
  
  // 获取命令图标
  const getCommandIcon = (name) => {
    const iconMap = {
      // 基础命令
      'ls': '📋', 'cd': '📂', 'pwd': '📍', 'mkdir': '📁', 'rmdir': '🗑️',
      'cp': '📄', 'mv': '🔄', 'rm': '❌', 'cat': '👁️', 'less': '📖',
      'head': '⬆️', 'tail': '⬇️', 'find': '🔍', 'which': '❓', 'whereis': '📍',
      
      // 文本处理
      'grep': '🔎', 'sed': '✏️', 'awk': '🔧', 'sort': '📊', 'uniq': '🎯',
      'cut': '✂️', 'tr': '🔄', 'wc': '📏', 'diff': '⚖️',
      
      // 系统管理
      'ps': '📋', 'top': '📊', 'htop': '📈', 'kill': '💀', 'df': '💾',
      'du': '📏', 'free': '🧠', 'uptime': '⏰', 'who': '👥', 'id': '🆔',
      
      // 网络工具
      'ping': '🏓', 'curl': '🌐', 'wget': '⬇️', 'ssh': '🔐', 'scp': '📤',
      'netstat': '🌐', 'ss': '🔗',
      
      // 文件操作
      'tar': '📦', 'gzip': '🗜️', 'zip': '📦', 'unzip': '📂',
      
      // 权限管理
      'chmod': '🔐', 'chown': '👤', 'su': '👑', 'sudo': '⚡',
      
      // 进程管理
      'jobs': '📋', 'bg': '⏸️', 'fg': '▶️', 'nohup': '🔒'
    }
    
    return iconMap[name] || '⚡'
  }
  
  // 获取命令难度
  const getCommandDifficulty = (name) => {
    const difficultyMap = {
      // 初级 (1-2)
      'ls': 1, 'cd': 1, 'pwd': 1, 'cat': 1, 'echo': 1, 'mkdir': 1,
      'cp': 2, 'mv': 2, 'rm': 2, 'head': 2, 'tail': 2,
      
      // 中级 (3)
      'find': 3, 'grep': 3, 'chmod': 3, 'ps': 3, 'kill': 3,
      'tar': 3, 'ssh': 3, 'curl': 3,
      
      // 高级 (4-5)
      'sed': 4, 'awk': 5, 'netstat': 4, 'iptables': 5
    }
    
    return difficultyMap[name] || 2
  }
  
  // 判断是否为热门命令
  const isHotCommand = (name) => {
    const hotCommands = ['ls', 'cd', 'grep', 'find', 'ps', 'ssh', 'curl', 'tar']
    return hotCommands.includes(name)
  }
  
  // 方法
  const selectCommand = (command) => {
    selectedCommand.value = command
    selectedParameters.value = []
    userInputs.value = {}
    commandOutput.value = ''
  }
  
  const toggleParameter = (parameter) => {
    // 只有布尔类型的参数才能被切换选择状态
    if (parameter.type !== 'boolean') {
      console.warn('只有布尔类型的参数才能被切换选择状态:', parameter)
      return
    }
    
    const index = selectedParameters.value.findIndex(p => p.flag === parameter.flag)
    if (index > -1) {
      selectedParameters.value.splice(index, 1)
    } else {
      selectedParameters.value.push(parameter)
    }
  }
  
  const updateUserInput = (key, value) => {
    userInputs.value[key] = value
  }
  
  const clearParameters = () => {
    selectedParameters.value = []
    userInputs.value = {}
  }
  
  const generateCommand = () => {
    if (!selectedCommand.value) return ''
    
    let command = selectedCommand.value.name
    
    // 添加参数
    selectedParameters.value.forEach(param => {
      if (param.type === 'flag') {
        command += ` ${param.flag}`
      } else if (param.type === 'option' && userInputs.value[param.name]) {
        command += ` ${param.flag} ${userInputs.value[param.name]}`
      }
    })
    
    // 添加用户输入的其他参数
    Object.keys(userInputs.value).forEach(key => {
      if (key !== 'parameters' && userInputs.value[key]) {
        command += ` ${userInputs.value[key]}`
      }
    })
    
    return command
  }
  
  const setCommandOutput = (output) => {
    commandOutput.value = output
  }
  
  const getCommandOutput = () => {
    if (!selectedCommand.value) return ''
    
    const command = generateCommand()
    const parts = command.split(' ')
    const commandName = parts[0]
    const args = parts.slice(1)
    
    return commandsStore.executeCommand(commandName, args, null)
  }
  
  return {
    // 状态
    selectedCommand,
    selectedParameters,
    userInputs,
    commandOutput,
    categories,
    commands,
    
    // 方法
    selectCommand,
    toggleParameter,
    updateUserInput,
    clearParameters,
    generateCommand,
    setCommandOutput,
    getCommandOutput
  }
})