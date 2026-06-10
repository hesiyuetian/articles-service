import { Prisma } from '@prisma/client';

export interface PagePaginationOptions {
    page: number;
    limit: number;
    orderBy?:
        | {
              field: string;
              direction: 'asc' | 'desc';
          }
        | Array<{
              field: string;
              direction: 'asc' | 'desc';
          }>;
    include?: Record<string, any>;
    select?: Record<string, any>;
}

export interface PageInfo {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
    items: T[];
    pageInfo: PageInfo;
}

export async function paginate<T>(prismaModel: any, options: PagePaginationOptions, where: Record<string, any> = {}): Promise<PaginatedResult<T>> {
    const { page, limit, orderBy, include, select } = options;

    // Calculate number of records to skip
    const skip = (page - 1) * limit;

    // Build query options
    let prismaOrderBy: any;
    if (orderBy) {
        if (Array.isArray(orderBy)) {
            // Support multiple sort fields
            prismaOrderBy = orderBy.map((item) => ({
                [item.field]: item.direction,
            }));
        } else {
            // Single sort field (backward compatible)
            prismaOrderBy = { [orderBy.field]: orderBy.direction };
        }
    } else {
        prismaOrderBy = { id: 'desc' };
    }

    const queryOptions: Prisma.SelectSubset<any, any> = {
        where,
        take: limit,
        skip,
        orderBy: prismaOrderBy,
        // Add relation query options
        ...(include && { include }),
        ...(select && { select }),
    };

    // Get total number of records
    const total = await prismaModel.count({
        where,
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Execute query
    const items = await prismaModel.findMany(queryOptions);

    // Build pagination info
    const pageInfo: PageInfo = {
        currentPage: page,
        pageSize: limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };

    return {
        items,
        pageInfo,
    };
}
