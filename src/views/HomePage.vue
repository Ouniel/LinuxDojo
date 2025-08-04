<template>
    <div class="main-container">
        <!-- 动态背景 -->
        <AnimatedBackground />
        
        <!-- 主内容区 -->
        <div class="content-wrapper">
            <!-- 左侧命令导航栏 -->
            <div class="sidebar-panel">
                <div class="glass-panel">
                    <CommandNavigator 
                        @command-selected="handleCommandSelected"
                        :selected-command="selectedCommand"
                    />
                </div>
            </div>

            <!-- 中间参数配置区 -->
            <div 
                class="parameter-panel" 
                :class="{ 'panel-hidden': needsWideDisplay && isFullscreenMode }"
            >
                <div class="glass-panel">
                    <ParameterBuilder
                        :command="selectedCommandData"
                        :selected-parameters="selectedParameters"
                        :user-inputs="userInputs"
                        @parameter-toggled="handleParameterToggled"
                        @user-input-changed="handleUserInputChanged"
                        @parameters-cleared="handleParametersClear"
                        @command-executed="handleCommandExecuted"
                    />
                </div>
            </div>

            <!-- 右侧结果展示区 -->
            <div class="result-panel">
                <div class="glass-panel h-full">
                    <SplitResultDisplay
                        :command="executedCommand"
                        :output="commandOutput"
                    />
                </div>
            </div>
        </div>

        <!-- 炫酷的全屏切换按钮 -->
        <Transition name="fade-slide">
            <div v-if="needsWideDisplay" class="fullscreen-toggle">
                <button 
                    @click="toggleFullscreenMode"
                    class="toggle-btn"
                >
                    <div class="btn-glow"></div>
                    <div class="btn-content">
                        <span class="btn-icon">{{ isFullscreenMode ? '📋' : '🖥️' }}</span>
                        <span class="btn-text">{{ isFullscreenMode ? '显示参数' : '全屏模式' }}</span>
                    </div>
                </button>
            </div>
        </Transition>

        <!-- 状态指示器 -->
        <div class="status-indicators">
            <div class="status-item" :class="{ 'active': selectedCommand }">
                <div class="status-dot"></div>
                <span>{{ selectedCommand ? '命令已选择' : '选择命令' }}</span>
            </div>
            <div class="status-item" :class="{ 'active': generatedCommand }">
                <div class="status-dot"></div>
                <span>{{ generatedCommand ? '命令已构建' : '构建命令' }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useEnhancedFilesystemStore } from '@/stores/enhancedFilesystem'
import CommandNavigator from '@/components/CommandNavigator.vue'
import ParameterBuilder from '@/components/ParameterBuilder.vue'
import SplitResultDisplay from '@/components/SplitResultDisplay.vue'
import AnimatedBackground from '@/components/AnimatedBackground.vue'

// Store
const uiStore = useUIStore()
const filesystemStore = useEnhancedFilesystemStore()

// 响应式数据
const selectedCommand = ref(null)
const selectedParameters = ref([])
const userInputs = ref({})
const outputLoading = ref(false)
const isFullscreenMode = ref(false)
const executedCommand = ref('')

// 需要宽显示的命令列表 - 这些命令通常输出内容较多，需要更大的显示空间
const wideDisplayCommands = [
    // 网络工具 - 输出通常很长
    'iptables', 'netstat', 'traceroute', 'ss', 'nslookup', 'dig',
    // 系统监控 - 需要实时显示大量信息
    'ps', 'top', 'htop', 'df', 'du', 'free', 'lscpu', 'lsblk', 'vmstat', 'iostat',
    // 进程管理 - 输出信息较多
    'systemctl', 'service',
    // 网络安全 - 输出详细信息
    'tcpdump', 'wireshark', 'nmap', 'ufw', 'firewall-cmd',
    // 文件系统 - 仅包含输出很长的命令
    'tree', 'mount', 'lsof',
    // 压缩归档 - 详细输出
    'tar',
    // 数据传输 - 详细进度信息
    'rsync'
]

