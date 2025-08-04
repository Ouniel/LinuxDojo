/**
 * netstat - 显示网络连接、路由表和网络接口统计信息
 */

export const netstat = {
  name: 'netstat',
  description: 'Display network connections, routing tables, interface statistics|显示网络连接、路由表和网络接口统计信息',
  options: [
    {
      name: '-a',
      flag: '-a',
      type: 'boolean',
      description: 'Display all sockets (default: connected)|显示所有套接字(默认:已连接)',
      group: 'basic'
    },
    {
      name: '-l',
      flag: '-l',
      type: 'boolean',
      description: 'Display listening server sockets|显示监听的服务器套接字',
      group: 'basic'
    },
    {
      name: '-n',
      flag: '-n',
      type: 'boolean',
      description: 'Don\'t resolve names (show numerical addresses)|不解析名称(显示数字地址)',
      group: 'output'
    },
    {
      name: '-p',
      flag: '-p',
      type: 'boolean',
      description: 'Display PID/Program name for sockets|显示套接字的PID/程序名',
      group: 'output'
    },
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
      name: '-x',
      flag: '-x',
      type: 'boolean',
      description: 'Display Unix domain sockets|显示Unix域套接字',
      group: 'protocol'
    },
    {
      name: '-r',
      flag: '-r',
      type: 'boolean',
      description: 'Display routing table|显示路由表',
      group: 'routing'
    },
    {
      name: '-i',
      flag: '-i',
      type: 'boolean',
      description: 'Display interface table|显示接口表',
      group: 'interface'
    },
    {
      name: '-g',
      flag: '-g',
      type: 'boolean',
      description: 'Display multicast group memberships|显示多播组成员',
      group: 'multicast'
    },
    {
      name: '-s',
      flag: '-s',
      type: 'boolean',
      description: 'Display networking statistics (like SNMP)|显示网络统计信息(类似SNMP)',
      group: 'statistics'
    },
    {
      name: '-v',
      flag: '-v',
      type: 'boolean',
      description: 'Be verbose|详细输出',
      group: 'output'
    },
    {
      name: '-W',
      flag: '-W',
      type: 'boolean',
      description: 'Don\'t truncate IP addresses|不截断IP地址',
      group: 'output'
    },
    {
      name: '-e',
      flag: '-e',
      type: 'boolean',
      description: 'Display extended information|显示扩展信息',
      group: 'output'
    },
    {
      name: '-o',
      flag: '-o',
      type: 'boolean',
      description: 'Display timers|显示计时器',
      group: 'output'
    },
    {
      name: '-c',
      flag: '-c',
      type: 'boolean',
      description: 'Continuous listing|连续列表',
      group: 'behavior'
    },
    {
      name: '-M',
      flag: '-M',
      type: 'boolean',
      description: 'Display masqueraded connections|显示伪装连接',
      group: 'advanced'
    },
    {
      name: '-F',
      flag: '-F',
      type: 'boolean',
      description: 'Display Forwarding Information Base (default)|显示转发信息库(默认)',
      group: 'advanced'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return netstat.help
    }

    const all = args.includes('-a') || args.includes('--all')
    const listening = args.includes('-l') || args.includes('--listening')
    const numeric = args.includes('-n') || args.includes('--numeric')
    const programs = args.includes('-p') || args.includes('--programs')
    const tcp = args.includes('-t') || args.includes('--tcp')
    const udp = args.includes('-u') || args.includes('--udp')
    const unix = args.includes('-x') || args.includes('--unix')
    const route = args.includes('-r') || args.includes('--route')
    const interfaces = args.includes('-i') || args.includes('--interfaces')
    const groups = args.includes('-g') || args.includes('--groups')
    const masquerade = args.includes('-M') || args.includes('--masquerade')
    const statistics = args.includes('-s') || args.includes('--statistics')
    const verbose = args.includes('-v') || args.includes('--verbose')
    const wide = args.includes('-W') || args.includes('--wide')
    const extend = args.includes('-e') || args.includes('--extend')
    const timers = args.includes('-o') || args.includes('--timers')
    const continuous = args.includes('-c') || args.includes('--continuous')
    const fib = args.includes('-F') || args.includes('--fib')

    const results = []

    try {
      // 显示路由表
      if (route) {
        results.push(...generateRouteTable(numeric))
        return results.join('\n')
      }

      // 显示网络接口
      if (interfaces) {
        results.push(...generateInterfaceStats(extend))
        return results.join('\n')
      }

      // 显示组播信息
      if (groups) {
        results.push(...generateGroupInfo())
        return results.join('\n')
      }

      // 显示统计信息
      if (statistics) {
        results.push(...generateNetworkStats(tcp, udp, verbose))
        return results.join('\n')
      }

      // 显示网络连接
      const connections = generateConnections({
        all,
        listening,
        numeric,
        programs,
        tcp,
        udp,
        unix,
        wide,
        extend,
        timers
      })

      results.push(...connections)

      // 连续模式
      if (continuous) {
        results.push('')
        results.push('(Press Ctrl+C to stop continuous display)')
      }

    } catch (error) {
      return `netstat: ${error.message}`
    }

    return results.join('\n')
  },
  description: 'Display network connections, routing tables, interface statistics|显示网络连接、路由表和网络接口统计信息',
  category: 'network',
  requiresArgs: false,
  examples: [
    'netstat',
    'netstat -a',
    'netstat -l',
    'netstat -t',
    'netstat -r',
    'netstat -i',
    'netstat -s'
  ],
  help: `Usage: netstat [OPTION]...
Print network connections, routing tables, interface statistics, masquerade connections, and multicast memberships

  -a, --all                display all sockets (default: connected)
  -A, --protocol=FAMILY    display sockets of type FAMILY
  -c, --continuous         continuous listing
  -C, --cache              display routing cache instead of FIB
  -e, --extend             display extended information
  -F, --fib                display Forwarding Information Base (default)
  -g, --groups             display multicast group memberships
  -h, --help               display this help and exit
  -i, --interfaces         display interface table
  -l, --listening          display listening server sockets
  -M, --masquerade         display masqueraded connections
  -n, --numeric            don't resolve names
  -N, --symbolic           resolve hardware names
  -o, --timers             display timers
  -p, --programs           display PID/Program name for sockets
  -r, --route              display routing table
  -s, --statistics         display networking statistics (like SNMP)
  -t, --tcp                display TCP sockets
  -u, --udp                display UDP sockets
  -v, --verbose            be verbose
  -w, --raw                display RAW sockets
  -x, --unix               display Unix domain sockets
  -W, --wide               don't truncate IP addresses
      --numeric-hosts      don't resolve hosts
      --numeric-ports      don't resolve ports
      --numeric-users      don't resolve users

Examples:
  netstat -a           Show all connections and listening ports
  netstat -l           Show only listening ports
  netstat -t           Show only TCP connections
  netstat -r           Show routing table
  netstat -i           Show interface statistics
  netstat -s           Show network statistics`
}

