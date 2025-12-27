/**
 * 辅料颜色编辑器组件
 * 功能：支持文字描述和图片上传两种方式
 */

import React, { useState } from "react";
import { Input, Upload, Image, Space, Button, Popover, message } from "antd";
import { PictureOutlined, DeleteOutlined } from "@ant-design/icons";
import { uploadToQiniu } from "../../utils/qiniuUpload";

interface MaterialColorEditorProps {
  value?: {
    text?: string;
    imageUrl?: string;
  };
  onChange?: (value: { text?: string; imageUrl?: string }) => void;
}

export const MaterialColorEditor: React.FC<MaterialColorEditorProps> = ({
  value = {},
  onChange,
}) => {
  const [imageUrl, setImageUrl] = useState<string>(value.imageUrl || "");
  const [text, setText] = useState<string>(value.text || "");

  /**
   * 处理文字输入
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
    onChange?.({ text: newText, imageUrl });
  };

  /**
   * 处理图片上传（使用七牛云）
   */
  const handleImageUpload = async (file: File) => {
    try {
      // 上传到七牛云
      const newImageUrl = await uploadToQiniu({
        file,
        prefix: "colors", // 色卡图片前缀
        onProgress: (percent) => {
          console.log(`色卡上传进度: ${percent}%`);
        },
      });

      setImageUrl(newImageUrl);
      onChange?.({ text, imageUrl: newImageUrl });
      message.success("色卡上传成功");
    } catch (error) {
      console.error("色卡上传失败:", error);
      message.error("色卡上传失败，请重试");
    }

    return false; // 阻止默认上传
  };

  /**
   * 删除图片
   */
  const handleDeleteImage = () => {
    setImageUrl("");
    onChange?.({ text, imageUrl: "" });
  };

  return (
    <div className="flex items-center gap-2">
      {/* 文字输入框 */}
      <Input
        placeholder="如：银灰色、玫瑰金"
        value={text}
        onChange={handleTextChange}
        style={{ width: 150 }}
      />

      {/* 图片上传/预览 */}
      <Space>
        {imageUrl ? (
          <Popover
            content={
              <div>
                <Image src={imageUrl} width={200} preview={false} />
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteImage}
                  className="mt-2 w-full"
                >
                  删除图片
                </Button>
              </div>
            }
            title="色卡预览"
          >
            <div className="relative cursor-pointer">
              <Image
                src={imageUrl}
                width={40}
                height={40}
                style={{ objectFit: "cover", borderRadius: 4 }}
                preview={false}
              />
            </div>
          </Popover>
        ) : (
          <Upload
            beforeUpload={handleImageUpload}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<PictureOutlined />} size="small">
              上传色卡
            </Button>
          </Upload>
        )}
      </Space>
    </div>
  );
};

/**
 * 辅料颜色显示组件（用于表格的只读显示）
 */
interface MaterialColorDisplayProps {
  text?: string;
  imageUrl?: string;
}

export const MaterialColorDisplay: React.FC<MaterialColorDisplayProps> = ({
  text,
  imageUrl,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* 显示文字 */}
      <span className="text-gray-800">{text || "-"}</span>

      {/* 显示色卡图片 */}
      {imageUrl && (
        <Image
          src={imageUrl}
          width={30}
          height={30}
          style={{ objectFit: "cover", borderRadius: 4, border: "1px solid #ddd" }}
          placeholder={
            <div className="w-[30px] h-[30px] bg-gray-100 rounded flex items-center justify-center text-xs">
              色卡
            </div>
          }
        />
      )}
    </div>
  );
};




