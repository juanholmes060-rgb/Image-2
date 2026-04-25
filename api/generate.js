export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, pass, taskId } = req.body;
  if (pass !== "661500") return res.status(401).json({ error: '访问密码错误' });

  const API_KEY = process.env.OPENAI_API_KEY;
  // 注意：此处末尾不带斜杠，由下方逻辑动态判断
  const BASE_URL = "https://api.apimart.ai/v1/images/generations";

  try {
    // 关键修正：如果是查询任务，确保 URL 是 BASE_URL + "/" + taskId
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
    
    // 这行日志能让你在 Vercel 控制台看到任务是否真的完成
    console.log(`[Status: ${taskId ? 'POLLING' : 'START'}] Response:`, JSON.stringify(result));

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: "服务器通讯异常", details: e.message });
  }
}
