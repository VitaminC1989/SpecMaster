/**
 * Serverless 函数：生成七牛上传凭证
 * 手动实现（不依赖 qiniu SDK，更适合 Serverless 环境）
 * 部署到 Vercel/Netlify 后自动生成 API 端点
 *
 * 本地测试：npm install -g vercel && vercel dev
 * 部署：vercel --prod
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'crypto';

// 从环境变量读取七牛密钥（需在 Vercel 控制台配置）
const QINIU_ACCESS_KEY = process.env.QINIU_ACCESS_KEY || '';
const QINIU_SECRET_KEY = process.env.QINIU_SECRET_KEY || '';
const QINIU_BUCKET = process.env.QINIU_BUCKET || '';

/**
 * HMAC-SHA1 签名（返回 Buffer，不进行 Base64 编码）
 */
function hmacSha1(secretKey: string, data: string): Buffer {
  const hmac = createHmac('sha1', secretKey);
  hmac.update(data);
  return hmac.digest(); // 返回 Buffer，不是 Base64 字符串
}

/**
 * URL 安全的 Base64 编码（接受 string 或 Buffer）
 * 注意：保留尾部的 = 填充符（与官方 SDK 保持一致）
 */
function urlSafeBase64Encode(data: string | Buffer): string {
  const buffer = typeof data === 'string' ? Buffer.from(data) : data;
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  // 不删除 = 填充符
}

/**
 * 生成上传凭证
 * 参考：https://developer.qiniu.com/kodo/1208/upload-token
 */
function generateUploadToken(accessKey: string, secretKey: string, bucket: string): string {
  // 1. 构造上传策略（字段顺序要和官方 SDK 一致）
  const policy = {
    scope: bucket,
    returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"mimeType":"$(mimeType)"}',
    deadline: Math.floor(Date.now() / 1000) + 3600, // 字段顺序：scope, returnBody, deadline
  };

  // 2. 将策略 JSON 进行 URL 安全的 Base64 编码
  const encodedPolicy = urlSafeBase64Encode(JSON.stringify(policy));

  // 3. 对编码后的策略进行 HMAC-SHA1 签名
  const sign = hmacSha1(secretKey, encodedPolicy);

  // 4. 对签名结果进行 URL 安全的 Base64 编码
  const encodedSign = urlSafeBase64Encode(sign);

  // 5. 拼接上传凭证：AccessKey:EncodedSign:EncodedPolicy
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
    // 生成上传凭证（使用官方 SDK）
    const token = generateUploadToken(
      QINIU_ACCESS_KEY,
      QINIU_SECRET_KEY,
      QINIU_BUCKET
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
