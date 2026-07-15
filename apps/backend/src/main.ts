import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './shared/errors/api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = Number(process.env.PORT ?? 4000);
  app.useGlobalFilters(new ApiExceptionFilter());
  await app.listen(port);
}
bootstrap();
