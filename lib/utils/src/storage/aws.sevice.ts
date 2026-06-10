import { Injectable } from '@nestjs/common';
import { S3Client, CopyObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { AppConfigService } from '../appConfig/appConfig.service';
import { Upload } from '@aws-sdk/lib-storage';
import stream from 'stream';
import { CryptoTool } from '../tools/crypto.tool';

@Injectable()
export class AwsService {
    private s3Client: S3Client;
    private cfClient: CloudFrontClient;
    private ASSET_BASE_URL: string;
    private AWS_BUCKET: string;
    private AWS_DISTRIBUTION_ID: string;
    constructor(private configService: AppConfigService, private cryptoTool: CryptoTool) {
        this.ASSET_BASE_URL = this.configService.getConfigValue('ASSET_BASE_URL');
        this.AWS_BUCKET = this.configService.getConfigValue('AWS_BUCKET');
        this.AWS_DISTRIBUTION_ID = this.configService.getConfigValue('AWS_DISTRIBUTION_ID');
        this.s3Client = new S3Client({
            region: this.configService.getConfigValue('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.getConfigValue('AWS_ACCESS_ID'),
                secretAccessKey: this.configService.getConfigValue('AWS_ACCESS_KEY'),
            },
        });
        this.cfClient = new CloudFrontClient({
            region: this.configService.getConfigValue('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.getConfigValue('AWS_ACCESS_ID'),
                secretAccessKey: this.configService.getConfigValue('AWS_ACCESS_KEY'),
            },
        });
    }

    async s3UploadByFormData(file: any, folder: string, name?: string) {
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
        // console.debug('path ', targetPath);
        const fileExists = await this.s3FileExists(targetPath);
        if (fileExists) {
            return this.pathConcat(this.ASSET_BASE_URL, targetPath);
        }

        // await s3Upload(targetPath, file.data, file.mimetype);
        await this.s3UploadStream(targetPath, file.data, file.mimetype);
        await this.cfCreateInvalidation(targetPath);
        return this.pathConcat(this.ASSET_BASE_URL, targetPath);
    }

    async s3UploadForText(targetPath: string, data: string, mimetype = 'application/json', force = true) {
        if (!force) {
            const fileExists = await this.s3FileExists(targetPath);
            if (fileExists) {
                console.debug('s3UploadForText exists: ' + targetPath);
                return this.pathConcat(this.ASSET_BASE_URL, targetPath);
            }
        }
        await this.s3UploadStream(targetPath, data, mimetype);
        await this.cfCreateInvalidation(targetPath);
        console.debug('s3UploadForText ' + targetPath);
        return this.pathConcat(this.ASSET_BASE_URL, targetPath);
    }

    async cfCreateInvalidation(_path: any) {
        let path: any = [];
        if (Array.isArray(_path)) {
            path = _path.map((p) => {
                if (p.substring(0, 1) !== '/') return '/' + p;
                return p;
            });
        } else {
            if (_path.substring(0, 1) !== '/') return ['/' + _path];
            return [_path];
        }
        const input: any = {
            DistributionId: this.AWS_DISTRIBUTION_ID,
            InvalidationBatch: {
                CallerReference: new Date().getTime(),
                Paths: {
                    Items: Array.isArray(path) ? path : [path],
                    Quantity: 1,
                },
            },
        };
        // console.debug('cfCreateInvalidation param:', input);

        try {
            const command = new CreateInvalidationCommand(input);
            const response = await this.cfClient.send(command);
            // console.debug('Success', response);
            return response;
        } catch (e: any) {
            console.error('cfCreateInvalidation Except:', e.message);
            // throw e;
        }
        return null;
    }

    async s3UploadStream(targetPath: any, body: any, contentType?: string) {
        if (targetPath.substring(0, 1) === '/') {
            targetPath = targetPath.substring(1);
        }

        const passThrough = new stream.PassThrough();
        passThrough.end(body);

        const uploadParams: any = {
            Bucket: this.AWS_BUCKET,
            Key: targetPath,
            Body: passThrough,
        };

        if (contentType) {
            if (contentType === 'text/plain') {
                uploadParams.ContentType = `${contentType}; charset=utf-8`;
            } else {
                uploadParams.ContentType = contentType;
            }
        }

        try {
            const parallelUploads3 = new Upload({
                client: this.s3Client,
                params: uploadParams,
                queueSize: 20, // Number of concurrent uploads
                partSize: 5 * 1024 * 1024, // Size of each chunk
                leavePartsOnError: false, // Whether to keep uploaded chunks if error occurs
            });

            // parallelUploads3.on('httpUploadProgress', (progress: any) => {
            //     console.log('progress:::', progress);
            // });

            const data = await parallelUploads3.done();
            // console.debug('Success', data);
            return data;
        } catch (e: any) {
            console.error('Error', e.message);
            throw e;
        }
    }

    async s3FileExists(path: string) {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.AWS_BUCKET,
                Key: path,
            });
            await this.s3Client.send(command);
            return true;
        } catch (error: any) {
            if (error?.name === 'NotFound') {
                return false;
            }
            throw error;
        }
    }

    //  helper function
    private pathConcat(...paths: any) {
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
