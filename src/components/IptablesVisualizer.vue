<template>
  <div class="iptables-visualizer bg-gray-900 rounded-lg p-6 min-h-[800px]">
    <!-- 标题区域 -->
    <div class="mb-6">
      <h3 class="text-2xl font-bold text-white mb-2 flex items-center">
        <span class="mr-3">🔥</span>
        iptables 防火墙可视化
        <span class="ml-3 text-sm bg-blue-600 px-2 py-1 rounded">实时演示</span>
      </h3>
      <p class="text-gray-400">模拟网络环境中的防火墙规则和数据包流动</p>
    </div>

    <!-- 控制面板 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 当前表选择 -->
      <div class="bg-gray-800 rounded-lg p-4">
        <h4 class="text-lg font-semibold text-blue-400 mb-3">📋 当前表</h4>
        <select 
          v-model="currentTable" 
          @change="switchTable"
          class="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
        >
          <option value="filter">filter (过滤表)</option>
          <option value="nat">nat (地址转换表)</option>
          <option value="mangle">mangle (修改表)</option>
        </select>
      </div>

      <!-- 数据包模拟器 -->
      <div class="bg-gray-800 rounded-lg p-4">
        <h4 class="text-lg font-semibold text-green-400 mb-3">📦 数据包模拟</h4>
        <div class="space-y-2">
          <input 
            v-model="testPacket.sourceIP" 
            placeholder="源IP (192.168.1.100)"
            class="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600"
          >
          <input 
            v-model="testPacket.destIP" 
            placeholder="目标IP (10.0.0.1)"
            class="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600"
          >
          <div class="flex space-x-2">
            <select v-model="testPacket.protocol" class="flex-1 bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600">
              <option value="tcp">TCP</option>
              <option value="udp">UDP</option>
              <option value="icmp">ICMP</option>
            </select>
            <input 
              v-model="testPacket.port" 
              placeholder="端口"
              class="flex-1 bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600"
            >
          </div>
          <button 
            @click="simulatePacket"
            :disabled="packetSimulating"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded py-2 transition-colors"
          >
            {{ packetSimulating ? '🔄 模拟中...' : '🚀 发送数据包' }}
          </button>
        </div>
      </div>

      <!-- 快速规则 -->
      <div class="bg-gray-800 rounded-lg p-4">
        <h4 class="text-lg font-semibold text-purple-400 mb-3">⚡ 快速规则</h4>
        <div class="space-y-2">
          <button 
            @click="addQuickRule('block-ip')"
            class="w-full bg-red-600 hover:bg-red-700 text-white rounded py-1 text-sm transition-colors"
          >
            🚫 阻止IP访问
          </button>
          <button 
            @click="addQuickRule('allow-ssh')"
            class="w-full bg-green-600 hover:bg-green-700 text-white rounded py-1 text-sm transition-colors"
          >
            ✅ 允许SSH
          </button>
          <button 
            @click="addQuickRule('allow-http')"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-1 text-sm transition-colors"
          >
            🌐 允许HTTP
          </button>
          <button 
            @click="clearAllRules"
            class="w-full bg-gray-600 hover:bg-gray-700 text-white rounded py-1 text-sm transition-colors"
          >
            🗑️ 清空规则
          </button>
        </div>
      </div>
    </div>

    <!-- 网络拓扑图 -->
    <div class="bg-gray-800 rounded-lg p-6 mb-6">
      <h4 class="text-lg font-semibold text-cyan-400 mb-4">🌐 网络拓扑</h4>
      <div class="relative">
        <!-- 网络接口 -->
        <div class="flex justify-between items-center mb-8">
          <div class="network-interface" :class="{ 'active': activeInterface === 'eth0' }">
            <div class="interface-icon">🔌</div>
            <div class="interface-label">eth0</div>
            <div class="interface-ip">192.168.1.0/24</div>
          </div>
          
          <div class="network-interface" :class="{ 'active': activeInterface === 'lo' }">
            <div class="interface-icon">🔄</div>
            <div class="interface-label">lo</div>
            <div class="interface-ip">127.0.0.1</div>
          </div>
          
          <div class="network-interface" :class="{ 'active': activeInterface === 'eth1' }">
            <div class="interface-icon">🔌</div>
            <div class="interface-label">eth1</div>
            <div class="interface-ip">10.0.0.0/24</div>
          </div>
        </div>

        <!-- 数据包流动路径 -->
        <div class="packet-flow-container">
          <div 
            v-if="simulatingPacket" 
            class="packet-animation"
            :style="packetStyle"
          >
            📦
          </div>
        </div>
      </div>
    </div>

    <!-- 规则链可视化 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- INPUT 链 -->
      <div class="chain-container">
        <div class="chain-header input-chain">
          <h5 class="text-lg font-bold">📥 INPUT 链</h5>
          <span class="policy-badge">{{ chains.INPUT.policy }}</span>
        </div>
        <div class="chain-rules">
          <div 
            v-for="(rule, index) in chains.INPUT.rules" 
            :key="`input-${index}`"
            class="rule-item"
            :class="{ 
              'rule-matched': rule.matched,
              'rule-processing': rule.processing 
            }"
          >
            <div class="rule-number">{{ index + 1 }}</div>
            <div class="rule-content">
              <div class="rule-match">
                {{ formatRule(rule) }}
              </div>
              <div class="rule-target">
                <span class="target-badge" :class="rule.target.toLowerCase()">
                  {{ rule.target }}
                </span>
              </div>
            </div>
            <button 
              @click="removeRule('INPUT', index)"
              class="rule-delete"
            >
              ❌
            </button>
          </div>
          <div class="add-rule-btn" @click="showAddRuleModal('INPUT')">
            ➕ 添加规则
          </div>
        </div>
      </div>

      <!-- FORWARD 链 -->
      <div class="chain-container">
        <div class="chain-header forward-chain">
          <h5 class="text-lg font-bold">🔄 FORWARD 链</h5>
          <span class="policy-badge">{{ chains.FORWARD.policy }}</span>
        </div>
        <div class="chain-rules">
          <div 
            v-for="(rule, index) in chains.FORWARD.rules" 
            :key="`forward-${index}`"
            class="rule-item"
            :class="{ 
              'rule-matched': rule.matched,
              'rule-processing': rule.processing 
            }"
          >
            <div class="rule-number">{{ index + 1 }}</div>
            <div class="rule-content">
              <div class="rule-match">
                {{ formatRule(rule) }}
              </div>
              <div class="rule-target">
                <span class="target-badge" :class="rule.target.toLowerCase()">
                  {{ rule.target }}
                </span>
              </div>
            </div>
            <button 
              @click="removeRule('FORWARD', index)"
              class="rule-delete"
            >
              ❌
            </button>
          </div>
          <div class="add-rule-btn" @click="showAddRuleModal('FORWARD')">
            ➕ 添加规则
          </div>
        </div>
      </div>

      <!-- OUTPUT 链 -->
      <div class="chain-container">
        <div class="chain-header output-chain">
          <h5 class="text-lg font-bold">📤 OUTPUT 链</h5>
          <span class="policy-badge">{{ chains.OUTPUT.policy }}</span>
        </div>
        <div class="chain-rules">
          <div 
            v-for="(rule, index) in chains.OUTPUT.rules" 
            :key="`output-${index}`"
            class="rule-item"
            :class="{ 
              'rule-matched': rule.matched,
              'rule-processing': rule.processing 
            }"
          >
            <div class="rule-number">{{ index + 1 }}</div>
            <div class="rule-content">
              <div class="rule-match">
                {{ formatRule(rule) }}
              </div>
              <div class="rule-target">
                <span class="target-badge" :class="rule.target.toLowerCase()">
                  {{ rule.target }}
                </span>
              </div>
            </div>
            <button 
              @click="removeRule('OUTPUT', index)"
              class="rule-delete"
            >
              ❌
            </button>
          </div>
          <div class="add-rule-btn" @click="showAddRuleModal('OUTPUT')">
            ➕ 添加规则
          </div>
        </div>
      </div>
    </div>

    <!-- 模拟日志 -->
    <div class="bg-gray-800 rounded-lg p-4 mt-6">
      <h4 class="text-lg font-semibold text-yellow-400 mb-3">📝 模拟日志</h4>
      <div class="log-container">
        <div 
          v-for="(log, index) in simulationLogs" 
          :key="index"
          class="log-entry"
          :class="log.type"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <!-- 添加规则模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h4 class="text-xl font-bold text-white mb-4">添加规则到 {{ modalChain }} 链</h4>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-300 mb-1">协议</label>
              <select v-model="newRule.protocol" class="w-full bg-gray-700 text-white rounded px-3 py-2">
                <option value="">任意</option>
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
                <option value="icmp">ICMP</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">动作</label>
              <select v-model="newRule.target" class="w-full bg-gray-700 text-white rounded px-3 py-2">
                <option value="ACCEPT">ACCEPT</option>
                <option value="DROP">DROP</option>
                <option value="REJECT">REJECT</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-300 mb-1">源IP</label>
              <input 
                v-model="newRule.source" 
                placeholder="192.168.1.0/24"
                class="w-full bg-gray-700 text-white rounded px-3 py-2"
              >
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">目标IP</label>
              <input 
                v-model="newRule.destination" 
                placeholder="10.0.0.1"
                class="w-full bg-gray-700 text-white rounded px-3 py-2"
              >
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-300 mb-1">源端口</label>
              <input 
                v-model="newRule.sport" 
                placeholder="1024-65535"
                class="w-full bg-gray-700 text-white rounded px-3 py-2"
              >
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">目标端口</label>
              <input 
                v-model="newRule.dport" 
                placeholder="80"
                class="w-full bg-gray-700 text-white rounded px-3 py-2"
              >
            </div>
          </div>
          <div class="flex space-x-4">
            <button 
              @click="addRule"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded py-2 transition-colors"
            >
              ✅ 添加规则
            </button>
            <button 
              @click="closeModal"
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded py-2 transition-colors"
            >
              ❌ 取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'

