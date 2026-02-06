import { formatHelp } from '../utils/helpFormatter.js'

export const dig = {
  name: 'dig',
  description: 'DNS lookup utility|DNS查询工具',
  category: 'network',
  
  options: [
    // 查询类型组
    {
      flag: '-t',
      longFlag: '--type',
      description: '查询类型',
      type: 'select',
      inputKey: 'query_type',
      options: ['A', 'AAAA', 'MX', 'NS', 'SOA', 'TXT', 'CNAME', 'PTR', 'ANY'],
      optionLabels: ['A记录(IPv4)', 'AAAA记录(IPv6)', 'MX记录(邮件)', 'NS记录(名称服务器)', 'SOA记录', 'TXT记录', 'CNAME记录', 'PTR记录', 'ANY(所有)'],
      default: 'A',
      group: '查询选项'
    },
    
    // 服务器选项组
    {
      flag: '@',
      description: '指定DNS服务器',
      type: 'input',
      inputKey: 'dns_server',
      placeholder: 'DNS服务器（如 @8.8.8.8 或 @ns1.example.com）',
      group: '服务器选项'
    },
    
    // 输出选项组
    {
      flag: '+short',
      description: '简短输出（仅显示答案部分）',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '+trace',
      description: '追踪DNS解析过程',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '+noall',
      description: '不显示任何内容',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '+answer',
      description: '显示答案部分',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '+stats',
      description: '显示统计信息',
      type: 'boolean',
      group: '输出选项'
    },
    
    // 其他选项组
    {
      flag: '-x',
      description: '反向DNS查询（IP到域名）',
      type: 'boolean',
      group: '其他选项'
    },
    {
      flag: '-4',
      description: '仅使用IPv4',
      type: 'boolean',
      group: '其他选项'
    },
    {
      flag: '-6',
      description: '仅使用IPv6',
      type: 'boolean',
      group: '其他选项'
    },
    
    // 目标参数
    {
      inputKey: 'domain',
      description: '要查询的域名或IP',
      type: 'input',
      placeholder: '域名（如 example.com）或IP（反向查询）',
      required: true
    }
  ],
  
  execute(args, context) {
    if (args.length === 0 || args.includes('--help')) {
      return formatHelp({
        name: 'dig',
        description: 'DNS lookup utility|DNS查询工具',
        usage: 'dig [OPTIONS] [@server] domain [type]|dig [选项] [@服务器] 域名 [类型]',
        options: [
          '-t, --type TYPE      Query type (A, AAAA, MX, NS, etc.)|查询类型',
          '@server              DNS server to query|要查询的DNS服务器',
          '+short               Short output|简短输出',
          '+trace               Trace delegation path|追踪解析路径',
          '+noall +answer       Show only answer|仅显示答案',
          '-x                   Reverse lookup|反向查询',
          '-4                   Use IPv4 only|仅使用IPv4',
          '-6                   Use IPv6 only|仅使用IPv6'
        ],
        examples: [
          'dig example.com|查询example.com的A记录',
          'dig @8.8.8.8 example.com MX|使用Google DNS查询MX记录',
          'dig -x 8.8.8.8|反向查询8.8.8.8',
          'dig example.com +short|简短输出',
          'dig example.com ANY|查询所有记录类型'
        ]
      })
    }

    // 解析参数
    let domain = ''
    let dnsServer = ''
    let queryType = 'A'
    let shortOutput = false
    let reverseLookup = false

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      if (arg.startsWith('@')) {
        dnsServer = arg.substring(1)
      } else if (arg === '-t' && i + 1 < args.length) {
        queryType = args[++i]
      } else if (arg === '+short') {
        shortOutput = true
      } else if (arg === '-x') {
        reverseLookup = true
      } else if (!arg.startsWith('-') && !arg.startsWith('+')) {
        domain = arg
      }
    }

    if (!domain) {
      return 'dig: 请指定要查询的域名'
    }

    // 模拟DNS查询结果
    const server = dnsServer || '127.0.0.53'
    
    if (shortOutput) {
      if (queryType === 'A') {
        return '93.184.216.34\n'
      } else if (queryType === 'AAAA') {
        return '2606:2800:220:1:248:1893:25c8:1946\n'
      } else if (queryType === 'MX') {
        return '10 mail.example.com.\n20 mail2.example.com.\n'
      } else if (queryType === 'NS') {
        return 'ns1.example.com.\nns2.example.com.\n'
      }
      return '93.184.216.34\n'
    }

    let output = `; <<>> DiG 9.18.12 <<>> ${domain} ${queryType}${dnsServer ? ' @' + dnsServer : ''}\n`
    output += `;; global options: +cmd\n`
    output += `;; Got answer:\n`
    output += `;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345\n`
    output += `;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1\n\n`
    
    output += `;; OPT PSEUDOSECTION:\n`
    output += `; EDNS: version: 0, flags:; udp: 65494\n`
    output += `;; QUESTION SECTION:\n`
    output += `;${domain}.\t\tIN\t${queryType}\n\n`
    
    output += `;; ANSWER SECTION:\n`
    
    if (queryType === 'A') {
      output += `${domain}.\t\t86400\tIN\tA\t93.184.216.34\n`
    } else if (queryType === 'AAAA') {
      output += `${domain}.\t\t86400\tIN\tAAAA\t2606:2800:220:1:248:1893:25c8:1946\n`
    } else if (queryType === 'MX') {
      output += `${domain}.\t\t86400\tIN\tMX\t10 mail.${domain}.\n`
      output += `${domain}.\t\t86400\tIN\tMX\t20 mail2.${domain}.\n`
    } else if (queryType === 'NS') {
      output += `${domain}.\t\t86400\tIN\tNS\tns1.${domain}.\n`
      output += `${domain}.\t\t86400\tIN\tNS\tns2.${domain}.\n`
    } else if (queryType === 'TXT') {
      output += `${domain}.\t\t86400\tIN\tTXT\t"v=spf1 include:_spf.${domain} ~all"\n`
    } else if (queryType === 'CNAME') {
      output += `www.${domain}.\t\t86400\tIN\tCNAME\t${domain}.\n`
    } else if (queryType === 'SOA') {
      output += `${domain}.\t\t86400\tIN\tSOA\tns1.${domain}. admin.${domain}. 2024010101 3600 600 86400 3600\n`
    }
    
    output += `\n;; Query time: 45 msec\n`
    output += `;; SERVER: ${server}#53(${server})\n`
    output += `;; WHEN: ${new Date().toString()}\n`
    output += `;; MSG SIZE  rcvd: 56\n`

    return output
  }
}

export default dig
