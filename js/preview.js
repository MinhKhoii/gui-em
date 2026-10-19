(function () {
            'use strict';

            const STORAGE_KEY = 'starlight_wishes_collection';

            const STORAGE_VERSION_KEY = 'starlight_memories_v7_user_custom';

            /* ---------- 1. DANH SÁCH LỜI CHÚC ẤM ÁP TRONG LỌ  ---------- */
            const WISHES = [
                "Mong em mỗi sáng thức dậy đều thấy lòng bình yên, mỗi tối đi ngủ đều mỉm cười thanh thản ✨",
                "Dù thế giới ngoài kia có bộn bề thế nào, em vẫn luôn là điều dịu dàng và đặc biệt nhất 🌸",
                "Chúc em luôn tự tin bước đi trên con đường mình chọn, phía trước luôn có những điều đẹp đẽ đón chờ 💖",
                "Mong em ăn cơm đúng giờ, uống đủ nước, đừng thức khuya và luôn giữ gìn sức khỏe nhé 🍀",
                "Mong mỗi ngày trôi qua với em đều ngập tràn niềm vui, sự ấm áp và bình yên 💐",
                "Nếu có phút giây nào mệt mỏi, hãy nhớ rằng luôn có người âm thầm dõi theo và mong em hạnh phúc 💫",
                "Em không cần phải hoàn hảo như ai khác, em rực rỡ nhất khi là chính em ✨",
                "Chúc nụ cười tươi tắn luôn nở trên môi em, xua tan mọi âu lo muộn phiền 😊"
            ];
            let currentWishIdx = 0;

            /* ---------- 2. QUẢN LÝ LƯU TRỮ CHO SỔ SAO (XÓA BỎ CÁC KỶ NIỆM MẪU, GIỮ ĐIỀU ƯỚC CỦA EM) ---------- */
            function getSavedWishes() {
                try {
                    const isInitialized = localStorage.getItem(STORAGE_VERSION_KEY);
                    const rawData = localStorage.getItem(STORAGE_KEY);
                    let list = [];

                    if (rawData) {
                        try {
                            list = JSON.parse(rawData) || [];
                        } catch (e) {
                            list = [];
                        }
                    }

                    // Tẩy sạch toàn bộ các kỷ niệm mẫu cũ (mem_1..mem_5) khỏi Sổ Sao
                    const originalLength = list.length;
                    list = list.filter(item => {
                        if (!item || !item.id) return false;
                        const idStr = String(item.id);
                        if (idStr.startsWith('mem_') || idStr === '1') return false;
                        return true;
                    });

                    // Nếu có kỷ niệm mẫu bị xóa hoặc chưa chuyển sang version 7 thì cập nhật lại storage
                    if (isInitialized !== 'true' || list.length !== originalLength) {
                        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
                        localStorage.setItem(STORAGE_VERSION_KEY, 'true');
                    }

                    return list;
                } catch (e) {
                    return [];
                }
            }

            function saveWishes(list) {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
                    updateJournalCounter();
                } catch (e) {
                    console.warn("Storage quota or error:", e);
                }
            }

            function addWishToStorage(text, photoBase64 = '') {
                const list = getSavedWishes();
                const now = new Date();
                const timeStr = `${now.getDate()}/${now.getMonth() + 1} lúc ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                const timestamp = Date.now();
                
                const newWish = {
                    id: 'local_' + timestamp,
                    text: text,
                    date: timeStr,
                    photo: photoBase64 || '',
                    timestamp: timestamp
                };
                list.unshift(newWish);
                saveWishes(list);
                renderJournalList();
                updateJournalCounter();
                return newWish;
            }

            function deleteWishFromStorage(id) {
                let list = getSavedWishes();
                list = list.filter(item => item.id !== id);
                saveWishes(list);
                renderJournalList();
                updateJournalCounter();
            }

            function updateJournalCounter() {
                const list = getSavedWishes();
                const countBadge = document.getElementById('nav-star-count');
                if (countBadge) countBadge.textContent = list.length;
            }

            /* ---------- 3. XỬ LÝ ĐÍNH KÈM ẢNH & NÉN SIÊU NHẸ (CHO PHÉP TẢI ẢNH LÊN) ---------- */
            let currentAttachedPhotoBase64 = '';

            const wishPhotoInput = document.getElementById('wish-photo-input');
            const photoPreviewChip = document.getElementById('photo-preview-chip');
            const photoPreviewImg = document.getElementById('photo-preview-img');
            const photoChipName = document.getElementById('photo-chip-name');
            const photoRemoveBtn = document.getElementById('photo-remove-btn');
            const photoAttachLabel = document.getElementById('photo-attach-label');

            function compressImage(file, maxDimension = 600, quality = 0.82) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const img = new Image();
                        img.onload = function () {
                            let w = img.width;
                            let h = img.height;
                            if (w > maxDimension || h > maxDimension) {
                                if (w > h) {
                                    h = Math.round((h * maxDimension) / w);
                                    w = maxDimension;
                                } else {
                                    w = Math.round((w * maxDimension) / h);
                                    h = maxDimension;
                                }
                            }
                            const canvas = document.createElement('canvas');
                            canvas.width = w;
                            canvas.height = h;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, w, h);
                            resolve(canvas.toDataURL('image/jpeg', quality));
                        };
                        img.onerror = reject;
                        img.src = e.target.result;
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            if (wishPhotoInput) {
                wishPhotoInput.addEventListener('change', async function () {
                    const file = this.files && this.files[0];
                    if (!file) return;

                    showToast("⏳ Đang xử lý ảnh kỷ niệm...");
                    try {
                        const compressed = await compressImage(file, 600, 0.82);
                        currentAttachedPhotoBase64 = compressed;
                        if (photoPreviewImg) photoPreviewImg.src = compressed;
                        if (photoChipName) photoChipName.textContent = file.name || "Ảnh kỷ niệm";
                        if (photoPreviewChip) photoPreviewChip.style.display = 'inline-flex';
                        if (photoAttachLabel) photoAttachLabel.textContent = "Đổi ảnh khác";
                        showToast("📷 Đã đính kèm ảnh thành công!");
                    } catch (err) {
                        showToast("⚠️ Không thể tải ảnh này, em thử lại nhé!");
                    }
                });
            }

            function clearAttachedPhoto() {
                currentAttachedPhotoBase64 = '';
                if (wishPhotoInput) wishPhotoInput.value = '';
                if (photoPreviewChip) photoPreviewChip.style.display = 'none';
                if (photoPreviewImg) photoPreviewImg.src = '';
                if (photoAttachLabel) photoAttachLabel.textContent = "Đính kèm ảnh";
            }

            if (photoRemoveBtn) {
                photoRemoveBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    clearAttachedPhoto();
                    showToast("Đã gỡ ảnh đính kèm");
                });
            }

            /* ---------- 4. RENDER SỔ NGUYỆN ƯỚC ÁNH SAO & LIGHTBOX ---------- */
            const journalModal = document.getElementById('journal-modal');
            const openJournalNavBtn = document.getElementById('open-journal-nav-btn');
            const closeJournalBtn = document.getElementById('close-journal-btn');
            const journalClosePillBtn = document.getElementById('journal-close-pill-btn');
            const journalList = document.getElementById('journal-list');
            const lightboxModal = document.getElementById('lightbox-modal');
            const lightboxImg = document.getElementById('lightbox-img');

            function renderJournalList() {
                const list = getSavedWishes();
                journalList.innerHTML = '';

                if (list.length === 0) {
                    journalList.innerHTML = `
                        <div class="journal-empty-note">
                            <span class="journal-empty-icon">🌟</span>
                            <p>Sổ sao hiện đang trống.<br>Hãy viết một điều ước, đính kèm bức ảnh xinh xắn và thả lên dải ngân hà để lưu giữ nhé!</p>
                        </div>
                    `;
                    return;
                }

                list.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'journal-item';

                    let mediaHtml = '';
                    if (item.photo) {
                        mediaHtml = `<img class="journal-item-thumb" src="${item.photo}" alt="Ảnh kỷ niệm" title="Chạm để phóng to ảnh">`;
                    } else {
                        mediaHtml = `<div class="journal-item-badge">✨</div>`;
                    }

                    row.innerHTML = `
                        ${mediaHtml}
                        <div class="journal-item-content">
                            <p class="journal-item-text">${escapeHtml(item.text)}</p>
                            <span class="journal-item-date">⭐ ${escapeHtml(item.date)}</span>
                        </div>
                        <button type="button" class="journal-del-btn" title="Xóa điều ước này">✕</button>
                    `;

                    // Sự kiện bấm xóa
                    const delBtn = row.querySelector('.journal-del-btn');
                    delBtn.addEventListener('click', function () {
                        if (confirm("Em có chắc muốn gỡ ngôi sao này khỏi sổ không?")) {
                            deleteWishFromStorage(item.id);
                            showToast("Đã gỡ ngôi sao khỏi sổ");
                        }
                    });

                    // Sự kiện phóng to ảnh
                    if (item.photo && lightboxImg && lightboxModal) {
                        const thumb = row.querySelector('.journal-item-thumb');
                        if (thumb) {
                            thumb.addEventListener('click', function () {
                                lightboxImg.src = item.photo;
                                lightboxModal.classList.add('active');
                            });
                        }
                    }

                    journalList.appendChild(row);
                });
            }

            function escapeHtml(str) {
                if (!str) return '';
                return str.replace(/[&<>"']/g, function(m) {
                    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
                });
            }

            function openJournal() {
                renderJournalList();
                journalModal.classList.add('active');
                journalModal.setAttribute('aria-hidden', 'false');
            }

            function closeJournal() {
                journalModal.classList.remove('active');
                journalModal.setAttribute('aria-hidden', 'true');
            }

            openJournalNavBtn.addEventListener('click', openJournal);
            closeJournalBtn.addEventListener('click', closeJournal);
            if (journalClosePillBtn) {
                journalClosePillBtn.addEventListener('click', closeJournal);
            }
            journalModal.addEventListener('click', function (e) {
                if (e.target === journalModal) closeJournal();
            });

            if (lightboxModal) {
                lightboxModal.addEventListener('click', function () {
                    lightboxModal.classList.remove('active');
                });
            }

            /* ---------- 5. HIỆU ỨNG CANVAS VŨ TRỤ & PHÁO HOA CHẠM TAY ---------- */
            const canvas = document.getElementById('sky-canvas');
            const ctx = canvas.getContext('2d');
            let width = canvas.width = window.innerWidth;
            let height = canvas.height = window.innerHeight;

            const isMobile = window.innerWidth < 768;
            const starCount = isMobile ? 26 : 65;
            const stars = [];
            const particles = [];
            const shootingStars = [];

            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    r: Math.random() * 1.4 + 0.4,
                    alpha: Math.random() * 0.8 + 0.2,
                    speed: Math.random() * 0.02 + 0.005,
                    color: ['#ffffff', '#ffd1dc', '#bfe8ff', '#ffe680'][Math.floor(Math.random() * 4)]
                });
            }

            function resizeCanvas() {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            }
            window.addEventListener('resize', resizeCanvas, { passive: true });

            function createBurst(x, y, count = 16, colorTheme = null) {
                // Giới hạn số lượng hạt trên mobile để chống giật lag
                const actualCount = isMobile ? Math.min(count, 8) : count;
                const maxParticles = isMobile ? 32 : 75;
                if (particles.length > maxParticles) {
                    particles.splice(0, particles.length - maxParticles);
                }

                const colors = colorTheme || ['#ff79a9', '#ffb6dc', '#ffe680', '#42f5ee', '#b3faff', '#ffffff'];
                for (let i = 0; i < actualCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * (isMobile ? 2.5 : 3.5) + 0.8;
                    particles.push({
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        size: Math.random() * 2.5 + 1,
                        alpha: 1,
                        decay: Math.random() * 0.03 + 0.02,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        gravity: 0.04
                    });
                }
            }

            function launchShootingStar(customText = '') {
                shootingStars.push({
                    x: Math.random() * (width * 0.4) + width * 0.1,
                    y: height * 0.85,
                    targetX: Math.random() * (width * 0.6) + width * 0.3,
                    targetY: height * 0.15,
                    progress: 0,
                    speed: 0.025,
                    text: customText,
                    tail: []
                });
            }

            // KHÓA NHỊP 60FPS CHUẨN: CHỐNG GIẬT LAG TRÊN MÀN HÌNH 90HZ / 120HZ / 144HZ
            let lastFrameTime = performance.now();
            const targetFPS = 60;
            const frameDuration = 1000 / targetFPS; // 16.66ms

            function animateLoop(currentTime) {
                requestAnimationFrame(animateLoop);

                if (!currentTime) currentTime = performance.now();
                const elapsed = currentTime - lastFrameTime;

                // Nếu màn hình 120Hz/90Hz, bỏ qua frame dư để giữ đúng 60fps mượt như nhung, không nóng máy
                if (elapsed < frameDuration) return;
                lastFrameTime = currentTime - (elapsed % frameDuration);

                // Dừng vẽ khi ẩn tab để tiết kiệm tối đa pin
                if (document.hidden) return;

                ctx.clearRect(0, 0, width, height);

                // Vẽ sao lấp lánh
                for (let i = 0; i < stars.length; i++) {
                    const s = stars[i];
                    s.alpha += s.speed;
                    if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;
                    ctx.fillStyle = s.color;
                    ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Vẽ sao băng ước nguyện
                const maxTail = isMobile ? 8 : 14;
                for (let i = shootingStars.length - 1; i >= 0; i--) {
                    const ss = shootingStars[i];
                    ss.progress += ss.speed;
                    const curX = ss.x + (ss.targetX - ss.x) * ss.progress;
                    const curY = ss.y + (ss.targetY - ss.y) * ss.progress;

                    ss.tail.push({ x: curX, y: curY, alpha: 1 });
                    if (ss.tail.length > maxTail) ss.tail.shift();

                    for (let j = 0; j < ss.tail.length; j++) {
                        const t = ss.tail[j];
                        t.alpha -= 0.07;
                        ctx.strokeStyle = `rgba(255, 230, 140, ${Math.max(0, t.alpha)})`;
                        ctx.lineWidth = j * 0.35 + 1;
                        ctx.beginPath();
                        ctx.arc(t.x, t.y, j * 0.25 + 1, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 180, 220, ${Math.max(0, t.alpha)})`;
                        ctx.fill();
                    }

                    // Tối ưu: Dùng vòng hào quang 2 lớp thay vì ctx.shadowBlur (tránh giật GPU trên 120Hz)
                    ctx.globalAlpha = 0.45;
                    ctx.fillStyle = '#ffe680';
                    ctx.beginPath();
                    ctx.arc(curX, curY, 7.5, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.globalAlpha = 1;
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);
                    ctx.fill();

                    if (ss.progress >= 1) {
                        createBurst(ss.targetX, ss.targetY, isMobile ? 16 : 28, ['#ffe680', '#ff9ebb', '#42f5ee', '#ffffff']);
                        shootingStars.splice(i, 1);
                    }
                }

                // Vẽ pháo hoa / bụi sao
                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += p.gravity;
                    p.alpha -= p.decay;

                    if (p.alpha <= 0) {
                        particles.splice(i, 1);
                        continue;
                    }

                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.alpha;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
            }
            requestAnimationFrame(animateLoop);

            // BẮT CHẠM THÔNG MINH: CHỈ NỔ PHÁO HOA KHI CHẠM NHẸ (TAP), KHÔNG NỔ KHI VUỐT CUỘN TRANG
            let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
            document.addEventListener('pointerdown', function (e) {
                touchStartX = e.clientX;
                touchStartY = e.clientY;
                touchStartTime = Date.now();
            }, { passive: true });

            document.addEventListener('pointerup', function (e) {
                if (e.target.closest('button, input, a, .flip-card, .journal-sheet, .wish-card, .journal-item, .music-sheet')) return;
                const dist = Math.hypot(e.clientX - touchStartX, e.clientY - touchStartY);
                const dur = Date.now() - touchStartTime;
                // Nếu khoảng cách di chuyển nhỏ hơn 12px và chạm dưới 320ms -> là 1 cú chạm nhẹ (tap)
                if (dist < 12 && dur < 320) {
                    createBurst(e.clientX, e.clientY, isMobile ? 8 : 14);
                }
            }, { passive: true });

            /* ---------- 6. MỞ HỘP ĐIỀU ƯỚC TRONG LỌ & LƯU VÀO SỔ ---------- */
            const magicJar = document.getElementById('magic-jar');
            const openWishBtn = document.getElementById('open-wish-btn');
            const wishModal = document.getElementById('wish-modal');
            const closeModalBtn = document.getElementById('close-modal-btn');
            const wishQuoteText = document.getElementById('wish-quote-text');
            const anotherWishBtn = document.getElementById('another-wish-btn');
            const saveCurrentWishBtn = document.getElementById('save-current-wish-btn');

            function showNextWish(e) {
                if (e) {
                    const rect = (e.currentTarget || e.target).getBoundingClientRect();
                    createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 22, ['#ffe680', '#ff84b7', '#b3f0ff']);
                }
                currentWishIdx = (currentWishIdx + 1) % WISHES.length;
                wishQuoteText.textContent = `"${WISHES[currentWishIdx]}"`;
                wishModal.classList.add('active');
                wishModal.setAttribute('aria-hidden', 'false');
            }

            function hideWishModal() {
                wishModal.classList.remove('active');
                wishModal.setAttribute('aria-hidden', 'true');
            }

            magicJar.addEventListener('click', showNextWish);
            openWishBtn.addEventListener('click', showNextWish);
            anotherWishBtn.addEventListener('click', function (e) {
                showNextWish(e);
            });
            closeModalBtn.addEventListener('click', hideWishModal);
            wishModal.addEventListener('click', function (e) {
                if (e.target === wishModal) hideWishModal();
            });

            saveCurrentWishBtn.addEventListener('click', function () {
                const currentText = WISHES[currentWishIdx];
                addWishToStorage(currentText, '');
                showToast("⭐ Đã lưu lời nhắn này vào Sổ Sao của em!");
                createBurst(window.innerWidth / 2, window.innerHeight / 2, 25, ['#ffe680', '#ff9ebb', '#ffffff']);
            });

            /* ---------- 7. GỬI ĐIỀU ƯỚC TỰ NHẬP + ĐÍNH KÈM ẢNH ---------- */
            const wishForm = document.getElementById('wish-form');
            const userWishInput = document.getElementById('user-wish-input');
            const toastMsg = document.getElementById('toast-msg');

            function showToast(text) {
                toastMsg.textContent = text;
                toastMsg.classList.add('show');
                setTimeout(() => {
                    toastMsg.classList.remove('show');
                }, 3200);
            }

            wishForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const text = userWishInput.value.trim();
                if (!text && !currentAttachedPhotoBase64) {
                    showToast("🌸 Em hãy nhập một điều ước hoặc đính kèm ảnh trước nhé!");
                    userWishInput.focus();
                    return;
                }

                const wishContent = text || "Một khoảnh khắc dịu dàng được gửi lên dải ngân hà ✨";
                const hasPhoto = !!currentAttachedPhotoBase64;

                // Lưu vào LocalStorage kèm ảnh (nếu có)
                addWishToStorage(wishContent, currentAttachedPhotoBase64);

                // Hiệu ứng phóng sao băng
                launchShootingStar(wishContent);

                // Reset form
                userWishInput.value = '';
                clearAttachedPhoto();
                userWishInput.blur();

                showToast(hasPhoto ? "✨ Điều ước & ảnh kỷ niệm đã bay lên dải ngân hà và lưu vào Sổ Sao!" : "✨ Điều ước của em đã bay lên dải ngân hà và lưu vào Sổ Sao!");

                // Bung pháo hoa chúc mừng
                const rect = wishForm.getBoundingClientRect();
                createBurst(rect.left + rect.width / 2, rect.top, 30, ['#ffe680', '#ff659c', '#42f5ee', '#ffffff']);
            });

            /* ---------- 8. LẬT 3 TẤM THẺ ĐẶC QUYỀN ---------- */
            document.querySelectorAll('.flip-card').forEach(card => {
                card.addEventListener('click', function () {
                    this.classList.toggle('flipped');
                    const rect = this.getBoundingClientRect();
                    createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10, ['#ffd1dc', '#ffe680', '#ffffff']);
                });
            });

            /* ---------- 9. QUẢN LÝ ÂM NHẠC & INDEXEDDB LƯU NHẠC VĨNH VIỄN ---------- */
            const audio = document.getElementById('ambient-audio');
            const musicBtn = document.getElementById('music-btn');
            const musicBtnText = document.getElementById('music-btn-text');
            const openMusicModalBtn = document.getElementById('open-music-modal-btn');
            const closeMusicBtn = document.getElementById('close-music-btn');
            const musicClosePillBtn = document.getElementById('music-close-pill-btn');
            const musicModal = document.getElementById('music-modal');
            const musicPlaylist = document.getElementById('music-playlist');
            const musicFileInput = document.getElementById('music-file-input');

            const MUSIC_DB_NAME = 'StarlightMusicDB_v1';
            const MUSIC_STORE = 'custom_songs';
            let isPlaying = false;
            let currentActiveTrackId = localStorage.getItem('starlight_active_song_id') || 'default';
            let currentBlobUrl = null;

            function openMusicDB() {
                return new Promise((resolve, reject) => {
                    const req = indexedDB.open(MUSIC_DB_NAME, 1);
                    req.onupgradeneeded = function (e) {
                        const db = e.target.result;
                        if (!db.objectStoreNames.contains(MUSIC_STORE)) {
                            db.createObjectStore(MUSIC_STORE, { keyPath: 'id' });
                        }
                    };
                    req.onsuccess = e => resolve(e.target.result);
                    req.onerror = e => reject(e.target.error);
                });
            }

            async function getSavedSongsFromDB() {
                try {
                    const db = await openMusicDB();
                    return new Promise((resolve) => {
                        const tx = db.transaction(MUSIC_STORE, 'readonly');
                        const store = tx.objectStore(MUSIC_STORE);
                        const req = store.getAll();
                        req.onsuccess = () => resolve(req.result || []);
                        req.onerror = () => resolve([]);
                    });
                } catch (e) {
                    return [];
                }
            }

            async function saveSongToDB(name, blob) {
                const db = await openMusicDB();
                return new Promise((resolve, reject) => {
                    const tx = db.transaction(MUSIC_STORE, 'readwrite');
                    const store = tx.objectStore(MUSIC_STORE);
                    const now = new Date();
                    const song = {
                        id: 'song_' + Date.now(),
                        name: name,
                        blob: blob,
                        date: `${now.getDate()}/${now.getMonth() + 1}`
                    };
                    const req = store.put(song);
                    req.onsuccess = () => resolve(song);
                    req.onerror = () => reject(req.error);
                });
            }

            async function deleteSongFromDB(id) {
                const db = await openMusicDB();
                return new Promise((resolve) => {
                    const tx = db.transaction(MUSIC_STORE, 'readwrite');
                    const store = tx.objectStore(MUSIC_STORE);
                    store.delete(id);
                    tx.oncomplete = () => resolve();
                });
            }

            async function switchTrack(trackId, songName, blob = null) {
                currentActiveTrackId = trackId;
                localStorage.setItem('starlight_active_song_id', trackId);

                if (currentBlobUrl) {
                    URL.revokeObjectURL(currentBlobUrl);
                    currentBlobUrl = null;
                }

                if (trackId === 'default') {
                    audio.src = 'audio/soundtrack.mp3';
                } else if (blob) {
                    currentBlobUrl = URL.createObjectURL(blob);
                    audio.src = currentBlobUrl;
                } else {
                    const songs = await getSavedSongsFromDB();
                    const found = songs.find(s => s.id === trackId);
                    if (found && found.blob) {
                        currentBlobUrl = URL.createObjectURL(found.blob);
                        audio.src = currentBlobUrl;
                    } else {
                        audio.src = 'audio/soundtrack.mp3';
                        currentActiveTrackId = 'default';
                        localStorage.setItem('starlight_active_song_id', 'default');
                    }
                }

                audio.volume = 0.65;
                audio.play().then(() => {
                    isPlaying = true;
                    updateMasterControlUI(songName || 'Bản Nhạc Gốc');
                    showToast(`🎵 Đang phát: ${songName || 'Bản Nhạc Gốc'}`);
                }).catch(() => {});

                renderPlaylistUI();
            }

            async function renderPlaylistUI() {
                const songs = await getSavedSongsFromDB();
                musicPlaylist.innerHTML = '';

                // 1. Bản nhạc gốc
                const defaultItem = document.createElement('div');
                defaultItem.className = 'music-item' + (currentActiveTrackId === 'default' ? ' active' : '');
                defaultItem.innerHTML = `
                    <div class="music-item-info">
                        <span class="music-item-icon">🌸</span>
                        <div>
                            <p class="music-item-title">Bản Nhạc Gốc (Mặc Định)</p>
                            <span class="music-item-sub">${currentActiveTrackId === 'default' && isPlaying ? 'Đang phát 🎵' : 'Giai điệu dịu êm'}</span>
                        </div>
                    </div>
                    <div class="music-item-actions">
                        <button type="button" class="music-play-btn ${currentActiveTrackId === 'default' ? 'active' : ''}">
                            ${currentActiveTrackId === 'default' ? 'Đang chọn' : 'Phát bài này'}
                        </button>
                    </div>
                `;
                defaultItem.querySelector('.music-play-btn').addEventListener('click', () => {
                    switchTrack('default', 'Bản Nhạc Gốc');
                });
                musicPlaylist.appendChild(defaultItem);

                // 2. Các bài hát tải lên
                songs.forEach(song => {
                    const item = document.createElement('div');
                    item.className = 'music-item' + (currentActiveTrackId === song.id ? ' active' : '');
                    item.innerHTML = `
                        <div class="music-item-info">
                            <span class="music-item-icon">⭐</span>
                            <div>
                                <p class="music-item-title">${escapeHtml(song.name)}</p>
                                <span class="music-item-sub">${currentActiveTrackId === song.id && isPlaying ? 'Đang phát 🎵' : 'Bài hát của em · Đã lưu'}</span>
                            </div>
                        </div>
                        <div class="music-item-actions">
                            <button type="button" class="music-play-btn ${currentActiveTrackId === song.id ? 'active' : ''}">
                                ${currentActiveTrackId === song.id ? 'Đang chọn' : 'Phát bài này'}
                            </button>
                            <button type="button" class="music-del-btn" title="Xóa bài hát này">✕</button>
                        </div>
                    `;

                    item.querySelector('.music-play-btn').addEventListener('click', () => {
                        switchTrack(song.id, song.name, song.blob);
                    });

                    item.querySelector('.music-del-btn').addEventListener('click', async (e) => {
                        e.stopPropagation();
                        if (confirm(`Em có muốn gỡ bài hát "${song.name}" không?`)) {
                            await deleteSongFromDB(song.id);
                            if (currentActiveTrackId === song.id) {
                                switchTrack('default', 'Bản Nhạc Gốc');
                            } else {
                                renderPlaylistUI();
                            }
                            showToast("Đã gỡ bài hát khỏi hộp nhạc");
                        }
                    });

                    musicPlaylist.appendChild(item);
                });
            }

            function openMusicModal() {
                renderPlaylistUI();
                musicModal.classList.add('active');
                musicModal.setAttribute('aria-hidden', 'false');
            }
            function closeMusicModal() {
                musicModal.classList.remove('active');
                musicModal.setAttribute('aria-hidden', 'true');
            }

            if (openMusicModalBtn) openMusicModalBtn.addEventListener('click', openMusicModal);
            if (closeMusicBtn) closeMusicBtn.addEventListener('click', closeMusicModal);
            if (musicClosePillBtn) musicClosePillBtn.addEventListener('click', closeMusicModal);
            if (musicModal) {
                musicModal.addEventListener('click', (e) => {
                    if (e.target === musicModal) closeMusicModal();
                });
            }

            if (musicFileInput) {
                musicFileInput.addEventListener('change', async function () {
                    const file = this.files && this.files[0];
                    if (!file) return;

                    showToast("⏳ Đang lưu bài hát vào hộp nhạc...");
                    try {
                        const songName = file.name.replace(/\.[^/.]+$/, "") || "Bài hát yêu thích";
                        const saved = await saveSongToDB(songName, file);
                        showToast("🎶 Đã lưu bài hát thành công!");
                        switchTrack(saved.id, saved.name, saved.blob);
                        this.value = '';
                    } catch (err) {
                        showToast("⚠️ Không thể lưu bài hát này, em thử lại nhé!");
                    }
                });
            }

            const modalMasterToggleBtn = document.getElementById('modal-master-toggle-btn');
            const modalNowTitle = document.getElementById('modal-now-title');
            const modalNowStatus = document.getElementById('modal-now-status');
            const modalToggleIcon = document.getElementById('modal-toggle-icon');
            const modalToggleText = document.getElementById('modal-toggle-text');
            const modalDiscIcon = document.getElementById('modal-disc-icon');

            function updateMasterControlUI(songName) {
                if (modalNowTitle && songName) modalNowTitle.textContent = songName;
                if (modalNowStatus) {
                    modalNowStatus.textContent = isPlaying ? "Đang phát nhạc 🌸" : "Đang tạm dừng ⏸";
                }
                if (modalToggleIcon) modalToggleIcon.textContent = isPlaying ? "⏸" : "▶";
                if (modalToggleText) modalToggleText.textContent = isPlaying ? "Tạm dừng" : "Tiếp tục phát";
                if (modalDiscIcon) {
                    if (isPlaying) modalDiscIcon.classList.add('playing');
                    else modalDiscIcon.classList.remove('playing');
                }
                if (musicBtn) {
                    if (isPlaying) musicBtn.classList.add('playing');
                    else musicBtn.classList.remove('playing');
                }
                if (musicBtnText) {
                    musicBtnText.textContent = isPlaying ? "Đang phát" : "Bật nhạc";
                }
            }

            function toggleMusic() {
                if (!audio) return;
                if (isPlaying) {
                    audio.pause();
                    isPlaying = false;
                    updateMasterControlUI();
                } else {
                    audio.volume = 0.65;
                    audio.play().then(() => {
                        isPlaying = true;
                        updateMasterControlUI();
                    }).catch(() => {});
                }
            }

            musicBtn.addEventListener('click', toggleMusic);
            if (modalMasterToggleBtn) {
                modalMasterToggleBtn.addEventListener('click', toggleMusic);
            }

            async function initActiveTrack() {
                if (currentActiveTrackId && currentActiveTrackId !== 'default') {
                    const songs = await getSavedSongsFromDB();
                    const found = songs.find(s => s.id === currentActiveTrackId);
                    if (found && found.blob) {
                        currentBlobUrl = URL.createObjectURL(found.blob);
                        audio.src = currentBlobUrl;
                    }
                }
            }
            initActiveTrack();

            function autoStartMusicOnce() {
                if (!isPlaying && audio) {
                    audio.volume = 0.65;
                    audio.play().then(() => {
                        musicBtn.classList.add('playing');
                        musicBtnText.textContent = "Đang phát 🎵";
                        isPlaying = true;
                    }).catch(() => {});
                }
                document.removeEventListener('click', autoStartMusicOnce);
                document.removeEventListener('touchstart', autoStartMusicOnce);
            }
            document.addEventListener('click', autoStartMusicOnce, { once: true });
            document.addEventListener('touchstart', autoStartMusicOnce, { once: true });
            updateJournalCounter();

        })();