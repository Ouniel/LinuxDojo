/**
 * ping - 发送ICMP回显请求包到网络主机
 */

export const ping = {
  name: 'ping',
  description: 'Send ICMP ECHO_REQUEST packets to network hosts|发送ICMP回显请求包到网络主机',
  options: [
    {
      name: 'target',
      flag: 'target',
      type: 'input',
      inputKey: 'target',
      description: 'Target hostname or IP address|目标主机名或IP地址',
      placeholder: 'Enter hostname or IP (e.g., google.com, 8.8.8.8)',
      required: true,
      group: 'target'
    },
    {
      name: '-c',
      type: 'input',
      flag: '-c',
      inputKey: 'count',
      description: 'Stop after sending count packets|发送指定数量的数据包后停止',
      placeholder: 'Number of packets (e.g., 4)',
      group: 'basic'
    },
    {
      name: '-i',
      type: 'input',
      flag: '-i',
      inputKey: 'interval',
      description: 'Wait interval seconds between sending packets|发送数据包的间隔时间(秒)',
      placeholder: 'Interval in seconds (e.g., 1.0)',
      group: 'basic'
    },
    {
      name: '-W',
      type: 'input',
      flag: '-W',
      inputKey: 'timeout',
      description: 'Time to wait for response in seconds|等待响应的超时时间(秒)',
      placeholder: 'Timeout in seconds (e.g., 3)',
      group: 'basic'
    },
    {
      name: '-s',
      type: 'input',
      flag: '-s',
      inputKey: 'packet_size',
      description: 'Specify packet size in bytes|指定数据包大小(字节)',
      placeholder: 'Packet size (e.g., 64)',
      group: 'basic'
    },
    {
      name: '-t',
      type: 'input',
      flag: '-t',
      inputKey: 'ttl',
      description: 'Set IP Time to Live|设置IP生存时间',
      placeholder: 'TTL value (e.g., 64)',
      group: 'advanced'
    },
    {
      name: '-q',
      flag: '-q',
      type: 'boolean',
      description: 'Quiet output - only show summary|静默输出，只显示摘要',
      group: 'output'
    },
    {
      name: '-v',
      flag: '-v',
      type: 'boolean',
      description: 'Verbose output|详细输出',
      group: 'output'
    },
    {
      name: '-f',
      flag: '-f',
      type: 'boolean',
      description: 'Flood ping - send packets as fast as possible|洪水ping，尽可能快地发送数据包',
      group: 'advanced'
    },
    {
      name: '-n',
      flag: '-n',
      type: 'boolean',
      description: 'Numeric output only - no hostname resolution|仅数字输出，不解析主机名',
      group: 'output'
    },
    {
      name: '-a',
      flag: '-a',
      type: 'boolean',
      description: 'Audible ping - beep on each reply|声音提示，每次回复时发出声音',
      group: 'output'
    },
    {
      name: '-A',
      flag: '-A',
      type: 'boolean',
      description: 'Adaptive ping - adjust interval based on RTT|自适应ping，根据RTT调整间隔',
      group: 'advanced'
    },
    {
      name: '-b',
      flag: '-b',
      type: 'boolean',
      description: 'Allow pinging broadcast address|允许ping广播地址',
      group: 'advanced'
    },
    {
      name: '-r',
      flag: '-r',
      type: 'boolean',
      description: 'Bypass routing table, send directly|绕过路由表，直接发送',
      group: 'advanced'
    },
    {
      name: '-D',
      flag: '-D',
      type: 'boolean',
      description: 'Print timestamps before each line|在每行前打印时间戳',
      group: 'output'
    },
    {
      name: '-4',
      flag: '-4',
      type: 'boolean',
      description: 'Use IPv4 only|仅使用IPv4',
      group: 'protocol'
    },
    {
      name: '-6',
      flag: '-6',
      type: 'boolean',
      description: 'Use IPv6 only|仅使用IPv6',
      group: 'protocol'
    }
  ],
  handler: (args, context, fs) => {
/**
 * ping - 发送ICMP回显请求包到网络主机
 */

    // 处理帮助选项
    if (args.includes('--help')) {
      return ping.help
    }

    const count = getOptionValue(args, '-c') || getOptionValue(args, '--count')
    const interval = getOptionValue(args, '-i') || getOptionValue(args, '--interval') || '1'
    const timeout = getOptionValue(args, '-W') || getOptionValue(args, '--timeout') || '1'
    const packetSize = getOptionValue(args, '-s') || getOptionValue(args, '--size') || '56'
    const ttl = getOptionValue(args, '-t') || getOptionValue(args, '--ttl')
    const quiet = args.includes('-q') || args.includes('--quiet')
    const verbose = args.includes('-v') || args.includes('--verbose')
    const flood = args.includes('-f') || args.includes('--flood')
    const numeric = args.includes('-n') || args.includes('--numeric')
    const audible = args.includes('-a') || args.includes('--audible')
    const adaptive = args.includes('-A') || args.includes('--adaptive')
    const broadcast = args.includes('-b') || args.includes('--broadcast')
    const bypass = args.includes('-r') || args.includes('--ignore-routing')
    const timestamp = args.includes('-D') || args.includes('--print-timestamps')
    const ipv4 = args.includes('-4')
    const ipv6 = args.includes('-6')
    
    // 获取目标主机
    const targets = args.filter(arg => 
      !arg.startsWith('-') && 
      !isOptionValue(arg, args)
    )

    if (targets.length === 0) {
      return 'ping: usage error: Destination address required'
    }

    const target = targets[0]
    const pingCount = count ? parseInt(count) : (flood ? 100000 : null)
    const intervalMs = parseFloat(interval) * 1000
    const timeoutMs = parseFloat(timeout) * 1000
    const dataSize = parseInt(packetSize)

    // 验证参数
    if (pingCount && pingCount <= 0) {
      return 'ping: bad number of packets to transmit.'
    }
    
    if (intervalMs < 0) {
      return 'ping: bad timing interval.'
    }
    
    if (dataSize < 0 || dataSize > 65507) {
      return 'ping: packet size too large.'
    }

    // 模拟ping结果
    return simulatePing(target, {
      count: pingCount,
      interval: intervalMs,
      timeout: timeoutMs,
      packetSize: dataSize,
      ttl: ttl ? parseInt(ttl) : 64,
      quiet,
      verbose,
      flood,
      numeric,
      audible,
      adaptive,
      broadcast,
      bypass,
      timestamp,
      ipv4,
      ipv6
    })
  },
  description: 'Send ICMP ECHO_REQUEST packets to network hosts|发送ICMP回显请求包到网络主机',
  category: 'network',
  requiresArgs: true,
  examples: [
    'ping google.com                    # Ping google.com indefinitely|无限ping google.com',
    'ping -c 4 8.8.8.8                 # Send 4 packets to 8.8.8.8|发送4个数据包到8.8.8.8',
    'ping -i 0.5 localhost             # Ping localhost every 0.5 seconds|每0.5秒ping本地主机',
    'ping -s 1024 example.com          # Use 1024 byte packets|使用1024字节数据包',
    'ping -q -c 10 192.168.1.1         # Quiet mode, 10 packets|静默模式，发送10个包'
  ],
  help: `Usage: ping [OPTION...] HOST ...
Send ICMP ECHO_REQUEST packets to network hosts.

Options:
 -a, --audible          audible ping
 -A, --adaptive         adaptive ping
 -B, --sticky-source-address
                        sticky source address
 -b, --broadcast        allow pinging broadcast
 -c, --count=NUMBER     stop after sending NUMBER packets
 -D, --print-timestamps print timestamps
 -d, --debug            set the SO_DEBUG option
 -f, --flood            flood ping
 -h, --help             give this help list
 -I, --interface=ADDRESS
                        either interface name or address
 -i, --interval=NUMBER  seconds between sending each packet
 -L, --no-loopback      suppress loopback of multicast packets
 -l, --preload=NUMBER   send NUMBER packets as fast as possible before
                        falling into normal mode of behavior
 -n, --numeric          do not resolve host addresses
 -p, --pattern=PATTERN  contents of padding byte
 -q, --quiet            quiet output
 -R, --record-route     record route
 -r, --ignore-routing   send directly to a host on an attached network
 -s, --size=NUMBER      use NUMBER data bytes
 -S, --source=ADDRESS   set source address to specified value
 -t, --ttl=NUMBER       define time to live
 -T, --tos=NUMBER       set type of service (TOS) to NUMBER
 -U, --mark=NUMBER      set mark
 -v, --verbose          verbose output
 -V, --version          print program version
 -w, --timeout=NUMBER   reply wait NUMBER seconds
 -W, --linger=NUMBER    number of seconds to wait for response

IPv4 options:
 -4, --ipv4             use IPv4
 -6, --ipv6             use IPv6

Examples:
  ping google.com              Ping google.com indefinitely
  ping -c 4 8.8.8.8           Send 4 packets to 8.8.8.8
  ping -i 0.5 localhost       Ping localhost every 0.5 seconds
  ping -s 1024 example.com    Use 1024 byte packets
  ping -q -c 10 192.168.1.1   Quiet mode, 10 packets`
}

