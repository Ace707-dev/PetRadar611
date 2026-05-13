// ⚠️ Application Insights DEBE inicializarse antes que cualquier otro import
import * as appInsights from 'applicationinsights';

const aiConnectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
if (aiConnectionString) {
  appInsights
    .setup(aiConnectionString)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .start();
  console.log('✅ Application Insights inicializado');
} else {
  console.warn('⚠️  APPLICATIONINSIGHTS_CONNECTION_STRING no definida — telemetría desactivada');
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🐾 PetRadar API corriendo en: http://localhost:${port}`);
}
bootstrap();
