import fs from 'fs';
import https from 'https';
import path from 'path';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function run() {
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }
  await downloadFile('https://img.icons8.com/color/192/leaf.png', 'public/pwa-192x192.png');
  await downloadFile('https://img.icons8.com/color/512/leaf.png', 'public/pwa-512x512.png');
  console.log('Downloaded PWA icons');
}

run();
