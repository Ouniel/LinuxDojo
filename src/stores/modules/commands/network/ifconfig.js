/**
 * ifconfig - 配置网络接口
 */

export const ifconfig = {
    name: 'ifconfig',
    description: 'Configure a network interface|配置网络接口',

    handler: (args, context) => {
        if (args.includes('--help') || args.includes('-h')) {
            return ifconfig.help
        }

        const interfaceName = args.find(a => !a.startsWith('-'))

        let output = []

        const interfaces = [
            {
                name: 'eth0',
                flags: 'UP,BROADCAST,RUNNING,MULTICAST',
                mtu: 1500,
                inet: '192.168.1.5',
                netmask: '255.255.255.0',
                broadcast: '192.168.1.255',
                inet6: 'fe80::a00:27ff:fe4e:66a1',
                ether: '08:00:27:4e:66:a1',
                rx: 'packets 12345 bytes 12345678 (12.3 MB)',
                tx: 'packets 5432 bytes 543210 (543.2 KB)'
            },
            {
                name: 'lo',
                flags: 'UP,LOOPBACK,RUNNING',
                mtu: 65536,
                inet: '127.0.0.1',
                netmask: '255.0.0.0',
                inet6: '::1',
                loop: 'txqueuelen 1000',
                rx: 'packets 100 bytes 8000 (8.0 KB)',
                tx: 'packets 100 bytes 8000 (8.0 KB)'
            }
        ]

        const targetInterfaces = interfaceName
            ? interfaces.filter(i => i.name === interfaceName)
            : interfaces

        if (targetInterfaces.length === 0 && interfaceName) {
            return `ifconfig: ${interfaceName}: error fetching interface information: Device not found`
        }

        targetInterfaces.forEach(iface => {
            output.push(`${iface.name}: flags=4163<${iface.flags}>  mtu ${iface.mtu}`)
            output.push(`        inet ${iface.inet}  netmask ${iface.netmask}  ${iface.broadcast ? 'broadcast ' + iface.broadcast : ''}`)
            if (iface.inet6) output.push(`        inet6 ${iface.inet6}  prefixlen 64  scopeid 0x20<link>`)
            if (iface.ether) output.push(`        ether ${iface.ether}  txqueuelen 1000  (Ethernet)`)
            if (iface.loop) output.push(`        loop  ${iface.loop}  (Local Loopback)`)
            output.push(`        RX packets ${iface.rx.split(' ')[1]}  bytes ${iface.rx.split(' ')[3]} (${iface.rx.split('(')[1]}`)
            output.push(`        RX errors 0  dropped 0  overruns 0  frame 0`)
            output.push(`        TX packets ${iface.tx.split(' ')[1]}  bytes ${iface.tx.split(' ')[3]} (${iface.tx.split('(')[1]}`)
            output.push(`        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0`)
            output.push('')
        })

        return output.join('\n')
    },

    options: [
        {
            name: 'interface',
            type: 'input',
            description: 'Interface name',
            placeholder: 'eth0',
            inputKey: 'interface'
        },
        {
            name: '-a',
            flag: '-a',
            type: 'boolean',
            description: 'Display all interfaces'
        },
        {
            name: '-s',
            flag: '-s',
            type: 'boolean',
            description: 'Display short list'
        },
        {
            name: '-v',
            flag: '-v',
            type: 'boolean',
            description: 'Verbose'
        }
    ],
    help: `Usage:
  ifconfig [-a] [-v] [-s] <interface> [[<AF>] <address>]
  [add <address>[/<prefixlen>]]
  [del <address>[/<prefixlen>]]
  [[-]broadcast [<address>]]  [[-]pointopoint [<address>]]
  [netmask <address>]  [dstaddr <address>]  [tunnel <address>]
  [outfill <NN>] [keepalive <NN>]
  [hw <type> <address>]  [mtu <NN>]
  [[-]trailers]  [[-]arp]  [[-]allmulti]
  [multicast]  [[-]promisc]
  [mem_start <NN>]  [io_addr <NN>]  [irq <NN>]  [media <type>]
  [txqueuelen <NN>]
  [[-]dynamic]
  [up|down] ...`
}
