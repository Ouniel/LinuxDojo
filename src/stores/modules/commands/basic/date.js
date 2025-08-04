/**
 * date - 显示或设置系统日期
 */

export const date = {
  options: [
    {
      name: '-d, --date',
      description: '显示STRING描述的时间，而不是"现在"',
      type: 'input',
      placeholder: '输入日期字符串 (如: "2 days ago", "next Monday")',
      group: 'display'
    },
    {
      name: '-f, --file',
      description: '对DATEFILE的每一行执行一次--date',
      type: 'input',
      placeholder: '输入文件路径',
      group: 'display'
    },
    {
      name: '-I, --iso-8601',
      description: '以ISO 8601格式输出日期/时间',
      type: 'flag',
      group: 'format'
    },
    {
      name: '-r, --reference',
      description: '显示FILE的最后修改时间',
      type: 'input',
      placeholder: '输入文件路径',
      group: 'display'
    },
    {
      name: '-R, --rfc-2822',
      description: '以RFC 2822格式输出日期和时间',
      type: 'flag',
      group: 'format'
    },
    {
      name: '--rfc-3339',
      description: '以RFC 3339格式输出日期和时间',
      type: 'flag',
      group: 'format'
    },
    {
      name: '-s, --set',
      description: '设置STRING描述的时间',
      type: 'input',
      placeholder: '输入时间字符串',
      group: 'set'
    },
    {
      name: '-u, --utc, --universal',
      description: '打印或设置协调世界时（UTC）',
      type: 'flag',
      group: 'timezone'
    },
    {
      name: '+FORMAT',
      description: '自定义输出格式',
      type: 'input',
      placeholder: '输入格式字符串 (如: "+%Y-%m-%d %H:%M:%S")',
      group: 'format'
    },
    {
      name: '--help',
      description: '显示帮助信息',
      type: 'flag',
      group: 'help'
    },
    {
      name: '--version',
      description: '显示版本信息',
      type: 'flag',
      group: 'help'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return date.help
    }

    const now = new Date()
    
    // 如果没有参数，显示默认格式
    if (args.length === 0) {
      return now.toString()
    }

    let utc = args.includes('-u') || args.includes('--utc') || args.includes('--universal')
    let iso8601 = args.includes('-I') || args.includes('--iso-8601')
    let rfc2822 = args.includes('-R') || args.includes('--rfc-2822')
    let rfc3339 = args.includes('--rfc-3339')
    let customFormat = null
    
    // 查找自定义格式
    for (const arg of args) {
      if (arg.startsWith('+')) {
        customFormat = arg.substring(1)
        break
      }
    }

    const targetDate = utc ? new Date(now.getTime() + now.getTimezoneOffset() * 60000) : now

    if (iso8601) {
      return targetDate.toISOString().split('T')[0]
    }

    if (rfc2822) {
      return targetDate.toUTCString()
    }

    if (rfc3339) {
      return targetDate.toISOString()
    }

    if (customFormat) {
      return formatDate(targetDate, customFormat)
    }

    // 默认格式
    return targetDate.toString()
  },
  description: 'Display or set the system date|显示或设置系统日期',
  category: 'system',
  supportsPipe: true,
  examples: [
    'date',
    'date -u',
    'date -I',
    'date "+%Y-%m-%d %H:%M:%S"',
    'date --help'
  ],
  help: `Usage: date [OPTION]... [+FORMAT]|用法: date [选项]... [+格式]
  or:  date [-u|--utc|--universal] [MMDDhhmm[[CC]YY][.ss]]|或者: date [-u|--utc|--universal] [MMDDhhmm[[CC]YY][.ss]]

Display the current time in the given FORMAT, or set the system date.|以给定格式显示当前时间，或设置系统日期。

  -d, --date=STRING         display time described by STRING, not 'now'|显示STRING描述的时间，而不是'现在'
  -f, --file=DATEFILE       like --date once for each line of DATEFILE|对DATEFILE的每一行执行一次--date
  -I[TIMESPEC], --iso-8601[=TIMESPEC]  output date/time in ISO 8601 format.|以ISO 8601格式输出日期/时间。
                            TIMESPEC='date' for date only (the default),|TIMESPEC='date'仅显示日期（默认），
                            'hours', 'minutes', 'seconds', or 'ns' for date|'hours'、'minutes'、'seconds'或'ns'表示日期
                            and time to the indicated precision.|和时间到指定精度。
  -r, --reference=FILE      display the last modification time of FILE|显示FILE的最后修改时间
  -R, --rfc-2822            output date and time in RFC 2822 format.|以RFC 2822格式输出日期和时间。
                            Example: Mon, 07 Aug 2006 12:34:56 -0600|示例：Mon, 07 Aug 2006 12:34:56 -0600
      --rfc-3339=TIMESPEC   output date and time in RFC 3339 format.|以RFC 3339格式输出日期和时间。
                            TIMESPEC='date', 'seconds', or 'ns' for date and|TIMESPEC='date'、'seconds'或'ns'表示日期和
                            time to the indicated precision.|时间到指定精度。
  -s, --set=STRING          set time described by STRING|设置STRING描述的时间
  -u, --utc, --universal    print or set Coordinated Universal Time (UTC)|打印或设置协调世界时（UTC）
      --help                display this help and exit|显示此帮助信息并退出
      --version             output version information and exit|输出版本信息并退出

FORMAT controls the output.  Interpreted sequences are:|格式控制输出。解释的序列有：

  %%   a literal %|字面量%
  %a   locale's abbreviated weekday name (e.g., Sun)|本地化的缩写星期名（例如，Sun）
  %A   locale's full weekday name (e.g., Sunday)|本地化的完整星期名（例如，Sunday）
  %b   locale's abbreviated month name (e.g., Jan)|本地化的缩写月份名（例如，Jan）
  %B   locale's full month name (e.g., January)|本地化的完整月份名（例如，January）
  %c   locale's date and time (e.g., Thu Mar  3 23:05:25 2005)|本地化的日期和时间
  %C   century; like %Y, but omit last two digits (e.g., 20)|世纪；类似%Y，但省略最后两位数字
  %d   day of month (e.g., 01)|月份中的日期（例如，01）
  %D   date; same as %m/%d/%y|日期；与%m/%d/%y相同
  %e   day of month, space padded; same as %_d|月份中的日期，空格填充；与%_d相同
  %F   full date; same as %Y-%m-%d|完整日期；与%Y-%m-%d相同
  %g   last two digits of year of ISO week number (see %G)|ISO周数年份的最后两位数字
  %G   year of ISO week number (see %V); normally useful only with %V|ISO周数的年份
  %h   same as %b|与%b相同
  %H   hour (00..23)|小时（00..23）
  %I   hour (01..12)|小时（01..12）
  %j   day of year (001..366)|年份中的日期（001..366）
  %k   hour, space padded ( 0..23); same as %_H|小时，空格填充（ 0..23）
  %l   hour, space padded ( 1..12); same as %_I|小时，空格填充（ 1..12）
  %m   month (01..12)|月份（01..12）
  %M   minute (00..59)|分钟（00..59）
  %n   a newline|换行符
  %N   nanoseconds (000000000..999999999)|纳秒
  %p   locale's equivalent of either AM or PM; blank if not known|本地化的AM或PM等价物
  %P   like %p, but lower case|类似%p，但小写
  %r   locale's 12-hour clock time (e.g., 11:11:04 PM)|本地化的12小时制时间
  %R   24-hour hour and minute; same as %H:%M|24小时制的小时和分钟
  %s   seconds since 1970-01-01 00:00:00 UTC|自1970-01-01 00:00:00 UTC以来的秒数
  %S   second (00..60)|秒（00..60）
  %t   a tab|制表符
  %T   time; same as %H:%M:%S|时间；与%H:%M:%S相同
  %u   day of week (1..7); 1 is Monday|星期几（1..7）；1是星期一
  %U   week number of year, with Sunday as first day of week (00..53)|年份的周数，以星期日为一周的第一天
  %V   ISO week number, with Monday as first day of week (01..53)|ISO周数，以星期一为一周的第一天
  %w   day of week (0..6); 0 is Sunday|星期几（0..6）；0是星期日
  %W   week number of year, with Monday as first day of week (00..53)|年份的周数，以星期一为一周的第一天
  %x   locale's date representation (e.g., 12/31/99)|本地化的日期表示
  %X   locale's time representation (e.g., 23:13:48)|本地化的时间表示
  %y   last two digits of year (00..99)|年份的最后两位数字
  %Y   year|年份
  %z   +hhmm numeric time zone (e.g., -0400)|数字时区
  %:z  +hh:mm numeric time zone (e.g., -04:00)|数字时区
  %::z +hh:mm:ss numeric time zone (e.g., -04:00:00)|数字时区
  %:::z numeric time zone with : to necessary precision (e.g., -04, +05:30)|数字时区
  %Z   alphabetic time zone abbreviation (e.g., EDT)|字母时区缩写

Examples|示例:
  date                              Show current date and time|显示当前日期和时间
  date -u                           Show UTC time|显示UTC时间
  date -I                           Show date in ISO format|以ISO格式显示日期
  date "+%Y-%m-%d %H:%M:%S"         Custom format|自定义格式
  date "+%A, %B %d, %Y"             Show: Monday, January 01, 2024|显示：Monday, January 01, 2024`
}

