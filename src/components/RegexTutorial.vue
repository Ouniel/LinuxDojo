<template>
  <div class="regex-tutorial bg-gray-900 text-white p-6 rounded-lg">
    <div class="flex items-center space-x-3 mb-6">
      <span class="text-3xl">🔍</span>
      <div>
        <h2 class="text-2xl font-bold text-cyan-400">正则表达式专项教学</h2>
        <p class="text-gray-300">可视化学习正则表达式的核心概念和应用</p>
      </div>
    </div>

    <!-- 学习模块选择 -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-yellow-400 mb-3">📚 学习模块</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          @click="setModule('basics')"
          :class="['p-4 rounded-lg transition-all border-2', 
                   currentModule === 'basics' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600']"
        >
          <div class="text-2xl mb-2">🔤</div>
          <div class="text-sm font-semibold">基础语法</div>
        </button>
        <button 
          @click="setModule('charclass')"
          :class="['p-4 rounded-lg transition-all border-2', 
                   currentModule === 'charclass' ? 'bg-green-600 border-green-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600']"
        >
          <div class="text-2xl mb-2">📝</div>
          <div class="text-sm font-semibold">字符类</div>
        </button>
        <button 
          @click="setModule('quantifiers')"
          :class="['p-4 rounded-lg transition-all border-2', 
                   currentModule === 'quantifiers' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600']"
        >
          <div class="text-2xl mb-2">🔢</div>
          <div class="text-sm font-semibold">量词</div>
        </button>
        <button 
          @click="setModule('groups')"
          :class="['p-4 rounded-lg transition-all border-2', 
                   currentModule === 'groups' ? 'bg-red-600 border-red-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600']"
        >
          <div class="text-2xl mb-2">🔗</div>
          <div class="text-sm font-semibold">分组</div>
        </button>
      </div>
    </div>

    <!-- 基础语法模块 -->
    <div v-if="currentModule === 'basics'" class="space-y-6">
      <div class="bg-gray-800 rounded-lg p-6">
        <h4 class="text-lg font-semibold text-cyan-400 mb-4">🔤 基础语法</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="concept-card">
              <div class="concept-title">字面量匹配</div>
              <div class="concept-regex">hello</div>
              <div class="concept-desc">匹配字符串 "hello"</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  <span class="match-highlight">hello</span> world, say <span class="match-highlight">hello</span>
                </div>
              </div>
            </div>
            
            <div class="concept-card">
              <div class="concept-title">转义字符</div>
              <div class="concept-regex">\.</div>
              <div class="concept-desc">匹配字面量点号</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  file<span class="match-highlight">.</span>txt and data<span class="match-highlight">.</span>json
                </div>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="concept-card">
              <div class="concept-title">任意字符</div>
              <div class="concept-regex">h.llo</div>
              <div class="concept-desc">点号匹配任意单个字符</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  <span class="match-highlight">hello</span>, <span class="match-highlight">hallo</span>, <span class="match-highlight">hillo</span>
                </div>
              </div>
            </div>
            
            <div class="concept-card">
              <div class="concept-title">锚点</div>
              <div class="concept-regex">^start | end$</div>
              <div class="concept-desc">行首和行尾匹配</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  <span class="match-highlight">start</span> of line<br>
                  middle content<br>
                  line <span class="match-highlight">end</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 字符类模块 -->
    <div v-if="currentModule === 'charclass'" class="space-y-6">
      <div class="bg-gray-800 rounded-lg p-6">
        <h4 class="text-lg font-semibold text-cyan-400 mb-4">📝 字符类</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="concept-card">
              <div class="concept-title">字符范围</div>
              <div class="concept-regex">[a-z]</div>
              <div class="concept-desc">匹配小写字母</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  <span class="match-highlight">h</span><span class="match-highlight">e</span><span class="match-highlight">l</span><span class="match-highlight">l</span><span class="match-highlight">o</span> WORLD 123
                </div>
              </div>
            </div>
            
            <div class="concept-card">
              <div class="concept-title">数字字符</div>
              <div class="concept-regex">[0-9] 或 \d</div>
              <div class="concept-desc">匹配数字字符</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  Phone: <span class="match-highlight">1</span><span class="match-highlight">2</span><span class="match-highlight">3</span>-<span class="match-highlight">4</span><span class="match-highlight">5</span><span class="match-highlight">6</span>-<span class="match-highlight">7</span><span class="match-highlight">8</span><span class="match-highlight">9</span><span class="match-highlight">0</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="concept-card">
              <div class="concept-title">单词字符</div>
              <div class="concept-regex">\w</div>
              <div class="concept-desc">匹配字母、数字、下划线</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  <span class="match-highlight">user_name</span>@<span class="match-highlight">domain</span>.<span class="match-highlight">com</span>
                </div>
              </div>
            </div>
            
            <div class="concept-card">
              <div class="concept-title">否定字符类</div>
              <div class="concept-regex">[^0-9]</div>
              <div class="concept-desc">匹配非数字字符</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  <span class="match-highlight">a</span><span class="match-highlight">b</span><span class="match-highlight">c</span>123<span class="match-highlight">d</span><span class="match-highlight">e</span><span class="match-highlight">f</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 量词模块 -->
    <div v-if="currentModule === 'quantifiers'" class="space-y-6">
      <div class="bg-gray-800 rounded-lg p-6">
        <h4 class="text-lg font-semibold text-cyan-400 mb-4">🔢 量词</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="concept-card">
              <div class="concept-title">零次或多次</div>
              <div class="concept-regex">a*</div>
              <div class="concept-desc">匹配0个或多个'a'</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  <span class="match-highlight">a</span>bc <span class="match-highlight">aa</span>bc <span class="match-highlight">aaa</span>bc <span class="match-highlight"></span>bc
                </div>
              </div>
            </div>
            
            <div class="concept-card">
              <div class="concept-title">一次或多次</div>
              <div class="concept-regex">a+</div>
              <div class="concept-desc">匹配1个或多个'a'</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  <span class="match-highlight">a</span>bc <span class="match-highlight">aa</span>bc <span class="match-highlight">aaa</span>bc bc
                </div>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="concept-card">
              <div class="concept-title">零次或一次</div>
              <div class="concept-regex">a?</div>
              <div class="concept-desc">匹配0个或1个'a'</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  <span class="match-highlight">a</span>bc <span class="match-highlight">a</span>abc <span class="match-highlight"></span>bc
                </div>
              </div>
            </div>
            
            <div class="concept-card">
              <div class="concept-title">精确次数</div>
              <div class="concept-regex">a{3}</div>
              <div class="concept-desc">匹配恰好3个'a'</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  a aa <span class="match-highlight">aaa</span> aaaa
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分组模块 -->
    <div v-if="currentModule === 'groups'" class="space-y-6">
      <div class="bg-gray-800 rounded-lg p-6">
        <h4 class="text-lg font-semibold text-cyan-400 mb-4">🔗 分组与捕获</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="concept-card">
              <div class="concept-title">捕获组</div>
              <div class="concept-regex">(ab)+</div>
              <div class="concept-desc">捕获并重复匹配"ab"</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  <span class="match-highlight">ab</span>c <span class="match-highlight">abab</span>c <span class="match-highlight">ababab</span>c
                </div>
              </div>
            </div>
            
            <div class="concept-card">
              <div class="concept-title">非捕获组</div>
              <div class="concept-regex">(?:ab)+</div>
              <div class="concept-desc">分组但不捕获</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  <span class="match-highlight">ab</span>c <span class="match-highlight">abab</span>c <span class="match-highlight">ababab</span>c
                </div>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="concept-card">
              <div class="concept-title">选择</div>
              <div class="concept-regex">cat|dog</div>
              <div class="concept-desc">匹配"cat"或"dog"</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  I have a <span class="match-highlight">cat</span> and a <span class="match-highlight">dog</span>
                </div>
              </div>
            </div>
            
            <div class="concept-card">
              <div class="concept-title">反向引用</div>
              <div class="concept-regex">(\\w+)\\s+\\1</div>
              <div class="concept-desc">匹配重复的单词</div>
              <div class="concept-example">
                <div class="text-sm text-gray-400 mb-2">示例文本:</div>
                <div class="example-text">
                  <span class="match-highlight">hello hello</span> world <span class="match-highlight">test test</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时测试区域 -->
    <div class="bg-gray-800 rounded-lg p-6">
      <h4 class="text-lg font-semibold text-cyan-400 mb-4">🧪 实时测试</h4>
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">正则表达式</label>
            <input 
              v-model="testRegex" 
              type="text" 
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono"
              placeholder="输入正则表达式，如: [a-z]+"
              @input="updateMatches"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">标志</label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input 
                  v-model="regexFlags.global" 
                  type="checkbox" 
                  class="mr-2"
                  @change="updateMatches"
                >
                <span class="text-sm">g (全局)</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="regexFlags.ignoreCase" 
                  type="checkbox" 
                  class="mr-2"
                  @change="updateMatches"
                >
                <span class="text-sm">i (忽略大小写)</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="regexFlags.multiline" 
                  type="checkbox" 
                  class="mr-2"
                  @change="updateMatches"
                >
                <span class="text-sm">m (多行)</span>
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">测试文本</label>
          <textarea 
            v-model="testText" 
            rows="4" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono"
            placeholder="输入要测试的文本"
            @input="updateMatches"
          ></textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">匹配结果</label>
          <div class="bg-gray-700 rounded-md p-3 min-h-[100px]">
            <div v-if="matchError" class="text-red-400 text-sm">
              ❌ 正则表达式错误: {{ matchError }}
            </div>
            <div v-else-if="matches.length === 0" class="text-gray-400 text-sm">
              无匹配结果
            </div>
            <div v-else class="space-y-2">
              <div class="text-sm text-green-400 mb-2">
                找到 {{ matches.length }} 个匹配:
              </div>
              <div 
                v-for="(match, index) in matches" 
                :key="index"
                class="match-result"
              >
                <span class="match-index">{{ index + 1 }}.</span>
                <span class="match-text">{{ match.text }}</span>
                <span class="match-position">(位置: {{ match.start }}-{{ match.end }})</span>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">高亮预览</label>
          <div class="bg-gray-700 rounded-md p-3 min-h-[100px] font-mono text-sm">
            <div v-html="highlightedText" class="whitespace-pre-wrap"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能分析 -->
    <div class="bg-gray-800 rounded-lg p-6">
      <h4 class="text-lg font-semibold text-cyan-400 mb-4">⚡ 性能分析</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="performance-card">
          <div class="performance-title">执行时间</div>
          <div class="performance-value">{{ performanceStats.executionTime }}ms</div>
          <div class="performance-desc">正则表达式执行耗时</div>
        </div>
        <div class="performance-card">
          <div class="performance-title">复杂度</div>
          <div class="performance-value" :class="complexityClass">{{ performanceStats.complexity }}</div>
          <div class="performance-desc">算法复杂度评估</div>
        </div>
        <div class="performance-card">
          <div class="performance-title">回溯次数</div>
          <div class="performance-value">{{ performanceStats.backtrackCount }}</div>
          <div class="performance-desc">估算回溯次数</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'

