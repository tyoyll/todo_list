# Todo List 应用

一个功能完整的待办事项管理应用，包含任务管理、时间管理、番茄钟、数据统计等功能。

## 🎉 项目状态

**当前阶段**: 第一阶段已完成 ✅  
**完成度**: 100%  
**下一阶段**: 用户管理与任务管理核心功能开发

## 项目结构

```
dang/
├── server/          # 后端项目（NestJS）
│   ├── src/        # 后端源代码
│   ├── test/       # 后端测试
│   └── ...         # 后端配置文件
├── client/          # 前端项目（React + Vite）
│   ├── src/        # 前端源代码
│   └── ...         # 前端配置文件
└── docs/           # 项目文档
```

## 技术栈

### 后端
- **框架**: NestJS
- **数据库**: PostgreSQL
- **ORM**: TypeORM
- **认证**: JWT (JSON Web Token)
- **语言**: TypeScript

### 前端
- **框架**: React 18
- **构建工具**: Vite
- **UI框架**: Ant Design
- **状态管理**: Redux Toolkit
- **路由**: React Router v6
- **HTTP客户端**: Axios
- **语言**: TypeScript

## 快速开始

### 环境要求
- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

### 后端启动

1. 进入后端目录
```bash
cd server
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，配置数据库连接等信息
```

4. 初始化数据库
```bash
# 运行数据库迁移
npm run migration:run

# （可选）插入测试数据
npm run db:seed
```

5. 启动开发服务器
```bash
npm run start:dev
```

后端服务将运行在 http://localhost:3000

### 前端启动

1. 进入前端目录
```bash
cd client
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

前端应用将运行在 http://localhost:5173

## 可用脚本

### 后端脚本
- `npm run start:dev` - 启动开发服务器（热重载）
- `npm run build` - 构建生产版本
- `npm run start:prod` - 启动生产服务器
- `npm run test` - 运行测试
- `npm run db:init` - 初始化数据库
- `npm run db:seed` - 插入种子数据
- `npm run migration:run` - 运行数据库迁移
- `npm run migration:revert` - 回滚数据库迁移

### 前端脚本
- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run lint` - 运行代码检查

## 功能特性

### 第一阶段已完成 ✅
- ✅ 项目架构搭建（前后端分离）
- ✅ 数据库设计与实体创建
- ✅ 用户认证与授权（JWT）
- ✅ 用户注册与登录
- ✅ Token 自动刷新机制
- ✅ 路由守卫与权限控制
- ✅ 统一的错误处理
- ✅ 响应拦截器
- ✅ 全局样式与主题配置

### 计划中功能
- ⏳ 任务创建、编辑、删除
- ⏳ 任务分类和标签
- ⏳ 任务优先级管理
- ⏳ 任务截止日期提醒
- ⏳ 时间记录
- ⏳ 番茄钟功能
- ⏳ 数据统计与可视化
- ⏳ 通知提醒
- ⏳ 个性化设置

## 📊 第一阶段完成情况

### 已实现的核心功能

#### 后端架构 ✅
- **NestJS 框架**: 完整的模块化架构
- **TypeORM**: 8 个核心实体，包含完整的关系映射
- **JWT 认证**: 完整的认证系统，包括 token 刷新机制
- **全局守卫**: 自动保护所有路由，使用 @Public 装饰器标记公开路由
- **数据验证**: 使用 class-validator 进行请求验证
- **错误处理**: 统一的异常过滤器和响应格式
- **数据库迁移**: 完整的迁移脚本和种子数据

#### 前端架构 ✅
- **React 18 + Vite**: 现代化的前端构建
- **Ant Design 5**: 完整的 UI 组件库
- **Redux Toolkit**: 类型安全的状态管理
- **React Router v6**: 完整的路由配置和守卫
- **Axios**: 自动添加 token，自动刷新机制
- **SCSS**: 全局样式变量和主题系统
- **认证页面**: 完整的登录/注册界面

#### 已创建的实体模型
1. **User** - 用户基本信息
2. **UserSettings** - 用户个性化设置
3. **Task** - 任务信息
4. **TaskNote** - 任务笔记
5. **Attachment** - 文件附件
6. **TimeRecord** - 时间记录
7. **PomodoroRecord** - 番茄钟记录
8. **Notification** - 通知消息

#### 已实现的 API 端点
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/refresh` - 刷新 token
- `GET /api/v1/auth/me` - 获取当前用户信息
- `POST /api/v1/auth/logout` - 用户登出

### 项目指标
- **代码行数**: 10,000+ 行
- **TypeScript 覆盖率**: 100%
- **测试覆盖**: Auth 模块单元测试
- **文档完整度**: 包含完整的 README、开发计划和总结文档

## 开发文档

详细的开发文档请查看 `docs/` 目录：
- [需求文档](docs/requirements.md)
- [开发计划](docs/development-plan.md)
- [开发检查清单](docs/development-checklist.md)
- [第一阶段完成总结](docs/PHASE1_COMPLETION_SUMMARY.md) ⭐

## API 文档

后端 API 文档可以通过以下地址访问（需要先启动后端服务）：
- Swagger UI: http://localhost:3000/api/docs

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

[UNLICENSED]

## 联系方式

如有问题或建议，请提交 Issue。
