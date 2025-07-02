<template>
  <div class="test-visualizer p-6 bg-gray-900 min-h-screen">
    <h1 class="text-3xl font-bold text-white mb-8 text-center">
      🧪 可视化组件测试
    </h1>
    
    <!-- 测试控制面板 -->
    <div class="bg-gray-800 rounded-lg p-4 mb-8">
      <h2 class="text-xl font-semibold text-blue-400 mb-4">测试控制面板</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          @click="currentTest = 'iptables'"
          :class="[
            'px-4 py-2 rounded-lg transition-colors',
            currentTest === 'iptables' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          🔥 测试 iptables 可视化
        </button>
        <button 
          @click="currentTest = 'ping'"
          :class="[
            'px-4 py-2 rounded-lg transition-colors',
            currentTest === 'ping' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          🏓 测试 ping 可视化
        </button>
        <button 
          @click="currentTest = 'netstat'"
          :class="[
            'px-4 py-2 rounded-lg transition-colors',
            currentTest === 'netstat' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          📊 测试 netstat 可视化
        </button>
      </div>
    </div>

    <!-- 当前测试命令显示 -->
    <div class="bg-gray-800 rounded-lg p-4 mb-6">
      <h3 class="text-lg font-semibold text-cyan-400 mb-2">当前测试命令：</h3>
      <div class="bg-black rounded p-3 font-mono text-green-400">
        {{ getCurrentCommand() }}
      </div>
    </div>

    <!-- 可视化组件展示区域 -->
    <div class="visualization-area">
      <!-- iptables 可视化测试 -->
      <div v-if="currentTest === 'iptables'" class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-4">🔥 iptables 防火墙可视化测试</h2>
        <IptablesVisualizer />
      </div>

      <!-- ping 可视化测试 -->
      <div v-if="currentTest === 'ping'" class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-4">🏓 ping 网络测试可视化</h2>
        <NetworkVisualizer command="ping google.com" target="google.com" />
      </div>

      <!-- netstat 可视化测试 -->
      <div v-if="currentTest === 'netstat'" class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-4">📊 netstat 网络状态可视化</h2>
        <NetworkVisualizer command="netstat -tuln" target="" />
      </div>

      <!-- traceroute 可视化测试 -->
      <div v-if="currentTest === 'traceroute'" class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-4">🛤️ traceroute 路由追踪可视化</h2>
        <NetworkVisualizer command="traceroute google.com" target="google.com" />
      </div>
    </div>

    <!-- 功能说明 -->
    <div class="bg-gray-800 rounded-lg p-6 mt-8">
      <h3 class="text-xl font-semibold text-yellow-400 mb-4">🎯 功能说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="text-lg font-semibold text-blue-400 mb-2">iptables 可视化功能</h4>
          <ul class="text-gray-300 space-y-1 text-sm">
            <li>• 🔥 实时防火墙规则管理</li>
            <li>• 📦 数据包流动模拟</li>
            <li>• 🌐 网络拓扑图显示</li>
            <li>• ⚡ 快速规则添加</li>
            <li>• 📝 详细操作日志</li>
            <li>• 🎭 支持多种表切换</li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold text-green-400 mb-2">网络命令可视化功能</h4>
          <ul class="text-gray-300 space-y-1 text-sm">
            <li>• 🏓 ping 连通性测试动画</li>
            <li>• 📊 netstat 连接状态统计</li>
            <li>• 🛤️ traceroute 路由追踪</li>
            <li>• 📈 实时数据统计</li>
            <li>• 🎨 美观的图表展示</li>
            <li>• 📱 响应式设计</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 操作提示 -->
    <div class="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mt-6">
      <h4 class="text-lg font-semibold text-blue-400 mb-2">💡 操作提示</h4>
      <div class="text-gray-300 text-sm">
        <p class="mb-2">
          <strong>iptables 测试：</strong> 
          尝试使用数据包模拟器发送测试包，观察规则匹配过程。可以添加、删除规则来测试不同场景。
        </p>
        <p>
          <strong>网络命令测试：</strong> 
          点击相应的动画按钮（如"开始Ping"、"开始追踪"）来观察网络命令的执行过程可视化。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import IptablesVisualizer from './IptablesVisualizer.vue'
import NetworkVisualizer from './NetworkVisualizer.vue'

// 响应式数据
const currentTest = ref('iptables')

// 方法
const getCurrentCommand = () => {
  const commands = {
    iptables: 'iptables -L -v',
    ping: 'ping -c 4 google.com',
    netstat: 'netstat -tuln',
    traceroute: 'traceroute google.com'
  }
  return commands[currentTest.value] || ''
}
</script>

<style scoped>
.visualization-area {
  min-height: 600px;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.8);
}
</style> 