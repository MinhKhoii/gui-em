/**
 * ===================================================================
 * DATA STORE & STORAGE MANAGER
 * Hỗ trợ: LocalStorage, IndexedDB, Xuất/Nhập JSON Backup, và Supabase Cloud Sync
 * ===================================================================
 */

const STORAGE_KEYS = {
    SITE_CONFIG: 'memory_site_config_v2',
    MEETING_DATA: 'memory_meeting_data_v2',
    VUNGTAU_STOPS: 'memory_vungtau_stops_v2',
    GALLERY_ITEMS: 'memory_gallery_items_v2',
    LITTLE_THINGS: 'memory_little_things_v2',
    TIMELINE_ITEMS: 'memory_timeline_items_v2',
    LETTER_DATA: 'memory_letter_data_v2',
    SUPABASE_CONFIG: 'memory_supabase_config_v2',
    ADMIN_PASSKEY: 'memory_admin_passkey_v2'
};

// Dữ liệu mẫu chuẩn mực ban đầu
const INITIAL_DATA = {
    siteConfig: {
        anniversaryDate: '',
        heroTitle: 'CẢM ƠN EM, VÌ TẤT CẢ',
        heroSubtitle: 'Một kỷ niệm mà có lẽ tôi sẽ luôn nhớ.',
        heroQuote: 'Có những cuộc gặp gỡ tưởng chừng rất bình thường, nhưng lại trở thành một phần ký ức mà ta muốn giữ mãi.',
        bgMusicUrl: 'audio/soundtrack.mp3',
        bgMusicTitle: 'Bản tình ca hoàng hôn – Soundtrack',
        adminPasskey: '123456' // Mật khẩu quản trị mặc định (123456)
    },

    meetingData: {
        dateText: 'Khởi đầu · Lần đầu gặp nhau',
        title: 'Từ Một Cuộc Gặp Tình Cờ',
        photo: 'img/ki_niem.jpg',
        tags: ['Lần đầu gặp gỡ', 'Khởi đầu kỷ niệm'],
        paragraphs: [
            'Hôm ấy, chúng ta gặp nhau trong một buổi tụ tập cùng mọi người. Giữa không khí náo nhiệt của bàn nhậu, những câu chuyện nối tiếp nhau, chúng ta cũng chỉ đơn giản là hai người mới quen, đôi ba câu chào hỏi rồi cùng hòa vào cuộc vui.',
            'Khi ấy, có lẽ chẳng ai trong chúng ta nghĩ rằng một cuộc gặp gỡ bình thường như vậy lại có thể mở đầu cho nhiều câu chuyện và những kỷ niệm đáng nhớ về sau.',
            'Thậm chí, sau buổi gặp hôm ấy, tôi cũng chưa từng nghĩ mình sẽ chủ động nhắn tin hay tìm cách làm quen với em.',
            'Nhưng đôi khi, những điều đáng nhớ nhất lại bắt đầu từ những khoảnh khắc mà ta chẳng hề có sự chuẩn bị trước.'
        ]
    },

    vungtauStops: [
        {
            id: 'stop-1',
            name: 'Bãi Sau (Bãi Thùy Vân)',
            lat: 10.3340,
            lng: 107.0880,
            category: 'Biển & Bình minh',
            photo: 'img/img1.jpg',
            date: 'Chuyến đi Vũng Tàu',
            desc: 'Bãi biển dài trong lành, từng đợt sóng bạc vỗ vào bờ cát. Nơi đón những cơn gió biển đầu tiên trong chuyến đi.',
            memo: '“Cảm ơn em vì đã rủ tôi dạo bước lắng nghe tiếng sóng biển.”'
        },
        {
            id: 'stop-2',
            name: 'Ngọn Hải Đăng Vũng Tàu',
            lat: 10.3346,
            lng: 107.0747,
            category: 'Ngắm toàn cảnh biển trời',
            photo: 'img/img2.jpg',
            date: 'Đỉnh núi Nhỏ',
            desc: 'Ngọn hải đăng cổ kính sừng sững trên đỉnh núi Nhỏ, nơi phóng tầm mắt ôm trọn biển trời và thành phố dịu dàng.',
            memo: '“Đứng từ trên cao nhìn biển bao la, tôi cảm thấy chuyến đi này thật ý nghĩa.”'
        },
        {
            id: 'stop-3',
            name: 'Mũi Nghinh Phong & Cổng Trời',
            lat: 10.3235,
            lng: 107.0815,
            category: 'Lộng gió đại dương',
            photo: 'img/img3.jpg',
            date: 'Số 1 Hạ Long',
            desc: 'Mũi đất vươn mình ra biển đón ngàn ngọn gió mát lành. Chiếc cổng trời mở ra khung cảnh biển khơi xanh ngút ngàn.',
            memo: '“Gió biển lồng lộng thổi qua tóc em, nụ cười ấy là điều tôi sẽ nhớ mãi.”'
        },
        {
            id: 'stop-4',
            name: 'Tượng Chúa Kitô Vua (Tao Phùng)',
            lat: 10.3259,
            lng: 107.0844,
            category: 'Địa danh biểu tượng',
            photo: 'img/img7.jpg',
            date: 'Núi Tao Phùng',
            desc: 'Từng bậc đá uốn lượn rợp bóng cây xanh, phóng tầm nhìn ngắm toàn cảnh bờ biển uốn cong tuyệt đẹp.',
            memo: '“Từng bước đi cùng nhau đều trở thành một trang kỷ niệm đẹp.”'
        },
        {
            id: 'stop-5',
            name: 'Bãi Trước & Đường Ven Biển Trần Phú',
            lat: 10.3475,
            lng: 107.0725,
            category: 'Hoàng hôn lãng mạn',
            photo: 'img/img4.jpg',
            date: 'Đường Trần Phú',
            desc: 'Một bên là núi đá thoai thoải, một bên là mặt biển ánh lên sắc vàng cam rực rỡ lúc hoàng hôn buông xuống.',
            memo: '“Có những nơi đẹp vì phong cảnh, nhưng cũng có những nơi trở nên đặc biệt vì người đã cùng ta đến đó.”'
        },
        {
            id: 'stop-6',
            name: 'Ẩm Thực & Quán Cafe Bờ Sóng',
            lat: 10.3412,
            lng: 107.0789,
            category: 'Món ngon & Trò chuyện',
            photo: 'img/img5.jpg',
            date: 'Phố biển Vũng Tàu',
            desc: 'Bánh khọt giòn rụm, hải sản tươi ngon và ly cafe thơm nồng bên bờ sóng vỗ rì rào lúc chiều muộn.',
            memo: '“Những câu chuyện vui vẻ ta đã sẻ chia bên nhau.”'
        }
    ],

    galleryItems: [
        {
            id: 'gal-1',
            albumId: 'first-meet',
            albumName: 'Ngày đầu tiên gặp nhau',
            title: 'Ánh nhìn đầu tiên',
            date: 'Lần đầu gặp',
            location: 'Điểm hẹn đầu tiên',
            photo: 'img/img1.jpg',
            caption: 'Cuộc gặp gỡ bình dị nhưng khởi đầu cho chuỗi ngày ấm áp.',
            style: 'polaroid'
        },
        {
            id: 'gal-2',
            albumId: 'roads',
            albumName: 'Những cung đường ở Vũng Tàu',
            title: 'Con đường ven biển Trần Phú',
            date: 'Chuyến đi Vũng Tàu',
            location: 'Đường ven biển',
            photo: 'img/img2.jpg',
            caption: 'Tiếng sóng vỗ rì rào hòa cùng làn gió mơn man khi chúng ta cùng đi qua con đường này.',
            style: 'film'
        },
        {
            id: 'gal-3',
            albumId: 'places',
            albumName: 'Những địa điểm chúng ta đã đi qua',
            title: 'Cổng Trời Mũi Nghinh Phong',
            date: 'Chuyến đi Vũng Tàu',
            location: 'Mũi Nghinh Phong',
            photo: 'img/img3.jpg',
            caption: 'Nơi biển trời giao hòa, chiếc cổng vươn ra đại dương lộng gió, nơi ta cùng ngắm mây trôi.',
            style: 'scrapbook'
        },
        {
            id: 'gal-4',
            albumId: 'food',
            albumName: 'Những món ăn cùng thưởng thức',
            title: 'Hương vị ẩm thực phố biển',
            date: 'Bữa trưa Vũng Tàu',
            location: 'Quán ăn địa phương',
            photo: 'img/img4.jpg',
            caption: 'Bánh khọt giòn rụm, hải sản nóng hổi và những tiếng cười khúc khích bên bàn ăn.',
            style: 'polaroid'
        },
        {
            id: 'gal-5',
            albumId: 'happy',
            albumName: 'Những khoảnh khắc vui vẻ',
            title: 'Nụ cười rạng rỡ của em',
            date: 'Kỷ niệm vui vẻ',
            location: 'Khoảnh khắc đáng nhớ',
            photo: 'img/img5.jpg',
            caption: 'Cảm ơn em vì nụ cười luôn tỏa sáng, mang lại cảm giác bình yên và dễ chịu lạ thường.',
            style: 'scrapbook'
        },
        {
            id: 'gal-6',
            albumId: 'forever',
            albumName: 'Những bức ảnh tôi muốn giữ lại thật lâu',
            title: 'Hoàng hôn buông trên mặt biển',
            date: 'Chiều tà Vũng Tàu',
            location: 'Bờ biển hoàng hôn',
            photo: 'img/img6.jpg',
            caption: 'Mặt trời từ từ chìm xuống đại dương, ánh cam đào dịu ngọt còn đọng lại mãi trong ký ức.',
            style: 'film'
        },
        {
            id: 'gal-7',
            albumId: 'places',
            albumName: 'Những địa điểm chúng ta đã đi qua',
            title: 'Lối lên Ngọn Hải Đăng',
            date: 'Chuyến đi Vũng Tàu',
            location: 'Núi Nhỏ',
            photo: 'img/img7.jpg',
            caption: 'Con đường dốc quanh co rợp bóng cây, cùng ngắm nhìn thành phố biển từ trên cao.',
            style: 'polaroid'
        },
        {
            id: 'gal-8',
            albumId: 'roads',
            albumName: 'Những cung đường ở Vũng Tàu',
            title: 'Hàng hoa giấy rực nắng',
            date: 'Chuyến đi Vũng Tàu',
            location: 'Góc phố Vũng Tàu',
            photo: 'img/img8.jpg',
            caption: 'Sắc hoa rực rỡ nổi bật giữa nền trời xanh trong vắt của ngày hôm ấy.',
            style: 'scrapbook'
        },
        {
            id: 'gal-9',
            albumId: 'happy',
            albumName: 'Những khoảnh khắc vui vẻ',
            title: 'Dấu chân trên bãi cát',
            date: 'Bãi Sau',
            location: 'Bờ cát Thùy Vân',
            photo: 'img/img9.jpg',
            caption: 'Đôi khi điều đáng quý nhất không phải đi đâu, mà là ta đã cùng bước bên nhau như thế.',
            style: 'film'
        },
        {
            id: 'gal-10',
            albumId: 'forever',
            albumName: 'Những bức ảnh tôi muốn giữ lại thật lâu',
            title: 'Khoảnh khắc trọn vẹn',
            date: 'Kỷ niệm khó quên',
            location: 'Vũng Tàu, Việt Nam',
            photo: 'img/img10.jpg',
            caption: 'Những bức ảnh có thể phai màu theo năm tháng, nhưng lòng biết ơn này sẽ luôn còn mãi.',
            style: 'polaroid'
        }
    ],

    littleThings: [
        {
            id: 'lt-1',
            text: 'Có những khoảnh khắc tôi vẫn nhớ dù em có thể đã quên.',
            date: 'Kỷ niệm nhỏ',
            icon: '🌿'
        },
        {
            id: 'lt-2',
            text: 'Có những bức ảnh tôi không nỡ xóa.',
            date: 'Góc ký ức',
            icon: '📷'
        },
        {
            id: 'lt-3',
            text: 'Có những con đường tôi muốn được đi lại.',
            date: 'Cung đường Vũng Tàu',
            icon: '🌊'
        },
        {
            id: 'lt-4',
            text: 'Có những điều nhỏ bé nhưng tôi luôn cảm thấy biết ơn.',
            date: 'Từ đáy lòng',
            icon: '✨'
        }
    ],

    timelineItems: [
        {
            id: 'tl-1',
            date: 'Ngày đầu tiên',
            title: 'Lần đầu tiên chúng ta gặp nhau',
            desc: 'Một buổi gặp gỡ tình cờ trong buổi nhậu chung cùng mọi người, nhưng là khởi đầu cho chuỗi ngày đáng nhớ.',
            photo: 'img/ki_niem.jpg',
            status: 'completed'
        },
        {
            id: 'tl-2',
            date: 'Ngày tiếp theo',
            title: 'Những câu chuyện và sự thân quen',
            desc: 'Những dòng tin nhắn thăm hỏi, những câu chuyện kéo dài khiến khoảng cách vô hình dần biến mất.',
            photo: 'img/img2.jpg',
            status: 'completed'
        },
        {
            id: 'tl-3',
            date: 'Chuyến đi Vũng Tàu',
            title: 'Những trải nghiệm đáng nhớ',
            desc: 'Cảm ơn em đã chủ động rủ tôi đi chơi, cùng nhau ngắm biển, đi qua những con đường lộng gió và chia sẻ những món ngon.',
            photo: 'img/img3.jpg',
            status: 'completed'
        },
        {
            id: 'tl-4',
            date: 'Những lần gặp tiếp theo',
            title: 'Những kỷ niệm chưa được viết thành lời',
            desc: 'Mỗi cuộc gặp gỡ trong đời đều là một món quà đáng trân trọng trong hành trình thanh xuân của chúng ta.',
            photo: 'img/img6.jpg',
            status: 'pending' // Đánh dấu nội dung cần bổ sung theo yêu cầu
        }
    ],

    letterData: {
        greeting: 'Em à,',
        paragraphs: [
            'Tôi không viết những dòng này để mong chờ một điều gì đó, cũng không muốn khiến em phải suy nghĩ hay cảm thấy áp lực.',
            'Tôi chỉ nghĩ rằng, có những sự tử tế và những kỷ niệm đẹp xứng đáng được nói lời cảm ơn.',
            'Cuộc sống có rất nhiều cuộc gặp gỡ, có những người đến rồi đi, có những khoảnh khắc trôi qua rất nhanh.',
            'Nhưng tôi tin rằng, dù sau này mọi thứ có thế nào, chuyến đi ngày hôm ấy vẫn sẽ là một kỷ niệm mà tôi luôn nhớ đến với sự trân trọng.',
            'Tôi không biết em sẽ cảm nhận những dòng này như thế nào.',
            'Chỉ mong rằng khi đọc xong, em hiểu được một điều:\n\n“Tôi thật sự biết ơn vì ngày hôm ấy đã có em.”'
        ],
        signature: 'Cảm ơn em vì tất cả ❤️'
    }
};

