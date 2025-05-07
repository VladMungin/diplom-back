import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // app.setGlobalPrefix('api')

  // app.use(cookieParser())

  const config = new DocumentBuilder()
    .setTitle('Median')
    .setDescription('The Median API description')
    .setVersion('0.1')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, document)

  app.enableCors({
    origin: ['https://localhost:3000', 'https://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: 'set-cookie',
  })
  const port = process.env.PORT || 3000
  await app.listen(port)
}

bootstrap()
