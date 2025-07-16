<template>
  <div class="ssh-proxy-visualizer bg-gray-900 text-white p-6 rounded-lg">
    <div class="flex items-center space-x-3 mb-6">
      <span class="text-3xl">🔒</span>
      <div>
        <h2 class="text-2xl font-bold text-cyan-400">SSH 代理隧道可视化</h2>
        <p class="text-gray-300">端口转发与网络代理动画演示</p>
      </div>
    </div>

    <!-- 代理模式选择 -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-yellow-400 mb-3">🔧 代理模式</h3>
      <div class="flex space-x-4">
        <button 
          @click="setProxyMode('local')"
          :class="['px-4 py-2 rounded-lg transition-all', 
                   proxyMode === 'local' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']"
        >
          🔵 本地转发 (-L)
        </button>
        <button 
          @click="setProxyMode('dynamic')"
          :class="['px-4 py-2 rounded-lg transition-all', 
                   proxyMode === 'dynamic' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']"
        >
          🟢 动态转发 (-D)
        </button>
        <button 
          @click="setProxyMode('remote')"
          :class="['px-4 py-2 rounded-lg transition-all', 
                   proxyMode === 'remote' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']"
        >
          🟣 远程转发 (-R)
        </button>
      </div>
    </div>

    <!-- 网络拓扑图 -->
    <div class="bg-gray-800 rounded-lg p-6 mb-6">
      <h4 class="text-lg font-semibold text-cyan-400 mb-4">🌐 网络拓扑</h4>
      
      <!-- 本地转发模式 -->
      <div v-if="proxyMode === 'local'" class="network-topology">
        <div class="flex justify-between items-center">
          <!-- 本地客户端 -->
          <div class="network-node local-client">
            <div class="node-icon">💻</div>
            <div class="node-label">本地客户端</div>
            <div class="node-ip">127.0.0.1</div>
            <div class="node-port">:{{ localPort }}</div>
          </div>
          
          <!-- SSH隧道 -->
          <div class="tunnel-section">
            <div class="tunnel-line encrypted-tunnel">
              <div class="tunnel-label">🔒 SSH加密隧道</div>
              <div v-if="tunnelActive" class="data-flow local-forward" :style="dataFlowStyle">
                📦
              </div>
            </div>
            <div class="tunnel-info">
              <div class="text-xs text-cyan-400">端口: {{ sshPort }}</div>
            </div>
          </div>
          
          <!-- SSH服务器 -->
          <div class="network-node ssh-server">
            <div class="node-icon">🖥️</div>
            <div class="node-label">SSH服务器</div>
            <div class="node-ip">{{ sshHost }}</div>
            <div class="node-port">:{{ sshPort }}</div>
          </div>
          
          <!-- 目标服务器 -->
          <div class="network-node target-server">
            <div class="node-icon">🎯</div>
            <div class="node-label">目标服务器</div>
            <div class="node-ip">{{ targetHost }}</div>
            <div class="node-port">:{{ targetPort }}</div>
          </div>
        </div>
        
        <!-- 连接说明 -->
        <div class="connection-description mt-4 p-3 bg-blue-900/30 rounded-lg">
          <p class="text-sm text-blue-200">
            <strong>本地转发:</strong> 本地端口 {{ localPort }} → SSH隧道 → 目标服务器 {{ targetHost }}:{{ targetPort }}
          </p>
        </div>
      </div>

      <!-- 动态转发模式 -->
      <div v-else-if="proxyMode === 'dynamic'" class="network-topology">
        <div class="flex justify-between items-center">
          <!-- 本地应用 -->
          <div class="network-node local-app">
            <div class="node-icon">🌐</div>
            <div class="node-label">本地应用</div>
            <div class="node-ip">SOCKS代理</div>
            <div class="node-port">:{{ socksPort }}</div>
          </div>
          
          <!-- SSH SOCKS代理 -->
          <div class="tunnel-section">
            <div class="tunnel-line encrypted-tunnel">
              <div class="tunnel-label">🔒 SOCKS隧道</div>
              <div v-if="tunnelActive" class="data-flow dynamic-forward" :style="dataFlowStyle">
                🧦
              </div>
            </div>
            <div class="tunnel-info">
              <div class="text-xs text-green-400">动态路由</div>
            </div>
          </div>
          
          <!-- SSH服务器 -->
          <div class="network-node ssh-server">
            <div class="node-icon">🖥️</div>
            <div class="node-label">SSH服务器</div>
            <div class="node-ip">{{ sshHost }}</div>
            <div class="node-port">:{{ sshPort }}</div>
          </div>
          
          <!-- 互联网 -->
          <div class="network-node internet">
            <div class="node-icon">🌍</div>
            <div class="node-label">互联网</div>
            <div class="node-ip">任意目标</div>
            <div class="node-port">动态端口</div>
          </div>
        </div>
        
        <!-- 连接说明 -->
        <div class="connection-description mt-4 p-3 bg-green-900/30 rounded-lg">
          <p class="text-sm text-green-200">
            <strong>动态转发:</strong> 本地SOCKS代理 {{ socksPort }} → SSH隧道 → 动态路由到任意目标
          </p>
        </div>
      </div>

      <!-- 远程转发模式 -->
      <div v-else-if="proxyMode === 'remote'" class="network-topology">
        <div class="flex justify-between items-center">
          <!-- 远程客户端 -->
          <div class="network-node remote-client">
            <div class="node-icon">🌐</div>
            <div class="node-label">远程客户端</div>
            <div class="node-ip">远程网络</div>
            <div class="node-port">:{{ remotePort }}</div>
          </div>
          
          <!-- SSH服务器 -->
          <div class="network-node ssh-server">
            <div class="node-icon">🖥️</div>
            <div class="node-label">SSH服务器</div>
            <div class="node-ip">{{ sshHost }}</div>
            <div class="node-port">:{{ sshPort }}</div>
          </div>
          
          <!-- SSH隧道 -->
          <div class="tunnel-section">
            <div class="tunnel-line encrypted-tunnel">
              <div class="tunnel-label">🔒 SSH反向隧道</div>
              <div v-if="tunnelActive" class="data-flow remote-forward" :style="dataFlowStyle">
                📦
              </div>
            </div>
            <div class="tunnel-info">
              <div class="text-xs text-purple-400">反向连接</div>
            </div>
          </div>
          
          <!-- 本地服务器 -->
          <div class="network-node local-server">
            <div class="node-icon">💻</div>
            <div class="node-label">本地服务器</div>
            <div class="node-ip">127.0.0.1</div>
            <div class="node-port">:{{ localServicePort }}</div>
          </div>
        </div>
        
        <!-- 连接说明 -->
        <div class="connection-description mt-4 p-3 bg-purple-900/30 rounded-lg">
          <p class="text-sm text-purple-200">
            <strong>远程转发:</strong> 远程端口 {{ remotePort }} → SSH隧道 → 本地服务器 127.0.0.1:{{ localServicePort }}
          </p>
        </div>
      </div>
    </div>

    <!-- 代理配置面板 -->
    <div class="bg-gray-800 rounded-lg p-6 mb-6">
      <h4 class="text-lg font-semibold text-cyan-400 mb-4">⚙️ 代理配置</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-if="proxyMode === 'local'">
          <label class="block text-sm font-medium text-gray-300 mb-2">本地端口</label>
          <input 
            v-model="localPort" 
            type="number" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            placeholder="8080"
          >
        </div>
        
        <div v-if="proxyMode === 'dynamic'">
          <label class="block text-sm font-medium text-gray-300 mb-2">SOCKS端口</label>
          <input 
            v-model="socksPort" 
            type="number" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            placeholder="1080"
          >
        </div>
        
        <div v-if="proxyMode === 'remote'">
          <label class="block text-sm font-medium text-gray-300 mb-2">远程端口</label>
          <input 
            v-model="remotePort" 
            type="number" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            placeholder="8080"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">SSH服务器</label>
          <input 
            v-model="sshHost" 
            type="text" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            placeholder="192.168.1.100"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">SSH端口</label>
          <input 
            v-model="sshPort" 
            type="number" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            placeholder="22"
          >
        </div>
        
        <div v-if="proxyMode === 'local'">
          <label class="block text-sm font-medium text-gray-300 mb-2">目标主机</label>
          <input 
            v-model="targetHost" 
            type="text" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            placeholder="192.168.1.200"
          >
        </div>
        
        <div v-if="proxyMode === 'local'">
          <label class="block text-sm font-medium text-gray-300 mb-2">目标端口</label>
          <input 
            v-model="targetPort" 
            type="number" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            placeholder="80"
          >
        </div>
        
        <div v-if="proxyMode === 'remote'">
          <label class="block text-sm font-medium text-gray-300 mb-2">本地服务端口</label>
          <input 
            v-model="localServicePort" 
            type="number" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            placeholder="3000"
          >
        </div>
      </div>
    </div>

    <!-- 数据流监控 -->
    <div class="bg-gray-800 rounded-lg p-6 mb-6">
      <h4 class="text-lg font-semibold text-cyan-400 mb-4">📊 数据流监控</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="stats-card">
          <div class="stats-icon">📈</div>
          <div class="stats-value">{{ dataStats.packetsForwarded }}</div>
          <div class="stats-label">转发包数</div>
        </div>
        <div class="stats-card">
          <div class="stats-icon">⚡</div>
          <div class="stats-value">{{ dataStats.throughput }}KB/s</div>
          <div class="stats-label">吞吐量</div>
        </div>
        <div class="stats-card">
          <div class="stats-icon">🔒</div>
          <div class="stats-value">{{ dataStats.encryptedBytes }}MB</div>
          <div class="stats-label">加密数据</div>
        </div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="flex justify-center space-x-4 mb-6">
      <button 
        @click="startTunnel"
        :disabled="tunnelActive"
        class="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
      >
        <span>{{ tunnelActive ? '🔄' : '🚀' }}</span>
        <span>{{ tunnelActive ? '隧道运行中...' : '建立隧道' }}</span>
      </button>
      
      <button 
        @click="stopTunnel"
        :disabled="!tunnelActive"
        class="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
      >
        <span>⏹️</span>
        <span>停止隧道</span>
      </button>
      
      <button 
        @click="sendTestData"
        :disabled="!tunnelActive"
        class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
      >
        <span>📦</span>
        <span>发送测试数据</span>
      </button>
    </div>

    <!-- 命令生成器 -->
    <div class="bg-gray-800 rounded-lg p-6">
      <h4 class="text-lg font-semibold text-cyan-400 mb-4">💻 SSH命令生成</h4>
      <div class="bg-black rounded-lg p-4 font-mono text-sm">
        <span class="text-green-400">$ </span>
        <span class="text-white">{{ generatedCommand }}</span>
      </div>
      <div class="mt-4 flex justify-end">
        <button 
          @click="copyCommand"
          class="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <span>📋</span>
          <span>复制命令</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  command: {
    type: String,
    default: ''
  }
})

