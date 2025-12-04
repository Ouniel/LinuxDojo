/**
 * System Commands Module
 * 系统管理相关命令
 */

import { ps } from './ps.js'
import { top } from './top.js'
import { kill } from './kill.js'
import { df } from './df.js'
import { du } from './du.js'
import { id } from './id.js'
import { uptime } from './uptime.js'
import { groups } from './groups.js'
import { who } from './who.js'
import { w } from './w.js'
import { killall } from './killall.js'
import { pkill } from './pkill.js'
import { pgrep } from './pgrep.js'
import { htop } from './htop.js'
import { passwd } from './passwd.js'
import { useradd } from './useradd.js'
import { userdel } from './userdel.js'
import { usermod } from './usermod.js'
import { groupadd } from './groupadd.js'
import { groupdel } from './groupdel.js'
import { bg } from './bg.js'
import { fg } from './fg.js'
import { jobs } from './jobs.js'
import { free } from './free.js'
import { mount } from './mount.js'
import { umount } from './umount.js'

export const systemCommands = {
  ps,
  top,
  kill,
  df,
  du,
  id,
  uptime,
  groups,
  who,
  w,
  killall,
  pkill,
  pgrep,
  htop,
  passwd,
  useradd,
  userdel,
  usermod,
  groupadd,
  groupdel,
  bg,
  fg,
  jobs,
  free,
  mount,
  umount
}

export default systemCommands
