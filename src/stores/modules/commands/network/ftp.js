/**
 * ftp 命令实现
 * 文件传输协议客户端
 */

export const ftp = {
  name: 'ftp',
  description: 'File Transfer Protocol client|文件传输协议客户端',
  options: [
    {
      name: 'host',
      type: 'input',
      flag: 'host',
      description: 'FTP server hostname or IP address|FTP服务器主机名或IP地址',
      placeholder: 'ftp.example.com or 192.168.1.100',
      group: 'connection'
    },
    {
      name: 'port',
      type: 'input',
      flag: 'port',
      description: 'Port number (default: 21)|端口号（默认：21）',
      placeholder: 'port number (e.g., 21, 2121)',
      group: 'connection'
    },
    {
      name: '-p',
      flag: '-p',
      type: 'boolean',
      description: 'Use passive mode for data transfers|使用被动模式进行数据传输',
      group: 'connection'
    },
    {
      name: '-v',
      flag: '-v',
      type: 'boolean',
      description: 'Verbose mode, show all responses from server|详细模式，显示服务器的所有响应',
      group: 'output'
    },
    {
      name: '-d',
      flag: '-d',
      type: 'boolean',
      description: 'Enable debugging mode|启用调试模式',
      group: 'debug'
    },
    {
      name: '-i',
      flag: '-i',
      type: 'boolean',
      description: 'Turn off interactive prompting during multiple file transfers|在多文件传输期间关闭交互提示',
      group: 'behavior'
    },
    {
      name: '-n',
      flag: '-n',
      type: 'boolean',
      description: 'Restrain ftp from attempting auto-login upon initial connection|阻止ftp在初始连接时尝试自动登录',
      group: 'auth'
    },
    {
      name: '-L',
      flag: '-L',
      type: 'boolean',
      description: 'List files in long format|以长格式列出文件',
      group: 'output'
    }
  ],
  
  handler: (args) => {
    try {
      if (args.length === 0) {
        return showInteractiveMode()
      }
      
      // 解析参数
      let hostname = null
      let port = 21 // 默认FTP端口
      let options = {
        passive: false,
        verbose: false,
        debug: false,
        anonymous: false
      }
      
      for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        
        if (arg === '-p') {
          options.passive = true
        } else if (arg === '-v') {
          options.verbose = true
        } else if (arg === '-d') {
          options.debug = true
        } else if (arg === '-i') {
          options.interactive = false
        } else if (arg === '-n') {
          options.autoLogin = false
        } else if (arg.startsWith('-')) {
          return `ftp: invalid option: ${arg}|ftp: 无效选项: ${arg}`
        } else if (!hostname) {
          hostname = arg
        } else if (!isNaN(parseInt(arg))) {
          port = parseInt(arg)
        }
      }
      
      if (hostname) {
        return connectToServer(hostname, port, options)
      } else {
        return showInteractiveMode()
      }
      
    } catch (error) {
      return `ftp: ${error.message}`
    }
  },
  
  category: 'network',
  requiresArgs: false,
  examples: [
    'ftp',
    'ftp ftp.example.com',
    'ftp -p ftp.example.com',
    'ftp -v server.com 2121'
  ],
  
  help: `Usage: ftp [options] [host [port]]

File Transfer Protocol client|文件传输协议客户端

ftp is the user interface to the Internet standard File Transfer Protocol.
The program allows a user to transfer files to and from a remote network site.
ftp 是Internet标准文件传输协议的用户界面。

Options|选项:
  -p              Use passive mode for data transfers|使用被动模式进行数据传输
  -v              Verbose mode, show all responses from server|详细模式，显示服务器的所有响应
  -d              Enable debugging mode|启用调试模式
  -i              Turn off interactive prompting during multiple file transfers|在多文件传输期间关闭交互提示
  -n              Restrain ftp from attempting auto-login upon initial connection|阻止ftp在初始连接时尝试自动登录

Interactive Commands|交互命令:
  open host [port]        Open connection to FTP server|打开到FTP服务器的连接
  user username           Specify username for login|指定登录用户名
  ls [directory]          List directory contents|列出目录内容
  dir [directory]         List directory contents (detailed)|列出目录内容（详细）
  cd directory            Change remote directory|更改远程目录
  lcd directory           Change local directory|更改本地目录
  pwd                     Print remote working directory|打印远程工作目录
  lpwd                    Print local working directory|打印本地工作目录
  get remotefile [localfile]  Download file from server|从服务器下载文件
  put localfile [remotefile]  Upload file to server|上传文件到服务器
  mget pattern            Download multiple files|下载多个文件
  mput pattern            Upload multiple files|上传多个文件
  delete filename         Delete remote file|删除远程文件
  mkdir directory         Create remote directory|创建远程目录
  rmdir directory         Remove remote directory|删除远程目录
  binary                  Set binary transfer mode|设置二进制传输模式
  ascii                   Set ASCII transfer mode|设置ASCII传输模式
  passive                 Toggle passive mode|切换被动模式
  status                  Show current status|显示当前状态
  close                   Close connection|关闭连接
  quit                    Exit FTP|退出FTP

Examples|示例:
  ftp                         # Enter interactive mode|进入交互模式
  ftp ftp.example.com         # Connect to FTP server|连接到FTP服务器
  ftp -p ftp.example.com      # Connect using passive mode|使用被动模式连接
  ftp -v ftp.example.com 2121 # Connect with verbose output on port 2121|在端口2121上详细输出连接

Notes|注意:
  - Default port is 21|默认端口是21
  - Use passive mode (-p) if behind firewall|如果在防火墙后面，使用被动模式(-p)
  - Binary mode is recommended for non-text files|对于非文本文件，建议使用二进制模式
  - Many FTP servers support anonymous login (username: anonymous)|许多FTP服务器支持匿名登录（用户名：anonymous）
  - Modern alternatives include SFTP and SCP for secure transfers|现代替代方案包括SFTP和SCP用于安全传输

Security Note|安全注意:
  FTP transmits data and credentials in plain text. Consider using
  secure alternatives like SFTP or SCP for sensitive data.
  FTP以明文传输数据和凭据。对于敏感数据，请考虑使用SFTP或SCP等安全替代方案。`
}

