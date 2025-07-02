<template>
  <div class="h-full bg-gray-900 text-white overflow-hidden">
    <!-- find 命令可视化 -->
    <div v-if="command.startsWith('find')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-green-600 to-teal-600 p-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">🔍</span>
          <div>
            <h2 class="text-xl font-bold">文件查找器</h2>
            <p class="text-green-100 text-sm">智能文件搜索与定位</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm text-green-100">找到文件</div>
          <div class="text-2xl font-bold">{{ foundFiles.length }}</div>
        </div>
      </div>

      <!-- 搜索条件展示 -->
      <div class="p-4 bg-gray-800/50 border-b border-gray-700">
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-green-400 text-sm font-semibold">搜索路径</div>
            <div class="text-white font-mono">{{ searchPath }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-blue-400 text-sm font-semibold">文件名模式</div>
            <div class="text-white font-mono">{{ namePattern }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-purple-400 text-sm font-semibold">文件类型</div>
            <div class="text-white">{{ fileTypeFilter }}</div>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div class="flex-1 p-4 overflow-hidden">
        <div class="grid grid-cols-2 gap-4 h-full">
          <!-- 树形结构 -->
          <div class="bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 class="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
              <span class="text-xl mr-2">🌳</span>
              目录结构
            </h3>
            <div class="font-mono text-sm">
              <div 
                v-for="(path, index) in directoryTree" 
                :key="index"
                class="py-1 hover:bg-gray-700/50 rounded px-2 transition-colors"
                :class="{ 'text-green-400': path.isMatch }"
              >
                <span class="text-gray-500">{{ path.indent }}</span>
                <span class="mr-2">{{ path.icon }}</span>
                <span>{{ path.name }}</span>
                <span v-if="path.size" class="text-gray-400 ml-2">({{ path.size }})</span>
              </div>
            </div>
          </div>

          <!-- 匹配文件列表 -->
          <div class="bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 class="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
              <span class="text-xl mr-2">📋</span>
              匹配结果
            </h3>
            <div class="space-y-2">
              <div 
                v-for="file in foundFiles" 
                :key="file.path"
                class="bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <span class="text-2xl">{{ file.icon }}</span>
                    <div>
                      <div class="font-semibold text-white">{{ file.name }}</div>
                      <div class="text-sm text-gray-400 font-mono">{{ file.path }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-300">{{ file.size }}</div>
                    <div class="text-xs text-gray-500">{{ file.modified }}</div>
                  </div>
                </div>
                <div class="mt-2 flex space-x-2">
                  <span class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">{{ file.type }}</span>
                  <span class="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">{{ file.permissions }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- tree 命令可视化 -->
    <div v-else-if="command.startsWith('tree')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">🌳</span>
          <div>
            <h2 class="text-xl font-bold">目录树可视化</h2>
            <p class="text-purple-100 text-sm">层次结构目录展示</p>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="p-4 bg-gray-800/50 border-b border-gray-700">
        <div class="grid grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-400">{{ treeStats.directories }}</div>
            <div class="text-sm text-gray-400">目录</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-400">{{ treeStats.files }}</div>
            <div class="text-sm text-gray-400">文件</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-400">{{ treeStats.totalSize }}</div>
            <div class="text-sm text-gray-400">总大小</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-400">{{ treeStats.maxDepth }}</div>
            <div class="text-sm text-gray-400">最大深度</div>
          </div>
        </div>
      </div>

      <!-- 目录树展示 -->
      <div class="flex-1 p-4 overflow-y-auto">
        <div class="bg-gray-800 rounded-lg p-4 h-full">
          <div class="font-mono text-sm space-y-1">
            <div 
              v-for="(node, index) in treeNodes" 
              :key="index"
              class="flex items-center hover:bg-gray-700/50 rounded px-2 py-1 transition-colors"
            >
              <span class="text-gray-500 mr-2">{{ node.connector }}</span>
              <span class="mr-2 text-lg">{{ node.icon }}</span>
              <span class="flex-1" :class="node.type === 'directory' ? 'text-cyan-400 font-semibold' : 'text-gray-300'">
                {{ node.name }}
              </span>
              <span v-if="node.size" class="text-gray-500 text-xs ml-2">{{ node.size }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ls 命令增强可视化 -->
    <div v-else-if="command.startsWith('ls')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">📁</span>
          <div>
            <h2 class="text-xl font-bold">目录内容浏览器</h2>
            <p class="text-blue-100 text-sm">增强型文件列表展示</p>
          </div>
        </div>
      </div>

      <!-- 视图切换和筛选 -->
      <div class="p-4 bg-gray-800/50 border-b border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex space-x-2">
            <button 
              v-for="view in viewModes" 
              :key="view.id"
              @click="currentView = view.id"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="currentView === view.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
            >
              {{ view.icon }} {{ view.name }}
            </button>
          </div>
          <div class="flex space-x-2">
            <select v-model="sortBy" class="bg-gray-700 text-white rounded px-3 py-2 text-sm">
              <option value="name">按名称</option>
              <option value="size">按大小</option>
              <option value="date">按日期</option>
              <option value="type">按类型</option>
            </select>
            <button 
              @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
              class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
            >
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 文件展示区 -->
      <div class="flex-1 p-4 overflow-hidden">
        <!-- 网格视图 -->
        <div v-if="currentView === 'grid'" class="grid grid-cols-6 gap-4 h-full overflow-y-auto">
          <div 
            v-for="file in sortedFiles" 
            :key="file.name"
            class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer text-center"
          >
            <div class="text-4xl mb-2">{{ file.icon }}</div>
            <div class="text-sm font-medium text-white truncate">{{ file.name }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ file.size }}</div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else-if="currentView === 'list'" class="h-full overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-700 sticky top-0">
              <tr>
                <th class="text-left p-3 text-cyan-400">名称</th>
                <th class="text-left p-3 text-cyan-400">大小</th>
                <th class="text-left p-3 text-cyan-400">类型</th>
                <th class="text-left p-3 text-cyan-400">权限</th>
                <th class="text-left p-3 text-cyan-400">修改时间</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="file in sortedFiles" 
                :key="file.name"
                class="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
              >
                <td class="p-3 flex items-center space-x-3">
                  <span class="text-xl">{{ file.icon }}</span>
                  <span class="font-medium text-white">{{ file.name }}</span>
                </td>
                <td class="p-3 text-gray-300">{{ file.size }}</td>
                <td class="p-3">
                  <span class="px-2 py-1 rounded text-xs" :class="getTypeClass(file.type)">
                    {{ file.type }}
                  </span>
                </td>
                <td class="p-3 font-mono text-gray-400">{{ file.permissions }}</td>
                <td class="p-3 text-gray-400">{{ file.modified }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 详细视图 -->
        <div v-else class="grid grid-cols-2 gap-4 h-full overflow-y-auto">
          <div 
            v-for="file in sortedFiles" 
            :key="file.name"
            class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
          >
            <div class="flex items-start space-x-4">
              <div class="text-4xl">{{ file.icon }}</div>
              <div class="flex-1">
                <h3 class="font-semibold text-white text-lg">{{ file.name }}</h3>
                <div class="mt-2 space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-400">大小:</span>
                    <span class="text-white">{{ file.size }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">类型:</span>
                    <span :class="getTypeClass(file.type)" class="px-2 py-1 rounded text-xs">{{ file.type }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">权限:</span>
                    <span class="font-mono text-gray-300">{{ file.permissions }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">修改:</span>
                    <span class="text-gray-300">{{ file.modified }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 默认文件系统可视化 -->
    <div v-else class="h-full flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4">📁</div>
        <h2 class="text-2xl font-bold mb-2">文件系统可视化</h2>
        <p class="text-gray-400">支持 find、tree、ls 等文件操作命令</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  command: {
    type: String,
    default: ''
  }
})

// 视图模式
const viewModes = [
  { id: 'grid', name: '网格', icon: '⊞' },
  { id: 'list', name: '列表', icon: '☰' },
  { id: 'detail', name: '详细', icon: '📋' }
]

const currentView = ref('grid')
const sortBy = ref('name')
const sortOrder = ref('asc')

// 搜索条件
const searchPath = ref('/home/user')
const namePattern = ref('*.js')
const fileTypeFilter = ref('文件')

// 模拟数据
const foundFiles = ref([
  { 
    name: 'app.js', 
    path: '/home/user/project/app.js', 
    size: '2.3KB', 
    type: 'JavaScript',
    permissions: 'rw-r--r--',
    modified: '2024-01-10 08:15',
    icon: '📄'
  },
  { 
    name: 'config.js', 
    path: '/home/user/project/config/config.js', 
    size: '1.1KB', 
    type: 'JavaScript',
    permissions: 'rw-r--r--',
    modified: '2024-01-09 14:30',
    icon: '⚙️'
  },
  { 
    name: 'utils.js', 
    path: '/home/user/project/lib/utils.js', 
    size: '3.7KB', 
    type: 'JavaScript',
    permissions: 'rw-r--r--',
    modified: '2024-01-08 16:45',
    icon: '🔧'
  }
])

const directoryTree = ref([
  { name: 'project', indent: '', icon: '📁', isMatch: false },
  { name: 'app.js', indent: '├── ', icon: '📄', size: '2.3KB', isMatch: true },
  { name: 'package.json', indent: '├── ', icon: '📦', size: '876B', isMatch: false },
  { name: 'config', indent: '├── ', icon: '📁', isMatch: false },
  { name: 'config.js', indent: '│   └── ', icon: '⚙️', size: '1.1KB', isMatch: true },
  { name: 'lib', indent: '└── ', icon: '📁', isMatch: false },
  { name: 'utils.js', indent: '    └── ', icon: '🔧', size: '3.7KB', isMatch: true }
])

const treeStats = ref({
  directories: 8,
  files: 24,
  totalSize: '156MB',
  maxDepth: 4
})

const treeNodes = ref([
  { name: 'project', connector: '.', icon: '📁', type: 'directory' },
  { name: 'src', connector: '├── ', icon: '📁', type: 'directory' },
  { name: 'components', connector: '│   ├── ', icon: '📁', type: 'directory' },
  { name: 'Header.vue', connector: '│   │   ├── ', icon: '🎨', type: 'file', size: '2.1KB' },
  { name: 'Footer.vue', connector: '│   │   └── ', icon: '🎨', type: 'file', size: '1.8KB' },
  { name: 'pages', connector: '│   ├── ', icon: '📁', type: 'directory' },
  { name: 'Home.vue', connector: '│   │   ├── ', icon: '🏠', type: 'file', size: '4.2KB' },
  { name: 'About.vue', connector: '│   │   └── ', icon: 'ℹ️', type: 'file', size: '1.5KB' },
  { name: 'main.js', connector: '│   └── ', icon: '📄', type: 'file', size: '890B' },
  { name: 'public', connector: '├── ', icon: '📁', type: 'directory' },
  { name: 'index.html', connector: '│   └── ', icon: '🌐', type: 'file', size: '512B' },
  { name: 'package.json', connector: '└── ', icon: '📦', type: 'file', size: '1.2KB' }
])

const files = ref([
  { name: 'src', icon: '📁', size: '-', type: '目录', permissions: 'drwxr-xr-x', modified: '2024-01-10 08:15' },
  { name: 'public', icon: '📁', size: '-', type: '目录', permissions: 'drwxr-xr-x', modified: '2024-01-09 14:30' },
  { name: 'package.json', icon: '📦', size: '1.2KB', type: 'JSON', permissions: '-rw-r--r--', modified: '2024-01-08 16:45' },
  { name: 'README.md', icon: '📝', size: '2.8KB', type: 'Markdown', permissions: '-rw-r--r--', modified: '2024-01-07 10:20' },
  { name: 'vite.config.js', icon: '⚙️', size: '456B', type: 'JavaScript', permissions: '-rw-r--r--', modified: '2024-01-06 15:30' },
  { name: '.gitignore', icon: '🙈', size: '234B', type: '隐藏文件', permissions: '-rw-r--r--', modified: '2024-01-05 09:15' }
])

const sortedFiles = computed(() => {
  const sorted = [...files.value].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy.value) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'size':
        const sizeA = a.size === '-' ? 0 : parseFloat(a.size)
        const sizeB = b.size === '-' ? 0 : parseFloat(b.size)
        comparison = sizeA - sizeB
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
      case 'date':
        comparison = new Date(a.modified) - new Date(b.modified)
        break
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
  
  return sorted
})

const getTypeClass = (type) => {
  const typeClasses = {
    '目录': 'bg-blue-500/20 text-blue-400',
    'JavaScript': 'bg-yellow-500/20 text-yellow-400',
    'JSON': 'bg-green-500/20 text-green-400',
    'Markdown': 'bg-purple-500/20 text-purple-400',
    '隐藏文件': 'bg-gray-500/20 text-gray-400'
  }
  return typeClasses[type] || 'bg-gray-500/20 text-gray-400'
}
</script>