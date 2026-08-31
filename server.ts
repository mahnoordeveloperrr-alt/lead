import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { generateAuditWithAi } from './server/aiService.js';
import { crawlWebsite } from './server/crawler.js';
import { runDeterministicChecks } from './server/deterministicChecks.js';
import { parseHtml } from './server/parser.js';
import { normalizeAndValidateUrl } from './server/ssrfGuard.js';
import fs from 'fs';


async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const HOST = process.env.HOST || '::';

  // Middleware
  app.use(express.json({ limit: '2mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!(process.env.GEMINI_API_KEY || process.env.AI_API_KEY),
      model: process.env.AI_MODEL || 'gemini-3.7-flash',
    });
  });

  app.get('/api/checklist', (req, res) => {
    try {
      const checklistPath = path.resolve(process.cwd(), 'website-audit-checklist.md');
      if (fs.existsSync(checklistPath)) {
        const text = fs.readFileSync(checklistPath, 'utf-8');
        return res.json({ content: text });
      }
      return res.status(404).json({ error: 'Checklist file not found' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/analyze', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Please provide a valid website URL.' });
      }

      // Step 1: SSRF Guard & URL Normalization
      const validation = normalizeAndValidateUrl(url);
      if (!validation.valid || !validation.normalizedUrl) {
        return res.status(400).json({ error: validation.error || 'Invalid or forbidden URL.' });
      }

      const targetUrl = validation.normalizedUrl;

      // Step 2: Fetch & Crawl the website
      let crawlData;
      try {
        crawlData = await crawlWebsite(targetUrl);
      } catch (crawlErr: any) {
        console.error('Crawl error for', targetUrl, crawlErr.message);
        return res.status(422).json({
          error: `We couldn't reach or analyze "${targetUrl}". ${crawlErr.message || 'The website may block automated requests, require authentication, or be temporarily offline.'}`,
        });
      }

      // Step 3: Parse HTML and extract rich data
      const extractedData = parseHtml(crawlData, targetUrl);

      // Step 4: Run objective deterministic checks
      const deterministicChecks = runDeterministicChecks(extractedData);

      // Step 5: Multi-factor AI analysis
      let auditResult;
      try {
        auditResult = await generateAuditWithAi(extractedData, deterministicChecks);
      } catch (aiErr: any) {
        console.error('AI Generation error:', aiErr);
        let cleanMessage = aiErr.message || 'Unable to generate audit recommendations.';
        try {
          // If the message is a JSON string from the API client, parse the user-facing message
          if (cleanMessage.startsWith('{') && cleanMessage.includes('"message"')) {
            const parsed = JSON.parse(cleanMessage);
            cleanMessage = parsed.error?.message || parsed.message || cleanMessage;
          }
        } catch {
          // ignore
        }
        return res.status(500).json({
          error: `AI analysis service notice: ${cleanMessage}`,
        });
      }

      return res.json({
        success: true,
        data: auditResult,
      });
    } catch (error: any) {
      console.error('Unhandled analysis error:', error);
      return res.status(500).json({
        error: error.message || 'An unexpected error occurred while analyzing the website.',
      });
    }
  });

  // Setup Vite / Static handling
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`AI Website Auditor Server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
