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
        if (!trackResults) return;

        // Fetch live order lookup from Firebase Realtime Database
        db.ref('orders').once('value').then((snapshot) => {
          if (trackLoader) trackLoader.style.display = 'none';
          if (!trackResults) return;

          const data = snapshot.val();
          let orders = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
          
          // Local cache fallback if Firebase has no records
          if (orders.length === 0) {
            try {
              const savedOrders = localStorage.getItem('royal-orders');
              if (savedOrders) orders = JSON.parse(savedOrders);
            } catch (e) {}
          }

          // Look up order by ID or phone number
          const order = orders.find(o => 
            o.id.toLowerCase() === trackingVal.toLowerCase() || 
            (o.customer && o.customer.phone && o.customer.phone.replace(/[^0-9]/g, '').includes(trackingVal.replace(/[^0-9]/g, '')))
          );

        if (order) {
          // 1. INJECT ORDER INFORMATION SUMMARY CARD
          let infoCard = document.getElementById('tracking-order-info-card');
          if (infoCard) infoCard.remove();
          
          infoCard = document.createElement('div');
          infoCard.id = 'tracking-order-info-card';
          infoCard.style.cssText = `
            background: #F7F5F0;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            font-family: var(--font-sans);
            font-size: 0.9rem;
            animation: fadeIn 0.6s ease forwards;
          `;
          
          const orderDateStr = new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          infoCard.innerHTML = `
            <h3 style="font-family: var(--font-serif); font-size: 1.15rem; color: #111111; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; font-weight: 500;">Order Information</h3>
            <div style="display: grid; grid-template-columns: 1fr; gap: 0.6rem; line-height: 1.5;">
              <div style="display: flex; justify-content: space-between;"><span><strong>Order ID:</strong> <span style="font-family: var(--font-number) !important; color: var(--accent-gold); font-weight: 700;">${order.id}</span></span> <span><strong>Date:</strong> ${orderDateStr}</span></div>
              <div><strong>Customer Name:</strong> ${order.customer.name}</div>
              <div><strong>Phone Number:</strong> ${order.customer.phone}</div>
              <div><strong>Delivery Destination:</strong> ${order.customer.address}, ${order.customer.city}</div>
              ${order.customer.notes ? `<div><strong>Notes:</strong> <span style="color: #666; font-style: italic;">"${order.customer.notes}"</span></div>` : ''}
              <div style="border-top: 1px dashed var(--border-color); padding-top: 0.8rem; margin-top: 0.4rem; display: flex; justify-content: space-between; align-items: center; font-weight: 600;">
                <span>Items: <span style="font-weight: normal; color: #555;">${order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</span></span>
                <span style="font-family: var(--font-number) !important; font-size: 1.1rem; color: var(--text-main);">PKR ${order.total.toLocaleString()}</span>
              </div>
            </div>
          `;
          trackResults.prepend(infoCard);

          // 2. CONFIGURE INTERACTIVE SHIPPING TIMELINE
          const steps = trackResults.querySelectorAll('.timeline-step');
          steps.forEach(step => {
            step.className = 'timeline-step'; // reset
          });

          const step1 = steps[0];
          const step2 = steps[1];
          const step3 = steps[2];
          const step4 = steps[3];

          const orderDate = new Date(order.date);
          const formatDate = (date, showTime = true) => {
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            const dateStr = date.toLocaleDateString('en-US', options);
            if (!showTime) return dateStr;
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
            const formattedHours = date.getHours() % 12 || 12;
            return `${dateStr} - ${formattedHours}:${minutes} ${ampm}`;
          };

          const statusTextElem = document.getElementById('status-value-text');
          
          let step3Desc = step3.querySelector('.step-desc');
          if (!step3Desc) {
            step3Desc = document.createElement('p');
            step3Desc.className = 'step-desc';
            step3Desc.style.marginTop = '0.5rem';
          }

          if (order.status === 'Pending') {
            statusTextElem.textContent = 'Pending Confirmation';
            statusTextElem.style.color = 'var(--accent-gold)';
            
            step1.classList.add('active');
            step2.classList.add('pending');
            step3.classList.add('pending');
            step4.classList.add('pending');
            
            document.getElementById('track-step1-time').textContent = formatDate(orderDate);
            document.getElementById('track-step2-time').textContent = 'Awaiting lab confirmation...';
            document.getElementById('track-step3-time').textContent = 'Pending';
            document.getElementById('track-step4-time').textContent = 'Pending';
            
            step3Desc.style.display = 'none';
          } else if (order.status === 'Processing') {
            statusTextElem.textContent = 'Processing & Lab Preparation';
            statusTextElem.style.color = 'var(--accent-gold)';
            
            step1.classList.add('completed');
            step2.classList.add('active');
            step3.classList.add('pending');
            step4.classList.add('pending');
            
            const procDate = new Date(orderDate);
            procDate.setHours(procDate.getHours() + 1); // Confirm after 1 hour
            
            document.getElementById('track-step1-time').textContent = formatDate(orderDate);
            document.getElementById('track-step2-time').textContent = formatDate(procDate);
            document.getElementById('track-step3-time').textContent = 'Awaiting courier dispatch...';
            document.getElementById('track-step4-time').textContent = 'Pending';
            
            step3Desc.style.display = 'none';
          } else if (order.status === 'Shipped') {
            statusTextElem.textContent = 'In Transit';
            statusTextElem.style.color = 'var(--accent-gold)';
            
            step1.classList.add('completed');
            step2.classList.add('completed');
            step3.classList.add('active');
            step4.classList.add('pending');
            
            const procDate = new Date(orderDate);
            procDate.setHours(procDate.getHours() + 1);
            const shipDate = new Date(orderDate);
            shipDate.setHours(shipDate.getHours() + 6); // Shipped after 6 hours
            
            document.getElementById('track-step1-time').textContent = formatDate(orderDate);
            document.getElementById('track-step2-time').textContent = formatDate(procDate);
            document.getElementById('track-step3-time').textContent = formatDate(shipDate);
            
            const expectedDeliv = new Date(shipDate);
            expectedDeliv.setDate(expectedDeliv.getDate() + 2); // 2 days transit expected
            document.getElementById('track-step4-time').textContent = 'Expected: ' + formatDate(expectedDeliv, false);
            
            step3Desc.textContent = `Your package has been carefully hand-distilled, sealed, and dispatched. It is currently in transit to ${order.customer.city} via Royal Concierge Courier.`;
            step3.querySelector('.timeline-info').appendChild(step3Desc);
            step3Desc.style.display = 'block';
          } else if (order.status === 'Delivered') {
            statusTextElem.textContent = 'Delivered';
            statusTextElem.style.color = '#2e7d32'; // luxury dark green
            
            step1.classList.add('completed');
            step2.classList.add('completed');
            step3.classList.add('completed');
            step4.classList.add('completed');
            
            const procDate = new Date(orderDate);
            procDate.setHours(procDate.getHours() + 1);
            const shipDate = new Date(orderDate);
            shipDate.setHours(shipDate.getHours() + 6);
            const delDate = new Date(orderDate);
            delDate.setDate(delDate.getDate() + 2); // delivered 2 days later
            
            document.getElementById('track-step1-time').textContent = formatDate(orderDate);
            document.getElementById('track-step2-time').textContent = formatDate(procDate);
            document.getElementById('track-step3-time').textContent = formatDate(shipDate);
            document.getElementById('track-step4-time').textContent = formatDate(delDate);
            
            step3Desc.textContent = `Your bespoke package was successfully handed over in ${order.customer.city}. Thank you for choosing Royal Essenza!`;
            step3.querySelector('.timeline-info').appendChild(step3Desc);
            step3Desc.style.display = 'block';
          } else if (order.status === 'Cancelled') {
            statusTextElem.textContent = 'Cancelled';
            statusTextElem.style.color = '#c62828'; // bold crimson red
            
            step1.classList.add('pending');
            step2.classList.add('pending');
            step3.classList.add('pending');
            step4.classList.add('pending');
            
            document.getElementById('track-step1-time').textContent = 'Cancelled';
            document.getElementById('track-step2-time').textContent = 'Cancelled';
            document.getElementById('track-step3-time').textContent = 'Cancelled';
            document.getElementById('track-step4-time').textContent = 'Cancelled';
            
            step3Desc.textContent = `This order has been cancelled by the concierge team. Please contact support.`;
            step3.querySelector('.timeline-info').appendChild(step3Desc);
            step3Desc.style.display = 'block';
          }

          trackResults.style.display = 'block';

        } else if (trackingVal.toUpperCase() === 'RE-DEMO-123') {
          // Fallback to Mockup Simulation
          let infoCard = document.getElementById('tracking-order-info-card');
          if (infoCard) infoCard.remove();

          const today = new Date();
          const formatDate = (date, showTime = true) => {
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            const dateStr = date.toLocaleDateString('en-US', options);
            if (!showTime) return dateStr;
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
            const formattedHours = date.getHours() % 12 || 12;
            return `${dateStr} - ${formattedHours}:${minutes} ${ampm}`;
          };

          const step1Date = new Date(today);
          step1Date.setDate(today.getDate() - 2);
          step1Date.setHours(10, 30);
          
          const step2Date = new Date(today);
          step2Date.setDate(today.getDate() - 2);
          step2Date.setHours(16, 15);
          
          const step3Date = new Date(today);
          step3Date.setDate(today.getDate() - 1);
          step3Date.setHours(9, 0);
          
          const step4Date = new Date(today);

          const step1Elem = document.getElementById('track-step1-time');
          const step2Elem = document.getElementById('track-step2-time');
          const step3Elem = document.getElementById('track-step3-time');
          const step4Elem = document.getElementById('track-step4-time');

          if (step1Elem) step1Elem.textContent = formatDate(step1Date);
          if (step2Elem) step2Elem.textContent = formatDate(step2Date);
          if (step3Elem) step3Elem.textContent = formatDate(step3Date);
          if (step4Elem) step4Elem.textContent = 'Expected: ' + formatDate(step4Date, false);

          const statusTextElem = document.getElementById('status-value-text');
          if (statusTextElem) {
            statusTextElem.textContent = 'In Transit';
            statusTextElem.style.color = 'var(--accent-gold)';
          }

          const steps = trackResults.querySelectorAll('.timeline-step');
          steps.forEach(step => {
            step.className = 'timeline-step'; // reset
          });
          steps[0].classList.add('completed');
          steps[1].classList.add('completed');
          steps[2].classList.add('active');
          steps[3].classList.add('pending');

          const step3Desc = steps[2].querySelector('.step-desc');
          if (step3Desc) {
            step3Desc.style.display = 'block';
            step3Desc.textContent = 'Your bespoke aromatic package is with our premium courier service in Dubai, currently in transit to your destination.';
          }

          trackResults.style.display = 'block';

        } else {
          // Order Not Found Error
          let infoCard = document.getElementById('tracking-order-info-card');
          if (infoCard) infoCard.remove();

          alert("Order ID not found! Enter a valid ID (e.g. RE-1008) or try our simulator tracking ID: RE-DEMO-123");
        }

        // Animate timeline dots sequentially for ultimate premium touch!
        const stepsToAnimate = trackResults.querySelectorAll('.timeline-step');
        stepsToAnimate.forEach((step, index) => {
          step.style.opacity = '0';
          step.style.transform = 'translateY(15px)';
          step.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          
          setTimeout(() => {
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
          }, index * 150);
        }).catch(err => {
          console.error('Firebase tracking lookup failed:', err);
          if (trackLoader) trackLoader.style.display = 'none';
        });
      });

    // Auto-fill from URL param if available
    const urlParams = new URLSearchParams(window.location.search);
    const trackIdParam = urlParams.get('id');
    if (trackIdParam) {
      trackInput.value = trackIdParam;
      setTimeout(() => {
        btnTrackSubmit.click();
      }, 500);
    }

    // Support tracking trigger on Enter keypress
    trackInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btnTrackSubmit.click();
      }
    });
  }
});
});
