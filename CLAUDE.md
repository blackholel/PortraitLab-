# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

ShipAny Template One 是一个 AI SaaS 快速启动模板,基于 Next.js 15 (App Router)、TypeScript、Tailwind CSS 和 Shadcn UI 构建。项目整合了认证、支付、多语言、AI SDK 等完整的 SaaS 功能。

## 常用命令

### 开发和构建
```bash
pnpm dev          # 启动开发服务器(使用 Turbopack)
pnpm build        # 构建生产版本
pnpm start        # 运行生产服务器
pnpm lint         # 运行 ESLint 检查
pnpm analyze      # 分析构建包大小
```

### Cloudflare 部署
```bash
pnpm cf:build     # 构建 Cloudflare Pages 版本
pnpm cf:preview   # 本地预览 Cloudflare 版本
pnpm cf:deploy    # 部署到 Cloudflare Pages
```

### Docker
```bash
pnpm docker:build # 构建 Docker 镜像
```

### 环境配置
```bash
cp .env.example .env.local  # 设置开发环境变量
```

## 核心架构

### 分层架构模式
项目采用清晰的三层架构:

1. **Models 层** (`models/`) - 数据访问层
   - 直接与 Supabase 数据库交互
   - 封装所有数据库操作(CRUD)
   - 主要模型: `user`, `order`, `credit`, `affiliate`, `apikey`, `feedback`, `post`
   - 所有模型通过 `models/db.ts` 中的 `getSupabaseClient()` 获取数据库连接

2. **Services 层** (`services/`) - 业务逻辑层
   - 处理复杂业务逻辑和多模型协调
   - 调用 Models 层进行数据操作
   - 业务规则和计算在此层实现
   - 主要服务: `user`, `order`, `credit`, `affiliate`, `apikey`, `page`, `constant`

3. **API/组件层** (`app/api/`, `app/[locale]/`) - 表示层
   - API Routes 处理 HTTP 请求,调用 Services 层
   - 页面组件展示数据,通过 API 与后端交互

**重要原则**:
- API Routes 应调用 Services 层,Services 调用 Models 层
- 避免在 API Routes 中直接调用 Models
- 保持单向依赖: API → Services → Models

### AI SDK 集成 (`aisdk/` 和 `lib/`)
项目包含自定义 AI SDK 集成,支持多种 AI 功能:

#### 视频生成
- `aisdk/provider/` - 自定义 AI Provider 实现
- `aisdk/kling/` - Kling AI 视频生成集成
- `aisdk/generate-video/` - 视频生成工具
- 使用 Vercel AI SDK 作为基础框架

#### AI 肖像生成 (新增 ✨)
- `lib/doubao.ts` - 豆包火山 Ark API 封装
  - 支持图生图 (Image-to-Image)
  - 风格参考图模式 (用户肖像 + 风格参考 → 风格化输出)
  - 直接返回 URL,无需手动上传存储
  - 支持 2K 高分辨率输出
- `lib/style-presets.ts` - 风格预设配置管理
  - MVP 提供 3 个精选风格: Cyberpunk, Anime, Hero
  - 支持自定义风格扩展
- `app/api/generate-image/route.ts` - 图片生成 API 端点
  - 完整业务流程: 积分检查 → AI 生成 → 扣费
  - 支持 Base64 图片上传 (最大 2MB)
  - 同步生成模式 (15-30 秒,适配 Vercel Pro 5 分钟超时)
- `app/[locale]/(default)/generate-image/page.tsx` - 用户生成页面
  - 沉浸式画布设计,图片为视觉中心
  - 实时进度反馈 (上传 → 处理 → 生成 → 保存)
  - 单次生成消耗 10 积分

**技术选型**:
- **AI 模型**: 豆包 Seedream 4.0 (doubao-seedream-4-0-250828)
- **成本**: $0.02-0.05/次 (豆包) vs $0.10/次 (用户), 毛利 50%-80%
- **定价**: 10 积分/次 (100积分=$1)

### 认证系统
- 使用 NextAuth.js v5 (beta.25) 进行认证
- 配置位于 `auth/config.ts`
- 支持 Google OAuth 和 GitHub OAuth
- Session 管理通过 `auth/session.tsx`
- 用户数据存储在 Supabase

