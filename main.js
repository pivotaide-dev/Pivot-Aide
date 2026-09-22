/* ═══════════════════════════════════════════════════════════════════
   PIVOT AIDE — MAIN JAVASCRIPT
   Canvas frame-by-frame video animation + scroll effects + interactions
═══════════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════════════════
   HERO VIDEO FRAME ANIMATION ENGINE
   Loads all 11 PNG frames and plays them as a smooth looping video
   on an HTML5 <canvas> element. Includes cross-fade, playback control,
   scrubbing, and responsive resize.
═══════════════════════════════════════════════════════════════════ */
(function HeroBackgroundEngine() {
  const canvas = document.getElementById('heroCanvas') || document.getElementById('heroVideoCanvas');
  const loading = document.getElementById('heroLoading');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  let isPlaying = true;
  let rafId = null;

  // Mouse interaction state
  let mouse = { x: null, y: null, active: false, radius: 160 };

  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });
    heroSection.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
      mouse.active = false;
    });
  }

  // Particle Class
  class Node {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : (Math.random() > 0.5 ? -10 : H + 10);
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.r = Math.random() * 2.2 + 1.2;
      this.color = Math.random() > 0.85 
        ? 'rgba(234,228,47,0.75)'  // Yellow accent
        : 'rgba(92,168,232,0.65)';  // Steel blue
    }

    update() {
      // Float
      this.x += this.vx;
      this.y += this.vy;

      // Mouse interactive push/pull
      if (mouse.active && mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          // Push particles away gently
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 1.5;
          this.y += Math.sin(angle) * force * 1.5;
        }
      }

      // Out of bounds reset
      if (this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) {
        this.reset(false);
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      // Add a subtle glow for yellow nodes
      if (this.color.includes('234')) {
        ctx.shadowColor = 'rgba(234,228,47,0.6)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  // Populate nodes list
  const NODES_COUNT = 45;
  const nodes = Array.from({ length: NODES_COUNT }, () => new Node());

  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      // Connect to mouse if close
      if (mouse.active && mouse.x !== null && mouse.y !== null) {
        const dx = nodes[i].x - mouse.x;
        const dy = nodes[i].y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          // Golden connection line to cursor
          ctx.strokeStyle = `rgba(234, 228, 47, ${(1 - dist/150) * 0.18})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Connect to other nodes
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          // Steel blue network connection line
          ctx.strokeStyle = `rgba(107, 139, 173, ${(1 - dist/130) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function resizeCanvas() {
    const parent = canvas.parentElement.parentElement;
    W = canvas.width = parent ? parent.offsetWidth : window.innerWidth;
    H = canvas.height = parent ? parent.offsetHeight : window.innerHeight;
  }

  function loop() {
    if (!isPlaying) return;
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(node => {
      node.update();
      node.draw();
    });
    drawConnections();
    rafId = requestAnimationFrame(loop);
  }

  function startPlayback() {
    if (!isPlaying) {
      isPlaying = true;
      loop();
    }
  }

  function stopPlayback() {
    isPlaying = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Window Resize
  window.addEventListener('resize', () => {
    resizeCanvas();
  }, { passive: true });

  // Tab visibility observer
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopPlayback();
    else startPlayback();
  });

  // Intersection observer to pause off-screen
  if (heroSection) {
    const heroObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) startPlayback();
      else stopPlayback();
    }, { threshold: 0.05 });
    heroObs.observe(heroSection);
  }

  // Boot Canvas
  resizeCanvas();
  
  // Hide loading overlay immediately on canvas boot
  if (loading) {
    loading.classList.add('hidden');
    setTimeout(() => { loading.style.display = 'none'; }, 700);
  }

  loop();
})();


/* ═══════════════════════════════════════════════════════════════════
   NAVBAR SCROLL
═══════════════════════════════════════════════════════════════════ */
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let isScrolled = false;
  let scrollRafActive = false;

  window.addEventListener('scroll', () => {
    if (!scrollRafActive) {
      scrollRafActive = true;
      requestAnimationFrame(checkScroll);
    }
  }, { passive: true });

  function checkScroll() {
    const shouldScroll = window.scrollY > 60;
    if (shouldScroll !== isScrolled) {
      isScrolled = shouldScroll;
      navbar.classList.toggle('scrolled', isScrolled);
    }
    scrollRafActive = false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      navbar.classList.add('loaded');
    });
  } else {
    navbar.classList.add('loaded');
  }
})();


/* ═══════════════════════════════════════════════════════════════════
   MOBILE MENU
═══════════════════════════════════════════════════════════════════ */
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu   = document.getElementById('mobileMenu');

function closeMobileMenu() {
  mobileToggle && mobileToggle.classList.remove('open');
  mobileMenu   && mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
  document.body.classList.remove('menu-open');
}
window.closeMobileMenu = closeMobileMenu;

mobileToggle && mobileToggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  mobileToggle.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
  document.body.classList.toggle('menu-open', isOpen);
});

document.addEventListener('click', (e) => {
  if (mobileMenu && mobileMenu.classList.contains('open')) {
    if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
      closeMobileMenu();
    }
  }
});

if (mobileMenu) {
  // Mobile Dropdown Accordion Collapsible Logic
  const dropdownContainers = mobileMenu.querySelectorAll('.mobile-dropdown-container');
  dropdownContainers.forEach(container => {
    const trigger = container.querySelector('.mobile-dropdown-trigger, .mobile-link');
    if (trigger) {
      trigger.style.cursor = 'pointer';
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = container.classList.contains('open');
        container.classList.toggle('open', !isOpen);
      });
    }

    // Auto-expand if active page is inside this container
    if (container.querySelector('.mobile-sublink.active')) {
      container.classList.add('open');
    }
  });

  // Close mobile drawer when clicking a sublink or standalone link
  mobileMenu.querySelectorAll('.mobile-sublink, a.mobile-link:not(.mobile-dropdown-trigger)').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════
   DESKTOP NAVBAR DROPDOWN CLICK INTERACTION
   ═══════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.nav-item-dropdown').forEach(dropdown => {
  const link = dropdown.querySelector('.nav-link');
  if (link) {
    link.addEventListener('click', (e) => {
      // If clicking inside the dropdown menu items, allow normal navigation
      if (e.target.closest('.nav-dropdown-menu')) return;
      
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');

      // Close any other open dropdowns
      document.querySelectorAll('.nav-item-dropdown.open').forEach(other => {
        if (other !== dropdown) other.classList.remove('open');
      });

      // Toggle current dropdown
      dropdown.classList.toggle('open', !isOpen);
    });
  }
});

// Close desktop dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-item-dropdown')) {
    document.querySelectorAll('.nav-item-dropdown.open').forEach(dropdown => {
      dropdown.classList.remove('open');
    });
  }
});


/* ═══════════════════════════════════════════════════════════════════
   FAQ ACCORDION INTERACTION
   ═══════════════════════════════════════════════════════════════════ */
(function() {
  const triggers = document.querySelectorAll('.faq-trigger');
  
  // Wrap FAQ content text nodes in paragraph elements for stagger animations
  const faqContentInners = document.querySelectorAll('.faq-content-inner');
  faqContentInners.forEach(inner => {
    if (inner.children.length === 0) {
      const text = inner.innerHTML;
      inner.innerHTML = `<p>${text}</p>`;
    }
  });

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item   = trigger.parentElement;
      const content = item.querySelector('.faq-content');
      const isOpen  = item.classList.contains('open');

      // Close all other active items
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('open')) {
          otherItem.classList.remove('open');
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          const otherInner = otherItem.querySelector('.faq-content-inner');
          if (otherInner) {
            otherInner.querySelectorAll('*').forEach(child => child.classList.remove('visible'));
          }
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        const inner = content.querySelector('.faq-content-inner');
        if (inner) {
          inner.querySelectorAll('*').forEach(child => child.classList.remove('visible'));
        }
      } else {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        const inner = content.querySelector('.faq-content-inner');
        if (inner) {
          const children = inner.querySelectorAll('*');
          children.forEach((child, index) => {
            setTimeout(() => {
              if (item.classList.contains('open')) {
                child.classList.add('visible');
              }
            }, index * 60);
          });
        }
      }
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   SCROLL ANIMATIONS (IntersectionObserver)
═══════════════════════════════════════════════════════════════════ */
let intersectQueue = [];
let staggerTimeout = null;

const animObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        intersectQueue.push(entry.target);
      } else {
        // Remove 'in-view' when elements go completely off-screen in either direction
        const rect = entry.target.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > (window.innerHeight || document.documentElement.clientHeight)) {
          entry.target.classList.remove('in-view');
        }
        const idx = intersectQueue.indexOf(entry.target);
        if (idx > -1) intersectQueue.splice(idx, 1);
      }
    });

    if (intersectQueue.length > 0) {
      if (staggerTimeout) clearTimeout(staggerTimeout);
      staggerTimeout = setTimeout(() => {
        const toAnimate = intersectQueue.filter(el => !el.classList.contains('in-view'));
        
        // Sort by row (vertically) and then left-to-right (horizontally)
        toAnimate.sort((a, b) => {
          const rectA = a.getBoundingClientRect();
          const rectB = b.getBoundingClientRect();
          if (Math.abs(rectA.top - rectB.top) < 30) {
            return rectA.left - rectB.left;
          }
          return rectA.top - rectB.top;
        });

        toAnimate.forEach((el, index) => {
          const baseDelay = parseInt(el.dataset.delay || 0);
          const staggerDelay = index * 80;
          setTimeout(() => {
            el.classList.add('in-view');
          }, baseDelay + staggerDelay);
        });

        intersectQueue = [];
      }, 30);
    }
  },
  { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
);
document.querySelectorAll('.animate-on-scroll').forEach(el => animObserver.observe(el));


