<template>
  <div class="h-full flex flex-col bg-gray-800">
    <!-- 命令信息头部 -->
    <div class="p-6 border-b border-gray-700">
      <div v-if="command">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-blue-400">
            ✨ 命令构建器
          </h2>
          <div class="flex items-center space-x-2">
            <!-- 难度指示 -->
            <div class="flex items-center space-x-1">
              <span class="text-sm text-gray-400">难度:</span>
              <div class="flex">
                <span 
                  v-for="i in 5" 
                  :key="i"
                  :class="[
                    'text-sm',
                    i <= command.difficulty ? 'text-yellow-400' : 'text-gray-600'
                  ]"
                >
                  ⭐
                </span>
              </div>
            </div>
            <!-- 热门标识 -->
            <span 
              v-if="command.difficulty <= 2"
              class="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs"
            >
              🔥 热门
            </span>
          </div>
        </div>
        
        <!-- 命令基本信息 -->
        <div class="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
          <h3 class="text-xl font-mono font-bold text-green-400 mb-2">
            🔥 {{ command.name }}
          </h3>
          <p class="text-gray-300 mb-3">
            📋 {{ command.description }}
          </p>
          <div class="text-sm text-gray-400 font-mono">
            💡 用法: {{ command.usage }}
          </div>
        </div>
      </div>
      
      <!-- 无命令选择状态 -->
      <div v-else class="text-center py-8">
        <div class="text-6xl mb-4">🎯</div>
        <h3 class="text-xl text-gray-300 mb-2">选择一个命令开始</h3>
        <p class="text-gray-400">从左侧导航选择一个Linux命令来配置参数</p>
      </div>
    </div>

    <!-- 参数配置区域 -->
    <div v-if="command" class="flex-1 overflow-y-auto p-6">
      <!-- 用户输入参数区域 -->
      <div v-if="inputOptions.length > 0" class="mb-6">
        <h4 class="text-lg font-semibold text-blue-400 mb-4 flex items-center">
          <span class="mr-2">📝</span>
          参数输入
        </h4>
        <div class="space-y-4">
          <div 
            v-for="option in inputOptions" 
            :key="`input-${option.inputKey || option.flag}`"
            class="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-200 mb-1">
                  {{ option.description }}
                  <span v-if="option.required" class="text-red-400 ml-1">*</span>
                </label>
                <p class="text-xs text-gray-400 mb-2">{{ option.flag || '位置参数' }}</p>
              </div>
            </div>
            
            <!-- 文本输入框 -->
            <input 
              v-if="option.type === 'input'"
              :value="userInputs[option.inputKey] || ''"
              @input="$emit('user-input-changed', option.inputKey, $event.target.value)"
              :placeholder="option.placeholder"
              class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
            
            <!-- 数字输入框 -->
            <input 
              v-else-if="option.type === 'number'"
              type="number"
              :value="userInputs[option.inputKey] || option.default || ''"
              @input="$emit('user-input-changed', option.inputKey, $event.target.value)"
              :placeholder="option.placeholder || option.default?.toString()"
              class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
            
            <!-- 选择框 -->
            <select 
              v-else-if="option.type === 'select'"
              :value="userInputs[option.inputKey] || option.default || ''"
              @change="$emit('user-input-changed', option.inputKey, $event.target.value)"
              class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:border-blue-400"
            >
              <option value="">请选择...</option>
              <option 
                v-for="(optionValue, index) in option.options" 
                :key="optionValue"
                :value="optionValue"
              >
                {{ option.optionLabels?.[index] || optionValue }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 布尔参数选项 -->
      <div v-if="booleanOptions.length > 0">
        <h4 class="text-lg font-semibold text-blue-400 mb-4 flex items-center">
          <span class="mr-2">⚙️</span>
          选项参数
        </h4>
        
        <!-- 按组分类显示参数 -->
        <div 
          v-for="(groupOptions, groupName) in groupedBooleanOptions" 
          :key="groupName"
          class="mb-6"
        >
          <h5 class="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">
            {{ groupName }}
          </h5>
          <div class="grid gap-3">
            <div 
              v-for="option in groupOptions"
              :key="option.flag"
              class="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:bg-gray-700/70 transition-colors cursor-pointer"
              :class="{ 
                'border-blue-400 bg-blue-900/30': isParameterSelected(option),
                'hover:border-gray-500': !isParameterSelected(option)
              }"
              @click="$emit('parameter-toggled', option)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <span class="font-mono text-green-400 text-sm">{{ option.flag }}</span>
                    <span v-if="option.longFlag" class="font-mono text-green-300 text-xs">{{ option.longFlag }}</span>
                  </div>
                  <p class="text-gray-300 text-sm mt-1">{{ option.description }}</p>
                </div>
                <div class="ml-3">
                  <div 
                    class="w-5 h-5 rounded border-2 transition-colors flex items-center justify-center"
                    :class="isParameterSelected(option) ? 'border-blue-400 bg-blue-400' : 'border-gray-500'"
                  >
                    <svg v-if="isParameterSelected(option)" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 清除按钮 -->
      <div class="mt-8 pt-6 border-t border-gray-700">
        <!-- 实时生成的命令显示 -->
        <div v-if="generatedCommand" class="mb-6">
          <h4 class="text-sm font-semibold text-gray-300 mb-3 flex items-center">
            🚀 生成的命令
          </h4>
          <div class="bg-black/50 border border-gray-600 rounded-lg p-4">
            <div class="font-mono text-green-400 text-sm flex items-center">
              <span class="text-cyan-400 mr-2">$</span>
              <span>{{ generatedCommand }}</span>
            </div>
          </div>
          <div class="flex space-x-3 mt-3">
            <button
              @click="copyCommand"
              class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span>复制命令</span>
            </button>
            <button
              @click="executeCommand"
              class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>▶️</span>
              <span>模拟执行</span>
            </button>
          </div>
        </div>
        
        <button
          @click="$emit('parameters-cleared')"
          class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span>🧹</span>
          <span>清除所有参数</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  command: {
    type: Object,
    default: null
  },
  selectedParameters: {
    type: Array,
    default: () => []
  },
  userInputs: Object
})

