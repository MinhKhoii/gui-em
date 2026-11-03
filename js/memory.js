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
        initSunsetCanvas(canvas, 35);
    }

    if (!gate || !openBtn) return;

    openBtn.addEventListener('click', () => {
        // Hiệu ứng mở phong bì & chuyển cảnh mượt mà
        openBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            gate.classList.add('hidden');
            document.body.style.overflow = '';
            
            // Nếu người dùng bật âm thanh khi mở quà
            const audio = document.getElementById('bg-music-player');
            const audioWidget = document.getElementById('floating-audio-widget');
            if (audio && audioWidget && !audioWidget.classList.contains('playing')) {
                // Nhắc người dùng hoặc tự động phát nhẹ nhàng nếu được phép
                audio.play().then(() => {
                    audioWidget.classList.add('playing');
                }).catch(() => {
                    // Trình duyệt chặn autoplay thì để người dùng bấm nút widget
                });
            }
        }, 500);
    });
}

function initSunsetCanvas(canvas, count = 40) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height * 0.85,
                radius: Math.random() * 2 + 0.8,
                speedY: Math.random() * 0.35 + 0.15,
                speedX: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.7 + 0.2,
                fadeSpeed: Math.random() * 0.01 + 0.005,
                rising: true,
                color: Math.random() > 0.4 ? '216, 188, 138' : '232, 161, 123'
            });
        }
    }

    function render() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.y -= p.speedY;
            p.x += p.speedX;

            if (p.rising) {
                p.opacity += p.fadeSpeed;
                if (p.opacity >= 0.85) p.rising = false;
            } else {
                p.opacity -= p.fadeSpeed;
                if (p.opacity <= 0.15) p.rising = true;
            }

            if (p.y < 0) {
                p.y = height * 0.85;
                p.x = Math.random() * width;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = `rgba(${p.color}, 0.5)`;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        requestAnimationFrame(render);
    }

    window.addEventListener('resize', resize);
    resize();
    render();
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
    if (canvas) initSunsetCanvas(canvas, 40);
}

/* ===================================================================
   4. FOOTER NIGHT SEA CANVAS
   =================================================================== */
function initFooterNightCanvas() {
    const canvas = document.getElementById('night-stars-canvas') || document.getElementById('footer-stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    let shootingStars = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = canvas.parentElement.offsetHeight || 600;
        stars = [];
        const count = Math.floor((width * height) / 4500);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height * 0.75,
                radius: Math.random() * 1.5 + 0.5,
                alpha: Math.random(),
                pulse: Math.random() * 0.02 + 0.005
            });
        }
    }

    function addShootingStar() {
        if (Math.random() < 0.025 && shootingStars.length < 2) {
            shootingStars.push({
                x: Math.random() * width * 0.8,
                y: Math.random() * (height * 0.35),
                length: Math.random() * 90 + 50,
                speed: Math.random() * 7 + 5,
                angle: Math.PI / 4,
                opacity: 1
            });
        }
    }

    window.spawnShootingStars = function(num = 4) {
        for (let i = 0; i < num; i++) {
            setTimeout(() => {
                shootingStars.push({
                    x: Math.random() * width * 0.85,
                    y: Math.random() * (height * 0.35),
                    length: Math.random() * 120 + 70,
                    speed: Math.random() * 8 + 6,
                    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
                    opacity: 1
                });
            }, i * 200);
        }
    };

    function render() {
        ctx.clearRect(0, 0, width, height);

        stars.forEach(s => {
            s.alpha += s.pulse;
            if (s.alpha > 1 || s.alpha < 0.2) s.pulse = -s.pulse;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(248, 243, 233, ${s.alpha})`;
            ctx.fill();
        });

        addShootingStar();
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            const endX = ss.x + Math.cos(ss.angle) * ss.length;
            const endY = ss.y + Math.sin(ss.angle) * ss.length;

            const grad = ctx.createLinearGradient(ss.x, ss.y, endX, endY);
            grad.addColorStop(0, `rgba(216, 188, 138, ${ss.opacity})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.6;
            ctx.stroke();

            ss.x += Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.opacity -= 0.02;

            if (ss.opacity <= 0) shootingStars.splice(i, 1);
        }

        requestAnimationFrame(render);
    }

    window.addEventListener('resize', resize);
    resize();
    render();
}

window.triggerStarWish = function() {
    const btn = document.getElementById('star-wish-btn');
    if (btn) {
        btn.innerHTML = '✨ Ngôi sao của em đã tỏa sáng!';
        btn.style.background = 'linear-gradient(135deg, var(--champagne-gold), var(--sunset-peach))';
        btn.style.color = 'var(--deep-sea)';
        btn.style.borderColor = 'transparent';
    }
    if (window.spawnShootingStars) {
        window.spawnShootingStars(6);
    }
};

function initReplayAction() {
    const replayBtn = document.getElementById('replay-btn');
    const gate = document.getElementById('opening-gate');
    if (replayBtn && gate) {
        replayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            gate.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (toggleBtn && navLinks) {
        toggleBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
        navLinks.querySelectorAll('a').forEach(l => {
            l.addEventListener('click', () => navLinks.classList.remove('open'));
        });
    }
}

function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal-on-scroll:not(.revealed)');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

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
