/**
 * Serverless 函数：生成七牛上传凭证
 * 使用七牛官方 Node.js SDK
 * 部署到 Vercel/Netlify 后自动生成 API 端点
 *
 * 本地测试：npm install -g vercel && vercel dev
 * 部署：vercel --prod
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as qiniu from 'qiniu';

// 从环境变量读取七牛密钥（需在 Vercel 控制台配置）
const QINIU_ACCESS_KEY = process.env.QINIU_ACCESS_KEY || '';
const QINIU_SECRET_KEY = process.env.QINIU_SECRET_KEY || '';
const QINIU_BUCKET = process.env.QINIU_BUCKET || '';

/**
 * 生成上传凭证（使用官方 SDK）
 */
function generateUploadToken(accessKey: string, secretKey: string, bucket: string): string {
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

  const options = {
    scope: bucket,
    expires: 3600, // 1 小时有效期
    returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"mimeType":"$(mimeType)"}',
  };

  const putPolicy = new qiniu.rs.PutPolicy(options);
  return putPolicy.uploadToken(mac);
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
