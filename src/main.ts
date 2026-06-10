import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { exec } from 'child_process';
import { promisify } from 'util';
import { AppModule } from './app.module';

const execAsync = promisify(exec);

async function runMigrations() {
    try {
        console.log('Checking database migration status...');
        const schemaPath = './lib/prisma/prisma/schema.prisma';
        const { stdout, stderr } = await execAsync(`npx prisma migrate deploy --schema=${schemaPath}`, {
            cwd: process.cwd(),
            env: process.env,
        });

        if (stdout) {
            console.log(stdout);
        }
        if (stderr && !stderr.includes('No pending migrations')) {
            console.warn(stderr);
        }
        console.log('Database migration check completed');
    } catch (error) {
        console.error('Database migration failed:', error);
        throw error;
    }
}

async function bootstrap() {
    // Run database migrations before application startup
    await runMigrations();

    const app = await NestFactory.create(AppModule);
    app.enableCors();

    const reflector = app.get(Reflector);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            // skipMissingProperties: false,
            // transformOptions: {
            //     enableImplicitConversion: true,
            // },
        }),
    );

    // app.setGlobalPrefix('api');

    const config = new DocumentBuilder().setTitle('Blog API').setDescription('Blog backend service API documentation').setVersion('1.0').addTag('blogs').addBearerAuth().build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger documentation: http://localhost:${port}/docs`);
}

bootstrap();