// 显示交互模式
function showInteractiveMode() {
  const results = []
  results.push('ftp> ')
  results.push('Welcome to FTP interactive mode|欢迎使用FTP交互模式')
  results.push('')
  results.push('Available commands:|可用命令:')
  results.push('  open <host> [port]    Connect to FTP server|连接到FTP服务器')
  results.push('  user <username>       Specify username|指定用户名')
  results.push('  ls [dir]              List directory contents|列出目录内容')
  results.push('  cd <dir>              Change directory|更改目录')
  results.push('  pwd                   Print working directory|打印工作目录')
  results.push('  get <file>            Download file|下载文件')
  results.push('  put <file>            Upload file|上传文件')
  results.push('  binary                Set binary transfer mode|设置二进制传输模式')
  results.push('  ascii                 Set ASCII transfer mode|设置ASCII传输模式')
  results.push('  passive               Toggle passive mode|切换被动模式')
  results.push('  close                 Close connection|关闭连接')
  results.push('  quit                  Exit FTP|退出FTP')
  results.push('')
  results.push('Type "help" for more commands|输入"help"查看更多命令')
  results.push('Type "quit" to exit|输入"quit"退出')
  
  return results.join('\n')
}

// 连接到服务器
function connectToServer(hostname, port, options) {
  const results = []
  
  if (options.verbose) {
    results.push(`Verbose mode on|详细模式开启`)
  }
  
  results.push(`Connected to ${hostname}.`)
  results.push(`已连接到 ${hostname}。`)
  
  // 模拟FTP服务器响应
  const serverResponses = [
    {
      code: 220,
      message: `Welcome to ${hostname} FTP service.`,
      messageZh: `欢迎使用 ${hostname} FTP服务。`
    },
    {
      code: 220,
      message: `${hostname} FTP server ready.`,
      messageZh: `${hostname} FTP服务器就绪。`
    },
    {
      code: 421,
      message: 'Service not available, closing control connection.',
      messageZh: '服务不可用，关闭控制连接。'
    }
  ]
  
  const response = serverResponses[Math.floor(Math.random() * serverResponses.length)]
  
  results.push(`${response.code} ${response.message}`)
  results.push(`${response.code} ${response.messageZh}`)
  
  if (response.code === 220) {
    results.push('Name (${hostname}:user): ')
    results.push('用户名 (${hostname}:user): ')
    
    // 模拟登录过程
    results.push('331 Please specify the password.')
    results.push('331 请指定密码。')
    results.push('Password: ')
    results.push('密码: ')
    
    // 模拟登录结果
    const loginSuccess = Math.random() > 0.3
    
    if (loginSuccess) {
      results.push('230 Login successful.')
      results.push('230 登录成功。')
      results.push('Remote system type is UNIX.')
      results.push('远程系统类型是UNIX。')
      results.push('Using binary mode to transfer files.')
      results.push('使用二进制模式传输文件。')
      results.push('ftp> ')
      
      // 显示一些示例命令
      results.push('')
      results.push('Connection established. Available commands:|连接已建立。可用命令:')
      results.push('  ls                    List files|列出文件')
      results.push('  cd <directory>        Change directory|更改目录')
      results.push('  get <filename>        Download file|下载文件')
      results.push('  put <filename>        Upload file|上传文件')
      results.push('  quit                  Disconnect|断开连接')
      
    } else {
      results.push('530 Login incorrect.')
      results.push('530 登录失败。')
      results.push('Login failed.')
      results.push('登录失败。')
    }
    
  } else {
    results.push('Connection failed.')
    results.push('连接失败。')
  }
  
  return results.join('\n')
}

export default ftp