// 代理模式
const proxyMode = ref('local')

// 配置参数
const localPort = ref(8080)
const socksPort = ref(1080)
const remotePort = ref(8080)
const sshHost = ref('192.168.1.100')
const sshPort = ref(22)
const targetHost = ref('192.168.1.200')
const targetPort = ref(80)
const localServicePort = ref(3000)

// 隧道状态
const tunnelActive = ref(false)
const dataFlowStyle = ref({
  left: '0%',
  animation: 'none'
})

// 数据统计
const dataStats = reactive({
  packetsForwarded: 0,
  throughput: 0,
  encryptedBytes: 0
})

// 生成的SSH命令
const generatedCommand = computed(() => {
  let cmd = 'ssh'
  
  if (proxyMode.value === 'local') {
    cmd += ` -L ${localPort.value}:${targetHost.value}:${targetPort.value}`
  } else if (proxyMode.value === 'dynamic') {
    cmd += ` -D ${socksPort.value}`
  } else if (proxyMode.value === 'remote') {
    cmd += ` -R ${remotePort.value}:localhost:${localServicePort.value}`
  }
  
  cmd += ` -p ${sshPort.value} user@${sshHost.value}`
  
  return cmd
})

// 设置代理模式
const setProxyMode = (mode) => {
  proxyMode.value = mode
  stopTunnel()
}