// 模拟ping执行
function simulatePing(target, options) {
  const results = []
  const startTime = Date.now()
  
  // 解析目标地址
  const targetInfo = parseTarget(target, options)
  if (targetInfo.error) {
    return targetInfo.error
  }

  // 显示ping开始信息
  if (!options.quiet) {
    let startMsg = `PING ${target}`
    if (targetInfo.resolved && !options.numeric) {
      startMsg += ` (${targetInfo.ip})`
    }
    startMsg += `: ${options.packetSize} data bytes`
    results.push(startMsg)
  }

  // 生成ping结果
  const packets = generatePingPackets(targetInfo, options)
  
  if (options.flood) {
    // 洪水模式显示
    results.push('FLOOD MODE: sending packets as fast as possible')
    let dots = ''
    for (let i = 0; i < Math.min(packets.length, 80); i++) {
      dots += packets[i].success ? '.' : 'X'
    }
    results.push(dots)
  } else {
    // 正常模式显示每个包的结果
    for (const packet of packets) {
      if (!options.quiet) {
        let line = ''
        
        if (options.timestamp) {
          line += `[${new Date(packet.timestamp).toISOString()}] `
        }
        
        if (packet.success) {
          line += `${options.packetSize} bytes from ${targetInfo.display}: `
          line += `icmp_seq=${packet.seq} ttl=${packet.ttl} time=${packet.time.toFixed(1)} ms`
          
          if (options.audible) {
            line += ' \a' // 响铃字符
          }
        } else {
          line += `Request timeout for icmp_seq ${packet.seq}`
        }
        
        results.push(line)
      }
    }
  }

  // 显示统计信息
  if (!options.quiet || options.count) {
    const stats = calculateStatistics(packets, target, startTime)
    results.push('')
    results.push(`--- ${target} ping statistics ---`)
    results.push(`${stats.transmitted} packets transmitted, ${stats.received} received, ${stats.loss}% packet loss, time ${stats.totalTime}ms`)
    
    if (stats.received > 0) {
      results.push(`rtt min/avg/max/mdev = ${stats.min.toFixed(3)}/${stats.avg.toFixed(3)}/${stats.max.toFixed(3)}/${stats.mdev.toFixed(3)} ms`)
    }
  }

  return results.join('\n')
}

