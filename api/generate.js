export default async function handler(req, res) {
  const { prompt, pass, task_id } = req.body;

  if (pass !== process.env.ACCESS_CODE) {
    return res.status(401).json({ error: '访问密码错误' });
  }

  const API_KEY = process.env.OPENAI_API_KEY;
  const BASE_URL = "https://api.apimart.ai/v1/images/generations";

  try {
    // 模式 A：如果传了 task_id，说明是在查询结果
    if (task_id) {
      const checkRes = await fetch(`${BASE_URL}/${task_id}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      const checkData = await checkRes.json();
      return res.status(200).json(checkData);
    }

    // 模式 B：如果没有 task_id，说明是新任务
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    const result = await response.json();
    
    // 把 API Mart 的原始返回直接丢给前端处理
    res.status(200).json(result);

  } catch (e) {
    res.status(500).json({ error: "服务器通讯异常", details: e.message });
  }
}
