/**
 * ГАРАЖ БАРБЕРШОП — script.js
 * Интерактивность: фильтрация услуг и галереи, полноэкранный лайтбокс, модалка записи, счётчики
 */

'use strict';

document.documentElement.classList.add('js');

/* ─── 1. ПРОГРЕСС-БАР СКРОЛЛА И ШАПКА ─────────────────────── */
const progressBar = document.querySelector('.scroll-progress');
const header = document.querySelector('.top');
const scrollTopBtn = document.querySelector('.scroll-top');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar && total > 0) {
    progressBar.style.width = Math.min((scrolled / total) * 100, 100) + '%';
  }
  
  if (header) {
    header.classList.toggle('scrolled', scrolled > 40);
  }
  
  if (scrollTopBtn) {
    scrollTopBtn.classList.toggle('visible', scrolled > 400);
  }
}, { passive: true });

scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ─── 2. МОБИЛЬНОЕ МЕНЮ ───────────────────────────────────── */
const burger = document.querySelector('.burger');
const mobileNav = document.querySelector('.mobile-nav');

function toggleMobileNav(state) {
  const isOpen = state !== undefined ? state : !mobileNav?.classList.contains('open');
  burger?.classList.toggle('active', isOpen);
  mobileNav?.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
  burger?.setAttribute('aria-expanded', String(isOpen));
}

burger?.addEventListener('click', () => toggleMobileNav());

document.querySelectorAll('.mobile-nav a').forEach(link => {
  link.addEventListener('click', () => toggleMobileNav(false));
});

/* ─── 3. АКТИВНЫЕ ПУНКТЫ НАВИГАЦИИ ───────────────────────── */
const navLinks = document.querySelectorAll('.top nav a[href^="#"]');
const trackedSections = document.querySelectorAll('section[id], footer[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach(link => {
      link.classList.toggle('on', link.getAttribute('href') === `#${id}`);
    });
  });
}, { threshold: 0.3, rootMargin: '-60px 0px -40% 0px' });

trackedSections.forEach(sec => navObserver.observe(sec));

/* ─── 4. ПЛАВНОЕ ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ (REVEAL) ─────────────── */
const revealElements = document.querySelectorAll('.rv');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach((el, index) => {
  el.style.setProperty('--d', `${(index % 4) * 0.1}s`);
  revealObserver.observe(el);
});

/* ─── 5. АНИМИРОВАННЫЕ СЧЁТЧИКИ ──────────────────────────── */
function runCounter(el, target, duration = 1800) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = Math.round(target * eased);
    el.textContent = current.toLocaleString('ru');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statCards = document.querySelectorAll('.stat-item');
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      const counterEl = entry.target.querySelector('.counter');
      if (counterEl) {
        const val = parseInt(counterEl.dataset.target || '0', 10);
        runCounter(counterEl, val);
      }
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

statCards.forEach(c => statsObserver.observe(c));

/* ─── 6. ФИЛЬТРАЦИЯ УСЛУГ И ГАЛЕРЕИ ───────────────────────── */
// Вкладки услуг
const svsTabBtns = document.querySelectorAll('.svc-tab-btn');
const svcCards   = document.querySelectorAll('.svc');

svsTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    svsTabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    
    svcCards.forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.style.display = match ? 'flex' : 'none';
      if (match) {
        card.classList.add('in');
      }
    });
  });
});

// Вкладки галереи
const galTabBtns = document.querySelectorAll('.gal-tab-btn');
const galItems   = document.querySelectorAll('.zoom-item');

function applyGalFilter(filter) {
  galItems.forEach(item => {
    const match = filter === 'all' || item.dataset.cat === filter;
    item.style.display = match ? 'block' : 'none';
  });
}

galTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    galTabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyGalFilter(btn.dataset.filter);
  });
});

// Применяем активную вкладку сразу при загрузке (интерьер скрыт до клика)
applyGalFilter(document.querySelector('.gal-tab-btn.active')?.dataset.filter || 'all');