// 解析目标地址
function parseTarget(target, options) {
  // 简单的地址解析模拟
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/
  
  let ip, display, resolved = false
  
  if (ipv4Regex.test(target)) {
    ip = target
    display = target
  } else if (ipv6Regex.test(target)) {
    ip = target
    display = target
  } else {
    // 模拟DNS解析
    const mockDNS = {
      'localhost': '127.0.0.1',
      'google.com': '142.250.191.14',
      'example.com': '93.184.216.34',
      'github.com': '140.82.114.4',
      'stackoverflow.com': '151.101.1.69',
      'reddit.com': '151.101.65.140'
    }
    
    ip = mockDNS[target.toLowerCase()]
    if (!ip) {
      // 生成随机IP用于演示
      ip = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
    }
    display = options.numeric ? ip : target
    resolved = true
  }
  
  // 验证IP地址
  if (!isValidIP(ip)) {
    return { error: `ping: ${target}: Name or service not known` }
  }
  
  return { ip, display, resolved }
}

// 生成ping包结果
function generatePingPackets(targetInfo, options) {
  const packets = []
  const count = options.count || 4 // 默认4个包用于演示
  const baseRTT = calculateBaseRTT(targetInfo.ip)
  
  for (let i = 1; i <= count; i++) {
    const success = Math.random() > 0.05 // 95%成功率
    const rtt = success ? baseRTT + (Math.random() - 0.5) * 20 : 0
    const ttl = options.ttl + Math.floor(Math.random() * 3) - 1
    
    packets.push({
      seq: i,
      success,
      time: Math.max(0.1, rtt),
      ttl: Math.max(1, ttl),
      timestamp: Date.now() + (i - 1) * options.interval
    })
  }
  
  return packets
}

// 计算基础RTT
function calculateBaseRTT(ip) {
  if (ip.startsWith('127.') || ip === '::1') {
    return 0.1 + Math.random() * 0.5 // 本地回环
  } else if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return 1 + Math.random() * 5 // 局域网
  } else {
    return 20 + Math.random() * 100 // 互联网
  }
}

// 计算统计信息
function calculateStatistics(packets, target, startTime) {
  const transmitted = packets.length
  const successful = packets.filter(p => p.success)
  const received = successful.length
  const loss = Math.round(((transmitted - received) / transmitted) * 100)
  const totalTime = Date.now() - startTime
  
  if (received === 0) {
    return { transmitted, received, loss, totalTime, min: 0, avg: 0, max: 0, mdev: 0 }
  }
  
  const times = successful.map(p => p.time)
  const min = Math.min(...times)
  const max = Math.max(...times)
  const avg = times.reduce((sum, time) => sum + time, 0) / times.length
  
  // 计算标准差
  const variance = times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / times.length
  const mdev = Math.sqrt(variance)
  
  return { transmitted, received, loss, totalTime, min, avg, max, mdev }
}

// 验证IP地址
function isValidIP(ip) {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/
  
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(octet => {
      const num = parseInt(octet)
      return num >= 0 && num <= 255
    })
  }
  
  return ipv6Regex.test(ip)
}

// 获取选项值
function getOptionValue(args, option) {
  const index = args.indexOf(option)
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1]
  }
  
  // 检查长选项格式 --option=value
  for (const arg of args) {
    if (arg.startsWith(option + '=')) {
      return arg.substring(option.length + 1)
    }
  }
  
  return null
}

// 检查参数是否是选项值
function isOptionValue(arg, args) {
  const index = args.indexOf(arg)
  if (index === 0) return false
  
  const prevArg = args[index - 1]
  return ['-c', '--count', '-i', '--interval', '-W', '--timeout', '-s', '--size', '-t', '--ttl'].includes(prevArg)
}