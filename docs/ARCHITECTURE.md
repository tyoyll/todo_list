# Todo List 应用技术架构文档

## 目录

1. [系统概述](#系统概述)
2. [技术栈](#技术栈)
3. [系统架构](#系统架构)
4. [模块设计](#模块设计)
5. [数据库设计](#数据库设计)
6. [API设计](#api设计)
7. [安全设计](#安全设计)
8. [性能优化](#性能优化)

---

## 系统概述

Todo List 是一个全栈Web应用，提供任务管理、时间跟踪、数据统计等功能。

### 核心功能
- 任务管理（CRUD、分类、优先级、状态管理）
- 时间管理（番茄钟、工作计时）
- 数据统计（完成率、趋势分析、报表导出）
- 通知提醒（任务截止、休息提醒）
- 用户管理（认证、授权、设置）

---

## 技术栈

### 后端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18.x | 运行时环境 |
| NestJS | 10.x | Web框架 |
| TypeScript | 5.x | 编程语言 |
| PostgreSQL | 14.x | 关系型数据库 |
| TypeORM | 0.3.x | ORM框架 |
| Redis | 6.x | 缓存系统 |
| JWT | - | 认证机制 |
| BCrypt | - | 密码加密 |
| Class-validator | - | 数据验证 |
| Swagger | - | API文档 |

### 前端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI框架 |
| TypeScript | 5.x | 编程语言 |
| Redux Toolkit | 2.x | 状态管理 |
| React Router | 7.x | 路由管理 |
| Ant Design | 5.x | UI组件库 |
| Recharts | 3.x | 数据可视化 |
| Axios | 1.x | HTTP客户端 |
| Vite | 7.x | 构建工具 |
| SCSS | - | 样式预处理 |

### 开发工具
- ESLint - 代码检查
- Prettier - 代码格式化
- Jest - 后端测试
- Vitest - 前端测试
- Playwright - E2E测试
- PM2 - 进程管理
- Nginx - 反向代理

---

## 系统架构

### 整体架构

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
┌──────▼──────┐
│    Nginx    │ ◄── 反向代理 + 静态文件
└──────┬──────┘
       │
    ┌──┴──┐
    │     │
┌───▼───┐ │
│ React │ │
│  SPA  │ │
└───┬───┘ │
    │     │
┌───▼─────▼────┐
│  NestJS API  │ ◄── JWT认证 + 业务逻辑
└───┬─────┬────┘
    │     │
┌───▼───┐ │
│ Redis │ │ ◄── 缓存层
└───────┘ │
    ┌─────▼─────┐
    │PostgreSQL │ ◄── 数据持久层
    └───────────┘
```

### 分层架构

```
┌─────────────────────────────────────┐
│         表示层 (Presentation)        │
│  Controllers + Swagger Documentation │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│         业务层 (Business Logic)      │
│      Services + Business Rules       │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│         数据层 (Data Access)         │
│    Repositories + TypeORM Entities   │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│         数据库 (Database)            │
│            PostgreSQL                │
└─────────────────────────────────────┘
```

---

## 模块设计

### 后端模块结构

```
server/src/
├── app.module.ts              # 根模块
├── main.ts                    # 应用入口
├── common/                    # 通用模块
│   ├── decorators/           # 装饰器
│   ├── filters/              # 异常过滤器
│   ├── guards/               # 守卫
│   ├── interceptors/         # 拦截器
│   └── validators/           # 验证器
├── config/                    # 配置
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── redis.config.ts
│   └── throttler.config.ts
├── modules/                   # 业务模块
│   ├── auth/                 # 认证模块
│   ├── users/                # 用户模块
│   ├── tasks/                # 任务模块
│   ├── time-management/      # 时间管理
│   ├── statistics/           # 统计分析
│   └── notifications/        # 通知模块
├── database/                  # 数据库
│   ├── migrations/           # 迁移文件
│   └── seeds/                # 种子数据
└── utils/                     # 工具类
    ├── logger.util.ts
    ├── password.util.ts
    ├── mail.util.ts
    └── encryption.util.ts
```

### 前端模块结构

```
client/src/
├── App.tsx                    # 根组件
├── main.tsx                   # 应用入口
├── components/                # 组件
│   ├── common/               # 通用组件
│   ├── layout/               # 布局组件
│   ├── tasks/                # 任务组件
│   ├── notifications/        # 通知组件
│   └── statistics/           # 统计组件
├── pages/                     # 页面
│   ├── auth/                 # 认证页面
│   ├── dashboard/            # 仪表板
│   ├── tasks/                # 任务页面
│   ├── time-management/      # 时间管理
│   ├── statistics/           # 统计页面
│   ├── notifications/        # 通知页面
│   └── settings/             # 设置页面
├── router/                    # 路由配置
├── services/                  # API服务
│   ├── api.ts
│   ├── authService.ts
│   ├── taskService.ts
│   ├── timeManagementService.ts
│   ├── statisticsService.ts
│   └── notificationService.ts
├── store/                     # 状态管理
│   ├── index.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── taskSlice.ts
│       └── notificationSlice.ts
├── hooks/                     # 自定义Hooks
│   ├── useDebounce.ts
│   ├── useThrottle.ts
│   └── useIntersectionObserver.ts
├── types/                     # 类型定义
└── styles/                    # 全局样式
```

---

## 数据库设计

### ER图

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────┐       ┌─────────────┐
│    tasks    │◄─────►│ task_notes  │
└──────┬──────┘  1:N  └─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│ attachments │
└─────────────┘
       │
       │
       ▼
┌─────────────┐
│time_records │
└─────────────┘
       │
       │
       ▼
┌──────────────┐
│pomodoro_records│
└──────────────┘
```

### 核心表设计

#### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| username | VARCHAR(50) | 用户名（唯一） |
| email | VARCHAR(100) | 邮箱（唯一） |
| password | VARCHAR(255) | 密码哈希 |
| role | ENUM | 角色（user/admin） |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

#### tasks 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户ID（外键） |
| title | VARCHAR(200) | 任务标题 |
| description | TEXT | 任务描述 |
| status | ENUM | 状态（TODO/IN_PROGRESS/COMPLETED） |
| priority | ENUM | 优先级（LOW/MEDIUM/HIGH/URGENT） |
| category | VARCHAR(50) | 分类 |
| dueDate | TIMESTAMP | 截止时间 |
| completedAt | TIMESTAMP | 完成时间 |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

[更多表设计请参考 database-schema 规则文档]

### 索引设计

主要索引：
- `users(email)` - 登录查询
- `tasks(userId, status)` - 任务列表
- `tasks(userId, priority)` - 优先级筛选
- `tasks(dueDate)` - 截止时间排序
- `time_records(userId, startTime)` - 时间统计
- `notifications(userId, isRead)` - 通知查询

---

## API设计

### RESTful API规范

#### 基础URL
```
开发环境: http://localhost:3000/api/v1
生产环境: https://api.your-domain.com/api/v1
```

#### 认证方式
```
Authorization: Bearer <JWT_TOKEN>
```

#### 响应格式

成功响应：
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

错误响应：
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": []
  }
}
```

### 主要API端点

#### 认证模块
```
POST   /auth/register        # 用户注册
POST   /auth/login           # 用户登录
POST   /auth/refresh         # 刷新token
POST   /auth/logout          # 登出
POST   /auth/forgot-password # 忘记密码
POST   /auth/reset-password  # 重置密码
```

#### 用户模块
```
GET    /users/profile        # 获取个人信息
PUT    /users/profile        # 更新个人信息
PUT    /users/password       # 修改密码
GET    /users/settings       # 获取用户设置
PUT    /users/settings       # 更新用户设置
```

#### 任务模块
```
GET    /tasks                # 获取任务列表
POST   /tasks                # 创建任务
GET    /tasks/:id            # 获取任务详情
PUT    /tasks/:id            # 更新任务
DELETE /tasks/:id            # 删除任务
PATCH  /tasks/:id/status     # 更新任务状态
POST   /tasks/:id/notes      # 添加笔记
POST   /tasks/:id/attachments # 上传附件
```

#### 时间管理模块
```
POST   /time-management/pomodoro/start    # 开始番茄钟
POST   /time-management/pomodoro/complete # 完成番茄钟
GET    /time-management/pomodoro/stats    # 番茄钟统计
GET    /time-management/records           # 工作记录
```

#### 统计模块
```
GET    /statistics/overview               # 概览统计
GET    /statistics/tasks                  # 任务统计
GET    /statistics/time                   # 时间统计
GET    /statistics/export                 # 导出报表
```

#### 通知模块
```
GET    /notifications                     # 获取通知列表
PATCH  /notifications/:id/read            # 标记已读
DELETE /notifications/:id                 # 删除通知
```

[完整API文档请访问 Swagger: `/api/docs`]

---

## 安全设计

### 认证和授权

#### JWT认证流程
```
1. 用户登录 → 验证凭证
2. 生成Access Token (1小时) + Refresh Token (7天)
3. 客户端存储Token（LocalStorage）
4. 每次请求携带Access Token
5. Token过期 → 使用Refresh Token刷新
6. Refresh Token过期 → 重新登录
```

#### 权限控制

```typescript
// 角色权限
@Roles(UserRole.ADMIN)
@Get('admin/users')

// 资源所有权
@UseGuards(ResourceOwnerGuard)
@Get('tasks/:id')

// 速率限制
@SkipThrottle(false)
@Post('login')
```

### 数据安全

1. **传输加密**: HTTPS/TLS
2. **存储加密**: 
   - 密码: BCrypt哈希
   - 敏感数据: AES-256-GCM加密
3. **SQL注入防护**: TypeORM参数化查询
4. **XSS防护**: 输入净化 + CSP头
5. **CSRF防护**: SameSite Cookie

### 安全中间件

```typescript
// Helmet - 安全头
app.use(helmet());

// CORS - 跨域控制
app.enableCors({ origin: allowedOrigins });

// 速率限制
ThrottlerModule.forRoot({ ttl: 60, limit: 100 });

// 数据验证
ValidationPipe({ whitelist: true });
```

---

## 性能优化

### 后端优化

#### 1. 数据库优化
- 索引优化（复合索引、覆盖索引）
- 连接池配置（max: 50, min: 5）
- 查询优化（避免N+1、使用relations）
- 查询缓存（30秒TTL）

#### 2. 缓存策略
```typescript
// Redis缓存
@CacheTTL(300) // 5分钟缓存
async getStatistics() { ... }

// 应用层缓存
const stats = await this.cacheManager.get('stats:user123');
```

#### 3. 响应优化
- Gzip压缩
- 分页查询（默认10条/页）
- 字段选择（只返回需要的字段）

#### 4. 异步处理
- 邮件发送异步化
- 报表生成后台任务

### 前端优化

#### 1. 代码分割
```typescript
// 路由懒加载
const TaskListPage = React.lazy(() => import('./pages/TaskListPage'));

// Vite代码分割
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'ui-vendor': ['antd'],
}
```

#### 2. 性能优化
- 虚拟滚动（VirtualList）
- 防抖/节流（useDebounce, useThrottle）
- 懒加载（useIntersectionObserver）
- React.memo（组件缓存）

#### 3. 资源优化
- 图片压缩和懒加载
- Bundle大小优化（Tree shaking）
- CDN加速

### 监控指标

| 指标 | 目标值 |
|------|--------|
| API响应时间(P95) | < 200ms |
| 数据库查询时间 | < 50ms |
| 首页加载时间 | < 2s |
| Bundle大小（gzip） | < 500KB |
| 缓存命中率 | > 80% |
| 并发支持 | 1000+ |

---

## 扩展性设计

### 水平扩展

```
┌─────┐  ┌─────┐  ┌─────┐
│API 1│  │API 2│  │API 3│
└──┬──┘  └──┬──┘  └──┬──┘
   └────────┼────────┘
            │
    ┌───────▼────────┐
    │ Load Balancer  │
    └───────┬────────┘
            │
    ┌───────▼────────┐
    │     Redis      │ (共享缓存)
    └────────────────┘
            │
    ┌───────▼────────┐
    │  PostgreSQL    │ (主从复制)
    └────────────────┘
```

### 微服务化（未来）

可拆分的服务：
- 认证服务
- 任务服务
- 通知服务
- 统计服务
- 文件服务

---

**文档版本**: 1.0  
**最后更新**: 2025-10-24  
**作者**: 开发团队

