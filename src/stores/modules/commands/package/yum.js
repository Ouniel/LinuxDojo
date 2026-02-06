import { formatHelp } from '../utils/helpFormatter.js'

export const yum = {
  name: 'yum',
  description: 'Yellowdog Updater Modified|RPM包管理工具（RHEL/CentOS）',
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
      description: '移除软件包',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'update',
      description: '更新软件包',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'upgrade',
      description: '升级系统',
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
      flag: 'info',
      description: '显示软件包信息',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'list',
      description: '列出软件包',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'clean',
      description: '清理缓存',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'repolist',
      description: '列出仓库',
      type: 'boolean',
      group: '操作命令'
    },
    {
      flag: 'groupinstall',
      description: '安装软件包组',
      type: 'boolean',
      group: '操作命令'
    },
    
    // 选项组
    {
      flag: '-y',
      description: '自动回答"是"',
      type: 'boolean',
      group: '选项'
    },
    {
      flag: '-q',
      description: '安静模式',
      type: 'boolean',
      group: '选项'
    },
    {
      flag: '-v',
      description: '详细模式',
      type: 'boolean',
      group: '选项'
    },
    {
      flag: '--nogpgcheck',
      description: '跳过GPG检查',
      type: 'boolean',
      group: '选项'
    },
    {
      flag: '--skip-broken',
      description: '跳过有问题的包',
      type: 'boolean',
      group: '选项'
    },
    {
      flag: '--downloadonly',
      description: '仅下载，不安装',
      type: 'boolean',
      group: '选项'
    },
    
    // 包名参数
    {
      inputKey: 'package_name',
      description: '软件包名称',
      type: 'input',
      placeholder: '软件包名称（如 httpd, mysql, php）',
      required: false
    }
  ],
  
  execute(args, context) {
    if (args.length === 0 || args.includes('--help')) {
      return formatHelp({
        name: 'yum',
        description: 'Yellowdog Updater Modified|RPM包管理工具（RHEL/CentOS）',
        usage: 'yum [OPTIONS] COMMAND|yum [选项] 命令',
        options: [
          'install PACKAGE      Install package|安装软件包',
          'remove PACKAGE       Remove package|移除软件包',
          'update               Update packages|更新软件包',
          'upgrade              Upgrade system|升级系统',
          'search PATTERN       Search packages|搜索软件包',
          'info PACKAGE         Show package info|显示软件包信息',
          'list                 List packages|列出软件包',
          'clean                Clean cache|清理缓存',
          'repolist             List repositories|列出仓库',
          'groupinstall GROUP   Install group|安装软件包组',
          '-y                   Assume yes|自动回答"是"',
          '-q                   Quiet|安静模式',
          '-v                   Verbose|详细模式',
          '--nogpgcheck         Skip GPG check|跳过GPG检查'
        ],
        examples: [
          'yum update|更新软件包',
          'yum install httpd|安装httpd',
          'yum remove httpd|移除httpd',
          'yum search web server|搜索web服务器',
          'yum info httpd|显示httpd信息',
          'yum repolist|列出仓库'
        ],
        notes: [
          'Requires root privileges|需要root权限',
          'Uses RPM packages|使用RPM包',
          'Replaced by dnf in newer versions|新版本中被dnf替代'
        ]
      })
    }

    const command = args.find(arg => 
      ['install', 'remove', 'update', 'upgrade', 'search', 'info', 
       'list', 'clean', 'repolist', 'groupinstall'].includes(arg)
    )
    
    const autoYes = args.includes('-y')
    
    let output = ''

    switch (command) {
      case 'update':
        output += `Loaded plugins: fastestmirror, langpacks\n`
        output += `Loading mirror speeds from cached hostfile\n`
        output += ` * base: mirror.centos.org\n`
        output += ` * extras: mirror.centos.org\n`
        output += ` * updates: mirror.centos.org\n`
        output += `Resolving Dependencies\n`
        output += `--> Running transaction check\n`
        output += `--> Finished Dependency Resolution\n\n`
        output += `Dependencies Resolved\n\n`
        output += `================================================================================\n`
        output += ` Package          Arch        Version                  Repository        Size\n`
        output += `================================================================================\n`
        output += `Updating:\n`
        output += ` kernel          x86_64      3.10.0-1160.el7          updates           50 M\n`
        output += ` openssl         x86_64      1:1.0.2k-21.el7          updates          493 k\n`
        output += ` tzdata          noarch      2021a-1.el7              updates          495 k\n\n`
        output += `Transaction Summary\n`
        output += `================================================================================\n`
        output += `Upgrade  3 Packages\n\n`
        output += `Total download size: 51 M\n`
        if (!autoYes) {
          output += `Is this ok [y/d/N]: `
        } else {
          output += `Downloading packages:\n`
          output += `(1/3): kernel-3.10.0-1160.el7.x86_64.rpm                    |  50 MB  00:05     \n`
          output += `(2/3): openssl-1.0.2k-21.el7.x86_64.rpm                     | 493 kB  00:00     \n`
          output += `(3/3): tzdata-2021a-1.el7.noarch.rpm                        | 495 kB  00:00     \n`
          output += `--------------------------------------------------------------------------------\n`
          output += `Total                                               8.5 MB/s |  51 MB  00:06     \n`
          output += `Running transaction check\n`
          output += `Running transaction test\n`
          output += `Transaction test succeeded\n`
          output += `Running transaction\n`
          output += `  Updating   : openssl-1:1.0.2k-21.el7.x86_64                             1/6\n`
          output += `  Updating   : tzdata-2021a-1.el7.noarch                                  2/6\n`
          output += `  Cleanup    : openssl-1:1.0.2k-19.el7.x86_64                             3/6\n`
          output += `  Cleanup    : tzdata-2020d-1.el7.noarch                                  4/6\n`
          output += `  Verifying  : openssl-1:1.0.2k-21.el7.x86_64                             5/6\n`
          output += `  Verifying  : tzdata-2021a-1.el7.noarch                                  6/6\n\n`
          output += `Updated:\n`
          output += `  openssl.x86_64 1:1.0.2k-21.el7\n`
          output += `  tzdata.noarch 0:2021a-1.el7\n\n`
          output += `Complete!\n`
        }
        break
        
      case 'install': {
        const pkg = args[args.indexOf('install') + 1]
        if (!pkg) {
          return 'yum: 请指定要安装的软件包'
        }
        output += `Loaded plugins: fastestmirror, langpacks\n`
        output += `Loading mirror speeds from cached hostfile\n`
        output += `Resolving Dependencies\n`
        output += `--> Running transaction check\n`
        output += `--> Processing Dependency: ${pkg}-libs for package: ${pkg}\n`
        output += `--> Running transaction check\n`
        output += `--> Finished Dependency Resolution\n\n`
        output += `Dependencies Resolved\n\n`
        output += `================================================================================\n`
        output += ` Package          Arch        Version                  Repository        Size\n`
        output += `================================================================================\n`
        output += `Installing:\n`
        output += ` ${pkg.padEnd(15)} x86_64      1.0.0-1.el7              base             2.5 M\n`
        output += `Installing for dependencies:\n`
        output += ` ${pkg}-libs     x86_64      1.0.0-1.el7              base             1.2 M\n\n`
        output += `Transaction Summary\n`
        output += `================================================================================\n`
        output += `Install  1 Package (+1 Dependent package)\n\n`
        output += `Total download size: 3.7 M\n`
        output += `Installed size: 12 M\n`
        if (!autoYes) {
          output += `Is this ok [y/d/N]: `
        } else {
          output += `Downloading packages:\n`
          output += `(1/2): ${pkg}-1.0.0-1.el7.x86_64.rpm                        | 2.5 MB  00:02     \n`
          output += `(2/2): ${pkg}-libs-1.0.0-1.el7.x86_64.rpm                   | 1.2 MB  00:01     \n`
          output += `--------------------------------------------------------------------------------\n`
          output += `Total                                               1.2 MB/s | 3.7 MB  00:03     \n`
          output += `Running transaction check\n`
          output += `Running transaction test\n`
          output += `Transaction test succeeded\n`
          output += `Running transaction\n`
          output += `  Installing : ${pkg}-libs-1.0.0-1.el7.x86_64                             1/2\n`
          output += `  Installing : ${pkg}-1.0.0-1.el7.x86_64                                  2/2\n`
          output += `  Verifying  : ${pkg}-1.0.0-1.el7.x86_64                                  1/2\n`
          output += `  Verifying  : ${pkg}-libs-1.0.0-1.el7.x86_64                             2/2\n\n`
          output += `Installed:\n`
          output += `  ${pkg}.x86_64 0:1.0.0-1.el7\n\n`
          output += `Dependency Installed:\n`
          output += `  ${pkg}-libs.x86_64 0:1.0.0-1.el7\n\n`
          output += `Complete!\n`
        }
        break
      }
        
      case 'search': {
        const pattern = args[args.indexOf('search') + 1]
        if (!pattern) {
          return 'yum: 请指定搜索模式'
        }
        output += `Loaded plugins: fastestmirror, langpacks\n`
        output += `Loading mirror speeds from cached hostfile\n\n`
        output += `============================= N/S matched: ${pattern} ==============================\n`
        output += `httpd.x86_64 : Apache HTTP Server\n`
        output += `httpd-devel.x86_64 : Development interfaces for the Apache HTTP server\n`
        output += `httpd-manual.noarch : Documentation for the Apache HTTP server\n`
        output += `httpd-tools.x86_64 : Tools for use with the Apache HTTP Server\n`
        output += `nginx.x86_64 : A high performance web server and reverse proxy server\n`
        output += `lighttpd.x86_64 : Lightning fast webserver with light system requirements\n\n`
        output += `  Name and summary matches only, use "search all" for everything.\n`
        break
      }
        
      case 'info': {
        const pkg = args[args.indexOf('info') + 1]
        if (!pkg) {
          return 'yum: 请指定软件包'
        }
        output += `Loaded plugins: fastestmirror, langpacks\n\n`
        output += `Installed Packages\n`
        output += `Name        : ${pkg}\n`
        output += `Arch        : x86_64\n`
        output += `Version     : 2.4.6\n`
        output += `Release     : 97.el7.centos\n`
        output += `Size        : 9.4 M\n`
        output += `Repo        : installed\n`
        output += `From repo   : base\n`
        output += `Summary     : Apache HTTP Server\n`
        output += `URL         : http://httpd.apache.org/\n`
        output += `License     : ASL 2.0\n`
        output += `Description : The Apache HTTP Server is a powerful, efficient, and extensible\n`
        output += `            : web server.\n`
        break
      }
        
      case 'repolist':
        output += `Loaded plugins: fastestmirror, langpacks\n`
        output += `Loading mirror speeds from cached hostfile\n`
        output += `repo id                    repo name                                       status\n`
        output += `base/7/x86_64              CentOS-7 - Base                                 10,072\n`
        output += `extras/7/x86_64            CentOS-7 - Extras                                  518\n`
        output += `updates/7/x86_64           CentOS-7 - Updates                               4,321\n`
        output += `repolist: 14,911\n`
        break
        
      default:
        output += `yum: 请指定有效的命令\n`
        output += `Usage: yum [options] COMMAND\n`
    }

    return output
  }
}

export default yum
