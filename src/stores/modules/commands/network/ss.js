/**
 * ss 命令实现
 * 显示套接字统计信息
 */

export const ss = {
  name: 'ss',
  description: 'Display socket statistics|显示套接字统计信息',
  options: [
    {
      name: '-t',
      flag: '-t',
      type: 'boolean',
      description: 'Display TCP sockets|显示TCP套接字',
      group: 'protocol'
    },
    {
      name: '-u',
      flag: '-u',
      type: 'boolean',
      description: 'Display UDP sockets|显示UDP套接字',
      group: 'protocol'
    },
    {
      name: '-l',
      flag: '-l',
      type: 'boolean',
      description: 'Display only listening sockets|仅显示监听套接字',
      group: 'filter'
    },
    {
      name: '-a',
      flag: '-a',
      type: 'boolean',
      description: 'Display both listening and non-listening sockets|显示监听和非监听套接字',
      group: 'filter'
    },
    {
      name: '-p',
      flag: '-p',
      type: 'boolean',
      description: 'Show process using socket|显示使用套接字的进程',
      group: 'output'
    },
    {
      name: '-n',
      flag: '-n',
      type: 'boolean',
      description: 'Don\'t resolve service names|不解析服务名称',
      group: 'output'
    },
    {
      name: '-s',
      flag: '-s',
      type: 'boolean',
      description: 'Print summary statistics|打印摘要统计信息',
      group: 'output'
    },
    {
      name: '-e',
      flag: '-e',
      type: 'boolean',
      description: 'Show detailed socket information|显示详细套接字信息',
      group: 'output'
    },
    {
      name: '-4',
      flag: '-4',
      type: 'boolean',
      description: 'Display IPv4 sockets only|仅显示IPv4套接字',
      group: 'protocol'
    },
    {
      name: '-6',
      flag: '-6',
      type: 'boolean',
      description: 'Display IPv6 sockets only|仅显示IPv6套接字',
      group: 'protocol'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return ss.help
    }
    try {
      // 解析选项
      let showTcp = false
      let showUdp = false
      let showListening = false
      let showAll = false
      let showProcesses = false
      let showNumeric = false
      let showSummary = false
      let showExtended = false
      
      if (args.length === 0) {
        showTcp = true // 默认显示TCP
      }
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        if (arg === '-t' || arg === '--tcp') {
          showTcp = true
        } else if (arg === '-u' || arg === '--udp') {
          showUdp = true
        } else if (arg === '-l' || arg === '--listening') {
          showListening = true
        } else if (arg === '-a' || arg === '--all') {
          showAll = true
        } else if (arg === '-p' || arg === '--processes') {
          showProcesses = true
        } else if (arg === '-n' || arg === '--numeric') {
          showNumeric = true
        } else if (arg === '-s' || arg === '--summary') {
          showSummary = true
        } else if (arg === '-e' || arg === '--extended') {
          showExtended = true
        } else if (arg.startsWith('-')) {
          return `ss: invalid option: ${arg}|ss: 无效选项: ${arg}`
        }
      }
      
      // 如果没有指定协议，默认显示所有
      if (!showTcp && !showUdp) {
        showTcp = true
        showUdp = true
      }
      
      if (showSummary) {
        return generateSummary()
      }
      
      const results = []
      
      // 生成表头
      const headers = generateHeaders(showProcesses, showExtended)
      results.push(headers)
      results.push('')
      
      // 生成套接字信息
      if (showTcp) {
        const tcpSockets = generateTcpSockets(showListening, showAll, showProcesses, showNumeric, showExtended)
        results.push(...tcpSockets)
      }
      
      if (showUdp) {
        const udpSockets = generateUdpSockets(showListening, showAll, showProcesses, showNumeric, showExtended)
        results.push(...udpSockets)
      }
      
      return results.join('\n')
      
    } catch (error) {
      return `ss: ${error.message}`
    }
  },
  description: 'Display socket statistics|显示套接字统计信息',
  category: 'network',
  requiresArgs: false,
  examples: [
    'ss -tuln',
    'ss -tp',
    'ss -s',
    'ss -a'
  ],
  
  help: `Usage: ss [options] [filter]

Display socket statistics|显示套接字统计信息

ss is used to dump socket statistics. It allows showing information
similar to netstat. It can display more TCP and state information
than other tools.
ss 用于转储套接字统计信息。它允许显示类似于netstat的信息。

Options|选项:
  -t, --tcp           Display TCP sockets|显示TCP套接字
  -u, --udp           Display UDP sockets|显示UDP套接字
  -l, --listening     Display only listening sockets|仅显示监听套接字
  -a, --all           Display both listening and non-listening sockets|显示监听和非监听套接字
  -p, --processes     Show process using socket|显示使用套接字的进程
  -n, --numeric       Don't resolve service names|不解析服务名称
  -s, --summary       Print summary statistics|打印摘要统计信息
  -e, --extended      Show detailed socket information|显示详细套接字信息
  -4, --ipv4          Display IPv4 sockets only|仅显示IPv4套接字
  -6, --ipv6          Display IPv6 sockets only|仅显示IPv6套接字

Socket States (TCP)|套接字状态 (TCP):
  LISTEN          Listening for connections|监听连接
  ESTAB           Established connection|已建立连接
  SYN-SENT        Actively trying to establish connection|主动尝试建立连接
  SYN-RECV        Connection request received|收到连接请求
  FIN-WAIT-1      Connection closed, waiting for remote FIN|连接已关闭，等待远程FIN
  FIN-WAIT-2      Connection closed, waiting for remote FIN|连接已关闭，等待远程FIN
  TIME-WAIT       Waiting for enough time to pass|等待足够时间过去
  CLOSE           Socket is not being used|套接字未被使用
  CLOSE-WAIT      Remote end has shut down|远程端已关闭
  LAST-ACK        Remote end shut down, socket closed|远程端关闭，套接字已关闭
  CLOSING         Both sockets shut down, waiting for all data|两个套接字都关闭，等待所有数据

Examples|示例:
  ss                      # Show established TCP connections|显示已建立的TCP连接
  ss -tuln                # Show all TCP and UDP listening ports|显示所有TCP和UDP监听端口
  ss -tp                  # Show TCP connections with processes|显示TCP连接及进程
  ss -s                   # Show socket statistics summary|显示套接字统计摘要
  ss -t state established # Show only established TCP connections|仅显示已建立的TCP连接

Notes|注意:
  - ss is faster than netstat for displaying socket information|ss比netstat更快地显示套接字信息
  - Provides more detailed information about socket states|提供关于套接字状态的更详细信息
  - Can filter sockets by state, address, and port|可以按状态、地址和端口过滤套接字
  - Supports both IPv4 and IPv6 sockets|支持IPv4和IPv6套接字`
}

