# Cloud Functions 部署指南

## 功能说明

这个 Cloud Functions 项目包含两个函数：

1. **`aggregateVisitStats`** - 定时聚合函数
   - 每小时自动运行一次
   - 从 `visits` 集合读取数据并聚合统计
   - 将结果保存到 `aggregated_stats/current` 文档

2. **`manualAggregateStats`** - 手动触发函数
   - 通过 HTTP 请求手动触发
   - 用于测试或立即更新统计数据

## 部署步骤

### 1. 安装依赖

```bash
cd functions
npm install
```

### 2. 部署函数

```bash
# 部署所有函数
firebase deploy --only functions

# 或者只部署特定函数
firebase deploy --only functions:aggregateVisitStats
firebase deploy --only functions:manualAggregateStats
```

### 3. 验证部署

部署完成后，你可以：

- **查看定时函数**：在 Firebase Console > Functions 中查看 `aggregateVisitStats`
- **手动触发**：访问 `https://YOUR_REGION-visitmap-f9bb2.cloudfunctions.net/manualAggregateStats`

## 配置说明

### 修改定时频率

在 `functions/index.js` 中修改：

```javascript
exports.aggregateVisitStats = functions.pubsub
  .schedule('every 1 hours') // 修改这里：every 1 hours, every 30 minutes, every 1 days 等
  .timeZone('Asia/Shanghai')
  .onRun(async (context) => {
    // ...
  });
```

### 时区设置

默认使用 `Asia/Shanghai`，可以根据需要修改。

## 数据结构

### 输入：`visits` 集合

每个文档包含：
- `ip`: IP地址
- `country`: 国家名称
- `countryCode`: 国家代码（ISO 3166-1 alpha-2）
- `city`: 城市名称
- `timestamp`: 时间戳
- `date`: 日期字符串
- `createdAt`: Firestore 时间戳

### 输出：`aggregated_stats/current` 文档

```javascript
{
  totalVisits: 1000,           // 总访问量
  uniqueIPs: 500,              // 独立IP数
  countriesCount: 50,          // 国家数量
  countries: {                 // 国家统计对象
    "China": 300,
    "United States": 200,
    // ...
  },
  cities: {                    // 城市统计对象
    "Beijing": 100,
    "Shanghai": 80,
    // ...
  },
  countryVisits: {            // 按国家代码统计（用于地图）
    "CN": { count: 300, country: "China" },
    "US": { count: 200, country: "United States" },
    // ...
  },
  topCountries: [              // 访问最多的国家（前10名）
    { country: "China", count: 300 },
    { country: "United States", count: 200 },
    // ...
  ],
  topCities: [                 // 访问最多的城市（前10名）
    { city: "Beijing", count: 100 },
    { city: "Shanghai", count: 80 },
    // ...
  ],
  visitsByDate: {              // 按日期统计
    "Mon Jan 01 2024": 50,
    "Tue Jan 02 2024": 60,
    // ...
  },
  lastUpdated: Timestamp       // 最后更新时间
}
```

## 权限要求

确保 Cloud Functions 有权限访问 Firestore：

1. 在 Firebase Console > Functions 中查看函数
2. 确保函数使用的服务账号有 Firestore 读写权限
3. 默认情况下，使用 Firebase Admin SDK 的函数有完整权限

## 监控和日志

### 查看日志

```bash
firebase functions:log
```

### 在 Firebase Console 查看

1. 打开 Firebase Console
2. 进入 Functions 页面
3. 点击函数名称查看执行历史和日志

## 故障排除

### 函数执行失败

1. 检查 Firestore 安全规则是否允许函数访问 `visits` 集合
2. 检查函数日志中的错误信息
3. 确保 `visits` 集合中有数据

### 聚合数据未更新

1. 检查定时函数是否正常运行
2. 手动触发 `manualAggregateStats` 函数测试
3. 检查 `aggregated_stats/current` 文档是否存在

### 内存或超时问题

如果数据量很大，可能需要：
- 增加函数内存限制
- 增加函数超时时间
- 分批处理数据

在 `functions/index.js` 中修改：

```javascript
exports.aggregateVisitStats = functions
  .runWith({
    memory: '512MB',    // 增加内存
    timeoutSeconds: 540 // 增加超时时间（最多540秒）
  })
  .pubsub.schedule('every 1 hours')
  // ...
```

## 成本估算

- **定时函数**：每小时运行一次，每天24次
- **每次执行**：读取最多10000条记录，写入1个文档
- **免费额度**：Firebase 免费套餐包含：
  - 125,000 次函数调用/月
  - 40,000 GB-秒的计算时间/月
  - 20 GB 出站流量/月

对于个人网站，免费额度通常足够使用。

