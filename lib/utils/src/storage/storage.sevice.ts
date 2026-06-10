import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../appConfig/appConfig.service';
import { LocalFileService } from './localFile.sevice';
import { AwsService } from './aws.sevice';
import { GcsService } from './gcs.sevice';

@Injectable()
export class StorageSevice {
    private STORAGE_TYPE: string;
    constructor(
        private configService: AppConfigService, //
        private localFileService: LocalFileService,
        private awsService: AwsService,
        private gcsService: GcsService,
    ) {
        this.STORAGE_TYPE = this.configService.getConfigValue('STORAGE_TYPE');
    }

    async uploadByFormData(file: any, folder: string, name?: string) {
        if (this.STORAGE_TYPE === 'local') {
            return this.localFileService.localUploadByFormData(file, folder, name);
        } else if (this.STORAGE_TYPE === 'aws') {
            return this.awsService.s3UploadByFormData(file, folder, name);
        }
        if (this.STORAGE_TYPE === 'gcs') {
            return this.gcsService.gsUploadByFormData(file, folder, name);
        } else {
            throw new Error('unknown storage type');
        }
    }
    async uploadForText(targetPath: string, data: string, mimetype = 'application/json', force = true) {
        if (this.STORAGE_TYPE === 'local') {
            return this.localFileService.localUploadForText(targetPath, data, force);
        } else if (this.STORAGE_TYPE === 'aws') {
            return this.awsService.s3UploadForText(targetPath, data, mimetype, force);
        }
        if (this.STORAGE_TYPE === 'gcs') {
            return this.gcsService.gsUploadForText(targetPath, data, mimetype, force);
        } else {
            throw new Error('unknown storage type');
        }
    }

    async fileExists(targetPath: string) {
        if (this.STORAGE_TYPE === 'local') {
            return this.localFileService.localFileExists(targetPath);
        } else if (this.STORAGE_TYPE === 'aws') {
            return this.awsService.s3FileExists(targetPath);
        } else if (this.STORAGE_TYPE === 'gcs') {
            return this.gcsService.gsFileExists(targetPath);
        } else {
            throw new Error('unknown storage type');
        }
    }
}
