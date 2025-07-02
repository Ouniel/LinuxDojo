<template>
  <div class="h-full bg-gray-900 text-white overflow-hidden">
    <!-- grep 命令可视化 -->
    <div v-if="command.startsWith('grep')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-yellow-600 to-orange-600 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">🔍</span>
            <div>
              <h2 class="text-xl font-bold">文本搜索器</h2>
              <p class="text-yellow-100 text-sm">强大的模式匹配与文本过滤</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-yellow-100">匹配行数</div>
            <div class="text-2xl font-bold">{{ matchingLines.length }}</div>
          </div>
        </div>
      </div>

      <!-- 搜索参数面板 -->
      <div class="p-4 bg-gray-800/50 border-b border-gray-700">
        <div class="grid grid-cols-4 gap-4">
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-yellow-400 text-sm font-semibold">搜索模式</div>
            <div class="text-white font-mono">{{ searchPattern }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-blue-400 text-sm font-semibold">目标文件</div>
            <div class="text-white">{{ targetFile }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-green-400 text-sm font-semibold">匹配方式</div>
            <div class="text-white">{{ matchMode }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-purple-400 text-sm font-semibold">输出格式</div>
            <div class="text-white">{{ outputFormat }}</div>
          </div>
        </div>
      </div>

      <!-- 搜索结果展示 -->
      <div class="flex-1 p-4 overflow-hidden">
        <div class="grid grid-cols-2 gap-4 h-full">
          <!-- 原始文本 -->
          <div class="bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 class="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
              <span class="text-xl mr-2">📄</span>
              原始文本
            </h3>
            <div class="font-mono text-sm space-y-1">
              <div 
                v-for="(line, index) in originalLines" 
                :key="index"
                class="flex items-start space-x-3 py-1 px-2 rounded hover:bg-gray-700/30 transition-colors"
                :class="{ 'bg-yellow-500/20 border-l-4 border-yellow-500': line.isMatch }"
              >
                <span class="text-gray-500 text-xs w-8 flex-shrink-0 text-right">{{ index + 1 }}</span>
                <span class="flex-1" v-html="line.highlightedText || line.text"></span>
              </div>
            </div>
          </div>

          <!-- 匹配结果 -->
          <div class="bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 class="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
              <span class="text-xl mr-2">✨</span>
              匹配结果
            </h3>
            <div class="space-y-2">
              <div 
                v-for="(match, index) in matchingLines" 
                :key="index"
                class="bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700 transition-colors"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-yellow-400 font-mono text-sm">Line {{ match.lineNumber }}</span>
                  <span class="text-green-400 text-xs">{{ match.matchCount }} 个匹配</span>
                </div>
                <div class="font-mono text-sm text-gray-200" v-html="match.highlightedText"></div>
                <div class="mt-2 flex flex-wrap gap-1">
                  <span 
                    v-for="(matchedWord, idx) in match.matches" 
                    :key="idx"
                    class="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs"
                  >
                    {{ matchedWord }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- awk 命令可视化 -->
    <div v-else-if="command.startsWith('awk')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">🔄</span>
          <div>
            <h2 class="text-xl font-bold">AWK 文本处理器</h2>
            <p class="text-purple-100 text-sm">强大的文本分析和处理工具</p>
          </div>
        </div>
      </div>

      <!-- AWK 脚本信息 -->
      <div class="p-4 bg-gray-800/50 border-b border-gray-700">
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-purple-400 text-sm font-semibold">AWK 脚本</div>
            <div class="text-white font-mono text-sm">{{ awkScript }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-blue-400 text-sm font-semibold">字段分隔符</div>
            <div class="text-white font-mono">{{ fieldSeparator }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-green-400 text-sm font-semibold">处理行数</div>
            <div class="text-white">{{ processedLines.length }}</div>
          </div>
        </div>
      </div>

      <!-- AWK 处理结果 -->
      <div class="flex-1 p-4 overflow-hidden">
        <div class="grid grid-cols-2 gap-4 h-full">
          <!-- 输入数据 -->
          <div class="bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 class="text-lg font-semibold text-cyan-400 mb-3">输入数据</h3>
            <div class="font-mono text-sm">
              <table class="w-full">
                <thead class="bg-gray-700 sticky top-0">
                  <tr>
                    <th class="text-left p-2 text-purple-400">#</th>
                    <th class="text-left p-2 text-purple-400">NF</th>
                    <th class="text-left p-2 text-purple-400">原始行</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(line, index) in inputData" 
                    :key="index"
                    class="border-b border-gray-700 hover:bg-gray-700/30"
                  >
                    <td class="p-2 text-gray-400">{{ index + 1 }}</td>
                    <td class="p-2 text-blue-400">{{ line.fields.length }}</td>
                    <td class="p-2 text-gray-200">{{ line.text }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 处理结果 -->
          <div class="bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 class="text-lg font-semibold text-cyan-400 mb-3">处理结果</h3>
            <div class="space-y-2">
              <div 
                v-for="(result, index) in processedLines" 
                :key="index"
                class="bg-gray-700/50 rounded-lg p-3"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-purple-400 text-sm">记录 {{ index + 1 }}</span>
                  <span class="text-green-400 text-xs">{{ result.operation }}</span>
                </div>
                <div class="font-mono text-sm text-white">{{ result.output }}</div>
                <div class="mt-2 flex flex-wrap gap-1">
                  <span 
                    v-for="(field, idx) in result.fields" 
                    :key="idx"
                    class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                  >
                    ${{ idx + 1 }}: {{ field }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- sed 命令可视化 -->
    <div v-else-if="command.startsWith('sed')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-red-600 to-pink-600 p-4">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">✏️</span>
          <div>
            <h2 class="text-xl font-bold">SED 流编辑器</h2>
            <p class="text-red-100 text-sm">强大的文本替换和编辑工具</p>
          </div>
        </div>
      </div>

      <!-- SED 操作信息 -->
      <div class="p-4 bg-gray-800/50 border-b border-gray-700">
        <div class="grid grid-cols-4 gap-4">
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-red-400 text-sm font-semibold">操作类型</div>
            <div class="text-white">{{ sedOperation }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-blue-400 text-sm font-semibold">搜索模式</div>
            <div class="text-white font-mono">{{ sedPattern }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-green-400 text-sm font-semibold">替换内容</div>
            <div class="text-white font-mono">{{ sedReplacement }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-purple-400 text-sm font-semibold">修改行数</div>
            <div class="text-white">{{ modifiedLines.length }}</div>
          </div>
        </div>
      </div>

      <!-- SED 处理对比 -->
      <div class="flex-1 p-4 overflow-hidden">
        <div class="grid grid-cols-2 gap-4 h-full">
          <!-- 修改前 -->
          <div class="bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 class="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
              <span class="text-xl mr-2">📄</span>
              修改前
            </h3>
            <div class="font-mono text-sm space-y-1">
              <div 
                v-for="(line, index) in originalText" 
                :key="index"
                class="flex items-start space-x-3 py-1 px-2 rounded hover:bg-gray-700/30 transition-colors"
                :class="{ 'bg-red-500/20 border-l-4 border-red-500': line.willBeModified }"
              >
                <span class="text-gray-500 text-xs w-8 flex-shrink-0 text-right">{{ index + 1 }}</span>
                <span class="flex-1" v-html="line.highlightedText || line.text"></span>
              </div>
            </div>
          </div>

          <!-- 修改后 -->
          <div class="bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 class="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
              <span class="text-xl mr-2">✨</span>
              修改后
            </h3>
            <div class="font-mono text-sm space-y-1">
              <div 
                v-for="(line, index) in modifiedText" 
                :key="index"
                class="flex items-start space-x-3 py-1 px-2 rounded hover:bg-gray-700/30 transition-colors"
                :class="{ 'bg-green-500/20 border-l-4 border-green-500': line.wasModified }"
              >
                <span class="text-gray-500 text-xs w-8 flex-shrink-0 text-right">{{ index + 1 }}</span>
                <span class="flex-1" v-html="line.highlightedText || line.text"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- cat/head/tail 命令可视化 -->
    <div v-else-if="['cat', 'head', 'tail'].some(cmd => command.startsWith(cmd))" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-teal-600 to-cyan-600 p-4">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">📖</span>
          <div>
            <h2 class="text-xl font-bold">文件内容查看器</h2>
            <p class="text-teal-100 text-sm">高效的文件内容展示和分析</p>
          </div>
        </div>
      </div>

      <!-- 文件信息 -->
      <div class="p-4 bg-gray-800/50 border-b border-gray-700">
        <div class="grid grid-cols-4 gap-4">
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-teal-400 text-sm font-semibold">文件名</div>
            <div class="text-white">{{ fileName }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-blue-400 text-sm font-semibold">文件大小</div>
            <div class="text-white">{{ fileSize }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-green-400 text-sm font-semibold">总行数</div>
            <div class="text-white">{{ totalLines }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-purple-400 text-sm font-semibold">显示方式</div>
            <div class="text-white">{{ viewMode }}</div>
          </div>
        </div>
      </div>

      <!-- 文件内容展示 -->
      <div class="flex-1 p-4 overflow-hidden">
        <div class="bg-gray-800 rounded-lg p-4 h-full overflow-y-auto">
          <div class="font-mono text-sm space-y-1">
            <div 
              v-for="(line, index) in displayedContent" 
              :key="index"
              class="flex items-start space-x-3 py-1 px-2 rounded hover:bg-gray-700/30 transition-colors"
              :class="getLineClass(line)"
            >
              <span class="text-gray-500 text-xs w-12 flex-shrink-0 text-right">{{ line.number }}</span>
              <span class="flex-1 text-gray-200">{{ line.content }}</span>
              <span v-if="line.isSpecial" class="text-xs text-cyan-400">{{ line.specialType }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 默认文本处理可视化 -->
    <div v-else class="h-full flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4">📝</div>
        <h2 class="text-2xl font-bold mb-2">文本处理可视化</h2>
        <p class="text-gray-400">支持 grep、awk、sed、cat、head、tail 等文本处理命令</p>
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

// grep 相关数据
const searchPattern = ref('error')
const targetFile = ref('system.log')
const matchMode = ref('不区分大小写')
const outputFormat = ref('显示行号')

const originalLines = ref([
  { text: '[INFO] System started successfully', isMatch: false },
  { text: '[ERROR] Database connection failed', isMatch: true, highlightedText: '[<span class="bg-yellow-500 text-black">ERROR</span>] Database connection failed' },
  { text: '[INFO] Loading configuration file', isMatch: false },
  { text: '[ERROR] Invalid configuration parameter', isMatch: true, highlightedText: '[<span class="bg-yellow-500 text-black">ERROR</span>] Invalid configuration parameter' },
  { text: '[WARN] Memory usage is high', isMatch: false },
  { text: '[ERROR] Failed to connect to external API', isMatch: true, highlightedText: '[<span class="bg-yellow-500 text-black">ERROR</span>] Failed to connect to external API' }
])

const matchingLines = computed(() => {
  return originalLines.value
    .map((line, index) => ({ ...line, lineNumber: index + 1 }))
    .filter(line => line.isMatch)
    .map(line => ({
      ...line,
      matchCount: 1,
      matches: ['ERROR'],
      highlightedText: line.highlightedText
    }))
})

// awk 相关数据
const awkScript = ref('{print $1, $3}')
const fieldSeparator = ref('空格')

const inputData = ref([
  { text: 'John 25 Engineer', fields: ['John', '25', 'Engineer'] },
  { text: 'Alice 30 Manager', fields: ['Alice', '30', 'Manager'] },
  { text: 'Bob 28 Designer', fields: ['Bob', '28', 'Designer'] },
  { text: 'Carol 35 Analyst', fields: ['Carol', '35', 'Analyst'] }
])

const processedLines = computed(() => {
  return inputData.value.map((line, index) => ({
    output: `${line.fields[0]} ${line.fields[2]}`,
    operation: 'print $1, $3',
    fields: line.fields
  }))
})

// sed 相关数据
const sedOperation = ref('替换')
const sedPattern = ref('old')
const sedReplacement = ref('new')

const originalText = ref([
  { text: 'This is an old document', willBeModified: true, highlightedText: 'This is an <span class="bg-red-500 text-white">old</span> document' },
  { text: 'The old system needs updating', willBeModified: true, highlightedText: 'The <span class="bg-red-500 text-white">old</span> system needs updating' },
  { text: 'New features are coming', willBeModified: false },
  { text: 'Replace the old configuration', willBeModified: true, highlightedText: 'Replace the <span class="bg-red-500 text-white">old</span> configuration' }
])

const modifiedText = computed(() => {
  return originalText.value.map(line => ({
    text: line.text.replace(/old/g, 'new'),
    wasModified: line.willBeModified,
    highlightedText: line.willBeModified 
      ? line.text.replace(/old/g, '<span class="bg-green-500 text-white">new</span>')
      : line.text
  }))
})

const modifiedLines = computed(() => {
  return originalText.value.filter(line => line.willBeModified)
})

// cat/head/tail 相关数据
const fileName = ref('sample.txt')
const fileSize = ref('2.3KB')
const totalLines = ref(156)
const viewMode = computed(() => {
  if (props.command.startsWith('head')) return '显示前10行'
  if (props.command.startsWith('tail')) return '显示后10行'
  return '显示全部内容'
})

const displayedContent = ref([
  { number: 1, content: 'Welcome to LinuxDojo', isSpecial: true, specialType: 'header' },
  { number: 2, content: '===================', isSpecial: false },
  { number: 3, content: '', isSpecial: false },
  { number: 4, content: 'This is a sample text file for demonstration.', isSpecial: false },
  { number: 5, content: 'It contains multiple lines of text.', isSpecial: false },
  { number: 6, content: '', isSpecial: false },
  { number: 7, content: 'Features:', isSpecial: true, specialType: 'section' },
  { number: 8, content: '- Interactive learning', isSpecial: false },
  { number: 9, content: '- Visual demonstrations', isSpecial: false },
  { number: 10, content: '- Real-time feedback', isSpecial: false }
])

const getLineClass = (line) => {
  if (line.isSpecial) {
    return line.specialType === 'header' 
      ? 'bg-cyan-500/20 border-l-4 border-cyan-500'
      : 'bg-blue-500/20 border-l-4 border-blue-500'
  }
  return ''
}
</script>