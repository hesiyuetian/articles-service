import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PagePaginationDto {
    @ApiProperty({ example: 1, description: 'Page number', minimum: 1 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    page: number = 1;

    @ApiProperty({ example: 10, description: 'Items per page', minimum: 1 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    size: number = 10;
}

export class PageInfoDto {
    @ApiProperty({ example: 1, description: 'Current page number' })
    currentPage: number;

    @ApiProperty({ example: 10, description: 'Items per page' })
    pageSize: number;

    @ApiProperty({ example: 100, description: 'Total records' })
    total: number;

    @ApiProperty({ example: 10, description: 'Total pages' })
    totalPages: number;

    @ApiProperty({ example: true, description: 'Whether there is a next page' })
    hasNextPage: boolean;

    @ApiProperty({ example: true, description: 'Whether there is a previous page' })
    hasPreviousPage: boolean;
}

export class BaseDto {
    @ApiHideProperty()
    @IsString()
    userId: string;

    @ApiProperty({ description: 'ID' })
    @IsString()
    id: string;
}
