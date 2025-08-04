/**
 * ssh - OpenSSH SSH客户端（远程登录程序）
 */

export const ssh = {
  name: 'ssh',
  description: 'OpenSSH SSH client (remote login program)|OpenSSH SSH客户端（远程登录程序）',
  options: [
    {
      name: 'destination',
      type: 'input',
      flag: 'destination',
      inputKey: 'destination',
      description: 'Destination [user@]hostname|目标主机 [用户@]主机名',
      placeholder: 'user@hostname or hostname',
      required: true,
      group: 'target'
    },
    {
      name: 'command',
      type: 'input',
      flag: 'command',
      inputKey: 'command',
      description: 'Command to execute on remote host|在远程主机上执行的命令',
      placeholder: 'Remote command (optional)',
      group: 'target'
    },
    {
      name: '-p',
      type: 'input',
      flag: '-p',
      inputKey: 'port',
      description: 'Port to connect to on the remote host|连接远程主机的端口',
      placeholder: 'port number (e.g., 22)',
      group: 'connection'
    },
    {
      name: '-l',
      type: 'input',
      flag: '-l',
      inputKey: 'login_user',
      description: 'Specify the user to log in as|指定登录用户',
      placeholder: 'username',
      group: 'auth'
    },
    {
      name: '-i',
      type: 'input',
      flag: '-i',
      inputKey: 'identity_file',
      description: 'Select file from which identity is read|选择身份验证文件',
      placeholder: 'identity file path (e.g., ~/.ssh/id_rsa)',
      group: 'auth'
    },
    {
      name: '-F',
      type: 'input',
      flag: '-F',
      inputKey: 'config_file',
      description: 'Specify alternative per-user configuration file|指定用户配置文件',
      placeholder: 'config file path',
      group: 'config'
    },
    {
      name: '-c',
      type: 'input',
      flag: '-c',
      inputKey: 'cipher',
      description: 'Select encryption algorithm|选择加密算法',
      placeholder: 'cipher spec (e.g., aes128-ctr)',
      group: 'security'
    },
    {
      name: '-L',
      type: 'input',
      flag: '-L',
      inputKey: 'local_forward',
      description: 'Local port forwarding|本地端口转发',
      placeholder: '[bind_address:]port:host:hostport',
      group: 'forwarding'
    },
    {
      name: '-R',
      type: 'input',
      flag: '-R',
      inputKey: 'remote_forward',
      description: 'Remote port forwarding|远程端口转发',
      placeholder: '[bind_address:]port:host:hostport',
      group: 'forwarding'
    },
    {
      name: '-D',
      type: 'input',
      flag: '-D',
      inputKey: 'dynamic_forward',
      description: 'Dynamic application-level port forwarding|动态应用层端口转发',
      placeholder: '[bind_address:]port',
      group: 'forwarding'
    },
    {
      name: '-o',
      type: 'input',
      flag: '-o',
      inputKey: 'option',
      description: 'Can be used to give options in config file format|配置选项',
      placeholder: 'option=value (e.g., StrictHostKeyChecking=no)',
      group: 'config'
    },
    {
      name: '-v',
      flag: '-v',
      type: 'boolean',
      description: 'Verbose mode (can be used multiple times)|详细模式',
      group: 'debug'
    },
    {
      name: '-q',
      flag: '-q',
      type: 'boolean',
      description: 'Quiet mode|静默模式',
      group: 'debug'
    },
    {
      name: '-f',
      flag: '-f',
      type: 'boolean',
      description: 'Go to background after authentication|认证后转入后台',
      group: 'behavior'
    },
    {
      name: '-N',
      flag: '-N',
      type: 'boolean',
      description: 'Do not execute a remote command|不执行远程命令',
      group: 'behavior'
    },
    {
      name: '-t',
      flag: '-t',
      type: 'boolean',
      description: 'Force pseudo-terminal allocation|强制分配伪终端',
      group: 'terminal'
    },
    {
      name: '-T',
      flag: '-T',
      type: 'boolean',
      description: 'Disable pseudo-terminal allocation|禁用伪终端分配',
      group: 'terminal'
    },
    {
      name: '-X',
      flag: '-X',
      type: 'boolean',
      description: 'Enable X11 forwarding|启用X11转发',
      group: 'forwarding'
    },
    {
      name: '-Y',
      flag: '-Y',
      type: 'boolean',
      description: 'Enable trusted X11 forwarding|启用可信X11转发',
      group: 'forwarding'
    },
    {
      name: '-C',
      flag: '-C',
      type: 'boolean',
      description: 'Enable compression|启用压缩',
      group: 'performance'
    },
    {
      name: '-4',
      flag: '-4',
      type: 'boolean',
      description: 'Use IPv4 only|仅使用IPv4',
      group: 'network'
    },
    {
      name: '-6',
      flag: '-6',
      type: 'boolean',
      description: 'Use IPv6 only|仅使用IPv6',
      group: 'network'
    },
    {
      name: '-A',
      flag: '-A',
      type: 'boolean',
      description: 'Enable agent forwarding|启用代理转发',
      group: 'forwarding'
    },
    {
      name: '-a',
      flag: '-a',
      type: 'boolean',
      description: 'Disable agent forwarding|禁用代理转发',
      group: 'forwarding'
    },
    {
      name: '-g',
      flag: '-g',
      type: 'boolean',
      description: 'Allow remote hosts to connect to forwarded ports|允许远程主机连接转发端口',
      group: 'forwarding'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return ssh.help
    }

    const port = getOptionValue(args, '-p')
    const user = getOptionValue(args, '-l')
    const identity = getOptionValue(args, '-i')
    const config = getOptionValue(args, '-F')
    const cipher = getOptionValue(args, '-c')
    const escape = getOptionValue(args, '-e')
    const logLevel = getOptionValue(args, '-o')
    const verbose = args.includes('-v') || args.includes('-vv') || args.includes('-vvv')
    const quiet = args.includes('-q')
    const background = args.includes('-f')
    const noCommand = args.includes('-N')
    const tty = args.includes('-t')
    const noTty = args.includes('-T')
    const x11Forward = args.includes('-X')
    const x11ForwardTrusted = args.includes('-Y')
    const compression = args.includes('-C')
    const ipv4 = args.includes('-4')
    const ipv6 = args.includes('-6')
    const gateway = args.includes('-g')
    const keepAlive = args.includes('-o ServerAliveInterval')
    
    // 端口转发选项
    const localForward = getAllOptionValues(args, '-L')
    const remoteForward = getAllOptionValues(args, '-R')
    const dynamicForward = getOptionValue(args, '-D')

    // 获取目标主机和命令
    const nonOptionArgs = args.filter(arg => 
      !arg.startsWith('-') && 
      !isOptionValue(arg, args)
    )

    if (nonOptionArgs.length === 0) {
      return 'usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface]\n           [-b bind_address] [-c cipher_spec] [-D [bind_address:]port]\n           [-E log_file] [-e escape_char] [-F ssh_config_file] [-I pkcs11]\n           [-i identity_file] [-J [user@]host[:port]] [-L address]\n           [-l login_name] [-m mac_spec] [-O ctl_cmd] [-o option] [-p port]\n           [-Q query_option] [-R address] [-S ctl_path] [-W host:port]\n           [-w local_tun[:remote_tun]] destination [command]'
    }

    const destination = nonOptionArgs[0]
    const command = nonOptionArgs.slice(1).join(' ')

    try {
      const result = simulateSSHConnection(destination, command, {
        port: port || '22',
        user,
        identity,
        config,
        cipher,
        escape,
        logLevel,
        verbose,
        quiet,
        background,
        noCommand,
        tty,
        noTty,
        x11Forward,
        x11ForwardTrusted,
        compression,
        ipv4,
        ipv6,
        gateway,
        keepAlive,
        localForward,
        remoteForward,
        dynamicForward
      })

      return result

    } catch (error) {
      return `ssh: ${error.message}`
    }
  },
  description: 'OpenSSH SSH client (remote login program)|OpenSSH SSH客户端（远程登录程序）',
  category: 'network',
  requiresArgs: true,
  examples: [
    'ssh user@hostname                              # Connect to hostname as user|以用户身份连接到主机名',
    'ssh -p 2222 user@hostname                     # Connect using port 2222|使用端口2222连接',
    'ssh -i ~/.ssh/id_rsa user@hostname            # Use specific identity file|使用特定的身份文件',
    'ssh -L 8080:localhost:80 user@hostname        # Local port forwarding|本地端口转发',
    'ssh user@hostname "ls -la"                    # Execute command on remote host|在远程主机上执行命令'
  ],
  help: `OpenSSH_8.0p1, OpenSSL 1.1.1d  10 Sep 2019
usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface]
           [-b bind_address] [-c cipher_spec] [-D [bind_address:]port]
           [-E log_file] [-e escape_char] [-F ssh_config_file] [-I pkcs11]
           [-i identity_file] [-J [user@]host[:port]] [-L address]
           [-l login_name] [-m mac_spec] [-O ctl_cmd] [-o option] [-p port]
           [-Q query_option] [-R address] [-S ctl_path] [-W host:port]
           [-w local_tun[:remote_tun]] destination [command]

Most useful options:
  -4                Use IPv4 only
  -6                Use IPv6 only
  -A                Enable agent forwarding
  -a                Disable agent forwarding
  -C                Enable compression
  -c cipher_spec    Select encryption algorithm
  -D [bind_address:]port
                    Dynamic application-level port forwarding
  -E log_file       Append debug logs to log_file instead of stderr
  -e escape_char    Set escape character (default: ~)
  -F ssh_config_file
                    Specify alternative per-user configuration file
  -f                Go to background after authentication
  -G                Output configuration and exit
  -g                Allow remote hosts to connect to forwarded ports
  -I pkcs11         PKCS#11 provider
  -i identity_file  Select file from which identity is read
  -J [user@]host[:port]
                    Connect via a jump host
  -K                Enable GSSAPI-based authentication
  -k                Disable GSSAPI-based authentication
  -L [bind_address:]port:host:hostport
                    Local port forwarding
  -l login_name     Specify the user to log in as on the remote machine
  -M                Place ssh client into "master" mode
  -m mac_spec       Specify MAC algorithms
  -N                Do not execute a remote command
  -n                Redirect stdin from /dev/null
  -O ctl_cmd        Control an active connection multiplexing master process
  -o option         Can be used to give options in the format used in config file
  -p port           Port to connect to on the remote host
  -Q query_option   Query ssh for the algorithms supported
  -q                Quiet mode
  -R [bind_address:]port:host:hostport
                    Remote port forwarding
  -S ctl_path       Specify the path to the control socket
  -s                May be used to request invocation of a subsystem
  -T                Disable pseudo-terminal allocation
  -t                Force pseudo-terminal allocation
  -V                Display version number and exit
  -v                Verbose mode (multiple -v options increase verbosity)
  -W host:port      Forward stdin and stdout to host on port over the secure channel
  -w local_tun[:remote_tun]
                    Request tunnel device forwarding
  -X                Enable X11 forwarding
  -x                Disable X11 forwarding
  -Y                Enable trusted X11 forwarding
  -y                Send log information via syslog

Examples:
  ssh user@hostname                    Connect to hostname as user
  ssh -p 2222 user@hostname           Connect using port 2222
  ssh -i ~/.ssh/id_rsa user@hostname  Use specific identity file
  ssh -L 8080:localhost:80 user@host  Local port forwarding
  ssh user@hostname "ls -la"          Execute command on remote host`
}

