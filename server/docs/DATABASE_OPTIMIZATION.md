# 数据库性能优化指南

本文档描述了在Todo List应用中实施的数据库性能优化措施。

---

## 1. 索引优化

### 已创建的索引

通过迁移 `AddPerformanceIndexes` 创建的性能索引：

#### 任务表 (tasks)
```sql
- IDX_task_user_status: (userId, status) - 用户任务状态查询
- IDX_task_user_priority: (userId, priority) - 用户任务优先级查询
- IDX_task_deadline: (dueDate) - 截止时间查询
- IDX_task_created: (createdAt) - 创建时间排序
- IDX_task_category: (category) - 分类筛选
```

#### 时间记录表 (time_records)
```sql
- IDX_time_record_user: (userId) - 用户时间记录查询
- IDX_time_record_task: (taskId) - 任务时间记录查询
- IDX_time_record_date: (startTime) - 时间范围查询
```

#### 番茄钟记录表 (pomodoro_records)
```sql
- IDX_pomodoro_user: (userId) - 用户番茄钟查询
- IDX_pomodoro_task: (taskId) - 任务番茄钟查询
- IDX_pomodoro_date: (startTime) - 时间范围查询
- IDX_pomodoro_status: (status) - 状态筛选
```

#### 通知表 (notifications)
```sql
- IDX_notification_user: (userId) - 用户通知查询
- IDX_notification_read: (isRead) - 已读状态筛选
- IDX_notification_created: (createdAt) - 创建时间排序
- IDX_notification_type: (type) - 通知类型筛选
```

#### 用户表 (users)
```sql
- IDX_user_email: (email) - 邮箱查询
- IDX_user_username: (username) - 用户名查询
```

#### 关联表
```sql
- IDX_task_note_task: (taskId) - 任务笔记查询
- IDX_attachment_task: (taskId) - 任务附件查询
```

### 索引使用建议

1. **复合索引顺序**
   - 将选择性高的列放在前面
   - 考虑查询的WHERE和ORDER BY条件

2. **避免过度索引**
   - 索引会增加写操作成本
   - 定期检查索引使用情况

3. **监控索引性能**
   ```sql
   -- 查看未使用的索引
   SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;
   
   -- 查看表大小和索引大小
   SELECT * FROM pg_indexes WHERE tablename = 'tasks';
   ```

---

## 2. 避免 N+1 查询问题

### 使用关系预加载

**错误示例（N+1问题）：**
```typescript
// ❌ 会产生 N+1 查询
const tasks = await this.taskRepository.find();
for (const task of tasks) {
  const notes = await this.taskNoteRepository.find({ taskId: task.id });
}
```

**正确示例：**
```typescript
// ✅ 使用 relations 预加载
const tasks = await this.taskRepository.find({
  relations: ['taskNotes', 'attachments'],
});

// ✅ 使用 QueryBuilder join
const tasks = await this.taskRepository
  .createQueryBuilder('task')
  .leftJoinAndSelect('task.taskNotes', 'notes')
  .leftJoinAndSelect('task.attachments', 'attachments')
  .where('task.userId = :userId', { userId })
  .getMany();
```

### 在服务中的实现

```typescript
// tasks.service.ts
async getTaskById(userId: string, taskId: string) {
  return await this.taskRepository.findOne({
    where: { id: taskId },
    relations: ['taskNotes', 'attachments'], // 预加载关联数据
  });
}
```

---

## 3. 查询缓存

### TypeORM 查询缓存

在 `database.config.ts` 中已启用：

```typescript
cache: {
  duration: 30000, // 缓存30秒
}
```

### 使用查询缓存

```typescript
// 启用缓存的查询
const tasks = await this.taskRepository
  .createQueryBuilder('task')
  .where('task.userId = :userId', { userId })
  .cache(true) // 启用缓存
  .getMany();

// 自定义缓存时间
const tasks = await this.taskRepository
  .createQueryBuilder('task')
  .where('task.status = :status', { status: 'TODO' })
  .cache('tasks_todo', 60000) // 缓存键和时间
  .getMany();
```

### Redis 缓存（应用层）

```typescript
import { Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

export class StatisticsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getTaskStatistics(userId: string) {
    const cacheKey = `stats:${userId}`;
    
    // 尝试从缓存获取
    let stats = await this.cacheManager.get(cacheKey);
    
    if (!stats) {
      // 缓存未命中，查询数据库
      stats = await this.calculateStatistics(userId);
      
      // 存入缓存，300秒过期
      await this.cacheManager.set(cacheKey, stats, 300);
    }
    
    return stats;
  }
}
```

---

## 4. 连接池配置

### 当前配置

在 `database.config.ts` 中：

```typescript
extra: {
  max: 20,                      // 最大连接数
  min: 2,                       // 最小连接数
  idleTimeoutMillis: 30000,     // 空闲超时
  connectionTimeoutMillis: 2000, // 连接超时
}
```

