# Firebase 配置说明 - Google Analytics vs Firestore

## 🎯 您需要配置的是什么？

根据您的需求（在地图上显示访客城市分布），您需要配置的是 **Firebase Firestore**，而不是 Google Analytics。

## 📊 两者的区别

### Google Analytics（可选）
**用途**：专业的网站流量分析工具
- 查看访问量、跳出率、停留时间等
- 用户行为分析、转化追踪
- Google 提供的专业仪表板

**配置代码**（如果需要）：
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-YOUR_MEASUREMENT_ID');
</script>
```

**是否需要**：❌ 不是必需的（但可以同时使用）

---

### Firebase Firestore（必需）
**用途**：存储访客数据并在地图上展示
- 记录访客的城市、IP、设备信息
- 您可以完全控制数据
- 在自定义地图页面显示

**配置代码**（已在 index.html 中）：
```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="visitor-tracker.js"></script>
```

**是否需要**：✅ 必需的（用于地图展示功能）

## 🔧 正确的配置步骤

### 步骤 1：在 Firebase Console 配置

1. 访问 https://console.firebase.google.com/
2. 选择您的项目：`visamap-884ae`
3. 在左侧菜单找到 **"Firestore Database"**（不是 "Analytics"）
4. 点击 "创建数据库"
5. 选择 "以测试模式启动"
6. 选择位置：`asia-east1` 或 `asia-northeast1`
7. 点击 "启用"

### 步骤 2：获取 Firebase 配置

1. 在 Firebase Console，点击齿轮图标 ⚙️ → "项目设置"
2. 滚动到 "您的应用" 部分
3. 如果没有 Web 应用，点击 `</>` 图标添加
4. 复制显示的配置信息

**正确的配置格式**：
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // 您的实际值
  authDomain: "visamap-884ae.firebaseapp.com",
  projectId: "visamap-884ae",
  storageBucket: "visamap-884ae.appspot.com",
  messagingSenderId: "123456789012", // 您的实际值
  appId: "1:123456789012:web:abc..." // 您的实际值
  // 注意：不需要 measurementId
  // 注意：不需要 databaseURL
};
```

### 步骤 3：修改 visitor-tracker.js

打开 `visitor-tracker.js`，找到第 11-17 行：

```javascript
// 修改前
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 修改后（填入您的实际值）
const firebaseConfig = {
  apiKey: "AIzaSy...",              // 从 Firebase Console 复制
  authDomain: "visamap-884ae.firebaseapp.com",
  projectId: "visamap-884ae",
  storageBucket: "visamap-884ae.appspot.com",
  messagingSenderId: "123456789012", // 从 Firebase Console 复制
  appId: "1:123456789012:web:abc..." // 从 Firebase Console 复制
};
```

### 步骤 4：修改 访问统计地图.html

打开 `访问统计地图.html`，找到第 187-193 行，填入相同的配置。

### 步骤 5：启用 index.html 中的 Firebase

在 `index.html` 中，找到第 20-26 行，**删除注释符号**：

**修改前**：
```html
<!-- Firebase SDK - 访问统计功能 -->
<!-- 配置完成后取消下面的注释 -->
<!--
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="visitor-tracker.js"></script>
-->
```

**修改后**：
```html
<!-- Firebase SDK - 访问统计功能 -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="visitor-tracker.js"></script>
```

## ⚠️ 常见错误

### ❌ 错误 1：混淆了 Firebase SDK 版本

**错误的代码**：
```html
<!-- 不要使用这种新版本的模块化语法 -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js";
  ...
</script>
```

**正确的代码**（我们使用的兼容版本）：
```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
```

### ❌ 错误 2：包含了不需要的字段

**不需要的字段**：
- `measurementId` - 这是 Google Analytics 用的
- `databaseURL` - 这是 Realtime Database 用的

**只需要这些字段**：
```javascript
{
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId
}
```

### ❌ 错误 3：启用了错误的数据库

**错误**：启用了 "Realtime Database"
**正确**：应该启用 "Firestore Database"

## 🎯 快速检查清单

配置完成后，按照此清单验证：

- [ ] Firebase Console 中已启用 **Firestore Database**
- [ ] Firestore 安全规则已配置（允许读写 visits 集合）
- [ ] Firebase 配置已复制（6 个字段：apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId）
- [ ] `visitor-tracker.js` 已更新配置
- [ ] `访问统计地图.html` 已更新配置
- [ ] `index.html` 中的 Firebase SDK 注释已删除
- [ ] 代码已提交并推送到 GitHub
- [ ] 等待 GitHub Pages 部署（1-2 分钟）

## 🧪 测试

1. 访问：https://figsama.github.io/2026qzdt/
2. 按 F12 打开浏览器控制台
3. 应该看到：`访问记录已保存: {...}`
4. 在 Firebase Console 的 Firestore Database 中应该能看到 `visits` 集合

## 💡 可以同时使用两者吗？

**可以！** 如果您想要更专业的分析，可以同时使用：

1. **Google Analytics** - 用于专业的流量分析
2. **Firebase Firestore** - 用于自定义的地图展示

只需要在 `index.html` 中同时保留两段代码即可（都取消注释）。

## 📚 总结

- ✅ **您需要的**：Firebase Firestore（用于地图展示）
- ❌ **您不需要的**：Google Analytics 的 `measurementId`
- 📍 **配置位置**：在 Firebase Console 的 "Firestore Database"，不是 "Analytics"
- 🔧 **SDK 版本**：使用 `firebase-*-compat.js`（兼容版本）

希望这能帮您理清思路！如果还有疑问，请告诉我具体哪一步不清楚。
