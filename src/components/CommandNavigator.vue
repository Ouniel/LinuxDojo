<template>
  <div class="h-full flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700/50 backdrop-blur-sm">
    <!-- 标题区域 - 增加间距和视觉效果 -->
    <div class="p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
      <div class="flex items-center space-x-3 mb-4">
        <div class="text-2xl">🐧</div>
        <div>
          <h2 class="text-xl font-bold text-blue-400">LinuxDojo</h2>
          <p class="text-xs text-gray-400">Linux命令学习道场</p>
        </div>
      </div>
      
      <!-- 搜索框 - 改进样式 -->
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <input
          v-model="searchQuery"
          placeholder="搜索命令..."
          class="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 快速过滤标签 -->
    <div class="p-4 border-b border-gray-700/50">
      <div class="flex flex-wrap gap-2">
        <button 
          @click="setDifficultyFilter('beginner')"
          class="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30 hover:bg-green-500/30 transition-colors"
        >
          🎯 初级
        </button>
        <button 
          @click="setDifficultyFilter('intermediate')"
          class="px-3 py-1.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
        >
          ⚡ 中级
        </button>
        <button 
          @click="setDifficultyFilter('advanced')"
          class="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-full border border-red-500/30 hover:bg-red-500/30 transition-colors"
        >
          🔥 高级
        </button>
      </div>
    </div>

    <!-- 学习进度 - 简化但保持美观 -->
    <div class="p-4 border-b border-gray-700/50">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-300">学习进度</h3>
        <span class="text-xs text-gray-400">{{ learnedCommands }}/{{ totalCommands }}</span>
      </div>
      <div class="w-full bg-gray-700/50 rounded-full h-2.5">
        <div 
          class="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full transition-all duration-500 shadow-lg"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <div class="text-xs text-center text-gray-400 mt-2">
        {{ progressPercentage }}% 完成
      </div>
    </div>

    <!-- 命令分类和列表 - 重构为可展开的树形结构 -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-4">
        <h3 class="text-sm font-semibold text-gray-300 mb-3">📂 命令分类</h3>
        
        <!-- 分类和命令的树形结构 -->
        <div class="space-y-2">
          <div
            v-for="category in categories"
            :key="category.id"
            :data-category-id="category.id"
            class="border border-gray-600/30 rounded-xl overflow-hidden"
          >
            <!-- 分类标题 - 可点击展开/收起 -->
            <div
              @click="toggleCategory(category.id)"
              :class="[
                'group flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200',
                expandedCategories.includes(category.id) 
                  ? 'bg-blue-600/20 text-blue-400' 
                  : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
              ]"
            >
              <div class="flex items-center space-x-3">
                <!-- 展开/收起箭头 -->
                <svg 
                  :class="[
                    'w-4 h-4 transition-transform duration-200',
                    expandedCategories.includes(category.id) ? 'rotate-90' : ''
                  ]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
                <span class="text-lg transition-transform group-hover:scale-110">{{ category.icon }}</span>
                <span class="text-sm font-medium">{{ category.name }}</span>
              </div>
              <span :class="[
                'text-xs px-2.5 py-1 rounded-full font-medium',
                expandedCategories.includes(category.id) 
                  ? 'bg-blue-500/30 text-blue-300' 
                  : 'bg-gray-600/50 text-gray-400 group-hover:bg-gray-500/50'
              ]">
                {{ category.count }}
              </span>
            </div>
            
            <!-- 该分类下的命令列表 - 可展开收起 -->
            <div 
              v-if="expandedCategories.includes(category.id)"
              class="bg-gray-800/30 border-t border-gray-600/30"
            >
              <div class="max-h-80 overflow-y-auto">
                <div
                  v-for="command in getCommandsByCategory(category.id)"
                  :key="command.id"
                  @click="handleCommandSelect(command.id)"
                  :class="[
                    'group px-6 py-3 cursor-pointer transition-all duration-200 border-b border-gray-700/20 last:border-b-0',
                    selectedCommand === command.id
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'hover:bg-gray-700/40 text-gray-300 hover:text-white'
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <span class="text-sm transition-transform group-hover:scale-110">{{ command.icon }}</span>
                      <div>
                        <h4 class="font-mono font-semibold text-green-400 group-hover:text-green-300 transition-colors">
                          {{ command.name }}
                        </h4>
                        <p class="text-xs text-gray-400 mt-1 line-clamp-1">
                          {{ command.description }}
                        </p>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                      <!-- 热门标识 -->
                      <span 
                        v-if="command.isHot"
                        class="text-xs bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30 font-medium"
                      >
                        🔥
                      </span>
                      
                      <!-- 参数数量 -->
                      <span class="text-xs text-gray-500 flex items-center space-x-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{{ (command.parameters?.length || command.options?.length || 0) }}</span>
                      </span>
                      
                      <!-- 难度 -->
                      <span :class="[
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        command.difficulty <= 2 ? 'bg-green-500/20 text-green-400' :
                        command.difficulty <= 3 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      ]">
                        {{ command.difficulty <= 2 ? '初级' : command.difficulty <= 3 ? '中级' : '高级' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 搜索提示 -->
        <div v-if="searchQuery && searchResults.length > 0" class="mt-4">
          <div class="p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
            <div class="flex items-center space-x-2 text-green-400">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-xs">已自动定位到"{{ searchResults[0].command.name }}"命令（{{ searchResults[0].categoryName }}分类）</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div 
          v-if="searchQuery && searchResults.length === 0" 
          class="text-center py-8 text-gray-400 mt-4"
        >
          <div class="text-4xl mb-3 opacity-50">🔍</div>
          <p class="text-sm font-medium mb-2">未找到匹配的命令</p>
          <p class="text-xs">尝试修改搜索条件</p>
          <button 
            @click="clearSearch"
            class="mt-3 px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-600/30 text-xs"
          >
            清除搜索
          </button>
        </div>
      </div>
    </div>

    <!-- 底部信息 - 改进布局 -->
    <div class="p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="text-center">
          <div class="text-lg">⭐</div>
          <div class="text-xs text-gray-400">收藏夹</div>
          <div class="text-sm font-bold text-yellow-400">{{ favoriteCommands.length }}</div>
        </div>
        <div class="text-center">
          <div class="text-lg">📚</div>
          <div class="text-xs text-gray-400">最近使用</div>
          <div class="text-sm font-bold text-green-400">{{ recentCommands.length }}</div>
        </div>
      </div>
      
      <!-- 随机命令按钮 - 改进样式 -->
      <button
        @click="selectRandomCommand"
        class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        🎲 随机探索命令
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUIStore } from '../stores/ui'

// Props
const props = defineProps({
  selectedCommand: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['command-selected'])

// Store
const uiStore = useUIStore()

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('all')
const favoriteCommands = ref([])
const recentCommands = ref([])
const learnedCommands = ref(3)
const expandedCategories = ref(['file-operations']) // 默认展开文件操作分类

// 计算属性
const categories = computed(() => {
  // 动态计算每个分类的命令数量
  const categoriesWithCount = uiStore.categories.map(category => {
    const count = category.id === 'all' 
      ? uiStore.commands.length 
      : uiStore.commands.filter(cmd => cmd.category === category.id).length
    
    return {
      ...category,
      count
    }
  })
  
  return categoriesWithCount
})

const filteredCommands = computed(() => {
  let commands = uiStore.commands
  
  // 分类过滤
  if (selectedCategory.value !== 'all') {
    commands = commands.filter(cmd => cmd.category === selectedCategory.value)
  }
  
  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    commands = commands.filter(cmd =>
      cmd.name.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query)
    )
  }
  
  return commands
})

