const REPO = 'JustEnoughFakepixel/JustEnoughFakepixel';
const FEATURES_API = `https://raw.githubusercontent.com/${REPO}/main/FEATURES.md`;
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases/latest`;

const CREDITS = [
  { name: 'Hamlook(@h4mlock)', role: 'Author', url: 'https://github.com/hamlook' },
  { name: 'Internet Protocol(@.ipv6)', role: 'Contributor & maintainer', url: 'https://github.com/protocol-8' }
];

function mdToHtml(text) {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .trim();
}

function parseFeatures(md) {
  const lines = md.split('\n');
  const sections = {};
  let current = null;
  let inCodeBlock = false;

  for (let line of lines) {
    if (line.trim().startsWith('```')) { inCodeBlock = !inCodeBlock; continue; }
    if (inCodeBlock) continue;

    line = line.trim();
    if (!line) continue;

    const headingMatch = line.match(/^#{2,6}\s+(.*)/);
    if (headingMatch) {
      current = headingMatch[1].replace(/:$/, '').trim();
      sections[current] = [];
      continue;
    }

    if (!current) continue;

    const listMatch = line.match(/^[-*+]\s+(.*)/);
    const content = listMatch ? listMatch[1] : line;

    const splitMatch = content.match(/^(.+?)\s*[—–-]{1,2}\s*(.+)$/);
    if (splitMatch) {
      sections[current].push({
        title: mdToHtml(splitMatch[1].trim()),
        desc: mdToHtml(splitMatch[2].trim())
      });
    } else {
      sections[current].push({ title: mdToHtml(content), desc: null });
    }
  }

  return sections;
}

function renderFeatures(sections) {
  const grid = document.getElementById('features-grid');
  grid.innerHTML = '';

  for (const [name, items] of Object.entries(sections)) {
    if (!items.length) continue;

    const card = document.createElement('div');
    card.className = 'feature-card';

    const words = name.split(' ');
    const last = words.pop();
    const title = words.length
      ? `${words.join(' ')} <span>${last}</span>`
      : `<span>${last}</span>`;

    const listItems = items.map(item => `
      <li class="feature-item${item.desc ? ' has-desc' : ''}">
        <div class="feature-item-title">${item.title}</div>
        ${item.desc ? `<div class="feature-item-desc">${item.desc}</div>` : ''}
      </li>
    `).join('');

    card.innerHTML = `
      <div class="feature-card-label">${title}</div>
      <div class="feature-list-wrap">
        <ul class="feature-list">${listItems}</ul>
        <div class="feature-fade"></div>
      </div>
    `;

    grid.appendChild(card);

    const list = card.querySelector('.feature-list');
    const fade = card.querySelector('.feature-fade');

    const checkFade = () => {
      const atBottom = list.scrollHeight - list.scrollTop <= list.clientHeight + 2;
      fade.style.opacity = atBottom ? '0' : '1';
    };

    // run after paint so scrollHeight is accurate
    requestAnimationFrame(() => {
      if (list.scrollHeight <= list.clientHeight) {
        fade.style.opacity = '0';
      } else {
        fade.style.opacity = '1';
        list.addEventListener('scroll', checkFade);
      }
    });
  }
}

function renderCredits() {
  const grid = document.getElementById('credits-grid');
  grid.innerHTML = CREDITS.map(p => `
    <div class="credit-row">
      <div>
        <div class="credit-name">${p.name}</div>
        <div class="credit-role">${p.role}</div>
      </div>
      <a href="${p.url}" target="_blank">GitHub ↗</a>
    </div>
  `).join('');
}

async function loadFeatures() {
  try {
    const res = await fetch(FEATURES_API);
    if (!res.ok) throw new Error();
    const text = await res.text();
    const sections = parseFeatures(text);
    renderFeatures(sections);
  } catch (_) {
    document.getElementById('features-grid').innerHTML = `
      <div class="feature-card" style="column-span:all;color:var(--muted);font-size:12px;">
        Could not load features — view them on
        <a href="https://github.com/${REPO}" style="color:var(--text);">GitHub</a>.
      </div>
    `;
  }
}

async function loadLatestVersion() {
  try {
    const res = await fetch(RELEASES_API);
    if (!res.ok) return;
    const data = await res.json();
    if (data.tag_name) {
      document.getElementById('footer-version').textContent =
        `JustEnoughFakepixel ${data.tag_name} — Forge 1.8.9`;
    }
  } catch (_) {}
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

loadFeatures();
renderCredits();
loadLatestVersion();