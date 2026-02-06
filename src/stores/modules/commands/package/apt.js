import { formatHelp } from '../utils/helpFormatter.js'

export const apt = {
  name: 'apt',
  description: 'Advanced Package Tool|高级包管理工具（Debian/Ubuntu）',
  category: 'package',
  
  options: [
    // 操作命令组
    {
      flag: 'install',
      description: '安装软件包',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'remove',
      description: '移除软件包（保留配置文件）',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'purge',
      description: '完全移除软件包（包括配置文件）',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'update',
      description: '更新软件包列表',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'upgrade',
      description: '升级所有已安装的软件包',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'dist-upgrade',
      description: '发行版升级（处理依赖关系变化）',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'autoremove',
      description: '自动移除不再需要的软件包',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'search',
      description: '搜索软件包',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'show',
      description: '显示软件包详细信息',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'list',
      description: '列出软件包',
      type: 'boolean',
      group: '操作命令'
    },
    
    // 选项组
    {
      flag: '-y',
      longFlag: '--yes',
      description: '自动回答"是"',
      type: 'boolean',
      group: '选项'
    },
    {
      flag: '-s',
      longFlag: '--simulate',
      description: '模拟执行（不实际安装）',
      type: 'boolean',
      group: '选项'
    },
    {
      flag: '-q',
      longFlag: '--quiet',
      description: '安静模式',
      type: 'boolean',
      group: '选项'
    },
    {
      flag: '-v',
      longFlag: '--verbose',
      description: '详细输出',
      type: 'boolean',
      group: '选项'
    },
    {
      flag: '--no-install-recommends',
      description: '不安装推荐的软件包',
      type: 'boolean',
      group: '选项'
    },
    {
      flag: '--install-suggests',
      description: '安装建议的软件包',
      type: 'boolean',
      group: '选项'
    },
    
    // 包名参数
    {
      inputKey: 'package_name',
      description: '软件包名称',
      type: 'input',
      placeholder: '软件包名称（如 nginx, python3, vim）',
      required: false
    }
  ],
  
  execute(args, context) {
    if (args.length === 0 || args.includes('--help')) {
      return formatHelp({
        name: 'apt',
        description: 'Advanced Package Tool|高级包管理工具（Debian/Ubuntu）',
        usage: 'apt [OPTIONS] COMMAND|apt [选项] 命令',
        options: [
          'install PACKAGE      Install package|安装软件包',
          'remove PACKAGE       Remove package|移除软件包',
          'purge PACKAGE        Purge package|完全移除',
          'update               Update package list|更新软件包列表',
          'upgrade              Upgrade packages|升级软件包',
          'dist-upgrade         Distribution upgrade|发行版升级',
          'autoremove           Remove unused packages|自动移除',
          'search PATTERN       Search packages|搜索软件包',
          'show PACKAGE         Show package info|显示软件包信息',
          'list                 List packages|列出软件包',
          '-y, --yes            Assume yes|自动回答"是"',
          '-s, --simulate       Simulate|模拟执行',
          '-q, --quiet          Quiet|安静模式',
          '-v, --verbose        Verbose|详细输出'
        ],
        examples: [
          'apt update|更新软件包列表',
          'apt install nginx|安装nginx',
          'apt remove nginx|移除nginx',
          'apt upgrade|升级所有软件包',
          'apt search editor|搜索编辑器',
          'apt show nginx|显示nginx信息'
        ],
        notes: [
          'Requires root privileges|需要root权限',
          'Use apt instead of apt-get|推荐使用apt而非apt-get',
          'Update before install|安装前先更新'
        ]
      })
    }

    const command = args.find(arg => 
      ['install', 'remove', 'purge', 'update', 'upgrade', 'dist-upgrade', 
       'autoremove', 'search', 'show', 'list'].includes(arg)
    )
    
    const autoYes = args.includes('-y') || args.includes('--yes')
    const simulate = args.includes('-s') || args.includes('--simulate')
    
    let output = ''

    switch (command) {
      case 'update':
        output += `Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease\n`
        output += `Get:2 http://archive.ubuntu.com/ubuntu jammy-updates InRelease [114 kB]\n`
        output += `Get:3 http://security.ubuntu.com/ubuntu jammy-security InRelease [110 kB]\n`
        output += `Fetched 224 kB in 2s (112 kB/s)\n`
        output += `Reading package lists... Done\n`
        output += `Building dependency tree... Done\n`
        output += `Reading state information... Done\n`
        output += `12 packages can be upgraded. Run 'apt list --upgradable' to see them.\n`
        break
        
      case 'upgrade':
        if (simulate) {
          output += `NOTE: This is only a simulation!\n`
          output += `      apt needs root privileges for real execution.\n\n`
        }
        output += `Reading package lists... Done\n`
        output += `Building dependency tree... Done\n`
        output += `Reading state information... Done\n`
        output += `Calculating upgrade... Done\n`
        output += `The following packages will be upgraded:\n`
        output += `  libc6 libssl3 openssl tzdata\n`
        output += `4 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.\n`
        output += `Need to get 12.5 MB of archives.\n`
        output += `After this operation, 256 kB of additional disk space will be used.\n`
        if (!autoYes && !simulate) {
          output += `Do you want to continue? [Y/n] `
        } else {
          output += `Unpacking libc6...\n`
          output += `Setting up libc6...\n`
          output += `Processing triggers for libc-bin ...\n`
        }
        break
        
      case 'install': {
        const pkg = args[args.indexOf('install') + 1]
        if (!pkg) {
          return 'apt: 请指定要安装的软件包'
        }
        if (simulate) {
          output += `NOTE: This is only a simulation!\n\n`
        }
        output += `Reading package lists... Done\n`
        output += `Building dependency tree... Done\n`
        output += `Reading state information... Done\n`
        output += `The following NEW packages will be installed:\n`
        output += `  ${pkg} ${pkg}-common ${pkg}-data\n`
        output += `0 upgraded, 3 newly installed, 0 to remove and 0 not upgraded.\n`
        output += `Need to get 5,234 kB of archives.\n`
        output += `After this operation, 25.6 MB of additional disk space will be used.\n`
        if (!autoYes && !simulate) {
          output += `Do you want to continue? [Y/n] `
        } else {
          output += `Get:1 http://archive.ubuntu.com/ubuntu jammy/main amd64 ${pkg} amd64 1.0.0 [1,234 kB]\n`
          output += `Fetched 5,234 kB in 3s (1,745 kB/s)\n`
          output += `Selecting previously unselected package ${pkg}.\n`
          output += `Preparing to unpack .../${pkg}_1.0.0_amd64.deb ...\n`
          output += `Unpacking ${pkg} ...\n`
          output += `Setting up ${pkg} ...\n`
          output += `Processing triggers for man-db ...\n`
        }
        break
      }
        
      case 'search': {
        const pattern = args[args.indexOf('search') + 1]
        if (!pattern) {
          return 'apt: 请指定搜索模式'
        }
        output += `Sorting... Done\n`
        output += `Full Text Search... Done\n`
        output += `vim/jammy,now 2:8.2.3995-1ubuntu2 amd64 [installed]\n`
        output += `  Vi IMproved - enhanced vi editor\n\n`
        output += `nano/jammy 6.2-1 amd64\n`
        output += `  small, friendly text editor inspired by Pico\n\n`
        output += `emacs/jammy 1:27.1+1-3ubuntu5 all\n`
        output += `  GNU Emacs editor (metapackage)\n\n`
        output += `gedit/jammy 41.0-3 amd64\n`
        output += `  official text editor of the GNOME desktop environment\n`
        break
      }
        
      case 'show': {
        const pkg = args[args.indexOf('show') + 1]
        if (!pkg) {
          return 'apt: 请指定软件包'
        }
        output += `Package: ${pkg}\n`
        output += `Version: 1.18.0-0ubuntu1.2\n`
        output += `Priority: optional\n`
        output += `Section: web\n`
        output += `Origin: Ubuntu\n`
        output += `Maintainer: Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>\n`
        output += `Original-Maintainer: Debian Nginx Maintainers <pkg-nginx-maintainers@lists.alioth.debian.org>\n`
        output += `Bugs: https://bugs.launchpad.net/ubuntu/+filebug\n`
        output += `Installed-Size: 48.1 kB\n`
        output += `Depends: nginx-common (= 1.18.0-0ubuntu1.2)\n`
        output += `Homepage: http://nginx.net\n`
        output += `Download-Size: 3,456 B\n`
        output += `APT-Manual-Installed: yes\n`
        output += `APT-Sources: http://archive.ubuntu.com/ubuntu jammy-updates/main amd64 Packages\n`
        output += `Description: small, powerful, scalable web/proxy server\n`
        output += ` Nginx ("engine x") is a high-performance HTTP server and reverse proxy.\n`
        break
      }
        
      case 'list':
        output += `Listing... Done\n`
        output += `nginx/jammy-updates,now 1.18.0-0ubuntu1.2 amd64 [installed,automatic]\n`
        output += `vim/jammy,now 2:8.2.3995-1ubuntu2 amd64 [installed]\n`
        output += `curl/jammy-updates,now 7.81.0-1ubuntu1.10 amd64 [installed]\n`
        output += `python3/jammy,now 3.10.6-1~22.04 amd64 [installed,automatic]\n`
        break
        
      default:
        output += `apt: 请指定有效的命令\n`
        output += `Usage: apt [options] command\n`
    }

    return output
  }
}

export default apt
