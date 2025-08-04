/**
 * curl - 传输数据到服务器或从服务器传输数据
 */

export const curl = {
  name: 'curl',
  description: 'Transfer data from or to a server|传输数据到服务器或从服务器传输数据',
  options: [
    {
      name: 'url',
      flag: 'url',
      type: 'input',
      inputKey: 'url',
      description: 'URL to request|要请求的URL',
      placeholder: 'Enter URL (e.g., https://api.example.com)',
      required: true,
      group: 'target'
    },
    {
      name: '-X',
      type: 'select',
      description: 'HTTP method to use|使用的HTTP方法',
      options: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'],
      group: 'request'
    },
    {
      name: '-d',
      type: 'input',
      flag: '-d',
      inputKey: 'data',
      description: 'HTTP POST data|HTTP POST数据',
      placeholder: 'Enter data (e.g., key=value)',
      group: 'request'
    },
    {
      name: '-H',
      type: 'input',
      flag: '-H',
      inputKey: 'header',
      description: 'Custom header to pass to server|传递给服务器的自定义头部',
      placeholder: 'Enter header (e.g., Content-Type: application/json)',
      group: 'request'
    },
    {
      name: '-u',
      type: 'input',
      flag: '-u',
      inputKey: 'user',
      description: 'Server user and password|服务器用户名和密码',
      placeholder: 'username:password',
      group: 'auth'
    },
    {
      name: '-o',
      type: 'input',
      flag: '-o',
      inputKey: 'output',
      description: 'Write output to file|将输出写入文件',
      placeholder: 'output filename',
      group: 'output'
    },
    {
      name: '-A',
      type: 'input',
      flag: '-A',
      inputKey: 'user_agent',
      description: 'User-Agent string|用户代理字符串',
      placeholder: 'User agent string',
      group: 'request'
    },
    {
      name: '-e',
      type: 'input',
      flag: '-e',
      inputKey: 'referer',
      description: 'Referer URL|引用页URL',
      placeholder: 'Referer URL',
      group: 'request'
    },
    {
      name: '-b',
      type: 'input',
      flag: '-b',
      inputKey: 'cookie',
      description: 'Cookie data|Cookie数据',
      placeholder: 'Cookie string',
      group: 'request'
    },
    {
      name: '--proxy',
      type: 'input',
      flag: '--proxy',
      inputKey: 'proxy',
      description: 'Use proxy server|使用代理服务器',
      placeholder: 'proxy_host:port',
      group: 'network'
    },
    {
      name: '--connect-timeout',
      type: 'input',
      flag: '--connect-timeout',
      inputKey: 'connect_timeout',
      description: 'Connection timeout in seconds|连接超时时间(秒)',
      placeholder: 'timeout seconds',
      group: 'network'
    },
    {
      name: '-m',
      type: 'input',
      flag: '-m',
      inputKey: 'max_time',
      description: 'Maximum time for transfer|传输的最大时间',
      placeholder: 'max time in seconds',
      group: 'network'
    },
    {
      name: '-L',
      flag: '-L',
      type: 'boolean',
      description: 'Follow redirects|跟随重定向',
      group: 'behavior'
    },
    {
      name: '-O',
      flag: '-O',
      type: 'boolean',
      description: 'Write output to file named as remote file|输出到与远程文件同名的文件',
      group: 'output'
    },
    {
      name: '-s',
      flag: '-s',
      type: 'boolean',
      description: 'Silent mode|静默模式',
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
      name: '-i',
      flag: '-i',
      type: 'boolean',
      description: 'Include response headers in output|在输出中包含响应头',
      group: 'output'
    },
    {
      name: '-I',
      flag: '-I',
      type: 'boolean',
      description: 'Show document info only (HEAD request)|仅显示文档信息(HEAD请求)',
      group: 'output'
    },
    {
      name: '-k',
      flag: '-k',
      type: 'boolean',
      description: 'Allow insecure SSL connections|允许不安全的SSL连接',
      group: 'security'
    },
    {
      name: '-f',
      flag: '-f',
      type: 'boolean',
      description: 'Fail silently on HTTP errors|HTTP错误时静默失败',
      group: 'behavior'
    },
    {
      name: '--compressed',
      flag: '--compressed',
      type: 'boolean',
      description: 'Request compressed response|请求压缩响应',
      group: 'behavior'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return curl.help
    }

    const output = getOptionValue(args, '-o') || getOptionValue(args, '--output')
    const remoteOutput = args.includes('-O') || args.includes('--remote-name')
    const silent = args.includes('-s') || args.includes('--silent')
    const verbose = args.includes('-v') || args.includes('--verbose')
    const includeHeaders = args.includes('-i') || args.includes('--include')
    const headersOnly = args.includes('-I') || args.includes('--head')
    const followRedirects = args.includes('-L') || args.includes('--location')
    const maxRedirects = getOptionValue(args, '--max-redirs')
    const userAgent = getOptionValue(args, '-A') || getOptionValue(args, '--user-agent')
    const referer = getOptionValue(args, '-e') || getOptionValue(args, '--referer')
    const cookie = getOptionValue(args, '-b') || getOptionValue(args, '--cookie')
    const cookieJar = getOptionValue(args, '-c') || getOptionValue(args, '--cookie-jar')
    const data = getOptionValue(args, '-d') || getOptionValue(args, '--data')
    const dataRaw = getOptionValue(args, '--data-raw')
    const dataUrlencode = getOptionValue(args, '--data-urlencode')
    const form = getOptionValue(args, '-F') || getOptionValue(args, '--form')
    const method = getOptionValue(args, '-X') || getOptionValue(args, '--request')
    const headers = getAllOptionValues(args, '-H') || getAllOptionValues(args, '--header')
    const auth = getOptionValue(args, '-u') || getOptionValue(args, '--user')
    const proxy = getOptionValue(args, '--proxy')
    const timeout = getOptionValue(args, '--connect-timeout')
    const maxTime = getOptionValue(args, '-m') || getOptionValue(args, '--max-time')
    const retry = getOptionValue(args, '--retry')
    const retryDelay = getOptionValue(args, '--retry-delay')
    const insecure = args.includes('-k') || args.includes('--insecure')
    const compressed = args.includes('--compressed')
    const progress = args.includes('#') || args.includes('--progress-bar')
    const fail = args.includes('-f') || args.includes('--fail')
    const writeOut = getOptionValue(args, '-w') || getOptionValue(args, '--write-out')
    
    // 获取URL
    const urls = args.filter(arg => 
      !arg.startsWith('-') && 
      !isOptionValue(arg, args) &&
      (arg.startsWith('http://') || arg.startsWith('https://') || arg.startsWith('ftp://') || arg.includes('.'))
    )

    if (urls.length === 0) {
      return 'curl: try \'curl --help\' for more information'
    }

    const results = []
    
    for (const url of urls) {
      try {
        const response = simulateHttpRequest(url, {
          method: method || (data || form ? 'POST' : 'GET'),
          headers,
          data: data || dataRaw || dataUrlencode,
          form,
          auth,
          userAgent,
          referer,
          cookie,
          proxy,
          timeout: timeout ? parseInt(timeout) : 30,
          maxTime: maxTime ? parseInt(maxTime) : 0,
          followRedirects,
          maxRedirects: maxRedirects ? parseInt(maxRedirects) : 50,
          insecure,
          compressed,
          headersOnly,
          includeHeaders,
          verbose,
          silent,
          fail
        })

        if (response.error) {
          results.push(`curl: ${response.error}`)
          continue
        }

        // 处理输出
        let outputContent = ''
        
        if (verbose) {
          outputContent += response.verbose + '\n'
        }
        
        if (includeHeaders || headersOnly) {
          outputContent += response.headers + '\n'
        }
        
        if (!headersOnly) {
          outputContent += response.body
        }

        // 写入文件或显示
        if (output) {
          try {
            fs.writeFile(output, response.body)
            if (!silent) {
              results.push(`  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current`)
              results.push(`                                 Dload  Upload   Total   Spent    Left  Speed`)
              results.push(`100  ${response.size}  100  ${response.size}    0     0   ${response.speed}      0 --:--:-- --:--:-- --:--:--  ${response.speed}`)
            }
          } catch (error) {
            results.push(`curl: ${output}: ${error.message}`)
          }
        } else if (remoteOutput) {
          const filename = url.split('/').pop() || 'index.html'
          try {
            fs.writeFile(filename, response.body)
            if (!silent) {
              results.push(`  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current`)
              results.push(`                                 Dload  Upload   Total   Spent    Left  Speed`)
              results.push(`100  ${response.size}  100  ${response.size}    0     0   ${response.speed}      0 --:--:-- --:--:-- --:--:--  ${response.speed}`)
            }
          } catch (error) {
            results.push(`curl: ${filename}: ${error.message}`)
          }
        } else {
          if (!silent) {
            results.push(outputContent)
          }
        }

        // 写入统计信息
        if (writeOut) {
          const stats = formatWriteOut(writeOut, response)
          results.push(stats)
        }

      } catch (error) {
        results.push(`curl: ${error.message}`)
      }
    }

    return results.join('\n')
  },
  description: 'Transfer data from or to a server|传输数据到服务器或从服务器传输数据',
  category: 'network',
  requiresArgs: true,
  examples: [
    'curl https://httpbin.org/get                                    # Simple GET request|简单的GET请求',
    'curl -o output.html https://example.com                        # Save output to file|保存输出到文件',
    'curl -X POST -d "key=value" https://httpbin.org/post           # POST with data|发送POST数据',
    'curl -H "Content-Type: application/json" -d \'{"key":"value"}\' https://api.example.com  # JSON request|JSON请求',
    'curl -u username:password https://secure.example.com          # Basic authentication|基本认证',
    'curl -L https://github.com/user/repo/archive/main.zip         # Follow redirects|跟随重定向'
  ],
  help: `Usage: curl [options...] <url>
curl is a tool to transfer data from or to a server, using one of the supported
protocols (DICT, FILE, FTP, FTPS, GOPHER, HTTP, HTTPS, IMAP, IMAPS, LDAP,
LDAPS, POP3, POP3S, RTMP, RTSP, SCP, SFTP, SMB, SMBS, SMTP, SMTPS, TELNET
and TFTP). The command is designed to work without user interaction.

 -A, --user-agent <name>         Send User-Agent <name> to server
 -b, --cookie <data>             Send cookies from string/file
 -c, --cookie-jar <filename>     Write cookies to <filename> after operation
 -d, --data <data>               HTTP POST data
 -e, --referer <URL>             Referer URL
 -f, --fail                      Fail silently (no output at all) on HTTP errors
 -F, --form <name=content>       Specify multipart MIME data
 -H, --header <header/@file>     Pass custom header(s) to server
 -i, --include                   Include protocol response headers in the output
 -I, --head                      Show document info only
 -k, --insecure                  Allow insecure server connections when using SSL
 -L, --location                  Follow redirects
 -m, --max-time <seconds>        Maximum time allowed for the transfer
 -o, --output <file>             Write to file instead of stdout
 -O, --remote-name               Write output to a file named as the remote file
 -s, --silent                    Silent mode
 -u, --user <user:password>      Server user and password
 -v, --verbose                   Make the operation more talkative
 -w, --write-out <format>        Use output format after completion
 -X, --request <command>         Specify request command to use
     --compressed                Request compressed response
     --connect-timeout <seconds> Maximum time allowed for connection
     --data-raw <data>           HTTP POST data, '@' allowed
     --data-urlencode <data>     HTTP POST data url encoded
     --max-redirs <num>          Maximum number of redirects allowed
     --proxy <[protocol://]host[:port]> Use this proxy
     --retry <num>               Retry request if transient problems occur
     --retry-delay <seconds>     Wait time between retries
     --help                      This help text

Examples:
  curl https://httpbin.org/get                    Simple GET request
  curl -o page.html https://example.com          Save output to file
  curl -X POST -d "data" https://httpbin.org/post POST with data
  curl -H "Accept: application/json" https://api.example.com  Custom header
  curl -u user:pass https://secure.example.com   Basic authentication
  curl -L https://bit.ly/shortened-url           Follow redirects`
}

