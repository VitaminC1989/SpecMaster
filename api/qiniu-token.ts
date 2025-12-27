/**
 * Serverless 函数：生成七牛上传凭证
 * 部署到 Vercel/Netlify 后自动生成 API 端点
 *
 * 本地测试：npm install -g vercel && vercel dev
 * 部署：vercel --prod
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// 从环境变量读取七牛密钥（需在 Vercel 控制台配置）
const QINIU_ACCESS_KEY = process.env.QINIU_ACCESS_KEY || '';
const QINIU_SECRET_KEY = process.env.QINIU_SECRET_KEY || '';
const QINIU_BUCKET = process.env.QINIU_BUCKET || '';

/**
 * HMAC-SHA1 签名（Node.js 内置实现）
 */
function hmacSha1(secretKey: string, data: string): string {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha1', secretKey);
  hmac.update(data);
  return hmac.digest('base64');
}

/**
 * 生成上传凭证
 */
function generateUploadToken(
  accessKey: string,
  secretKey: string,
  bucket: string,
  expires: number = 3600
): string {
  // 1. 构造上传策略
  const policy = {
    scope: bucket,
    deadline: Math.floor(Date.now() / 1000) + expires,
    returnBody: JSON.stringify({
      key: '$(key)',
      hash: '$(etag)',
      fsize: '$(fsize)',
      mimeType: '$(mimeType)',
    }),
  };

  // 2. 将策略 JSON 进行 Base64 编码
  const encodedPolicy = Buffer.from(JSON.stringify(policy)).toString('base64url');

  // 3. 对编码后的策略进行 HMAC-SHA1 签名
  const sign = hmacSha1(secretKey, encodedPolicy);
  const encodedSign = Buffer.from(sign, 'base64').toString('base64url');

  // 4. 拼接上传凭证
  return `${accessKey}:${encodedSign}:${encodedPolicy}`;
}

/**
 * API Handler
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  // 允许跨域（如果前后端不同域名）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 仅允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 检查环境变量配置
  if (!QINIU_ACCESS_KEY || !QINIU_SECRET_KEY || !QINIU_BUCKET) {
    console.error('七牛云配置缺失，请设置环境变量');
    return res.status(500).json({
      error: '服务配置错误',
      message: '请联系管理员配置七牛云密钥'
    });
  }

  try {
    // 生成上传凭证（1 小时有效期）
    const token = generateUploadToken(
      QINIU_ACCESS_KEY,
      QINIU_SECRET_KEY,
      QINIU_BUCKET,
      3600
    );

    // 返回凭证
    return res.status(200).json({
      token,
      domain: process.env.QINIU_DOMAIN || '',
      expires: 3600,
    });
  } catch (error) {
    console.error('生成上传凭证失败:', error);
    return res.status(500).json({
      error: '生成上传凭证失败',
      message: String(error)
    });
  }
}