// 生成网络连接信息
function generateConnections(options) {
  const results = []
  
  // 表头
  let header = 'Proto Recv-Q Send-Q '
  if (options.wide) {
    header += 'Local Address           Foreign Address         State'
  } else {
    header += 'Local Address           Foreign Address         State'
  }
  
  if (options.programs) {
    header += '       PID/Program name'
  }
  
  if (options.timers) {
    header += '   Timer'
  }
  
  results.push(header)

  // TCP连接
  if (!options.udp && !options.unix) {
    const tcpConnections = generateTCPConnections(options)
    results.push(...tcpConnections)
  }

  // UDP连接
  if (options.udp || options.all) {
    const udpConnections = generateUDPConnections(options)
    results.push(...udpConnections)
  }

  // Unix域套接字
  if (options.unix || options.all) {
    results.push('')
    results.push('Active UNIX domain sockets (servers and established)')
    results.push('Proto RefCnt Flags       Type       State         I-Node   Path')
    const unixSockets = generateUnixSockets(options)
    results.push(...unixSockets)
  }

  return results
}

// 生成TCP连接
function generateTCPConnections(options) {
  const connections = []
  const states = ['ESTABLISHED', 'LISTEN', 'TIME_WAIT', 'CLOSE_WAIT', 'FIN_WAIT1', 'FIN_WAIT2', 'SYN_SENT', 'SYN_RECV']
  
  // 生成一些示例连接
  const sampleConnections = [
    { local: '0.0.0.0:22', foreign: '0.0.0.0:*', state: 'LISTEN', pid: '1234/sshd' },
    { local: '0.0.0.0:80', foreign: '0.0.0.0:*', state: 'LISTEN', pid: '5678/nginx' },
    { local: '127.0.0.1:3306', foreign: '0.0.0.0:*', state: 'LISTEN', pid: '9012/mysqld' },
    { local: '192.168.1.100:22', foreign: '192.168.1.50:54321', state: 'ESTABLISHED', pid: '1234/sshd' },
    { local: '192.168.1.100:80', foreign: '203.0.113.10:45678', state: 'ESTABLISHED', pid: '5678/nginx' },
    { local: '192.168.1.100:443', foreign: '198.51.100.20:56789', state: 'TIME_WAIT', pid: '-' }
  ]

  for (const conn of sampleConnections) {
    // 过滤选项
    if (options.listening && conn.state !== 'LISTEN') continue
    if (!options.all && !options.listening && conn.state === 'LISTEN') continue

    let line = `tcp        0      0 `
    
    // 地址格式化
    const localAddr = options.numeric ? conn.local : resolveAddress(conn.local)
    const foreignAddr = options.numeric ? conn.foreign : resolveAddress(conn.foreign)
    
    line += `${localAddr.padEnd(23)} ${foreignAddr.padEnd(23)} ${conn.state}`
    
    if (options.programs) {
      line += `   ${conn.pid}`
    }
    
    if (options.timers) {
      line += '   off (0.00/0/0)'
    }
    
    connections.push(line)
  }

  return connections
}

