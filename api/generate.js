export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, pass, taskId, size } = req.body;
  if (pass !== "661500") return res.status(401).json({ error: '密码错误' });

  const API_KEY = process.env.OPENAI_API_KEY;

  try {
    let finalUrl = "";
    let options = { headers: { 'Authorization': `Bearer ${API_KEY}` } };

    if (taskId) {
      finalUrl = `https://api.apimart.ai/v1/tasks/${taskId}`;
      options.method = 'GET';
    } else {
      finalUrl = "https://api.apimart.ai/v1/images/generations";
      options.method = 'POST';
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify({
        model: "gpt-image-2",
        prompt: prompt,
        n: 1,
        size: size || "1024x1024" // 使用前端传来的比例
      });
    }

    const response = await fetch(finalUrl, options);
    const result = await response.json();
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
