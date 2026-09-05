/* Brivon Blog — vanilla JS: category filter, infinite scroll, newsletter, reveal, share, lightbox */
(function () {
  'use strict';

  // ---------- Article Data ----------
  const articles = [
    {
      slug: 'why-4x6-silk',
      title: 'Why we still use a 4×6 silk.',
      excerpt: 'Soft does not have to mean flat. A working note about why a hard silk still beats a soft box for portrait work on a clear day — and the one modification we make to every silk that ships.',
      category: 'setup',
      date: '04 Oct 2025',
      author: 'Mira Halden',
      readTime: '8 min',
      image: 'assets/img/journal-light.jpg',
      featured: true
    },
    {
      slug: 'calibration-cheapest-hire',
      title: 'Calibration is the cheapest hire.',
      excerpt: 'An argument for hiring your printer before you hire your retoucher. A note for studios scaling from solo into a working team.',
      category: 'process',
      date: '22 Sep 2025',
      author: 'Rosa Linder',
      readTime: '12 min',
      image: 'assets/img/journal-colour.jpg',
      featured: false
    },
    {
      slug: 'third-frame',
      title: 'The third frame is usually the one.',
      excerpt: 'From the Atrium SS25 shoot — why the third frame in any sequence almost always reads the best, and what to do about it.',
      category: 'archive',
      date: '09 Aug 2025',
      author: 'Joon Park',
      readTime: '6 min',
      image: 'assets/img/journal-archive.jpg',
      featured: false
    },
    {
      slug: 'daylight-first',
      title: 'Daylight first, always.',
      excerpt: 'If natural light can do it, we use natural light. Supplement only when the brief genuinely needs the supplement. A principle note.',
      category: 'setup',
      date: '14 Jul 2025',
      author: 'Mira Halden',
      readTime: '7 min',
      image: 'assets/img/studio-hero.jpg',
      featured: false
    },
    {
      slug: 'one-producer',
      title: 'One producer per brand.',
      excerpt: 'The same person from the first call to the final delivery. Continuity is the cheapest quality lever a studio has.',
      category: 'business',
      date: '28 Jun 2025',
      author: 'Anya Stenmark',
      readTime: '9 min',
      image: 'assets/img/team-anya.jpg',
      featured: false
    },
    {
      slug: 'no-ai-imagery',
      title: 'We do not do AI imagery.',
      excerpt: 'Why the studio\'s position on generative imagery is a hard no — and how we communicate that to clients who ask.',
      category: 'philosophy',
      date: '12 Jun 2025',
      author: 'Tomas Brivón',
      readTime: '5 min',
      image: 'assets/img/contact-hero.jpg',
      featured: false
    },
    {
      slug: 'retouching-is-editing',
      title: 'Retouching is editing.',
      excerpt: 'Done in-house. Treated as part of the creative decision, never outsourced to a post house that has not seen the brief.',
      category: 'process',
      date: '30 May 2025',
      author: 'Rosa Linder',
      readTime: '11 min',
      image: 'assets/img/process-shoot.jpg',
      featured: false
    },
    {
      slug: 'colour-managed-pipeline',
      title: 'Colour-managed end-to-end.',
      excerpt: 'From capture to print. ICC-profiled. Calibrated monitors. A real print proof for any campaign that lands on paper.',
      category: 'setup',
      date: '18 May 2025',
      author: 'Rosa Linder',
      readTime: '10 min',
      image: 'assets/img/journal-colour.jpg',
      featured: false
    },
    {
      slug: 'booking-lead-times',
      title: 'Three to five months ahead.',
      excerpt: 'Why we book three to five months out for Campaign and Marque, four to six weeks for Editorial — and how we hold specific weeks once a deposit is in.',
      category: 'business',
      date: '05 May 2025',
      author: 'Anya Stenmark',
      readTime: '6 min',
      image: 'assets/img/studio-room.jpg',
      featured: false
    },
    {
      slug: 'never-ship-frame',
      title: 'Never ship a frame we would not hang.',
      excerpt: 'The first rule we ever wrote down. We have killed projects in post that we could have shipped — and we have not regretted it.',
      category: 'philosophy',
      date: '22 Apr 2025',
      author: 'Mira Halden',
      readTime: '4 min',
      image: 'assets/img/work-atrium.jpg',
      featured: false
    },
    {
      slug: 'film-still-matters',
      title: 'Film still matters — here is why.',
      excerpt: 'We still shoot Mamiya 7 for certain architecture work. The discipline it forces, the latitude it gives, and why the client feels it.',
      category: 'gear',
      date: '10 Apr 2025',
      author: 'Joon Park',
      readTime: '8 min',
      image: 'assets/img/work-arch.jpg',
      featured: false
    },
    {
      slug: 'studio-kitchen',
      title: 'The working kitchen in the studio.',
      excerpt: 'Why a real kitchen in the Brooklyn room changed how we shoot food — and why every studio doing food work should have one.',
      category: 'setup',
      date: '28 Mar 2025',
      author: 'Felix Vahl',
      readTime: '7 min',
      image: 'assets/img/studio-brooklyn.jpg',
      featured: false
    },
    {
      slug: 'archive-organisation',
      title: 'How we organise 140,000 frames.',
      excerpt: 'The naming convention, the folder structure, the backup strategy, and the one spreadsheet that makes it all searchable in seconds.',
      category: 'archive',
      date: '14 Mar 2025',
      author: 'Felix Vahl',
      readTime: '13 min',
      image: 'assets/img/journal-archive.jpg',
      featured: false
    }
  ];

  // ---------- State ----------
  let currentCategory = 'all';
  let visibleCount = 8;
  const perPage = 4;

  // ---------- DOM Elements ----------
  const grid = document.getElementById('blog-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const loadMoreBtn = document.getElementById('load-more');
  const newsletterForm = document.getElementById('newsletter-form');

  // ---------- Render Articles ----------
  function renderArticles() {
    if (!grid) return;

    const filtered = currentCategory === 'all'
      ? articles
      : articles.filter(a => a.category === currentCategory);

    const toShow = filtered.slice(0, visibleCount);

    grid.innerHTML = toShow.map((article, i) => {
      const sizes = ['xl', 'lg', 'md', 'sm', 'xs'];
      const size = sizes[i % sizes.length];

      return `
        <article class="blog-card blog-card--${size} reveal reveal-${(i % 6) + 1}" data-slug="${article.slug}">
          <a class="blog-link" href="2026/07/${article.slug}.html" aria-label="Read: ${article.title}">
            <div class="bm">
              <img src="${article.image}" alt="${article.title}" loading="lazy" />
              <span class="bm-pill">${capitalize(article.category)}</span>
              ${article.featured ? '<span class="bm-featured">Featured</span>' : ''}
            </div>
            <div class="blog-meta">
              <div>
                <div class="bm-title">${article.title}</div>
                <div class="bm-cap">${article.author} · ${article.readTime} · ${article.date}</div>
              </div>
            </div>
          </a>
        </article>
      `;
    }).join('');

    // Re-observe reveal elements
    observeReveals();
    updateLoadMoreBtn(filtered.length);
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ---------- Category Filter ----------
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;
      currentCategory = cat;
      visibleCount = 8;

      filterBtns.forEach(b => {
        b.classList.toggle('btn--primary', b.dataset.category === cat);
        b.classList.toggle('btn--ghost', b.dataset.category !== cat);
      });

      renderArticles();
    });
  });

  // ---------- Load More ----------
  function updateLoadMoreBtn(total) {
    if (!loadMoreBtn) return;
    if (visibleCount >= total) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'inline-flex';
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += perPage;
      renderArticles();
    });
  }

  // ---------- Newsletter Form ----------
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const btn = newsletterForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;

      btn.innerHTML = 'Subscribing...';
      btn.disabled = true;

      // Simulate API call
      await new Promise(r => setTimeout(r, 1200));

      btn.innerHTML = 'Subscribed! ✓';
      btn.style.background = 'var(--lime)';
      btn.style.color = 'var(--ink-000)';

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
        newsletterForm.reset();
      }, 2500);
    });
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
  renderArticles();

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

    // Article newsletter form
    const articleNewsletter = document.querySelector('.article-newsletter form');
    if (articleNewsletter) {
      articleNewsletter.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = articleNewsletter.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Subscribing...';
        btn.disabled = true;
        await new Promise(r => setTimeout(r, 1200));
        btn.innerHTML = 'Subscribed! ✓';
        btn.style.background = 'var(--lime)';
        btn.style.color = 'var(--ink-000)';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
          articleNewsletter.reset();
        }, 2500);
      });
    }

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