// 计算属性
const selectedCommandData = computed(() => {
    if (!selectedCommand.value) return null
    return uiStore.commands.find(cmd => cmd.id === selectedCommand.value)
})

const generatedCommand = computed(() => {
    return uiStore.generateCommand()
})

const commandOutput = computed(() => {
    return uiStore.commandOutput
})

// 检测当前命令是否需要宽显示
const needsWideDisplay = computed(() => {
    if (!selectedCommand.value) return false
    return wideDisplayCommands.includes(selectedCommand.value)
})

// 事件处理
const handleCommandSelected = (commandId) => {
    console.log('选择了命令:', commandId)
    selectedCommand.value = commandId
    
    // 找到对应的命令对象
    const command = uiStore.commands.find(cmd => cmd.id === commandId)
    if (command) {
        uiStore.selectCommand(command)
        selectedParameters.value = []
        userInputs.value = {}
        
        // 如果是需要宽显示的命令，自动进入全屏模式
        if (wideDisplayCommands.includes(commandId)) {
            isFullscreenMode.value = true
        } else {
            isFullscreenMode.value = false
        }
    }
}

// 切换全屏模式
const toggleFullscreenMode = () => {
    isFullscreenMode.value = !isFullscreenMode.value
}

const handleParameterToggled = (parameter) => {
    uiStore.toggleParameter(parameter)
}

const handleUserInputChanged = (inputKey, value) => {
    userInputs.value[inputKey] = value
    uiStore.updateUserInput(inputKey, value)
}

const handleParametersClear = () => {
    selectedParameters.value = []
    userInputs.value = {}
    uiStore.clearParameters()
}

const handleCommandExecuted = (command) => {
    console.log('执行命令:', command)
    outputLoading.value = true
    executedCommand.value = command
    
    // 解析命令
    const parts = command.split(' ')
    const commandName = parts[0]
    const args = parts.slice(1)
    
    // 模拟命令执行延迟
    setTimeout(() => {
        let output = ''
        
        // 根据命令类型生成输出
        if (commandName === 'ls') {
            // 获取目标路径
            const targetPath = args.find(arg => !arg.startsWith('-'))
            const flags = args.filter(arg => arg.startsWith('-'))
            output = filesystemStore.generateLsOutput(targetPath, flags)
        } else if (commandName === 'cat') {
            // 获取文件路径
            const filePath = args.find(arg => !arg.startsWith('-'))
            if (filePath) {
                output = filesystemStore.generateCatOutput(filePath)
            } else {
                output = 'cat: 请指定要显示的文件路径'
            }
        } else if (commandName === 'chmod') {
            // 处理chmod命令
            const flags = args.filter(arg => arg.startsWith('-'))
            const nonFlagArgs = args.filter(arg => !arg.startsWith('-'))
            
            if (nonFlagArgs.length < 2) {
                output = 'chmod: 缺少操作数\\n用法: chmod [选项] 权限 文件...'
            } else {
                const permission = nonFlagArgs[0]
                const files = nonFlagArgs.slice(1)
                const hasVerbose = flags.includes('-v')
                
                // 模拟chmod输出
                output = files.map(file => {
                    if (hasVerbose) {
                        return `mode of '${file}' changed from 0644 (rw-r--r--) to 0${permission} (${getPermissionString(permission)})`
                    } else {
                        return '' // chmod默认无输出
                    }
                }).filter(line => line).join('\\n')
                
                if (!output && !hasVerbose) {
                    output = '✅ 权限修改成功 (无输出，这是正常的)'
                }
            }
        } else if (commandName === 'pwd') {
            output = filesystemStore.currentPath
        } else if (commandName === 'grep') {
            // 使用store的方法生成grep输出
            output = uiStore.getCommandOutput()
        } else if (commandName === 'iptables') {
            // 使用store的方法生成iptables输出
            output = uiStore.getCommandOutput()
        } else {
            output = `${commandName}: 命令未找到`
        }
        
        uiStore.setCommandOutput(output)
        outputLoading.value = false
    }, 1000)
}

