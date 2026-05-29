/*
   Royal Essenza - Collections Sub-page JavaScript
   Manages product database, catalog search, advanced pricing/status filter loops,
   sorting, and localStorage-synced shopping cart drawers.
*/

document.addEventListener('DOMContentLoaded', () => {
  
  // --- PRODUCT DATABASE CATALOG ---
  const PRODUCTS = [
    {
      id: 'attar-ashwaaq',
      name: 'Ashwaaq Attar 12ml',
      price: 8500,
      category: 'attar',
      image: 'assets/attar_bottle.png',
      onSale: true,
      inStock: true,
      rating: '5 (3)'
    },
    {
      id: 'attar-musk-silk',
      name: 'Musk Silk Attar 12ml',
      price: 9800,
      category: 'attar',
      image: 'assets/attar_bottle.png',
      onSale: false,
      inStock: true,
      rating: '4.9 (5)'
    },
    {
      id: 'perfume-oud-imperial',
      name: 'Oud Imperial EDP 100ml',
      price: 18900,
      category: 'perfume',
      image: 'assets/product_perfume.png',
      onSale: true,
      inStock: true,
      rating: '4.9 (12)'
    },
    {
      id: 'hajj-serenity-giftset',
      name: 'Hajj Serenity Gift Box',
      price: 14500,
      category: 'giftset',
      image: 'assets/new_hajj_giftbox.png',
      onSale: false,
      inStock: true,
      rating: '5 (2)'
    },
    {
      id: 'cherry-wood-perfume',
      name: 'Cherry Wood Extrait 100ml',
      price: 12800,
      category: 'perfume',
      image: 'assets/new_cherry_wood.png',
      onSale: false,
      inStock: true,
      rating: '4.8 (8)'
    },
    {
      id: 'midnight-amber-aroma',
      name: 'Midnight Amber Candle',
      price: 4200,
      category: 'aroma',
      image: 'assets/product_candle.png',
      onSale: true,
      inStock: false, // Out of stock to test out-of-stock toggles
      rating: '4.7 (4)'
    },
    {
      id: 'essential-oil-lavandula',
      name: 'Lavandula Pure Oil 30ml',
      price: 6400,
      category: 'aroma',
      image: 'assets/product_essential_oil.png',
      onSale: false,
      inStock: true,
      rating: '4.9 (9)'
    },
    {
      id: 'evoke-red-female',
      name: 'Evoke Red Her EDP 75ml',
      price: 11500,
      category: 'perfume',
      image: 'assets/new_evoke_red.png',
      onSale: true,
      inStock: true,
      rating: '5 (1)'
    }
  ];

  // --- LOCALSTORAGE SYNCED SHOPPING CART ---
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

  // Cart Selectors
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartCountBadges = document.querySelectorAll('.cart-count');
  const cartItemsWrapper = document.querySelector('.cart-items-wrapper');
  const cartTotalPriceElem = document.querySelector('.cart-total-price');

  const btnOpenCart = document.getElementById('btn-cart-open');
  const btnCloseCart = document.getElementById('btn-cart-close');

  // Toggle Cart Drawer
  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartOverlay) {
      cartOverlay.style.display = 'block';
      setTimeout(() => {
        cartOverlay.classList.add('open');
      }, 10);
    }
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) {
      cartOverlay.classList.remove('open');
      setTimeout(() => {
        cartOverlay.style.display = 'none';
      }, 500);
    }
  }

  if (btnOpenCart) btnOpenCart.addEventListener('click', openCart);
  if (btnCloseCart) btnCloseCart.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Sync Cart Items and Save locally
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
    // Update Badge Count
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadges.forEach(badge => {
      badge.textContent = totalCount;
    });

    // Populate Scroll Drawer Items
    if (!cartItemsWrapper) return;
    
    if (cart.length === 0) {
      cartItemsWrapper.innerHTML = `
        <div class="empty-cart-message">
          <svg style="width: 48px; height: 48px; fill: var(--accent-gold); margin-bottom: 1rem;" viewBox="0 0 24 24">
            <path d="M17.21 9l-4.3-6.18c-.39-.55-1.07-.86-1.74-.86s-1.35.31-1.74.86L5.13 9H1.5v2h21V9h-5.29zm-5.04-4.86c.07-.1.21-.14.33-.14.13 0 .26.04.33.14L15.63 9H8.71l3.46-4.86zM1.5 21c0 1.1.9 2 2 2h17c1.1 0 2-.9 2-2V13H1.5v8z"/>
          </svg>
          <p>Aapka shopping bag khali hai.</p>
        </div>
      `;
      if (cartTotalPriceElem) cartTotalPriceElem.textContent = "Rs.0";
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
              <span class="cart-item-price">Rs.${itemTotal.toLocaleString()}</span>
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

      if (cartTotalPriceElem) cartTotalPriceElem.textContent = `Rs.${subtotal.toLocaleString()}`;

      // Quantity adjustments Event Listeners
      cartItemsWrapper.querySelectorAll('.btn-qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const itemId = e.target.closest('.cart-item').getAttribute('data-id');
          adjustQty(itemId, -1);
        });
      });

      cartItemsWrapper.querySelectorAll('.btn-qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const itemId = e.target.closest('.cart-item').getAttribute('data-id');
          adjustQty(itemId, 1);
        });
      });

      cartItemsWrapper.querySelectorAll('.btn-remove-item').forEach(btn => {
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

  // Initial cart draw
  updateCartUI();


  // --- DYNAMIC CATALOG FILTER & RENDER SYSTEMS ---
  const productsGrid = document.getElementById('catalog-products-grid');
  
  // Sidebar Selectors
  const priceInput = document.getElementById('price-range-slider-input');
  const priceDisplay = document.getElementById('price-slider-value');
  const btnPriceFilter = document.getElementById('btn-price-filter');
  const chkOnSale = document.getElementById('chk-on-sale');
  const chkInStock = document.getElementById('chk-in-stock');

  // Top Bar Selectors
  const searchInput = document.getElementById('catalog-search-field');
  const selectBrand = document.getElementById('select-brand');
  const selectSort = document.getElementById('select-sort');

  // Filter State Object
  const filterState = {
    searchQuery: '',
    maxPrice: 40000,
    onSale: false,
    inStock: true,
    brandCategory: 'all',
    sortBy: 'popularity'
  };

  // Render list inside main grid panel
  function renderCatalog() {
    if (!productsGrid) return;
    
    // Apply Filter Rules
    let filteredList = PRODUCTS.filter(product => {
      // 1. Live Search matching Name or Category
      const query = filterState.searchQuery.toLowerCase().trim();
      const matchSearch = product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
      
      // 2. Price Boundary match
      const matchPrice = product.price <= filterState.maxPrice;
      
      // 3. Status checks:
      // If "On sale" is checked, item MUST be onSale:true
      const matchSale = !filterState.onSale || product.onSale;
      
      // If "In stock" is checked, item MUST be inStock:true
      const matchStock = !filterState.inStock || product.inStock;
      
      // 4. Brand Category select dropdown
      const matchBrand = filterState.brandCategory === 'all' || product.category === filterState.brandCategory;

      return matchSearch && matchPrice && matchSale && matchStock && matchBrand;
    });

    // Apply Sorting Rules
    if (filterState.sortBy === 'price-low') {
      filteredList.sort((a, b) => a.price - b.price);
    } else if (filterState.sortBy === 'price-high') {
      filteredList.sort((a, b) => b.price - a.price);
    } else {
      // Default / popularity sorting (highest rating or first index)
      filteredList.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }

    // Generate HTML Markup
    if (filteredList.length === 0) {
      productsGrid.innerHTML = `
        <div class="empty-catalog-message">
          <svg style="width: 48px; height: 48px; fill: var(--accent-gold); margin-bottom: 1.5rem;" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <p>Aapke filters ke mutabik koi product nahi mila. Dusra query try karein.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = '';
    filteredList.forEach(product => {
      const saleBadgeHTML = product.onSale ? `<div class="new-card-badge">★ SALE</div>` : ``;
      const ratingStars = product.rating.includes('5') ? '★★★★★' : '★★★★☆';
      
      const cardHTML = `
        <div class="new-card animate-fade-in">
          ${saleBadgeHTML}
          
          <div class="new-card-img-wrapper">
            <img src="${product.image}" alt="${product.name}" class="new-card-img">
          </div>
          
          <div class="new-card-info">
            <span class="new-card-category">${product.category.toUpperCase()} / ${product.inStock ? 'IN STOCK' : 'OUT OF STOCK'}</span>
            <h3 class="new-card-title">${product.name}</h3>
            <span class="new-card-price">Rs.${product.price.toLocaleString()}</span>
            
            <div class="new-card-actions">
              <button class="btn-new-buy-now btn-catalog-buy">Buy Now</button>
              <button class="btn-new-add-to-cart btn-catalog-add" 
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
      productsGrid.insertAdjacentHTML('beforeend', cardHTML);
    });

    // Attach Add to Cart Listeners to Dynamic Cards
    productsGrid.querySelectorAll('.btn-catalog-add').forEach(btn => {
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

    // Buy Now Handler (adds to cart and goes direct to checkout slide-drawer)
    productsGrid.querySelectorAll('.btn-catalog-buy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const addBtn = e.target.nextElementSibling;
        if (addBtn) {
          addBtn.click();
        }
      });
    });
  }

  // --- FILTER WIDGET INTERACTIONS ---
  
  // Real-time Range input slider text display
  if (priceInput && priceDisplay) {
    priceInput.addEventListener('input', () => {
      const val = parseInt(priceInput.value, 10);
      priceDisplay.textContent = val.toLocaleString();
    });
  }

  // Click price "Filter" button
  if (btnPriceFilter && priceInput) {
    btnPriceFilter.addEventListener('click', () => {
      filterState.maxPrice = parseInt(priceInput.value, 10);
      renderCatalog();
    });
  }

  // Status checkbox changes
  if (chkOnSale) {
    chkOnSale.addEventListener('change', () => {
      filterState.onSale = chkOnSale.checked;
      renderCatalog();
    });
  }

  if (chkInStock) {
    chkInStock.addEventListener('change', () => {
      filterState.inStock = chkInStock.checked;
      renderCatalog();
    });
  }

  // Search input typing handler
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterState.searchQuery = searchInput.value;
      renderCatalog();
    });
  }

  // Brands category selection
  if (selectBrand) {
    selectBrand.addEventListener('change', () => {
      filterState.brandCategory = selectBrand.value;
      renderCatalog();
    });
  }

  // Sorting selection
  if (selectSort) {
    selectSort.addEventListener('change', () => {
      filterState.sortBy = selectSort.value;
      renderCatalog();
    });
  }

  // Initialize main catalog render
  renderCatalog();


  // --- HEADER SCROLL & BACK BUTTON ACTION ---
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });


  // --- MOBILE SLIDING MENU DRAWER SYSTEM ---
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
    if (!link.classList.contains('menu-track-trigger')) {
      link.addEventListener('click', closeMenu);
    }
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
    if (trackIdInput) trackIdInput.value = '';
    if (trackLoader) trackLoader.style.display = 'none';
    if (trackResults) trackResults.style.display = 'none';
  }

  trackTriggers.forEach(trigger => {
    trigger.addEventListener('click', openTrack);
  });

  if (btnCloseTrack) btnCloseTrack.addEventListener('click', closeTrack);
  if (trackOverlay) trackOverlay.addEventListener('click', closeTrack);

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

      if (trackResults) trackResults.style.display = 'none';
      if (trackLoader) trackLoader.style.display = 'flex';

      setTimeout(() => {
        if (trackLoader) trackLoader.style.display = 'none';
        if (trackResults) {
          trackResults.style.display = 'block';
          
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

    trackIdInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btnTrackSubmit.click();
      }
    });
  }

});
