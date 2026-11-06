import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const port = process.argv[2] || process.env.PORT || '10000';

// Find cloudflared executable
let cloudflaredBin = 'cloudflared';
const possiblePaths = [
  'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe',
  'C:\\Program Files\\cloudflared\\cloudflared.exe'
];

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    cloudflaredBin = p;
    break;
  }
}

console.log(`\n\x1b[36m=====================================================\x1b[0m`);
console.log(`\x1b[1m\x1b[32m🚀 Starting Cloudflare Tunnel for: http://localhost:${port}\x1b[0m`);
console.log(`\x1b[36m=====================================================\x1b[0m\n`);

const child = spawn(cloudflaredBin, ['tunnel', '--url', `http://localhost:${port}`], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let urlFound = false;

function processOutput(data) {
  const text = data.toString();
  const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match && !urlFound) {
    urlFound = true;
    console.log(`\x1b[1m\x1b[42m\x1b[30m PUBLIC LIVE URL CREATED: \x1b[0m`);
    console.log(`\x1b[1m\x1b[33m👉 ${match[0]} 👈\x1b[0m\n`);
    console.log(`\x1b[90mShare this URL with anyone to access your local website.\x1b[0m`);
    console.log(`\x1b[90mPress Ctrl+C to stop the tunnel.\x1b[0m\n`);
  }
  // Print errors or connection notices if any
  if (text.includes('ERR') || text.includes('failed')) {
    process.stderr.write(text);
  }
}

child.stdout.on('data', processOutput);
child.stderr.on('data', processOutput);

child.on('error', (err) => {
  console.error(`\x1b[31m[ERROR] Failed to start cloudflared:\x1b[0m`, err.message);
  console.log(`\x1b[33mTry running:\x1b[0m winget install --id Cloudflare.cloudflared`);
});

child.on('close', (code) => {
  console.log(`\n\x1b[33m[TUNNEL STOPPED]\x1b[0m (Exit code: ${code})`);
});
