/**
 * ===================================================================
 * MEMORY ANNIVERSARY WEBSITE JAVASCRIPT
 * Chủ đề: CẢM ƠN EM, VÌ TẤT CẢ ❤️
 * Phong cách: Romantic Cinematic – Minimal Luxury – Personal Travel Journal
 * ===================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initOpeningGate();
    initAudioController();
    initHeroCanvas();
    initFooterNightCanvas();
    initScrollReveal();
    initAnniversaryCalendar();
    initVungTauLeafletMap();
    initTravelJournalStops();
    initGallery();
    initLittleThings();
    initLetterReveal();
    initTimeline();
    initClickSparkleEffect();
    initNavbarScroll();
    initModals();
    initReplayAction();
});

/* ===================================================================
   1. OPENING GATE – MÀN HÌNH MỞ ĐẦU (GIFT ENVELOPE)
   =================================================================== */
function initOpeningGate() {
    const gate = document.getElementById('opening-gate');
    const openBtn = document.getElementById('open-gift-gate-btn');
    const canvas = document.getElementById('opening-gate-canvas');

    if (canvas) {
        window.openingGateCanvasController = initSunsetCanvas(canvas, 24);
    }

    window.stopOpeningCanvas = function() {
        if (window.openingGateCanvasController) {
            window.openingGateCanvasController.destroy();
            window.openingGateCanvasController = null;
        }
    };

    if (!gate || !openBtn) return;

    // Chặn triệt để cuộn chuột, lăn bánh xe và vuốt khi màn hình mở cổng đang bật
    if (!gate.classList.contains('hidden')) {
        document.documentElement.classList.add('gate-active');
        document.body.classList.add('gate-active');
        document.body.style.overflow = 'hidden';
        window.scrollTo(0, 0);
    }

    gate.addEventListener('wheel', (e) => {
        e.preventDefault();
        e.stopPropagation();
    }, { passive: false });

    gate.addEventListener('touchmove', (e) => {
        e.preventDefault();
        e.stopPropagation();
    }, { passive: false });

    // Điều hướng toàn bộ sự kiện mở cổng qua hàm window.openGiftGate thống nhất
    function handleOpen(e) {
        if (typeof window.openGiftGate === 'function') {
            window.openGiftGate(e);
        }
    }

    openBtn.addEventListener('click', handleOpen);
    openBtn.addEventListener('touchend', (e) => {
        handleOpen(e);
    }, { passive: false });
}

function initSunsetCanvas(canvas, count = 30, observeContainer = null) {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0, height = 0;
    let particles = [];
    let rafId = null;
    let isRunning = false;
    let isDestroyed = false;

    // Giảm số hạt trên điện thoại để đạt chuẩn 60-120fps mượt mà
    const isMobile = window.innerWidth < 768;
    const actualCount = isMobile ? Math.min(count, 14) : Math.min(count, 24);

    function resize() {
        if (isDestroyed) return;
        width = canvas.width = canvas.parentElement ? canvas.parentElement.offsetWidth : window.innerWidth;
        height = canvas.height = canvas.parentElement ? canvas.parentElement.offsetHeight : window.innerHeight;
        particles = [];
        for (let i = 0; i < actualCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height * 0.9,
                radius: Math.random() * 1.8 + 0.8,
                speedY: Math.random() * 0.3 + 0.12,
                speedX: (Math.random() - 0.5) * 0.25,
                opacity: Math.random() * 0.65 + 0.2,
                fadeSpeed: Math.random() * 0.008 + 0.004,
                rising: true,
                color: Math.random() > 0.4 ? '216, 188, 138' : '232, 161, 123'
            });
        }
    }

    function render() {
        if (!isRunning || isDestroyed) return;
        ctx.clearRect(0, 0, width, height);

        // Vẽ hạt cực nhẹ: KHÔNG dùng shadowBlur vì gây tụt FPS trên mobile
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.y -= p.speedY;
            p.x += p.speedX;

            if (p.rising) {
                p.opacity += p.fadeSpeed;
                if (p.opacity >= 0.8) p.rising = false;
            } else {
                p.opacity -= p.fadeSpeed;
                if (p.opacity <= 0.15) p.rising = true;
            }

            if (p.y < 0) {
                p.y = height * 0.9;
                p.x = Math.random() * width;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + p.color + ',' + p.opacity + ')';
            ctx.fill();
        }

        rafId = requestAnimationFrame(render);
    }

    const controller = {
        start() {
            if (isDestroyed || isRunning) return;
            isRunning = true;
            rafId = requestAnimationFrame(render);
        },
        pause() {
            if (!isRunning) return;
            isRunning = false;
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        },
        destroy() {
            isDestroyed = true;
            this.pause();
            window.removeEventListener('resize', resize);
            if (observer) observer.disconnect();
            if (ctx) ctx.clearRect(0, 0, width, height);
            particles = [];
        }
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();
    controller.start();

    // Tự động tạm dừng canvas khi người dùng lướt ra ngoài màn hình
    let observer = null;
    const targetElement = observeContainer || canvas;
    if ('IntersectionObserver' in window && targetElement) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    controller.start();
                } else {
                    controller.pause();
                }
            });
        }, { threshold: 0.05 });
        observer.observe(targetElement);
    }

    return controller;
}

/* ===================================================================
   2. AUDIO CONTROLLER
   =================================================================== */
