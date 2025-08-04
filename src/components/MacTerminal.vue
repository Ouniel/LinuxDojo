<template>
  <div class="mac-terminal">
    <!-- Mac风格标题栏 -->
    <div class="terminal-header">
      <div class="traffic-lights">
        <div class="light red" @click="$emit('close')"></div>
        <div class="light yellow" @click="$emit('minimize')"></div>
        <div class="light green" @click="$emit('maximize')"></div>
      </div>
      <div class="terminal-title">{{ title }}</div>
      <div class="terminal-controls">
        <button @click="clearTerminal" class="control-btn" title="清空终端">
          <span>🗑️</span>
        </button>
        <button @click="toggleTheme" class="control-btn" title="切换主题">
          <span>🎨</span>
        </button>
      </div>
    </div>

    <!-- 终端内容区 -->
    <div class="terminal-content" ref="terminalContent" @click="focusInput">
      <!-- 历史命令和输出 -->
      <div v-for="(entry, index) in terminalHistory" :key="index" class="terminal-entry">
        <!-- 命令行 -->
        <div class="command-line">
          <span class="prompt">{{ prompt }}</span>
          <span class="command-text">{{ entry.command }}</span>
        </div>
        <!-- 输出 -->
        <div v-if="entry.output" class="command-output">
          <pre v-html="formatOutput(entry.output)"></pre>
        </div>
      </div>

      <!-- 当前命令行 -->
      <div class="current-command-line">
        <span class="prompt">{{ prompt }}</span>
        <input 
          ref="terminalInput"
          v-model="currentInput"
          @keydown="handleKeydown"
          @input="handleInput"
          class="terminal-input"
          spellcheck="false"
          autocomplete="off"
          :placeholder="inputPlaceholder"
        />
        <span class="cursor" :class="{ 'blink': !isTyping }">▊</span>
      </div>

      <!-- 自动补全提示 -->
      <div v-if="suggestions.length > 0" class="suggestions">
        <div 
          v-for="(suggestion, index) in suggestions" 
          :key="index"
          class="suggestion-item"
          :class="{ 'active': index === selectedSuggestion }"
          @click="applySuggestion(suggestion)"
        >
          <span class="suggestion-command">{{ suggestion.command }}</span>
          <span class="suggestion-desc">{{ suggestion.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useFilesystemStore } from '@/stores/filesystem'
import { EnhancedCommandProcessor } from '@/core/EnhancedCommandProcessor'

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'favork@linux:~'
  },
  initialPath: {
    type: String,
    default: '~'
  },
  theme: {
    type: String,
    default: 'dark'
  },
  externalCommand: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['close', 'minimize', 'maximize', 'command-executed'])

// 响应式数据
const currentInput = ref('')
const terminalHistory = ref([])
const commandHistory = ref([])
const historyIndex = ref(-1)
const currentPath = ref(props.initialPath)
const terminalInput = ref(null)
const terminalContent = ref(null)
const isTyping = ref(false)
const suggestions = ref([])
const selectedSuggestion = ref(-1)
const currentTheme = ref(props.theme)

// 获取filesystem store
const filesystemStore = useFilesystemStore()

// 初始化命令处理器
const commandProcessor = new EnhancedCommandProcessor()

// 计算属性
const prompt = computed(() => `favork@linux:${filesystemStore.getDisplayPath()}$ `)
const inputPlaceholder = computed(() => '输入命令... (Tab键自动补全)')

// 从命令处理器获取可用命令
const commandDatabase = computed(() => {
  const commands = commandProcessor.getAvailableCommands()
  const database = {}
  
  commands.forEach(cmd => {
    database[cmd.name] = {
      description: cmd.description || '命令描述',
      category: cmd.category || 'general'
    }
  })
  
  return database
})