// 新增：搜索结果（包含分类信息）
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) {
    return []
  }
  
  const query = searchQuery.value.toLowerCase()
  const results = []
  
  uiStore.commands.forEach(command => {
    if (command.name.toLowerCase().includes(query) ||
        command.description.toLowerCase().includes(query)) {
      
      // 找到命令所属的分类
      const category = uiStore.categories.find(cat => cat.id === command.category)
      
      results.push({
        command: command,
        categoryId: command.category,
        categoryName: category ? category.name : '未知分类'
      })
    }
  })
  
  return results
})

const totalCommands = computed(() => uiStore.commands.length)

const progressPercentage = computed(() => {
  return totalCommands.value > 0 ? Math.round((learnedCommands.value / totalCommands.value) * 100) : 0
})

// 方法
const handleCommandSelect = (commandId) => {
  console.log('CommandNavigator: 选择命令ID:', commandId)
  emit('command-selected', commandId)
}

// 新增：处理搜索结果点击
const handleSearchResultClick = (searchResult) => {
  console.log('搜索结果点击:', searchResult)
  
  // 1. 清除搜索查询以隐藏搜索结果
  searchQuery.value = ''
  
  // 2. 自动展开对应的分类
  if (!expandedCategories.value.includes(searchResult.categoryId)) {
    expandedCategories.value.push(searchResult.categoryId)
  }
  
  // 3. 选择该命令
  handleCommandSelect(searchResult.command.id)
  
  // 4. 可选：滚动到对应分类（如果需要的话）
  setTimeout(() => {
    const categoryElement = document.querySelector(`[data-category-id="${searchResult.categoryId}"]`)
    if (categoryElement) {
      categoryElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, 100)
}

const handleCategorySelect = (categoryId) => {
  selectedCategory.value = categoryId
}

const handleSearch = () => {
  console.log('搜索触发:', searchQuery.value, '搜索结果数量:', searchResults.value.length)
  
  // 如果有搜索结果，自动展开第一个结果所属的分类并选中该命令
  if (searchQuery.value.trim() && searchResults.value.length > 0) {
    const firstResult = searchResults.value[0]
    console.log('自动定位到:', firstResult.command.name, '分类:', firstResult.categoryName)
    
    // 自动展开对应的分类
    if (!expandedCategories.value.includes(firstResult.categoryId)) {
      expandedCategories.value.push(firstResult.categoryId)
    }
    
    // 自动选中第一个匹配的命令
    handleCommandSelect(firstResult.command.id)
    
    // 可选：滚动到对应分类
    setTimeout(() => {
      const categoryElement = document.querySelector(`[data-category-id="${firstResult.categoryId}"]`)
      if (categoryElement) {
        categoryElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 100)
  }
}

const selectRandomCommand = () => {
  const commands = filteredCommands.value
  if (commands.length > 0) {
    const randomIndex = Math.floor(Math.random() * commands.length)
    const randomCommand = commands[randomIndex]
    handleCommandSelect(randomCommand.id)
  }
}

const setDifficultyFilter = (level) => {
  // 根据难度级别设置过滤
  searchQuery.value = ''
  if (level === 'beginner') {
    // 显示难度1-2的命令
    selectedCategory.value = 'all'
  } else if (level === 'intermediate') {
    // 显示难度3的命令
    selectedCategory.value = 'all'
  } else if (level === 'advanced') {
    // 显示难度4-5的命令
    selectedCategory.value = 'all'
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = 'all'
}

const clearSearch = () => {
  searchQuery.value = ''
}

// 切换分类展开/收起状态
const toggleCategory = (categoryId) => {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
}

// 获取指定分类下的命令
const getCommandsByCategory = (categoryId) => {
  if (categoryId === 'all') {
    return uiStore.commands
  }
  return uiStore.commands.filter(cmd => cmd.category === categoryId)
}

// 组件挂载时设置默认选择
onMounted(() => {
  if (!props.selectedCommand && uiStore.commands.length > 0) {
    // 默认选择ls命令
    const lsCommand = uiStore.commands.find(cmd => cmd.name === 'ls')
    if (lsCommand) {
      handleCommandSelect(lsCommand.id)
    }
  }
})
</script>

<style scoped>
/* 限制文本为单行并显示省略号 */
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style> 