// 当前学习模块
const currentModule = ref('basics')

// 测试相关数据
const testRegex = ref('[a-z]+')
const testText = ref('Hello World! This is a test string with 123 numbers.')
const regexFlags = reactive({
  global: true,
  ignoreCase: false,
  multiline: false
})

// 匹配结果
const matches = ref([])
const matchError = ref('')

// 性能统计
const performanceStats = reactive({
  executionTime: 0,
  complexity: '低',
  backtrackCount: 0
})

// 高亮显示的文本
const highlightedText = computed(() => {
  if (!testText.value || !testRegex.value || matchError.value) {
    return testText.value
  }
  
  let result = testText.value
  let offset = 0
  
  // 按位置倒序排列，避免位置偏移
  const sortedMatches = [...matches.value].sort((a, b) => b.start - a.start)
  
  for (const match of sortedMatches) {
    const before = result.substring(0, match.start)
    const matchText = result.substring(match.start, match.end)
    const after = result.substring(match.end)
    
    result = before + `<span class="match-highlight">${matchText}</span>` + after
  }
  
  return result
})

// 复杂度样式类
const complexityClass = computed(() => {
  switch (performanceStats.complexity) {
    case '低': return 'text-green-400'
    case '中': return 'text-yellow-400'
    case '高': return 'text-red-400'
    default: return 'text-gray-400'
  }
})

