import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');

  //CORS
  app.enableCors({
    origin: true, //para desarrollo, permitir a todos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
		})
	);

  //Swagger
	const config = new DocumentBuilder()
		.setTitle('NestJS RESTFul API')
		.setDescription('Form-Submission CRUD endpoints')
		.setVersion('0.1')
		.build();
	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.API_PORT ?? 3000);
}
bootstrap();
