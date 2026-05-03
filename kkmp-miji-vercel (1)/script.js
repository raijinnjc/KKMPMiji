/* ================================================================
   KKMP MIJI — script.js
   Koperasi Kelurahan Merah Putih Miji, Kota Mojokerto
   Ketua: Haris Saktiyanto
   ================================================================ */

/* ─────────────────────────────────────────
   Jalankan semua setelah DOM siap penuh
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. HAMBURGER MENU TOGGLE
     Membuka/menutup menu navigasi mobile
     saat tombol hamburger diklik.
  ───────────────────────────────────────── */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu   = document.getElementById('mobileMenu');

  if (hamburgerBtn && mobileMenu) {

    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');

      // Animasi ikon hamburger → X
      hamburgerBtn.classList.toggle('active', isOpen);

      // Aksesibilitas: update aria-expanded
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));

      // Cegah scroll halaman saat menu mobile terbuka
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Tutup menu saat salah satu tautan diklik
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Tutup menu saat tombol Escape ditekan
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  /**
   * Menutup menu mobile dan mereset semua state terkait.
   */
  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }


  /* ─────────────────────────────────────────
     2. NAVBAR SCROLL EFFECT
     Menambahkan shadow & border pada navbar
     saat pengguna men-scroll lebih dari 20px.
  ───────────────────────────────────────── */
  const navbar = document.getElementById('navbar');

  if (navbar) {
    // Cek posisi awal (jika halaman di-refresh di tengah)
    handleNavbarScroll();

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  }

  function handleNavbarScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }


  /* ─────────────────────────────────────────
     3. SCROLL REVEAL ANIMATION
     Menggunakan IntersectionObserver untuk
     menambahkan kelas 'visible' pada elemen
     .reveal dan .reveal-stagger saat
     memasuki viewport.
  ───────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');

  if (revealEls.length > 0) {
    const observerOptions = {
      // Elemen perlu terlihat minimal 12% sebelum animasi dipicu
      threshold: 0.12,
      // Sedikit offset agar animasi terasa lebih natural
      rootMargin: '0px 0px -40px 0px',
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Hentikan pengamatan setelah animasi selesai (tidak berulang)
          revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealEls.forEach(el => revealObserver.observe(el));
  }


  /* ─────────────────────────────────────────
     4. SMOOTH SCROLL
     Fallback smooth-scroll untuk semua tautan
     internal (#id) agar offset navbar
     diperhitungkan dengan benar.
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetSelector = this.getAttribute('href');
      if (targetSelector === '#') return; // abaikan tautan kosong

      const target = document.querySelector(targetSelector);
      if (!target) return;

      e.preventDefault();

      // Baca tinggi navbar dari CSS variable
      const navH = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height')
      ) || 72;

      const top = target.getBoundingClientRect().top + window.pageYOffset - navH;

      window.scrollTo({ top, behavior: 'smooth' });

      // Tutup menu mobile jika terbuka
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  });


  /* ─────────────────────────────────────────
     5. ACTIVE NAV LINK HIGHLIGHT
     Tandai tautan navigasi aktif berdasarkan
     section yang sedang terlihat di viewport
     menggunakan IntersectionObserver.
  ───────────────────────────────────────── */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length > 0 && navAnchors.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');

          navAnchors.forEach(anchor => {
            anchor.classList.remove('active-nav');
            if (anchor.getAttribute('href') === `#${id}`) {
              anchor.classList.add('active-nav');
            }
          });
        }
      });
    }, {
      // Section dianggap aktif jika 40% terlihat
      threshold: 0.4,
    });

    sections.forEach(section => sectionObserver.observe(section));
  }


  /* ─────────────────────────────────────────
     6. COUNTER ANIMATION
     Animasi angka pada statistik hero
     (misalnya: 0 → 500+) saat section hero
     pertama kali memasuki viewport.
  ───────────────────────────────────────── */
  const statNumbers = document.querySelectorAll('.stat-num');

  if (statNumbers.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // Ambil angka murni dari teks (tanpa tanda +, -, dll)
          const rawText   = el.textContent;
          const suffix    = el.querySelector('span') ? el.querySelector('span').textContent : '';
          const targetNum = parseInt(rawText.replace(/\D/g, ''), 10);

          if (isNaN(targetNum)) return;

          animateCounter(el, targetNum, suffix, 1500);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));
  }

  /**
   * Menjalankan animasi angka dari 0 ke targetNum.
   * @param {HTMLElement} el       - Elemen target
   * @param {number}      target   - Angka akhir
   * @param {string}      suffix   - Teks suffix (misal: "+")
   * @param {number}      duration - Durasi animasi dalam ms
   */
  function animateCounter(el, target, suffix, duration) {
    const suffixSpan = el.querySelector('span');
    const start      = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: easeOutExpo
      const eased    = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current  = Math.round(eased * target);

      if (suffixSpan) {
        el.childNodes[0].textContent = current;
      } else {
        el.textContent = current + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Pastikan nilai akhir tepat
        if (suffixSpan) {
          el.childNodes[0].textContent = target;
        } else {
          el.textContent = target + suffix;
        }
      }
    }

    requestAnimationFrame(update);
  }

}); // ── end DOMContentLoaded ──
