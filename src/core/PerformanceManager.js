/**
 * 性能管理器
 * 处理缓存、内存管理和性能优化
 */

export class PerformanceManager {
  constructor() {
    this.cache = new Map()
    this.maxCacheSize = 100
    this.maxHistorySize = 1000
    this.cacheTimeout = 5000 // 5秒缓存
  }

  /**
   * 获取缓存
   */
  getCache(key) {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key)
      return null
    }
    
    return cached.result
  }

  /**
   * 设置缓存
   */
  setCache(key, result) {
    // 清理过期缓存
    this.cleanExpiredCache()
    
    // 限制缓存大小
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now()
    })
  }

  /**
   * 清理过期缓存
   */
  cleanExpiredCache() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 限制历史记录大小
   */
  limitHistorySize(history) {
    if (history.length > this.maxHistorySize) {
      return history.slice(-this.maxHistorySize)
    }
    return history
  }

  /**
   * 清理内存
   */
  cleanup() {
    this.cache.clear()
  }

  /**
   * 记录命令执行性能
   */
  recordCommandExecution(command, executionTime) {
    // 可以在这里添加性能监控逻辑
    // 例如记录到日志、发送到监控系统等
    if (executionTime > 1000) {
      console.warn(`Slow command detected: ${command} took ${executionTime.toFixed(2)}ms`)
    }
  }

  /**
   * 获取性能统计
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      maxHistorySize: this.maxHistorySize
    }
  }
}

export const performanceManager = new PerformanceManager()