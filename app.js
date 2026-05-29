/*
   Royal Essenza - Luxury Branding JavaScript
   Handles Shopping Cart state, Notes Explorer, scroll animations, and forms.
*/

document.addEventListener('DOMContentLoaded', () => {
  // --- HEADER SCROLL ACTION ---
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
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
});
