<template>
  <div class="openssl-visualizer p-6 bg-gray-900 text-white rounded-lg">
    <div class="mb-6">
      <h3 class="text-xl font-bold mb-2 text-cyan-400">🔐 OpenSSL 加密工具可视化</h3>
      <p class="text-gray-300">演示 OpenSSL 的证书管理、加密解密和 SSL 连接测试</p>
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

    <!-- 证书生成模式 -->
    <div v-if="currentMode === 'certificate'" class="space-y-6">
      <div class="bg-gray-800 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-4 text-cyan-400">证书生成与管理</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 证书配置 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">证书类型</label>
              <select v-model="certType" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                <option value="self-signed">自签名证书</option>
                <option value="csr">证书签名请求</option>
                <option value="ca">CA 证书</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">密钥长度</label>
              <select v-model="keyLength" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                <option value="2048">2048 位</option>
                <option value="3072">3072 位</option>
                <option value="4096">4096 位</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">有效期 (天)</label>
              <input
                v-model="validityDays"
                type="number"
                placeholder="365"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">通用名称 (CN)</label>
              <input
                v-model="commonName"
                type="text"
                placeholder="example.com"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">组织 (O)</label>
              <input
                v-model="organization"
                type="text"
                placeholder="My Company"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <button
              @click="generateCertificate"
              :disabled="isGenerating"
              class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {{ isGenerating ? '生成中...' : '生成证书' }}
            </button>
          </div>

          <!-- 证书生成过程 -->
          <div class="bg-gray-700 p-4 rounded-lg">
            <h5 class="text-md font-semibold mb-3 text-cyan-400">生成过程</h5>
            <div class="space-y-3">
              <div v-for="step in certSteps" :key="step.id" class="flex items-center space-x-3">
                <div :class="[
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  step.status === 'completed' ? 'bg-green-600 text-white' :
                  step.status === 'active' ? 'bg-yellow-600 text-white animate-pulse' :
                  'bg-gray-600 text-gray-300'
                ]">
                  {{ step.status === 'completed' ? '✓' : step.id }}
                </div>
                <div :class="[
                  'text-sm',
                  step.status === 'completed' ? 'text-green-400' :
                  step.status === 'active' ? 'text-yellow-400' :
                  'text-gray-400'
                ]">
                  {{ step.name }}
                </div>
              </div>
            </div>
            
            <div v-if="generatedCert" class="mt-4 p-3 bg-black rounded text-xs font-mono">
              <div class="text-green-400 mb-2">证书指纹:</div>
              <div class="text-gray-300 break-all">{{ generatedCert.fingerprint }}</div>
              <div class="text-green-400 mt-2 mb-2">有效期:</div>
              <div class="text-gray-300">{{ generatedCert.validFrom }} - {{ generatedCert.validTo }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SSL 连接测试模式 -->
    <div v-if="currentMode === 'ssl-test'" class="space-y-6">
      <div class="bg-gray-800 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-4 text-cyan-400">SSL/TLS 连接测试</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 连接配置 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">目标主机</label>
              <input
                v-model="sslHost"
                type="text"
                placeholder="google.com"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">端口</label>
              <input
                v-model="sslPort"
                type="number"
                placeholder="443"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">SNI 主机名</label>
              <input
                v-model="sniHostname"
                type="text"
                placeholder="google.com"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">验证深度</label>
              <input
                v-model="verifyDepth"
                type="number"
                placeholder="2"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <button
              @click="testSSLConnection"
              :disabled="isTesting"
              class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {{ isTesting ? '测试中...' : '测试 SSL 连接' }}
            </button>
          </div>

          <!-- SSL 握手过程 -->
          <div class="bg-gray-700 p-4 rounded-lg">
            <h5 class="text-md font-semibold mb-3 text-cyan-400">SSL 握手过程</h5>
            <div class="space-y-3">
              <div v-for="phase in sslHandshakePhases" :key="phase.id" class="flex items-center space-x-3">
                <div :class="[
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  phase.status === 'completed' ? 'bg-green-600 text-white' :
                  phase.status === 'active' ? 'bg-yellow-600 text-white animate-pulse' :
                  phase.status === 'failed' ? 'bg-red-600 text-white' :
                  'bg-gray-600 text-gray-300'
                ]">
                  {{ phase.status === 'completed' ? '✓' : phase.status === 'failed' ? '✗' : phase.id }}
                </div>
                <div :class="[
                  'text-sm flex-1',
                  phase.status === 'completed' ? 'text-green-400' :
                  phase.status === 'active' ? 'text-yellow-400' :
                  phase.status === 'failed' ? 'text-red-400' :
                  'text-gray-400'
                ]">
                  {{ phase.name }}
                </div>
                <div v-if="phase.time" class="text-xs text-gray-500">
                  {{ phase.time }}ms
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 证书链信息 -->
        <div v-if="sslCertChain.length > 0" class="mt-6 bg-gray-700 p-4 rounded-lg">
          <h5 class="text-md font-semibold mb-3 text-cyan-400">证书链信息</h5>
          <div class="space-y-3">
            <div v-for="cert in sslCertChain" :key="cert.level" class="bg-gray-600 p-3 rounded">
              <div class="flex justify-between items-start mb-2">
                <div class="text-sm font-medium text-cyan-400">Level {{ cert.level }}</div>
                <div :class="[
                  'text-xs px-2 py-1 rounded',
                  cert.valid ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                ]">
                  {{ cert.valid ? '有效' : '无效' }}
                </div>
              </div>
              <div class="text-sm text-gray-300">
                <div><strong>CN:</strong> {{ cert.commonName }}</div>
                <div><strong>颁发者:</strong> {{ cert.issuer }}</div>
                <div><strong>有效期:</strong> {{ cert.validFrom }} - {{ cert.validTo }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加密解密模式 -->
    <div v-if="currentMode === 'encryption'" class="space-y-6">
      <div class="bg-gray-800 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-4 text-cyan-400">对称加密/解密</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 加密配置 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">加密算法</label>
              <select v-model="encryptionAlgorithm" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                <option value="aes-256-cbc">AES-256-CBC</option>
                <option value="aes-192-cbc">AES-192-CBC</option>
                <option value="aes-128-cbc">AES-128-CBC</option>
                <option value="des3">3DES</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">操作模式</label>
              <select v-model="encryptionMode" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                <option value="encrypt">加密</option>
                <option value="decrypt">解密</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">输入数据</label>
              <textarea
                v-model="encryptionInput"
                placeholder="输入要加密/解密的数据..."
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white resize-none"
                rows="4"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">密码</label>
              <input
                v-model="encryptionPassword"
                type="password"
                placeholder="输入密码..."
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <div class="flex items-center space-x-2">
              <input
                v-model="useBase64"
                type="checkbox"
                class="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <label class="text-sm text-gray-300">Base64 编码</label>
            </div>
            
            <button
              @click="performEncryption"
              :disabled="isEncrypting"
              class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {{ isEncrypting ? '处理中...' : (encryptionMode === 'encrypt' ? '加密' : '解密') }}
            </button>
          </div>

          <!-- 加密过程可视化 -->
          <div class="bg-gray-700 p-4 rounded-lg">
            <h5 class="text-md font-semibold mb-3 text-cyan-400">加密过程</h5>
            <div class="space-y-4">
              <!-- 数据流 -->
              <div class="bg-gray-600 p-3 rounded">
                <div class="text-sm text-gray-300 mb-2">原始数据</div>
                <div class="bg-black p-2 rounded text-xs font-mono text-green-400 break-all">
                  {{ encryptionInput || '等待输入...' }}
                </div>
              </div>
              
              <!-- 加密箭头 -->
              <div class="flex justify-center">
                <div class="flex items-center space-x-2">
                  <div class="text-cyan-400">{{ encryptionMode === 'encrypt' ? '🔒' : '🔓' }}</div>
                  <div class="text-sm text-gray-300">{{ encryptionAlgorithm.toUpperCase() }}</div>
                  <div class="text-cyan-400">→</div>
                </div>
              </div>
              
              <!-- 输出数据 -->
              <div class="bg-gray-600 p-3 rounded">
                <div class="text-sm text-gray-300 mb-2">
                  {{ encryptionMode === 'encrypt' ? '加密后数据' : '解密后数据' }}
                </div>
                <div class="bg-black p-2 rounded text-xs font-mono text-cyan-400 break-all min-h-[2rem]">
                  {{ encryptionOutput || '等待处理...' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 哈希摘要模式 -->
    <div v-if="currentMode === 'hash'" class="space-y-6">
      <div class="bg-gray-800 p-4 rounded-lg">
        <h4 class="text-lg font-semibold mb-4 text-cyan-400">消息摘要 (Hash)</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 哈希配置 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">哈希算法</label>
              <select v-model="hashAlgorithm" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                <option value="md5">MD5</option>
                <option value="sha1">SHA-1</option>
                <option value="sha256">SHA-256</option>
                <option value="sha512">SHA-512</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">输入数据</label>
              <textarea
                v-model="hashInput"
                placeholder="输入要计算哈希的数据..."
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white resize-none"
                rows="4"
              ></textarea>
            </div>
            
            <button
              @click="calculateHash"
              :disabled="isHashing"
              class="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {{ isHashing ? '计算中...' : '计算哈希' }}
            </button>
          </div>

          <!-- 哈希结果 -->
          <div class="bg-gray-700 p-4 rounded-lg">
            <h5 class="text-md font-semibold mb-3 text-cyan-400">哈希结果</h5>
            <div class="space-y-4">
              <div class="bg-gray-600 p-3 rounded">
                <div class="text-sm text-gray-300 mb-2">算法信息</div>
                <div class="text-xs text-gray-400">
                  <div>算法: {{ hashAlgorithm.toUpperCase() }}</div>
                  <div>输出长度: {{ getHashLength(hashAlgorithm) }} 位</div>
                  <div>安全性: {{ getHashSecurity(hashAlgorithm) }}</div>
                </div>
              </div>
              
              <div class="bg-gray-600 p-3 rounded">
                <div class="text-sm text-gray-300 mb-2">哈希值</div>
                <div class="bg-black p-2 rounded text-xs font-mono text-orange-400 break-all">
                  {{ hashOutput || '等待计算...' }}
                </div>
              </div>
              
              <div v-if="hashOutput" class="bg-gray-600 p-3 rounded">
                <div class="text-sm text-gray-300 mb-2">验证</div>
                <div class="text-xs text-gray-400">
                  <div>输入长度: {{ hashInput.length }} 字符</div>
                  <div>哈希长度: {{ hashOutput.length }} 字符</div>
                  <div>计算时间: {{ hashTime }}ms</div>
                </div>
              </div>
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
  name: 'OpenSSLVisualizer',
  setup() {
    const currentMode = ref('certificate')
    
    const modes = [
      { id: 'certificate', name: '证书管理' },
      { id: 'ssl-test', name: 'SSL 测试' },
      { id: 'encryption', name: '加密解密' },
      { id: 'hash', name: '哈希摘要' }
    ]

    // 证书生成状态
    const certType = ref('self-signed')
    const keyLength = ref('2048')
    const validityDays = ref(365)
    const commonName = ref('example.com')
    const organization = ref('My Company')
    const isGenerating = ref(false)
    const generatedCert = ref(null)
    
    const certSteps = ref([
      { id: 1, name: '生成私钥', status: 'pending' },
      { id: 2, name: '创建证书请求', status: 'pending' },
      { id: 3, name: '签名证书', status: 'pending' },
      { id: 4, name: '验证证书', status: 'pending' }
    ])

    // SSL 测试状态
    const sslHost = ref('google.com')
    const sslPort = ref(443)
    const sniHostname = ref('google.com')
    const verifyDepth = ref(2)
    const isTesting = ref(false)
    const sslCertChain = ref([])
    
    const sslHandshakePhases = ref([
      { id: 1, name: 'TCP 连接', status: 'pending', time: null },
      { id: 2, name: 'Client Hello', status: 'pending', time: null },
      { id: 3, name: 'Server Hello', status: 'pending', time: null },
      { id: 4, name: '证书验证', status: 'pending', time: null },
      { id: 5, name: '密钥交换', status: 'pending', time: null },
      { id: 6, name: '握手完成', status: 'pending', time: null }
    ])

    // 加密解密状态
    const encryptionAlgorithm = ref('aes-256-cbc')
    const encryptionMode = ref('encrypt')
    const encryptionInput = ref('')
    const encryptionPassword = ref('')
    const useBase64 = ref(true)
    const isEncrypting = ref(false)
    const encryptionOutput = ref('')

    // 哈希摘要状态
    const hashAlgorithm = ref('sha256')
    const hashInput = ref('')
    const isHashing = ref(false)
    const hashOutput = ref('')
    const hashTime = ref(0)

    // 证书生成方法
    const generateCertificate = async () => {
      isGenerating.value = true
      
      // 重置步骤状态
      certSteps.value.forEach(step => step.status = 'pending')
      
      // 模拟证书生成过程
      for (let i = 0; i < certSteps.value.length; i++) {
        certSteps.value[i].status = 'active'
        await new Promise(resolve => setTimeout(resolve, 1000))
        certSteps.value[i].status = 'completed'
      }
      
      // 生成模拟证书信息
      generatedCert.value = {
        fingerprint: generateFingerprint(),
        validFrom: new Date().toLocaleDateString(),
        validTo: new Date(Date.now() + validityDays.value * 24 * 60 * 60 * 1000).toLocaleDateString()
      }
      
      isGenerating.value = false
    }

    const generateFingerprint = () => {
      const chars = '0123456789ABCDEF'
      let result = ''
      for (let i = 0; i < 40; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
        if (i > 0 && (i + 1) % 2 === 0 && i < 39) result += ':'
      }
      return result
    }

    // SSL 测试方法
    const testSSLConnection = async () => {
      isTesting.value = true
      sslCertChain.value = []
      
      // 重置握手状态
      sslHandshakePhases.value.forEach(phase => {
        phase.status = 'pending'
        phase.time = null
      })
      
      // 模拟 SSL 握手过程
      for (let i = 0; i < sslHandshakePhases.value.length; i++) {
        sslHandshakePhases.value[i].status = 'active'
        const startTime = Date.now()
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700))
        const endTime = Date.now()
        
        sslHandshakePhases.value[i].status = Math.random() > 0.1 ? 'completed' : 'failed'
        sslHandshakePhases.value[i].time = endTime - startTime
        
        if (sslHandshakePhases.value[i].status === 'failed') break
      }
      
      // 生成模拟证书链
      if (sslHandshakePhases.value.every(phase => phase.status === 'completed')) {
        sslCertChain.value = [
          {
            level: 0,
            commonName: sslHost.value,
            issuer: 'Google Trust Services',
            validFrom: '2024-01-01',
            validTo: '2024-12-31',
            valid: true
          },
          {
            level: 1,
            commonName: 'GTS CA 1C3',
            issuer: 'GTS Root CA',
            validFrom: '2023-01-01',
            validTo: '2025-12-31',
            valid: true
          }
        ]
      }
      
      isTesting.value = false
    }

    // 加密解密方法
    const performEncryption = async () => {
      if (!encryptionInput.value || !encryptionPassword.value) return
      
      isEncrypting.value = true
      
      // 模拟加密/解密过程
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (encryptionMode.value === 'encrypt') {
        // 模拟加密输出
        const encrypted = btoa(encryptionInput.value + encryptionPassword.value)
        encryptionOutput.value = useBase64.value ? encrypted : encrypted.replace(/[A-Za-z]/g, 'X')
      } else {
        // 模拟解密输出
        try {
          encryptionOutput.value = atob(encryptionInput.value).replace(encryptionPassword.value, '')
        } catch {
          encryptionOutput.value = '解密失败：无效的输入数据'
        }
      }
      
      isEncrypting.value = false
    }

    // 哈希计算方法
    const calculateHash = async () => {
      if (!hashInput.value) return
      
      isHashing.value = true
      const startTime = Date.now()
      
      // 模拟哈希计算
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // 生成模拟哈希值
      const hashLengths = {
        md5: 32,
        sha1: 40,
        sha256: 64,
        sha512: 128
      }
      
      const length = hashLengths[hashAlgorithm.value]
      const chars = '0123456789abcdef'
      let hash = ''
      
      for (let i = 0; i < length; i++) {
        hash += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      
      hashOutput.value = hash
      hashTime.value = Date.now() - startTime
      isHashing.value = false
    }

    // 工具方法
    const getHashLength = (algorithm) => {
      const lengths = {
        md5: 128,
        sha1: 160,
        sha256: 256,
        sha512: 512
      }
      return lengths[algorithm] || 0
    }

    const getHashSecurity = (algorithm) => {
      const security = {
        md5: '低 (已弃用)',
        sha1: '低 (已弃用)',
        sha256: '高',
        sha512: '高'
      }
      return security[algorithm] || '未知'
    }

    // 生成命令
    const generateCommand = () => {
      let cmd = 'openssl'
      
      switch (currentMode.value) {
        case 'certificate':
          if (certType.value === 'self-signed') {
            cmd += ` req -new -x509 -key private.key -out cert.pem -days ${validityDays.value}`
            if (commonName.value) {
              cmd += ` -subj "/CN=${commonName.value}/O=${organization.value}"`
            }
          } else if (certType.value === 'csr') {
            cmd += ` req -new -key private.key -out cert.csr`
          } else {
            cmd += ` genrsa -out private.key ${keyLength.value}`
          }
          break
        case 'ssl-test':
          cmd += ` s_client -connect ${sslHost.value}:${sslPort.value}`
          if (sniHostname.value) cmd += ` -servername ${sniHostname.value}`
          if (verifyDepth.value) cmd += ` -verify ${verifyDepth.value}`
          break
        case 'encryption':
          cmd += ` enc -${encryptionAlgorithm.value}`
          if (encryptionMode.value === 'decrypt') cmd += ' -d'
          if (useBase64.value) cmd += ' -base64'
          cmd += ' -in input.txt -out output.txt'
          break
        case 'hash':
          cmd += ` dgst -${hashAlgorithm.value} input.txt`
          break
      }
      
      return cmd
    }

    return {
      currentMode,
      modes,
      
      // 证书生成
      certType,
      keyLength,
      validityDays,
      commonName,
      organization,
      isGenerating,
      generatedCert,
      certSteps,
      generateCertificate,
      
      // SSL 测试
      sslHost,
      sslPort,
      sniHostname,
      verifyDepth,
      isTesting,
      sslCertChain,
      sslHandshakePhases,
      testSSLConnection,
      
      // 加密解密
      encryptionAlgorithm,
      encryptionMode,
      encryptionInput,
      encryptionPassword,
      useBase64,
      isEncrypting,
      encryptionOutput,
      performEncryption,
      
      // 哈希摘要
      hashAlgorithm,
      hashInput,
      isHashing,
      hashOutput,
      hashTime,
      calculateHash,
      getHashLength,
      getHashSecurity,
      
      generateCommand
    }
  }
}
</script>

<style scoped>
.openssl-visualizer {
  font-family: 'Consolas', 'Monaco', monospace;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style> 