// 方法
const handleKeydown = (e) => {
  console.log('Key pressed:', e.key) // 调试日志
  
  switch (e.key) {
    case 'Enter':
      e.preventDefault()
      executeCommand()
      break
    case 'ArrowUp':
      e.preventDefault()
      navigateHistory(-1)
      break
    case 'ArrowDown':
      e.preventDefault()
      navigateHistory(1)
      break
    case 'Tab':
      e.preventDefault()
      handleTabCompletion()
      break
    case 'ArrowLeft':
    case 'ArrowRight':
      // 允许左右箭头移动光标
      break
    case 'Escape':
      e.preventDefault()
      clearSuggestions()
      break
    default:
      // 其他按键继续正常处理
      break
  }
}

const handleInput = () => {
  updateSuggestions()
}

const executeCommand = async () => {
  console.log('executeCommand called') // 调试日志
  const command = currentInput.value.trim()
  console.log('Command to execute:', command) // 调试日志
  
  if (!command) {
    console.log('Empty command, returning') // 调试日志
    return
  }

  // 添加到历史记录
  if (command !== 'clear') {
    commandHistory.value.push(command)
    historyIndex.value = -1
  }

  // 创建历史条目
  const entry = {
    command: command,
    output: '',
    timestamp: new Date().toLocaleTimeString()
  }

  // 特殊命令处理 - clear命令
  if (command === 'clear') {
    terminalHistory.value = []
    currentInput.value = ''
    return
  }

  try {
    // 使用EnhancedCommandProcessor执行命令
    console.log('Using EnhancedCommandProcessor to execute:', command) // 调试日志
    const result = await commandProcessor.processCommand(command, {}, filesystemStore)
    console.log('Command result:', result) // 调试日志
    
    entry.output = result.output || result.error || ''
    
    // 如果是cd命令且成功，不显示输出
    if (command.startsWith('cd ') && result.success && !result.output) {
      entry.output = ''
    }
    
  } catch (error) {
    console.error('Command execution error:', error)
    entry.output = `Error: ${error.message}`
  }

  // 只有在有输出时才添加到历史记录
  if (entry.output || !command.startsWith('cd ')) {
    terminalHistory.value.push(entry)
  }
  
  currentInput.value = ''
  clearSuggestions()

  // 发送命令执行事件
  emit('command-executed', { command, output: entry.output })

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}



const navigateHistory = (direction) => {
  if (commandHistory.value.length === 0) return

  if (direction === -1) { // 上箭头
    if (historyIndex.value === -1) {
      historyIndex.value = commandHistory.value.length - 1
    } else if (historyIndex.value > 0) {
      historyIndex.value--
    }
  } else if (direction === 1) { // 下箭头
    if (historyIndex.value < commandHistory.value.length - 1) {
      historyIndex.value++
    } else {
      historyIndex.value = -1
      currentInput.value = ''
      return
    }
  }

  if (historyIndex.value >= 0) {
    currentInput.value = commandHistory.value[historyIndex.value]
  }
}

const handleTabCompletion = () => {
  const input = currentInput.value.trim()
  if (!input) {
    showAllCommands()
    return
  }

  const availableCommands = commandProcessor.getAvailableCommands()
  const matches = availableCommands.filter(cmd => cmd.name.startsWith(input))
  
  if (matches.length === 1) {
    currentInput.value = matches[0].name + ' '
    clearSuggestions()
  } else if (matches.length > 1) {
    suggestions.value = matches.map(cmd => ({
      command: cmd.name,
      description: cmd.description || '命令描述'
    }))
    selectedSuggestion.value = 0
  }
}

const updateSuggestions = () => {
  const input = currentInput.value.trim()
  if (!input) {
    clearSuggestions()
    return
  }

  const availableCommands = commandProcessor.getAvailableCommands()
  const matches = availableCommands
    .filter(cmd => cmd.name.includes(input.toLowerCase()))
    .slice(0, 5)
    .map(cmd => ({
      command: cmd.name,
      description: cmd.description || '命令描述'
    }))

  suggestions.value = matches
  selectedSuggestion.value = matches.length > 0 ? 0 : -1
}

const showAllCommands = () => {
  const availableCommands = commandProcessor.getAvailableCommands()
  suggestions.value = availableCommands
    .slice(0, 10)
    .map(cmd => ({
      command: cmd.name,
      description: cmd.description || '命令描述'
    }))
  selectedSuggestion.value = 0
}

