/**
 * wget - 非交互式网络下载器
 */

export const wget = {
  name: 'wget',
  description: 'Non-interactive network downloader|非交互式网络下载器',
  options: [
    {
      name: 'url',
      type: 'input',
      flag: 'url',
      inputKey: 'url',
      description: 'URL to download|要下载的URL',
      placeholder: 'Enter URL (e.g., https://example.com/file.zip)',
      required: true,
      group: 'target'
    },
    {
      name: '-O',
      type: 'input',
      flag: '-O',
      inputKey: 'output_file',
      description: 'Write documents to file|将文档写入文件',
      placeholder: 'output filename',
      group: 'output'
    },
    {
      name: '-P',
      type: 'input',
      flag: '-P',
      inputKey: 'directory',
      description: 'Save files to directory|保存文件到目录',
      placeholder: 'directory path',
      group: 'output'
    },
    {
      name: '-t',
      type: 'input',
      flag: '-t',
      inputKey: 'tries',
      description: 'Set number of retries|设置重试次数',
      placeholder: 'number of retries (e.g., 3)',
      group: 'network'
    },
    {
      name: '-T',
      type: 'input',
      flag: '-T',
      inputKey: 'timeout',
      description: 'Set timeout in seconds|设置超时时间(秒)',
      placeholder: 'timeout seconds (e.g., 30)',
      group: 'network'
    },
    {
      name: '-U',
      type: 'input',
      flag: '-U',
      inputKey: 'user_agent',
      description: 'User-Agent string|用户代理字符串',
      placeholder: 'User agent string',
      group: 'request'
    },
    {
      name: '--referer',
      type: 'input',
      flag: '--referer',
      inputKey: 'referer',
      description: 'Include Referer header|包含引用页头部',
      placeholder: 'Referer URL',
      group: 'request'
    },
    {
      name: '--http-user',
      type: 'input',
      flag: '--http-user',
      inputKey: 'http_user',
      description: 'Set HTTP username|设置HTTP用户名',
      placeholder: 'username',
      group: 'auth'
    },
    {
      name: '--http-password',
      type: 'input',
      flag: '--http-password',
      inputKey: 'http_password',
      description: 'Set HTTP password|设置HTTP密码',
      placeholder: 'password',
      group: 'auth'
    },
    {
      name: '-l',
      type: 'input',
      flag: '-l',
      inputKey: 'level',
      description: 'Maximum recursion depth|最大递归深度',
      placeholder: 'depth level (e.g., 2)',
      group: 'recursive'
    },
    {
      name: '-A',
      type: 'input',
      flag: '-A',
      inputKey: 'accept',
      description: 'Comma-separated list of accepted extensions|接受的文件扩展名列表',
      placeholder: 'extensions (e.g., jpg,png,gif)',
      group: 'filter'
    },
    {
      name: '-R',
      type: 'input',
      flag: '-R',
      inputKey: 'reject',
      description: 'Comma-separated list of rejected extensions|拒绝的文件扩展名列表',
      placeholder: 'extensions (e.g., exe,zip)',
      group: 'filter'
    },
    {
      name: '-c',
      flag: '-c',
      type: 'boolean',
      description: 'Continue partial download|继续部分下载',
      group: 'behavior'
    },
    {
      name: '-b',
      flag: '-b',
      type: 'boolean',
      description: 'Go to background after startup|启动后转入后台',
      group: 'behavior'
    },
    {
      name: '-q',
      flag: '-q',
      type: 'boolean',
      description: 'Quiet mode (no output)|静默模式(无输出)',
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
      name: '--spider',
      flag: '--spider',
      type: 'boolean',
      description: 'Check if file exists (don\'t download)|检查文件是否存在(不下载)',
      group: 'behavior'
    },
    {
      name: '-N',
      flag: '-N',
      type: 'boolean',
      description: 'Turn on timestamping|启用时间戳',
      group: 'behavior'
    },
    {
      name: '-S',
      flag: '-S',
      type: 'boolean',
      description: 'Print server response|打印服务器响应',
      group: 'output'
    },
    {
      name: '--no-check-certificate',
      flag: '--no-check-certificate',
      type: 'boolean',
      description: 'Don\'t validate server certificate|不验证服务器证书',
      group: 'security'
    },
    {
      name: '-r',
      flag: '-r',
      type: 'boolean',
      description: 'Specify recursive download|指定递归下载',
      group: 'behavior'
    },
    {
      name: '--delete-after',
      flag: '--delete-after',
      type: 'boolean',
      description: 'Delete files locally after downloading|下载后删除本地文件',
      group: 'behavior'
    },
    {
      name: '-k',
      flag: '-k',
      type: 'boolean',
      description: 'Convert links in downloaded HTML|转换下载HTML中的链接',
      group: 'behavior'
    },
    {
      name: '-m',
      flag: '-m',
      type: 'boolean',
      description: 'Mirror mode (shortcut for -N -r -l inf)|镜像模式',
      group: 'behavior'
    },
    {
      name: '-p',
      flag: '-p',
      type: 'boolean',
      description: 'Get all images, etc. needed to display HTML page|获取显示HTML页面所需的所有图像等',
      group: 'behavior'
    },
    {
      name: '--no-parent',
      flag: '--no-parent',
      type: 'boolean',
      description: 'Don\'t ascend to parent directory|不上升到父目录',
      group: 'behavior'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help')) {
      return wget.help
    }

    const output = getOptionValue(args, '-O') || getOptionValue(args, '--output-document')
    const outputDir = getOptionValue(args, '-P') || getOptionValue(args, '--directory-prefix')
    const continue_ = args.includes('-c') || args.includes('--continue')
    const background = args.includes('-b') || args.includes('--background')
    const quiet = args.includes('-q') || args.includes('--quiet')
    const verbose = args.includes('-v') || args.includes('--verbose')
    const debug = args.includes('-d') || args.includes('--debug')
    const spider = args.includes('--spider')
    const timestamping = args.includes('-N') || args.includes('--timestamping')
    const serverResponse = args.includes('-S') || args.includes('--server-response')
    const tries = getOptionValue(args, '-t') || getOptionValue(args, '--tries')
    const timeout = getOptionValue(args, '-T') || getOptionValue(args, '--timeout')
    const waitRetry = getOptionValue(args, '--waitretry')
    const randomWait = args.includes('--random-wait')
    const userAgent = getOptionValue(args, '-U') || getOptionValue(args, '--user-agent')
    const referer = getOptionValue(args, '--referer')
    const headers = getAllOptionValues(args, '--header')
    const postData = getOptionValue(args, '--post-data')
    const postFile = getOptionValue(args, '--post-file')
    const httpUser = getOptionValue(args, '--http-user')
    const httpPassword = getOptionValue(args, '--http-password')
    const noCheckCertificate = args.includes('--no-check-certificate')
    const recursive = args.includes('-r') || args.includes('--recursive')
    const level = getOptionValue(args, '-l') || getOptionValue(args, '--level')
    const deleteAfter = args.includes('--delete-after')
    const convert = args.includes('-k') || args.includes('--convert-links')
    const backup = args.includes('-B') || args.includes('--backup-converted')
    const mirror = args.includes('-m') || args.includes('--mirror')
    const pageRequisites = args.includes('-p') || args.includes('--page-requisites')
    const noParent = args.includes('--no-parent')
    const include = getOptionValue(args, '-I') || getOptionValue(args, '--include-directories')
    const exclude = getOptionValue(args, '-X') || getOptionValue(args, '--exclude-directories')
    const accept = getOptionValue(args, '-A') || getOptionValue(args, '--accept')
    const reject = getOptionValue(args, '-R') || getOptionValue(args, '--reject')
    const domains = getOptionValue(args, '-D') || getOptionValue(args, '--domains')
    const excludeDomains = getOptionValue(args, '--exclude-domains')
    const followFtp = args.includes('--follow-ftp')
    const spanHosts = args.includes('-H') || args.includes('--span-hosts')
    const relativeOnly = args.includes('-L') || args.includes('--relative')
    const noHost = args.includes('--no-host-directories')
    const protocol = args.includes('--protocol-directories')
    const cut = getOptionValue(args, '--cut-dirs')
    
    // 获取URL
    const urls = args.filter(arg => 
      !arg.startsWith('-') && 
      !isOptionValue(arg, args) &&
      (arg.startsWith('http://') || arg.startsWith('https://') || arg.startsWith('ftp://') || arg.includes('.'))
    )

    if (urls.length === 0) {
      return 'wget: missing URL\nUsage: wget [OPTION]... [URL]...\n\nTry `wget --help\' for more options.'
    }

    const results = []
    
    // 处理后台模式
    if (background) {
      results.push('Continuing in background, pid 12345.')
      results.push('Output will be written to \'wget-log\'.')
      return results.join('\n')
    }

    for (const url of urls) {
      try {
        const downloadResult = simulateDownload(url, {
          output,
          outputDir,
          continue_,
          quiet,
          verbose,
          debug,
          spider,
          timestamping,
          serverResponse,
          tries: tries ? parseInt(tries) : 20,
          timeout: timeout ? parseInt(timeout) : 900,
          waitRetry: waitRetry ? parseInt(waitRetry) : 0,
          randomWait,
          userAgent,
          referer,
          headers,
          postData,
          postFile,
          httpUser,
          httpPassword,
          noCheckCertificate,
          recursive,
          level: level ? parseInt(level) : 5,
          deleteAfter,
          convert,
          backup,
          mirror,
          pageRequisites,
          noParent,
          include,
          exclude,
          accept,
          reject,
          domains,
          excludeDomains,
          followFtp,
          spanHosts,
          relativeOnly,
          noHost,
          protocol,
          cut: cut ? parseInt(cut) : 0
        }, fs)

        results.push(...downloadResult)

      } catch (error) {
        results.push(`wget: ${error.message}`)
      }
    }

    return results.join('\n')
  },
  description: 'Non-interactive network downloader|非交互式网络下载器',
  category: 'network',
  requiresArgs: true,
  examples: [
    'wget https://example.com/file.zip                    # Download a file|下载文件',
    'wget -O myfile.html https://example.com             # Save with custom name|使用自定义文件名保存',
    'wget -r -l 2 https://example.com                    # Recursive download, 2 levels deep|递归下载，深度2层',
    'wget -c https://example.com/largefile.iso           # Continue partial download|继续部分下载',
    'wget --spider https://example.com/check.html        # Check if file exists (don\'t download)|检查文件是否存在（不下载）'
  ],
  help: `GNU Wget 1.20.3, a non-interactive network retriever.
Usage: wget [OPTION]... [URL]...

Mandatory arguments to long options are mandatory for short options too.

Startup:
  -V,  --version           display the version of Wget and exit.
  -h,  --help              print this help.
  -b,  --background        go to background after startup.
  -e,  --execute=COMMAND   execute a \`.wgetrc'-style command.

Logging and input file:
  -o,  --output-file=FILE    log messages to FILE.
  -a,  --append-output=FILE  append messages to FILE.
  -d,  --debug               print lots of debugging information.
  -q,  --quiet               quiet (no output).
  -v,  --verbose             be verbose (this is the default).
  -nv, --no-verbose          turn off verboseness, without being quiet.
       --report-speed=TYPE   Output bandwidth as TYPE.  TYPE can be bits.
  -i,  --input-file=FILE     download URLs found in local or external FILE.
  -F,  --force-html          treat input file as HTML.
  -B,  --base=URL            resolves HTML input-file links (-i -F)
                             relative to URL.
       --config=FILE         Specify config file to use.

Download:
  -t,  --tries=NUMBER            set number of retries to NUMBER (0 unlimits).
       --retry-connrefused       retry even if connection is refused.
  -O,  --output-document=FILE    write documents to FILE.
  -nc, --no-clobber              skip downloads that would download to
                                 existing files (overwriting them).
  -c,  --continue                resume getting a partially-downloaded file.
       --progress=TYPE           select progress gauge type.
  -N,  --timestamping            don't re-retrieve files unless newer than
                                 local.
  --no-use-server-timestamps     don't set the local file's timestamp by
                                 the one on the server.
  -S,  --server-response         print server response.
       --spider                  don't download anything.
  -T,  --timeout=SECONDS         set all timeout values to SECONDS.
       --dns-timeout=SECS        set the DNS lookup timeout to SECS.
       --connect-timeout=SECS    set the connect timeout to SECS.
       --read-timeout=SECS       set the read timeout to SECS.
  -w,  --wait=SECONDS            wait SECONDS between retrievals.
       --waitretry=SECONDS       wait 1..SECONDS between retries of a retrieval.
       --random-wait             wait from 0.5*WAIT...1.5*WAIT secs between retrievals.
       --no-proxy                explicitly turn off proxy.
  -Q,  --quota=NUMBER            set retrieval quota to NUMBER.
       --bind-address=ADDRESS    bind to ADDRESS (hostname or IP) on local host.
       --limit-rate=RATE         limit download rate to RATE.
       --no-dns-cache            disable caching DNS lookups.
       --restrict-file-names=OS  restrict chars in file names to ones OS allows.
       --ignore-case             ignore case when matching files/directories.
  -4,  --inet4-only              connect only to IPv4 addresses.
  -6,  --inet6-only              connect only to IPv6 addresses.
       --prefer-family=FAMILY    connect first to addresses of specified family,
                                 one of IPv6, IPv4, or none.
       --user=USER               set both ftp and http user to USER.
       --password=PASS           set both ftp and http password to PASS.
       --ask-password            prompt for passwords.
       --no-iri                  turn off IRI support.
       --local-encoding=ENC      use ENC as the local encoding for IRIs.
       --remote-encoding=ENC     use ENC as the default remote encoding.
       --unlink                  remove file before clobber.

Directories:
  -nd, --no-directories           don't create directories.
  -x,  --force-directories        force creation of directories.
  -nH, --no-host-directories      don't create host directories.
       --protocol-directories     use protocol name in directories.
  -P,  --directory-prefix=PREFIX  save files to PREFIX/...
       --cut-dirs=NUMBER          ignore NUMBER remote directory components.

HTTP options:
       --http-user=USER        set http user to USER.
       --http-password=PASS    set http password to PASS.
       --no-cache              disallow server-cached data.
       --default-page=NAME     Change the default page name (normally
                               this is \`index.html'.).
  -E,  --adjust-extension      save HTML/CSS documents with proper extensions.
       --ignore-length         ignore \`Content-Length' header field.
       --header=STRING         insert STRING among the headers.
       --max-redirect          maximum redirections allowed per page.
       --proxy-user=USER       set USER as proxy username.
       --proxy-password=PASS   set PASS as proxy password.
       --referer=URL           include \`Referer: URL' header in HTTP request.
       --save-headers          save the HTTP headers to file.
  -U,  --user-agent=AGENT      identify as AGENT instead of Wget/VERSION.
       --no-http-keep-alive    disable HTTP keep-alive (persistent connections).
       --no-cookies            don't use cookies.
       --load-cookies=FILE     load cookies from FILE before session.
       --save-cookies=FILE     save cookies to FILE after session.
       --keep-session-cookies  load and save session (non-permanent) cookies.
       --post-data=STRING      use the POST method; send STRING as the data.
       --post-file=FILE        use the POST method; send contents of FILE.
       --content-disposition   honor the Content-Disposition header when
                               choosing local file names (EXPERIMENTAL).
       --content-on-error      output the received content on server errors.
       --auth-no-challenge     send Basic HTTP authentication information
                               without first waiting for the server's
                               challenge.

HTTPS (SSL/TLS) options:
       --secure-protocol=PR     choose secure protocol, one of auto, SSLv2,
                                SSLv3, TLSv1 and PFS.
       --https-only             only follow secure HTTPS links
       --no-check-certificate   don't validate the server's certificate.
       --certificate=FILE       client certificate file.
       --certificate-type=TYPE  client certificate type, PEM or DER.
       --private-key=FILE       private key file.
       --private-key-type=TYPE  private key type, PEM or DER.
       --ca-certificate=FILE    file with the bundle of CA's.
       --ca-directory=DIR       directory where hash list of CA's is stored.
       --random-file=FILE       file with random data for seeding the SSL PRNG.
       --egd-file=FILE          file naming the EGD socket with random data.

FTP options:
       --ftp-user=USER         set ftp user to USER.
       --ftp-password=PASS     set ftp password to PASS.
       --no-remove-listing     don't remove \`.listing' files.
       --no-glob               turn off FTP file name globbing.
       --no-passive-ftp        disable the "passive" transfer mode.
       --preserve-permissions  preserve remote file permissions.
       --retr-symlinks         when recursing, get linked-to files (not dir).

WARC options:
       --warc-file=FILENAME      save request/response data to a .warc.gz file.
       --warc-header=STRING      insert STRING into the warcinfo record.
       --warc-max-size=NUMBER    set maximum size of WARC files to NUMBER.
       --warc-cdx                write CDX index files.
       --warc-dedup=FILENAME     do not store records listed in this CDX file.
       --no-warc-compression     do not compress WARC files with GZIP.
       --no-warc-digests         do not calculate SHA1 digests.
       --no-warc-keep-log        do not store the log file in a WARC record.
       --warc-tempdir=DIRECTORY  location for temporary files created by the
                                 WARC writer.

Recursive download:
  -r,  --recursive          specify recursive download.
  -l,  --level=NUMBER       maximum recursion depth (inf or 0 for infinite).
       --delete-after       delete files locally after downloading them.
  -k,  --convert-links      make links in downloaded HTML or CSS point to
                            local files.
       --convert-file-only  convert the file part of the URLs only (usually known as the basename)
  -K,  --backup-converted   before converting file X, back up as X.orig.
  -m,  --mirror             shortcut for -N -r -l inf --no-remove-listing.
  -p,  --page-requisites    get all images, etc. needed to display HTML page.
       --strict-comments    turn on strict (SGML) handling of HTML comments.

Recursive accept/reject:
  -A,  --accept=LIST               comma-separated list of accepted extensions.
  -R,  --reject=LIST               comma-separated list of rejected extensions.
       --accept-regex=REGEX        regex matching accepted URLs.
       --reject-regex=REGEX        regex matching rejected URLs.
       --regex-type=TYPE           regex type (posix or pcre).
  -D,  --domains=LIST              comma-separated list of accepted domains.
       --exclude-domains=LIST      comma-separated list of rejected domains.
       --follow-ftp                follow FTP links from HTML documents.
       --follow-tags=LIST          comma-separated list of followed HTML tags.
       --ignore-tags=LIST          comma-separated list of ignored HTML tags.
  -H,  --span-hosts                go to foreign hosts when recursive.
  -L,  --relative                  follow relative links only.
  -I,  --include-directories=LIST  list of allowed directories.
  -X,  --exclude-directories=LIST  list of excluded directories.
  -np, --no-parent                 don't ascend to the parent directory.

Examples:
  wget https://example.com/file.zip          Download a file
  wget -O myfile.html https://example.com    Save with custom name
  wget -r -l 2 https://example.com           Recursive download, 2 levels deep
  wget -c https://example.com/large.iso      Continue partial download
  wget --spider https://example.com          Check if file exists (don't download)`
}

