const REPO = 'JustEnoughFakepixel/JustEnoughFakepixel';
const FEATURES_API = `https://raw.githubusercontent.com/${REPO}/main/FEATURES.md`;
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases/latest`;
const MODRINTH_PROJECT_ID = 'justenoughfakepixel';
const MODRINTH_VERSIONS_API = `https://api.modrinth.com/v2/project/${MODRINTH_PROJECT_ID}/version`;

const CREDITS = [
  { name: 'hamlook(@h4mlock)', role: 'Author', url: 'https://github.com/hamlook' },
  { name: 'Internet Protocol(@.ipv6)', role: 'Contributor & maintainer', url: 'https://github.com/protocol-8' },
  { name: 'Whispering(@_.whispering)', role: 'Contributor', url: 'https://github.com/ginafro1' },
    { name: 'Hooman(@mxhooman.)', role: 'Discord Maintainer' }

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

    const titleWords = name.split(' ').map(word => `<span>${word}</span>`).join(' ');
    const title = `<div class="title-text">${titleWords}</div>`;

    const featureItems = items.map(item => {
      const safeDesc = (item.desc || '').replace(/"/g, '&quot;');
      const hasDesc = !!item.desc;
      return `
        <div class="feature-item">
          <div class="feature-chip${hasDesc ? ' has-desc' : ''}" ${hasDesc ? `data-desc="${safeDesc}"` : ''}>${item.title}</div>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div class="feature-card-label">
        ${title}
        <svg class="category-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div class="feature-row">${featureItems}</div>
    `;

    card.classList.add('collapsed');

    grid.appendChild(card);
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
      ${p.url ? `<a href="${p.url}" target="_blank">GitHub ↗</a>` : '<span style="color:var(--border-light);font-size:11px;">—</span>'}
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

async function loadChangelogs() {
  try {
    const res = await fetch(MODRINTH_VERSIONS_API);
    if (!res.ok) throw new Error();
    const versions = await res.json();

    const changelogContainer = document.getElementById('changelog-list');
    if (!changelogContainer) return;

    // Get the latest 3 versions
    const recentVersions = versions.slice(0, 3);

    changelogContainer.innerHTML = recentVersions.map(version => {
      const date = new Date(version.date_published).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      let changelog = version.changelog || 'No changelog provided.';

      // Remove title if present
      changelog = changelog.replace(/^#\s+JEF\s+[\d\.\s\-]+Changelog\s*/i, '');

      // Use marked.js to parse markdown
      let parsedChangelog = '';
      if (typeof marked !== 'undefined') {
        // Configure marked for better output
        marked.setOptions({
          breaks: true,
          gfm: true
        });
        parsedChangelog = marked.parse(changelog);
      } else {
        // Fallback to basic parsing if marked isn't loaded
        parsedChangelog = changelog
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/-{10,}/g, '<hr>')
          .replace(/^- (.+)$/gm, '<li>$1</li>')
          .replace(/(<li>.*?<\/li>\s*)+/gs, '<ul>$&</ul>');
      }

      return `
        <div class="changelog-item">
          <div class="changelog-header">
            <div class="changelog-date">${date}</div>
          </div>
          <div class="changelog-body">${parsedChangelog}</div>
        </div>
      `;
    }).join('');

  } catch (_) {
    const changelogContainer = document.getElementById('changelog-list');
    if (changelogContainer) {
      changelogContainer.innerHTML = `
        <div class="changelog-item" style="color:var(--muted);font-size:12px;">
          Could not load changelogs — view them on
          <a href="https://modrinth.com/mod/justenoughfakepixel/changelog" target="_blank" style="color:var(--text);">Modrinth</a>.
        </div>
      `;
    }
  }
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

loadFeatures();
renderCredits();
loadLatestVersion();
loadChangelogs();
document.addEventListener("click", (e) => {
  const label = e.target.closest(".feature-card-label");
  if (label) {
    const card = label.closest(".feature-card");
    if (card) {
      card.classList.toggle("collapsed");
    }
    return;
  }

  const chip = e.target.closest(".feature-chip");
  if (!chip || !chip.classList.contains("has-desc")) return;

  const item = chip.closest(".feature-item");
  if (!item) return;

  const existing = item.querySelector(".feature-desc-inline");
  const isActive = chip.classList.contains("active");

  if (existing) {
    existing.remove();
    chip.classList.remove("active");
  }

  if (!isActive) {
    chip.classList.add("active");
    const desc = document.createElement("div");
    desc.className = "feature-desc-inline";
    desc.innerHTML = chip.dataset.desc || "";
    item.appendChild(desc);
  }
});
