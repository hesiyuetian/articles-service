import { Module } from '@nestjs/common';
import { AppConfigModule } from '../appConfig/appConfig.module';
import { ToolsModule } from '../tools/tools.module';
import { StorageSevice } from './storage.sevice';
import { LocalFileService } from './localFile.sevice';
import { AwsService } from './aws.sevice';
import { GcsService } from './gcs.sevice';

@Module({
    imports: [AppConfigModule, ToolsModule],
    providers: [StorageSevice, LocalFileService, AwsService, GcsService],
    exports: [StorageSevice],
})
export class StorageModule {}
