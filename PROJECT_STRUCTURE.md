# 项目结构说明

## 目录重组

本项目已完成前后端分离的目录结构重组。

### 新的项目结构

```
dang/
├── server/                 # 后端项目（NestJS）
│   ├── src/               # 后端源代码
│   │   ├── common/        # 通用模块（过滤器、拦截器、装饰器等）
│   │   ├── config/        # 配置文件
│   │   ├── database/      # 数据库相关（迁移、种子数据）
│   │   ├── modules/       # 功能模块
│   │   │   ├── users/     # 用户模块
│   │   │   ├── tasks/     # 任务模块
│   │   │   ├── time-management/  # 时间管理模块
│   │   │   └── notifications/    # 通知模块
│   │   ├── types/         # TypeScript 类型定义
│   │   ├── utils/         # 工具函数
│   │   ├── app.module.ts  # 根模块
│   │   └── main.ts        # 应用入口
│   ├── test/              # 后端测试
│   ├── .env               # 环境变量（不提交到Git）
│   ├── .env.example       # 环境变量示例
│   ├── package.json       # 后端依赖
│   ├── tsconfig.json      # TypeScript配置
│   └── nest-cli.json      # NestJS配置
│
├── client/                # 前端项目（React + Vite）
│   ├── src/              # 前端源代码
│   │   ├── assets/       # 静态资源
│   │   ├── components/   # 可复用组件
│   │   ├── pages/        # 页面组件
│   │   ├── store/        # Redux状态管理
│   │   ├── hooks/        # 自定义Hooks
│   │   ├── services/     # API服务
│   │   ├── types/        # TypeScript类型定义
│   │   ├── utils/        # 工具函数
│   │   ├── styles/       # 全局样式
│   │   ├── App.tsx       # 根组件
│   │   └── main.tsx      # 应用入口
│   ├── public/           # 公共资源
│   ├── package.json      # 前端依赖
│   ├── tsconfig.json     # TypeScript配置
│   └── vite.config.ts    # Vite配置
│
├── docs/                 # 项目文档
│   ├── requirements.md   # 需求文档
│   ├── development-plan.md  # 开发计划
│   └── development-checklist.md  # 开发检查清单
│
├── package.json          # 根目录包管理（用于同时运行前后端）
├── .gitignore           # Git忽略文件
└── README.md            # 项目说明文档
```

### 旧文件清理说明

⚠️ **注意：以下旧文件/目录可以删除**

根目录下的以下文件/目录是旧的后端文件，已经复制到`server/`目录中，可以安全删除：

- `src/` - 旧的后端源代码目录（已移至 server/src/）
- `test/` - 旧的测试目录（已移至 server/test/）
- `dist/` - 旧的构建输出目录（会在server/目录重新生成）

**删除命令（PowerShell）：**
```powershell
Remove-Item -Path src -Recurse -Force
Remove-Item -Path test -Recurse -Force
Remove-Item -Path dist -Recurse -Force
```

### 启动项目

#### 方式一：分别启动（推荐开发时使用）

**后端：**
```bash
cd server
npm install      # 首次运行需要安装依赖
npm run start:dev
```

**前端：**
```bash
cd client
npm install      # 首次运行需要安装依赖
npm run dev
```

#### 方式二：同时启动（使用根目录脚本）

```bash
# 在根目录执行
npm run dev
```

这会同时启动前后端开发服务器。

### 端口说明

- 后端 API：http://localhost:3000
- 前端应用：http://localhost:5173

### 技术栈

**后端：**
- NestJS 10
- TypeORM
- PostgreSQL
- JWT认证
- TypeScript

**前端：**
- React 18
- Vite
- Ant Design
- Redux Toolkit
- React Router v6
- Axios
- TypeScript

### 下一步

1. ✅ 项目结构重组完成
2. ✅ 前端项目初始化完成
3. ⏳ 配置前端路由和状态管理
4. ⏳ 实现用户认证系统
5. ⏳ 开发任务管理功能