function initAudioController() {
    const audio = document.getElementById('bg-music-player');
    const audioWidget = document.getElementById('floating-audio-widget');
    const playToggleBtn = document.getElementById('audio-play-toggle-btn');
    const volumeSlider = document.getElementById('audio-volume-slider');
    const titleText = document.getElementById('audio-title-display');

    if (!audio || !audioWidget) return;

    // Nạp dữ liệu cấu hình
    const config = MemoryStore.getAllData().siteConfig;
    if (config.bgMusicUrl) audio.src = config.bgMusicUrl;
    if (titleText && config.bgMusicTitle) titleText.textContent = config.bgMusicTitle;

    audio.volume = 0.5;
    if (volumeSlider) volumeSlider.value = 50;

    let isPlaying = false;

    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            audioWidget.classList.remove('playing');
            isPlaying = false;
        } else {
            audio.play().then(() => {
                audioWidget.classList.add('playing');
                isPlaying = true;
            }).catch(err => console.log('Autoplay prevented:', err));
        }
    }

    if (playToggleBtn) playToggleBtn.addEventListener('click', togglePlay);
    const disc = audioWidget.querySelector('.audio-disc-icon');
    if (disc) disc.addEventListener('click', togglePlay);

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value / 100;
        });
    }
}

/* ===================================================================
   3. HERO CANVAS
   =================================================================== */
function initHeroCanvas() {
    const canvas = document.getElementById('hero-ambient-canvas');
    const heroSection = document.getElementById('hero');
    if (canvas) {
        // Chỉ chạy khi phần Hero hiển thị trên màn hình
        initSunsetCanvas(canvas, 24, heroSection);
    }
}

/* ===================================================================
   4. FOOTER NIGHT SEA CANVAS (STARS, SHOOTING STARS & GLOWING WISH HEARTS)
   =================================================================== */
