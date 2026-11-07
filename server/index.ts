import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { connectionRouter } from './routes/connection';
import { commandsRouter } from './routes/commands';
import { securityManager } from './security/authentication';
import { credentialsStore } from './storage/credentials';

const app = express();
const PORT = Number(process.env.PORT) || 8787;

// Enable CORS for LAN and browser access
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Bridge-PIN'],
  })
);

app.use(express.json());

// API Routes
app.use('/api', connectionRouter);
app.use('/api', commandsRouter);

// Serve frontend production build if available
const DIST_PATH = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(DIST_PATH)) {
  console.log(`[Bridge Server] Serving frontend build from ${DIST_PATH}`);
  app.use(express.static(DIST_PATH));

  // SPA fallback
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
} else {
  console.log('[Bridge Server] Frontend dist folder not found. Run "npm run build" to enable static serving.');
  app.get('/', (_req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>LG Remote Local Bridge</title></head>
        <body style="font-family: sans-serif; background: #0B0D12; color: #fff; padding: 2rem;">
          <h2>LG Remote Local Bridge is Running!</h2>
          <p>Frontend production assets are not built yet.</p>
          <p>Run <code>npm run build</code> in the project directory, then restart the bridge, or run <code>npm run dev</code> for development.</p>
          <p>Access PIN: <strong>${securityManager.getPin()}</strong></p>
        </body>
      </html>
    `);
  });
}

// Start server on 0.0.0.0 for LAN access
const server = app.listen(PORT, '0.0.0.0', () => {
  const localIps = securityManager.getLocalIpAddresses();
  const pin = securityManager.getPin();

  console.log('\n=============================================================');
  console.log('   LG WEBOS SMART TV REMOTE - LOCAL WI-FI BRIDGE');
  console.log('=============================================================');
  console.log(` Bridge Status:          RUNNING (Port ${PORT})`);
  console.log(` Laptop Local Access:    http://localhost:${PORT}`);
  
  if (localIps.length > 0) {
    console.log('\n Mobile (Android Chrome) Network Access:');
    localIps.forEach((ip) => {
      console.log(`   --> http://${ip}:${PORT}`);
    });
  } else {
    console.log('\n Warning: No non-internal network IP detected. Ensure Wi-Fi is connected.');
  }

  console.log(`\n Access PIN (Required on Mobile): ${pin}`);
  console.log(` Default TV IP:                   192.168.31.63`);
  
  const savedCred = credentialsStore.getCredentials('192.168.31.63');
  console.log(` Saved TV Pairing Status:         ${savedCred ? 'PAIRED (Client Key Saved)' : 'NOT PAIRED (Approval Prompt will trigger on TV)'}`);
  console.log('=============================================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Bridge Server] Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});
