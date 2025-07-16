<template>
  <div class="h-full bg-gray-900 text-white overflow-hidden">
    <!-- grep 命令可视化 -->
    <div v-if="command.startsWith('grep')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-yellow-600 to-orange-600 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-2xl animate-pulse">🔍</span>
            <div>
              <h2 class="text-xl font-bold">文本搜索器</h2>
              <p class="text-yellow-100 text-sm">强大的模式匹配与文本过滤</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-yellow-100">匹配行数</div>
            <div class="text-2xl font-bold transition-all duration-500 transform" 
                 :class="{ 'scale-110 text-green-400': isSearching }">
              {{ matchingLines.length }}
            </div>
          </div>
        </div>
      </div>

      <!-- 正则表达式控制面板 -->
      <div class="p-4 bg-gray-800/50 border-b border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">🔍 搜索模式</label>
            <input 
              v-model="searchPattern" 
              type="text" 
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono"
              placeholder="输入正则表达式，如: [Ee]rror|[Ww]arning"
              @input="analyzePattern"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">⚙️ 匹配选项</label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input 
                  v-model="grepOptions.ignoreCase" 
                  type="checkbox" 
                  class="mr-2"
                  @change="updateSearch"
                >
                <span class="text-sm">-i 忽略大小写</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="grepOptions.extended" 
                  type="checkbox" 
                  class="mr-2"
                  @change="updateSearch"
                >
                <span class="text-sm">-E 扩展正则</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- 模式分析 -->
        <div v-if="patternAnalysis.length > 0" class="mb-4 p-3 bg-gray-700/50 rounded-lg">
          <h5 class="text-sm font-semibold text-yellow-400 mb-2">📝 模式分析</h5>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="(analysis, index) in patternAnalysis" 
              :key="index"
              class="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs border border-yellow-500/50 
                     animate-fade-in-up transition-all duration-300"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <span class="font-semibold">{{ analysis.type }}:</span> {{ analysis.description }}
            </div>
          </div>
        </div>

        <!-- 搜索参数面板 -->
        <div class="grid grid-cols-4 gap-4">
          <div class="bg-gray-700/50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-700">
            <div class="text-yellow-400 text-sm font-semibold">搜索模式</div>
            <div class="text-white font-mono text-xs">{{ searchPattern || 'error' }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-700">
            <div class="text-blue-400 text-sm font-semibold">目标文件</div>
            <div class="text-white">{{ targetFile }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-700">
            <div class="text-green-400 text-sm font-semibold">匹配方式</div>
            <div class="text-white">{{ grepOptions.ignoreCase ? '忽略大小写' : '区分大小写' }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-700">
            <div class="text-purple-400 text-sm font-semibold">正则类型</div>
            <div class="text-white">{{ grepOptions.extended ? '扩展正则' : '基础正则' }}</div>
          </div>
        </div>
        
        <!-- 搜索选项动态提示 -->
        <div v-if="searchOptions.length > 0" class="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <div class="text-blue-300 text-sm font-semibold mb-2">🔧 当前搜索选项：</div>
          <div class="flex flex-wrap gap-2">
            <span v-for="option in searchOptions" :key="option"
                  class="px-3 py-1 bg-blue-600/30 text-blue-200 rounded-full text-xs border border-blue-500/50 
                         animate-fade-in-up transition-all duration-300 hover:bg-blue-600/50">
              {{ option }}
            </span>
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
              <span v-if="isSearching" class="ml-2 text-xs text-yellow-400 animate-pulse">搜索中...</span>
            </h3>
            <div class="font-mono text-sm space-y-1">
              <div 
                v-for="(line, index) in originalLines" 
                :key="index"
                class="flex items-start space-x-3 py-1 px-2 rounded transition-all duration-500"
                :class="{ 
                  'bg-yellow-500/20 border-l-4 border-yellow-500 transform translate-x-1': line.isMatch && !isSearching,
                  'animate-scan-line': isSearching && scanningLineIndex === index,
                  'hover:bg-gray-700/30': !line.isMatch
                }"
              >
                <span class="text-gray-500 text-xs w-8 flex-shrink-0 text-right">{{ index + 1 }}</span>
                <span class="flex-1 transition-all duration-300" 
                      :class="{ 'text-yellow-200': line.isMatch }"
                      v-html="line.highlightedText || line.text"></span>
                <span v-if="line.isMatch" class="text-green-400 text-xs animate-bounce">✓</span>
              </div>
            </div>
          </div>

          <!-- 匹配结果 -->
          <div class="bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 class="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
              <span class="text-xl mr-2">✨</span>
              匹配结果
              <span class="ml-2 text-xs text-green-400">{{ matchingLines.length }} 项</span>
            </h3>
            <div class="space-y-2">
              <div 
                v-for="(match, index) in matchingLines" 
                :key="index"
                class="bg-gray-700/50 rounded-lg p-3 transition-all duration-500 hover:bg-gray-700 
                       animate-slide-in-right transform hover:scale-105"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-yellow-400 font-mono text-sm flex items-center">
                    <span class="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
                    Line {{ match.lineNumber }}
                  </span>
                  <span class="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded-full">
                    {{ match.matchCount }} 个匹配
                  </span>
                </div>
                <div class="font-mono text-sm text-gray-200 mb-2" v-html="match.highlightedText"></div>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="(matchedWord, idx) in match.matches" 
                    :key="idx"
                    class="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs border border-yellow-500/50
                           animate-glow transition-all duration-300 hover:bg-yellow-500/30"
                    :style="{ animationDelay: `${idx * 0.2}s` }"
                  >
                    {{ matchedWord }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 回溯机制可视化 -->
      <div class="p-4">
        <div class="bg-gray-800 rounded-lg p-6">
          <h4 class="text-lg font-semibold text-cyan-400 mb-4">🔄 回溯机制演示</h4>
          <div class="backtrack-container">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div class="text-gray-300 text-sm mb-2">测试文本:</div>
                <div class="font-mono bg-gray-700 p-2 rounded text-white">{{ backtrackExample.text }}</div>
              </div>
              <div>
                <div class="text-gray-300 text-sm mb-2">匹配模式:</div>
                <div class="font-mono bg-gray-700 p-2 rounded text-cyan-400">{{ backtrackExample.pattern }}</div>
              </div>
            </div>
            
            <div v-if="backtrackSteps.length > 0" class="backtrack-steps space-y-3">
              <div 
                v-for="(step, index) in backtrackSteps" 
                :key="index"
                class="backtrack-step p-3 rounded-lg transition-all duration-300"
                :class="{ 
                  'bg-yellow-500/20 border border-yellow-500/50': currentBacktrackStep === index && backtrackAnimating,
                  'bg-gray-700/50': currentBacktrackStep !== index || !backtrackAnimating 
                }"
              >
                <div class="flex items-center space-x-3 mb-2">
                  <div class="step-number w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {{ index + 1 }}
                  </div>
                  <div class="step-description text-gray-300 text-sm">{{ step.description }}</div>
                </div>
                <div class="step-visualization ml-9">
                  <span 
                    v-for="(char, charIndex) in backtrackExample.text" 
                    :key="charIndex"
                    class="char inline-block w-6 h-6 text-center text-xs border rounded mr-1 transition-all duration-300"
                    :class="{
                      'bg-yellow-500 text-black border-yellow-600': step.tryingPosition === charIndex,
                      'bg-green-500 text-white border-green-600': step.matchedPositions.includes(charIndex),
                      'bg-red-500 text-white border-red-600': step.failedPositions.includes(charIndex),
                      'bg-gray-600 text-gray-300 border-gray-500': !step.matchedPositions.includes(charIndex) && !step.failedPositions.includes(charIndex) && step.tryingPosition !== charIndex
                    }"
                  >
                    {{ char }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="text-center mt-6">
              <button 
                @click="startBacktrackDemo"
                :disabled="backtrackAnimating"
                class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
              >
                <span>{{ backtrackAnimating ? '🔄' : '🚀' }}</span>
                <span>{{ backtrackAnimating ? '演示中...' : '开始回溯演示' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- awk 命令可视化 -->
    <div v-else-if="command.startsWith('awk')" class="h-full flex flex-col">
      <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
        <div class="flex items-center space-x-3">
          <span class="text-2xl animate-bounce">🔄</span>
          <div>
            <h2 class="text-xl font-bold">AWK 文本处理器</h2>
            <p class="text-purple-100 text-sm">强大的文本分析和处理工具</p>
          </div>
          <div v-if="isProcessing" class="ml-auto">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style="animation-delay: 0s"></div>
              <div class="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- AWK 脚本信息 -->
      <div class="p-4 bg-gray-800/50 border-b border-gray-700">
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-gray-700/50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-700">
            <div class="text-purple-400 text-sm font-semibold">AWK 脚本</div>
            <div class="text-white font-mono text-sm">{{ awkScript }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-700">
            <div class="text-blue-400 text-sm font-semibold">字段分隔符</div>
            <div class="text-white font-mono">{{ fieldSeparator }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-700">
            <div class="text-green-400 text-sm font-semibold">处理行数</div>
            <div class="text-white transition-all duration-500" 
                 :class="{ 'text-green-400 scale-110': isProcessing }">
              {{ processedLines.length }}
            </div>
          </div>
        </div>

        <!-- AWK操作步骤指示器 -->
        <div class="mt-4 p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg">
          <div class="text-purple-300 text-sm font-semibold mb-2">🔄 处理步骤：</div>
          <div class="flex space-x-4">
            <div class="flex items-center space-x-2" 
                 :class="{ 'text-green-400': currentStep >= 1, 'text-gray-500': currentStep < 1 }">
              <div class="w-3 h-3 rounded-full transition-all duration-300"
                   :class="{ 'bg-green-400 animate-pulse': currentStep >= 1, 'bg-gray-600': currentStep < 1 }"></div>
              <span class="text-xs">读取数据</span>
            </div>
            <div class="flex items-center space-x-2" 
                 :class="{ 'text-green-400': currentStep >= 2, 'text-gray-500': currentStep < 2 }">
              <div class="w-3 h-3 rounded-full transition-all duration-300"
                   :class="{ 'bg-green-400 animate-pulse': currentStep >= 2, 'bg-gray-600': currentStep < 2 }"></div>
              <span class="text-xs">字段分割</span>
            </div>
            <div class="flex items-center space-x-2" 
                 :class="{ 'text-green-400': currentStep >= 3, 'text-gray-500': currentStep < 3 }">
              <div class="w-3 h-3 rounded-full transition-all duration-300"
                   :class="{ 'bg-green-400 animate-pulse': currentStep >= 3, 'bg-gray-600': currentStep < 3 }"></div>
              <span class="text-xs">应用脚本</span>
            </div>
            <div class="flex items-center space-x-2" 
                 :class="{ 'text-green-400': currentStep >= 4, 'text-gray-500': currentStep < 4 }">
              <div class="w-3 h-3 rounded-full transition-all duration-300"
                   :class="{ 'bg-green-400 animate-pulse': currentStep >= 4, 'bg-gray-600': currentStep < 4 }"></div>
              <span class="text-xs">输出结果</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AWK 处理结果 -->
      <div class="flex-1 p-4 overflow-hidden">
        <div class="grid grid-cols-2 gap-4 h-full">
          <!-- 输入数据 -->
          <div class="bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 class="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
              <span class="text-xl mr-2">📊</span>
              输入数据
              <span class="ml-2 text-xs text-gray-400">{{ inputData.length }} 行</span>
            </h3>
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
                    class="border-b border-gray-700 transition-all duration-500"
                    :class="{ 
                      'bg-purple-500/20 animate-process-row': processingRowIndex === index,
                      'hover:bg-gray-700/30': processingRowIndex !== index 
                    }"
                  >
                    <td class="p-2 text-gray-400">{{ index + 1 }}</td>
                    <td class="p-2 text-blue-400 transition-all duration-300">
                      <span class="inline-flex items-center">
                        {{ line.fields.length }}
                        <span v-if="processingRowIndex === index" class="ml-2 w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
                      </span>
                    </td>
                    <td class="p-2 text-gray-200">
                      <span class="transition-all duration-300" 
                            :class="{ 'text-purple-200': processingRowIndex === index }">
                        {{ line.text }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 处理结果 -->
          <div class="bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 class="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
              <span class="text-xl mr-2">⚡</span>
              处理结果
              <span class="ml-2 text-xs text-green-400">{{ processedLines.length }} 条记录</span>
            </h3>
            <div class="space-y-2">
              <div 
                v-for="(result, index) in processedLines" 
                :key="index"
                class="bg-gray-700/50 rounded-lg p-3 transition-all duration-500
                       animate-fade-in-up hover:bg-gray-700 transform hover:scale-105"
                :style="{ animationDelay: `${index * 0.15}s` }"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-purple-400 text-sm flex items-center">
                    <span class="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
                    记录 {{ index + 1 }}
                  </span>
                  <span class="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded-full">
                    {{ result.operation }}
                  </span>
                </div>
                <div class="font-mono text-sm text-white mb-2 p-2 bg-gray-900/50 rounded border-l-2 border-purple-500">
                  {{ result.output }}
                </div>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="(field, idx) in result.fields" 
                    :key="idx"
                    class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs border border-blue-500/50
                           transition-all duration-300 hover:bg-blue-500/30 animate-field-highlight"
                    :style="{ animationDelay: `${idx * 0.1}s` }"
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">✏️ SED 命令</label>
            <input 
              v-model="sedCommand" 
              type="text" 
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white font-mono"
              placeholder="输入sed命令，如: s/old/new/g"
              @input="parseSedCommand"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">⚙️ 操作选项</label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input 
                  v-model="sedOptions.global" 
                  type="checkbox" 
                  class="mr-2"
                  @change="updateSedOperation"
                >
                <span class="text-sm">g 全局替换</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="sedOptions.ignoreCase" 
                  type="checkbox" 
                  class="mr-2"
                  @change="updateSedOperation"
                >
                <span class="text-sm">I 忽略大小写</span>
              </label>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-4">
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-red-400 text-sm font-semibold">操作类型</div>
            <div class="text-white">{{ sedOperation }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-blue-400 text-sm font-semibold">搜索模式</div>
            <div class="text-white font-mono text-xs">{{ sedPattern }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-green-400 text-sm font-semibold">替换内容</div>
            <div class="text-white font-mono text-xs">{{ sedReplacement }}</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-3">
            <div class="text-purple-400 text-sm font-semibold">修改行数</div>
            <div class="text-white">{{ modifiedLines.length }}</div>
          </div>
        </div>
      </div>

      <!-- 模式空间和保持空间可视化 -->
      <div class="p-4">
        <div class="bg-gray-800 rounded-lg p-6 mb-4">
          <h4 class="text-lg font-semibold text-cyan-400 mb-4">🔄 模式空间与保持空间</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- 当前处理行 -->
            <div class="space-container">
              <h5 class="text-sm font-semibold text-yellow-400 mb-2">📝 当前行</h5>
              <div class="space-content bg-yellow-500/20 border border-yellow-500/50 rounded p-3">
                <div class="text-sm text-gray-300 mb-1">行号: {{ currentProcessingLine + 1 }}</div>
                <div class="font-mono text-white">{{ currentLineContent }}</div>
              </div>
            </div>
            
            <!-- 模式空间 -->
            <div class="space-container">
              <h5 class="text-sm font-semibold text-blue-400 mb-2">🔵 模式空间</h5>
              <div class="space-content bg-blue-500/20 border border-blue-500/50 rounded p-3 min-h-[80px]">
                <div v-if="patternSpace" class="font-mono text-white">{{ patternSpace }}</div>
                <div v-else class="text-gray-400 text-sm italic">空</div>
              </div>
            </div>
            
            <!-- 保持空间 -->
            <div class="space-container">
              <h5 class="text-sm font-semibold text-green-400 mb-2">🟢 保持空间</h5>
              <div class="space-content bg-green-500/20 border border-green-500/50 rounded p-3 min-h-[80px]">
                <div v-if="holdSpace" class="font-mono text-white">{{ holdSpace }}</div>
                <div v-else class="text-gray-400 text-sm italic">空</div>
              </div>
            </div>
          </div>
          
          <!-- 操作步骤 -->
          <div class="mt-4">
            <h5 class="text-sm font-semibold text-purple-400 mb-2">⚙️ 处理步骤</h5>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div class="step-indicator" :class="{ 'active': sedStep >= 1 }">
                <div class="step-number">1</div>
                <div class="step-label">读取行到模式空间</div>
              </div>
              <div class="step-indicator" :class="{ 'active': sedStep >= 2 }">
                <div class="step-number">2</div>
                <div class="step-label">执行sed命令</div>
              </div>
              <div class="step-indicator" :class="{ 'active': sedStep >= 3 }">
                <div class="step-number">3</div>
                <div class="step-label">输出模式空间</div>
              </div>
              <div class="step-indicator" :class="{ 'active': sedStep >= 4 }">
                <div class="step-number">4</div>
                <div class="step-label">清空模式空间</div>
              </div>
            </div>
          </div>
          
          <div class="text-center mt-4">
            <button 
              @click="startSedAnimation"
              :disabled="sedAnimating"
              class="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>{{ sedAnimating ? '🔄' : '🚀' }}</span>
              <span>{{ sedAnimating ? '处理中...' : '开始SED处理' }}</span>
            </button>
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
                :class="{ 
                  'bg-red-500/20 border-l-4 border-red-500': line.willBeModified,
                  'bg-yellow-500/20 border-l-4 border-yellow-500': currentProcessingLine === index && sedAnimating
                }"
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
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  command: {
    type: String,
    default: ''
  }
})

// 动画状态控制
const isSearching = ref(false)
const isProcessing = ref(false)
const scanningLineIndex = ref(-1)
const processingRowIndex = ref(-1)
const currentStep = ref(0)

// grep 相关数据
const searchPattern = ref('error')
const targetFile = ref('system.log')
const matchMode = ref('不区分大小写')
const outputFormat = ref('显示行号')

// 正则表达式相关数据
const grepOptions = ref({
  ignoreCase: false,
  extended: false,
  wordMatch: false,
  invert: false
})

const patternAnalysis = ref([])
const backtrackExample = ref({
  text: 'aaaaaaaaaaaaab',
  pattern: 'a*a*a*a*a*a*a*a*a*a*a*a*a*b'
})

const backtrackSteps = ref([])
const currentBacktrackStep = ref(0)
const backtrackAnimating = ref(false)

// 动态搜索选项
const searchOptions = computed(() => {
  const options = []
  if (props.command.includes('-i')) options.push('忽略大小写')
  if (props.command.includes('-v')) options.push('反向匹配')
  if (props.command.includes('-w')) options.push('整词匹配')
  if (props.command.includes('-n')) options.push('显示行号')
  if (props.command.includes('-r')) options.push('递归搜索')
  return options
})

const originalLines = ref([
  { text: '[INFO] System started successfully', isMatch: false },
  { text: '[ERROR] Database connection failed', isMatch: true, highlightedText: '[<span class="bg-yellow-500 text-black animate-highlight">ERROR</span>] Database connection failed' },
  { text: '[INFO] Loading configuration file', isMatch: false },
  { text: '[ERROR] Invalid configuration parameter', isMatch: true, highlightedText: '[<span class="bg-yellow-500 text-black animate-highlight">ERROR</span>] Invalid configuration parameter' },
  { text: '[WARN] Memory usage is high', isMatch: false },
  { text: '[ERROR] Failed to connect to external API', isMatch: true, highlightedText: '[<span class="bg-yellow-500 text-black animate-highlight">ERROR</span>] Failed to connect to external API' }
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

// 正则表达式分析函数
const analyzePattern = () => {
  const pattern = searchPattern.value
  const analysis = []
  
  // 基本模式分析
  if (pattern.includes('[')) {
    analysis.push({ type: '字符类', description: '使用字符类匹配特定字符集' })
  }
  if (pattern.includes('*') || pattern.includes('+') || pattern.includes('?')) {
    analysis.push({ type: '量词', description: '使用量词控制匹配次数' })
  }
  if (pattern.includes('|')) {
    analysis.push({ type: '选择', description: '使用选择操作符匹配多个模式' })
  }
  if (pattern.includes('(') && pattern.includes(')')) {
    analysis.push({ type: '分组', description: '使用分组捕获匹配内容' })
  }
  if (pattern.includes('^') || pattern.includes('$')) {
    analysis.push({ type: '锚点', description: '使用锚点匹配行首或行尾' })
  }
  if (pattern.includes('\\')) {
    analysis.push({ type: '转义', description: '使用转义字符匹配特殊字符' })
  }
  
  patternAnalysis.value = analysis
}

const updateSearch = () => {
  // 更新搜索逻辑
  analyzePattern()
}

// 回溯演示函数
const startBacktrackDemo = () => {
  if (backtrackAnimating.value) return
  
  backtrackAnimating.value = true
  currentBacktrackStep.value = 0
  
  // 生成回溯步骤
  backtrackSteps.value = [
    {
      description: '开始匹配，尝试第一个 a*',
      tryingPosition: 0,
      matchedPositions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      failedPositions: []
    },
    {
      description: '第一个 a* 匹配所有 a，尝试第二个 a*',
      tryingPosition: 14,
      matchedPositions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      failedPositions: []
    },
    {
      description: '第二个 a* 无法匹配 b，开始回溯',
      tryingPosition: 14,
      matchedPositions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      failedPositions: [14]
    },
    {
      description: '回溯：第一个 a* 匹配13个a，第二个 a* 匹配1个a',
      tryingPosition: 14,
      matchedPositions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      failedPositions: []
    },
    {
      description: '继续尝试匹配剩余模式，最终找到 b',
      tryingPosition: 14,
      matchedPositions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      failedPositions: []
    }
  ]
  
  const stepInterval = setInterval(() => {
    currentBacktrackStep.value++
    if (currentBacktrackStep.value >= backtrackSteps.value.length) {
      clearInterval(stepInterval)
      backtrackAnimating.value = false
      currentBacktrackStep.value = 0
    }
  }, 1500)
}

// 动画函数
const startSearchAnimation = () => {
  isSearching.value = true
  scanningLineIndex.value = 0
  
  const scanInterval = setInterval(() => {
    scanningLineIndex.value++
    if (scanningLineIndex.value >= originalLines.value.length) {
      clearInterval(scanInterval)
      scanningLineIndex.value = -1
      isSearching.value = false
    }
  }, 200)
}

const startProcessingAnimation = () => {
  isProcessing.value = true
  currentStep.value = 0
  processingRowIndex.value = 0
  
  const stepInterval = setInterval(() => {
    currentStep.value++
    if (currentStep.value > 4) {
      currentStep.value = 1
    }
  }, 800)
  
  const rowInterval = setInterval(() => {
    processingRowIndex.value++
    if (processingRowIndex.value >= inputData.value.length) {
      clearInterval(rowInterval)
      clearInterval(stepInterval)
      processingRowIndex.value = -1
      isProcessing.value = false
      currentStep.value = 4
    }
  }, 1000)
}

// 监听命令变化，触发动画
watch(() => props.command, (newCommand) => {
  if (newCommand.startsWith('grep')) {
    setTimeout(startSearchAnimation, 500)
  } else if (newCommand.startsWith('awk')) {
    setTimeout(startProcessingAnimation, 500)
  }
}, { immediate: true })

onMounted(() => {
  if (props.command.startsWith('grep')) {
    startSearchAnimation()
  } else if (props.command.startsWith('awk')) {
    startProcessingAnimation()
  }
})
</script>

<style scoped>
/* 自定义动画 */
@keyframes scan-line {
  0% { background-color: rgba(59, 130, 246, 0.1); }
  50% { background-color: rgba(59, 130, 246, 0.3); transform: translateX(2px); }
  100% { background-color: rgba(59, 130, 246, 0.1); }
}

@keyframes process-row {
  0% { background-color: rgba(147, 51, 234, 0.1); }
  50% { background-color: rgba(147, 51, 234, 0.3); transform: scale(1.02); }
  100% { background-color: rgba(147, 51, 234, 0.1); }
}

@keyframes highlight {
  0% { background-color: rgb(234, 179, 8); }
  50% { background-color: rgb(249, 115, 22); }
  100% { background-color: rgb(234, 179, 8); }
}

@keyframes glow {
  0% { box-shadow: 0 0 0 rgba(234, 179, 8, 0.4); }
  50% { box-shadow: 0 0 10px rgba(234, 179, 8, 0.6); }
  100% { box-shadow: 0 0 0 rgba(234, 179, 8, 0.4); }
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes field-highlight {
  0% { background-color: rgba(59, 130, 246, 0.1); }
  50% { background-color: rgba(59, 130, 246, 0.3); transform: scale(1.05); }
  100% { background-color: rgba(59, 130, 246, 0.1); }
}

.animate-scan-line {
  animation: scan-line 0.3s ease-in-out;
}

.animate-process-row {
  animation: process-row 0.5s ease-in-out;
}

.animate-highlight {
  animation: highlight 1s ease-in-out infinite;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

.animate-slide-in-right {
  animation: slide-in-right 0.5s ease-out forwards;
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}

.animate-field-highlight {
  animation: field-highlight 0.8s ease-in-out;
}

/* 回溯机制样式 */
.backtrack-container {
  position: relative;
}

.backtrack-step {
  transition: all 0.3s ease;
}

.backtrack-step.active {
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(234, 179, 8, 0.3);
}

.char {
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.char:hover {
  transform: scale(1.1);
}

.step-number {
  transition: all 0.3s ease;
}

.step-visualization {
  line-height: 2;
}
</style>