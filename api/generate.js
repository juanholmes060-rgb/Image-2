const https = require('https');

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(404).json({ error: 'Not found' });
  }

  const API_KEY = process.env.API_KEY || 'sk-4e8Jv0gxK3wzrsAue11bLijwWcPAF53VnDXrrRIjcwiO6vWL';
  const API_HOST = 'api.apimart.io';
  const API_PATH = '/v1/images/generations';

  // Parse request body
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      console.log('=== API Request ===');
      console.log('Body:', body);

      const options = {
        hostname: API_HOST,
        port: 443,
        path: API_PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      };

      const proxyReq = https.request(options, (proxyRes) => {
        let responseData = '';
        
        proxyRes.on('data', (chunk) => {
          responseData += chunk;
        });

        proxyRes.on('end', () => {
          console.log('=== API Response ===');
          console.log('Status:', proxyRes.statusCode);
          console.log('Body:', responseData.substring(0, 500));
          
          res.status(proxyRes.statusCode).json(JSON.parse(responseData));
        });
      });

      proxyReq.on('error', (error) => {
        console.error('Proxy error:', error);
        res.status(500).json({ 
          error: 'Failed to connect to API', 
          details: error.message 
        });
      });

      proxyReq.write(body);
      proxyReq.end();

    } catch (error) {
      console.error('Request error:', error);
      res.status(400).json({ error: 'Invalid request: ' + error.message });
    }
  });
};
