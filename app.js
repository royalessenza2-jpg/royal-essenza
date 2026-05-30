/*
   Royal Essenza - Luxury Branding JavaScript
   Handles Shopping Cart state, Notes Explorer, scroll animations, and forms.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Safety guard for offline / local testing without Firebase database
  if (typeof db === 'undefined') {
    window.db = {
      ref: function() {
        return {
          once: function() { return Promise.resolve({ val: function() { return null; }, exists: function() { return false; } }); },
          on: function() {},
          set: function() { return Promise.resolve(); }
        };
      }
    };
  }

  // --- VISITOR TRAFFIC TRACKING ---
  function trackVisitorTraffic() {
    db.ref('stats').once('value').then((snapshot) => {
      let statsObj = snapshot.val() || { totalVisitors: 169, todaysVisitors: 2, lastVisitDate: '', totalOrders: 0 };
      const todayStr = new Date().toDateString();
      if (statsObj.lastVisitDate !== todayStr) {
        statsObj.todaysVisitors = 0;
        statsObj.lastVisitDate = todayStr;
      }

      statsObj.totalVisitors = (statsObj.totalVisitors || 0) + 1;
      statsObj.todaysVisitors = (statsObj.todaysVisitors || 0) + 1;

      db.ref('stats').set(statsObj);
      localStorage.setItem('royal-stats', JSON.stringify(statsObj));
    }).catch(err => console.error('Firebase stats tracking failed:', err));
  }
  trackVisitorTraffic();

  // --- DYNAMIC SHOP INFO ---
  function loadShopInfo() {
    let shopInfo = {
      address: 'Villas Sector A, Royal Avenue, Karachi',
      phone: '+92 21 111 769 25',
      email: 'concierge@royalessenza.com',
      whatsapp: 'https://wa.me/923001234567',
      instagram: '#',
      tiktok: '#'
    };
    try {
      const savedShopInfo = localStorage.getItem('royal-shop-info');
      if (savedShopInfo) {
        shopInfo = JSON.parse(savedShopInfo);
      } else {
        localStorage.setItem('royal-shop-info', JSON.stringify(shopInfo));
      }
    } catch (e) {
      console.error('Failed to load shop info:', e);
    }

    const detailTexts = document.querySelectorAll('.contact-detail-text');
    if (detailTexts.length >= 3) {
      detailTexts[0].textContent = shopInfo.address;
      detailTexts[1].textContent = shopInfo.phone;
      detailTexts[2].textContent = shopInfo.email;
    }

    const waFloating = document.querySelector('.floating-whatsapp-btn');
    if (waFloating && shopInfo.whatsapp) {
      waFloating.href = shopInfo.whatsapp;
    }

    const socialLinks = document.querySelectorAll('.contact-social-icons a, .menu-drawer-socials a');
    socialLinks.forEach(link => {
      const label = link.getAttribute('aria-label');
      if (label === 'Instagram' && shopInfo.instagram) link.href = shopInfo.instagram;
      if (label === 'TikTok' && shopInfo.tiktok) link.href = shopInfo.tiktok;
    });
  }
  loadShopInfo();

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
  try {
    const savedCart = localStorage.getItem('royal-cart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }
  } catch (e) {
    console.error('Failed to parse cart from localStorage:', e);
    cart = [];
  }

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

  function saveCartAndSync() {
    try {
      localStorage.setItem('royal-cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
    updateCartUI();
  }

  function addToCart(id, name, price, image) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price, image, quantity: 1 });
    }
    saveCartAndSync();
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
      cartTotalPriceElem.textContent = "PKR 0";
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
              <span class="cart-item-price">PKR ${itemTotal.toLocaleString()}</span>
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

      cartTotalPriceElem.textContent = `PKR ${subtotal.toLocaleString()}`;

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
        saveCartAndSync();
      }
    }
  }

  function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCartAndSync();
  }

  // --- CHECKOUT MODAL SYSTEM ---
  function openCheckoutModal() {
    if (cart.length === 0) {
      alert("Aapka shopping bag khali hai. Please add products first!");
      return;
    }

    closeCart();

    const modalHTML = `
      <div class="checkout-modal-overlay" id="checkout-modal">
        <div class="checkout-modal-card">
          <div class="checkout-modal-header">
            <h3>Checkout Order</h3>
            <button class="btn-close-checkout" id="btn-close-checkout-modal">&times;</button>
          </div>
          <form class="checkout-form" id="checkout-order-form">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="checkout-name" required placeholder="Enter your full name">
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" id="checkout-phone" required placeholder="Enter your mobile number">
            </div>
            <div class="form-group">
              <label>Delivery Address</label>
              <textarea id="checkout-address" required placeholder="Enter your complete delivery address" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>City</label>
              <input type="text" id="checkout-city" required placeholder="e.g. Karachi, Lahore, Islamabad">
            </div>
            <div class="form-group">
              <label>Order Notes (Optional)</label>
              <input type="text" id="checkout-notes" placeholder="e.g. Please call before delivery">
            </div>
            <div class="checkout-payment-info">
              <svg style="width: 20px; height: 20px; fill: var(--accent-gold); margin-right: 0.5rem;" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <span>Payment Method: <strong>Cash on Delivery (COD)</strong></span>
            </div>
            <div class="checkout-summary-box">
              <div class="checkout-summary-title">Order Summary</div>
              ${cart.map(item => `
                <div class="checkout-summary-item">
                  <span>${item.name} (x${item.quantity})</span>
                  <span>PKR ${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              `).join('')}
              <div class="checkout-summary-total">
                <span>Total Amount</span>
                <span>PKR ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
              </div>
            </div>
            <button type="submit" class="btn-place-order">Place Order (COD)</button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('checkout-modal');
    
    setTimeout(() => {
      modal.classList.add('open');
    }, 10);

    const closeModal = () => {
      modal.classList.remove('open');
      setTimeout(() => {
        modal.remove();
      }, 400);
    };

    document.getElementById('btn-close-checkout-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.getElementById('checkout-order-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const orderID = 'RE-' + Math.floor(100000 + Math.random() * 900000);
      const nameVal = document.getElementById('checkout-name').value.trim();
      const phoneVal = document.getElementById('checkout-phone').value.trim();
      const addressVal = document.getElementById('checkout-address').value.trim();
      const cityVal = document.getElementById('checkout-city').value.trim();
      const notesVal = document.getElementById('checkout-notes').value.trim();
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Symmetrical Order Object (Fully backward-compatible with both website & admin schemas)
      const newOrder = {
        id: orderID,
        clientName: nameVal,
        clientEmail: phoneVal + ' (' + cityVal + ')',
        productName: cart.map(item => item.name + ' (x' + item.quantity + ')').join(', '),
        price: totalAmount,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        customer: {
          name: nameVal,
          phone: phoneVal,
          address: addressVal,
          city: cityVal,
          notes: notesVal
        },
        items: [...cart],
        total: totalAmount
      };

      // 1. Sync to Firebase Realtime Database
      db.ref('orders/' + orderID).set(newOrder);

      // 2. Local Cache Fallback
      let orders = [];
      try {
        const savedOrders = localStorage.getItem('royal-orders');
        if (savedOrders) orders = JSON.parse(savedOrders);
      } catch (err) {}
      orders.unshift(newOrder);
      localStorage.setItem('royal-orders', JSON.stringify(orders));

      // 3. Update stats total orders in Firebase
      db.ref('stats').once('value').then((snapshot) => {
        let statsObj = snapshot.val() || { totalVisitors: 169, todaysVisitors: 2, totalOrders: 0 };
        statsObj.totalOrders = (statsObj.totalOrders || 0) + 1;
        db.ref('stats').set(statsObj);
      });

      // 4. Dynamically compile and compile customer details for VIP loyalty registry
      const customerKey = phoneVal.replace(/[^a-zA-Z0-9]/g, '');
      if (customerKey) {
        db.ref('customers/' + customerKey).once('value').then((snap) => {
          let cust = snap.val() || {
            id: customerKey,
            name: nameVal,
            email: phoneVal + ' (' + cityVal + ')',
            ordersCount: 0,
            totalSpent: 0,
            tier: 'VIP Amber',
            joined: new Date().toISOString().split('T')[0]
          };
          cust.ordersCount += 1;
          cust.totalSpent += totalAmount;
          
          // Calculate high-fidelity VIP tiers based on spending thresholds
          if (cust.totalSpent >= 50000) cust.tier = 'VIP Obsidian Platinum';
          else if (cust.totalSpent >= 25000) cust.tier = 'VIP Royal Gold';
          else cust.tier = 'VIP Amber';
          
          db.ref('customers/' + customerKey).set(cust);
        });
      }

      cart = [];
      saveCartAndSync();

      const card = modal.querySelector('.checkout-modal-card');
      card.innerHTML = `
        <div class="checkout-success-container">
          <svg class="checkout-success-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <h3 class="checkout-success-title">Order Placed!</h3>
          <p class="checkout-success-msg">Tashakkur! Your luxury fragrance order has been received. You can track its status using your order ID below:</p>
          <div class="checkout-success-id">${orderID}</div>
          <a href="track-order.html?id=${orderID}" class="btn-success-track">Track Your Order</a>
        </div>
      `;
    });
  }

  // Initial cart draw
  updateCartUI();

  // Attach Checkout Button Handlers
  document.querySelectorAll('.btn-checkout').forEach(btn => {
    btn.addEventListener('click', openCheckoutModal);
  });

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

  // --- PREMIUM HORIZONTAL SLIDING HERO CAROUSEL (CROSS-FADE UPGRADE) ---
  function initializeHeroSlider(customSlides) {
    const heroSlidesWrapper = document.querySelector('.hero-slides');
    if (!heroSlidesWrapper) return;
    
    const fallbackSlides = [
      { image: 'radial-gradient(circle at center, #1C1A17 0%, #080807 100%)', isGradient: true }
    ];
    const slidesToRender = customSlides.length > 0 ? customSlides : fallbackSlides;

    heroSlidesWrapper.innerHTML = slidesToRender.map((slide, idx) => `
      <div class="hero-slide ${idx === 0 ? 'active' : ''}" style="${slide.isGradient ? `background: ${slide.image}` : `background-image: url('${slide.image}')`};"></div>
    `).join('');
    
    heroSlidesWrapper.style.width = '100%';
    
    const heroIndicatorsContainer = document.querySelector('.hero-indicators');
    if (heroIndicatorsContainer) {
      heroIndicatorsContainer.innerHTML = slidesToRender.map((slide, idx) => `
        <button class="hero-indicator ${idx === 0 ? 'active' : ''}" data-slide="${idx}" aria-label="Slide ${idx + 1}"></button>
      `).join('');
    }

    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroPrevBtn = document.querySelector('.hero-nav-btn.btn-prev');
    const heroNextBtn = document.querySelector('.hero-nav-btn.btn-next');
    const heroIndicators = document.querySelectorAll('.hero-indicator');

    if (heroSlides.length > 0) {
      let currentHeroSlide = 0;
      const totalHeroSlides = heroSlides.length;
      const heroSlideInterval = 5000;
      let rotationTimer;

      function goToHeroSlide(index) {
        currentHeroSlide = index;
        
        heroSlides.forEach((slide, idx) => {
          if (idx === index) {
            slide.classList.add('active');
          } else {
            slide.classList.remove('active');
          }
        });

        heroIndicators.forEach((indicator, idx) => {
          if (idx === index) {
            indicator.classList.add('active');
          } else {
            indicator.classList.remove('active');
          }
        });
      }

      // Re-bind to fresh cloned nodes to wipe out previous timers/listeners
      const newHeroNextBtn = heroNextBtn.cloneNode(true);
      heroNextBtn.parentNode.replaceChild(newHeroNextBtn, heroNextBtn);
      
      const newHeroPrevBtn = heroPrevBtn.cloneNode(true);
      heroPrevBtn.parentNode.replaceChild(newHeroPrevBtn, heroPrevBtn);

      function nextHeroSlide() {
        const nextIndex = (currentHeroSlide + 1) % totalHeroSlides;
        goToHeroSlide(nextIndex);
      }

      function prevHeroSlide() {
        const prevIndex = (currentHeroSlide - 1 + totalHeroSlides) % totalHeroSlides;
        goToHeroSlide(prevIndex);
      }

      function startRotation() {
        stopRotation();
        rotationTimer = setInterval(nextHeroSlide, heroSlideInterval);
      }

      function stopRotation() {
        if (rotationTimer) clearInterval(rotationTimer);
      }

      function handleManualInteraction(action) {
        action();
        startRotation();
      }

      newHeroNextBtn.addEventListener('click', () => {
        handleManualInteraction(nextHeroSlide);
      });

      newHeroPrevBtn.addEventListener('click', () => {
        handleManualInteraction(prevHeroSlide);
      });

      heroIndicators.forEach((indicator) => {
        indicator.addEventListener('click', () => {
          const slideIndex = parseInt(indicator.getAttribute('data-slide'), 10);
          handleManualInteraction(() => {
            goToHeroSlide(slideIndex);
          });
        });
      });

      let heroTouchStartX = 0;
      let heroTouchEndX = 0;
      const heroSectionEl = document.querySelector('.hero');

      if (heroSectionEl) {
        heroSectionEl.addEventListener('touchstart', (e) => {
          heroTouchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        heroSectionEl.addEventListener('touchend', (e) => {
          heroTouchEndX = e.changedTouches[0].screenX;
          const swipeDistance = heroTouchEndX - heroTouchStartX;
          if (swipeDistance < -50) {
            newHeroNextBtn.click();
          } else if (swipeDistance > 50) {
            newHeroPrevBtn.click();
          }
        }, { passive: true });
      }

      startRotation();
    }
  }

  // Real-time slider sync observer from Firebase
  db.ref('slider').on('value', (snapshot) => {
    const data = snapshot.val();
    const customSlides = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
    localStorage.setItem('royal-slider', JSON.stringify(customSlides));
    initializeHeroSlider(customSlides);
  });

  // --- MOBILE CREATIVE 3D COVERFLOW SLIDER CONTROLLER ---
  let newArrivalsAutoRotateInterval = null;

  function initializeNewArrivalsCarousel() {
    // Clear any previous interval first to avoid memory leaks
    if (newArrivalsAutoRotateInterval) {
      clearInterval(newArrivalsAutoRotateInterval);
      newArrivalsAutoRotateInterval = null;
    }

    const cards = document.querySelectorAll('.new-card');
    let prevBtn = document.querySelector('.new-carousel-btn.btn-prev');
    let nextBtn = document.querySelector('.new-carousel-btn.btn-next');

    if (!prevBtn || !nextBtn) return;

    const totalCards = cards.length;

    // If 1 card or 0 cards, hide navigation buttons and stop Coverflow setup
    if (totalCards <= 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      if (totalCards === 1) {
        cards[0].classList.add('active-card');
      }
      return;
    }

    // Show navigation buttons since there are multiple cards
    prevBtn.style.display = '';
    nextBtn.style.display = '';

    // Cleanly wipe duplicate event listeners by replacing navigation buttons with clones
    const cleanPrevBtn = prevBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(cleanPrevBtn, prevBtn);
    prevBtn = cleanPrevBtn;

    const cleanNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(cleanNextBtn, nextBtn);
    nextBtn = cleanNextBtn;

    let currentIndex = 0;
    let isAnimating = false;

    function updateCardStack() {
      cards.forEach((card, idx) => {
        // Reset Coverflow layout classes
        card.classList.remove('active-card', 'prev-card', 'next-card');

        if (totalCards === 2) {
          // Safe handling for 2 cards to avoid overlapping conflicts
          if (idx === currentIndex) {
            card.classList.add('active-card');
          } else {
            // Offset the other card depending on active index
            if (currentIndex === 0) {
              card.classList.add('next-card');
            } else {
              card.classList.add('prev-card');
            }
          }
        } else {
          // Standard coverflow assignments (for 3+ cards)
          if (idx === currentIndex) {
            card.classList.add('active-card');
          } else if (idx === (currentIndex - 1 + totalCards) % totalCards) {
            card.classList.add('prev-card');
          } else if (idx === (currentIndex + 1) % totalCards) {
            card.classList.add('next-card');
          }
        }
      });
    }

    // Initialize stack
    updateCardStack();

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

    function startAutoRotation() {
      stopAutoRotation();
      newArrivalsAutoRotateInterval = setInterval(rotateNext, 5000);
    }

    function stopAutoRotation() {
      if (newArrivalsAutoRotateInterval) {
        clearInterval(newArrivalsAutoRotateInterval);
        newArrivalsAutoRotateInterval = null;
      }
    }

    function handleManualInteraction(action) {
      action();
      startAutoRotation();
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
        if (window.innerWidth > 768) return;
        
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
        handleManualInteraction(rotateNext);
      } else if (swipeDistance > 50) {
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

  // Dedicated Track Order page handles tracking logic on track-order.html

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

  // --- FIREBASE REAL-TIME HOME LANDING PAGES INTEGRATION ---
  function renderNewArrivals(productsList) {
    let newArrivalsGrid = document.getElementById('new-arrivals-grid');
    if (!newArrivalsGrid) return;
    
    // Clear and clone the grid to completely wipe out any accumulated event listeners
    const cleanGrid = newArrivalsGrid.cloneNode(false);
    newArrivalsGrid.parentNode.replaceChild(cleanGrid, newArrivalsGrid);
    newArrivalsGrid = cleanGrid;
    
    const cleanProducts = productsList.filter(p => p && p.id);
    
    if (cleanProducts.length === 0) {
      newArrivalsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--accent-gold); font-family: var(--font-serif); width: 100%;">
          <p>Our sanctuary is currently preparing bespoke creations. Please check back shortly.</p>
        </div>
      `;
      return;
    }
    
    // Slice exactly the 3 latest fragrances added by the admin (reverse so latest is first)
    const latestProducts = cleanProducts.slice(-3).reverse();
    
    newArrivalsGrid.innerHTML = '';
    latestProducts.forEach(product => {
      const saleBadgeHTML = product.onSale ? `<div class="new-card-badge">★ SALE</div>` : ``;
      
      const cardHTML = `
        <div class="new-card animate-fade-in">
          ${saleBadgeHTML}
          
          <button class="new-card-wishlist" aria-label="Add to wishlist">
            <svg style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.5;" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
          
          <div class="new-card-img-wrapper">
            <a href="product-detail.html?id=${product.id}">
              <img src="${product.image}" alt="${product.name}" class="new-card-img">
            </a>
          </div>
          
          <div class="new-card-info">
            <span class="new-card-category">${product.category.toUpperCase()} / ${product.size}</span>
            <h3 class="new-card-title"><a href="product-detail.html?id=${product.id}">${product.name}</a></h3>
            <span class="new-card-price">PKR ${product.price.toLocaleString()}</span>
            
            <div class="new-card-actions">
              <button class="btn-new-buy-now btn-landing-buy">Buy Now</button>
              <button class="btn-new-add-to-cart btn-add-to-bag" 
                      data-id="${product.id}" 
                      data-name="${product.name}" 
                      data-price="${product.price}" 
                      data-image="${product.image}">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
      newArrivalsGrid.insertAdjacentHTML('beforeend', cardHTML);
    });
    
    // Attach event listeners for dynamic bag additions
    newArrivalsGrid.querySelectorAll('.btn-add-to-bag').forEach(btn => {
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

    newArrivalsGrid.querySelectorAll('.btn-landing-buy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const addBtn = e.target.nextElementSibling;
        if (addBtn) {
          addBtn.click();
        }
      });
    });

    // Initialize/re-initialize the coverflow carousel once dynamic cards are injected
    initializeNewArrivalsCarousel();
  }

  let currentProductsList = [];
  let currentTopRunningScent = null;

  let signatureSliderInterval = null;
  function initializeSignatureSlider(customImages) {
    const topRunningContainer = document.getElementById('top-running-container');
    if (!topRunningContainer) return;

    const fallbackImages = ['assets/signature_scent.png'];
    const imagesToRender = customImages && customImages.length > 0 
      ? customImages.map(item => item.image) 
      : fallbackImages;

    let featuredId = 'top-running-scent';
    
    topRunningContainer.innerHTML = `
      <a href="product-detail.html?id=${featuredId}" class="signature-banner-link">
        <div class="signature-slides-wrapper" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
          ${imagesToRender.map((imgUrl, idx) => `
            <img src="${imgUrl}" alt="Signature Showcase Slide ${idx + 1}" class="signature-banner-img ${idx === 0 ? 'active' : ''}">
          `).join('')}
        </div>
      </a>
    `;

    // Clear previous signature slider timer
    if (signatureSliderInterval) clearInterval(signatureSliderInterval);

    const sigImages = topRunningContainer.querySelectorAll('.signature-banner-img');
    if (sigImages.length > 1) {
      let currentSigIdx = 0;
      signatureSliderInterval = setInterval(() => {
        sigImages[currentSigIdx].classList.remove('active');
        currentSigIdx = (currentSigIdx + 1) % sigImages.length;
        sigImages[currentSigIdx].classList.add('active');
      }, 5000); // Har 5 seconds baad change
    }
  }

  function initSignatureCanvasAnimation() {
    // Removed at user request in favor of clean static image centerpiece showcase
  }

  // Initial render of default centerpiece on startup
  initializeSignatureSlider([]);

  // Real-time Firebase Sync for Homepage dynamically
  db.ref('products').on('value', (snapshot) => {
    const data = snapshot.val();
    currentProductsList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
    
    renderNewArrivals(currentProductsList);
  }, err => console.error('Homepage Firebase sync failed:', err));

  // Sync custom signature centerpiece fragrance images array
  db.ref('topRunningImages').on('value', (snapshot) => {
    const data = snapshot.val();
    const customImages = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
    localStorage.setItem('royal-signature-images', JSON.stringify(customImages));
    initializeSignatureSlider(customImages);
  }, err => console.error('Featured centerpiece scent Firebase sync failed:', err));
});
