const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const VPS_HOST = process.env.VPS_HOST || '66.116.251.191';
const VPS_USER = process.env.VPS_USER || 'root';
const VPS_PASS = process.env.VPS_PASS || '';
const REMOTE_DIR = '/www/wwwroot/ciggymart.shop';
const LOCAL_TAR = path.join(__dirname, '..', 'tradenova_deploy.tar.gz');

function runSSHCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶ [REMOTE] ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code) => {
        if (code !== 0 && code !== null) {
          console.warn(`[WARN] Exited with code: ${code}`);
        }
        resolve({ code, stdout, stderr });
      });
      stream.on('data', data => {
        const s = data.toString();
        stdout += s;
        process.stdout.write(s);
      });
      stream.stderr.on('data', data => {
        const s = data.toString();
        stderr += s;
        process.stderr.write(s);
      });
    });
  });
}

function uploadFile(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    console.log(`\nUploading ${localPath} -> ${remotePath}...`);
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const readStream = fs.createReadStream(localPath);
      const writeStream = sftp.createWriteStream(remotePath);
      writeStream.on('close', () => {
        console.log(`✔ Upload completed: ${remotePath}`);
        resolve();
      });
      writeStream.on('error', reject);
      readStream.pipe(writeStream);
    });
  });
}

async function deploy() {
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect({
      host: VPS_HOST,
      port: 22,
      username: VPS_USER,
      password: VPS_PASS,
      readyTimeout: 15000
    });
  });

  console.log('✔ Connected to VPS via SSH');

  // Step 1: Ensure directory exists & clean old files
  console.log('--- Step 1: Cleaning destination directory ---');
  await runSSHCommand(conn, `mkdir -p ${REMOTE_DIR}`);
  await runSSHCommand(conn, `cd ${REMOTE_DIR} && rm -rf css js data services public node_modules server.js package.json ecosystem.config.js`);

  // Step 2: Upload tar.gz
  console.log('--- Step 2: Uploading tradenova_deploy.tar.gz ---');
  await uploadFile(conn, LOCAL_TAR, `${REMOTE_DIR}/tradenova_deploy.tar.gz`);

  // Step 3: Extract archive
  console.log('--- Step 3: Extracting tar.gz on VPS ---');
  await runSSHCommand(conn, `cd ${REMOTE_DIR} && tar -xzf tradenova_deploy.tar.gz && rm -f tradenova_deploy.tar.gz`);
  await runSSHCommand(conn, `ls -la ${REMOTE_DIR}`);

  // Step 4: Write .env on VPS
  console.log('--- Step 4: Configuring .env on VPS ---');
  const envContent = `PORT=3000\nDB_HOST=127.0.0.1\nDB_PORT=3306\nDB_USER=root\nDB_PASSWORD=f86ebff231e0d04f\nDB_NAME=tradenova_db\nMYSQL_HOST=127.0.0.1\nMYSQL_PORT=3306\nMYSQL_USER=root\nMYSQL_PASSWORD=f86ebff231e0d04f\nMYSQL_DATABASE=tradenova_db\n`;
  await runSSHCommand(conn, `cat << 'EOF' > ${REMOTE_DIR}/.env\n${envContent}EOF`);

  // Step 5: Install dependencies
  console.log('--- Step 5: Installing Node production dependencies ---');
  await runSSHCommand(conn, `cd ${REMOTE_DIR} && npm install --omit=dev`);

  // Step 6: Start with PM2
  console.log('--- Step 6: Starting TradeNova with PM2 ---');
  await runSSHCommand(conn, `cd ${REMOTE_DIR} && (pm2 delete tradenova-sn 2>/dev/null || true) && pm2 start ecosystem.config.js`);
  await runSSHCommand(conn, `pm2 save`);
  await runSSHCommand(conn, `sleep 3 && pm2 list`);
  await runSSHCommand(conn, `pm2 logs tradenova-sn --lines 30 --nostream`);

  // Step 7: Check local port 3000
  console.log('--- Step 7: Testing local port 3000 ---');
  await runSSHCommand(conn, `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/api/branding`);

  // Step 8: Configure Nginx Reverse Proxy for ciggymart.shop
  console.log('--- Step 8: Configuring Nginx Reverse Proxy for ciggymart.shop ---');
  const nginxProxySnippet = `
    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 3600s;
        proxy_read_timeout 3600s;
    }
`;

  await runSSHCommand(conn, `mkdir -p /www/server/panel/vhost/nginx/extension/ciggymart.shop`);
  await runSSHCommand(conn, `cat << 'EOF' > /www/server/panel/vhost/nginx/extension/ciggymart.shop/tradenova_proxy.conf\n${nginxProxySnippet}\nEOF`);

  // Step 9: Test and reload Nginx
  console.log('--- Step 9: Testing and Reloading Nginx ---');
  await runSSHCommand(conn, `nginx -t && nginx -s reload`);

  // Step 10: Verify public HTTP & HTTPS responses
  console.log('--- Step 10: Verifying public HTTP and HTTPS endpoints ---');
  await runSSHCommand(conn, `curl -k -I https://127.0.0.1/api/branding -H "Host: ciggymart.shop"`);
  await runSSHCommand(conn, `curl -I http://127.0.0.1/api/branding -H "Host: ciggymart.shop"`);

  console.log('\n🎉 DEPLOYMENT TO ciggymart.shop COMPLETED SUCCESSFULLY!');
  conn.end();
}

deploy().catch(err => {
  console.error('Deployment Failed:', err);
  process.exit(1);
});

