# NestJS 远程面试准备计划

你好！作为你的 AI 编程导师，我已经为你制定了一份针对 NestJS 远程面试的14天准备计划。这份计划假设你有基本的 Node.js 知识，重点聚焦 NestJS 的核心概念、面试题准备和实战练习。我会用简单易懂的语言解释每个部分，并包含代码示例来帮助你理解。

计划设计为每天3-4小时学习+练习，适合初级到中级开发者。每天结束时，建议你自测知识点，并记录问题。

---

## 📋 NestJS 远程面试准备计划

### 🎯 总体目标
- 掌握 NestJS 核心架构和最佳实践
- 熟练回答高频面试题
- 完成3个实战项目，积累 GitHub 作品
- 适应远程面试环境（代码分享、屏幕演示）

### 📅 时间安排
- **总时长**：14天
- **每日结构**：2小时理论学习 + 1小时代码实践 + 30分钟面试题复习
- **周末重点**：项目实战和模拟面试
- **资源准备**：安装 NestJS CLI (`npm i -g @nestjs/cli`)，准备 VS Code 远程调试环境

### 🔑 NestJS 知识点概述
NestJS 是一个基于 Node.js 的渐进式框架，结合了 OOP、FP 和 FRP 元素。主要知识点包括：
- **模块系统**：组织代码的单元
- **依赖注入**：自动管理依赖
- **控制器和服务**：处理请求和业务逻辑
- **中间件生态**：Middleware、Guard、Interceptor、Pipe、Filter
- **数据库集成**：TypeORM
- **认证**：JWT
- **测试**：Jest

---

## 14天详细计划

### 第1-2天：NestJS 基础与架构
**学习内容**：
- 安装 NestJS 并创建第一个项目 (`nest new project`)
- 理解模块、控制器、服务
- 依赖注入基本使用

**代码示例**（简单 Hello World API）：
```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

// app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello NestJS!';
  }
}
```
**解释**：这是一个基本的依赖注入示例。服务被注入到控制器中，展示 NestJS 的分层结构。

**面试题准备**：
1. **NestJS 的优势是什么？**
   - 答案：内置依赖注入、模块化、TypeScript 支持、易测试。相比 Express，更适合大型应用，因为它强制结构化代码。
2. **什么是依赖注入？**
   - 答案：一种设计模式，由容器自动提供依赖对象，好处是降低耦合，提高可测试性。

**实践任务**：创建一个简单的 CRUD API，运行 `npm run start:dev` 测试。

### 第3-4天：请求生命周期与中间件
**学习内容**：
- 请求生命周期顺序：Middleware → Guard → Interceptor → Pipe → Controller
- 实现全局中间件

**代码示例**（自定义 Guard）：
```typescript
// auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return !!request.headers.authorization; // 简单检查
  }
}

// 使用
@Get('protected')
@UseGuards(AuthGuard)
protectedRoute() {
  return 'Protected content';
}
```
**解释**：Guard 用于权限检查，如果返回 false，请求将被拒绝。这展示了 NestJS 的请求过滤机制。

**面试题准备**：
3. **Interceptor 和 Middleware 的区别？**
   - 答案：Interceptor 支持 RxJS 和前后转换，Middleware 更接近 Express，适合修改 req/res。
4. **如何实现全局异常处理？**
   - 答案：使用 ExceptionFilter，统一返回错误格式。

**实践任务**：添加 ValidationPipe 验证输入数据。

### 第5-6天：数据库集成（TypeORM）
**学习内容**：
- 配置 TypeORM
- 实体设计和关系映射

**代码示例**（实体和仓库）：
```typescript
// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}

// user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
```
**解释**：TypeORM 使用装饰器定义实体，仓库模式处理数据操作。适合关系型数据库。

**面试题准备**：
5. **什么是 N+1 查询问题？如何解决？**
   - 答案：查询列表后为每个项查询关联数据，导致 N+1 次查询。解决：使用 eager loading 或 join 查询。
6. **TypeORM 关系映射类型？**
   - 答案：@OneToOne, @OneToMany, @ManyToOne, @ManyToMany。

**实践任务**：实现用户表 CRUD。

### 第7-8天：认证与授权
**学习内容**：
- JWT 认证
- Passport 集成

**代码示例**（JWT 登录）：
```typescript
// auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

// auth.controller.ts
import { Post, Body } from '@nestjs/common';

@Post('login')
async login(@Body() loginDto: LoginDto) {
  // 验证用户
  const user = await this.authService.validateUser(loginDto.username, loginDto.password);
  if (user) {
    return this.authService.login(user);
  }
}
```
**解释**：JWT 生成 token，用于无状态认证。token 包含用户 payload，服务器验证签名。

**面试题准备**：
7. **JWT 的工作原理？**
   - 答案：Header.Payload.Signature 结构，服务器签名验证。优势：无状态；缺点：无法撤销，除非黑名单。
8. **如何实现角色基于访问控制（RBAC）？**
   - 答案：使用 Guard 检查用户角色。

**实践任务**：添加登录路由和守卫保护。

