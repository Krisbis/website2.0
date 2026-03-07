#!/usr/bin/env node
/**
 * generate.js
 *
 * Reads all markdown writeups from projects/writeups/,
 * generates HTML writeup pages from the template,
 * and rebuilds the card section in projects/projects.html.
 *
 * Usage:  node generate.js
 *         npm run generate
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// Sanitise rendered HTML – strip <script>, event handlers, etc.
function sanitiseHtml(html) {
  // Remove <script> blocks
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove event handler attributes (onerror, onclick, onload, etc.)
  html = html.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  // Remove javascript: URIs in href/src/action
  html = html.replace(/(href|src|action)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""');
  return html;
}

// ── paths ──────────────────────────────────────────────────────
const ROOT         = __dirname;
const WRITEUPS_DIR = path.join(ROOT, 'projects', 'writeups');
const TEMPLATE     = path.join(ROOT, 'templates', 'writeup-template.html');
const PROJECTS_HTML= path.join(ROOT, 'projects', 'projects.html');
const OUTPUT_DIR   = path.join(ROOT, 'projects');

// Blog paths
const BLOG_POSTS_DIR  = path.join(ROOT, 'blog', 'posts');
const BLOG_TEMPLATE   = path.join(ROOT, 'templates', 'blog-template.html');
const BLOG_INDEX_HTML = path.join(ROOT, 'blog', 'index.html');
const BLOG_OUTPUT_DIR = path.join(ROOT, 'blog');

// ── helpers ────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDateDisplay(isoDate) {
  // "2026-02-21" → "21/02/2026"
  var parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function difficultyClass(diff) {
  var d = diff.toLowerCase();
  if (d === 'intermediate') return 'intermediate';
  return d; // easy, medium, hard, insane
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function writeFileIfChanged(filePath, content) {
  if (fs.existsSync(filePath)) {
    var existing = fs.readFileSync(filePath, 'utf8');
    if (existing === content) {
      return false;
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

// ── read all writeup markdown files ────────────────────────────

function getWriteups() {
  if (!fs.existsSync(WRITEUPS_DIR)) {
    console.log('No writeups directory found at', WRITEUPS_DIR);
    return [];
  }

  var files = fs.readdirSync(WRITEUPS_DIR).filter(function (f) {
    return f.endsWith('.md');
  });

  return files.map(function (file) {
    var raw = fs.readFileSync(path.join(WRITEUPS_DIR, file), 'utf8');
    var parsed = matter(raw);
    var fm = parsed.data;

    var dateStr = fm.date instanceof Date
      ? fm.date.toISOString().slice(0, 10)
      : String(fm.date || '').slice(0, 10);

    var tags = Array.isArray(fm.tags) ? fm.tags : [];

    return {
      slug: slugify(fm.title || path.basename(file, '.md')),
      title: fm.title || path.basename(file, '.md'),
      difficulty: fm.difficulty || 'Easy',
      environment: fm.environment || '',
      tags: tags.map(function (t) { return t.trim().toLowerCase(); }),
      tagsDisplay: tags.map(function (t) { return t.trim(); }),
      image: fm.image || '',
      imageAlt: fm.image_alt || 'Card art',
      date: dateStr,
      dateDisplay: formatDateDisplay(dateStr),
      body: parsed.content
    };
  });
}

// ── generate individual writeup HTML pages ─────────────────────

function generateWriteupPages(writeups) {
  var template = fs.readFileSync(TEMPLATE, 'utf8');
  var generatedCount = 0;

  writeups.forEach(function (w) {
    var html = template;
    var renderedBody = sanitiseHtml(marked.parse(w.body));
    var tagsHtml = w.tagsDisplay.map(function (t) {
      return '<span class="writeup-tag">' + escapeHtml(t) + '</span>';
    }).join('\n        ');

    html = html.replace(/\{\{TITLE\}\}/g, escapeHtml(w.title));
    html = html.replace(/\{\{DIFFICULTY\}\}/g, escapeHtml(w.difficulty));
    html = html.replace(/\{\{DIFFICULTY_CLASS\}\}/g, difficultyClass(w.difficulty));
    html = html.replace(/\{\{ENVIRONMENT\}\}/g, escapeHtml(w.environment));
    html = html.replace(/\{\{DATE\}\}/g, w.dateDisplay);
    html = html.replace(/\{\{TAGS\}\}/g, tagsHtml);
    html = html.replace(/\{\{CONTENT\}\}/g, renderedBody);

    var outPath = path.join(OUTPUT_DIR, w.slug + '.html');
    var changed = writeFileIfChanged(outPath, html);
    if (changed) {
      generatedCount++;
      console.log('  ✓ Generated', outPath);
    } else {
      console.log('  ↺ Up-to-date', outPath);
    }
  });

  return generatedCount;
}

// ── rebuild card section in projects.html ──────────────────────

function buildCardHtml(w) {
  var arrowSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3"><path d="M504-480 348-636q-11-11-11-28t11-28q11-11 28-11t28 11l184 184q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L404-268q-11 11-28 11t-28-11q-11-11-11-28t11-28l156-156Z"/></svg>';

  return '      <a href="' + w.slug + '.html" class="previewCard"\n' +
         '         data-title="' + w.slug + '"\n' +
         '         data-difficulty="' + difficultyClass(w.difficulty) + '"\n' +
         '         data-tags="' + w.tags.map(escapeHtml).join(',') + '"\n' +
         '         data-date="' + w.date + '">\n' +
         '        <img src="' + escapeHtml(w.image) + '" class="backdrop" alt="' + escapeHtml(w.imageAlt) + '" />\n' +
         '        <div class="card-date">' + w.dateDisplay + '</div>\n' +
         '        <div class="content">\n' +
         '          <div class="category">' + escapeHtml(w.difficulty) + '</div>\n' +
         '          <div class="title">' + escapeHtml(w.title) + '</div>\n' +
         '          <div class="description">\n' +
         '            <p>' + escapeHtml(w.environment) + '</p>\n' +
         '            <span>\n' +
         '              ' + arrowSvg + '\n' +
         '            </span>\n' +
         '          </div>\n' +
         '        </div>\n' +
         '      </a>';
}

function updateProjectsHtml(writeups) {
  var html = fs.readFileSync(PROJECTS_HTML, 'utf8');

  // Sort by date descending (newest first)
  var sorted = writeups.slice().sort(function (a, b) {
    return a.date > b.date ? -1 : a.date < b.date ? 1 : 0;
  });

  var cardsHtml = sorted.map(buildCardHtml).join('\n\n');

  // Replace everything between the cards markers
  var startMarker = '<!-- CARDS-START -->';
  var endMarker   = '<!-- CARDS-END -->';

  if (html.indexOf(startMarker) === -1) {
    // First run — inject markers around existing cards
    var articleOpen = '<article class="cards mt-4" id="projectCards">';
    var articleClose = '</article>';
    var startIdx = html.indexOf(articleOpen);
    var endIdx = html.indexOf(articleClose, startIdx);

    if (startIdx === -1 || endIdx === -1) {
      console.error('ERROR: Could not find <article> section in projects.html');
      process.exit(1);
    }

    var before = html.slice(0, startIdx + articleOpen.length);
    var after  = html.slice(endIdx);

    html = before + '\n' + startMarker + '\n' + cardsHtml + '\n    ' + endMarker + '\n    ' + after;
  } else {
    // Subsequent runs — replace between markers
    var si = html.indexOf(startMarker);
    var ei = html.indexOf(endMarker);
    html = html.slice(0, si + startMarker.length) + '\n' + cardsHtml + '\n    ' + html.slice(ei);
  }

  var changed = writeFileIfChanged(PROJECTS_HTML, html);
  if (changed) {
    console.log('  ✓ Updated', PROJECTS_HTML);
  } else {
    console.log('  ↺ Up-to-date', PROJECTS_HTML);
  }

  return changed;
}

// ── main ───────────────────────────────────────────────────────

// ── read all blog post markdown files ──────────────────────────

function getBlogPosts() {
  if (!fs.existsSync(BLOG_POSTS_DIR)) {
    console.log('No blog posts directory found at', BLOG_POSTS_DIR);
    return [];
  }

  var files = fs.readdirSync(BLOG_POSTS_DIR).filter(function (f) {
    return f.endsWith('.md');
  });

  return files.map(function (file) {
    var raw = fs.readFileSync(path.join(BLOG_POSTS_DIR, file), 'utf8');
    var parsed = matter(raw);
    var fm = parsed.data;

    var dateStr = fm.date instanceof Date
      ? fm.date.toISOString().slice(0, 10)
      : String(fm.date || '').slice(0, 10);

    var tags = Array.isArray(fm.tags) ? fm.tags : [];

    return {
      slug: slugify(fm.title || path.basename(file, '.md')),
      title: fm.title || path.basename(file, '.md'),
      category: fm.category || 'Post',
      environment: fm.environment || '',
      excerpt: fm.excerpt || '',
      tags: tags.map(function (t) { return t.trim().toLowerCase(); }),
      tagsDisplay: tags.map(function (t) { return t.trim(); }),
      image: fm.image || '',
      imageAlt: fm.image_alt || 'Blog card art',
      date: dateStr,
      dateDisplay: formatDateDisplay(dateStr),
      body: parsed.content
    };
  });
}

// ── generate individual blog post HTML pages ───────────────────

function generateBlogPages(posts) {
  var template = fs.readFileSync(BLOG_TEMPLATE, 'utf8');
  var generatedCount = 0;

  posts.forEach(function (p) {
    var html = template;
    var renderedBody = sanitiseHtml(marked.parse(p.body));
    var tagsHtml = p.tagsDisplay.map(function (t) {
      return '<span class="writeup-tag">' + escapeHtml(t) + '</span>';
    }).join('\n        ');

    html = html.replace(/\{\{TITLE\}\}/g, escapeHtml(p.title));
    html = html.replace(/\{\{CATEGORY\}\}/g, escapeHtml(p.category));
    html = html.replace(/\{\{ENVIRONMENT\}\}/g, escapeHtml(p.environment));
    html = html.replace(/\{\{EXCERPT\}\}/g, escapeHtml(p.excerpt));
    html = html.replace(/\{\{DATE\}\}/g, p.dateDisplay);
    html = html.replace(/\{\{TAGS\}\}/g, tagsHtml);
    html = html.replace(/\{\{CONTENT\}\}/g, renderedBody);

    var outPath = path.join(BLOG_OUTPUT_DIR, p.slug + '.html');
    var changed = writeFileIfChanged(outPath, html);
    if (changed) {
      generatedCount++;
      console.log('  ✓ Generated', outPath);
    } else {
      console.log('  ↺ Up-to-date', outPath);
    }
  });

  return generatedCount;
}

// ── rebuild blog card section in blog/index.html ───────────────

function buildBlogCardHtml(p) {
  var arrowSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#e3e3e3"><path d="M504-480 348-636q-11-11-11-28t11-28q11-11 28-11t28 11l184 184q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L404-268q-11 11-28 11t-28-11q-11-11-11-28t11-28l156-156Z"/></svg>';

  return '        <a href="' + p.slug + '.html" class="blogCard">\n' +
         '          <img src="' + escapeHtml(p.image) + '" class="backdrop" alt="' + escapeHtml(p.imageAlt) + '" />\n' +
         '          <div class="content">\n' +
         '            <div class="blog-topic">' + escapeHtml(p.category) + '</div>\n' +
         '            <div class="blog-title">' + escapeHtml(p.title) + '</div>\n' +
         '            <div class="blog-excerpt">' + escapeHtml(p.excerpt) + '</div>\n' +
         '            <div class="blog-footer">\n' +
         '              <span class="blog-date">' + p.dateDisplay + '</span>\n' +
         '              <span class="blog-arrow">\n' +
         '                ' + arrowSvg + '\n' +
         '              </span>\n' +
         '            </div>\n' +
         '          </div>\n' +
         '        </a>';
}

function updateBlogIndexHtml(posts) {
  var html = fs.readFileSync(BLOG_INDEX_HTML, 'utf8');

  // Sort by date descending (newest first)
  var sorted = posts.slice().sort(function (a, b) {
    return a.date > b.date ? -1 : a.date < b.date ? 1 : 0;
  });

  var cardsHtml = sorted.map(buildBlogCardHtml).join('\n\n');

  var startMarker = '<!-- BLOG-CARDS-START -->';
  var endMarker   = '<!-- BLOG-CARDS-END -->';

  var si = html.indexOf(startMarker);
  var ei = html.indexOf(endMarker);

  if (si === -1 || ei === -1) {
    console.error('ERROR: Could not find BLOG-CARDS markers in blog/index.html');
    process.exit(1);
  }

  html = html.slice(0, si + startMarker.length) + '\n' + cardsHtml + '\n' + html.slice(ei);

  var changed = writeFileIfChanged(BLOG_INDEX_HTML, html);
  if (changed) {
    console.log('  ✓ Updated', BLOG_INDEX_HTML);
  } else {
    console.log('  ↺ Up-to-date', BLOG_INDEX_HTML);
  }

  return changed;
}

// ── main ───────────────────────────────────────────────────────

console.log('Generating writeups...\n');

var writeups = getWriteups();
var generatedWriteupPages = 0;
var projectsIndexUpdated = false;

if (writeups.length === 0) {
  console.log('No writeup markdown files found in', WRITEUPS_DIR);
  console.log('Skipping writeup generation.');
} else {
  console.log('Found ' + writeups.length + ' writeup(s):\n');
  generatedWriteupPages = generateWriteupPages(writeups);
  console.log('');
  projectsIndexUpdated = updateProjectsHtml(writeups);
}

console.log('\n--- Blog ---\n');
console.log('Generating blog posts...\n');

var blogPosts = getBlogPosts();
var generatedBlogPages = 0;
var blogIndexUpdated = false;

if (blogPosts.length === 0) {
  console.log('No blog post markdown files found in', BLOG_POSTS_DIR);
  console.log('Skipping blog generation.');
} else {
  console.log('Found ' + blogPosts.length + ' blog post(s):\n');
  generatedBlogPages = generateBlogPages(blogPosts);
  console.log('');
  blogIndexUpdated = updateBlogIndexHtml(blogPosts);
}

console.log('\nDone! Processed ' + writeups.length + ' writeup(s), ' + blogPosts.length + ' blog post(s).');
console.log('Changed files: ' + generatedWriteupPages + ' writeup page(s), ' + generatedBlogPages + ' blog page(s), ' + (projectsIndexUpdated ? 1 : 0) + ' projects index, ' + (blogIndexUpdated ? 1 : 0) + ' blog index.');
