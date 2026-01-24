import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import apiProxy from './proxy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production' || existsSync(path.join(__dirname, '../dist'));

// JSONボディパーサーを設定
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic認証ミドルウェア
const basicAuthMiddleware = (req, res, next) => {
  // Basic認証が有効な場合のみ認証チェックを行う
  const username = process.env.BASIC_AUTH_USERNAME;
  const password = process.env.BASIC_AUTH_PASSWORD;

  // 環境変数が設定されていない場合は認証をスキップ
  if (!username || !password) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="mabl-cosme"');
    return res.status(401).send('Authentication required');
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [inputUsername, inputPassword] = credentials.split(':');

  if (inputUsername === username && inputPassword === password) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="mabl-cosme"');
  return res.status(401).send('Invalid credentials');
};

// リクエストログ
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

// API proxy routes
app.use('/api', apiProxy);

// Serve static files (本番環境またはビルド後)
if (isProduction) {
  const distPath = path.join(__dirname, '../dist');

  if (existsSync(distPath)) {
    // Basic認証を適用してから静的ファイルを提供
    app.use(basicAuthMiddleware);
    app.use(express.static(distPath));

    // SPAフォールバック
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });

    console.log(`Serving static files from: ${distPath}`);
  } else {
    console.error('Error: dist directory not found. Please run "npm run build" first.');
    process.exit(1);
  }
} else {
  // 開発環境では API のみ提供
  app.get('/', (req, res) => {
    res.json({
      message: 'API server running in development mode',
      note: 'Please use Vite dev server (npm run dev) for the frontend'
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Mode: ${isProduction ? 'production' : 'development'}`);
  console.log(`Basic Auth enabled: ${!!(process.env.BASIC_AUTH_USERNAME && process.env.BASIC_AUTH_PASSWORD)}`);
  console.log(`OpenAI API Key configured: ${!!process.env.OPENAI_API_KEY}`);
  if (!isProduction) {
    console.log('\n💡 Development mode: Run "npm run dev" in another terminal for the frontend\n');
  }
});
