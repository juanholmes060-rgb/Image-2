export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, pass, taskId } = req.body;

  if (pass !== "661500") {
    return res.status(401).json({ error: '访问密码错误' });
  }

  const API_KEY = process.env.OPENAI_API_KEY;
  const BASE_URL = "https://api.apimart.ai/v1/images/generations";

  try {
    // 自动切换：如果有 taskId 就发 GET 查询，没有就发 POST 创建
    const url = taskId ? `${BASE_URL}/${taskId}` : BASE_URL;
    const fetchOptions = {
      method: taskId ? 'GET' : 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    if (!taskId) {
      fetchOptions.body = JSON.stringify({
        model: "gpt-image-2",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      });
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    
    // 直接返回原始 JSON，让前端处理
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "API通讯失败", details: e.message });
  }
}
