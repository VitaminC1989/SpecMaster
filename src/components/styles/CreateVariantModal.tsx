/**
 * 新建颜色版本弹窗组件
 * 功能：
 * 1. 收集颜色版本基础信息（颜色名称、尺码范围）
 * 2. 支持上传样衣图片到七牛云 OSS
 * 3. 创建后自动关联到当前款号
 */

import React, { useState } from "react";
import { Modal, Form, Input, message, Upload, Image, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useCreate, useInvalidate, useList } from "@refinedev/core";
import type { IColorVariant, ISize } from "../../types/models";
import { uploadToQiniu } from "../../utils/qiniuUpload";

interface CreateVariantModalProps {
  open: boolean;
  onClose: () => void;
  styleId: number; // 归属的款号 ID
}

export const CreateVariantModal: React.FC<CreateVariantModalProps> = ({
  open,
  onClose,
  styleId,
}) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // 用于创建颜色版本的 Hook
  const { mutate: createVariant, isLoading } = useCreate();

  // 用于刷新数据的钩子
  const invalidate = useInvalidate();

  // 获取尺码基础数据供多选使用
  const { data: sizesData, isLoading: isSizesLoading } = useList<ISize>({
    resource: "sizes",
    pagination: { mode: "off" },
    sorters: [{ field: "sort_order", order: "asc" }],
  });

  const sizeOptions =
    sizesData?.data?.map((size) => ({
      label: size.size_code,
      value: size.size_code,
    })) || [];

  /**
   * 处理图片上传（使用七牛云）
   */
  const handleImageChange = async (info: any) => {
    // 只处理新选择的文件，避免重复上传
    if (info.file.status === "removed") {
      setImageUrl("");
      setUploading(false);
      return;
    }

    const file = info.file.originFileObj || info.file;

    // 确保是真实的文件对象，且没有正在上传
    if (file && file instanceof File) {
      try {
        setUploading(true);
        // 上传到七牛云
        const url = await uploadToQiniu({
          file,
          prefix: "samples", // 样衣图片前缀
          onProgress: (percent) => {
            console.log(`样衣图片上传进度: ${percent}%`);
          },
        });

        setImageUrl(url);
        setUploading(false);
        message.success("样衣图片上传成功");
      } catch (error) {
        console.error("样衣图片上传失败:", error);
        message.error("样衣图片上传失败，请重试");
        setUploading(false);
      }
    }
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        // 构造颜色版本数据
        const newVariant: Omit<IColorVariant, "id"> = {
          style_id: styleId,
          color_name: values.color_name,
          // 将多选数组转换为 S/M/L 格式的字符串
          size_range: Array.isArray(values.size_range)
            ? values.size_range.join("/")
            : values.size_range || "",
          // 使用上传的图片，如果没有则为空（不使用默认图）
          sample_image_url: imageUrl || "",
        };

        // 调用创建 API
        createVariant(
          {
            resource: "variants",
            values: newVariant,
            successNotification: {
              message: "创建成功",
              description: `颜色版本"${values.color_name}"已创建`,
              type: "success",
            },
            errorNotification: {
              message: "创建失败",
              description: "请稍后重试",
              type: "error",
            },
          },
          {
            onSuccess: () => {
              // 刷新颜色版本列表
              invalidate({
                resource: "variants",
                invalidates: ["list"],
              });

              // 关闭弹窗并重置
              handleClose();

              message.success({
                content: "颜色版本创建成功！现在可以为其添加配料明细。",
                duration: 3,
              });
            },
          }
        );
      })
      .catch((errorInfo) => {
        console.error("表单验证失败:", errorInfo);
      });
  };

  /**
   * 处理关闭弹窗
   */
  const handleClose = () => {
    form.resetFields();
    setImageUrl("");
    setUploading(false);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="text-lg">
          <span className="mr-2">🎨</span>新建颜色版本
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleClose}
      confirmLoading={isLoading}
      okText="创建"
      cancelText="取消"
      width={600}
      destroyOnHidden
    >
      <div className="py-4">
        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-gray-700 m-0">
            💡 <strong>提示：</strong>
            <span>
              创建颜色版本后，您可以为其添加配料明细和规格数据。
              也可以使用"复制版本"功能快速创建相似颜色。
            </span>
          </p>
        </div>

        <Form form={form} layout="vertical" autoComplete="off">
          {/* 颜色名称字段（必填）*/}
          <Form.Item
            label="颜色名称"
            name="color_name"
            rules={[
              { required: true, message: "请输入颜色名称" },
              { max: 20, message: "颜色名称不能超过 20 个字符" },
            ]}
            tooltip="该款式的颜色描述"
          >
            <Input
              placeholder="如：灰色、粉色、天蓝色、深灰色"
              maxLength={20}
              size="large"
            />
          </Form.Item>

          {/* 尺码范围字段（多选）*/}
          <Form.Item
            label="尺码范围"
            name="size_range"
            tooltip="选择该颜色版本包含的尺码范围"
          >
            <Select
              mode="multiple"
              placeholder="请选择尺码（可多选）"
              size="large"
              loading={isSizesLoading}
              options={sizeOptions}
              allowClear
              className="w-full"
            />
          </Form.Item>

          {/* 样衣图片上传 */}
          <Form.Item
            label="样衣图片"
            tooltip="上传到七牛云存储，支持 CDN 加速访问"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false} // 阻止默认上传，使用自定义上传
              onChange={handleImageChange}
              showUploadList={false} // 隐藏默认的文件列表，使用自定义显示
            >
              {imageUrl ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Image
                    src={imageUrl}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                    preview={true}
                  />
                </div>
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>
                    {uploading ? "上传中..." : "上传图片"}
                  </div>
                </div>
              )}
            </Upload>
            {imageUrl && (
              <div className="text-xs text-gray-500 mt-1">
                ✓ 图片已上传到七牛云
              </div>
            )}
            <div className="text-sm text-gray-500 mt-2">
              建议尺寸：400x600 像素，支持 JPG、PNG 格式
              <br />
              图片将上传到七牛云，自动获得 CDN 加速访问
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
