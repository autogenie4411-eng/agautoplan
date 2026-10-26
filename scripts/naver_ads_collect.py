"""네이버 검색광고 등록 키워드별 최근 7일 성과 수집 (읽기 전용)."""
import base64
import csv
import hashlib
import hmac
import json
import os
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE_URL = 'https://api.searchad.naver.com'
KST = timezone(timedelta(hours=9))
FIELDS = ['impCnt', 'clkCnt', 'salesAmt', 'ctr', 'cpc', 'ccnt']


def require(name):
    result = os.getenv(name, '').strip()
    if not result:
        raise RuntimeError(f'필수 GitHub Secret 누락: {name}')
    return result


class NaverAds:
    def __init__(self):
        self.key = require('NAVER_API_KEY')
        self.secret = require('NAVER_SECRET_KEY')
        self.customer = require('NAVER_CUSTOMER_ID')
        self.session = requests.Session()
        retry = Retry(total=4, backoff_factor=1.5, status_forcelist=[429, 500, 502, 503, 504], allowed_methods=['GET'])
        self.session.mount('https://', HTTPAdapter(max_retries=retry))

    def get(self, path, params=None):
        timestamp = str(int(time.time() * 1000))
        signature_data = f'{timestamp}.GET.{path}'.encode('utf-8')
        signature = base64.b64encode(hmac.new(self.secret.encode('utf-8'), signature_data, hashlib.sha256).digest()).decode('ascii')
        headers = {
            'X-Timestamp': timestamp,
            'X-API-KEY': self.key,
            'X-Customer': self.customer,
            'X-Signature': signature,
            'Content-Type': 'application/json; charset=UTF-8',
        }
        response = self.session.get(BASE_URL + path, params=params, headers=headers, timeout=35)
        if not response.ok:
            # Do not print body; avoid exposing account information.
            raise RuntimeError(f'네이버 API 요청 실패: {path} (HTTP {response.status_code})')
        return response.json()


def split(items, batch_size):
    for start in range(0, len(items), batch_size):
        yield items[start:start+batch_size]


def number(v):
    try:
        return float(v or 0)
    except (TypeError, ValueError):
        return 0.0


def main():
    api = NaverAds()
    now = datetime.now(KST)
    until = (now - timedelta(days=1)).date()
    since = until - timedelta(days=6)
    campaigns = api.get('/ncc/campaigns')
    groups = api.get('/ncc/adgroups')
    if not isinstance(campaigns, list) or not isinstance(groups, list):
        raise RuntimeError('캠페인 또는 광고그룹 목록 응답 형식이 예상과 다릅니다.')
    campaign_by_id = {x.get('nccCampaignId'): x.get('name', '') for x in campaigns}
    group_by_id = {x.get('nccAdgroupId'): x for x in groups}
    keywords = []
    for group in groups:
        group_id = group.get('nccAdgroupId')
        if not group_id:
            continue
        result = api.get('/ncc/keywords', {'nccAdgroupId': group_id})
        if not isinstance(result, list):
            raise RuntimeError('키워드 목록 응답 형식이 예상과 다릅니다.')
        keywords.extend(result)
        time.sleep(0.12)
    kw_by_id = {kw['nccKeywordId']: kw for kw in keywords if kw.get('nccKeywordId')}
    ids = list(kw_by_id)
    stats_by_id = {}
    for batch in split(ids, 100):
        results = api.get('/stats', {
            'ids': batch,
            'fields': json.dumps(FIELDS, separators=(',', ':')),
            'timeRange': json.dumps({'since': str(since), 'until': str(until)}, separators=(',', ':')),
        })
        if not isinstance(results, list):
            raise RuntimeError('키워드 통계 응답 형식이 예상과 다릅니다.')
        for item in results:
            if isinstance(item, dict) and item.get('id'):
                stats_by_id[item['id']] = item.get('stat', {})
        time.sleep(0.2)

    rows = []
    for keyword_id, kw in kw_by_id.items():
        gid = kw.get('nccAdgroupId')
        group = group_by_id.get(gid, {})
        stat = stats_by_id.get(keyword_id, {})
        impressions = number(stat.get('impCnt'))
        clicks = number(stat.get('clkCnt'))
        cost = number(stat.get('salesAmt'))
        rows.append({
            'keyword': kw.get('keyword', ''),
            'keyword_id': keyword_id,
            'campaign': campaign_by_id.get(group.get('nccCampaignId'), ''),
            'adgroup': group.get('name', ''),
            'impressions': int(impressions),
            'clicks': int(clicks),
            'ctr_percent': round(clicks / impressions * 100, 2) if impressions else 0,
            'average_cpc_krw': round(cost / clicks, 2) if clicks else 0,
            'cost_krw': round(cost, 2),
            'conversions': number(stat.get('ccnt')),
        })
    rows.sort(key=lambda x: (x['clicks'], x['impressions']), reverse=True)
    out = Path('output')
    out.mkdir(exist_ok=True)
    fields = ['keyword', 'keyword_id', 'campaign', 'adgroup', 'impressions', 'clicks', 'ctr_percent', 'average_cpc_krw', 'cost_krw', 'conversions']
    with (out/'keyword_performance.csv').open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    metadata = {
        'collected_at_kst': now.isoformat(),
        'date_range': {'since': str(since), 'until': str(until)},
        'note': '최근 7일 합계. 네이버 보고서 집계 지연 가능. 실제 검색어 보고서가 아닌 등록 광고 키워드 성과.',
        'count': len(rows), 'keywords': rows,
    }
    (out/'keyword_performance.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'완료: {len(rows)}개 등록 키워드, {since} ~ {until} (KST)')


if __name__ == '__main__':
    main()
