# 完整部署指南

## 📋 部署步骤总结

### 步骤 1: 配置 Firestore 安全规则

1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择项目：`visitmap-f9bb2`
3. 进入 **Firestore Database** > **规则** 标签页
4. 复制以下规则并粘贴：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /visits/{visit} {
      // 允许所有人创建访问记录（用于访问统计）
      allow create: if request.resource.data.keys().hasAll(['ip', 'country', 'city', 'timestamp', 'date', 'createdAt']) 
                    && request.resource.data.ip is string 
                    && request.resource.data.country is string;
      
      // 仅限管理员读取
      allow read: if request.auth != null && request.auth.token.admin == true;
      
      // 禁止更新和删除
      allow update, delete: if false;
    }
    
    match /aggregated_stats/{docId} {
      // 聚合统计数据可以公开读取
      allow read: if true;
      
      // 聚合数据只能由后端写入
      allow create, update, delete: if false;
    }
  }
}
```

5. 点击 **发布**

### 步骤 2: 部署 Cloud Functions

1. 打开终端或命令行工具
2. 确保位于 Firebase 项目的根目录（`visa_map` 目录）
3. 进入 `functions` 目录：
   ```bash
   cd functions
   ```

4. 安装依赖：
   ```bash
   npm install
   ```

5. 部署所有函数：
   ```bash
   firebase deploy --only functions
   ```

   或者只部署特定函数：
   ```bash
   # 部署 IP 地理位置代理函数
   firebase deploy --only functions:getIPLocation
   
   # 部署聚合统计函数
   firebase deploy --only functions:aggregateVisitStats
   firebase deploy --only functions:manualAggregateStats
   ```

### 步骤 3: 手动触发聚合函数（首次运行）

部署完成后，访问以下 URL 手动触发聚合函数生成初始统计数据：

```
https://asia-east2-visitmap-f9bb2.cloudfunctions.net/manualAggregateStats
```

访问后，您应该会看到类似以下的 JSON 响应：

```json
{
  "success": true,
  "message": "聚合完成",
  "stats": {
    "totalVisits": 100,
    "uniqueIPs": 50,
    "countriesCount": 10
  }
}
```

### 步骤 4: 验证部署

1. **验证 Cloud Functions**
   - 在 Firebase Console > Functions 中查看函数列表
   - 应该能看到以下函数：
     - `getIPLocation` - IP地理位置代理函数
     - `aggregateVisitStats` - 定时聚合函数（每小时运行）
     - `manualAggregateStats` - 手动触发聚合函数

2. **验证 Firestore 数据**
   - 在 Firebase Console > Firestore Database 中查看
   - `visits` 集合应该有访问记录
   - `aggregated_stats` 集合应该有 `current` 文档

3. **验证网站功能**
   - 刷新网站页面：https://figsama.github.io/2026qzdt/
   - 打开浏览器控制台（F12），检查是否有错误
   - 点击"访问统计"标签页，应该能看到统计数据

## 🔧 函数 URL 列表

根据您的项目配置（区域：`asia-east2`），所有函数的 URL 如下：

### 1. IP 地理位置代理函数
```
https://asia-east2-visitmap-f9bb2.cloudfunctions.net/getIPLocation
```
**用途**：前端调用此函数获取访问者的 IP 地理位置信息（解决 CORS 问题）

### 2. 手动触发聚合函数
```
https://asia-east2-visitmap-f9bb2.cloudfunctions.net/manualAggregateStats
```
**用途**：手动触发访问数据聚合，生成统计数据

### 3. 定时聚合函数
```
自动运行，无需手动调用
```
**用途**：每小时自动运行一次，聚合访问数据

## 📝 配置说明

### Cloud Function 区域配置

在 `index.html` 中，Cloud Function 区域已配置为：
```javascript
const CLOUD_FUNCTION_REGION = 'asia-east2';
```

如果您的函数部署在其他区域，请修改此配置。

### 如何查找函数区域

1. 在 Firebase Console > Functions 中查看函数
2. 点击函数名称查看详情
3. 在"触发器"部分可以看到函数的 URL
4. URL 格式：`https://REGION-PROJECT_ID.cloudfunctions.net/functionName`

## 🐛 故障排除

### 问题 1: 部署失败

**错误**: `npm install` 失败
**解决**: 
```bash
cd functions
rm -rf node_modules package-lock.json
npm install
```

### 问题 2: 函数调用失败

**错误**: `Function not found` 或 `404`
**解决**: 
- 检查函数是否已成功部署
- 检查 URL 中的区域是否正确
- 在 Firebase Console 中查看函数状态

### 问题 3: CORS 错误

**错误**: `Access-Control-Allow-Origin`
**解决**: 
- 确保 `getIPLocation` 函数已部署
- 检查函数 URL 配置是否正确
- 查看浏览器控制台的错误信息

### 问题 4: Firestore 权限错误

**错误**: `Missing or insufficient permissions`
**解决**: 
- 检查 Firestore 安全规则是否正确配置
- 确保规则已发布
- 参考 `FIRESTORE_RULES.md` 文件

### 问题 5: 聚合数据未生成

**解决**: 
1. 手动触发聚合函数：访问 `manualAggregateStats` URL
2. 检查 `visits` 集合是否有数据
3. 查看 Functions 日志：`firebase functions:log`
4. 检查函数执行历史：Firebase Console > Functions > 选择函数 > 查看日志

## 📊 监控和维护

### 查看函数日志

```bash
firebase functions:log
```

### 查看特定函数的日志

```bash
firebase functions:log --only getIPLocation
firebase functions:log --only aggregateVisitStats
firebase functions:log --only manualAggregateStats
```

### 在 Firebase Console 查看

1. 打开 Firebase Console
2. 进入 Functions 页面
3. 点击函数名称
4. 查看"日志"标签页

## ✅ 部署检查清单

- [ ] Firestore 安全规则已配置并发布
- [ ] `functions` 目录中的依赖已安装（`npm install`）
- [ ] 所有 Cloud Functions 已成功部署
- [ ] 手动触发聚合函数成功
- [ ] Firestore 中能看到 `aggregated_stats/current` 文档
- [ ] 网站能正常访问，无控制台错误
- [ ] "访问统计"页面能正常显示数据

## 🎉 完成！

完成以上步骤后，您的访问统计功能应该可以正常工作了！

- ✅ IP 地理位置通过 Cloud Function 代理获取（解决 CORS）
- ✅ 访问数据自动保存到 Firestore
- ✅ 统计数据每小时自动聚合
- ✅ 前端可以查看访问统计和地图分布

如有任何问题，请参考 `TROUBLESHOOTING.md` 文件或查看 Firebase Console 中的日志。

