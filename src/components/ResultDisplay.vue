<template>
  <div class="h-full flex flex-col bg-gray-800 border-l border-gray-700">
    <!-- 标题和场景选择 -->
    <div class="p-4 border-b border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-blue-400">
          🎬 实时执行演示
        </h2>
        <button 
          @click="toggleFullscreen"
          class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
        >
          {{ isFullscreen ? '🔙 退出' : '🖥️ 全屏' }}
        </button>
      </div>
      
      <!-- 场景选择器 -->
      <div class="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
        <div class="flex items-center space-x-2 mb-2">
          <span class="text-sm font-semibold text-gray-300">🎭 场景选择:</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="scene in scenarios"
            :key="scene.id"
            @click="selectScenario(scene.id)"
            :class="[
              'flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-sm',
              currentScenario === scene.id 
                ? 'bg-blue-600/20 border border-blue-600/30 text-blue-400' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            ]"
          >
            <span>{{ scene.icon }}</span>
            <span>{{ scene.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 p-4">
      <!-- iptables 可视化器 -->
      <div v-if="isIptablesCommand" class="h-full">
        <IptablesVisualizer />
      </div>
      
      <!-- 网络命令可视化器 -->
      <div v-else-if="isNetworkCommand" class="h-full">
        <NetworkVisualizer :command="command" :target="getNetworkTarget()" />
      </div>
      
      <!-- 系统监控可视化器 -->
      <div v-else-if="isSystemCommand" class="h-full">
        <SystemVisualizer :command="command" />
      </div>
      
      <!-- 文件系统可视化器 -->
      <div v-else-if="isFileSystemCommand" class="h-full">
        <FileSystemVisualizer :command="command" />
      </div>
      
      <!-- 文本处理可视化器 -->
      <div v-else-if="isTextProcessingCommand" class="h-full">
        <TextProcessingVisualizer :command="command" />
      </div>
      
      <!-- 普通虚拟终端 -->
      <div v-else class="h-full terminal-window">
        <!-- 终端头部 -->
        <div class="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-600 rounded-t-lg">
          <div class="flex items-center space-x-2">
            <div class="flex space-x-1">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span class="text-sm text-gray-300 font-mono ml-4">Terminal</span>
          </div>
          <div class="text-xs text-gray-400">
            {{ currentTime }}
          </div>
        </div>
        
        <!-- 终端内容 -->
        <div class="h-full bg-black p-4 font-mono text-sm overflow-y-auto rounded-b-lg" ref="terminalContent">
          <!-- 命令提示符 -->
          <div class="mb-2">
            <span class="text-green-400">user@linuxdojo</span>:
            <span class="text-cyan-400">~/{{ getCurrentPath() }}</span>
            <span class="text-white">$ </span>
          </div>
          
          <!-- 执行的命令 -->
          <div v-if="command" class="mb-4">
            <span class="text-green-400">$ </span>
            <span 
              class="text-white"
              :class="{ 'typing-animation': isTyping }"
            >
              {{ displayCommand }}
            </span>
            <span v-if="isTyping" class="animate-pulse text-green-400">▊</span>
          </div>
          
          <!-- 命令输出 -->
          <div v-if="output && !isTyping" class="mb-4">
            <pre class="text-gray-100 whitespace-pre-wrap leading-relaxed">{{ output }}</pre>
          </div>
          
          <!-- 执行状态 -->
          <div v-if="isExecuting" class="flex items-center space-x-2 text-yellow-400 mb-2">
            <div class="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
            <span>执行中...</span>
          </div>
          
          <!-- 新的命令提示符 -->
          <div v-if="output && !isTyping" class="flex items-center">
            <span class="text-green-400">user@linuxdojo</span>:
            <span class="text-cyan-400">~/{{ getCurrentPath() }}</span>
            <span class="text-white">$ </span>
            <span class="animate-pulse text-green-400">▊</span>
          </div>
          
          <!-- 帮助提示 -->
          <div v-if="!command" class="text-gray-400 text-center mt-8">
            <div class="text-4xl mb-4">💻</div>
            <p>选择命令和参数后将在此显示执行结果</p>
            <p class="text-xs mt-2">模拟真实Linux系统的执行结果</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 结果分析区域 -->
    <div v-if="output" class="p-4 border-t border-gray-700">
      <!-- 统计信息 -->
      <div class="mb-4">
        <h4 class="text-sm font-semibold text-gray-300 mb-3 flex items-center">
          📈 结果分析
        </h4>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
            <div class="text-xs text-gray-400">执行时间</div>
            <div class="text-lg font-bold text-green-400">{{ executionTime }}ms</div>
          </div>
          <div class="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
            <div class="text-xs text-gray-400">输出行数</div>
            <div class="text-lg font-bold text-cyan-400">{{ outputLines }}</div>
          </div>
        </div>
      </div>
      
      <!-- 参数解释 -->
      <div class="mb-4" v-if="parameterExplanations.length > 0">
        <h4 class="text-sm font-semibold text-gray-300 mb-3">
          💡 参数解释
        </h4>
        <div class="space-y-2">
          <div 
            v-for="explanation in parameterExplanations" 
            :key="explanation.param"
            class="bg-gray-700/50 border border-gray-600 rounded-lg p-3"
          >
            <div class="flex items-center space-x-2 mb-1">
              <span class="font-mono text-green-400">{{ explanation.param }}</span>
              <span class="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                {{ explanation.type }}
              </span>
            </div>
            <p class="text-sm text-gray-300">{{ explanation.description }}</p>
          </div>
        </div>
      </div>
      
      <!-- 推荐下一步 -->
      <div v-if="relatedCommands.length > 0">
        <h4 class="text-sm font-semibold text-gray-300 mb-3">
          🔗 推荐下一步
        </h4>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="related in relatedCommands"
            :key="related.name"
            @click="selectRelatedCommand(related)"
            class="flex items-center space-x-2 p-3 bg-gray-700/50 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-all duration-200"
          >
            <span class="text-lg">{{ related.icon }}</span>
            <div>
              <div class="font-mono text-sm text-green-400">{{ related.name }}</div>
              <div class="text-xs text-gray-400">{{ related.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import IptablesVisualizer from './IptablesVisualizer.vue'
import NetworkVisualizer from './NetworkVisualizer.vue'
import SystemVisualizer from './SystemVisualizer.vue'
import FileSystemVisualizer from './FileSystemVisualizer.vue'
import TextProcessingVisualizer from './TextProcessingVisualizer.vue'

// Props
const props = defineProps({
  command: {
    type: String,
    default: ''
  },
  output: {
    type: String,
    default: ''
  },
  scenario: {
    type: String,
    default: 'web_project'
  }
})

// Emits
const emit = defineEmits(['scenario-changed', 'command-selected'])

// 响应式数据
const isFullscreen = ref(false)
const isTyping = ref(false)
const isExecuting = ref(false)
const displayCommand = ref('')
const currentTime = ref('')
const terminalContent = ref(null)
const executionTime = ref(0)
const currentScenario = ref(props.scenario)

// 场景定义
const scenarios = ref([
  {
    id: 'web_project',
    name: 'Web项目',
    icon: '🌐',
    path: 'projects/webapp'
  },
  {
    id: 'system_admin',
    name: '系统管理',
    icon: '⚙️',
    path: 'admin'
  }
])

// 计算属性
const outputLines = computed(() => {
  return props.output ? props.output.split('\n').length : 0
})

const isIptablesCommand = computed(() => {
  const commandName = props.command?.split(' ')[0]
  return commandName === 'iptables'
})

// 检测是否为网络命令
const isNetworkCommand = computed(() => {
  if (!props.command) return false
  const commandName = props.command.split(' ')[0]
  const networkCommands = ['ping', 'netstat', 'traceroute', 'ss', 'nslookup', 'dig']
  return networkCommands.includes(commandName)
})

// 检测是否为系统监控命令
const isSystemCommand = computed(() => {
  if (!props.command) return false
  const commandName = props.command.split(' ')[0]
  const systemCommands = ['ps', 'top', 'htop', 'df', 'du', 'free', 'lscpu', 'lsblk', 'vmstat', 'iostat']
  return systemCommands.includes(commandName)
})

// 检测是否为文件系统命令
const isFileSystemCommand = computed(() => {
  if (!props.command) return false
  const commandName = props.command.split(' ')[0]
  const fileSystemCommands = ['find', 'tree', 'ls', 'locate', 'which', 'whereis', 'mount', 'umount', 'fdisk', 'parted', 'lsof']
  return fileSystemCommands.includes(commandName)
})

// 检测是否为文本处理命令
const isTextProcessingCommand = computed(() => {
  if (!props.command) return false
  const commandName = props.command.split(' ')[0]
  const textCommands = ['grep', 'awk', 'sed', 'cat', 'head', 'tail', 'less', 'more', 'sort', 'uniq', 'cut', 'tr', 'wc', 'diff']
  return textCommands.includes(commandName)
})

// 获取网络命令的目标
const getNetworkTarget = () => {
  if (!props.command) return 'google.com'
  
  const parts = props.command.split(' ')
  const commandName = parts[0]
  
  // 对于 ping 命令，目标通常是最后一个非选项参数
  if (commandName === 'ping') {
    const targetIndex = parts.findIndex((part, index) => 
      index > 0 && !part.startsWith('-') && parts[index - 1] !== '-c' && parts[index - 1] !== '-i'
    )
    return targetIndex > -1 ? parts[targetIndex] : 'google.com'
  }
  
  // 对于 traceroute 命令
  if (commandName === 'traceroute') {
    const targetIndex = parts.findIndex((part, index) => 
      index > 0 && !part.startsWith('-')
    )
    return targetIndex > -1 ? parts[targetIndex] : 'google.com'
  }
  
  return 'google.com'
}

const parameterExplanations = computed(() => {
  // 这里应该根据当前命令和参数生成解释
  // 暂时返回空数组
  return []
})

const relatedCommands = computed(() => {
  // 基于当前命令推荐相关命令
  const commandName = props.command?.split(' ')[0]
  const related = {
    ls: [
      { name: 'cd', icon: '📁', description: '切换目录' },
      { name: 'pwd', icon: '📍', description: '显示当前路径' }
    ],
    cd: [
      { name: 'ls', icon: '📋', description: '列出文件' },
      { name: 'pwd', icon: '📍', description: '显示当前路径' }
    ],
    grep: [
      { name: 'find', icon: '🔍', description: '查找文件' },
      { name: 'cat', icon: '📄', description: '查看文件内容' }
    ]
  }
  return related[commandName] || []
})

// 方法
const getCurrentPath = () => {
  const scene = scenarios.value.find(s => s.id === currentScenario.value)
  return scene ? scene.path : 'projects/webapp'
}

const selectScenario = (scenarioId) => {
  currentScenario.value = scenarioId
  emit('scenario-changed', scenarioId)
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const selectRelatedCommand = (command) => {
  emit('command-selected', command.name)
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString()
}

// 模拟打字效果
const typeCommand = (command) => {
  isTyping.value = true
  displayCommand.value = ''
  let index = 0
  
  const typeInterval = setInterval(() => {
    if (index < command.length) {
      displayCommand.value += command[index]
      index++
    } else {
      clearInterval(typeInterval)
      isTyping.value = false
    }
  }, 50)
}

// 监听命令变化
watch(() => props.command, (newCommand) => {
  if (newCommand) {
    // 模拟执行时间
    executionTime.value = Math.floor(Math.random() * 200) + 50
    typeCommand(newCommand)
  }
})

// 生命周期
onMounted(() => {
  updateTime()
  const timeInterval = setInterval(updateTime, 1000)
  
  onUnmounted(() => {
    clearInterval(timeInterval)
  })
})
</script>

<style scoped>
.terminal-window {
  border: 1px solid #374151;
  border-radius: 8px;
  overflow: hidden;
}

.typing-animation {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.6);
  border-radius: 2px;
}
</style> 