// 格式化日期函数
function formatDate(date, format) {
  const pad = (num, size = 2) => num.toString().padStart(size, '0')
  const padSpace = (num, size = 2) => num.toString().padStart(size, ' ')
  
  const replacements = {
    '%%': '%',
    '%a': date.toLocaleDateString('en-US', { weekday: 'short' }),
    '%A': date.toLocaleDateString('en-US', { weekday: 'long' }),
    '%b': date.toLocaleDateString('en-US', { month: 'short' }),
    '%B': date.toLocaleDateString('en-US', { month: 'long' }),
    '%c': date.toLocaleString(),
    '%C': Math.floor(date.getFullYear() / 100).toString(),
    '%d': pad(date.getDate()),
    '%D': `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${pad(date.getFullYear() % 100)}`,
    '%e': padSpace(date.getDate()),
    '%F': `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    '%H': pad(date.getHours()),
    '%I': pad(date.getHours() % 12 || 12),
    '%j': pad(Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000), 3),
    '%k': padSpace(date.getHours()),
    '%l': padSpace(date.getHours() % 12 || 12),
    '%m': pad(date.getMonth() + 1),
    '%M': pad(date.getMinutes()),
    '%n': '\n',
    '%N': pad(date.getMilliseconds() * 1000000, 9),
    '%p': date.getHours() >= 12 ? 'PM' : 'AM',
    '%P': date.getHours() >= 12 ? 'pm' : 'am',
    '%r': date.toLocaleTimeString('en-US'),
    '%R': `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    '%s': Math.floor(date.getTime() / 1000).toString(),
    '%S': pad(date.getSeconds()),
    '%t': '\t',
    '%T': `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
    '%u': ((date.getDay() + 6) % 7 + 1).toString(),
    '%w': date.getDay().toString(),
    '%x': date.toLocaleDateString(),
    '%X': date.toLocaleTimeString(),
    '%y': pad(date.getFullYear() % 100),
    '%Y': date.getFullYear().toString(),
    '%z': getTimezoneOffset(date),
    '%Z': getTimezoneAbbr(date)
  }
  
  let result = format
  for (const [pattern, replacement] of Object.entries(replacements)) {
    result = result.replace(new RegExp(pattern.replace('%', '\\%'), 'g'), replacement)
  }
  
  return result
}

function getTimezoneOffset(date) {
  const offset = -date.getTimezoneOffset()
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  const sign = offset >= 0 ? '+' : '-'
  return `${sign}${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`
}

function getTimezoneAbbr(date) {
  return date.toTimeString().split(' ')[1] || 'UTC'
}