// 响应式数据
const currentTable = ref('filter')
const activeInterface = ref('')
const packetSimulating = ref(false)
const simulatingPacket = ref(false)
const showModal = ref(false)
const modalChain = ref('')

// 测试数据包
const testPacket = reactive({
  sourceIP: '192.168.1.100',
  destIP: '10.0.0.1',
  protocol: 'tcp',
  port: '80'
})

// 新规则
const newRule = reactive({
  protocol: '',
  source: '',
  destination: '',
  sport: '',
  dport: '',
  target: 'ACCEPT'
})

// 规则链数据
const chains = reactive({
  INPUT: {
    policy: 'ACCEPT',
    rules: [
      {
        protocol: 'tcp',
        source: '',
        destination: '',
        sport: '',
        dport: '22',
        target: 'ACCEPT',
        matched: false,
        processing: false
      }
    ]
  },
  FORWARD: {
    policy: 'ACCEPT',
    rules: []
  },
  OUTPUT: {
    policy: 'ACCEPT',
    rules: []
  }
})

// 模拟日志
const simulationLogs = ref([
  { time: '12:00:00', message: '🔥 iptables visualizer initialized', type: 'info' },
  { time: '12:00:01', message: '📋 Filter table loaded with default rules', type: 'info' }
])

// 数据包样式
const packetStyle = ref({
  left: '0%',
  top: '50%',
  transform: 'translateY(-50%)'
})

