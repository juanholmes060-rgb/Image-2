export default async function handler(req, res) {
  // 简单的访问码校验（保护你的额度）
  const { prompt, accessCode } = req.body;
  if (accessCode !== process.env.ACCESS_CODE) {
    return res.status(401).json({ error: '访问密码错误' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-image-2", // 使用你要求的 2026 最新模型
        prompt: prompt,
        n: 1,
        size: "1024x1024", // GPT-Image-2 支持最高 4K，这里先设标准版
        quality: "hd"
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: '生成失败，请检查配置' });
  }
}
