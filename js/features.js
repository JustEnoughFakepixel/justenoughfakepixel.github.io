const REPO = 'JustEnoughFakepixel/JustEnoughFakepixel';
const FEATURES_API = `https://raw.githubusercontent.com/${REPO}/main/docs/FEATURES.md`;
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases/latest`;

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

async function loadFeatures() {
  const grid = document.getElementById('features-grid');

  // Show loading skeleton
  grid.innerHTML = `
    <div class="feature-card">
      <div class="feature-card-label">
        <div class="skeleton" style="height:13px;width:150px;"></div>
      </div>
    </div>
    <div class="feature-card">
      <div class="feature-card-label">
        <div class="skeleton" style="height:13px;width:180px;"></div>
      </div>
    </div>
    <div class="feature-card">
      <div class="feature-card-label">
        <div class="skeleton" style="height:13px;width:120px;"></div>
      </div>
    </div>
  `;

  try {
    const res = await fetch(FEATURES_API);
    if (!res.ok) throw new Error();
    const text = await res.text();
    const sections = parseFeatures(text);
    renderFeatures(sections);
  } catch (_) {
    grid.innerHTML = `
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
    const footer = document.getElementById('footer-version');
    if (data.tag_name && footer) {
      footer.textContent = `· ${data.tag_name}`;
    }
  } catch (_) {
    // Silently fail
  }
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Page header animation observer
const headerObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('animate');
    } else {
      e.target.classList.remove('animate');
    }
  });
}, { threshold: 0.2 });

// Observe page header elements
const headerElements = [
  '.page-header h1',
  '.page-header p'
];

headerElements.forEach(selector => {
  const element = document.querySelector(selector);
  if (element) {
    headerObserver.observe(element);
  }
});

loadFeatures();
loadLatestVersion();

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
