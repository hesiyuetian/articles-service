import { ApiProperty } from '@nestjs/swagger';
import { UploadUse } from '../types';
import { IsEnum, IsOptional } from 'class-validator';

export class UploadImagesReqDto {
    @ApiProperty({
        description: 'Usage scenario',
        enum: UploadUse,
        default: UploadUse.blog,
    })
    @IsEnum(UploadUse)
    @IsOptional()
    use: UploadUse = UploadUse.blog;

    @ApiProperty({
        description: 'Image files (supports multiple files)',
        type: 'array',
        items: {
            type: 'string',
            format: 'binary',
        },
    })
    images: any[];
}
export class UploadImagesBlogReqDto {
    @ApiProperty({
        description: 'Image files (supports multiple files)',
        type: 'string',
        format: 'binary',
    })
    images: any;
}

export class UploadDocumentsReqDto {
    @ApiProperty({
        description: 'Document files (supports multiple files)',
        type: 'array',
        items: {
            type: 'string',
            format: 'binary',
        },
    })
    documents: any[];
}
