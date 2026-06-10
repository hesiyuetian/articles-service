import { Injectable } from '@nestjs/common';
import axios from 'axios';
import sharp from 'sharp';
import path from 'path';

@Injectable()
export class ImagesTool {
    constructor() {}

    compressImageByBuffer = async (params: any, quality: number = 80) => {
        try {
            if (params.mimetype !== 'image/svg+xml') {
                return params;
            }
            const metadata = await sharp(params.data).metadata();
            const hasAlpha = metadata.channels === 4;

            let data = params.data;

            const alphaTypes = ['image/png', 'image/gif'];
            if (alphaTypes.includes(params.mimetype) && hasAlpha) {
                data = await sharp(params.data).png({ quality, compressionLevel: 5, adaptiveFiltering: true }).ensureAlpha().toBuffer();
            } else if (!hasAlpha) {
                data = await sharp(params.data).jpeg({ quality }).toBuffer();
            } else {
                // const data = await sharp(params.data).png({ quality, compressionLevel: 5, adaptiveFiltering: true }).ensureAlpha().toBuffer();
            }
            return {
                ...params,
                data,
            };
        } catch (e: any) {
            console.error('compressImageByBuffer error', e.message);
            throw e;
        }
    };

    compressImage = async (url: string, outputPath: string, quality: number = 80) => {
        const savePath = path.join(__dirname, `../../../../${outputPath}`);

        return new Promise(async (resolve, reject) => {
            const input = (await axios({ url: url, responseType: 'arraybuffer' })).data as Buffer;
            sharp(input)
                .jpeg({ quality: quality })
                .toFile(savePath, (err, info) => {
                    if (err) {
                        // console.log('----', `Error occurred: ${err}`);
                        reject(`Error occurred: ${err}`);
                    } else {
                        // console.log('success', info);
                        resolve({
                            message: 'Image compressed successfully',
                            info: info,
                            path: outputPath,
                        });
                    }
                });
        });
    };
}
