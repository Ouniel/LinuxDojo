import { formatHelp } from '../utils/helpFormatter.js'

export const host = {
  name: 'host',
  description: 'DNS lookup utility|DNS查询工具（简单版）',
  category: 'network',
  
  options: [
    // 查询类型组
    {
      flag: '-t',
      description: '查询类型',
      type: 'select',
      inputKey: 'query_type',
      options: ['A', 'AAAA', 'MX', 'NS', 'SOA', 'TXT', 'CNAME', 'PTR', 'ANY'],
      optionLabels: ['A记录(IPv4)', 'AAAA记录(IPv6)', 'MX记录(邮件)', 'NS记录(名称服务器)', 'SOA记录', 'TXT记录', 'CNAME记录', 'PTR记录', 'ANY(所有)'],
      default: 'A',
      group: '查询选项'
    },
    
    // 服务器选项
    {
      flag: '-a',
      description: '显示所有信息（相当于 -v -t ANY）',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '-v',
      description: '详细输出模式',
      type: 'boolean',
      group: '输出选项'
    },
    {
      flag: '-d',
      description: '调试模式',
      type: 'boolean',
      group: '输出选项'
    },
    
    // 其他选项
    {
      flag: '-W',
      description: '等待回复的时间（秒）',
      type: 'input',
      inputKey: 'wait_time',
      placeholder: '秒数',
      default: '5',
      group: '其他选项'
    },
    {
      flag: '-R',
      description: '重试次数',
      type: 'input',
      inputKey: 'retry_count',
      placeholder: '次数',
      default: '1',
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
      placeholder: '域名或IP地址',
      required: true
    }
  ],
  
  execute(args, context) {
    if (args.length === 0 || args.includes('--help')) {
      return formatHelp({
        name: 'host',
        description: 'DNS lookup utility|DNS查询工具（简单版）',
        usage: 'host [OPTIONS] name [server]|host [选项] 名称 [服务器]',
        options: [
          '-t TYPE              Query type|查询类型',
          '-a                   All info (verbose)|显示所有信息',
          '-v                   Verbose output|详细输出',
          '-d                   Debug mode|调试模式',
          '-W SEC               Wait time|等待时间',
          '-R NUM               Retry count|重试次数',
          '-4                   IPv4 only|仅IPv4',
          '-6                   IPv6 only|仅IPv6'
        ],
        examples: [
          'host example.com|查询example.com',
          'host -t MX example.com|查询邮件服务器',
          'host -a example.com|显示所有信息',
          'host 93.184.216.34|反向查询IP',
          'host -v example.com|详细输出'
        ]
      })
    }

    // 解析参数
    let domain = ''
    let queryType = 'A'
    let verbose = false
    let allInfo = false

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      if (arg === '-t' && i + 1 < args.length) {
        queryType = args[++i]
      } else if (arg === '-v' || arg === '-a') {
        verbose = true
        if (arg === '-a') allInfo = true
      } else if (!arg.startsWith('-')) {
        domain = arg
      }
    }

    if (!domain) {
      return 'host: 请指定要查询的域名'
    }

    // 检查是否是IP地址（反向查询）
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/
    const isReverse = ipPattern.test(domain)

    if (isReverse) {
      return `${domain} domain name pointer example.com.`
    }

    // 模拟DNS查询结果
    let output = ''
    
    if (allInfo || verbose) {
      output += `Trying "${domain}"\n`
      output += `;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345\n`
      output += `;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 2, ADDITIONAL: 1\n\n`
    }

    if (queryType === 'A' || allInfo) {
      output += `${domain} has address 93.184.216.34\n`
    }
    
    if (queryType === 'AAAA' || allInfo) {
      output += `${domain} has IPv6 address 2606:2800:220:1:248:1893:25c8:1946\n`
    }
    
    if (queryType === 'MX' || allInfo) {
      output += `${domain} mail is handled by 10 mail.${domain}.\n`
      output += `${domain} mail is handled by 20 mail2.${domain}.\n`
    }
    
    if (queryType === 'NS' || allInfo) {
      output += `${domain} name server ns1.${domain}.\n`
      output += `${domain} name server ns2.${domain}.\n`
    }
    
    if (queryType === 'TXT') {
      output += `${domain} descriptive text "v=spf1 include:_spf.${domain} ~all"\n`
    }
    
    if (queryType === 'CNAME') {
      output += `www.${domain} is an alias for ${domain}.\n`
    }

    if (verbose || allInfo) {
      output += `\nReceived 123 bytes from 127.0.0.53#53 in 45 ms\n`
    }

    return output || `${domain} has address 93.184.216.34`
  }
}

export default host