/* ─── 7. ЛАЙТБОКС (ПОЛНОЭКРАННЫЙ ПРОСМОТР) ────────────────── */
const lightbox    = document.querySelector('.lightbox');
const lbImg       = document.querySelector('.lightbox__img');
const lbCaption   = document.querySelector('.lightbox__caption');
const lbCloseBtn  = document.querySelector('.lightbox__close');
const lbPrevBtn   = document.querySelector('.lightbox__nav--prev');
const lbNextBtn   = document.querySelector('.lightbox__nav--next');

let galleryList = [];
let currentIndex = 0;

function updateGalleryItems() {
  galleryList = [];
  document.querySelectorAll('.zoom-item, .tile').forEach(item => {
    const src = item.dataset.full || item.querySelector('img')?.getAttribute('src');
    const caption = item.dataset.caption || item.querySelector('img')?.getAttribute('alt') || 'Барбершоп Гараж';
    if (src && item.style.display !== 'none') {
      galleryList.push({ src, caption, element: item });
    }
  });
}
updateGalleryItems();

function openLightbox(index) {
  if (!galleryList.length) updateGalleryItems();
  currentIndex = (index + galleryList.length) % galleryList.length;
  const item = galleryList[currentIndex];
  
  if (lbImg) {
    lbImg.style.opacity = '0';
    lbImg.src = item.src;
    lbImg.onload = () => { lbImg.style.opacity = '1'; };
    setTimeout(() => { if (lbImg) lbImg.style.opacity = '1'; }, 100);
  }
  if (lbCaption) lbCaption.textContent = item.caption;
  
  lightbox?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox?.classList.remove('open');
  document.body.style.overflow = '';
}

function navLightbox(direction) {
  openLightbox(currentIndex + direction);
}

lbCloseBtn?.addEventListener('click', closeLightbox);
lbPrevBtn?.addEventListener('click', () => navLightbox(-1));
lbNextBtn?.addEventListener('click', () => navLightbox(1));

lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.querySelectorAll('.zoom-item, .tile').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    updateGalleryItems();
    const idx = galleryList.findIndex(item => item.element === el);
    openLightbox(idx >= 0 ? idx : 0);
  });
});

/* ─── 8. МОДАЛЬНОЕ ОКНО ОНЛАЙН-ЗАПИСИ ────────────────────── */
const modal = document.querySelector('.modal-overlay');
const openModalBtns = document.querySelectorAll('.open-booking-modal');
const closeModalBtn = document.querySelector('.modal-close');
const bookingForm = document.querySelector('#booking-form');

function openModal(serviceName = '') {
  const serviceInput = document.querySelector('#modal-service');
  if (serviceInput && serviceName) {
    serviceInput.value = serviceName;
  }
  modal?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal?.classList.remove('open');
  document.body.style.overflow = '';
}

openModalBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const serviceName = btn.dataset.service || '';
    openModal(serviceName);
  });
});

closeModalBtn?.addEventListener('click', closeModal);

modal?.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Отправка формы с подтверждением
bookingForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.querySelector('#modal-name')?.value || 'Гость';
  const phone = document.querySelector('#modal-phone')?.value || '';
  
  closeModal();
  showToast(`Спасибо, ${name}! Мы свяжемся с вами по номеру ${phone} для подтверждения записи.`);
  bookingForm.reset();
});

/* ─── 9. КЛАВИШИ ESCAPE И СТРЕЛКИ ─────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeModal();
    toggleMobileNav(false);
  } else if (lightbox?.classList.contains('open')) {
    if (e.key === 'ArrowRight') navLightbox(1);
    if (e.key === 'ArrowLeft')  navLightbox(-1);
  }
});

/* ─── 10. ТОСТ-УВЕДОМЛЕНИЯ ────────────────────────────────── */
function showToast(message, duration = 4000) {
  const existingToast = document.querySelector('.site-toast');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = 'site-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translate(-50%, 40px);
    background: #181818;
    color: #f5f5f0;
    border: 1px solid rgba(201, 165, 90, 0.4);
    border-left: 4px solid #c9a55a;
    padding: 16px 24px;
    font-size: 14px;
    font-family: Inter, sans-serif;
    border-radius: 2px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.7);
    z-index: 100000;
    opacity: 0;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
    max-width: 90vw;
    text-align: center;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';
  });
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 30px)';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// Уведомление при клике на звонок
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
  link.addEventListener('click', () => {
    showToast('📞 Соединяем с администратором «Гаража»...');
  });
});
