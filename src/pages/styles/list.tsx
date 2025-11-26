/**
 * L1 款号列表页
 * 功能：展示所有款号、支持搜索、跳转到详情页、新建款号
 */

import React, { useState } from "react";
import { useTable } from "@refinedev/antd";
import { ProTable } from "@ant-design/pro-components";
import { Space, Button, Tag, Modal, message } from "antd";
import { EyeOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDelete } from "@refinedev/core";
import type { IStyle } from "../../types/models";
import { CreateStyleModal } from "../../components/styles/CreateStyleModal";

export const StyleList: React.FC = () => {
  const navigate = useNavigate();
  
  // 控制新建款号弹窗的显示状态
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // 删除款号的 Hook
  const { mutate: deleteStyle } = useDelete();

  // 使用 Refine 的 useTable Hook 自动处理数据加载、分页等
  const { tableProps } = useTable<IStyle>({
    resource: "styles",
    pagination: {
      pageSize: 10,
    },
  });

  /**
   * 处理删除款号
   */
  const handleDelete = (record: IStyle) => {
    Modal.confirm({
      title: "确认删除",
      content: (
        <div>
          <p>确定要删除款号 <strong>{record.style_no}</strong> 吗？</p>
          <p className="text-red-500 text-sm">
            ⚠️ 此操作将同时删除该款号下的所有颜色版本和配料数据，且无法恢复！
          </p>
        </div>
      ),
      okText: "确认删除",
      okType: "danger",
      cancelText: "取消",
      onOk: () => {
        deleteStyle(
          {
            resource: "styles",
            id: record.id,
            successNotification: {
              message: "删除成功",
              description: `款号"${record.style_no}"已删除`,
              type: "success",
            },
          },
          {
            onSuccess: () => {
              message.success("删除成功");
            },
          }
        );
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 m-0">款号管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setCreateModalOpen(true)}
        >
          新建款号
        </Button>
      </div>

      {/* 款号列表表格 */}
      <ProTable<IStyle>
        {...tableProps}
        rowKey="id"
        search={false}
        toolbar={{
          search: {
            placeholder: "搜索款号或款式名称...",
            onSearch: () => {},
          },
        }}
        columns={[
          {
            title: "款号",
            dataIndex: "style_no",
            key: "style_no",
            width: 150,
            render: (text) => (
              <Tag color="blue" className="text-base px-3 py-1">
                {text}
              </Tag>
            ),
          },
          {
            title: "款式名称",
            dataIndex: "style_name",
            key: "style_name",
            width: 200,
            render: (text) => (
              <span className="font-medium text-gray-800">{text || "-"}</span>
            ),
          },
          {
            title: "客户名称",
            dataIndex: "customer_name",
            key: "customer_name",
            width: 150,
            render: (text) => (
              <span className="text-gray-700">{text || "-"}</span>
            ),
          },
          {
            title: "创建日期",
            dataIndex: "create_date",
            key: "create_date",
            width: 150,
            render: (text) => <span className="text-gray-600">{text}</span>,
          },
          {
            title: "公共备注",
            dataIndex: "public_note",
            key: "public_note",
            ellipsis: true,
            render: (text) => (
              <span className="text-gray-500">{text || "无备注"}</span>
            ),
          },
          {
            title: "操作",
            key: "action",
            width: 180,
            fixed: "right",
            render: (_, record) => (
              <Space>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/styles/${record.id}`)}
                >
                  查看详情
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record)}
                >
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      {/* 新建款号弹窗 */}
      <CreateStyleModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
};
