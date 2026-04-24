import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, accessCode: code })
    });
    const data = await res.json();
    if (data.data) setImage(data.data[0].url);
    else alert(data.error || '出错了');
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1>公司视觉工作站 (GPT-Image-2)</h1>
      <input type="password" placeholder="输入访问密码" value={code} onChange={e => setCode(e.target.value)} style={{width:'100%', marginBottom:'10px', padding:'8px'}} />
      <textarea placeholder="描述你想要的画面..." value={prompt} onChange={e => setPrompt(e.target.value)} style={{width:'100%', height:'100px', padding:'8px'}} />
      <button onClick={generate} disabled={loading} style={{width:'100%', padding:'10px', background:'#0070f3', color:'#fff', border:'none', cursor:'pointer'}}>
        {loading ? 'AI 正在思考并构图...' : '开始生图'}
      </button>
      {image && <img src={image} style={{width:'100%', marginTop:'20px', borderRadius:'8px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} />}
    </div>
  );
}
