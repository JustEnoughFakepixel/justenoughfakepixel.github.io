// Hamburger Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const menuOverlay = document.querySelector('.menu-overlay');
  const body = document.body;

  console.log('Menu script loaded');
  console.log('Hamburger element:', hamburger);
  console.log('Menu overlay:', menuOverlay);

  // Create backdrop element
  const backdrop = document.createElement('div');
  backdrop.className = 'menu-backdrop';
  document.body.appendChild(backdrop);

  function openMenu() {
    hamburger.classList.add('active');
    menuOverlay.classList.add('active');
    backdrop.classList.add('active');
    body.classList.add('menu-open');
    body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    menuOverlay.classList.remove('active');
    backdrop.classList.remove('active');
    body.classList.remove('menu-open');
    body.style.overflow = '';
  }

  if (hamburger && menuOverlay) {
    console.log('Menu elements found, attaching listeners');
    
    // Toggle menu on hamburger click
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Hamburger clicked');
      if (menuOverlay.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when clicking on a link
    const menuLinks = menuOverlay.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Close menu when clicking backdrop
    backdrop.addEventListener('click', () => {
      closeMenu();
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
        closeMenu();
      }
    });
  } else {
    console.error('Menu elements not found!');
  }
});