/* ═══════════════════════════════════════════════════════════════════
   COUNTER ANIMATION
═══════════════════════════════════════════════════════════════════ */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target);
  const duration = 1800;
  const start    = performance.now();
  function update(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(eased * target);
    if (t < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

const counterObs = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.counter').forEach(animateCounter);
        counterObs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);
const whyStats = document.querySelector('.why-stats');
// if (whyStats) counterObs.observe(whyStats);


/* ═══════════════════════════════════════════════════════════════════
   PLATFORM TABS
═══════════════════════════════════════════════════════════════════ */
const platformTabs = document.querySelectorAll('.platform-tab');
const tabUrls = {
  finance:    'pivotaide.com/finance',
  payroll:    'pivotaide.com/payroll',
  accounting: 'pivotaide.com/accounting',
  reporting:  'pivotaide.com/reports',
};
const tabContentIds = {
  finance:    'pwTabFinance',
  payroll:    'pwTabPayroll',
  accounting: 'pwTabAccounting',
  reporting:  'pwTabReporting',
};

platformTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    platformTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const pwUrl = document.getElementById('pwUrl');
    if (pwUrl) pwUrl.textContent = tabUrls[tabName] || 'pivotaide.com';

    document.querySelectorAll('.pw-tab-content').forEach(content => {
      if (content.classList.contains('active')) {
        content.style.opacity   = '0';
        content.style.transform = 'translateX(-10px)';
        setTimeout(() => {
          content.classList.remove('active');
          content.style.opacity   = '';
          content.style.transform = '';
        }, 200);
      }
    });

    const newContent = document.getElementById(tabContentIds[tabName]);
    if (newContent) {
      setTimeout(() => {
        newContent.classList.add('active');
        newContent.style.opacity   = '0';
        newContent.style.transform = 'translateX(10px)';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          newContent.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          newContent.style.opacity    = '1';
          newContent.style.transform  = 'translateX(0)';
          setTimeout(() => { newContent.style.transition = ''; }, 300);
        }));
      }, 200);
    }
  });
});


/* ═══════════════════════════════════════════════════════════════════
   FORM SUBMISSION
═══════════════════════════════════════════════════════════════════ */
window.handleFormSubmit = function(e) {
  e.preventDefault();
  const btn      = document.getElementById('formSubmitBtn');
  const name     = document.getElementById('cfName');
  const email    = document.getElementById('cfEmail');
  const phone    = document.getElementById('cfPhone');
  const company  = document.getElementById('cfCompany');
  const industry = document.getElementById('cfIndustry');
  const service  = document.getElementById('cfService');
  const message  = document.getElementById('cfMessage');

  let valid = true;

  // Validate fields
  [name, email, phone, company, industry, service, message].forEach(field => {
    if (!field || !field.value.trim()) {
      if (field) {
        field.classList.remove('valid');
        field.classList.add('invalid');
        
        const eventType = field.tagName === 'SELECT' ? 'change' : 'input';
        field.addEventListener(eventType, () => {
          field.classList.remove('invalid');
        }, { once: true });
      }
      valid = false;
    } else {
      if (field) {
        field.classList.remove('invalid');
        field.classList.add('valid');
      }
    }
  });

  // Additional email check
  if (email && email.value.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      email.classList.remove('valid');
      email.classList.add('invalid');
      valid = false;
    }
  }

  if (!valid) return;

  if (btn) {
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" style="animation:spin 1s linear infinite;margin-right:8px;vertical-align:middle;"><circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none"/><path d="M9 2a7 7 0 0 1 7 7" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/></svg> Processing...`;
    
    // Construct lead routing payload
    const payload = {
      access_key: '938c9251-8a3e-4030-9e87-852996b601d7',
      name: name ? name.value.trim() : '',
      email: email ? email.value.trim() : '',
      phone: phone ? phone.value.trim() : '',
      company: company ? company.value.trim() : '',
      industry: industry ? industry.value : '',
      service: service ? service.value.trim() : '',
      message: message ? message.value.trim() : '',
      subject: `New Consultation Request from ${name ? name.value.trim() : 'Pivot Aide'}`
    };

    if (!document.getElementById('spinStyle')) {
      const s = document.createElement('style');
      s.id = 'spinStyle';
      s.textContent = '@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(async (response) => {
      let json = await response.json();
      if (response.status == 200) {
        btn.innerHTML = `✓ Submitted`;
        // Reset form fields
        [name, email, phone, company, industry, service, message].forEach(field => {
          if (field) {
            field.value = '';
            field.classList.remove('valid', 'invalid');
          }
        });
        showToast('Inquiry Submitted', 'We will be in touch within one business day.');
      } else {
        console.log(json);
        showToast('Error', json.message || 'Something went wrong.');
      }
    })
    .catch(error => {
      console.log(error);
      showToast('Error', 'Form submission failed.');
    })
    .then(() => {
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.disabled  = false;
      }, 2000);
    });
  }
};

function showToast(title, msg) {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast) return;
  if (toastTitle) toastTitle.textContent = title;
  if (toastMsg) toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4500);
}

// Bind form submission on load
(function() {
  const form = document.getElementById('consultForm');
  if (form) {
    form.addEventListener('submit', window.handleFormSubmit);
  }
})();

// Bind checklist form submission on load
(function() {
  const form = document.getElementById('checklistForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const btn = document.getElementById('checklistSubmitBtn');
    const name = document.getElementById('fName');
    const email = document.getElementById('fEmail');
    const company = document.getElementById('fCompany');
    const companySize = document.getElementById('fCompanySize');

    let valid = true;

    // Validate fields
    [name, email, company, companySize].forEach(field => {
      if (!field || !field.value.trim()) {
        if (field) {
          field.classList.remove('valid');
          field.classList.add('invalid');
          
          const eventType = field.tagName === 'SELECT' ? 'change' : 'input';
          field.addEventListener(eventType, () => {
            field.classList.remove('invalid');
          }, { once: true });
        }
        valid = false;
      } else {
        if (field) {
          field.classList.remove('invalid');
          field.classList.add('valid');
        }
      }
    });

    // Email check
    if (email && email.value.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.classList.remove('valid');
        email.classList.add('invalid');
        valid = false;
      }
    }

    if (!valid) return;

    if (btn) {
      const orig = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" style="animation:spin 1s linear infinite;margin-right:8px;vertical-align:middle;"><circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none"/><path d="M9 2a7 7 0 0 1 7 7" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/></svg> Processing...`;

      const payload = {
        access_key: '938c9251-8a3e-4030-9e87-852996b601d7',
        name: name ? name.value.trim() : '',
        email: email ? email.value.trim() : '',
        company: company ? company.value.trim() : '',
        companySize: companySize ? companySize.value : '',
        service: 'Funding Readiness Checklist Request',
        subject: `New Checklist Request from ${name ? name.value.trim() : 'Pivot Aide'}`
      };

      if (!document.getElementById('spinStyle')) {
        const s = document.createElement('style');
        s.id = 'spinStyle';
        s.textContent = '@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
        document.head.appendChild(s);
      }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(async (response) => {
        let json = await response.json();
        if (response.status == 200) {
          btn.innerHTML = `✓ Submitted`;
          // Reset form fields
          [name, email, company, companySize].forEach(field => {
            if (field) {
              field.value = '';
              field.classList.remove('valid', 'invalid');
            }
          });
          showToast('Checklist Submitted', 'Your free checklist has been sent to your email.');
        } else {
          console.log(json);
          showToast('Error', json.message || 'Something went wrong.');
        }
      })
      .catch(error => {
        console.log(error);
        showToast('Error', 'Submission failed.');
      })
      .then(() => {
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.disabled = false;
        }, 2000);
      });
    }
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   STAT PROGRESS BAR ANIMATION
═══════════════════════════════════════════════════════════════════ */
(function() {
  const statObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat-progress-bar').forEach(bar => {
            const target = bar.style.width;
            bar.style.width      = '0%';
            bar.style.transition = 'width 1.5s cubic-bezier(0.4,0,0.2,1)';
            setTimeout(() => { bar.style.width = target; }, 200);
          });
          statObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  // document.querySelectorAll('.stats-grid').forEach(g => statObs.observe(g));
})();