function initFooterNightCanvas() {
    const canvas = document.getElementById('night-stars-canvas') || document.getElementById('footer-stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let width, height;
    let stars = [];
    let shootingStars = [];
    let glowingHearts = [];
    let sparkles = [];
    let trailSparks = [];
    let rafId = null;
    let isRunning = false;

    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 38 : 75;
    const ambientHeartCount = isMobile ? 6 : 10;

    // Palette: Champagne gold, amber starlight, candlelight warm glow, soft rose
    const heartColors = [
        'rgba(255, 222, 173, ',  // Warm Champagne Gold
        'rgba(248, 180, 160, ',  // Sunset Peach Rose
        'rgba(255, 238, 204, ',  // Soft Starlight Amber
        'rgba(245, 195, 205, ',  // Romantic Blush
        'rgba(255, 200, 150, '   // Warm Candlelight
    ];

    function createGlowingHeart(customY, isBurst = false) {
        const colorPrefix = heartColors[Math.floor(Math.random() * heartColors.length)];
        const size = Math.random() * 5 + (isBurst ? 8 : 6.5);
        return {
            x: Math.random() * (width - 40) + 20,
            y: typeof customY === 'number' ? customY : (height + Math.random() * 40),
            size: size,
            alpha: Math.random() * 0.4 + 0.5,
            maxAlpha: Math.random() * 0.35 + 0.65,
            speedY: -(Math.random() * 0.85 + (isBurst ? 1.4 : 0.65)), // Floating UPWARD like wish lanterns!
            speedX: (Math.random() - 0.5) * 0.5,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.035 + 0.02,
            rotation: (Math.random() - 0.5) * 0.35,
            colorPrefix: colorPrefix
        };
    }

    function createSparkle(x, y) {
        return {
            x: typeof x === 'number' ? x : Math.random() * width,
            y: typeof y === 'number' ? y : Math.random() * height,
            size: Math.random() * 3.5 + 2,
            alpha: Math.random() * 0.8 + 0.2,
            pulse: (Math.random() * 0.03 + 0.015),
            color: Math.random() > 0.35 ? 'rgba(255, 230, 180,' : 'rgba(255, 255, 255,',
            isDiamond: Math.random() > 0.3,
            speedY: Math.random() * 0.4 + 0.15,
            speedX: (Math.random() - 0.3) * 0.35,
            life: Math.random() * 140 + 80
        };
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = canvas.parentElement.offsetHeight || 650;

        // Init background static twinkling stars
        stars = [];
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height * 0.9,
                radius: Math.random() * 1.4 + 0.4,
                alpha: Math.random() * 0.7 + 0.25,
                pulse: Math.random() * 0.015 + 0.005
            });
        }

        // Init ambient floating glowing hearts
        if (glowingHearts.length === 0) {
            for (let i = 0; i < ambientHeartCount; i++) {
                glowingHearts.push(createGlowingHeart(Math.random() * height));
            }
        }
    }

    function addShootingStar() {
        if (Math.random() < 0.025 && shootingStars.length < 3) {
            shootingStars.push({
                x: Math.random() * width * 0.85,
                y: Math.random() * (height * 0.4),
                length: Math.random() * 110 + 60,
                speed: Math.random() * 7.5 + 5.5,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.15,
                opacity: 1,
                headSize: Math.random() * 1.6 + 2.2
            });
        }
    }

    window.spawnShootingStarsAndFlurry = function(numStars = 8, numHearts = 24) {
        // 1. Spawning burst of shooting stars across 2.2 seconds
        for (let i = 0; i < numStars; i++) {
            setTimeout(() => {
                shootingStars.push({
                    x: Math.random() * (width * 0.85),
                    y: Math.random() * (height * 0.38),
                    length: Math.random() * 130 + 80,
                    speed: Math.random() * 8.5 + 6.5,
                    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
                    opacity: 1,
                    headSize: Math.random() * 1.8 + 2.4
                });
            }, i * 220);
        }

        // 2. Spawning burst of luminous wish hearts floating up into the sky
        for (let i = 0; i < numHearts; i++) {
            setTimeout(() => {
                glowingHearts.push(createGlowingHeart(height + Math.random() * 40, true));
            }, i * 75);
        }

        // 3. Spawning bursts of stardust sparkles
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                sparkles.push(createSparkle(
                    Math.random() * width,
                    Math.random() * (height * 0.7)
                ));
            }, i * 60);
        }
    };

    // Helper: draw an ethereal glowing heart
    function drawGlowingHeart(h) {
        ctx.save();
        ctx.translate(h.x + Math.sin(h.wobble) * 6, h.y);
        ctx.rotate(h.rotation);
        ctx.globalAlpha = h.alpha;

        const color = h.colorPrefix + h.alpha + ')';
        ctx.fillStyle = color;
        ctx.shadowColor = h.colorPrefix + '0.85)';
        ctx.shadowBlur = h.size * 1.4;

        // Draw classic upright heart
        const s = h.size;
        ctx.beginPath();
        ctx.moveTo(0, 0); // top center cleft
        ctx.bezierCurveTo(-s / 2, -s / 2, -s, s / 3, 0, s); // left lobe to bottom point
        ctx.bezierCurveTo(s, s / 3, s / 2, -s / 2, 0, 0); // bottom point to right lobe to cleft
        ctx.fill();

        // Inner glowing starlight core
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (h.alpha * 0.65) + ')';
        ctx.beginPath();
        const is = s * 0.45;
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-is / 2, -is / 2, -is, is / 3, 0, is);
        ctx.bezierCurveTo(is, is / 3, is / 2, -is / 2, 0, 0);
        ctx.fill();

        ctx.restore();
    }

    // Helper: draw diamond sparkle
    function drawSparkle(sp) {
        ctx.save();
        ctx.translate(sp.x, sp.y);
        ctx.fillStyle = sp.color + sp.alpha + ')';

        if (sp.isDiamond) {
            ctx.shadowColor = sp.color + '0.7)';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(0, -sp.size);
            ctx.quadraticCurveTo(0, 0, sp.size, 0);
            ctx.quadraticCurveTo(0, 0, 0, sp.size);
            ctx.quadraticCurveTo(0, 0, -sp.size, 0);
            ctx.quadraticCurveTo(0, 0, 0, -sp.size);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, sp.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function render() {
        if (!isRunning) return;
        ctx.clearRect(0, 0, width, height);

        // 1. Draw static background stars
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            s.alpha += s.pulse;
            if (s.alpha > 0.95 || s.alpha < 0.25) s.pulse = -s.pulse;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(248, 243, 233, ' + s.alpha + ')';
            ctx.fill();
        }

        // 2. Update and draw shooting stars
        addShootingStar();
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            const endX = ss.x - Math.cos(ss.angle) * ss.length;
            const endY = ss.y - Math.sin(ss.angle) * ss.length;

            // Gradient tail (bright white head -> warm gold -> sunset peach -> fade)
            const grad = ctx.createLinearGradient(ss.x, ss.y, endX, endY);
            grad.addColorStop(0, 'rgba(255, 255, 255, ' + (ss.opacity * 0.98) + ')');
            grad.addColorStop(0.2, 'rgba(255, 230, 185, ' + (ss.opacity * 0.85) + ')');
            grad.addColorStop(0.65, 'rgba(232, 161, 123, ' + (ss.opacity * 0.4) + ')');
            grad.addColorStop(1, 'rgba(232, 161, 123, 0)');

            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.9;
            ctx.stroke();

            // Head core & halo glow
            ctx.beginPath();
            ctx.arc(ss.x, ss.y, ss.headSize, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + ss.opacity + ')';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(ss.x, ss.y, ss.headSize * 2.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 226, 180, ' + (ss.opacity * 0.4) + ')';
            ctx.fill();

            // Spawn trail spark occasionally
            if (Math.random() < 0.5) {
                trailSparks.push({
                    x: ss.x - Math.cos(ss.angle) * (Math.random() * 25),
                    y: ss.y - Math.sin(ss.angle) * (Math.random() * 25),
                    radius: Math.random() * 1.3 + 0.6,
                    alpha: ss.opacity * 0.85,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: Math.random() * 0.5 + 0.2
                });
            }

            ss.x += Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.opacity -= 0.022;

            if (ss.opacity <= 0) shootingStars.splice(i, 1);
        }

        // 3. Update & draw trail sparks
        for (let i = trailSparks.length - 1; i >= 0; i--) {
            const ts = trailSparks[i];
            ts.x += ts.speedX;
            ts.y += ts.speedY;
            ts.alpha -= 0.026;
            if (ts.alpha <= 0) {
                trailSparks.splice(i, 1);
                continue;
            }
            ctx.beginPath();
            ctx.arc(ts.x, ts.y, ts.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 226, 180, ' + ts.alpha + ')';
            ctx.fill();
        }

        // 4. Update & draw sparkles
        for (let i = sparkles.length - 1; i >= 0; i--) {
            const sp = sparkles[i];
            sp.y += sp.speedY;
            sp.x += sp.speedX;
            sp.alpha += sp.pulse;
            if (sp.alpha > 0.95 || sp.alpha < 0.2) sp.pulse = -sp.pulse;
            sp.life--;

            if (sp.life <= 0 || sp.y > height + 20) {
                sparkles.splice(i, 1);
                continue;
            }
            drawSparkle(sp);
        }

        // 5. Update & draw floating glowing hearts (ascending like warm starlight lanterns)
        for (let i = glowingHearts.length - 1; i >= 0; i--) {
            const h = glowingHearts[i];
            h.y += h.speedY;
            h.x += h.speedX;
            h.wobble += h.wobbleSpeed;

            // If heart floats above screen
            if (h.y < -30) {
                if (glowingHearts.length > ambientHeartCount) {
                    glowingHearts.splice(i, 1);
                    continue;
                } else {
                    // Recycle ambient heart to bottom
                    h.y = height + 25;
                    h.x = Math.random() * (width - 40) + 20;
                }
            }
            drawGlowingHeart(h);
        }

        rafId = requestAnimationFrame(render);
    }

    function start() {
        if (isRunning) return;
        isRunning = true;
        rafId = requestAnimationFrame(render);
    }

    function pause() {
        if (!isRunning) return;
        isRunning = false;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // CHỈ CHẠY animation sao trời khi màn hình kết thúc xuất hiện
    const farewellSection = document.getElementById('farewell-night');
    if ('IntersectionObserver' in window && farewellSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    start();
                } else {
                    pause();
                }
            });
        }, { threshold: 0.05 });
        observer.observe(farewellSection);
    } else {
        start();
    }
}

