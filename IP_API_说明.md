# IP 地理位置 API 说明

## 问题解决

### 原问题
- `ip-api.com` 返回 403 错误(Forbidden)
- HTTPS 协议可能被阻止
- API 限流或访问限制

### 优化方案

#### 1. **调整 API 调用优先级**
- **优先使用 CORS API**（更可靠、更稳定）
- JSONP 作为备用方案

#### 2. **改进的 API 列表**
按优先级排序:
1. **ipapi.co** - 免费、稳定、支持 HTTPS
2. **ipwhois.app** - 备用方案
3. **ipify.org** - 仅获取IP地址
4. **ip-api.com** (JSONP) - 降级为备用,改用 HTTP

#### 3. **优化点**
- ✅ 添加请求超时控制（5秒）
- ✅ 使用 AbortController 取消超时请求
- ✅ 改进错误日志(使用图标和清晰的消息)
- ✅ 防止重复回调执行
- ✅ ip-api.com 改用 HTTP 协议(避免 403)

#### 4. **控制台输出优化**
- `✓` 成功提示
- `⚠` 警告提示
- `ℹ` 信息提示

## 使用的免费 IP API

| API | 协议 | 限制 | 地理位置 |
|-----|------|------|----------|
| ipapi.co | HTTPS | 30,000/月 | ✓ |
| ipwhois.app | HTTPS | 10,000/月 | ✓ |
| ipify.org | HTTPS | 无限制 | ✗ |
| ip-api.com | HTTP/JSONP | 45/分钟 | ✓ |

## 故障转移流程

```
1. 尝试 ipapi.co (CORS)
   ├─ 成功 → 返回数据
   └─ 失败 ↓
   
2. 尝试 ipwhois.app (CORS)
   ├─ 成功 → 返回数据
   └─ 失败 ↓
   
3. 尝试 ipify.org (CORS)
   ├─ 成功 → 返回基本IP
   └─ 失败 ↓
   
4. 尝试 ip-api.com (JSONP/HTTP)
   ├─ 成功 → 返回数据
   └─ 失败 ↓
   
5. 使用默认值
   └─ IP: unknown, Country: Unknown
```

## 测试建议

刷新页面后,检查控制台输出:
- 应该看到 `✓ 使用 ipapi.co 成功获取IP信息`
- 或其他 API 的成功消息
- 不应再看到 403 错误

## 进一步优化建议

如果仍有问题,可以考虑:
1. 自建 IP 查询服务
2. 使用付费 API (更稳定、更高配额)
3. 使用 Cloudflare Workers 作为代理
4. 缓存 IP 信息(localStorage)避免重复请求