// 生成UDP连接
function generateUDPConnections(options) {
  const connections = []
  
  const sampleConnections = [
    { local: '0.0.0.0:53', foreign: '0.0.0.0:*', pid: '3456/named' },
    { local: '0.0.0.0:67', foreign: '0.0.0.0:*', pid: '7890/dhcpd' },
    { local: '127.0.0.1:323', foreign: '0.0.0.0:*', pid: '2345/chronyd' },
    { local: '192.168.1.100:68', foreign: '0.0.0.0:*', pid: '4567/dhclient' }
  ]

  for (const conn of sampleConnections) {
    let line = `udp        0      0 `
    
    const localAddr = options.numeric ? conn.local : resolveAddress(conn.local)
    const foreignAddr = options.numeric ? conn.foreign : resolveAddress(conn.foreign)
    
    line += `${localAddr.padEnd(23)} ${foreignAddr.padEnd(23)} `
    
    if (options.programs) {
      line += `   ${conn.pid}`
    }
    
    connections.push(line)
  }

  return connections
}

// 生成Unix域套接字
function generateUnixSockets(options) {
  const sockets = []
  
  const sampleSockets = [
    { type: 'STREAM', state: 'LISTENING', inode: '12345', path: '/run/systemd/private' },
    { type: 'STREAM', state: 'LISTENING', inode: '23456', path: '/var/run/docker.sock' },
    { type: 'STREAM', state: 'LISTENING', inode: '34567', path: '/tmp/.X11-unix/X0' },
    { type: 'DGRAM', state: '', inode: '45678', path: '/run/systemd/notify' },
    { type: 'STREAM', state: 'CONNECTED', inode: '56789', path: '' }
  ]

  for (const socket of sockets) {
    let line = `unix  2      [ `
    
    if (socket.state === 'LISTENING') {
      line += 'ACC     '
    } else if (socket.state === 'CONNECTED') {
      line += '        '
    } else {
      line += '        '
    }
    
    line += `] ${socket.type.padEnd(10)} ${socket.state.padEnd(13)} ${socket.inode.padEnd(8)} ${socket.path}`
    
    sockets.push(line)
  }

  return sockets
}