window.triggerStarWish = function() {
    const btn = document.getElementById('star-wish-btn');
    if (btn) {
        btn.innerHTML = '✨ Cả bầu trời sao đang dành cho em...';
        btn.style.background = 'linear-gradient(135deg, var(--champagne-gold), var(--sunset-peach))';
        btn.style.color = 'var(--deep-sea)';
        btn.style.borderColor = 'transparent';
        btn.style.boxShadow = '0 0 25px rgba(232, 161, 123, 0.65)';
        setTimeout(() => {
            btn.innerHTML = '💫 Ngắm Sao Băng';
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
            btn.style.boxShadow = '';
        }, 4500);
    }
    if (window.spawnShootingStarsAndFlurry) {
        window.spawnShootingStarsAndFlurry(8, 24);
    }
};

function initReplayAction() {
    const replayBtn = document.getElementById('replay-btn');
    const gate = document.getElementById('opening-gate');
    if (replayBtn && gate) {
        replayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            gate.classList.remove('hidden');
            gate.style.display = 'flex';
            gate.style.opacity = '1';
            gate.style.transform = 'scale(1)';
            gate.style.pointerEvents = 'auto';
            document.documentElement.classList.add('gate-active');
            document.body.classList.add('gate-active');
            document.body.style.overflow = 'hidden';
            window.scrollTo({ top: 0, behavior: 'instant' });
        });
    }
}

/* ===================================================================
   5. ANNIVERSARY CALENDAR (07/08/2026)
   =================================================================== */
function initAnniversaryCalendar() {
    const grid = document.getElementById('calendar-days-grid');
    if (!grid) return;

    // Tháng 8 năm 2026: ngày 1 rơi vào Thứ 7 (Sat)
    // Lịch Thứ 2 -> CN: 5 ô trống trước ngày 1
    const emptyCells = 5;
    const totalDays = 31;
    const specialDay = 7; // Thứ 6, 07/08/2026

    grid.innerHTML = '';
    for (let i = 0; i < emptyCells; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-day empty';
        grid.appendChild(empty);
    }

    for (let d = 1; d <= totalDays; d++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day';
        if (d === specialDay) {
            cell.classList.add('special-day');
            cell.innerHTML = `<span>${d}</span><span class="special-day-tag">Gặp gỡ ❤️</span>`;
            cell.title = '07/08/2026 – Ngày đầu tiên chúng ta gặp nhau';
            cell.addEventListener('click', (e) => {
                createHeartBurst(e.clientX, e.clientY);
            });
        } else {
            cell.textContent = d;
        }
        grid.appendChild(cell);
    }
}

/* ===================================================================
   6. VŨNG TÀU LEAFLET OPENSTREETMAP
   =================================================================== */
let vungTauMap = null;
let mapMarkers = [];

function initVungTauLeafletMap() {
    const mapEl = document.getElementById('vungtau-leaflet-map');
    if (!mapEl || !window.L) return;

    // Tọa độ trung tâm Vũng Tàu
    const vungTauCenter = [10.3460, 107.0843];
    vungTauMap = L.map('vungtau-leaflet-map', {
        scrollWheelZoom: false
    }).setView(vungTauCenter, 13);

    // Bản đồ OpenStreetMap tông màu thanh lịch
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(vungTauMap);

    renderMapMarkers();

    // Click vào bản đồ để người dùng xem tọa độ hoặc thêm điểm check-in mới
    vungTauMap.on('click', (e) => {
        const { lat, lng } = e.latlng;
        L.popup()
            .setLatLng(e.latlng)
            .setContent(`
                <div style="font-family: 'Be Vietnam Pro', sans-serif; text-align: center; padding: 4px;">
                    <strong style="color: #D8BC8A;">📍 Tọa độ bạn chọn:</strong><br>
                    <small style="color: #e2e8f0;">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</small><br>
                    <button type="button" class="btn-primary" style="margin-top: 8px; font-size: 0.75rem; padding: 4px 10px;"
                        onclick="window.openAddLocationModal(${lat.toFixed(4)}, ${lng.toFixed(4)})">
                        ➕ Thêm địa điểm này
                    </button>
                </div>
            `)
            .openOn(vungTauMap);
    });
}

