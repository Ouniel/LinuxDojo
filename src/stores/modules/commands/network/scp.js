/**
 * scp 命令实现
 * 安全复制（通过SSH进行远程文件复制）
 */

export const scp = {
  name: 'scp',
  description: 'Secure copy (remote file copy program)|安全复制（远程文件复制程序）',
  options: [
    {
      name: 'source',
      type: 'input',
      flag: 'source',
      description: 'Source file or directory|源文件或目录',
      placeholder: 'file.txt or user@host:/path/file.txt',
      required: true,
      group: 'target'
    },
    {
      name: 'destination',
      type: 'input',
      flag: 'destination',
      description: 'Destination path|目标路径',
      placeholder: '/path/to/dest or user@host:/path/',
      required: true,
      group: 'target'
    },
    {
      name: '-P',
      type: 'input',
      flag: '-P',
      description: 'Connect to port on remote host|连接到远程主机的指定端口',
      placeholder: 'port number (e.g., 22)',
      group: 'connection'
    },
    {
      name: '-i',
      type: 'input',
      flag: '-i',
      description: 'Select identity file for public key authentication|选择公钥身份验证的身份文件',
      placeholder: 'identity file path (e.g., ~/.ssh/id_rsa)',
      group: 'auth'
    },
    {
      name: '-c',
      type: 'input',
      flag: '-c',
      description: 'Select cipher for encryption|选择加密的密码算法',
      placeholder: 'cipher spec (e.g., aes128-ctr)',
      group: 'security'
    },
    {
      name: '-r',
      flag: '-r',
      type: 'boolean',
      description: 'Recursively copy entire directories|递归复制整个目录',
      group: 'behavior'
    },
    {
      name: '-p',
      flag: '-p',
      type: 'boolean',
      description: 'Preserve modification times and modes|保留修改时间和模式',
      group: 'behavior'
    },
    {
      name: '-v',
      flag: '-v',
      type: 'boolean',
      description: 'Verbose mode|详细模式',
      group: 'output'
    },
    {
      name: '-q',
      flag: '-q',
      type: 'boolean',
      description: 'Quiet mode (suppress progress meter)|安静模式（抑制进度表）',
      group: 'output'
    },
    {
      name: '-C',
      flag: '-C',
      type: 'boolean',
      description: 'Enable compression|启用压缩',
      group: 'performance'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return scp.help
    }

    try {
      // 解析选项
      let recursive = false
      let preserveAttributes = false
      let verbose = false
      let quiet = false
      let port = 22
      let identity = null
      let cipher = null
      let compression = false
      let sources = []
      let destination = null
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        if (arg === '-r' || arg === '-R') {
          recursive = true
        } else if (arg === '-p') {
          preserveAttributes = true
        } else if (arg === '-v') {
          verbose = true
        } else if (arg === '-q') {
          quiet = true
        } else if (arg === '-C') {
          compression = true
        } else if (arg === '-P') {
          if (i + 1 < args.length) {
            port = parseInt(args[++i])
            if (isNaN(port) || port <= 0 || port > 65535) {
              return 'scp: invalid port number|scp: 无效的端口号'
            }
          }
        } else if (arg === '-i') {
          if (i + 1 < args.length) {
            identity = args[++i]
          }
        } else if (arg === '-c') {
          if (i + 1 < args.length) {
            cipher = args[++i]
          }
        } else if (arg.startsWith('-')) {
          return `scp: invalid option: ${arg}|scp: 无效选项: ${arg}`
        } else {
          if (i === args.length - 1) {
            destination = arg
          } else {
            sources.push(arg)
          }
        }
      }
      
      if (sources.length === 0 || !destination) {
        return 'scp: missing file operand|scp: 缺少文件操作数\nUsage: scp [options] source... destination'
      }
      
      // 解析源和目标
      const parsedSources = sources.map(src => parseLocation(src))
      const parsedDestination = parseLocation(destination)
      
      // 模拟SCP传输
      const results = []
      
      if (verbose) {
        results.push('Executing: scp with the following parameters:')
        results.push(`Port: ${port}`)
        if (identity) results.push(`Identity file: ${identity}`)
        if (cipher) results.push(`Cipher: ${cipher}`)
        if (compression) results.push('Compression: enabled')
        if (recursive) results.push('Recursive: enabled')
        if (preserveAttributes) results.push('Preserve attributes: enabled')
        results.push('')
      }
      
      for (const source of parsedSources) {
        const transferInfo = simulateTransfer(source, parsedDestination, {
          recursive,
          preserveAttributes,
          verbose,
          quiet,
          port,
          identity,
          cipher,
          compression
        })
        
        results.push(transferInfo)
      }
      
      if (!quiet) {
        results.push('\n[Note: This is a simulation. In a real environment, scp would transfer files via SSH]')
        results.push('[注意: 这是模拟。在真实环境中，scp会通过SSH传输文件]')
      }
      
      return results.join('\n')
      
    } catch (error) {
      return `scp: ${error.message}`
    }
  },
  
  description: 'Secure copy (remote file copy program)|安全复制（远程文件复制程序）',
  category: 'network',
  requiresArgs: false,
  examples: [
    'scp file.txt user@server:/tmp/',
    'scp user@server:/tmp/file.txt .',
    'scp -r directory/ user@server:/home/',
    'scp -P 2222 file.txt user@server:/'
  ],
  
  help: `Usage: scp [options] source... destination

Secure copy (remote file copy program)|安全复制（远程文件复制程序）

scp copies files between hosts on a network using SSH for data transfer
and authentication. It uses the same authentication and security as ssh.
scp 使用SSH进行数据传输和身份验证，在网络上的主机之间复制文件。

Options|选项:
  -r, -R            Recursively copy entire directories|递归复制整个目录
  -p                Preserve modification times and modes|保留修改时间和模式
  -v                Verbose mode|详细模式
  -q                Quiet mode (suppress progress meter)|安静模式（抑制进度表）
  -C                Enable compression|启用压缩
  -P port           Connect to port on remote host|连接到远程主机的指定端口
  -i identity_file  Select identity file for public key authentication|选择公钥身份验证的身份文件
  -c cipher         Select cipher for encryption|选择加密的密码算法

File Formats|文件格式:
  Local files:      /path/to/file|本地文件: /path/to/file
  Remote files:     [user@]host:/path/to/file|远程文件: [用户@]主机:/path/to/file
    
Examples|示例:
  scp file.txt user@host:/tmp/           # Upload file|上传文件
  scp user@host:/tmp/file.txt .          # Download file|下载文件
  scp -r dir/ user@host:/tmp/            # Upload directory|上传目录
  scp -P 2222 file.txt user@host:/tmp/   # Use custom port|使用自定义端口
  scp -i ~/.ssh/key file.txt user@host:/ # Use specific key|使用特定密钥

Notes|注意:
  - Requires SSH access to remote hosts|需要SSH访问远程主机
  - Uses SSH keys or password authentication|使用SSH密钥或密码身份验证
  - Preserves file permissions by default|默认保留文件权限
  - Can copy between two remote hosts|可以在两个远程主机之间复制
  - Progress is shown unless in quiet mode|除非在安静模式下，否则显示进度`
}

