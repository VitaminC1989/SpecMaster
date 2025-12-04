/**
 * 客户管理列表页
 * 功能：展示所有客户、支持搜索、增删改查
 */

import React, { useState } from "react";
import { useTable, useModalForm } from "@refinedev/antd";
import { ProTable } from "@ant-design/pro-components";
import { Button, Modal, Form, Input, message, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useDelete, useCreate, useInvalidate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import type { ICustomer } from "../../types/models";
import dayjs from "dayjs";

export const CustomerList: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // 表格数据
  const { tableProps } = useTable<ICustomer>({
    resource: "customers",
    pagination: { pageSize: 10 },
  });

  // 编辑表单
  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: showEdit,
  } = useModalForm<ICustomer>({
    resource: "customers",
    action: "edit",
    redirect: false,
  });

  // 删除
  const { mutate: deleteCustomer } = useDelete();

  const handleDelete = (record: ICustomer) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除客户"${record.customer_name}"吗？`,
      okText: "确认删除",
      okType: "danger",
      cancelText: "取消",
      onOk: () => {
        deleteCustomer({
          resource: "customers",
          id: record.id,
          successNotification: {
            message: "删除成功",
            type: "success",
          },
        });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 m-0">👥 客户管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setCreateModalOpen(true)}
        >
          新建客户
        </Button>
      </div>

      <ProTable<ICustomer>
        {...tableProps}
        rowKey="id"
        search={false}
        columns={[
          {
            title: "客户名称",
            dataIndex: "customer_name",
            width: 250,
            render: (text, record) => (
              <a
                className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={() => navigate(`/customers/${record.id}`)}
              >
                {text}
              </a>
            ),
          },
          {
            title: "联系人",
            dataIndex: "contact_person",
            width: 120,
          },
          {
            title: "联系电话",
            dataIndex: "contact_phone",
            width: 150,
          },
          {
            title: "联系邮箱",
            dataIndex: "contact_email",
            width: 200,
          },
          {
            title: "地址",
            dataIndex: "address",
            ellipsis: true,
          },
          {
            title: "创建日期",
            dataIndex: "create_date",
            width: 120,
          },
          {
            title: "操作",
            width: 200,
            fixed: "right",
            render: (_, record) => (
              <Space>
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/customers/${record.id}`)}
                >
                  查看
                </Button>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => showEdit(record.id)}
                >
                  编辑
                </Button>
                <Button
                  type="link"
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

      {/* 新建客户弹窗 */}
      <CreateCustomerModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* 编辑客户弹窗 */}
      <Modal {...editModalProps} title="编辑客户" width={700}>
        <Form {...editFormProps} layout="vertical">
          <Form.Item
            label="客户名称"
            name="customer_name"
            rules={[{ required: true, message: "请输入客户名称" }]}
          >
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item label="联系人" name="contact_person">
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item label="联系电话" name="contact_phone">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item label="联系邮箱" name="contact_email">
            <Input placeholder="请输入联系邮箱" />
          </Form.Item>
          <Form.Item label="地址" name="address">
            <Input.TextArea placeholder="请输入地址" rows={3} />
          </Form.Item>
          <Form.Item label="备注" name="note">
            <Input.TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 新建客户弹窗组件
interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  open,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { mutate: createCustomer, isLoading } = useCreate<ICustomer>();
  const invalidate = useInvalidate();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newCustomer = {
        ...values,
        create_date: dayjs().format("YYYY-MM-DD"),
      };

      createCustomer(
        { resource: "customers", values: newCustomer },
        {
          onSuccess: () => {
            message.success("创建成功");
            form.resetFields();
            onClose();
            invalidate({
              resource: "customers",
              invalidates: ["list"],
            });
          },
        }
      );
    });
  };

  return (
    <Modal
      title="新建客户"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isLoading}
      width={700}
      okText="创建"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="客户名称"
          name="customer_name"
          rules={[{ required: true, message: "请输入客户名称" }]}
        >
          <Input placeholder="请输入客户名称" />
        </Form.Item>
        <Form.Item label="联系人" name="contact_person">
          <Input placeholder="请输入联系人" />
        </Form.Item>
        <Form.Item label="联系电话" name="contact_phone">
          <Input placeholder="请输入联系电话" />
        </Form.Item>
        <Form.Item label="联系邮箱" name="contact_email">
          <Input placeholder="请输入联系邮箱" />
        </Form.Item>
        <Form.Item label="地址" name="address">
          <Input.TextArea placeholder="请输入地址" rows={3} />
        </Form.Item>
        <Form.Item label="备注" name="note">
          <Input.TextArea placeholder="请输入备注" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};




