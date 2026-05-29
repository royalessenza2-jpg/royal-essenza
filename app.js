/*
   Royal Essenza - Luxury Branding JavaScript
   Handles Shopping Cart state, Notes Explorer, scroll animations, and forms.
*/

document.addEventListener('DOMContentLoaded', () => {
  // --- HEADER SCROLL ACTION ---
  const header = document.querySelector('header');
  const heroSection = document.querySelector('.hero');

  window.addEventListener('scroll', () => {
    // Add scrolled class for glassmorphic transition when scrolling down
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Hide header completely once scrolled past the hero section
    if (heroSection) {
      const heroHeight = heroSection.offsetHeight;
      if (window.scrollY > heroHeight) {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
      }
    }
  });

  // --- SCENT NOTES EXPLORER ---
  const scentNodes = document.querySelectorAll('.scent-node');
  const scentPanes = document.querySelectorAll('.scent-pane');
  const dialTitle = document.querySelector('.dial-center h4');
  const dialSubtitle = document.querySelector('.dial-center span');

  scentNodes.forEach(node => {
    node.addEventListener('click', () => {
      // Remove active from all nodes and panes
      scentNodes.forEach(n => n.classList.remove('active'));
      scentPanes.forEach(p => p.classList.remove('active'));

      // Add active to selected
      node.classList.add('active');
      const targetId = node.getAttribute('data-target');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      // Update center dial text
      const nodeName = node.textContent.trim();
      const nodeCategory = node.getAttribute('data-category');
      dialTitle.textContent = nodeName;
      dialSubtitle.textContent = nodeCategory;

      // Soft dial rotation visual effect
      const dial = document.querySelector('.scent-dial');
      let rotation = 0;
      if (node.classList.contains('node-top')) rotation = 0;
      if (node.classList.contains('node-heart')) rotation = 90;
      if (node.classList.contains('node-base')) rotation = 180;
      
      dial.style.transform = `rotate(${rotation}deg)`;
      // Counter-rotate the inner elements so their text remains upright
      document.querySelector('.dial-center').style.transform = `rotate(${-rotation}deg)`;
      scentNodes.forEach(n => {
        n.style.transform = `rotate(${-rotation}deg)`;
      });
    });
  });

  // --- SHOPPING CART STATE & SYSTEM ---
  let cart = [];

  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartCountBadges = document.querySelectorAll('.cart-count');
  const cartItemsWrapper = document.querySelector('.cart-items-wrapper');
  const cartTotalPriceElem = document.querySelector('.cart-total-price');

  const btnOpenCart = document.getElementById('btn-cart-open');
  const btnCloseCart = document.getElementById('btn-cart-close');

  // Toggle Cart Drawer
  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.style.display = 'block';
    setTimeout(() => {
      cartOverlay.classList.add('open');
    }, 10);
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    setTimeout(() => {
      cartOverlay.style.display = 'none';
    }, 500);
  }

  if (btnOpenCart) btnOpenCart.addEventListener('click', openCart);
  if (btnCloseCart) btnCloseCart.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Load products dynamic click setup
  const btnAddProducts = document.querySelectorAll('.btn-add-to-bag');
  btnAddProducts.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price'));
      const image = btn.getAttribute('data-image');

      addToCart(id, name, price, image);
      openCart();
    });
  });

  function addToCart(id, name, price, image) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price, image, quantity: 1 });
    }
    updateCartUI();
  }

  function updateCartUI() {
    // Update Badge
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadges.forEach(badge => {
      badge.textContent = totalCount;
    });

    // Populate Items
    if (cart.length === 0) {
      cartItemsWrapper.innerHTML = `
        <div class="empty-cart-message">
          <svg style="width: 48px; height: 48px; fill: var(--accent-gold); margin-bottom: 1rem;" viewBox="0 0 24 24">
            <path d="M17.21 9l-4.3-6.18c-.39-.55-1.07-.86-1.74-.86s-1.35.31-1.74.86L5.13 9H1.5v2h21V9h-5.29zm-5.04-4.86c.07-.1.21-.14.33-.14.13 0 .26.04.33.14L15.63 9H8.71l3.46-4.86zM1.5 21c0 1.1.9 2 2 2h17c1.1 0 2-.9 2-2V13H1.5v8z"/>
          </svg>
          <p>Aapka shopping bag khali hai.</p>
        </div>
      `;
      cartTotalPriceElem.textContent = "$0.00";
    } else {
      cartItemsWrapper.innerHTML = '';
      let subtotal = 0;

      cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItemHTML = `
          <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
              <span class="cart-item-title">${item.name}</span>
              <div class="cart-item-qty">
                <button class="qty-btn btn-qty-minus">-</button>
                <span class="qty-count">${item.quantity}</span>
                <button class="qty-btn btn-qty-plus">+</button>
              </div>
              <span class="cart-item-price">$${itemTotal.toFixed(2)}</span>
            </div>
            <button class="btn-remove-item">
              <svg style="width: 18px; height: 18px; fill: currentColor;" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        `;
        cartItemsWrapper.insertAdjacentHTML('beforeend', cartItemHTML);
      });

      cartTotalPriceElem.textContent = `$${subtotal.toFixed(2)}`;

      // Attach Quantity Handlers
      const minusBtns = cartItemsWrapper.querySelectorAll('.btn-qty-minus');
      const plusBtns = cartItemsWrapper.querySelectorAll('.btn-qty-plus');
      const removeBtns = cartItemsWrapper.querySelectorAll('.btn-remove-item');

      minusBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const itemId = e.target.closest('.cart-item').getAttribute('data-id');
          adjustQty(itemId, -1);
        });
      });

      plusBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const itemId = e.target.closest('.cart-item').getAttribute('data-id');
          adjustQty(itemId, 1);
        });
      });

      removeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const itemId = e.target.closest('.cart-item').getAttribute('data-id');
          removeFromCart(itemId);
        });
      });
    }
  }

  function adjustQty(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        removeFromCart(id);
      } else {
        updateCartUI();
      }
    }
  }

  function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
  }

  // --- SLIDING SEARCH INTERACTION ---
  const btnSearchToggle = document.getElementById('btn-search-toggle');
  const searchContainer = document.getElementById('search-container');
  const searchField = document.querySelector('.search-field');
  const btnSearchClose = document.getElementById('btn-search-close');

  function openSearch() {
    if (window.innerWidth >= 992) return; // Always open on desktop
    searchContainer.classList.add('open');
    if (btnSearchToggle) {
      btnSearchToggle.style.opacity = '0';
      btnSearchToggle.style.pointerEvents = 'none';
    }
    // Focus the input and open mobile keyboard only AFTER the 2s glowing animation completes!
    setTimeout(() => {
      searchField.focus();
    }, 2000);
  }

  function closeSearch() {
    if (window.innerWidth >= 992) return; // Always open on desktop
    searchContainer.classList.remove('open');
    if (btnSearchToggle) {
      btnSearchToggle.style.opacity = '1';
      btnSearchToggle.style.pointerEvents = 'auto';
    }
  }

  if (btnSearchToggle) {
    btnSearchToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      openSearch();
    });
  }

  if (btnSearchClose) {
    btnSearchClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSearch();
    });
  }

  if (searchContainer) {
    searchContainer.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  document.addEventListener('click', () => {
    if (searchContainer && searchContainer.classList.contains('open')) {
      closeSearch();
    }
  });

  // --- NEWSLETTER SIGN-UP FORM ---
  const newsForm = document.getElementById('newsletter-form');
  const newsInput = document.getElementById('newsletter-input');
  const formMsg = document.getElementById('form-message');

  if (newsForm) {
    newsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsInput.value.trim();

      if (!email) {
        showMsg("Please enter your email address.", "error");
        return;
      }
      if (!validateEmail(email)) {
        showMsg("Please enter a valid email address.", "error");
        return;
      }

      // Simulate API submit
      showMsg("Submitting...", "success");
      setTimeout(() => {
        showMsg("Tashakkur! You have subscribed to the Royal Circle.", "success");
        newsInput.value = '';
      }, 1000);
    });
  }

  function showMsg(txt, status) {
    formMsg.textContent = txt;
    formMsg.className = `form-message ${status}`;
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // --- PREMIUM HORIZONTAL SLIDING HERO CAROUSEL ---
  const heroSlidesWrapper = document.querySelector('.hero-slides');
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroPrevBtn = document.querySelector('.hero-nav-btn.btn-prev');
  const heroNextBtn = document.querySelector('.hero-nav-btn.btn-next');
  const heroIndicators = document.querySelectorAll('.hero-indicator');

  if (heroSlidesWrapper && heroSlides.length > 0) {
    let currentHeroSlide = 0;
    const totalHeroSlides = heroSlides.length;
    const heroSlideInterval = 5000; // Rotate every 5 seconds
    let rotationTimer;

    function goToHeroSlide(index) {
      currentHeroSlide = index;
      
      // Calculate horizontal translation percent
      const translatePercent = -(index * 100) / totalHeroSlides;
      heroSlidesWrapper.style.transform = `translateX(${translatePercent}%)`;

      // Update indicators active state
      heroIndicators.forEach((indicator, idx) => {
        if (idx === index) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
    }

    function nextHeroSlide() {
      const nextIndex = (currentHeroSlide + 1) % totalHeroSlides;
      goToHeroSlide(nextIndex);
    }

    function prevHeroSlide() {
      const prevIndex = (currentHeroSlide - 1 + totalHeroSlides) % totalHeroSlides;
      goToHeroSlide(prevIndex);
    }

    // Auto Rotation Management
    function startRotation() {
      stopRotation();
      rotationTimer = setInterval(nextHeroSlide, heroSlideInterval);
    }

    function stopRotation() {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    }

    function handleManualInteraction(action) {
      action();
      startRotation(); // Reset auto rotation interval timer
    }

    // Click Handlers
    if (heroNextBtn) {
      heroNextBtn.addEventListener('click', () => {
        handleManualInteraction(nextHeroSlide);
      });
    }

    if (heroPrevBtn) {
      heroPrevBtn.addEventListener('click', () => {
        handleManualInteraction(prevHeroSlide);
      });
    }

    heroIndicators.forEach((indicator) => {
      indicator.addEventListener('click', () => {
        const slideIndex = parseInt(indicator.getAttribute('data-slide'), 10);
        handleManualInteraction(() => {
          goToHeroSlide(slideIndex);
        });
      });
    });

    // Touch Swipe Gesture Support for Hero Section
    let heroTouchStartX = 0;
    let heroTouchEndX = 0;
    const heroSectionEl = document.querySelector('.hero');

    if (heroSectionEl) {
      heroSectionEl.addEventListener('touchstart', (e) => {
        heroTouchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      heroSectionEl.addEventListener('touchend', (e) => {
        heroTouchEndX = e.changedTouches[0].screenX;
        handleHeroSwipe();
      }, { passive: true });
    }

    function handleHeroSwipe() {
      const swipeDistance = heroTouchEndX - heroTouchStartX;
      if (swipeDistance < -50) {
        // Swipe Left -> Next slide
        if (heroNextBtn) heroNextBtn.click();
      } else if (swipeDistance > 50) {
        // Swipe Right -> Prev slide
        if (heroPrevBtn) heroPrevBtn.click();
      }
    }

    // Initialize auto rotation
    startRotation();
  }

  // --- MOBILE CREATIVE 3D COVERFLOW SLIDER CONTROLLER ---
  const cards = document.querySelectorAll('.new-card');
  const prevBtn = document.querySelector('.new-carousel-btn.btn-prev');
  const nextBtn = document.querySelector('.new-carousel-btn.btn-next');

  if (cards.length > 0 && prevBtn && nextBtn) {
    let currentIndex = 0;
    const totalCards = cards.length;
    let isAnimating = false;
    let autoRotateInterval;

    function updateCardStack() {
      cards.forEach((card, idx) => {
        // Reset Coverflow layout classes
        card.classList.remove('active-card', 'prev-card', 'next-card');

        // Mathematically assign coverflow positions in infinite loop
        if (idx === currentIndex) {
          card.classList.add('active-card');
        } else if (idx === (currentIndex - 1 + totalCards) % totalCards) {
          card.classList.add('prev-card');
        } else if (idx === (currentIndex + 1) % totalCards) {
          card.classList.add('next-card');
        }
      });
    }

    // Initialize stack
    updateCardStack();

    // Debounced transition triggers for ultra-smooth 60fps interaction
    function rotateNext() {
      if (isAnimating) return;
      isAnimating = true;
      currentIndex = (currentIndex + 1) % totalCards;
      updateCardStack();
      setTimeout(() => { isAnimating = false; }, 500);
    }

    function rotatePrev() {
      if (isAnimating) return;
      isAnimating = true;
      currentIndex = (currentIndex - 1 + totalCards) % totalCards;
      updateCardStack();
      setTimeout(() => { isAnimating = false; }, 500);
    }

    // Automatic Rotation Timer Management
    function startAutoRotation() {
      stopAutoRotation();
      autoRotateInterval = setInterval(rotateNext, 5000); // 5 seconds interval
    }

    function stopAutoRotation() {
      if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
      }
    }

    function handleManualInteraction(action) {
      action();
      startAutoRotation(); // Reset the 5s interval timer
    }

    nextBtn.addEventListener('click', () => {
      handleManualInteraction(rotateNext);
    });

    prevBtn.addEventListener('click', () => {
      handleManualInteraction(rotatePrev);
    });

    // Tactile direct card clicks (clicking on the left/right cards rotates the carousel!)
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        if (window.innerWidth > 768) return; // Desktop uses grid list, click does nothing
        
        // If user clicks interactive buttons inside the card, don't rotate the carousel!
        if (e.target.closest('.new-card-actions') || e.target.closest('.new-card-wishlist')) {
          return;
        }

        if (card.classList.contains('prev-card')) {
          e.preventDefault();
          handleManualInteraction(rotatePrev);
        } else if (card.classList.contains('next-card')) {
          e.preventDefault();
          handleManualInteraction(rotateNext);
        }
      });
    });

    // Touch Swipe Gesture Support for Mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const gridWrapper = document.querySelector('.new-arrivals-grid');

    if (gridWrapper) {
      gridWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      gridWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
    }

    function handleSwipe() {
      const swipeDistance = touchEndX - touchStartX;
      if (swipeDistance < -50) {
        // Swipe Left -> Next card
        handleManualInteraction(rotateNext);
      } else if (swipeDistance > 50) {
        // Swipe Right -> Prev card
        handleManualInteraction(rotatePrev);
      }
    }

    // Initialize auto rotation on mobile viewports on startup
    if (window.innerWidth <= 768) {
      startAutoRotation();
    }

    // Manage timers on viewport resize
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        startAutoRotation();
      } else {
        stopAutoRotation();
      }
    });
  }

  // --- BESPOKE CONTACT FORM HANDLER ---
  const contactForm = document.getElementById('bespoke-contact-form');
  const contactMsg = document.getElementById('contact-form-message');

  if (contactForm && contactMsg) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactMsg.textContent = "Submitting Inquiry...";
      contactMsg.className = "contact-form-message success";

      setTimeout(() => {
        contactMsg.textContent = "Tashakkur! Your consultation inquiry has been submitted. Our concierge will contact you shortly.";
        contactMsg.className = "contact-form-message success";
        contactForm.reset();
        
        // Soft clear success text after 6 seconds
        setTimeout(() => {
          contactMsg.textContent = "";
          contactMsg.className = "contact-form-message";
        }, 6000);
      }, 1000);
    });
  }

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

  // Close mobile drawer on any page link clicks
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // --- LUXURY TRACK ORDER DRAWER SYSTEM ---
  const trackDrawer = document.getElementById('track-drawer');
  const trackOverlay = document.getElementById('track-overlay');
  const btnCloseTrack = document.getElementById('btn-track-close');
  const trackTriggers = document.querySelectorAll('.nav-track-trigger, .menu-track-trigger');
  
  const btnTrackSubmit = document.getElementById('btn-track-submit');
  const trackIdInput = document.getElementById('tracking-id-input');
  const trackLoader = document.getElementById('track-loader');
  const trackResults = document.getElementById('tracking-results');

  function openTrack(e) {
    if (e) e.preventDefault();
    
    // Close mobile menu if it is currently open
    closeMenu();
    
    if (trackDrawer) trackDrawer.classList.add('open');
    if (trackOverlay) {
      trackOverlay.style.display = 'block';
      setTimeout(() => {
        trackOverlay.classList.add('open');
      }, 10);
    }
  }

  function closeTrack() {
    if (trackDrawer) trackDrawer.classList.remove('open');
    if (trackOverlay) {
      trackOverlay.classList.remove('open');
      setTimeout(() => {
        trackOverlay.style.display = 'none';
      }, 500);
    }
    // Clean up forms when closing
    if (trackIdInput) trackIdInput.value = '';
    if (trackLoader) trackLoader.style.display = 'none';
    if (trackResults) trackResults.style.display = 'none';
  }

  trackTriggers.forEach(trigger => {
    trigger.addEventListener('click', openTrack);
  });

  if (btnCloseTrack) btnCloseTrack.addEventListener('click', closeTrack);
  if (trackOverlay) trackOverlay.addEventListener('click', closeTrack);

  // Handle Tracking ID simulated search
  if (btnTrackSubmit && trackIdInput) {
    btnTrackSubmit.addEventListener('click', () => {
      const trackingVal = trackIdInput.value.trim();
      
      if (!trackingVal) {
        trackIdInput.style.borderColor = '#ff4a4a';
        setTimeout(() => {
          trackIdInput.style.borderColor = 'var(--border-color)';
        }, 1500);
        return;
      }

      // Hide previous results and show loader
      if (trackResults) trackResults.style.display = 'none';
      if (trackLoader) trackLoader.style.display = 'flex';

      // Simulate a luxury network concierges check
      setTimeout(() => {
        if (trackLoader) trackLoader.style.display = 'none';
        if (trackResults) {
          trackResults.style.display = 'block';
          
          // Animate timeline dots sequentially for ultimate visual premium touch!
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

    // Support tracking trigger on enter key
    trackIdInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btnTrackSubmit.click();
      }
    });
  }

  // --- AUTOMATICALLY HIDE EMPTY CONTACT DETAILS ---
  const contactDetailItems = document.querySelectorAll('.contact-detail-item');
  contactDetailItems.forEach(item => {
    const textElem = item.querySelector('.contact-detail-text');
    if (textElem) {
      const textVal = textElem.textContent.trim();
      if (textVal === '') {
        item.style.display = 'none';
      } else {
        item.style.display = 'flex';
      }
    }
  });
});
