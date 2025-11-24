#!/bin/bash

# SpecMaster 快速部署脚本
# 使用 Vercel 部署到在线平台

echo "🚀 SpecMaster 快速部署工具"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 已安装"
echo ""

# 安装 Vercel CLI
echo "📦 正在安装 Vercel CLI..."
npm install -g vercel

echo ""
echo "✅ Vercel CLI 安装完成"
echo ""

# 构建项目
echo "🔨 正在构建项目..."
npm run build

echo ""
echo "✅ 构建完成"
echo ""

# 部署
echo "🚀 正在部署到 Vercel..."
echo ""
echo "📝 请按照提示操作："
echo "   1. 首次使用需要登录 Vercel（会打开浏览器）"
echo "   2. 选择你的账号"
echo "   3. 项目名称建议：specmaster-demo"
echo "   4. 其他选项直接回车使用默认值"
echo ""

vercel --prod

echo ""
echo "================================"
echo "✅ 部署完成！"
echo ""
echo "📋 下一步："
echo "   1. 复制上面显示的链接"
echo "   2. 在浏览器中测试访问"
echo "   3. 把链接发给甲方即可"
echo ""
echo "💡 提示：甲方无需安装任何软件，直接打开链接即可使用！"
echo "================================"

