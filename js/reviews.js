(() => {
  const section = document.getElementById('reviewSection');
  const carousel = document.getElementById('reviewCarousel');
  const track = document.getElementById('reviewTrack');
  if (!section || !carousel || !track) return;

  const SOURCE = 'https://www.agautoplan.com/review';
  const READER_PREFIX = 'https://r.jina.ai/';
  const IMPORT_BRANDS = [
    '벤츠', '메르세데스', 'BMW', '비엠더블유', '아우디', '볼보', '폭스바겐',
    '포르쉐', '랜드로버', '레인지로버', '렉서스', '토요타', '도요타', '미니', 'MINI',
    '테슬라', '폴스타', '지프', '포드', '링컨', '캐딜락', '푸조', '마세라티',
    '람보르기니', '페라리', '벤틀리', '롤스로이스'
  ];

  const BRAND_ALIASES = [
    ['메르세데스-벤츠', ['메르세데스', '벤츠', 'mercedes', 'e200', 'e300', 'e450', 'gle', 'glc', 'gls', 'cla', 'cle', 'amg']],
    ['BMW', ['bmw', '비엠더블유']], ['아우디', ['아우디', 'audi']], ['볼보', ['볼보', 'volvo']],
    ['폭스바겐', ['폭스바겐', 'volkswagen']], ['포르쉐', ['포르쉐', 'porsche']],
    ['랜드로버', ['랜드로버', '레인지로버', 'land rover', 'range rover']], ['렉서스', ['렉서스', 'lexus']],
    ['토요타', ['토요타', '도요타', 'toyota']], ['MINI', ['mini', '미니']],
    ['테슬라', ['테슬라', 'tesla', 'model y', 'model 3', '모델 y', '모델y', '모델3']], ['폴스타', ['폴스타', 'polestar']],
    ['지프', ['지프', 'jeep']], ['포드', ['포드', 'ford']], ['링컨', ['링컨', 'lincoln']],
    ['캐딜락', ['캐딜락', 'cadillac']], ['푸조', ['푸조', 'peugeot']], ['마세라티', ['마세라티', 'maserati']],
    ['벤틀리', ['벤틀리', 'bentley']], ['롤스로이스', ['롤스로이스', 'rolls-royce', 'rolls royce']]
  ];

  const FALLBACK_REVIEWS = [
      {
          "id": "172466664",
          "title": "XC60 개인 리스 출고 후기입니다.",
          "brand": "볼보",
          "model": "볼보 XC60",
          "manager": "",
          "color": "",
          "method": "개인 / 리스",
          "date": "2026-07-15",
          "image": "",
          "url": "https://www.agautoplan.com/review/?bmode=view&idx=172466664"
      },
      {
          "id": "172230646",
          "title": "그랜저 개인 렌트 출고 후기입니다.",
          "brand": "현대",
          "model": "그랜저",
          "manager": "",
          "color": "",
          "method": "개인 / 렌트",
          "date": "2026-07-03",
          "image": "",
          "url": "https://www.agautoplan.com/review/?bmode=view&idx=172230646"
      },
      {
          "id": "172150868",
          "title": "테슬라 모델 Y 개인 리스 출고 후기입니다.",
          "brand": "테슬라",
          "model": "테슬라 모델 Y",
          "manager": "김진욱 차장",
          "color": "",
          "method": "개인 / 리스",
          "date": "2026-07-01",
          "image": "",
          "url": "https://www.agautoplan.com/review/?bmode=view&idx=172150868"
      },
      {
          "id": "172150863",
          "title": "GV70 EV 법인 렌트 출고 후기입니다.",
          "brand": "제네시스",
          "model": "GV70 EV",
          "manager": "정원상 차장",
          "color": "(외장) 우유니 화이트 / (내장) 바닐라 베이지 투톤",
          "method": "법인 / 렌트",
          "date": "2026-07-01",
          "image": "",
          "url": "https://www.agautoplan.com/review/?bmode=view&idx=172150863"
      },
      {
          "id": "172150866",
          "title": "모닝 개인사업자 렌트 출고 후기입니다.",
          "brand": "기아",
          "model": "모닝 가솔린 프레스티지",
          "manager": "엄세훈 차장",
          "color": "(외장) 스파클링 실버 / (내장) 브라운",
          "method": "개인사업자 / 렌트",
          "date": "2026-07-01",
          "image": "",
          "url": "https://www.agautoplan.com/review/?bmode=view&idx=172150866"
      },
      {
          "id": "172108171",
          "title": "EV3 개인 출고 후기입니다.",
          "brand": "기아",
          "model": "EV3 롱레인지 에어",
          "manager": "이병수 차장",
          "color": "(외장) 스노우 화이트펄 / (내장) 미디움그레이",
          "method": "개인",
          "date": "2026-06-26",
          "image": "",
          "url": "https://www.agautoplan.com/review/?bmode=view&idx=172108171"
      },
      {
          "id": "172108172",
          "title": "테슬라 모델 Y 법인 리스 출고 후기입니다.",
          "brand": "테슬라",
          "model": "모델YL",
          "manager": "박지석 팀장",
          "color": "(외장) 실버 / (내장) 젠그레이",
          "method": "법인 / 리스",
          "date": "2026-06-26",
          "image": "",
          "url": "https://www.agautoplan.com/review/?bmode=view&idx=172108172"
      },
      {
          "id": "172108179",
          "title": "그랜저 개인 출고 후기입니다.",
          "brand": "현대",
          "model": "그랜저 가솔린",
          "manager": "강호진 차장",
          "color": "(외장) 어비스블랙 / (내장) 인디고 브라운",
          "method": "개인",
          "date": "2026-06-24",
          "image": "",
          "url": "https://www.agautoplan.com/review/?bmode=view&idx=172108179"
      },
      {
          "id": "172108181",
          "title": "EV4 개인 출고 후기입니다.",
          "brand": "기아",
          "model": "EV4 GT라인",
          "manager": "강한석 차장",
          "color": "(외장) 모닝헤이즈 / (내장) 브라운",
          "method": "개인",
          "date": "2026-06-24",
          "image": "",
          "url": "https://www.agautoplan.com/review/?bmode=view&idx=172108181"
      },
      {
          "id": "171879616",
          "title": "XC60 렌트 출고 후기입니다.",
          "brand": "볼보",
          "model": "볼보 XC60",
          "manager": "정철희 차장",
          "color": "(외장) 크리스탈 화이트 / (내장) 아이보리",
          "method": "개인 / 렌트",
          "date": "2026-06-17",
          "image": "",
          "url": "https://www.agautoplan.com/review/?bmode=view&idx=171879616"
      },
      {
          "id": "171879625",
          "title": "EV4 렌트 출고 후기입니다.",
          "brand": "기아",
          "model": "EV4",
          "manager": "",
          "color": "",
          "method": "렌트",
          "date": "2026-06-17",
          "image": "",
          "url": "https://www.agautoplan.com/review/?bmode=view&idx=171879625"
      },
      {
          "id": "171879626",
          "title": "G80 리스 출고 후기입니다.",
          "brand": "제네시스",
          "model": "G80",
          "manager": "강호진 차장",
          "color": "(외장) 비크블랙 / (내장) 에크루 카멜 모노톤",
          "method": "개인사업자 / 리스",
          "date": "2026-06-17",
          "image": "",
          "url": "https://www.agautoplan.com/review/?bmode=view&idx=171879626"
      }
  ];

  const SWIPER_DELAY = 2200; // 한 카드가 머무는 시간(ms)
  const SWIPER_SPEED = 1000; // 옆으로 스르륵 넘어가는 시간(ms)
  const MAX_REVIEWS = 120;
  const RECENT_DAYS = 62;
  const MIN_LOCAL_REVIEWS = 20;
  const SOURCE_LIST_PAGES = 30;
  const SOURCE_MAX_DETAIL_FETCHES = 360;
  const SOURCE_CACHE_KEY = 'autogenie-all-reviews-weekly-v1';
  const SOURCE_CACHE_TTL = 30 * 60 * 1000;
  const LOCAL_FRESH_DAYS = 14; // 오래된 JSON을 최신 후기처럼 먼저 노출하지 않는다.

  let renderedReviews = [];
  let hiddenAfterBrandSelection = false;
  let sourceRefreshStarted = false;
  let reviewSwiper = null;

  const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  function cleanReviewTitle(value = '') {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^(?:\[?공지\]?|NOTICE)\s*[:：-]?\s*/i, '')
      .trim();
  }

  function detectBrand(text = '') {
    const lower = String(text).toLowerCase();
    for (const [label, keywords] of BRAND_ALIASES) {
      if (keywords.some(keyword => lower.includes(keyword.toLowerCase()))) return label;
    }
    return '';
  }

  const isImportReview = review => {
    const haystack = `${review.brand || ''} ${review.title || ''} ${review.model || ''}`.toLowerCase();
    return IMPORT_BRANDS.some(brand => haystack.includes(brand.toLowerCase())) || Boolean(detectBrand(haystack));
  };

  function parseReviewDate(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;
    let match = raw.match(/(\d{2,4})\s*[.\/-]\s*(\d{1,2})\s*[.\/-]\s*(\d{1,2})/);
    if (!match) match = raw.match(/(\d{2,4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
    if (!match) return null;
    let year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (year < 100) year += 2000;
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return null;
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
  }

  const reviewTimestamp = review => parseReviewDate(review?.date)?.getTime() || 0;

  function newestReviewTimestamp(items = []) {
    return (items || []).reduce((latest, review) => Math.max(latest, reviewTimestamp(review)), 0);
  }

  function hasFreshLocalReviews(items = []) {
    const latest = newestReviewTimestamp(items);
    if (!latest) return false;
    return latest >= Date.now() - LOCAL_FRESH_DAYS * 24 * 60 * 60 * 1000;
  }

  function showReviewLoading() {
    section.hidden = false;
    destroyReviewSwiper();
    track.innerHTML = `<article class="review-card review-card--loading">
      <div class="review-card__body">
        <strong>최신 출고 후기를 불러오는 중입니다.</strong>
        <p>오토지니 후기 게시판의 최신 글을 확인하고 있습니다.</p>
      </div>
    </article>`;
  }

  function reviewKey(review) {
    if (review?.id) return `id:${String(review.id)}`;
    const idx = String(review?.url || '').match(/[?&]idx=(\d+)/)?.[1];
    if (idx) return `id:${idx}`;
    if (review?.url) return `url:${String(review.url)}`;
    return `title:${String(review?.title || '')}|${String(review?.date || '')}`;
  }

  function formatReviewDate(value) {
    const date = parseReviewDate(value);
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  }

  function prepareReviews(items) {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - RECENT_DAYS);
    cutoff.setHours(0, 0, 0, 0);

    // GitHub Actions가 /review 게시판에서 수집한 순서를 그대로 사용한다.
    // 날짜로 다시 sort하지 않아 실제 후기 카테고리의 최신 → 과거 순서가 뒤섞이지 않는다.
    const prepared = (items || [])
      .filter(review => Boolean(review?.title))
      .map((review, inputOrder) => ({ ...review, _inputOrder: inputOrder, _timestamp: reviewTimestamp(review) }))
      .filter(review => review._timestamp >= cutoff.getTime())
      .sort((a, b) => {
        const ao = Number.isFinite(Number(a.sourceOrder)) ? Number(a.sourceOrder) : a._inputOrder;
        const bo = Number.isFinite(Number(b.sourceOrder)) ? Number(b.sourceOrder) : b._inputOrder;
        return ao - bo;
      });

    const seen = new Set();
    const unique = [];
    for (const review of prepared) {
      const key = reviewKey(review);
      if (seen.has(key)) continue;
      seen.add(key);
      const { _timestamp, _inputOrder, ...cleanReview } = review;
      unique.push(cleanReview);
      if (unique.length >= MAX_REVIEWS) break;
    }
    return unique;
  }

  function detailLines(review) {
    const lines = [];
    if (review.manager) lines.push(`💕💕 담당자 : ${review.manager} 💕💕`);
    if (review.model) lines.push(`차량 모델명 : ${review.model}`);
    if (review.color) lines.push(`색상 : ${review.color}`);
    if (review.method) lines.push(`진행 방식 : ${review.method}`);
    return lines.slice(0, 4);
  }

  function imageMarkup(review) {
    const primary = String(review.image || '').trim();
    if (!primary) {
      return `<div class="review-card__image review-card__image--empty" data-review-image-slot="${escapeHtml(review.id)}"><span>후기 이미지 준비 중</span></div>`;
    }
    return `<div class="review-card__image" data-review-image-slot="${escapeHtml(review.id)}">
      <img src="${escapeHtml(primary)}" alt="${escapeHtml(cleanReviewTitle(review.title))}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
    </div>`;
  }

  function cardTemplate(review) {
    const lines = detailLines(review);
    const formattedDate = formatReviewDate(review.date);
    return `<article class="swiper-slide review-card" data-review-id="${escapeHtml(review.id)}">
      <a class="review-card__link" href="${escapeHtml(review.url)}" target="_blank" rel="noopener noreferrer">
        ${imageMarkup(review)}
        <div class="review-card__body">
          <strong class="review-card__title">${escapeHtml(cleanReviewTitle(review.title))}</strong>
          ${formattedDate ? `<time class="review-card__date" datetime="${escapeHtml(review.date)}">${escapeHtml(formattedDate)}</time>` : ''}
          ${lines.length ? `<div class="review-card__details">${lines.map(line => `<p>${escapeHtml(line)}</p>`).join('')}</div>` : ''}
          <span class="review-card__cta">후기 보기</span>
        </div>
      </a>
    </article>`;
  }

  function destroyReviewSwiper() {
    if (!reviewSwiper) return;
    try { reviewSwiper.destroy(true, true); } catch {}
    reviewSwiper = null;
  }

  function initReviewSwiper() {
    destroyReviewSwiper();
    if (!renderedReviews.length || hiddenAfterBrandSelection) return;

    // Swiper가 외부 스크립트 로딩 문제로 없을 경우 카드 목록은 그대로 보이게 둔다.
    if (typeof window.Swiper !== 'function') {
      console.warn('Swiper를 불러오지 못해 후기 카드를 정적으로 표시합니다.');
      return;
    }

    const canMove = renderedReviews.length > 1;
    reviewSwiper = new window.Swiper(carousel, {
      slidesPerView: 'auto',
      spaceBetween: 14,
      slidesOffsetBefore: 26,
      slidesOffsetAfter: 26,
      loop: canMove,
      rewind: false,
      loopAdditionalSlides: 6,
      loopPreventsSliding: false,
      speed: SWIPER_SPEED,
      grabCursor: canMove,
      allowTouchMove: canMove,
      simulateTouch: true,
      followFinger: true,
      threshold: 3,
      touchRatio: 1,
      resistance: true,
      resistanceRatio: 0.72,
      shortSwipes: true,
      longSwipes: true,
      longSwipesRatio: 0.28,
      longSwipesMs: 220,
      watchSlidesProgress: true,
      observer: true,
      observeParents: true,
      autoplay: canMove ? {
        delay: SWIPER_DELAY,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
        waitForTransition: true,
        stopOnLastSlide: false
      } : false,
      breakpoints: {
        0: {
          spaceBetween: 10,
          slidesOffsetBefore: 14,
          slidesOffsetAfter: 14
        },
        561: {
          spaceBetween: 12,
          slidesOffsetBefore: 18,
          slidesOffsetAfter: 18
        },
        821: {
          spaceBetween: 14,
          slidesOffsetBefore: 26,
          slidesOffsetAfter: 26
        }
      },
      on: {
        init(swiper) {
          swiper.wrapperEl.style.setProperty('--review-swiper-speed', `${SWIPER_SPEED}ms`);
        }
      }
    });
  }

  function restoreReviewSection() {
    hiddenAfterBrandSelection = false;

    // 후기가 아직 로드되기 전이라면 loadReviews()가 이후 정상적으로 표시합니다.
    if (!renderedReviews.length) {
      section.hidden = false;
      return;
    }

    section.hidden = false;

    // 브랜드 선택 시 파괴했던 Swiper를 초기 화면으로 돌아올 때 다시 생성합니다.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initReviewSwiper();
        reviewSwiper?.slideToLoop?.(0, 0, false);
        reviewSwiper?.autoplay?.start?.();
      });
    });
  }

  function renderReviewList(items) {
    const reviews = prepareReviews(items);
    renderedReviews = reviews;


    if (hiddenAfterBrandSelection) {
      section.hidden = true;
      destroyReviewSwiper();
      return;
    }

    section.hidden = false;
    track.innerHTML = reviews.map(cardTemplate).join('');
    bindImageFallbacks();

    // DOM 크기가 계산된 다음 Swiper를 초기화해야 slidesPerView:auto가 정확하게 작동한다.
    requestAnimationFrame(() => requestAnimationFrame(initReviewSwiper));
  }

  function bindImageFallbacks() {
    track.querySelectorAll('.review-card__image img').forEach(img => {
      img.addEventListener('load', () => {
        img.closest('.review-card__image')?.classList.add('is-loaded');
      }, { once: true });

      img.addEventListener('error', () => {
        const slot = img.closest('.review-card__image');
        if (!slot) return;
        slot.classList.add('review-card__image--empty');
        slot.innerHTML = '<span>후기 이미지 준비 중</span>';
      }, { once: true });
    });
  }

  function extractIds(text = '') {
    const ids = new Set();
    const decoded = String(text).replace(/&amp;/g, '&').replace(/\\u0026/g, '&');
    for (const m of decoded.matchAll(/[?&]idx=(\d+)/g)) ids.add(m[1]);
    for (const m of decoded.matchAll(/idx%3D(\d+)/gi)) ids.add(m[1]);
    return [...ids];
  }

  function extractLabel(text, label) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = String(text).match(new RegExp(`${escaped}\\s*[:：]\\s*([^\\n]{1,180})`, 'i'));
    return match ? match[1].replace(/[*_#]/g, '').trim() : '';
  }

  function findTitle(text = '') {
    const lines = String(text).split(/\n+/).map(line => line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim());
    return lines.find(line => /출고\s*후기입니다\.?$/i.test(line)) || '';
  }

  function readerUrl(url) {
    return `${READER_PREFIX}${url}`;
  }

  // 실제 아임웹 목록 페이지는 page=N이 별도 쿼리로 붙는다.
  function baseBoardQuery() {
    return btoa(unescape(encodeURIComponent('a:1:{s:12:"keyword_type";s:3:"all";}')));
  }

  function sourceListUrl(pageNumber = 1) {
    const page = Math.max(1, Number(pageNumber) || 1);
    return `${SOURCE}/?page=${page}&q=${encodeURIComponent(baseBoardQuery())}&t=board`;
  }

  async function fetchText(url, timeoutMs = 9000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { cache: 'no-store', signal: controller.signal, headers: { Accept: 'text/plain,text/markdown,*/*' } });
      if (!response.ok) return '';
      return await response.text();
    } catch {
      return '';
    } finally {
      clearTimeout(timer);
    }
  }

  function parseSourceReview(id, text) {
    const title = findTitle(text);
    const dateMatch = String(text).match(/20\d{2}\s*[.\/-]\s*\d{1,2}\s*[.\/-]\s*\d{1,2}/) || String(text).match(/20\d{2}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일/);
    const date = dateMatch ? formatReviewDate(dateMatch[0]).replace(/\./g, '-') : '';
    const model = extractLabel(text, '차량 모델명') || title.replace(/\s*출고\s*후기입니다\.?$/i, '').trim();
    const brand = detectBrand(`${title}\n${model}\n${text}`);
    if (!title || !date) return null;
    return {
      id: String(id), title, brand, model,
      manager: extractLabel(text, '담당자'), color: extractLabel(text, '색상'), method: extractLabel(text, '진행 방식'),
      date, image: '', url: `${SOURCE}/?bmode=view&idx=${id}`
    };
  }

  function readSourceCache() {
    try {
      const raw = sessionStorage.getItem(SOURCE_CACHE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!parsed?.savedAt || Date.now() - parsed.savedAt > SOURCE_CACHE_TTL) return [];
      return Array.isArray(parsed.reviews) ? parsed.reviews : [];
    } catch {
      return [];
    }
  }

  function writeSourceCache(reviews) {
    try {
      sessionStorage.setItem(SOURCE_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), reviews }));
    } catch { /* storage 사용 불가 환경은 무시 */ }
  }

  async function discoverSourceReviews(seedItems = []) {
    const cached = prepareReviews(readSourceCache());
    if (cached.length >= MIN_LOCAL_REVIEWS) return cached;

    const ids = new Set();
    for (const review of seedItems) {
      const id = String(review?.id || review?.url?.match(/[?&]idx=(\d+)/)?.[1] || '');
      if (id) ids.add(id);
    }

    // 최신 1페이지부터 실제 아임웹 q 페이지네이션을 순서대로 읽는다.
    // 오래된 &page=N 주소를 사용하면 같은 과거 구간만 반복해서 읽는 문제가 생긴다.
    const listTasks = [];
    for (let page = 1; page <= SOURCE_LIST_PAGES; page += 1) {
      const fresh = `${sourceListUrl(page)}&review_sync=${Date.now()}_${page}`;
      listTasks.push(fetchText(readerUrl(fresh), 12000));
    }
    // 1페이지 스킨/리다이렉트 대응용 루트 주소도 한 번 확인한다.
    listTasks.push(fetchText(readerUrl(`${SOURCE}/?review_sync=${Date.now()}`), 12000));

    const listTexts = await Promise.all(listTasks);
    listTexts.forEach(text => extractIds(text).forEach(id => ids.add(id)));

    // ID가 적게 잡힌 경우, 이미 알고 있는 상세글에서 이전/다음 게시글 링크를 연쇄적으로 확장한다.
    const queue = [...ids].sort((a, b) => Number(b) - Number(a));
    const visited = new Set();
    const collected = new Map();
    let cursor = 0;

    while (cursor < queue.length && visited.size < SOURCE_MAX_DETAIL_FETCHES && collected.size < MAX_REVIEWS) {
      const batch = [];
      while (cursor < queue.length && batch.length < 5 && visited.size + batch.length < SOURCE_MAX_DETAIL_FETCHES) {
        const id = queue[cursor++];
        if (!id || visited.has(id)) continue;
        visited.add(id);
        batch.push(id);
      }
      if (!batch.length) continue;

      const pages = await Promise.all(batch.map(id => fetchText(readerUrl(`${SOURCE}/?bmode=view&idx=${id}&t=board`), 10000)));
      pages.forEach((text, index) => {
        const id = batch[index];
        if (!text) return;
        extractIds(text).forEach(linkedId => {
          if (!visited.has(linkedId) && !ids.has(linkedId)) {
            ids.add(linkedId);
            queue.push(linkedId);
          }
        });
        const parsed = parseSourceReview(id, text);
        if (parsed) collected.set(reviewKey(parsed), parsed);
      });
    }

    const merged = prepareReviews([...seedItems, ...collected.values()]);
    if (merged.length) writeSourceCache(merged);
    return merged;
  }

  async function refreshFromSource(localItems, renderLocalIfUnchanged = false) {
    if (sourceRefreshStarted) return;
    sourceRefreshStarted = true;
    try {
      const sourceReviews = await discoverSourceReviews(localItems);
      const merged = prepareReviews([...(localItems || []), ...sourceReviews]);
      const before = prepareReviews(localItems || []);
      const beforeSignature = before.slice(0, 8).map(item => `${item.id}:${item.date}`).join('|');
      const afterSignature = merged.slice(0, 8).map(item => `${item.id}:${item.date}`).join('|');

      // 개수가 같더라도 더 최신 글이 발견되면 반드시 다시 그린다.
      if (merged.length !== before.length || beforeSignature !== afterSignature) {
        renderReviewList(merged);
      } else if (renderLocalIfUnchanged && before.length) {
        renderReviewList(before);
      }
    } catch (error) {
      console.warn('오토지니 후기 원본 보충을 건너뜁니다.', error);
      if (renderLocalIfUnchanged) {
        const fallback = prepareReviews(localItems || []);
        if (fallback.length) renderReviewList(fallback);
      }
    }
  }

  async function loadReviews() {
    let localItems = [];
    try {
      const response = await fetch(`data/reviews.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      localItems = Array.isArray(payload) ? payload : payload.reviews || [];
    } catch (error) {
      console.warn('reviews.json을 불러오지 못했습니다.', error);
    }

    // GitHub Actions가 갱신한 reviews.json을 최우선으로 표시한다.
    // 다만 첫 배포/네트워크 오류/Actions 실행 전처럼 JSON을 읽지 못한 경우에도
    // 후기 영역 자체가 사라지지 않도록 기존 확보 후기(FALLBACK)를 즉시 표시한다.
    const localReviews = prepareReviews(localItems);
    const reviews = localReviews.length ? localReviews : prepareReviews(FALLBACK_REVIEWS);

    if (reviews.length) {
      renderReviewList(reviews);
    } else {
      section.hidden = false;
      destroyReviewSwiper();
      track.innerHTML = `<article class="review-card review-card--loading">
        <div class="review-card__body">
          <strong>출고 후기를 준비하고 있습니다.</strong>
          <p>다음 자동 갱신에서 최신 후기가 표시됩니다.</p>
        </div>
      </article>`;
    }
  }

  document.addEventListener('click', event => {
    const marketButton = event.target.closest?.('.segment-control[data-group="market"] button[data-value]');
    const searchVehicle = event.target.closest?.('[data-global-car]');
    if (!marketButton && !searchVehicle) return;
    hiddenAfterBrandSelection = true;
    section.hidden = true;
    if (reviewSwiper?.autoplay) reviewSwiper.autoplay.stop();
    destroyReviewSwiper();
  }, true);

  // 로고 클릭/처음부터 다시하기 등 견적이 초기 상태로 돌아가면 후기도 다시 노출한다.
  document.addEventListener('autogenie:wizard-reset', restoreReviewSection);

  // 탭이 다시 활성화됐을 때 자동재생이 자연스럽게 이어지도록 한다.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || hiddenAfterBrandSelection || !reviewSwiper?.autoplay) return;
    reviewSwiper.autoplay.start();
  });

  loadReviews();
})();
