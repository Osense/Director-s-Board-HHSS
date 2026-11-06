const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const file = fs.readdirSync(__dirname).find(name => name.endsWith('.html') && name.includes('ver1.1'));
if (!file) throw new Error('Review HTML was not found.');
const port = 8765;
const url = `http://127.0.0.1:${port}/`;
function openBrowser() {
  spawn('cmd.exe', ['/c', 'start', '', url], { windowsHide: true, stdio: 'ignore' }).unref();
}
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('hhss-review-v3');
  }
  if (req.url !== '/' && req.url !== '/index.html') {
    res.writeHead(404); return res.end('Not found');
  }
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(path.join(__dirname, file)).pipe(res);
});
server.on('error', err => {
  if (err.code !== 'EADDRINUSE') throw err;
  http.get(url + 'health', res => {
    let data = '';
    res.on('data', part => data += part);
    res.on('end', () => {
      if (data === 'hhss-review-v3') openBrowser();
      else { console.error('Port 8765 is in use by another application.'); process.exitCode = 1; }
    });
  }).on('error', error => { console.error(error.message); process.exitCode = 1; });
});
server.listen(port, '127.0.0.1', () => {
  console.log(`HHSS review: ${url}`);
  console.log('Keep this window open while reviewing. Close it to stop the server.');
  if (!process.argv.includes('--no-browser')) openBrowser();
});