// 模拟下载
function simulateDownload(url, options, fs) {
  const results = []
  
  try {
    // 解析URL
    const urlInfo = parseURL(url)
    if (!urlInfo.valid) {
      return [`wget: ${url}: Unsupported scheme '${urlInfo.protocol}'.`]
    }

    // Spider模式只检查不下载
    if (options.spider) {
      results.push(`Spider mode enabled. Check if remote file exists.`)
      results.push(`--${new Date().toISOString()}--  ${url}`)
      results.push(`Resolving ${urlInfo.hostname}... ${generateRandomIP()}`)
      results.push(`Connecting to ${urlInfo.hostname}|${generateRandomIP()}|:${urlInfo.port}... connected.`)
      results.push(`HTTP request sent, awaiting response... 200 OK`)
      results.push(`Length: unspecified [text/html]`)
      results.push(`Remote file exists.`)
      return results
    }

    // 显示开始信息
    if (!options.quiet) {
      results.push(`--${new Date().toISOString()}--  ${url}`)
      results.push(`Resolving ${urlInfo.hostname}... ${generateRandomIP()}`)
      results.push(`Connecting to ${urlInfo.hostname}|${generateRandomIP()}|:${urlInfo.port}... connected.`)
    }

    // 模拟HTTP响应
    const response = generateDownloadResponse(urlInfo, options)
    
    if (options.serverResponse) {
      results.push('HTTP response:')
      results.push(response.headers)
    }

    if (!options.quiet) {
      results.push(`HTTP request sent, awaiting response... ${response.status} ${response.statusText}`)
      
      if (response.contentLength) {
        results.push(`Length: ${response.contentLength} (${formatSize(response.contentLength)}) [${response.contentType}]`)
      } else {
        results.push(`Length: unspecified [${response.contentType}]`)
      }
    }

    // 确定输出文件名
    let filename = options.output
    if (!filename) {
      if (options.outputDir) {
        filename = `${options.outputDir}/${urlInfo.filename}`
      } else {
        filename = urlInfo.filename
      }
    }

    // 检查是否需要继续下载
    if (options.continue_ && fs.exists(filename)) {
      const existingSize = fs.getFileSize(filename)
      if (!options.quiet) {
        results.push(`\nFile '${filename}' already there; continuing.\n`)
        results.push(`Continuing at byte ${existingSize}.`)
      }
    }

    // 模拟下载进度
    if (!options.quiet) {
      results.push(`Saving to: '${filename}'`)
      results.push('')
      
      // 进度条
      const progressLines = generateProgressBar(response.contentLength || 1024000)
      results.push(...progressLines)
      results.push('')
    }

    // 写入文件
    try {
      if (options.outputDir && !fs.exists(options.outputDir)) {
        fs.mkdir(options.outputDir)
      }
      
      fs.writeFile(filename, response.content)
      
      if (!options.quiet) {
        const downloadTime = (Math.random() * 5 + 1).toFixed(1)
        const speed = formatSpeed(response.contentLength || 1024000, parseFloat(downloadTime))
        results.push(`'${filename}' saved [${response.contentLength || 1024000}/${response.contentLength || 1024000}]`)
        results.push('')
        results.push(`Downloaded: 1 files, ${formatSize(response.contentLength || 1024000)} in ${downloadTime}s (${speed})`)
      }
      
      // 递归下载
      if (options.recursive && response.contentType.includes('text/html')) {
        const recursiveResults = simulateRecursiveDownload(urlInfo, options, response.content, fs)
        results.push(...recursiveResults)
      }
      
    } catch (error) {
      results.push(`wget: ${filename}: ${error.message}`)
    }

  } catch (error) {
    results.push(`wget: ${error.message}`)
  }

  return results
}