// 模拟SSH连接
function simulateSSHConnection(destination, command, options) {
  const results = []
  
  try {
    // 解析目标地址
    const { user, hostname, port } = parseDestination(destination, options)
    
    // 显示连接信息
    if (options.verbose) {
      results.push(`OpenSSH_8.0p1, OpenSSL 1.1.1d  10 Sep 2019`)
      results.push(`debug1: Reading configuration data /etc/ssh/ssh_config`)
      if (options.config) {
        results.push(`debug1: Reading configuration data ${options.config}`)
      }
      results.push(`debug1: Connecting to ${hostname} [${generateRandomIP()}] port ${port}.`)
      results.push(`debug1: Connection established.`)
      results.push(`debug1: identity file ${options.identity || '~/.ssh/id_rsa'} type 0`)
      results.push(`debug1: Local version string SSH-2.0-OpenSSH_8.0`)
      results.push(`debug1: Remote protocol version 2.0, remote software version OpenSSH_7.4`)
      results.push(`debug1: match: OpenSSH_7.4 pat OpenSSH_7.0*,OpenSSH_7.1*,OpenSSH_7.2*,OpenSSH_7.3*,OpenSSH_7.4* compat 0x04000002`)
      results.push(`debug1: Authenticating to ${hostname}:${port} as '${user}'`)
      results.push(`debug1: SSH2_MSG_KEXINIT sent`)
      results.push(`debug1: SSH2_MSG_KEXINIT received`)
      results.push(`debug1: kex: algorithm: curve25519-sha256`)
      results.push(`debug1: kex: host key algorithm: ecdsa-sha2-nistp256`)
      results.push(`debug1: kex: server->client cipher: chacha20-poly1305@openssh.com MAC: <implicit> compression: none`)
      results.push(`debug1: kex: client->server cipher: chacha20-poly1305@openssh.com MAC: <implicit> compression: none`)
      results.push(`debug1: expecting SSH2_MSG_KEX_ECDH_REPLY`)
      results.push(`debug1: Server host key: ecdsa-sha2-nistp256 SHA256:abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`)
      results.push(`debug1: Host '${hostname}' is known and matches the ECDSA host key.`)
      results.push(`debug1: Found key in /home/${user}/.ssh/known_hosts:1`)
      results.push(`debug1: rekey after 134217728 blocks`)
      results.push(`debug1: SSH2_MSG_NEWKEYS sent`)
      results.push(`debug1: expecting SSH2_MSG_NEWKEYS`)
      results.push(`debug1: SSH2_MSG_NEWKEYS received`)
      results.push(`debug1: rekey after 134217728 blocks`)
      results.push(`debug1: SSH2_MSG_EXT_INFO received`)
      results.push(`debug1: kex_input_ext_info: server-sig-algs=<rsa-sha2-256,rsa-sha2-512>`)
      results.push(`debug1: SSH2_MSG_SERVICE_ACCEPT received`)
    }

    // 处理端口转发
    if (options.localForward) {
      for (const forward of options.localForward) {
        if (!options.quiet) {
          results.push(`Local forwarding listening on ${forward}`)
        }
        if (options.verbose) {
          results.push(`debug1: Local connections to ${forward} forwarded to remote address`)
        }
      }
    }

    if (options.remoteForward) {
      for (const forward of options.remoteForward) {
        if (!options.quiet) {
          results.push(`Remote forwarding listening on ${forward}`)
        }
        if (options.verbose) {
          results.push(`debug1: Remote connections from ${forward} forwarded to local address`)
        }
      }
    }

    if (options.dynamicForward) {
      if (!options.quiet) {
        results.push(`Dynamic forwarding listening on ${options.dynamicForward}`)
      }
      if (options.verbose) {
        results.push(`debug1: Local connections to ${options.dynamicForward} forwarded to remote SOCKS proxy`)
      }
    }

    // 认证过程
    if (options.verbose) {
      if (options.identity) {
        results.push(`debug1: Offering public key: ${options.identity}`)
        results.push(`debug1: Server accepts key: pkalg ecdsa-sha2-nistp256 blen 104`)
        results.push(`debug1: Authentication succeeded (publickey).`)
      } else {
        results.push(`debug1: Authentications that can continue: publickey,password`)
        results.push(`debug1: Next authentication method: publickey`)
        results.push(`debug1: Offering public key: ~/.ssh/id_rsa RSA SHA256:abc123def456`)
        results.push(`debug1: Server accepts key: pkalg rsa-sha2-512 blen 279`)
        results.push(`debug1: Authentication succeeded (publickey).`)
      }
      results.push(`Authenticated to ${hostname} ([${generateRandomIP()}]:${port}).`)
    }

    // 后台模式
    if (options.background) {
      if (!options.quiet) {
        results.push(`ssh: backgrounding successful`)
      }
      return results.join('\n')
    }

    // 只建立连接不执行命令
    if (options.noCommand) {
      if (options.verbose) {
        results.push(`debug1: Requesting no-more-sessions@openssh.com`)
        results.push(`debug1: Entering interactive session.`)
        results.push(`debug1: pledge: network`)
      }
      if (!options.quiet) {
        results.push(`Connection established. No command will be executed.`)
        results.push(`Press Ctrl+C to close the connection.`)
      }
      return results.join('\n')
    }

    // 执行远程命令
    if (command) {
      if (options.verbose) {
        results.push(`debug1: Sending command: ${command}`)
        results.push(`debug1: Entering interactive session.`)
        results.push(`debug1: pledge: stdio`)
      }
      
      // 模拟命令执行结果
      const commandResult = simulateRemoteCommand(command, hostname, user)
      results.push(...commandResult)
      
      if (options.verbose) {
        results.push(`debug1: client_input_channel_req: channel 0 rtype exit-status reply 0`)
        results.push(`debug1: channel 0: free: client-session, nchannels 1`)
        results.push(`debug1: fd 0 clearing O_NONBLOCK`)
        results.push(`debug1: fd 1 clearing O_NONBLOCK`)
        results.push(`Transferred: sent 2345, received 3456 bytes, in 0.1 seconds`)
        results.push(`Bytes per second: sent 23450.0, received 34560.0`)
        results.push(`debug1: Exit status 0`)
      }
    } else {
      // 交互式会话
      if (options.verbose) {
        results.push(`debug1: Requesting pty.`)
        results.push(`debug1: Sending environment.`)
        results.push(`debug1: Sending env LANG = en_US.UTF-8`)
        results.push(`debug1: Entering interactive session.`)
        results.push(`debug1: pledge: stdio`)
      }
      
      results.push(`Welcome to ${hostname}!`)
      results.push(`Last login: ${new Date().toDateString()} from ${generateRandomIP()}`)
      results.push(`[${user}@${hostname} ~]$ `)
      
      if (!options.quiet) {
        results.push(`(Interactive session started. Type 'exit' to close connection)`)
      }
    }

  } catch (error) {
    if (error.message.includes('Connection refused')) {
      return `ssh: connect to host ${destination} port ${options.port}: Connection refused`
    } else if (error.message.includes('Host key verification failed')) {
      return `@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
The fingerprint for the ECDSA key sent by the remote host is
SHA256:abc123def456ghi789jkl012mno345pqr678stu901vwx234yz.
Please contact your system administrator.
Add correct host key in /home/${options.user || 'user'}/.ssh/known_hosts to get rid of this message.
Offending ECDSA key in /home/${options.user || 'user'}/.ssh/known_hosts:1
ECDSA host key for ${destination} has changed and you have requested strict checking.
Host key verification failed.`
    } else if (error.message.includes('Permission denied')) {
      return `${options.user || 'user'}@${destination}: Permission denied (publickey,password).`
    } else if (error.message.includes('Name or service not known')) {
      return `ssh: Could not resolve hostname ${destination}: Name or service not known`
    }
    
    return `ssh: ${error.message}`
  }

  return results.join('\n')
}

