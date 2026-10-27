/* 오토지니 국산차 — 광고 유입 분류. 개인정보/전화번호를 GA4에 보내지 않습니다. */
(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  const clean = (value, size=120) => String(value || '').trim().slice(0,size);
  const host = (() => { try { return new URL(document.referrer).hostname.toLowerCase(); } catch (_) { return ''; } })();
  const sourceParam = clean(params.get('utm_source'),50).toLowerCase();
  const mediumParam = clean(params.get('utm_medium'),50).toLowerCase();
  const nQuery = clean(params.get('n_query'));
  const refQuery = (() => {try { const r = new URL(document.referrer); return clean(r.searchParams.get('query') || r.searchParams.get('q')); } catch (_) {return '';} })();
  const naverRef = /(^|\.)naver\.com$/.test(host);
  const googleRef = /(^|\.)google\./.test(host);
  const googleClick = params.has('gclid') || params.has('gbraid') || params.has('wbraid');
  const naverClick = params.has('n_keyword') || params.has('n_campaign') || params.has('n_ad') || Boolean(nQuery);
  const source = sourceParam || (googleClick ? 'google' : (naverClick || naverRef ? 'naver' : googleRef ? 'google' : host ? 'referral' : 'direct'));
  const medium = mediumParam || (googleClick || naverClick ? 'cpc' : (naverRef || googleRef ? 'organic' : host ? 'referral' : 'none'));
  const paid = /^(cpc|ppc|paid|paidsearch|display|cpm)$/.test(medium);
  // n_query는 네이버가 제공한 실제 검색어, utm_term/n_keyword는 광고 등록 키워드일 수 있음.
  const searchTerm = nQuery || (!paid ? refQuery : '');
  const keyword = clean(params.get('utm_term') || params.get('n_keyword'));
  const data = Object.freeze({ source, medium, searchTerm, keyword, searchTermType: nQuery ? 'naver_n_query' : searchTerm ? 'referrer_query' : 'unavailable', campaign:clean(params.get('utm_campaign'),80), landingPage:location.pathname });
  try {
    // 광고 정보가 없는 내부 이동/재방문이면 마지막 랜딩 세션 값을 사용합니다.
    const hasSignal = !!(sourceParam || mediumParam || naverClick || googleClick || host);
    const previous = JSON.parse(sessionStorage.getItem('autogenie_attribution_v1') || 'null');
    window.autogenieAttribution = (!hasSignal && previous) ? previous : data;
    sessionStorage.setItem('autogenie_attribution_v1',JSON.stringify(window.autogenieAttribution));
  } catch (_) { window.autogenieAttribution = data; }
  function ga(eventName) {
    if (typeof window.gtag !== 'function') return;
    const a = window.autogenieAttribution;
    window.gtag('event',eventName, {
      traffic_source_name:a.source, traffic_medium_name:a.medium,
      traffic_search_term:a.searchTerm || '(미확인)',
      traffic_keyword:a.keyword || '(미확인)',
      traffic_term_type:a.searchTermType,
      traffic_campaign_name:a.campaign || '(없음)'
    });
  }
  window.autogenieTrackQuoteAttempt = () => ga('autogenie_quote_submit_attempt');
  ga('autogenie_traffic_entry');
})();
