/*
   Royal Essenza - Dedicated Track Order Page Logic
   Handles simulated live order tracking search and timeline animation.
*/

document.addEventListener('DOMContentLoaded', () => {
  // --- HEADER SCROLL ACTION ---
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- MOBILE NAVIGATION DRAWER SYSTEM ---
  const menuDrawer = document.getElementById('mobile-menu-drawer');
  const menuOverlay = document.getElementById('menu-overlay');
  const btnOpenMenu = document.getElementById('btn-menu-open');
  const btnCloseMenu = document.getElementById('btn-menu-close');
  const menuLinks = document.querySelectorAll('.menu-link');

  function openMenu() {
    if (menuDrawer) menuDrawer.classList.add('open');
    if (menuOverlay) {
      menuOverlay.style.display = 'block';
      setTimeout(() => {
        menuOverlay.classList.add('open');
      }, 10);
    }
  }

  function closeMenu() {
    if (menuDrawer) menuDrawer.classList.remove('open');
    if (menuOverlay) {
      menuOverlay.classList.remove('open');
      setTimeout(() => {
        menuOverlay.style.display = 'none';
      }, 500);
    }
  }

  if (btnOpenMenu) btnOpenMenu.addEventListener('click', openMenu);
  if (btnCloseMenu) btnCloseMenu.addEventListener('click', closeMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

  menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // --- LIVE ORDER TRACKING SYSTEM ---
  const btnTrackSubmit = document.getElementById('btn-track-submit-luxury');
  const trackInput = document.getElementById('tracking-input-luxury');
  const trackLoader = document.getElementById('track-loader-luxury');
  const trackResults = document.getElementById('track-results-luxury');

  if (btnTrackSubmit && trackInput) {
    btnTrackSubmit.addEventListener('click', () => {
      const trackingVal = trackInput.value.trim();
      
      if (!trackingVal) {
        trackInput.style.borderColor = '#ff4a4a';
        trackInput.closest('.track-luxury-card').style.borderColor = '#ff4a4a';
        setTimeout(() => {
          trackInput.style.borderColor = '';
          trackInput.closest('.track-luxury-card').style.borderColor = '';
        }, 1500);
        return;
      }

      // Hide previous results and show loader
      if (trackResults) trackResults.style.display = 'none';
      if (trackLoader) trackLoader.style.display = 'flex';

      // Simulate a luxury network concierge database check
      setTimeout(() => {
        if (trackLoader) trackLoader.style.display = 'none';
        if (trackResults) {
          trackResults.style.display = 'block';
          
          // Animate timeline dots sequentially for ultimate premium touch!
          const steps = trackResults.querySelectorAll('.timeline-step');
          steps.forEach((step, index) => {
            step.style.opacity = '0';
            step.style.transform = 'translateY(15px)';
            step.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            
            setTimeout(() => {
              step.style.opacity = '1';
              step.style.transform = 'translateY(0)';
            }, index * 200);
          });
        }
      }, 1200);
    });

    // Support tracking trigger on Enter keypress
    trackInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btnTrackSubmit.click();
      }
    });
  }
});
