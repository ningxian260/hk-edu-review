# 香港教育評價平台 MVP

一個以繁體中文香港用語建立的教育評價平台 MVP，重點是可信評論、真實身份、學校與教育中心搜尋，以及管理員審核流程。

## 功能

- Next.js App Router、TypeScript、Tailwind CSS
- PostgreSQL + Prisma schema
- NextAuth / Auth.js，支援 Google 和 Email provider 設定
- 首頁搜尋、地區瀏覽、機構列表、機構詳情頁
- 已驗證身份評論與七項分項評分
- 文件式身份驗證申請，證明文件存於 Supabase Storage 私有 bucket
- 管理後台：身份驗證審核、評論審核、基本統計
- 無 `DATABASE_URL` 時可用內建預覽資料瀏覽公開頁面

## 啟動

```bash
npm install
npm run dev
```

打開 http://localhost:3000。

## Supabase 資料庫設定

1. 到 Supabase 建立新 project。
2. 在 SQL Editor 建立 Prisma 專用資料庫用戶，並授權 public schema。
3. 到 Project Settings > Connect 複製 Supavisor Session pooler 連線字串。
4. 把 `.env` 的 `DATABASE_URL` 換成真實 Supabase 連線字串。
5. 確認 `ADMIN_EMAIL` 是第一個管理員電郵。
6. 初始化資料庫：

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

`ADMIN_EMAIL` 對應的帳戶會在 seed 時建立為管理員。

Supabase Prisma SQL 範例：

```sql
create user "prisma" with password 'your_secure_password' bypassrls createdb;
grant "prisma" to "postgres";
grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
```

本地開發使用 Session pooler，通常是 `:5432/postgres`。如果之後部署到 serverless 環境，再考慮 Supavisor transaction mode。

## 驗證

```bash
npm run lint
npm run test
npm run build
```

## Render 免費部署

此專案已包含 `render.yaml`，可部署為 Render Free Web Service。免費服務閒置一段時間後會休眠，第一次打開可能需要等待啟動。

Render 建議設定：

- Service type: Web Service
- Instance type: Free
- Build Command: `npm ci && npm run build`
- Start Command: `npm run start`

Render Environment Variables 需要加入：

```bash
DATABASE_URL=""
AUTH_SECRET=""
NEXTAUTH_SECRET=""
AUTH_URL="https://your-app.onrender.com"
NEXTAUTH_URL="https://your-app.onrender.com"
AUTH_TRUST_HOST="true"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
ADMIN_EMAIL=""
SUPABASE_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
SUPABASE_STORAGE_BUCKET="verification-proofs"
```

部署完成後，到 Google Cloud Console 把正式回調地址加入 OAuth Client：

```text
https://your-app.onrender.com/api/auth/callback/google
```

## Supabase Storage 設定

身份驗證證明文件會上傳到 Supabase Storage 私有 bucket。到 Supabase Dashboard > Storage 建立一個 private bucket，建議名稱為 `verification-proofs`。

`.env` 需要加入：

```bash
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="verification-proofs"
```

`SUPABASE_SERVICE_ROLE_KEY` 只可放在伺服器環境變數，不要放入前端公開變數或提交到 Git。後台下載證明文件時會先檢查管理員權限，再由伺服器從 private bucket 讀取文件。

## 資料來源

首批機構資料以公開可核查來源建立，並在每筆資料保留來源網址。學校和教育中心的電話、學費、校區等易變資料只在可佐證時展示，否則提示以官方公布為準。
