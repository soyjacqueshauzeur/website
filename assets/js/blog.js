/* SoyJacquesHauzeur Blog — vanilla JS: category filter, infinite scroll, reveal, share, lightbox */
(function () {
  'use strict';

  // ---------- Article Data ----------
  const articles = (window.BLOG_POSTS || []).slice();

  const MONTHS_BLOG = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  function blogDate(str) {
    var m = /^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i.exec(String(str).trim());
    if (!m) return new Date(0);
    var mon = MONTHS_BLOG[(m[2] || '').toLowerCase().slice(0, 3)];
    return new Date(Number(m[3]), isNaN(mon) ? 0 : mon, Number(m[1]));
  }

  // ---------- State ----------
  let currentCategory = 'all';
  const INITIAL = 8;
  const perPage = 4;
  let visibleCount = INITIAL;

  // ---------- DOM Elements ----------
  const grid = document.getElementById('blog-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Infinite-scroll sentinel (just after the grid)
  const sentinel = document.createElement('div');
  sentinel.className = 'blog-sentinel';
  sentinel.setAttribute('aria-hidden', 'true');
  if (grid && grid.parentNode) grid.parentNode.insertBefore(sentinel, grid.nextSibling);

  let filtered = [];
  let rendered = 0;

  // ---------- Render Articles ----------
  function cardHTML(article, i) {
    return `
        <a class="featured-article reveal reveal-${(i % 6) + 1}" href="${article.url}" data-slug="${article.slug}" aria-label="Read: ${article.title}">
          <div class="featured-media">
            <img src="${article.image}" alt="${article.title}" loading="lazy" decoding="async" />
            <span class="featured-pill">${capitalize(article.category)} · ${article.date}</span>
          </div>
          <div class="featured-content">
            <h2>${article.title}</h2>
            <p>${article.excerpt}</p>
            <div class="featured-meta">
              <span class="author">${article.author}</span>
              <span aria-hidden="true">·</span>
              <span class="read-time">${article.readTime}</span>
            </div>
          </div>
        </a>`;
  }

  function renderArticles(reset) {
    if (!grid) return;
    if (reset) {
      const sorted = articles.slice().sort((a, b) => blogDate(b.date) - blogDate(a.date));
      filtered = currentCategory === 'all' ? sorted : sorted.filter(a => a.category === currentCategory);
      grid.innerHTML = '';
      rendered = 0;
      visibleCount = INITIAL;
    }
    const end = Math.min(visibleCount, filtered.length);
    let html = '';
    for (let i = rendered; i < end; i++) html += cardHTML(filtered[i], i);
    if (html) grid.insertAdjacentHTML('beforeend', html);
    rendered = end;
    observeReveals();
    if (sentinel) sentinel.hidden = rendered >= filtered.length;
  }

  function loadMore() {
    if (rendered >= filtered.length) return;
    visibleCount = Math.min(visibleCount + perPage, filtered.length);
    renderArticles(false);
  }

  function fillViewport() {
    requestAnimationFrame(function again() {
      if (rendered >= filtered.length || !sentinel) return;
      if (sentinel.getBoundingClientRect().top < window.innerHeight + 500) {
        loadMore();
        requestAnimationFrame(again);
      }
    });
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ---------- Filter counts (from data) ----------
  function updateFilterCounts() {
    filterBtns.forEach(btn => {
      const cat = btn.dataset.category;
      const n = cat === 'all' ? articles.length : articles.filter(a => a.category === cat).length;
      const label = btn.textContent.split('\u00b7')[0].trim();
      btn.textContent = label + ' \u00b7 ' + n;
      btn.style.display = (!n && cat !== 'all') ? 'none' : '';
    });
  }


  // ---------- Category Filter ----------
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;
      currentCategory = cat;
      filterBtns.forEach(b => {
        b.classList.toggle('btn--primary', b.dataset.category === cat);
        b.classList.toggle('btn--ghost', b.dataset.category !== cat);
      });
      renderArticles(true);
      fillViewport();
    });
  });

  // ---------- Infinite scroll ----------
  if ('IntersectionObserver' in window && sentinel) {
    new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) { loadMore(); fillViewport(); }
    }, { rootMargin: '800px 0px' }).observe(sentinel);
  } else {
    visibleCount = Infinity;
  }

  // ---------- Reveal on Scroll ----------
  function observeReveals() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
      return;
    }

    const els = document.querySelectorAll('.reveal:not(.visible)');
    if (!els.length) return;

    els.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });

    els.forEach(el => io.observe(el));
  }

  // ---------- Initial Render ----------
  updateFilterCounts();
  renderArticles(true);
  fillViewport();

  // ---------- Smooth Scroll for Anchor Links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

// ---------- Article Page JS (runs on article pages) ----------
if (document.querySelector('.article-body')) {
  (function () {
    'use strict';

    // Lightbox for gallery images
    const galleryImages = document.querySelectorAll('.article-gallery img');
    if (galleryImages.length) {
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close lightbox">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <button class="lightbox-prev" aria-label="Previous image">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button class="lightbox-next" aria-label="Next image">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        <img class="lightbox-img" src="" alt="" />
      `;
      document.body.appendChild(lightbox);

      let currentIndex = 0;
      const images = Array.from(galleryImages);

      function openLightbox(index) {
        currentIndex = index;
        lightbox.querySelector('.lightbox-img').src = images[currentIndex].src;
        lightbox.querySelector('.lightbox-img').alt = images[currentIndex].alt;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      }

      function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
      }

      function navigate(dir) {
        currentIndex = (currentIndex + dir + images.length) % images.length;
        lightbox.querySelector('.lightbox-img').src = images[currentIndex].src;
        lightbox.querySelector('.lightbox-img').alt = images[currentIndex].alt;
      }

      images.forEach((img, i) => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => openLightbox(i));
      });

      lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
      lightbox.querySelector('.lightbox-prev').addEventListener('click', () => navigate(-1));
      lightbox.querySelector('.lightbox-next').addEventListener('click', () => navigate(1));

      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
      });

      document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
      });
    }

    // Share buttons
    const shareBtns = document.querySelectorAll('.share-btn');
    shareBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const url = window.location.href;
        const title = document.title;

        if (btn.dataset.share === 'copy') {
          await navigator.clipboard.writeText(url);
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = 'Copy', 2000);
        } else if (btn.dataset.share === 'twitter') {
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        } else if (btn.dataset.share === 'linkedin') {
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        } else if (btn.dataset.share === 'email') {
          window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        }
      });
    });

    // Reading progress indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
      const article = document.querySelector('.article-body');
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const articleHeight = rect.height;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / (articleHeight - viewportHeight)));
      progressBar.style.transform = `scaleX(${progress})`;
    }, { passive: true });

    // Sticky sidebar active link highlighting
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const headings = document.querySelectorAll('.article-main h2, .article-main h3');
    if (sidebarLinks.length && headings.length && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            sidebarLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      }, { rootMargin: '-100px 0px -66% 0px' });
      headings.forEach(h => observer.observe(h));
    }
  })();
}