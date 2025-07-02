import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useFilesystemStore } from './filesystem'

export const useCommandsStore = defineStore('commands', () => {
    const selectedCommand = ref(null)
    const selectedParameters = ref([])
    const userInputs = ref({}) // 用户输入数据
    const commandOutput = ref('')

    // 命令分类
    const categories = ref([
        {
            id: 'all',
            name: '全部命令',
            icon: '🔥',
            color: 'text-red-400'
        },
        {
            id: 'file-operations',
            name: '文件操作',
            icon: '📁',
            color: 'text-blue-400'
        },
        {
            id: 'text-processing',
            name: '文本处理',
            icon: '📝',
            color: 'text-purple-400'
        },
        {
            id: 'process-management',
            name: '进程管理',
            icon: '⚙️',
            color: 'text-green-400'
        },
        {
            id: 'network-tools',
            name: '网络工具',
            icon: '🌐',
            color: 'text-cyan-400'
        },
        {
            id: 'system-info',
            name: '系统信息',
            icon: '🖥️',
            color: 'text-yellow-400'
        },
        {
            id: 'archive-compression',
            name: '压缩归档',
            icon: '📦',
            color: 'text-orange-400'
        },
        {
            id: 'permissions',
            name: '权限管理',
            icon: '🔐',
            color: 'text-pink-400'
        },
        {
            id: 'user-management',
            name: '用户管理',
            icon: '👥',
            color: 'text-indigo-400'
        },
        {
            id: 'io-redirection',
            name: '输入输出',
            icon: '🔗',
            color: 'text-teal-400'
        },
        {
            id: 'disk-management',
            name: '磁盘管理',
            icon: '💾',
            color: 'text-orange-400'
        }
    ])

    // 命令数据库 - 基于linuxcool.com标准更新
    const commands = ref([
        {
            id: 'ls',
            name: 'ls',
            description: '显示目录中文件及其属性信息',
            category: 'file-operations',
            usage: 'ls [参数] [文件或目录...]',
            difficulty: 2,
            hot: true,
            icon: '📄',
            options: [
                // 显示相关参数
                {
                    flag: '-a',
                    description: '显示所有文件，包括以 . 开头的隐藏文件',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-A',
                    description: '显示除 . 和 .. 外的所有文件',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-b',
                    description: '以八进制转义字符显示不可打印字符',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-d',
                    description: '将目录视为普通文件，显示目录自身的信息',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-f',
                    description: '不进行排序，直接列出结果，等同于启用 -aU 并禁用 -lst',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-F',
                    description: '在每个名称后附加指示符号（例如： / 表示目录， * 表示可执行文件）',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-i',
                    description: '显示文件的inode编号',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-n',
                    description: '以数字形式显示用户和组ID，而非名称',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-p',
                    description: '在目录名后加上斜杠 / 以区分目录',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-q',
                    description: '用问号 ? 替换不可打印的字符',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-R',
                    description: '递归列出所有子目录及其内容',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-s',
                    description: '显示每个文件的块大小',
                    type: 'boolean',
                    group: 'display'
                },
                // 格式相关参数
                {
                    flag: '-l',
                    description: '以长格式显示文件的详细信息，包括权限、所有者、大小和修改时间',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '-h',
                    description: '以人类可读的格式显示文件大小（例如：1K，234M，2G）',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '-1',
                    description: '每行只输出一个文件名',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '-m',
                    description: '使用逗号分隔文件名，横向输出',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '-x',
                    description: '按行列顺序排列输出，横向排序',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '--full-time',
                    description: '显示完整的时间戳信息',
                    type: 'boolean',
                    group: 'format'
                },
                // 排序相关参数
                {
                    flag: '-t',
                    description: '按修改时间排序，最新的排在前面',
                    type: 'boolean',
                    group: 'sort'
                },
                {
                    flag: '-S',
                    description: '按文件大小排序',
                    type: 'boolean',
                    group: 'sort'
                },
                {
                    flag: '-r',
                    longFlag: '--reverse',
                    description: '逆序排列输出',
                    type: 'boolean',
                    group: 'sort'
                },
                {
                    flag: '-u',
                    description: '显示文件的访问时间，并根据访问时间排序',
                    type: 'boolean',
                    group: 'sort'
                },
                {
                    flag: '-c',
                    description: '根据文件状态更改时间排序，并显示ctime',
                    type: 'boolean',
                    group: 'sort'
                },
                // 颜色和样式参数
                {
                    flag: '--color',
                    description: '根据文件类型使用不同颜色显示，参数可为 never 、 always 或 auto',
                    type: 'select',
                    group: 'display',
                    options: ['auto', 'always', 'never'],
                    default: 'auto',
                    inputKey: 'color_option'
                },
                {
                    flag: '--time-style',
                    description: '时间显示格式',
                    type: 'select',
                    group: 'format',
                    options: ['full-iso', 'long-iso', 'iso', 'locale'],
                    inputKey: 'time_style'
                },
                // 目标路径参数
                {
                    flag: '',
                    description: '目标目录或文件',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入目录路径，如: /home/user/documents',
                    inputKey: 'target_path'
                }
            ],
            relatedCommands: ['cd', 'pwd', 'find', 'tree'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'cat',
            name: 'cat',
            description: '在终端设备上显示文件内容',
            category: 'text-processing',
            usage: 'cat [参数] [文件...]',
            difficulty: 1,
            hot: true,
            icon: '📄',
            options: [
                {
                    flag: '-n',
                    description: '显示行数（空行也编号）',
                    type: 'boolean',
                    group: 'numbering'
                },
                {
                    flag: '-b',
                    description: '显示行数（空行不编号）',
                    type: 'boolean',
                    group: 'numbering'
                },
                {
                    flag: '-s',
                    description: '将多个空行压缩为一行',
                    type: 'boolean',
                    group: 'formatting'
                },
                {
                    flag: '-T',
                    description: '将TAB字符显示为^I符号',
                    type: 'boolean',
                    group: 'formatting'
                },
                {
                    flag: '-E',
                    description: '每行结束处显示$符号',
                    type: 'boolean',
                    group: 'formatting'
                },
                {
                    flag: '-v',
                    description: '使用^和M-引用，LFD和TAB除外',
                    type: 'boolean',
                    group: 'formatting'
                },
                {
                    flag: '-A',
                    description: '等价于-vET参数组合，显示所有非打印字符',
                    type: 'boolean',
                    group: 'formatting'
                },
                {
                    flag: '-e',
                    description: '等价于-vE参数组合',
                    type: 'boolean',
                    group: 'formatting'
                },
                {
                    flag: '-t',
                    description: '等价于-vT参数组合',
                    type: 'boolean',
                    group: 'formatting'
                },
                {
                    flag: '--help',
                    description: '显示帮助信息',
                    type: 'boolean',
                    group: 'help'
                },
                {
                    flag: '--version',
                    description: '显示版本信息',
                    type: 'boolean',
                    group: 'help'
                },
                {
                    flag: '',
                    description: '要显示的文件',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入文件路径，如: /home/user/file.txt',
                    inputKey: 'target_file',
                    required: true
                }
            ],
            relatedCommands: ['head', 'tail', 'less', 'more'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'grep',
            name: 'grep',
            description: '强大的文本搜索工具',
            category: 'text-processing',
            usage: 'grep [选项] 模式 [文件...]',
            difficulty: 3,
            hot: true,
            icon: '🔍',
            options: [
                // 基本搜索选项
                {
                    flag: '-i',
                    description: '忽略关键词大小写',
                    type: 'boolean',
                    group: 'search'
                },
                {
                    flag: '-v',
                    description: '显示不包含匹配文本的所有行',
                    type: 'boolean',
                    group: 'search'
                },
                {
                    flag: '-w',
                    description: '精准匹配整词',
                    type: 'boolean',
                    group: 'search'
                },
                {
                    flag: '-x',
                    description: '精准匹配整行',
                    type: 'boolean',
                    group: 'search'
                },
                {
                    flag: '-F',
                    description: '匹配固定字符串的内容',
                    type: 'boolean',
                    group: 'search'
                },
                {
                    flag: '-E',
                    description: '支持扩展正则表达式',
                    type: 'boolean',
                    group: 'search'
                },
                // 输出控制选项
                {
                    flag: '-b',
                    description: '显示匹配行距文件头部的偏移量',
                    type: 'boolean',
                    group: 'output'
                },
                {
                    flag: '-n',
                    description: '显示所有匹配行及其行号',
                    type: 'boolean',
                    group: 'output'
                },
                {
                    flag: '-c',
                    description: '只显示匹配的行数',
                    type: 'boolean',
                    group: 'output'
                },
                {
                    flag: '-l',
                    description: '只显示符合匹配条件的文件名',
                    type: 'boolean',
                    group: 'output'
                },
                {
                    flag: '-h',
                    description: '搜索多文件时不显示文件名',
                    type: 'boolean',
                    group: 'output'
                },
                {
                    flag: '-o',
                    description: '显示匹配词距文件头部的偏移量',
                    type: 'boolean',
                    group: 'output'
                },
                {
                    flag: '-q',
                    description: '静默执行模式',
                    type: 'boolean',
                    group: 'output'
                },
                // 文件搜索选项
                {
                    flag: '-r',
                    description: '递归搜索模式',
                    type: 'boolean',
                    group: 'file'
                },
                {
                    flag: '-s',
                    description: '不显示没有匹配文本的错误信息',
                    type: 'boolean',
                    group: 'file'
                },
                // 输入参数
                {
                    flag: '',
                    description: '搜索模式（关键词或正则表达式）',
                    type: 'input',
                    group: 'pattern',
                    placeholder: '输入搜索关键词，如: error',
                    inputKey: 'search_pattern',
                    required: true
                },
                {
                    flag: '',
                    description: '目标文件或目录',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入文件路径，如: /var/log/syslog',
                    inputKey: 'target_files'
                }
            ],
            relatedCommands: ['egrep', 'fgrep', 'sed', 'awk'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'find',
            name: 'find',
            description: '根据路径和条件搜索指定文件',
            category: 'file-operations',
            usage: 'find [起始路径] [表达式]',
            difficulty: 4,
            hot: true,
            icon: '🔍',
            options: [
                // 名称匹配
                {
                    flag: '-name',
                    description: '根据文件名匹配（支持通配符）',
                    type: 'input',
                    group: 'name',
                    placeholder: '文件名模式，如: *.txt',
                    inputKey: 'name_pattern'
                },
                {
                    flag: '-iname',
                    description: '根据文件名匹配（忽略大小写）',
                    type: 'input',
                    group: 'name',
                    placeholder: '文件名模式，如: *.LOG',
                    inputKey: 'iname_pattern'
                },
                // 文件类型
                {
                    flag: '-type',
                    description: '匹配文件类型',
                    type: 'select',
                    group: 'type',
                    options: ['f', 'd', 'l', 'c', 'b', 'p', 's'],
                    inputKey: 'file_type',
                    optionLabels: {
                        'f': '普通文件',
                        'd': '目录',
                        'l': '符号链接',
                        'c': '字符设备',
                        'b': '块设备',
                        'p': '命名管道',
                        's': '套接字'
                    }
                },
                // 大小匹配
                {
                    flag: '-size',
                    description: '匹配文件大小',
                    type: 'input',
                    group: 'size',
                    placeholder: '如: +10M, -1k, 100c',
                    inputKey: 'file_size'
                },
                // 时间匹配
                {
                    flag: '-mtime',
                    description: '匹配最后修改文件内容时间（天）',
                    type: 'input',
                    group: 'time',
                    placeholder: '天数，如: +7, -1, 3',
                    inputKey: 'mtime_days'
                },
                {
                    flag: '-atime',
                    description: '匹配最后读取文件内容时间（天）',
                    type: 'input',
                    group: 'time',
                    placeholder: '天数，如: +7, -1, 3',
                    inputKey: 'atime_days'
                },
                {
                    flag: '-ctime',
                    description: '匹配最后修改文件属性时间（天）',
                    type: 'input',
                    group: 'time',
                    placeholder: '天数，如: +7, -1, 3',
                    inputKey: 'ctime_days'
                },
                // 权限和所有者
                {
                    flag: '-user',
                    description: '匹配文件所属主',
                    type: 'input',
                    group: 'ownership',
                    placeholder: '用户名，如: root',
                    inputKey: 'file_user'
                },
                {
                    flag: '-group',
                    description: '匹配文件所属组',
                    type: 'input',
                    group: 'ownership',
                    placeholder: '组名，如: users',
                    inputKey: 'file_group'
                },
                {
                    flag: '-perm',
                    description: '匹配文件权限',
                    type: 'input',
                    group: 'ownership',
                    placeholder: '权限，如: 755, u+x',
                    inputKey: 'file_perm'
                },
                // 高级选项
                {
                    flag: '-empty',
                    description: '匹配空文件或空目录',
                    type: 'boolean',
                    group: 'advanced'
                },
                {
                    flag: '-newer',
                    description: '匹配比指定文件更新的文件',
                    type: 'input',
                    group: 'advanced',
                    placeholder: '参考文件路径',
                    inputKey: 'newer_file'
                },
                {
                    flag: '-maxdepth',
                    description: '最大搜索深度',
                    type: 'number',
                    group: 'advanced',
                    placeholder: '目录层数，如: 2',
                    inputKey: 'max_depth'
                },
                {
                    flag: '-mindepth',
                    description: '最小搜索深度',
                    type: 'number',
                    group: 'advanced',
                    placeholder: '目录层数，如: 1',
                    inputKey: 'min_depth'
                },
                // 操作选项
                {
                    flag: '-print',
                    description: '打印匹配的文件路径（默认动作）',
                    type: 'boolean',
                    group: 'action'
                },
                {
                    flag: '-delete',
                    description: '删除匹配的文件',
                    type: 'boolean',
                    group: 'action'
                },
                {
                    flag: '-exec',
                    description: '对匹配文件执行指定命令',
                    type: 'input',
                    group: 'action',
                    placeholder: '命令，如: rm {} \\;',
                    inputKey: 'exec_command'
                },
                // 起始路径
                {
                    flag: '',
                    description: '搜索起始路径',
                    type: 'input',
                    group: 'path',
                    placeholder: '搜索路径，如: /home/user',
                    inputKey: 'search_path',
                    default: '.'
                }
            ],
            relatedCommands: ['locate', 'which', 'whereis'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'rm',
            name: 'rm',
            description: '删除文件或目录',
            category: 'file-operations',
            usage: 'rm [选项] 文件...',
            difficulty: 2,
            hot: true,
            icon: '🗑️',
            options: [
                {
                    flag: '-r',
                    description: '递归删除目录及其内全部子文件',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-f',
                    description: '强制删除文件而不询问',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-i',
                    description: '删除文件前询问用户是否确认',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-v',
                    description: '显示执行过程详细信息',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-d',
                    description: '仅删除无子文件的空目录',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '',
                    description: '要删除的文件或目录',
                    type: 'input',
                    group: 'target',
                    placeholder: '文件路径，如: file.txt 或 /path/to/dir',
                    inputKey: 'target_files',
                    required: true
                }
            ],
            relatedCommands: ['rmdir', 'mv', 'trash'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'tar',
            name: 'tar',
            description: '压缩和解压归档文件',
            category: 'archive-compression',
            usage: 'tar [选项] [文件...]',
            difficulty: 3,
            hot: true,
            icon: '📦',
            options: [
                // 主要操作模式
                {
                    flag: '-c',
                    description: '创建新的归档文件',
                    type: 'boolean',
                    group: 'operation'
                },
                {
                    flag: '-x',
                    description: '解压归档文件',
                    type: 'boolean',
                    group: 'operation'
                },
                {
                    flag: '-t',
                    description: '列出归档文件内容',
                    type: 'boolean',
                    group: 'operation'
                },
                {
                    flag: '-r',
                    description: '向归档文件追加文件',
                    type: 'boolean',
                    group: 'operation'
                },
                {
                    flag: '-u',
                    description: '仅追加比归档中文件更新的文件',
                    type: 'boolean',
                    group: 'operation'
                },
                // 压缩选项
                {
                    flag: '-z',
                    description: '通过gzip压缩归档',
                    type: 'boolean',
                    group: 'compression'
                },
                {
                    flag: '-j',
                    description: '通过bzip2压缩归档',
                    type: 'boolean',
                    group: 'compression'
                },
                {
                    flag: '-J',
                    description: '通过xz压缩归档',
                    type: 'boolean',
                    group: 'compression'
                },
                // 其他选项
                {
                    flag: '-v',
                    description: '显示处理过程',
                    type: 'boolean',
                    group: 'output'
                },
                {
                    flag: '-f',
                    description: '指定归档文件名',
                    type: 'input',
                    group: 'file',
                    placeholder: '归档文件名，如: archive.tar.gz',
                    inputKey: 'archive_file',
                    required: true
                },
                {
                    flag: '-C',
                    description: '切换到指定目录',
                    type: 'input',
                    group: 'options',
                    placeholder: '目标目录，如: /tmp',
                    inputKey: 'change_dir'
                },
                {
                    flag: '--exclude',
                    description: '排除文件模式',
                    type: 'input',
                    group: 'options',
                    placeholder: '排除模式，如: *.log',
                    inputKey: 'exclude_pattern'
                },
                {
                    flag: '',
                    description: '要处理的文件或目录',
                    type: 'input',
                    group: 'target',
                    placeholder: '文件路径，如: /home/user/docs',
                    inputKey: 'target_files'
                }
            ],
            relatedCommands: ['gzip', 'zip', 'unzip'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'zip',
            name: 'zip',
            description: '创建ZIP压缩文件',
            category: 'archive-compression',
            usage: 'zip [选项] 压缩文件 源文件...',
            difficulty: 2,
            hot: true,
            icon: '📦',
            options: [
                {
                    flag: '-r',
                    description: '递归压缩目录',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-q',
                    description: '静默模式，不显示压缩过程',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-v',
                    description: '显示压缩过程详细信息',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-d',
                    description: '从压缩文件中删除指定文件',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-u',
                    description: '仅压缩更新的文件',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-1',
                    description: '最快压缩（压缩比最低）',
                    type: 'boolean',
                    group: 'compression'
                },
                {
                    flag: '-9',
                    description: '最佳压缩（压缩比最高）',
                    type: 'boolean',
                    group: 'compression'
                },
                {
                    flag: '',
                    description: 'ZIP文件名',
                    type: 'input',
                    group: 'target',
                    placeholder: 'ZIP文件名，如: archive.zip',
                    inputKey: 'zip_file',
                    required: true
                },
                {
                    flag: '',
                    description: '要压缩的文件或目录',
                    type: 'input',
                    group: 'source',
                    placeholder: '源文件路径，如: /home/user/docs',
                    inputKey: 'source_files',
                    required: true
                }
            ],
            relatedCommands: ['unzip', 'tar', 'gzip'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'unzip',
            name: 'unzip',
            description: '解压ZIP文件',
            category: 'archive-compression',
            usage: 'unzip [选项] ZIP文件',
            difficulty: 1,
            hot: true,
            icon: '📦',
            options: [
                {
                    flag: '-d',
                    description: '指定解压目标目录',
                    type: 'input',
                    group: 'options',
                    placeholder: '目标目录，如: /tmp/extracted',
                    inputKey: 'extract_dir'
                },
                {
                    flag: '-l',
                    description: '列出压缩文件内容而不解压',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-o',
                    description: '覆盖已存在文件而不询问',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-n',
                    description: '不覆盖已存在文件',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-q',
                    description: '静默模式',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-v',
                    description: '显示详细解压过程',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '',
                    description: 'ZIP文件路径',
                    type: 'input',
                    group: 'target',
                    placeholder: 'ZIP文件路径，如: archive.zip',
                    inputKey: 'zip_file',
                    required: true
                }
            ],
            relatedCommands: ['zip', 'tar', 'gunzip'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'systemctl',
            name: 'systemctl',
            description: '控制systemd服务',
            category: 'process-management',
            usage: 'systemctl [选项] 命令 [服务名]',
            difficulty: 3,
            hot: true,
            icon: '⚙️',
            options: [
                // 服务控制命令
                {
                    flag: 'start',
                    description: '启动服务',
                    type: 'boolean',
                    group: 'control'
                },
                {
                    flag: 'stop',
                    description: '停止服务',
                    type: 'boolean',
                    group: 'control'
                },
                {
                    flag: 'restart',
                    description: '重启服务',
                    type: 'boolean',
                    group: 'control'
                },
                {
                    flag: 'reload',
                    description: '重新加载服务配置',
                    type: 'boolean',
                    group: 'control'
                },
                {
                    flag: 'enable',
                    description: '设置服务开机自启',
                    type: 'boolean',
                    group: 'control'
                },
                {
                    flag: 'disable',
                    description: '禁用服务开机自启',
                    type: 'boolean',
                    group: 'control'
                },
                // 状态查询命令
                {
                    flag: 'status',
                    description: '查看服务状态',
                    type: 'boolean',
                    group: 'query'
                },
                {
                    flag: 'is-active',
                    description: '检查服务是否运行',
                    type: 'boolean',
                    group: 'query'
                },
                {
                    flag: 'is-enabled',
                    description: '检查服务是否开机自启',
                    type: 'boolean',
                    group: 'query'
                },
                {
                    flag: 'list-units',
                    description: '列出所有单元',
                    type: 'boolean',
                    group: 'query'
                },
                // 其他选项
                {
                    flag: '--user',
                    description: '操作用户级服务',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '--system',
                    description: '操作系统级服务（默认）',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '--now',
                    description: '立即执行（与enable/disable配合使用）',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '',
                    description: '服务名称',
                    type: 'input',
                    group: 'target',
                    placeholder: '服务名，如: nginx.service',
                    inputKey: 'service_name'
                }
            ],
            relatedCommands: ['service', 'chkconfig', 'systemd'],
            scenarios: ['system_admin']
        },
        {
            id: 'service',
            name: 'service',
            description: '控制系统服务（传统方式）',
            category: 'process-management',
            usage: 'service 服务名 命令',
            difficulty: 2,
            hot: false,
            icon: '⚙️',
            options: [
                {
                    flag: 'start',
                    description: '启动服务',
                    type: 'boolean',
                    group: 'control'
                },
                {
                    flag: 'stop',
                    description: '停止服务',
                    type: 'boolean',
                    group: 'control'
                },
                {
                    flag: 'restart',
                    description: '重启服务',
                    type: 'boolean',
                    group: 'control'
                },
                {
                    flag: 'reload',
                    description: '重新加载配置',
                    type: 'boolean',
                    group: 'control'
                },
                {
                    flag: 'status',
                    description: '查看服务状态',
                    type: 'boolean',
                    group: 'control'
                },
                {
                    flag: '',
                    description: '服务名称',
                    type: 'input',
                    group: 'target',
                    placeholder: '服务名，如: nginx',
                    inputKey: 'service_name',
                    required: true
                }
            ],
            relatedCommands: ['systemctl', 'chkconfig'],
            scenarios: ['system_admin']
        },
        {
            id: 'ssh',
            name: 'ssh',
            description: '安全的远程连接服务',
            category: 'network-tools',
            usage: 'ssh [选项] [用户@]主机名',
            difficulty: 3,
            hot: true,
            icon: '🔐',
            options: [
                {
                    flag: '-p',
                    description: '指定SSH连接端口',
                    type: 'number',
                    group: 'connection',
                    placeholder: '端口号，如: 22',
                    inputKey: 'ssh_port'
                },
                {
                    flag: '-i',
                    description: '指定私钥文件',
                    type: 'input',
                    group: 'auth',
                    placeholder: '私钥路径，如: ~/.ssh/id_rsa',
                    inputKey: 'identity_file'
                },
                {
                    flag: '-l',
                    description: '指定登录用户名',
                    type: 'input',
                    group: 'auth',
                    placeholder: '用户名，如: root',
                    inputKey: 'login_user'
                },
                {
                    flag: '-v',
                    description: '详细模式，显示连接过程',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-X',
                    description: '启用X11转发',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-C',
                    description: '启用压缩',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-N',
                    description: '不执行远程命令',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '',
                    description: '目标主机（[用户@]主机名）',
                    type: 'input',
                    group: 'target',
                    placeholder: '如: user@192.168.1.100',
                    inputKey: 'target_host',
                    required: true
                }
            ],
            relatedCommands: ['scp', 'sftp', 'ssh-keygen'],
            scenarios: ['system_admin']
        },
        {
            id: 'scp',
            name: 'scp',
            description: '安全复制文件到远程主机',
            category: 'network-tools',
            usage: 'scp [选项] 源文件 目标位置',
            difficulty: 3,
            hot: true,
            icon: '📤',
            options: [
                {
                    flag: '-r',
                    description: '递归复制整个目录',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-p',
                    description: '保留文件的修改时间和权限',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-v',
                    description: '显示详细的传输过程',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-C',
                    description: '启用压缩',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-P',
                    description: '指定SSH端口',
                    type: 'number',
                    group: 'connection',
                    placeholder: '端口号，如: 22',
                    inputKey: 'ssh_port'
                },
                {
                    flag: '-i',
                    description: '指定私钥文件',
                    type: 'input',
                    group: 'auth',
                    placeholder: '私钥路径，如: ~/.ssh/id_rsa',
                    inputKey: 'identity_file'
                },
                {
                    flag: '',
                    description: '源文件路径',
                    type: 'input',
                    group: 'source',
                    placeholder: '如: /local/file.txt 或 user@host:/remote/file.txt',
                    inputKey: 'source_path',
                    required: true
                },
                {
                    flag: '',
                    description: '目标路径',
                    type: 'input',
                    group: 'target',
                    placeholder: '如: user@host:/remote/dir/ 或 /local/dir/',
                    inputKey: 'target_path',
                    required: true
                }
            ],
            relatedCommands: ['ssh', 'rsync', 'sftp'],
            scenarios: ['system_admin']
        },
        {
            id: 'cd',
            name: 'cd',
            description: '切换当前工作目录',
            category: 'file-operations',
            usage: 'cd [选项] [目录]',
            difficulty: 1,
            hot: true,
            icon: '📂',
            options: [
                {
                    type: 'input',
                    inputKey: 'target_directory',
                    placeholder: '目标目录路径（如：/home/user/documents 或 .. 或 ~ 或 -）',
                    description: '要切换到的目标目录',
                    required: false,
                    group: 'target'
                },
                {
                    flag: '-P',
                    description: '切换至符号链接对应的实际目录',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-L',
                    description: '切换至符号链接所在的目录',
                    type: 'boolean',
                    group: 'options'
                }
            ],
            relatedCommands: ['pwd', 'ls', 'dirs'],
            scenarios: ['web_project', 'system_admin']
        },
        // 基础文件操作命令 - 补充缺失命令
        {
            id: 'ln',
            name: 'ln',
            description: '为文件创建快捷方式',
            category: 'file-operations',
            usage: 'ln [选项] 源文件名 目标文件名',
            difficulty: 3,
            hot: true,
            icon: '🔗',
            options: [
                {
                    flag: '-s',
                    description: '对源文件创建软链接',
                    type: 'boolean',
                    group: 'type'
                },
                {
                    flag: '-f',
                    description: '强制创建链接而不询问',
                    type: 'boolean',
                    group: 'behavior'
                },
                {
                    flag: '-i',
                    description: '若目标文件已存在，则需要用户二次确认',
                    type: 'boolean',
                    group: 'behavior'
                },
                {
                    flag: '-v',
                    description: '显示执行过程详细信息',
                    type: 'boolean',
                    group: 'output'
                },
                {
                    flag: '-b',
                    description: '为已存在的目标文件创建备份',
                    type: 'boolean',
                    group: 'backup'
                },
                {
                    flag: '-d',
                    description: '允许管理员创建目录的硬链接',
                    type: 'boolean',
                    group: 'type'
                },
                {
                    flag: '-L',
                    description: '若目标文件为软链接，找到其对应文件',
                    type: 'boolean',
                    group: 'behavior'
                },
                {
                    flag: '-P',
                    description: '若目标文件为软链接，直接链接它自身',
                    type: 'boolean',
                    group: 'behavior'
                },
                {
                    flag: '-r',
                    description: '创建相对于文件位置的软链接',
                    type: 'boolean',
                    group: 'type'
                },
                {
                    flag: '--help',
                    description: '显示帮助信息',
                    type: 'boolean',
                    group: 'help'
                },
                {
                    flag: '',
                    description: '源文件路径',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入源文件路径，如: /home/user/file.txt',
                    inputKey: 'source_file',
                    required: true
                },
                {
                    flag: '',
                    description: '目标链接路径',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入目标链接路径，如: /home/user/link_file',
                    inputKey: 'target_link',
                    required: true
                }
            ],
            relatedCommands: ['ls', 'rm', 'readlink'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'less',
            name: 'less',
            description: '分页显示文件内容',
            category: 'text-processing',
            usage: 'less [选项] [文件...]',
            difficulty: 2,
            hot: true,
            icon: '📖',
            options: [
                {
                    flag: '-N',
                    description: '显示行号',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-S',
                    description: '水平滚动长行而不换行',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-i',
                    description: '搜索时忽略大小写',
                    type: 'boolean',
                    group: 'search'
                },
                {
                    flag: '-I',
                    description: '搜索时始终忽略大小写',
                    type: 'boolean',
                    group: 'search'
                },
                {
                    flag: '-x',
                    description: '设置制表符宽度',
                    type: 'input',
                    group: 'format',
                    placeholder: '输入制表符宽度，如: 4',
                    inputKey: 'tab_width'
                },
                {
                    flag: '-F',
                    description: '如果文件内容少于一屏则自动退出',
                    type: 'boolean',
                    group: 'behavior'
                },
                {
                    flag: '+G',
                    description: '从文件末尾开始显示',
                    type: 'boolean',
                    group: 'navigation'
                },
                {
                    flag: '',
                    description: '要显示的文件',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入文件路径，如: /var/log/messages',
                    inputKey: 'file_path',
                    required: true
                }
            ],
            relatedCommands: ['cat', 'more', 'head', 'tail'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'more',
            name: 'more',
            description: '分页显示文件内容（传统方式）',
            category: 'text-processing',
            usage: 'more [选项] [文件...]',
            difficulty: 2,
            hot: false,
            icon: '📄',
            options: [
                {
                    flag: '-d',
                    description: '显示用户友好的提示信息',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-f',
                    description: '计算行数时不折叠长行',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-l',
                    description: '忽略分页符',
                    type: 'boolean',
                    group: 'behavior'
                },
                {
                    flag: '-p',
                    description: '清屏后显示',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-c',
                    description: '从顶部清屏',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-u',
                    description: '不显示下划线',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '',
                    description: '要显示的文件',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入文件路径，如: /etc/passwd',
                    inputKey: 'file_path',
                    required: true
                }
            ],
            relatedCommands: ['less', 'cat', 'head', 'tail'],
            scenarios: ['web_project', 'system_admin']
        },
        // 文本三剑客高级命令
        {
            id: 'awk',
            name: 'awk',
            description: '对文本和数据进行处理的编程语言',
            category: 'text-processing',
            usage: 'awk [选项] \'程序\' [文件...]',
            difficulty: 5,
            hot: true,
            icon: '⚡',
            options: [
                {
                    flag: '-F',
                    description: '设置输入时的字段分隔符',
                    type: 'input',
                    group: 'separator',
                    placeholder: '输入分隔符，如: :',
                    inputKey: 'field_separator'
                },
                {
                    flag: '-v',
                    description: '定义一个变量并赋值',
                    type: 'input',
                    group: 'variables',
                    placeholder: '输入变量赋值，如: var=value',
                    inputKey: 'variable'
                },
                {
                    flag: '-f',
                    description: '从脚本中读取awk命令',
                    type: 'input',
                    group: 'script',
                    placeholder: '输入脚本文件路径',
                    inputKey: 'script_file'
                },
                {
                    flag: '-c',
                    description: '使用兼容模式',
                    type: 'boolean',
                    group: 'mode'
                },
                {
                    flag: '-C',
                    description: '显示版权信息',
                    type: 'boolean',
                    group: 'info'
                },
                {
                    flag: '-V',
                    description: '显示版本信息',
                    type: 'boolean',
                    group: 'info'
                },
                {
                    flag: '',
                    description: 'AWK程序（用单引号括起）',
                    type: 'input',
                    group: 'program',
                    placeholder: '输入AWK程序，如: \'{print $1,$2}\'',
                    inputKey: 'awk_program',
                    required: true
                },
                {
                    flag: '',
                    description: '要处理的文件',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入文件路径，如: /etc/passwd',
                    inputKey: 'input_file'
                }
            ],
            relatedCommands: ['sed', 'grep', 'cut'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'sed',
            name: 'sed',
            description: '流编辑器，用于过滤和转换文本',
            category: 'text-processing',
            usage: 'sed [选项] \'脚本\' [文件...]',
            difficulty: 4,
            hot: true,
            icon: '✂️',
            options: [
                {
                    flag: '-n',
                    description: '仅显示脚本处理后的结果',
                    type: 'boolean',
                    group: 'output'
                },
                {
                    flag: '-e',
                    description: '执行指定的脚本命令',
                    type: 'input',
                    group: 'script',
                    placeholder: '输入sed脚本，如: s/old/new/g',
                    inputKey: 'sed_script'
                },
                {
                    flag: '-f',
                    description: '执行脚本文件中的命令',
                    type: 'input',
                    group: 'script',
                    placeholder: '输入脚本文件路径',
                    inputKey: 'script_file'
                },
                {
                    flag: '-i',
                    description: '直接修改文件内容',
                    type: 'boolean',
                    group: 'edit'
                },
                {
                    flag: '-r',
                    description: '使用扩展正则表达式',
                    type: 'boolean',
                    group: 'regex'
                },
                {
                    flag: '-u',
                    description: '从输入文件读取最少的数据',
                    type: 'boolean',
                    group: 'performance'
                },
                {
                    flag: '--version',
                    description: '显示版本信息',
                    type: 'boolean',
                    group: 'info'
                },
                {
                    flag: '',
                    description: 'sed脚本命令',
                    type: 'input',
                    group: 'script',
                    placeholder: '输入sed命令，如: s/pattern/replacement/g',
                    inputKey: 'sed_command',
                    required: true
                },
                {
                    flag: '',
                    description: '要处理的文件',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入文件路径，如: /etc/hosts',
                    inputKey: 'input_file'
                }
            ],
            relatedCommands: ['awk', 'grep', 'tr'],
            scenarios: ['web_project', 'system_admin']
        },
        // 添加更多标准Linux命令
        {
            id: 'pwd',
            name: 'pwd',
            description: '显示当前工作目录的路径',
            category: 'file-operations',
            usage: 'pwd [选项]',
            difficulty: 1,
            hot: true,
            icon: '📍',
            options: [
                {
                    flag: '-L',
                    description: '显示逻辑路径（默认）',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-P',
                    description: '显示物理路径，解析所有符号链接',
                    type: 'boolean',
                    group: 'options'
                }
            ],
            relatedCommands: ['cd', 'ls', 'realpath'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'mkdir',
            name: 'mkdir',
            description: '创建目录文件',
            category: 'file-operations',
            usage: 'mkdir [选项] 目录名...',
            difficulty: 2,
            hot: true,
            icon: '📁',
            options: [
                {
                    flag: '-p',
                    description: '递归创建目录，如果父目录不存在则一并创建',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-m',
                    description: '设置目录权限模式',
                    type: 'input',
                    group: 'options',
                    placeholder: '权限模式，如: 755',
                    inputKey: 'permission_mode'
                },
                {
                    flag: '-v',
                    description: '显示创建目录的详细信息',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '',
                    description: '要创建的目录名',
                    type: 'input',
                    group: 'target',
                    placeholder: '目录名，如: newdir',
                    inputKey: 'directory_name',
                    required: true
                }
            ],
            relatedCommands: ['rmdir', 'cd', 'ls'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'cp',
            name: 'cp',
            description: '复制文件或目录',
            category: 'file-operations',
            usage: 'cp [选项] 源文件 目标文件',
            difficulty: 2,
            hot: true,
            icon: '📋',
            options: [
                {
                    flag: '-r',
                    description: '递归复制目录',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-i',
                    description: '覆盖前提示确认',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-f',
                    description: '强制覆盖已存在的目标文件',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-p',
                    description: '保持文件属性（权限、时间戳等）',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-v',
                    description: '显示复制过程的详细信息',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-u',
                    description: '只有当源文件比目标文件新时才复制',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '',
                    description: '源文件或目录',
                    type: 'input',
                    group: 'source',
                    placeholder: '源文件路径，如: file.txt',
                    inputKey: 'source_path',
                    required: true
                },
                {
                    flag: '',
                    description: '目标文件或目录',
                    type: 'input',
                    group: 'target',
                    placeholder: '目标路径，如: /backup/file.txt',
                    inputKey: 'target_path',
                    required: true
                }
            ],
            relatedCommands: ['mv', 'rsync', 'dd'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'mv',
            name: 'mv',
            description: '移动或重命名文件',
            category: 'file-operations',
            usage: 'mv [选项] 源文件 目标文件',
            difficulty: 2,
            hot: true,
            icon: '🔄',
            options: [
                {
                    flag: '-i',
                    description: '覆盖前提示确认',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-f',
                    description: '强制覆盖已存在的目标文件',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-v',
                    description: '显示移动过程的详细信息',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-u',
                    description: '只有当源文件比目标文件新时才移动',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-n',
                    description: '不覆盖已存在的文件',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '',
                    description: '源文件或目录',
                    type: 'input',
                    group: 'source',
                    placeholder: '源文件路径，如: oldname.txt',
                    inputKey: 'source_path',
                    required: true
                },
                {
                    flag: '',
                    description: '目标文件或目录',
                    type: 'input',
                    group: 'target',
                    placeholder: '目标路径，如: newname.txt',
                    inputKey: 'target_path',
                    required: true
                }
            ],
            relatedCommands: ['cp', 'rename', 'ln'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'chmod',
            name: 'chmod',
            description: '改变文件或目录权限',
            category: 'permissions',
            usage: 'chmod [选项] 权限 文件...',
            difficulty: 3,
            hot: false,
            icon: '🔐',
            options: [
                {
                    flag: '-R',
                    description: '递归更改权限，包括子目录及其文件',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-v',
                    description: '显示详细更改过程',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-c',
                    description: '只显示实际更改的文件',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '-f',
                    description: '忽略大部分错误信息',
                    type: 'boolean',
                    group: 'options'
                },
                {
                    flag: '',
                    description: '权限模式（如：755, u+x, go-w）',
                    type: 'input',
                    group: 'permissions',
                    placeholder: '755 或 u+rwx,g+r,o+r',
                    inputKey: 'permission_mode',
                    required: true
                },
                {
                    flag: '',
                    description: '目标文件或目录',
                    type: 'input',
                    group: 'target',
                    placeholder: 'script.sh 或 /path/to/file',
                    inputKey: 'target_files',
                    required: true
                }
            ],
            relatedCommands: ['chown', 'chgrp', 'umask', 'ls'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'ps',
            name: 'ps',
            description: '显示进程状态',
            category: 'process-management',
            usage: 'ps [选项]',
            difficulty: 3,
            hot: true,
            icon: '⚡',
            options: [
                {
                    flag: 'aux',
                    description: '显示所有用户的所有进程',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-ef',
                    description: '显示所有进程的完整信息',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-u',
                    description: '显示指定用户的进程',
                    type: 'input',
                    group: 'filter',
                    placeholder: 'username',
                    inputKey: 'username'
                },
                {
                    flag: '-p',
                    description: '显示指定PID的进程',
                    type: 'input',
                    group: 'filter',
                    placeholder: '1234',
                    inputKey: 'process_id'
                }
            ],
            relatedCommands: ['top', 'htop', 'pgrep', 'kill'],
            scenarios: ['system_admin']
        },
        {
            id: 'top',
            name: 'top',
            description: '实时显示进程信息',
            category: 'process-management',
            usage: 'top [选项]',
            difficulty: 3,
            hot: true,
            icon: '📊',
            options: [
                {
                    flag: '-d',
                    description: '设置刷新间隔（秒）',
                    type: 'number',
                    group: 'display',
                    inputKey: 'refresh_interval',
                    placeholder: '刷新间隔秒数，如: 3'
                },
                {
                    flag: '-p',
                    description: '只显示指定PID的进程',
                    type: 'input',
                    group: 'filter',
                    placeholder: '1234,5678',
                    inputKey: 'process_ids'
                },
                {
                    flag: '-u',
                    description: '只显示指定用户的进程',
                    type: 'input',
                    group: 'filter',
                    placeholder: 'username',
                    inputKey: 'username'
                },
                {
                    flag: '-n',
                    description: '运行指定次数后退出',
                    type: 'number',
                    group: 'behavior',
                    inputKey: 'iterations',
                    placeholder: '运行次数，如: 10'
                }
            ],
            relatedCommands: ['htop', 'ps', 'iotop', 'atop'],
            scenarios: ['system_admin']
        },
        {
            id: 'ping',
            name: 'ping',
            description: '测试主机间网络连通性',
            category: 'network-tools',
            usage: 'ping [选项] 目标主机',
            difficulty: 2,
            hot: true,
            icon: '🌐',
            options: [
                {
                    flag: '-c',
                    description: '发送指定数量的数据包',
                    type: 'number',
                    group: 'behavior',
                    inputKey: 'packet_count',
                    placeholder: '数据包数量，如: 4'
                },
                {
                    flag: '-i',
                    description: '设置发送间隔（秒）',
                    type: 'number',
                    group: 'timing',
                    inputKey: 'interval',
                    placeholder: '间隔秒数，如: 1'
                },
                {
                    flag: '-s',
                    description: '设置数据包大小（字节）',
                    type: 'number',
                    group: 'packet',
                    inputKey: 'packet_size',
                    placeholder: '数据包大小，如: 56'
                },
                {
                    flag: '-W',
                    description: '设置超时时间（秒）',
                    type: 'number',
                    group: 'timing',
                    inputKey: 'timeout',
                    placeholder: '超时秒数，如: 3'
                },
                {
                    flag: '-q',
                    description: '安静模式，只显示统计信息',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-v',
                    description: '详细输出',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '',
                    description: '目标主机（IP地址或域名）',
                    type: 'input',
                    group: 'target',
                    placeholder: 'google.com',
                    inputKey: 'target_host',
                    required: true
                }
            ],
            relatedCommands: ['traceroute', 'mtr', 'nslookup'],
            scenarios: ['system_admin']
        },
        {
            id: 'wget',
            name: 'wget',
            description: '下载网络文件',
            category: 'network-tools',
            usage: 'wget [选项] [URL...]',
            difficulty: 3,
            hot: true,
            icon: '⬇️',
            options: [
                {
                    flag: '-O',
                    description: '指定输出文件名',
                    type: 'input',
                    group: 'output',
                    placeholder: 'filename.html',
                    inputKey: 'output_filename'
                },
                {
                    flag: '-c',
                    description: '续传下载',
                    type: 'boolean',
                    group: 'behavior'
                },
                {
                    flag: '-t',
                    description: '设置重试次数',
                    type: 'number',
                    group: 'behavior',
                    inputKey: 'retry_times',
                    placeholder: '重试次数，如: 20'
                },
                {
                    flag: '-T',
                    description: '设置超时时间（秒）',
                    type: 'number',
                    group: 'timing',
                    inputKey: 'timeout',
                    placeholder: '超时秒数，如: 900'
                },
                {
                    flag: '-q',
                    description: '安静模式',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '',
                    description: '要下载的URL',
                    type: 'input',
                    group: 'target',
                    placeholder: 'https://example.com/file.zip',
                    inputKey: 'download_url',
                    required: true
                }
            ],
            relatedCommands: ['curl', 'aria2c', 'axel'],
            scenarios: ['system_admin']
        },
        {
            id: 'curl',
            name: 'curl',
            description: '文件传输工具',
            category: 'network-tools',
            usage: 'curl [选项] [URL...]',
            difficulty: 4,
            hot: true,
            icon: '🔄',
            options: [
                {
                    flag: '-o',
                    description: '将输出写入文件',
                    type: 'input',
                    group: 'output',
                    placeholder: 'output.html',
                    inputKey: 'output_file'
                },
                {
                    flag: '-O',
                    description: '使用远程文件名保存',
                    type: 'boolean',
                    group: 'output'
                },
                {
                    flag: '-L',
                    description: '跟随重定向',
                    type: 'boolean',
                    group: 'behavior'
                },
                {
                    flag: '-I',
                    description: '只获取HTTP头信息',
                    type: 'boolean',
                    group: 'behavior'
                },
                {
                    flag: '-X',
                    description: 'HTTP请求方法',
                    type: 'select',
                    group: 'http',
                    options: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
                    inputKey: 'http_method'
                },
                {
                    flag: '-d',
                    description: 'POST数据',
                    type: 'input',
                    group: 'http',
                    placeholder: '{"key":"value"}',
                    inputKey: 'post_data'
                },
                {
                    flag: '',
                    description: '目标URL',
                    type: 'input',
                    group: 'target',
                    placeholder: 'https://api.example.com/users',
                    inputKey: 'target_url',
                    required: true
                }
            ],
            relatedCommands: ['wget', 'httpie', 'aria2c'],
            scenarios: ['system_admin']
        },
        {
            id: 'touch',
            name: 'touch',
            description: '创建空文件或更新文件时间戳',
            category: 'file-operations',
            usage: 'touch [选项] 文件...',
            difficulty: 1,
            hot: true,
            icon: '👆',
            options: [
                {
                    flag: '-a',
                    description: '仅更改访问时间',
                    type: 'boolean',
                    group: 'time'
                },
                {
                    flag: '-m',
                    description: '仅更改修改时间',
                    type: 'boolean',
                    group: 'time'
                },
                {
                    flag: '-c',
                    description: '不创建任何文件',
                    type: 'boolean',
                    group: 'behavior'
                },
                {
                    flag: '-t',
                    description: '使用指定时间而非当前时间',
                    type: 'input',
                    group: 'time',
                    placeholder: '时间格式：[[CC]YY]MMDDhhmm[.ss]',
                    inputKey: 'timestamp'
                },
                {
                    flag: '',
                    description: '要创建或更新的文件名',
                    type: 'input',
                    group: 'target',
                    placeholder: '文件名，如: newfile.txt',
                    inputKey: 'file_names',
                    required: true
                }
            ],
            relatedCommands: ['ls', 'stat', 'date'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'head',
            name: 'head',
            description: '显示文件开头部分',
            category: 'text-processing',
            usage: 'head [选项] [文件...]',
            difficulty: 2,
            hot: true,
            icon: '⬆️',
            options: [
                {
                    flag: '-n',
                    description: '显示指定行数',
                    type: 'number',
                    group: 'format',
                    placeholder: '行数，如：20',
                    inputKey: 'line_count'
                },
                {
                    flag: '-c',
                    description: '显示指定字节数',
                    type: 'number',
                    group: 'format',
                    placeholder: '字节数，如：1024',
                    inputKey: 'byte_count'
                },
                {
                    flag: '-v',
                    description: '显示文件名标题',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-q',
                    description: '不显示文件名标题',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '',
                    description: '要查看的文件路径',
                    type: 'input',
                    group: 'target',
                    placeholder: '文件路径，如：access.log',
                    inputKey: 'file_path'
                }
            ],
            relatedCommands: ['tail', 'cat', 'less', 'more'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'tail',
            name: 'tail',
            description: '查看文件尾部内容',
            category: 'text-processing',
            usage: 'tail [选项] [文件...]',
            difficulty: 2,
            hot: true,
            icon: '⬇️',
            options: [
                {
                    flag: '-n',
                    description: '显示指定行数',
                    type: 'number',
                    group: 'format',
                    placeholder: '行数，如：10',
                    inputKey: 'line_count'
                },
                {
                    flag: '-c',
                    description: '显示指定字节数',
                    type: 'number',
                    group: 'format',
                    placeholder: '字节数，如：1024',
                    inputKey: 'byte_count'
                },
                {
                    flag: '-f',
                    description: '实时跟踪文件变化',
                    type: 'boolean',
                    group: 'behavior'
                },
                {
                    flag: '-F',
                    description: '跟踪文件名，重创建时重新打开',
                    type: 'boolean',
                    group: 'behavior'
                },
                {
                    flag: '-v',
                    description: '显示文件名标题',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '',
                    description: '要查看的文件路径',
                    type: 'input',
                    group: 'target',
                    placeholder: '文件路径，如：access.log',
                    inputKey: 'file_path'
                }
            ],
            relatedCommands: ['head', 'cat', 'less', 'more'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'du',
            name: 'du',
            description: '显示磁盘空间使用量情况',
            category: 'system-info',
            usage: 'du [选项] [文件...]',
            difficulty: 2,
            hot: true,
            icon: '💾',
            options: [
                {
                    flag: '-h',
                    description: '以人类可读格式显示（K、M、G）',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '-s',
                    description: '只显示总计',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-a',
                    description: '显示所有文件，不仅仅是目录',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-c',
                    description: '显示总计',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '--max-depth',
                    description: '限制显示目录深度',
                    type: 'number',
                    group: 'options',
                    placeholder: '深度级数，如：2',
                    inputKey: 'max_depth'
                },
                {
                    flag: '',
                    description: '要检查的目录或文件路径',
                    type: 'input',
                    group: 'target',
                    placeholder: '目录路径，如：. 或 /home/user',
                    inputKey: 'target_path'
                }
            ],
            relatedCommands: ['df', 'ls', 'ncdu'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'df',
            name: 'df',
            description: '显示磁盘空间使用量情况',
            category: 'system-info',
            usage: 'df [选项] [文件...]',
            difficulty: 2,
            hot: true,
            icon: '📊',
            options: [
                {
                    flag: '-h',
                    description: '以人类可读格式显示（K、M、G）',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '-T',
                    description: '显示文件系统类型',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-i',
                    description: '显示inode信息而非块使用情况',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-a',
                    description: '包括虚拟文件系统',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '',
                    description: '指定要查看的文件系统',
                    type: 'input',
                    group: 'target',
                    placeholder: '文件系统或挂载点，如：/ 或 /home',
                    inputKey: 'filesystem'
                }
            ],
            relatedCommands: ['du', 'lsblk', 'mount'],
            scenarios: ['system_admin']
        },
        {
            id: 'whoami',
            name: 'whoami',
            description: '显示当前用户名',
            category: 'system-info',
            usage: 'whoami',
            difficulty: 1,
            hot: true,
            icon: '👤',
            options: [],
            relatedCommands: ['id', 'who', 'w'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'date',
            name: 'date',
            description: '输出字符串或提取后的变量值',
            category: 'system-info',
            usage: 'date [选项] [+格式]',
            difficulty: 2,
            hot: true,
            icon: '📅',
            options: [
                {
                    flag: '-d',
                    description: '显示指定日期',
                    type: 'input',
                    group: 'input',
                    placeholder: '日期字符串，如：tomorrow 或 "2024-01-15"',
                    inputKey: 'date_string'
                },
                {
                    flag: '-u',
                    description: '显示UTC时间',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '-R',
                    description: '以RFC 2822格式输出',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '-I',
                    description: '以ISO 8601格式输出',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '',
                    description: '自定义日期格式字符串',
                    type: 'input',
                    group: 'format',
                    placeholder: '自定义格式（如：+"%Y-%m-%d %H:%M:%S"）',
                    inputKey: 'format_string'
                }
            ],
            relatedCommands: ['cal', 'uptime', 'timedatectl'],
            scenarios: ['web_project', 'system_admin']
        },
        // 系统监控和网络工具
        {
            id: 'netstat',
            name: 'netstat',
            description: '显示网络状态',
            category: 'network-tools',
            usage: 'netstat [选项]',
            difficulty: 3,
            hot: true,
            icon: '🌐',
            options: [
                {
                    flag: '-a',
                    description: '显示所有网络连接和监听端口',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-t',
                    description: '显示TCP连接',
                    type: 'boolean',
                    group: 'protocol'
                },
                {
                    flag: '-u',
                    description: '显示UDP连接',
                    type: 'boolean',
                    group: 'protocol'
                },
                {
                    flag: '-l',
                    description: '只显示监听状态的端口',
                    type: 'boolean',
                    group: 'status'
                },
                {
                    flag: '-n',
                    description: '直接使用IP地址，而不通过域名服务器',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '-p',
                    description: '显示建立相关链接的程序名',
                    type: 'boolean',
                    group: 'info'
                },
                {
                    flag: '-r',
                    description: '显示路由表信息',
                    type: 'boolean',
                    group: 'routing'
                },
                {
                    flag: '-i',
                    description: '显示网络接口列表',
                    type: 'boolean',
                    group: 'interface'
                },
                {
                    flag: '-s',
                    description: '显示各协议的统计信息',
                    type: 'boolean',
                    group: 'statistics'
                }
            ],
            relatedCommands: ['ss', 'lsof', 'nmap'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'mount',
            name: 'mount',
            description: '将文件系统挂载到目录',
            category: 'disk-management',
            usage: 'mount [选项] [设备] [挂载点]',
            difficulty: 4,
            hot: true,
            icon: '💾',
            options: [
                {
                    flag: '-t',
                    description: '指定文件系统类型',
                    type: 'select',
                    group: 'filesystem',
                    options: ['ext4', 'ext3', 'xfs', 'ntfs', 'vfat', 'iso9660', 'tmpfs'],
                    inputKey: 'filesystem_type'
                },
                {
                    flag: '-o',
                    description: '指定挂载选项',
                    type: 'input',
                    group: 'options',
                    placeholder: '输入挂载选项，如: rw,exec,suid',
                    inputKey: 'mount_options'
                },
                {
                    flag: '-r',
                    description: '以只读方式挂载',
                    type: 'boolean',
                    group: 'access'
                },
                {
                    flag: '-w',
                    description: '以读写方式挂载（默认）',
                    type: 'boolean',
                    group: 'access'
                },
                {
                    flag: '-a',
                    description: '挂载fstab文件中的所有文件系统',
                    type: 'boolean',
                    group: 'batch'
                },
                {
                    flag: '-n',
                    description: '不写入/etc/mtab文件',
                    type: 'boolean',
                    group: 'record'
                },
                {
                    flag: '-v',
                    description: '显示详细的挂载过程',
                    type: 'boolean',
                    group: 'verbose'
                },
                {
                    flag: '',
                    description: '设备路径',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入设备路径，如: /dev/sdb1',
                    inputKey: 'device_path'
                },
                {
                    flag: '',
                    description: '挂载点路径',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入挂载点，如: /mnt/usb',
                    inputKey: 'mount_point'
                }
            ],
            relatedCommands: ['umount', 'df', 'lsblk'],
            scenarios: ['system_admin']
        },
        {
            id: 'umount',
            name: 'umount',
            description: '卸载文件系统',
            category: 'disk-management',
            usage: 'umount [选项] [设备|挂载点]',
            difficulty: 3,
            hot: false,
            icon: '📤',
            options: [
                {
                    flag: '-f',
                    description: '强制卸载（危险操作）',
                    type: 'boolean',
                    group: 'force'
                },
                {
                    flag: '-l',
                    description: '懒惰卸载，立即断开文件系统',
                    type: 'boolean',
                    group: 'lazy'
                },
                {
                    flag: '-r',
                    description: '如果卸载失败，尝试重新挂载为只读',
                    type: 'boolean',
                    group: 'readonly'
                },
                {
                    flag: '-v',
                    description: '显示详细信息',
                    type: 'boolean',
                    group: 'verbose'
                },
                {
                    flag: '-a',
                    description: '卸载所有挂载的文件系统',
                    type: 'boolean',
                    group: 'all'
                },
                {
                    flag: '-t',
                    description: '只卸载指定类型的文件系统',
                    type: 'input',
                    group: 'type',
                    placeholder: '输入文件系统类型，如: ext4',
                    inputKey: 'filesystem_type'
                },
                {
                    flag: '',
                    description: '要卸载的设备或挂载点',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入设备路径或挂载点，如: /dev/sdb1 或 /mnt/usb',
                    inputKey: 'target_path',
                    required: true
                }
            ],
            relatedCommands: ['mount', 'df', 'lsof'],
            scenarios: ['system_admin']
        },
        // 用户管理命令
        {
            id: 'useradd',
            name: 'useradd',
            description: '添加新的用户账号',
            category: 'user-management',
            usage: 'useradd [选项] 用户名',
            difficulty: 4,
            hot: false,
            icon: '👤',
            options: [
                {
                    flag: '-m',
                    description: '创建用户主目录',
                    type: 'boolean',
                    group: 'directory'
                },
                {
                    flag: '-d',
                    description: '指定用户主目录',
                    type: 'input',
                    group: 'directory',
                    placeholder: '输入主目录路径，如: /home/newuser',
                    inputKey: 'home_directory'
                },
                {
                    flag: '-s',
                    description: '指定用户登录shell',
                    type: 'select',
                    group: 'shell',
                    options: ['/bin/bash', '/bin/sh', '/bin/zsh', '/sbin/nologin'],
                    inputKey: 'login_shell'
                },
                {
                    flag: '-g',
                    description: '指定用户所属的群组',
                    type: 'input',
                    group: 'group',
                    placeholder: '输入群组名，如: users',
                    inputKey: 'primary_group'
                },
                {
                    flag: '-G',
                    description: '指定用户所属的附加群组',
                    type: 'input',
                    group: 'group',
                    placeholder: '输入附加群组，如: wheel,sudo',
                    inputKey: 'additional_groups'
                },
                {
                    flag: '-u',
                    description: '指定用户ID',
                    type: 'number',
                    group: 'id',
                    placeholder: '输入用户ID，如: 1001',
                    inputKey: 'user_id'
                },
                {
                    flag: '-c',
                    description: '用户描述信息',
                    type: 'input',
                    group: 'info',
                    placeholder: '输入用户描述，如: Full Name',
                    inputKey: 'comment'
                },
                {
                    flag: '-e',
                    description: '账号失效日期',
                    type: 'input',
                    group: 'expiry',
                    placeholder: '输入日期，如: 2024-12-31',
                    inputKey: 'expire_date'
                },
                {
                    flag: '-r',
                    description: '创建系统账号',
                    type: 'boolean',
                    group: 'type'
                },
                {
                    flag: '',
                    description: '新用户名',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入用户名，如: newuser',
                    inputKey: 'username',
                    required: true
                }
            ],
            relatedCommands: ['userdel', 'usermod', 'passwd'],
            scenarios: ['system_admin']
        },
        {
            id: 'userdel',
            name: 'userdel',
            description: '删除用户账号',
            category: 'user-management',
            usage: 'userdel [选项] 用户名',
            difficulty: 3,
            hot: false,
            icon: '🗑️',
            options: [
                {
                    flag: '-r',
                    description: '删除用户主目录和邮件目录',
                    type: 'boolean',
                    group: 'remove'
                },
                {
                    flag: '-f',
                    description: '强制删除用户（即使用户正在登录）',
                    type: 'boolean',
                    group: 'force'
                },
                {
                    flag: '-Z',
                    description: '删除SELinux用户映射',
                    type: 'boolean',
                    group: 'selinux'
                },
                {
                    flag: '',
                    description: '要删除的用户名',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入用户名，如: olduser',
                    inputKey: 'username',
                    required: true
                }
            ],
            relatedCommands: ['useradd', 'usermod', 'passwd'],
            scenarios: ['system_admin']
        },
        // 进程管理命令补充
        {
            id: 'kill',
            name: 'kill',
            description: '终止指定的进程',
            category: 'process-management',
            usage: 'kill [选项] [信号] 进程ID',
            difficulty: 3,
            hot: true,
            icon: '💀',
            options: [
                {
                    flag: '-9',
                    description: '强制杀死进程（SIGKILL）',
                    type: 'boolean',
                    group: 'signal'
                },
                {
                    flag: '-15',
                    description: '正常终止进程（SIGTERM，默认）',
                    type: 'boolean',
                    group: 'signal'
                },
                {
                    flag: '-1',
                    description: '重新加载进程（SIGHUP）',
                    type: 'boolean',
                    group: 'signal'
                },
                {
                    flag: '-2',
                    description: '中断进程（SIGINT）',
                    type: 'boolean',
                    group: 'signal'
                },
                {
                    flag: '-s',
                    description: '指定要发送的信号',
                    type: 'select',
                    group: 'signal',
                    options: ['TERM', 'KILL', 'HUP', 'INT', 'QUIT', 'USR1', 'USR2'],
                    inputKey: 'signal_name'
                },
                {
                    flag: '-l',
                    description: '列出所有可用的信号名称',
                    type: 'boolean',
                    group: 'list'
                },
                {
                    flag: '',
                    description: '进程ID（PID）',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入进程ID，如: 1234',
                    inputKey: 'process_id',
                    required: true
                }
            ],
            relatedCommands: ['killall', 'pkill', 'ps'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'killall',
            name: 'killall',
            description: '通过进程名终止进程',
            category: 'process-management',
            usage: 'killall [选项] 进程名',
            difficulty: 3,
            hot: false,
            icon: '💥',
            options: [
                {
                    flag: '-9',
                    description: '强制杀死进程',
                    type: 'boolean',
                    group: 'signal'
                },
                {
                    flag: '-i',
                    description: '交互式确认',
                    type: 'boolean',
                    group: 'interactive'
                },
                {
                    flag: '-l',
                    description: '列出所有信号名称',
                    type: 'boolean',
                    group: 'list'
                },
                {
                    flag: '-q',
                    description: '静默模式',
                    type: 'boolean',
                    group: 'quiet'
                },
                {
                    flag: '-v',
                    description: '详细模式',
                    type: 'boolean',
                    group: 'verbose'
                },
                {
                    flag: '-w',
                    description: '等待进程结束',
                    type: 'boolean',
                    group: 'wait'
                },
                {
                    flag: '',
                    description: '进程名称',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入进程名，如: firefox',
                    inputKey: 'process_name',
                    required: true
                }
            ],
            relatedCommands: ['kill', 'pkill', 'pgrep'],
            scenarios: ['web_project', 'system_admin']
        },
        // 用户管理命令补充
        {
            id: 'usermod',
            name: 'usermod',
            description: '修改用户账号',
            category: 'user-management',
            usage: 'usermod [选项] 用户名',
            difficulty: 4,
            hot: false,
            icon: '✏️',
            options: [
                {
                    flag: '-l',
                    description: '修改用户名',
                    type: 'input',
                    group: 'identity',
                    placeholder: '输入新用户名',
                    inputKey: 'new_username'
                },
                {
                    flag: '-u',
                    description: '修改用户ID',
                    type: 'number',
                    group: 'identity',
                    placeholder: '输入新用户ID',
                    inputKey: 'new_uid'
                },
                {
                    flag: '-g',
                    description: '修改用户所属主群组',
                    type: 'input',
                    group: 'group',
                    placeholder: '输入群组名',
                    inputKey: 'primary_group'
                },
                {
                    flag: '-G',
                    description: '修改用户所属附加群组',
                    type: 'input',
                    group: 'group',
                    placeholder: '输入附加群组，用逗号分隔',
                    inputKey: 'additional_groups'
                },
                {
                    flag: '-a',
                    description: '与-G一起使用，表示追加到附加群组',
                    type: 'boolean',
                    group: 'group'
                },
                {
                    flag: '-d',
                    description: '修改用户主目录',
                    type: 'input',
                    group: 'directory',
                    placeholder: '输入新主目录路径',
                    inputKey: 'home_directory'
                },
                {
                    flag: '-m',
                    description: '移动用户主目录内容到新位置',
                    type: 'boolean',
                    group: 'directory'
                },
                {
                    flag: '-s',
                    description: '修改用户登录shell',
                    type: 'select',
                    group: 'shell',
                    options: ['/bin/bash', '/bin/sh', '/bin/zsh', '/sbin/nologin'],
                    inputKey: 'login_shell'
                },
                {
                    flag: '-c',
                    description: '修改用户描述信息',
                    type: 'input',
                    group: 'info',
                    placeholder: '输入新的用户描述',
                    inputKey: 'comment'
                },
                {
                    flag: '-e',
                    description: '修改账号失效日期',
                    type: 'input',
                    group: 'expiry',
                    placeholder: '输入日期，格式：YYYY-MM-DD',
                    inputKey: 'expire_date'
                },
                {
                    flag: '-L',
                    description: '锁定用户账号',
                    type: 'boolean',
                    group: 'security'
                },
                {
                    flag: '-U',
                    description: '解锁用户账号',
                    type: 'boolean',
                    group: 'security'
                },
                {
                    flag: '',
                    description: '要修改的用户名',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入用户名',
                    inputKey: 'username',
                    required: true
                }
            ],
            relatedCommands: ['useradd', 'userdel', 'passwd', 'id'],
            scenarios: ['system_admin']
        },
        {
            id: 'passwd',
            name: 'passwd',
            description: '修改用户密码',
            category: 'user-management',
            usage: 'passwd [选项] [用户名]',
            difficulty: 2,
            hot: true,
            icon: '🔒',
            options: [
                {
                    flag: '-d',
                    description: '删除用户密码（设为空密码）',
                    type: 'boolean',
                    group: 'security'
                },
                {
                    flag: '-l',
                    description: '锁定用户账号',
                    type: 'boolean',
                    group: 'security'
                },
                {
                    flag: '-u',
                    description: '解锁用户账号',
                    type: 'boolean',
                    group: 'security'
                },
                {
                    flag: '-e',
                    description: '强制用户下次登录时修改密码',
                    type: 'boolean',
                    group: 'policy'
                },
                {
                    flag: '-S',
                    description: '显示用户密码状态',
                    type: 'boolean',
                    group: 'info'
                },
                {
                    flag: '-n',
                    description: '设置密码最小使用天数',
                    type: 'number',
                    group: 'policy',
                    placeholder: '输入天数',
                    inputKey: 'min_days'
                },
                {
                    flag: '-x',
                    description: '设置密码最大使用天数',
                    type: 'number',
                    group: 'policy',
                    placeholder: '输入天数',
                    inputKey: 'max_days'
                },
                {
                    flag: '-w',
                    description: '设置密码过期前警告天数',
                    type: 'number',
                    group: 'policy',
                    placeholder: '输入天数',
                    inputKey: 'warn_days'
                },
                {
                    flag: '--stdin',
                    description: '从标准输入读取密码',
                    type: 'boolean',
                    group: 'input'
                },
                {
                    flag: '',
                    description: '要修改密码的用户名（可选，默认为当前用户）',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入用户名，留空表示当前用户',
                    inputKey: 'username'
                }
            ],
            relatedCommands: ['usermod', 'chage', 'su', 'sudo'],
            scenarios: ['system_admin']
        },
        {
            id: 'su',
            name: 'su',
            description: '切换用户身份',
            category: 'user-management',
            usage: 'su [选项] [用户名]',
            difficulty: 3,
            hot: true,
            icon: '🔄',
            options: [
                {
                    flag: '-',
                    description: '完全切换到目标用户环境（等同于 -l）',
                    type: 'boolean',
                    group: 'environment'
                },
                {
                    flag: '-l',
                    description: '完全切换用户环境',
                    type: 'boolean',
                    group: 'environment'
                },
                {
                    flag: '-c',
                    description: '执行指定命令后返回原用户',
                    type: 'input',
                    group: 'command',
                    placeholder: '输入要执行的命令',
                    inputKey: 'command'
                },
                {
                    flag: '-s',
                    description: '指定要使用的shell',
                    type: 'select',
                    group: 'shell',
                    options: ['/bin/bash', '/bin/sh', '/bin/zsh'],
                    inputKey: 'shell'
                },
                {
                    flag: '-m',
                    description: '保留当前环境变量',
                    type: 'boolean',
                    group: 'environment'
                },
                {
                    flag: '-p',
                    description: '保留当前环境变量（等同于 -m）',
                    type: 'boolean',
                    group: 'environment'
                },
                {
                    flag: '',
                    description: '目标用户名（留空表示root用户）',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入用户名，留空表示root',
                    inputKey: 'username'
                }
            ],
            relatedCommands: ['sudo', 'passwd', 'whoami', 'id'],
            scenarios: ['system_admin']
        },
        {
            id: 'sudo',
            name: 'sudo',
            description: '以其他用户身份执行命令',
            category: 'user-management',
            usage: 'sudo [选项] 命令',
            difficulty: 3,
            hot: true,
            icon: '🛡️',
            options: [
                {
                    flag: '-u',
                    description: '指定以哪个用户身份执行命令',
                    type: 'input',
                    group: 'user',
                    placeholder: '输入用户名，默认为root',
                    inputKey: 'target_user'
                },
                {
                    flag: '-g',
                    description: '指定以哪个群组身份执行命令',
                    type: 'input',
                    group: 'group',
                    placeholder: '输入群组名',
                    inputKey: 'target_group'
                },
                {
                    flag: '-i',
                    description: '模拟目标用户的登录环境',
                    type: 'boolean',
                    group: 'environment'
                },
                {
                    flag: '-s',
                    description: '运行目标用户的shell',
                    type: 'boolean',
                    group: 'shell'
                },
                {
                    flag: '-H',
                    description: '设置HOME环境变量为目标用户的主目录',
                    type: 'boolean',
                    group: 'environment'
                },
                {
                    flag: '-l',
                    description: '列出当前用户可执行的sudo命令',
                    type: 'boolean',
                    group: 'info'
                },
                {
                    flag: '-v',
                    description: '验证用户身份（重置sudo超时）',
                    type: 'boolean',
                    group: 'auth'
                },
                {
                    flag: '-k',
                    description: '清除sudo身份认证缓存',
                    type: 'boolean',
                    group: 'auth'
                },
                {
                    flag: '-n',
                    description: '非交互模式，不提示输入密码',
                    type: 'boolean',
                    group: 'interaction'
                },
                {
                    flag: '-S',
                    description: '从标准输入读取密码',
                    type: 'boolean',
                    group: 'auth'
                },
                {
                    flag: '',
                    description: '要执行的命令',
                    type: 'input',
                    group: 'command',
                    placeholder: '输入要以超级用户权限执行的命令',
                    inputKey: 'command',
                    required: true
                }
            ],
            relatedCommands: ['su', 'passwd', 'visudo', 'whoami'],
            scenarios: ['system_admin']
        },
        // 输入输出重定向和管道命令
        {
            id: 'tee',
            name: 'tee',
            description: '同时输出到文件和标准输出',
            category: 'io-redirection',
            usage: 'tee [选项] 文件...',
            difficulty: 3,
            hot: true,
            icon: '📤',
            options: [
                {
                    flag: '-a',
                    description: '追加到文件而不是覆盖',
                    type: 'boolean',
                    group: 'output'
                },
                {
                    flag: '-i',
                    description: '忽略中断信号',
                    type: 'boolean',
                    group: 'signal'
                },
                {
                    flag: '-p',
                    description: '诊断写入非管道的错误',
                    type: 'boolean',
                    group: 'error'
                },
                {
                    flag: '',
                    description: '输出文件路径',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入文件路径，如: output.txt',
                    inputKey: 'output_file',
                    required: true
                }
            ],
            relatedCommands: ['cat', 'echo', '>', '>>'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'xargs',
            name: 'xargs',
            description: '从标准输入构建并执行命令行',
            category: 'io-redirection',
            usage: 'xargs [选项] [命令 [初始参数]]',
            difficulty: 4,
            hot: true,
            icon: '🔗',
            options: [
                {
                    flag: '-n',
                    description: '每次执行命令时使用的最大参数数量',
                    type: 'number',
                    group: 'execution',
                    placeholder: '输入参数数量，如: 1',
                    inputKey: 'max_args'
                },
                {
                    flag: '-I',
                    description: '指定替换字符串',
                    type: 'input',
                    group: 'replacement',
                    placeholder: '输入替换字符串，如: {}',
                    inputKey: 'replace_str'
                },
                {
                    flag: '-d',
                    description: '指定输入分隔符',
                    type: 'input',
                    group: 'delimiter',
                    placeholder: '输入分隔符，如: ,',
                    inputKey: 'delimiter'
                },
                {
                    flag: '-0',
                    description: '使用null字符作为分隔符',
                    type: 'boolean',
                    group: 'delimiter'
                },
                {
                    flag: '-r',
                    description: '如果没有输入则不执行命令',
                    type: 'boolean',
                    group: 'execution'
                },
                {
                    flag: '-t',
                    description: '执行前打印命令',
                    type: 'boolean',
                    group: 'verbose'
                },
                {
                    flag: '-p',
                    description: '执行前提示确认',
                    type: 'boolean',
                    group: 'interactive'
                },
                {
                    flag: '-P',
                    description: '并行执行的最大进程数',
                    type: 'number',
                    group: 'parallel',
                    placeholder: '输入进程数，如: 4',
                    inputKey: 'max_procs'
                },
                {
                    flag: '',
                    description: '要执行的命令',
                    type: 'input',
                    group: 'command',
                    placeholder: '输入命令，如: rm',
                    inputKey: 'command',
                    required: true
                }
            ],
            relatedCommands: ['find', 'grep', 'cut', 'sort'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'printf',
            name: 'printf',
            description: '格式化输出文本',
            category: 'io-redirection',
            usage: 'printf 格式 [参数...]',
            difficulty: 3,
            hot: false,
            icon: '📄',
            options: [
                {
                    flag: '',
                    description: '格式字符串',
                    type: 'input',
                    group: 'format',
                    placeholder: '输入格式，如: "Hello %s\\n"',
                    inputKey: 'format_string',
                    required: true
                },
                {
                    flag: '',
                    description: '参数值（可选）',
                    type: 'input',
                    group: 'arguments',
                    placeholder: '输入参数值，用空格分隔',
                    inputKey: 'arguments'
                }
            ],
            relatedCommands: ['echo', 'cat', 'awk'],
            scenarios: ['web_project', 'system_admin']
        },
        // 文件查找和搜索命令补充
        {
            id: 'locate',
            name: 'locate',
            description: '快速查找文件位置',
            category: 'file-operations',
            usage: 'locate [选项] 模式',
            difficulty: 2,
            hot: true,
            icon: '🔍',
            options: [
                {
                    flag: '-i',
                    description: '忽略大小写',
                    type: 'boolean',
                    group: 'search'
                },
                {
                    flag: '-n',
                    description: '限制输出结果数量',
                    type: 'number',
                    group: 'output',
                    placeholder: '输入最大结果数，如: 10',
                    inputKey: 'max_results'
                },
                {
                    flag: '-r',
                    description: '使用正则表达式搜索',
                    type: 'boolean',
                    group: 'search'
                },
                {
                    flag: '-e',
                    description: '只显示存在的文件',
                    type: 'boolean',
                    group: 'filter'
                },
                {
                    flag: '-c',
                    description: '只显示找到的文件数量',
                    type: 'boolean',
                    group: 'output'
                },
                {
                    flag: '-S',
                    description: '显示数据库统计信息',
                    type: 'boolean',
                    group: 'info'
                },
                {
                    flag: '-u',
                    description: '更新数据库',
                    type: 'boolean',
                    group: 'database'
                },
                {
                    flag: '',
                    description: '搜索模式',
                    type: 'input',
                    group: 'pattern',
                    placeholder: '输入文件名模式，如: *.txt',
                    inputKey: 'search_pattern',
                    required: true
                }
            ],
            relatedCommands: ['find', 'which', 'whereis'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'which',
            name: 'which',
            description: '查找命令的完整路径',
            category: 'system-info',
            usage: 'which [选项] 命令名',
            difficulty: 1,
            hot: true,
            icon: '📍',
            options: [
                {
                    flag: '-a',
                    description: '显示所有匹配的路径',
                    type: 'boolean',
                    group: 'search'
                },
                {
                    flag: '-s',
                    description: '静默模式，不输出，只返回状态',
                    type: 'boolean',
                    group: 'output'
                },
                {
                    flag: '',
                    description: '命令名',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入命令名，如: ls',
                    inputKey: 'command_name',
                    required: true
                }
            ],
            relatedCommands: ['whereis', 'type', 'locate'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'whereis',
            name: 'whereis',
            description: '查找命令的位置、源代码和手册页',
            category: 'system-info',
            usage: 'whereis [选项] 命令名',
            difficulty: 2,
            hot: false,
            icon: '🗺️',
            options: [
                {
                    flag: '-b',
                    description: '只查找二进制文件',
                    type: 'boolean',
                    group: 'type'
                },
                {
                    flag: '-m',
                    description: '只查找手册页',
                    type: 'boolean',
                    group: 'type'
                },
                {
                    flag: '-s',
                    description: '只查找源代码',
                    type: 'boolean',
                    group: 'type'
                },
                {
                    flag: '-u',
                    description: '查找不常见的文件',
                    type: 'boolean',
                    group: 'filter'
                },
                {
                    flag: '-B',
                    description: '指定二进制文件搜索路径',
                    type: 'input',
                    group: 'path',
                    placeholder: '输入搜索路径',
                    inputKey: 'binary_path'
                },
                {
                    flag: '-M',
                    description: '指定手册页搜索路径',
                    type: 'input',
                    group: 'path',
                    placeholder: '输入搜索路径',
                    inputKey: 'manual_path'
                },
                {
                    flag: '',
                    description: '命令名',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入命令名，如: gcc',
                    inputKey: 'command_name',
                    required: true
                }
            ],
            relatedCommands: ['which', 'locate', 'man'],
            scenarios: ['web_project', 'system_admin']
        },
        // 文本处理高级命令
        {
            id: 'sort',
            name: 'sort',
            description: '对文本进行排序',
            category: 'text-processing',
            usage: 'sort [选项] [文件...]',
            difficulty: 3,
            hot: true,
            icon: '📶',
            options: [
                {
                    flag: '-r',
                    description: '逆序排序',
                    type: 'boolean',
                    group: 'order'
                },
                {
                    flag: '-n',
                    description: '按数值大小排序',
                    type: 'boolean',
                    group: 'type'
                },
                {
                    flag: '-u',
                    description: '去除重复行',
                    type: 'boolean',
                    group: 'filter'
                },
                {
                    flag: '-f',
                    description: '忽略大小写',
                    type: 'boolean',
                    group: 'case'
                },
                {
                    flag: '-t',
                    description: '指定字段分隔符',
                    type: 'input',
                    group: 'delimiter',
                    placeholder: '输入分隔符，如: :',
                    inputKey: 'delimiter'
                },
                {
                    flag: '-k',
                    description: '指定排序字段',
                    type: 'input',
                    group: 'field',
                    placeholder: '输入字段编号，如: 2',
                    inputKey: 'key_field'
                },
                {
                    flag: '-o',
                    description: '指定输出文件',
                    type: 'input',
                    group: 'output',
                    placeholder: '输入输出文件路径',
                    inputKey: 'output_file'
                },
                {
                    flag: '-c',
                    description: '检查文件是否已排序',
                    type: 'boolean',
                    group: 'check'
                },
                {
                    flag: '-m',
                    description: '合并已排序的文件',
                    type: 'boolean',
                    group: 'merge'
                },
                {
                    flag: '',
                    description: '要排序的文件',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入文件路径，如: data.txt',
                    inputKey: 'input_file'
                }
            ],
            relatedCommands: ['uniq', 'cut', 'awk'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'uniq',
            name: 'uniq',
            description: '去除或查找重复行',
            category: 'text-processing',
            usage: 'uniq [选项] [输入文件] [输出文件]',
            difficulty: 2,
            hot: true,
            icon: '🔀',
            options: [
                {
                    flag: '-c',
                    description: '显示每行的重复次数',
                    type: 'boolean',
                    group: 'count'
                },
                {
                    flag: '-d',
                    description: '只显示重复的行',
                    type: 'boolean',
                    group: 'duplicate'
                },
                {
                    flag: '-u',
                    description: '只显示不重复的行',
                    type: 'boolean',
                    group: 'unique'
                },
                {
                    flag: '-i',
                    description: '忽略大小写',
                    type: 'boolean',
                    group: 'case'
                },
                {
                    flag: '-f',
                    description: '跳过前N个字段',
                    type: 'number',
                    group: 'skip',
                    placeholder: '输入跳过的字段数',
                    inputKey: 'skip_fields'
                },
                {
                    flag: '-s',
                    description: '跳过前N个字符',
                    type: 'number',
                    group: 'skip',
                    placeholder: '输入跳过的字符数',
                    inputKey: 'skip_chars'
                },
                {
                    flag: '-w',
                    description: '比较时只考虑前N个字符',
                    type: 'number',
                    group: 'compare',
                    placeholder: '输入比较的字符数',
                    inputKey: 'compare_chars'
                },
                {
                    flag: '',
                    description: '输入文件',
                    type: 'input',
                    group: 'input',
                    placeholder: '输入文件路径，如: sorted.txt',
                    inputKey: 'input_file'
                },
                {
                    flag: '',
                    description: '输出文件（可选）',
                    type: 'input',
                    group: 'output',
                    placeholder: '输入输出文件路径',
                    inputKey: 'output_file'
                }
            ],
            relatedCommands: ['sort', 'cut', 'comm'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'cut',
            name: 'cut',
            description: '从文件的每一行中提取指定的字段或字符',
            category: 'text-processing',
            usage: 'cut [选项] [文件...]',
            difficulty: 3,
            hot: true,
            icon: '✂️',
            options: [
                {
                    flag: '-f',
                    description: '提取指定字段',
                    type: 'input',
                    group: 'field',
                    placeholder: '输入字段编号，如: 1,3-5',
                    inputKey: 'fields'
                },
                {
                    flag: '-d',
                    description: '指定字段分隔符',
                    type: 'input',
                    group: 'delimiter',
                    placeholder: '输入分隔符，如: :',
                    inputKey: 'delimiter'
                },
                {
                    flag: '-c',
                    description: '按字符位置提取',
                    type: 'input',
                    group: 'character',
                    placeholder: '输入字符位置，如: 1-10',
                    inputKey: 'characters'
                },
                {
                    flag: '-b',
                    description: '按字节位置提取',
                    type: 'input',
                    group: 'byte',
                    placeholder: '输入字节位置，如: 1-10',
                    inputKey: 'bytes'
                },
                {
                    flag: '--complement',
                    description: '提取除指定字段外的所有字段',
                    type: 'boolean',
                    group: 'complement'
                },
                {
                    flag: '-s',
                    description: '不显示不包含分隔符的行',
                    type: 'boolean',
                    group: 'suppress'
                },
                {
                    flag: '--output-delimiter',
                    description: '指定输出分隔符',
                    type: 'input',
                    group: 'output',
                    placeholder: '输入输出分隔符',
                    inputKey: 'output_delimiter'
                },
                {
                    flag: '',
                    description: '要处理的文件',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入文件路径，如: data.csv',
                    inputKey: 'input_file'
                }
            ],
            relatedCommands: ['awk', 'sort', 'grep'],
            scenarios: ['web_project', 'system_admin']
        },
        {
            id: 'echo',
            name: 'echo',
            description: '输出字符串或提取后的变量值',
            category: 'text-processing',
            usage: 'echo [选项] [字符串...]',
            difficulty: 1,
            hot: true,
            icon: '💬',
            options: [
                {
                    flag: '-n',
                    description: '不输出结尾换行符',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '-e',
                    description: '启用反斜杠转义的解释',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '-E',
                    description: '禁用反斜杠转义的解释（默认）',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '',
                    description: '要输出的文本字符串',
                    type: 'input',
                    group: 'input',
                    placeholder: '要显示的文本内容',
                    inputKey: 'text_content',
                    required: true
                }
            ],
            relatedCommands: ['printf', 'cat', '>'],
            scenarios: ['web_project', 'system_admin']
        },
        // 新增：文件查找和定位类命令
        {
            id: 'tr',
            name: 'tr',
            category: 'text-processing',
            description: '字符转换工具',
            usage: 'tr [选项] SET1 [SET2]',
            difficulty: 3,
            isHot: false,
            icon: '🔤',
            parameters: [
                {
                    name: '-d',
                    description: '删除字符集1中的所有字符',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-s',
                    description: '压缩重复字符',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-c',
                    description: '使用字符集1的补集',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-t',
                    description: '截断SET1到SET2的长度',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: 'SET1',
                    description: '源字符集',
                    type: 'input',
                    group: 'basic',
                    placeholder: '如: a-z, [a-z], [:lower:]'
                },
                {
                    name: 'SET2',
                    description: '目标字符集',
                    type: 'input',
                    group: 'basic',
                    placeholder: '如: A-Z, [A-Z], [:upper:]'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'tr a-z A-Z',
                    description: '小写转大写',
                    mockOutput: 'HELLO WORLD\n'
                },
                {
                    scenario: 'delete',
                    command: 'tr -d "0-9"',
                    description: '删除所有数字',
                    mockOutput: 'hello world\n'
                }
            ],
            relatedCommands: ['sed', 'awk', 'cut']
        },
        {
            id: 'wc',
            name: 'wc',
            category: 'text-processing',
            description: '统计文件的行数、字数和字符数',
            usage: 'wc [选项] [文件...]',
            difficulty: 2,
            isHot: true,
            icon: '📊',
            parameters: [
                {
                    name: '-l',
                    longName: '--lines',
                    description: '统计行数',
                    type: 'boolean',
                    group: 'count'
                },
                {
                    name: '-w',
                    longName: '--words',
                    description: '统计字数',
                    type: 'boolean',
                    group: 'count'
                },
                {
                    name: '-c',
                    longName: '--bytes',
                    description: '统计字节数',
                    type: 'boolean',
                    group: 'count'
                },
                {
                    name: '-m',
                    longName: '--chars',
                    description: '统计字符数',
                    type: 'boolean',
                    group: 'count'
                },
                {
                    name: '-L',
                    longName: '--max-line-length',
                    description: '显示最长行的长度',
                    type: 'boolean',
                    group: 'count'
                },
                {
                    name: '文件路径',
                    description: '要统计的文件',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入文件路径，如: /var/log/access.log'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'wc file.txt',
                    description: '统计文件的行数、字数、字节数',
                    mockOutput: '   42  163 1024 file.txt\n'
                },
                {
                    scenario: 'lines_only',
                    command: 'wc -l file.txt',
                    description: '只统计行数',
                    mockOutput: '42 file.txt\n'
                }
            ],
            relatedCommands: ['cat', 'less', 'grep']
        },
        {
            id: 'diff',
            name: 'diff',
            category: 'text-processing',
            description: '比较两个文件的差异',
            usage: 'diff [选项] 文件1 文件2',
            difficulty: 3,
            isHot: false,
            icon: '🔍',
            parameters: [
                {
                    name: '-u',
                    longName: '--unified',
                    description: '统一格式输出',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    name: '-c',
                    longName: '--context',
                    description: '上下文格式输出',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    name: '-i',
                    longName: '--ignore-case',
                    description: '忽略大小写',
                    type: 'boolean',
                    group: 'ignore'
                },
                {
                    name: '-w',
                    longName: '--ignore-all-space',
                    description: '忽略所有空白字符',
                    type: 'boolean',
                    group: 'ignore'
                },
                {
                    name: '-b',
                    longName: '--ignore-space-change',
                    description: '忽略空白字符的变化',
                    type: 'boolean',
                    group: 'ignore'
                },
                {
                    name: '-r',
                    longName: '--recursive',
                    description: '递归比较目录',
                    type: 'boolean',
                    group: 'mode'
                },
                {
                    name: '文件1',
                    description: '第一个文件',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入第一个文件路径'
                },
                {
                    name: '文件2',
                    description: '第二个文件',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入第二个文件路径'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'diff file1.txt file2.txt',
                    description: '比较两个文件的差异',
                    mockOutput: '3c3\n< old line\n---\n> new line\n'
                }
            ],
            relatedCommands: ['cmp', 'comm', 'patch']
        },
        // 新增：文件查找和定位类
        {
            id: 'type',
            name: 'type',
            category: 'file-search',
            description: '显示命令的类型信息',
            usage: 'type [选项] 命令名',
            difficulty: 2,
            isHot: false,
            icon: '🔎',
            parameters: [
                {
                    name: '-a',
                    description: '显示所有包含指定名称的命令',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-t',
                    description: '只显示类型',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-p',
                    description: '强制搜索PATH',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '命令名',
                    description: '要查询的命令',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入命令名称，如: ls'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'type ls',
                    description: '查看ls命令的类型',
                    mockOutput: 'ls is aliased to `ls --color=auto`\n'
                }
            ],
            relatedCommands: ['which', 'whereis', 'command']
        },
        // 新增：压缩归档类
        {
            id: 'gzip',
            name: 'gzip',
            category: 'compression',
            description: 'GNU压缩工具',
            usage: 'gzip [选项] [文件...]',
            difficulty: 2,
            isHot: true,
            icon: '🗜️',
            parameters: [
                {
                    name: '-d',
                    longName: '--decompress',
                    description: '解压缩文件',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-f',
                    longName: '--force',
                    description: '强制覆盖已存在的文件',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-k',
                    longName: '--keep',
                    description: '保留原始文件',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-r',
                    longName: '--recursive',
                    description: '递归处理目录',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-t',
                    longName: '--test',
                    description: '测试压缩文件完整性',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-v',
                    longName: '--verbose',
                    description: '显示详细信息',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-1到-9',
                    description: '压缩级别（1=最快，9=最佳压缩）',
                    type: 'select',
                    group: 'advanced',
                    options: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
                    default: '6'
                },
                {
                    name: '文件路径',
                    description: '要压缩的文件',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入文件路径'
                }
            ],
            examples: [
                {
                    scenario: 'compress',
                    command: 'gzip file.txt',
                    description: '压缩文件',
                    mockOutput: '# 文件被压缩为 file.txt.gz\n'
                },
                {
                    scenario: 'decompress',
                    command: 'gzip -d file.txt.gz',
                    description: '解压缩文件',
                    mockOutput: '# 文件被解压缩为 file.txt\n'
                }
            ],
            relatedCommands: ['gunzip', 'zcat', 'tar']
        },
        {
            id: 'gunzip',
            name: 'gunzip',
            category: 'compression',
            description: 'GNU解压缩工具',
            usage: 'gunzip [选项] [文件...]',
            difficulty: 2,
            isHot: false,
            icon: '📦',
            parameters: [
                {
                    name: '-f',
                    longName: '--force',
                    description: '强制解压缩',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-k',
                    longName: '--keep',
                    description: '保留压缩文件',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-r',
                    longName: '--recursive',
                    description: '递归处理目录',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-t',
                    longName: '--test',
                    description: '测试压缩文件完整性',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-v',
                    longName: '--verbose',
                    description: '显示详细信息',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '文件路径',
                    description: '要解压的.gz文件',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入.gz文件路径'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'gunzip file.txt.gz',
                    description: '解压缩.gz文件',
                    mockOutput: '# 文件解压为 file.txt\n'
                }
            ],
            relatedCommands: ['gzip', 'zcat', 'tar']
        },
        // 新增：系统信息类
        {
            id: 'uname',
            name: 'uname',
            category: 'system-info',
            description: '显示系统信息',
            usage: 'uname [选项]',
            difficulty: 1,
            isHot: true,
            icon: '💻',
            parameters: [
                {
                    name: '-a',
                    longName: '--all',
                    description: '显示所有系统信息',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-s',
                    longName: '--kernel-name',
                    description: '显示内核名称',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-n',
                    longName: '--nodename',
                    description: '显示网络节点主机名',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-r',
                    longName: '--kernel-release',
                    description: '显示内核发行版本',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-v',
                    longName: '--kernel-version',
                    description: '显示内核版本',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-m',
                    longName: '--machine',
                    description: '显示机器硬件架构',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-p',
                    longName: '--processor',
                    description: '显示处理器类型',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-i',
                    longName: '--hardware-platform',
                    description: '显示硬件平台',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-o',
                    longName: '--operating-system',
                    description: '显示操作系统',
                    type: 'boolean',
                    group: 'basic'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'uname',
                    description: '显示系统名称',
                    mockOutput: 'Linux\n'
                },
                {
                    scenario: 'all',
                    command: 'uname -a',
                    description: '显示所有系统信息',
                    mockOutput: 'Linux ubuntu 5.4.0-74-generic #83-Ubuntu SMP Sat May 8 02:35:39 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux\n'
                }
            ],
            relatedCommands: ['lsb_release', 'hostnamectl', 'arch']
        },
        {
            id: 'uptime',
            name: 'uptime',
            category: 'system-info',
            description: '显示系统运行时间和负载',
            usage: 'uptime [选项]',
            difficulty: 1,
            isHot: false,
            icon: '⏰',
            parameters: [
                {
                    name: '-p',
                    longName: '--pretty',
                    description: '以友好格式显示运行时间',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-s',
                    longName: '--since',
                    description: '显示系统启动时间',
                    type: 'boolean',
                    group: 'basic'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'uptime',
                    description: '显示系统运行时间和负载',
                    mockOutput: ' 14:25:32 up 5 days, 18:42,  3 users,  load average: 0.08, 0.15, 0.12\n'
                },
                {
                    scenario: 'pretty',
                    command: 'uptime -p',
                    description: '友好格式显示运行时间',
                    mockOutput: 'up 5 days, 18 hours, 42 minutes\n'
                }
            ],
            relatedCommands: ['who', 'w', 'last']
        },
        {
            id: 'who',
            name: 'who',
            category: 'system-info',
            description: '显示当前登录用户信息',
            usage: 'who [选项] [文件]',
            difficulty: 2,
            isHot: false,
            icon: '👥',
            parameters: [
                {
                    name: '-a',
                    longName: '--all',
                    description: '显示所有信息',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-b',
                    longName: '--boot',
                    description: '显示系统启动时间',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-d',
                    longName: '--dead',
                    description: '显示已死进程',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-H',
                    longName: '--heading',
                    description: '显示列标题',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-l',
                    longName: '--login',
                    description: '显示登录进程',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-q',
                    longName: '--count',
                    description: '显示用户数量',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-r',
                    longName: '--runlevel',
                    description: '显示当前运行级别',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-u',
                    longName: '--users',
                    description: '显示登录用户列表',
                    type: 'boolean',
                    group: 'basic'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'who',
                    description: '显示当前登录用户',
                    mockOutput: 'user1    pts/0        2024-01-10 09:15 (192.168.1.100)\nuser2    pts/1        2024-01-10 10:30 (192.168.1.101)\n'
                },
                {
                    scenario: 'count',
                    command: 'who -q',
                    description: '显示登录用户数量',
                    mockOutput: 'user1 user2\n# users=2\n'
                }
            ],
            relatedCommands: ['w', 'users', 'last']
        },
        {
            id: 'w',
            name: 'w',
            category: 'system-info',
            description: '显示当前登录用户及其活动',
            usage: 'w [选项] [用户名]',
            difficulty: 2,
            isHot: false,
            icon: '📊',
            parameters: [
                {
                    name: '-h',
                    longName: '--no-header',
                    description: '不显示标题行',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-u',
                    longName: '--no-current',
                    description: '不显示当前进程的用户名和PID',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-s',
                    longName: '--short',
                    description: '使用短格式',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-f',
                    longName: '--from',
                    description: '显示远程主机名',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-i',
                    longName: '--ip-addr',
                    description: '显示IP地址而不是主机名',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '用户名',
                    description: '指定用户名',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入用户名（可选）'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'w',
                    description: '显示所有登录用户及活动',
                    mockOutput: ' 14:25:32 up 5 days, 18:42,  2 users,  load average: 0.08, 0.15, 0.12\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\nuser1    pts/0    192.168.1.100    09:15    0.00s  0.23s  0.04s vim\nuser2    pts/1    192.168.1.101    10:30    1:05   0.18s  0.18s bash\n'
                }
            ],
            relatedCommands: ['who', 'uptime', 'users']
        },
        {
            id: 'id',
            name: 'id',
            category: 'system-info',
            description: '显示用户和组ID',
            usage: 'id [选项] [用户名]',
            difficulty: 1,
            isHot: false,
            icon: '🆔',
            parameters: [
                {
                    name: '-u',
                    longName: '--user',
                    description: '只显示用户ID',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-g',
                    longName: '--group',
                    description: '只显示组ID',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-G',
                    longName: '--groups',
                    description: '显示所有组ID',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-n',
                    longName: '--name',
                    description: '显示名称而不是ID',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-r',
                    longName: '--real',
                    description: '显示真实ID而不是有效ID',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '用户名',
                    description: '指定用户名',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入用户名（可选）'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'id',
                    description: '显示当前用户的ID信息',
                    mockOutput: 'uid=1000(user) gid=1000(user) groups=1000(user),4(adm),24(cdrom),27(sudo),30(dip)\n'
                },
                {
                    scenario: 'user_only',
                    command: 'id -u',
                    description: '只显示用户ID',
                    mockOutput: '1000\n'
                }
            ],
            relatedCommands: ['whoami', 'groups', 'getent']
        },
        {
            id: 'groups',
            name: 'groups',
            category: 'system-info',
            description: '显示用户所属的组',
            usage: 'groups [用户名...]',
            difficulty: 1,
            isHot: false,
            icon: '👥',
            parameters: [
                {
                    name: '用户名',
                    description: '指定用户名',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入用户名（可选）'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'groups',
                    description: '显示当前用户所属的组',
                    mockOutput: 'user adm cdrom sudo dip plugdev lpadmin sambashare\n'
                },
                {
                    scenario: 'specific_user',
                    command: 'groups root',
                    description: '显示指定用户所属的组',
                    mockOutput: 'root : root\n'
                }
            ],
            relatedCommands: ['id', 'getent', 'usermod']
        },
        // 新增：进程管理类
        {
            id: 'jobs',
            name: 'jobs',
            category: 'process-management',
            description: '显示当前shell的作业状态',
            usage: 'jobs [选项] [作业ID...]',
            difficulty: 2,
            isHot: false,
            icon: '📋',
            parameters: [
                {
                    name: '-l',
                    description: '显示详细信息包括PID',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-p',
                    description: '只显示PID',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-r',
                    description: '只显示运行中的作业',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-s',
                    description: '只显示停止的作业',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-x',
                    description: '执行命令替换作业ID',
                    type: 'boolean',
                    group: 'basic'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'jobs',
                    description: '显示当前作业',
                    mockOutput: '[1]-  Stopped                 vim file.txt\n[2]+  Running                 sleep 100 &\n'
                },
                {
                    scenario: 'detailed',
                    command: 'jobs -l',
                    description: '显示详细作业信息',
                    mockOutput: '[1]- 12345 Stopped                 vim file.txt\n[2]+ 12346 Running                 sleep 100 &\n'
                }
            ],
            relatedCommands: ['bg', 'fg', 'nohup']
        },
        {
            id: 'bg',
            name: 'bg',
            category: 'process-management',
            description: '将作业放到后台运行',
            usage: 'bg [作业ID...]',
            difficulty: 2,
            isHot: false,
            icon: '⏩',
            parameters: [
                {
                    name: '作业ID',
                    description: '指定作业ID（如%1）',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入作业ID，如: %1'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'bg %1',
                    description: '将作业1放到后台运行',
                    mockOutput: '[1]+ vim file.txt &\n'
                }
            ],
            relatedCommands: ['fg', 'jobs', 'nohup']
        },
        {
            id: 'fg',
            name: 'fg',
            category: 'process-management',
            description: '将后台作业调到前台运行',
            usage: 'fg [作业ID]',
            difficulty: 2,
            isHot: false,
            icon: '⏪',
            parameters: [
                {
                    name: '作业ID',
                    description: '指定作业ID（如%1）',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入作业ID，如: %1'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'fg %1',
                    description: '将作业1调到前台',
                    mockOutput: 'vim file.txt\n'
                }
            ],
            relatedCommands: ['bg', 'jobs', 'ctrl+z']
        },
        {
            id: 'nohup',
            name: 'nohup',
            category: 'process-management',
            description: '忽略挂起信号运行命令',
            usage: 'nohup 命令 [参数...] &',
            difficulty: 3,
            isHot: false,
            icon: '🛡️',
            parameters: [
                {
                    name: '命令',
                    description: '要运行的命令',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入要运行的命令'
                },
                {
                    name: '参数',
                    description: '命令的参数',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入命令参数（可选）'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'nohup python script.py &',
                    description: '后台运行Python脚本，忽略挂起信号',
                    mockOutput: 'nohup: ignoring input and appending output to "nohup.out"\n[1] 12347\n'
                },
                {
                    scenario: 'redirect',
                    command: 'nohup ./long_running_task.sh > output.log 2>&1 &',
                    description: '后台运行脚本并重定向输出',
                    mockOutput: '[1] 12348\n'
                }
            ],
            relatedCommands: ['bg', 'disown', 'screen']
        },
        // 新增：网络工具类
        {
            id: 'traceroute',
            name: 'traceroute',
            category: 'network-tools',
            description: '追踪到目标主机的网络路径',
            usage: 'traceroute [选项] 主机名或IP',
            difficulty: 3,
            isHot: false,
            icon: '🗺️',
            parameters: [
                {
                    name: '-I',
                    description: '使用ICMP ECHO代替UDP数据包',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-T',
                    description: '使用TCP SYN进行追踪',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-n',
                    description: '不解析主机名',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-w',
                    description: '等待响应的时间（秒）',
                    type: 'number',
                    group: 'timing',
                    default: 5,
                    min: 1,
                    max: 30
                },
                {
                    name: '-m',
                    description: '最大跳数',
                    type: 'number',
                    group: 'advanced',
                    default: 30,
                    min: 1,
                    max: 255
                },
                {
                    name: '-q',
                    description: '每跳的查询包数量',
                    type: 'number',
                    group: 'advanced',
                    default: 3,
                    min: 1,
                    max: 10
                },
                {
                    name: '目标主机',
                    description: '目标主机名或IP地址',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入主机名或IP，如: google.com'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'traceroute google.com',
                    description: '追踪到Google的网络路径',
                    mockOutput: 'traceroute to google.com (172.217.31.142), 30 hops max, 60 byte packets\n 1  192.168.1.1 (192.168.1.1)  1.234 ms  1.123 ms  1.098 ms\n 2  10.0.0.1 (10.0.0.1)  5.678 ms  5.432 ms  5.321 ms\n 3  * * *\n 4  172.217.31.142 (172.217.31.142)  15.234 ms  15.123 ms  15.098 ms\n'
                }
            ],
            relatedCommands: ['ping', 'mtr', 'route']
        },

        // 新增：iptables - 防火墙策略管理工具 (基于linuxcool.com)
        {
            id: 'iptables',
            name: 'iptables',
            category: 'network-tools',
            description: '防火墙策略管理工具',
            usage: 'iptables [参数] [对象]',
            difficulty: 4,
            isHot: true,
            icon: '🔥',
            options: [
                // 规则链管理参数
                {
                    flag: '-A',
                    description: '向规则链中追加条目',
                    type: 'input',
                    group: 'chain-management',
                    inputKey: 'append_chain',
                    placeholder: '链名，如: INPUT'
                },
                {
                    flag: '-I',
                    description: '向规则链中插入条目',
                    type: 'input',
                    group: 'chain-management',
                    inputKey: 'insert_chain',
                    placeholder: '链名，如: INPUT'
                },
                {
                    flag: '-D',
                    description: '从规则链中删除条目',
                    type: 'input',
                    group: 'chain-management',
                    inputKey: 'delete_chain',
                    placeholder: '链名，如: INPUT'
                },
                {
                    flag: '-R',
                    description: '替换规则链中的指定条目',
                    type: 'input',
                    group: 'chain-management',
                    inputKey: 'replace_chain',
                    placeholder: '链名，如: INPUT'
                },
                {
                    flag: '-L',
                    description: '显示规则链中的已有条目',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-F',
                    description: '清除规则链中的现有条目',
                    type: 'input',
                    group: 'chain-management',
                    inputKey: 'flush_chain',
                    placeholder: '链名（可选），如: INPUT'
                },
                {
                    flag: '-Z',
                    description: '清空规则链中的包计数器和字节计数器',
                    type: 'boolean',
                    group: 'chain-management'
                },
                {
                    flag: '-N',
                    description: '创建新的用户自定义规则链',
                    type: 'input',
                    group: 'chain-management',
                    inputKey: 'new_chain',
                    placeholder: '新链名，如: MYCHAIN'
                },
                {
                    flag: '-X',
                    description: '删除指定的用户自定链',
                    type: 'input',
                    group: 'chain-management',
                    inputKey: 'delete_user_chain',
                    placeholder: '链名，如: MYCHAIN'
                },
                {
                    flag: '-E',
                    description: '重命名指定的用户自定链',
                    type: 'input',
                    group: 'chain-management',
                    inputKey: 'rename_chain',
                    placeholder: '旧链名 新链名'
                },
                {
                    flag: '-P',
                    description: '设置规则链中的默认目标策略',
                    type: 'select',
                    group: 'policy',
                    inputKey: 'policy',
                    options: ['ACCEPT', 'DROP', 'REJECT']
                },
                // 匹配条件参数
                {
                    flag: '-s',
                    description: '设置要匹配数据包的源IP地址',
                    type: 'input',
                    group: 'match-conditions',
                    inputKey: 'source_ip',
                    placeholder: 'IP地址或网段，如: 192.168.1.0/24'
                },
                {
                    flag: '-d',
                    description: '设置要匹配数据包的目标IP地址',
                    type: 'input',
                    group: 'match-conditions',
                    inputKey: 'dest_ip',
                    placeholder: 'IP地址或网段，如: 10.0.0.1'
                },
                {
                    flag: '-p',
                    description: '设置要匹配数据包的协议类型',
                    type: 'select',
                    group: 'match-conditions',
                    inputKey: 'protocol',
                    options: ['tcp', 'udp', 'icmp', 'all']
                },
                {
                    flag: '-i',
                    description: '设置数据包进入本机的网络接口',
                    type: 'input',
                    group: 'match-conditions',
                    inputKey: 'input_interface',
                    placeholder: '接口名，如: eth0'
                },
                {
                    flag: '-o',
                    description: '设置数据包离开本机时所使用的网络接口',
                    type: 'input',
                    group: 'match-conditions',
                    inputKey: 'output_interface',
                    placeholder: '接口名，如: eth1'
                },
                {
                    flag: '--sport',
                    description: '匹配源端口号',
                    type: 'input',
                    group: 'match-conditions',
                    inputKey: 'source_port',
                    placeholder: '端口号，如: 22'
                },
                {
                    flag: '--dport',
                    description: '匹配目标端口号',
                    type: 'input',
                    group: 'match-conditions',
                    inputKey: 'dest_port',
                    placeholder: '端口号，如: 80'
                },
                // 动作参数
                {
                    flag: '-j',
                    description: '设置要跳转的目标',
                    type: 'select',
                    group: 'action',
                    inputKey: 'jump_target',
                    options: ['ACCEPT', 'DROP', 'REJECT', 'LOG', 'DNAT', 'SNAT', 'MASQUERADE']
                },
                // 表管理参数
                {
                    flag: '-t',
                    description: '设置要管理的表',
                    type: 'select',
                    group: 'table',
                    inputKey: 'table',
                    options: ['filter', 'nat', 'mangle', 'raw']
                },
                // 其他参数
                {
                    flag: '-v',
                    description: '显示执行过程详细信息',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-n',
                    description: '以数字形式显示IP地址和端口号',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '--line-numbers',
                    description: '显示规则的行号',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-c',
                    description: '初始化包计数器和字节计数器',
                    type: 'input',
                    group: 'advanced',
                    inputKey: 'counters',
                    placeholder: '包数 字节数'
                },
                {
                    flag: '-h',
                    description: '显示帮助信息',
                    type: 'boolean',
                    group: 'help'
                }
            ],
            scenarios: [
                {
                    name: 'basic',
                    description: '显示防火墙规则',
                    command: 'iptables -L',
                    output: `Chain INPUT (policy ACCEPT)
target     prot opt source               destination         

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination`
                },
                {
                    name: 'block-ip',
                    description: '阻止特定IP访问',
                    command: 'iptables -I INPUT -s 192.168.10.10 -j DROP',
                    output: '规则已添加到INPUT链'
                },
                {
                    name: 'allow-ssh',
                    description: '允许SSH连接',
                    command: 'iptables -A INPUT -p tcp --dport 22 -j ACCEPT',
                    output: '规则已添加到INPUT链'
                },
                {
                    name: 'block-port',
                    description: '阻止特定端口',
                    command: 'iptables -A INPUT -p tcp --dport 80 -j DROP',
                    output: '规则已添加到INPUT链'
                },
                {
                    name: 'nat-table',
                    description: '查看NAT表规则',
                    command: 'iptables -L -t nat',
                    output: `Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination         

Chain INPUT (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination         

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination`
                }
            ],
            relatedCommands: ['ufw', 'firewalld', 'ip6tables', 'netfilter']
        },

        // 新增：输入输出重定向类命令
        {
            id: 'printf',
            name: 'printf',
            category: 'io-redirection',
            description: '格式化输出信息',
            usage: 'printf 格式 [参数...]',
            difficulty: 3,
            isHot: true,
            icon: '📄',
            parameters: [
                {
                    name: '格式字符串',
                    description: '输出格式控制字符串',
                    type: 'input',
                    group: 'basic',
                    placeholder: '如: "Hello %s\\n"'
                },
                {
                    name: '参数',
                    description: '要输出的内容',
                    type: 'input',
                    group: 'basic',
                    placeholder: '如: World'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'printf "Hello %s\\n" World',
                    description: '格式化输出字符串',
                    mockOutput: 'Hello World\n'
                },
                {
                    scenario: 'format',
                    command: 'printf "%.2f\\n" 123.456',
                    description: '格式化输出数字',
                    mockOutput: '123.46\n'
                }
            ],
            relatedCommands: ['echo', 'cat', '>']
        },

        {
            id: 'seq',
            name: 'seq',
            category: 'io-redirection',
            description: '打印数字序列',
            usage: 'seq [选项] [首数] [增量] 尾数',
            difficulty: 2,
            isHot: false,
            icon: '🔢',
            parameters: [
                {
                    name: '-f',
                    description: '指定输出格式',
                    type: 'input',
                    group: 'format',
                    placeholder: '如: "%03g"'
                },
                {
                    name: '-s',
                    description: '指定分隔符',
                    type: 'input',
                    group: 'format',
                    placeholder: '如: ", "'
                },
                {
                    name: '-w',
                    description: '在列前添加0使得宽度相同',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    name: '首数',
                    description: '起始数字',
                    type: 'number',
                    group: 'basic',
                    default: 1,
                    min: -999999,
                    max: 999999
                },
                {
                    name: '增量',
                    description: '递增步长',
                    type: 'number',
                    group: 'basic',
                    default: 1,
                    min: -999999,
                    max: 999999
                },
                {
                    name: '尾数',
                    description: '结束数字',
                    type: 'number',
                    group: 'basic',
                    default: 10,
                    min: -999999,
                    max: 999999
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'seq 5',
                    description: '生成1到5的序列',
                    mockOutput: '1\n2\n3\n4\n5\n'
                },
                {
                    scenario: 'range',
                    command: 'seq 2 2 10',
                    description: '生成2到10的偶数序列',
                    mockOutput: '2\n4\n6\n8\n10\n'
                },
                {
                    scenario: 'formatted',
                    command: 'seq -s ", " -f "%02g" 1 5',
                    description: '格式化输出序列',
                    mockOutput: '01, 02, 03, 04, 05\n'
                }
            ],
            relatedCommands: ['echo', 'printf', 'jot']
        },

        {
            id: 'yes',
            name: 'yes',
            category: 'io-redirection',
            description: '重复打印字符串',
            usage: 'yes [字符串]',
            difficulty: 1,
            isHot: false,
            icon: '🔁',
            parameters: [
                {
                    name: '字符串',
                    description: '要重复打印的字符串',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入要重复的字符串，默认为y'
                },
                {
                    name: '--help',
                    description: '显示帮助信息',
                    type: 'boolean',
                    group: 'help'
                },
                {
                    name: '--version',
                    description: '显示版本信息',
                    type: 'boolean',
                    group: 'help'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'yes',
                    description: '重复打印y（用Ctrl+C停止）',
                    mockOutput: 'y\ny\ny\ny\n...(按Ctrl+C停止)\n'
                },
                {
                    scenario: 'custom',
                    command: 'yes "hello world"',
                    description: '重复打印指定字符串',
                    mockOutput: 'hello world\nhello world\nhello world\n...\n'
                }
            ],
            relatedCommands: ['echo', 'repeat', 'watch']
        },

        {
            id: 'read',
            name: 'read',
            category: 'io-redirection',
            description: '从标准输入读取数据',
            usage: 'read [选项] [变量名]',
            difficulty: 2,
            isHot: false,
            icon: '📥',
            parameters: [
                {
                    name: '-p',
                    description: '显示提示信息',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入提示信息'
                },
                {
                    name: '-n',
                    description: '读取指定字符数',
                    type: 'number',
                    group: 'limit',
                    min: 1,
                    max: 1000
                },
                {
                    name: '-t',
                    description: '超时时间（秒）',
                    type: 'number',
                    group: 'limit',
                    min: 1,
                    max: 3600
                },
                {
                    name: '-s',
                    description: '静默模式（不回显输入）',
                    type: 'boolean',
                    group: 'mode'
                },
                {
                    name: '-r',
                    description: '不解释反斜杠转义序列',
                    type: 'boolean',
                    group: 'mode'
                },
                {
                    name: '变量名',
                    description: '存储输入的变量名',
                    type: 'input',
                    group: 'basic',
                    placeholder: '如: username'
                }
            ],
            examples: [
                {
                    scenario: 'basic',
                    command: 'read name',
                    description: '读取用户输入到变量name',
                    mockOutput: '# 等待用户输入...\n'
                },
                {
                    scenario: 'prompt',
                    command: 'read -p "请输入用户名: " username',
                    description: '显示提示信息并读取输入',
                    mockOutput: '请输入用户名: # 等待用户输入...\n'
                }
            ],
            relatedCommands: ['echo', 'printf', 'input']
        },

        {
            id: 'shuf',
            name: 'shuf',
            category: 'io-redirection',
            description: '随机排列输入行',
            usage: 'shuf [选项] [文件...]',
            difficulty: 2,
            isHot: false,
            icon: '🎲',
            parameters: [
                {
                    name: '-n',
                    description: '输出最多N行',
                    type: 'number',
                    group: 'basic',
                    min: 1,
                    max: 10000,
                    default: 10
                },
                {
                    name: '-e',
                    description: '将每个参数视为输入行',
                    type: 'boolean',
                    group: 'mode'
                },
                {
                    name: '-i',
                    description: '生成数字范围',
                    type: 'input',
                    group: 'range',
                    placeholder: '如: 1-100'
                },
                {
                    name: '-r',
                    description: '允许重复输出行',
                    type: 'boolean',
                    group: 'mode'
                },
                {
                    name: '-o',
                    description: '输出到文件',
                    type: 'input',
                    group: 'output',
                    placeholder: '输出文件路径'
                },
                {
                    name: '文件路径',
                    description: '输入文件',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入文件路径'
                }
            ],
            examples: [
                {
                    scenario: 'file',
                    command: 'shuf file.txt',
                    description: '随机排列文件内容',
                    mockOutput: 'line3\nline1\nline4\nline2\n'
                },
                {
                    scenario: 'range',
                    command: 'shuf -i 1-10 -n 3',
                    description: '从1-10中随机选择3个数字',
                    mockOutput: '7\n3\n9\n'
                },
                {
                    scenario: 'args',
                    command: 'shuf -e red blue green yellow',
                    description: '随机排列参数',
                    mockOutput: 'yellow\nred\nblue\ngreen\n'
                }
            ],
            relatedCommands: ['sort', 'uniq', 'random']
        },

        // 新增：历史命令管理
        {
            id: 'history',
            name: 'history',
            category: 'system-info',
            description: '显示与管理历史命令记录',
            usage: 'history [参数] [数量]',
            difficulty: 2,
            isHot: true,
            icon: '📜',
            parameters: [
                {
                    name: '-a',
                    description: '保存命令记录到历史文件',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-r',
                    description: '读取命令记录到缓冲区',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-c',
                    description: '清空命令记录',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-w',
                    description: '将缓冲区信息写入历史文件',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-d',
                    description: '删除指定序号的命令记录',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入序号',
                    inputKey: 'line_number'
                },
                {
                    name: '-n',
                    description: '读取命令记录',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    name: '-s',
                    description: '添加命令记录到缓冲区',
                    type: 'input',
                    group: 'basic',
                    placeholder: '输入命令',
                    inputKey: 'command_text'
                },
                {
                    name: '数量',
                    description: '显示最近的命令数量',
                    type: 'number',
                    group: 'basic',
                    placeholder: '如: 10',
                    inputKey: 'count'
                }
            ],
            examples: [
                {
                    command: 'history',
                    description: '显示所有历史命令',
                    mockOutput: '  1  ls -la\n  2  cd /home\n  3  cat file.txt\n  4  pwd\n  5  history\n'
                },
                {
                    command: 'history 5',
                    description: '显示最近5条命令',
                    mockOutput: '  1  cat file.txt\n  2  ls\n  3  pwd\n  4  cd documents\n  5  history 5\n'
                },
                {
                    command: 'history -c',
                    description: '清空历史记录',
                    mockOutput: '历史记录已清空\n'
                }
            ],
            relatedCommands: ['bash', 'source', 'alias'],
            scenarios: ['system_admin', 'web_project']
        },

        // 新增：文件压缩与解压缩
        {
            id: 'bzip2',
            name: 'bzip2',
            category: 'compression-archive',
            description: '高效的文件压缩工具',
            usage: 'bzip2 [选项] [文件...]',
            difficulty: 3,
            isHot: false,
            icon: '🗜️',
            parameters: [
                {
                    name: '-z',
                    description: '强制压缩',
                    type: 'boolean',
                    group: 'compression'
                },
                {
                    name: '-d',
                    description: '解压缩',
                    type: 'boolean',
                    group: 'compression'
                },
                {
                    name: '-k',
                    description: '保留原文件',
                    type: 'boolean',
                    group: 'compression'
                },
                {
                    name: '-f',
                    description: '强制覆盖已存在的文件',
                    type: 'boolean',
                    group: 'compression'
                },
                {
                    name: '-t',
                    description: '测试压缩文件的完整性',
                    type: 'boolean',
                    group: 'compression'
                },
                {
                    name: '-v',
                    description: '显示详细信息',
                    type: 'boolean',
                    group: 'compression'
                },
                {
                    name: '-1到-9',
                    description: '压缩级别（1最快，9最小）',
                    type: 'select',
                    group: 'compression',
                    options: ['-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9'],
                    inputKey: 'compression_level'
                },
                {
                    name: '文件',
                    description: '要压缩的文件',
                    type: 'input',
                    group: 'target',
                    placeholder: '输入文件路径',
                    inputKey: 'target_file',
                    required: true
                }
            ],
            examples: [
                {
                    command: 'bzip2 file.txt',
                    description: '压缩文件',
                    mockOutput: '压缩完成: file.txt.bz2\n'
                },
                {
                    command: 'bzip2 -d file.txt.bz2',
                    description: '解压文件',
                    mockOutput: '解压完成: file.txt\n'
                },
                {
                    command: 'bzip2 -k -9 file.txt',
                    description: '最高压缩级别并保留原文件',
                    mockOutput: '高级压缩完成: file.txt.bz2\n原文件已保留\n'
                }
            ],
            relatedCommands: ['gzip', 'tar', 'xz'],
            scenarios: ['system_admin', 'web_project']
        },

        // 新增：软件包管理
        {
            id: 'rpm',
            name: 'rpm',
            category: 'system-info',
            description: 'RPM软件包管理器',
            usage: 'rpm [选项] 包名',
            difficulty: 4,
            isHot: true,
            icon: '📦',
            parameters: [
                {
                    name: '-i',
                    description: '安装软件包',
                    type: 'boolean',
                    group: 'install'
                },
                {
                    name: '-U',
                    description: '升级软件包',
                    type: 'boolean',
                    group: 'install'
                },
                {
                    name: '-e',
                    description: '卸载软件包',
                    type: 'boolean',
                    group: 'remove'
                },
                {
                    name: '-q',
                    description: '查询软件包',
                    type: 'boolean',
                    group: 'query'
                },
                {
                    name: '-qa',
                    description: '查询所有已安装的包',
                    type: 'boolean',
                    group: 'query'
                },
                {
                    name: '-qi',
                    description: '查询软件包详细信息',
                    type: 'boolean',
                    group: 'query'
                },
                {
                    name: '-ql',
                    description: '列出软件包中的文件',
                    type: 'boolean',
                    group: 'query'
                },
                {
                    name: '-qf',
                    description: '查询文件属于哪个包',
                    type: 'boolean',
                    group: 'query'
                },
                {
                    name: '-v',
                    description: '显示详细信息',
                    type: 'boolean',
                    group: 'verbose'
                },
                {
                    name: '-h',
                    description: '显示进度',
                    type: 'boolean',
                    group: 'verbose'
                },
                {
                    name: '--force',
                    description: '强制执行',
                    type: 'boolean',
                    group: 'force'
                },
                {
                    name: '--nodeps',
                    description: '忽略依赖关系',
                    type: 'boolean',
                    group: 'force'
                },
                {
                    name: '包名',
                    description: '软件包名称或文件路径',
                    type: 'input',
                    group: 'target',
                    placeholder: '如: package.rpm 或 nginx',
                    inputKey: 'package_name',
                    required: true
                }
            ],
            examples: [
                {
                    command: 'rpm -qa',
                    description: '列出所有已安装的包',
                    mockOutput: 'bash-4.4.20-1.el8\nkernel-4.18.0-80.el8\nnginx-1.16.1-1.el8\n...\n'
                },
                {
                    command: 'rpm -qi nginx',
                    description: '查询nginx包信息',
                    mockOutput: 'Name        : nginx\nVersion     : 1.16.1\nRelease     : 1.el8\nArchitecture: x86_64\nInstall Date: 2023-01-15 10:30:45\n'
                },
                {
                    command: 'rpm -ql nginx',
                    description: '列出nginx包的文件',
                    mockOutput: '/etc/nginx/nginx.conf\n/usr/sbin/nginx\n/var/log/nginx\n...\n'
                }
            ],
            relatedCommands: ['yum', 'dnf', 'apt'],
            scenarios: ['system_admin']
        },

        // 新增：定时任务管理
        {
            id: 'crontab',
            name: 'crontab',
            category: 'system-info',
            description: '管理定时计划任务',
            usage: 'crontab [参数] [对象]',
            difficulty: 3,
            isHot: true,
            icon: '⏰',
            options: [
                {
                    flag: '-e',
                    description: '编辑当前用户的计划任务',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-l',
                    description: '显示当前用户的计划任务列表',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-r',
                    description: '删除当前用户的所有计划任务',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-i',
                    description: '删除前询问用户是否确认',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-u',
                    description: '指定操作的用户名',
                    type: 'input',
                    group: 'basic',
                    placeholder: '用户名',
                    inputKey: 'username'
                },
                {
                    flag: '--help',
                    description: '显示帮助信息',
                    type: 'boolean',
                    group: 'help'
                }
            ],
            examples: [
                {
                    command: 'crontab -e',
                    description: '编辑当前用户的计划任务',
                    scenario: 'system_admin'
                },
                {
                    command: 'crontab -l',
                    description: '查看当前用户的计划任务列表',
                    scenario: 'system_admin'
                },
                {
                    command: 'crontab -e -u username',
                    description: '编辑指定用户的计划任务',
                    scenario: 'system_admin'
                }
            ],
            scenarios: [
                {
                    name: 'system_admin',
                    description: '系统管理员定时任务配置',
                    mockOutput: '25 3 * * 1,3,5 /usr/bin/tar -czvf backup.tar.gz /home/\\n0 2 * * * /opt/scripts/cleanup.sh\\n'
                }
            ],
            relatedCommands: ['at', 'systemctl', 'anacron']
        },

        // 新增：交互式进程监视器
        {
            id: 'htop',
            name: 'htop',
            category: 'process-management',
            description: '交互式进程查看器，比top更强大',
            usage: 'htop [参数]',
            difficulty: 2,
            isHot: true,
            icon: '📊',
            options: [
                {
                    flag: '-C',
                    description: '使用单色配色方案',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-d',
                    description: '设置更新延迟时间（单位：10微秒）',
                    type: 'number',
                    group: 'display',
                    placeholder: '延迟时间',
                    inputKey: 'delay'
                },
                {
                    flag: '-s',
                    description: '按指定列进行排序',
                    type: 'select',
                    group: 'display',
                    options: ['PID', 'PPID', 'USER', 'TIME', 'COMMAND', 'STATE'],
                    inputKey: 'sort_column'
                },
                {
                    flag: '-u',
                    description: '只显示指定用户的进程',
                    type: 'input',
                    group: 'filter',
                    placeholder: '用户名',
                    inputKey: 'username'
                },
                {
                    flag: '-p',
                    description: '只显示指定的进程ID',
                    type: 'input',
                    group: 'filter',
                    placeholder: 'PID列表',
                    inputKey: 'pid_list'
                },
                {
                    flag: '-h',
                    description: '显示帮助信息',
                    type: 'boolean',
                    group: 'help'
                },
                {
                    flag: '-v',
                    description: '显示版本信息',
                    type: 'boolean',
                    group: 'help'
                }
            ],
            examples: [
                {
                    command: 'htop',
                    description: '启动htop进程监视器',
                    scenario: 'system_admin'
                },
                {
                    command: 'htop -C',
                    description: '以单色模式启动htop',
                    scenario: 'system_admin'
                },
                {
                    command: 'htop -u root',
                    description: '只显示root用户的进程',
                    scenario: 'system_admin'
                }
            ],
            scenarios: [
                {
                    name: 'system_admin',
                    description: '系统监控和进程管理',
                    mockOutput: 'CPU使用率: 15.2% | 内存使用: 2.1GB/8GB | 负载: 0.89\\n显示进程列表：\\n  PID USER      PRI  NI  VIRT   RES   SHR S CPU%  MEM%   TIME+  Command\\n 1234 root       20   0  156M  12M  8256 S  2.0   0.2   0:15.23 systemd\\n'
                }
            ],
            relatedCommands: ['top', 'ps', 'pstree']
        },

        // 新增：系统进程监视器  
        {
            id: 'top',
            name: 'top',
            category: 'process-management',
            description: '实时显示系统运行状态和进程信息',
            usage: 'top [参数] [对象]',
            difficulty: 2,
            isHot: true,
            icon: '📈',
            options: [
                {
                    flag: '-a',
                    description: '按内存使用情况排序',
                    type: 'boolean',
                    group: 'sort'
                },
                {
                    flag: '-b',
                    description: '使用批处理模式，不进行交互式显示',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-c',
                    description: '显示完整的命令行路径',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-d',
                    description: '设置显示的更新间隔（秒）',
                    type: 'number',
                    group: 'display',
                    placeholder: '更新间隔',
                    inputKey: 'delay'
                },
                {
                    flag: '-i',
                    description: '不显示任何闲置或僵死进程',
                    type: 'boolean',
                    group: 'filter'
                },
                {
                    flag: '-n',
                    description: '设置显示的总次数，完成后自动退出',
                    type: 'number',
                    group: 'display',
                    placeholder: '显示次数',
                    inputKey: 'iterations'
                },
                {
                    flag: '-p',
                    description: '仅显示指定进程ID的进程',
                    type: 'input',
                    group: 'filter',
                    placeholder: 'PID列表',
                    inputKey: 'pid_list'
                },
                {
                    flag: '-s',
                    description: '使用安全模式，不允许交互式指令',
                    type: 'boolean',
                    group: 'security'
                },
                {
                    flag: '-u',
                    description: '仅显示指定用户的进程',
                    type: 'input',
                    group: 'filter',
                    placeholder: '用户名',
                    inputKey: 'username'
                },
                {
                    flag: '-w',
                    description: '设置显示的宽度',
                    type: 'number',
                    group: 'display',
                    placeholder: '显示宽度',
                    inputKey: 'width'
                },
                {
                    flag: '-M',
                    description: '以不同单位显示内存信息',
                    type: 'boolean',
                    group: 'display'
                },
                {
                    flag: '-h',
                    description: '显示帮助信息',
                    type: 'boolean',
                    group: 'help'
                },
                {
                    flag: '-v',
                    description: '显示版本信息',
                    type: 'boolean',
                    group: 'help'
                }
            ],
            examples: [
                {
                    command: 'top',
                    description: '以默认格式显示系统运行信息',
                    scenario: 'system_admin'
                },
                {
                    command: 'top -c',
                    description: '显示完整的进程命令行',
                    scenario: 'system_admin'
                },
                {
                    command: 'top -d 5',
                    description: '每5秒刷新一次显示',
                    scenario: 'system_admin'
                },
                {
                    command: 'top -n 3',
                    description: '只显示3次后自动退出',
                    scenario: 'system_admin'
                }
            ],
            scenarios: [
                {
                    name: 'system_admin',
                    description: '系统性能监控',
                    mockOutput: 'top - 14:25:32 up 5 days,  2:15,  2 users,  load average: 0.89, 1.02, 0.95\\nTasks: 187 total,   1 running, 186 sleeping,   0 stopped,   0 zombie\\n%Cpu(s):  5.2 us,  2.1 sy,  0.0 ni, 92.1 id,  0.6 wa,  0.0 hi,  0.0 si,  0.0 st\\nMiB Mem :   7948.2 total,   2341.8 free,   3456.1 used,   2150.3 buff/cache\\n'
                }
            ],
            relatedCommands: ['htop', 'ps', 'vmstat', 'iostat']
        },

        // 新增：文件类型识别
        {
            id: 'file',
            name: 'file',
            category: 'file-operations',
            description: '识别文件类型，也可以用来辨别内容的编码格式',
            usage: 'file [参数] 文件名',
            difficulty: 2,
            isHot: false,
            icon: '🔍',
            options: [
                {
                    flag: '-b',
                    description: '不显示文件名',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-c',
                    description: '显示执行过程',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-f',
                    description: '显示文件类型信息',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-i',
                    description: '显示MIME类别信息',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-L',
                    description: '显示符号链接所指向文件的类型',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-m',
                    description: '指定魔法数字文件',
                    type: 'input',
                    group: 'basic',
                    placeholder: '魔法数字文件路径',
                    inputKey: 'magic_file'
                },
                {
                    flag: '-v',
                    description: '显示版本信息',
                    type: 'boolean',
                    group: 'help'
                },
                {
                    flag: '-z',
                    description: '尝试去解读压缩内的文件内容',
                    type: 'boolean',
                    group: 'basic'
                }
            ],
            examples: [
                {
                    command: 'file document.txt',
                    description: '查看文件类型',
                    scenario: 'file_analysis'
                },
                {
                    command: 'file -b document.txt',
                    description: '不显示文件名查看类型',
                    scenario: 'file_analysis'
                },
                {
                    command: 'file -i document.txt',
                    description: '通过MIME来分辨文件类型',
                    scenario: 'file_analysis'
                }
            ],
            scenarios: [
                {
                    name: 'file_analysis',
                    description: '文件类型分析',
                    mockOutput: 'document.txt: ASCII text\\n'
                }
            ],
            relatedCommands: ['ls', 'stat', 'strings']
        },

        // 新增：磁盘使用情况统计
        {
            id: 'stat',
            name: 'stat',
            category: 'file-operations',
            description: '显示文件或文件系统的详细信息',
            usage: 'stat [选项] 文件...',
            difficulty: 3,
            isHot: false,
            icon: '📊',
            options: [
                {
                    flag: '-c',
                    description: '使用指定的格式输出',
                    type: 'input',
                    group: 'format',
                    placeholder: '格式字符串',
                    inputKey: 'format'
                },
                {
                    flag: '-f',
                    description: '显示文件系统状态而非文件状态',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-L',
                    description: '显示符号链接目标的信息',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-t',
                    description: '简洁模式，仅显示摘要信息',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '--help',
                    description: '显示帮助信息',
                    type: 'boolean',
                    group: 'help'
                },
                {
                    flag: '--version',
                    description: '显示版本信息',
                    type: 'boolean',
                    group: 'help'
                }
            ],
            examples: [
                {
                    command: 'stat file.txt',
                    description: '显示文件详细信息',
                    scenario: 'file_info'
                },
                {
                    command: 'stat -f /',
                    description: '显示文件系统信息',
                    scenario: 'file_info'
                }
            ],
            scenarios: [
                {
                    name: 'file_info',
                    description: '文件系统信息查看',
                    mockOutput: '  File: file.txt\\n  Size: 1024      Blocks: 8          IO Block: 4096   regular file\\nDevice: 801h/2049d      Inode: 524290      Links: 1\\n'
                }
            ],
            relatedCommands: ['ls', 'file', 'du', 'df']
        },

        // 新增：字符串提取工具
        {
            id: 'strings',
            name: 'strings',
            category: 'text-processing',
            description: '提取二进制文件中的可打印字符串',
            usage: 'strings [选项] 文件...',
            difficulty: 3,
            isHot: false,
            icon: '🔤',
            options: [
                {
                    flag: '-a',
                    description: '扫描整个文件，不只是数据部分',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-n',
                    description: '指定最小字符串长度',
                    type: 'number',
                    group: 'basic',
                    placeholder: '最小长度',
                    inputKey: 'min_length'
                },
                {
                    flag: '-t',
                    description: '指定字符编码格式',
                    type: 'select',
                    group: 'basic',
                    options: ['s', 'S', 'b', 'l', 'B', 'L'],
                    inputKey: 'encoding'
                },
                {
                    flag: '-o',
                    description: '在字符串前显示其在文件中的偏移量',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-f',
                    description: '在每个字符串前显示文件名',
                    type: 'boolean',
                    group: 'basic'
                }
            ],
            examples: [
                {
                    command: 'strings /bin/ls',
                    description: '提取二进制文件中的字符串',
                    scenario: 'binary_analysis'
                },
                {
                    command: 'strings -n 10 binary_file',
                    description: '提取长度至少为10的字符串',
                    scenario: 'binary_analysis'
                }
            ],
            scenarios: [
                {
                    name: 'binary_analysis',
                    description: '二进制文件分析',
                    mockOutput: '/lib64/ld-linux-x86-64.so.2\\nlibc.so.6\\nexit\\nfwrite\\n__printf_chk\\n'
                }
            ],
            relatedCommands: ['file', 'hexdump', 'objdump']
        },

        // 新增：删除空目录
        {
            id: 'rmdir',
            name: 'rmdir',
            category: 'file-operations',
            description: '删除空目录',
            usage: 'rmdir [选项] 目录...',
            difficulty: 1,
            isHot: false,
            icon: '🗂️',
            options: [
                {
                    flag: '-p',
                    description: '递归删除父目录（如果为空）',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-v',
                    description: '显示详细过程',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '--ignore-fail-on-non-empty',
                    description: '忽略非空目录的错误',
                    type: 'boolean',
                    group: 'advanced'
                },
                {
                    flag: '--help',
                    description: '显示帮助信息',
                    type: 'boolean',
                    group: 'help'
                },
                {
                    flag: '--version',
                    description: '显示版本信息',
                    type: 'boolean',
                    group: 'help'
                }
            ],
            examples: [
                {
                    command: 'rmdir empty_dir',
                    description: '删除空目录',
                    scenario: 'basic_usage'
                },
                {
                    command: 'rmdir -p dir1/dir2/dir3',
                    description: '递归删除空目录链',
                    scenario: 'recursive_removal'
                }
            ],
            scenarios: [
                {
                    name: 'basic_usage',
                    description: '基本删除操作',
                    mockOutput: ''
                },
                {
                    name: 'recursive_removal',
                    description: '递归删除空目录',
                    mockOutput: 'rmdir: removing directory, \'dir1/dir2/dir3\''
                }
            ],
            relatedCommands: ['rm', 'mkdir', 'ls']
        },

        // 新增：权限修改
        {
            id: 'chmod',
            name: 'chmod',
            category: 'file-operations',
            description: '修改文件或目录的权限',
            usage: 'chmod [选项] 权限 文件...',
            difficulty: 3,
            isHot: true,
            icon: '🔐',
            options: [
                {
                    flag: '-R',
                    description: '递归修改目录及其内容的权限',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-v',
                    description: '显示每个处理的文件',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-c',
                    description: '只在实际修改权限时显示',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-f',
                    description: '抑制大多数错误消息',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '--reference',
                    description: '使用参考文件的权限',
                    type: 'input',
                    group: 'advanced',
                    placeholder: '参考文件',
                    inputKey: 'reference_file'
                },
                {
                    flag: '',
                    description: '权限模式（如755, u+x等）',
                    type: 'input',
                    group: 'basic',
                    placeholder: '权限模式',
                    inputKey: 'permission_mode'
                },
                {
                    flag: '',
                    description: '目标文件或目录',
                    type: 'input',
                    group: 'basic',
                    placeholder: '文件/目录路径',
                    inputKey: 'target_path'
                }
            ],
            examples: [
                {
                    command: 'chmod 755 script.sh',
                    description: '设置文件权限为755（rwxr-xr-x）',
                    scenario: 'numeric_mode'
                },
                {
                    command: 'chmod u+x file.txt',
                    description: '给文件所有者添加执行权限',
                    scenario: 'symbolic_mode'
                },
                {
                    command: 'chmod -R 644 /path/to/dir',
                    description: '递归设置目录内所有文件权限为644',
                    scenario: 'recursive_mode'
                }
            ],
            scenarios: [
                {
                    name: 'numeric_mode',
                    description: '数字权限模式',
                    mockOutput: ''
                },
                {
                    name: 'symbolic_mode',
                    description: '符号权限模式',
                    mockOutput: ''
                },
                {
                    name: 'recursive_mode',
                    description: '递归权限修改',
                    mockOutput: ''
                }
            ],
            relatedCommands: ['chown', 'chgrp', 'ls', 'umask']
        },

        // 新增：所有者修改
        {
            id: 'chown',
            name: 'chown',
            category: 'file-operations',
            description: '修改文件或目录的所有者和所属组',
            usage: 'chown [选项] 所有者[:组] 文件...',
            difficulty: 3,
            isHot: true,
            icon: '👤',
            options: [
                {
                    flag: '-R',
                    description: '递归修改目录及其内容',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-v',
                    description: '显示每个处理的文件',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-c',
                    description: '只在实际修改时显示',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-f',
                    description: '抑制错误消息',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '--reference',
                    description: '使用参考文件的所有者',
                    type: 'input',
                    group: 'advanced',
                    placeholder: '参考文件',
                    inputKey: 'reference_file'
                },
                {
                    flag: '--from',
                    description: '只修改当前所有者匹配的文件',
                    type: 'input',
                    group: 'advanced',
                    placeholder: '当前所有者',
                    inputKey: 'from_owner'
                },
                {
                    flag: '',
                    description: '新所有者（用户:组）',
                    type: 'input',
                    group: 'basic',
                    placeholder: '用户:组',
                    inputKey: 'new_owner'
                },
                {
                    flag: '',
                    description: '目标文件或目录',
                    type: 'input',
                    group: 'basic',
                    placeholder: '文件/目录路径',
                    inputKey: 'target_path'
                }
            ],
            examples: [
                {
                    command: 'chown user:group file.txt',
                    description: '修改文件的所有者和组',
                    scenario: 'change_owner_group'
                },
                {
                    command: 'chown -R www-data:www-data /var/www',
                    description: '递归修改目录的所有者',
                    scenario: 'recursive_change'
                },
                {
                    command: 'chown :group file.txt',
                    description: '只修改文件的组',
                    scenario: 'change_group_only'
                }
            ],
            scenarios: [
                {
                    name: 'change_owner_group',
                    description: '修改所有者和组',
                    mockOutput: ''
                },
                {
                    name: 'recursive_change',
                    description: '递归修改所有权',
                    mockOutput: ''
                },
                {
                    name: 'change_group_only',
                    description: '只修改组',
                    mockOutput: ''
                }
            ],
            relatedCommands: ['chmod', 'chgrp', 'ls', 'id']
        },

        // 新增：磁盘使用量查看
        {
            id: 'du',
            name: 'du',
            category: 'system-info',
            description: '查看文件或目录的磁盘使用量',
            usage: 'du [选项] [文件...]',
            difficulty: 2,
            isHot: true,
            icon: '💾',
            options: [
                {
                    flag: '-h',
                    description: '使用易读格式显示文件大小',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-s',
                    description: '只显示总计大小',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-a',
                    description: '显示目录中所有文件大小',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-c',
                    description: '显示总计',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-d',
                    description: '指定显示深度',
                    type: 'number',
                    group: 'basic',
                    placeholder: '深度级别',
                    inputKey: 'max_depth'
                },
                {
                    flag: '-k',
                    description: '以KB为单位显示',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '-m',
                    description: '以MB为单位显示',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '-b',
                    description: '以字节为单位显示',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '--exclude',
                    description: '排除指定模式的文件',
                    type: 'input',
                    group: 'advanced',
                    placeholder: '排除模式',
                    inputKey: 'exclude_pattern'
                },
                {
                    flag: '',
                    description: '目标路径',
                    type: 'input',
                    group: 'basic',
                    placeholder: '文件/目录路径',
                    inputKey: 'target_path'
                }
            ],
            examples: [
                {
                    command: 'du -h',
                    description: '以易读格式显示当前目录大小',
                    scenario: 'human_readable'
                },
                {
                    command: 'du -sh /home',
                    description: '显示/home目录的总大小',
                    scenario: 'summary_size'
                },
                {
                    command: 'du -h --max-depth=1',
                    description: '只显示一级子目录的大小',
                    scenario: 'depth_limit'
                }
            ],
            scenarios: [
                {
                    name: 'human_readable',
                    description: '易读格式显示',
                    mockOutput: '12K\t./dir1\\n45M\t./dir2\\n2.1G\t.'
                },
                {
                    name: 'summary_size',
                    description: '总计大小',
                    mockOutput: '2.1G\t/home'
                },
                {
                    name: 'depth_limit',
                    description: '限制显示深度',
                    mockOutput: '12K\t./dir1\\n45M\t./dir2\\n128K\t./dir3'
                }
            ],
            relatedCommands: ['df', 'ls', 'find', 'ncdu']
        },

        // 新增：磁盘空间查看
        {
            id: 'df',
            name: 'df',
            category: 'system-info',
            description: '显示磁盘空间使用情况',
            usage: 'df [选项] [文件系统...]',
            difficulty: 2,
            isHot: true,
            icon: '💿',
            options: [
                {
                    flag: '-h',
                    description: '以易读的方式显示',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-a',
                    description: '显示所有文件系统',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-T',
                    description: '显示文件系统的类型',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-i',
                    description: '显示索引字节信息',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-l',
                    description: '只显示本地文件系统',
                    type: 'boolean',
                    group: 'basic'
                },
                {
                    flag: '-t',
                    description: '只显示指定类型文件系统',
                    type: 'input',
                    group: 'filter',
                    placeholder: '文件系统类型',
                    inputKey: 'fs_type'
                },
                {
                    flag: '-x',
                    description: '排除指定类型文件系统',
                    type: 'input',
                    group: 'filter',
                    placeholder: '排除的类型',
                    inputKey: 'exclude_type'
                },
                {
                    flag: '-H',
                    description: '以1KB=1000B为换算单位',
                    type: 'boolean',
                    group: 'format'
                },
                {
                    flag: '--sync',
                    description: '获取使用信息前先执行sync',
                    type: 'boolean',
                    group: 'advanced'
                }
            ],
            examples: [
                {
                    command: 'df -h',
                    description: '以易读格式显示磁盘使用情况',
                    scenario: 'human_readable'
                },
                {
                    command: 'df -T',
                    description: '显示文件系统类型',
                    scenario: 'show_type'
                },
                {
                    command: 'df -t ext4',
                    description: '只显示ext4文件系统',
                    scenario: 'filter_type'
                }
            ],
            scenarios: [
                {
                    name: 'human_readable',
                    description: '易读格式',
                    mockOutput: 'Filesystem      Size  Used Avail Use% Mounted on\\n/dev/sda1        20G  5.5G   13G  30% /\\n/dev/sda2       100G   45G   50G  48% /home'
                },
                {
                    name: 'show_type',
                    description: '显示文件系统类型',
                    mockOutput: 'Filesystem     Type     1K-blocks    Used Available Use% Mounted on\\n/dev/sda1      ext4      20971520 5767168  14680064  29% /'
                },
                {
                    name: 'filter_type',
                    description: '按类型过滤',
                    mockOutput: 'Filesystem     1K-blocks    Used Available Use% Mounted on\\n/dev/sda1      20971520 5767168  14680064  29% /'
                }
            ],
            relatedCommands: ['du', 'mount', 'lsblk', 'fdisk']
        }
    ])

    // 过滤后的命令列表
    const filteredCommands = computed(() => {
        return commands.value
    })

    // 根据分类过滤命令
    const getCommandsByCategory = (categoryId) => {
        if (categoryId === 'all') {
            return commands.value
        }
        return commands.value.filter(cmd => cmd.category === categoryId)
    }

    // 生成命令字符串
    const generateCommand = () => {
        if (!selectedCommand.value) return ''

        let parts = [selectedCommand.value.name]

        // 特殊处理grep命令的参数顺序
        if (selectedCommand.value.name === 'grep') {
            // 添加布尔参数
            selectedParameters.value.forEach(param => {
                if (param.type === 'boolean') {
                    parts.push(param.flag)
                }
            })

            // 添加搜索模式（必须参数）
            if (userInputs.value.search_pattern) {
                parts.push(`"${userInputs.value.search_pattern}"`)
            }

            // 添加目标文件
            if (userInputs.value.target_files) {
                parts.push(userInputs.value.target_files)
            }

            return parts.join(' ')
        }

        // 特殊处理iptables命令的参数顺序
        if (selectedCommand.value.name === 'iptables') {
            // 首先处理表选择参数
            if (userInputs.value.table && userInputs.value.table !== 'filter') {
                parts.push('-t', userInputs.value.table)
            }

            // 按照iptables的标准参数顺序添加主要操作参数
            const mainActions = ['-A', '-I', '-D', '-R', '-L', '-F', '-Z', '-N', '-X', '-P', '-E']

            mainActions.forEach(action => {
                const param = selectedParameters.value.find(p => p.flag === action)
                if (param) {
                    parts.push(action)

                    // 为需要链名的操作添加链名
                    if (action === '-A' && userInputs.value.append_chain) {
                        parts.push(userInputs.value.append_chain)
                    } else if (action === '-I' && userInputs.value.insert_chain) {
                        parts.push(userInputs.value.insert_chain)
                    } else if (action === '-D' && userInputs.value.delete_chain) {
                        parts.push(userInputs.value.delete_chain)
                    } else if (action === '-F' && userInputs.value.flush_chain) {
                        parts.push(userInputs.value.flush_chain)
                    } else if (action === '-N' && userInputs.value.new_chain) {
                        parts.push(userInputs.value.new_chain)
                    } else if (action === '-X' && userInputs.value.delete_user_chain) {
                        parts.push(userInputs.value.delete_user_chain)
                    }
                }
            })

            // 添加匹配条件参数
            const matchParams = [
                { flag: '-s', input: 'source_ip' },
                { flag: '-d', input: 'dest_ip' },
                { flag: '-p', input: 'protocol' },
                { flag: '-i', input: 'input_interface' },
                { flag: '-o', input: 'output_interface' },
                { flag: '--sport', input: 'source_port' },
                { flag: '--dport', input: 'dest_port' },
                { flag: '-m', input: 'match_module' },
                { flag: '--state', input: 'connection_state' }
            ]

            matchParams.forEach(({ flag, input }) => {
                if (userInputs.value[input]) {
                    parts.push(flag, userInputs.value[input])
                }
            })

            // 添加动作参数
            if (userInputs.value.jump_target) {
                parts.push('-j', userInputs.value.jump_target)
            }

            // 添加其他布尔参数
            selectedParameters.value.forEach(param => {
                if (param.type === 'boolean' && !mainActions.includes(param.flag)) {
                    parts.push(param.flag)
                }
            })

            return parts.join(' ')
        }

        // 其他命令的通用处理
        // 添加布尔参数
        selectedParameters.value.forEach(param => {
            if (param.type === 'boolean') {
                parts.push(param.flag)
            } else if (param.type === 'select' && userInputs.value[param.inputKey]) {
                parts.push(`${param.flag} ${userInputs.value[param.inputKey]}`)
            } else if (param.type === 'number' && userInputs.value[param.inputKey]) {
                parts.push(`${param.flag} ${userInputs.value[param.inputKey]}`)
            }
        })

        // 添加用户输入的参数
        Object.entries(userInputs.value).forEach(([key, value]) => {
            if (value && value.trim()) {
                const option = selectedCommand.value.options.find(opt => opt.inputKey === key)
                if (option && option.type === 'input' && !option.flag) {
                    // 这是位置参数（没有flag的输入）
                    parts.push(`"${value}"`)
                } else if (option && option.flag && option.type === 'input') {
                    // 这是带flag的输入参数
                    parts.push(`${option.flag} "${value}"`)
                }
            }
        })

        return parts.join(' ')
    }

    // 获取命令输出
    const getCommandOutput = () => {
        const filesystem = useFilesystemStore()

        if (!selectedCommand.value) return ''

        const commandName = selectedCommand.value.name
        const params = selectedParameters.value.map(p => p.flag).filter(Boolean)

        // 根据命令类型生成输出
        switch (commandName) {
            case 'ls':
                const path = userInputs.value.target_path || filesystem.currentFilesystem?.currentPath || '/home/user'
                return filesystem.generateLsOutput(path, params)

            case 'find':
                const searchPath = userInputs.value.search_path || '/home/user'
                const findParams = []
                if (userInputs.value.name_pattern) {
                    findParams.push(`-name ${userInputs.value.name_pattern}`)
                }
                if (userInputs.value.iname_pattern) {
                    findParams.push(`-iname ${userInputs.value.iname_pattern}`)
                }
                if (userInputs.value.file_type) {
                    findParams.push(`-type ${userInputs.value.file_type}`)
                }
                if (userInputs.value.file_size) {
                    findParams.push(`-size ${userInputs.value.file_size}`)
                }
                if (userInputs.value.mtime_days) {
                    findParams.push(`-mtime ${userInputs.value.mtime_days}`)
                }
                if (userInputs.value.atime_days) {
                    findParams.push(`-atime ${userInputs.value.atime_days}`)
                }
                if (userInputs.value.owner_user) {
                    findParams.push(`-user ${userInputs.value.owner_user}`)
                }
                if (userInputs.value.file_permissions) {
                    findParams.push(`-perm ${userInputs.value.file_permissions}`)
                }
                if (userInputs.value.empty) {
                    findParams.push('-empty')
                }
                if (userInputs.value.max_depth) {
                    findParams.push(`-maxdepth ${userInputs.value.max_depth}`)
                }
                if (userInputs.value.min_depth) {
                    findParams.push(`-mindepth ${userInputs.value.min_depth}`)
                }
                if (userInputs.value.exec_command) {
                    findParams.push(`-exec ${userInputs.value.exec_command}`)
                }
                return filesystem.generateFindOutput(searchPath, findParams)

            case 'cat':
                const filePath = userInputs.value.file_path
                if (!filePath) return 'cat: 请指定文件路径'
                return filesystem.generateCatOutput(filePath)

            case 'cd':
                const targetDir = userInputs.value.target_directory
                if (!targetDir) return 'cd: 请指定目标目录'
                filesystem.setCurrentPath(targetDir)
                return `已切换到目录: ${targetDir}`

            case 'pwd':
                return filesystem.currentFilesystem?.currentPath || '/home/user'

            case 'ping':
                const targetHost = userInputs.value.target_host || 'example.com'
                const count = userInputs.value.packet_count || 4
                return generatePingOutput(targetHost, count)

            case 'ps':
                return generatePsOutput(params)

            case 'top':
                return generateTopOutput()

            case 'grep':
                const searchPattern = userInputs.value.search_pattern
                const targetFile = userInputs.value.target_files || '/var/log/syslog'
                return generateGrepOutput(searchPattern, targetFile, params)

            case 'iptables':
                return generateIptablesOutput(params, userInputs.value)

            default:
                return `命令 ${commandName} 的模拟输出暂未实现`
        }
    }

    // 生成ping命令模拟输出
    const generatePingOutput = (host, count) => {
        const outputs = []
        outputs.push(`PING ${host} (192.168.1.100) 56(84) bytes of data.`)

        for (let i = 1; i <= count; i++) {
            const time = (Math.random() * 50 + 10).toFixed(1)
            outputs.push(`64 bytes from ${host} (192.168.1.100): icmp_seq=${i} ttl=64 time=${time} ms`)
        }

        outputs.push('')
        outputs.push(`--- ${host} ping statistics ---`)
        outputs.push(`${count} packets transmitted, ${count} received, 0% packet loss, time ${count * 1000}ms`)
        outputs.push(`rtt min/avg/max/mdev = 10.5/25.3/45.8/12.2 ms`)

        return outputs.join('\n')
    }

    // 生成ps命令模拟输出
    const generatePsOutput = (params) => {
        if (params.includes('aux') || params.includes('-ef')) {
            return `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 168576 11284 ?        Ss   08:00   0:01 /sbin/init
root         2  0.0  0.0      0     0 ?        S    08:00   0:00 [kthreadd]
root         3  0.0  0.0      0     0 ?        I<   08:00   0:00 [rcu_gp]
user      1234  0.5  2.1 245612 43256 pts/0    Sl+  08:15   0:05 /usr/bin/python3 script.py
user      5678  0.2  1.8 187432 36864 ?        S    08:20   0:02 /usr/bin/node server.js`
        }
        return `  PID TTY          TIME CMD
 1234 pts/0    00:00:05 python3
 5678 pts/0    00:00:02 node
 9876 pts/0    00:00:00 ps`
    }

    // 生成top命令模拟输出
    const generateTopOutput = () => {
        return `top - 08:30:15 up 2:30, 1 user, load average: 0.15, 0.25, 0.30
Tasks: 156 total,   1 running, 155 sleeping,   0 stopped,   0 zombie
%Cpu(s):  5.2 us,  2.1 sy,  0.0 ni, 92.5 id,  0.2 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem :  4048576 total,  1245632 free,  1876544 used,   926400 buff/cache
KiB Swap:  2097148 total,  2097148 free,        0 used.  1654784 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 1234 user      20   0  245612  43256  15432 S   2.5  1.1   0:05.23 python3
 5678 user      20   0  187432  36864  12856 S   1.8  0.9   0:02.45 node
    1 root      20   0  168576  11284   8576 S   0.0  0.3   0:01.12 systemd`
    }

    // 生成grep命令模拟输出
    const generateGrepOutput = (pattern, file, params) => {
        if (!pattern) {
            return 'grep: 请指定搜索模式'
        }

        // 模拟不同文件的内容
        const mockFileContents = {
            '/var/log/syslog': [
                'Jan 10 08:15:23 server systemd[1]: Started Network Manager Script Dispatcher Service.',
                'Jan 10 08:15:24 server NetworkManager[1234]: <info>  [1673337324.5678] device (eth0): state change: activated -> failed (reason: carrier lost)',
                'Jan 10 08:15:25 server kernel: [12345.678901] usb 1-1: USB disconnect, address 1',
                'Jan 10 08:15:26 server systemd[1]: Failed to start Apache HTTP Server.',
                'Jan 10 08:15:27 server apache2[5678]: [error] [client 192.168.1.100] File does not exist: /var/www/html/missing.php',
                'Jan 10 08:15:28 server mysql[9012]: [Warning] Using a password on the command line interface can be insecure.',
                'Jan 10 08:15:29 server systemd[1]: Unit apache2.service entered failed state.',
                'Jan 10 08:15:30 server kernel: [12346.789012] Out of memory: Kill process 3456 (chrome) score 123'
            ],
            '/var/log/auth.log': [
                'Jan 10 08:10:01 server sshd[1234]: Failed password for invalid user admin from 192.168.1.200 port 22 ssh2',
                'Jan 10 08:10:05 server sshd[1234]: Failed password for root from 192.168.1.201 port 22 ssh2',
                'Jan 10 08:12:15 server sudo: user : TTY=pts/0 ; PWD=/home/user ; USER=root ; COMMAND=/bin/ls',
                'Jan 10 08:15:20 server sshd[5678]: Accepted publickey for user from 192.168.1.100 port 22 ssh2'
            ],
            '/var/log/error.log': [
                '[Tue Jan 10 08:15:00 2024] [error] [client 192.168.1.100] File does not exist: /var/www/html/favicon.ico',
                '[Tue Jan 10 08:15:01 2024] [warn] [client 192.168.1.101] mod_fcgid: stderr: PHP Parse error: syntax error',
                '[Tue Jan 10 08:15:02 2024] [error] [client 192.168.1.102] PHP Fatal error: Call to undefined function mysql_connect()',
                '[Tue Jan 10 08:15:03 2024] [error] [client 192.168.1.103] Failed to connect to database: Connection refused'
            ]
        }

        const content = mockFileContents[file] || [
            `Line 1: This is a sample file for grep testing`,
            `Line 2: The pattern "${pattern}" might be here`,
            `Line 3: Some other content with different patterns`,
            `Line 4: ${pattern} found in this line`,
            `Line 5: End of sample file content`
        ]

        const hasIgnoreCase = params.includes('-i')
        const hasLineNumbers = params.includes('-n')
        const hasInvertMatch = params.includes('-v')
        const hasCountOnly = params.includes('-c')
        const hasFilenameOnly = params.includes('-l')
        const hasWholeWord = params.includes('-w')

        let matchingLines = []
        let lineNumber = 1

        content.forEach(line => {
            let matches = false

            if (hasWholeWord) {
                // 精确匹配整词
                const regex = new RegExp(`\\b${pattern}\\b`, hasIgnoreCase ? 'i' : '')
                matches = regex.test(line)
            } else {
                // 普通搜索
                if (hasIgnoreCase) {
                    matches = line.toLowerCase().includes(pattern.toLowerCase())
                } else {
                    matches = line.includes(pattern)
                }
            }

            if (hasInvertMatch) {
                matches = !matches
            }

            if (matches) {
                let output = ''

                if (hasLineNumbers) {
                    output = `${lineNumber}:${line}`
                } else {
                    output = line
                }

                matchingLines.push(output)
            }

            lineNumber++
        })

        if (hasCountOnly) {
            return `${matchingLines.length}`
        }

        if (hasFilenameOnly && matchingLines.length > 0) {
            return file
        }

        if (matchingLines.length === 0) {
            return `grep: 在文件 '${file}' 中未找到匹配 '${pattern}' 的内容`
        }

        return matchingLines.join('\n')
    }

    // 生成iptables命令模拟输出
    const generateIptablesOutput = (params, inputs) => {
        // 检查是否有-L参数（显示规则）
        if (params.includes('-L')) {
            const table = inputs.table || 'filter'

            if (table === 'nat') {
                return `Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination         

Chain INPUT (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination         

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination`
            } else if (table === 'mangle') {
                return `Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination         

Chain INPUT (policy ACCEPT)
target     prot opt source               destination         

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination         

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination`
            } else {
                // filter表（默认）
                let output = `Chain INPUT (policy ACCEPT)
target     prot opt source               destination         `

                // 添加一些模拟规则
                if (params.includes('-v')) {
                    output += `
    0     0 ACCEPT     all  --  lo     any     anywhere             anywhere            
   12   864 ACCEPT     tcp  --  any    any     anywhere             anywhere             tcp dpt:ssh
    0     0 DROP       all  --  any    any     192.168.10.10        anywhere            `
                }

                output += `

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination`

                return output
            }
        }

        // 检查是否是添加规则的操作
        if (params.includes('-A') || params.includes('-I')) {
            const action = params.includes('-A') ? '追加' : '插入'
            const chain = inputs.append_chain || inputs.insert_chain || 'INPUT'

            let ruleDescription = `规则已${action}到${chain}链: `

            if (inputs.source_ip) {
                ruleDescription += `源IP=${inputs.source_ip} `
            }
            if (inputs.dest_ip) {
                ruleDescription += `目标IP=${inputs.dest_ip} `
            }
            if (inputs.protocol) {
                ruleDescription += `协议=${inputs.protocol} `
            }
            if (inputs.source_port) {
                ruleDescription += `源端口=${inputs.source_port} `
            }
            if (inputs.dest_port) {
                ruleDescription += `目标端口=${inputs.dest_port} `
            }
            if (inputs.input_interface) {
                ruleDescription += `入接口=${inputs.input_interface} `
            }
            if (inputs.output_interface) {
                ruleDescription += `出接口=${inputs.output_interface} `
            }
            if (inputs.jump_target) {
                ruleDescription += `动作=${inputs.jump_target}`
            }

            return ruleDescription
        }

        // 检查是否是删除规则的操作
        if (params.includes('-D')) {
            const chain = inputs.delete_chain || 'INPUT'
            return `规则已从${chain}链中删除`
        }

        // 检查是否是清空规则的操作
        if (params.includes('-F')) {
            const chain = inputs.flush_chain || '所有链'
            return `${chain}中的规则已清空`
        }

        // 检查是否是创建新链的操作
        if (params.includes('-N')) {
            const newChain = inputs.new_chain || 'NEWCHAIN'
            return `用户自定义链 ${newChain} 已创建`
        }

        // 检查是否是删除用户链的操作
        if (params.includes('-X')) {
            const delChain = inputs.delete_user_chain || 'USERCHAIN'
            return `用户自定义链 ${delChain} 已删除`
        }

        // 检查是否是设置默认策略的操作
        if (params.includes('-P')) {
            const policy = inputs.policy || 'ACCEPT'
            return `默认策略已设置为 ${policy}`
        }

        // 检查是否是清空计数器的操作
        if (params.includes('-Z')) {
            return '包计数器和字节计数器已清空'
        }

        // 检查是否是显示帮助
        if (params.includes('-h')) {
            return `iptables v1.8.7

用法: iptables -[ACD] chain rule-specification [options]
      iptables -I chain [rulenum] rule-specification [options]
      iptables -R chain rulenum rule-specification [options]
      iptables -D chain rulenum [options]
      iptables -[LS] [chain [rulenum]] [options]
      iptables -[FZ] [chain] [options]
      iptables -[NX] chain
      iptables -E old-chain-name new-chain-name
      iptables -P chain target [options]
      iptables -h (print this help information)

命令:
  --append  -A chain        追加规则到链末尾
  --check   -C chain        检查规则是否存在
  --delete  -D chain        删除匹配的规则
  --insert  -I chain [pos]  在指定位置插入规则
  --replace -R chain pos    替换指定位置的规则
  --list    -L [chain]      列出规则
  --flush   -F [chain]      清空规则
  --zero    -Z [chain]      清零计数器`
        }

        // 默认情况
        return 'iptables: 请指定有效的操作参数。使用 -h 查看帮助信息。'
    }

    // 操作方法
    const selectCommand = (command) => {
        selectedCommand.value = command
        selectedParameters.value = []
        userInputs.value = {}
    }

    const toggleParameter = (parameter) => {
        const index = selectedParameters.value.findIndex(p => p.flag === parameter.flag)
        if (index >= 0) {
            selectedParameters.value.splice(index, 1)
        } else {
            selectedParameters.value.push(parameter)
        }
    }

    const updateUserInput = (inputKey, value) => {
        userInputs.value[inputKey] = value
    }

    const clearParameters = () => {
        selectedParameters.value = []
        userInputs.value = {}
    }

    const setCommandOutput = (output) => {
        commandOutput.value = output
    }

    return {
        selectedCommand,
        selectedParameters,
        userInputs,
        commandOutput,
        categories,
        commands,
        filteredCommands,
        getCommandsByCategory,
        generateCommand,
        getCommandOutput,
        selectCommand,
        toggleParameter,
        updateUserInput,
        clearParameters,
        setCommandOutput
    }
})