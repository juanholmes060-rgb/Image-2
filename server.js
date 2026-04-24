const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const API_KEY = 'sk-4e8Jv0gxK3wzrsAue11bLijwWcPAF53VnDXrrRIjcwiO6vWL';
const API_HOST = 'api.apimart.io';
const API_PATH = '/v1/images/generations';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle API proxy
  if (req.method === 'POST' && url.pathname === '/api/generate') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
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
            res.writeHead(proxyRes.statusCode, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(responseData);
          });
        });

        proxyReq.on('error', (error) => {
          console.error('Proxy error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to connect to API' }));
        });

        proxyReq.write(body);
        proxyReq.end();

      } catch (error) {
        console.error('Request parsing error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // Serve static files
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = path.join(__dirname, filePath);

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, serve index.html
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