function renderMapMarkers() {
    if (!vungTauMap || !window.L) return;

    // Xóa markers cũ
    mapMarkers.forEach(m => vungTauMap.removeLayer(m));
    mapMarkers = [];

    const stops = MemoryStore.getAllData().vungtauStops;

    stops.forEach(stop => {
        if (!stop.lat || !stop.lng) return;

        // Custom icon mạ vàng champagne
        const customIcon = L.divIcon({
            className: 'custom-leaflet-marker',
            html: `
                <div style="
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #D8BC8A, #E8A17B);
                    border: 2px solid #fff;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #142B3B;
                    font-size: 14px;
                    cursor: pointer;
                ">📍</div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: customIcon }).addTo(vungTauMap);

        const popupHtml = `
            <div class="popup-custom-card">
                ${stop.photo ? `<img src="${stop.photo}" alt="${stop.name}" class="popup-img" />` : ''}
                <div class="popup-category">${stop.category || 'Địa điểm Vũng Tàu'}</div>
                <h4 class="popup-title">${stop.name}</h4>
                <p class="popup-desc">${stop.desc || ''}</p>
                ${stop.memo ? `<div style="font-style: italic; color: #D8BC8A; font-size: 0.75rem; margin-top: 6px;">${stop.memo}</div>` : ''}
            </div>
        `;

        marker.bindPopup(popupHtml);
        mapMarkers.push(marker);
    });
}

/* ===================================================================
   7. TRAVEL JOURNAL STOPS LIST
   =================================================================== */
function initTravelJournalStops() {
    renderTravelStops();
}

function renderTravelStops() {
    const container = document.getElementById('travel-stops-container');
    if (!container) return;

    const stops = MemoryStore.getAllData().vungtauStops;

    container.innerHTML = stops.map(stop => `
        <div class="travel-stop-card reveal-on-scroll" data-stop-id="${stop.id}">
            <div class="travel-stop-image-box">
                <img src="${stop.photo || 'img/img1.jpg'}" alt="${stop.name}" class="travel-stop-img" loading="lazy" />
                <span class="travel-stop-badge">${stop.category || 'Vũng Tàu'}</span>
                <button type="button" class="change-photo-btn" onclick="openChangePhotoModal('${stop.id}', 'travel')">
                    📷 Đổi ảnh
                </button>
            </div>
            <div class="travel-stop-info">
                <h4 class="travel-stop-title">
                    <span class="loc-icon">📍</span> ${stop.name}
                </h4>
                <p class="travel-stop-desc">${stop.desc}</p>
                <div class="travel-stop-memo">${stop.memo}</div>
            </div>
        </div>
    `).join('');

    initScrollReveal();
}

/* ===================================================================
   8. GALLERY (THƯ VIỆN ẢNH)
   =================================================================== */
let currentFilter = 'all';
let currentLightboxIndex = 0;

function initGallery() {
    renderGallery();
    initGalleryFilter();
}

function initGalleryFilter() {
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter || 'all';
            renderGallery();
        });
    });
}

function renderGallery() {
    const grid = document.getElementById('gallery-items-grid');
    const countEl = document.getElementById('gallery-count-number');
    if (!grid) return;

    const allItems = MemoryStore.getAllData().galleryItems;
    const filtered = currentFilter === 'all'
        ? allItems
        : allItems.filter(item => item.albumId === currentFilter);

    if (countEl) countEl.textContent = `${filtered.length} khoảnh khắc`;

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                <p>Chưa có khoảnh khắc nào trong nhóm này.</p>
                <button type="button" class="btn-primary" style="margin-top: 14px;" onclick="openAddPhotoModal()">
                    ➕ Tải thêm ảnh của chúng mình
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map((item, idx) => `
        <div class="gallery-item-card style-${item.style || 'polaroid'} reveal-on-scroll" data-id="${item.id}">
            <div class="gallery-img-container" onclick="openLightbox(${idx})">
                <img src="${item.photo}" alt="${item.title}" class="gallery-img" loading="lazy" />
                <div class="gallery-img-overlay">
                    <button type="button" class="gallery-overlay-btn" title="Phóng to">🔍</button>
                </div>
            </div>
            <div class="gallery-card-body">
                <div class="gallery-card-meta">
                    <span class="gallery-category-pill">${item.albumName || 'Kỷ niệm'}</span>
                    <span>${item.date}</span>
                </div>
                <h4 class="gallery-card-title">${item.title}</h4>
                <p class="gallery-card-caption">${item.caption}</p>
                <div class="gallery-card-bottom">
                    <button type="button" class="card-action-icon-btn" onclick="openChangePhotoModal('${item.id}', 'gallery')" title="Thay ảnh">
                        📷 Đổi ảnh
                    </button>
                    <button type="button" class="card-action-icon-btn" onclick="deleteGalleryItem('${item.id}')" title="Xóa bức ảnh">
                        🗑️ Xóa
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    initScrollReveal();
}

function deleteGalleryItem(id) {
    if (!confirm('Bạn có chắc muốn xóa bức ảnh này khỏi thư viện?')) return;
    let items = MemoryStore.getAllData().galleryItems;
    items = items.filter(i => i.id !== id);
    MemoryStore.set(STORAGE_KEYS.GALLERY_ITEMS, items);
    renderGallery();
}

/* Lightbox Logic */
function openLightbox(index) {
    const allItems = MemoryStore.getAllData().galleryItems;
    const filtered = currentFilter === 'all'
        ? allItems
        : allItems.filter(item => item.albumId === currentFilter);

    if (!filtered[index]) return;
    currentLightboxIndex = index;

    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const title = document.getElementById('lightbox-title');
    const desc = document.getElementById('lightbox-desc');

    const item = filtered[index];
    img.src = item.photo;
    title.textContent = item.title;
    desc.textContent = `${item.date || ''} ${item.location ? '• ' + item.location : ''} • ${item.caption || ''}`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function nextLightbox() {
    const allItems = MemoryStore.getAllData().galleryItems;
    const filtered = currentFilter === 'all' ? allItems : allItems.filter(i => i.albumId === currentFilter);
    currentLightboxIndex = (currentLightboxIndex + 1) % filtered.length;
    openLightbox(currentLightboxIndex);
}

function prevLightbox() {
    const allItems = MemoryStore.getAllData().galleryItems;
    const filtered = currentFilter === 'all' ? allItems : allItems.filter(i => i.albumId === currentFilter);
    currentLightboxIndex = (currentLightboxIndex - 1 + filtered.length) % filtered.length;
    openLightbox(currentLightboxIndex);
}

/* ===================================================================
   9. NHỮNG ĐIỀU NHỎ BÉ TÔI MUỐN LƯU GIỮ
   =================================================================== */
function initLittleThings() {
    renderLittleThings();
}

function renderLittleThings() {
    const container = document.getElementById('little-things-grid');
    if (!container) return;

    const list = MemoryStore.getAllData().littleThings;

    container.innerHTML = list.map(item => `
        <div class="sticky-note-card reveal-on-scroll" data-id="${item.id}">
            <div class="sticky-note-tape"></div>
            <div class="sticky-note-icon">${item.icon || '🌿'}</div>
            <p class="sticky-note-text">${item.text}</p>
            <div class="sticky-note-footer">
                <span>${item.date || 'Kỷ niệm nhỏ'}</span>
                <div>
                    <button type="button" class="card-action-icon-btn" onclick="openEditLittleThingModal('${item.id}')">✏️</button>
                    <button type="button" class="card-action-icon-btn" onclick="deleteLittleThing('${item.id}')">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');

    initScrollReveal();
}

function deleteLittleThing(id) {
    if (!confirm('Bạn có muốn xóa mẩu ghi chú nhỏ này?')) return;
    let list = MemoryStore.getAllData().littleThings;
    list = list.filter(i => i.id !== id);
    MemoryStore.set(STORAGE_KEYS.LITTLE_THINGS, list);
    renderLittleThings();
}

/* ===================================================================
   10. NHỮNG ĐIỀU TÔI MUỐN NÓI VỚI EM – MỘT BỨC THƯ
   =================================================================== */
function initLetterReveal() {
    const letterSection = document.getElementById('letter');
    const paragraphs = document.querySelectorAll('.letter-content p');
    if (!letterSection || paragraphs.length === 0) return;

    let hasRevealed = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasRevealed) {
                hasRevealed = true;
                paragraphs.forEach((p, idx) => {
                    setTimeout(() => p.classList.add('revealed'), idx * 450);
                });
            }
        });
    }, { threshold: 0.2 });

    observer.observe(letterSection);
}

window.revealEntireLetter = function () {
    const paragraphs = document.querySelectorAll('.letter-content p');
    paragraphs.forEach(p => p.classList.add('revealed'));
};

/* ===================================================================
   11. DÒNG THỜI GIAN KỶ NIỆM (TIMELINE)
   =================================================================== */
function initTimeline() {
    renderTimeline();
}

function renderTimeline() {
    const container = document.getElementById('timeline-items-list');
    if (!container) return;

    const list = MemoryStore.getAllData().timelineItems;

    container.innerHTML = list.map(item => `
        <div class="timeline-item reveal-on-scroll" data-timeline-id="${item.id}">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
                <div>
                    <span class="timeline-date-chip">📅 ${item.date}</span>
                    ${item.status === 'pending' ? '<span class="timeline-status-badge">Nội dung cần bổ sung</span>' : ''}
                </div>
                <h4 class="timeline-title">${item.title}</h4>
                <p class="timeline-desc">${item.desc}</p>
                ${item.photo ? `
                    <div class="timeline-img-box">
                        <img src="${item.photo}" alt="${item.title}" class="timeline-img" loading="lazy" />
                    </div>
                ` : ''}
                <div class="timeline-card-actions">
                    <button type="button" class="card-action-icon-btn" onclick="openEditTimelineModal('${item.id}')">
                        ✏️ Sửa
                    </button>
                    <button type="button" class="card-action-icon-btn" onclick="deleteTimelineItem('${item.id}')">
                        🗑️ Xóa
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    initScrollReveal();
}

function deleteTimelineItem(id) {
    if (!confirm('Bạn có chắc muốn xóa cột mốc này?')) return;
    let list = MemoryStore.getAllData().timelineItems;
    list = list.filter(i => i.id !== id);
    MemoryStore.set(STORAGE_KEYS.TIMELINE_ITEMS, list);
    renderTimeline();
}

/* ===================================================================
   12. MODALS & SUBMISSIONS
   =================================================================== */
let currentChangePhotoTarget = { id: null, type: null };

function initModals() {
    // Lightbox modal keyboard
    const lightboxModal = document.getElementById('lightbox-modal');
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal || e.target.classList.contains('lightbox-close-btn')) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextLightbox();
        if (e.key === 'ArrowLeft') prevLightbox();
    });

    // Close any modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close-btn') || e.target.classList.contains('btn-modal-cancel')) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Add Photo Form
    const addPhotoForm = document.getElementById('add-photo-form');
    if (addPhotoForm) {
        addPhotoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('photo-input-file');
            if (!fileInput.files || fileInput.files.length === 0) {
                alert('Vui lòng chọn một bức ảnh kỷ niệm!');
                return;
            }

            const albumSelect = document.getElementById('photo-input-category');
            const albumId = albumSelect.value;
            const albumName = albumSelect.options[albumSelect.selectedIndex].text;
            const title = document.getElementById('photo-input-title').value.trim();
            const date = document.getElementById('photo-input-date').value.trim() || 'Kỷ niệm đẹp';
            const caption = document.getElementById('photo-input-caption').value.trim();
            const style = document.getElementById('photo-input-style')?.value || 'polaroid';

            try {
                const base64 = await MemoryStore.compressImage(fileInput.files[0], 1200, 0.82);
                const newItem = {
                    id: 'gal-' + Date.now(),
                    albumId,
                    albumName,
                    title,
                    date,
                    location: 'Vũng Tàu',
                    photo: base64,
                    caption,
                    style
                };

                const items = MemoryStore.getAllData().galleryItems;
                items.unshift(newItem);
                MemoryStore.set(STORAGE_KEYS.GALLERY_ITEMS, items);
                renderGallery();

                document.getElementById('modal-add-photo').classList.remove('active');
                document.body.style.overflow = '';
                addPhotoForm.reset();
                document.getElementById('photo-preview-box').style.display = 'none';
            } catch (err) {
                alert('Xử lý ảnh gặp lỗi: ' + err.message);
            }
        });
    }

    // Change Photo Form
    const changePhotoForm = document.getElementById('change-photo-form');
    if (changePhotoForm) {
        changePhotoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('change-photo-input-file');
            if (!fileInput.files || fileInput.files.length === 0) {
                alert('Vui lòng chọn ảnh mới!');
                return;
            }

            try {
                const base64 = await MemoryStore.compressImage(fileInput.files[0], 1200, 0.82);
                if (currentChangePhotoTarget.type === 'travel') {
                    const stops = MemoryStore.getAllData().vungtauStops;
                    const stop = stops.find(s => s.id === currentChangePhotoTarget.id);
                    if (stop) {
                        stop.photo = base64;
                        MemoryStore.set(STORAGE_KEYS.VUNGTAU_STOPS, stops);
                        renderTravelStops();
                        renderMapMarkers();
                    }
                } else if (currentChangePhotoTarget.type === 'gallery') {
                    const items = MemoryStore.getAllData().galleryItems;
                    const item = items.find(i => i.id === currentChangePhotoTarget.id);
                    if (item) {
                        item.photo = base64;
                        MemoryStore.set(STORAGE_KEYS.GALLERY_ITEMS, items);
                        renderGallery();
                    }
                } else if (currentChangePhotoTarget.type === 'meeting') {
                    const meeting = MemoryStore.getAllData().meetingData;
                    meeting.photo = base64;
                    MemoryStore.set(STORAGE_KEYS.MEETING_DATA, meeting);
                    const imgEl = document.getElementById('meeting-display-photo');
                    if (imgEl) imgEl.src = base64;
                }

                document.getElementById('modal-change-photo').classList.remove('active');
                document.body.style.overflow = '';
                changePhotoForm.reset();
            } catch (err) {
                alert('Lỗi nén ảnh: ' + err.message);
            }
        });
    }

    // Timeline Form
    const timelineForm = document.getElementById('timeline-form');
    if (timelineForm) {
        timelineForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('timeline-input-id').value;
            const date = document.getElementById('timeline-input-date').value.trim();
            const title = document.getElementById('timeline-input-title').value.trim();
            const desc = document.getElementById('timeline-input-desc').value.trim();
            const status = document.getElementById('timeline-input-status').value;
            const fileInput = document.getElementById('timeline-input-file');

            let photoBase64 = null;
            if (fileInput.files && fileInput.files[0]) {
                photoBase64 = await MemoryStore.compressImage(fileInput.files[0], 1000, 0.8);
            }

            const list = MemoryStore.getAllData().timelineItems;
            if (id) {
                const item = list.find(t => t.id === id);
                if (item) {
                    item.date = date;
                    item.title = title;
                    item.desc = desc;
                    item.status = status;
                    if (photoBase64) item.photo = photoBase64;
                }
            } else {
                list.push({
                    id: 'tl-' + Date.now(),
                    date,
                    title,
                    desc,
                    photo: photoBase64 || 'img/img1.jpg',
                    status
                });
            }

            MemoryStore.set(STORAGE_KEYS.TIMELINE_ITEMS, list);
            renderTimeline();
            document.getElementById('modal-timeline').classList.remove('active');
            document.body.style.overflow = '';
            timelineForm.reset();
        });
    }

    // Little Thing Form
    const littleThingForm = document.getElementById('little-thing-form');
    if (littleThingForm) {
        littleThingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('lt-input-id').value;
            const text = document.getElementById('lt-input-text').value.trim();
            const date = document.getElementById('lt-input-date').value.trim() || 'Kỷ niệm nhỏ';
            const icon = document.getElementById('lt-input-icon').value || '🌿';

            const list = MemoryStore.getAllData().littleThings;
            if (id) {
                const item = list.find(i => i.id === id);
                if (item) {
                    item.text = text;
                    item.date = date;
                    item.icon = icon;
                }
            } else {
                list.push({
                    id: 'lt-' + Date.now(),
                    text,
                    date,
                    icon
                });
            }

            MemoryStore.set(STORAGE_KEYS.LITTLE_THINGS, list);
            renderLittleThings();
            document.getElementById('modal-little-thing').classList.remove('active');
            document.body.style.overflow = '';
            littleThingForm.reset();
        });
    }

    // File Preview Setup
    setupFilePreview('photo-input-file', 'photo-preview-box', 'photo-preview-img');
    setupFilePreview('change-photo-input-file', 'change-photo-preview-box', 'change-photo-preview-img');
}

