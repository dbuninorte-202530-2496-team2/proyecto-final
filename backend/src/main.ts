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
		.setTitle('Global English API')
		.setDescription('Documentación de API REST con autenticación JWT')
		.setVersion('0.1')
		.addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT (obtenerlo de /auth/login)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Endpoints de autenticación y gestión de usuarios')
    .addTag('Roles', 'CRUD de roles del sistema')
    .addTag('Seed', 'Inicialización de datos de prueba')
	.build();
	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.API_PORT ?? 3000);
}
bootstrap();
