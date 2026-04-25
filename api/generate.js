export default async function handler(req, res) {
  // 设置跨域头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, pass, taskId } = req.body;

  // 1. 校验密码
  if (pass !== "661500") {
    return res.status(401).json({ error: '访问密码错误' });
  }

  const API_KEY = process.env.OPENAI_API_KEY;
  const BASE_URL = "https://api.apimart.ai/v1/images/generations";

  try {
    // 2. 根据是否有 taskId 决定请求方式
    // 有 taskId 用 GET 查询；没有用 POST 创建
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
    const result = await response.json();

    // 3. 直接返回给前端
    res.status(200).json(result);

  } catch (e) {
    res.status(500).json({ error: "服务器通讯异常", details: e.message });
  }
}
