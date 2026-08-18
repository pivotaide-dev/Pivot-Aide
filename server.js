const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

const BOT_USER_AGENTS = [
  'linkedinbot', 'twitterbot', 'facebookexternalhit', 'facebot',
  'whatsapp', 'slackbot', 'telegrambot', 'googlebot', 'bingbot',
  'applebot', 'pinterestbot', 'rogerbot', 'embedly',
  'quora link preview', 'showyoubot', 'outbrain', 'vkshare',
  'w3c_validator', 'discordbot'
];

function isSocialBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJson(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '');
}

// Load blog dataset into memory
let blogsData = [];
try {
  const blogsDataFile = fs.readFileSync(path.join(ROOT_DIR, 'blogs-data.js'), 'utf8');
  const sandbox = { window: {} };
  new Function('window', blogsDataFile)(sandbox.window);
  blogsData = sandbox.window.PIVOT_BLOGS_DATA || [];
  console.log(`[Server] Loaded ${blogsData.length} blog posts for SSR.`);
} catch (err) {
  console.error('[Server] Could not pre-load blogs data:', err);
}

function getPostImage(post) {
  if (!post) return 'precision_accounting.png';
  if (post.featuredImage) return post.featuredImage;
  if (post.id) return `blog-images/blog-${post.id}.png`;
  return 'precision_accounting.png';
}

function renderSsrBlogPost(post, templateHtml) {
  const postId = post.id;
  const title = post.title;
  const excerpt = post.excerpt || '';
  const category = post.category || 'Accounting & Advisory';
  const author = post.author || 'Pivot Aide';
  const authorRole = post.authorRole || 'Lead CPA & Tax Director';
  const date = post.date || '2025';
  const readTime = post.readTime || '5 min read';
  const imageRelPath = getPostImage(post);
  const imageAbsoluteUrl = `https://www.pivotaide.com/${imageRelPath}`;
  const canonicalUrl = `https://www.pivotaide.com/blogs/blog-${postId}.html`;

  let html = templateHtml;

  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)} — Pivot Aide</title>`);
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(excerpt)}">`);
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');
  html = html.replace(/<!--\s*Open Graph[\s\S]*?<!--\s*Twitter Card[\s\S]*?<\/head>/i, '</head>');

  const ogTags = `    <link rel="canonical" href="${canonicalUrl}">
    <meta property="og:site_name" content="Pivot Aide">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(excerpt)}">
    <meta property="og:image" content="${imageAbsoluteUrl}">
    <meta property="og:image:secure_url" content="${imageAbsoluteUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="627">
    <meta property="og:image:alt" content="${escapeHtml(title)}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(excerpt)}">
    <meta name="twitter:image" content="${imageAbsoluteUrl}">
    <meta name="twitter:image:alt" content="${escapeHtml(title)}">`;

  html = html.replace('</head>', `${ogTags}\n</head>`);
  return html;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  if (pathname === '/') pathname = '/index.html';

  if (pathname === '/blog-details.html' || pathname === '/blog-details') {
    const idParam = parseInt(parsedUrl.query.id, 10);
    const slugParam = parsedUrl.query.slug;

    let matchedPost = null;
    if (idParam) matchedPost = blogsData.find(b => b.id === idParam);
    else if (slugParam) matchedPost = blogsData.find(b => b.slug === slugParam);

    if (matchedPost) {
      try {
        const templateHtml = fs.readFileSync(path.join(ROOT_DIR, 'blog-details.html'), 'utf8');
        const ssrHtml = renderSsrBlogPost(matchedPost, templateHtml);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
        res.end(ssrHtml);
        return;
      } catch (err) {
        console.error('[Server] Error rendering dynamic SSR:', err);
      }
    }
  }

  const blogPathMatch = pathname.match(/^\/blogs?\/([^/]+)$/);
  if (blogPathMatch) {
    const param = blogPathMatch[1].replace(/\.html$/, '');
    const numId = parseInt(param.replace(/^blog-/, ''), 10);
    let matchedPost = !isNaN(numId) ? blogsData.find(b => b.id === numId) : blogsData.find(b => b.slug === param);

    if (matchedPost) {
      const staticBlogFile = path.join(ROOT_DIR, 'blogs', `blog-${matchedPost.id}.html`);
      if (fs.existsSync(staticBlogFile)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=86400' });
        fs.createReadStream(staticBlogFile).pipe(res);
        return;
      }

      const templateHtml = fs.readFileSync(path.join(ROOT_DIR, 'blog-details.html'), 'utf8');
      const ssrHtml = renderSsrBlogPost(matchedPost, templateHtml);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(ssrHtml);
      return;
    }
  }

  const filePath = path.join(ROOT_DIR, pathname);
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 Not Found</h1><p><a href="/">Return to Home</a></p>');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400' });
    fs.createReadStream(filePath).pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[Server] Pivot Aide SSR server listening on http://localhost:${PORT}`);
  });
}

module.exports = { server, renderSsrBlogPost, isSocialBot };