// 生成路由表
function generateRouteTable(numeric) {
  const results = []
  
  results.push('Kernel IP routing table')
  results.push('Destination     Gateway         Genmask         Flags Metric Ref    Use Iface')
  
  const routes = [
    { dest: '0.0.0.0', gateway: '192.168.1.1', genmask: '0.0.0.0', flags: 'UG', metric: '100', ref: '0', use: '0', iface: 'eth0' },
    { dest: '192.168.1.0', gateway: '0.0.0.0', genmask: '255.255.255.0', flags: 'U', metric: '100', ref: '0', use: '0', iface: 'eth0' },
    { dest: '127.0.0.0', gateway: '0.0.0.0', genmask: '255.0.0.0', flags: 'U', metric: '0', ref: '0', use: '0', iface: 'lo' }
  ]

  for (const route of routes) {
    let dest = route.dest
    let gateway = route.gateway
    
    if (!numeric) {
      if (dest === '0.0.0.0') dest = 'default'
      if (gateway === '0.0.0.0') gateway = '*'
    }
    
    const line = `${dest.padEnd(15)} ${gateway.padEnd(15)} ${route.genmask.padEnd(15)} ${route.flags.padEnd(5)} ${route.metric.padEnd(6)} ${route.ref.padEnd(6)} ${route.use.padEnd(6)} ${route.iface}`
    results.push(line)
  }

  return results
}

// 生成接口统计信息
function generateInterfaceStats(extend) {
  const results = []
  
  results.push('Kernel Interface table')
  
  if (extend) {
    results.push('Iface      MTU    RX-OK RX-ERR RX-DRP RX-OVR    TX-OK TX-ERR TX-DRP TX-OVR Flg')
  } else {
    results.push('Iface   MTU Met   RX-OK RX-ERR RX-DRP RX-OVR    TX-OK TX-ERR TX-DRP TX-OVR Flg')
  }
  
  const interfaces = [
    { name: 'eth0', mtu: '1500', met: '0', rxOk: '1234567', rxErr: '0', rxDrp: '0', rxOvr: '0', txOk: '987654', txErr: '0', txDrp: '0', txOvr: '0', flg: 'BMRU' },
    { name: 'lo', mtu: '65536', met: '0', rxOk: '12345', rxErr: '0', rxDrp: '0', rxOvr: '0', txOk: '12345', txErr: '0', txDrp: '0', txOvr: '0', flg: 'LRU' },
    { name: 'wlan0', mtu: '1500', met: '0', rxOk: '567890', rxErr: '1', rxDrp: '0', rxOvr: '0', txOk: '432109', txErr: '0', txDrp: '0', txOvr: '0', flg: 'BMRU' }
  ]

  for (const iface of interfaces) {
    let line
    if (extend) {
      line = `${iface.name.padEnd(10)} ${iface.mtu.padEnd(6)} ${iface.rxOk.padEnd(9)} ${iface.rxErr.padEnd(6)} ${iface.rxDrp.padEnd(6)} ${iface.rxOvr.padEnd(9)} ${iface.txOk.padEnd(9)} ${iface.txErr.padEnd(6)} ${iface.txDrp.padEnd(6)} ${iface.txOvr.padEnd(6)} ${iface.flg}`
    } else {
      line = `${iface.name.padEnd(7)} ${iface.mtu.padEnd(5)} ${iface.met.padEnd(3)} ${iface.rxOk.padEnd(9)} ${iface.rxErr.padEnd(6)} ${iface.rxDrp.padEnd(6)} ${iface.rxOvr.padEnd(9)} ${iface.txOk.padEnd(9)} ${iface.txErr.padEnd(6)} ${iface.txDrp.padEnd(6)} ${iface.txOvr.padEnd(6)} ${iface.flg}`
    }
    results.push(line)
  }

  return results
}

// 生成组播信息
function generateGroupInfo() {
  const results = []
  
  results.push('IPv6/IPv4 Group Memberships')
  results.push('Interface       RefCnt Group')
  
  const groups = [
    { iface: 'lo', refcnt: '1', group: '224.0.0.1' },
    { iface: 'eth0', refcnt: '1', group: '224.0.0.1' },
    { iface: 'eth0', refcnt: '1', group: '224.0.0.251' },
    { iface: 'lo', refcnt: '1', group: 'ff02::1' },
    { iface: 'eth0', refcnt: '1', group: 'ff02::1' }
  ]

  for (const group of groups) {
    const line = `${group.iface.padEnd(15)} ${group.refcnt.padEnd(6)} ${group.group}`
    results.push(line)
  }

  return results
}

