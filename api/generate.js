export default async function handler(req, res) {
  const { prompt, pass, taskId } = req.body;

  // 1. 安全校验
  if (pass !== process.env.ACCESS_CODE) {
    return res.status(401).json({ error: '访问密码错误' });
  }

  const API_KEY = process.env.OPENAI_API_KEY;
  const BASE_URL = "https://api.apimart.ai/v1/images/generations";

  try {
    // 模式 A：如果带了 taskId，则去 API Mart 查询图片是否画好了
    if (taskId) {
      const checkRes = await fetch(`${BASE_URL}/${taskId}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` },
        // 关键：给查询请求设置短超时，防止它卡住 Vercel 进程
        signal: AbortSignal.timeout(9000) 
      });
      const checkData = await checkRes.json();
      return res.status(200).json(checkData);
    }

    // 模式 B：发起新的生图任务
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
      }),
      signal: AbortSignal.timeout(9000)
    });

    const result = await response.json();
    res.status(200).json(result);

  } catch (e) {
    // 捕获所有错误并返回给前端，避免前端因 502 崩溃
    res.status(500).json({ 
      error: "服务器繁忙或超时，请继续等待", 
      details: e.message 
    });
  }
}
