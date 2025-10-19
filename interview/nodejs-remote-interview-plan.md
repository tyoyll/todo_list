## 📋 目录
- [面试准备概览](#面试准备概览)
- [第1周：Node.js 基础巩固](#第1周nodejs-基础巩固)
- [第2周：核心概念深入](#第2周核心概念深入)
- [第3周：实战项目与性能优化](#第3周实战项目与性能优化)
- [第4周：面试冲刺与模拟](#第4周面试冲刺与模拟)
- [高频面试题及答案](#高频面试题及答案)
- [实战项目推荐](#实战项目推荐)
- [面试技巧与注意事项](#面试技巧与注意事项)

---

## 面试准备概览

### 🎯 目标
- 掌握 Node.js 核心概念和原理
- 能够熟练回答技术面试问题
- 具备实际项目开发经验
- 掌握远程面试技巧

### 📅 时间安排
- **总时长**：30天
- **每日学习时间**：3-4小时
- **周末实战**：6-8小时

### 🎯 学习成果
- 完成3个实战项目
- 掌握50+个面试题
- 具备中级 Node.js 开发能力

---

## 第1周：Node.js 基础巩固

### Day 1-2：事件循环与异步编程

#### 学习内容
**事件循环机制**
```javascript
// 理解事件循环的六个阶段
console.log('1');

setTimeout(() => {
  console.log('2 - setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('3 - Promise');
});

process.nextTick(() => {
  console.log('4 - nextTick');
});

console.log('5');

// 输出顺序：1 → 5 → 4 → 3 → 2
```

**面试题准备**
1. **什么是事件循环？**
   - **答案**：事件循环是 Node.js 实现异步非阻塞 I/O 的核心机制
   - **六个阶段**：timers → pending callbacks → idle → poll → check → close callbacks
   - **微任务队列**：process.nextTick() 和 Promise.then()

2. **process.nextTick() 和 setImmediate() 的区别？**
   - **答案**：nextTick 优先级最高，在当前阶段完成后立即执行；setImmediate 在 check 阶段执行
   - **代码示例**：
   ```javascript
   setImmediate(() => console.log('immediate'));
   process.nextTick(() => console.log('nextTick'));
   // 输出：nextTick → immediate
   ```

#### 实战练习
- 编写事件循环执行顺序测试
- 实现自定义 EventEmitter

### Day 3-4：模块系统与包管理

#### 学习内容
**CommonJS vs ES Modules**
```javascript
// CommonJS
const fs = require('fs');
module.exports = { myFunction };

// ES Modules
import fs from 'fs';
export { myFunction };
```

**面试题准备**
3. **Node.js 的模块加载机制？**
   - **答案**：缓存机制、路径解析、核心模块优先
   - **加载顺序**：核心模块 → 相对路径 → 绝对路径 → node_modules

4. **npm 和 yarn 的区别？**
   - **答案**：yarn 更快、更安全、支持离线模式、lockfile 更稳定

#### 实战练习
- 创建自定义 npm 包
- 配置 package.json 和发布流程

### Day 5-7：Stream 流处理

#### 学习内容
**Stream 四种类型**
```javascript
const fs = require('fs');
const { Transform } = require('stream');

// 读取大文件
const readStream = fs.createReadStream('large-file.txt', {
  highWaterMark: 16 * 1024 // 16KB 缓冲区
});

// 管道操作
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('output.txt.gz'));
```

**面试题准备**
5. **Stream 的优势是什么？**
   - **答案**：内存效率高、时间效率高、支持管道操作、适合处理大文件

6. **如何处理背压（Backpressure）？**
   - **答案**：使用 pipe() 自动处理，或监听 'drain' 事件手动控制

#### 实战练习
- 实现文件上传功能
- 创建数据转换流

---

## 第2周：核心概念深入

### Day 8-10：HTTP 服务器与 Express

#### 学习内容
**原生 HTTP 服务器**
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello World' }));
});

server.listen(3000, () => {
  console.log('服务器运行在端口 3000');
});
```

**Express 框架**
```javascript
const express = require('express');
const app = express();

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 路由
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000);
```

**面试题准备**
7. **Express 中间件的工作原理？**
   - **答案**：中间件是按顺序执行的函数，可以访问 req、res、next 对象

8. **如何实现 RESTful API？**
   - **答案**：使用 HTTP 动词（GET、POST、PUT、DELETE）和资源路径

#### 实战练习
- 构建完整的 RESTful API
- 实现用户认证系统

### Day 11-13：数据库集成

#### 学习内容
**MongoDB 集成**
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// 连接数据库
mongoose.connect('mongodb://localhost:27017/myapp');
```

**MySQL 集成**
```javascript
const mysql = require('mysql2/promise');

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'myapp'
});

const [rows] = await connection.execute('SELECT * FROM users');
```

**面试题准备**
9. **如何防止 SQL 注入？**
   - **答案**：使用参数化查询，永远不要拼接 SQL 字符串

10. **MongoDB 和 MySQL 的区别？**
    - **答案**：MongoDB 是文档数据库，MySQL 是关系数据库；MongoDB 更灵活，MySQL 更结构化

#### 实战练习
- 实现用户 CRUD 操作
- 设计数据库关系模型

### Day 14：测试与调试

#### 学习内容
**Jest 测试**
```javascript
const request = require('supertest');
const app = require('../app');

describe('GET /api/users', () => {
  test('应该返回用户列表', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
    
    expect(response.body).toHaveProperty('users');
  });
});
```

**调试技巧**
```javascript
// 使用 debugger
debugger;

// 使用 console.trace()
console.trace('调用栈');

// 使用 Node.js 调试器
node --inspect app.js
```

**面试题准备**
11. **如何调试 Node.js 应用？**
    - **答案**：使用 console.log、debugger、Node.js 调试器、第三方工具如 ndb

12. **如何编写单元测试？**
    - **答案**：使用 Jest 或 Mocha，测试覆盖率 > 80%，模拟外部依赖

---

## 第3周：实战项目与性能优化

### Day 15-17：项目一：任务管理 API

#### 项目要求
- 用户注册/登录
- 任务 CRUD 操作
- JWT 认证
- 数据验证
- 错误处理

#### 技术栈
- Node.js + Express
- MongoDB + Mongoose
- JWT 认证
- Jest 测试

#### 核心代码示例
```javascript
// 用户认证中间件
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 任务模型
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
```

#### GitHub 项目
**推荐项目**：[Node.js Task Manager API](https://github.com/your-username/nodejs-task-manager)

### Day 18-20：项目二：实时聊天应用

#### 项目要求
- WebSocket 实时通信
- 房间管理
- 消息历史
- 用户在线状态

#### 技术栈
- Node.js + Socket.io
- Redis 缓存
- Express 静态文件服务

#### 核心代码示例
```javascript
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  // 加入房间
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // 发送消息
  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('new-message', {
      id: socket.id,
      message: data.message,
      timestamp: new Date()
    });
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log('用户断开:', socket.id);
  });
});
```

#### GitHub 项目
**推荐项目**：[Real-time Chat App](https://github.com/your-username/realtime-chat-app)

### Day 21-23：项目三：微服务架构

#### 项目要求
- 用户服务
- 订单服务
- API 网关
- 服务发现

#### 技术栈
- Node.js + Express
- Docker 容器化
- Nginx 负载均衡
- Redis 消息队列

#### 核心代码示例
```javascript
// API 网关
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 用户服务代理
app.use('/api/users', createProxyMiddleware({
  target: 'http://user-service:3001',
  changeOrigin: true
}));

// 订单服务代理
app.use('/api/orders', createProxyMiddleware({
  target: 'http://order-service:3002',
  changeOrigin: true
}));
```

#### GitHub 项目
**推荐项目**：[Node.js Microservices](https://github.com/your-username/nodejs-microservices)

### Day 24-26：性能优化

#### 学习内容
**集群模式**
```javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
    cluster.fork();
  });
} else {
  require('./app.js');
}
```

**缓存策略**
```javascript
const redis = require('redis');
const client = redis.createClient();

// 缓存用户数据
const getUser = async (id) => {
  const cached = await client.get(`user:${id}`);
  if (cached) return JSON.parse(cached);
  
  const user = await db.getUser(id);
  await client.setex(`user:${id}`, 3600, JSON.stringify(user));
  return user;
};
```

**面试题准备**
13. **如何优化 Node.js 性能？**
    - **答案**：使用集群、缓存、CDN、数据库优化、代码优化

14. **如何处理内存泄漏？**
    - **答案**：避免全局变量、清除定时器、移除事件监听器、使用 WeakMap

---

## 第4周：面试冲刺与模拟

### Day 27-28：高频面试题复习

#### 核心概念题
15. **Node.js 是单线程的吗？**
    - **答案**：主线程是单线程，但 I/O 操作是多线程的，通过事件循环处理

16. **什么是回调地狱？如何避免？**
    - **答案**：多层嵌套回调，使用 Promise、Async/Await、模块化解决

17. **如何实现文件上传？**
    - **答案**：使用 multer 中间件处理 multipart/form-data

#### 架构设计题
18. **如何设计一个高并发的 Web 应用？**
    - **答案**：负载均衡、数据库分片、缓存、CDN、微服务

19. **如何实现分布式锁？**
    - **答案**：使用 Redis SETNX、Zookeeper、数据库唯一索引

### Day 29-30：模拟面试

#### 技术面试模拟
**场景1：系统设计**
- 设计一个短链接服务
- 需要考虑：存储、缓存、算法、扩展性

**场景2：代码审查**
- 审查一段有问题的 Node.js 代码
- 指出问题并提供解决方案

**场景3：故障排查**
- 应用响应慢，如何排查？
- 内存使用过高，如何解决？

#### 远程面试技巧
1. **技术准备**
   - 确保网络稳定
   - 准备代码编辑器
   - 测试屏幕共享功能

2. **面试技巧**
   - 先理解问题再回答
   - 用代码示例说明
   - 主动询问细节

3. **常见问题**
   - 自我介绍
   - 项目经验
   - 技术选型理由
   - 职业规划

---

## 高频面试题及答案

### 基础概念题（10题）

#### 1. 什么是 Node.js？它的优势是什么？

**答案**：
Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境。

**优势**：
- 非阻塞 I/O，适合 I/O 密集型应用
- 单线程事件循环，减少上下文切换
- NPM 生态丰富
- 前后端统一语言
- 高并发处理能力

**代码示例**：
```javascript
// 非阻塞 I/O 示例
const fs = require('fs');

console.log('开始读取文件');

fs.readFile('large-file.txt', (err, data) => {
  if (err) throw err;
  console.log('文件读取完成');
});

console.log('继续执行其他代码');
// 输出：开始读取文件 → 继续执行其他代码 → 文件读取完成
```

#### 2. 解释 Node.js 的事件循环机制

**答案**：
事件循环是 Node.js 实现异步非阻塞 I/O 的核心机制。

**六个阶段**：
1. timers：执行 setTimeout 和 setInterval 回调
2. pending callbacks：执行延迟到下一个循环的 I/O 回调
3. idle, prepare：内部使用
4. poll：检索新的 I/O 事件
5. check：执行 setImmediate 回调
6. close callbacks：执行关闭事件的回调

**代码示例**：
```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);
setImmediate(() => console.log('3'));
process.nextTick(() => console.log('4'));
Promise.resolve().then(() => console.log('5'));

console.log('6');

// 输出：1 → 6 → 4 → 5 → 2 → 3
```

#### 3. process.nextTick() 和 setImmediate() 的区别？

**答案**：
- `process.nextTick()`：在当前阶段完成后立即执行，优先级最高
- `setImmediate()`：在事件循环的 check 阶段执行

**代码示例**：
```javascript
setImmediate(() => console.log('immediate'));
process.nextTick(() => console.log('nextTick'));

// 输出：nextTick → immediate

// 在 I/O 回调中
fs.readFile('file.txt', () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
  // 输出：immediate → timeout
});
```

#### 4. 什么是回调地狱？如何避免？

**答案**：
回调地狱是指多层嵌套的回调函数，导致代码难以阅读和维护。

**❌ 回调地狱示例**：
```javascript
fs.readFile('file1.txt', (err, data1) => {
  if (err) throw err;
  fs.readFile('file2.txt', (err, data2) => {
    if (err) throw err;
    fs.readFile('file3.txt', (err, data3) => {
      if (err) throw err;
      console.log(data1, data2, data3);
    });
  });
});
```

**✅ 解决方案1：Promise**
```javascript
const readFile = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

readFile('file1.txt')
  .then(data1 => readFile('file2.txt'))
  .then(data2 => readFile('file3.txt'))
  .then(data3 => console.log(data3))
  .catch(err => console.error(err));
```

**✅ 解决方案2：Async/Await**
```javascript
async function readFiles() {
  try {
    const data1 = await readFile('file1.txt');
    const data2 = await readFile('file2.txt');
    const data3 = await readFile('file3.txt');
    console.log(data1, data2, data3);
  } catch (err) {
    console.error(err);
  }
}
```

#### 5. Stream 的优势是什么？如何使用？

**答案**：
Stream 允许逐块处理数据，而不是一次性加载到内存。

**优势**：
- 内存效率高（适合大文件）
- 时间效率高（边读边处理）
- 支持管道操作

**代码示例**：
```javascript
const fs = require('fs');
const zlib = require('zlib');

// ❌ 不推荐：占用大量内存
const data = fs.readFileSync('large-file.txt');

// ✅ 推荐：使用 Stream
const readStream = fs.createReadStream('large-file.txt', {
  highWaterMark: 16 * 1024 // 16KB 缓冲区
});

readStream.on('data', (chunk) => {
  console.log(`接收 ${chunk.length} 字节`);
});

readStream.on('end', () => {
  console.log('读取完成');
});

// 管道操作
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('output.txt.gz'));
```

#### 6. 如何利用多核 CPU？

**答案**：
Node.js 是单线程的，但可以通过 Cluster 模块利用多核。

**代码示例**：
```javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);
  
  // 为每个 CPU 创建工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
    cluster.fork(); // 重启崩溃的进程
  });
} else {
  // 工作进程启动服务器
  require('./app.js');
  console.log(`工作进程 ${process.pid} 已启动`);
}
```

#### 7. 什么是中间件？如何在 Express 中使用？

**答案**：
中间件是一个函数，可以访问请求对象（req）、响应对象（res）和下一个中间件（next）。

**代码示例**：
```javascript
const express = require('express');
const app = express();

// 应用级中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 路由级中间件
app.get('/users', 
  (req, res, next) => {
    console.log('检查权限');
    next();
  },
  (req, res) => {
    res.json({ users: [] });
  }
);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('服务器错误');
});
```

#### 8. 如何防止 SQL 注入？

**答案**：
使用参数化查询，永远不要拼接 SQL 字符串。

**❌ 不安全的做法**：
```javascript
const userId = req.params.id;
const user = await connection.query(
  `SELECT * FROM users WHERE id = '${userId}'`
);
```

**✅ 安全的做法**：
```javascript
const user = await connection.query(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);
```

#### 9. 如何调试 Node.js 应用？

**答案**：
使用多种调试方法：

**代码示例**：
```javascript
// 1. console.log 调试
console.log('变量值:', variable);

// 2. debugger 语句
debugger;

// 3. console.trace() 查看调用栈
console.trace('调用栈');

// 4. Node.js 调试器
// node --inspect app.js
// 然后在 Chrome 中打开 chrome://inspect

// 5. 使用 ndb
// npm install -g ndb
// ndb app.js
```

#### 10. 如何编写单元测试？

**答案**：
使用 Jest 或 Mocha 编写测试，确保覆盖率 > 80%。

**代码示例**：
```javascript
const request = require('supertest');
const app = require('../app');

describe('GET /api/users', () => {
  test('应该返回用户列表', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
    
    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
  });

  test('应该返回 401 当没有认证', async () => {
    await request(app)
      .get('/api/users')
      .expect(401);
  });
});
```

### 架构设计题（10题）

#### 11. 如何设计一个高并发的 Web 应用？

**答案**：
需要考虑多个层面的优化：

**架构设计**：
- 负载均衡（Nginx、HAProxy）
- 数据库分片
- 缓存策略（Redis、Memcached）
- CDN 加速
- 微服务架构

**代码示例**：
```javascript
// 使用 PM2 集群模式
module.exports = {
  apps: [{
    name: 'app',
    script: './app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};

// 使用 Redis 缓存
const redis = require('redis');
const client = redis.createClient();

const getCachedData = async (key) => {
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetchFromDatabase();
  await client.setex(key, 3600, JSON.stringify(data));
  return data;
};
```

#### 12. 如何实现分布式锁？

**答案**：
使用 Redis SETNX 或数据库唯一索引实现。

**代码示例**：
```javascript
const redis = require('redis');
const client = redis.createClient();

const acquireLock = async (lockKey, ttl = 10000) => {
  const lockValue = Date.now() + Math.random();
  const result = await client.set(lockKey, lockValue, 'PX', ttl, 'NX');
  
  if (result === 'OK') {
    return lockValue;
  }
  return null;
};

const releaseLock = async (lockKey, lockValue) => {
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  
  return await client.eval(script, 1, lockKey, lockValue);
};

// 使用示例
const lock = await acquireLock('user:123:lock');
if (lock) {
  try {
    // 执行需要锁的操作
    await processUserData();
  } finally {
    await releaseLock('user:123:lock', lock);
  }
}
```

#### 13. 如何实现消息队列？

**答案**：
使用 Redis 或 RabbitMQ 实现消息队列。

**代码示例**：
```javascript
const Queue = require('bull');
const emailQueue = new Queue('email processing');

// 添加任务到队列
emailQueue.add('send-email', {
  to: 'user@example.com',
  subject: 'Welcome',
  body: 'Welcome to our service!'
});

// 处理队列任务
emailQueue.process('send-email', async (job) => {
  const { to, subject, body } = job.data;
  await sendEmail(to, subject, body);
  console.log(`Email sent to ${to}`);
});

// 监听队列事件
emailQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed:`, err);
});
```

#### 14. 如何实现 API 限流？

**答案**：
使用令牌桶算法或滑动窗口算法。

**代码示例**：
```javascript
const rateLimit = require('express-rate-limit');

// 基础限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100个请求
  message: '请求过于频繁，请稍后再试'
});

app.use('/api/', limiter);

// 基于用户的限流
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  keyGenerator: (req) => req.user?.id || req.ip
});

app.use('/api/users', userLimiter);

// 自定义限流逻辑
const customLimiter = (req, res, next) => {
  const key = req.user?.id || req.ip;
  const requests = getRequestCount(key);
  
  if (requests > 100) {
    return res.status(429).json({ error: '请求过于频繁' });
  }
  
  incrementRequestCount(key);
  next();
};
```

#### 15. 如何实现文件上传？

**答案**：
使用 multer 中间件处理文件上传。

**代码示例**：
```javascript
const multer = require('multer');
const path = require('path');

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// 使用中间件
app.post('/upload', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有上传文件' });
  }
  
  res.json({
    message: '文件上传成功',
    filename: req.file.filename,
    path: req.file.path
  });
});
```

#### 16. 如何实现 WebSocket 实时通信？

**答案**：
使用 Socket.io 实现 WebSocket 通信。

**代码示例**：
```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 连接处理
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  // 加入房间
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // 发送消息
  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('new-message', {
      id: socket.id,
      message: data.message,
      timestamp: new Date()
    });
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log('用户断开:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('服务器运行在端口 3000');
});
```

#### 17. 如何实现 JWT 认证？

**答案**：
使用 jsonwebtoken 库实现 JWT 认证。

**代码示例**：
```javascript
const jwt = require('jsonwebtoken');

