/**
 * China Explorer — Centralized Trip Data
 * Source of truth: "China Trip 2026.xlsx" → Overview tab.
 *
 *   TRIP.destinations → unique places (map markers, city cards, city guides)
 *   TRIP.cities       → itinerary legs in travel order (home route, planner)
 *   TRIP.days         → day-by-day plan (planner timeline, per-day notes)
 */
const TRIP = {
  name: 'China Explorer',
  subtitle: 'A Journey Through China',
  author: 'CC & Joseph',
  arrival: '2026-12-05',
  departure: '2027-01-11',

  // ────────────────────────────────────────────────────────────
  // Hotel bookings (source: 全部订单.xlsx, exported Oct 2026)
  // coords are the nearest metro / neighbourhood centre — exact pins
  // for the hotels are not in OpenStreetMap.
  // ────────────────────────────────────────────────────────────
  hotels: [
    {
      id: 'luyue-sz',
      legIds: ['shenzhen'],
      destId: 'shenzhen',
      name: '鹭月酒店（深圳华强北科学馆地铁站店）',
      short: '鹭月酒店 · 华强北',
      area: '福田 · 华强北',
      metro: '科学馆站 1 号线',
      coords: [22.5406, 114.0993],
      checkIn: '2026-12-05',
      checkOut: '2026-12-08',
      nights: 3,
      paid: '到店付 ¥1,242',
      note: '科学馆地铁站旁，走到华强北电子街 10 分钟；从福田高铁站打车约 10 分钟。',
    },
    {
      id: 'vista-cq',
      legIds: ['chongqing'],
      destId: 'chongqing',
      name: 'Vista 高空江景酒店（解放碑洪崖洞店）',
      short: 'Vista 高空江景 · 解放碑',
      area: '渝中 · 解放碑',
      metro: '临江门站 2 号线',
      coords: [29.5629, 106.5785],
      checkIn: '2026-12-08',
      checkOut: '2026-12-13',
      nights: 5,
      paid: '延期付款 ¥4,907',
      note: '解放碑/洪崖洞核心区，江景房；去李子坝、长江索道都在 20 分钟车程内。',
    },
    {
      id: 'funlist-cd',
      legIds: ['chengdu'],
      destId: 'chengdu',
      name: '凡里 FUN LIST 酒店（成都春熙路太古里店）',
      short: '凡里 FUN LIST · 春熙路',
      area: '锦江 · 春熙路',
      metro: '春熙路站 2/3 号线',
      coords: [30.6520, 104.0810],
      checkIn: '2026-12-13',
      checkOut: '2026-12-19',
      nights: 6,
      paid: '延期付款 ¥1,760',
      note: '春熙路/太古里步行圈，成都东站坐 2 号线直达春熙路约 20 分钟。',
    },
    {
      id: 'qiuguo-bj',
      legIds: ['beijing'],
      destId: 'beijing',
      name: '北京前门秋果 S1918 庭院式酒店',
      short: '秋果 S1918 · 前门',
      area: '东城 · 前门',
      metro: '前门站 2/8 号线',
      coords: [39.8994, 116.3975],
      checkIn: '2026-12-19',
      checkOut: '2026-12-25',
      nights: 6,
      paid: '延期付款 ¥2,694',
      note: '前门大街胡同里，天安门步行可达；去北京站坐 2 号线仅 2 站，去慕田峪建议包车/直通车。',
    },
    {
      id: 'atour-sh-1',
      legIds: ['shanghai'],
      destId: 'shanghai',
      name: '上海陆家嘴民生路地铁站亚朵酒店',
      short: '亚朵 · 陆家嘴民生路',
      area: '浦东 · 陆家嘴',
      metro: '民生路站 18 号线',
      coords: [31.2428, 121.5336],
      checkIn: '2027-01-02',
      checkOut: '2027-01-03',
      nights: 1,
      paid: '延期付款 ¥394',
      note: '1/2 一晚。离陆家嘴三件套和中华艺术宫都近，2 号线过江到南京东路两站。',
    },
    {
      id: 'lunas-sh',
      legIds: ['shanghai'],
      destId: 'shanghai',
      name: '上海隐墅°Lunas Villa 庭院花园度假酒店（上海国际旅游度假区店）',
      short: 'Lunas Villa · 迪士尼',
      area: '浦东 · 国际旅游度假区',
      metro: '迪士尼站 11 号线',
      coords: [31.1443, 121.6575],
      checkIn: '2027-01-03',
      checkOut: '2027-01-05',
      nights: 2,
      paid: '延期付款 ¥516',
      note: '1/3–1/4 两晚，迪士尼度假区旁，去乐园有接驳。',
    },
    {
      id: 'atour-sh-2',
      legIds: ['shanghai'],
      destId: 'shanghai',
      name: '上海陆家嘴民生路地铁站亚朵酒店',
      short: '亚朵 · 陆家嘴民生路',
      area: '浦东 · 陆家嘴',
      metro: '民生路站 18 号线',
      coords: [31.2428, 121.5336],
      checkIn: '2027-01-05',
      checkOut: '2027-01-06',
      nights: 1,
      paid: '延期付款 ¥438',
      note: '1/5 一晚，回市区收拾行李，第二天去虹桥/浦东机场都方便。',
    },
    {
      id: 'ruijing-sz',
      legIds: ['shenzhen-return'],
      destId: 'shenzhen',
      name: '深圳南山睿景酒店（深圳湾口岸四海地铁站店）',
      short: '南山睿景 · 四海站',
      area: '南山 · 深圳湾口岸',
      metro: '四海站 12 号线',
      coords: [22.4985, 113.9186],
      checkIn: '2027-01-06',
      checkOut: '2027-01-10',
      nights: 4,
      paid: '到店付 ¥2,236 + 离店后付 ¥1,224（两间房）',
      note: '妈妈（徐美华）来深圳一起住，所以订了两间房。南山/深圳湾口岸一带，去万象天地、欢乐海岸、世界之窗都近；四海站 12 号线直达。',
    },
    {
      id: 'suzhou-tbd',
      legIds: ['suzhou'],
      destId: 'suzhou',
      name: '酒店待定（苏州 / 常熟）',
      short: '待定 · 苏州 / 常熟',
      area: '苏州 / 常熟',
      metro: '订好再补地铁站',
      checkIn: '2026-12-31',
      checkOut: '2027-01-02',
      nights: 2,
      paid: '—',
      placeholder: true,
      note: '占位：还没订。优先看苏州站/观前街一带，12/31 到 1/1 常熟住一晚也可。',
    },
    {
      id: 'shanghai-bund-tbd',
      legIds: ['shanghai-bund'],
      destId: 'shanghai',
      name: '酒店待定（上海 · 外滩一带）',
      short: '待定 · 上海',
      area: '上海 · 外滩 / 南京东路',
      metro: '订好再补地铁站',
      checkIn: '2026-12-30',
      checkOut: '2026-12-31',
      nights: 1,
      paid: '—',
      placeholder: true,
      note: '占位：还没订。外滩 City Walk 当晚，选南京东路/外滩附近最方便。',
    },
  ],

  // Nights with no booking yet
  pendingStays: {
    '2026-12-25': 'Dalian · 未预订',
    '2026-12-26': 'Dalian · 未预订',
    '2026-12-27': 'Dalian · 未预订',
    '2026-12-28': 'Dalian · 未预订',
    '2026-12-29': 'Dalian · 未预订',
  },

  // ────────────────────────────────────────────────────────────
  // Best way between stops (researched Oct 2026)
  // ────────────────────────────────────────────────────────────
  connections: [
    {
      legId: 'shenzhen',
      date: '2026-12-05',
      from: 'Auckland',
      to: 'Shenzhen',
      best: '✈️ AKL → HKG 10:10–16:20 · 🚄 West Kowloon → Futian 18 min (¥68)',
      alt: 'MTR East Rail to Lo Wu / Futian checkpoint (~50 min), or airport bus to Shenzhen Bay',
      why: 'Landing 16:20, the HSR from West Kowloon has you in Futian by ~17:45 — hotel ETA 18:00 works.',
    },
    {
      legId: 'chongqing',
      date: '2026-12-08',
      from: 'Shenzhen',
      to: 'Chongqing',
      best: '✈️ SZX → CKG ~2 h 10 (¥780)',
      alt: '🚄 Shenzhen North → Chongqing West ~7 h (¥720)',
      why: 'The train saves ~¥60 but costs five extra hours; fly and keep 12/8 free for Raffles City.',
    },
    {
      legId: 'chengdu',
      date: '2026-12-13',
      from: 'Chongqing',
      to: 'Chengdu',
      best: '🚄 Chongqing North / West → Chengdu East 1 h – 1 h 30 (¥154, every ~10–20 min)',
      alt: '✈️ flight ~1 h 10 but airport transfers kill the advantage',
      why: 'Train wins outright — depart after breakfast, in Chunxi Road by lunch.',
    },
    {
      legId: 'beijing',
      date: '2026-12-19',
      from: 'Chengdu',
      to: 'Beijing',
      best: '✈️ CTU / TFU → PEK / PKX ~3 h (¥1,150)',
      alt: '🚄 Chengdu East → Beijing West 7 h 30 – 10 h (¥808)',
      why: 'A 7.5 h train eats the whole day; fly in the morning and still see the Summer Palace.',
    },
    {
      legId: 'thailand-dalian',
      date: '2026-12-25',
      from: 'Beijing',
      to: 'Dalian',
      best: '🚄 Beijing Station → Dalian North 3 h 36 – 5 h (¥415–451)',
      alt: '✈️ PEK / PKX → DLC ~1 h 30, but both airports are an hour out of town',
      why: 'G159 leaves Beijing Station at 08:10 (2 metro stops from the hotel) and arrives 11:52 — door to door it beats flying.',
    },
    {
      legId: 'shanghai-bund',
      date: '2026-12-30',
      from: 'Dalian / Thailand',
      to: 'Shanghai',
      best: '✈️ DLC → PVG / SHA ~2 h (not booked) · the Thailand side departure is still TBC',
      alt: '🚄 one direct Dalian train a day, 10 h 22 (¥918) — not worth it',
      why: 'Flight only. Book once the departure airport is confirmed.',
    },
    {
      legId: 'suzhou',
      date: '2026-12-31',
      from: 'Shanghai',
      to: 'Suzhou',
      best: '🚄 Shanghai Station → Suzhou 20–40 min (¥21–52, ~450 departures a day)',
      alt: 'Hongqiao also works if you are on the Pudong side',
      why: 'Use Shanghai Station (Line 1/3/4) from the Bund hotel; Suzhou Station is in the old town.',
    },
    {
      legId: 'shanghai',
      date: '2027-01-02',
      from: 'Suzhou',
      to: 'Shanghai',
      best: '🚄 Suzhou → Shanghai Station 20–40 min (¥21–52)',
      alt: 'Hongqiao arrival + Line 2 straight to 民生路 if that train suits better',
      why: 'Both ends are downtown; book a mid-morning train and drop bags at the Atour by lunch.',
    },
    {
      legId: 'shenzhen-return',
      date: '2027-01-06',
      from: 'Shanghai',
      to: 'Shenzhen',
      best: '✈️ SHA / PVG → SZX ~2 h 30 (¥720)',
      alt: '🚄 Shanghai → Shenzhen North 6 h 35 – 11 h (¥694–993)',
      why: 'Flight. Shanghai Hongqiao is 40 min from 民生路 on Line 2; Shenzhen Bao’an to 四海 is a 25 min taxi.',
    },
    {
      legId: 'home',
      date: '2027-01-10',
      from: 'Shenzhen',
      to: 'Hong Kong',
      best: '🚄 Futian → West Kowloon 14–18 min (¥68) · Airport Express onwards',
      alt: 'MTR East Rail to Lo Wu, or a cross-border coach',
      why: 'Leave the hotel ~13:00 for the 17:50 flight — HSR + Airport Express is the fastest border crossing.',
    },
  ],

  // ────────────────────────────────────────────────────────────
  // Unique destinations
  // ────────────────────────────────────────────────────────────
  destinations: [
    {
      id: 'shenzhen',
      name: 'Shenzhen · 深圳',
      emoji: '🏙️',
      coords: [22.5431, 114.0579],
      tags: ['Modern', 'Tech', 'Coastal', { label: 'Warm Winter', cls: 'green' }],
      image: 'https://images.unsplash.com/photo-1522614288668-a697127e9b21?w=800&q=80',
      weather: { temp: '15–22°C', season: 'Early Winter · Dec', icon: '🌤️' },
      activities: [
        'Huaqiangbei electronics street (华强北)',
        '“Shenzhen Eye” at Gangxia North metro (深圳之眼)',
        'Shenzhen Science Museum (深圳科学馆)',
        'MixC World (万象天地) & COCO Park',
        'MOCAPE —当代艺术与城市规划馆',
        'Window of the World (世界之窗)',
        'Harry Potter: Forbidden Forest (哈利波特禁忌森林)',
        'Shenzhen Bay MixC (深圳湾万象城) & 欢乐海岸',
      ],
      notes: 'Start and finish of the China leg. Two quiet recovery days on arrival, then four packed days in Futian on the way home.',
    },
    {
      id: 'chongqing',
      name: 'Chongqing · 重庆',
      emoji: '⛰️',
      coords: [29.5630, 106.5516],
      tags: ['Mountain City', { label: 'Spicy Food', cls: 'amber' }, 'Night Views'],
      image: 'https://images.unsplash.com/photo-1779428261059-a43781b23e54?w=800&q=80',
      weather: { temp: '7–12°C', season: 'Winter · Dec', icon: '🌫️' },
      activities: [
        '重庆中国三峡博物馆 & 三峡图书馆',
        '李子坝轻轨穿楼观景台',
        '816 地下核工程 (Fuling) — full day',
        '洪崖洞民俗风貌区',
        '磁器口古镇',
        '长江索道 & 两江夜游',
        '观音桥 “我在重庆” 大屏',
        '重庆动物园 & 罗汉寺',
      ],
      notes: 'Five nights in Jiefangbei — rivers, cable cars, hotpot, and the 816 nuclear plant day trip to Fuling.',
    },
    {
      id: 'chengdu',
      name: 'Chengdu · 成都',
      emoji: '🐼',
      coords: [30.5728, 104.0668],
      tags: [{ label: 'Pandas', cls: 'green' }, 'Tea Culture', { label: 'Food', cls: 'amber' }],
      image: 'https://images.unsplash.com/photo-1625859043880-56acbcb6a6ac?w=800&q=80',
      weather: { temp: '3–10°C', season: 'Winter · Dec', icon: '🌦️' },
      activities: [
        '成都大熊猫繁育研究基地',
        '三星堆博物馆 (Guanghan)',
        '青城山 + 都江堰南桥 “蓝眼泪”',
        '人民公园 · 鹤鸣茶社',
        '武侯祠红墙 & 锦里古街',
        '文殊院 & 成都博物馆',
        '春熙路 / 太古里 / IFS',
        '杜甫草堂 & 九眼桥',
      ],
      notes: 'Six nights on Chunxi Road — pandas, teahouses, three museums and a full day up Qingcheng Mountain.',
    },
    {
      id: 'beijing',
      name: 'Beijing · 北京',
      emoji: '🏛️',
      coords: [39.9042, 116.4074],
      tags: ['History', 'Great Wall', { label: 'Winter', cls: 'amber' }],
      image: 'https://images.unsplash.com/photo-1663859454065-0b5650775708?w=800&q=80',
      weather: { temp: '-8–2°C', season: 'Winter · Dec', icon: '❄️' },
      activities: [
        '慕田峪长城 (Mutianyu)',
        '天安门广场 & 中国国家博物馆',
        '天坛 & 颐和园',
        '北京环球度假区 (Universal)',
        '恭王府 & 什刹海 / 后海',
        '国子监 · 孔庙 · 雍和宫',
        '南锣鼓巷',
      ],
      notes: 'Six nights in Wangfujing — the Great Wall, Universal Studios and the classic imperial sights in winter quiet.',
    },
    {
      id: 'dalian',
      name: 'Dalian · 大连',
      emoji: '🌊',
      coords: [38.9140, 121.6147],
      stay: '25 – 29 Dec 2026',
      nights: 5,
      tags: [{ label: 'Coastal', cls: 'green' }, 'Seafood', 'Quiet'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Bangchuidao_Island.JPG/960px-Bangchuidao_Island.JPG',
      weather: { temp: '-5–2°C', season: 'Winter · Dec', icon: '❄️' },
      activities: [
        '星海广场 & seaside walk',
        '滨海路 scenic drive',
        '俄罗斯风情街',
        'Fresh seafood dinner',
        '老虎滩海洋公园',
      ],
      notes: 'The other half of the Christmas split — five quiet days on the frozen coast while the family trip runs in Thailand.',
    },
    {
      id: 'suzhou',
      name: 'Suzhou / Changshu · 苏州 / 常熟',
      emoji: '🌿',
      coords: [31.2990, 120.5853],
      tags: [{ label: 'Water Towns', cls: 'green' }, 'Gardens', 'Classical Jiangsu'],
      image: 'https://images.unsplash.com/photo-1689825650048-55d2216868f7?w=800&q=80',
      weather: { temp: '0–8°C', season: 'Winter · Jan', icon: '🌤️' },
      activities: [
        '周庄古镇 (Kunshan)',
        '苏州博物馆本馆 (Gusu)',
        '金鸡湖 / 东方之门 (Suzhou SIP)',
        '常熟虞山国家森林公园',
        'Changshu old town',
      ],
      notes: 'Two nights over New Year — a water town, the Suzhou Museum, Jinji Lake, then Yushan Forest Park in Changshu.',
    },
    {
      id: 'shanghai',
      name: 'Shanghai · 上海',
      emoji: '🌃',
      coords: [31.2304, 121.4737],
      tags: ['Disneyland', { label: 'Imperial Feast', cls: 'amber' }, 'Culture'],
      image: 'https://images.unsplash.com/photo-1506158669146-619067262a00?w=800&q=80',
      weather: { temp: '1–9°C', season: 'Winter · Jan', icon: '🌤️' },
      activities: [
        '上海迪士尼乐园 — two days',
        '城隍庙 & 豫园',
        '上海博物馆',
        '中华艺术宫 (Pudong)',
        '陆家嘴 “三件套”',
        '外滩夜景 City Walk',
        '宫宴 imperial palace banquet',
        '静安寺 / 龙华寺',
      ],
      notes: 'Bund night on the way in, then four nights split between Disney and the city centre before flying home from Shenzhen.',
    },
  ],

  // ────────────────────────────────────────────────────────────
  // Itinerary legs (travel order)
  // ────────────────────────────────────────────────────────────
  cities: [
    {
      id: 'shenzhen',
      destId: 'shenzhen',
      name: 'Shenzhen · 深圳',
      emoji: '🏙️',
      startDate: '2026-12-05',
      endDate: '2026-12-07',
      nights: 3,
      hotel: 'Shenzhen · Futian',
      tags: ['Arrival', 'Rest', 'Tech'],
      transport: { from: 'Hong Kong (arrival)', mode: '🛬', duration: 'ETA 6 pm' },
      notes: 'Auckland → Hong Kong → Shenzhen, then two recovery days with 华强北 and the “Shenzhen Eye”.',
    },
    {
      id: 'chongqing',
      destId: 'chongqing',
      name: 'Chongqing · 重庆',
      emoji: '⛰️',
      startDate: '2026-12-08',
      endDate: '2026-12-12',
      nights: 5,
      hotel: 'Chongqing · Jiefangbei',
      tags: ['Rivers', { label: 'Spicy Food', cls: 'amber' }, 'Night Views'],
      transport: { from: 'Shenzhen', mode: '✈️', duration: '~2 h' },
      notes: 'Five nights in Jiefangbei — museums, cable cars, 816 nuclear plant and the best night views.',
    },
    {
      id: 'chengdu',
      destId: 'chengdu',
      name: 'Chengdu · 成都',
      emoji: '🐼',
      startDate: '2026-12-13',
      endDate: '2026-12-18',
      nights: 6,
      hotel: 'Chengdu · Chunxi Rd',
      tags: [{ label: 'Pandas', cls: 'green' }, 'Tea Houses', { label: 'Food', cls: 'amber' }],
      transport: { from: 'Chongqing', mode: '🚄', duration: '1.5 h' },
      notes: 'Six nights on Chunxi Road — pandas, Sanxingdui, Qingcheng Mountain and teahouse afternoons.',
    },
    {
      id: 'beijing',
      destId: 'beijing',
      name: 'Beijing · 北京',
      emoji: '🏛️',
      startDate: '2026-12-19',
      endDate: '2026-12-24',
      nights: 6,
      hotel: 'Beijing · Wangfujing',
      tags: ['History', 'Great Wall', { label: 'Winter', cls: 'amber' }],
      transport: { from: 'Chengdu', mode: '✈️', duration: '~3 h' },
      notes: 'Six nights in Wangfujing — Mutianyu, Universal Studios, and hutong evenings.',
    },
    {
      id: 'thailand-dalian',
      destId: null,
      name: 'Thailand / Dalian · Break',
      emoji: '🌴',
      startDate: '2026-12-25',
      endDate: '2026-12-29',
      nights: 5,
      hotel: 'Split — Thailand / Dalian',
      tags: [{ label: 'Break', cls: 'green' }, 'Split', 'Family'],
      transport: { from: 'Beijing', mode: '✈️', duration: '~4 h' },
      notes: 'We split for Christmas: one of us joins the Thailand family trip, the other flies to Dalian. No fixed plan — a proper break.',
    },
    {
      id: 'shanghai-bund',
      destId: 'shanghai',
      name: 'Shanghai · 上海 (Bund night)',
      emoji: '🌃',
      startDate: '2026-12-30',
      endDate: '2026-12-30',
      nights: 1,
      hotel: 'Shanghai · Bund area',
      tags: ['Meet-up', 'Bund night walk'],
      transport: { from: 'Thailand', mode: '✈️', duration: '~4.5 h' },
      notes: 'Fly in from Thailand, check in, and walk the Bund at night.',
    },
    {
      id: 'suzhou',
      destId: 'suzhou',
      name: 'Suzhou / Changshu · 苏州 / 常熟',
      emoji: '🌿',
      startDate: '2026-12-31',
      endDate: '2027-01-01',
      nights: 2,
      hotel: 'Suzhou / Changshu',
      tags: [{ label: 'Water Towns', cls: 'green' }, 'Gardens', 'New Year'],
      transport: { from: 'Shanghai', mode: '🚄', duration: '25 min' },
      notes: 'New Year in Jiangsu — Zhouzhuang, Suzhou Museum, Jinji Lake, then Yushan Forest Park.',
    },
    {
      id: 'shanghai',
      destId: 'shanghai',
      name: 'Shanghai · 上海',
      emoji: '🌃',
      startDate: '2027-01-02',
      endDate: '2027-01-05',
      nights: 4,
      hotel: 'Shanghai Disney / Central',
      tags: ['Disneyland', { label: 'Imperial Feast', cls: 'amber' }, 'Culture'],
      transport: { from: 'Suzhou', mode: '🚄', duration: '~30 min' },
      notes: 'Two Disneyland days plus the old city, museums and Pudong — hotels split between Disney and Central.',
    },
    {
      id: 'shenzhen-return',
      destId: 'shenzhen',
      name: 'Shenzhen · 深圳 (return)',
      emoji: '🏙️',
      startDate: '2027-01-06',
      endDate: '2027-01-09',
      nights: 4,
      hotel: 'Shenzhen · Futian',
      tags: ['Tech', 'Shopping', 'Harry Potter'],
      transport: { from: 'Shanghai', mode: '✈️', duration: '~2.5 h' },
      notes: 'Four days back in Futian/Shenzhen with mum visiting — museums, malls, the Harry Potter forest and a drone show.',
    },
    {
      id: 'home',
      destId: null,
      name: 'Home · Auckland',
      emoji: '🇳🇿',
      startDate: '2027-01-10',
      endDate: '2027-01-11',
      nights: 0,
      hotel: 'In flight',
      tags: ['Home'],
      transport: { from: 'Shenzhen', mode: '✈️', duration: '5:50 pm dep.' },
      notes: 'Shenzhen → Hong Kong → Auckland, landing 9:45 am on 11 Jan.',
    },
  ],

  // ────────────────────────────────────────────────────────────
  // Day-by-day plan
  // ────────────────────────────────────────────────────────────
  days: [
    // ── Shenzhen (arrival) ──
    {
      date: '2026-12-05', legId: 'shenzhen', city: 'Shenzhen', hotel: 'Shenzhen · Futian', tag: 'Travel',
      morning: ['✈️ Auckland → Hong Kong · 10:10 – 16:20'],
      afternoon: ['🚄 Hong Kong → Shenzhen'],
      evening: ['Hotel check-in · ETA 6 pm'],
      note: 'Blocked — rest only.',
    },
    {
      date: '2026-12-06', legId: 'shenzhen', city: 'Shenzhen', hotel: 'Shenzhen · Futian', tag: 'Rest',
      morning: ['Rest / sleep in'],
      afternoon: ['华强北电子步行街 (Futian) · 2.5–3 h'],
      evening: ['岗厦北地铁站 “深圳之眼” (Futian) · 30–45 min'],
      note: 'Blocked — rest only. Keep it light.',
    },
    {
      date: '2026-12-07', legId: 'shenzhen', city: 'Shenzhen', hotel: 'Shenzhen · Futian', tag: 'Rest',
      morning: ['Rest / slow start'],
      afternoon: ['华强北电子步行街 (Futian) · 2.5–3 h'],
      evening: ['岗厦北地铁站 “深圳之眼” (Futian) · 30–45 min'],
      note: 'Buffer rest day — repeat of yesterday if needed.',
    },

    // ── Chongqing ──
    {
      date: '2026-12-08', legId: 'chongqing', city: 'Chongqing', hotel: 'Chongqing · Jiefangbei', tag: 'Travel',
      morning: ['✈️ Shenzhen → Chongqing'],
      afternoon: ['重庆来福士 / 朝天门 (Yuzhong)'],
      evening: ['长江索道 (Yuzhong → Nan’an)'],
      note: '',
    },
    {
      date: '2026-12-09', legId: 'chongqing', city: 'Chongqing', hotel: 'Chongqing · Jiefangbei', tag: '',
      morning: ['重庆中国三峡博物馆 (Yuzhong)', '三峡图书馆'],
      afternoon: ['李子坝轻轨穿楼观景台 (Yuzhong)'],
      evening: ['两江夜游 · 朝天门码头'],
      note: '',
    },
    {
      date: '2026-12-10', legId: 'chongqing', city: 'Chongqing', hotel: 'Chongqing · Jiefangbei', tag: 'Full day',
      morning: ['816 地下核工程 (Fuling District) — full day'],
      afternoon: ['磁器口古镇'],
      evening: [],
      note: 'Long day trip to Fuling — pack snacks.',
    },
    {
      date: '2026-12-11', legId: 'chongqing', city: 'Chongqing', hotel: 'Chongqing · Jiefangbei', tag: '',
      morning: ['洪崖洞民俗风貌区 (Yuzhong)'],
      afternoon: ['观音桥 “我在重庆” 大屏 (Jiangbei)'],
      evening: ['重庆来福士 / 朝天门', '“落地签” 机车约拍 (Nanbin Rd)'],
      note: '',
    },
    {
      date: '2026-12-12', legId: 'chongqing', city: 'Chongqing', hotel: 'Chongqing · Jiefangbei', tag: '',
      morning: ['重庆动物园'],
      afternoon: ['国泰艺术中心 & 罗汉寺'],
      evening: [],
      note: '',
    },

    // ── Chengdu ──
    {
      date: '2026-12-13', legId: 'chengdu', city: 'Chengdu', hotel: 'Chengdu · Chunxi Rd', tag: 'Travel',
      morning: ['🚄 HSR Chongqing → Chengdu · 1.5 h'],
      afternoon: ['春熙路 / 太古里 / IFS (Jinjiang)'],
      evening: ['九眼桥 / 安顺廊桥 (Jinjiang) · 1.5–2 h'],
      note: '',
    },
    {
      date: '2026-12-14', legId: 'chengdu', city: 'Chengdu', hotel: 'Chengdu · Chunxi Rd', tag: '',
      morning: ['文殊院 (Qingyang) · 1.5 h'],
      afternoon: ['成都博物馆 (Tianfu Square)'],
      evening: [],
      note: '',
    },
    {
      date: '2026-12-15', legId: 'chengdu', city: 'Chengdu', hotel: 'Chengdu · Chunxi Rd', tag: '',
      morning: ['成都大熊猫繁育研究基地 (Chenghua)'],
      afternoon: ['三星堆博物馆 (Guanghan)'],
      evening: [],
      note: 'Panda base early, then the drive out to Guanghan.',
    },
    {
      date: '2026-12-16', legId: 'chengdu', city: 'Chengdu', hotel: 'Chengdu · Chunxi Rd', tag: 'Full day',
      morning: ['青城山 (Dujiangyan) · 6–7 h incl. transit', '月城湖 / 天师洞'],
      afternoon: ['都江堰南桥 “蓝眼泪” · 1 h'],
      evening: [],
      note: '',
    },
    {
      date: '2026-12-17', legId: 'chengdu', city: 'Chengdu', hotel: 'Chengdu · Chunxi Rd', tag: '',
      morning: ['人民公园 · 鹤鸣茶社 (Qingyang) · 1.5–2 h'],
      afternoon: ['武侯祠 · 红墙 (Wuhou) · 1.5–2 h'],
      evening: ['锦里古街 (Wuhou) · 1.5 h'],
      note: '',
    },
    {
      date: '2026-12-18', legId: 'chengdu', city: 'Chengdu', hotel: 'Chengdu · Chunxi Rd', tag: '',
      morning: ['杜甫草堂 (Qingyang) · 2 h'],
      afternoon: [],
      evening: ['四川火锅', 'Packing'],
      note: '',
    },

    // ── Beijing ──
    {
      date: '2026-12-19', legId: 'beijing', city: 'Beijing', hotel: 'Beijing · Wangfujing', tag: 'Travel',
      morning: ['✈️ Chengdu → Beijing'],
      afternoon: ['Hotel check-in', '颐和园 (Haidian) · 3.5–4 h'],
      evening: ['清华 / 北大 [optional]'],
      note: 'Summer Palace on arrival day is tight — swap with 12/22 if the flight runs late.',
    },
    {
      date: '2026-12-20', legId: 'beijing', city: 'Beijing', hotel: 'Beijing · Wangfujing', tag: '',
      morning: ['天安门广场'],
      afternoon: ['中国国家博物馆 (Dongcheng) · 3–3.5 h'],
      evening: ['天坛'],
      note: '',
    },
    {
      date: '2026-12-21', legId: 'beijing', city: 'Beijing', hotel: 'Beijing · Wangfujing', tag: '',
      morning: ['慕田峪长城 (Huairou) · 6–7 h incl. transit'],
      afternoon: ['国子监与孔庙 (Dongcheng) · 1.5 h'],
      evening: ['雍和宫 (Dongcheng)'],
      note: '',
    },
    {
      date: '2026-12-22', legId: 'beijing', city: 'Beijing', hotel: 'Beijing · Wangfujing', tag: '',
      morning: ['南锣鼓巷 (Dongcheng) · 1.5–2 h'],
      afternoon: ['雍和宫 (Dongcheng) · 1.5–2 h'],
      evening: [],
      note: 'Flex day — move the Great Wall or Summer Palace here if needed.',
    },
    {
      date: '2026-12-23', legId: 'beijing', city: 'Beijing', hotel: 'Beijing · Wangfujing', tag: 'Full day',
      morning: ['北京环球度假区 (Tongzhou) · 8–10 h'],
      afternoon: [],
      evening: [],
      note: '',
    },
    {
      date: '2026-12-24', legId: 'beijing', city: 'Beijing', hotel: 'Beijing · Wangfujing', tag: '',
      morning: ['恭王府 (Xicheng) · 1.5 h'],
      afternoon: ['什刹海 / 后海 (Xicheng)'],
      evening: ['Packing'],
      note: 'Moved from the Chengdu column of the sheet — Prince Gong’s Mansion and Shichahai are in Beijing.',
    },

    // ── Christmas split: Thailand / Dalian (break) ──
    {
      date: '2026-12-25', legId: 'thailand-dalian', city: 'Split · 分头', hotel: 'Thailand / Dalian', tag: 'Travel',
      morning: ['✈️ Beijing → Thailand (one of us)', '✈️ Beijing → Dalian (the other)'],
      afternoon: [],
      evening: [],
      note: 'Split day — Thailand family trip for one, Dalian for the other.',
    },
    {
      date: '2026-12-26', legId: 'thailand-dalian', city: 'Break · 休息', hotel: 'Thailand / Dalian', tag: 'Break',
      morning: [], afternoon: [], evening: [],
      note: 'Break — no fixed plan.',
    },
    {
      date: '2026-12-27', legId: 'thailand-dalian', city: 'Break · 休息', hotel: 'Thailand / Dalian', tag: 'Break',
      morning: [], afternoon: [], evening: [],
      note: 'Break — no fixed plan.',
    },
    {
      date: '2026-12-28', legId: 'thailand-dalian', city: 'Break · 休息', hotel: 'Thailand / Dalian', tag: 'Break',
      morning: [], afternoon: [], evening: [],
      note: 'Break — no fixed plan.',
    },
    {
      date: '2026-12-29', legId: 'thailand-dalian', city: 'Break · 休息', hotel: 'Thailand / Dalian', tag: 'Break',
      morning: [], afternoon: [], evening: [],
      note: 'Break — last day apart.',
    },

    // ── Shanghai (1 night) ──
    {
      date: '2026-12-30', legId: 'shanghai-bund', city: 'Shanghai', hotel: 'Shanghai · Bund area', tag: 'Travel',
      morning: ['✈️ Flight to Shanghai — from Thailand / Dalian', 'Departure airport not booked yet'],
      afternoon: ['Hotel check-in'],
      evening: ['外滩 City Walk'],
      note: 'Meet in Shanghai — flights not booked yet, origin airport TBC.',
    },

    // ── Suzhou / Changshu ──
    {
      date: '2026-12-31', legId: 'suzhou', city: 'Suzhou', hotel: 'Suzhou / Changshu', tag: 'Travel',
      morning: ['🚄 HSR to Suzhou · 25 min', '苏州博物馆本馆 (Gusu) · 2–2.5 h'],
      afternoon: ['周庄古镇 (Kunshan) · 4–5 h incl. transit'],
      evening: ['金鸡湖 / 东方之门 (Suzhou SIP) · 2–3 h'],
      note: '',
    },
    {
      date: '2027-01-01', legId: 'suzhou', city: 'Changshu', hotel: 'Suzhou / Changshu', tag: '',
      morning: [],
      afternoon: ['常熟虞山国家森林公园 (Changshu) · 2 h'],
      evening: ['Changshu old town stroll'],
      note: 'New Year’s Day — slow start.',
    },

    // ── Shanghai ──
    {
      date: '2027-01-02', legId: 'shanghai', city: 'Shanghai', hotel: 'Shanghai Disney', tag: 'Travel',
      morning: ['🚄 Suzhou → Shanghai'],
      afternoon: ['城隍庙', '上海博物馆 · 2–2.5 h'],
      evening: ['豫园 (Huangpu)'],
      note: '',
    },
    {
      date: '2027-01-03', legId: 'shanghai', city: 'Shanghai', hotel: 'Shanghai Central', tag: '',
      morning: ['静安寺', '龙华寺'],
      afternoon: ['中华艺术宫 (Pudong)'],
      evening: ['陆家嘴 “三件套” · night view'],
      note: 'Pure Chinese-culture day; no colonial-era stops.',
    },
    {
      date: '2027-01-04', legId: 'shanghai', city: 'Shanghai', hotel: 'Shanghai Disney', tag: 'Full day',
      morning: ['上海迪士尼乐园 — full day'],
      afternoon: [],
      evening: [],
      note: '',
    },
    {
      date: '2027-01-05', legId: 'shanghai', city: 'Shanghai', hotel: 'Shanghai Central', tag: '',
      morning: ['Free day · Shanghai Central'],
      afternoon: ['豫园商城 / 城隍庙小吃'],
      evening: ['Packing'],
      note: 'Confirm the 宫宴 booking for today if that is the plan.',
    },

    // ── Shenzhen (return) ──
    {
      date: '2027-01-06', legId: 'shenzhen-return', city: 'Shenzhen', hotel: 'Shenzhen · Futian', tag: 'Travel',
      morning: ['✈️ Shanghai → Shenzhen'],
      afternoon: ['深圳科学馆 (Futian) · 1.5–2 h'],
      evening: ['哈利波特：禁忌森林体验 (Longhua) · 2–2.5 h'],
      note: '妈妈来深圳一起住（两间房）。圆博园 [optional] if energy allows.',
    },
    {
      date: '2027-01-07', legId: 'shenzhen-return', city: 'Shenzhen', hotel: 'Shenzhen · Futian', tag: '',
      morning: [],
      afternoon: ['深圳万象天地 (Nanshan) · 2.5–3 h'],
      evening: ['福田星河 COCO Park · 2 h'],
      note: '世界之窗 [optional] · City Walk · 同华小镇.',
    },
    {
      date: '2027-01-08', legId: 'shenzhen-return', city: 'Shenzhen', hotel: 'Shenzhen · Futian', tag: '',
      morning: ['玛丝菲尔大厦 (Longhua) · 1–1.5 h'],
      afternoon: ['深圳市当代艺术与城市规划馆 MOCAPE (Futian) · 2 h'],
      evening: ['世界之窗 (Nanshan) · 3–4 h', 'Drone Show'],
      note: '',
    },
    {
      date: '2027-01-09', legId: 'shenzhen-return', city: 'Shenzhen', hotel: 'Shenzhen · Futian', tag: '',
      morning: [],
      afternoon: ['深圳湾万象城 (Nanshan) · 2 h'],
      evening: ['欢乐海岸'],
      note: 'Last night in China.',
    },

    // ── Home ──
    {
      date: '2027-01-10', legId: 'home', city: 'Hong Kong → Auckland', hotel: 'In flight', tag: 'Travel',
      morning: ['🚄 Shenzhen → Hong Kong'],
      afternoon: ['✈️ Hong Kong → Auckland · dep. 17:50'],
      evening: [],
      note: '',
    },
    {
      date: '2027-01-11', legId: 'home', city: 'Auckland', hotel: 'Home', tag: '',
      morning: ['9:45 — Arrival in Auckland'],
      afternoon: [],
      evening: [],
      note: '',
    },
  ],

  transport: [
    { from: 'Auckland', to: 'Hong Kong', mode: '✈️', duration: '10:10 – 16:20' },
    { from: 'Hong Kong', to: 'Shenzhen', mode: '🚄', duration: 'ETA 6 pm' },
    { from: 'Shenzhen', to: 'Chongqing', mode: '✈️', duration: '~2 h' },
    { from: 'Chongqing', to: 'Chengdu', mode: '🚄', duration: '1.5 h' },
    { from: 'Chengdu', to: 'Beijing', mode: '✈️', duration: '~3 h' },
    { from: 'Beijing', to: 'Thailand', mode: '✈️', duration: '~4 h' },
    { from: 'Beijing', to: 'Dalian', mode: '✈️', duration: '~1.5 h' },
    { from: 'Thailand / Dalian', to: 'Shanghai', mode: '✈️', duration: 'flight TBC' },
    { from: 'Shanghai', to: 'Suzhou', mode: '🚄', duration: '25 min' },
    { from: 'Suzhou', to: 'Shanghai', mode: '🚄', duration: '~30 min' },
    { from: 'Shanghai', to: 'Shenzhen', mode: '✈️', duration: '~2.5 h' },
    { from: 'Shenzhen', to: 'Hong Kong', mode: '🚄', duration: '~1 h' },
    { from: 'Hong Kong', to: 'Auckland', mode: '✈️', duration: 'Departs 17:50' },
  ],

  budget: {
    currency: 'NZD',
    categories: [
      {
        name: '✈️ Transport',
        estimatedMin: 450,
        estimatedMax: 850,
        unit: 'total',
        note: 'China flights + high-speed rail (Shenzhen–Chongqing, Chongqing–Chengdu, Shanghai–Suzhou, Shanghai–Shenzhen).',
      },
      {
        name: '🏨 Hotels',
        estimatedMin: 45,
        estimatedMax: 110,
        unit: '/ night',
        note: 'Beijing, Shanghai & Shenzhen are pricier ($70–110). Disney hotels and New Year nights are the peak.',
      },
      {
        name: '🍜 Food & Activities',
        estimatedMin: 20,
        estimatedMax: 45,
        unit: '/ day',
        note: 'Thailand and Beijing are eating-heavy legs; hotpot and imperial feasts add up.',
      },
      {
        name: '🚕 City Transport',
        estimatedMin: 5,
        estimatedMax: 15,
        unit: '/ day',
        note: 'Metro is cheap; DiDi rides start around $3–$8. Charter cars for 816 plant and Qingcheng Mountain.',
      },
      {
        name: '🎟️ Attractions',
        estimatedMin: 10,
        estimatedMax: 60,
        unit: '/ site',
        note: 'Two Disneyland days, Universal Studios Beijing, 816 plant and the Harry Potter forest drive this.',
      },
      {
        name: '� Christmas split',
        estimatedMin: 600,
        estimatedMax: 1200,
        unit: 'total',
        note: 'One flies to the Thailand family trip, one to Dalian — flights and hotels for both.',
      },
      {
        name: '📱 Extras',
        estimatedMin: 50,
        estimatedMax: 150,
        unit: 'total',
        note: 'VPN, SIM / eSIM, travel insurance, laundry, souvenirs.',
      },
    ],
    totalMin: 3000,
    totalMax: 5200,
    totalNote: 'For the full 38-day trip, including the Thailand family week.'
  },

  packing: {
    categories: [
      {
        name: '📄 Documents',
        items: ['Passport', 'Visa documents', 'Flight tickets (print + digital)', 'Hotel booking confirmations', 'Travel insurance', 'Vaccination card', 'Driver\'s license'],
      },
      {
        name: '👕 Clothing',
        items: ['Thermal base layers (Beijing)', 'T-shirts', 'Long pants', 'Underwear', 'Socks', 'Warm jacket', 'Swimwear (Thailand)', 'Comfortable walking shoes', 'Rain jacket'],
      },
      {
        name: '🧴 Toiletries',
        items: ['Toothbrush & toothpaste', 'Shampoo & conditioner', 'Sunscreen (Thailand)', 'Deodorant', 'Razor', 'First aid kit', 'Prescription medication'],
      },
      {
        name: '🔌 Electronics',
        items: ['Phone charger', 'Travel adapter (Type A + I)', 'Power bank', 'Headphones', 'Camera', 'VPN set up before departure'],
      },
      {
        name: '💰 Finances',
        items: ['Credit card (no foreign fee)', 'Debit card', 'Some cash (CNY + THB)', 'Alipay set up', 'WeChat Pay set up'],
      },
      {
        name: '📱 Apps to Install',
        items: ['Alipay', 'WeChat', 'Didi (ride-hailing)', 'Metro apps per city', 'Google Maps offline', 'Maps.me', 'Translate app'],
      },
    ],
  },

  tips: [
    'HK → SZ is seamless — take the MTR East Rail to Futian or the high-speed rail',
    'Book the 816 nuclear plant day trip (Fuling) ahead — it is far from the city',
    'Beijing in December is cold (-8°C) but spectacular — pack thermal layers',
    'Christmas splits: one to Thailand, one to Dalian — book both outbound flights on 12/25',
    'Dalian in late December is well below freezing — thermals for that leg',
    'Two Disneyland days (1/2 and 1/4) need tickets bought in advance',
    'Universal Studios Beijing sells out in winter holidays — book 12/23 early',
    'Download Alipay and WeChat Pay before arrival',
    'Get a VPN set up before arriving in China',
    'Shanghai → Suzhou is a 25-minute high-speed train — no need to fly',
    'Shenzhen → Chongqing: compare the flight with the ~7 h high-speed train',
    'Harry Potter: Forbidden Forest (Longhua) is timed entry — reserve the slot',
    'Book the Hong Kong → Auckland flight early — 10 Jan is peak return season',
  ],
};

// ────────────────────────────────────────────────────────────
// Shared date helpers (planner, city pages, map)
// ────────────────────────────────────────────────────────────
const PLAN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PLAN_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function planDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return { dow: PLAN_DAYS[d.getDay()], day: d.getDate(), mon: PLAN_MONTHS[d.getMonth()], year: d.getFullYear() };
}