// 模拟HTTP请求
function simulateHttpRequest(url, options) {
  try {
    // 解析URL
    const urlInfo = parseURL(url)
    if (!urlInfo.valid) {
      return { error: `Unsupported protocol '${urlInfo.protocol}'` }
    }

    // 模拟网络延迟
    const delay = Math.random() * 100 + 50

    // 生成响应
    const response = generateMockResponse(urlInfo, options)
    
    if (options.fail && response.status >= 400) {
      return { error: `The requested URL returned error: ${response.status}` }
    }

    let output = ''
    
    if (options.verbose) {
      output += generateVerboseOutput(urlInfo, options, response)
    }

    return {
      status: response.status,
      headers: response.headers,
      body: response.body,
      size: response.body.length,
      speed: Math.floor(response.body.length / (delay / 1000)) + 'k',
      verbose: options.verbose ? generateVerboseOutput(urlInfo, options, response) : '',
      error: null
    }

  } catch (error) {
    return { error: error.message }
  }
}

// 解析URL
function parseURL(url) {
  try {
    const supportedProtocols = ['http:', 'https:', 'ftp:', 'ftps:']
    
    // 如果没有协议，假设是http
    if (!url.includes('://')) {
      url = 'http://' + url
    }
    
    const urlObj = new URL(url)
    
    return {
      valid: supportedProtocols.includes(urlObj.protocol),
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
      pathname: urlObj.pathname,
      search: urlObj.search,
      full: url
    }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

// 生成模拟响应
function generateMockResponse(urlInfo, options) {
  const hostname = urlInfo.hostname.toLowerCase()
  
  // 根据不同的主机名生成不同的响应
  if (hostname.includes('httpbin.org')) {
    return generateHttpbinResponse(urlInfo, options)
  } else if (hostname.includes('example.com')) {
    return generateExampleResponse(urlInfo, options)
  } else if (hostname.includes('github.com')) {
    return generateGithubResponse(urlInfo, options)
  } else if (hostname.includes('api.')) {
    return generateApiResponse(urlInfo, options)
  } else {
    return generateGenericResponse(urlInfo, options)
  }
}

// 生成httpbin响应
function generateHttpbinResponse(urlInfo, options) {
  const method = options.method.toUpperCase()
  
  let body = ''
  let status = 200
  
  if (urlInfo.pathname.includes('/get')) {
    body = JSON.stringify({
      args: {},
      headers: {
        'Accept': '*/*',
        'Host': urlInfo.hostname,
        'User-Agent': options.userAgent || 'curl/7.68.0'
      },
      origin: '203.0.113.1',
      url: urlInfo.full
    }, null, 2)
  } else if (urlInfo.pathname.includes('/post')) {
    body = JSON.stringify({
      args: {},
      data: options.data || '',
      files: {},
      form: options.form ? { [options.form.split('=')[0]]: options.form.split('=')[1] } : {},
      headers: {
        'Accept': '*/*',
        'Content-Type': options.form ? 'multipart/form-data' : 'application/x-www-form-urlencoded',
        'Host': urlInfo.hostname,
        'User-Agent': options.userAgent || 'curl/7.68.0'
      },
      json: null,
      origin: '203.0.113.1',
      url: urlInfo.full
    }, null, 2)
  } else if (urlInfo.pathname.includes('/status/')) {
    status = parseInt(urlInfo.pathname.split('/status/')[1]) || 200
    body = status >= 400 ? `${status} Error` : 'OK'
  }
  
  const headers = [
    `HTTP/1.1 ${status} ${getStatusText(status)}`,
    'Date: ' + new Date().toUTCString(),
    'Content-Type: application/json',
    'Content-Length: ' + body.length,
    'Connection: keep-alive',
    'Server: nginx/1.18.0'
  ].join('\r\n') + '\r\n'
  
  return { status, headers, body }
}

// 生成示例响应
function generateExampleResponse(urlInfo, options) {
  const body = `<!doctype html>
<html>
<head>
    <title>Example Domain</title>
    <meta charset="utf-8" />
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
    <div>
        <h1>Example Domain</h1>
        <p>This domain is for use in illustrative examples in documents.</p>
    </div>
</body>
</html>`

  const headers = [
    'HTTP/1.1 200 OK',
    'Date: ' + new Date().toUTCString(),
    'Content-Type: text/html; charset=UTF-8',
    'Content-Length: ' + body.length,
    'Connection: keep-alive',
    'Server: ECS (dcb/7F83)'
  ].join('\r\n') + '\r\n'
  
  return { status: 200, headers, body }
}

// 生成GitHub响应
function generateGithubResponse(urlInfo, options) {
  let body = ''
  let contentType = 'text/html'
  
  if (urlInfo.pathname.includes('/api/')) {
    body = JSON.stringify({
      message: 'API rate limit exceeded',
      documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting'
    }, null, 2)
    contentType = 'application/json'
  } else {
    body = '<!DOCTYPE html><html><head><title>GitHub</title></head><body><h1>GitHub</h1><p>Built for developers</p></body></html>'
  }
  
  const headers = [
    'HTTP/1.1 200 OK',
    'Date: ' + new Date().toUTCString(),
    'Content-Type: ' + contentType,
    'Content-Length: ' + body.length,
    'Connection: keep-alive',
    'Server: GitHub.com'
  ].join('\r\n') + '\r\n'
  
  return { status: 200, headers, body }
}

// 生成API响应
function generateApiResponse(urlInfo, options) {
  const body = JSON.stringify({
    status: 'success',
    data: {
      message: 'Hello from API',
      timestamp: new Date().toISOString(),
      method: options.method,
      path: urlInfo.pathname
    }
  }, null, 2)
  
  const headers = [
    'HTTP/1.1 200 OK',
    'Date: ' + new Date().toUTCString(),
    'Content-Type: application/json',
    'Content-Length: ' + body.length,
    'Connection: keep-alive',
    'Server: nginx/1.18.0'
  ].join('\r\n') + '\r\n'
  
  return { status: 200, headers, body }
}

// 生成通用响应
function generateGenericResponse(urlInfo, options) {
  const body = `<!DOCTYPE html>
<html>
<head>
    <title>${urlInfo.hostname}</title>
</head>
<body>
    <h1>Welcome to ${urlInfo.hostname}</h1>
    <p>This is a simulated response for demonstration purposes.</p>
    <p>Requested path: ${urlInfo.pathname}</p>
    <p>Method: ${options.method}</p>
</body>
</html>`

  const headers = [
    'HTTP/1.1 200 OK',
    'Date: ' + new Date().toUTCString(),
    'Content-Type: text/html; charset=UTF-8',
    'Content-Length: ' + body.length,
    'Connection: keep-alive',
    'Server: Apache/2.4.41'
  ].join('\r\n') + '\r\n'
  
  return { status: 200, headers, body }
}

// 生成详细输出
function generateVerboseOutput(urlInfo, options, response) {
  let output = []
  
  output.push(`*   Trying ${urlInfo.hostname}:${urlInfo.port}...`)
  output.push(`* TCP_NODELAY set`)
  output.push(`* Connected to ${urlInfo.hostname} (${generateRandomIP()}) port ${urlInfo.port} (#0)`)
  
  if (urlInfo.protocol === 'https:') {
    output.push(`* ALPN, offering h2`)
    output.push(`* ALPN, offering http/1.1`)
    output.push(`* successfully set certificate verify locations:`)
    output.push(`* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384`)
  }
  
  output.push(`> ${options.method} ${urlInfo.pathname}${urlInfo.search} HTTP/1.1`)
  output.push(`> Host: ${urlInfo.hostname}`)
  output.push(`> User-Agent: ${options.userAgent || 'curl/7.68.0'}`)
  output.push(`> Accept: */*`)
  
  if (options.headers) {
    options.headers.forEach(header => {
      output.push(`> ${header}`)
    })
  }
  
  if (options.data) {
    output.push(`> Content-Length: ${options.data.length}`)
    output.push(`> Content-Type: application/x-www-form-urlencoded`)
    output.push(`>`)
  }
  
  output.push(`< ${response.headers.split('\r\n')[0]}`)
  response.headers.split('\r\n').slice(1).forEach(header => {
    if (header.trim()) {
      output.push(`< ${header}`)
    }
  })
  output.push(`<`)
  
  return output.join('\n')
}

// 获取状态文本
function getStatusText(status) {
  const statusTexts = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  }
  
  return statusTexts[status] || 'Unknown'
}

// 生成随机IP
function generateRandomIP() {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
}

// 格式化写出信息
function formatWriteOut(format, response) {
  const replacements = {
    '%{http_code}': response.status,
    '%{size_download}': response.body.length,
    '%{time_total}': (Math.random() * 2 + 0.1).toFixed(3),
    '%{time_connect}': (Math.random() * 0.1 + 0.01).toFixed(3),
    '%{speed_download}': response.speed,
    '%{url_effective}': 'simulated-url'
  }
  
  let result = format
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value)
  }
  
  return result
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

// 获取所有选项值
function getAllOptionValues(args, option) {
  const values = []
  
  for (let i = 0; i < args.length - 1; i++) {
    if (args[i] === option) {
      values.push(args[i + 1])
    }
  }
  
  // 检查长选项格式
  for (const arg of args) {
    if (arg.startsWith(option + '=')) {
      values.push(arg.substring(option.length + 1))
    }
  }
  
  return values.length > 0 ? values : null
}

// 检查参数是否是选项值
function isOptionValue(arg, args) {
  const index = args.indexOf(arg)
  if (index === 0) return false
  
  const prevArg = args[index - 1]
  const optionsWithValues = [
    '-o', '--output', '-A', '--user-agent', '-e', '--referer', '-b', '--cookie',
    '-c', '--cookie-jar', '-d', '--data', '--data-raw', '--data-urlencode',
    '-F', '--form', '-X', '--request', '-H', '--header', '-u', '--user',
    '--proxy', '--connect-timeout', '-m', '--max-time', '--retry', '--retry-delay',
    '-w', '--write-out', '--max-redirs'
  ]
  
  return optionsWithValues.includes(prevArg)
}