// 生成 token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// 验证 token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 使用示例
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await validateUser(email, password);
  
  if (user) {
    const token = generateToken(user);
    res.json({ token });
  } else {
    res.status(401).json({ error: '认证失败' });
  }
});

app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: '受保护的资源', user: req.user });
});
```

#### 18. 如何实现数据分页？

**答案**：
使用 limit 和 offset 实现分页。

**代码示例**：
```javascript
const getUsers = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  const [users, total] = await Promise.all([
    User.find()
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 }),
    User.countDocuments()
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

// 使用游标分页（性能更好）
const getUsersCursor = async (cursor, limit = 10) => {
  const query = cursor ? { _id: { $gt: cursor } } : {};
  
  const users = await User.find(query)
    .limit(limit + 1)
    .sort({ _id: 1 });

  const hasNext = users.length > limit;
  if (hasNext) users.pop();

  return {
    users,
    nextCursor: hasNext ? users[users.length - 1]._id : null
  };
};
```

#### 19. 如何实现缓存策略？

**答案**：
使用 Redis 实现多级缓存。

**代码示例**：
```javascript
const redis = require('redis');
const client = redis.createClient();

// 缓存装饰器
const cache = (ttl = 3600) => {
  return (target, propertyName, descriptor) => {
    const method = descriptor.value;
    
    descriptor.value = async function(...args) {
      const key = `${propertyName}:${JSON.stringify(args)}`;
      
      // 尝试从缓存获取
      const cached = await client.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
      
      // 执行原方法
      const result = await method.apply(this, args);
      
      // 存入缓存
      await client.setex(key, ttl, JSON.stringify(result));
      
      return result;
    };
  };
};

