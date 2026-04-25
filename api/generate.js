export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, pass, taskId } = req.body;
  if (pass !== "661500") return res.status(401).json({ error: '密码错误' });

  const API_KEY = process.env.OPENAI_API_KEY;

  try {
    let finalUrl = "";
    let options = {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    };

    if (taskId) {
      // 强制使用任务查询专用域名和路径
      finalUrl = `https://api.apimart.ai/v1/tasks/${taskId}`;
      options.method = 'GET';
    } else {
      // 仅在创建时使用 generations 路径
      finalUrl = "https://api.apimart.ai/v1/images/generations";
      options.method = 'POST';
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify({
        model: "gpt-image-2",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      });
    }

    // 这一行会在 Vercel Logs 输出，请务必观察它是否去掉了 images/generations
    console.log(`[REAL_REQUEST_URL]: ${finalUrl}`);

    const response = await fetch(finalUrl, options);
    const result = await response.json();
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
