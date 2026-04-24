export default async function handler(req, res) {
  const { prompt, pass } = req.body;

  // 验证密码
  if (pass !== process.env.ACCESS_CODE) {
    return res.status(401).json({ error: '密码错误' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-image-2", 
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "hd"
      })
    });

    const result = await response.json();
    if (result.data && result.data[0]) {
      res.status(200).json({ url: result.data[0].url });
    } else {
      res.status(500).json({ error: result.error?.message || 'OpenAI 接口报错' });
    }
  } catch (e) {
    res.status(500).json({ error: '服务器连接超时' });
  }
}