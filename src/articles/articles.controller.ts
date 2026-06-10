import { Controller, Get, Post, Body, Query, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleReqDto, GetArticleDetailReqDto, GetArticleReqDto, UpdateArticleReqDto } from 'lib/common/src/dto/article.dto';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Post()
    @ApiOperation({ summary: 'Create article' })
    async createArticle(@Body() body: CreateArticleReqDto) {
        return this.articlesService.createArticle(body);
    }

    @Get('/detail')
    @ApiOperation({ summary: 'Get article detail' })
    async getArticleDetail(@Query() query: GetArticleDetailReqDto) {
        return this.articlesService.getArticleDetail(query);
    }

    @Get()
    @ApiOperation({ summary: 'Get article list' })
    async getArticleList(@Query() query: GetArticleReqDto) {
        return this.articlesService.getArticleList(query);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update article' })
    async updateArticle(@Param('id') id: string, @Body() body: UpdateArticleReqDto) {
        return this.articlesService.updateArticle(id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete article' })
    async deleteArticle(@Param('id') id: string) {
        return this.articlesService.deleteArticle(id);
    }
}