// 设置学习模块
const setModule = (module) => {
  currentModule.value = module
  
  // 根据模块设置示例
  switch (module) {
    case 'basics':
      testRegex.value = 'hello'
      testText.value = 'hello world, say hello again'
      break
    case 'charclass':
      testRegex.value = '[a-z]+'
      testText.value = 'Hello World 123 test_string'
      break
    case 'quantifiers':
      testRegex.value = 'a+'
      testText.value = 'a aa aaa aaaa b bb bbb'
      break
    case 'groups':
      testRegex.value = '(\\w+)@(\\w+\\.\\w+)'
      testText.value = 'Contact: user@example.com or admin@test.org'
      break
  }
  
  updateMatches()
}

// 更新匹配结果
const updateMatches = () => {
  if (!testRegex.value || !testText.value) {
    matches.value = []
    matchError.value = ''
    return
  }
  
  try {
    const startTime = performance.now()
    
    // 构建正则表达式标志
    let flags = ''
    if (regexFlags.global) flags += 'g'
    if (regexFlags.ignoreCase) flags += 'i'
    if (regexFlags.multiline) flags += 'm'
    
    const regex = new RegExp(testRegex.value, flags)
    const newMatches = []
    
    if (regexFlags.global) {
      let match
      while ((match = regex.exec(testText.value)) !== null) {
        newMatches.push({
          text: match[0],
          start: match.index,
          end: match.index + match[0].length
        })
        
        // 防止无限循环
        if (match[0].length === 0) break
      }
    } else {
      const match = regex.exec(testText.value)
      if (match) {
        newMatches.push({
          text: match[0],
          start: match.index,
          end: match.index + match[0].length
        })
      }
    }
    
    matches.value = newMatches
    matchError.value = ''
    
    const endTime = performance.now()
    performanceStats.executionTime = Math.round((endTime - startTime) * 1000) / 1000
    
    // 分析复杂度
    analyzeComplexity()
    
  } catch (error) {
    matches.value = []
    matchError.value = error.message
    performanceStats.executionTime = 0
  }
}

