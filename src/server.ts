import express from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import https from 'https';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config({ path: './api.env' });
console.log(process.env.ANTHROPIC_API_KEY)

const app = express();
const _PORT = process.env.PORT || 3000; // Reserved for optional HTTP redirect
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

// SSL certificate paths
const CERT_DIR = '/etc/letsencrypt/live/review.symbolclick.com';
let SSL_OPTIONS: { key: string; cert: string };

try {
  SSL_OPTIONS = {
    key: readFileSync(join(CERT_DIR, 'privkey.pem'), 'utf8'),
    cert: readFileSync(join(CERT_DIR, 'fullchain.pem'), 'utf8'),
  };
} catch (error) {
  console.error('Error reading SSL certificates:', error);
  process.exit(1);
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Read the prompt file and concatenate with current date
function getPrompt(): string {
  try {
    const promptPath = join(__dirname, '..', 'prompt.txt');
    const prompt = readFileSync(promptPath, 'utf-8').trim();
    const currentDate = new Date().toLocaleDateString();
    return `${prompt}\n\nCurrent date: ${currentDate}`;
  } catch (error) {
    console.error('Error reading prompt file:', error);
    return `Generate a message about today. Current date: ${new Date().toLocaleDateString()}`;
  }
}

// Serve the HTML page
app.get('/', async (req, res) => {
  console.log(`app.get('/')`)
  try {
    const fullPrompt = getPrompt();
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Claude Prompt App</title>
          <style>
            body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
            .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 5px; color: #c33; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>Configuration Error</h1>
            <p>Please set ANTHROPIC_API_KEY in a .env file.</p>
          </div>
        </body>
        </html>
      `);
    }


    // Call Claude API with JSON output format
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: fullPrompt
      }]
    });

    const jsonResponse = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '{"review": "No response generated."}';
    
    
    // Send HTML response
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Claude Generated Content</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
            margin-top: 0;
          }
          .content {
            line-height: 1.6;
            color: #555;
            font-size: 16px;
            white-space: pre-wrap;
            background: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .date {
            color: #888;
            font-size: 14px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Generated Content</h1>
          <div class="date">Generated on: ${new Date().toLocaleString()}</div>
          <div class="content">${jsonResponse}</div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Error</title>
        <style>
          body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
          .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 5px; color: #c33; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>Error</h1>
          <p>Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </body>
      </html>
    `);
  }
});

// Create HTTPS server
const httpsServer = https.createServer(SSL_OPTIONS, app);

httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS server running on https://localhost:${HTTPS_PORT}`);
});

// Optional: Redirect HTTP to HTTPS (uncomment if needed)
// app.listen(PORT, () => {
//   console.log(`HTTP server running on http://localhost:${PORT} (redirecting to HTTPS)`);
// });
