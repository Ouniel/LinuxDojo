/**
 * ip - 显示/操作路由、网络设备、接口和隧道
 */

export const ip = {
    name: 'ip',
    description: 'Show / manipulate routing, devices, policy routing and tunnels|显示/操作路由、网络设备、接口和隧道',

    handler: (args, context) => {
        if (args.length === 0 || args.includes('help') || args.includes('-h')) {
            return ip.help
        }

        const object = args[0]
        const command = args[1] || 'show'
        let output = []

        if (object === 'addr' || object === 'a' || object === 'address') {
            output.push('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000')
            output.push('    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00')
            output.push('    inet 127.0.0.1/8 scope host lo')
            output.push('       valid_lft forever preferred_lft forever')
            output.push('    inet6 ::1/128 scope host')
            output.push('       valid_lft forever preferred_lft forever')
            output.push('2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000')
            output.push('    link/ether 08:00:27:4e:66:a1 brd ff:ff:ff:ff:ff:ff')
            output.push('    inet 192.168.1.5/24 brd 192.168.1.255 scope global dynamic eth0')
            output.push('       valid_lft 86353sec preferred_lft 86353sec')
            output.push('    inet6 fe80::a00:27ff:fe4e:66a1/64 scope link')
            output.push('       valid_lft forever preferred_lft forever')
        } else if (object === 'link' || object === 'l') {
            output.push('1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000')
            output.push('    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00')
            output.push('2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000')
            output.push('    link/ether 08:00:27:4e:66:a1 brd ff:ff:ff:ff:ff:ff')
        } else if (object === 'route' || object === 'r') {
            output.push('default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.5 metric 100')
            output.push('192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.5')
            output.push('192.168.1.1 dev eth0 proto dhcp scope link src 192.168.1.5 metric 100')
        } else if (object === 'neigh' || object === 'n') {
            output.push('192.168.1.1 dev eth0 lladdr 50:ff:20:04:12:34 STALE')
        } else {
            output.push(`Object "${object}" is unknown, try "ip help".`)
        }

        return output.join('\n')
    },

    options: [
        {
            name: 'object',
            type: 'select',
            description: 'Object',
            options: ['address', 'link', 'route', 'neigh', 'rule', 'tunnel'],
            default: 'address',
            inputKey: 'object'
        },
        {
            name: 'command',
            type: 'select',
            description: 'Command',
            options: ['show', 'add', 'del', 'flush'],
            default: 'show',
            inputKey: 'command'
        },
        {
            name: '-c',
            flag: '-c',
            type: 'boolean',
            description: 'Color output'
        },
        {
            name: '-br',
            flag: '-br',
            type: 'boolean',
            description: 'Brief output'
        }
    ],
    help: `Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }
       ip [ -force ] -batch filename
where  OBJECT := { link | address | addrlabel | route | rule | neigh | ntable |
                   tunnel | tuntap | maddress | mroute | mrule | monitor | xfrm |
                   netns | l2tp | fou | macsec | tcp_metrics | token | netconf | ila |
                   vrf }
OPTIONS := { -V[ersion] | -s[tatistics] | -d[etails] | -r[esolve] |
             -h[uman-readable] | -iec |
             -f[amily] { inet | inet6 | ipx | dnet | mpls | bridge | link } |
             -4 | -6 | -I | -D | -B | -0 |
             -l[oops] { maximum-addr-flush-attempts } | -br[ief] |
             -o[neline] | -t[imestamp] | -ts[hort] | -b[atch] [filename] |
             -rc[vbuf] [size] | -n[etns] name | -a[ll] | -c[olor] }`
}
