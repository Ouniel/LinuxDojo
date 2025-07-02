<template>
  <div class="h-full bg-gray-900 text-white overflow-hidden">
    <!-- ps 命令可视化 -->
    <div v-if="command.startsWith('ps')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">⚡</span>
          <div>
            <h2 class="text-xl font-bold">进程监视器</h2>
            <p class="text-blue-100 text-sm">实时系统进程状态</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm text-blue-100">活跃进程</div>
          <div class="text-2xl font-bold">{{ processCount }}</div>
        </div>
      </div>

      <!-- 进程统计卡片 -->
      <div class="p-4 grid grid-cols-4 gap-4">
        <div class="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
          <div class="text-green-400 text-2xl font-bold">{{ runningProcesses }}</div>
          <div class="text-green-300 text-sm">运行中</div>
        </div>
        <div class="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-center">
          <div class="text-yellow-400 text-2xl font-bold">{{ sleepingProcesses }}</div>
          <div class="text-yellow-300 text-sm">休眠</div>
        </div>
        <div class="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
          <div class="text-red-400 text-2xl font-bold">{{ zombieProcesses }}</div>
          <div class="text-red-300 text-sm">僵尸进程</div>
        </div>
        <div class="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
          <div class="text-blue-400 text-2xl font-bold">{{ stoppedProcesses }}</div>
          <div class="text-blue-300 text-sm">已停止</div>
        </div>
      </div>

      <!-- 进程列表 -->
      <div class="flex-1 p-4 overflow-hidden">
        <div class="bg-gray-800 rounded-lg h-full overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-700 sticky top-0">
              <tr>
                <th class="text-left p-3 text-cyan-400">PID</th>
                <th class="text-left p-3 text-cyan-400">用户</th>
                <th class="text-left p-3 text-cyan-400">CPU%</th>
                <th class="text-left p-3 text-cyan-400">内存%</th>
                <th class="text-left p-3 text-cyan-400">状态</th>
                <th class="text-left p-3 text-cyan-400">命令</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="process in processes" 
                :key="process.pid"
                class="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
              >
                <td class="p-3 font-mono text-green-400">{{ process.pid }}</td>
                <td class="p-3 text-blue-400">{{ process.user }}</td>
                <td class="p-3">
                  <div class="flex items-center space-x-2">
                    <div class="w-12 bg-gray-600 rounded-full h-2">
                      <div 
                        class="h-2 rounded-full transition-all duration-500"
                        :class="getCpuBarColor(process.cpu)"
                        :style="{ width: `${Math.min(process.cpu, 100)}%` }"
                      ></div>
                    </div>
                    <span :class="getCpuTextColor(process.cpu)">{{ process.cpu }}%</span>
                  </div>
                </td>
                <td class="p-3">
                  <div class="flex items-center space-x-2">
                    <div class="w-12 bg-gray-600 rounded-full h-2">
                      <div 
                        class="h-2 rounded-full transition-all duration-500"
                        :class="getMemoryBarColor(process.memory)"
                        :style="{ width: `${Math.min(process.memory, 100)}%` }"
                      ></div>
                    </div>
                    <span :class="getMemoryTextColor(process.memory)">{{ process.memory }}%</span>
                  </div>
                </td>
                <td class="p-3">
                  <span 
                    class="px-2 py-1 rounded-full text-xs font-semibold"
                    :class="getStatusClass(process.status)"
                  >
                    {{ process.status }}
                  </span>
                </td>
                <td class="p-3 font-mono text-gray-300 truncate max-w-xs">{{ process.command }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- top 命令可视化 -->
    <div v-else-if="command.startsWith('top')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-green-600 to-blue-600 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">📊</span>
            <div>
              <h2 class="text-xl font-bold">系统监视器</h2>
              <p class="text-green-100 text-sm">实时系统性能监控</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-green-100">系统负载</div>
            <div class="text-2xl font-bold">{{ systemLoad }}</div>
          </div>
        </div>
      </div>

      <!-- 系统状态概览 -->
      <div class="p-4 grid grid-cols-3 gap-4">
        <!-- CPU 使用率 -->
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-cyan-400">CPU 使用率</h3>
            <span class="text-2xl">🔥</span>
          </div>
          <div class="relative w-24 h-24 mx-auto">
            <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="40"
                stroke="currentColor"
                stroke-width="8"
                fill="none"
                class="text-gray-600"
              />
              <circle
                cx="50" cy="50" r="40"
                stroke="currentColor"
                stroke-width="8"
                fill="none"
                stroke-linecap="round"
                class="text-red-500"
                :stroke-dasharray="`${cpuUsage * 2.51} 251`"
                style="transition: stroke-dasharray 0.5s ease-in-out"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xl font-bold text-red-400">{{ cpuUsage }}%</span>
            </div>
          </div>
        </div>

        <!-- 内存使用率 -->
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-cyan-400">内存使用率</h3>
            <span class="text-2xl">🧠</span>
          </div>
          <div class="relative w-24 h-24 mx-auto">
            <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="40"
                stroke="currentColor"
                stroke-width="8"
                fill="none"
                class="text-gray-600"
              />
              <circle
                cx="50" cy="50" r="40"
                stroke="currentColor"
                stroke-width="8"
                fill="none"
                stroke-linecap="round"
                class="text-blue-500"
                :stroke-dasharray="`${memoryUsage * 2.51} 251`"
                style="transition: stroke-dasharray 0.5s ease-in-out"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xl font-bold text-blue-400">{{ memoryUsage }}%</span>
            </div>
          </div>
        </div>

        <!-- 磁盘 I/O -->
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-cyan-400">磁盘 I/O</h3>
            <span class="text-2xl">💾</span>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-green-400">读取</span>
              <span class="text-green-400">{{ diskRead }} MB/s</span>
            </div>
            <div class="w-full bg-gray-600 rounded-full h-2">
              <div 
                class="bg-green-500 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${Math.min(diskRead * 10, 100)}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-orange-400">写入</span>
              <span class="text-orange-400">{{ diskWrite }} MB/s</span>
            </div>
            <div class="w-full bg-gray-600 rounded-full h-2">
              <div 
                class="bg-orange-500 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${Math.min(diskWrite * 10, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 进程排行榜 -->
      <div class="flex-1 p-4 overflow-hidden">
        <h3 class="text-lg font-semibold text-cyan-400 mb-3">🏆 资源使用排行榜</h3>
        <div class="bg-gray-800 rounded-lg h-full overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-700 sticky top-0">
              <tr>
                <th class="text-left p-3 text-cyan-400">排名</th>
                <th class="text-left p-3 text-cyan-400">PID</th>
                <th class="text-left p-3 text-cyan-400">用户</th>
                <th class="text-left p-3 text-cyan-400">CPU%</th>
                <th class="text-left p-3 text-cyan-400">内存%</th>
                <th class="text-left p-3 text-cyan-400">命令</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(process, index) in topProcesses" 
                :key="process.pid"
                class="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
              >
                <td class="p-3">
                  <span 
                    class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    :class="getRankClass(index)"
                  >
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="p-3 font-mono text-green-400">{{ process.pid }}</td>
                <td class="p-3 text-blue-400">{{ process.user }}</td>
                <td class="p-3 font-bold" :class="getCpuTextColor(process.cpu)">{{ process.cpu }}%</td>
                <td class="p-3 font-bold" :class="getMemoryTextColor(process.memory)">{{ process.memory }}%</td>
                <td class="p-3 font-mono text-gray-300 truncate max-w-xs">{{ process.command }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- df 命令可视化 -->
    <div v-else-if="command.startsWith('df')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">💿</span>
          <div>
            <h2 class="text-xl font-bold">磁盘空间监视器</h2>
            <p class="text-purple-100 text-sm">文件系统使用情况</p>
          </div>
        </div>
      </div>

      <!-- 磁盘使用概览 -->
      <div class="p-4 grid grid-cols-2 gap-4">
        <div 
          v-for="disk in diskUsage" 
          :key="disk.filesystem"
          class="bg-gray-800 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-cyan-400">{{ disk.filesystem }}</h3>
            <span class="text-xl">{{ disk.icon }}</span>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">已用</span>
              <span class="text-white font-semibold">{{ disk.used }} / {{ disk.size }}</span>
            </div>
            <div class="w-full bg-gray-600 rounded-full h-3">
              <div 
                class="h-3 rounded-full transition-all duration-500"
                :class="getDiskUsageColor(disk.usagePercent)"
                :style="{ width: `${disk.usagePercent}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">{{ disk.usagePercent }}% 已使用</span>
              <span class="text-gray-400">剩余 {{ disk.available }}</span>
            </div>
            <div class="text-xs text-gray-500">挂载点: {{ disk.mountpoint }}</div>
          </div>
        </div>
      </div>

      <!-- 详细信息表格 -->
      <div class="flex-1 p-4 overflow-hidden">
        <h3 class="text-lg font-semibold text-cyan-400 mb-3">📊 详细信息</h3>
        <div class="bg-gray-800 rounded-lg h-full overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-700 sticky top-0">
              <tr>
                <th class="text-left p-3 text-cyan-400">文件系统</th>
                <th class="text-left p-3 text-cyan-400">类型</th>
                <th class="text-left p-3 text-cyan-400">总大小</th>
                <th class="text-left p-3 text-cyan-400">已用</th>
                <th class="text-left p-3 text-cyan-400">可用</th>
                <th class="text-left p-3 text-cyan-400">使用率</th>
                <th class="text-left p-3 text-cyan-400">挂载点</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="disk in diskUsage" 
                :key="disk.filesystem"
                class="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
              >
                <td class="p-3 font-mono text-green-400">{{ disk.filesystem }}</td>
                <td class="p-3 text-blue-400">{{ disk.type }}</td>
                <td class="p-3 text-white font-semibold">{{ disk.size }}</td>
                <td class="p-3 text-orange-400 font-semibold">{{ disk.used }}</td>
                <td class="p-3 text-green-400 font-semibold">{{ disk.available }}</td>
                <td class="p-3">
                  <div class="flex items-center space-x-2">
                    <div class="w-16 bg-gray-600 rounded-full h-2">
                      <div 
                        class="h-2 rounded-full transition-all duration-500"
                        :class="getDiskUsageColor(disk.usagePercent)"
                        :style="{ width: `${disk.usagePercent}%` }"
                      ></div>
                    </div>
                    <span :class="getDiskUsageTextColor(disk.usagePercent)">{{ disk.usagePercent }}%</span>
                  </div>
                </td>
                <td class="p-3 text-cyan-400">{{ disk.mountpoint }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- du 命令可视化 -->
    <div v-else-if="command.startsWith('du')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-yellow-600 to-orange-600 p-4">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">📁</span>
          <div>
            <h2 class="text-xl font-bold">目录大小分析器</h2>
            <p class="text-yellow-100 text-sm">文件和目录磁盘使用量</p>
          </div>
        </div>
      </div>

      <!-- 目录大小概览 -->
      <div class="p-4 grid grid-cols-2 gap-4">
        <div class="bg-gray-800 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-cyan-400 mb-4 text-center">📊 目录大小分布</h3>
          <div class="space-y-3">
            <div 
              v-for="(dir, index) in sortedDirectories" 
              :key="dir.name"
              class="flex items-center justify-between p-2 bg-gray-700/50 rounded"
            >
              <div class="flex items-center space-x-3">
                <span 
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  :class="getRankClass(index)"
                >
                  {{ index + 1 }}
                </span>
                <span class="text-gray-300 truncate">{{ dir.name }}</span>
              </div>
              <span class="text-white font-semibold">{{ dir.size }}</span>
            </div>
          </div>
        </div>

        <!-- 大小统计 -->
        <div class="bg-gray-800 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-cyan-400 mb-4">📈 统计信息</h3>
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-gray-400">总大小</span>
              <span class="text-white font-bold text-lg">{{ totalSize }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">目录数量</span>
              <span class="text-blue-400 font-semibold">{{ directoryData.length }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">最大目录</span>
              <span class="text-green-400 font-semibold">{{ largestDirectory }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">平均大小</span>
              <span class="text-yellow-400 font-semibold">{{ averageSize }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细目录列表 -->
      <div class="flex-1 p-4 overflow-hidden">
        <h3 class="text-lg font-semibold text-cyan-400 mb-3">📂 详细列表</h3>
        <div class="bg-gray-800 rounded-lg h-full overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-700 sticky top-0">
              <tr>
                <th class="text-left p-3 text-cyan-400">大小</th>
                <th class="text-left p-3 text-cyan-400">百分比</th>
                <th class="text-left p-3 text-cyan-400">类型</th>
                <th class="text-left p-3 text-cyan-400">路径</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="dir in directoryData" 
                :key="dir.path"
                class="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
              >
                <td class="p-3 text-white font-semibold">{{ dir.size }}</td>
                <td class="p-3">
                  <div class="flex items-center space-x-2">
                    <div class="w-16 bg-gray-600 rounded-full h-2">
                      <div 
                        class="h-2 rounded-full transition-all duration-500"
                        :class="getSizeBarColor(dir.percentage)"
                        :style="{ width: `${dir.percentage}%` }"
                      ></div>
                    </div>
                    <span class="text-gray-300">{{ dir.percentage }}%</span>
                  </div>
                </td>
                <td class="p-3">
                  <span class="text-blue-400">{{ dir.type }}</span>
                </td>
                <td class="p-3 font-mono text-gray-300">{{ dir.path }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 默认系统信息展示 -->
    <div v-else class="h-full flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4">🖥️</div>
        <h2 class="text-2xl font-bold mb-2">系统信息可视化</h2>
        <p class="text-gray-400">支持 ps、top、df、du 等系统监控命令</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  command: {
    type: String,
    default: ''
  }
})

// 进程数据
const processes = ref([
  { pid: 1234, user: 'root', cpu: 15.2, memory: 8.5, status: 'R', command: '/usr/bin/systemd' },
  { pid: 2345, user: 'user', cpu: 25.8, memory: 12.3, status: 'S', command: 'firefox --no-sandbox' },
  { pid: 3456, user: 'user', cpu: 8.1, memory: 6.2, status: 'S', command: 'code --extensionDevelopmentPath' },
  { pid: 4567, user: 'mysql', cpu: 12.5, memory: 15.7, status: 'S', command: '/usr/sbin/mysqld' },
  { pid: 5678, user: 'user', cpu: 3.2, memory: 4.1, status: 'S', command: 'gnome-terminal' },
  { pid: 6789, user: 'root', cpu: 1.8, memory: 2.3, status: 'S', command: '[kworker/0:1]' },
  { pid: 7890, user: 'user', cpu: 45.6, memory: 28.9, status: 'R', command: 'node server.js' },
  { pid: 8901, user: 'user', cpu: 0.5, memory: 1.2, status: 'S', command: 'ssh user@remote' }
])

// 系统状态数据
const cpuUsage = ref(65)
const memoryUsage = ref(78)
const systemLoad = ref('1.25')
const diskRead = ref(5.2)
const diskWrite = ref(3.8)

// 磁盘使用数据
const diskUsage = ref([
  {
    filesystem: '/dev/sda1',
    type: 'ext4',
    size: '50G',
    used: '32G',
    available: '16G',
    usagePercent: 68,
    mountpoint: '/',
    icon: '💿'
  },
  {
    filesystem: '/dev/sda2',
    type: 'ext4',
    size: '100G',
    used: '45G',
    available: '50G',
    usagePercent: 47,
    mountpoint: '/home',
    icon: '🏠'
  },
  {
    filesystem: '/dev/sdb1',
    type: 'ntfs',
    size: '500G',
    used: '320G',
    available: '180G',
    usagePercent: 64,
    mountpoint: '/mnt/data',
    icon: '📁'
  },
  {
    filesystem: 'tmpfs',
    type: 'tmpfs',
    size: '4.0G',
    used: '1.2G',
    available: '2.8G',
    usagePercent: 30,
    mountpoint: '/tmp',
    icon: '⚡'
  }
])

// 目录大小数据
const directoryData = ref([
  { path: './documents', size: '2.3G', percentage: 35, type: '目录' },
  { path: './downloads', size: '1.8G', percentage: 28, type: '目录' },
  { path: './videos', size: '1.2G', percentage: 18, type: '目录' },
  { path: './pictures', size: '800M', percentage: 12, type: '目录' },
  { path: './music', size: '450M', percentage: 7, type: '目录' }
])

// 计算属性
const processCount = computed(() => processes.value.length)
const runningProcesses = computed(() => processes.value.filter(p => p.status === 'R').length)
const sleepingProcesses = computed(() => processes.value.filter(p => p.status === 'S').length)
const zombieProcesses = computed(() => processes.value.filter(p => p.status === 'Z').length)
const stoppedProcesses = computed(() => processes.value.filter(p => p.status === 'T').length)

const topProcesses = computed(() => {
  return [...processes.value]
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 10)
})

const sortedDirectories = computed(() => {
  return [...directoryData.value]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5)
})

const totalSize = computed(() => {
  const total = directoryData.value.reduce((sum, dir) => {
    const sizeInMB = parseFloat(dir.size.replace(/[GM]/g, '')) * (dir.size.includes('G') ? 1024 : 1)
    return sum + sizeInMB
  }, 0)
  return total > 1024 ? `${(total / 1024).toFixed(1)}G` : `${total.toFixed(0)}M`
})

const largestDirectory = computed(() => {
  return sortedDirectories.value[0]?.name || 'N/A'
})

const averageSize = computed(() => {
  const total = directoryData.value.reduce((sum, dir) => {
    const sizeInMB = parseFloat(dir.size.replace(/[GM]/g, '')) * (dir.size.includes('G') ? 1024 : 1)
    return sum + sizeInMB
  }, 0)
  const avg = total / directoryData.value.length
  return avg > 1024 ? `${(avg / 1024).toFixed(1)}G` : `${avg.toFixed(0)}M`
})

// 样式函数
const getCpuBarColor = (cpu) => {
  if (cpu > 80) return 'bg-red-500'
  if (cpu > 60) return 'bg-orange-500'
  if (cpu > 40) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getCpuTextColor = (cpu) => {
  if (cpu > 80) return 'text-red-400'
  if (cpu > 60) return 'text-orange-400'
  if (cpu > 40) return 'text-yellow-400'
  return 'text-green-400'
}

const getMemoryBarColor = (memory) => {
  if (memory > 80) return 'bg-red-500'
  if (memory > 60) return 'bg-orange-500'
  if (memory > 40) return 'bg-yellow-500'
  return 'bg-blue-500'
}

const getMemoryTextColor = (memory) => {
  if (memory > 80) return 'text-red-400'
  if (memory > 60) return 'text-orange-400'
  if (memory > 40) return 'text-yellow-400'
  return 'text-blue-400'
}

const getStatusClass = (status) => {
  switch (status) {
    case 'R': return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'S': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    case 'Z': return 'bg-red-500/20 text-red-400 border border-red-500/30'
    case 'T': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

const getRankClass = (index) => {
  if (index === 0) return 'bg-yellow-500 text-yellow-900'
  if (index === 1) return 'bg-gray-400 text-gray-900'
  if (index === 2) return 'bg-orange-600 text-orange-100'
  return 'bg-blue-500 text-blue-100'
}

const getDiskUsageColor = (usage) => {
  if (usage > 90) return 'bg-red-500'
  if (usage > 80) return 'bg-orange-500'
  if (usage > 60) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getDiskUsageTextColor = (usage) => {
  if (usage > 90) return 'text-red-400'
  if (usage > 80) return 'text-orange-400'
  if (usage > 60) return 'text-yellow-400'
  return 'text-green-400'
}

const getSizeBarColor = (percentage) => {
  if (percentage > 50) return 'bg-red-500'
  if (percentage > 30) return 'bg-orange-500'
  if (percentage > 20) return 'bg-yellow-500'
  return 'bg-green-500'
}

// 模拟实时数据更新
let updateInterval = null

onMounted(() => {
  updateInterval = setInterval(() => {
    // 更新CPU使用率
    cpuUsage.value = Math.max(10, Math.min(95, cpuUsage.value + (Math.random() - 0.5) * 10))
    
    // 更新内存使用率
    memoryUsage.value = Math.max(20, Math.min(90, memoryUsage.value + (Math.random() - 0.5) * 5))
    
    // 更新磁盘I/O
    diskRead.value = Math.max(0, Math.min(10, diskRead.value + (Math.random() - 0.5) * 2))
    diskWrite.value = Math.max(0, Math.min(10, diskWrite.value + (Math.random() - 0.5) * 2))
    
    // 更新进程CPU使用率
    processes.value.forEach(process => {
      process.cpu = Math.max(0, Math.min(100, process.cpu + (Math.random() - 0.5) * 5))
    })
  }, 2000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
/* 添加一些自定义动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
