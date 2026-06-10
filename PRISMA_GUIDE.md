# Prisma 操作指南

本文档详细介绍了 Prisma 的初始化、更新以及日常开发中的各种操作流程。

## 目录

- [初始化](#初始化)
- [更新 Schema](#更新-schema)
- [字段操作](#字段操作)
- [索引操作](#索引操作)
- [唯一键操作](#唯一键操作)
- [关系操作](#关系操作)
- [数据类型](#数据类型)
- [常用命令](#常用命令)
- [最佳实践](#最佳实践)

---

## 初始化

### 1. 安装 Prisma

```bash
npm install prisma @prisma/client
# 或
pnpm add prisma @prisma/client
# 或
yarn add prisma @prisma/client
```

### 2. 初始化 Prisma

```bash
npx prisma init
```

这会创建：
- `prisma/schema.prisma` - Prisma schema 文件
- `.env` - 环境变量文件（如果不存在）

### 3. 配置数据库连接

编辑 `.env` 文件：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

### 4. 定义 Schema

编辑 `prisma/schema.prisma`：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 5. 创建数据库迁移

```bash
npx prisma migrate dev --name init
```

这会：
- 创建迁移文件
- 应用到数据库
- 生成 Prisma Client

### 6. 生成 Prisma Client

```bash
npx prisma generate
```

---

## 更新 Schema

### 开发环境更新流程

1. **修改 `schema.prisma`**
2. **创建并应用迁移**：
   ```bash
   npx prisma migrate dev --name describe_your_change
   ```
   例如：
   ```bash
   npx prisma migrate dev --name add_user_avatar
   ```

### 生产环境更新流程

1. **创建迁移文件**（不应用）：
   ```bash
   npx prisma migrate dev --create-only --name production_migration
   ```

2. **检查迁移文件**（在 `prisma/migrations/` 目录）

3. **应用到生产环境**：
   ```bash
   npx prisma migrate deploy
   ```

4. **生成 Prisma Client**：
   ```bash
   npx prisma generate
   ```

---

## 字段操作

### 添加字段

#### 1. 在 Schema 中添加字段

```prisma
model Blog {
  id        String   @id @default(uuid())
  title     String
  content   String
  // 新增字段
  author    String?  // 可选字段
  views     Int      @default(0)  // 带默认值
  published Boolean  @default(false)
}
```

#### 2. 创建迁移

```bash
npx prisma migrate dev --name add_author_and_views
```

#### 3. 生成 Client

```bash
npx prisma generate
```

### 删除字段

#### 1. 从 Schema 中删除字段

```prisma
model Blog {
  id        String   @id @default(uuid())
  title     String
  content   String
  // 删除 author 字段
  // author    String?  // 删除这行
  views     Int      @default(0)
}
```

#### 2. 创建迁移

```bash
npx prisma migrate dev --name remove_author_field
```

**注意**：删除字段会永久删除数据库中的数据，请谨慎操作！

### 修改字段类型

#### 1. 修改 Schema

```prisma
model Blog {
  id        String   @id @default(uuid())
  title     String
  // 从 String 改为 Text（PostgreSQL）
  content   String   @db.Text
  views     Int      @default(0)
}
```

#### 2. 创建迁移

```bash
npx prisma migrate dev --name change_content_to_text
```

**注意**：类型转换可能失败，如果数据不兼容需要先清理数据。

### 修改字段属性

#### 添加/移除默认值

```prisma
// 添加默认值
views     Int      @default(0)

// 移除默认值
views     Int
```

#### 修改可选性

```prisma
// 从必填改为可选
author    String?  // 添加 ?

// 从可选改为必填（需要确保现有数据都有值）
author    String   // 移除 ?
```

#### 重命名字段（使用 @map）

```prisma
model Blog {
  id        String   @id @default(uuid())
  title     String
  // 代码中用 newName，数据库用 old_name
  newName   String   @map("old_name")
}
```

---

## 索引操作

### 添加单字段索引

```prisma
model Blog {
  id        String   @id @default(uuid())
  title     String
  createdAt DateTime @default(now())
  
  // 添加索引
  @@index([title])
  @@index([createdAt])
}
```

创建迁移：
```bash
npx prisma migrate dev --name add_title_index
```

### 添加复合索引

```prisma
model Blog {
  id        String   @id @default(uuid())
  title     String
  author    String
  published Boolean
  
  // 复合索引
  @@index([author, published])
  @@index([title, author])
}
```

### 添加唯一索引

```prisma
model Blog {
  id        String   @id @default(uuid())
  slug      String   @unique  // 唯一索引（自动创建）
  title     String
}
```

### 命名索引

```prisma
model Blog {
  id        String   @id @default(uuid())
  title     String
  author    String
  
  // 命名索引
  @@index([title], name: "idx_blog_title")
  @@index([author, title], name: "idx_blog_author_title")
}
```

### 删除索引

从 Schema 中删除索引定义：

```prisma
model Blog {
  id        String   @id @default(uuid())
  title     String
  author    String
  
  // 删除这行来移除索引
  // @@index([title])
}
```

创建迁移：
```bash
npx prisma migrate dev --name remove_title_index
```

---

## 唯一键操作

### 添加唯一约束

#### 单字段唯一

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique  // 唯一约束
  username  String   @unique  // 多个唯一字段
}
```

#### 复合唯一约束

```prisma
model User {
  id        String   @id @default(uuid())
  email     String
  domain    String
  
  // 复合唯一约束：email + domain 组合必须唯一
  @@unique([email, domain])
}
```

#### 命名唯一约束

```prisma
model User {
  id        String   @id @default(uuid())
  email     String
  domain    String
  
  @@unique([email, domain], name: "unique_email_domain")
}
```

### 删除唯一约束

从 Schema 中删除：

```prisma
model User {
  id        String   @id @default(uuid())
  email     String
  // 删除 @unique
  username  String   // 移除 @unique
}
```

创建迁移：
```bash
npx prisma migrate dev --name remove_unique_constraint
```

---

## 关系操作

### 一对一关系

```prisma
model User {
  id      String   @id @default(uuid())
  email   String   @unique
  profile Profile?
}

model Profile {
  id     String  @id @default(uuid())
  bio    String?
  userId String  @unique
  user   User    @relation(fields: [userId], references: [id])
}
```

### 一对多关系

```prisma
model User {
  id    String   @id @default(uuid())
  email String   @unique
  posts Post[]
}

model Post {
  id     String   @id @default(uuid())
  title  String
  userId String
  user   User     @relation(fields: [userId], references: [id])
}
```

### 多对多关系

#### 隐式多对多

```prisma
model Post {
  id     String   @id @default(uuid())
  title  String
  tags   Tag[]
}

model Tag {
  id    String   @id @default(uuid())
  name  String   @unique
  posts Post[]
}
```

#### 显式多对多（带额外字段）

```prisma
model Post {
  id         String       @id @default(uuid())
  title      String
  postTags   PostTag[]
}

model Tag {
  id       String     @id @default(uuid())
  name     String     @unique
  postTags PostTag[]
}

model PostTag {
  id        String   @id @default(uuid())
  postId    String
  tagId     String
  createdAt DateTime @default(now())
  
  post      Post     @relation(fields: [postId], references: [id])
  tag       Tag      @relation(fields: [tagId], references: [id])
  
  @@unique([postId, tagId])
}
```

### 添加关系

1. 在 Schema 中添加关系定义
2. 创建迁移：
   ```bash
   npx prisma migrate dev --name add_relation
   ```

### 删除关系

1. 从 Schema 中删除关系定义
2. 创建迁移：
   ```bash
   npx prisma migrate dev --name remove_relation
   ```

---

## 数据类型

### 字符串类型

```prisma
model Example {
  id        String   @id @default(uuid())
  shortText String   @db.VarChar(255)  // VARCHAR(255)
  longText  String   @db.Text          // TEXT
  uuid      String   @db.Uuid          // UUID
}
```

### 数字类型

```prisma
model Example {
  id        String   @id @default(uuid())
  intField  Int      // INTEGER
  bigInt    BigInt   // BIGINT
  float     Float    // REAL
  decimal   Decimal  @db.Decimal(10, 2)  // DECIMAL(10, 2)
}
```

### 日期时间类型

```prisma
model Example {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())     // TIMESTAMP
  updatedAt DateTime @updatedAt           // 自动更新
  dateOnly  DateTime @db.Date           // DATE
}
```

### JSON 类型

```prisma
model Example {
  id        String   @id @default(uuid())
  metadata  Json     // JSON/JSONB
  config    Json?
}
```

### 布尔类型

```prisma
model Example {
  id        String   @id @default(uuid())
  isActive  Boolean  @default(true)
  published Boolean  @default(false)
}
```

### 枚举类型

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  id   String @id @default(uuid())
  role Role   @default(USER)
}
```

---

## 常用命令

### 迁移相关

```bash
# 创建新的迁移（开发环境）
npx prisma migrate dev --name migration_name

# 创建迁移但不应用（生产环境准备）
npx prisma migrate dev --create-only --name migration_name

# 应用迁移（生产环境）
npx prisma migrate deploy

# 重置数据库（开发环境，会删除所有数据）
npx prisma migrate reset

# 查看迁移状态
npx prisma migrate status
```

### Client 生成

```bash
# 生成 Prisma Client
npx prisma generate

# 生成并查看输出
npx prisma generate --schema=./prisma/schema.prisma
```

### 数据库操作

```bash
# 打开 Prisma Studio（可视化数据库）
npx prisma studio

# 查看数据库结构
npx prisma db pull

# 推送 Schema 到数据库（不创建迁移文件）
npx prisma db push

# 格式化 Schema 文件
npx prisma format

# 验证 Schema
npx prisma validate
```

### 数据操作

```bash
# 执行 seed 脚本
npx prisma db seed

# 查看数据库连接
npx prisma db execute --stdin
```

---

## 高级功能

### 1. 自定义 ID 生成

```prisma
model User {
  id        String   @id @default(uuid())
  // 或使用自增
  // id        Int      @id @default(autoincrement())
  // 或使用 cuid
  // id        String   @id @default(cuid())
}
```

### 2. 字段映射（@map）

```prisma
model Blog {
  id        String   @id @default(uuid())
  // 代码中用 camelCase，数据库用 snake_case
  linkUrl   String?  @map("link_url")
  isMain    Int      @map("is_main")
  createdAt DateTime @map("created_at")
  
  // 表名映射
  @@map("blogs")
}
```

### 3. 条件索引

```prisma
model Blog {
  id        String   @id @default(uuid())
  title     String
  published Boolean
  deletedAt DateTime?
  
  // 部分索引（PostgreSQL）
  @@index([published], where: { deletedAt: null })
}
```

### 4. 全文搜索索引

```prisma
model Blog {
  id        String   @id @default(uuid())
  title     String
  content   String   @db.Text
  
  // PostgreSQL 全文搜索
  @@index([title, content], type: Gin)
}
```

### 5. 软删除

```prisma
model Blog {
  id        String    @id @default(uuid())
  title     String
  deletedAt DateTime? @map("deleted_at")
  
  @@index([deletedAt])
}
```

### 6. 时间戳自动管理

```prisma
model Blog {
  id        String   @id @default(uuid())
  title     String
  createdAt DateTime @default(now())  // 创建时设置
  updatedAt DateTime @updatedAt       // 更新时自动更新
}
```

### 7. 默认值

```prisma
model Blog {
  id        String   @id @default(uuid())
  title     String
  views     Int      @default(0)
  published Boolean  @default(false)
  tags      String[] @default([])
  metadata  Json     @default("{}")
}
```

### 8. 数组类型（PostgreSQL）

```prisma
model Blog {
  id        String   @id @default(uuid())
  title     String
  tags      String[]  // TEXT[]
  categories Int[]     // INTEGER[]
}
```

### 9. 原始 SQL 查询

```typescript
// 执行原始 SQL
const result = await prisma.$queryRaw`
  SELECT * FROM blogs WHERE title LIKE ${'%keyword%'}
`;

// 执行原始 SQL（不安全，需谨慎）
await prisma.$executeRawUnsafe(
  'UPDATE blogs SET views = views + 1 WHERE id = $1',
  blogId
);
```

### 10. 事务操作

```typescript
// 事务
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'user@example.com' }
  });
  
  await tx.post.create({
    data: {
      title: 'Post',
      userId: user.id
    }
  });
});

// 交互式事务
await prisma.$transaction([
  prisma.user.create({ data: { email: 'user@example.com' } }),
  prisma.post.create({ data: { title: 'Post', userId: '...' } })
]);
```

### 11. 连接池配置

在 `schema.prisma` 中：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // 连接池配置
  // connection_limit = 10
  // pool_timeout = 20
}
```

或在 `DATABASE_URL` 中：

```env
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=10&pool_timeout=20"
```

---

## 最佳实践

### 1. 迁移命名规范

使用描述性的迁移名称：

```bash
# ✅ 好的命名
npx prisma migrate dev --name add_user_avatar_field
npx prisma migrate dev --name create_blog_indexes
npx prisma migrate dev --name add_user_post_relation

# ❌ 不好的命名
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
```

### 2. Schema 组织

- 按功能模块组织模型
- 使用注释说明字段用途
- 保持一致的命名风格

```prisma
// ============================================
// User Module
// ============================================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  // ... 其他字段
}

// ============================================
// Blog Module
// ============================================

model Blog {
  id        String   @id @default(uuid())
  title     String
  // ... 其他字段
}
```

### 3. 字段命名

- 使用 camelCase（Prisma 模型）
- 使用 @map 映射到数据库的 snake_case
- 布尔字段使用 `is`, `has`, `can` 前缀

```prisma
model Blog {
  isPublished Boolean @default(false) @map("is_published")
  hasComments Boolean @default(true) @map("has_comments")
  canEdit     Boolean @default(false) @map("can_edit")
}
```

### 4. 索引策略

- 为经常查询的字段添加索引
- 为外键添加索引
- 避免过度索引（影响写入性能）

```prisma
model Post {
  id        String   @id @default(uuid())
  title     String
  userId    String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  
  // 为外键添加索引（Prisma 会自动为关系字段创建索引）
  @@index([userId])
  // 为经常查询的字段添加索引
  @@index([createdAt])
  // 复合索引用于多字段查询
  @@index([userId, createdAt])
}
```

### 5. 数据迁移安全

- 生产环境使用 `migrate deploy` 而不是 `migrate dev`
- 在迁移前备份数据库
- 测试迁移脚本
- 使用 `--create-only` 先创建迁移文件检查

### 6. 性能优化

- 使用 `select` 只查询需要的字段
- 使用 `include` 或 `select` 控制关联查询
- 合理使用索引
- 避免 N+1 查询问题

```typescript
// ✅ 好的查询
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    user: {
      select: {
        id: true,
        email: true
      }
    }
  }
});

// ❌ 避免 N+1
// 不要这样：
const posts = await prisma.post.findMany();
for (const post of posts) {
  const user = await prisma.user.findUnique({ where: { id: post.userId } });
}
```

### 7. 错误处理

```typescript
import { Prisma } from '@prisma/client';

try {
  const user = await prisma.user.create({
    data: { email: 'user@example.com' }
  });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // 唯一约束违反
      console.error('Email already exists');
    }
  }
  throw error;
}
```

---

## 常见问题

### 1. 迁移冲突

如果多人同时修改 schema：

```bash
# 重置迁移（仅开发环境）
npx prisma migrate reset

# 或手动解决冲突后
npx prisma migrate resolve --applied migration_name
```

### 2. Schema 和数据库不同步

```bash
# 从数据库拉取当前结构
npx prisma db pull

# 或推送 schema 到数据库（不创建迁移）
npx prisma db push
```

### 3. 生成 Client 失败

```bash
# 清理并重新生成
rm -rf node_modules/.prisma
npx prisma generate
```

### 4. 迁移回滚

Prisma 不直接支持回滚，需要创建新的迁移来撤销更改：

```bash
# 创建撤销迁移
npx prisma migrate dev --name revert_previous_change
```

---

## 总结

Prisma 提供了强大的数据库管理功能，通过 Schema 定义、迁移系统和类型安全的 Client，让数据库操作更加简单和安全。遵循最佳实践，可以确保项目的可维护性和性能。

更多信息请参考：[Prisma 官方文档](https://www.prisma.io/docs)

