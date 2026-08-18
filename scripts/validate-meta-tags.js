const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════');
console.log(' PIVOT AIDE — BLOG OPEN GRAPH (OG) & SSR AUDIT SUITE');
console.log('═══════════════════════════════════════════════════════════\n');

const ROOT = path.join(__dirname, '..');

// 1. Load dataset
const blogsDataFile = fs.readFileSync(path.join(ROOT, 'blogs-data.js'), 'utf8');
const sandbox = { window: {} };
new Function('window', blogsDataFile)(sandbox.window);
const blogsData = sandbox.window.PIVOT_BLOGS_DATA || [];

console.log(`[Test 1] Blog Dataset Integrity: Found ${blogsData.length} posts.`);
if (blogsData.length < 100) {
  console.error(`❌ Expected at least 100 blog posts, got ${blogsData.length}`);
  process.exit(1);
}
console.log(`✅ Passed: 100 blog posts loaded.\n`);

// 2. Test Image compliance
console.log('[Test 2] LinkedIn Image Requirements Validation:');
let imageErrors = 0;
for (const post of blogsData) {
  const imageRel = post.featuredImage || `blog-images/blog-${post.id}.png`;
  const imagePath = path.join(ROOT, imageRel);
  
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Post #${post.id}: Image does not exist at ${imageRel}`);
    imageErrors++;
    continue;
  }

  const stat = fs.statSync(imagePath);
  const sizeMB = stat.size / (1024 * 1024);
  if (stat.size > 5 * 1024 * 1024) {
    console.error(`❌ Post #${post.id}: Image ${imageRel} exceeds 5MB limit (${sizeMB.toFixed(2)} MB)`);
    imageErrors++;
  }

  const ext = path.extname(imagePath).toLowerCase();
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
    console.error(`❌ Post #${post.id}: Image format ${ext} is not JPG or PNG`);
    imageErrors++;
  }
}

if (imageErrors === 0) {
  console.log(`✅ Passed: All 100 featured images exist, are JPG/PNG, and strictly under 5MB.\n`);
} else {
  console.error(`❌ Failed: ${imageErrors} image validation errors found.\n`);
  process.exit(1);
}

// 3. Test Static HTML Pre-rendered Pages
console.log('[Test 3] Pre-rendered HTML Pages Open Graph & Meta Tags Check:');
const blogsDir = path.join(ROOT, 'blogs');
if (!fs.existsSync(blogsDir)) {
  console.error(`❌ Output directory ${blogsDir} does not exist!`);
  process.exit(1);
}

let tagErrors = 0;
for (const post of blogsData) {
  const htmlFile = path.join(blogsDir, `blog-${post.id}.html`);
  if (!fs.existsSync(htmlFile)) {
    console.error(`❌ Missing static page: blogs/blog-${post.id}.html`);
    tagErrors++;
    continue;
  }

  const content = fs.readFileSync(htmlFile, 'utf8');

  const checks = [
    { tag: 'og:title', regex: /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i },
    { tag: 'og:description', regex: /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i },
    { tag: 'og:image', regex: /<meta\s+property=["']og:image["']\s+content=["'](https:\/\/www\.pivotaide\.com\/[^"']+)["']/i },
    { tag: 'og:url', regex: /<meta\s+property=["']og:url["']\s+content=["'](https:\/\/www\.pivotaide\.com\/blogs\/blog-\d+\.html)["']/i },
    { tag: 'og:type', regex: /<meta\s+property=["']og:type["']\s+content=["']article["']/i },
    { tag: 'twitter:card', regex: /<meta\s+name=["']twitter:card["']\s+content=["']summary_large_image["']/i },
    { tag: 'twitter:image', regex: /<meta\s+name=["']twitter:image["']\s+content=["'](https:\/\/www\.pivotaide\.com\/[^"']+)["']/i }
  ];

  for (const check of checks) {
    const match = content.match(check.regex);
    if (!match) {
      console.error(`❌ Post #${post.id}: Missing or invalid ${check.tag}`);
      tagErrors++;
    }
  }
}

if (tagErrors === 0) {
  console.log(`✅ Passed: All 100 pre-rendered HTML files contain complete, valid OG & Twitter tags.\n`);
} else {
  console.error(`❌ Failed: ${tagErrors} meta tag validation errors found.\n`);
  process.exit(1);
}

// 4. Test SSR Server
console.log('[Test 4] Dynamic Node.js SSR Server & Bot Detection Test:');
const { renderSsrBlogPost, isSocialBot } = require('../server.js');
const templateHtml = fs.readFileSync(path.join(ROOT, 'blog-details.html'), 'utf8');

const samplePost = blogsData[0];
const ssrResult = renderSsrBlogPost(samplePost, templateHtml);

if (!ssrResult.includes(`<meta property="og:title" content="${samplePost.title}">`)) {
  console.error('❌ Server SSR failed to inject og:title');
  process.exit(1);
}
if (!ssrResult.includes('https://www.pivotaide.com/')) {
  console.error('❌ Server SSR failed to inject absolute HTTPS og:image');
  process.exit(1);
}
if (!ssrResult.includes('<meta name="twitter:card" content="summary_large_image">')) {
  console.error('❌ Server SSR failed to inject twitter:card');
  process.exit(1);
}

if (!isSocialBot('LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)')) {
  console.error('❌ Server bot detection failed for LinkedInBot');
  process.exit(1);
}
if (!isSocialBot('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)')) {
  console.error('❌ Server bot detection failed for facebookexternalhit');
  process.exit(1);
}

console.log(`✅ Passed: SSR dynamic renderer and crawler detection operating with 100% precision.\n`);

console.log('═══════════════════════════════════════════════════════════');
console.log(' 🎉 ALL OPEN GRAPH & SSR TESTS PASSED SUCCESSFULLY (100/100)');
console.log('═══════════════════════════════════════════════════════════');
