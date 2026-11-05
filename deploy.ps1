# 국산차 공통 원본 -> 4개 GitHub Pages 저장소 배포
# 각 저장소의 기존 CNAME은 그대로 유지합니다.
# 아래 URL은 사용 중인 실제 GitHub 저장소 주소입니다.
$ErrorActionPreference = 'Stop'
$source = $PSScriptRoot

$repos = @(
    @{ Name = '국산차'; Url = 'https://github.com/autogenie4411-eng/agautoplan.git'; Title = '오토지니 KOREA | 국산차 장기렌트·리스 전 차종 비교'; Smartlog = $true },
    @{ Name = '구글용'; Url = 'https://github.com/autogenie4411-eng/kcar.git'; Title = '오토지니 KOREA G | 국산차 장기렌트·리스 전 차종 비교'; Smartlog = $false },
    @{ Name = '네이버카페용'; Url = 'https://github.com/autogenie4411-eng/cafenaver.git'; Title = '오토지니 KOREA | 국산차 장기렌트·리스 전 차종 비교'; Smartlog = $false },
    @{ Name = '네이버배너용'; Url = 'https://github.com/autogenie4411-eng/nkcar.git'; Title = '오토지니 KOREA N | 국산차 장기렌트·리스 전 차종 비교'; Smartlog = $false }
)

# PowerShell 5.1에서도 UTF-8로 읽고 쓰기
$utf8 = New-Object System.Text.UTF8Encoding($false)
$indexSource = Join-Path $source 'index.html'
if (-not (Test-Path -LiteralPath $indexSource)) { throw '원본 index.html이 없습니다. deploy.ps1을 사이트 최상위 폴더에 넣으세요.' }

$smartlogBlock = @'
  <!-- Smartlog -->
  <script type="text/javascript">
    var hpt_info={'_account':'UHPT-36258', '_server':'a30'};
  </script>
  <script language="javascript" src="//cdn.smlog.co.kr/core/smart.js" charset="utf-8"></script>
  <noscript><img src="//a30.smlog.co.kr/smart_bda.php?_account=36258" style="display:none;width:0;height:0;" border="0"/></noscript>
'@

# 마커부터 Smartlog noscript 끝까지 제거 (원본에 이미 들어 있는 코드 포함)
$smartlogPattern = '(?is)\s*<!--\s*Smartlog\s*-->\s*<script\b[^>]*>.*?</script>\s*<script\b[^>]*>.*?</script>\s*<noscript\b[^>]*>.*?</noscript>\s*'
$sourceHtml = [System.IO.File]::ReadAllText($indexSource, $utf8)
if ($sourceHtml -notmatch '(?is)<title\b[^>]*>.*?</title>') { throw 'index.html에 title 요소가 없습니다.' }
if ($sourceHtml -notmatch '(?is)<body\b[^>]*>') { throw 'index.html에 body 요소가 없습니다.' }
$hasKnownSmartlog = $sourceHtml -match $smartlogPattern
if (-not $hasKnownSmartlog) { throw '원본 index.html에서 기존 Smartlog 블록을 찾지 못했습니다. 예상치 못한 변경을 막기 위해 중단합니다.' }

foreach ($repo in $repos) {
    if ($repo.Url -match '사용자명|저장소' -or $repo.Url -notmatch '^https://github\.com/[^/]+/[^/]+(?:\.git)?$') {
        throw "[$($repo.Name)] 실제 GitHub 저장소 Url을 입력하세요: $($repo.Url)"
    }
}

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('agautoplan-deploy-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempRoot | Out-Null

try {
    foreach ($repo in $repos) {
        Write-Host "`n[$($repo.Name)] 배포 시작" -ForegroundColor Cyan
        $target = Join-Path $tempRoot ([guid]::NewGuid().ToString('N'))
        & git clone --quiet --depth 1 --branch main --single-branch $repo.Url $target
        if ($LASTEXITCODE -ne 0) { throw "[$($repo.Name)] git clone 실패" }

        $cname = Join-Path $target 'CNAME'
        if (-not (Test-Path -LiteralPath $cname)) {
            throw "[$($repo.Name)] 원격 저장소에 CNAME이 없습니다. 사이트별 도메인을 먼저 확인하세요."
        }
        $originalCname = [System.IO.File]::ReadAllBytes($cname)

        # CNAME, Git 메타데이터와 배포 스크립트는 복사하지 않습니다.
        # /E 사용: 원격에만 있는 파일은 삭제하지 않습니다.
        & robocopy $source $target /E /R:1 /W:1 /XF CNAME deploy.ps1 .env .env.* /XD .git .github .vscode node_modules
        if ($LASTEXITCODE -ge 8) { throw "[$($repo.Name)] robocopy 실패 (코드: $LASTEXITCODE)" }

        # index.html의 Smartlog와 제목은 저장소별로 생성합니다.
        $html = [regex]::Replace($sourceHtml, $smartlogPattern, "`r`n`r`n", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        $html = [regex]::Replace($html, '(?is)<title\b[^>]*>.*?</title>', ('<title>' + $repo.Title + '</title>'), [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        if ($repo.Smartlog) {
            $html = [regex]::Replace($html, '(?is)<body\b[^>]*>', ('$0' + "`r`n`r`n" + $smartlogBlock + "`r`n"), [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        }
        [System.IO.File]::WriteAllText((Join-Path $target 'index.html'), $html, $utf8)

        # 보호 확인: CNAME 바이트 자체가 바뀌었으면 배포하지 않습니다.
        $afterCname = [System.IO.File]::ReadAllBytes($cname)
        if (-not ([Convert]::ToBase64String($originalCname) -eq [Convert]::ToBase64String($afterCname))) {
            throw "[$($repo.Name)] CNAME 변경 감지. 배포를 중단합니다."
        }

        Push-Location $target
        try {
            & git add -A -- . ':!CNAME'
            if ($LASTEXITCODE -ne 0) { throw "[$($repo.Name)] git add 실패" }
            & git diff --cached --quiet
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[$($repo.Name)] 변경 없음 (CNAME 유지)" -ForegroundColor DarkGray
            } elseif ($LASTEXITCODE -eq 1) {
                & git commit -m 'Update common domestic-car site with site-specific title and Smartlog'
                if ($LASTEXITCODE -ne 0) { throw "[$($repo.Name)] commit 실패" }
                & git push origin main
                if ($LASTEXITCODE -ne 0) { throw "[$($repo.Name)] push 실패" }
                Write-Host "[$($repo.Name)] 배포 완료 (CNAME 유지)" -ForegroundColor Green
            } else {
                throw "[$($repo.Name)] git diff 실패"
            }
        } finally {
            Pop-Location
        }
    }
} finally {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}
