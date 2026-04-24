# Vercel 部署问题诊断

## 常见错误：API 请求失败 (404)

### 可能原因及解决方案

#### 1. API 端点错误
确认 Apimart 的正确 API 端点。不同的 AI 服务提供商有不同的端点：
- OpenAI: `https://api.openai.com/v1/images/generations`
- Apimart: `https://api.apimart.io/v1/images/generations` （当前配置）

**检查方法**：
访问 https://docs.apimart.ai 确认正确的 API 地址。

#### 2. API 密钥无效
- 确认密钥 `sk-4e8Jv0gxK3wzrsAue11bLijwWcPAF53VnDXrrRIjcwiO6vWL` 是否正确
- 检查密钥是否过期或已被撤销
- 确认密钥是否有该 API 的访问权限

#### 3. Vercel 路由配置问题
确保 `vercel.json` 配置正确：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### 4. 部署检查清单
在 Vercel Dashboard 检查：
- [ ] Environment Variables 设置正确
- [ ] Build Command 正确（如果有）
- [ ] Runtime 设置为 Node.js
- [ ] 查看 Functions 日志了解具体错误

### 查看 Vercel 日志

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 点击 "Deployments" 标签
4. 选择最新的部署
5. 点击 "Logs" 查看详细日志

### 测试 API 密钥

可以在本地终端测试 API 是否可用：

```bash
curl -X POST "https://api.apimart.io/v1/images/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-4e8Jv0gxK3wzrsAue11bLijwWcPAF53VnDXrrRIjcwiO6vWL" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "a cat",
    "n": 1
  }'
```

如果本地测试也失败，说明 API 密钥或端点有问题。

## 获取帮助

如果问题仍然存在，请提供：
1. Vercel 部署的完整 URL
2. Vercel Functions 日志截图
3. 浏览器控制台的错误信息