/* ═══════════════════════════════════════════════════════════════════
   3D TILT ON CARDS
═══════════════════════════════════════════════════════════════════ */
(function() {
  document.querySelectorAll('.service-card, .testi-card, .stat-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${y * -6}deg) rotateY(${x * 6}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   ACTIVE NAV LINK ON SCROLL
═══════════════════════════════════════════════════════════════════ */
(function() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  // Map section IDs to nav link hrefs
  const sectionMap = {
    'hero':          '#hero',
    'services':      '#services',
    'why-us':        '#why-us',
    'dashboard':     '#dashboard',
    'how':           '#dashboard',
    'testimonials':  '#testimonials',
    'faq':           '#testimonials',
    'consultation':  '#consultation',
  };

  function setActive(sectionId) {
    const href = sectionMap[sectionId];
    navLinks.forEach(link => {
      const matches = link.getAttribute('href') === href;
      link.classList.toggle('active', matches);
    });
  }

  const secObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { threshold: 0.35, rootMargin: '-80px 0px 0px 0px' }
  );
  sections.forEach(s => secObs.observe(s));
})();



/* ═══════════════════════════════════════════════════════════════════
   BACKGROUND PARTICLE CANVAS (subtle, interactive, all pages)
═══════════════════════════════════════════════════════════════════ */
(function() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0.22;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  // Global document-level mouse tracker
  let docMouse = { x: null, y: null, active: false };
  document.addEventListener('mousemove', (e) => {
    docMouse.x = e.clientX;
    docMouse.y = e.clientY;
    docMouse.active = true;
  }, { passive: true });
  document.addEventListener('mouseleave', () => {
    docMouse.active = false;
  });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.vx    = (Math.random() - 0.5) * 0.22;
      this.vy    = (Math.random() - 0.5) * 0.22;
      this.r     = Math.random() * 1.2 + 0.3;
      this.alpha = Math.random() * 0.35 + 0.05;
      this.color = Math.random() > 0.6
        ? `rgba(11,29,57,${this.alpha})`
        : Math.random() > 0.5
        ? `rgba(216,183,74,${this.alpha * 0.7})`
        : `rgba(49,93,131,${this.alpha * 0.4})`;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      // React gently to cursor position
      if (docMouse.active && docMouse.x !== null && docMouse.y !== null) {
        const dx = this.x - docMouse.x;
        const dy = this.y - docMouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 130) {
          const force = (130 - dist) / 130;
          this.x -= (dx / dist) * force * 0.35;
          this.y -= (dy / dist) * force * 0.35;
        }
      }

      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  const particles = Array.from({ length: 50 }, () => new Particle());

  function drawLines() {
    // Draw links from cursor to particles
    if (docMouse.active && docMouse.x !== null && docMouse.y !== null) {
      for (let i = 0; i < particles.length; i++) {
        const dx = particles[i].x - docMouse.x;
        const dy = particles[i].y - docMouse.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(docMouse.x, docMouse.y);
          ctx.strokeStyle = `rgba(216, 183, 74, ${(1 - d/110) * 0.05})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(11, 29, 57, ${(1 - d/100) * 0.05})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  })();

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }, { passive: true });
})();


/* ═══════════════════════════════════════════════════════════════════
   TOP SCROLL PROGRESS INDICATOR
═══════════════════════════════════════════════════════════════════ */
(function ScrollProgressEngine() {
  const progress = document.getElementById('scrollProgress');
  if (!progress) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          const pct = window.scrollY / totalHeight;
          progress.style.setProperty('--scroll-p', pct);
        }
        ticking = false;
      });
    }
  }, { passive: true });
})();


/* ═══════════════════════════════════════════════════════════════════
   3D CARD HOVER TILT EFFECTS
═══════════════════════════════════════════════════════════════════ */
(function Card3DTiltEngine() {
  const cards = document.querySelectorAll('.service-card, .pkg-card, .ind-card, .visual-card, .testi-card, .cta-form-card, .faq-item');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update mouse coordinates for glow shader effects
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((centerY - y) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   HERO CONTENT ENTRY ANIMATION
═══════════════════════════════════════════════════════════════════ */
(function() {
  const heroContent = null; // disabled for CSS staggered reveals
  if (!heroContent) return;
  heroContent.style.cssText = 'opacity:0;transform:translateY(28px);transition:opacity 0.9s ease 0.6s,transform 0.9s ease 0.6s;';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    heroContent.style.opacity   = '1';
    heroContent.style.transform = 'translateY(0)';
  }));
})();


/* ═══════════════════════════════════════════════════════════════════
   SMOOTH SCROLL FOR ANCHOR LINKS
═══════════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Init delay for animate-on-scroll elements ── */
document.querySelectorAll('.animate-on-scroll[data-delay]').forEach(el => {
  const d = parseInt(el.dataset.delay);
  if (d > 0) el.style.transitionDelay = d + 'ms';
});

/* ═══════════════════════════════════════════════════════════════════
   INDUSTRY MARQUEE TOUCH HANDLER
═══════════════════════════════════════════════════════════════════ */
(function IndustryMarqueeTouch() {
  const track = document.getElementById('industryTrack');
  if (!track) return;
  track.addEventListener('touchstart', () => {
    track.classList.add('paused');
  }, { passive: true });
  track.addEventListener('touchend', () => {
    track.classList.remove('paused');
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════════
   AI CHAT WIDGET INTERACTION
═══════════════════════════════════════════════════════════════════ */
(function AIChatWidgetEngine() {
  const toggle = document.getElementById('aiChatToggle');
  const panel = document.getElementById('aiChatPanel');
  const openIcon = document.getElementById('aiChatOpenIcon');
  const closeIcon = document.getElementById('aiChatCloseIcon');
  const messages = document.getElementById('aiMessages');
  const quickReplies = document.getElementById('aiQuickReplies');
  const leadForm = document.getElementById('aiLeadForm');
  const inputRow = document.getElementById('aiInputRow');
  const chatInput = document.getElementById('aiChatInput');
  const sendBtn = document.getElementById('aiSendBtn');
  const leadSubmit = document.getElementById('aiLeadSubmit');
  const notifDot = document.getElementById('aiNotifDot');

  if (!toggle || !panel) return;

  // Toggle Chat Panel
  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    openIcon.classList.toggle('hidden', isOpen);
    closeIcon.classList.toggle('hidden', !isOpen);
    if (notifDot) notifDot.style.display = 'none'; // Clear notification dot
    
    // Auto focus chat input if visible
    if (isOpen && chatInput && leadForm.style.display === 'none') {
      setTimeout(() => chatInput.focus(), 300);
    }
  });

  // Open chatbot when any "Learn More" CTA is clicked
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const text = link.textContent.trim();
    if (/learn\s+more/i.test(text)) {
      // Exclude the Access Program card button which navigates to the form page
      if (link.getAttribute('href') === 'access-program.html' || link.id === 'pkgEssentialCTA') {
        return;
      }
      
      e.preventDefault();
      
      // Open panel if closed
      if (!panel.classList.contains('open')) {
        panel.classList.add('open');
        if (openIcon) openIcon.classList.add('hidden');
        if (closeIcon) closeIcon.classList.remove('hidden');
        if (notifDot) notifDot.style.display = 'none';
      }
      
      // Auto focus chat input
      if (chatInput && leadForm.style.display === 'none') {
        setTimeout(() => chatInput.focus(), 300);
      }
    }
  });

  // Helper: Add message
  function appendMessage(text, isBot = false) {
    if (!messages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-msg ${isBot ? 'ai-msg-bot' : 'ai-msg-user'}`;
    msgDiv.innerHTML = `<p>${text}</p>`;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  // Helper: Simulated bot typing response
  function simulateBotResponse(replyText, callback) {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-msg ai-msg-bot typing-indicator';
    typingDiv.innerHTML = `<p><span class="dot"></span><span class="dot"></span><span class="dot"></span></p>`;
    messages.appendChild(typingDiv);
    messages.scrollTop = messages.scrollHeight;

    // Add typing indicator styling dynamically if not already added
    if (!document.getElementById('typingStyle')) {
      const s = document.createElement('style');
      s.id = 'typingStyle';
      s.textContent = `
        .typing-indicator span { display: inline-block; width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; margin: 0 2px; animation: bounce 1.4s infinite both; }
        .typing-indicator span:nth-child(2) { animation-delay: .2s; }
        .typing-indicator span:nth-child(3) { animation-delay: .4s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
      `;
      document.head.appendChild(s);
    }

    setTimeout(() => {
      typingDiv.remove();
      appendMessage(replyText, true);
      if (callback) callback();
    }, 1000 + Math.random() * 500);
  }

  // Handle Quick Replies
  if (quickReplies) {
    quickReplies.addEventListener('click', (e) => {
      const btn = e.target.closest('.ai-qr');
      if (!btn) return;
      const q = btn.dataset.q;
      const text = btn.textContent;
      
      appendMessage(text, false);
      quickReplies.style.display = 'none';

      if (q === 'services') {
        simulateBotResponse("We provide professional bookkeeping, tax compliance, payroll processing, Odoo ERP implementations, financial forecasting, and funding readiness assessments.", () => {
          simulateBotResponse("Would you like to connect with a consultant to discuss your business details?", showLeadForm);
        });
      } else if (q === 'odoo') {
        simulateBotResponse("Pivot Aide is an Official Odoo Accounting Partner. We implement, configure, and customize the Odoo ERP platform to streamline your accounting and operations.", () => {
          simulateBotResponse("To receive a detailed scoping call for Odoo, please fill in your details below:", showLeadForm);
        });
      } else if (q === 'funding' || q === 'pricing' || q === 'packages') {
        const serviceName = q === 'funding' ? 'Funding Readiness' : 'Service Packages';
        simulateBotResponse(`For ${serviceName}, we evaluate your records to ensure they satisfy lending and compliance requirements, offering tailored service packages from Foundation to Growth and enterprise Command.`, () => {
          simulateBotResponse("Let's connect you with the right advisor. Please submit your details below:", showLeadForm);
        });
      } else if (q === 'getstarted' || q === 'implementation' || q === 'bookkeeping' || q === 'tax' || q === 'payroll') {
        simulateBotResponse("Excellent. We can help guide you through onboarding and setup options.", () => {
          simulateBotResponse("Please share your contact details and a consultant will reach out shortly:", showLeadForm);
        });
      }
    });
  }

  function showLeadForm() {
    if (!leadForm || !inputRow) return;
    inputRow.style.display = 'none';
    leadForm.style.display = 'block';
    messages.scrollTop = messages.scrollHeight;
  }

  function hideLeadForm() {
    if (!leadForm || !inputRow) return;
    leadForm.style.display = 'none';
    inputRow.style.display = 'flex';
  }

  // Lead Form Submit
  if (leadSubmit) {
    leadSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      const nameVal = document.getElementById('aiLeadName');
      const emailVal = document.getElementById('aiLeadEmail');
      const compVal = document.getElementById('aiLeadCompany');

      let valid = true;
      [nameVal, emailVal, compVal].forEach(input => {
        if (!input || !input.value.trim()) {
          if (input) input.style.borderColor = 'var(--red)';
          valid = false;
        } else {
          if (input) input.style.borderColor = '';
        }
      });

      if (emailVal && emailVal.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal.value.trim())) {
        emailVal.style.borderColor = 'var(--red)';
        valid = false;
      }

      if (!valid) return;

      leadSubmit.disabled = true;
      const origText = leadSubmit.textContent;
      leadSubmit.textContent = 'Submitting...';

      // Construct lead routing payload
      const payload = {
        access_key: '938c9251-8a3e-4030-9e87-852996b601d7',
        name: nameVal ? nameVal.value.trim() : '',
        email: emailVal ? emailVal.value.trim() : '',
        company: compVal ? compVal.value.trim() : '',
        service: 'Chatbot Consultation Request',
        message: 'Submitted via Chat Assistant Panel',
        subject: `New Chatbot Lead from ${nameVal ? nameVal.value.trim() : 'Pivot Aide'}`
      };

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(async (response) => {
        let json = await response.json();
        if (response.status == 200) {
          // Success
          hideLeadForm();
          appendMessage("✓ Details received. A representative will contact you shortly.", true);
          // Reset inputs
          [nameVal, emailVal, compVal].forEach(input => { if (input) input.value = ''; });
          showToast('Request Received', 'We will reach out to schedule your call.');
        } else {
          console.log(json);
          showToast('Error', json.message || 'Something went wrong.');
        }
      })
      .catch(error => {
        console.log(error);
        showToast('Error', 'Submission failed.');
      })
      .then(() => {
        leadSubmit.disabled = false;
        leadSubmit.textContent = origText;
      });
    });
  }

  // General Message Sending
  function handleSend() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, false);
    chatInput.value = '';

    const apiKey = ''; // Configure API key here or via backend environment

    if (!apiKey) {
      setTimeout(() => {
        appendMessage("I'm sorry, AI chat is currently offline. Please feel free to use the contact form to reach our advisors.", true);
      }, 500);
      return;
    }

    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-msg ai-msg-bot typing-indicator';
    typingDiv.innerHTML = `<p><span class="dot"></span><span class="dot"></span><span class="dot"></span></p>`;
    messages.appendChild(typingDiv);
    messages.scrollTop = messages.scrollHeight;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: text }]
        }],
        systemInstruction: {
          parts: [{
            text: "You are the official Pivot Aide AI Chat Assistant. You help answer questions about Pivot Aide's professional services: Bookkeeping, Tax Advisory (US & UK compliance), Payroll processing, Odoo ERP implementation, and Funding Readiness. Always be highly professional, concise, polite, and guide the user toward scheduling a consultation using the form or links if they need customized financial planning. Keep responses brief (1-3 sentences) suitable for a tiny chat window. Do not mention that you are an AI developed by Google. Focus solely on being a helpful assistant for Pivot Aide."
          }]
        }
      })
    })
    .then(response => response.json())
    .then(data => {
      typingDiv.remove();
      let replyText = '';
      try {
        replyText = data.candidates[0].content.parts[0].text.trim();
      } catch (e) {
        console.error(e, data);
        replyText = "I'm sorry, I encountered an issue processing that query. Please let me know how else I can help you with Pivot Aide's services.";
      }
      appendMessage(replyText, true);

      // Offer to show the lead form if the conversation looks ready to connect
      const lowercaseReply = replyText.toLowerCase();
      if (lowercaseReply.includes('schedule') || lowercaseReply.includes('consultation') || lowercaseReply.includes('contact') || lowercaseReply.includes('advisor') || lowercaseReply.includes('specialist')) {
        setTimeout(() => {
          simulateBotResponse("Would you like to connect with a consultant to discuss your details?", showLeadForm);
        }, 1500);
      }
    })
    .catch(error => {
      console.error(error);
      typingDiv.remove();
      appendMessage("I'm sorry, I am offline at the moment. Please feel free to use the contact page to reach our advisors.", true);
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', handleSend);
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });
  }

  // Show Notification dot after 5 seconds
  setTimeout(() => {
    if (notifDot && !panel.classList.contains('open')) {
      notifDot.style.display = 'block';
    }
  }, 5000);

})();





