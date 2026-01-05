# Firebase 配置故障排查指南

## ❌ 您遇到的错误

```
Http failure response for https://visamap-884ae-default-rtdb.asia-southeast1.firebasedatabase.app/...
```

## 🔍 问题分析

这个错误说明您的 Firebase 项目中启用了 **Realtime Database**，但我们的代码使用的是 **Firestore**。这是两种不同的数据库：

| 特性 | Realtime Database | Firestore |
|------|------------------|-----------|
| 数据结构 | JSON 树 | 文档集合 |
| 查询能力 | 有限 | 强大 |
| 适用场景 | 实时同步 | 复杂查询 |
| **我们使用** | ❌ 不使用 | ✅ **使用这个** |

## ✅ 解决方案

### 方案 1：启用 Firestore（推荐）

1. **访问 Firebase Console**
   - 打开 https://console.firebase.google.com/
   - 选择您的项目 `visamap-884ae`

2. **启用 Firestore Database**
   - 在左侧菜单中，找到 **"Firestore Database"**（不是 "Realtime Database"）
   - 点击 "创建数据库"
   - 选择 "以测试模式启动"
   - 选择位置（建议：asia-east1 或 asia-northeast1）
   - 点击 "启用"

3. **配置安全规则**
   
   在 Firestore Database 页面，点击 "规则" 标签，粘贴以下规则：

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /visits/{visit} {
         // 允许任何人读取和创建
         allow read, create: if true;
         // 禁止更新和删除
         allow update, delete: if false;
       }
     }
   }
   ```

   点击 "发布"。

4. **验证配置**
   
   确保您的 Firebase 配置正确。在 Firebase Console 中：
   - 点击左上角齿轮图标 ⚙️
   - 选择 "项目设置"
   - 滚动到 "您的应用" 部分
   - 复制配置信息

### 方案 2：禁用 Realtime Database（可选）

如果您不需要 Realtime Database：

1. 在 Firebase Console 左侧菜单找到 "Realtime Database"
2. 点击右上角的三个点 ⋮
3. 选择 "删除数据库"（如果不需要）

这不会影响 Firestore 的使用。

## 📝 正确的配置步骤

### 第一步：获取 Firebase 配置

在 Firebase Console 的项目设置中，您应该看到类似这样的配置：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "visamap-884ae.firebaseapp.com",
  projectId: "visamap-884ae",
  storageBucket: "visamap-884ae.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**注意**：这里**不应该**有 `databaseURL` 字段。如果有，说明是 Realtime Database 的配置。

### 第二步：修改 visitor-tracker.js

打开 `visitor-tracker.js`，找到第 11-17 行，替换为您的配置：

```javascript
const firebaseConfig = {
  apiKey: "您的实际 apiKey",
  authDomain: "visamap-884ae.firebaseapp.com",
  projectId: "visamap-884ae",
  storageBucket: "visamap-884ae.appspot.com",
  messagingSenderId: "您的实际 messagingSenderId",
  appId: "您的实际 appId"
};
```

### 第三步：修改 访问统计地图.html

打开 `访问统计地图.html`，找到第 187-193 行，填入相同的配置。

### 第四步：确保 index.html 引用了正确的 SDK

在 `index.html` 中，确保引用的是 Firestore SDK：

```html
<!-- 正确的引用 -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="visitor-tracker.js"></script>

<!-- 错误的引用（不要使用这个）-->
<!-- <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js"></script> -->
```

## 🧪 测试配置

### 测试 1：检查控制台

1. 在浏览器中打开 https://figsama.github.io/2026qzdt/
2. 按 F12 打开开发者工具
3. 切换到 "Console" 标签
4. 应该看到：`访问记录已保存: {…}`
5. **不应该**看到任何错误信息

### 测试 2：检查 Firestore

1. 访问 Firebase Console
2. 点击 "Firestore Database"
3. 应该能看到 `visits` 集合
4. 点开集合，应该能看到访问记录

### 测试 3：查看统计页面

1. 访问 https://figsama.github.io/2026qzdt/访问统计地图.html
2. 应该能看到统计数据
3. 地图应该正常显示

## ⚠️ 常见错误和解决方法

### 错误 1: "Permission denied"

**原因**：Firestore 安全规则配置不正确

**解决**：
1. 检查 Firestore 规则是否允许读写
2. 确保规则中的集合名称是 `visits`

### 错误 2: "firebase is not defined"

**原因**：Firebase SDK 未加载

**解决**：
1. 检查 `index.html` 中是否正确引用了 Firebase SDK
2. 确保脚本标签的顺序正确（先加载 SDK，再加载 visitor-tracker.js）

### 错误 3: "firestore is not a function"

**原因**：使用了错误的 SDK 版本

**解决**：
1. 确保使用的是 `firebase-firestore-compat.js`
2. 检查代码中是否使用 `firebase.firestore()`

### 错误 4: CORS 错误

**原因**：IP 定位 API 的 CORS 限制

**解决**：
1. 这是正常的，脚本会自动切换到备用 API
2. 如果所有 API 都失败，会记录 "未知" 位置

## 📋 完整的配置检查清单

使用此清单确保配置正确：

- [ ] Firebase 项目已创建
- [ ] **Firestore Database** 已启用（不是 Realtime Database）
- [ ] Firestore 安全规则已设置
- [ ] Firebase 配置已复制（不包含 databaseURL）
- [ ] `visitor-tracker.js` 配置已更新
- [ ] `访问统计地图.html` 配置已更新
- [ ] `index.html` 中的 Firebase SDK 注释已取消
- [ ] 代码已提交并推送到 GitHub
- [ ] GitHub Pages 已重新部署（等待 1-2 分钟）
- [ ] 浏览器控制台无错误
- [ ] Firestore 中有 `visits` 集合
- [ ] 统计页面正常显示

## 🔄 如果问题仍然存在

1. **清除浏览器缓存**
   - 按 Ctrl+Shift+Delete（Windows/Linux）
   - 按 Cmd+Shift+Delete（Mac）
   - 选择清除缓存和 Cookie

2. **检查网络**
   - 确保能访问 Firebase 服务
   - 尝试在无痕模式下打开网站

3. **查看详细错误**
   - 在浏览器控制台中查看完整的错误堆栈
   - 将错误信息记录下来

4. **重新部署**
   ```bash
   git add .
   git commit -m "修复 Firebase 配置"
   git push
   ```
   等待 2-3 分钟让 GitHub Pages 重新部署

## 📞 获取更多帮助

如果按照以上步骤仍无法解决，请提供：
1. 浏览器控制台的完整错误信息
2. Firebase Console 中启用的数据库类型截图
3. `visitor-tracker.js` 中的配置（隐藏敏感信息）

## 🎯 快速解决步骤（TL;DR）

1. ✅ 在 Firebase Console 启用 **Firestore Database**（不是 Realtime Database）
2. ✅ 配置 Firestore 安全规则（允许读取和创建 visits 集合）
3. ✅ 确保 Firebase 配置中**没有** `databaseURL` 字段
4. ✅ 更新代码并重新部署

---

希望这能帮助您解决问题！如果还有疑问，请随时告诉我。
