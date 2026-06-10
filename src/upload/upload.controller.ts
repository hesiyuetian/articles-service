import { Controller, Post, UseInterceptors, UploadedFiles, HttpException, Body } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { UploadDocumentsReqDto, UploadImagesBlogReqDto, UploadImagesReqDto } from 'lib/common/src/dto/upload.dto';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post('images')
    @ApiOperation({ summary: 'Upload images' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'images', maxCount: 10 }], {
            limits: {
                fileSize: 50 * 1024 * 1024, // 50MB
            },
            fileFilter: (req, file, cb) => {
                if (!file || !file.mimetype) {
                    cb(null, true);
                    return;
                }
                if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
                    cb(new HttpException('Unsupported file type, only jpg, jpeg, png, gif, webp are supported', 400), false);
                    return;
                }
                cb(null, true);
            },
        }),
    )
    async images(@Body() body: UploadImagesReqDto, @UploadedFiles() files: { images?: any[] }) {
        try {
            return await this.uploadService.images(body, files);
        } catch (error: any) {
            throw new HttpException(error.message, error.status || 500);
        }
    }

    @Post('imagesForBlog')
    @ApiOperation({ summary: 'Upload images (Blog - Rich Text)' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'images', maxCount: 1 }], {
            limits: {
                fileSize: 50 * 1024 * 1024, // 50MB
            },
        }),
    )
    async imagesForBlog(@Body() body: UploadImagesBlogReqDto, @UploadedFiles() files: { images?: any }) {
        try {
            return await this.uploadService.imagesForBlog(files);
        } catch (error: any) {
            throw new HttpException(error.message, error.status || 500);
        }
    }

    @Post('documents')
    @ApiOperation({ summary: 'Upload documents' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'documents', maxCount: 10 }], {
            limits: {
                fileSize: 50 * 1024 * 1024, // 50MB
            },
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/^application\/(pdf)$/)) {
                    cb(new HttpException('Unsupported file type, only pdf is supported', 400), false);
                    return;
                }
                cb(null, true);
            },
        }),
    )
    async documents(@Body() body: UploadDocumentsReqDto, @UploadedFiles() files: { documents?: any[] }) {
        try {
            return await this.uploadService.documents(body, files);
        } catch (error: any) {
            throw new HttpException(error.message, error.status || 500);
        }
    }
}
