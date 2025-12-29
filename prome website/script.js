/*
  STACK.DEV — Interactions (Vanilla JS)
  - Smooth scroll
  - Navbar blur on scroll
  - Fade-up reveal
  - Skill progress animation on scroll
  - FAQ accordion
  - Reviews carousel
*/

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function getNavbarHeight() {
    const navbar = $('#siteNavbar');
    if (!navbar) return 0;
    return navbar.getBoundingClientRect().height || 0;
  }

  function smoothScrollToHash(hash) {
    const target = document.getElementById(hash.replace('#', ''));
    if (!target) return;

    const y = window.pageYOffset + target.getBoundingClientRect().top - getNavbarHeight() - 14;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;

        const targetId = href.slice(1);
        const target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();

        // Close mobile navbar if open
        const navCollapse = $('#navbarContent');
        if (navCollapse && navCollapse.classList.contains('show') && window.bootstrap) {
          const inst = window.bootstrap.Collapse.getInstance(navCollapse) || new window.bootstrap.Collapse(navCollapse);
          inst.hide();
        }

        smoothScrollToHash(href);
        history.pushState(null, '', href);
      });
    });

    // If page loads with a hash, scroll with offset
    if (window.location.hash) {
      setTimeout(() => smoothScrollToHash(window.location.hash), 50);
    }
  }

  function initNavbarBlurOnScroll() {
    const navbar = $('#siteNavbar');
    if (!navbar) return;

    const apply = () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 10);
    };

    apply();
    window.addEventListener('scroll', apply, { passive: true });
  }

  function initFadeUp() {
    const els = $$('.fade-up');
    if (!els.length) return;

    els.forEach((el) => {
      const delay = Number(el.getAttribute('data-delay') || '0');
      if (!Number.isNaN(delay) && delay > 0) {
        el.style.transitionDelay = `${delay}ms`;
      }
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );

    els.forEach((el) => io.observe(el));
  }

  function initProgressBars() {
    const bars = $$('.progress-bar[data-progress]');
    if (!bars.length) return;

    const animate = (bar) => {
      const val = Number(bar.getAttribute('data-progress') || '0');
      const target = Math.max(0, Math.min(100, val));

      // Trigger transition
      requestAnimationFrame(() => {
        bar.style.width = `${target}%`;
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const container = entry.target;
          $$('.progress-bar[data-progress]', container).forEach(animate);
          io.unobserve(container);
        });
      },
      { threshold: 0.25 }
    );

    const skills = $('.skills-card');
    if (skills) io.observe(skills);
    else bars.forEach(animate);
  }

  function initFaqAccordion() {
    const items = $$('.faq-item');
    if (!items.length) return;

    items.forEach((item) => {
      const btn = $('.faq-q', item);
      if (!btn) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        items.forEach((it) => it.classList.remove('is-open'));
        if (!isOpen) item.classList.add('is-open');
      });
    });
  }

  function initReviewsCarousel() {
    const out = $('#reviewText');
    const prev = $('#reviewPrev');
    const next = $('#reviewNext');
    if (!out || !prev || !next) return;

    const reviews = [
      {
        quote:
          '“The UI polish was top-tier. Everything felt fast, premium, and the deployment was flawless. Would hire again.”',
        name: 'Ayesha Rahman',
        role: 'Product Lead • NovaLabs',
      },
      {
        quote:
          '“Clean code, clear communication, and he delivered exactly what we needed. The neon/glass design looks amazing.”',
        name: 'Imran Hossain',
        role: 'Founder • Orbit Agency',
      },
      {
        quote:
          '“We shipped on time with solid architecture. The API integration and performance were excellent.”',
        name: 'Sarah Kim',
        role: 'CTO • CloudSprint',
      },
    ];

    let idx = 0;
    let timer = null;

    function render(i) {
      const r = reviews[i];
      out.innerHTML = `
        <p class="review-quote">${r.quote}</p>
        <div class="review-meta">
          <div>
            <div class="review-name">${r.name}</div>
            <div class="review-role">${r.role}</div>
          </div>
          <div class="muted small">${i + 1} / ${reviews.length}</div>
        </div>
      `;
    }

    function go(delta) {
      idx = (idx + delta + reviews.length) % reviews.length;
      render(idx);
      reset();
    }

    function reset() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => go(1), 7000);
    }

    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));

    render(idx);
    reset();
  }

  function initFooterYear() {
    const year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function initContactForm() {
    const form = $('#contactForm');
    const status = $('#formStatus');
    if (!form || !status) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const message = String(formData.get('message') || '').trim();

      if (!name || !email || !message) {
        status.textContent = 'Please fill in all fields.';
        return;
      }

      status.textContent = 'Message ready. Connect this form to your backend/email service.';
      form.reset();

      setTimeout(() => {
        status.textContent = '';
      }, 4500);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNavbarBlurOnScroll();
    initSmoothScroll();
    initFadeUp();
    initProgressBars();
    initFaqAccordion();
    initReviewsCarousel();
    initFooterYear();
    initContactForm();
  });
})();
