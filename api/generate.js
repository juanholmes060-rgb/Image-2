export default async function handler(req, res) {
  const { prompt, pass } = req.body;

  // 1. 验证密码
  if (pass !== process.env.ACCESS_CODE) {
    return res.status(401).json({ error: '密码错误' });
  }

  try {
    // 2. 注意：这里改成了 API Mart 的中转地址
    const API_MART_URL = "https://api.apimart.ai/v1/images/generations";

    const response = await fetch(API_MART_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // 这里的环境变量依然填你的 API Mart 密钥
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-image-2", // API Mart 只要同步了 OpenAI 2026 接口，这个模型名就有效
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "hd"
      })
    });

    const result = await response.json();

    // 3. 处理返回结果
    if (result.data && result.data[0]) {
      res.status(200).json({ url: result.data[0].url });
    } else {
      // 这里的报错能帮你抓到具体是 额度不足 还是 模型名不支持
      res.status(500).json({ error: result.error?.message || JSON.stringify(result) });
    }
  } catch (e) {
    res.status(500).json({ error: '连接 API Mart 服务器超时' });
  }
}
