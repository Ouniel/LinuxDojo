<template>
  <div class="netcat-visualizer p-6 bg-gray-900 text-white rounded-lg">
    <div class="mb-6">
      <h3 class="text-xl font-bold mb-2 text-cyan-400">🔗 Netcat 网络工具可视化</h3>
      <p class="text-gray-300">演示 netcat 的各种网络操作模式</p>
    </div>

    <!-- 模式选择 -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="mode in modes"
          :key="mode.id"
          @click="currentMode = mode.id"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-all',
            currentMode === mode.id
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          {{ mode.name }}
        </button>
      </div>
    </div>

    <!-- 监听模式 -->
    <div v-if="currentMode === 'listen'" class="space-y-6">
      <div class="bg-gray-800 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-4 text-cyan-400">监听模式 (-l)</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 配置面板 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">监听端口</label>
              <input
                v-model="listenPort"
                type="number"
                placeholder="8080"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">协议类型</label>
              <select v-model="protocol" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
              </select>
            </div>
            
            <button
              @click="toggleListening"
              :class="[
                'w-full px-4 py-2 rounded-lg font-medium transition-all',
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              ]"
            >
              {{ isListening ? '停止监听' : '开始监听' }}
            </button>
          </div>

          <!-- 网络拓扑 -->
          <div class="bg-gray-700 p-4 rounded-lg">
            <h5 class="text-md font-semibold mb-3 text-cyan-400">网络状态</h5>
            <div class="relative h-40">
              <!-- 服务器节点 -->
              <div class="absolute top-4 left-1/2 transform -translate-x-1/2">
                <div :class="[
                  'w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 transition-all',
                  isListening ? 'bg-green-600 border-green-400 animate-pulse' : 'bg-gray-600 border-gray-400'
                ]">
                  🖥️
                </div>
                <div class="text-center mt-2 text-sm">
                  <div class="text-cyan-400">服务器</div>
                  <div class="text-gray-300">{{ listenPort }}/{{ protocol.toUpperCase() }}</div>
                </div>
              </div>

              <!-- 客户端连接 -->
              <div v-if="isListening && connections.length > 0" class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div class="flex space-x-4">
                  <div v-for="conn in connections" :key="conn.id" class="text-center">
                    <div class="w-12 h-12 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-lg">
                      💻
                    </div>
                    <div class="text-xs mt-1 text-gray-300">{{ conn.ip }}</div>
                  </div>
                </div>
              </div>

              <!-- 连接线 -->
              <div v-if="isListening && connections.length > 0" class="absolute top-20 left-1/2 bottom-16 w-px bg-cyan-400 transform -translate-x-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>

        <!-- 连接日志 -->
        <div class="mt-6 bg-gray-700 p-4 rounded-lg">
          <h5 class="text-md font-semibold mb-3 text-cyan-400">连接日志</h5>
          <div class="bg-black p-3 rounded font-mono text-sm max-h-32 overflow-y-auto">
            <div v-for="log in connectionLogs" :key="log.id" :class="[
              'mb-1',
              log.type === 'info' ? 'text-cyan-400' : 
              log.type === 'success' ? 'text-green-400' : 
              log.type === 'error' ? 'text-red-400' : 'text-gray-300'
            ]">
              [{{ log.timestamp }}] {{ log.message }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 连接模式 -->
    <div v-if="currentMode === 'connect'" class="space-y-6">
      <div class="bg-gray-800 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-4 text-cyan-400">连接模式</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 配置面板 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">目标主机</label>
              <input
                v-model="targetHost"
                type="text"
                placeholder="192.168.1.100"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">目标端口</label>
              <input
                v-model="targetPort"
                type="number"
                placeholder="22"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">超时时间 (秒)</label>
              <input
                v-model="timeout"
                type="number"
                placeholder="10"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <button
              @click="testConnection"
              :disabled="isConnecting"
              class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {{ isConnecting ? '连接中...' : '测试连接' }}
            </button>
          </div>

          <!-- 连接状态 -->
          <div class="bg-gray-700 p-4 rounded-lg">
            <h5 class="text-md font-semibold mb-3 text-cyan-400">连接状态</h5>
            <div class="relative h-40">
              <!-- 客户端 -->
              <div class="absolute top-4 left-4">
                <div class="w-14 h-14 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-xl">
                  💻
                </div>
                <div class="text-center mt-2 text-sm text-gray-300">客户端</div>
              </div>

              <!-- 服务器 -->
              <div class="absolute top-4 right-4">
                <div :class="[
                  'w-14 h-14 rounded-full flex items-center justify-center text-xl border-2 transition-all',
                  connectionStatus === 'connected' ? 'bg-green-600 border-green-400' :
                  connectionStatus === 'connecting' ? 'bg-yellow-600 border-yellow-400 animate-pulse' :
                  connectionStatus === 'failed' ? 'bg-red-600 border-red-400' :
                  'bg-gray-600 border-gray-400'
                ]">
                  🖥️
                </div>
                <div class="text-center mt-2 text-sm">
                  <div class="text-gray-300">{{ targetHost || 'N/A' }}</div>
                  <div class="text-gray-300">{{ targetPort || 'N/A' }}</div>
                </div>
              </div>

              <!-- 连接线 -->
              <div v-if="connectionStatus === 'connecting'" class="absolute top-10 left-20 right-20 h-px bg-yellow-400 animate-pulse"></div>
              <div v-if="connectionStatus === 'connected'" class="absolute top-10 left-20 right-20 h-px bg-green-400">
                <div class="absolute top-0 left-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div v-if="connectionStatus === 'failed'" class="absolute top-10 left-20 right-20 h-px bg-red-400"></div>

              <!-- 状态文本 -->
              <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                <div :class="[
                  'text-sm font-medium',
                  connectionStatus === 'connected' ? 'text-green-400' :
                  connectionStatus === 'connecting' ? 'text-yellow-400' :
                  connectionStatus === 'failed' ? 'text-red-400' :
                  'text-gray-400'
                ]">
                  {{ getConnectionStatusText() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 端口扫描模式 -->
    <div v-if="currentMode === 'scan'" class="space-y-6">
      <div class="bg-gray-800 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-4 text-cyan-400">端口扫描模式 (-z)</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 配置面板 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">目标主机</label>
              <input
                v-model="scanHost"
                type="text"
                placeholder="google.com"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">端口范围</label>
              <div class="flex space-x-2">
                <input
                  v-model="scanPortStart"
                  type="number"
                  placeholder="80"
                  class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
                <span class="text-gray-400 py-2">-</span>
                <input
                  v-model="scanPortEnd"
                  type="number"
                  placeholder="443"
                  class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
            </div>
            
            <button
              @click="startPortScan"
              :disabled="isScanning"
              class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {{ isScanning ? '扫描中...' : '开始扫描' }}
            </button>
          </div>

          <!-- 扫描进度 -->
          <div class="bg-gray-700 p-4 rounded-lg">
            <h5 class="text-md font-semibold mb-3 text-cyan-400">扫描进度</h5>
            <div v-if="isScanning" class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-300">进度</span>
                <span class="text-cyan-400">{{ scanProgress }}%</span>
              </div>
              <div class="w-full bg-gray-600 rounded-full h-2">
                <div 
                  class="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: scanProgress + '%' }"
                ></div>
              </div>
              <div class="text-sm text-gray-300">
                正在扫描端口: {{ currentScanPort }}
              </div>
            </div>
            
            <div v-if="!isScanning && scanResults.length > 0" class="space-y-2">
              <div class="text-sm text-gray-300">
                扫描完成: {{ scanResults.length }} 个端口
              </div>
              <div class="text-sm">
                <span class="text-green-400">开放: {{ scanResults.filter(r => r.status === 'open').length }}</span>
                <span class="text-red-400 ml-4">关闭: {{ scanResults.filter(r => r.status === 'closed').length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 扫描结果 -->
        <div v-if="scanResults.length > 0" class="mt-6 bg-gray-700 p-4 rounded-lg">
          <h5 class="text-md font-semibold mb-3 text-cyan-400">扫描结果</h5>
          <div class="bg-black p-3 rounded font-mono text-sm max-h-40 overflow-y-auto">
            <div v-for="result in scanResults" :key="result.port" class="mb-1 flex justify-between">
              <span class="text-gray-300">{{ scanHost }}:{{ result.port }}</span>
              <span :class="[
                'font-medium',
                result.status === 'open' ? 'text-green-400' : 'text-red-400'
              ]">
                {{ result.status === 'open' ? '开放' : '关闭' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据传输模式 -->
    <div v-if="currentMode === 'transfer'" class="space-y-6">
      <div class="bg-gray-800 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-4 text-cyan-400">数据传输模式</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 发送端 -->
          <div class="bg-gray-700 p-4 rounded-lg">
            <h5 class="text-md font-semibold mb-3 text-cyan-400">发送端</h5>
            <div class="space-y-3">
              <textarea
                v-model="transferData"
                placeholder="输入要传输的数据..."
                class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white resize-none"
                rows="4"
              ></textarea>
              <button
                @click="sendData"
                :disabled="!transferData.trim()"
                class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
              >
                发送数据
              </button>
            </div>
          </div>

          <!-- 接收端 -->
          <div class="bg-gray-700 p-4 rounded-lg">
            <h5 class="text-md font-semibold mb-3 text-cyan-400">接收端</h5>
            <div class="bg-black p-3 rounded font-mono text-sm h-32 overflow-y-auto">
              <div v-for="data in receivedData" :key="data.id" class="mb-1">
                <span class="text-gray-500">[{{ data.timestamp }}]</span>
                <span class="text-green-400 ml-2">{{ data.content }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 传输统计 -->
        <div class="mt-6 bg-gray-700 p-4 rounded-lg">
          <h5 class="text-md font-semibold mb-3 text-cyan-400">传输统计</h5>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="bg-gray-600 p-3 rounded">
              <div class="text-2xl font-bold text-cyan-400">{{ transferStats.packets }}</div>
              <div class="text-sm text-gray-300">数据包</div>
            </div>
            <div class="bg-gray-600 p-3 rounded">
              <div class="text-2xl font-bold text-green-400">{{ transferStats.bytes }}</div>
              <div class="text-sm text-gray-300">字节</div>
            </div>
            <div class="bg-gray-600 p-3 rounded">
              <div class="text-2xl font-bold text-blue-400">{{ transferStats.speed }}</div>
              <div class="text-sm text-gray-300">KB/s</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成的命令 -->
    <div class="mt-6 bg-gray-800 p-4 rounded-lg">
      <h4 class="text-lg font-semibold mb-3 text-cyan-400">生成的命令</h4>
      <div class="bg-black p-3 rounded font-mono text-sm">
        <span class="text-green-400">$ </span>
        <span class="text-white">{{ generateCommand() }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'

export default {
  name: 'NetcatVisualizer',
  setup() {
    const currentMode = ref('listen')
    
    const modes = [
      { id: 'listen', name: '监听模式' },
      { id: 'connect', name: '连接模式' },
      { id: 'scan', name: '端口扫描' },
      { id: 'transfer', name: '数据传输' }
    ]

    // 监听模式状态
    const listenPort = ref(8080)
    const protocol = ref('tcp')
    const isListening = ref(false)
    const connections = ref([])
    const connectionLogs = ref([])

    // 连接模式状态
    const targetHost = ref('google.com')
    const targetPort = ref(80)
    const timeout = ref(10)
    const isConnecting = ref(false)
    const connectionStatus = ref('idle') // idle, connecting, connected, failed

    // 端口扫描状态
    const scanHost = ref('google.com')
    const scanPortStart = ref(80)
    const scanPortEnd = ref(443)
    const isScanning = ref(false)
    const scanProgress = ref(0)
    const currentScanPort = ref(0)
    const scanResults = ref([])

    // 数据传输状态
    const transferData = ref('')
    const receivedData = ref([])
    const transferStats = reactive({
      packets: 0,
      bytes: 0,
      speed: 0
    })

    // 监听模式方法
    const toggleListening = () => {
      isListening.value = !isListening.value
      
      if (isListening.value) {
        addLog('info', `开始监听端口 ${listenPort.value}/${protocol.value.toUpperCase()}`)
        
        // 模拟连接
        setTimeout(() => {
          if (isListening.value) {
            const newConnection = {
              id: Date.now(),
              ip: '192.168.1.' + (Math.floor(Math.random() * 254) + 1),
              port: Math.floor(Math.random() * 65535) + 1024
            }
            connections.value.push(newConnection)
            addLog('success', `新连接来自 ${newConnection.ip}:${newConnection.port}`)
          }
        }, 2000)
      } else {
        addLog('info', '停止监听')
        connections.value = []
      }
    }

    const addLog = (type, message) => {
      const timestamp = new Date().toLocaleTimeString()
      connectionLogs.value.push({
        id: Date.now(),
        type,
        message,
        timestamp
      })
      
      // 保持日志数量
      if (connectionLogs.value.length > 10) {
        connectionLogs.value.shift()
      }
    }

    // 连接模式方法
    const testConnection = async () => {
      if (!targetHost.value || !targetPort.value) return
      
      isConnecting.value = true
      connectionStatus.value = 'connecting'
      
      // 模拟连接过程
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 随机连接结果
      const success = Math.random() > 0.3
      connectionStatus.value = success ? 'connected' : 'failed'
      isConnecting.value = false
      
      if (success) {
        setTimeout(() => {
          connectionStatus.value = 'idle'
        }, 5000)
      }
    }

    const getConnectionStatusText = () => {
      switch (connectionStatus.value) {
        case 'connecting': return '正在连接...'
        case 'connected': return '连接成功'
        case 'failed': return '连接失败'
        default: return '未连接'
      }
    }

    // 端口扫描方法
    const startPortScan = async () => {
      if (!scanHost.value || !scanPortStart.value || !scanPortEnd.value) return
      
      isScanning.value = true
      scanProgress.value = 0
      scanResults.value = []
      
      const startPort = parseInt(scanPortStart.value)
      const endPort = parseInt(scanPortEnd.value)
      const totalPorts = endPort - startPort + 1
      
      for (let port = startPort; port <= endPort; port++) {
        currentScanPort.value = port
        
        // 模拟扫描延迟
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // 随机结果，常见端口更可能开放
        const commonPorts = [22, 23, 25, 53, 80, 110, 143, 443, 993, 995]
        const isOpen = commonPorts.includes(port) ? Math.random() > 0.3 : Math.random() > 0.8
        
        scanResults.value.push({
          port,
          status: isOpen ? 'open' : 'closed'
        })
        
        scanProgress.value = Math.round(((port - startPort + 1) / totalPorts) * 100)
      }
      
      isScanning.value = false
    }

    // 数据传输方法
    const sendData = () => {
      if (!transferData.value.trim()) return
      
      const timestamp = new Date().toLocaleTimeString()
      receivedData.value.push({
        id: Date.now(),
        content: transferData.value,
        timestamp
      })
      
      // 更新统计
      transferStats.packets += 1
      transferStats.bytes += transferData.value.length
      transferStats.speed = Math.round(transferStats.bytes / 1024)
      
      transferData.value = ''
      
      // 保持数据数量
      if (receivedData.value.length > 20) {
        receivedData.value.shift()
      }
    }

    // 生成命令
    const generateCommand = () => {
      let cmd = 'nc'
      
      switch (currentMode.value) {
        case 'listen':
          cmd += ` -l -p ${listenPort.value}`
          if (protocol.value === 'udp') cmd += ' -u'
          break
        case 'connect':
          cmd += ` ${targetHost.value} ${targetPort.value}`
          if (timeout.value) cmd += ` -w ${timeout.value}`
          break
        case 'scan':
          cmd += ` -zv ${scanHost.value} ${scanPortStart.value}`
          if (scanPortEnd.value && scanPortEnd.value !== scanPortStart.value) {
            cmd += `-${scanPortEnd.value}`
          }
          break
        case 'transfer':
          cmd += ` -l -p 8080`
          break
      }
      
      return cmd
    }

    return {
      currentMode,
      modes,
      
      // 监听模式
      listenPort,
      protocol,
      isListening,
      connections,
      connectionLogs,
      toggleListening,
      
      // 连接模式
      targetHost,
      targetPort,
      timeout,
      isConnecting,
      connectionStatus,
      testConnection,
      getConnectionStatusText,
      
      // 端口扫描
      scanHost,
      scanPortStart,
      scanPortEnd,
      isScanning,
      scanProgress,
      currentScanPort,
      scanResults,
      startPortScan,
      
      // 数据传输
      transferData,
      receivedData,
      transferStats,
      sendData,
      
      generateCommand
    }
  }
}
</script>

<style scoped>
.netcat-visualizer {
  font-family: 'Consolas', 'Monaco', monospace;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style> 