import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { PagePaginationDto } from './base.dto';


export class CreateArticleReqDto {
    @ApiProperty({ description: 'Host' })
    @IsString()
    host: string;

    @ApiProperty({ description: 'Pathname' })
    @IsString()
    pathname: string;

    @ApiProperty({ description: 'Content' })
    @IsString()
    content: string;
}


export class UpdateArticleReqDto {
    @ApiProperty({ description: 'Host' })
    @IsString()
    host: string;

    @ApiProperty({ description: 'Pathname' })
    @IsString()
    pathname: string;

    @ApiProperty({ description: 'Content' })
    @IsString()
    content: string;
}

export class GetArticleReqDto extends PagePaginationDto {
    @ApiProperty({ description: 'Pathname fuzzy search', required: false })
    @IsString()
    @IsOptional()
    pathname?: string;

    @ApiProperty({ description: 'Host', required: false })
    @IsString()
    @IsOptional()
    host?: string;
}

export class GetArticleDetailReqDto {
    @ApiProperty({ description: 'Pathname', required: false })
    @IsString()
    @IsOptional()
    pathname?: string;

    @ApiProperty({ description: 'Host', required: false })
    @IsString()
    @IsOptional()
    host?: string;

    @ApiProperty({ description: 'ID', required: false })
    @IsString()
    @IsOptional()
    id?: string;
}
