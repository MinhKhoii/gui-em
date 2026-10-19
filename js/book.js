(function () {
  // ELEMENTS
  const modal = document.getElementById('memory-gallery-page');
  const closeBtn = document.getElementById('close-memory-gallery');
  const prevBtn = document.getElementById('book-nav-prev');
  const nextBtn = document.getElementById('book-nav-next');
  const book3D = document.getElementById('book-3d');
  const sheets = Array.from(document.querySelectorAll('.book-sheet'));
  const dots = Array.from(document.querySelectorAll('.book-page-dot'));
  const mobileCounter = document.getElementById('book-mobile-counter');
  const readAgainBtn = document.getElementById('btn-read-again');
  const closeBackCoverBtn = document.getElementById('btn-close-back-cover');
  const envelope = document.getElementById('secret-envelope');
  const waxBtn = document.getElementById('envelope-wax-btn');
  const letterCloseBtn = document.getElementById('letter-close-btn');


  // Collect all 10 faces in order for mobile single-page sequence
  const allFaces = [];
  sheets.forEach((sheet, sIdx) => {
    const front = sheet.querySelector('.sheet-front');
    const back = sheet.querySelector('.sheet-back');
    if (front) {
      front.dataset.faceIndex = sIdx * 2;
      allFaces.push(front);
    }
    if (back) {
      back.dataset.faceIndex = sIdx * 2 + 1;
      allFaces.push(back);
    }
  });

  const totalSheets = sheets.length; // 5 sheets (0 to 4) on desktop
  const totalFaces = allFaces.length; // 10 faces (0 to 9) on mobile

  let currentSheetIndex = 0; // Desktop index: 0..5
  let mobilePageIndex = 0;   // Mobile index: 0..9
  let sharedAudioCtx = null;
  function getSharedAudioCtx() {
    try {
      if (!sharedAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) sharedAudioCtx = new AudioCtx();
      }
      if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume();
      }
      return sharedAudioCtx;
    } catch (e) {
      return null;
    }
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  // SUBTLE PAPER RUSTLE SOUND SYNTHESIZER
  function playPaperSound() {
    try {
      const ctx = getSharedAudioCtx();
      if (!ctx) return;
      const dur = 0.2;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (bufferSize * 0.28));
        data[i] = (Math.random() * 2 - 1) * decay;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3600, ctx.currentTime + 0.12);
      filter.Q.value = 1.3;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch (e) { }
  }

  // UPDATE VIEW ENGINE (HANDLES BOTH DESKTOP AND MOBILE)
  function updateView(animate = true) {
    if (isMobile()) {
      // ===== MOBILE VIEW (10 PAGES SEQUENTIAL DECK) =====
      allFaces.forEach((face, idx) => {
        face.classList.remove('active-mobile-face', 'prev-mobile-face', 'next-mobile-face');
        if (idx === mobilePageIndex) {
          face.classList.add('active-mobile-face');
        } else if (idx < mobilePageIndex) {
          face.classList.add('prev-mobile-face');
        } else {
          face.classList.add('next-mobile-face');
        }
      });

      // Update mobile counter
      if (mobileCounter) {
        if (mobilePageIndex === 0) {
          mobileCounter.textContent = 'Bìa Trước · 1/10';
        } else if (mobilePageIndex === totalFaces - 1) {
          mobileCounter.textContent = 'Bìa Sau · 10/10';
        } else {
          mobileCounter.textContent = 'Trang ' + mobilePageIndex + ' / 10';
        }
      }

      // Arrow buttons state on mobile: Ẩn hoàn toàn trên điện thoại để giao diện thoáng, không vướng
      if (prevBtn) {
        prevBtn.disabled = (mobilePageIndex === 0);
        prevBtn.style.setProperty('display', 'none', 'important');
      }
      if (nextBtn) {
        nextBtn.disabled = (mobilePageIndex === totalFaces - 1);
        nextBtn.style.setProperty('display', 'none', 'important');
      }

      if (book3D) book3D.style.transform = 'none';

    } else {
      // ===== DESKTOP VIEW (5 SHEETS 3D SPREAD) =====
      sheets.forEach((sheet, index) => {
        if (animate) {
          sheet.classList.add('is-turning');
          window.setTimeout(() => sheet.classList.remove('is-turning'), 900);
        }

        if (index < currentSheetIndex) {
          sheet.classList.add('flipped');
          sheet.style.zIndex = index + 1;
        } else {
          sheet.classList.remove('flipped');
          sheet.style.zIndex = totalSheets - index + 1;
        }
      });

      // Desktop active dot
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSheetIndex);
      });

      // Arrow buttons state on desktop: hiển thị lại bình thường
      if (prevBtn) {
        prevBtn.style.removeProperty('display');
        prevBtn.disabled = (currentSheetIndex === 0);
      }
      if (nextBtn) {
        nextBtn.style.removeProperty('display');
        nextBtn.disabled = (currentSheetIndex === totalSheets);
      }

      // Centering book perspective on desktop
      if (book3D) {
        if (currentSheetIndex === 0) {
          book3D.style.transform = 'translateX(-25%)';
        } else if (currentSheetIndex === totalSheets) {
          book3D.style.transform = 'translateX(25%)';
        } else {
          book3D.style.transform = 'translateX(0)';
        }
      }
    }
  }

  // TURN PAGE FUNCTIONS
  function turnNext() {
    if (isMobile()) {
      if (mobilePageIndex < totalFaces - 1) {
        playPaperSound();
        mobilePageIndex++;
        currentSheetIndex = Math.min(totalSheets, Math.ceil((mobilePageIndex + 1) / 2));
        updateView(true);
      }
    } else {
      if (currentSheetIndex < totalSheets) {
        playPaperSound();
        currentSheetIndex++;
        mobilePageIndex = Math.min(totalFaces - 1, currentSheetIndex * 2);
        updateView(true);
      }
    }
  }

  function turnPrev() {
    if (isMobile()) {
      if (mobilePageIndex > 0) {
        playPaperSound();
        mobilePageIndex--;
        currentSheetIndex = Math.floor(mobilePageIndex / 2);
        updateView(true);
      }
    } else {
      if (currentSheetIndex > 0) {
        playPaperSound();
        currentSheetIndex--;
        mobilePageIndex = Math.max(0, currentSheetIndex * 2 - 1);
        updateView(true);
      }
    }
  }

  function jumpToSheet(index) {
    playPaperSound();
    currentSheetIndex = index;
    mobilePageIndex = Math.min(totalFaces - 1, index * 2);
    updateView(true);
  }

  // OPEN & CLOSE MODAL
  function openBook() {
    if (celebrationModal) {
      celebrationModal.classList.remove('is-active');
      celebrationModal.style.display = 'none';
      celebrationModal.style.pointerEvents = 'none';
    }
    if (modal) {
      modal.style.display = 'flex';
      modal.style.pointerEvents = 'auto';
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
    }
    updateView(false);
    startAmbientParticles();
  }

  function closeBook() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('book-modal-active');
    document.body.style.overflow = '';
  }

  // EVENT LISTENERS
  if (closeBtn) closeBtn.addEventListener('click', closeBook);
  if (prevBtn) prevBtn.addEventListener('click', turnPrev);
  if (nextBtn) nextBtn.addEventListener('click', turnNext);

  if (readAgainBtn) {
    readAgainBtn.addEventListener('click', () => {
      mobilePageIndex = 0;
      currentSheetIndex = 0;
      playPaperSound();
      updateView(true);
    });
  }
  if (closeBackCoverBtn) {
    closeBackCoverBtn.addEventListener('click', closeBook);
  }

  // Helper: check if final scene is active / visible




  // Click on dots to jump
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = Number(dot.dataset.sheetIndex);
      jumpToSheet(target);
    });
  });

  // Click on dog-ear curls to turn pages
  document.querySelectorAll('.dog-ear-curl').forEach(curl => {
    curl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (curl.classList.contains('left-curl')) {
        turnPrev();
      } else {
        turnNext();
      }
    });
  });

  // Click on right page turns next, click on left page turns prev
  sheets.forEach((sheet, idx) => {
    const front = sheet.querySelector('.sheet-front');
    const back = sheet.querySelector('.sheet-back');
    const ignoreSelector = 'button, a, input, select, .envelope-wrapper, .dog-ear-curl, .wish-card, .wishing-jar-stage, .wishes-grid, .ch5-thumbs-row, .ch5-thumb';
    if (front) {
      front.addEventListener('click', (e) => {
        if (e.target.closest(ignoreSelector)) return;
        if (isMobile()) {
          // On mobile, tap right half turns next, tap left half turns prev
          const rect = front.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX > rect.width * 0.4) turnNext();
          else turnPrev();
        } else {
          if (idx === currentSheetIndex) turnNext();
        }
      });
    }
    if (back) {
      back.addEventListener('click', (e) => {
        if (e.target.closest(ignoreSelector)) return;
        if (isMobile()) {
          const rect = back.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX > rect.width * 0.4) turnNext();
          else turnPrev();
        } else {
          if (idx === currentSheetIndex - 1) turnPrev();
        }
      });
    }
  });

  // CHAPTER 5 INTERACTIVE PHOTO & CAPTION & WISH SWITCHER
  function initCh5Switcher() {
    const ch5Buttons = document.querySelectorAll('.ch5-thumb');
    const imgEl = document.getElementById('book-img-slot-5');
    const capEl = document.getElementById('ch5-caption');
    const bodyEl = document.getElementById('ch5-body-text');

    ch5Buttons.forEach(btn => {
      function handleSwitch(e) {
        if (e) {
          e.stopPropagation();
        }
        ch5Buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const newSrc = btn.getAttribute('data-src');
        const newCap = btn.getAttribute('data-caption');
        const newText = btn.getAttribute('data-text');

        if (imgEl && newSrc) {
          imgEl.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
          imgEl.style.opacity = '0';
          imgEl.style.transform = 'scale(0.96)';
          setTimeout(() => {
            imgEl.src = newSrc;
            imgEl.style.opacity = '1';
            imgEl.style.transform = 'scale(1)';
          }, 220);
        }

        if (capEl && newCap) {
          capEl.style.transition = 'opacity 0.2s ease';
          capEl.style.opacity = '0';
          setTimeout(() => {
            capEl.textContent = newCap;
            capEl.style.opacity = '1';
          }, 200);
        }

        if (bodyEl && newText) {
          bodyEl.style.transition = 'opacity 0.2s ease';
          bodyEl.style.opacity = '0';
          setTimeout(() => {
            bodyEl.textContent = newText;
            bodyEl.style.opacity = '1';
          }, 200);
        }
      }

      btn.addEventListener('click', handleSwitch);
    });
  }
  initCh5Switcher();

  // KEYBOARD NAVIGATION
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        openBook();
      }
      return;
    }
    if (e.key === 'Escape') {
      if (bookMusicModal && bookMusicModal.classList.contains('active')) {
        closeBookMusicModal();
      } else if (celebrationModal && celebrationModal.classList.contains('is-active')) {
        dismissCelebration();
      } else if (secretLetterCard && secretLetterCard.classList.contains('is-open')) {
        closeSecretLetter();
      } else {
        closeBook();
      }
    } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      if (bookMusicModal && bookMusicModal.classList.contains('active')) return;
      turnNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (bookMusicModal && bookMusicModal.classList.contains('active')) return;
      turnPrev();
    }
  });

  // TOUCH SWIPE NAVIGATION ON MOBILE (FLAWLESS & INTUITIVE)
  let touchStartX = 0;
  let touchStartY = 0;
  let touchFromInteractive = false;
  modal.addEventListener('touchstart', (e) => {
    touchFromInteractive = !!e.target.closest('button, a, input, select, .envelope-wrapper, .dog-ear-curl, .wish-card, .wishing-jar-stage, .wishes-grid, .ch5-thumbs-row, .ch5-thumb, .book-music-modal, .book-music-card, .book-music-control-group');
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  modal.addEventListener('touchend', (e) => {
    if (touchFromInteractive) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) turnNext(); // swipe left -> next page
      else turnPrev();          // swipe right -> prev page
    }
  }, { passive: true });

  // WINDOW RESIZE RECALCULATION
  window.addEventListener('resize', () => {
    if (modal.classList.contains('is-open')) {
      updateView(false);
    }
  });

  // INTERACTIVE ENVELOPE
  if (waxBtn) {
    waxBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      envelope.classList.add('is-open');
    });
  }
  if (letterCloseBtn) {
    letterCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      envelope.classList.remove('is-open');
    });
  }

  // AMBIENT PARTICLES & PETALS CANVAS
  let particlesAnimId = null;
  function startAmbientParticles() {
    const canvas = document.getElementById('book-ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const mobile = isMobile();
    const particles = [];
    const numParticles = mobile ? 12 : 36;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 0.8,
        speedY: Math.random() * 0.35 + 0.15,
        speedX: Math.sin(Math.random() * 6) * 0.25,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() > 0.4 ? 335 : 45
      });
    }

    function render() {
      if (!modal.classList.contains('is-open')) {
        cancelAnimationFrame(particlesAnimId);
        return;
      }
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 75%, ${p.opacity})`;
        if (!mobile) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = `hsla(${p.hue}, 85%, 70%, 0.8)`;
        }
        ctx.fill();
      });

      particlesAnimId = requestAnimationFrame(render);
    }

    render();
  }

  // CELEBRATION ELEMENTS
  const celebrationModal = document.getElementById('closing-grand-celebration');
  const replayBtn = document.getElementById('btn-replay-flipbook');
  const dismissBtn = document.getElementById('btn-dismiss-celebration');
  const secretLetterCard = document.getElementById('secret-letter-card');

  // ENVELOPE OPEN & CLOSE LOGIC (FLAWLESS)
  function openSecretLetter(e) {
    if (e) e.stopPropagation();
    if (secretLetterCard) {
      secretLetterCard.classList.add('is-open');
      playPaperSound();
    }
  }

  function closeSecretLetter(e) {
    if (e) e.stopPropagation();
    if (secretLetterCard) {
      secretLetterCard.classList.remove('is-open');
      playPaperSound();
    }
  }

  if (waxBtn) waxBtn.addEventListener('click', openSecretLetter);
  if (envelope) envelope.addEventListener('click', openSecretLetter);
  if (letterCloseBtn) letterCloseBtn.addEventListener('click', closeSecretLetter);

  // CHAPTER 6 INTERACTIVE WISH CARDS & THEMATIC PARTICLE ENGINE
  function initChapter6Wishes() {
    const wishCards = document.querySelectorAll('.wish-card');
    const wishingJar = document.getElementById('wishing-jar-interactive');
    const overlay = document.getElementById('wish-particles-overlay');

    const WISH_THEMES = {
      peace: {
        emojis: ['🌸', '💮', '🌺', '✨', '🍃', '💖'],
        colors: ['#ff85b8', '#ffb3d1', '#ffffff', '#ffd1dc'],
        toast: '🌸 Nguyện chúc em một đời an yên, thanh thản và dịu dàng!',
        soundChord: [523.25, 659.25, 783.99, 1046.50, 1318.51] // C Major
      },
      radiant: {
        emojis: ['✨', '⭐', '🌟', '💫', '✦', '✧', '💛'],
        colors: ['#f5a623', '#ffd166', '#fff9db', '#ffa94d'],
        toast: '✨ Nguyện chúc nụ cười em luôn tỏa sáng rạng ngời như ánh ban mai!',
        soundChord: [587.33, 739.99, 880.00, 1174.66, 1479.98] // D Major
      },
      loved: {
        emojis: ['💖', '❤️', '💕', '💓', '💗', '🎀'],
        colors: ['#ff4d6d', '#ff758f', '#ff8fa3', '#ffffff'],
        toast: '💖 Nguyện chúc em luôn được chở che, yêu chiều và trân trọng nhất!',
        soundChord: [440.00, 554.37, 659.25, 880.00, 1108.73] // A Major
      },
      luck: {
        emojis: ['🍀', '☘️', '🍃', '✨', '💚', '🌟'],
        colors: ['#2ec4b6', '#52b788', '#b7e4c7', '#d8f3dc'],
        toast: '🍀 Nguyện chúc mọi điều may mắn và tốt lành nhất đều mỉm cười với em!',
        soundChord: [523.25, 659.25, 783.99, 987.77, 1318.51] // C Maj7
      }
    };

    const wishMsgEl = document.getElementById('ch6-wish-message');

    function showWishMessage(text, themeColor) {
      if (!wishMsgEl) return;
      wishMsgEl.textContent = text;
      wishMsgEl.style.color = themeColor;
      wishMsgEl.classList.remove('is-wished-active');
      requestAnimationFrame(() => {
        wishMsgEl.classList.add('is-wished-active');
      });
    }

    function spawnThemedWishParticles(card, wishKey) {
      if (!overlay) return;
      const theme = WISH_THEMES[wishKey] || WISH_THEMES.peace;

      // Limit particle clutter for 60fps performance
      while (overlay.children.length > 20) {
        overlay.removeChild(overlay.firstChild);
      }

      const overlayRect = overlay.getBoundingClientRect();
      const rect = card.getBoundingClientRect();
      const startX = (rect.left + rect.width / 2) - overlayRect.left;
      const startY = (rect.top + rect.height / 2) - overlayRect.top;

      const fragment = document.createDocumentFragment();

      // 1. Burst floating themed elements
      const count = isMobile() ? 9 : 14;
      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'floating-wish-blossom';
        el.textContent = theme.emojis[Math.floor(Math.random() * theme.emojis.length)];

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 80 + 35;
        const burstX = Math.cos(angle) * speed;
        const burstY = Math.sin(angle) * speed - (Math.random() * 50 + 25);
        const floatY = -(Math.random() * 180 + 120);
        const swayX = (Math.random() - 0.5) * 100;
        const rot = (Math.random() - 0.5) * 540;
        const size = Math.random() * 8 + 15;
        const duration = Math.random() * 0.5 + 1.4;
        const delay = Math.random() * 0.08;

        el.style.left = startX + 'px';
        el.style.top = startY + 'px';
        el.style.fontSize = size + 'px';
        el.style.setProperty('--burst-x', burstX + 'px');
        el.style.setProperty('--burst-y', burstY + 'px');
        el.style.setProperty('--float-y', floatY + 'px');
        el.style.setProperty('--sway-x', swayX + 'px');
        el.style.setProperty('--rotate-deg', rot + 'deg');
        el.style.animationDuration = duration + 's';
        el.style.animationDelay = delay + 's';

        fragment.appendChild(el);
        setTimeout(() => {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, (duration + delay) * 1000 + 50);
      }

      // 2. Stream of stardust into the jar
      if (wishingJar) {
        const jRect = wishingJar.getBoundingClientRect();
        const targetX = (jRect.left + jRect.width / 2) - overlayRect.left;
        const targetY = (jRect.top + jRect.height * 0.45) - overlayRect.top;
        const starCount = isMobile() ? 5 : 7;

        for (let k = 0; k < starCount; k++) {
          const star = document.createElement('div');
          star.className = 'stardust-stream-particle';
          star.textContent = k % 2 === 0 ? '✦' : '✧';
          star.style.color = theme.colors[k % theme.colors.length];
          star.style.left = startX + 'px';
          star.style.top = startY + 'px';

          const dx = targetX - startX;
          const dy = targetY - startY;
          const arcControlY = Math.min(startY, targetY) - (Math.random() * 70 + 30);

          star.style.setProperty('--dx', dx + 'px');
          star.style.setProperty('--dy', dy + 'px');
          star.style.setProperty('--arc-y', (arcControlY - startY) + 'px');
          star.style.animationDelay = (k * 0.04) + 's';

          fragment.appendChild(star);
          setTimeout(() => {
            if (star.parentNode) star.parentNode.removeChild(star);
          }, 650);
        }

        // Jar pulse when stardust enters
        setTimeout(() => {
          wishingJar.classList.add('jar-pulse-glow');
          setTimeout(() => wishingJar.classList.remove('jar-pulse-glow'), 550);
        }, 320);
      }

      // Single paint pass
      overlay.appendChild(fragment);

      // Instant message feedback & audio
      showWishMessage(theme.toast, theme.colors[0]);
      playMelodicChime(theme.soundChord);
    }

    wishCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const wishKey = card.getAttribute('data-wish') || 'peace';

        card.classList.add('is-wished');
        card.classList.remove('just-clicked');
        requestAnimationFrame(() => {
          card.classList.add('just-clicked');
        });

        spawnThemedWishParticles(card, wishKey);
      });
    });

    // Clicking jar directly releases celebration burst
    if (wishingJar) {
      wishingJar.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        wishingJar.classList.add('jar-pulse-glow');
        setTimeout(() => wishingJar.classList.remove('jar-pulse-glow'), 550);

        if (overlay) {
          while (overlay.children.length > 20) {
            overlay.removeChild(overlay.firstChild);
          }
          const overlayRect = overlay.getBoundingClientRect();
          const rect = wishingJar.getBoundingClientRect();
          const startX = (rect.left + rect.width / 2) - overlayRect.left;
          const startY = (rect.top + rect.height / 2) - overlayRect.top;
          const allEmojis = ['🌸', '✨', '💖', '🍀', '⭐', '🌟', '💕', '🎀'];
          const frag = document.createDocumentFragment();
          const pCount = isMobile() ? 12 : 18;

          for (let i = 0; i < pCount; i++) {
            const el = document.createElement('div');
            el.className = 'floating-wish-blossom';
            el.textContent = allEmojis[Math.floor(Math.random() * allEmojis.length)];

            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 85 + 40;
            const burstX = Math.cos(angle) * speed;
            const burstY = Math.sin(angle) * speed - (Math.random() * 60 + 20);
            const floatY = -(Math.random() * 200 + 120);
            const swayX = (Math.random() - 0.5) * 110;
            const rot = (Math.random() - 0.5) * 540;
            const duration = Math.random() * 0.5 + 1.5;

            el.style.left = startX + 'px';
            el.style.top = startY + 'px';
            el.style.fontSize = (Math.random() * 8 + 16) + 'px';
            el.style.setProperty('--burst-x', burstX + 'px');
            el.style.setProperty('--burst-y', burstY + 'px');
            el.style.setProperty('--float-y', floatY + 'px');
            el.style.setProperty('--sway-x', swayX + 'px');
            el.style.setProperty('--rotate-deg', rot + 'deg');
            el.style.animationDuration = duration + 's';

            frag.appendChild(el);
            setTimeout(() => {
              if (el.parentNode) el.parentNode.removeChild(el);
            }, duration * 1000 + 50);
          }
          overlay.appendChild(frag);
        }

        showWishMessage('🌟 Cả một bầu trời yêu thương và may mắn dành riêng cho em!', '#d48806');
        playMelodicChime([523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]);
      });
    }
  }

  function playMelodicChime(chord) {
    try {
      const ctx = getSharedAudioCtx();
      if (!ctx) return;
      const notes = chord || [523.25, 659.25, 783.99, 1046.50];
      const now = ctx.currentTime;
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.055;
        osc.frequency.setValueAtTime(f, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.6);
      });
    } catch (err) { }
  }

  initChapter6Wishes();

  // GRAND CLOSING CELEBRATION
  let fireworksAnimId = null;
  function triggerSpecialBookClosing() {
    if (celebrationModal) {
      celebrationModal.classList.add('is-active');
      celebrationModal.setAttribute('aria-hidden', 'false');
      playCelebrationChord();
      startCelebrationFireworks();
    }
  }

  function dismissCelebration() {
    if (celebrationModal) {
      celebrationModal.classList.remove('is-active');
      celebrationModal.setAttribute('aria-hidden', 'true');
      if (fireworksAnimId) cancelAnimationFrame(fireworksAnimId);
    }
  }

  function replayFromBeginning() {
    dismissCelebration();
    currentSheetIndex = 0;
    mobilePageIndex = 0;
    updateView(false);
    openBook();
  }

  if (closeBackCoverBtn) {
    closeBackCoverBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerSpecialBookClosing();
    });
  }

  if (replayBtn) replayBtn.addEventListener('click', replayFromBeginning);
  if (dismissBtn) dismissBtn.addEventListener('click', dismissCelebration);

  function playCelebrationChord() {
    try {
      const ctx = getSharedAudioCtx();
      if (!ctx) return;
      const chord = [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
      const now = ctx.currentTime;
      chord.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.08;
        osc.frequency.setValueAtTime(f, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.14, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 1.2);
      });
    } catch (e) { }
  }

  // FIREWORKS & FLOATING HEARTS CANVAS
  function startCelebrationFireworks() {
    const canvas = document.getElementById('closing-fireworks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const particles = [];
    const colors = ['#ff6b8b', '#ffd166', '#06d6a0', '#118ab2', '#ff9f1c', '#e056fd', '#f8a5c2'];

    function spawnRocket() {
      const startX = Math.random() * (w * 0.8) + w * 0.1;
      const targetY = Math.random() * (h * 0.5) + h * 0.1;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const count = isMobile() ? 28 : 55;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2;
        const speed = Math.random() * 4.5 + 2;
        particles.push({
          x: startX,
          y: targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: color,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.01,
          size: Math.random() * 2.5 + 1.5,
          isHeart: Math.random() > 0.7
        });
      }
    }

    // Click to add more fireworks
    canvas.addEventListener('click', (e) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.5;
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: color,
          alpha: 1,
          decay: Math.random() * 0.018 + 0.012,
          size: Math.random() * 3 + 1.5,
          isHeart: true
        });
      }
      playChimeSound();
    });

    let rocketTimer = 0;
    function render() {
      if (!celebrationModal.classList.contains('is-active')) return;
      ctx.clearRect(0, 0, w, h);

      rocketTimer++;
      if (rocketTimer % 45 === 0) {
        spawnRocket();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity
        p.vx *= 0.98; // drag
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        if (p.isHeart) {
          ctx.font = (p.size * 5) + "px Arial";
          ctx.fillText('💖', p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      fireworksAnimId = requestAnimationFrame(render);
    }

    spawnRocket();
    setTimeout(spawnRocket, 300);
    render();
  }


  // === MUSIC PLAYER FOR 3D FLIPBOOK (BẢN NHẠC GỐC DU DƯƠNG) ===
  const bookAudio = document.getElementById('book-bg-audio');
  const bookAudioBtn = document.getElementById('book-audio-btn');

  function updateBookMusicUI() {
    if (!bookAudioBtn) return;
    if (bookAudio && !bookAudio.paused) {
      bookAudioBtn.classList.add('playing');
      bookAudioBtn.title = "Đang phát nhạc nền du dương (Nhấn để tạm dừng)";
    } else {
      bookAudioBtn.classList.remove('playing');
      bookAudioBtn.title = "Phát nhạc nền du dương (Nhấn để bật)";
    }
  }

  if (bookAudio) {
    bookAudio.src = 'audio/soundtrack.mp3';
    bookAudio.volume = 0.65;
    updateBookMusicUI();

    function tryPlayBookAudio() {
      if (!bookAudio) return Promise.reject();
      bookAudio.volume = 0.65;
      const playPromise = bookAudio.play();
      if (playPromise !== undefined) {
        return playPromise.then(() => {
          updateBookMusicUI();
          removeBookUnlockListeners();
        }).catch((err) => {
          throw err;
        });
      }
      return Promise.resolve();
    }

    const bookUnlockEvents = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown', 'scroll', 'wheel'];
    function onBookUnlockInteract() {
      tryPlayBookAudio().catch(() => {});
    }

    let bookUnlockAttached = false;
    function addBookUnlockListeners() {
      if (bookUnlockAttached) return;
      bookUnlockAttached = true;
      bookUnlockEvents.forEach(evt => {
        window.addEventListener(evt, onBookUnlockInteract, { capture: true, passive: true });
        document.addEventListener(evt, onBookUnlockInteract, { capture: true, passive: true });
      });
    }

    function removeBookUnlockListeners() {
      if (!bookUnlockAttached) return;
      bookUnlockAttached = false;
      bookUnlockEvents.forEach(evt => {
        window.removeEventListener(evt, onBookUnlockInteract, { capture: true });
        document.removeEventListener(evt, onBookUnlockInteract, { capture: true });
      });
    }

    addBookUnlockListeners();
    tryPlayBookAudio().catch(() => {});

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => tryPlayBookAudio().catch(() => {}));
    }
    window.addEventListener('load', () => tryPlayBookAudio().catch(() => {}));
    window.addEventListener('pageshow', () => tryPlayBookAudio().catch(() => {}));
    bookAudio.addEventListener('canplay', () => tryPlayBookAudio().catch(() => {}));
    bookAudio.addEventListener('canplaythrough', () => tryPlayBookAudio().catch(() => {}));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && bookAudio && bookAudio.paused) {
        tryPlayBookAudio().catch(() => {});
      }
    });

    if (bookAudioBtn) {
      bookAudioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (bookAudio.paused) {
          tryPlayBookAudio().catch(() => {});
        } else {
          bookAudio.pause();
          updateBookMusicUI();
        }
      });
    }

    bookAudio.addEventListener('play', () => {
      updateBookMusicUI();
      removeBookUnlockListeners();
    });
    bookAudio.addEventListener('pause', updateBookMusicUI);
    bookAudio.addEventListener('ended', () => {
      bookAudio.currentTime = 0;
      tryPlayBookAudio().catch(() => {});
    });
  }

  // Automatic Initialization for Standalone 3D Flipbook
  function initBook() {
    openBook();
    updateView(false);
    startAmbientParticles();
  }

  // Run on load and immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBook);
  } else {
    initBook();
  }

  window.addEventListener('resize', () => {
    updateView(false);
  });

})();