**⚠️ 代理配置 (中国大陆环境必读)**:
- **问题**: Node.js 20 的 undici fetch 不支持自动读取 `HTTP_PROXY` 环境变量
- **影响**: Google OAuth 等外部 API 调用会失败 (TypeError: fetch failed)
- **解决方案**:
  1. 已安装 `undici` 依赖包
  2. 已创建 `lib/fetch-config.ts` - 使用 ProxyAgent 配置代理支持
  3. 已在 `auth/config.ts` 的 GoogleProvider 中配置自定义 fetch
  4. **启动方式**: 必须设置环境变量启动
     ```bash
     HTTP_PROXY=http://127.0.0.1:7897 HTTPS_PROXY=http://127.0.0.1:7897 pnpm dev
     ```
  5. 代理端口根据实际工具调整 (Clash: 7890/7891, V2Ray: 1080)
- **参考**: [Auth.js Corporate Proxy Guide](https://authjs.dev/guides/corporate-proxy)

### 支付集成与积分系统
- Stripe 支付集成
- API 端点: `app/api/checkout/` (创建支付会话)
- Webhook 处理: `app/api/stripe-notify/` (处理支付回调)
- 订单管理通过 `models/order.ts` 和 `services/order.ts`
- 积分系统通过 `models/credit.ts` 和 `services/credit.ts`

**积分类型 (CreditsTransType)**:
- `new_user` - 新用户注册赠送 (10 积分)
- `order_pay` - 用户充值
- `system_add` - 系统手动添加
- `ping` - Ping API 消耗 (1 积分)
- `image_gen` - AI 图片生成消耗 (10 积分) ✨

**开发环境管理**:
- 开发 API: `POST /api/dev/add-credits` - 手动添加积分 (仅开发环境)
- SQL 脚本: `scripts/add-credits.sql` - 数据库直接操作
- 浏览器控制台快速添加:
  ```javascript
  fetch('/api/dev/add-credits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credits: 1000 })
  }).then(r => r.json()).then(console.log)
  ```

### 国际化 (i18n)
- 使用 `next-intl` 进行多语言支持
- 语言配置位于 `i18n/` 目录
- 页面翻译: `i18n/pages/landing/` - 落地页专用翻译
- 全局消息: `i18n/messages/` - 应用级通用文本
- 路由采用 `[locale]` 动态段实现语言切换
- 中间件 `middleware.ts` 处理语言检测和重定向

### 主题系统
- 使用 `next-themes` 管理明暗主题
- 主题变量定义在 `app/theme.css`
- 可通过 shadcn-ui-theme-generator 生成自定义主题
- Tailwind CSS 配置支持主题变量

### 状态管理
- 使用 React Context 进行全局状态管理
- 主要 Context: `contexts/app.tsx` (应用级状态)
- 避免过度使用全局状态,优先使用组件本地状态

## 项目结构说明

### 组件组织
- `components/blocks/` - 布局块组件(header, footer, hero 等),主要用于落地页
- `components/ui/` - 通用 UI 组件(基于 Shadcn UI)
- 组件命名使用 CamelCase
- 优先使用函数式组件和 React Hooks

### 类型定义
- `types/blocks/` - 布局块相关类型
- `types/pages/` - 页面级类型定义
- 其他模块级类型定义在各自目录
- 所有组件和函数必须有正确的 TypeScript 类型

### 工具库
- `lib/` - 自定义工具函数和库
  - `cache.ts` - 缓存工具
  - `hash.ts` - 哈希函数
  - `storage.ts` - AWS S3 存储集成
  - `time.ts` - 时间处理
  - `ip.ts` - IP 地址处理
  - `resp.ts` - API 响应格式化
  - `fetch-config.ts` - 代理 fetch 配置 (解决 OAuth 网络问题)

## 开发规范

### 样式规范
- 使用 Tailwind CSS 进行样式开发
- 优先使用 Shadcn UI 组件
- 响应式设计使用 Tailwind 断点
- 使用 `sonner` 进行 toast 通知

### 代码规范
- 遵循 TypeScript 严格模式
- 使用 ESLint 进行代码检查
- 遵循 React 最佳实践
- 保持组件模块化和可复用性

### 环境变量
关键环境变量(详见 `.env.example`):
- `NEXT_PUBLIC_WEB_URL` - 网站 URL
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` - Supabase 配置
- `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GITHUB_ID` - 认证配置
- `STRIPE_PUBLIC_KEY`, `STRIPE_PRIVATE_KEY` - Stripe 配置
- `STORAGE_*` - AWS S3 存储配置
- **AI 图片生成 (新增)** ✨:
  - `ARK_API_KEY` - 豆包火山 Ark API 密钥
  - `ARK_BASE_URL` - API 基础 URL (默认: `https://ark.cn-beijing.volces.com/api/v3`)
  - `IMAGE_GEN_COST` - 单次生成积分消耗 (默认: 10)
  - `IMAGE_GEN_MAX_SIZE` - 上传文件最大大小 (默认: 2097152 = 2MB)

### 部署配置
- **Vercel**: 使用 `output: "standalone"` 配置
- **Cloudflare Pages**: 需配置 `wrangler.toml` 和 `.env.production`
- **Docker**: 使用提供的 `Dockerfile`

## 特别注意

1. **数据库操作**: 始终通过 Models 层访问 Supabase,使用 `getSupabaseClient()` 获取客户端
2. **API Routes**: 位于 `app/api/`,遵循 Next.js App Router 规范
3. **MDX 支持**: 项目支持 MDX,配置在 `next.config.mjs`,页面扩展名可以是 `.mdx`
4. **图片优化**: Next.js Image 组件已配置支持所有 HTTPS 域名
5. **React 严格模式**: 当前禁用(`reactStrictMode: false`),可根据需要启用
6. **代理环境开发**: 中国大陆环境需使用代理启动 (见认证系统章节)

## 常见问题

### AI 肖像生成相关 (新增 ✨)

#### 积分不足错误
**现象**: "积分不足,需要 10 积分,当前剩余 0 积分"

**解决方法** (开发环境):
1. **浏览器控制台快速添加** (推荐):
   ```javascript
   fetch('/api/dev/add-credits', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ credits: 1000 })
   }).then(r => r.json()).then(console.log)
   ```

2. **通过 Supabase SQL Editor**:
   ```sql
   -- 查找用户 UUID
   SELECT uuid, email FROM users ORDER BY created_at DESC LIMIT 5;

   -- 添加 1000 积分 (替换 YOUR_UUID)
   INSERT INTO credits (trans_no, user_uuid, trans_type, credits, created_at, expired_at)
   VALUES ('dev-' || gen_random_uuid()::text, 'YOUR_UUID', 'system_add', 1000, NOW(), NOW() + INTERVAL '1 year');
   ```

3. **使用脚本**: `./scripts/add-credits.sh 1000`

**注意**: `/api/dev/add-credits` 仅在 `NODE_ENV=development` 可用,生产环境自动禁用

#### 豆包 API 调用失败
**现象**: "豆包 API 调用失败 [401/403]"

**原因**: `ARK_API_KEY` 无效或配额不足

**解决**:
1. 检查 `.env.local` 中的 `ARK_API_KEY` 配置
2. 登录 https://console.volcengine.com/ark 确认:
   - API Key 是否正确
   - 账户余额是否充足
   - Seedream 4.0 模型是否已开通

#### 生成超时
**现象**: 请求超过 10 秒超时

**原因**: Vercel Hobby Plan 限制 10 秒超时

**解决**: 升级到 Vercel Pro ($20/月, 支持 5 分钟超时)

### 认证系统相关

### Google OAuth "fetch failed" 错误
**现象**: `[auth][error] TypeError: fetch failed` 在访问 Google OAuth 时出现

**原因**: Node.js 20 undici 不自动支持 HTTP_PROXY 环境变量

**解决**:
1. 确保已安装 `undici` 依赖
2. 使用代理启动: `HTTP_PROXY=http://127.0.0.1:7897 HTTPS_PROXY=http://127.0.0.1:7897 pnpm dev`
3. 检查 `lib/fetch-config.ts` 和 `auth/config.ts` 中的代理配置

### Supabase "Invalid API key" 错误
**现象**: `save user failed: Invalid API key`

**原因**: `.env.local` 中的 `SUPABASE_SERVICE_ROLE_KEY` 配置错误

**解决**: 从 Supabase 控制台获取正确的 service_role key 并更新环境变量
