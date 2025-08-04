/**
 * cal - 显示日历
 */

export const cal = {
  options: [
    {
      flag: '-1',
      longFlag: '--one',
      description: 'Show only a single month (default)|仅显示单个月份（默认）',
      type: 'boolean'
    },
    {
      flag: '-3',
      longFlag: '--three',
      description: 'Show three months spanning the date|显示跨越日期的三个月',
      type: 'boolean'
    },
    {
      flag: '-y',
      longFlag: '--year',
      description: 'Show the whole year|显示整年',
      type: 'boolean'
    },
    {
      flag: '-m',
      longFlag: '--monday',
      description: 'Monday as first day of week|星期一作为一周的第一天',
      type: 'boolean'
    },
    {
      flag: '-s',
      longFlag: '--sunday',
      description: 'Sunday as first day of week|星期日作为一周的第一天',
      type: 'boolean'
    },
    {
      flag: '-j',
      longFlag: '--julian',
      description: 'Use day-of-year for all calendars|对所有日历使用年中的天数',
      type: 'boolean'
    },
    {
      flag: '-w',
      longFlag: '--week',
      description: 'Show US or ISO-8601 week numbers|显示美国或ISO-8601周数',
      type: 'boolean'
    },
    {
      flag: '-v',
      longFlag: '--vertical',
      description: 'Show day vertically instead of line|垂直显示日期而不是行',
      type: 'boolean'
    },
    {
      flag: '-n',
      longFlag: '--months',
      description: 'Show num months starting with date\'s month|显示从日期月份开始的num个月',
      type: 'string',
      placeholder: 'NUM'
    },
    {
      flag: '-c',
      longFlag: '--columns',
      description: 'Amount of columns to use|使用的列数',
      type: 'string',
      placeholder: 'WIDTH'
    }
  ],
  handler: (args, context, fs) => {
    // 处理帮助选项
    if (args.includes('--help') || args.includes('-h')) {
      return cal.help
    }

    const now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 1 // JavaScript月份从0开始
    let showYear = false
    let mondayFirst = args.includes('-m') || args.includes('--monday')
    let showWeekNumbers = args.includes('-w') || args.includes('--week-numbers')
    let julian = args.includes('-j') || args.includes('--julian')
    
    // 解析参数
    const numbers = args.filter(arg => /^\d+$/.test(arg)).map(Number)
    
    if (numbers.length === 1) {
      if (numbers[0] > 31) {
        // 如果数字大于31，认为是年份
        year = numbers[0]
        showYear = true
      } else {
        // 否则认为是月份
        month = numbers[0]
        if (month < 1 || month > 12) {
          return `cal: ${month}: bad month`
        }
      }
    } else if (numbers.length === 2) {
      month = numbers[0]
      year = numbers[1]
      if (month < 1 || month > 12) {
        return `cal: ${month}: bad month`
      }
    }
    
    if (showYear) {
      return generateYearCalendar(year, mondayFirst, showWeekNumbers, julian)
    } else {
      return generateMonthCalendar(year, month, mondayFirst, showWeekNumbers, julian)
    }
  },
  description: 'Display a calendar|显示日历',
  category: 'basic',
  supportsPipe: true,
  examples: [
    'cal',
    'cal 12 2024',
    'cal 2024',
    'cal -m',
    'cal --help'
  ],
  help: `Usage: cal [options] [[[day] month] year]|用法: cal [选项] [[[日] 月] 年]
       cal [options] [timestamp|monthname]|       cal [选项] [时间戳|月份名]

Display a calendar, or some part of it.|显示日历或其中的一部分。
Without any arguments, display the current month.|没有任何参数时，显示当前月份。

Options|选项:
 -1, --one        show only a single month (default)|仅显示单个月份（默认）
 -3, --three      show three months spanning the date|显示跨越日期的三个月
 -n, --months <num>  show num months starting with date's month|显示从日期月份开始的num个月
 -S, --span       span the date when displaying multiple months|显示多个月时跨越日期
 -s, --sunday     Sunday as first day of week|星期日作为一周的第一天
 -m, --monday     Monday as first day of week|星期一作为一周的第一天
 -j, --julian     use day-of-year for all calendars|对所有日历使用年中的天数
 -y, --year       show the whole year|显示整年
 -Y, --twelve     show the next twelve months|显示接下来的十二个月
 -w, --week[=<num>]  show US or ISO-8601 week numbers|显示美国或ISO-8601周数
 -v, --vertical   show day vertically instead of line|垂直显示日期而不是行
 -c, --columns <width>  amount of columns to use|使用的列数
     --color[=<when>]  colorize messages|着色消息
     --help           display this help|显示此帮助
     --version        display version|显示版本

Arguments|参数:
 <timestamp>  UNIX timestamp to use instead of current time|使用UNIX时间戳而不是当前时间
 <day>        day of the month|月份中的日期
 <month>      month name or number (1-12)|月份名称或数字（1-12）
 <year>       four digit year|四位数年份
 <monthname>  locale specific month name|特定于区域设置的月份名称

Examples|示例:
  cal                    Show current month|显示当前月份
  cal 12 2024           Show December 2024|显示2024年12月
  cal 2024              Show entire year 2024|显示2024年全年
  cal -m                Show current month with Monday first|显示当前月份，星期一为第一天
  cal -j                Show current month with Julian days|显示当前月份，使用儒略日
  cal -w                Show current month with week numbers|显示当前月份，包含周数`
}