// 解析位置（本地或远程）
function parseLocation(location) {
  if (location.includes(':')) {
    const [host, path] = location.split(':', 2)
    const userHost = host.includes('@') ? host.split('@') : [null, host]
    return {
      type: 'remote',
      user: userHost[0],
      host: userHost[1] || userHost[0],
      path: path || '~'
    }
  } else {
    return {
      type: 'local',
      path: location
    }
  }
}

// 模拟文件传输
function simulateTransfer(source, destination, options) {
  const sourceStr = formatLocation(source)
  const destStr = formatLocation(destination)
  
  let result = []
  
  if (options.verbose) {
    result.push(`Connecting to ${destination.host || 'localhost'}...`)
    if (source.type === 'remote' || destination.type === 'remote') {
      result.push(`Authentication successful.`)
    }
  }
  
  // 模拟传输过程
  const transferType = getTransferType(source, destination)
  result.push(`${transferType}: ${sourceStr} -> ${destStr}`)
  
  // 模拟文件大小和传输速度
  const fileSize = Math.floor(Math.random() * 10000) + 1000 // 1KB-10KB
  const speed = Math.floor(Math.random() * 1000) + 500 // 500-1500 KB/s
  const time = (fileSize / speed).toFixed(1)
  
  if (options.verbose) {
    result.push(`${sourceStr.split('/').pop() || 'file'}    100%  ${fileSize}B   ${speed}KB/s   00:0${time}s`)
  }
  
  if (options.preserveAttributes) {
    result.push('Preserving file attributes...')
  }
  
  return result.join('\n')
}

// 格式化位置显示
function formatLocation(location) {
  if (location.type === 'remote') {
    const userPart = location.user ? `${location.user}@` : ''
    return `${userPart}${location.host}:${location.path}`
  } else {
    return location.path
  }
}

// 获取传输类型
function getTransferType(source, destination) {
  if (source.type === 'local' && destination.type === 'remote') {
    return 'Upload'
  } else if (source.type === 'remote' && destination.type === 'local') {
    return 'Download'
  } else if (source.type === 'remote' && destination.type === 'remote') {
    return 'Remote copy'
  } else {
    return 'Local copy'
  }
}

export default scp
