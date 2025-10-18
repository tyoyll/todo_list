# Todo List 前端项目

基于 React 18 + Vite + TypeScript + Ant Design 的现代化前端应用。

## 技术栈

- **框架**: React 18
- **构建工具**: Vite
- **UI 框架**: Ant Design 5
- **状态管理**: Redux Toolkit
- **路由**: React Router v6
- **HTTP 客户端**: Axios
- **CSS 预处理器**: Sass
- **日期处理**: dayjs
- **语言**: TypeScript

## 项目结构

```
client/
├── src/
│   ├── assets/          # 静态资源
│   ├── components/      # 可复用组件
│   │   ├── common/      # 通用组件
│   │   └── layout/      # 布局组件
│   ├── pages/           # 页面组件
│   │   ├── auth/        # 认证相关页面
│   │   ├── dashboard/   # 仪表板
│   │   ├── tasks/       # 任务管理
│   │   ├── settings/    # 设置
│   │   └── error/       # 错误页面
│   ├── store/           # Redux 状态管理
│   │   ├── slices/      # Redux slices
│   │   ├── hooks.ts     # Redux hooks
│   │   └── index.ts     # Store 配置
│   ├── hooks/           # 自定义 Hooks
│   ├── services/        # API 服务
│   │   ├── api.ts       # Axios 实例配置
│   │   └── authService.ts # 认证服务
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── styles/          # 全局样式
│   │   ├── variables.scss # SCSS 变量
│   │   └── global.scss   # 全局样式
│   ├── router/          # 路由配置
│   ├── App.tsx          # 根组件
│   └── main.tsx         # 应用入口
├── public/              # 公共资源
├── .env                 # 环境变量（不提交到 Git）
├── .env.example         # 环境变量示例
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── package.json         # 依赖配置
```

## 已完成的配置

### ✅ 项目初始化
- Vite + React + TypeScript 项目搭建
- 依赖安装和配置
- ESLint 和 Prettier 配置

### ✅ UI 框架配置
- Ant Design 安装和配置
- 主题定制配置
- 全局样式文件（SCSS）
- 样式变量定义

### ✅ 状态管理配置
- Redux Toolkit 安装和配置
- Store 创建和配置
- Auth Slice（认证状态管理）
- 类型安全的 Redux Hooks

### ✅ 路由配置
- React Router v6 安装和配置
- 路由配置文件
- 路由守卫（ProtectedRoute）
- 懒加载配置

### ✅ HTTP 客户端配置
- Axios 实例配置
- 请求/响应拦截器
- Token 自动刷新机制
- 统一错误处理
- Auth Service（认证服务示例）

### ✅ 开发环境配置
- Vite 代理配置（API 代理到后端）
- 路径别名配置（@/ 指向 src/）
- 环境变量配置

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将运行在 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 环境变量

复制 `.env.example` 为 `.env` 并配置：

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:3000/api/v1

# 应用标题
VITE_APP_TITLE=Todo List

# 其他配置
VITE_ENABLE_MOCK=false
```

## 代码规范

### 组件命名
- 组件文件使用 PascalCase：`UserProfile.tsx`
- 组件函数使用 PascalCase：`function UserProfile() {}`

### 文件组织
- 每个功能模块独立目录
- 相关组件放在同一目录下
- 使用 index.ts 导出公共 API

### 状态管理
- 使用 Redux Toolkit 管理全局状态
- 使用 useState/useReducer 管理局部状态
- 避免过度使用全局状态

### 样式规范
- 使用 SCSS 编写样式
- 遵循 BEM 命名规范
- 使用样式变量保持一致性

## API 调用示例

```typescript
import authService from '@/services/authService';

// 登录
const handleLogin = async () => {
  try {
    const response = await authService.login({
      username: 'admin',
      password: 'password',
    });
    console.log('登录成功', response);
  } catch (error) {
    console.error('登录失败', error);
  }
};
```

## Redux 使用示例

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, logout } from '@/store/slices/authSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return <div>{user?.username}</div>;
}
```

## 下一步

1. 实现具体的页面组件
2. 完善 API 服务
3. 添加单元测试
4. 优化用户体验

## 注意事项

- 所有 API 请求会自动添加 Authorization header
- Token 过期会自动刷新
- 401 错误会自动跳转到登录页
- 使用懒加载提高首屏加载速度

