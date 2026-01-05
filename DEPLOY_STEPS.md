# Cloud Functions 部署步骤

## 📋 前置要求

需要安装以下工具：
- Node.js (推荐 18.x 或更高版本)
- npm (随 Node.js 一起安装)
- Firebase CLI

## 🚀 快速部署（使用脚本）

如果您的系统已配置好，可以直接运行：

```bash
cd /home/ly/data/hengfei/visa_map
./setup_and_deploy.sh
```

## 📝 手动部署步骤

### 步骤 1: 安装 Node.js 和 npm

**Ubuntu/Debian 系统：**

```bash
# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

**或者使用 nvm（推荐，不需要 sudo）：**

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell
source ~/.bashrc

# 安装 Node.js
nvm install 18
nvm use 18

# 验证安装
node --version
npm --version
```

### 步骤 2: 安装 Firebase CLI

```bash
# 全局安装（需要 sudo）
sudo npm install -g firebase-tools

# 或者使用 npx（不需要全局安装）
# npx firebase-tools --version
```

### 步骤 3: 登录 Firebase

```bash
firebase login
```

这会打开浏览器，请按照提示完成登录。

### 步骤 4: 检查项目配置

```bash
cd /home/ly/data/hengfei/visa_map

# 检查项目配置
cat .firebaserc
```

如果文件不存在或配置不正确，运行：

```bash
firebase use visitmap-f9bb2
```

### 步骤 5: 安装 Functions 依赖

```bash
cd functions
npm install
cd ..
```

### 步骤 6: 部署 Functions

```bash
# 部署所有函数
firebase deploy --only functions

# 或者只部署特定函数
firebase deploy --only functions:getIPLocation
firebase deploy --only functions:aggregateVisitStats
firebase deploy --only functions:manualAggregateStats
```

### 步骤 7: 验证部署

部署完成后，访问以下 URL 验证：

1. **IP地理位置函数**:
   ```
   https://asia-east2-visitmap-f9bb2.cloudfunctions.net/getIPLocation
   ```
   应该返回 JSON 格式的 IP 地理位置信息

2. **手动聚合函数**:
   ```
   https://asia-east2-visitmap-f9bb2.cloudfunctions.net/manualAggregateStats
   ```
   应该返回聚合统计结果

## 🔍 故障排除

### 问题 1: npm install 失败

```bash
cd functions
rm -rf node_modules package-lock.json
npm install
```

### 问题 2: Firebase 登录失败

```bash
# 清除登录状态
firebase logout

# 重新登录
firebase login
```

### 问题 3: 部署权限错误

确保已登录 Firebase：
```bash
firebase login
firebase projects:list
```

### 问题 4: 函数部署成功但返回 404

检查函数区域：
- 在 Firebase Console > Functions 中查看函数 URL
- 确认区域是 `asia-east2`
- 如果不同，修改 `index.html` 中的 `CLOUD_FUNCTION_REGION`

## 📊 查看部署状态

```bash
# 查看所有函数
firebase functions:list

# 查看函数日志
firebase functions:log

# 查看特定函数的日志
firebase functions:log --only getIPLocation
```

## ✅ 部署检查清单

- [ ] Node.js 已安装
- [ ] npm 已安装
- [ ] Firebase CLI 已安装
- [ ] 已登录 Firebase
- [ ] 项目配置正确
- [ ] Functions 依赖已安装
- [ ] 函数已成功部署
- [ ] 函数 URL 可以访问
- [ ] Firestore 安全规则已配置

## 🎯 下一步

部署完成后：

1. **配置 Firestore 安全规则**（参考 `FIRESTORE_RULES.md`）
2. **手动触发聚合函数**生成初始统计数据
3. **刷新网站页面**验证功能

