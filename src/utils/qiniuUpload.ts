/**
 * 七牛云上传工具（渐进式方案）
 * 支持客户端直传，自动处理文件名、进度、错误
 *
 * 使用方式：
 * import { uploadToQiniu } from '@/utils/qiniuUpload';
 *
 * const url = await uploadToQiniu({
 *   file,
 *   prefix: 'samples',
 *   onProgress: (percent) => console.log(percent)
 * });
 */

import * as qiniu from "qiniu-js";

/**
 * 七牛云配置
 * 可通过环境变量配置，支持多环境部署
 */
interface QiniuConfig {
  tokenEndpoint: string;  // 获取上传凭证的 API 端点
  domain: string;         // CDN 加速域名
  region: any;            // 存储区域
}

const QINIU_CONFIG: QiniuConfig = {
  // Token 获取端点（根据部署方式选择）
  tokenEndpoint: import.meta.env.VITE_QINIU_TOKEN_ENDPOINT || '/api/qiniu-token',

  // CDN 域名（需要在七牛控制台绑定）
  domain: import.meta.env.VITE_QINIU_DOMAIN || 'https://your-bucket.qiniucdn.com',

  // 存储区域（根据你的七牛空间配置）
  // 从错误信息看，你的空间在华东 z0
  region: qiniu.region.z0, // z0=华东, z1=华北, z2=华南, na0=北美, as0=东南亚
};

/**
 * 从后端获取上传凭证（安全方式）
 */
async function getUploadToken(): Promise<string> {
  try {
    const response = await fetch(QINIU_CONFIG.tokenEndpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`获取上传凭证失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.token) {
      throw new Error("返回数据中缺少 token 字段");
    }

    return data.token;
  } catch (error) {
    console.error("获取七牛上传凭证失败:", error);
    throw new Error("无法获取上传凭证，请稍后重试");
  }
}

/**
 * 生成唯一文件名
 * 格式: {prefix}/{YYYYMMDD}/{timestamp}_{random}.{ext}
 */
function generateFileName(file: File, prefix: string = "uploads"): string {
  const now = new Date();
  const date = now.toISOString().split("T")[0].replace(/-/g, ""); // 20251227
  const timestamp = now.getTime();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";

  return `${prefix}/${date}/${timestamp}_${random}.${ext}`;
}

/**
 * 上传选项
 */
export interface QiniuUploadOptions {
  file: File;                          // 要上传的文件
  prefix?: string;                     // 文件路径前缀（如 'samples', 'colors'）
  onProgress?: (percent: number) => void;  // 上传进度回调 0-100
  onSuccess?: (url: string) => void;      // 上传成功回调
  onError?: (error: Error) => void;       // 上传失败回调
}

/**
 * 上传文件到七牛云
 * @returns 返回文件的完整 URL
 */
export async function uploadToQiniu(
  options: QiniuUploadOptions
): Promise<string> {
  const { file, prefix = "uploads", onProgress, onSuccess, onError } = options;

  try {
    // 1. 获取上传凭证
    const token = await getUploadToken();

    // 2. 生成唯一文件名
    const key = generateFileName(file, prefix);

    // 3. 配置上传参数
    const putExtra = {
      fname: file.name,
      mimeType: file.type || undefined,
    };

    const config = {
      useCdnDomain: true,         // 使用 CDN 加速域名
      region: QINIU_CONFIG.region, // 存储区域
    };

    // 4. 执行上传
    const observable = qiniu.upload(file, key, token, putExtra, config);

    return new Promise((resolve, reject) => {
      observable.subscribe({
        next: (result) => {
          // 上传进度回调
          const percent = Math.round(result.total.percent);
          onProgress?.(percent);
        },
        error: (err) => {
          console.error("七牛上传失败:", err);
          const error = new Error(`上传失败: ${err.message || "网络错误"}`);
          onError?.(error);
          reject(error);
        },
        complete: (result) => {
          // 上传成功，构造完整 URL
          const url = `${QINIU_CONFIG.domain}/${result.key}`;
          console.log("七牛上传成功:", url);
          onSuccess?.(url);
          resolve(url);
        },
      });
    });
  } catch (error) {
    const err = error as Error;
    console.error("上传初始化失败:", err);
    onError?.(err);
    throw err;
  }
}

/**
 * 批量上传文件
 * @returns 返回所有文件的 URL 数组
 */
export async function uploadMultipleToQiniu(
  files: File[],
  options: Omit<QiniuUploadOptions, "file">
): Promise<string[]> {
  const uploadPromises = files.map((file) =>
    uploadToQiniu({ ...options, file })
  );

  return Promise.all(uploadPromises);
}

/**
 * 带降级的上传（开发阶段使用）
 * 如果七牛上传失败，自动降级为 base64
 */
export async function uploadWithFallback(
  file: File,
  options: QiniuUploadOptions
): Promise<string> {
  try {
    // 优先使用七牛上传
    return await uploadToQiniu(options);
  } catch (error) {
    console.warn("七牛上传失败，降级为 base64 模式:", error);

    // 降级为 base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        options.onSuccess?.(result);
        resolve(result);
      };
      reader.onerror = () => {
        const err = new Error("文件读取失败");
        options.onError?.(err);
        reject(err);
      };
    });
  }
}

/**
 * 更新配置（用于运行时动态配置）
 */
export function updateQiniuConfig(config: Partial<QiniuConfig>) {
  Object.assign(QINIU_CONFIG, config);
}

/**
 * 获取当前配置
 */
export function getQiniuConfig(): Readonly<QiniuConfig> {
  return { ...QINIU_CONFIG };
}
