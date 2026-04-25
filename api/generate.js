export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, pass, taskId } = req.body;
  if (pass !== "661500") return res.status(401).json({ error: '密码错误' });

  const API_KEY = process.env.OPENAI_API_KEY;

  try {
    let fetchUrl, fetchOptions;

    if (taskId) {
      // --- 关键修改：去掉路径中的 images/generations ---
      fetchUrl = `https://api.apimart.ai/v1/tasks/${taskId}`;
      fetchOptions = {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      };
    } else {
      fetchUrl = "https://api.apimart.ai/v1/images/generations";
      fetchOptions = {
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
      };
    }

    const response = await fetch(fetchUrl, fetchOptions);
    const result = await response.json();
    
    // 把原始返回发给前端，方便调试
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: "服务器错误", details: e.message });
  }
}
