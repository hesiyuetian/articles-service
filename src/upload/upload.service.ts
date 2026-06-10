import { Injectable } from '@nestjs/common';
import { UploadUse } from '../../lib/common/src/types';
import { ImagesTool } from '../../lib/utils/src/tools/images.tool';
import { StorageSevice } from '../../lib/utils/src/storage/storage.sevice';
import { CryptoTool } from '../../lib/utils/src/tools/crypto.tool';
import { FileTool } from '../../lib/utils/src/tools/file.tool';
import { fromBuffer } from 'pdf2pic';
import { readFileSync, unlink } from 'fs-extra';
import { UploadDocumentsReqDto, UploadImagesReqDto, UploadImagesBlogReqDto } from 'lib/common/src/dto/upload.dto';
const mimetype = require('mimetype');

@Injectable()
export class UploadService {
    constructor(
        private readonly imagesTool: ImagesTool, //
        private readonly cryptoTool: CryptoTool,
        private readonly fileTool: FileTool,
        private readonly storageService: StorageSevice,
    ) { }

    async imagesForBlog(files: any): Promise<any> {
        try {
            if (!files || !files.images) throw new Error('invalid files');

            // Convert Multer file object to format expected by service layer
            const fileObj = {
                data: files.images[0].buffer,
                mimetype: files.images[0].mimetype,
                name: files.images[0].originalname,
            };
            const compressedData = await this.imagesTool.compressImageByBuffer(fileObj);
            const imageUrl = await this.storageService.uploadByFormData(compressedData, '/blog/images/');
            return {
                code: 0,
                data: {
                    url: imageUrl,
                },
                message: 'success',
            };
        } catch (error: any) {
            return {
                code: 1,
                data: null,
                message: error.message,
            };
        }
    }

    async images(data: UploadImagesReqDto, files: any): Promise<any> {
        try {
            const { use } = data;
            if (!use || !Object.values(UploadUse).includes(use)) throw new Error('invalid use');
            if (!files || !files.images) throw new Error('invalid files');

            const fileList = files.images instanceof Array ? files.images : [files.images];

            let i = 0,
                result: string[] = [];
            for (i; i < fileList.length; i++) {
                // Convert Multer file object to format expected by service layer
                const fileObj = {
                    data: fileList[i].buffer,
                    mimetype: fileList[i].mimetype,
                    name: fileList[i].originalname,
                };
                const compressedData = await this.imagesTool.compressImageByBuffer(fileObj);

                let imageUrl = '';
                if (use === UploadUse.avatar) {
                    imageUrl = await this.storageService.uploadByFormData(compressedData, '/avatar/', 'uid');
                } else if (use === UploadUse.blog) {
                    imageUrl = await this.storageService.uploadByFormData(compressedData, '/blog/images/');
                }
                result.push(imageUrl);
            }
            return result.length > 1 ? result : result[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async documents(data: UploadDocumentsReqDto, files: any): Promise<any> {
        try {
            if (!files || !files.documents) throw new Error('invalid files');

            const fileList = files.documents instanceof Array ? files.documents : [files.documents];

            let i = 0,
                result: { [key: string]: string }[] = [];
            for (i; i < fileList.length; i++) {
                let imagesUrl: any = 'https://asset.aisee.live/blog/images/4a587b5b27fb51e9ee2cdf0f7cbcd1c6.jpg',
                    documentUrl: any;
                const doc = fileList[i];

                // Convert Multer file object to format expected by service layer
                const docBuffer = doc.buffer || doc.data;

                if (doc.mimetype === 'application/pdf') {
                    const outputDirectory = this.fileTool.mkdir('files/documents');
                    const filename = this.cryptoTool.md5(docBuffer);
                    const baseOptions = {
                        width: 2550,
                        height: 3300,
                        density: 330,
                        saveFilename: filename,
                        savePath: outputDirectory,
                    };

                    const convert = fromBuffer(docBuffer, baseOptions);
                    const saveFile: { [key: string]: any } = await convert(1);
                    const buffer: any = await readFileSync(`${saveFile.path}`);

                    const { data } = await this.imagesTool.compressImageByBuffer({ data: buffer });

                    const file = {
                        name: `${saveFile.name}`,
                        data,
                        mimetype: mimetype.lookup(saveFile.path),
                    };
                    imagesUrl = await this.storageService.uploadByFormData(file, '/documents/');
                    unlink(saveFile.path);
                }
                result.push({ imagesUrl, documentUrl });
            }

            return result.length > 1 ? result : result[0];
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}
