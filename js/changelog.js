const REPO = 'JustEnoughFakepixel/JustEnoughFakepixel';
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases/latest`;
const MODRINTH_PROJECT_ID = 'justenoughfakepixel';
const MODRINTH_VERSIONS_API = `https://api.modrinth.com/v2/project/${MODRINTH_PROJECT_ID}/version`;

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

async function loadChangelogs() {
  const changelogContainer = document.getElementById('changelog-list');
  if (!changelogContainer) return;

  // Show loading skeleton
  changelogContainer.innerHTML = `
    <div class="changelog-item">
      <div class="changelog-header">
        <div class="skeleton" style="height:11px;width:100px;"></div>
      </div>
      <div class="changelog-body">
        <div class="skeleton" style="height:10px;width:100%;margin-bottom:6px;"></div>
        <div class="skeleton" style="height:10px;width:85%;margin-bottom:6px;"></div>
        <div class="skeleton" style="height:10px;width:92%;"></div>
      </div>
    </div>
    <div class="changelog-item">
      <div class="changelog-header">
        <div class="skeleton" style="height:11px;width:100px;"></div>
      </div>
      <div class="changelog-body">
        <div class="skeleton" style="height:10px;width:100%;margin-bottom:6px;"></div>
        <div class="skeleton" style="height:10px;width:78%;"></div>
      </div>
    </div>
  `;

  try {
    const res = await fetch(MODRINTH_VERSIONS_API);
    if (!res.ok) throw new Error();
    const versions = await res.json();

    // Show all versions on the changelog page
    changelogContainer.innerHTML = versions.map(version => {
      const date = new Date(version.date_published).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      let changelog = version.changelog || 'No changelog provided.';

      // Use marked.js to parse markdown
      let parsedChangelog = '';
      if (typeof marked !== 'undefined') {
        marked.setOptions({
          breaks: true,
          gfm: true
        });
        parsedChangelog = marked.parse(changelog);
      } else {
        // Fallback to basic parsing
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

loadLatestVersion();
loadChangelogs();
