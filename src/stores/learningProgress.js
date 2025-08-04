/**
 * 学习进度跟踪系统
 * 记录用户的学习进度、成就和统计信息
 */

import { defineStore } from 'pinia'

export const useLearningProgressStore = defineStore('learningProgress', {
  state: () => ({
    // 用户基本信息
    user: {
      level: 'Beginner',
      xp: 0,
      nextLevelXp: 500,
      totalCommands: 0,
      sessionsCount: 0,
      totalTimeSpent: 0, // 分钟
      joinDate: new Date().toISOString()
    },

    // 命令学习统计
    commandStats: {
      learned: new Set(), // 已学会的命令
      practiced: new Map(), // 命令练习次数
      mastered: new Set(), // 已掌握的命令
      categories: {
        basic: { learned: 0, total: 15 },
        system: { learned: 0, total: 12 },
        text: { learned: 0, total: 10 },
        network: { learned: 0, total: 8 },
        help: { learned: 0, total: 10 }
      }
    },

    // 教程进度
    tutorials: {
      completed: new Set(),
      current: null,
      progress: new Map(), // 教程ID -> 进度百分比
      available: [
        'basic-navigation',
        'file-operations', 
        'text-processing',
        'system-info',
        'network-tools'
      ]
    },

    // 测验统计
    quizzes: {
      attempted: 0,
      passed: 0,
      failed: 0,
      bestStreak: 0,
      currentStreak: 0,
      categories: new Map() // 分类测验统计
    },

    // 成就系统
    achievements: {
      unlocked: new Set(),
      available: new Map([
        ['first-command', {
          name: '初学者',
          description: '执行第一个命令',
          icon: '🎯',
          xp: 10,
          unlocked: false
        }],
        ['explorer', {
          name: '探索者', 
          description: '完成第一个教程',
          icon: '🗺️',
          xp: 50,
          unlocked: false
        }],
        ['command-master', {
          name: '命令大师',
          description: '学会20个不同的命令',
          icon: '⚡',
          xp: 100,
          unlocked: false
        }],
        ['file-ninja', {
          name: '文件忍者',
          description: '掌握所有文件操作命令',
          icon: '🥷',
          xp: 75,
          unlocked: false
        }],
        ['text-wizard', {
          name: '文本法师',
          description: '精通文本处理工具',
          icon: '🧙‍♂️',
          xp: 80,
          unlocked: false
        }],
        ['system-admin', {
          name: '系统管理员',
          description: '掌握系统管理命令',
          icon: '👨‍💻',
          xp: 90,
          unlocked: false
        }],
        ['network-guru', {
          name: '网络大师',
          description: '精通网络工具',
          icon: '🌐',
          xp: 85,
          unlocked: false
        }],
        ['speed-demon', {
          name: '速度恶魔',
          description: '在1分钟内执行10个命令',
          icon: '⚡',
          xp: 60,
          unlocked: false
        }],
        ['perfectionist', {
          name: '完美主义者',
          description: '连续10个命令无错误',
          icon: '💎',
          xp: 70,
          unlocked: false
        }],
        ['knowledge-seeker', {
          name: '求知者',
          description: '使用help命令查看20个不同命令的帮助',
          icon: '📚',
          xp: 40,
          unlocked: false
        }]
      ])
    },

    // 学习路径
    learningPaths: {
      current: 'beginner',
      completed: new Set(),
      available: {
        beginner: {
          name: '初学者路径',
          description: '学习Linux基础命令',
          steps: [
            'basic-navigation',
            'file-operations',
            'text-processing'
          ],
          progress: 0
        },
        intermediate: {
          name: '中级路径',
          description: '掌握系统管理和网络工具',
          steps: [
            'system-info',
            'network-tools',
            'advanced-text'
          ],
          progress: 0,
          locked: true
        },
        advanced: {
          name: '高级路径',
          description: '成为Linux专家',
          steps: [
            'scripting-basics',
            'system-administration',
            'security-tools'
          ],
          progress: 0,
          locked: true
        }
      }
    },

    // 每日挑战
    dailyChallenges: {
      current: null,
      completed: new Set(),
      streak: 0,
      lastCompleted: null,
      available: [
        {
          id: 'file-explorer',
          name: '文件探索者',
          description: '使用ls, cd, pwd命令浏览文件系统',
          tasks: ['ls -la', 'cd /home', 'pwd'],
          xp: 20
        },
        {
          id: 'text-hunter',
          name: '文本猎手',
          description: '使用grep查找文本',
          tasks: ['grep "error" log.txt', 'grep -i "warning" *.log'],
          xp: 25
        }
      ]
    },

    // 学习提示
    hints: {
      shown: new Set(),
      available: [
        'Use Tab for auto-completion',
        'Use | for piping commands',
        'Use > to redirect output',
        'Use history to see previous commands',
        'Use man <command> for detailed help'
      ]
    }
  }),

  getters: {
    // 计算总体进度百分比
    overallProgress: (state) => {
      const totalCommands = Object.values(state.commandStats.categories)
        .reduce((sum, cat) => sum + cat.total, 0)
      const learnedCommands = state.commandStats.learned.size
      return Math.floor((learnedCommands / totalCommands) * 100)
    },

    // 获取当前等级信息
    currentLevel: (state) => {
      const levels = [
        { name: 'Beginner', minXp: 0, maxXp: 500 },
        { name: 'Novice', minXp: 500, maxXp: 1200 },
        { name: 'Intermediate', minXp: 1200, maxXp: 2500 },
        { name: 'Advanced', minXp: 2500, maxXp: 5000 },
        { name: 'Expert', minXp: 5000, maxXp: 10000 },
        { name: 'Master', minXp: 10000, maxXp: Infinity }
      ]

      return levels.find(level => 
        state.user.xp >= level.minXp && state.user.xp < level.maxXp
      ) || levels[0]
    },

    // 获取下一等级进度
    nextLevelProgress: (state) => {
      const current = state.currentLevel
      if (current.maxXp === Infinity) return 100
      
      const progress = ((state.user.xp - current.minXp) / (current.maxXp - current.minXp)) * 100
      return Math.floor(progress)
    },

    // 获取已解锁的成就
    unlockedAchievements: (state) => {
      return Array.from(state.achievements.unlocked)
        .map(id => ({
          id,
          ...state.achievements.available.get(id)
        }))
        .sort((a, b) => b.xp - a.xp)
    },

    // 获取可用的成就
    availableAchievements: (state) => {
      return Array.from(state.achievements.available.entries())
        .filter(([id]) => !state.achievements.unlocked.has(id))
        .map(([id, achievement]) => ({ id, ...achievement }))
        .sort((a, b) => a.xp - b.xp)
    },

    // 获取学习建议
    learningRecommendations: (state) => {
      const recommendations = []
      
      // 基于当前进度推荐
      if (state.commandStats.learned.size < 5) {
        recommendations.push({
          type: 'tutorial',
          title: '完成基础导航教程',
          description: '学习ls, cd, pwd等基础命令',
          priority: 'high'
        })
      }

      // 基于薄弱环节推荐
      Object.entries(state.commandStats.categories).forEach(([category, stats]) => {
        if (stats.learned / stats.total < 0.3) {
          recommendations.push({
            type: 'category',
            title: `加强${category}类命令学习`,
            description: `你在${category}类命令上还有提升空间`,
            priority: 'medium'
          })
        }
      })

      return recommendations
    }
  },

  actions: {
    // 记录命令执行
    recordCommandExecution(commandName, success = true) {
      // 增加总命令数
      this.user.totalCommands++

      // 记录命令练习
      const currentCount = this.commandStats.practiced.get(commandName) || 0
      this.commandStats.practiced.set(commandName, currentCount + 1)

      // 如果成功执行，标记为已学会
      if (success) {
        this.commandStats.learned.add(commandName)
        
        // 检查是否掌握（执行5次以上）
        if (currentCount + 1 >= 5) {
          this.commandStats.mastered.add(commandName)
        }
      }

      // 更新分类统计
      this.updateCategoryStats()

      // 检查成就
      this.checkAchievements()

      // 添加经验值
      this.addXP(success ? 5 : 1)
    },

    // 更新分类统计
    updateCategoryStats() {
      // 这里需要根据命令注册表来更新
      // 暂时使用模拟数据
      Object.keys(this.commandStats.categories).forEach(category => {
        const categoryCommands = this.getCategoryCommands(category)
        const learned = categoryCommands.filter(cmd => 
          this.commandStats.learned.has(cmd)
        ).length
        
        this.commandStats.categories[category].learned = learned
      })
    },

    // 获取分类命令（模拟）
    getCategoryCommands(category) {
      const categoryMap = {
        basic: ['ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'cp', 'mv'],
        system: ['ps', 'top', 'kill', 'whoami', 'uname', 'date', 'uptime', 'free', 'df'],
        text: ['grep', 'sort', 'wc', 'head', 'tail', 'cut', 'uniq', 'tr'],
        network: ['ping', 'curl', 'wget', 'netstat', 'ssh', 'scp'],
        help: ['help', 'man', 'tutorial', 'progress', 'hint', 'example', 'quiz', 'history']
      }
      
      return categoryMap[category] || []
    },

    // 完成教程
    completeTutorial(tutorialId) {
      this.tutorials.completed.add(tutorialId)
      this.tutorials.progress.set(tutorialId, 100)
      
      // 添加经验值
      this.addXP(50)
      
      // 检查成就
      this.checkAchievements()
    },

    // 更新教程进度
    updateTutorialProgress(tutorialId, progress) {
      this.tutorials.progress.set(tutorialId, progress)
      this.tutorials.current = tutorialId
    },

    // 记录测验结果
    recordQuizResult(passed, category = 'general') {
      this.quizzes.attempted++
      
      if (passed) {
        this.quizzes.passed++
        this.quizzes.currentStreak++
        this.quizzes.bestStreak = Math.max(this.quizzes.bestStreak, this.quizzes.currentStreak)
        this.addXP(20)
      } else {
        this.quizzes.failed++
        this.quizzes.currentStreak = 0
      }

      // 更新分类统计
      const categoryStats = this.quizzes.categories.get(category) || { attempted: 0, passed: 0 }
      categoryStats.attempted++
      if (passed) categoryStats.passed++
      this.quizzes.categories.set(category, categoryStats)

      this.checkAchievements()
    },

    // 添加经验值
    addXP(amount) {
      this.user.xp += amount
      
      // 检查是否升级
      const currentLevel = this.currentLevel
      if (this.user.xp >= currentLevel.maxXp && currentLevel.maxXp !== Infinity) {
        this.levelUp()
      }
    },

    // 升级
    levelUp() {
      const newLevel = this.currentLevel
      this.user.level = newLevel.name
      this.user.nextLevelXp = newLevel.maxXp
      
      // 升级奖励
      this.addXP(100)
      
      // 解锁新功能
      this.unlockFeatures()
    },

    // 解锁功能
    unlockFeatures() {
      // 根据等级解锁学习路径
      if (this.user.level === 'Novice') {
        this.learningPaths.available.intermediate.locked = false
      } else if (this.user.level === 'Advanced') {
        this.learningPaths.available.advanced.locked = false
      }
    },

    // 检查成就
    checkAchievements() {
      const achievements = this.achievements.available

      // 检查各种成就条件
      if (this.user.totalCommands >= 1 && !this.achievements.unlocked.has('first-command')) {
        this.unlockAchievement('first-command')
      }

      if (this.tutorials.completed.size >= 1 && !this.achievements.unlocked.has('explorer')) {
        this.unlockAchievement('explorer')
      }

      if (this.commandStats.learned.size >= 20 && !this.achievements.unlocked.has('command-master')) {
        this.unlockAchievement('command-master')
      }

      // 检查分类掌握成就
      if (this.commandStats.categories.basic.learned >= this.commandStats.categories.basic.total) {
        if (!this.achievements.unlocked.has('file-ninja')) {
          this.unlockAchievement('file-ninja')
        }
      }

      if (this.quizzes.currentStreak >= 10 && !this.achievements.unlocked.has('perfectionist')) {
        this.unlockAchievement('perfectionist')
      }
    },

    // 解锁成就
    unlockAchievement(achievementId) {
      if (this.achievements.unlocked.has(achievementId)) return

      this.achievements.unlocked.add(achievementId)
      const achievement = this.achievements.available.get(achievementId)
      
      if (achievement) {
        this.addXP(achievement.xp)
        
        // 显示成就通知（这里可以触发UI通知）
        console.log(`🏆 Achievement Unlocked: ${achievement.name}`)
      }
    },

    // 开始每日挑战
    startDailyChallenge() {
      const today = new Date().toDateString()
      if (this.dailyChallenges.lastCompleted === today) {
        return { success: false, message: '今日挑战已完成' }
      }

      const available = this.dailyChallenges.available.filter(challenge => 
        !this.dailyChallenges.completed.has(challenge.id)
      )

      if (available.length === 0) {
        return { success: false, message: '暂无可用挑战' }
      }

      const randomChallenge = available[Math.floor(Math.random() * available.length)]
      this.dailyChallenges.current = randomChallenge

      return { success: true, challenge: randomChallenge }
    },

    // 完成每日挑战
    completeDailyChallenge() {
      if (!this.dailyChallenges.current) return

      const challengeId = this.dailyChallenges.current.id
      this.dailyChallenges.completed.add(challengeId)
      this.dailyChallenges.lastCompleted = new Date().toDateString()
      this.dailyChallenges.streak++

      // 奖励经验值
      this.addXP(this.dailyChallenges.current.xp)
      
      this.dailyChallenges.current = null
    },

    // 显示学习提示
    showHint() {
      const availableHints = this.hints.available.filter(hint => 
        !this.hints.shown.has(hint)
      )

      if (availableHints.length === 0) {
        return '你已经看过所有提示了！'
      }

      const randomHint = availableHints[Math.floor(Math.random() * availableHints.length)]
      this.hints.shown.add(randomHint)

      return `💡 提示: ${randomHint}`
    },

    // 重置进度（用于测试）
    resetProgress() {
      this.$reset()
    },

    // 导出学习数据
    exportLearningData() {
      return {
        user: this.user,
        commandStats: {
          learned: Array.from(this.commandStats.learned),
          practiced: Object.fromEntries(this.commandStats.practiced),
          mastered: Array.from(this.commandStats.mastered),
          categories: this.commandStats.categories
        },
        tutorials: {
          completed: Array.from(this.tutorials.completed),
          progress: Object.fromEntries(this.tutorials.progress)
        },
        achievements: {
          unlocked: Array.from(this.achievements.unlocked)
        },
        exportDate: new Date().toISOString()
      }
    },

    // 导入学习数据
    importLearningData(data) {
      if (!data || typeof data !== 'object') return false

      try {
        if (data.user) this.user = { ...this.user, ...data.user }
        if (data.commandStats) {
          if (data.commandStats.learned) {
            this.commandStats.learned = new Set(data.commandStats.learned)
          }
          if (data.commandStats.practiced) {
            this.commandStats.practiced = new Map(Object.entries(data.commandStats.practiced))
          }
          if (data.commandStats.mastered) {
            this.commandStats.mastered = new Set(data.commandStats.mastered)
          }
          if (data.commandStats.categories) {
            this.commandStats.categories = { ...this.commandStats.categories, ...data.commandStats.categories }
          }
        }
        if (data.tutorials) {
          if (data.tutorials.completed) {
            this.tutorials.completed = new Set(data.tutorials.completed)
          }
          if (data.tutorials.progress) {
            this.tutorials.progress = new Map(Object.entries(data.tutorials.progress))
          }
        }
        if (data.achievements && data.achievements.unlocked) {
          this.achievements.unlocked = new Set(data.achievements.unlocked)
        }

        return true
      } catch (error) {
        console.error('Failed to import learning data:', error)
        return false
      }
    }
  },

  // 持久化配置
  persist: {
    key: 'linuxdojo-learning-progress',
    storage: localStorage,
    serializer: {
      serialize: (state) => {
        // 转换Set和Map为可序列化的格式
        const serializable = {
          ...state,
          commandStats: {
            ...state.commandStats,
            learned: Array.from(state.commandStats.learned),
            practiced: Object.fromEntries(state.commandStats.practiced),
            mastered: Array.from(state.commandStats.mastered)
          },
          tutorials: {
            ...state.tutorials,
            completed: Array.from(state.tutorials.completed),
            progress: Object.fromEntries(state.tutorials.progress)
          },
          achievements: {
            ...state.achievements,
            unlocked: Array.from(state.achievements.unlocked),
            available: Object.fromEntries(state.achievements.available)
          },
          quizzes: {
            ...state.quizzes,
            categories: Object.fromEntries(state.quizzes.categories)
          },
          dailyChallenges: {
            ...state.dailyChallenges,
            completed: Array.from(state.dailyChallenges.completed)
          },
          hints: {
            ...state.hints,
            shown: Array.from(state.hints.shown)
          },
          learningPaths: {
            ...state.learningPaths,
            completed: Array.from(state.learningPaths.completed)
          }
        }
        return JSON.stringify(serializable)
      },
      deserialize: (serialized) => {
        const state = JSON.parse(serialized)
        
        // 恢复Set和Map
        if (state.commandStats) {
          state.commandStats.learned = new Set(state.commandStats.learned || [])
          state.commandStats.practiced = new Map(Object.entries(state.commandStats.practiced || {}))
          state.commandStats.mastered = new Set(state.commandStats.mastered || [])
        }
        
        if (state.tutorials) {
          state.tutorials.completed = new Set(state.tutorials.completed || [])
          state.tutorials.progress = new Map(Object.entries(state.tutorials.progress || {}))
        }
        
        if (state.achievements) {
          state.achievements.unlocked = new Set(state.achievements.unlocked || [])
          state.achievements.available = new Map(Object.entries(state.achievements.available || {}))
        }
        
        if (state.quizzes) {
          state.quizzes.categories = new Map(Object.entries(state.quizzes.categories || {}))
        }
        
        if (state.dailyChallenges) {
          state.dailyChallenges.completed = new Set(state.dailyChallenges.completed || [])
        }
        
        if (state.hints) {
          state.hints.shown = new Set(state.hints.shown || [])
        }
        
        if (state.learningPaths) {
          state.learningPaths.completed = new Set(state.learningPaths.completed || [])
        }
        
        return state
      }
    }
  }
})