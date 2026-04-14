const REPO = 'JustEnoughFakepixel/JustEnoughFakepixel';
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases/latest`;

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