### 第9-10天：测试与部署
**学习内容**：
- Jest 单元测试
- Docker 部署

**代码示例**（单元测试）：
```typescript
import { Test } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return hello', () => {
    expect(service.getHello()).toBe('Hello World!');
  });
});
```
**解释**：测试模块模拟依赖，检查服务方法是否正确。

**面试题准备**：
9. **如何编写 NestJS 测试？**
   - 答案：使用 Test.createTestingModule 模拟模块，测试控制器和服务。
10. **NestJS 部署最佳实践？**
    - 答案：使用 PM2 进程管理、Docker 容器化、Nginx 反代。

**实践任务**：为项目编写测试用例。

### 第11-12天：实战项目
**学习内容**：
- 整合所有知识构建项目
- 代码审查

**面试题准备**：
11. **NestJS 项目结构？**
    - 答案：模块化（controllers/services/entities/dto），按功能划分。
12. **如何处理异步操作？**
    - 答案：使用 RxJS 或 Async/Await。

**实践任务**：完成3个项目（见下文）。

### 第13-14天：面试模拟与复习
**学习内容**：
- 模拟远程面试
- 复习所有知识点

**面试题准备**：
13. **什么是依赖注入容器？**
    - 答案：NestJS IoC 容器管理对象生命周期。
14. **如何优化 NestJS 性能？**
    - 答案：缓存、限流、异步处理。

**实践任务**：录制模拟面试视频，自评改进。

---

## 高频面试题及答案（20题）

### 基础题
1. **NestJS 是什么？优势？**
   - 答案：渐进式 Node.js 框架。优势：模块化、依赖注入、内置 TypeScript 支持、易扩展。

2. **模块在 NestJS 中的作用？**
   - 答案：组织代码单元，定义 providers/controllers/imports/exports。

### 中级题
3. **解释 ValidationPipe。**
   - 答案：验证输入数据，使用 class-validator 装饰器。

4. **如何实现文件上传？**
   - 答案：使用 @nestjs/platform-express 和 Multer 中间件。

### 高级题
5. **微服务在 NestJS 中的实现？**
   - 答案：使用 @nestjs/microservices，支持 gRPC/TCP/MQTT。

6. **什么是请求生命周期？**
   - 答案：从 Middleware 到 Filter 的完整流程。

7. **如何处理异常？**
   - 答案：自定义 ExceptionFilter。

8. **依赖注入作用域？**
   - 答案：DEFAULT (单例)、REQUEST (每请求新实例)、TRANSIENT (每次新实例)。

9. **TypeORM 迁移如何实现？**
   - 答案：使用 CLI 生成迁移文件，定义 up/down 方法。

10. **NestJS 测试策略？**
    - 答案：单元测试服务，E2E 测试 API。

11. **JWT 刷新 token 机制？**
    - 答案：使用 refresh token 生成新 access token。

12. **如何实现缓存？**
    - 答案：使用 @nestjs/cache-manager 模块。

13. **Guard vs Interceptor？**
    - 答案：Guard 用于权限控制，Interceptor 用于数据转换。

14. **动态模块是什么？**
    - 答案：运行时配置的模块，如 ConfigModule.forRoot()。

15. **如何集成 GraphQL？**
    - 答案：使用 @nestjs/graphql 模块。

16. **性能优化技巧？**
    - 答案：Throttler 限流、缓存、异步服务。

17. **如何处理文件下载？**
    - 答案：使用 res.download() 或 Stream。

18. **自定义装饰器？**
    - 答案：使用 createParamDecorator。

19. **NestJS 微服务通信？**
    - 答案：TCP、Redis、gRPC 等传输器。

20. **如何实现 WebSocket？**
    - 答案：使用 @nestjs/websockets 模块。

---

## 实战项目推荐（3个）

1. **NestJS CRUD Starter**
   - GitHub：https://github.com/nestjs/nest/tree/master/sample/01-crud
   - 技术栈：NestJS + TypeORM + Swagger
   - 特点：适合入门，包含完整 CRUD 和测试。练习模块和依赖注入。

2. **NestJS Blog API**
   - GitHub：https://github.com/ixartz/nestjs-blog-api
   - 技术栈：NestJS + PostgreSQL + JWT
   - 特点：真实博客系统，包含认证和数据库操作。练习 API 设计。

3. **NestJS Microservices Example**
   - GitHub：https://github.com/nestjs/nest/tree/master/sample/25-microservices
   - 技术栈：NestJS + gRPC + Docker
   - 特点：微服务架构示范，适合高级面试。练习分布式系统。

---

## 进一步学习建议

- **资源**：NestJS 官方文档、Udemy "NestJS Zero to Hero" 课程
- **实践**：基于以上项目添加功能，如集成 Redis 缓存
- **社区**：加入 NestJS Discord，参与讨论
- **下一步骤**：完成1个项目后，找朋友模拟面试

这份计划全面覆盖 NestJS 面试所需知识。如果你对代码示例有疑问，我可以一步步解释！现在我将生成 MD 文件。 
