<template>
  <div class="enhanced-terminal">
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
        <button @click="showPerformanceStats" class="control-btn" title="性能统计">
          <span>📊</span>
        </button>
        <button @click="toggleTheme" class="control-btn" title="切换主题">
          <span>🎨</span>
        </button>
      </div>
    </div>

    <!-- 性能统计面板 -->
    <div v-if="showStats" class="stats-panel">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">命令执行:</span>
          <span class="stat-value">{{ performanceStats.commandExecutions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">缓存命中率:</span>
          <span class="stat-value">{{ (performanceStats.cacheHitRate * 100).toFixed(1) }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均执行时间:</span>
          <span class="stat-value">{{ performanceStats.averageExecutionTime.toFixed(2) }}ms</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">缓冲区大小:</span>
          <span class="stat-value">{{ performanceStats.bufferSize }}</span>
        </div>
      </div>
    </div>

    <!-- 终端内容区 -->
    <div class="terminal-content" ref="terminalContent" @click="focusInput">
      <!-- 虚拟滚动的历史记录 -->
      <VirtualScrollList
        :items="visibleHistory"
        :item-height="estimateItemHeight"
        class="terminal-history"
      >
        <template #default="{ item, index }">
          <div class="terminal-entry" :key="item.id">
            <!-- 命令行 -->
            <div class="command-line">
              <span class="prompt">{{ item.prompt }}</span>
              <span class="command-text">{{ item.command }}</span>
              <span v-if="item.executionTime" class="execution-time">
                ({{ item.executionTime }}ms)
              </span>
            </div>
            <!-- 输出 -->
            <div v-if="item.output" class="command-output">
              <pre v-html="formatOutput(item.output)"></pre>
            </div>
            <!-- 错误 -->
            <div v-if="item.error" class="command-error">
              <pre>{{ item.error }}</pre>
            </div>
          </div>
        </template>
      </VirtualScrollList>

      <!-- 当前命令行 -->
      <div class="current-command-line">
        <span class="prompt">{{ currentPrompt }}</span>
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
          <span class="suggestion-category">{{ suggestion.category }}</span>
        </div>
      </div>

      <!-- 命令执行指示器 -->
      <div v-if="isExecuting" class="execution-indicator">
        <div class="spinner"></div>
        <span>执行中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useEnhancedFilesystemStore } from '@/stores/enhancedFilesystem'
import { enhancedCommandProcessor } from '@/core/EnhancedCommandProcessor'
import { performanceManager } from '@/core/PerformanceManager'
import VirtualScrollList from './VirtualScrollList.vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'favork@linux:~'
  },
  theme: {
    type: String,
    default: 'dark'
  }
})

// Emits
const emit = defineEmits(['close', 'minimize', 'maximize', 'command-executed'])

// 响应式数据
const currentInput = ref('')
const terminalHistory = ref([])
const commandHistory = ref([])
const historyIndex = ref(-1)
const terminalInput = ref(null)
const terminalContent = ref(null)
const isTyping = ref(false)
const isExecuting = ref(false)
const suggestions = ref([])
const selectedSuggestion = ref(-1)
const currentTheme = ref(props.theme)
const showStats = ref(false)
const performanceStats = ref({})

// 获取filesystem store
const filesystemStore = useEnhancedFilesystemStore()

// 计算属性
const currentPrompt = computed(() => {
  const path = filesystemStore.currentPath === '/home/favork' ? '~' : 
    filesystemStore.currentPath.replace('/home/favork', '~')
  return `favork@linux:${path}$ `
})

const inputPlaceholder = computed(() => '输入命令... (Tab键自动补全, 支持管道和重定向)')

const visibleHistory = computed(() => {
  return performanceManager.getBufferContent(null, 100).map(entry => ({
    id: entry.id,
    ...entry.content
  }))
})