// 生成网络统计信息
function generateNetworkStats(tcp, udp, verbose) {
  const results = []
  
  if (!tcp && !udp) {
    // 显示所有统计信息
    results.push('Ip:')
    results.push('    Forwarding: 2')
    results.push('    DefaultTTL: 64')
    results.push('    InReceives: 1234567')
    results.push('    InHdrErrors: 0')
    results.push('    InAddrErrors: 12')
    results.push('    ForwDatagrams: 0')
    results.push('    InUnknownProtos: 0')
    results.push('    InDiscards: 0')
    results.push('    InDelivers: 1234555')
    results.push('    OutRequests: 987654')
    results.push('    OutDiscards: 0')
    results.push('    OutNoRoutes: 0')
    results.push('    ReasmTimeout: 30')
    results.push('    ReasmReqds: 0')
    results.push('    ReasmOKs: 0')
    results.push('    ReasmFails: 0')
    results.push('    FragOKs: 0')
    results.push('    FragFails: 0')
    results.push('    FragCreates: 0')
    
    results.push('Icmp:')
    results.push('    InMsgs: 123')
    results.push('    InErrors: 0')
    results.push('    InCsumErrors: 0')
    results.push('    InDestUnreachs: 45')
    results.push('    InTimeExcds: 0')
    results.push('    InParmProbs: 0')
    results.push('    InSrcQuenchs: 0')
    results.push('    InRedirects: 0')
    results.push('    InEchos: 67')
    results.push('    InEchoReps: 11')
    results.push('    InTimestamps: 0')
    results.push('    InTimestampReps: 0')
    results.push('    InAddrMasks: 0')
    results.push('    InAddrMaskReps: 0')
    results.push('    OutMsgs: 78')
    results.push('    OutErrors: 0')
    results.push('    OutDestUnreachs: 0')
    results.push('    OutTimeExcds: 0')
    results.push('    OutParmProbs: 0')
    results.push('    OutSrcQuenchs: 0')
    results.push('    OutRedirects: 0')
    results.push('    OutEchos: 11')
    results.push('    OutEchoReps: 67')
    results.push('    OutTimestamps: 0')
    results.push('    OutTimestampReps: 0')
    results.push('    OutAddrMasks: 0')
    results.push('    OutAddrMaskReps: 0')
  }
  
  if (tcp || !udp) {
    results.push('Tcp:')
    results.push('    RtoAlgorithm: 1')
    results.push('    RtoMin: 200')
    results.push('    RtoMax: 120000')
    results.push('    MaxConn: -1')
    results.push('    ActiveOpens: 12345')
    results.push('    PassiveOpens: 6789')
    results.push('    AttemptFails: 123')
    results.push('    EstabResets: 45')
    results.push('    CurrEstab: 12')
    results.push('    InSegs: 987654')
    results.push('    OutSegs: 876543')
    results.push('    RetransSegs: 234')
    results.push('    InErrs: 0')
    results.push('    OutRsts: 56')
    results.push('    InCsumErrors: 0')
  }
  
  if (udp || !tcp) {
    results.push('Udp:')
    results.push('    InDatagrams: 54321')
    results.push('    NoPorts: 789')
    results.push('    InErrors: 0')
    results.push('    OutDatagrams: 43210')
    results.push('    RcvbufErrors: 0')
    results.push('    SndbufErrors: 0')
    results.push('    InCsumErrors: 0')
    results.push('    IgnoredMulti: 0')
  }

  return results
}

// 解析地址（模拟DNS解析）
function resolveAddress(address) {
  if (address.includes('0.0.0.0:*')) {
    return '*:*'
  }
  
  // 简单的端口名称解析
  const portNames = {
    '22': 'ssh',
    '80': 'http',
    '443': 'https',
    '53': 'domain',
    '25': 'smtp',
    '110': 'pop3',
    '143': 'imap',
    '21': 'ftp',
    '23': 'telnet',
    '3306': 'mysql'
  }
  
  const [ip, port] = address.split(':')
  const portName = portNames[port] || port
  
  // 简单的主机名解析
  if (ip === '127.0.0.1') {
    return `localhost:${portName}`
  } else if (ip === '0.0.0.0') {
    return `*:${portName}`
  }
  
  return `${ip}:${portName}`
}