<template>
  <div class="network-visualizer bg-gray-900 rounded-lg p-6 min-h-[700px]">
    <!-- 标题区域 -->
    <div class="mb-6">
      <h3 class="text-2xl font-bold text-white mb-2 flex items-center">
        <span class="mr-3">🌐</span>
        网络命令可视化
        <span class="ml-3 text-sm bg-green-600 px-2 py-1 rounded">实时模拟</span>
      </h3>
      <p class="text-gray-400">可视化展示网络命令的执行过程和结果</p>
    </div>

    <!-- ping 命令可视化 -->
    <div v-if="commandType === 'ping'" class="space-y-6">
      <!-- 统计信息面板 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="text-2xl font-bold text-green-400">{{ pingStats.sent }}</div>
          <div class="text-sm text-gray-400">已发送</div>
        </div>
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="text-2xl font-bold text-blue-400">{{ pingStats.received }}</div>
          <div class="text-sm text-gray-400">已接收</div>
        </div>
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="text-2xl font-bold text-red-400">{{ pingStats.lost }}%</div>
          <div class="text-sm text-gray-400">丢包率</div>
        </div>
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="text-2xl font-bold text-yellow-400">{{ pingStats.avgTime }}ms</div>
          <div class="text-sm text-gray-400">平均延迟</div>
        </div>
      </div>

      <!-- 网络路径可视化 -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h4 class="text-lg font-semibold text-cyan-400 mb-4">📡 网络路径</h4>
        <div class="relative">
          <!-- 主机节点 -->
          <div class="flex justify-between items-center mb-8">
            <div class="network-node local-host">
              <div class="node-icon">💻</div>
              <div class="node-label">本机</div>
              <div class="node-ip">{{ localHost }}</div>
            </div>
            
            <!-- 连接线和数据包动画 -->
            <div class="flex-1 relative mx-8">
              <div class="connection-line"></div>
              <div 
                v-if="pingAnimating" 
                class="ping-packet"
                :style="packetStyle"
              >
                🏓
              </div>
              <div class="connection-label">
                {{ pingStats.avgTime }}ms
              </div>
            </div>
            
            <div class="network-node remote-host">
              <div class="node-icon">🌐</div>
              <div class="node-label">目标主机</div>
              <div class="node-ip">{{ targetHost }}</div>
            </div>
          </div>

          <!-- 控制按钮 -->
          <div class="text-center">
            <button 
              @click="startPingAnimation"
              :disabled="pingAnimating"
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {{ pingAnimating ? '🔄 Ping中...' : '🚀 开始Ping' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Ping 日志 -->
      <div class="bg-gray-800 rounded-lg p-4">
        <h4 class="text-lg font-semibold text-yellow-400 mb-3">📝 Ping 日志</h4>
        <div class="log-container">
          <div 
            v-for="(log, index) in pingLogs" 
            :key="index"
            class="log-entry"
            :class="log.type"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- netstat 命令可视化 -->
    <div v-if="commandType === 'netstat'" class="space-y-6">
      <!-- 连接状态统计 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="text-2xl font-bold text-green-400">{{ netstatStats.established }}</div>
          <div class="text-sm text-gray-400">ESTABLISHED</div>
        </div>
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="text-2xl font-bold text-blue-400">{{ netstatStats.listen }}</div>
          <div class="text-sm text-gray-400">LISTEN</div>
        </div>
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="text-2xl font-bold text-yellow-400">{{ netstatStats.timeWait }}</div>
          <div class="text-sm text-gray-400">TIME_WAIT</div>
        </div>
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="text-2xl font-bold text-purple-400">{{ netstatStats.total }}</div>
          <div class="text-sm text-gray-400">总连接数</div>
        </div>
      </div>

      <!-- 协议分布图表 -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h4 class="text-lg font-semibold text-cyan-400 mb-4">📊 协议分布</h4>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="protocol-bar">
            <div class="protocol-label">TCP</div>
            <div class="bar-container">
              <div class="bar tcp" :style="{ width: `${protocolDistribution.tcp}%` }"></div>
            </div>
            <div class="protocol-count">{{ netstatData.filter(c => c.protocol === 'tcp').length }}</div>
          </div>
          <div class="protocol-bar">
            <div class="protocol-label">UDP</div>
            <div class="bar-container">
              <div class="bar udp" :style="{ width: `${protocolDistribution.udp}%` }"></div>
            </div>
            <div class="protocol-count">{{ netstatData.filter(c => c.protocol === 'udp').length }}</div>
          </div>
          <div class="protocol-bar">
            <div class="protocol-label">TCP6</div>
            <div class="bar-container">
              <div class="bar tcp6" :style="{ width: `${protocolDistribution.tcp6}%` }"></div>
            </div>
            <div class="protocol-count">{{ netstatData.filter(c => c.protocol === 'tcp6').length }}</div>
          </div>
          <div class="protocol-bar">
            <div class="protocol-label">UDP6</div>
            <div class="bar-container">
              <div class="bar udp6" :style="{ width: `${protocolDistribution.udp6}%` }"></div>
            </div>
            <div class="protocol-count">{{ netstatData.filter(c => c.protocol === 'udp6').length }}</div>
          </div>
        </div>
      </div>

      <!-- 活跃连接列表 -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h4 class="text-lg font-semibold text-cyan-400 mb-4">🔗 活跃连接</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-600">
                <th class="text-left p-2 text-gray-300">协议</th>
                <th class="text-left p-2 text-gray-300">本地地址</th>
                <th class="text-left p-2 text-gray-300">远程地址</th>
                <th class="text-left p-2 text-gray-300">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(conn, index) in netstatData.slice(0, 10)" 
                :key="index"
                class="border-b border-gray-700 hover:bg-gray-700/50"
              >
                <td class="p-2">
                  <span class="protocol-badge" :class="conn.protocol">{{ conn.protocol.toUpperCase() }}</span>
                </td>
                <td class="p-2 text-cyan-400 font-mono">{{ conn.localAddress }}</td>
                <td class="p-2 text-yellow-400 font-mono">{{ conn.remoteAddress }}</td>
                <td class="p-2">
                  <span class="state-badge" :class="conn.state.toLowerCase()">{{ conn.state }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- traceroute 命令可视化 -->
    <div v-if="commandType === 'traceroute'" class="space-y-6">
      <!-- 路由追踪可视化 -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h4 class="text-lg font-semibold text-cyan-400 mb-4">🛤️ 路由追踪</h4>
        <div class="space-y-4">
          <div 
            v-for="(hop, index) in tracerouteHops" 
            :key="index"
            class="hop-item"
            :class="{ 'hop-active': hop.active, 'hop-completed': hop.completed }"
          >
            <div class="hop-number">{{ index + 1 }}</div>
            <div class="hop-content">
              <div class="hop-ip">{{ hop.ip }}</div>
              <div class="hop-hostname">{{ hop.hostname }}</div>
              <div class="hop-times">
                <span v-for="(time, i) in hop.times" :key="i" class="hop-time">
                  {{ time }}ms
                </span>
              </div>
            </div>
            <div class="hop-status">
              <span v-if="hop.completed" class="text-green-400">✅</span>
              <span v-else-if="hop.active" class="text-yellow-400 animate-pulse">🔄</span>
              <span v-else class="text-gray-500">⏳</span>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-6">
          <button 
            @click="startTraceroute"
            :disabled="tracerouteRunning"
            class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {{ tracerouteRunning ? '🔄 追踪中...' : '🚀 开始追踪' }}
          </button>
        </div>
      </div>
    </div>

    <!-- SSH代理可视化 -->
    <div v-if="commandType === 'ssh-proxy'" class="space-y-6">
      <SSHProxyVisualizer :command="props.command" />
    </div>

    <!-- Netcat 可视化 -->
    <div v-if="commandType === 'nc'" class="space-y-6">
      <NetcatVisualizer :command="props.command" />
    </div>

    <!-- OpenSSL 可视化 -->
    <div v-if="commandType === 'openssl'" class="space-y-6">
      <OpenSSLVisualizer :command="props.command" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import SSHProxyVisualizer from './SSHProxyVisualizer.vue'
import NetcatVisualizer from './NetcatVisualizer.vue'
import OpenSSLVisualizer from './OpenSSLVisualizer.vue'

// Props
const props = defineProps({
  command: {
    type: String,
    default: 'ping'
  },
  target: {
    type: String,
    default: 'google.com'
  }
})

// 检测命令类型
const commandType = computed(() => {
  if (props.command.includes('ping')) return 'ping'
  if (props.command.includes('netstat')) return 'netstat'
  if (props.command.includes('traceroute')) return 'traceroute'
  if (props.command.includes('ssh') && (props.command.includes('-L') || props.command.includes('-D') || props.command.includes('-R'))) return 'ssh-proxy'
  if (props.command.includes('nc ') || props.command.startsWith('nc ')) return 'nc'
  if (props.command.includes('openssl')) return 'openssl'
  return 'ping'
})

// Ping 相关数据
const pingStats = reactive({
  sent: 0,
  received: 0,
  lost: 0,
  avgTime: 0
})

const pingAnimating = ref(false)
const localHost = ref('192.168.1.100')
const targetHost = ref(props.target)
const pingLogs = ref([])

const packetStyle = ref({
  left: '0%',
  top: '50%',
  transform: 'translateY(-50%)'
})

// Netstat 相关数据
const netstatStats = reactive({
  established: 23,
  listen: 8,
  timeWait: 5,
  total: 45
})

const netstatData = ref([
  { protocol: 'tcp', localAddress: '127.0.0.1:3000', remoteAddress: '0.0.0.0:*', state: 'LISTEN' },
  { protocol: 'tcp', localAddress: '192.168.1.100:52341', remoteAddress: '142.250.191.14:443', state: 'ESTABLISHED' },
  { protocol: 'tcp', localAddress: '192.168.1.100:52342', remoteAddress: '157.240.12.35:443', state: 'ESTABLISHED' },
  { protocol: 'tcp', localAddress: '127.0.0.1:8080', remoteAddress: '0.0.0.0:*', state: 'LISTEN' },
  { protocol: 'udp', localAddress: '0.0.0.0:53', remoteAddress: '0.0.0.0:*', state: 'LISTEN' },
  { protocol: 'tcp6', localAddress: '::1:3000', remoteAddress: '::*', state: 'LISTEN' },
  { protocol: 'udp6', localAddress: '::1:53', remoteAddress: '::*', state: 'LISTEN' },
  { protocol: 'tcp', localAddress: '192.168.1.100:52343', remoteAddress: '172.217.160.142:80', state: 'TIME_WAIT' },
])

const protocolDistribution = computed(() => {
  const total = netstatData.value.length
  return {
    tcp: Math.round((netstatData.value.filter(c => c.protocol === 'tcp').length / total) * 100),
    udp: Math.round((netstatData.value.filter(c => c.protocol === 'udp').length / total) * 100),
    tcp6: Math.round((netstatData.value.filter(c => c.protocol === 'tcp6').length / total) * 100),
    udp6: Math.round((netstatData.value.filter(c => c.protocol === 'udp6').length / total) * 100)
  }
})

// Traceroute 相关数据
const tracerouteHops = ref([
  { ip: '192.168.1.1', hostname: 'router.local', times: [], active: false, completed: false },
  { ip: '10.0.0.1', hostname: 'isp-gateway.net', times: [], active: false, completed: false },
  { ip: '203.208.60.1', hostname: 'telecom-backbone.net', times: [], active: false, completed: false },
  { ip: '142.250.191.14', hostname: 'google.com', times: [], active: false, completed: false }
])

const tracerouteRunning = ref(false)

// 方法
const startPingAnimation = async () => {
  if (pingAnimating.value) return
  
  pingAnimating.value = true
  
  for (let i = 0; i < 4; i++) {
    await animatePingPacket()
    pingStats.sent++
    
    // 模拟丢包
    const success = Math.random() > 0.1
    if (success) {
      pingStats.received++
      const responseTime = Math.floor(Math.random() * 50) + 10
      pingStats.avgTime = Math.round((pingStats.avgTime * (pingStats.received - 1) + responseTime) / pingStats.received)
      
      addPingLog(`64 bytes from ${targetHost.value}: icmp_seq=${i+1} time=${responseTime}ms`, 'success')
    } else {
      addPingLog(`Request timeout for icmp_seq ${i+1}`, 'error')
    }
    
    pingStats.lost = Math.round(((pingStats.sent - pingStats.received) / pingStats.sent) * 100)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  pingAnimating.value = false
  addPingLog(`--- ${targetHost.value} ping statistics ---`, 'info')
  addPingLog(`${pingStats.sent} packets transmitted, ${pingStats.received} received, ${pingStats.lost}% packet loss`, 'info')
}

const animatePingPacket = () => {
  return new Promise(resolve => {
    let position = 0
    const interval = setInterval(() => {
      position += 2
      packetStyle.value.left = `${position}%`
      
      if (position >= 100) {
        clearInterval(interval)
        // 返回动画
        const returnInterval = setInterval(() => {
          position -= 2
          packetStyle.value.left = `${position}%`
          
          if (position <= 0) {
            clearInterval(returnInterval)
            resolve()
          }
        }, 20)
      }
    }, 20)
  })
}

const addPingLog = (message, type = 'info') => {
  const now = new Date()
  const time = now.toLocaleTimeString()
  
  pingLogs.value.push({
    time,
    message,
    type
  })
  
  if (pingLogs.value.length > 20) {
    pingLogs.value.shift()
  }
}

const startTraceroute = async () => {
  if (tracerouteRunning.value) return
  
  tracerouteRunning.value = true
  
  // 重置状态
  tracerouteHops.value.forEach(hop => {
    hop.active = false
    hop.completed = false
    hop.times = []
  })
  
  for (let i = 0; i < tracerouteHops.value.length; i++) {
    const hop = tracerouteHops.value[i]
    hop.active = true
    
    // 模拟三次测试
    for (let j = 0; j < 3; j++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const time = Math.floor(Math.random() * 100) + 10
      hop.times.push(time)
    }
    
    hop.active = false
    hop.completed = true
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  tracerouteRunning.value = false
}

onMounted(() => {
  // 初始化日志
  addPingLog(`PING ${targetHost.value} (${targetHost.value}): 56 data bytes`, 'info')
})
</script>

<style scoped>
/* 网络节点样式 */
.network-node {
  @apply bg-gray-700 rounded-lg p-4 text-center min-w-[120px];
}

.local-host {
  @apply border-2 border-blue-400;
}

.remote-host {
  @apply border-2 border-green-400;
}

.node-icon {
  @apply text-3xl mb-2;
}

.node-label {
  @apply text-white font-semibold mb-1;
}

.node-ip {
  @apply text-xs text-gray-400;
}

/* 连接线和动画 */
.connection-line {
  @apply w-full h-1 bg-gray-600 rounded relative;
}

.connection-line::before {
  content: '';
  @apply absolute left-0 top-1/2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-gray-600 transform -translate-y-1/2;
}

.connection-line::after {
  content: '';
  @apply absolute right-0 top-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-gray-600 transform -translate-y-1/2;
}

.ping-packet {
  @apply absolute text-2xl transition-all duration-100 ease-linear;
  animation: bounce 0.5s infinite alternate;
}

@keyframes bounce {
  0% { transform: translateY(-50%) scale(1); }
  100% { transform: translateY(-50%) scale(1.2); }
}

.connection-label {
  @apply absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-cyan-400 bg-gray-800 px-2 py-1 rounded;
}

/* 协议分布条形图 */
.protocol-bar {
  @apply text-center;
}

.protocol-label {
  @apply text-sm text-gray-300 mb-2;
}

.bar-container {
  @apply w-full h-4 bg-gray-700 rounded-full overflow-hidden mb-2;
}

.bar {
  @apply h-full transition-all duration-1000 ease-out;
}

.bar.tcp {
  @apply bg-blue-500;
}

.bar.udp {
  @apply bg-green-500;
}

.bar.tcp6 {
  @apply bg-purple-500;
}

.bar.udp6 {
  @apply bg-yellow-500;
}

.protocol-count {
  @apply text-sm text-gray-400;
}

/* 协议和状态徽章 */
.protocol-badge {
  @apply px-2 py-1 rounded text-xs font-semibold;
}

.protocol-badge.tcp {
  @apply bg-blue-600 text-white;
}

.protocol-badge.udp {
  @apply bg-green-600 text-white;
}

.protocol-badge.tcp6 {
  @apply bg-purple-600 text-white;
}

.protocol-badge.udp6 {
  @apply bg-yellow-600 text-white;
}

.state-badge {
  @apply px-2 py-1 rounded text-xs font-semibold;
}

.state-badge.established {
  @apply bg-green-600 text-white;
}

.state-badge.listen {
  @apply bg-blue-600 text-white;
}

.state-badge.time_wait {
  @apply bg-yellow-600 text-white;
}

/* Traceroute 跳点样式 */
.hop-item {
  @apply bg-gray-700 rounded-lg p-4 flex items-center space-x-4 transition-all duration-300;
}

.hop-item.hop-active {
  @apply bg-yellow-900/50 border border-yellow-400;
}

.hop-item.hop-completed {
  @apply bg-green-900/30 border border-green-400;
}

.hop-number {
  @apply w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold text-white;
}

.hop-content {
  @apply flex-1;
}

.hop-ip {
  @apply text-cyan-400 font-mono text-sm;
}

.hop-hostname {
  @apply text-gray-300 text-xs;
}

.hop-times {
  @apply flex space-x-2 mt-1;
}

.hop-time {
  @apply text-xs text-yellow-400 bg-gray-800 px-2 py-1 rounded;
}

.hop-status {
  @apply text-lg;
}

/* 日志样式 */
.log-container {
  @apply bg-gray-900 rounded p-4 h-32 overflow-y-auto font-mono text-sm;
}

.log-entry {
  @apply mb-1 flex space-x-2;
}

.log-time {
  @apply text-gray-500 text-xs;
}

.log-message {
  @apply text-gray-300;
}

.log-entry.info .log-message {
  @apply text-blue-300;
}

.log-entry.success .log-message {
  @apply text-green-300;
}

.log-entry.error .log-message {
  @apply text-red-300;
}
</style> 