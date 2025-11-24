/**
 * L2 颜色版本头部展示组件
 * 功能：
 * 1. 展示样衣大图（可预览）
 * 2. 展示颜色、尺码范围等信息
 * 3. 提供"复制此版本"按钮（触发深度克隆）
 * 4. 提供"打印配方单"按钮
 * 5. 提供"删除颜色版本"按钮
 */

import React, { useState } from "react";
import {
  Card,
  Image,
  Button,
  Space,
  Descriptions,
  Modal,
  Input,
  message,
} from "antd";
import { CopyOutlined, PrinterOutlined, DeleteOutlined } from "@ant-design/icons";
import { useCustomMutation, useInvalidate, useDelete } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import type { IColorVariant } from "../../types/models";

interface VariantHeaderProps {
  variant: IColorVariant;
}

export const VariantHeader: React.FC<VariantHeaderProps> = ({ variant }) => {
  const navigate = useNavigate();
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  
  // 用于触发深度克隆的自定义 mutation
  const { mutate: cloneVariant, isLoading: isCloning } = useCustomMutation();
  
  // 用于删除颜色版本的 Hook
  const { mutate: deleteVariant } = useDelete();
  
  // 用于刷新数据的钩子
  const invalidate = useInvalidate();

  /**
   * 处理深度克隆操作
   * 调用后端特定 API，完成 L2 → L3 → L4 三层级联复制
   */
  const handleClone = () => {
    if (!newColorName.trim()) {
      message.warning("请输入新颜色名称");
      return;
    }

    cloneVariant(
      {
        url: `/api/styles/${variant.style_id}/variants/${variant.id}/clone`,
        method: "post",
        values: { new_color_name: newColorName },
        successNotification: {
          message: "克隆成功",
          description: `新颜色"${newColorName}"已创建，包括所有配料和规格数据`,
          type: "success",
        },
        errorNotification: {
          message: "克隆失败",
          description: "请稍后重试",
          type: "error",
        },
      },
      {
        onSuccess: () => {
          setCloneModalOpen(false);
          setNewColorName("");
          
          // 刷新颜色列表，让新创建的颜色显示出来
          invalidate({
            resource: "variants",
            invalidates: ["list"],
          });
        },
      }
    );
  };

  /**
   * 处理打印操作
   */
  const handlePrint = () => {
    message.info("打印功能开发中...");
    // TODO: 实现打印逻辑
    // window.print();
  };

  /**
   * 处理删除颜色版本
   */
  const handleDelete = () => {
    Modal.confirm({
      title: "确认删除",
      content: (
        <div>
          <p>确定要删除颜色版本 <strong>{variant.color_name}</strong> 吗？</p>
          <p className="text-red-500 text-sm">
            ⚠️ 此操作将同时删除该颜色下的所有配料明细和规格数据，且无法恢复！
          </p>
        </div>
      ),
      okText: "确认删除",
      okType: "danger",
      cancelText: "取消",
      onOk: () => {
        deleteVariant(
          {
            resource: "variants",
            id: variant.id,
            successNotification: {
              message: "删除成功",
              description: `颜色版本"${variant.color_name}"已删除`,
              type: "success",
            },
          },
          {
            onSuccess: () => {
              message.success("删除成功，即将返回款号列表");
              // 删除后返回款号列表页
              setTimeout(() => {
                navigate(`/styles/${variant.style_id}`);
                // 刷新颜色列表
                invalidate({
                  resource: "variants",
                  invalidates: ["list"],
                });
              }, 500);
            },
          }
        );
      },
    });
  };

  return (
    <>
      <Card className="shadow-sm">
        <div className="flex gap-8">
          {/* 左侧：样衣大图 */}
          <div className="flex-shrink-0">
            <Image
              src={variant.sample_image_url}
              width={280}
              height={380}
              style={{ objectFit: "cover" }}
              className="rounded-lg shadow-md"
              alt={`${variant.color_name}款样衣图`}
              placeholder={
                <div className="flex items-center justify-center h-[380px] bg-gray-100">
                  <span>加载中...</span>
                </div>
              }
            />
          </div>

          {/* 右侧：信息和操作 */}
          <div className="flex-1 flex flex-col justify-between">
            {/* 基础信息 */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {variant.color_name}款
              </h3>
              
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="颜色">
                  <span className="text-lg font-medium">
                    {variant.color_name}
                  </span>
                </Descriptions.Item>
                
                <Descriptions.Item label="尺码范围">
                  <span className="text-base">
                    {variant.size_range || "未设置"}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* 操作按钮 */}
            <div className="mt-6">
              <Space size="middle" wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<CopyOutlined />}
                  onClick={() => setCloneModalOpen(true)}
                  loading={isCloning}
                >
                  复制此版本
                </Button>
                
                <Button
                  size="large"
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                >
                  打印配方单
                </Button>

                <Button
                  danger
                  size="large"
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  删除版本
                </Button>
              </Space>
              
              <div className="mt-3 text-sm text-gray-500">
                💡 "复制此版本"会自动复制所有配料明细和规格数据
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 深度克隆弹窗 */}
      <Modal
        title="复制颜色版本"
        open={cloneModalOpen}
        onOk={handleClone}
        onCancel={() => {
          setCloneModalOpen(false);
          setNewColorName("");
        }}
        confirmLoading={isCloning}
        okText="确认复制"
        cancelText="取消"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            将复制当前"{variant.color_name}"款的所有数据，包括：
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>颜色版本信息（样衣图、尺码范围）</li>
            <li>所有配料明细记录</li>
            <li>每条配料的规格明细（L4 数据）</li>
          </ul>
          
          <div className="pt-4">
            <label className="block mb-2 font-medium text-gray-700">
              新颜色名称 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="请输入新颜色名称（如：蓝色、深灰色）"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              onPressEnter={handleClone}
              size="large"
              maxLength={20}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

