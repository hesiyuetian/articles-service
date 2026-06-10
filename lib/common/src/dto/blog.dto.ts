import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PagePaginationDto } from './base.dto';
import { BlogSortBy } from '../types/enum.types';

class BlogContentDto {
    @ApiProperty({ description: 'Title' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Description' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Detail content (rich text format)' })
    @IsString()
    detail: string;
}

export class CreateBlogReqDto {
    @ApiProperty({ description: 'Banner image URL' })
    @IsString()
    bannerUrl: string;

    @ApiProperty({ description: 'Pathname' })
    @IsString()
    pathname: string;

    @ApiProperty({ description: 'Whether it is a homepage article' })
    @IsNumber()
    @IsOptional()
    isMain: number = 0;

    @ApiProperty({ description: 'Chinese title' })
    @IsString()
    @IsOptional()
    zhTitle: string;

    @ApiProperty({ description: 'Chinese description' })
    @IsString()
    @IsOptional()
    zhDescription: string;

    @ApiProperty({ description: 'Chinese detail' })
    @IsString()
    @IsOptional()
    zhDetail: string;

    @ApiProperty({ description: 'English title' })
    @IsString()
    enTitle: string;

    @ApiProperty({ description: 'English description' })
    @IsString()
    enDescription: string;

    @ApiProperty({ description: 'English detail' })
    @IsString()
    enDetail: string;

    @ApiProperty({ description: 'External link URL' })
    @IsString()
    @IsOptional()
    linkUrl: string;

    @ApiProperty({ description: 'Reading time (minutes)' })
    @IsNumber()
    @IsOptional()
    readTime: number = 5;
}

export class UpdateBlogSortOrderReqDto {
    @ApiProperty({ description: 'Sort order' })
    @IsNumber()
    targetIndex: number;

    @ApiProperty({ description: 'ID' })
    @IsString()
    id: string;
}

export class UpdateBlogReqDto {
    @ApiProperty({ description: 'Banner image URL' })
    @IsString()
    @IsOptional()
    bannerUrl: string;

    @ApiProperty({ description: 'Pathname' })
    @IsString()
    pathname: string;

    @ApiProperty({ description: 'Whether it is a homepage article' })
    @IsNumber()
    @IsOptional()
    isMain: number;

    @ApiProperty({ description: 'Chinese title' })
    @IsString()
    @IsOptional()
    zhTitle: string;

    @ApiProperty({ description: 'Chinese description' })
    @IsString()
    @IsOptional()
    zhDescription: string;

    @ApiProperty({ description: 'Chinese detail' })
    @IsString()
    @IsOptional()
    zhDetail: string;

    @ApiProperty({ description: 'English title' })
    @IsString()
    @IsOptional()
    enTitle: string;

    @ApiProperty({ description: 'English description' })
    @IsString()
    @IsOptional()
    enDescription: string;

    @ApiProperty({ description: 'English detail' })
    @IsString()
    @IsOptional()
    enDetail: string;

    @ApiProperty({ description: 'External link URL' })
    @IsString()
    @IsOptional()
    linkUrl: string;

    @ApiProperty({ description: 'Reading time (minutes)' })
    @IsNumber()
    @IsOptional()
    readTime: number;
}

export class GetBlogsReqDto extends PagePaginationDto {
    @ApiProperty({ description: 'Sort order' })
    @IsEnum(BlogSortBy)
    @IsOptional()
    sortBy: BlogSortBy = BlogSortBy.sortOrder;

    @ApiProperty({ description: 'Pathname fuzzy search' })
    @IsString()
    @IsOptional()
    pathname: string;

    @ApiProperty({ description: 'Title fuzzy search' })
    @IsString()
    @IsOptional()
    title: string;
}

export class GetBlogDetailReqDto {
    @ApiProperty({ description: 'Pathname' })
    @IsString()
    @IsOptional()
    pathname: string;

    @ApiProperty({ description: 'ID' })
    @IsString()
    @IsOptional()
    id: string;
}