// 解析目标地址
function parseDestination(destination, options) {
  let user = options.user || process.env.USER || 'user'
  let hostname = destination
  let port = options.port || '22'

  // 解析 user@hostname 格式
  if (destination.includes('@')) {
    const parts = destination.split('@')
    user = parts[0]
    hostname = parts[1]
  }

  // 解析 hostname:port 格式
  if (hostname.includes(':') && !hostname.includes('[')) {
    const parts = hostname.split(':')
    hostname = parts[0]
    port = parts[1]
  }

  // 解析 [hostname]:port 格式 (IPv6)
  if (hostname.startsWith('[')) {
    const match = hostname.match(/\[([^\]]+)\]:?(\d+)?/)
    if (match) {
      hostname = match[1]
      if (match[2]) port = match[2]
    }
  }

  return { user, hostname, port }
}

// 模拟远程命令执行
function simulateRemoteCommand(command, hostname, user) {
  const results = []
  
  // 根据命令类型返回不同的模拟结果
  if (command === 'whoami') {
    results.push(user)
  } else if (command === 'hostname') {
    results.push(hostname)
  } else if (command === 'pwd') {
    results.push(`/home/${user}`)
  } else if (command.startsWith('ls')) {
    results.push('Desktop    Documents  Downloads  Music     Pictures  Public    Templates  Videos')
  } else if (command === 'date') {
    results.push(new Date().toString())
  } else if (command === 'uptime') {
    const uptime = Math.floor(Math.random() * 100) + 1
    const load = (Math.random() * 2).toFixed(2)
    results.push(` ${new Date().toTimeString().split(' ')[0]}  up ${uptime} days,  3 users,  load average: ${load}, ${load}, ${load}`)
  } else if (command.startsWith('ps')) {
    results.push('  PID TTY          TIME CMD')
    results.push(' 1234 pts/0    00:00:00 bash')
    results.push(' 5678 pts/0    00:00:00 ps')
  } else if (command === 'df -h') {
    results.push('Filesystem      Size  Used Avail Use% Mounted on')
    results.push('/dev/sda1        20G  8.5G   11G  45% /')
    results.push('tmpfs           2.0G     0  2.0G   0% /dev/shm')
  } else if (command === 'free -h') {
    results.push('              total        used        free      shared  buff/cache   available')
    results.push('Mem:           3.9G        1.2G        1.8G         45M        876M        2.4G')
    results.push('Swap:          2.0G          0B        2.0G')
  } else if (command.includes('cat /etc/os-release')) {
    results.push('NAME="Ubuntu"')
    results.push('VERSION="20.04.3 LTS (Focal Fossa)"')
    results.push('ID=ubuntu')
    results.push('ID_LIKE=debian')
    results.push('PRETTY_NAME="Ubuntu 20.04.3 LTS"')
    results.push('VERSION_ID="20.04"')
  } else if (command.includes('uname')) {
    if (command.includes('-a')) {
      results.push(`Linux ${hostname} 5.4.0-88-generic #99-Ubuntu SMP Thu Sep 23 17:29:00 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux`)
    } else {
      results.push('Linux')
    }
  } else {
    // 通用命令执行结果
    results.push(`Command executed on ${hostname}: ${command}`)
    results.push('(This is a simulated SSH session)')
  }

  return results
}

// 生成随机IP地址
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
    '-p', '-l', '-i', '-F', '-c', '-e', '-o', '-L', '-R', '-D',
    '-B', '-b', '-E', '-I', '-J', '-m', '-O', '-Q', '-S', '-W', '-w'
  ]
  
  return optionsWithValues.includes(prevArg)
}