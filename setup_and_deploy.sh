#!/bin/bash

# Cloud Functions 部署脚本
# 用于安装必要的工具并部署 Firebase Functions

set -e

echo "=========================================="
echo "Firebase Cloud Functions 部署脚本"
echo "=========================================="
echo ""

# 检查 Node.js 是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    echo ""
    echo "正在安装 Node.js..."
    
    # 使用 NodeSource 安装 Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    echo "✅ Node.js 安装完成"
else
    echo "✅ Node.js 已安装: $(node --version)"
fi

# 检查 npm 是否已安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    echo "npm 应该随 Node.js 一起安装，如果未安装，请手动安装"
    exit 1
else
    echo "✅ npm 已安装: $(npm --version)"
fi

# 检查 Firebase CLI 是否已安装
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI 未安装"
    echo ""
    echo "正在安装 Firebase CLI..."
    sudo npm install -g firebase-tools
    echo "✅ Firebase CLI 安装完成"
else
    echo "✅ Firebase CLI 已安装: $(firebase --version)"
fi

echo ""
echo "=========================================="
echo "检查 Firebase 登录状态"
echo "=========================================="

# 检查是否已登录 Firebase
if firebase projects:list &> /dev/null; then
    echo "✅ 已登录 Firebase"
    firebase projects:list
else
    echo "❌ 未登录 Firebase"
    echo ""
    echo "请运行以下命令登录："
    echo "  firebase login"
    echo ""
    echo "登录后，再次运行此脚本"
    exit 1
fi

echo ""
echo "=========================================="
echo "检查项目配置"
echo "=========================================="

# 检查 .firebaserc 文件
if [ -f ".firebaserc" ]; then
    echo "✅ 找到项目配置文件"
    cat .firebaserc
else
    echo "⚠️  未找到项目配置文件，正在初始化..."
    firebase use visitmap-f9bb2
fi

echo ""
echo "=========================================="
echo "安装 Functions 依赖"
echo "=========================================="

cd functions

if [ -f "package.json" ]; then
    echo "✅ 找到 package.json"
    echo "正在安装依赖..."
    npm install
    echo "✅ 依赖安装完成"
else
    echo "❌ 未找到 package.json"
    exit 1
fi

cd ..

echo ""
echo "=========================================="
echo "部署 Cloud Functions"
echo "=========================================="

echo "正在部署所有函数..."
firebase deploy --only functions

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "函数 URL："
echo "  - IP地理位置: https://asia-east2-visitmap-f9bb2.cloudfunctions.net/getIPLocation"
echo "  - 手动聚合: https://asia-east2-visitmap-f9bb2.cloudfunctions.net/manualAggregateStats"
echo ""
echo "下一步："
echo "  1. 访问手动聚合 URL 生成初始统计数据"
echo "  2. 配置 Firestore 安全规则（参考 FIRESTORE_RULES.md）"
echo "  3. 刷新网站页面验证功能"