function planShortDate(dateStr) {
  const p = planDate(dateStr);
  return `${p.dow} ${p.day} ${p.mon}`;
}

function planDateRange(start, end) {
  if (start === end) return planShortDate(start);
  const a = planDate(start), b = planDate(end);
  return `${a.day} ${a.mon} – ${b.day} ${b.mon}`;
}

// One morning / afternoon / evening block of a day
function planSlot(label, icon, items) {
  const list = (items || []).filter(Boolean);
  if (!list.length) return '';
  return `
    <div class="plan-slot">
      <div class="plan-slot-label"><span>${icon}</span> ${label}</div>
      <ul>${list.map(i => `<li>${i}</li>`).join('')}</ul>
    </div>
  `;
}

// Get a leg by its id
function getCity(id) {
  return TRIP.cities.find(c => c.id === id);
}

// Get a destination page by its id
function getDestination(id) {
  return TRIP.destinations.find(d => d.id === id);
}

// Get the legs that belong to a destination
function legsForDestination(id) {
  return TRIP.cities.filter(c => c.destId === id);
}

// Get the planned days for a leg
function daysForLeg(legId) {
  return TRIP.days.filter(d => d.legId === legId);
}

// Get every planned day for a destination
function daysForDestination(id) {
  const legIds = legsForDestination(id).map(l => l.id);
  return TRIP.days.filter(d => legIds.includes(d.legId));
}

// Hotel helpers — bookings come from the 全部订单 export
function hotelsForLeg(legId) {
  return (TRIP.hotels || []).filter(h => (h.legIds || []).includes(legId));
}

function hotelForDate(date) {
  return (TRIP.hotels || []).find(h => date >= h.checkIn && date < h.checkOut) || null;
}

// Compact label for a night: hotel short name, or the pending-stay text
function hotelLabelForDate(date) {
  const h = hotelForDate(date);
  if (h) return h.short;
  return (TRIP.pendingStays || {})[date] || '未预订';
}

// Transport recommendation for a leg
function connectionForLeg(legId) {
  return (TRIP.connections || []).find(c => c.legId === legId) || null;
}

// Total nights away
function totalChinaNights() {
  return TRIP.cities.reduce((sum, c) => sum + c.nights, 0);
}

// Trip length in days (inclusive)
function totalTripDays() {
  const ms = new Date(TRIP.departure + 'T00:00:00') - new Date(TRIP.arrival + 'T00:00:00');
  return Math.round(ms / 86400000) + 1;
}