// 启动隧道
const startTunnel = async () => {
  if (tunnelActive.value) return
  
  tunnelActive.value = true
  
  // 启动数据流动画
  startDataFlowAnimation()
  
  // 启动统计更新
  startStatsUpdate()
}

// 停止隧道
const stopTunnel = () => {
  tunnelActive.value = false
  dataFlowStyle.value = {
    left: '0%',
    animation: 'none'
  }
}

// 发送测试数据
const sendTestData = async () => {
  if (!tunnelActive.value) return
  
  // 模拟数据包发送
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 200))
    dataStats.packetsForwarded++
    dataStats.throughput = Math.floor(Math.random() * 100) + 50
    dataStats.encryptedBytes += Math.random() * 0.1
  }
}

// 数据流动画
const startDataFlowAnimation = () => {
  if (!tunnelActive.value) return
  
  const animate = () => {
    if (!tunnelActive.value) return
    
    dataFlowStyle.value = {
      left: '0%',
      animation: 'dataFlow 2s linear infinite'
    }
    
    setTimeout(() => {
      if (tunnelActive.value) {
        animate()
      }
    }, 2000)
  }
  
  animate()
}

// 统计更新
const startStatsUpdate = () => {
  if (!tunnelActive.value) return
  
  const updateStats = () => {
    if (!tunnelActive.value) return
    
    dataStats.packetsForwarded += Math.floor(Math.random() * 3) + 1
    dataStats.throughput = Math.floor(Math.random() * 200) + 100
    dataStats.encryptedBytes += Math.random() * 0.05
    
    setTimeout(() => {
      if (tunnelActive.value) {
        updateStats()
      }
    }, 1000)
  }
  
  updateStats()
}

