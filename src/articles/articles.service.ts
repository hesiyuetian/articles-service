import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { paginate, PaginatedResult, PrismaService } from '../../lib/prisma/src';
import { Article, Prisma } from '@prisma/client';
import { CreateArticleReqDto, GetArticleDetailReqDto, GetArticleReqDto, UpdateArticleReqDto } from 'lib/common/src/dto/article.dto';

@Injectable()
export class ArticlesService {
    constructor(private readonly prisma: PrismaService) { }

    async createArticle(body: CreateArticleReqDto) {
        try {
            const { pathname, content } = body;
            const host = body.host?.trim().replace(/\/+$/, '');
            const existArticle = await this.prisma.article.findFirst({ where: { host, pathname } });
            if (existArticle) throw new BadRequestException('Pathname already exists');

            const article = await this.prisma.article.create({
                data: { host, pathname, content },
            });
            return { success: true, data: article };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async getArticleList(query: GetArticleReqDto): Promise<PaginatedResult<Article>> {
        try {
            const { pathname, host } = query;
            const where: Prisma.ArticleWhereInput = {};
            if (pathname) where.pathname = { contains: pathname, mode: 'insensitive' };
            if (host) where.host = { contains: host, mode: 'insensitive' };


            const result = await paginate(
                this.prisma.article,
                {
                    page: query.page,
                    limit: query.size,
                    orderBy: {
                        field: 'createdAt',
                        direction: 'desc',
                    },
                },
                where,
            );
            return {
                items: result.items as unknown as Article[],
                pageInfo: result.pageInfo,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async getArticleDetail(query: GetArticleDetailReqDto) {
        try {
            const { id, pathname, host } = query;
            if (!id && !(pathname && host)) {
                throw new BadRequestException('ID or both pathname and host are required');
            }
            const where: Prisma.ArticleWhereInput = id ? { id } : { pathname, host };
            const article = await this.prisma.article.findFirst({ where });
            if (!article) throw new NotFoundException('Article does not exist');
            return { success: true, data: article };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async updateArticle(id: string, body: UpdateArticleReqDto) {
        try {
            const { host, pathname, content } = body;
            const existArticle = await this.prisma.article.findUnique({ where: { id } });
            if (!existArticle) throw new NotFoundException('Article does not exist');

            const article = await this.prisma.article.update({
                where: { id },
                data: { host, pathname, content },
            });
            return { success: true, data: article };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async deleteArticle(id: string) {
        try {
            const article = await this.prisma.article.delete({ where: { id } });
            return { success: true, data: article };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
