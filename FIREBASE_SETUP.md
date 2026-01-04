# Firebase 访问统计配置指南

## 为什么需要 Firebase？

**localStorage 的限制：**
- 数据只存储在访问者的浏览器中
- 每个用户只能看到自己的访问记录
- 网站所有者无法看到所有访问者的数据

**使用 Firebase 的好处：**
- ✅ 所有访问数据统一存储在云端
- ✅ 网站所有者可以查看所有访问者的数据
- ✅ 数据永久保存，不会丢失
- ✅ 免费额度足够个人网站使用

## 配置步骤

### 1. 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"添加项目"
3. 输入项目名称（如：visa-map-analytics）
4. 按照提示完成项目创建

### 2. 启用 Firestore 数据库

1. 在 Firebase Console 中，点击左侧菜单的"Firestore Database"
2. 点击"创建数据库"
3. 选择"以测试模式启动"（开发阶段）
4. 选择数据库位置（建议选择离你最近的区域）
5. 点击"启用"

### 3. 配置 Web 应用

1. 在 Firebase Console 中，点击项目设置（齿轮图标）
2. 滚动到"您的应用"部分
3. 点击 Web 图标（</>）添加 Web 应用
4. 输入应用昵称（如：Visa Map）
5. 勾选"同时设置 Firebase Hosting"（可选）
6. 点击"注册应用"
7. 复制 Firebase 配置代码

### 4. 配置 Firestore 安全规则

1. 在 Firestore Database 页面，点击"规则"标签
2. 修改规则为以下内容（允许所有人读写，仅用于访问统计）：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /visits/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**注意：** 这个规则允许所有人读写，仅适合访问统计这种公开数据。如果存储敏感数据，需要更严格的规则。

### 5. 在网站中启用 Firebase

1. 打开 `index.html` 文件
2. 找到 Firebase SDK 部分（大约在第 20-30 行）
3. 取消注释 Firebase SDK 代码
4. 将 Firebase 配置代码中的值替换为你的配置：

```html
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"></script>
<script>
  const firebaseConfig = {
    apiKey: "你的API密钥",
    authDomain: "你的项目ID.firebaseapp.com",
    projectId: "你的项目ID",
    storageBucket: "你的项目ID.appspot.com",
    messagingSenderId: "你的消息发送者ID",
    appId: "你的应用ID"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
</script>
```

### 6. 测试配置

1. 保存文件并推送到 GitHub
2. 访问网站，打开"访问统计"标签页
3. 在 Firebase Console 的 Firestore Database 中查看数据
4. 应该能看到访问记录被保存到 `visits` 集合中

## 查看所有访问数据

配置完成后，你可以通过两种方式查看所有访问数据：

### 方式一：在网站中查看
- 打开"访问统计"标签页
- 如果 Firebase 已配置，会自动显示所有访问者的数据
- 地图会显示所有访问者的IP分布

### 方式二：在 Firebase Console 中查看
1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 选择你的项目
3. 点击"Firestore Database"
4. 查看 `visits` 集合中的所有访问记录

## Firebase 免费额度

Firebase 免费套餐（Spark Plan）包括：
- **Firestore：** 50,000 次读取/天，20,000 次写入/天
- **存储：** 1 GB
- **带宽：** 10 GB/月

对于个人网站，这个免费额度通常足够使用。

## 注意事项

1. **安全规则：** 当前配置允许所有人读写，仅适合访问统计这种公开数据
2. **数据隐私：** 只收集IP和地理位置信息，不收集其他个人信息
3. **成本控制：** 如果访问量很大，建议设置 Firestore 使用量警报
4. **数据备份：** 建议定期导出 Firestore 数据作为备份

## 故障排除

**问题：** 数据没有保存到 Firebase
- 检查 Firebase 配置是否正确
- 检查浏览器控制台是否有错误信息
- 确认 Firestore 安全规则允许写入

**问题：** 无法从 Firebase 读取数据
- 检查 Firestore 安全规则是否允许读取
- 确认网络连接正常
- 检查浏览器控制台的错误信息

## 替代方案

如果不想使用 Firebase，也可以考虑：
- **Google Analytics：** 专业的网站分析工具
- **百度统计：** 适合国内用户
- **自建后端：** 使用 Node.js + MongoDB 等搭建自己的后端服务

