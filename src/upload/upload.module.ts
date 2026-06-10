import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { StorageModule } from '../../lib/utils/src/storage/storage.module';
import { ToolsModule } from '../../lib/utils/src/tools/tools.module';

@Module({
    imports: [StorageModule, ToolsModule],
    controllers: [UploadController],
    providers: [UploadService],
    exports: [UploadService],
})
export class UploadModule {}