function setupFilePreview(inputId, boxId, imgId) {
    const input = document.getElementById(inputId);
    const box = document.getElementById(boxId);
    const img = document.getElementById(imgId);
    if (!input || !box || !img) return;

    input.addEventListener('change', () => {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
                box.style.display = 'block';
            };
            reader.readAsDataURL(input.files[0]);
        }
    });
}

// Global Triggers
window.openAddPhotoModal = function () {
    const modal = document.getElementById('modal-add-photo');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.openChangePhotoModal = function (id, type) {
    currentChangePhotoTarget = { id, type };
    const modal = document.getElementById('modal-change-photo');
    if (!modal) return;
    document.getElementById('change-photo-form').reset();
    document.getElementById('change-photo-preview-box').style.display = 'none';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.openAddTimelineModal = function () {
    const modal = document.getElementById('modal-timeline');
    const form = document.getElementById('timeline-form');
    if (!modal || !form) return;
    form.reset();
    document.getElementById('timeline-input-id').value = '';
    document.getElementById('modal-timeline-title').textContent = 'Thêm cột mốc kỷ niệm mới';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.openEditTimelineModal = function (id) {
    const modal = document.getElementById('modal-timeline');
    const item = MemoryStore.getAllData().timelineItems.find(t => t.id === id);
    if (!modal || !item) return;

    document.getElementById('timeline-input-id').value = item.id;
    document.getElementById('timeline-input-date').value = item.date;
    document.getElementById('timeline-input-title').value = item.title;
    document.getElementById('timeline-input-desc').value = item.desc;
    document.getElementById('timeline-input-status').value = item.status || 'completed';
    document.getElementById('modal-timeline-title').textContent = 'Chỉnh sửa cột mốc kỷ niệm';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.openAddLittleThingModal = function () {
    const modal = document.getElementById('modal-little-thing');
    const form = document.getElementById('little-thing-form');
    if (!modal || !form) return;
    form.reset();
    document.getElementById('lt-input-id').value = '';
    document.getElementById('modal-lt-title').textContent = 'Thêm ghi chú nhỏ';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.openEditLittleThingModal = function (id) {
    const modal = document.getElementById('modal-little-thing');
    const item = MemoryStore.getAllData().littleThings.find(i => i.id === id);
    if (!modal || !item) return;

    document.getElementById('lt-input-id').value = item.id;
    document.getElementById('lt-input-text').value = item.text;
    document.getElementById('lt-input-date').value = item.date;
    document.getElementById('lt-input-icon').value = item.icon || '🌿';
    document.getElementById('modal-lt-title').textContent = 'Chỉnh sửa ghi chú nhỏ';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Mở trang Admin quản trị
window.openAdminPortal = function () {
    window.location.href = 'admin.html';
};

/* ===================================================================
   13. CLICK SPARKLE / HEART EFFECT
   =================================================================== */
function initClickSparkleEffect() {
    const icons = ['✨', '❤️', '🌊', '🌸'];

    document.addEventListener('click', (e) => {
        if (e.target.closest('input, textarea, select, button, .modal-window, #vungtau-leaflet-map')) return;

        const el = document.createElement('span');
        el.className = 'floating-heart';
        el.style.left = e.clientX + 'px';
        el.style.top = e.clientY + 'px';
        el.textContent = icons[Math.floor(Math.random() * icons.length)];
        document.body.appendChild(el);

        setTimeout(() => el.remove(), 1200);
    });
}

function createHeartBurst(x, y) {
    for (let i = 0; i < 7; i++) {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.style.left = x + (Math.random() - 0.5) * 35 + 'px';
        heart.style.top = y + (Math.random() - 0.5) * 35 + 'px';
        heart.textContent = '❤️';
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1200);
    }
}

/* ===================================================================
   14. NAVBAR & SCROLL REVEAL
   =================================================================== */
function initNavbarScroll() {
    const navbar = document.getElementById('site-navbar');
    const toggleBtn = document.getElementById('nav-toggle-btn');
    const navLinks = document.getElementById('nav-links');
    if (!navbar) return;

    let ticking = false;
    let isScrolled = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const shouldBeScrolled = window.scrollY > 30;
                if (shouldBeScrolled !== isScrolled) {
                    isScrolled = shouldBeScrolled;
                    navbar.classList.toggle('scrolled', isScrolled);
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    if (toggleBtn && navLinks) {
        toggleBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
        navLinks.querySelectorAll('a').forEach(l => {
            l.addEventListener('click', () => navLinks.classList.remove('open'));
        });
    }
}

function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal-on-scroll:not(.revealed)');
    if (!('IntersectionObserver' in window)) {
        elements.forEach(el => el.classList.add('revealed'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.classList.add('revealed');
                observer.unobserve(el);
                // Giải phóng will-change sau khi chuyển động hoàn tất để tối ưu GPU
                setTimeout(() => {
                    el.style.willChange = 'auto';
                }, 550);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    elements.forEach(el => observer.observe(el));
}

// Lightbox xem ảnh 2 ngón tay kỷ niệm
window.openPhotoZoom = function(src, caption) {
    const modal = document.getElementById('photo-zoom-modal');
    const img = document.getElementById('zoom-modal-img');
    const cap = document.getElementById('zoom-modal-caption');
    if (modal && img) {
        img.src = src;
        if (cap) cap.textContent = caption || '';
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

window.closePhotoZoom = function() {
    const modal = document.getElementById('photo-zoom-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closePhotoZoom();
    }
});
