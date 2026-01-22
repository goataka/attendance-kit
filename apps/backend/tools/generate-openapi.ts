import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

async function generateOpenApiSpec() {
  // Set dummy JWT_SECRET for OpenAPI generation
  // OpenAPI generation doesn't perform actual authentication
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'dummy-for-openapi-generation';
  }
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  const config = new DocumentBuilder()
    .setTitle('Attendance Kit API')
    .setDescription('勤怠管理キット API ドキュメント')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('clock', '打刻API')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Output directory
  const outputDir = path.join(__dirname, '..', 'api');
  const outputPath = path.join(outputDir, 'openapi.json');

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write OpenAPI spec to file
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

  console.log(`✅ OpenAPI specification generated at: ${outputPath}`);

  await app.close();
  process.exit(0);
}

generateOpenApiSpec().catch((error) => {
  console.error('❌ Error generating OpenAPI spec:', error);
  process.exit(1);
});