const applySuggestion = (suggestion) => {
  currentInput.value = suggestion.command + ' '
  clearSuggestions()
  focusInput()
}

const clearSuggestions = () => {
  suggestions.value = []
  selectedSuggestion.value = -1
}

const clearTerminal = () => {
  terminalHistory.value = []
}

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
}

const focusInput = () => {
  if (terminalInput.value) {
    terminalInput.value.focus()
  }
}

const scrollToBottom = () => {
  if (terminalContent.value) {
    terminalContent.value.scrollTop = terminalContent.value.scrollHeight
  }
}

const formatOutput = (output) => {
  // 简单的输出格式化，添加颜色和样式
  return output
    .replace(/^(.*):$/gm, '<span class="output-header">$1:</span>')
    .replace(/\b(error|Error|ERROR)\b/g, '<span class="output-error">$1</span>')
    .replace(/\b(success|Success|SUCCESS|OK)\b/g, '<span class="output-success">$1</span>')
    .replace(/\b(warning|Warning|WARNING)\b/g, '<span class="output-warning">$1</span>')
    .replace(/\b(\d+\.\d+\.\d+\.\d+)\b/g, '<span class="output-ip">$1</span>')
    .replace(/\b(https?:\/\/[^\s]+)\b/g, '<span class="output-url">$1</span>')
}

// 生命周期
onMounted(() => {
  focusInput()
  
  // 添加欢迎信息
  terminalHistory.value.push({
    command: '',
    output: `🎉 欢迎使用 Linux Dojo 终端模拟器！

这是一个功能完整的Linux终端模拟器，支持常用的Linux命令。
输入 'help' 查看所有可用命令，或者直接开始输入命令。

特性：
✨ 支持命令自动补全 (Tab键)
📚 命令历史记录 (↑↓箭头键)
🎨 语法高亮输出
🔍 智能命令建议

开始你的Linux学习之旅吧！`,
    timestamp: new Date().toLocaleTimeString()
  })
  
  scrollToBottom()
})

// 监听外部命令
watch(() => props.externalCommand, (newCommand) => {
  if (newCommand && newCommand.trim()) {
    console.log('接收到外部命令:', newCommand)
    executeExternalCommand(newCommand.trim())
  }
})

// 执行外部命令的方法
const executeExternalCommand = async (command) => {
  console.log('执行外部命令:', command)
  
  // 设置当前输入为外部命令
  currentInput.value = command
  
  // 添加到历史记录
  if (command !== 'clear') {
    commandHistory.value.push(command)
    historyIndex.value = -1
  }

  // 创建历史条目
  const entry = {
    command: command,
    output: '',
    timestamp: new Date().toLocaleTimeString()
  }

  // 特殊命令处理 - clear命令
  if (command === 'clear') {
    terminalHistory.value = []
    currentInput.value = ''
    return
  }

  try {
    // 使用EnhancedCommandProcessor执行命令
    console.log('使用EnhancedCommandProcessor执行外部命令:', command)
    const result = await commandProcessor.processCommand(command, {}, filesystemStore)
    console.log('外部命令执行结果:', result)
    
    entry.output = result.output || result.error || ''
    
    // 如果是cd命令且成功，不显示输出
    if (command.startsWith('cd ') && result.success && !result.output) {
      entry.output = ''
    }
    
  } catch (error) {
    console.error('外部命令执行错误:', error)
    entry.output = `Error: ${error.message}`
  }

  // 只有在有输出时才添加到历史记录
  if (entry.output || !command.startsWith('cd ')) {
    terminalHistory.value.push(entry)
  }
  
  currentInput.value = ''
  clearSuggestions()

  // 发送命令执行事件
  emit('command-executed', { command, output: entry.output })

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}
</script>

<style scoped>
.mac-terminal {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
}

/* Mac风格标题栏 */
.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: linear-gradient(180deg, #3c3c3c 0%, #2d2d2d 100%);
  border-bottom: 1px solid #1a1a1a;
  user-select: none;
}

