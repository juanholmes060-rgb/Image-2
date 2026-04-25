const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY || 'sk-4e8Jv0gxK3wzrsAue11bLijwWcPAF53VnDXrrRIjcwiO6vWL';
const API_HOST = process.env.API_HOST || 'api.apimart.io';
const API_PATH = '/v1/images/generations';

// Enable verbose logging
const VERBOSE = true;

function log(level, message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (level === 'error') {
    console.error(logLine);
  } else {
    console.log(logLine);
  }
}

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
  
  log('info', `${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // Ping endpoint for testing
  if (url.pathname === '/api/ping' && req.method === 'GET') {
    log('info', 'Ping received!');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      message: 'Server is running',
      timestamp: new Date().toISOString()
    }));
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
        log('info', '=== Incoming Request ===');
        log('info', `Body: ${body}`);
        
        const parsedBody = JSON.parse(body);
        log('info', `Parsed prompt: ${parsedBody.prompt}`);
        
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

        log('info', `=== Proxying to ${API_HOST}${API_PATH} ===`);

        const proxyReq = https.request(options, (proxyRes) => {
          let responseData = '';
          
          proxyRes.on('data', (chunk) => {
            responseData += chunk;
          });

          proxyRes.on('end', () => {
            log('info', `=== API Response: ${proxyRes.statusCode} ===`);
            log('info', `Body: ${responseData.substring(0, 500)}`);
            
            // Add CORS headers to response
            res.writeHead(proxyRes.statusCode, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(responseData);
          });
        });

        proxyReq.on('error', (error) => {
          log('error', `Proxy connection error: ${error.message}`);
          log('error', `Error code: ${error.code}`);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'Failed to connect to API', 
            details: error.message,
            code: error.code
          }));
        });

        proxyReq.on('timeout', () => {
          log('error', 'Proxy request timeout');
          proxyReq.destroy();
          res.writeHead(504, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'API request timeout' }));
        });

        proxyReq.write(body);
        proxyReq.end();

      } catch (error) {
        log('error', `Request parsing error: ${error.message}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request: ' + error.message }));
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
  log('info', `Server running on port ${PORT}`);
  log('info', `API Key: ${API_KEY.substring(0, 10)}...`);
  log('info', `API Host: ${API_HOST}`);
  log('info', `API Path: ${API_PATH}`);
});

module.exports = server;