// Emits
const emit = defineEmits(['parameter-toggled', 'user-input-changed', 'parameters-cleared', 'command-executed'])

// 计算属性
const booleanOptions = computed(() => {
  if (!props.command?.options) return []
  return props.command.options.filter(option => option.type === 'boolean')
})

const inputOptions = computed(() => {
  if (!props.command?.options) return []
  return props.command.options.filter(option => 
    option.type === 'input' || option.type === 'number' || option.type === 'select'
  )
})

const groupedBooleanOptions = computed(() => {
  const grouped = {}
  booleanOptions.value.forEach(option => {
    const group = option.group || 'other'
    if (!grouped[group]) {
      grouped[group] = []
    }
    grouped[group].push(option)
  })
  return grouped
})

const generatedCommand = computed(() => {
  if (!props.command) return ''
  
  let parts = [props.command.name]
  
  // 特殊处理grep命令的参数顺序
  if (props.command.name === 'grep') {
    // 添加布尔参数
    props.selectedParameters.forEach(param => {
      if (param.type === 'boolean') {
        parts.push(param.flag)
      }
    })
    
    // 添加搜索模式（必须参数）
    if (props.userInputs && props.userInputs.search_pattern) {
      parts.push(`"${props.userInputs.search_pattern}"`)
    }
    
    // 添加目标文件
    if (props.userInputs && props.userInputs.target_files) {
      parts.push(props.userInputs.target_files)
    }
    
    return parts.join(' ')
  }
  
  // 其他命令的通用处理
  // 添加布尔参数
  props.selectedParameters.forEach(param => {
    if (param.type === 'boolean') {
      parts.push(param.flag)
    }
  })
  
  // 添加用户输入的参数
  if (props.userInputs) {
    Object.entries(props.userInputs).forEach(([key, value]) => {
      if (value && value.trim()) {
        const option = props.command.options.find(opt => opt.inputKey === key)
        if (option) {
          if (option.type === 'input' && !option.flag) {
            // 位置参数
            parts.push(`"${value}"`)
          } else if (option.flag) {
            // 带flag的参数
            if (option.type === 'select') {
              parts.push(`${option.flag} ${value}`)
            } else if (option.type === 'input') {
              parts.push(`${option.flag} "${value}"`)
            } else if (option.type === 'number') {
              parts.push(`${option.flag} ${value}`)
            }
          }
        }
      }
    })
  }
  
  return parts.join(' ')
})

// 方法
const isParameterSelected = (parameter) => {
  return props.selectedParameters.some(p => p.flag === parameter.flag)
}

const copyCommand = async () => {
  try {
    await navigator.clipboard.writeText(generatedCommand.value)
    // 这里可以添加成功提示
    console.log('命令已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = generatedCommand.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

const executeCommand = () => {
  console.log('模拟执行命令:', generatedCommand.value)
  emit('command-executed', generatedCommand.value)
}
</script>

<style scoped>
/* 样式已在Tailwind类中定义 */
</style> 