// 方法
const switchTable = () => {
  addLog(`📋 Switched to ${currentTable.value} table`, 'info')
  // 根据不同表加载不同的规则
  if (currentTable.value === 'nat') {
    // NAT表的规则
    chains.INPUT.rules = []
    chains.FORWARD.rules = []
    chains.OUTPUT.rules = []
  } else if (currentTable.value === 'mangle') {
    // Mangle表的规则
    chains.INPUT.rules = []
    chains.FORWARD.rules = []
    chains.OUTPUT.rules = []
  } else {
    // Filter表的默认规则
    chains.INPUT.rules = [
      {
        protocol: 'tcp',
        source: '',
        destination: '',
        sport: '',
        dport: '22',
        target: 'ACCEPT',
        matched: false,
        processing: false
      }
    ]
  }
}

const simulatePacket = async () => {
  if (packetSimulating.value) return
  
  packetSimulating.value = true
  simulatingPacket.value = true
  
  addLog(`📦 Simulating packet: ${testPacket.sourceIP}:${testPacket.port} → ${testPacket.destIP} (${testPacket.protocol.toUpperCase()})`, 'info')
  
  // 重置所有规则状态
  resetRulesState()
  
  // 模拟数据包流动
  await animatePacketFlow()
  
  // 检查规则匹配
  await checkRuleMatches()
  
  packetSimulating.value = false
  simulatingPacket.value = false
}

