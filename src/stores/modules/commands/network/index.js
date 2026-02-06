/**
 * 网络命令模块
 * 包含网络相关的Linux命令实现
 */

import { ping } from './ping.js'
import { curl } from './curl.js'
import { wget } from './wget.js'
import { netstat } from './netstat.js'
import { ssh } from './ssh.js'
import { scp } from './scp.js'
import { rsync } from './rsync.js'
import { ss } from './ss.js'
import { telnet } from './telnet.js'
import { ftp } from './ftp.js'
import { iptables } from './iptables.js'
import { nc } from './nc.js'
import { ifconfig } from './ifconfig.js'
import { ip } from './ip.js'
import { traceroute } from './traceroute.js'
import { dig } from './dig.js'
import { host } from './host.js'

export const networkCommands = {
  ping,
  curl,
  wget,
  netstat,
  ssh,
  scp,
  rsync,
  ss,
  telnet,
  ftp,
  iptables,
  nc,
  ifconfig,
  ip,
  traceroute,
  dig,
  host
}

export default networkCommands