// 生成月份日历
function generateMonthCalendar(year, month, mondayFirst = false, showWeekNumbers = false, julian = false) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const daysOfWeek = mondayFirst 
    ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  
  // 计算第一天是星期几
  let startDay = firstDay.getDay()
  if (mondayFirst) {
    startDay = (startDay + 6) % 7
  }
  
  let output = `    ${monthNames[month - 1]} ${year}\n`
  
  // 添加星期标题
  if (showWeekNumbers) {
    output += 'Wk '
  }
  output += daysOfWeek.join(' ') + '\n'
  
  let currentWeek = []
  let weekNumber = getWeekNumber(firstDay)
  
  // 添加前面的空格
  for (let i = 0; i < startDay; i++) {
    currentWeek.push('  ')
  }
  
  // 添加日期
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month - 1, day)
    let dayStr
    
    if (julian) {
      // 儒略日（年中的第几天）
      const dayOfYear = Math.floor((currentDate - new Date(year, 0, 0)) / 86400000)
      dayStr = dayOfYear.toString().padStart(3)
    } else {
      dayStr = day.toString().padStart(2)
    }
    
    currentWeek.push(dayStr)
    
    // 如果是星期的最后一天或者是月份的最后一天
    if (currentWeek.length === 7 || day === daysInMonth) {
      // 补齐这一周
      while (currentWeek.length < 7) {
        currentWeek.push('  ')
      }
      
      let weekLine = ''
      if (showWeekNumbers) {
        weekLine += weekNumber.toString().padStart(2) + ' '
        weekNumber++
      }
      weekLine += currentWeek.join(' ')
      
      output += weekLine + '\n'
      currentWeek = []
    }
  }
  
  return output.trim()
}

// 生成年份日历
function generateYearCalendar(year, mondayFirst = false, showWeekNumbers = false, julian = false) {
  let output = `                             ${year}\n\n`
  
  // 每行显示3个月
  for (let row = 0; row < 4; row++) {
    const months = []
    for (let col = 0; col < 3; col++) {
      const monthNum = row * 3 + col + 1
      const monthCal = generateMonthCalendar(year, monthNum, mondayFirst, showWeekNumbers, julian)
      months.push(monthCal.split('\n'))
    }
    
    // 找到最长的月份日历
    const maxLines = Math.max(...months.map(m => m.length))
    
    // 逐行输出三个月
    for (let line = 0; line < maxLines; line++) {
      const lineOutput = months.map(month => {
        const monthLine = month[line] || ''
        return monthLine.padEnd(22) // 每个月占22个字符宽度
      }).join('  ')
      
      output += lineOutput.trimEnd() + '\n'
    }
    
    if (row < 3) output += '\n'
  }
  
  return output.trim()
}

// 获取周数（简化版本）
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}