const animatePacketFlow = () => {
  return new Promise(resolve => {
    let position = 0
    const interval = setInterval(() => {
      position += 2
      packetStyle.value.left = `${position}%`
      
      if (position >= 100) {
        clearInterval(interval)
        resolve()
      }
    }, 50)
  })
}

const checkRuleMatches = async () => {
  const chainOrder = ['INPUT', 'FORWARD', 'OUTPUT']
  
  for (const chainName of chainOrder) {
    const chain = chains[chainName]
    
    for (let i = 0; i < chain.rules.length; i++) {
      const rule = chain.rules[i]
      
      // 高亮当前处理的规则
      rule.processing = true
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 检查规则匹配
      const matches = checkRuleMatch(rule, testPacket)
      
      if (matches) {
        rule.matched = true
        addLog(`✅ Rule ${i + 1} in ${chainName} chain matched: ${formatRule(rule)} → ${rule.target}`, 'success')
        
        if (rule.target === 'DROP') {
          addLog(`🚫 Packet DROPPED by rule ${i + 1} in ${chainName} chain`, 'error')
          rule.processing = false
          return
        } else if (rule.target === 'REJECT') {
          addLog(`❌ Packet REJECTED by rule ${i + 1} in ${chainName} chain`, 'warning')
          rule.processing = false
          return
        } else if (rule.target === 'ACCEPT') {
          addLog(`✅ Packet ACCEPTED by rule ${i + 1} in ${chainName} chain`, 'success')
          rule.processing = false
          return
        }
      } else {
        addLog(`⏭️ Rule ${i + 1} in ${chainName} chain: no match`, 'info')
      }
      
      rule.processing = false
    }
  }
  
  addLog(`✅ Packet processed through all chains, default policy applied`, 'success')
}

const checkRuleMatch = (rule, packet) => {
  // 检查协议匹配
  if (rule.protocol && rule.protocol !== packet.protocol) {
    return false
  }
  
  // 检查端口匹配
  if (rule.dport && rule.dport !== packet.port) {
    return false
  }
  
  // 检查IP匹配（简化版）
  if (rule.source && !packet.sourceIP.includes(rule.source.split('/')[0])) {
    return false
  }
  
  if (rule.destination && !packet.destIP.includes(rule.destination.split('/')[0])) {
    return false
  }
  
  return true
}

const resetRulesState = () => {
  Object.values(chains).forEach(chain => {
    chain.rules.forEach(rule => {
      rule.matched = false
      rule.processing = false
    })
  })
}

const formatRule = (rule) => {
  const parts = []
  
  if (rule.protocol) parts.push(`${rule.protocol}`)
  if (rule.source) parts.push(`src:${rule.source}`)
  if (rule.destination) parts.push(`dst:${rule.destination}`)
  if (rule.sport) parts.push(`sport:${rule.sport}`)
  if (rule.dport) parts.push(`dport:${rule.dport}`)
  
  return parts.length > 0 ? parts.join(' ') : 'any'
}

const addQuickRule = (type) => {
  let rule = {}
  
  switch (type) {
    case 'block-ip':
      rule = {
        protocol: '',
        source: '192.168.10.10',
        destination: '',
        sport: '',
        dport: '',
        target: 'DROP',
        matched: false,
        processing: false
      }
      chains.INPUT.rules.push(rule)
      addLog(`🚫 Added rule to block IP 192.168.10.10`, 'warning')
      break
      
    case 'allow-ssh':
      rule = {
        protocol: 'tcp',
        source: '',
        destination: '',
        sport: '',
        dport: '22',
        target: 'ACCEPT',
        matched: false,
        processing: false
      }
      chains.INPUT.rules.push(rule)
      addLog(`✅ Added rule to allow SSH (port 22)`, 'success')
      break
      
    case 'allow-http':
      rule = {
        protocol: 'tcp',
        source: '',
        destination: '',
        sport: '',
        dport: '80',
        target: 'ACCEPT',
        matched: false,
        processing: false
      }
      chains.INPUT.rules.push(rule)
      addLog(`🌐 Added rule to allow HTTP (port 80)`, 'success')
      break
  }
}

const clearAllRules = () => {
  chains.INPUT.rules = []
  chains.FORWARD.rules = []
  chains.OUTPUT.rules = []
  addLog(`🗑️ All rules cleared`, 'info')
}

const showAddRuleModal = (chain) => {
  modalChain.value = chain
  showModal.value = true
  
  // 重置新规则表单
  Object.assign(newRule, {
    protocol: '',
    source: '',
    destination: '',
    sport: '',
    dport: '',
    target: 'ACCEPT'
  })
}

