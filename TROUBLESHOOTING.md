# 问题排查指南

## 问题1: IP地理位置显示为"Unknown"

### 症状
访问数据保存到Firebase时，`country`、`city`、`ip` 等字段都是 "Unknown" 或 "unknown"。

### 原因
IP地理位置API调用失败，可能的原因：
1. API服务暂时不可用
2. CORS策略阻止了API调用
3. 网络问题
4. API限流

### 解决方案

#### 方案1: 检查浏览器控制台
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签页
3. 查找与IP API相关的错误信息

#### 方案2: 手动测试API
在浏览器控制台运行以下代码测试API：

```javascript
// 测试 ipapi.co
fetch('https://ipapi.co/json/')
  .then(r => r.json())
  .then(data => console.log('ipapi.co:', data))
  .catch(e => console.error('ipapi.co 失败:', e));

// 测试 ip-api.com
fetch('https://ip-api.com/json/')
  .then(r => r.json())
  .then(data => console.log('ip-api.com:', data))
  .catch(e => console.error('ip-api.com 失败:', e));
```

#### 方案3: 使用代理或VPN
某些地区可能无法访问某些IP地理位置API，尝试使用代理或VPN。

#### 方案4: 检查代码
代码已经实现了多个备用API，如果所有API都失败，会保存基本信息。这是正常行为，确保：
- 代码已更新到最新版本
- 浏览器支持 `fetch` API
- 没有浏览器扩展阻止API调用

## 问题2: 访问统计页面显示"暂无访问数据"

### 症状
打开"访问统计"标签页时，显示"聚合统计数据尚未生成"。

### 原因
`aggregated_stats/current` 文档不存在，因为：
1. Cloud Functions 尚未部署
2. Cloud Functions 尚未运行
3. 聚合函数执行失败

### 解决方案

#### 步骤1: 部署 Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

#### 步骤2: 手动触发聚合函数

部署完成后，访问以下URL手动触发聚合：

```
https://YOUR_REGION-visitmap-f9bb2.cloudfunctions.net/manualAggregateStats
```

将 `YOUR_REGION` 替换为你的Firebase项目区域（例如：asia-east1、us-central1等）。

#### 步骤3: 验证数据

1. 在 Firebase Console 中打开 Firestore Database
2. 查看 `aggregated_stats` 集合
3. 应该能看到 `current` 文档

#### 步骤4: 检查定时函数

1. 在 Firebase Console 中打开 Functions
2. 查看 `aggregateVisitStats` 函数
3. 检查执行历史和日志
4. 确保函数正常运行

### 验证聚合数据格式

`aggregated_stats/current` 文档应该包含以下字段：

```javascript
{
  totalVisits: 1000,           // 总访问量
  uniqueIPs: 500,              // 独立IP数
  countriesCount: 50,          // 国家数量
  countries: { ... },          // 国家统计对象
  cities: { ... },             // 城市统计对象
  countryVisits: { ... },      // 按国家代码统计（用于地图）
  topCountries: [ ... ],       // 访问最多的国家（前10名）
  topCities: [ ... ],          // 访问最多的城市（前10名）
  visitsByDate: { ... },       // 按日期统计
  lastUpdated: Timestamp        // 最后更新时间
}
```

## 常见错误

### 错误1: "Firebase未配置"
**原因**: Firebase SDK未正确加载
**解决**: 检查 `index.html` 中的Firebase配置代码是否正确

### 错误2: "Permission denied"
**原因**: Firestore安全规则不允许读取
**解决**: 检查安全规则，确保 `aggregated_stats` 集合允许公开读取

### 错误3: "Function execution failed"
**原因**: Cloud Functions执行失败
**解决**: 
1. 查看 Functions 日志
2. 检查 Firestore 权限
3. 确保 `visits` 集合中有数据

## 调试技巧

### 1. 启用详细日志

在浏览器控制台运行：

```javascript
// 查看Firebase连接状态
console.log('Firebase DB:', typeof db !== 'undefined' ? '已连接' : '未连接');

// 测试读取聚合数据
db.collection('aggregated_stats').doc('current').get()
  .then(doc => {
    if (doc.exists) {
      console.log('聚合数据:', doc.data());
    } else {
      console.log('聚合数据不存在');
    }
  })
  .catch(e => console.error('读取失败:', e));
```

### 2. 检查Firestore数据

在 Firebase Console 中：
1. 打开 Firestore Database
2. 检查 `visits` 集合是否有数据
3. 检查 `aggregated_stats` 集合是否有 `current` 文档

### 3. 查看Cloud Functions日志

```bash
firebase functions:log
```

或是在 Firebase Console > Functions > 选择函数 > 查看日志

## 联系支持

如果以上方法都无法解决问题，请：
1. 收集浏览器控制台的错误信息
2. 收集 Cloud Functions 的日志
3. 检查 Firestore 安全规则
4. 提供问题的详细描述

