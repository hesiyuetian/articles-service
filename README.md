# Articles Service

A backend service for managing **articles**, built with NestJS + Prisma + PostgreSQL.
It ships with Docker so you can run the app **and** its database with a single command.

**Language / 语言**: [English](#english) · [中文（小白版）](#中文小白版)

---

## English

### What is this?

A REST API service for article CRUD. It bundles:

-   **App** — a NestJS API service (default port `3030`)
-   **Database** — PostgreSQL (stores the articles)

With Docker, both start together — you don't need to install a database yourself.

### Tech Stack

-   **Framework**: NestJS 10
-   **Database**: PostgreSQL 16
-   **ORM**: Prisma 5
-   **Validation**: class-validator, class-transformer
-   **Docs**: Swagger / OpenAPI

---

### Run with Docker (recommended)

#### 1. Install Docker

Install **Docker Desktop**: <https://www.docker.com/products/docker-desktop/>

Verify it works:

```bash
docker -v
docker compose version
```

#### 2. Configure environment variables

Copy the template and edit it:

```bash
cp env.example .env
```

Key fields in `.env`:

| Variable            | Purpose      | What to set                                   |
| ------------------- | ------------ | --------------------------------------------- |
| `POSTGRES_USER`     | DB username  | Default `admin` is fine                       |
| `POSTGRES_PASSWORD` | DB password  | **Set your own** (e.g. `mypassword123`)       |
| `POSTGRES_DB`       | DB name      | Default `articles` is fine                    |
| `APP_PORT`          | Public port  | Default `3030`; change if taken (e.g. `8080`) |
| `STORAGE_TYPE`      | File storage | `local`, `aws`, or `gcs`                      |

> 💡 Leave `DATABASE_URL` empty — Docker Compose sets it automatically (host `postgres`).

#### 2.1 File storage (image uploads)

The `/upload/*` endpoints save files to one of three backends, chosen by `STORAGE_TYPE`:

| `STORAGE_TYPE` | Where files go | Required config |
| -------------- | -------------- | --------------- |
| `local` | Local disk — **no cloud account needed** | `FILES_STORE`, `ASSET_BASE_URL` |
| `aws` | AWS S3 + CloudFront | `AWS_*` |
| `gcs` | Google Cloud Storage | `GOOGLE_CLOUD_*` |

**No AWS or GCS? Use local storage.** In `.env` set:

```env
STORAGE_TYPE=local
FILES_STORE=files                      # static asset location: folder where uploads are written
ASSET_BASE_URL=http://localhost:3030   # URL prefix returned to clients to reach the file
```

- `FILES_STORE` — the static asset storage location. Uploaded images/PDFs are written to this folder inside the app (e.g. `files/`). You can leave the `AWS_*` and `GOOGLE_*` fields empty.
- `ASSET_BASE_URL` — the public URL prefix prepended to a stored file's path and returned in the API response.

> ⚠️ **Two things to know about local storage:**
>
> 1. **Persistence in Docker** — the folder lives inside the container and is wiped on rebuild. `docker-compose.yml` already bind-mounts `./${FILES_STORE}` to your host so the files survive. The folder (e.g. `./files`) is created automatically on first upload.
> 2. **Serving the files** — this service *stores* files but does not *serve* them over HTTP. To actually open an uploaded image at `ASSET_BASE_URL`, put a static file server / reverse proxy (e.g. Nginx) in front of the `FILES_STORE` folder. With `aws` / `gcs`, the cloud provider serves the files for you.

#### 3. Start

```bash
docker compose up -d --build
```

-   `up` start, `-d` run in background, `--build` (re)build the image.
-   The first run takes a few minutes (download + build). Success looks like:

```
Container articles-service-postgres-1  Healthy
Container articles-service-app-1       Started
```

The app runs DB migrations automatically on startup (creates the `articles` table).

#### 4. Verify

```bash
docker compose ps          # both containers should be "Up"/"running"
```

Open the interactive API docs in a browser:

👉 <http://localhost:3030/docs>

Quick test from the terminal:

```bash
# create an article
curl -X POST http://localhost:3030/articles \
  -H "Content-Type: application/json" \
  -d '{"host":"example.com","pathname":"/hello","content":"hello world"}'

# list articles
curl "http://localhost:3030/articles?page=1&size=10"
```

---

### API Reference

All endpoints are prefixed with `/articles`:

| Action | Method   | Path                       | Notes                               |
| ------ | -------- | -------------------------- | ----------------------------------- |
| Create | `POST`   | `/articles`                | body: `host`, `pathname`, `content` |
| List   | `GET`    | `/articles?page=1&size=10` | fuzzy filter by `host`, `pathname`  |
| Detail | `GET`    | `/articles/detail?id=xxx`  | or `host` + `pathname`              |
| Update | `PUT`    | `/articles/{id}`           | id in the path                      |
| Delete | `DELETE` | `/articles/{id}`           | id in the path                      |

Data is stored in the `articles` table.

---

### Common Commands

| Goal                          | Command                        |
| ----------------------------- | ------------------------------ |
| Show status                   | `docker compose ps`            |
| Follow app logs               | `docker compose logs -f app`   |
| Stop (keep data)              | `docker compose stop`          |
| Start again                   | `docker compose start`         |
| Down (keep data)              | `docker compose down`          |
| Down + **delete all data** ⚠️ | `docker compose down -v`       |
| Rebuild after code change     | `docker compose up -d --build` |

> 💡 Data lives in the `pgdata` volume. As long as you don't pass `-v`, your data survives restarts.

---

### Troubleshooting

-   **Can't access / API errors** → check logs: `docker compose logs -f app` (`Ctrl+C` to exit).
-   **Port already in use** (`port is already allocated`) → set a different `APP_PORT` in `.env`, then `docker compose down && docker compose up -d`. Access at the new port.
-   **Start over from scratch** → `docker compose down -v && docker compose up -d --build` (⚠️ deletes all data).
-   **`Cannot connect to the Docker daemon`** → Docker Desktop isn't running; start it and wait until the whale icon is steady.

---

### Local Development (without Docker)

Requires Node 20+ and a running PostgreSQL.

```bash
pnpm install                                  # install deps
cp env.example .env                           # set DATABASE_URL to your local PG
pnpm run prisma:generate                      # generate Prisma client
pnpm exec prisma migrate deploy \
  --schema=./lib/prisma/prisma/schema.prisma  # apply migrations
pnpm run start:dev                            # dev mode (watch)
```

Other scripts: `pnpm run build`, `pnpm run start:prod`, `pnpm run format`, `pnpm run lint`, `pnpm run test`, `pnpm run prisma:studio`.

---

### Security 🔒

-   `.env` holds passwords/keys — **never** commit it (already gitignored, and excluded from the image).
-   If real AWS keys were ever in `.env`, **rotate them** in the AWS console.
-   Use a strong `POSTGRES_PASSWORD` when deploying to a public server.

---

---

## 中文

这是一份手把手教程，教你如何把 **Articles 文章服务** 跑起来。
全程用 Docker，不需要你懂 Node.js、数据库，只要会复制粘贴命令就行。

### 一、这个服务是干什么的？

它是一个提供「文章」增删改查的后端接口服务，自带：

-   **应用本体**：基于 NestJS 的接口服务（默认端口 `3030`）
-   **数据库**：PostgreSQL（用来存文章数据）

这两个东西会被 Docker 一起打包启动，你不用单独装数据库。

### 二、开始之前：装好 Docker

你只需要装一个软件：**Docker Desktop**。

1. 打开官网下载：<https://www.docker.com/products/docker-desktop/>
2. 根据你的电脑系统（Windows / Mac）下载并安装
3. 安装后打开 Docker Desktop，等左下角的小鲸鱼图标变成**稳定状态**
4. 打开「终端」（Mac 用「终端 Terminal」，Windows 用「PowerShell」），检查是否装好：

    ```bash
    docker -v
    docker compose version
    ```

    如果都能显示版本号（例如 `Docker version 27.x`），说明装好了 ✅

### 三、配置环境变量（填一个 .env 文件）

进入项目目录后，复制模板：

```bash
cp env.example .env
```

用任意文本编辑器打开 `.env`，重点关注这几项：

| 配置项              | 作用         | 小白怎么填                                        |
| ------------------- | ------------ | ------------------------------------------------- |
| `POSTGRES_USER`     | 数据库用户名 | 保持默认 `admin` 即可                             |
| `POSTGRES_PASSWORD` | 数据库密码   | **改成你自己的密码**，比如 `mypassword123`        |
| `POSTGRES_DB`       | 数据库名     | 保持默认 `articles` 即可                          |
| `APP_PORT`          | 服务对外端口 | 保持默认 `3030`，被占用可改成别的，比如 `8080`    |
| `STORAGE_TYPE`      | 文件存储方式 | 用本地存储填 `local`；用 AWS / 谷歌云再填对应配置 |

> 💡 **不用管 `DATABASE_URL`**：用 Docker 启动时它会被自动设置好，留空就行。

#### 文件存储（图片上传）

`/upload/*` 上传接口会把文件保存到三种存储之一，由 `STORAGE_TYPE` 决定：

| `STORAGE_TYPE` | 文件存到哪 | 需要的配置 |
| -------------- | ---------- | ---------- |
| `local` | 本地磁盘，**无需任何云账号** | `FILES_STORE`、`ASSET_BASE_URL` |
| `aws` | AWS S3 + CloudFront | `AWS_*` |
| `gcs` | 谷歌云存储 | `GOOGLE_CLOUD_*` |

**没有 AWS 或 GCS 存储服务？把上传的图片资源保存到本地即可。** 在 `.env` 里设置：

```env
STORAGE_TYPE=local
FILES_STORE=files                      # 静态资源存储位置：上传文件写入的文件夹
ASSET_BASE_URL=http://localhost:3030   # 返回给前端、用于访问文件的 URL 前缀
```

- `FILES_STORE` —— **静态资源存储位置**。上传的图片/PDF 会写到应用里的这个文件夹（例如 `files/`）。此时 `AWS_*`、`GOOGLE_*` 都可以留空。
- `ASSET_BASE_URL` —— 文件保存后，接口返回的访问地址会以它为前缀拼接出完整 URL。

> ⚠️ **本地存储要注意两点：**
>
> 1. **Docker 下的数据持久化** —— 文件夹在容器内部，重建镜像会被清空。`docker-compose.yml` 已经把 `./${FILES_STORE}` 挂载到你本机，所以文件不会丢；文件夹（如 `./files`）会在第一次上传时自动创建。
> 2. **文件的对外访问** —— 本服务只负责**保存**文件，并不会通过 HTTP **对外提供**这些文件。想真正通过 `ASSET_BASE_URL` 打开图片，需要在 `FILES_STORE` 文件夹前面架一个静态文件服务器 / 反向代理（如 Nginx）。用 `aws` / `gcs` 时则由云服务商负责对外访问。

### 四、一键启动

在项目目录下运行：

```bash
docker compose up -d --build
```

-   `up`：启动；`-d`：后台运行；`--build`：构建镜像
-   第一次会比较慢（下载 + 构建，几分钟），耐心等待。看到下面输出就成功了：

```
Container articles-service-postgres-1  Healthy
Container articles-service-app-1       Started
```

应用启动时会**自动建表**（创建 `articles` 表），无需手动操作。

### 五、验证是否成功

```bash
docker compose ps   # 两个容器状态是 Up / running 就对了
```

用浏览器打开接口文档（最直观，可在网页上直接点按钮测试）：

👉 <http://localhost:3030/docs>

命令测试（可选）：

```bash
# 新建一篇文章
curl -X POST http://localhost:3030/articles \
  -H "Content-Type: application/json" \
  -d '{"host":"example.com","pathname":"/hello","content":"你好世界"}'

# 查询文章列表
curl "http://localhost:3030/articles?page=1&size=10"
```

返回里有 `"success":true` 就说明成功了。

### 六、接口一览

所有接口前缀都是 `/articles`：

| 操作     | 方法     | 地址                       | 说明                               |
| -------- | -------- | -------------------------- | ---------------------------------- |
| 新建文章 | `POST`   | `/articles`                | 传 `host`、`pathname`、`content`   |
| 文章列表 | `GET`    | `/articles?page=1&size=10` | 支持按 `host`、`pathname` 模糊搜索 |
| 文章详情 | `GET`    | `/articles/detail?id=xxx`  | 也可用 `host`+`pathname` 查        |
| 修改文章 | `PUT`    | `/articles/{id}`           | 路径里带文章 id                    |
| 删除文章 | `DELETE` | `/articles/{id}`           | 路径里带文章 id                    |

> 数据存在数据库的 `articles` 表里。

### 七、日常常用命令

| 我想做什么                     | 命令                           |
| ------------------------------ | ------------------------------ |
| 查看运行状态                   | `docker compose ps`            |
| 查看应用日志（排查问题）       | `docker compose logs -f app`   |
| 停止服务（保留数据）           | `docker compose stop`          |
| 重新启动                       | `docker compose start`         |
| 关闭并删除容器（**保留数据**） | `docker compose down`          |
| 关闭并**删除所有数据** ⚠️      | `docker compose down -v`       |
| 改了代码后重新构建启动         | `docker compose up -d --build` |

> 💡 数据存在一个叫 `pgdata` 的「数据卷」里，只要不加 `-v`，停止/重启数据都不会丢。

### 八、遇到问题怎么办？

-   **访问不了 / 接口报错** → 先看日志：`docker compose logs -f app`（按 `Ctrl+C` 退出）。
-   **端口 3030 被占用**（报错含 `port is already allocated`）→ 在 `.env` 把 `APP_PORT` 改成别的（如 `8080`），然后 `docker compose down && docker compose up -d`，访问地址也改成新端口。
-   **想彻底重来（清空数据）** → `docker compose down -v && docker compose up -d --build`（⚠️ 会删除所有数据）。
-   **报错 `Cannot connect to the Docker daemon`** → Docker Desktop 没启动，打开它等图标稳定后再试。

### 九、本地开发（不用 Docker）

需要 Node 20+ 和一个已运行的 PostgreSQL。

```bash
pnpm install                                  # 安装依赖
cp env.example .env                           # 把 DATABASE_URL 改成你本地的 PG
pnpm run prisma:generate                      # 生成 Prisma 客户端
pnpm exec prisma migrate deploy \
  --schema=./lib/prisma/prisma/schema.prisma  # 应用迁移建表
pnpm run start:dev                            # 开发模式（热更新）
```

其他脚本：`pnpm run build`、`pnpm run start:prod`、`pnpm run format`、`pnpm run lint`、`pnpm run test`、`pnpm run prisma:studio`。

### 十、安全提醒 🔒

-   `.env` 里存了密码和密钥，**不要**上传到 GitHub（项目已自动忽略它）。
-   如果之前 `.env` 里有真实 AWS 密钥，建议尽快到 AWS 控制台**重新生成一套新的**。
-   部署到公网服务器时，把 `POSTGRES_PASSWORD` 改成强密码。

---

## License

MIT
