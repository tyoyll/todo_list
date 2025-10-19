# NestJS 知识点思维导图

这份思维导图使用 Mermaid 语法绘制，覆盖 NestJS 面试核心知识点。你可以在支持 Mermaid 的工具中渲染（如 GitHub、VS Code with Mermaid Preview 插件，或 https://mermaid.live/）。

## 思维导图

```mermaid
mindmap
  root((NestJS 面试知识点))
    核心架构
      模块(Module)
        动态模块
        全局模块
      控制器(Controller)
        路由装饰器
        参数装饰器
      服务(Service)
        提供者(Provider)
        依赖注入
    依赖注入(DI)
      IoC 容器
      作用域(Scope)
        DEFAULT
        REQUEST
        TRANSIENT
      自定义 Provider
        useClass
        useValue
        useFactory
    请求生命周期
      Middleware
      Guard
      Interceptor
      Pipe
      Controller
      Filter
    中间件生态
      Middleware(中间件)
        模块绑定
        全局中间件
      Guard(守卫)
        CanActivate
        认证守卫
      Interceptor(拦截器)
        NestInterceptor
        RxJS 支持
      Pipe(管道)
        PipeTransform
        ValidationPipe
      Filter(异常过滤器)
        ExceptionFilter
        全局过滤器
    数据库集成
      TypeORM
        实体(Entity)
        仓库(Repository)
        关系映射
      Mongoose
        Schema
        Model
      Prisma
        Schema 文件
        Client 生成
      查询优化
        N+1 问题
        Eager Loading
    认证授权
      JWT
        JwtModule
        JwtStrategy
      Passport
        Local Strategy
        JWT Strategy
      RBAC
        Roles Guard
        ACL
      OAuth
        Google
        GitHub
    测试
      单元测试(Jest)
        TestingModule
        Mocking
      E2E 测试
        Supertest
        Test Client
      集成测试
    微服务
      gRPC
      TCP
      RabbitMQ
      消息模式
        Request-Response
        Event-based
    高级主题
      性能优化
        Throttler
        Cache Manager
      日志
        Nest Logger
        Winston
      部署(Docker/PM2)
      GraphQL
        Apollo
        Schema First
      WebSocket
        Socket.io
        Gateway
```

## 渲染说明
- **如何查看**：复制以上 Mermaid 代码到 https://mermaid.live/ 或 Markdown 编辑器中渲染。
- **结构说明**：
  - **根节点**：NestJS 面试知识点
  - **主要分支**：按主题分类，每个分支有子节点
  - **颜色/样式**：Mermaid 默认渲染，你可以自定义

如果需要调整导图（例如添加/删除节点）或生成其他格式（如 PNG 图片），请告诉我！
