/**
 * 本地开发用的七牛 Token 生成服务
 * 使用七牛官方 Node.js SDK
 * 使用方法：node scripts/local-qiniu-server.js
 *
 * @typedef {import('qiniu')} Qiniu
 */

// @ts-check

import { createServer } from 'http';
import { config } from 'dotenv';
import qiniu from 'qiniu';

// 加载 .env.local 文件
config({ path: '.env.local' });

const PORT = 3001;

// 从环境变量读取七牛配置
const QINIU_ACCESS_KEY = process.env.QINIU_ACCESS_KEY || '';
const QINIU_SECRET_KEY = process.env.QINIU_SECRET_KEY || '';
const QINIU_BUCKET = process.env.QINIU_BUCKET || '';
const QINIU_DOMAIN = process.env.QINIU_DOMAIN || '';

/**
 * 生成上传凭证（使用官方 SDK）
 * @param {string} accessKey - 七牛 AccessKey
 * @param {string} secretKey - 七牛 SecretKey
 * @param {string} bucket - 存储空间名称
 * @returns {string} 上传凭证
 */
function generateUploadToken(accessKey, secretKey, bucket) {
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
 * HTTP 服务器
 */
const server = createServer((req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 处理 /api/qiniu-token 请求
  if (req.url === '/api/qiniu-token' && req.method === 'GET') {
    // 检查配置
    if (!QINIU_ACCESS_KEY || !QINIU_SECRET_KEY || !QINIU_BUCKET) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: '服务配置错误',
        message: '请在 .env.local 中配置七牛云密钥'
      }));
      return;
    }

    try {
      // 生成上传凭证（使用官方 SDK）
      const token = generateUploadToken(
        QINIU_ACCESS_KEY,
        QINIU_SECRET_KEY,
        QINIU_BUCKET
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        token,
        domain: QINIU_DOMAIN,
        expires: 3600,
      }));

      console.log(`✅ [${new Date().toLocaleTimeString()}] Token 生成成功`);
    } catch (error) {
      console.error('Token 生成失败:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: '生成上传凭证失败',
        message: String(error)
      }));
    }
  } else {
    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

// 启动服务器
server.listen(PORT, () => {
  console.log('\n🚀 本地七牛 Token 服务已启动！');
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`🔗 Token API: http://localhost:${PORT}/api/qiniu-token`);
  console.log('\n📝 配置信息:');
  console.log(`   AccessKey: ${QINIU_ACCESS_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`   SecretKey: ${QINIU_SECRET_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`   Bucket: ${QINIU_BUCKET || '❌ 未配置'}`);
  console.log(`   Domain: ${QINIU_DOMAIN || '❌ 未配置'}`);
  console.log('\n💡 提示: 前端开发服务器会自动代理到此服务');
  console.log('   运行 npm run dev 启动前端即可测试\n');
});

// 错误处理
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 已被占用，请关闭其他服务或修改端口`);
  } else {
    console.error('❌ 服务器错误:', err);
  }
  process.exit(1);
});