// 方法
const handleKeydown = async (e) => {
  switch (e.key) {
    case 'Enter':
      e.preventDefault()
      await executeCommand()
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
    case 'Escape':
      e.preventDefault()
      clearSuggestions()
      break
    case 'c':
      if (e.ctrlKey) {
        e.preventDefault()
        cancelExecution()
      }
      break
  }
}

const handleInput = () => {
  isTyping.value = true
  updateSuggestions()
  
  // 停止输入指示器
  setTimeout(() => {
    isTyping.value = false
  }, 500)
}

const executeCommand = async () => {
  const command = currentInput.value.trim()
  
  if (!command) return

  isExecuting.value = true
  const startTime = performance.now()

  try {
    // 添加到历史记录
    if (command !== 'clear') {
      commandHistory.value.push(command)
      historyIndex.value = -1
    }

    // 特殊命令处理
    if (command === 'clear') {
      clearTerminal()
      currentInput.value = ''
      isExecuting.value = false
      return
    }

    // 使用增强命令处理器执行命令
    const result = await enhancedCommandProcessor.processCommand(command, {
      currentPath: filesystemStore.currentPath,
      user: 'favork',
      hostname: 'linux'
    }, filesystemStore)

    const executionTime = performance.now() - startTime
    performanceManager.recordExecution(executionTime)

    // 创建历史条目
    const entry = {
      command: command,
      prompt: currentPrompt.value,
      output: result.output || '',
      error: result.error || null,
      timestamp: new Date().toLocaleTimeString(),
      executionTime: Math.round(executionTime),
      id: generateId()
    }

    // 添加到性能管理器的缓冲区
    performanceManager.addOutput(entry)

    // 发送命令执行事件
    emit('command-executed', { 
      command, 
      output: result.output, 
      error: result.error,
      executionTime 
    })

  } catch (error) {
    const executionTime = performance.now() - startTime
    
    const entry = {
      command: command,
      prompt: currentPrompt.value,
      output: '',
      error: error.message,
      timestamp: new Date().toLocaleTimeString(),
      executionTime: Math.round(executionTime),
      id: generateId()
    }

    performanceManager.addOutput(entry)
  } finally {
    currentInput.value = ''
    clearSuggestions()
    isExecuting.value = false
    
    // 滚动到底部
    nextTick(() => scrollToBottom())
  }
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

  const suggestions = enhancedCommandProcessor.getCommandSuggestions(input)
  
  if (suggestions.length === 1) {
    currentInput.value = suggestions[0].text + ' '
    clearSuggestions()
  } else if (suggestions.length > 1) {
    this.suggestions.value = suggestions.map(s => ({
      command: s.text,
      description: s.description,
      category: s.type
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

  const matches = enhancedCommandProcessor.getCommandSuggestions(input).slice(0, 5)
  suggestions.value = matches.map(s => ({
    command: s.text || s.command || s,
    description: s.description || 'No description available',
    category: s.type || s.category || 'misc'
  }))
  selectedSuggestion.value = matches.length > 0 ? 0 : -1
}

const showAllCommands = () => {
  const matches = enhancedCommandProcessor.getCommandSuggestions('').slice(0, 10)
  suggestions.value = matches.map(s => ({
    command: s.text || s.command || s,
    description: s.description || 'No description available',
    category: s.type || s.category || 'misc'
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
  performanceManager.clearBuffer()
  terminalHistory.value = []
}

const cancelExecution = () => {
  if (isExecuting.value) {
    isExecuting.value = false
    
    const entry = {
      command: currentInput.value,
      prompt: currentPrompt.value,
      output: '',
      error: '^C',
      timestamp: new Date().toLocaleTimeString(),
      executionTime: 0,
      id: generateId()
    }

    performanceManager.addOutput(entry)
    currentInput.value = ''
  }
}

const showPerformanceStats = () => {
  showStats.value = !showStats.value
  if (showStats.value) {
    updatePerformanceStats()
  }
}

const updatePerformanceStats = () => {
  performanceStats.value = performanceManager.getMetrics()
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
  // 增强的输出格式化
  return output
    .replace(/^(.*):$/gm, '<span class="output-header">$1:</span>')
    .replace(/\b(error|Error|ERROR)\b/g, '<span class="output-error">$1</span>')
    .replace(/\b(success|Success|SUCCESS|OK)\b/g, '<span class="output-success">$1</span>')
    .replace(/\b(warning|Warning|WARNING)\b/g, '<span class="output-warning">$1</span>')
    .replace(/\b(\d+\.\d+\.\d+\.\d+)\b/g, '<span class="output-ip">$1</span>')
    .replace(/\b(https?:\/\/[^\s]+)\b/g, '<span class="output-url">$1</span>')
    .replace(/\b([a-zA-Z0-9_-]+\.(txt|md|json|sh|py|js))\b/g, '<span class="output-file">$1</span>')
    .replace(/\b(drwx|rwx|r--)\b/g, '<span class="output-permission">$1</span>')
}

const estimateItemHeight = (item) => {
  // 估算每个条目的高度
  const baseHeight = 40
  const outputLines = item.output ? item.output.split('\n').length : 0
  const errorLines = item.error ? item.error.split('\n').length : 0
  return baseHeight + (outputLines + errorLines) * 20
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 生命周期
onMounted(() => {
  focusInput()
  
  // 添加欢迎信息
  const welcomeEntry = {
    command: '',
    prompt: '',
    output: `🎉 欢迎使用 Linux Dojo 增强终端！

这是一个功能完整的Linux终端模拟器，现在支持：

✨ 新增功能：
🔗 管道支持: ls | grep txt
📝 重定向支持: echo "hello" > file.txt
⚡ 性能优化: 命令缓存和内存管理
🧠 智能补全: 更准确的命令建议
📊 性能监控: 实时执行统计

🎯 基础功能：
📚 命令历史记录 (↑↓箭头键)
🎨 语法高亮输出
🔍 智能命令建议
💻 真实Linux命令体验

输入 'help' 查看所有可用命令，开始你的Linux学习之旅！`,
    error: null,
    timestamp: new Date().toLocaleTimeString(),
    executionTime: 0,
    id: generateId()
  }
  
  performanceManager.addOutput(welcomeEntry)
  scrollToBottom()

  // 定期更新性能统计
  setInterval(() => {
    if (showStats.value) {
      updatePerformanceStats()
    }
  }, 1000)
})

// 监听文件系统变化
watch(() => filesystemStore.currentPath, () => {
  // 路径变化时更新提示符
  nextTick(() => {
    if (terminalInput.value) {
      terminalInput.value.focus()
    }
  })
})
</script>

<style scoped>
.enhanced-terminal {
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

/* 性能统计面板 */
.stats-panel {
  background: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid #333;
  padding: 8px 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.stat-label {
  color: #888;
}

.stat-value {
  color: #00ff88;
  font-weight: 600;
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

.terminal-history {
  margin-bottom: 16px;
}

.terminal-entry {
  margin-bottom: 12px;
  animation: slideIn 0.3s ease-out;
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

.execution-time {
  color: #666;
  font-size: 11px;
  margin-left: 8px;
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

.command-error {
  margin-left: 0;
  margin-bottom: 8px;
  padding-left: 4px;
  border-left: 2px solid rgba(255, 107, 107, 0.5);
}

.command-error pre {
  color: #ff6b6b;
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
  animation: fadeInUp 0.2s ease-out;
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
  flex: 1;
  margin: 0 8px;
}

.suggestion-category {
  color: #00d4ff;
  font-size: 10px;
  background: rgba(0, 212, 255, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
}

/* 执行指示器 */
.execution-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffd93d;
  font-size: 12px;
  margin: 8px 0;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 217, 61, 0.3);
  border-top: 2px solid #ffd93d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

:deep(.output-file) {
  color: #6bcf7f;
  font-weight: 500;
}

:deep(.output-permission) {
  color: #ffd93d;
  font-weight: 500;
}

/* 动画效果 */
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
  
  .suggestion-desc {
    display: none;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
