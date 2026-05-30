/*
   Royal Essenza - Dynamic Product Detail Sub-page Logic
   Handles URL query parameters loading, dynamic database population,
   interactive thumbnail swaps, quantity counter updates, and synced e-commerce cart.
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
  
  // --- DETAILED PRODUCT SPECIFICATIONS DATABASE ---
  const defaultProductDetailsDB = {};

  // Merge dynamic products database to support dynamically added detail pages
  let PRODUCT_DETAILS_DB = defaultProductDetailsDB;
  try {
    const savedProducts = localStorage.getItem('royal-products');
    if (savedProducts) {
      const dynamicProducts = JSON.parse(savedProducts);
      
      // Rebuild the product specs DB with dynamic updates
      const updatedDB = {};
      dynamicProducts.forEach(product => {
        const id = product.id;
        
        // If it's a default product, merge dynamic values
        if (defaultProductDetailsDB[id]) {
          updatedDB[id] = {
            ...defaultProductDetailsDB[id],
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category.toUpperCase() + ' / UNISEX',
            gallery: [product.image, product.image]
          };
        } else {
          // If it's a completely new product created by the admin
          updatedDB[id] = {
            id: id,
            name: product.name,
            price: product.price,
            category: product.category.toUpperCase() + ' / PREMIUM',
            image: product.image,
            rating: product.rating ? product.rating.split(' ')[0] : '5.0',
            reviewsCount: '1 Verified Review',
            description: product.description || 'A premium luxury creation from Royal Essenza. Handcrafted using the finest botanical oils and fragrance profiles for majestic longevity.',
            notes: {
              top: product.noteTop || 'Vibrant Citrus & Soft Rose',
              heart: product.noteHeart || 'Gilded Kashmir Saffron & Spices',
              base: product.noteBase || 'Pure Cambodian Oud & Warm Amber'
            },
            gallery: [product.image, product.image]
          };
        }
      });
      PRODUCT_DETAILS_DB = updatedDB;
    }
  } catch (e) {
    console.error('Failed to parse dynamic products in details page:', e);
  }

  function renderDetails() {
    // --- PARSE URL SEARCH ID PARAMETERS ---
    const urlParams = new URLSearchParams(window.location.search);
    let productId = urlParams.get('id');
    
    // Symmetrical mapper for landing page IDs to database IDs
    if (productId === 'hajj-serenity') productId = 'hajj-serenity-giftset';
    if (productId === 'cherry-wood-new') productId = 'cherry-wood-perfume';
    if (productId === 'evoke-red-new') productId = 'evoke-red-female';

    // Default to Oud Imperial if product not found or ID is missing
    let currentProduct = PRODUCT_DETAILS_DB[productId];
    if (!currentProduct && productId === 'top-running-scent') {
      currentProduct = {
        id: 'top-running-scent',
        name: 'Crystal Noir',
        price: 15500,
        category: 'EXTRAIT DE PARFUM / SIGNATURE FEATURED',
        image: 'assets/signature_scent.png',
        rating: '5.0',
        reviewsCount: '1 Verified Review',
        description: 'An opulent royal symphony designed for absolute majesty. Featuring dynamic opening notes of velvet cardamom and ginger, a heart of rich coconut nectar and kashmir gardenia, grounded in deep black amber and soft musk.',
        notes: {
          top: 'Velvet Cardamom & Fresh Ginger',
          heart: 'Rich Coconut Nectar & Kashmir Gardenia',
          base: 'Deep Black Amber & Soft Musk'
        },
        gallery: ['assets/signature_scent.png', 'assets/signature_scent.png']
      };
    } else if (!currentProduct) {
      currentProduct = PRODUCT_DETAILS_DB['perfume-oud-imperial'];
    }

    // --- DYNAMICALLY INJECT PRODUCT DETAILS ---
    const breadcrumbName = document.getElementById('breadcrumb-product-name');
    const mainActiveImage = document.getElementById('main-active-perfume-image');
    const productThumbnailsContainer = document.getElementById('product-thumbnails-container');
    
    const noteTop = document.getElementById('note-top-value');
    const noteHeart = document.getElementById('note-heart-value');
    const noteBase = document.getElementById('note-base-value');
    
    const productBadge = document.getElementById('product-badge-text');
    const productTitle = document.getElementById('product-title-text');
    const productRatingStars = document.getElementById('product-rating-stars');
    const productDesc = document.getElementById('product-desc-text');
    const productPrice = document.getElementById('product-price-text');
    
    // Set basic details
    if (breadcrumbName) breadcrumbName.textContent = currentProduct.name;
    if (productBadge) productBadge.textContent = currentProduct.category.split('/')[0].trim();
    if (productTitle) productTitle.textContent = currentProduct.name;
    if (productRatingStars) productRatingStars.textContent = currentProduct.rating + ' ';
    if (productPrice) productPrice.textContent = 'PKR ' + currentProduct.price.toLocaleString();
    
    // Scent notes
    if (noteTop) noteTop.textContent = currentProduct.notes.top;
    if (noteHeart) noteHeart.textContent = currentProduct.notes.heart;
    if (noteBase) noteBase.textContent = currentProduct.notes.base;

    // Manage dynamic product descriptions and toggle collapsible SEE MORE
    let descText = currentProduct.description;
    let isTruncated = true;
    const maxWords = 28;
    const btnSeeMoreToggle = document.getElementById('btn-see-more-toggle');

    function renderDescription() {
      if (!productDesc) return;
      if (isTruncated && descText.split(' ').length > maxWords) {
        const truncated = descText.split(' ').slice(0, maxWords).join(' ') + '...';
        productDesc.textContent = truncated;
        if (btnSeeMoreToggle) btnSeeMoreToggle.style.display = 'inline-block';
      } else {
        productDesc.textContent = descText;
        if (btnSeeMoreToggle) btnSeeMoreToggle.textContent = 'See Less';
      }
    }

    renderDescription();

    if (btnSeeMoreToggle) {
      // Re-add to avoid duplicates
      btnSeeMoreToggle.replaceWith(btnSeeMoreToggle.cloneNode(true));
      const newToggle = document.getElementById('btn-see-more-toggle');
      newToggle.addEventListener('click', (e) => {
        e.preventDefault();
        isTruncated = !isTruncated;
        if (isTruncated) {
          renderDescription();
          newToggle.textContent = 'See More';
        } else {
          renderDescription();
        }
      });
    }

    // Gallery Setup
    if (mainActiveImage) {
      mainActiveImage.src = currentProduct.gallery[0];
      mainActiveImage.alt = currentProduct.name;
    }

    if (productThumbnailsContainer) {
      productThumbnailsContainer.innerHTML = '';
      currentProduct.gallery.forEach((imgSrc, idx) => {
        const isActive = idx === 0 ? 'active' : '';
        const thumbBtn = document.createElement('button');
        thumbBtn.className = `product-thumbnail-btn ${isActive}`;
        thumbBtn.setAttribute('aria-label', `View thumbnail ${idx + 1}`);
        
        // Customize Thumbnail 2 with a styled zoom close-up to resemble dynamic active view
        const customClass = idx === 1 ? 'style="transform: scale(1.4); filter: saturate(1.1);"' : '';
        
        thumbBtn.innerHTML = `<img src="${imgSrc}" ${customClass} alt="${currentProduct.name} view" class="product-thumbnail-img">`;
        
        thumbBtn.addEventListener('click', () => {
          // Remove active class from all thumb buttons
          document.querySelectorAll('.product-thumbnail-btn').forEach(btn => btn.classList.remove('active'));
          thumbBtn.classList.add('active');
          
          // Swap active main image
          if (mainActiveImage) {
            mainActiveImage.style.opacity = '0';
            setTimeout(() => {
              mainActiveImage.src = imgSrc;
              // Apply scale zoom on secondary thumbnail view for close-up detail experience
              if (idx === 1) {
                mainActiveImage.style.transform = 'scale(1.25)';
              } else {
                mainActiveImage.style.transform = 'scale(1.05)';
              }
              mainActiveImage.style.opacity = '1';
            }, 150);
          }
        });
        
        productThumbnailsContainer.appendChild(thumbBtn);
      });
    }
  }

  // Initial local render
  renderDetails();

  // Real-time Firebase Sync for products specs
  db.ref('products').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const dynamicProducts = Array.isArray(data) ? data : Object.values(data);
      const updatedDB = {};
      dynamicProducts.forEach(product => {
        const id = product.id;
        
        // If it's a default product, merge dynamic values
        if (defaultProductDetailsDB[id]) {
          updatedDB[id] = {
            ...defaultProductDetailsDB[id],
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category.toUpperCase() + ' / UNISEX',
            gallery: [product.image, product.image]
          };
        } else {
          // If it's a completely new product created by the admin
          updatedDB[id] = {
            id: id,
            name: product.name,
            price: product.price,
            category: product.category.toUpperCase() + ' / PREMIUM',
            image: product.image,
            rating: product.rating ? product.rating.split(' ')[0] : '5.0',
            reviewsCount: '1 Verified Review',
            description: product.description || 'A premium luxury creation from Royal Essenza. Handcrafted using the finest botanical oils and fragrance profiles for majestic longevity.',
            notes: {
              top: product.noteTop || 'Vibrant Citrus & Soft Rose',
              heart: product.noteHeart || 'Gilded Kashmir Saffron & Spices',
              base: product.noteBase || 'Pure Cambodian Oud & Warm Amber'
            },
            gallery: [product.image, product.image]
          };
        }
      });
      PRODUCT_DETAILS_DB = updatedDB;
      
      // Inject top running scent if it was loaded previously
      if (currentTopRunningScentDetails) {
        PRODUCT_DETAILS_DB['top-running-scent'] = currentTopRunningScentDetails;
      }
      
      renderDetails();
    }
  }, err => console.error('Failed to sync details with Firebase:', err));

  // Sync custom signature centerpiece fragrance detail specs
  let currentTopRunningScentDetails = null;
  db.ref('topRunningScent').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      currentTopRunningScentDetails = {
        id: 'top-running-scent',
        name: data.name,
        price: data.price,
        category: data.category.toUpperCase() + ' / SIGNATURE FEATURED',
        image: data.image,
        rating: '5.0',
        reviewsCount: '1 Verified Review',
        description: data.desc || 'A premium luxury creation from Royal Essenza. Handcrafted using the finest fragrance profiles for majestic sillage.',
        notes: {
          top: 'Vibrant Citrus & Soft Rose',
          heart: 'Gilded Kashmir Saffron & Spices',
          base: 'Pure Cambodian Oud & Warm Amber'
        },
        gallery: [data.image, data.image]
      };
      PRODUCT_DETAILS_DB['top-running-scent'] = currentTopRunningScentDetails;
      renderDetails();
    }
  });


  // --- LOCALSTORAGE SYNCED CART STATE DRAWER ---
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

  if (btnCloseCart) btnCloseCart.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  function saveCartAndSync() {
    try {
      localStorage.setItem('royal-cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
    updateCartUI();
  }

  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadges.forEach(badge => {
      badge.textContent = totalCount;
    });

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

      // Attach Quantity Handlers inside sliding cart
      cartItemsWrapper.querySelectorAll('.btn-qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const itemId = e.target.closest('.cart-item').getAttribute('data-id');
          adjustCartQty(itemId, -1);
        });
      });

      cartItemsWrapper.querySelectorAll('.btn-qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const itemId = e.target.closest('.cart-item').getAttribute('data-id');
          adjustCartQty(itemId, 1);
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

  function adjustCartQty(id, change) {
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
      const newOrder = {
        id: orderID,
        customer: {
          name: document.getElementById('checkout-name').value.trim(),
          phone: document.getElementById('checkout-phone').value.trim(),
          address: document.getElementById('checkout-address').value.trim(),
          city: document.getElementById('checkout-city').value.trim(),
          notes: document.getElementById('checkout-notes').value.trim()
        },
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        date: new Date().toISOString(),
        status: 'Pending'
      };

      let orders = [];
      try {
        const savedOrders = localStorage.getItem('royal-orders');
        if (savedOrders) orders = JSON.parse(savedOrders);
      } catch (err) {
        console.error(err);
      }
      orders.unshift(newOrder);
      localStorage.setItem('royal-orders', JSON.stringify(orders));

      // Increment stats order count
      let stats = { totalVisitors: 169, todaysVisitors: 2, totalOrders: 0 };
      try {
        const savedStats = localStorage.getItem('royal-stats');
        if (savedStats) stats = JSON.parse(savedStats);
      } catch (err) {}
      stats.totalOrders = (stats.totalOrders || 0) + 1;
      localStorage.setItem('royal-stats', JSON.stringify(stats));

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
      }
    } catch (e) {}

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

  updateCartUI();

  // Attach Checkout Button Handlers
  document.querySelectorAll('.btn-checkout').forEach(btn => {
    btn.addEventListener('click', openCheckoutModal);
  });

  // --- QUANTITY SELECTOR ON PRODUCT DETAIL CANVAS ---
  const btnQtyDec = document.getElementById('btn-qty-decrement');
  const btnQtyInc = document.getElementById('btn-qty-increment');
  const qtyInput = document.getElementById('detail-qty-input');

  if (btnQtyDec && btnQtyInc && qtyInput) {
    btnQtyDec.addEventListener('click', () => {
      let currentVal = parseInt(qtyInput.value, 10);
      if (isNaN(currentVal) || currentVal <= 1) return;
      qtyInput.value = currentVal - 1;
    });

    btnQtyInc.addEventListener('click', () => {
      let currentVal = parseInt(qtyInput.value, 10);
      if (isNaN(currentVal)) {
        qtyInput.value = 1;
        return;
      }
      qtyInput.value = currentVal + 1;
    });
  }

  // --- ADD TO CART ACTIONS ---
  const btnAddToCart = document.getElementById('btn-detail-add-to-cart');
  const btnBuyNow = document.getElementById('btn-detail-buy-now');

  function addProductToCart(quantityVal) {
    const id = currentProduct.id;
    const name = currentProduct.name;
    const price = currentProduct.price;
    const image = currentProduct.image;

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += quantityVal;
    } else {
      cart.push({ id, name, price, image, quantity: quantityVal });
    }
    saveCartAndSync();
  }

  if (btnAddToCart && qtyInput) {
    btnAddToCart.addEventListener('click', () => {
      const quantityVal = parseInt(qtyInput.value, 10) || 1;
      addProductToCart(quantityVal);
      openCart();
    });
  }

  if (btnBuyNow && qtyInput) {
    btnBuyNow.addEventListener('click', () => {
      const quantityVal = parseInt(qtyInput.value, 10) || 1;
      addProductToCart(quantityVal);
      openCart();
    });
  }

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
    link.addEventListener('click', closeMenu);
  });
  
  // --- HEADER SCROLL ACTION ---
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

});
