import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { AppConfigService } from '../appConfig/appConfig.service';
import { CryptoTool } from '../tools/crypto.tool';

@Injectable()
export class GcsService {
    private ASSET_BASE_URL: string;
    private BUCKET_NAME: string;
    private storage: Storage;
    constructor(private configService: AppConfigService, private cryptoTool: CryptoTool) {
        this.ASSET_BASE_URL = this.configService.getConfigValue('ASSET_BASE_URL');
        this.BUCKET_NAME = this.configService.getConfigValue('GOOGLE_CLOUD_STORAGE_BUCKET');
        this.storage = new Storage({
            keyFilename: this.configService.getConfigValue('GOOGLE_CLOUD_KEY_FILE_PATH'),
            projectId: this.configService.getConfigValue('GOOGLE_CLOUD_STORAGE_ID'),
        });
    }

    async gsUploadByFormData(file: any, folder: string, name?: string) {
        if (!file || !file?.name || !file?.data || !file?.mimetype) {
            throw new Error('upload: invalid parameter');
        }
        let fileExt = '';
        if (file.name) {
            fileExt = file.name.substring(file.name.lastIndexOf('.'));
        }
        if (!name) {
            name = this.cryptoTool.md5(file.data);
        }
        const targetPath = folder + name + fileExt;
        console.debug('path ', targetPath);
        const fileExists = await this.gsFileExists(targetPath);
        if (fileExists) {
            console.debug('gsUploadForText exists: ' + targetPath);
            return this.pathConcat(this.ASSET_BASE_URL, targetPath);
        }

        try {
            await this.gsUpload(targetPath, file.data, file.mimetype);
            return this.pathConcat(this.ASSET_BASE_URL, targetPath);
        } catch (error) {
            console.error('ERROR:', error);
        }
        return null;
    }

    async gsUploadForText(targetPath: string, data: string, mimetype = 'application/json', force = true) {
        if (!force) {
            const fileExists = await this.gsFileExists(targetPath);
            if (fileExists) {
                console.debug('gsUploadForText exists: ' + targetPath);
                return this.pathConcat(this.ASSET_BASE_URL, targetPath);
            }
        }
        try {
            await this.gsUpload(targetPath, data, mimetype);
            return this.pathConcat(this.ASSET_BASE_URL, targetPath);
        } catch (error) {
            console.error('ERROR:', error);
        }
        return null;
    }

    async gsFileExists(path: string) {
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        try {
            const bucket = this.storage.bucket(this.BUCKET_NAME);
            const [exists] = await bucket.file(path).exists();
            return exists;
        } catch (error: any) {
            console.error('gsFileExists Except:', error.message);
            throw error;
        }
    }

    async gsCopy(sourcePath: string, targetPath: string) {
        if (targetPath.startsWith('/')) {
            targetPath = targetPath.substring(1);
        }
        try {
            const bucket = this.storage.bucket(this.BUCKET_NAME);
            await bucket.file(sourcePath).copy(bucket.file(targetPath));
            console.debug('Success');
        } catch (e) {
            console.error('gsCopy Except:', e);
            throw e;
        }
    }

    async gsUpload(targetPath: string, data: any, contentType?: string) {
        if (targetPath.startsWith('/')) {
            targetPath = targetPath.substring(1);
        }
        const options: any = {
            resumable: false,
            metadata: {},
        };
        if (contentType) {
            options.metadata.contentType = contentType;
        }
        try {
            const bucket = this.storage.bucket(this.BUCKET_NAME);
            return await bucket.file(targetPath).save(data, options);
        } catch (e: any) {
            console.error('Error', e.message);
            throw e;
        }
    }

    // helper function

    pathConcat(...paths: any) {
        paths = paths.filter((d: any) => {
            if (d) return d;
        });
        for (let i = 0; i < paths.length; i++) {
            if (i === 0) {
                if (paths[i].substr(-1, 1) === '/') paths[i] = paths[i].substring(0, paths[i].length - 1);
            } else {
                if (paths[i].substr(0, 1) === '/') paths[i] = paths[i].substring(1);
            }
        }
        const res = paths.join('/');
        return res;
    }
}
