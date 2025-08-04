<template>
  <div class="split-result-container">
    <!-- 上栏：命令相关文件系统展示区 -->
    <div class="file-info-panel" :style="{ height: fileInfoHeight + 'px' }">
      <CommandFileSystemDisplay 
        :command="extractCommandName(lastCommand)"
        :parameters="extractCommandParameters(lastCommand)"
        @file-selected="handleFileSelected"
        @file-action="handleFileAction"
      />
    </div>

    <!-- 分割线 -->
    <div class="divider" @mousedown="startResize"></div>

    <!-- 下栏：Mac风格终端 -->
    <div class="terminal-panel" ref="terminalPanel">
      <MacTerminal 
        :title="terminalTitle"
        :initial-path="currentPath"
        :external-command="shouldExecuteCommand ? props.command : ''"
        @command-executed="handleCommandExecuted"
        @close="handleTerminalClose"
        @minimize="handleTerminalMinimize"
        @maximize="handleTerminalMaximize"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import CommandFileSystemDisplay from './CommandFileSystemDisplay.vue'
import MacTerminal from './MacTerminal.vue'

// Props
const props = defineProps({
  command: {
    type: String,
    default: ''
  },
  output: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['command-executed', 'file-selected'])

// 响应式数据
const currentPath = ref('~')
const terminalPanel = ref(null)
const fileInfoHeight = ref(300)
const lastCommand = ref('')
const lastCommandOutput = ref('')
const terminalTitle = ref('contact@mazesec:~')
const shouldExecuteCommand = ref(false)

// 计算属性
const minFileInfoHeight = 200
const maxFileInfoHeight = 500

// 方法
const extractCommandName = (command) => {
  if (!command) return ''
  return command.trim().split(' ')[0]
}

const extractCommandParameters = (command) => {
  if (!command) return []
  const parts = command.trim().split(' ')
  return parts.slice(1)
}

const handleCommandExecuted = (data) => {
  lastCommand.value = data.command
  lastCommandOutput.value = data.output
  
  // 发送事件给父组件
  emit('command-executed', data)
}

const handleFileSelected = (file) => {
  emit('file-selected', file)
}

const handleFileAction = (data) => {
  // 处理文件操作
  const { action, file } = data
  
  switch (action) {
    case 'view':
      // 在终端中执行cat命令查看文件
      lastCommand.value = `cat ${file.name}`
      lastCommandOutput.value = getFileContent(file.name)
      break
    case 'edit':
      // 模拟编辑操作
      lastCommand.value = `nano ${file.name}`
      lastCommandOutput.value = `Opening ${file.name} in editor...`
      break
    case 'download':
      // 模拟下载操作
      lastCommand.value = `wget ${file.name}`
      lastCommandOutput.value = `Downloading ${file.name}...`
      break
  }
}

const getFileContent = (filename) => {
  const fileContents = {
    'email.txt': 'contact@example.com\nadmin@website.com\nsupport@company.org\ninfo@business.net',
    'flag.txt': 'flag{bamuwe}',
    'social.txt': 'Facebook: @username\nTwitter: @handle\nInstagram: @profile\nLinkedIn: /in/user',
    'config.json': '{\n  "server": {\n    "port": 8080,\n    "host": "localhost"\n  },\n  "database": {\n    "type": "mysql",\n    "host": "db.example.com"\n  }\n}'
  }
  
  return fileContents[filename] || `cat: ${filename}: No such file or directory`
}

const handleTerminalClose = () => {
  // 处理终端关闭
  console.log('Terminal close requested')
}

const handleTerminalMinimize = () => {
  // 处理终端最小化
  console.log('Terminal minimize requested')
}

const handleTerminalMaximize = () => {
  // 处理终端最大化
  console.log('Terminal maximize requested')
}

const startResize = (e) => {
  e.preventDefault()
  const startY = e.clientY
  const startHeight = fileInfoHeight.value
  
  const onMouseMove = (e) => {
    const deltaY = e.clientY - startY
    const newHeight = Math.max(minFileInfoHeight, Math.min(maxFileInfoHeight, startHeight + deltaY))
    fileInfoHeight.value = newHeight
  }
  
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = 'default'
    document.body.style.userSelect = 'auto'
  }
  
  document.body.style.cursor = 'row-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// 监听外部命令变化
watch([() => props.command, () => props.output], ([newCommand, newOutput]) => {
  if (newCommand) {
    lastCommand.value = newCommand
    
    // 只有当有输出时才认为是执行命令，否则只是选择命令
    if (newOutput) {
      lastCommandOutput.value = newOutput
      shouldExecuteCommand.value = true
      
      // 执行完成后重置标志
      nextTick(() => {
        shouldExecuteCommand.value = false
      })
    } else {
      // 只是选择命令，不执行
      shouldExecuteCommand.value = false
    }
  }
})

// 生命周期
onMounted(() => {
  // 初始化
  if (props.command) {
    lastCommand.value = props.command
    lastCommandOutput.value = props.output || ''
  }
})
</script>

<style scoped>
.split-result-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 上栏：文件信息面板 */
.file-info-panel {
  flex: 0 0 40%;
  background: rgba(20, 25, 35, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  color: #00d4ff;
  font-weight: 600;
  font-size: 14px;
}

.refresh-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #00d4ff;
}

.file-info-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.current-path {
  margin-bottom: 16px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border-left: 3px solid #00d4ff;
}

.path-label {
  color: #888;
  font-size: 12px;
  margin-right: 8px;
}

.path-value {
  color: #00ff88;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.file-list {
  margin-bottom: 16px;
}

.file-item {
  display: grid;
  grid-template-columns: 24px 1fr auto auto;
  gap: 12px;
  padding: 6px 8px;
  border-radius: 4px;
  transition: background 0.2s;
  font-size: 13px;
  align-items: center;
}

.file-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.file-item.is-directory .file-name {
  color: #00d4ff;
  font-weight: 500;
}

.file-name {
  color: #e0e0e0;
  font-family: 'JetBrains Mono', monospace;
}

.file-size, .file-date {
  color: #888;
  font-size: 11px;
}

.system-info {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #888;
  font-size: 12px;
}

.disk-usage, .memory-usage {
  display: flex;
  align-items: center;
  gap: 8px;
}

.usage-bar {
  width: 80px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #00d4ff);
  transition: width 0.3s ease;
}

.usage-fill.memory {
  background: linear-gradient(90deg, #ff6b6b, #ffa500);
}

.usage-text {
  color: #e0e0e0;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
}

/* 分割线 */
.divider {
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent);
  cursor: row-resize;
  transition: background 0.2s;
}

.divider:hover {
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.6), transparent);
}