// 分析正则表达式复杂度
const analyzeComplexity = () => {
  const regex = testRegex.value
  
  // 简单的复杂度分析
  let complexity = '低'
  let backtrackCount = 0
  
  // 检查可能导致回溯的模式
  if (regex.includes('*') || regex.includes('+')) {
    backtrackCount += 10
  }
  
  if (regex.includes('?')) {
    backtrackCount += 5
  }
  
  if (regex.includes('|')) {
    backtrackCount += 15
  }
  
  // 嵌套量词
  if (regex.match(/(\*|\+|\?).+(\*|\+|\?)/)) {
    backtrackCount += 20
    complexity = '中'
  }
  
  // 复杂的前瞻/后瞻
  if (regex.includes('(?=') || regex.includes('(?!') || regex.includes('(?<=') || regex.includes('(?<!')) {
    backtrackCount += 25
    complexity = '高'
  }
  
  // 大量的分组
  const groupCount = (regex.match(/\(/g) || []).length
  if (groupCount > 3) {
    backtrackCount += groupCount * 5
    complexity = '中'
  }
  
  if (backtrackCount > 50) {
    complexity = '高'
  } else if (backtrackCount > 20) {
    complexity = '中'
  }
  
  performanceStats.complexity = complexity
  performanceStats.backtrackCount = backtrackCount
}

// 监听变化
watch([testRegex, testText], updateMatches)

onMounted(() => {
  updateMatches()
})
</script>

<style scoped>
/* 概念卡片样式 */
.concept-card {
  @apply bg-gray-700 rounded-lg p-4 border border-gray-600;
}

.concept-title {
  @apply text-lg font-semibold text-yellow-400 mb-2;
}

.concept-regex {
  @apply bg-black rounded px-3 py-2 font-mono text-cyan-400 text-sm mb-2;
}

.concept-desc {
  @apply text-gray-300 text-sm mb-3;
}

.concept-example {
  @apply space-y-2;
}

.example-text {
  @apply bg-gray-800 rounded px-3 py-2 font-mono text-sm;
}

/* 匹配高亮 */
.match-highlight {
  @apply bg-yellow-500 text-black px-1 rounded;
}

/* 匹配结果样式 */
.match-result {
  @apply flex items-center space-x-2 text-sm;
}

.match-index {
  @apply text-cyan-400 font-mono;
}

.match-text {
  @apply bg-yellow-500 text-black px-2 py-1 rounded font-mono;
}

.match-position {
  @apply text-gray-400 text-xs;
}

/* 性能卡片样式 */
.performance-card {
  @apply bg-gray-700 rounded-lg p-4 text-center;
}

.performance-title {
  @apply text-sm text-gray-300 mb-2;
}

.performance-value {
  @apply text-2xl font-bold mb-1;
}

.performance-desc {
  @apply text-xs text-gray-400;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grid {
    @apply grid-cols-1;
  }
}
</style> 