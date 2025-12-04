/**
 * SpecMaster 应用主组件
 * 负责：配置 Refine 框架、路由、数据提供者、国际化、数据库初始化
 */

import { useEffect, useState } from "react";
import { Refine } from "@refinedev/core";
import routerBindings, {
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntApp, Spin } from "antd";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

// 配置 dayjs 中文
dayjs.locale("zh-cn");

// 导入数据提供者和数据库初始化
import { mockDataProvider } from "./providers/mockDataProvider";
import { initializeDatabase } from "./providers/database";

// 导入布局组件
import { Layout } from "./components/layouts/Layout";

// 导入页面组件
import { StyleList } from "./pages/styles/list";
import { StyleDetailPage } from "./pages/styles/detail";
import { CustomerList } from "./pages/customers/list";
import { CustomerDetailPage } from "./pages/customers/detail";
import { SizeList } from "./pages/sizes/list";
import { UnitList } from "./pages/units/list";

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // 初始化数据库
  useEffect(() => {
    initializeDatabase()
      .then(() => {
        setDbReady(true);
      })
      .catch((error) => {
        console.error("数据库初始化失败:", error);
        setDbError(error.message);
      });
  }, []);

  // 数据库初始化中
  if (!dbReady && !dbError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">正在初始化数据库...</div>
        </div>
      </div>
    );
  }

  // 数据库初始化失败
  if (dbError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-red-500">
          <div className="text-xl mb-2">数据库初始化失败</div>
          <div>{dbError}</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Ant Design 中文配置 */}
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: "#1890ff",
            borderRadius: 6,
          },
        }}
      >
        <AntApp>
          {/* Refine 核心配置 */}
          <Refine
            dataProvider={mockDataProvider}
            routerProvider={routerBindings}
              resources={[
                {
                  name: "styles",
                  list: "/styles",
                  show: "/styles/:id",
                  meta: {
                    label: "款号管理",
                    icon: "📋",
                  },
                },
                {
                  name: "customers",
                  list: "/customers",
                  show: "/customers/:id",
                  meta: {
                    label: "客户管理",
                    icon: "👥",
                  },
                },
                {
                  name: "sizes",
                  list: "/sizes",
                  meta: {
                    label: "尺码管理",
                    icon: "📏",
                  },
                },
                {
                  name: "units",
                  list: "/units",
                  meta: {
                    label: "单位管理",
                    icon: "⚖️",
                  },
                },
              ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              disableTelemetry: true,
            }}
          >
            {/* 路由配置 */}
            <Routes>
              {/* 根路径自动跳转到款号列表 */}
              <Route
                index
                element={<NavigateToResource resource="styles" />}
              />

                {/* 主布局容器 */}
                <Route element={<Layout />}>
                  {/* 款号管理 */}
                  <Route path="/styles" element={<StyleList />} />
                  <Route path="/styles/:id" element={<StyleDetailPage />} />

                  {/* 客户管理 */}
                  <Route path="/customers" element={<CustomerList />} />
                  <Route path="/customers/:id" element={<CustomerDetailPage />} />

                  {/* 尺码管理 */}
                  <Route path="/sizes" element={<SizeList />} />

                  {/* 单位管理 */}
                  <Route path="/units" element={<UnitList />} />
                </Route>

              {/* 404 页面 */}
              <Route path="*" element={<div>页面不存在</div>} />
            </Routes>

            {/* Refine 功能组件 */}
            <UnsavedChangesNotifier />
          </Refine>
        </AntApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
