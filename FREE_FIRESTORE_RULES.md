# Firestore 安全规则（免费方案）

## 📋 说明

这是适用于免费 Spark 计划的安全规则配置。与需要 Cloud Functions 的方案不同，此方案允许客户端直接读取 `visits` 集合并在客户端聚合数据。

## 🔒 安全规则

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /visits/{visit} {
      // 允许所有人创建访问记录（用于访问统计）
      allow create: if request.resource.data.keys().hasAll(['ip', 'country', 'city', 'timestamp', 'date', 'createdAt']) 
                    && request.resource.data.ip is string 
                    && request.resource.data.country is string;
      
      // 允许所有人读取（用于客户端聚合统计）
      // 注意：访问统计本身就是公开数据，所以允许公开读取是合理的
      allow read: if true;
      
      // 禁止更新和删除（保护数据完整性）
      allow update, delete: if false;
    }
  }
}
```

## 📝 配置步骤

1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择项目：`visitmap-f9bb2`
3. 进入 **Firestore Database** > **规则** 标签页
4. 复制上面的规则并粘贴
5. 点击 **发布**

## ⚠️ 注意事项

### 数据隐私

- `visits` 集合包含访问者的 IP 地址和地理位置信息
- 这些数据是公开的，任何人都可以读取
- 如果您需要保护隐私，可以考虑：
  - 只保存国家/城市信息，不保存 IP
  - 使用 Cloud Functions 聚合数据（需要 Blaze 计划）

### 性能考虑

- 客户端需要读取所有访问记录并聚合
- 如果数据量很大（>10000条），可能会影响性能
- 建议限制读取数量（代码中已限制为10000条）

## ✅ 验证

配置完成后：

1. 刷新网站页面
2. 打开浏览器控制台（F12）
3. 应该不再看到权限错误
4. 点击"访问统计"标签页，应该能看到数据

## 🔄 与 Cloud Functions 方案的区别

| 特性 | 免费方案（当前） | Cloud Functions 方案 |
|------|----------------|-------------------|
| 计划要求 | Spark（免费） | Blaze（按需付费） |
| 数据聚合 | 客户端聚合 | 服务器端聚合 |
| 性能 | 数据量大时较慢 | 快速 |
| 隐私 | 数据公开可读 | 数据可保护 |
| 复杂度 | 简单 | 需要部署函数 |

## 📊 免费额度

Spark 计划免费额度：
- **Firestore 读取**：每天 50,000 次
- **Firestore 写入**：每天 20,000 次
- **存储**：1 GB
- **出站流量**：10 GB/月

对于个人网站，这些免费额度通常足够使用。

