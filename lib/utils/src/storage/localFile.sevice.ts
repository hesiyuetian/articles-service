import fs from 'fs';
import path from 'path';

import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../appConfig/appConfig.service';
import { CryptoTool } from '../tools/crypto.tool';

const imgAllowedMimeType = 'png,jpg,jpeg';
const docAllowedMimeType = 'pdf';
const imgAllowedMimeTypeList = imgAllowedMimeType.split(',').map((d) => 'image/' + d);
const docAllowedMimeTypeList = docAllowedMimeType.split(',').map((d) => 'application/' + d);
const allowedMimeTypeList = imgAllowedMimeTypeList.concat(docAllowedMimeTypeList);

@Injectable()
export class LocalFileService {
    private ASSET_BASE_URL: string;
    private FILES_STORE: string;
    constructor(private configService: AppConfigService, private cryptoTool: CryptoTool) {
        this.ASSET_BASE_URL = this.configService.getConfigValue('ASSET_BASE_URL');
        this.FILES_STORE = this.configService.getConfigValue('FILES_STORE');
    }

    async localUploadByFormData(file: any, folder: string, name?: string) {
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
        let targetPath = folder + name + fileExt;
        console.debug('path ', targetPath);
        const fileExists = await this.localFileExists(targetPath);
        if (fileExists) {
            return this.pathConcat(this.ASSET_BASE_URL, targetPath);
        }

        try {
            targetPath = this.pathConcat(this.FILES_STORE, targetPath);
            const dir = targetPath.substring(0, targetPath.lastIndexOf('/'));
            if (dir) this.mkdir(dir);
            const filePath = path.join(__dirname, '../../../../' + targetPath);
            fs.writeFileSync(filePath, file.data);
            return this.pathConcat(this.ASSET_BASE_URL, targetPath);
        } catch (e: any) {
            console.error(e);
            return null;
        }
    }

    async localUploadForText(targetPath: string, content: string, force = true) {
        try {
            targetPath = this.pathConcat(this.FILES_STORE, targetPath);
            const dir = targetPath.substring(0, targetPath.lastIndexOf('/'));
            if (dir) this.mkdir(dir);
            const filePath = path.join(__dirname, '../../../../' + targetPath);
            if (force || !fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, content);
            }
            return this.pathConcat(this.ASSET_BASE_URL, targetPath);
        } catch (e: any) {
            console.error(e);
            return null;
        }
    }

    async upload(dir: string, file: any, field: string = '') {
        try {
            if (!allowedMimeTypeList.includes(file.mimetype)) {
                return {
                    field,
                    name: file.name,
                    path: '',
                    code: 400,
                    message: `only support ${imgAllowedMimeType},${docAllowedMimeType}`,
                };
            }
            const savePath = path.join(__dirname, '../../../../' + this.pathConcat(this.FILES_STORE, dir, file.md5 + this.getFileExt(file.name)));
            const filePath = this.pathConcat(dir, file.md5 + this.getFileExt(file.name));
            if (fs.existsSync(savePath)) {
                return {
                    field,
                    name: file.name,
                    path: filePath,
                    code: 1,
                    message: 'no change',
                };
            } else {
                fs.writeFileSync(savePath, file.data);
                return {
                    field,
                    name: file.name,
                    path: filePath,
                    code: 0,
                    message: 'success',
                };
            }
        } catch (e: any) {
            return {
                name: file.name,
                path: '',
                code: 400,
                message: e.message,
            };
        }
    }

    async deleteFile(dir: string, filename: any) {
        try {
            const filePath = path.join(__dirname, '../../../../' + this.pathConcat(this.FILES_STORE, dir, filename));
            if (!fs.existsSync(filePath)) {
                return {
                    code: 1,
                    message: 'no found',
                };
            } else {
                fs.unlinkSync(filePath);
                return {
                    code: 0,
                    message: 'success',
                };
            }
        } catch (e: any) {
            return {
                code: 400,
                message: e.message,
            };
        }
    }

    async localFileExists(targetPath: string) {
        targetPath = this.pathConcat(this.configService.getConfigValue('FILES_STORE'), targetPath);
        const filePath = path.join(__dirname, '../../../../' + targetPath);
        return fs.existsSync(filePath);
    }

    //   helper function

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

    private getFileExt(filepath: string) {
        if (filepath.lastIndexOf('.') > 0) return filepath.substring(filepath.lastIndexOf('.'));
        return '';
    }

    mkdir(dir: string) {
        const filePath = path.join(__dirname, '../../../../' + dir);
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, { recursive: true });
        }
        return filePath;
    }
}
