export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { prompt, pass, taskId } = req.body;
  if (pass !== "661500") return res.status(401).json({ error: '密码错误' });

  const API_KEY = process.env.OPENAI_API_KEY;
  
  // 基础地址
  const BASE_URL = "https://api.apimart.ai/v1/images/generations";

  try {
    let url = BASE_URL;
    let options = {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    if (taskId) {
      // --- 关键修正点：查询任务的专用路径 ---
      url = `https://api.apimart.ai/v1/tasks/${taskId}`; 
      options.method = 'GET';
    } else {
      url = BASE_URL;
      options.method = 'POST';
      options.body = JSON.stringify({
        model: "gpt-image-2",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      });
    }

    console.log(`Requesting URL: ${url}`); // 调试日志

    const response = await fetch(url, options);
    const result = await response.json();
    
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: "接口连接失败", details: e.message });
  }
}
