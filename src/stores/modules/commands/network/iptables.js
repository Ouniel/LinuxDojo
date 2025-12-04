/**
 * iptables - IPv4 数据包过滤和 NAT 管理工具
 */

// 模拟的防火墙规则状态
let chains = {
    FILTER: {
        INPUT: { policy: 'ACCEPT', rules: [] },
        FORWARD: { policy: 'ACCEPT', rules: [] },
        OUTPUT: { policy: 'ACCEPT', rules: [] }
    },
    NAT: {
        PREROUTING: { policy: 'ACCEPT', rules: [] },
        POSTROUTING: { policy: 'ACCEPT', rules: [] },
        OUTPUT: { policy: 'ACCEPT', rules: [] }
    }
}

export const iptables = {
    name: 'iptables',
    description: 'Administration tool for IPv4 packet filtering and NAT|IPv4 数据包过滤和 NAT 管理工具',

    handler: (args, context) => {
        // 处理帮助
        if (args.includes('--help') || args.includes('-h')) {
            return iptables.help
        }

        // 简单的参数解析
        const table = args.includes('-t') ? args[args.indexOf('-t') + 1] : 'filter'
        const isList = args.includes('-L') || args.includes('--list')
        const isFlush = args.includes('-F') || args.includes('--flush')
        const isAppend = args.includes('-A') || args.includes('--append')
        const isDelete = args.includes('-D') || args.includes('--delete')
        const isPolicy = args.includes('-P') || args.includes('--policy')

        const chainName = (args.find(arg => ['INPUT', 'OUTPUT', 'FORWARD', 'PREROUTING', 'POSTROUTING'].includes(arg)) || 'INPUT').toUpperCase()

        // 模拟输出
        if (isList) {
            let output = []
            const currentTable = table === 'nat' ? chains.NAT : chains.FILTER

            // 如果指定了链，只显示该链，否则显示所有
            const chainsToShow = args.some(a => ['INPUT', 'OUTPUT', 'FORWARD', 'PREROUTING', 'POSTROUTING'].includes(a))
                ? [chainName]
                : Object.keys(currentTable)

            chainsToShow.forEach(chain => {
                const data = currentTable[chain]
                if (!data) return

                output.push(`Chain ${chain} (policy ${data.policy})`)
                output.push('target     prot opt source               destination')

                if (data.rules.length === 0) {
                    // output.push('') // 空行
                } else {
                    data.rules.forEach(rule => {
                        output.push(rule)
                    })
                }
                output.push('')
            })

            return output.join('\n')
        }

        if (isFlush) {
            const currentTable = table === 'nat' ? chains.NAT : chains.FILTER
            if (args.some(a => ['INPUT', 'OUTPUT', 'FORWARD', 'PREROUTING', 'POSTROUTING'].includes(a))) {
                if (currentTable[chainName]) currentTable[chainName].rules = []
            } else {
                Object.keys(currentTable).forEach(c => currentTable[c].rules = [])
            }
            return ''
        }

        if (isPolicy) {
            const policyIndex = args.indexOf('-P') !== -1 ? args.indexOf('-P') : args.indexOf('--policy')
            if (policyIndex !== -1 && policyIndex + 2 < args.length) {
                const target = args[policyIndex + 2]
                const currentTable = table === 'nat' ? chains.NAT : chains.FILTER
                if (currentTable[chainName]) {
                    currentTable[chainName].policy = target
                }
            }
            return ''
        }

        if (isAppend) {
            // 简单模拟添加规则
            const currentTable = table === 'nat' ? chains.NAT : chains.FILTER
            if (currentTable[chainName]) {
                // 构建一个简单的规则字符串展示
                const proto = args.includes('-p') ? args[args.indexOf('-p') + 1] : 'all'
                const src = args.includes('-s') ? args[args.indexOf('-s') + 1] : 'anywhere'
                const dst = args.includes('-d') ? args[args.indexOf('-d') + 1] : 'anywhere'
                const jump = args.includes('-j') ? args[args.indexOf('-j') + 1] : ''

                const ruleStr = `${jump.padEnd(10)} ${proto.padEnd(4)} --  ${src.padEnd(20)} ${dst}`
                currentTable[chainName].rules.push(ruleStr)
            }
            return ''
        }

        if (isDelete) {
            const currentTable = table === 'nat' ? chains.NAT : chains.FILTER
            if (currentTable[chainName] && currentTable[chainName].rules.length > 0) {
                currentTable[chainName].rules.pop() // 简单模拟：删除最后一条
            }
            return ''
        }

        return ''
    },
    options: [
        {
            name: 'commands',
            type: 'group',
            description: 'Commands',
            options: [
                {
                    name: '-A, --append',
                    flag: '-A',
                    type: 'input',
                    description: 'Append to chain',
                    placeholder: 'CHAIN'
                },
                {
                    name: '-D, --delete',
                    flag: '-D',
                    type: 'input',
                    description: 'Delete from chain',
                    placeholder: 'CHAIN'
                },
                {
                    name: '-L, --list',
                    flag: '-L',
                    type: 'input',
                    description: 'List rules',
                    placeholder: '[CHAIN]'
                },
                {
                    name: '-F, --flush',
                    flag: '-F',
                    type: 'input',
                    description: 'Delete all rules',
                    placeholder: '[CHAIN]'
                },
                {
                    name: '-P, --policy',
                    flag: '-P',
                    type: 'input',
                    description: 'Set policy for chain',
                    placeholder: 'CHAIN TARGET'
                }
            ]
        },
        {
            name: 'parameters',
            type: 'group',
            description: 'Parameters',
            options: [
                {
                    name: '-p, --protocol',
                    flag: '-p',
                    type: 'input',
                    description: 'Protocol (tcp, udp, icmp, all)',
                    placeholder: 'protocol'
                },
                {
                    name: '-s, --source',
                    flag: '-s',
                    type: 'input',
                    description: 'Source address',
                    placeholder: 'address[/mask]'
                },
                {
                    name: '-d, --destination',
                    flag: '-d',
                    type: 'input',
                    description: 'Destination address',
                    placeholder: 'address[/mask]'
                },
                {
                    name: '-j, --jump',
                    flag: '-j',
                    type: 'input',
                    description: 'Target to jump to',
                    placeholder: 'TARGET'
                },
                {
                    name: '--dport',
                    flag: '--dport',
                    type: 'input',
                    description: 'Destination port',
                    placeholder: 'port'
                },
                {
                    name: '--sport',
                    flag: '--sport',
                    type: 'input',
                    description: 'Source port',
                    placeholder: 'port'
                }
            ]
        },
        {
            name: 'tables',
            type: 'group',
            description: 'Tables',
            options: [
                {
                    name: '-t, --table',
                    flag: '-t',
                    type: 'select',
                    options: ['filter', 'nat', 'mangle', 'raw'],
                    description: 'Table to manipulate',
                    default: 'filter'
                }
            ]
        }
    ],
    help: `iptables v1.8.7

Usage: iptables -[ACD] chain rule-specification [options]
       iptables -I chain [rulenum] rule-specification [options]
       iptables -R chain rulenum rule-specification [options]
       iptables -D chain rulenum [options]
       iptables -[LS] [chain [rulenum]] [options]
       iptables -[FZ] [chain] [options]
       iptables -[NX] chain
       iptables -E old-chain-name new-chain-name
       iptables -P chain target [options]
       iptables -h (print this help information)

Commands:
Either long or short options are allowed.
  --append  -A chain		Append to chain
  --check   -C chain		Check for the existence of a rule
  --delete  -D chain		Delete matching rule from chain
  --delete  -D chain rulenum
				Delete rule rulenum (1 = first) from chain
  --insert  -I chain [rulenum]
				Insert in chain as rulenum (default 1=first)
  --replace -R chain rulenum
				Replace rule rulenum (1 = first) in chain
  --list    -L [chain [rulenum]]
				List the rules in a chain or all chains
  --list-rules -S [chain [rulenum]]
				Print the rules in a chain or all chains
  --flush   -F [chain]		Delete all rules in  chain or all chains
  --zero    -Z [chain [rulenum]]
				Zero counters in chain or all chains
  --new     -N chain		Create a new user-defined chain
  --delete-chain
            -X [chain]		Delete a user-defined chain
  --policy  -P chain target
				Change policy on chain to target
  --rename-chain
            -E old-chain new-chain
				Change chain name, (moving any references)
Options:
    --ipv4	-4		Nothing (line is ignored by ip6tables-restore)
    --ipv6	-6		Error (line is ignored by iptables-restore)
[!] --protocol	-p proto	protocol: by number or name, eg. 'tcp'
[!] --source	-s address[/mask][...]
				source specification
[!] --destination -d address[/mask][...]
				destination specification
[!] --in-interface -i input name[+]
				network interface name ([+] for wildcard)
    --jump	-j target
				target for rule (may load target extension)
  --goto      -g chain
                              jump to chain with no return
  --match	-m match
				extended match (may load extension)
  --numeric	-n		numeric output of addresses and ports
[!] --out-interface -o output name[+]
				network interface name ([+] for wildcard)
  --table	-t table	table to manipulate (default: 'filter')
  --verbose	-v		verbose mode
  --wait	-w [seconds]	maximum wait to acquire xtables lock
  --line-numbers		print line numbers when listing
  --exact	-x		expand numbers (display exact values)
[!] --fragment	-f		match second or further fragments only
  --modprobe=<command>		try to insert modules using this command
  --set-counters PKTS BYTES	set the counter during insert/append
[!] --version	-V		print package version.`
}
