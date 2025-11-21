import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

import {
  ValidationPipe,
  UnprocessableEntityException,
  ValidationError,
} from '@nestjs/common';
import { BaseResponse } from './common/dto/base-response.dto';
import { join } from 'path';


async function bootstrap() {
 
 const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });  

 app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads/',
});


  app.useGlobalInterceptors(new ResponseInterceptor());
  

  app.useGlobalPipes(
    new ValidationPipe({
       transform: true,       
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formatted = {};
        errors.forEach((err) => {
          if (err.constraints) {
            formatted[err.property] = Object.values(err.constraints).join(', ');
          }
        });

        return new UnprocessableEntityException(
          BaseResponse.Error('Validation failed', formatted),
        );
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('INVENTORY SERVICE API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token here',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);


  await app.listen(process.env.APP_PORT || 3000,'0.0.0.0');
}
bootstrap();