// 辅助函数：将数字权限转换为字符串表示
const getPermissionString = (permission) => {
    const permMap = {
        '755': 'rwxr-xr-x',
        '644': 'rw-r--r--',
        '600': 'rw-------',
        '777': 'rwxrwxrwx',
        '700': 'rwx------',
        '666': 'rw-rw-rw-'
    }
    return permMap[permission] || permission
}

// 监听store变化
watch(() => uiStore.selectedParameters, (newParams) => {
    selectedParameters.value = [...newParams]
}, { deep: true })

watch(() => uiStore.userInputs, (newInputs) => {
    userInputs.value = { ...newInputs }
}, { deep: true })
</script>

<style scoped>
/* 主容器 */
.main-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif;
}

/* 内容包装器 */
.content-wrapper {
  display: flex;
  height: 100vh;
  position: relative;
  z-index: 1;
}

/* 毛玻璃面板基础样式 */
.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  overflow: hidden;
}

.glass-panel:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 212, 255, 0.3);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 212, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* 左侧边栏 - 调整为更合适的宽度 */
.sidebar-panel {
  width: 320px;
  flex-shrink: 0;
  padding: 16px;
  color: white;
}

/* 中间参数区 - 调整为更合适的宽度 */
.parameter-panel {
  width: 450px;
  flex-shrink: 0;
  padding: 16px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
}

.parameter-panel.panel-hidden {
  width: 0;
  padding: 0;
  opacity: 0;
  transform: translateX(-100%);
}

/* 右侧结果区 - 弹性占用剩余空间 */
.result-panel {
  flex: 1;
  min-width: 0;
  padding: 16px;
  color: white;
}

/* 全屏切换按钮 */
.fullscreen-toggle {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 100;
}

.toggle-btn {
  position: relative;
  background: rgba(0, 212, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  padding: 12px 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 212, 255, 0.2);
}

.toggle-btn:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.5);
  box-shadow: 0 8px 30px rgba(0, 212, 255, 0.3);
  transform: translateY(-2px);
}

.toggle-btn:active {
  transform: translateY(0);
}

.btn-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(0, 212, 255, 0.3), rgba(0, 255, 136, 0.3));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.toggle-btn:hover .btn-glow {
  opacity: 1;
}

.btn-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.btn-icon {
  font-size: 18px;
}

.btn-text {
  font-size: 14px;
}

/* 状态指示器 */
.status-indicators {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 100;
  display: flex;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  transition: all 0.3s ease;
}

.status-item.active {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.3);
  color: rgba(0, 255, 136, 0.9);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.status-item.active .status-dot {
  background: rgba(0, 255, 136, 0.8);
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .sidebar-panel {
    width: 300px;
  }
  
  .parameter-panel {
    width: 420px;
  }
}

@media (max-width: 1200px) {
  .sidebar-panel {
    width: 280px;
  }
  
  .parameter-panel {
    width: 380px;
  }
}

@media (max-width: 1024px) {
  .sidebar-panel {
    width: 260px;
  }
  
  .parameter-panel {
    width: 340px;
  }
  
  .glass-panel {
    border-radius: 12px;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .sidebar-panel,
  .parameter-panel,
  .result-panel {
    width: 100%;
    padding: 8px;
  }
  
  .parameter-panel.panel-hidden {
    height: 0;
    padding: 0;
    transform: translateY(-100%);
  }
  
  .fullscreen-toggle {
    top: 16px;
    right: 16px;
  }
  
  .status-indicators {
    bottom: 16px;
    left: 16px;
    flex-direction: column;
  }
}

/* 性能优化 */
.glass-panel {
  will-change: transform, background, border-color;
}

.toggle-btn {
  will-change: transform, background, box-shadow;
}

/* 滚动条美化 */
:deep(::-webkit-scrollbar) {
  width: 6px;
}

:deep(::-webkit-scrollbar-track) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

:deep(::-webkit-scrollbar-thumb) {
  background: rgba(0, 212, 255, 0.3);
  border-radius: 3px;
  transition: background 0.3s ease;
}

:deep(::-webkit-scrollbar-thumb:hover) {
  background: rgba(0, 212, 255, 0.5);
}
</style>