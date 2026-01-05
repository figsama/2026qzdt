# 快速修复指南

## 🔴 当前问题

根据控制台错误，有两个主要问题需要解决：

### 问题 1: Cloud Function 未部署 (404错误)

**错误信息**:
```
GET https://asia-east2-visitmap-f9bb2.cloudfunctions.net/getIPLocation net::ERR_FAILED 404 (Not Found)
```

**解决方案**: 部署 Cloud Functions

```bash
cd /home/ly/data/hengfei/visa_map/functions
npm install
cd ..
firebase deploy --only functions
```

### 问题 2: Firestore 权限错误

**错误信息**:
```
FirebaseError: Missing or insufficient permissions.
```

**解决方案**: 配置 Firestore 安全规则

1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择项目：`visitmap-f9bb2`
3. 进入 **Firestore Database** > **规则**
4. 复制以下规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /visits/{visit} {
      allow create: if request.resource.data.keys().hasAll(['ip', 'country', 'city', 'timestamp', 'date', 'createdAt']) 
                    && request.resource.data.ip is string 
                    && request.resource.data.country is string;
      allow read: if request.auth != null && request.auth.token.admin == true;
      allow update, delete: if false;
    }
    match /aggregated_stats/{docId} {
      allow read: if true;
      allow create, update, delete: if false;
    }
  }
}
```

5. 点击 **发布**

## ✅ 快速检查清单

### 步骤 1: 检查 Firebase CLI

```bash
firebase --version
```

如果未安装：
```bash
npm install -g firebase-tools
firebase login
```

### 步骤 2: 检查项目配置

```bash
cd /home/ly/data/hengfei/visa_map
cat .firebaserc
```

应该看到：
```json
{
  "projects": {
    "default": "visitmap-f9bb2"
  }
}
```

如果没有，运行：
```bash
firebase use visitmap-f9bb2
```

### 步骤 3: 部署函数

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 步骤 4: 验证部署

访问以下 URL 验证函数是否部署成功：

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

### 步骤 5: 配置安全规则

按照上面的步骤配置 Firestore 安全规则。

### 步骤 6: 手动触发聚合

访问手动聚合函数 URL 生成初始统计数据。

### 步骤 7: 验证网站

1. 刷新网站页面
2. 打开浏览器控制台（F12）
3. 检查是否还有错误
4. 点击"访问统计"标签页，查看数据

## 🐛 常见问题

### Q: Firebase CLI 未安装

```bash
npm install -g firebase-tools
```

### Q: 未登录 Firebase

```bash
firebase login
```

### Q: 项目未初始化

```bash
firebase init functions
```

选择：
- 使用现有项目：`visitmap-f9bb2`
- 语言：JavaScript

### Q: npm install 失败

```bash
cd functions
rm -rf node_modules package-lock.json
npm install
```

### Q: 部署失败 - 权限错误

确保已登录 Firebase：
```bash
firebase login
```

### Q: 函数部署成功但返回 404

检查函数区域是否正确：
- 在 Firebase Console > Functions 中查看函数 URL
- 确认 URL 中的区域是 `asia-east2`
- 如果不同，修改 `index.html` 中的 `CLOUD_FUNCTION_REGION`

## 📞 需要帮助？

如果以上步骤都无法解决问题：

1. 查看 `DEPLOYMENT_GUIDE.md` 获取详细部署指南
2. 查看 `TROUBLESHOOTING.md` 获取故障排除指南
3. 检查 Firebase Console 中的 Functions 日志
4. 检查浏览器控制台的详细错误信息

