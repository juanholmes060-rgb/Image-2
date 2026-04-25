# API 测试指南

## 使用测试页面诊断问题

### 步骤 1：访问测试页面
在浏览器中打开: https://image-2-ashy.vercel.app/test

这个页面会：
- 自动发送一个测试请求到 `/api/generate`
- 显示完整的请求和响应信息
- 帮助定位问题所在

### 步骤 2：查看测试结果

#### 情况 1：显示成功
```
状态: 200 OK
耗时: xxxms
```
✅ 说明 API 工作正常，问题可能在首页

#### 情况 2：显示 404 或其他错误
❌ 查看错误消息和响应体，确定具体问题

#### 情况 3：请求失败
```
❌ 请求失败: Failed to fetch
```
❌ 说明网络问题或 CORS 问题

## 常见错误及解决方案

### 错误 1：404 Not Found
**原因**: API 路径不正确
**解决**: 确认 Apimart 的正确端点

### 错误 2：401 Unauthorized  
**原因**: API 密钥无效
**解决**: 检查 API 密钥是否正确

### 错误 3：Failed to fetch
**原因**: CORS 限制或网络问题
**解决**: 检查 server.js 的代理配置

### 错误 4：500 Internal Server Error
**原因**: 后端代码错误
**解决**: 查看 Vercel 日志获取详细信息

## 手动测试 API

如果测试页面也无法访问，可以在本地测试：

```bash
# 测试 API 是否可达
curl -I https://api.apimart.io

# 测试 API 调用
curl -X POST "https://api.apimart.io/v1/images/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-4e8Jv0gxK3wzrsAue11bLijwWcPAF53VnDXrrRIjcwiO6vWL" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "test",
    "n": 1
  }'
```

## 检查 Vercel 部署

### 1. 检查部署状态
登录 Vercel Dashboard → 你的项目 → Deployments

确保：
- ✅ 部署状态为 "Ready"
- ✅ 没有错误标记

### 2. 查看 Functions 日志
1. 点击最新的 Deployment
2. 选择 "Functions" 标签
3. 查看 server.js 的日志

如果显示 "No logs"，说明 API 请求没有到达 server.js

### 3. 检查环境变量
确保 Vercel 中没有设置冲突的环境变量

## 获取帮助

如果以上方法都无法解决问题，请提供：
1. 测试页面的完整截图
2. Vercel Functions 日志截图
3. 浏览器开发者工具 (F12) → Network 标签的截图