/* ═══════════════════════════════════════════════════════════════════
   EXTENDED 3D TILT — covers additional card types on subpages
═══════════════════════════════════════════════════════════════════ */
(function ExtendedTiltEngine() {
  const SELECTORS = '.why2-block, .program-card, .cred-card, .office-card, .contact-info-card, .partner-badge';
  document.querySelectorAll(SELECTORS).forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5);
      const y = ((e.clientY - rect.top)  / rect.height - 0.5);
      card.style.transform = `perspective(900px) rotateX(${y * -7}deg) rotateY(${x * 7}deg) translateY(-4px)`;
      card.style.transition = 'transform 0.08s linear, box-shadow 0.08s linear';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   ODOO MODULE CONNECTION CANVAS
   Interactive animated node-graph showing Odoo module integrations
═══════════════════════════════════════════════════════════════════ */
(function OdooModuleCanvasEngine() {
  const container = document.getElementById('odooCanvasContainer');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'odooCanvas';
  canvas.style.cssText = 'width:100%;height:100%;display:block;border-radius:12px;cursor:crosshair;';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = container.offsetWidth;
    H = canvas.height = container.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Module nodes
  const MODULES = [
    { label: 'Accounting', icon: '📊', color: '#EAE42F' },
    { label: 'Invoicing',  icon: '🧾', color: '#5CA8E8' },
    { label: 'Inventory',  icon: '📦', color: '#5CA8E8' },
    { label: 'Sales & CRM',icon: '🛒', color: '#5CA8E8' },
    { label: 'HR & Payroll',icon: '👥', color: '#5CA8E8' },
    { label: 'Purchasing', icon: '🏭', color: '#5CA8E8' },
  ];

  // Position nodes in a radial layout, Accounting at center
  function buildPositions() {
    const cx = W / 2, cy = H / 2;
    const radius = Math.min(W, H) * 0.32;
    return MODULES.map((mod, i) => {
      if (i === 0) return { ...mod, x: cx, y: cy, r: 36, isCenter: true };
      const angle = (i - 1) * (Math.PI * 2 / (MODULES.length - 1)) - Math.PI / 2;
      return { ...mod, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, r: 26, isCenter: false };
    });
  }

  let nodes = buildPositions();

  // Mouse state
  let mouse = { x: -999, y: -999 };
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (W / rect.width);
    mouse.y = (e.clientY - rect.top)  * (H / rect.height);
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  // Pulse state per node
  let pulses = [];
  let tick = 0;

  function spawnPulse(fromNode, toNode) {
    pulses.push({ fromX: fromNode.x, fromY: fromNode.y, toX: toNode.x, toY: toNode.y, t: 0 });
  }

  function drawPulses() {
    pulses = pulses.filter(p => p.t <= 1);
    pulses.forEach(p => {
      p.t += 0.012;
      const x = p.fromX + (p.toX - p.fromX) * p.t;
      const y = p.fromY + (p.toY - p.fromY) * p.t;
      const alpha = Math.sin(p.t * Math.PI);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(234,228,47,${alpha * 0.9})`;
      ctx.shadowColor = 'rgba(234,228,47,0.8)';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function drawEdges() {
    const center = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      const n = nodes[i];
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const hovered = Math.sqrt(dx*dx + dy*dy) < n.r + 20;

      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(n.x, n.y);
      const grad = ctx.createLinearGradient(center.x, center.y, n.x, n.y);
      grad.addColorStop(0, hovered ? 'rgba(234,228,47,0.55)' : 'rgba(92,168,232,0.18)');
      grad.addColorStop(1, hovered ? 'rgba(234,228,47,0.12)' : 'rgba(92,168,232,0.04)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = hovered ? 1.8 : 0.8;
      ctx.stroke();
    }
  }

  function drawNodes() {
    nodes.forEach(n => {
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const hovered = Math.sqrt(dx*dx + dy*dy) < n.r + 16;

      // Outer glow ring
      if (n.isCenter || hovered) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 10 + (n.isCenter ? Math.sin(tick * 0.04) * 4 : 0), 0, Math.PI * 2);
        ctx.strokeStyle = n.isCenter ? 'rgba(234,228,47,0.25)' : 'rgba(92,168,232,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Node background
      const bgGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      bgGrad.addColorStop(0, n.isCenter ? 'rgba(234,228,47,0.22)' : (hovered ? 'rgba(92,168,232,0.25)' : 'rgba(11,28,43,0.85)'));
      bgGrad.addColorStop(1, 'rgba(11,28,43,0.6)');
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = bgGrad;
      ctx.fill();
      ctx.strokeStyle = n.isCenter ? 'rgba(234,228,47,0.7)' : (hovered ? 'rgba(92,168,232,0.55)' : 'rgba(107,139,173,0.25)');
      ctx.lineWidth = n.isCenter ? 2 : 1;
      ctx.stroke();

      // Emoji icon
      ctx.font = `${n.isCenter ? 18 : 14}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.icon, n.x, n.y - 4);

      // Label
      ctx.font = `${n.isCenter ? '600 11px' : '500 9px'} Inter, sans-serif`;
      ctx.fillStyle = n.isCenter ? '#EAE42F' : (hovered ? '#EAF1FB' : 'rgba(234,241,251,0.65)');
      ctx.fillText(n.label, n.x, n.y + (n.isCenter ? 14 : 11));
    });
  }

  let rafOdoo = null;
  function loop() {
    tick++;
    ctx.clearRect(0, 0, W, H);

    // Auto-spawn data pulses along edges
    if (tick % 55 === 0) {
      const center = nodes[0];
      const target = nodes[1 + Math.floor(Math.random() * (nodes.length - 1))];
      spawnPulse(center, target);
    }
    if (tick % 80 === 0) {
      const center = nodes[0];
      const target = nodes[1 + Math.floor(Math.random() * (nodes.length - 1))];
      spawnPulse(target, center);
    }

    drawEdges();
    drawPulses();
    drawNodes();
    rafOdoo = requestAnimationFrame(loop);
  }

  // Only run when visible
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { if (!rafOdoo) loop(); }
    else { if (rafOdoo) { cancelAnimationFrame(rafOdoo); rafOdoo = null; } }
  }, { threshold: 0.1 });
  obs.observe(container);

  // Rebuild on resize
  window.addEventListener('resize', () => { nodes = buildPositions(); }, { passive: true });

  // Click to trigger burst
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (W / rect.width);
    const cy = (e.clientY - rect.top)  * (H / rect.height);
    nodes.forEach((n, i) => {
      if (i === 0) return;
      const dx = n.x - cx, dy = n.y - cy;
      if (Math.sqrt(dx*dx + dy*dy) < n.r + 20) {
        spawnPulse(nodes[0], n);
        spawnPulse(n, nodes[0]);
      }
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   ACCOUNTING SAVINGS CALCULATOR
   Interactive sliders that compute estimated monthly savings
═══════════════════════════════════════════════════════════════════ */
(function AccountingSavingsCalculator() {
  const wrap = document.getElementById('savingsCalculator');
  if (!wrap) return;

  const txSlider     = document.getElementById('calcTransactions');
  const hoursSlider  = document.getElementById('calcHours');
  const rateSlider   = document.getElementById('calcRate');
  const txVal        = document.getElementById('calcTxVal');
  const hoursVal     = document.getElementById('calcHoursVal');
  const rateVal      = document.getElementById('calcRateVal');
  const savingsOut   = document.getElementById('calcSavingsOut');
  const savingsBar   = document.getElementById('calcSavingsBar');
  const errorOut     = document.getElementById('calcErrorOut');

  if (!txSlider || !hoursSlider || !rateSlider) return;

  function compute() {
    const tx    = parseInt(txSlider.value);
    const hours = parseInt(hoursSlider.value);
    const rate  = parseInt(rateSlider.value);

    if (txVal)    txVal.textContent    = tx.toLocaleString();
    if (hoursVal) hoursVal.textContent = hours + ' hrs/mo';
    if (rateVal)  rateVal.textContent  = '$' + rate + '/hr';

    // Savings = manual hours cost * efficiency gain (65–80% reduction from automation)
    const efficiencyGain = 0.65 + (tx / 10000) * 0.15;
    const monthly = Math.round(hours * rate * Math.min(efficiencyGain, 0.80));
    // Error cost estimate: ~2% of transactions * avg $18 correction cost
    const errorCostMonthly = Math.round(tx * 0.018 * 0.50);

    if (savingsOut) {
      savingsOut.textContent = '$' + monthly.toLocaleString();
    }
    if (errorOut) {
      errorOut.textContent = '$' + errorCostMonthly.toLocaleString();
    }
    if (savingsBar) {
      const pct = Math.min((monthly / 8000) * 100, 100);
      savingsBar.style.width = pct + '%';
    }
  }

  [txSlider, hoursSlider, rateSlider].forEach(s => {
    s.addEventListener('input', compute);
    s.addEventListener('change', compute);
  });
  compute();
})();


/* ═══════════════════════════════════════════════════════════════════
   SBA UNDERWRITING SCORE GAUGE
   Checklist checkboxes drive a circular SVG gauge
═══════════════════════════════════════════════════════════════════ */
(function SBAScoreGaugeEngine() {
  const gaugeRing   = document.getElementById('sbaGaugeRing');
  const gaugePct    = document.getElementById('sbaGaugePct');
  const gaugeLabel  = document.getElementById('sbaGaugeLabel');
  if (!gaugeRing) return;

  const CIRCUMFERENCE = 2 * Math.PI * 54;

  function updateGauge() {
    const boxes = document.querySelectorAll('.sba-check-item');
    const total   = boxes.length;
    const checked = [...boxes].filter(b => b.classList.contains('checked')).length;
    const pct     = total > 0 ? Math.round((checked / total) * 100) : 0;

    const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
    gaugeRing.style.strokeDashoffset = offset;

    if (gaugePct) gaugePct.textContent = pct + '%';

    if (gaugeLabel) {
      if (pct < 35) {
        gaugeLabel.textContent = 'Needs Work';
        gaugeLabel.setAttribute('fill', '#e05252');
        gaugeRing.style.stroke = '#e05252';
      } else if (pct < 70) {
        gaugeLabel.textContent = 'Progressing';
        gaugeLabel.setAttribute('fill', '#d8b74a');
        gaugeRing.style.stroke = '#d8b74a';
      } else {
        gaugeLabel.textContent = 'Lender Ready';
        gaugeLabel.setAttribute('fill', '#22d07a');
        gaugeRing.style.stroke = '#22d07a';
      }
    }
  }

  // Initialize gauge
  gaugeRing.style.strokeDasharray  = CIRCUMFERENCE;
  gaugeRing.style.strokeDashoffset = CIRCUMFERENCE;
  gaugeRing.style.transition = 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease';

  // Bind checklist items
  document.querySelectorAll('.sba-check-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      const icon = item.querySelector('.sba-check-icon');
      if (icon) {
        icon.textContent = item.classList.contains('checked') ? '✓' : '○';
        icon.style.color = item.classList.contains('checked') ? 'var(--yellow)' : 'var(--text-muted)';
      }
      const label = item.querySelector('.sba-check-label');
      if (label) {
        label.style.color = item.classList.contains('checked') ? 'var(--text-primary)' : 'var(--text-secondary)';
        label.style.textDecoration = item.classList.contains('checked') ? 'none' : '';
      }
      updateGauge();
    });
  });

  updateGauge();
})();


