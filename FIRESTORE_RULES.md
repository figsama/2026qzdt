# Firestore 安全规则配置

## 当前错误

如果看到错误：`Missing or insufficient permissions`，说明 Firestore 安全规则不允许写入 `visits` 集合。

## 正确的安全规则

请确保你的 Firestore 安全规则如下：

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

## 配置步骤

1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择项目：`visitmap-f9bb2`
3. 进入 **Firestore Database** > **规则** 标签页
4. 复制上面的规则并粘贴
5. 点击 **发布**

## 验证

配置完成后：
1. 刷新网站页面
2. 打开浏览器控制台（F12）
3. 应该不再看到 `Missing or insufficient permissions` 错误
4. 在 Firestore Console 中应该能看到新的访问记录被创建

## 注意事项

- `visits` 集合允许所有人创建记录，但只有管理员可以读取
- `aggregated_stats` 集合允许所有人读取，但只有后端可以写入
- 这确保了数据隐私和安全性