.traffic-lights {
  display: flex;
  gap: 8px;
}

.light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.light:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

.light.red {
  background: radial-gradient(circle, #ff6b6b, #ff5f57);
}

.light.yellow {
  background: radial-gradient(circle, #ffd93d, #ffbd2e);
}

.light.green {
  background: radial-gradient(circle, #6bcf7f, #28ca42);
}

.terminal-title {
  color: #00ff88;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.terminal-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #888;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #e0e0e0;
  transform: translateY(-1px);
}

/* 终端内容 */
.terminal-content {
  flex: 1;
  padding: 16px;
  background: #000;
  color: #e0e0e0;
  font-size: 13px;
  line-height: 1.5;
  overflow-y: auto;
  position: relative;
}

.terminal-entry {
  margin-bottom: 12px;
}

.command-line {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.prompt {
  color: #00ff88;
  margin-right: 4px;
  user-select: none;
  font-weight: 600;
}

.command-text {
  color: #e0e0e0;
  font-weight: 500;
}

.command-output {
  margin-left: 0;
  margin-bottom: 8px;
  padding-left: 4px;
  border-left: 2px solid rgba(0, 255, 136, 0.2);
}

.command-output pre {
  color: #b0b0b0;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: inherit;
  line-height: 1.4;
}

.current-command-line {
  display: flex;
  align-items: center;
  position: sticky;
  bottom: 0;
  background: #000;
  padding: 4px 0;
}

.terminal-input {
  background: transparent;
  border: none;
  outline: none;
  color: #e0e0e0;
  font-family: inherit;
  font-size: inherit;
  flex: 1;
  margin-right: 4px;
  font-weight: 500;
}

.terminal-input::placeholder {
  color: #555;
  font-style: italic;
}

.cursor {
  color: #00ff88;
  font-weight: bold;
}

.cursor.blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 自动补全建议 */
.suggestions {
  position: absolute;
  bottom: 60px;
  left: 16px;
  right: 16px;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: rgba(0, 255, 136, 0.1);
  border-left: 3px solid #00ff88;
}

.suggestion-command {
  color: #00ff88;
  font-weight: 600;
}

.suggestion-desc {
  color: #888;
  font-size: 11px;
  font-style: italic;
}

/* 输出样式增强 */
:deep(.output-header) {
  color: #00d4ff;
  font-weight: 600;
}

:deep(.output-error) {
  color: #ff6b6b;
  font-weight: 600;
}

:deep(.output-success) {
  color: #00ff88;
  font-weight: 600;
}

:deep(.output-warning) {
  color: #ffd93d;
  font-weight: 600;
}

:deep(.output-ip) {
  color: #00d4ff;
  font-weight: 500;
}

:deep(.output-url) {
  color: #ff9500;
  text-decoration: underline;
}

/* 滚动条样式 */
.terminal-content::-webkit-scrollbar {
  width: 8px;
}

.terminal-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.terminal-content::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 136, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.terminal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 136, 0.5);
}

.suggestions::-webkit-scrollbar {
  width: 6px;
}

.suggestions::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.suggestions::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 136, 0.3);
  border-radius: 3px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .terminal-header {
    padding: 6px 12px;
  }
  
  .terminal-title {
    font-size: 12px;
  }
  
  .terminal-content {
    padding: 12px;
    font-size: 12px;
  }
  
  .suggestions {
    bottom: 50px;
    left: 12px;
    right: 12px;
  }
  
  .suggestion-item {
    padding: 6px 10px;
  }
  
  .suggestion-desc {
    display: none;
  }
}

/* 动画效果 */
.terminal-entry {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestions {
  animation: fadeInUp 0.2s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 主题切换 */
.mac-terminal.light {
  background: #f5f5f5;
}

.mac-terminal.light .terminal-content {
  background: #ffffff;
  color: #333;
}

.mac-terminal.light .prompt {
  color: #007acc;
}

.mac-terminal.light .terminal-input {
  color: #333;
}

.mac-terminal.light .cursor {
  color: #007acc;
}
</style>