class DataStore {
    constructor() {
        this.cache = {};
        this.supabase = null;
        this.init();
    }

    init() {
        // Nạp cấu hình Supabase nếu có
        this.initSupabase();
    }

    initSupabase() {
        const config = this.getSupabaseConfig();
        if (config && config.url && config.anonKey && window.supabase) {
            try {
                this.supabase = window.supabase.createClient(config.url, config.anonKey);
                console.log('✅ Supabase client initialized successfully.');
            } catch (err) {
                console.warn('⚠️ Supabase initialization error:', err);
            }
        }
    }

    getSupabaseConfig() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    setSupabaseConfig(url, anonKey) {
        localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify({ url, anonKey }));
        this.initSupabase();
    }

    // Đọc dữ liệu (kết hợp LocalStorage và fallback INITIAL_DATA)
    get(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.error(`Error reading ${key}`, e);
        }
        return fallback;
    }

    // Lưu dữ liệu vào LocalStorage và đồng bộ Supabase nếu đã kết nối
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            this.syncToSupabase(key, value);
            return true;
        } catch (e) {
            console.error(`Error writing ${key}`, e);
            return false;
        }
    }

    // Đồng bộ lên Supabase nếu có client
    async syncToSupabase(key, value) {
        if (!this.supabase) return;
        try {
            const { error } = await this.supabase
                .from('memory_store')
                .upsert({ key: key, data: value, updated_at: new Date().toISOString() });
            if (error) console.warn('Supabase upsert warning:', error.message);
        } catch (err) {
            console.warn('Supabase sync exception:', err);
        }
    }

    // Lấy toàn bộ dữ liệu hiện tại
    getAllData() {
        return {
            siteConfig: this.get(STORAGE_KEYS.SITE_CONFIG, INITIAL_DATA.siteConfig),
            meetingData: this.get(STORAGE_KEYS.MEETING_DATA, INITIAL_DATA.meetingData),
            vungtauStops: this.get(STORAGE_KEYS.VUNGTAU_STOPS, INITIAL_DATA.vungtauStops),
            galleryItems: this.get(STORAGE_KEYS.GALLERY_ITEMS, INITIAL_DATA.galleryItems),
            littleThings: this.get(STORAGE_KEYS.LITTLE_THINGS, INITIAL_DATA.littleThings),
            timelineItems: this.get(STORAGE_KEYS.TIMELINE_ITEMS, INITIAL_DATA.timelineItems),
            letterData: this.get(STORAGE_KEYS.LETTER_DATA, INITIAL_DATA.letterData),
            exportTime: new Date().toISOString(),
            version: '2.0'
        };
    }

    // Khôi phục toàn bộ từ Object
    restoreAllData(data) {
        if (!data) return false;
        if (data.siteConfig) this.set(STORAGE_KEYS.SITE_CONFIG, data.siteConfig);
        if (data.meetingData) this.set(STORAGE_KEYS.MEETING_DATA, data.meetingData);
        if (data.vungtauStops) this.set(STORAGE_KEYS.VUNGTAU_STOPS, data.vungtauStops);
        if (data.galleryItems) this.set(STORAGE_KEYS.GALLERY_ITEMS, data.galleryItems);
        if (data.littleThings) this.set(STORAGE_KEYS.LITTLE_THINGS, data.littleThings);
        if (data.timelineItems) this.set(STORAGE_KEYS.TIMELINE_ITEMS, data.timelineItems);
        if (data.letterData) this.set(STORAGE_KEYS.LETTER_DATA, data.letterData);
        return true;
    }

    // Reset về mặc định
    resetToDefault() {
        this.set(STORAGE_KEYS.SITE_CONFIG, INITIAL_DATA.siteConfig);
        this.set(STORAGE_KEYS.MEETING_DATA, INITIAL_DATA.meetingData);
        this.set(STORAGE_KEYS.VUNGTAU_STOPS, INITIAL_DATA.vungtauStops);
        this.set(STORAGE_KEYS.GALLERY_ITEMS, INITIAL_DATA.galleryItems);
        this.set(STORAGE_KEYS.LITTLE_THINGS, INITIAL_DATA.littleThings);
        this.set(STORAGE_KEYS.TIMELINE_ITEMS, INITIAL_DATA.timelineItems);
        this.set(STORAGE_KEYS.LETTER_DATA, INITIAL_DATA.letterData);
    }

    // Xuất file JSON Backup
    exportJsonFile() {
        const data = this.getAllData();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `ky-niem-cam-on-em-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Nhập file JSON Backup
    importJsonFile(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                const success = this.restoreAllData(parsed);
                callback(success, null);
            } catch (err) {
                callback(false, err.message);
            }
        };
        reader.onerror = () => callback(false, 'Không thể đọc file');
        reader.readAsText(file);
    }

    // Nén ảnh client-side trước khi lưu
    compressImage(file, maxWidth = 1200, quality = 0.82) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let w = img.width;
                    let h = img.height;
                    if (w > maxWidth) {
                        h = Math.round((h * maxWidth) / w);
                        w = maxWidth;
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.onerror = () => resolve(e.target.result);
                img.src = e.target.result;
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }
}

// Khởi tạo thực thể Store dùng chung toàn ứng dụng
window.MemoryStore = new DataStore();
window.STORAGE_KEYS = STORAGE_KEYS;
window.INITIAL_DATA = INITIAL_DATA;

