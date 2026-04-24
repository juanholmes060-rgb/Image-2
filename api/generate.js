export default async function handler(req, res) {
  const { prompt, pass } = req.body;

  // 1. 验证访问密码
  if (pass !== process.env.ACCESS_CODE) {
    return res.status(401).json({ error: '访问密码错误' });
  }

  try {
    // 2. 使用 API Mart 的标准接口地址
    const API_MART_URL = "https://api.apimart.ai/v1/images/generations";

    const response = await fetch(API_MART_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-image-2", // 确认你 API Mart 权限里包含该模型
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "url"
      })
    });

    const result = await response.json();

    // 3. 检查返回结构
    if (result.data && result.data[0] && result.data[0].url) {
      res.status(200).json({ url: result.data[0].url });
    } else {
      // 如果没有拿到 URL，把 API Mart 的原始报错传回前端以便调试
      res.status(200).json({ 
        error: "接口未返回图片链接", 
        raw: JSON.stringify(result) 
      });
    }
  } catch (e) {
    res.status(500).json({ error: "服务器请求超时，请检查网络或 Vercel 日志" });
  }
}
