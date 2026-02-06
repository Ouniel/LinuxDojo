import { formatHelp } from '../utils/helpFormatter.js'

export const traceroute = {
  name: 'traceroute',
  description: 'Trace the route to a network host|追踪到网络主机的路由',
  category: 'network',
  
  options: [
    // 基本选项组
    {
      flag: '-4',
      description: '强制使用IPv4',
      type: 'boolean',
      group: '协议选项'
    },
    {
      flag: '-6',
      description: '强制使用IPv6',
      type: 'boolean',
      group: '协议选项'
    },
    {
      flag: '-I',
      description: '使用ICMP ECHO进行探测',
      type: 'boolean',
      group: '协议选项'
    },
    {
      flag: '-T',
      description: '使用TCP SYN进行探测',
      type: 'boolean',
      group: '协议选项'
    },
    {
      flag: '-U',
      description: '使用UDP（默认）',
      type: 'boolean',
      group: '协议选项'
    },
    
    // 探测选项组
    {
      flag: '-m',
      longFlag: '--max-hops',
      description: '设置最大跳数',
      type: 'input',
      inputKey: 'max_hops',
      placeholder: '跳数（默认30）',
      default: '30',
      group: '探测选项'
    },
    {
      flag: '-q',
      longFlag: '--queries',
      description: '每跳的探测次数',
      type: 'input',
      inputKey: 'queries',
      placeholder: '次数（默认3）',
      default: '3',
      group: '探测选项'
    },
    {
      flag: '-w',
      longFlag: '--wait',
      description: '等待响应的时间（秒）',
      type: 'input',
      inputKey: 'wait_time',
      placeholder: '秒数（默认5）',
      default: '5',
      group: '探测选项'
    },
    {
      flag: '-f',
      longFlag: '--first-hop',
      description: '设置起始TTL',
      type: 'input',
      inputKey: 'first_ttl',
      placeholder: 'TTL值（默认1）',
      default: '1',
      group: '探测选项'
    },
    
    // 显示选项组
    {
      flag: '-n',
      description: '不解析主机名（显示IP地址）',
      type: 'boolean',
      group: '显示选项'
    },
    {
      flag: '-p',
      longFlag: '--port',
      description: '设置目标端口（TCP/UDP）',
      type: 'input',
      inputKey: 'port',
      placeholder: '端口号',
      group: '显示选项'
    },
    
    // 目标参数
    {
      inputKey: 'target',
      description: '目标主机',
      type: 'input',
      placeholder: '主机名或IP地址（如 google.com）',
      required: true
    }
  ],
  
  execute(args, context) {
    if (args.length === 0 || args.includes('--help')) {
      return formatHelp({
        name: 'traceroute',
        description: 'Trace the route to a network host|追踪到网络主机的路由',
        usage: 'traceroute [OPTIONS] HOST|traceroute [选项] 主机',
        options: [
          '-4                   Force IPv4|强制使用IPv4',
          '-6                   Force IPv6|强制使用IPv6',
          '-I                   Use ICMP ECHO|使用ICMP ECHO',
          '-T                   Use TCP SYN|使用TCP SYN',
          '-m, --max-hops NUM   Max hops|最大跳数',
          '-q, --queries NUM    Queries per hop|每跳查询次数',
          '-w, --wait SEC       Wait time|等待时间',
          '-f, --first-hop NUM  Start TTL|起始TTL',
          '-n                   No DNS lookup|不进行DNS解析',
          '-p, --port PORT      Target port|目标端口'
        ],
        examples: [
          'traceroute google.com|追踪到google.com的路由',
          'traceroute -n 8.8.8.8|追踪到8.8.8.8（不解析主机名）',
          'traceroute -I example.com|使用ICMP追踪',
          'traceroute -m 15 -q 1 target.com|最大15跳，每跳1次探测'
        ]
      })
    }

    const target = args[args.length - 1]
    const useIcmp = args.includes('-I')
    const noDns = args.includes('-n')
    
    // 模拟路由追踪结果
    const hops = [
      { hop: 1, host: '192.168.1.1', name: noDns ? null : 'router.local', times: ['1.2ms', '1.1ms', '1.3ms'] },
      { hop: 2, host: '10.0.0.1', name: noDns ? null : 'isp-gateway.net', times: ['5.4ms', '5.2ms', '5.5ms'] },
      { hop: 3, host: '172.16.0.1', name: noDns ? null : 'core-router.isp.net', times: ['8.1ms', '7.9ms', '8.0ms'] },
      { hop: 4, host: '203.0.113.1', name: noDns ? null : 'ixp-point.net', times: ['15.2ms', '15.0ms', '15.3ms'] },
      { hop: 5, host: '198.51.100.1', name: noDns ? null : 'backbone.isp.net', times: ['22.1ms', '21.8ms', '22.0ms'] },
      { hop: 6, host: '192.0.2.1', name: noDns ? null : 'peer-network.net', times: ['28.5ms', '28.3ms', '28.4ms'] },
      { hop: 7, host: '8.8.8.8', name: noDns ? null : 'dns.google', times: ['35.2ms', '35.0ms', '35.1ms'] }
    ]

    let output = `traceroute to ${target} (${target}), 30 hops max, 60 byte packets\n`
    
    hops.forEach(hop => {
      const hostDisplay = hop.name && !noDns ? `${hop.name} (${hop.host})` : hop.host
      const timesDisplay = hop.times.map(t => t.padStart(6)).join('  ')
      output += `${hop.hop.toString().padStart(2)}  ${hostDisplay}  ${timesDisplay}\n`
    })

    return output
  }
}

export default traceroute