### 连接池调优建议

1. **生产环境**
   ```env
   DB_POOL_MAX=50      # 根据服务器配置调整
   DB_POOL_MIN=5       # 保持一定数量的连接
   ```

2. **开发环境**
   ```env
   DB_POOL_MAX=10
   DB_POOL_MIN=2
   ```

3. **监控连接池**
   ```typescript
   // 记录连接池状态
   const connection = getConnection();
   console.log('连接池状态:', {
     总连接数: connection.driver.poolSize,
     活跃连接: connection.driver.activeConnections,
   });
   ```

---

## 5. 查询优化最佳实践

### 5.1 使用 SELECT 指定字段

**避免：**
```typescript
// ❌ 查询所有字段
const tasks = await this.taskRepository.find();
```

**推荐：**
```typescript
// ✅ 只查询需要的字段
const tasks = await this.taskRepository
  .createQueryBuilder('task')
  .select([
    'task.id',
    'task.title',
    'task.status',
    'task.priority',
  ])
  .getMany();
```

### 5.2 分页查询

```typescript
// 始终使用分页
const { page = 1, limit = 10 } = queryDto;
const skip = (page - 1) * limit;

const [tasks, total] = await this.taskRepository
  .createQueryBuilder('task')
  .skip(skip)
  .take(limit)
  .getManyAndCount();
```

### 5.3 批量操作

**避免：**
```typescript
// ❌ 循环插入
for (const task of tasks) {
  await this.taskRepository.save(task);
}
```

**推荐：**
```typescript
// ✅ 批量插入
await this.taskRepository.save(tasks);

// 或使用 insert
await this.taskRepository.insert(tasks);
```

### 5.4 软删除 vs 硬删除

```typescript
// 软删除 - 保留数据用于审计
await this.taskRepository.softDelete(taskId);

// 查询时自动排除软删除的记录
const tasks = await this.taskRepository.find();

// 包含软删除的记录
const allTasks = await this.taskRepository.find({
  withDeleted: true,
});
```

---

## 6. 查询性能监控

### 6.1 启用查询日志

```typescript
// database.config.ts
logging: process.env.NODE_ENV === 'development',
```

### 6.2 慢查询日志

```typescript
// 记录慢查询（>100ms）
logging: ['query', 'error', 'slow-query'],
maxQueryExecutionTime: 100, // 毫秒
```

### 6.3 使用 EXPLAIN 分析查询

```sql
-- PostgreSQL
EXPLAIN ANALYZE 
SELECT * FROM tasks 
WHERE userId = 'xxx' AND status = 'TODO';

-- 查看索引使用情况
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM tasks WHERE userId = 'xxx';
```

---

## 7. 数据库维护

### 7.1 定期 VACUUM

```sql
-- 回收空间和更新统计信息
VACUUM ANALYZE tasks;

-- 自动化配置
ALTER TABLE tasks SET (autovacuum_enabled = true);
```

### 7.2 重建索引

```sql
-- 定期重建索引以优化性能
REINDEX INDEX IDX_task_user_status;
REINDEX TABLE tasks;
```

### 7.3 统计信息更新

```sql
-- 更新表统计信息
ANALYZE tasks;
ANALYZE notifications;
```

---

## 8. 性能测试建议

### 8.1 基准测试

```bash
# 使用 pgbench 测试数据库性能
pgbench -c 10 -j 2 -t 1000 todo_list_db
```

### 8.2 应用层性能测试

```typescript
// 测试查询性能
console.time('getTasks');
const tasks = await this.tasksService.getTasks(userId, queryDto);
console.timeEnd('getTasks');
```

### 8.3 监控指标

- 查询响应时间（< 100ms）
- 缓存命中率（> 80%）
- 连接池使用率（< 70%）
- 慢查询数量

---

## 9. 性能优化检查清单

- [x] 为常用查询创建索引
- [x] 使用关系预加载避免 N+1 查询
- [x] 启用查询缓存
- [x] 配置连接池
- [x] 使用分页查询
- [x] 批量操作代替循环操作
- [x] 只查询需要的字段
- [x] 启用慢查询日志
- [ ] 定期监控和维护数据库
- [ ] 进行负载测试

---

## 10. 常见问题

### Q: 何时使用索引？
A: 对于经常用于 WHERE、JOIN、ORDER BY 的字段创建索引。

### Q: 索引越多越好吗？
A: 不是。索引会增加写操作成本，需要权衡。

### Q: 如何发现 N+1 查询？
A: 启用查询日志，观察是否有大量相似的单条查询。

### Q: 缓存失效策略？
A: 使用 TTL + 手动失效相结合，重要数据更新时主动清除缓存。

---

**文档版本**: 1.0  
**最后更新**: 2025-10-24