// 使用缓存
class UserService {
  @cache(1800) // 30分钟缓存
  async getUserById(id) {
    return await User.findById(id);
  }
  
  @cache(3600) // 1小时缓存
  async getAllUsers() {
    return await User.find();
  }
}

// 缓存失效
const invalidateCache = async (pattern) => {
  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(keys);
  }
};
```

#### 20. 如何实现错误处理？

**答案**：
实现全局错误处理中间件。

**代码示例**：
```javascript
// 自定义错误类
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new AppError(message, 400);
  }

  // Mongoose 重复键错误
  if (err.code === 11000) {
    const message = '资源已存在';
    error = new AppError(message, 400);
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的 token';
    error = new AppError(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '服务器错误'
  });
};

// 异步错误处理包装器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 使用示例
app.get('/users/:id', asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('用户不存在', 404));
  }
  
  res.json({ success: true, data: user });
}));

app.use(errorHandler);
```

---

## 实战项目推荐

### 项目一：任务管理 API
**GitHub 地址**：https://github.com/your-username/nodejs-task-manager

**技术栈**：
- Node.js + Express
- MongoDB + Mongoose
- JWT 认证
- Jest 测试

**功能特性**：
- 用户注册/登录
- 任务 CRUD 操作
- 任务分类和标签
- 数据验证和错误处理
- API 文档（Swagger）

**学习重点**：
- RESTful API 设计
- 数据库建模
- 认证授权
- 错误处理
- 单元测试

### 项目二：实时聊天应用
**GitHub 地址**：https://github.com/your-username/realtime-chat-app

**技术栈**：
- Node.js + Socket.io
- Redis 