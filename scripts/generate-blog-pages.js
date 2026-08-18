const fs = require('fs');
const path = require('path');

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

const blogsDataFile = fs.readFileSync(path.join(__dirname, '../blogs-data.js'), 'utf8');
let blogsData = [];
try {
  const sandbox = { window: {} };
  const fn = new Function('window', blogsDataFile);
  fn(sandbox.window);
  blogsData = sandbox.window.PIVOT_BLOGS_DATA || [];
} catch (e) {
  console.error('Error parsing blogs-data.js:', e);
  process.exit(1);
}

console.log(`Loaded ${blogsData.length} blog posts from blogs-data.js`);

const templatePath = path.join(__dirname, '../blog-details.html');
const templateHtml = fs.readFileSync(templatePath, 'utf8');

const blogsDir = path.join(__dirname, '../blogs');
if (!fs.existsSync(blogsDir)) {
  fs.mkdirSync(blogsDir, { recursive: true });
}

function getPostImage(post) {
  if (!post) return 'precision_accounting.png';
  if (post.featuredImage) return post.featuredImage;
  if (post.id) return `blog-images/blog-${post.id}.png`;
  return 'precision_accounting.png';
}

function generatePostHtml(post) {
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

    <!-- Open Graph / Facebook / LinkedIn Meta Tags -->
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

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(excerpt)}">
    <meta name="twitter:image" content="${imageAbsoluteUrl}">
    <meta name="twitter:image:alt" content="${escapeHtml(title)}">

    <!-- Schema.org Article Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${canonicalUrl}"
      },
      "headline": "${escapeJson(title)}",
      "description": "${escapeJson(excerpt)}",
      "image": "${imageAbsoluteUrl}",
      "author": {
        "@type": "Organization",
        "name": "${escapeJson(author)}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Pivot Aide",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.pivotaide.com/logo_transparent.png"
        }
      },
      "datePublished": "${escapeJson(date)}"
    }
    </script>`;

  html = html.replace('</head>', `${ogTags}\n</head>`);

  html = html.replace(/<span\s+class="breadcrumb-current"\s+id="breadcrumbCurrent"[^>]*>.*?<\/span>/i, `<span class="breadcrumb-current" id="breadcrumbCurrent" style="color: var(--yellow); font-weight: 600;">${escapeHtml(title)}</span>`);
  html = html.replace(/<div\s+class="article-category-badge"\s+id="articleCategory"[^>]*>.*?<\/div>/i, `<div class="article-category-badge" id="articleCategory" style="display: inline-block; padding: 6px 14px; background: rgba(234, 228, 47, 0.15); color: var(--yellow); border-radius: 20px; font-weight: 700; font-size: 13px; text-transform: uppercase; margin-bottom: 16px; border: 1px solid rgba(234, 228, 47, 0.3);">${escapeHtml(category)}</div>`);
  html = html.replace(/<h1\s+class="article-title"\s+id="articleTitle"[^>]*>.*?<\/h1>/i, `<h1 class="article-title" id="articleTitle" style="font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 800; color: #FFFFFF; line-height: 1.2; margin-bottom: 20px; letter-spacing: -0.02em;">${escapeHtml(title)}</h1>`);
  html = html.replace(/<p\s+class="article-lead"\s+id="articleLead"[^>]*>.*?<\/p>/i, `<p class="article-lead" id="articleLead" style="font-size: 1.15rem; color: rgba(255, 255, 255, 0.82); line-height: 1.65; max-width: 860px; margin-bottom: 28px;">${escapeHtml(excerpt)}</p>`);
  
  const initial = author ? author.charAt(0) : 'P';
  html = html.replace(/<div\s+class="author-avatar-badge"\s+id="authorAvatar"[^>]*>.*?<\/div>/i, `<div class="author-avatar-badge" id="authorAvatar" style="width: 44px; height: 44px; border-radius: 50%; background: var(--yellow); color: #0b1c2b; font-weight: 800; font-size: 18px; display: flex; align-items: center; justify-content: center;">${initial}</div>`);
  html = html.replace(/<div\s+class="author-name"\s+id="authorName"[^>]*>.*?<\/div>/i, `<div class="author-name" id="authorName" style="font-weight: 700; color: #FFFFFF; font-size: 15px;">${escapeHtml(author)}</div>`);
  html = html.replace(/<div\s+class="author-role"\s+id="authorRole"[^>]*>.*?<\/div>/i, `<div class="author-role" id="authorRole" style="font-size: 12.5px; color: rgba(255, 255, 255, 0.65);">${escapeHtml(authorRole)}</div>`);
  html = html.replace(/<span\s+id="articleDate">.*?<\/span>/i, `<span id="articleDate">${escapeHtml(date)}</span>`);
  html = html.replace(/<span\s+id="articleReadTime">.*?<\/span>/i, `<span id="articleReadTime">${escapeHtml(readTime)}</span>`);

  html = html.replace(/<img[^>]*id="articleBanner"[^>]*>/i, `<img src="../${imageRelPath}" alt="${escapeHtml(title)}" id="articleBanner" style="width: 100%; height: auto; max-height: 750px; object-fit: contain; display: block; margin: 0 auto;">`);

  const articleContent = post.content || `<p>${escapeHtml(excerpt)}</p>`;
  html = html.replace(/id="articleBody"[^>]*>[\s\S]*?<\/div>\s*<!-- Social Share Bar -->/i, `id="articleBody" style="font-size: 1.05rem; line-height: 1.8; color: rgba(255, 255, 255, 0.88); max-width: 900px; margin-bottom: 60px;">\n${articleContent}\n        </div>\n        <!-- Social Share Bar -->`);

  html = html.replace(/href="styles\.css"/g, 'href="../styles.css"');
  html = html.replace(/href="blog\.css"/g, 'href="../blog.css"');
  html = html.replace(/src="logo_transparent\.png"/g, 'src="../logo_transparent.png"');
  html = html.replace(/href="logo_transparent\.png"/g, 'href="../logo_transparent.png"');
  html = html.replace(/href="favicon\.png"/g, 'href="../favicon.png"');
  html = html.replace(/href="favicon\.ico"/g, 'href="../favicon.ico"');
  html = html.replace(/src="blogs-data\.js"/g, 'src="../blogs-data.js"');
  html = html.replace(/src="main\.js"/g, 'src="../main.js"');
  html = html.replace(/src="blog\.js"/g, 'src="../blog.js"');

  const pages = [
    'index.html',
    'about.html',
    'accounting.html',
    'odoo-accounting.html',
    'quickbooks-migration.html',
    'odoo.html',
    'odoo-what-we-do.html',
    'odoo-integration-migration.html',
    'odoo-training-documentation.html',
    'funding.html',
    'blog.html',
    'contact.html',
    'access-program.html'
  ];

  pages.forEach(p => {
    const reg = new RegExp(`href="${p}"`, 'g');
    html = html.replace(reg, `href="../${p}"`);
  });

  return html;
}

let count = 0;
for (const post of blogsData) {
  const postHtml = generatePostHtml(post);
  
  const outPathId = path.join(blogsDir, `blog-${post.id}.html`);
  fs.writeFileSync(outPathId, postHtml, 'utf8');

  if (post.slug) {
    const outPathSlug = path.join(blogsDir, `${post.slug}.html`);
    fs.writeFileSync(outPathSlug, postHtml, 'utf8');
  }

  count++;
}

console.log(`Successfully generated ${count} static SSR blog pages in ./blogs/`);