const closeModal = () => {
  showModal.value = false
  modalChain.value = ''
}

const addRule = () => {
  const rule = {
    protocol: newRule.protocol,
    source: newRule.source,
    destination: newRule.destination,
    sport: newRule.sport,
    dport: newRule.dport,
    target: newRule.target,
    matched: false,
    processing: false
  }
  
  chains[modalChain.value].rules.push(rule)
  addLog(`➕ Added rule to ${modalChain.value} chain: ${formatRule(rule)} → ${rule.target}`, 'info')
  
  closeModal()
}

const removeRule = (chain, index) => {
  const removedRule = chains[chain].rules[index]
  chains[chain].rules.splice(index, 1)
  addLog(`❌ Removed rule from ${chain} chain: ${formatRule(removedRule)}`, 'warning')
}

const addLog = (message, type = 'info') => {
  const now = new Date()
  const time = now.toLocaleTimeString()
  
  simulationLogs.value.push({
    time,
    message,
    type
  })
  
  // 保持日志数量在合理范围
  if (simulationLogs.value.length > 50) {
    simulationLogs.value.shift()
  }
}

onMounted(() => {
  addLog('🚀 iptables Visualizer ready', 'success')
})
</script>

<style scoped>
/* 网络接口样式 */
.network-interface {
  @apply bg-gray-700 rounded-lg p-4 text-center transition-all duration-300 border-2 border-transparent;
  min-width: 120px;
}

.network-interface.active {
  @apply border-cyan-400 bg-cyan-900/30;
}

.interface-icon {
  @apply text-2xl mb-2;
}

.interface-label {
  @apply text-white font-semibold mb-1;
}

.interface-ip {
  @apply text-xs text-gray-400;
}

/* 数据包流动动画 */
.packet-flow-container {
  @apply relative h-16 bg-gray-700 rounded-lg mb-4 overflow-hidden;
}

.packet-animation {
  @apply absolute text-2xl transition-all duration-100 ease-linear;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: translateY(-50%) scale(1); }
  50% { transform: translateY(-50%) scale(1.2); }
}

/* 规则链样式 */
.chain-container {
  @apply bg-gray-800 rounded-lg overflow-hidden;
}

.chain-header {
  @apply p-4 text-white flex justify-between items-center;
}

.input-chain {
  @apply bg-blue-600;
}

.forward-chain {
  @apply bg-purple-600;
}

.output-chain {
  @apply bg-green-600;
}

.policy-badge {
  @apply bg-white/20 px-2 py-1 rounded text-sm;
}

.chain-rules {
  @apply p-4 space-y-3;
}

.rule-item {
  @apply bg-gray-700 rounded-lg p-3 flex items-center space-x-3 transition-all duration-300;
  border-left: 4px solid transparent;
}

.rule-item.rule-processing {
  @apply bg-yellow-900/50 border-yellow-400;
  animation: processing 1s infinite;
}

.rule-item.rule-matched {
  @apply bg-green-900/50 border-green-400;
}

@keyframes processing {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.rule-number {
  @apply w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold text-white;
}

.rule-content {
  @apply flex-1;
}

.rule-match {
  @apply text-white text-sm mb-1;
}

.rule-target {
  @apply text-xs;
}

.target-badge {
  @apply px-2 py-1 rounded text-xs font-semibold;
}

.target-badge.accept {
  @apply bg-green-600 text-white;
}

.target-badge.drop {
  @apply bg-red-600 text-white;
}

.target-badge.reject {
  @apply bg-orange-600 text-white;
}

.rule-delete {
  @apply text-red-400 hover:text-red-300 transition-colors;
}

.add-rule-btn {
  @apply bg-gray-600 hover:bg-gray-500 text-white rounded-lg p-3 text-center cursor-pointer transition-colors;
}

/* 日志样式 */
.log-container {
  @apply bg-gray-900 rounded p-4 h-32 overflow-y-auto font-mono text-sm;
}

.log-entry {
  @apply mb-1 flex space-x-2;
}

.log-time {
  @apply text-gray-500;
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

.log-entry.warning .log-message {
  @apply text-yellow-300;
}

.log-entry.error .log-message {
  @apply text-red-300;
}

/* 模态框样式 */
.modal-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4;
}
</style>