/* ═══════════════════════════════════════════════════════════════════
   OFFICE COORDINATES RADAR MAP
   Canvas radar/globe with animated ping rings at office locations
═══════════════════════════════════════════════════════════════════ */
(function OfficeRadarMapEngine() {
  // Replace placeholder divs with canvas
  const mapContainers = document.querySelectorAll('.office-map-canvas');
  if (!mapContainers.length) return;

  const OFFICE_CONFIGS = [
    { label: 'Maryland, USA',   color: '#EAE42F', subColor: '#5CA8E8' },
    { label: 'Virginia, USA',   color: '#5CA8E8', subColor: '#EAE42F' },
  ];

  mapContainers.forEach((container, idx) => {
    const cfg = OFFICE_CONFIGS[idx] || OFFICE_CONFIGS[0];
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;border-radius:8px;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let W = canvas.width  = container.offsetWidth  || 280;
    let H = canvas.height = container.offsetHeight || 100;

    let rings = [];
    let gridTick = 0;

    function spawnRing() {
      rings.push({ x: W * 0.5 + (Math.random() - 0.5) * W * 0.3, y: H * 0.5, r: 0, alpha: 1 });
    }
    spawnRing();

    function drawGrid() {
      // Horizontal scan lines
      ctx.strokeStyle = `rgba(92,168,232,0.06)`;
      ctx.lineWidth = 0.5;
      for (let y = 0; y < H; y += 14) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      // Vertical scan lines
      for (let x = 0; x < W; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
    }

    function drawScanLine() {
      const lineY = ((gridTick % 120) / 120) * H;
      const scanGrad = ctx.createLinearGradient(0, lineY - 12, 0, lineY + 4);
      scanGrad.addColorStop(0, 'rgba(92,168,232,0)');
      scanGrad.addColorStop(1, `rgba(92,168,232,0.15)`);
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, lineY - 12, W, 16);
    }

    function drawPings() {
      rings = rings.filter(r => r.alpha > 0.01);
      rings.forEach(ring => {
        ring.r   += 0.85;
        ring.alpha *= 0.975;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `${cfg.color}${Math.round(ring.alpha * 255).toString(16).padStart(2,'0')}`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Central blip
      ctx.beginPath();
      ctx.arc(W * 0.5, H * 0.5, 4, 0, Math.PI * 2);
      ctx.fillStyle = cfg.color;
      ctx.shadowColor = cfg.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function drawLabel() {
      ctx.font = '500 9px Inter, sans-serif';
      ctx.fillStyle = 'rgba(234,241,251,0.5)';
      ctx.textAlign = 'center';
      ctx.fillText(cfg.label, W * 0.5, H - 8);
    }

    let rafMap = null;
    function loop() {
      gridTick++;
      ctx.clearRect(0, 0, W, H);
      drawGrid();
      drawScanLine();
      drawPings();
      drawLabel();
      if (gridTick % 90 === 0) spawnRing();
      rafMap = requestAnimationFrame(loop);
    }

    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { if (!rafMap) loop(); }
      else { if (rafMap) { cancelAnimationFrame(rafMap); rafMap = null; } }
    }, { threshold: 0.1 });
    obs.observe(container);

    window.addEventListener('resize', () => {
      W = canvas.width  = container.offsetWidth  || 280;
      H = canvas.height = container.offsetHeight || 100;
    }, { passive: true });
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   PARALLAX HERO IMAGES (subtle depth on scroll for all pages)
═══════════════════════════════════════════════════════════════════ */
(function HeroParallaxEngine() {
  const heroImg = document.querySelector('.page-hero-img');
  if (!heroImg) return;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroImg.style.transform = `translateY(${scrollY * 0.08}px) scale(1.02)`;
  }, { passive: true });
})();


/* ═══════════════════════════════════════════════════════════════════
   FLOATING SECTION ENTRY ANIMATIONS (number counters for cards)
═══════════════════════════════════════════════════════════════════ */
(function FloatingCardStagger() {
  const cards = document.querySelectorAll('.why2-block, .program-card, .service-card');
  cards.forEach((card, i) => {
    if (!card.dataset.delay) card.dataset.delay = String(i * 60);
    card.classList.add('animate-on-scroll');
    animObserver.observe(card);
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   FIVE-STAGE PROCESS INTERACTION & HOTSPOTS ENGINE
   ═══════════════════════════════════════════════════════════════════ */
(function ProcessTimelineEngine() {
  const steps = document.querySelectorAll('.process-step');
  const hotspots = document.querySelectorAll('.diagram-hotspot');
  const progressLine = document.getElementById('processProgress');
  const timelineContainer = document.querySelector('.process-timeline');
  const diagramContainer = document.querySelector('.process-diagram-wrap');
  if (steps.length === 0 || !progressLine) return;

  let activeStep = 3;

  // Inject hotspot pulse rings
  hotspots.forEach(hotspot => {
    if (hotspot.querySelector('.hotspot-ring')) return;
    const ring1 = document.createElement('div');
    ring1.className = 'hotspot-ring ring-1';
    const ring2 = document.createElement('div');
    ring2.className = 'hotspot-ring ring-2';
    hotspot.appendChild(ring1);
    hotspot.appendChild(ring2);
  });

  // Initialize display states
  steps.forEach(step => {
    const sStep = parseInt(step.dataset.step);
    const card = step.querySelector('.ps-card');
    if (card) {
      card.style.display = 'flex';
      card.classList.add('visible-active');
      if (sStep === activeStep) {
        step.classList.add('active');
        card.classList.add('ps-card-active');
      }
    }
  });

  function updateVisuals(stepNum) {
    const percentage = (stepNum - 1) * 25;
    progressLine.style.width = percentage + '%';

    hotspots.forEach(hotspot => {
      const hStep = parseInt(hotspot.dataset.step);
      hotspot.classList.toggle('active', hStep === stepNum);
    });

    steps.forEach(step => {
      const sStep = parseInt(step.dataset.step);
      const dot = step.querySelector('.ps-dot');
      const card = step.querySelector('.ps-card');
      if (!card) return;
      
      if (dot) dot.classList.toggle('ps-dot-active', sStep === stepNum);
      step.classList.toggle('active', sStep === stepNum);
      card.classList.toggle('ps-card-active', sStep === stepNum);
    });
  }

  steps.forEach(step => {
    const stepNum = parseInt(step.dataset.step);
    
    step.addEventListener('mouseenter', () => {
      updateVisuals(stepNum);
    });
    
    step.addEventListener('click', () => {
      activeStep = stepNum;
      updateVisuals(stepNum);
    });
  });

  hotspots.forEach(hotspot => {
    const stepNum = parseInt(hotspot.dataset.step);

    hotspot.addEventListener('mouseenter', () => {
      updateVisuals(stepNum);
    });

    hotspot.addEventListener('click', () => {
      activeStep = stepNum;
      updateVisuals(stepNum);
    });
  });

  if (timelineContainer) {
    timelineContainer.addEventListener('mouseleave', () => {
      updateVisuals(activeStep);
    });
  }
  if (diagramContainer) {
    diagramContainer.addEventListener('mouseleave', () => {
      updateVisuals(activeStep);
    });
  }

  updateVisuals(activeStep);
})();

/* ═══════════════════════════════════════════════════════════════════
   PREMIUM INTERACTIONS & PARALLAX ENGINE
   ═══════════════════════════════════════════════════════════════════ */
(function PremiumInteractionEngine() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // 1. Mouse Move Parallax on Hero Section
  const hero = document.getElementById('hero') || document.querySelector('.page-hero');
  const heroVideo = document.querySelector('.hero-video-canvas') || document.querySelector('.page-hero-bg-video');
  const heroContent = document.getElementById('heroContent') || document.querySelector('.page-hero-content');
  const floatingCards = document.querySelectorAll('.visual-card, .why2-block');

  let rafActive = false;
  let mouseX = 0, mouseY = 0;

  if (hero && heroVideo) {
    const videoWrapper = heroVideo.parentElement;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouseX = e.clientX - rect.left - rect.width / 2;
      mouseY = e.clientY - rect.top - rect.height / 2;

      if (!rafActive) {
        rafActive = true;
        requestAnimationFrame(updateParallax);
      }
    });

    function updateParallax() {
      const tx = mouseX * -0.04;
      const ty = mouseY * -0.04;

      if (videoWrapper) {
        videoWrapper.style.setProperty('--tx', `${tx}px`);
        videoWrapper.style.setProperty('--ty', `${ty}px`);
      }

      const xPct = mouseX / (window.innerWidth / 2);
      const yPct = mouseY / (window.innerHeight / 2);

      if (heroContent) {
        heroContent.style.transform = `translate3d(${xPct * 8}px, ${yPct * 8}px, 0)`;
      }
      floatingCards.forEach((card, index) => {
        const factor = (index + 1) * 6;
        card.style.transform = `translate3d(${xPct * factor}px, ${yPct * factor}px, 0)`;
      });

      rafActive = false;
    }

    hero.addEventListener('mouseleave', () => {
      if (videoWrapper) {
        videoWrapper.style.setProperty('--tx', '0px');
        videoWrapper.style.setProperty('--ty', '0px');
      }
      if (heroContent) {
        heroContent.style.transition = 'transform 0.5s ease';
        heroContent.style.transform = 'translate3d(0, 0, 0)';
        setTimeout(() => heroContent.style.transition = '', 500);
      }
      floatingCards.forEach(card => {
        card.style.transition = 'transform 0.5s ease';
        card.style.transform = 'translate3d(0, 0, 0)';
        setTimeout(() => card.style.transition = '', 500);
      });
    });
  }

  // 2. Button 3D Tilt Interaction
  const buttons = document.querySelectorAll('.btn-primary, .btn-ghost, .btn-primary-nav');
  buttons.forEach(btn => {
    if (btn.parentElement.classList.contains('tilt-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'tilt-wrapper';
    wrapper.style.perspective = '600px';
    wrapper.style.display = 'inline-block';

    if (btn.classList.contains('btn-lg')) {
      wrapper.style.display = btn.style.display || 'inline-block';
    }

    btn.parentNode.insertBefore(wrapper, btn);
    wrapper.appendChild(btn);

    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const xPct = Math.max(-0.5, Math.min(0.5, x / rect.width));
      const yPct = Math.max(-0.5, Math.min(0.5, y / rect.height));

      btn.style.setProperty('--rx', xPct);
      btn.style.setProperty('--ry', yPct);
      btn.style.transition = 'none';
    });

    wrapper.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      btn.style.setProperty('--rx', '0');
      btn.style.setProperty('--ry', '0');
      btn.style.setProperty('--tz', '0px');
    });
  });

  // 3. Scroll Parallax
  // 3. Scroll Parallax
  let isHeroVisible = true;
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isHeroVisible = entry.isIntersecting;
    });
  }, { threshold: 0 });
  if (hero) heroObserver.observe(hero);

  let scrollRafActive = false;
  window.addEventListener('scroll', () => {
    if (isHeroVisible && !scrollRafActive) {
      scrollRafActive = true;
      requestAnimationFrame(updateHeroScrollParallax);
    }
  }, { passive: true });

  function updateHeroScrollParallax() {
    const scrolled = window.pageYOffset;
    const progress = Math.min(scrolled / window.innerHeight, 1);

    if (heroContent) {
      heroContent.style.setProperty('--p', progress);
    }

    if (heroVideo) {
      const videoWrapper = heroVideo.parentElement;
      if (videoWrapper) {
        videoWrapper.style.setProperty('--sy', `${scrolled * 0.15 * -1}px`);
      }
    }

    scrollRafActive = false;
  }

  // 4. Section Scroll Reveals & Card Staggers
  const animRevealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const target = entry.target;
      if (entry.isIntersecting) {
        target.classList.add('visible');

        // Stagger data-stagger children
        const staggeredChildren = target.querySelectorAll('[data-stagger]');
        staggeredChildren.forEach((child, index) => {
          child.style.setProperty('--delay', `${index * 80}ms`);
          child.classList.add('visible');
        });

        // Rotate icons on reveal
        const rotators = target.querySelectorAll('[data-rotate-icon]');
        rotators.forEach((rotator) => {
          const firstSvgOrImg = rotator.querySelector('svg, img');
          if (firstSvgOrImg) {
            firstSvgOrImg.style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
            firstSvgOrImg.style.transform = 'rotate(0deg)';
          }
        });
      } else {
        // Remove classes on exit to allow re-animating when scrolled back into view
        target.classList.remove('visible');

        const staggeredChildren = target.querySelectorAll('[data-stagger]');
        staggeredChildren.forEach((child) => {
          child.classList.remove('visible');
        });

        const rotators = target.querySelectorAll('[data-rotate-icon]');
        rotators.forEach((rotator) => {
          const firstSvgOrImg = rotator.querySelector('svg, img');
          if (firstSvgOrImg) {
            firstSvgOrImg.style.transform = 'rotate(-15deg)';
          }
        });
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  const scrollSections = document.querySelectorAll('.animate-on-scroll, .scroll-reveal');
  scrollSections.forEach(sec => {
    animRevealObs.observe(sec);
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   CINEMATIC HEADLINE REVEAL ENGINE
   ═══════════════════════════════════════════════════════════════════ */
(function HeadlineRevealEngine() {
  // 1. Split headline text into lines using simple BR parser
  const headlines = document.querySelectorAll('.hero-headline, .page-hero-title, .final-cta-headline');
  headlines.forEach(headline => {
    const rawLines = headline.innerHTML.split(/<br\s*\/?>/i);
    const splitHTML = rawLines.map(lineText => {
      if (!lineText.trim()) return '';
      return `<span class="line-wrap"><span class="line-inner">${lineText.trim()}</span></span>`;
    }).join('');
    headline.innerHTML = splitHTML;
  });

  // 2. Observer setup to trigger animations
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        target.classList.add('visible');

        // Reveal lines
        const lineInners = target.querySelectorAll('.line-inner');
        lineInners.forEach((line, index) => {
          line.style.transition = 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.9s ease, filter 0.7s ease';
          line.style.transform = 'translateY(110%)';
          line.style.opacity = '0';
          line.style.filter = 'blur(8px)';
          
          setTimeout(() => {
            line.style.transform = 'translateY(0)';
            line.style.opacity = '1';
            line.style.filter = 'blur(0)';
          }, 50 + (index * 120));
        });

        // Trigger italic shimmer after last line finishes transitioning
        const lastLine = lineInners[lineInners.length - 1];
        if (lastLine) {
          const runShimmer = () => {
            const em = target.querySelector('em.serif-italic');
            if (em && !em.classList.contains('shimmer')) {
              em.classList.add('shimmer');
            }
          };
          lastLine.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'transform') runShimmer();
          });
          lastLine.addEventListener('animationend', runShimmer);
        }

        // Stagger paragraphs & actions
        const paragraphs = target.querySelectorAll('.hero-sub, .page-hero-sub, .hero-actions, .page-hero-actions, .hero-trust-row, .final-cta-sub, .final-cta-inner .btn-primary, .final-cta-inner .btn-ghost, .final-cta-inner .section-tag');
        paragraphs.forEach((p, index) => {
          p.style.opacity = '0';
          p.style.transform = 'translateY(20px)';
          p.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
          
          const startDelay = (lineInners.length) * 120 + (index * 80);
          setTimeout(() => {
            p.style.opacity = '1';
            p.style.transform = 'translateY(0)';
          }, startDelay);
        });

        observer.unobserve(target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px'
  });

  const containers = document.querySelectorAll('.hero-content, .page-hero-content, .final-cta-inner');
  containers.forEach(container => {
    revealObserver.observe(container);
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   VIDEO VIEWPORT PAUSE OPTIMIZATION
   ═══════════════════════════════════════════════════════════════════ */
(function VideoViewportOptimizer() {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0 });

  document.querySelectorAll('video').forEach(video => {
    videoObserver.observe(video);
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   MOCKUP IMAGE 3D TILT & LAYERED PARALLAX ENGINE
   ═══════════════════════════════════════════════════════════════════ */
(function ImageHoverParallaxEngine() {
  const tiltElements = document.querySelectorAll('.process-diagram-wrap, .page-hero-img');
  
  tiltElements.forEach(el => {
    // 1. Establish perspective on the element's parent container
    if (el.parentElement) {
      el.parentElement.style.perspective = '800px';
    }

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Clamp values to ±8deg
      const xDeg = Math.max(-8, Math.min(8, (x / rect.width) * 16));
      const yDeg = Math.max(-8, Math.min(8, (y / rect.height) * 16));

      el.style.transform = `rotateY(${xDeg}deg) rotateX(${-yDeg}deg)`;
      el.style.transition = 'none'; // bypass transition during hover tracking

      // 2. Layered parallax translations (foreground: 8px, mid: 4px, background: 2px)
      const fg = el.querySelectorAll('.parallax-fg');
      const mid = el.querySelectorAll('.parallax-mid');
      const bg = el.querySelectorAll('.parallax-bg');

      fg.forEach(layer => {
        layer.style.transform = `translate(${(x / rect.width) * 16}px, ${(y / rect.height) * 16}px)`;
        layer.style.transition = 'none';
      });
      mid.forEach(layer => {
        layer.style.transform = `translate(${(x / rect.width) * 8}px, ${(y / rect.height) * 8}px)`;
        layer.style.transition = 'none';
      });
      bg.forEach(layer => {
        layer.style.transform = `translate(${(x / rect.width) * 4}px, ${(y / rect.height) * 4}px)`;
        layer.style.transition = 'none';
      });
    });

    el.addEventListener('mouseleave', () => {
      // Transition back smoothly to baseline
      el.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      el.style.transform = 'rotateY(0) rotateX(0)';

      const fg = el.querySelectorAll('.parallax-fg');
      const mid = el.querySelectorAll('.parallax-mid');
      const bg = el.querySelectorAll('.parallax-bg');

      fg.forEach(layer => {
        layer.style.transition = 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
        layer.style.transform = 'translate(0,0)';
      });
      mid.forEach(layer => {
        layer.style.transition = 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
        layer.style.transform = 'translate(0,0)';
      });
      bg.forEach(layer => {
        layer.style.transition = 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
        layer.style.transform = 'translate(0,0)';
      });
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   DECORATIVE BACKGROUND GRID REVEAL OBSERVER
   ═══════════════════════════════════════════════════════════════════ */
(function GridRevealEngine() {
  const gridObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const grid = entry.target;
      if (entry.isIntersecting) {
        grid.classList.add('visible-reveal');
      } else {
        grid.classList.remove('visible-reveal');
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('.page-hero-grid, .loading-grid').forEach(grid => {
    gridObserver.observe(grid);
  });
})();


// Premium GSAP ScrollTrigger for the Four Pillars cards
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    // Desktop: Pin and Translate Grid
    mm.add("(min-width: 901px)", () => {
        const section = document.querySelector('.why2-section');
        const grid = document.querySelector('.why2-grid');
        const progressLine = document.querySelector('.timeline-progress');
        const cards = document.querySelectorAll('.custom-anim-card');
        
        if (!section || !grid || !progressLine || cards.length === 0) return;

        let layoutCache = { yOffset: 0, duration: 1500 };
        
        const getDynamicLayout = () => {
            section.style.marginBottom = "0px"; // reset for measurement
            const lastCard = cards[cards.length - 1];
            const winH = window.innerHeight;
            
            // Calculate translation so last card centers in viewport
            const lastCardCenter = lastCard.offsetTop + (lastCard.offsetHeight / 2);
            let translateDist = lastCardCenter - (winH * 0.35); // top pinned at 15%, center is 50%, diff is 35%
            if (translateDist < 0) translateDist = 0;
            
            // Apply negative margin to remove the blank space left by translated grid
            const lastCardBottom = lastCard.offsetTop + lastCard.offsetHeight;
            const visualBottom = lastCardBottom - translateDist;
            const targetSectionHeight = visualBottom + 120; // 120px normal bottom padding
            
            const currentHeight = section.offsetHeight;
            const marginBottom = targetSectionHeight - currentHeight;
            
            section.style.marginBottom = marginBottom + "px";
            
            return {
                yOffset: -translateDist,
                duration: Math.max(translateDist, 800) // minimum duration safeguard
            };
        };

        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top 15%",
                end: () => {
                    layoutCache = getDynamicLayout();
                    return "+=" + layoutCache.duration;
                },
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
            }
        });

        // Fade out section header quickly as scroll begins so cards don't overlap it
        const sectionHeader = section.querySelector('.section-header');
        if (sectionHeader) {
            tl.to(sectionHeader, {
                opacity: 0,
                y: -40,
                duration: 0.1,
                ease: "power1.inOut"
            }, 0);
        }

        // Animate the grid moving up dynamically
        tl.to(grid, {
            y: () => layoutCache.yOffset,
            ease: "none",
            duration: 1 // GSAP timeline base duration
        }, 0);

        // Animate the progress line
        tl.to(progressLine, {
            scaleY: 1,
            ease: "none",
            duration: 1
        }, 0);

        // Sequence card active states
        cards.forEach((card, i) => {
            const startProgress = i * 0.3; // 0, 0.3, 0.6, 0.9
            
            if (i === 0) {
                gsap.set(card, { opacity: 1, scale: 1, filter: "blur(0px)" });
            } else {
                tl.to(card, {
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 0.15,
                    ease: "power1.inOut"
                }, startProgress);
                
                tl.to(cards[i-1], {
                    opacity: 0.45,
                    scale: 0.96,
                    filter: "blur(2px)",
                    duration: 0.15,
                    ease: "power1.inOut"
                }, startProgress);
            }
        });
    });

    // Mobile/Tablet: Normal Scrolling Fade (No Pinning)
    mm.add("(max-width: 900px)", () => {
        const progressLine = document.querySelector('.timeline-progress');
        const grid = document.querySelector('.why2-grid');
        
        if (progressLine && grid) {
            gsap.to(progressLine, {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: grid,
                    start: "top center",
                    end: "bottom center",
                    scrub: true
                }
            });
        }

        const cards = document.querySelectorAll('.custom-anim-card');
        cards.forEach(card => {
            ScrollTrigger.create({
                trigger: card,
                start: "top 60%",
                end: "bottom 40%",
                toggleClass: "is-active",
            });
        });
    });
});

/* ═══════════════════════════════════════════════════════════════
   FOUR PILLARS GSAP STAGGER ANIMATION
═══════════════════════════════════════════════════════════════ */
(function ProfessionalSlideshowEngine() {
    var container = document.querySelector('.slideshow-container');
    var items = document.querySelectorAll('.slide-item');
    var dots = document.querySelectorAll('.slide-dot');
    var prevBtn = document.querySelector('.prev-btn');
    var nextBtn = document.querySelector('.next-btn');
    
    if (!container || !items.length) return;

    var currentIndex = 0;
    var autoplayInterval = null;
    var isTransitioning = false;

    function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(function() {
            navigate(1);
        }, 2000);
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    function navigate(direction) {
        if (isTransitioning) return;
        isTransitioning = true;

        var prevIndex = currentIndex;
        currentIndex = (currentIndex + direction + items.length) % items.length;

        // Set classes for fade/slide animation
        items.forEach(function(item, i) {
            item.classList.remove('active', 'slide-left');
            if (i === prevIndex) {
                // Outgoing slide moves slightly left and fades
                item.classList.add('slide-left');
            }
        });

        // Incoming slide fades in and moves from right
        var activeItem = items[currentIndex];
        activeItem.style.transition = 'none';
        activeItem.style.transform = direction > 0 ? 'translateX(30px)' : 'translateX(-30px)';
        activeItem.style.opacity = '0';
        activeItem.style.visibility = 'visible';

        // Force reflow
        activeItem.offsetHeight;

        activeItem.style.transition = '';
        activeItem.classList.add('active');
        activeItem.style.transform = '';
        activeItem.style.opacity = '';

        // Update Dots
        dots.forEach(function(dot, i) {
            if (i === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        setTimeout(function() {
            items.forEach(function(item, i) {
                if (i !== currentIndex) {
                    item.classList.remove('slide-left');
                    item.style.visibility = 'hidden';
                }
            });
            isTransitioning = false;
        }, 700);
    }

    function goToSlide(index) {
        if (index === currentIndex || isTransitioning) return;
        var direction = index > currentIndex ? 1 : -1;
        
        isTransitioning = true;

        var prevIndex = currentIndex;
        currentIndex = index;

        items.forEach(function(item, i) {
            item.classList.remove('active', 'slide-left');
            if (i === prevIndex) {
                item.classList.add('slide-left');
            }
        });

        var activeItem = items[currentIndex];
        activeItem.style.transition = 'none';
        activeItem.style.transform = direction > 0 ? 'translateX(30px)' : 'translateX(-30px)';
        activeItem.style.opacity = '0';
        activeItem.style.visibility = 'visible';

        activeItem.offsetHeight;

        activeItem.style.transition = '';
        activeItem.classList.add('active');
        activeItem.style.transform = '';
        activeItem.style.opacity = '';

        dots.forEach(function(dot, i) {
            if (i === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        setTimeout(function() {
            items.forEach(function(item, i) {
                if (i !== currentIndex) {
                    item.classList.remove('slide-left');
                    item.style.visibility = 'hidden';
                }
            });
            isTransitioning = false;
        }, 700);
    }

    // Manual controls: Prev/Next
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            navigate(-1);
            startAutoplay(); // restart timer
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            navigate(1);
            startAutoplay(); // restart timer
        });
    }

    // Dots Navigation
    dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            var index = parseInt(dot.getAttribute('data-slide'));
            goToSlide(index);
            startAutoplay(); // restart timer
        });
    });

    // Hover pauses autoplay
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);

    // Swipe controls for mobile devices
    var touchStartX = 0;
    var touchEndX = 0;

    container.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        var swipeDistance = touchEndX - touchStartX;
        if (Math.abs(swipeDistance) > 50) {
            if (swipeDistance > 0) {
                // Swipe right -> Prev
                navigate(-1);
            } else {
                // Swipe left -> Next
                navigate(1);
            }
            startAutoplay(); // restart timer
        }
    }

    // Init slideshow states
    items.forEach(function(item, i) {
        if (i === 0) {
            item.classList.add('active');
            item.style.visibility = 'visible';
        } else {
            item.style.visibility = 'hidden';
        }
    });

    startAutoplay();
})();

/* ═══════════════════════════════════════════════════════════════
   VALUE TEAM SECTION GSAP ANIMATIONS
═══════════════════════════════════════════════════════════════ */
(function ValueTeamAnimEngine() {
    var section = document.querySelector('.value-team-section');
    if (!section) return;

    var header = section.querySelector('.section-header');
    var cards  = section.querySelectorAll('.value-card');
    var accent = section.querySelector('[style*="width: 60px"]');
    if (!cards.length) return;

    // Initial states
    if (header) gsap.set(header, { y: 40, opacity: 0 });
    if (accent) gsap.set(accent, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(cards, { y: 50, opacity: 0, scale: 0.96 });

    var tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: 'top 72%',
            once: true
        }
    });

    if (header) tl.to(header, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
    if (accent) tl.to(accent, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3');

    tl.to(cards, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        stagger: 0.14,
        ease: 'power3.out'
    }, '-=0.2');

    // Animate accent bars inside each card
    cards.forEach(function(card, i) {
        var bar = card.querySelector('[style*="height: 3px"]');
        if (!bar) return;
        gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });
        tl.to(bar, {
            scaleX: 1,
            duration: 0.45,
            ease: 'power2.out'
        }, (i * 0.14) + 0.5);
    });
})();