// 解析URL
function parseURL(url) {
  try {
    const supportedProtocols = ['http:', 'https:', 'ftp:', 'ftps:']
    
    if (!url.includes('://')) {
      url = 'http://' + url
    }
    
    const urlObj = new URL(url)
    const filename = urlObj.pathname.split('/').pop() || 'index.html'
    
    return {
      valid: supportedProtocols.includes(urlObj.protocol),
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
      pathname: urlObj.pathname,
      filename: filename || 'index.html',
      full: url
    }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

// 生成下载响应
function generateDownloadResponse(urlInfo, options) {
  const contentLength = Math.floor(Math.random() * 5000000) + 100000 // 100KB - 5MB
  const contentType = getContentType(urlInfo.filename)
  
  const headers = [
    `HTTP/1.1 200 OK`,
    `Date: ${new Date().toUTCString()}`,
    `Server: nginx/1.18.0`,
    `Content-Type: ${contentType}`,
    `Content-Length: ${contentLength}`,
    `Last-Modified: ${new Date(Date.now() - Math.random() * 86400000 * 30).toUTCString()}`,
    `ETag: "abc123-${contentLength}"`,
    `Accept-Ranges: bytes`,
    `Connection: keep-alive`
  ].join('\r\n')
  
  // 生成模拟内容
  let content = ''
  if (contentType.includes('text/html')) {
    content = generateHTMLContent(urlInfo)
  } else if (contentType.includes('text/')) {
    content = 'This is simulated file content for demonstration purposes.\n'.repeat(100)
  } else {
    content = 'Binary file content (simulated)...'
  }
  
  return {
    status: 200,
    statusText: 'OK',
    headers,
    contentType,
    contentLength,
    content
  }
}

// 获取内容类型
function getContentType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  const mimeTypes = {
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'xml': 'application/xml',
    'txt': 'text/plain',
    'pdf': 'application/pdf',
    'zip': 'application/zip',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo'
  }
  
  return mimeTypes[ext] || 'application/octet-stream'
}

// 生成HTML内容
function generateHTMLContent(urlInfo) {
  return `<!DOCTYPE html>
<html>
<head>
    <title>${urlInfo.hostname}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Welcome to ${urlInfo.hostname}</h1>
    <p>This is a simulated webpage for demonstration.</p>
    <img src="image.jpg" alt="Sample Image">
    <a href="page2.html">Another Page</a>
    <a href="https://external.com">External Link</a>
    <script src="script.js"></script>
</body>
</html>`
}

// 生成进度条
function generateProgressBar(totalSize) {
  const lines = []
  const steps = 5
  
  for (let i = 1; i <= steps; i++) {
    const percent = (i / steps) * 100
    const downloaded = Math.floor((totalSize * percent) / 100)
    const speed = formatSpeed(downloaded, i * 0.5)
    const eta = i < steps ? `${(steps - i) * 0.5}s` : '--:--:--'
    
    const progressBar = '='.repeat(Math.floor(percent / 2)) + '>' + ' '.repeat(50 - Math.floor(percent / 2))
    lines.push(`${percent.toFixed(0)}%[${progressBar}] ${downloaded.toLocaleString()}  ${speed}  eta ${eta}`)
  }
  
  return lines
}

// 格式化大小
function formatSize(bytes) {
  const units = ['B', 'K', 'M', 'G', 'T']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return size.toFixed(1) + units[unitIndex]
}

// 格式化速度
function formatSpeed(bytes, seconds) {
  const bytesPerSecond = bytes / seconds
  return formatSize(bytesPerSecond) + '/s'
}

// 模拟递归下载
function simulateRecursiveDownload(urlInfo, options, htmlContent, fs) {
  const results = []
  
  if (options.level <= 0) {
    return results
  }
  
  // 简单的链接提取
  const links = extractLinks(htmlContent, urlInfo)
  
  if (links.length > 0 && !options.quiet) {
    results.push(`\nFound ${links.length} links to follow.`)
  }
  
  // 递归下载链接（限制数量以避免过多输出）
  const maxLinks = Math.min(links.length, 3)
  for (let i = 0; i < maxLinks; i++) {
    const link = links[i]
    if (!options.quiet) {
      results.push(`\nFollowing link: ${link}`)
    }
    
    const recursiveOptions = {
      ...options,
      level: options.level - 1,
      recursive: options.level > 1
    }
    
    const linkResults = simulateDownload(link, recursiveOptions, fs)
    results.push(...linkResults)
  }
  
  return results
}

// 提取链接
function extractLinks(htmlContent, baseUrl) {
  const links = []
  
  // 简单的链接提取（实际实现会更复杂）
  const linkRegex = /<a\s+href=["']([^"']+)["']/gi
  let match
  
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    let link = match[1]
    
    // 处理相对链接
    if (!link.startsWith('http')) {
      if (link.startsWith('/')) {
        link = `${baseUrl.protocol}//${baseUrl.hostname}${link}`
      } else {
        link = `${baseUrl.protocol}//${baseUrl.hostname}${baseUrl.pathname}/${link}`
      }
    }
    
    links.push(link)
  }
  
  return links.slice(0, 5) // 限制链接数量
}

// 生成随机IP
function generateRandomIP() {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
}

// 获取选项值
function getOptionValue(args, option) {
  const index = args.indexOf(option)
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1]
  }
  
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
    '-O', '--output-document', '-P', '--directory-prefix', '-t', '--tries',
    '-T', '--timeout', '--waitretry', '-U', '--user-agent', '--referer',
    '--header', '--post-data', '--post-file', '--http-user', '--http-password',
    '-l', '--level', '-I', '--include-directories', '-X', '--exclude-directories',
    '-A', '--accept', '-R', '--reject', '-D', '--domains', '--exclude-domains',
    '--cut-dirs'
  ]
  
  return optionsWithValues.includes(prevArg)
}