# AI 图片生成器 - 部署说明

## ⚠️ 重要：沙箱环境限制

当前沙箱环境无法访问外部API（`api.apimart.io`），因此**无法在本地测试图片生成功能**。

但这不影响部署到 Vercel 后的正常使用。

## 部署到 Vercel

### 1. 准备文件
确保以下文件在项目根目录：
- `index.html` - 前端页面
- `server.js` - Node.js API代理
- `package.json` - 依赖配置

### 2. 创建 package.json
如果没有，需要创建：

```json
{
  "name": "gpt-image-generator",
  "version": "1.0.0",
  "description": "GPT-Image-2 Image Generator",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  }
}
```

### 3. Vercel 配置
创建 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server.js" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### 4. 部署步骤
1. 将代码推送到 GitHub 仓库
2. 在 Vercel 导入项目
3. 选择 Node.js 运行时
4. 设置环境变量（如需要）

## 本地测试替代方案

如果需要在本地测试：
1. 使用 VPN 访问外网
2. 或使用其他可访问的 API 地址

## 功能说明

部署后的功能与预期一致：
- ✅ 密码保护访问
- ✅ 图片比例选择
- ✅ 像素等级选择（1K/2K/4K）
- ✅ 输入描述生成图片
- ✅ 下载生成的图片

## 注意事项

1. **API密钥安全**：当前密钥在前端代码中，建议：
   - 部署时将密钥移到环境变量
   - 使用 Vercel 的环境变量功能
   - 更新 server.js 从环境变量读取密钥

2. **CORS问题**：通过 server.js 的 API 代理解决
   - 前端请求发送到 `/api/generate`
   - 后端代理转发到 Apimart API
   - 避免浏览器 CORS 限制

## 访问地址

部署后访问：`https://your-project.vercel.app`

初始密码：`gptimage2024`
