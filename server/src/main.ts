import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用压缩中间件 - 提高响应速度
  app.use(compression());

  // 启用安全中间件 - 设置安全HTTP头
  app.use(
    helmet({
      contentSecurityPolicy: false, // Swagger需要禁用CSP
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 启用 CORS
  app.enableCors({
    origin: appConfig.corsOrigin,
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动过滤掉 DTO 中未定义的属性
      forbidNonWhitelisted: true, // 如果存在未定义的属性，抛出异常
      transform: true, // 自动转换类型
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 设置全局前缀
  app.setGlobalPrefix('api/v1');

  // 配置 Swagger API 文档
  const config = new DocumentBuilder()
    .setTitle('Todo List API')
    .setDescription('Todo List 应用 RESTful API 文档')
    .setVersion('1.0')
    .addTag('认证', '用户认证和授权相关接口')
    .addTag('用户', '用户管理相关接口')
    .addTag('任务', '任务管理相关接口')
    .addTag('时间管理', '时间记录和番茄钟相关接口')
    .addTag('通知', '通知管理相关接口')
    .addTag('统计', '数据统计和分析相关接口')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '输入JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Todo List API 文档',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  await app.listen(appConfig.port);
  console.log(`🚀 应用启动成功，运行在端口 ${appConfig.port}`);
  console.log(`📚 API 文档地址: http://localhost:${appConfig.port}/api/docs`);
}
bootstrap();