// 复制命令
const copyCommand = async () => {
  try {
    await navigator.clipboard.writeText(generatedCommand.value)
    // 可以添加一个提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 监听命令变化
const parseCommand = (cmd) => {
  if (!cmd) return
  
  if (cmd.includes('-L')) {
    proxyMode.value = 'local'
    const match = cmd.match(/-L\s+(\d+):([^:]+):(\d+)/)
    if (match) {
      localPort.value = parseInt(match[1])
      targetHost.value = match[2]
      targetPort.value = parseInt(match[3])
    }
  } else if (cmd.includes('-D')) {
    proxyMode.value = 'dynamic'
    const match = cmd.match(/-D\s+(\d+)/)
    if (match) {
      socksPort.value = parseInt(match[1])
    }
  } else if (cmd.includes('-R')) {
    proxyMode.value = 'remote'
    const match = cmd.match(/-R\s+(\d+):([^:]+):(\d+)/)
    if (match) {
      remotePort.value = parseInt(match[1])
      localServicePort.value = parseInt(match[3])
    }
  }
}

onMounted(() => {
  parseCommand(props.command)
})
</script>

<style scoped>
/* 网络拓扑样式 */
.network-topology {
  position: relative;
  min-height: 200px;
}

.network-node {
  @apply bg-gray-700 rounded-lg p-4 text-center transition-all duration-300 border-2 border-transparent;
  min-width: 120px;
  position: relative;
}

.local-client {
  @apply border-blue-400 bg-blue-900/30;
}

.ssh-server {
  @apply border-cyan-400 bg-cyan-900/30;
}

.target-server {
  @apply border-green-400 bg-green-900/30;
}

.local-app {
  @apply border-green-400 bg-green-900/30;
}

.internet {
  @apply border-yellow-400 bg-yellow-900/30;
}

.remote-client {
  @apply border-purple-400 bg-purple-900/30;
}

.local-server {
  @apply border-blue-400 bg-blue-900/30;
}

.node-icon {
  @apply text-3xl mb-2;
}

.node-label {
  @apply text-white font-semibold mb-1 text-sm;
}

.node-ip {
  @apply text-xs text-gray-300;
}

.node-port {
  @apply text-xs text-cyan-400 font-mono;
}

/* 隧道样式 */
.tunnel-section {
  @apply flex-1 mx-4 relative;
}

.tunnel-line {
  @apply relative h-8 rounded-full overflow-hidden;
  background: linear-gradient(90deg, #1f2937, #374151, #1f2937);
}

.encrypted-tunnel {
  @apply border-2 border-cyan-400;
  background: linear-gradient(90deg, #0c4a6e, #0369a1, #0c4a6e);
}

.tunnel-label {
  @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-cyan-200 font-bold;
}

.tunnel-info {
  @apply absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center;
}

/* 数据流动画 */
.data-flow {
  @apply absolute top-1/2 transform -translate-y-1/2 text-xl;
  animation: dataFlow 2s linear infinite;
}

@keyframes dataFlow {
  0% {
    left: 0%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

.local-forward {
  animation: localForwardFlow 2s linear infinite;
}

.dynamic-forward {
  animation: dynamicForwardFlow 2s linear infinite;
}

.remote-forward {
  animation: remoteForwardFlow 2s linear infinite;
}

@keyframes localForwardFlow {
  0% { left: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
}

@keyframes dynamicForwardFlow {
  0% { left: 0%; opacity: 0; transform: translateY(-50%) rotate(0deg); }
  10% { opacity: 1; }
  50% { transform: translateY(-50%) rotate(180deg); }
  90% { opacity: 1; }
  100% { left: 100%; opacity: 0; transform: translateY(-50%) rotate(360deg); }
}

@keyframes remoteForwardFlow {
  0% { left: 100%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { left: 0%; opacity: 0; }
}

/* 统计卡片 */
.stats-card {
  @apply bg-gray-700 rounded-lg p-4 text-center transition-all duration-300;
}

.stats-card:hover {
  @apply bg-gray-600 transform scale-105;
}

.stats-icon {
  @apply text-2xl mb-2;
}

.stats-value {
  @apply text-xl font-bold text-cyan-400 mb-1;
}

.stats-label {
  @apply text-sm text-gray-300;
}

/* 连接描述 */
.connection-description {
  @apply border-l-4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .network-topology .flex {
    @apply flex-col space-y-4;
  }
  
  .tunnel-section {
    @apply mx-0 my-4;
  }
  
  .tunnel-line {
    @apply h-16 w-full;
  }
  
  .data-flow {
    animation: dataFlowVertical 2s linear infinite;
  }
}

@keyframes dataFlowVertical {
  0% {
    top: 0%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}
</style> 