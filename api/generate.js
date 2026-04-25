export default async function handler(req, res) {
  // 设置跨域头，确保前端轮询不被拦截
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, pass, taskId } = req.body;

  // 验证访问密码
  if (pass !== "661500") {
    return res.status(401).json({ error: '访问密码错误' });
  }

  const API_KEY = process.env.OPENAI_API_KEY;
  const BASE_URL = "https://api.apimart.ai/v1/images/generations";

  try {
    // 根据是否有 taskId 决定是“查询”还是“新建”
    const url = taskId ? `${BASE_URL}/${taskId}` : BASE_URL;
    const method = taskId ? 'GET' : 'POST';
    
    const options = {
      method: method,
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
    const data = await response.json();

    // 直接透传 API Mart 的原始数据，由前端进行多路径解析
    res.status(200).json(data);

  } catch (e) {
    res.status(500).json({ error: "API 通讯异常", details: e.message });
  }
}
