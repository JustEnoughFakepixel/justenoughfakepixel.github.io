const REPO = 'JustEnoughFakepixel/JustEnoughFakepixel';
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases/latest`;
const README_API = `https://api.github.com/repos/${REPO}/contents/README.md`;

async function loadPrivacy() {
  const container = document.getElementById('privacy-text');
  if (!container) return;

  try {
    const res = await fetch(README_API);
    if (!res.ok) throw new Error();
    const data = await res.json();

    // Properly decode base64 content as UTF-8
    const raw = atob(data.content.replace(/\n/g, ''));
    const bytes = new Uint8Array(raw.split('').map(c => c.charCodeAt(0)));
    const text = new TextDecoder('utf-8').decode(bytes);

    // Normalize line endings and extract IMPORTANT section
    const normalized = text.replace(/\r\n/g, '\n');
    const match = normalized.match(/^#+[^\n]*IMPORTANT[^\n]*\n([\s\S]*?)(?=^#)/m);
    if (!match) throw new Error('Section not found');

    const section = match[1].trim();

    // Convert markdown to basic HTML
    const html = section
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
      .replace(/\n{2,}/g, '<br><br>')
      .replace(/\n/g, ' ');

    container.innerHTML = html;
  } catch (err) {
    console.error('loadPrivacy failed:', err);
    container.innerHTML = `Could not load — view on <a href="https://github.com/${REPO}#-important" target="_blank" style="color:var(--text);">GitHub</a>.`;
  }
}



const CREDITS = [
  { name: 'hamlook(@h4mlock)', role: 'Author', url: 'https://github.com/hamlook' },
  { name: 'Internet Protocol(@.ipv6)', role: 'Contributor & maintainer', url: 'https://github.com/protocol-8' },
  { name: 'Whispering(@_.whispering)', role: 'Contributor', url: 'https://github.com/ginafro1' },
  { name: 'Hooman(@mxhooman.)', role: 'Discord Maintainer' }
];

function renderCredits() {
  const grid = document.getElementById('credits-grid');
  if (!grid) return;

  grid.innerHTML = CREDITS.map(p => `
    <div class="credit-row">
      <div>
        <div class="credit-name">${p.name}</div>
        <div class="credit-role">${p.role}</div>
      </div>
      ${p.url ? `<a href="${p.url}" target="_blank">GitHub ↗</a>` : '<span style="color:var(--border-light);font-size:11px;">—</span>'}
    </div>
  `).join('');
}

async function loadLatestVersion() {
  try {
    const res = await fetch(RELEASES_API);
    if (!res.ok) return;
    const data = await res.json();
    const meta = document.getElementById('download-meta');
    if (data.tag_name && meta) {
      const asset = data.assets && data.assets.find(a => a.name.endsWith('.jar'));
      const size = asset ? ` · ${(asset.size / 1024).toFixed(0)} KB` : '';
      meta.textContent = `${data.tag_name} · Forge 1.8.9${size}`;
    }
    const footer = document.getElementById('footer-version');
    if (data.tag_name && footer) {
      footer.textContent = `· ${data.tag_name}`;
    }
  } catch (_) {
    const meta = document.getElementById('download-meta');
    if (meta) meta.textContent = 'Forge 1.8.9';
  }
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Hero animation observer - replays when scrolling back up
const heroObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('animate');
    } else {
      e.target.classList.remove('animate');
    }
  });
}, { threshold: 0.1 });

// Observe hero elements
const heroElements = [
  '.footer-logo',
  '.hero-sub',
  '.download-badges',
  '.download-block',
  '.download-links'
];

heroElements.forEach(selector => {
  const element = document.querySelector(selector);
  if (element) {
    heroObserver.observe(element);
  }
});

loadLatestVersion();
renderCredits();
loadPrivacy();