/* 下栏：终端面板 */
.terminal-panel {
  flex: 1;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.terminal-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border-radius: 8px;
  margin: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

/* Mac风格标题栏 */
.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: linear-gradient(180deg, #3c3c3c 0%, #2d2d2d 100%);
  border-bottom: 1px solid #1a1a1a;
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
}

.light.red {
  background: #ff5f57;
}

.light.yellow {
  background: #ffbd2e;
}

.light.green {
  background: #28ca42;
}

.terminal-title {
  color: #00ff88;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 500;
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
  transition: all 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #e0e0e0;
}

/* 终端内容 */
.terminal-content {
  flex: 1;
  padding: 16px;
  background: #000;
  color: #e0e0e0;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.4;
  overflow-y: auto;
}

.terminal-entry {
  margin-bottom: 8px;
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
}

.command-text {
  color: #e0e0e0;
}

.command-output {
  margin-left: 0;
  margin-bottom: 8px;
}

.command-output pre {
  color: #b0b0b0;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}

.current-command-line {
  display: flex;
  align-items: center;
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
}

.cursor {
  color: #00ff88;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 滚动条样式 */
.file-info-content::-webkit-scrollbar,
.terminal-content::-webkit-scrollbar {
  width: 6px;
}

.file-info-content::-webkit-scrollbar-track,
.terminal-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.file-info-content::-webkit-scrollbar-thumb,
.terminal-content::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.3);
  border-radius: 3px;
}

.file-info-content::-webkit-scrollbar-thumb:hover,
.terminal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-info-panel {
    flex: 0 0 35%;
  }
  
  .file-item {
    grid-template-columns: 20px 1fr auto;
    gap: 8px;
  }
  
  .file-date {
    display: none;
  }
  
  .terminal-header {
    padding: 6px 12px;
  }
  
  .terminal-content {
    padding: 12px;
    font-size: 12px;
  }
}
</style>