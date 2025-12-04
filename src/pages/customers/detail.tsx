/**
 * 客户详情页
 * 展示客户基本信息 + 该客户的所有款号列表
 * 实现"客户 -> 款号"的层级展示
 */

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne, useList } from "@refinedev/core";
import { Button, Spin, Alert, Card, Descriptions, Table, Space, Tag } from "antd";
import { ArrowLeftOutlined, EyeOutlined } from "@ant-design/icons";
import type { ICustomer, IStyle } from "../../types/models";

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 加载客户数据
  const { data: customerData, isLoading: customerLoading, isError: customerError } = useOne<ICustomer>({
    resource: "customers",
    id: id!,
  });

  // 加载该客户的所有款号
  const { data: stylesData, isLoading: stylesLoading } = useList<IStyle>({
    resource: "styles",
    filters: [{ field: "customer_id", operator: "eq", value: Number(id) }],
    pagination: { pageSize: 100 },
  });

  const customer = customerData?.data;
  const styles = stylesData?.data || [];

  // 加载状态
  if (customerLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 错误状态
  if (customerError || !customer) {
    return (
      <div className="p-6">
        <Alert
          message="加载失败"
          description="无法加载客户信息，请稍后重试。"
          type="error"
          showIcon
        />
      </div>
    );
  }

  // 款号表格列定义
  const styleColumns = [
    {
      title: "款号",
      dataIndex: "style_no",
      key: "style_no",
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "款式名称",
      dataIndex: "style_name",
      key: "style_name",
      width: 200,
    },
    {
      title: "创建日期",
      dataIndex: "create_date",
      key: "create_date",
      width: 120,
    },
    {
      title: "备注",
      dataIndex: "public_note",
      key: "public_note",
      ellipsis: true,
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_: any, record: IStyle) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/styles/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/customers")}
        >
          返回客户列表
        </Button>
      </div>

      {/* 客户基本信息 */}
      <Card title="客户信息" className="shadow-sm">
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="客户名称" span={2}>
            <span className="font-semibold text-lg">{customer.customer_name}</span>
          </Descriptions.Item>
          <Descriptions.Item label="联系人">
            {customer.contact_person || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="联系电话">
            {customer.contact_phone || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="联系邮箱">
            {customer.contact_email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="创建日期">
            {customer.create_date || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="地址" span={2}>
            {customer.address || "-"}
          </Descriptions.Item>
          {customer.note && (
            <Descriptions.Item label="备注" span={2}>
              {customer.note}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 关联款号列表 */}
      <Card
        title={
          <Space>
            <span>关联款号</span>
            <Tag color="green">{styles.length} 个款号</Tag>
          </Space>
        }
        className="shadow-sm"
      >
        <Table
          dataSource={styles}
          columns={styleColumns}
          rowKey="id"
          loading={stylesLoading}
          pagination={false}
          locale={{ emptyText: "该客户暂无关联款号" }}
        />
      </Card>
    </div>
  );
};
