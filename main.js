// Main JS — navbar scroll, hamburger
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (navLinks) {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '70px';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = 'rgba(5,13,31,0.97)';
        navLinks.style.padding = '1rem 2rem';
        navLinks.style.borderBottom = '1px solid var(--border)';
      }
    });
  }

  // Animate hero stats counter
  const statNums = document.querySelectorAll('.stat-num');
  statNums.forEach(el => {
    const target = parseInt(el.textContent);
    if (!isNaN(target)) {
      let cur = 0;
      const step = () => {
        cur = Math.min(cur + Math.ceil(target / 25), target);
        el.textContent = cur + '+';
        if (cur < target) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  });

  // Intersection observer for fade-in
  const cards = document.querySelectorAll('.feature-card, .step, .cta-content');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(24px)';
    c.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    obs.observe(c);
  });
});