/* ═══════════════════════════════════════════════════════════════
   PRIVACY POLICY SMALL BOX MODAL CONTROLLER
   Injects and manages the small Privacy Policy popup modal box
   so clicking Privacy Policy links does not navigate away or reload.
═══════════════════════════════════════════════════════════════ */
(function PrivacyPolicyModalEngine() {
    function initModal() {
        if (document.getElementById('privacyPolicyModal')) return;

        const modalHTML = `
        <div class="privacy-modal-overlay" id="privacyPolicyModal" role="dialog" aria-modal="true" aria-labelledby="privacyModalTitle">
            <div class="privacy-modal-card">
                <div class="privacy-modal-header">
                    <div class="privacy-modal-title-group">
                        <div class="privacy-modal-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                        </div>
                        <h3 class="privacy-modal-title" id="privacyModalTitle">Privacy Policy</h3>
                    </div>
                    <button type="button" class="privacy-modal-close" id="privacyModalCloseBtn" aria-label="Close Privacy Policy">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="privacy-modal-body">
                    <div>
                        <div class="privacy-section-title">1. Confidentiality Commitment</div>
                        <p>At Pivot Aide, we strictly respect your privacy. All business, financial, tax, and operational information provided to us remains strictly confidential. We do not sell, rent, or trade your personal or corporate data to third parties.</p>
                    </div>

                    <div>
                        <div class="privacy-section-title">2. Information We Collect</div>
                        <p>We collect information you directly provide when contacting us or filling out service request forms, including your name, email address, phone number, company name, and specific financial or ERP consulting inquiries.</p>
                    </div>

                    <div>
                        <div class="privacy-section-title">3. How Your Information Is Used</div>
                        <p>Your data is exclusively utilized to respond to your inquiries, deliver requested financial advisory or Odoo ERP services, process funding readiness assessments, and maintain seamless client support.</p>
                    </div>

                    <div>
                        <div class="privacy-section-title">4. Data Security & Storage</div>
                        <p>We employ administrative, technical, and physical security measures to guard your information against unauthorized access, loss, or disclosure. System access is strictly restricted to authorized staff members.</p>
                    </div>

                    <div>
                        <div class="privacy-section-title">5. Your Rights & Inquiries</div>
                        <p>You may request access to, correction of, or deletion of your personal contact data at any time. For questions regarding our privacy practices, please contact us directly at <a href="mailto:info@pivotaide.com" style="color: var(--yellow); text-decoration: underline;">info@pivotaide.com</a>.</p>
                    </div>
                </div>
                <div class="privacy-modal-footer">
                    <button type="button" class="privacy-modal-btn" id="privacyModalGotItBtn">Got It</button>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const overlay = document.getElementById('privacyPolicyModal');
        const closeBtn = document.getElementById('privacyModalCloseBtn');
        const gotItBtn = document.getElementById('privacyModalGotItBtn');

        function closeModal() {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        closeBtn.addEventListener('click', closeModal);
        gotItBtn.addEventListener('click', closeModal);

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeModal();
            }
        });
    }

    function openModal() {
        initModal();
        const overlay = document.getElementById('privacyPolicyModal');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        initModal();

        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            const text = (link.textContent || '').trim().toLowerCase();

            if (text === 'privacy policy' || href === '#privacy' || link.classList.contains('privacy-link')) {
                e.preventDefault();
                openModal();
            }
        });
    });
})();

/* ═══════════════════════════════════════════════════════════════
   TERMS OF SERVICE SMALL BOX MODAL CONTROLLER
   Injects and manages the small Terms of Service popup modal box
   so clicking Terms of Service links does not navigate away or reload.
═══════════════════════════════════════════════════════════════ */
(function TermsOfServiceModalEngine() {
    function initTermsModal() {
        if (document.getElementById('termsOfServiceModal')) return;

        const modalHTML = `
        <div class="privacy-modal-overlay" id="termsOfServiceModal" role="dialog" aria-modal="true" aria-labelledby="termsModalTitle">
            <div class="privacy-modal-card">
                <div class="privacy-modal-header">
                    <div class="privacy-modal-title-group">
                        <div class="privacy-modal-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>
                        <h3 class="privacy-modal-title" id="termsModalTitle">Terms of Service</h3>
                    </div>
                    <button type="button" class="privacy-modal-close" id="termsModalCloseBtn" aria-label="Close Terms of Service">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="privacy-modal-body">
                    <div>
                        <div class="privacy-section-title">1. Acceptance of Terms</div>
                        <p>By accessing or utilizing Pivot Aide’s website, business advisory, financial consulting, or Odoo ERP services, you agree to be bound by these Terms of Service. If you do not agree, please refrain from using our services.</p>
                    </div>

                    <div>
                        <div class="privacy-section-title">2. Professional Services</div>
                        <p>All insights, information, and tools presented on our site are provided for business consulting and advisory guidance. Official client engagements for accounting, SBA loan preparation, or ERP deployment are governed by executed service contracts.</p>
                    </div>

                    <div>
                        <div class="privacy-section-title">3. Intellectual Property</div>
                        <p>All content, designs, logos, text, graphics, and technical materials on this platform are owned by Pivot Aide or its licensors and are protected under copyright and intellectual property laws.</p>
                    </div>

                    <div>
                        <div class="privacy-section-title">4. User Responsibilities</div>
                        <p>You agree to provide true and accurate information when contacting us or submitting inquiries. You agree not to misuse our website or attempt unauthorized access to system resources.</p>
                    </div>

                    <div>
                        <div class="privacy-section-title">5. Limitation of Liability</div>
                        <p>Pivot Aide works diligently to ensure accurate financial guidance and software implementations. However, Pivot Aide shall not be liable for any indirect, special, or consequential damages resulting from site use.</p>
                    </div>

                    <div>
                        <div class="privacy-section-title">6. Contact & Support</div>
                        <p>If you have questions regarding these Terms of Service, please reach out to our legal and support team at <a href="mailto:info@pivotaide.com" style="color: var(--yellow); text-decoration: underline;">info@pivotaide.com</a>.</p>
                    </div>
                </div>
                <div class="privacy-modal-footer">
                    <button type="button" class="privacy-modal-btn" id="termsModalGotItBtn">Got It</button>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const overlay = document.getElementById('termsOfServiceModal');
        const closeBtn = document.getElementById('termsModalCloseBtn');
        const gotItBtn = document.getElementById('termsModalGotItBtn');

        function closeModal() {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        closeBtn.addEventListener('click', closeModal);
        gotItBtn.addEventListener('click', closeModal);

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeModal();
            }
        });
    }

    function openTermsModal() {
        initTermsModal();
        const overlay = document.getElementById('termsOfServiceModal');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        initTermsModal();

        document.addEventListener('click', function(e) {
            const logoLink = e.target.closest('.nav-logo, .footer-logo');
            if (logoLink) {
                window.location.href = 'index.html';
                return;
            }

            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            const text = (link.textContent || '').trim().toLowerCase();

            if (text === 'terms of service' || href === '#terms' || link.classList.contains('terms-link')) {
                e.preventDefault();
                openTermsModal();
            }
        });
    });
})();


