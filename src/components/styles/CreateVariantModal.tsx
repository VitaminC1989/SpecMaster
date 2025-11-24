/**
 * 新建颜色版本弹窗组件
 * 功能：
 * 1. 收集颜色版本基础信息（颜色名称、尺码范围）
 * 2. 支持上传样衣图片（Demo 模式使用占位图）
 * 3. 创建后自动关联到当前款号
 */

import React, { useState } from "react";
import { Modal, Form, Input, message, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useCreate, useInvalidate } from "@refinedev/core";
import type { IColorVariant } from "../../types/models";

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

  // 用于创建颜色版本的 Hook
  const { mutate: createVariant, isLoading } = useCreate();

  // 用于刷新数据的钩子
  const invalidate = useInvalidate();

  /**
   * 处理图片上传（Demo 模式：使用 base64 或默认占位图）
   */
  const handleImageChange = (info: any) => {
    const file = info.file.originFileObj || info.file;
    
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageUrl(reader.result as string);
        message.success("图片上传成功");
      };
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
          size_range: values.size_range || "",
          // 如果有上传图片使用上传的，否则使用默认占位图
          sample_image_url: imageUrl || `https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=600&fit=crop`,
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
    onClose();
  };

  return (
    <Modal
      title={
        <div className="text-lg">
          <span className="mr-2">🎨</span>
          新建颜色版本
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleClose}
      confirmLoading={isLoading}
      okText="创建"
      cancelText="取消"
      width={600}
      destroyOnClose
    >
      <div className="py-4">
        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-gray-700 m-0">
            💡 <strong>提示：</strong>创建颜色版本后，您可以为其添加配料明细和规格数据。
            也可以使用"复制版本"功能快速创建相似颜色。
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

          {/* 尺码范围字段（可选）*/}
          <Form.Item
            label="尺码范围"
            name="size_range"
            rules={[{ max: 30, message: "尺码范围不能超过 30 个字符" }]}
            tooltip="该颜色版本的尺码说明"
          >
            <Input
              placeholder="如：S/M/L/XL, 90-130cm"
              maxLength={30}
              size="large"
            />
          </Form.Item>

          {/* 样衣图片上传（可选）*/}
          <Form.Item
            label="样衣图片"
            tooltip="Demo 模式下会使用默认占位图，生产环境支持真实上传"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false} // 阻止默认上传，使用本地 base64
              onChange={handleImageChange}
              showUploadList={true}
            >
              {!imageUrl && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
            <div className="text-sm text-gray-500 mt-2">
              建议尺寸：400x600 像素，支持 JPG、PNG 格式
              <br />
              Demo 模式：如不上传将使用默认占位图
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

