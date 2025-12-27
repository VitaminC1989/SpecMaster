# 七牛云 OSS 接入指南

本项目支持使用七牛云对象存储服务来管理图片上传，采用**客户端直传**方案，既安全又高效。

## 📋 目录

- [架构说明](#架构说明)
- [快速开始](#快速开始)
- [部署方式](#部署方式)
- [组件集成](#组件集成)
- [常见问题](#常见问题)

---

## 架构说明

### 安全的客户端直传流程

```
前端应用              Serverless 函数         七牛云
   │                       │                   │
   │  ① 请求上传凭证       │                   │
   ├──────────────────────>│                   │
   │                       │                   │
   │  ② 返回临时 Token     │                   │
   │<──────────────────────┤                   │
   │                       │                   │
   │  ③ 使用 Token 直传文件                    │
   ├───────────────────────────────────────────>│
   │                       │                   │
   │  ④ 返回文件 URL                           │
   │<───────────────────────────────────────────┤
```

### 核心优势

- ✅ **安全**：密钥保存在服务端，前端只使用临时凭证
- ✅ **高效**：文件直传七牛，不经过应用服务器
- ✅ **简单**：前端只需调用 `uploadToQiniu()` 即可
- ✅ **渐进**：支持开发、测试、生产环境平滑过渡

---

## 快速开始

### 1. 注册七牛云账号

1. 访问 [七牛云官网](https://www.qiniu.com/) 注册账号
2. 完成实名认证（免费版有 10GB 存储 + 10GB 流量/月）
3. 创建存储空间（Bucket）：
   - 登录控制台 → 对象存储 → 新建空间
   - 选择公开空间（用于公网访问图片）
   - 选择存储区域（建议选离用户近的）

### 2. 获取配置信息

在七牛云控制台获取以下信息：

#### 密钥信息（个人中心 → 密钥管理）
```
AccessKey: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SecretKey: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 空间信息（对象存储 → 空间概览）
```
空间名称: your-bucket-name
存储区域: 华南（z2）
CDN 域名: xxxxxx.qiniucdn.com 或自定义域名
```

### 3. 配置项目

#### 3.1 复制环境变量文件

```bash
cp .env.example .env.local
```

#### 3.2 编辑 `.env.local`

```bash
# 前端配置（可以公开）
VITE_QINIU_TOKEN_ENDPOINT=/api/qiniu-token
VITE_QINIU_DOMAIN=https://your-bucket.qiniucdn.com  # 替换为你的 CDN 域名

# Serverless 函数配置（保密！不要提交到 Git）
QINIU_ACCESS_KEY=your_access_key_here               # 替换为你的 AccessKey
QINIU_SECRET_KEY=your_secret_key_here               # 替换为你的 SecretKey
QINIU_BUCKET=your-bucket-name                       # 替换为你的空间名称
QINIU_DOMAIN=https://your-bucket.qiniucdn.com       # 同上
```

⚠️ **重要**：`.env.local` 已添加到 `.gitignore`，不会被提交到代码仓库。

### 4. 安装依赖

```bash
npm install qiniu-js
```

### 5. 本地开发

#### 配置 Vite 代理（可选，用于本地测试）

编辑 `vite.config.ts`：

```typescript
export default defineConfig({
  // ...其他配置
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 你的 Serverless 函数本地服务
        changeOrigin: true,
      },
    },
  },
});
```

#### 启动开发服务器

```bash
npm run dev
```

---

## 部署方式

根据你的需求选择合适的部署方式：

### 方式 1：Vercel 部署（推荐，最简单）

#### 步骤

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **部署项目**
   ```bash
   vercel
   ```

3. **配置环境变量**
   - 访问 Vercel 控制台 → 你的项目 → Settings → Environment Variables
   - 添加以下变量：
     ```
     QINIU_ACCESS_KEY = xxx
     QINIU_SECRET_KEY = xxx
     QINIU_BUCKET = xxx
     QINIU_DOMAIN = xxx
     ```

4. **重新部署**
   ```bash
   vercel --prod
   ```

#### 自动生成的 API 端点

部署后，Serverless 函数会自动生成 API：
```
https://your-project.vercel.app/api/qiniu-token
```

更新 `.env.local` 中的 `VITE_QINIU_TOKEN_ENDPOINT` 为此地址。

---

### 方式 2：Netlify 部署

类似 Vercel，只需将 `api/` 目录改为 `netlify/functions/`。

---

### 方式 3：自建后端（Node.js/Express）

如果你已有后端服务，可以将 `api/qiniu-token.ts` 中的逻辑集成到你的后端。

#### Express 示例

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();

// 生成上传凭证
app.get('/api/qiniu-token', (req, res) => {
  const accessKey = process.env.QINIU_ACCESS_KEY;
  const secretKey = process.env.QINIU_SECRET_KEY;
  const bucket = process.env.QINIU_BUCKET;

  const policy = {
    scope: bucket,
    deadline: Math.floor(Date.now() / 1000) + 3600,
  };

  const encodedPolicy = Buffer.from(JSON.stringify(policy)).toString('base64url');
  const sign = crypto.createHmac('sha1', secretKey).update(encodedPolicy).digest('base64');
  const encodedSign = Buffer.from(sign, 'base64').toString('base64url');
  const token = `${accessKey}:${encodedSign}:${encodedPolicy}`;

  res.json({ token });
});

app.listen(3000);
```

---

## 组件集成

### 使用示例

#### 1. 基础用法

```typescript
import { uploadToQiniu } from '@/utils/qiniuUpload';

const handleUpload = async (file: File) => {
  try {
    const url = await uploadToQiniu({
      file,
      prefix: 'samples', // 文件路径前缀
      onProgress: (percent) => {
        console.log(`上传进度: ${percent}%`);
      },
    });

    console.log('上传成功，图片地址:', url);
    // 将 URL 保存到状态或数据库
  } catch (error) {
    console.error('上传失败:', error);
  }
};
```

#### 2. 替换现有组件中的 base64 上传

**修改 `MaterialColorEditor.tsx`**

```diff
+ import { uploadToQiniu } from '@/utils/qiniuUpload';

  const handleImageUpload = async (file: File) => {
-   const reader = new FileReader();
-   reader.readAsDataURL(file);
-   reader.onload = () => {
-     const newImageUrl = reader.result as string;
-     setImageUrl(newImageUrl);
-     onChange?.({ text, imageUrl: newImageUrl });
-   };
+   try {
+     const newImageUrl = await uploadToQiniu({
+       file,
+       prefix: 'colors',
+       onProgress: (percent) => console.log(`上传进度: ${percent}%`),
+     });
+     setImageUrl(newImageUrl);
+     onChange?.({ text, imageUrl: newImageUrl });
+     message.success('色卡上传成功');
+   } catch (error) {
+     message.error('上传失败，请重试');
+   }

    return false;
  };
```

**修改 `CreateVariantModal.tsx`**

```diff
+ import { uploadToQiniu } from '@/utils/qiniuUpload';

  const handleImageChange = async (info: any) => {
    const file = info.file.originFileObj || info.file;

    if (file) {
-     const reader = new FileReader();
-     reader.readAsDataURL(file);
-     reader.onload = () => {
-       setImageUrl(reader.result as string);
-       message.success('图片上传成功');
-     };
+     try {
+       const url = await uploadToQiniu({
+         file,
+         prefix: 'samples',
+         onProgress: (percent) => console.log(`上传进度: ${percent}%`),
+       });
+       setImageUrl(url);
+       message.success('样衣图片上传成功');
+     } catch (error) {
+       message.error('上传失败，请重试');
+     }
    }
  };
```

#### 3. 带降级的上传（可选）

如果希望在七牛上传失败时自动降级为 base64：

```typescript
import { uploadWithFallback } from '@/utils/qiniuUpload';

const url = await uploadWithFallback(file, {
  prefix: 'samples',
  onProgress: (percent) => console.log(percent),
});
```

---

## 常见问题

### Q1: 本地开发时报错 "获取上传凭证失败"

**原因**：Serverless 函数未启动或环境变量未配置。

**解决方案**：
1. 检查 `.env.local` 是否正确配置
2. 使用 Vercel CLI 本地运行：
   ```bash
   vercel dev
   ```
3. 或者临时使用降级方案（base64）进行开发

---

### Q2: 上传成功但图片无法访问（403/404）

**原因**：存储空间权限或 CDN 域名配置问题。

**解决方案**：
1. 确认存储空间是**公开空间**（对象存储 → 空间设置 → 访问控制）
2. 确认 CDN 域名已绑定并生效（七牛提供测试域名有效期 30 天）
3. 如果使用自定义域名，需完成 CNAME 解析和 SSL 配置

---

### Q3: 如何限制上传文件大小和类型？

**前端限制**（`qiniuUpload.ts`）：
```typescript
if (file.size > 5 * 1024 * 1024) { // 5MB
  throw new Error('文件大小不能超过 5MB');
}

if (!file.type.startsWith('image/')) {
  throw new Error('仅支持上传图片');
}
```

**后端限制**（`api/qiniu-token.ts`）：
```typescript
const policy = {
  scope: bucket,
  deadline: Math.floor(Date.now() / 1000) + 3600,
  fsizeLimit: 5 * 1024 * 1024,  // 限制 5MB
  mimeLimit: 'image/*',          // 限制图片类型
};
```

---

### Q4: 生产环境如何保护密钥安全？

- ✅ 使用环境变量（不要硬编码）
- ✅ 使用 Vercel/Netlify 的环境变量加密存储
- ✅ 定期轮换 AccessKey/SecretKey
- ✅ 为不同环境使用不同的七牛空间和密钥
- ✅ 启用七牛的访问日志监控

---

### Q5: 如何迁移已有的 base64 图片？

可以写一个脚本批量转换：

```typescript
import { uploadToQiniu } from '@/utils/qiniuUpload';

async function migrateBase64ToQiniu(base64Url: string): Promise<string> {
  // 将 base64 转为 Blob
  const res = await fetch(base64Url);
  const blob = await res.blob();
  const file = new File([blob], 'image.jpg', { type: blob.type });

  // 上传到七牛
  return uploadToQiniu({ file, prefix: 'migrated' });
}

// 使用
const newUrl = await migrateBase64ToQiniu(oldBase64Url);
```

---

## 后续优化建议

1. **添加上传队列管理**（大量图片上传时）
2. **集成图片压缩**（使用七牛的图片处理 API）
3. **添加上传失败重试机制**
4. **实现图片删除功能**（调用七牛删除 API）
5. **添加水印、裁剪等图片处理功能**

---

## 相关链接

- [七牛云官网](https://www.qiniu.com/)
- [七牛云对象存储文档](https://developer.qiniu.com/kodo)
- [七牛 JavaScript SDK](https://developer.qiniu.com/kodo/sdk/javascript)
- [Vercel 部署文档](https://vercel.com/docs)
- [Netlify Functions 文档](https://docs.netlify.com/functions/overview/)
