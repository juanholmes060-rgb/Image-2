export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, pass, taskId } = req.body;
  if (pass !== "661500") return res.status(401).json({ error: '密码错误' });

  const API_KEY = process.env.OPENAI_API_KEY;
  const BASE_URL = "https://api.apimart.ai/v1/images/generations";

  try {
    // 如果有 taskId，拼接到 URL 后面进行 GET 查询
    const url = taskId ? `${BASE_URL}/${taskId}` : BASE_URL;
    const options = {
      method: taskId ? 'GET' : 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    if (!taskId) {
      options.body = JSON.stringify({
        model: "gpt-image-2",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      });
    }

    const response = await fetch(url, options);
    const result = await response.json();
    
    // 打印日志方便你在 Vercel 后台观察查询结果的真实结构
    console.log("API Mart Response:", JSON.stringify(result));

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