// 生成表头
function generateHeaders(showProcesses, showExtended) {
  let header = 'Netid  State      Recv-Q Send-Q Local Address:Port               Peer Address:Port'
  if (showProcesses) {
    header += '               Process'
  }
  return header
}

// 生成摘要信息
function generateSummary() {
  const results = []
  results.push('Total: 1024 (kernel 2048)|总计: 1024 (内核 2048)')
  results.push('TCP:   512 (estab:256, closed:128, orphaned:8, synrecv:4, timewait:120/0)')
  results.push('TCP:   512 (已建立:256, 已关闭:128, 孤立:8, 同步接收:4, 时间等待:120/0)')
  results.push('')
  results.push('Transport Total     IP        IPv6')
  results.push('传输协议  总计      IP        IPv6')
  results.push('*         1024      896       128')
  results.push('RAW       16        12        4')
  results.push('UDP       64        48        16')
  results.push('TCP       512       384       128')
  results.push('INET      592       444       148')
  results.push('FRAG      0         0         0')
  
  return results.join('\n')
}

// 生成TCP套接字信息
function generateTcpSockets(showListening, showAll, showProcesses, showNumeric, showExtended) {
  const sockets = []
  
  // 监听套接字
  if (showListening || showAll) {
    sockets.push(formatSocket('tcp', 'LISTEN', '0.0.0.0:22', '*:*', showProcesses ? 'sshd/1234' : null))
    sockets.push(formatSocket('tcp', 'LISTEN', '0.0.0.0:80', '*:*', showProcesses ? 'nginx/5678' : null))
    sockets.push(formatSocket('tcp', 'LISTEN', '127.0.0.1:3306', '*:*', showProcesses ? 'mysqld/9012' : null))
    sockets.push(formatSocket('tcp', 'LISTEN', '0.0.0.0:443', '*:*', showProcesses ? 'nginx/5679' : null))
  }
  
  // 已建立连接
  if (showAll || !showListening) {
    sockets.push(formatSocket('tcp', 'ESTAB', '192.168.1.100:22', '192.168.1.50:54321', showProcesses ? 'sshd/2345' : null))
    sockets.push(formatSocket('tcp', 'ESTAB', '192.168.1.100:80', '203.0.113.10:45678', showProcesses ? 'nginx/5680' : null))
    sockets.push(formatSocket('tcp', 'TIME-WAIT', '192.168.1.100:80', '203.0.113.20:56789', null))
    sockets.push(formatSocket('tcp', 'CLOSE-WAIT', '192.168.1.100:443', '203.0.113.30:34567', showProcesses ? 'nginx/5681' : null))
  }
  
  return sockets
}

// 生成UDP套接字信息
function generateUdpSockets(showListening, showAll, showProcesses, showNumeric, showExtended) {
  const sockets = []
  
  sockets.push(formatSocket('udp', 'UNCONN', '0.0.0.0:53', '*:*', showProcesses ? 'named/3456' : null))
  sockets.push(formatSocket('udp', 'UNCONN', '0.0.0.0:67', '*:*', showProcesses ? 'dhcpd/4567' : null))
  sockets.push(formatSocket('udp', 'UNCONN', '127.0.0.1:123', '*:*', showProcesses ? 'ntpd/5678' : null))
  sockets.push(formatSocket('udp', 'UNCONN', '0.0.0.0:161', '*:*', showProcesses ? 'snmpd/6789' : null))
  
  return sockets
}

// 格式化套接字信息
function formatSocket(protocol, state, local, peer, process) {
  const recvQ = Math.floor(Math.random() * 1000)
  const sendQ = Math.floor(Math.random() * 1000)
  
  let line = `${protocol.padEnd(6)} ${state.padEnd(10)} ${recvQ.toString().padStart(6)} ${sendQ.toString().padStart(6)} ${local.padEnd(31)} ${peer.padEnd(31)}`
  
  if (process) {
    line += ` ${process}`
  }
  
  return line
}

export default ss
