# 국산차 공통 원본 -> 4개 GitHub Pages 저장소 선택 배포
# 각 저장소의 기존 CNAME은 그대로 유지합니다.
# 아래 URL은 사용 중인 실제 GitHub 저장소 주소입니다.
param(
    [string[]]$Targets,
    [switch]$Preview
)

$ErrorActionPreference = 'Stop' 
$source = $PSScriptRoot

$repos = @(
    @{ Key = 'main'; Name = '국산차'; Url = 'https://github.com/autogenie4411-eng/agautoplan.git' },
    @{ Key = 'google'; Name = '구글용'; Url = 'https://github.com/autogenie4411-eng/kcar.git' },
    @{ Key = 'naver-cafe'; Name = '네이버카페용'; Url = 'https://github.com/autogenie4411-eng/cafenaver.git' },
    @{ Key = 'naver-banner'; Name = '네이버배너용'; Url = 'https://github.com/autogenie4411-eng/nkcar.git' }
)

# -Targets 인수가 없으면 체크박스 창을 띄웁니다.
# 사용 예: -Targets main,naver-banner / -Targets all / -Targets main -Preview
function Select-TargetsInConsole {
    param([array]$RepoList)

    Write-Host "`n[국산차] 배포할 사이트 번호를 선택하세요." -ForegroundColor Cyan
    for ($i = 0; $i -lt $RepoList.Count; $i++) {
        Write-Host ("  {0}. {1}" -f ($i + 1), $RepoList[$i].Name)
    }
    Write-Host '  A. 전체 선택' 
    Write-Host '  Q. 취소'

    while ($true) {
        $answer = Read-Host '번호를 입력하세요 (예: 1,4)'
        if ($null -eq $answer) { return }
        if ($answer.Trim() -match '^(?i:q|quit|cancel)$') { return }
        if ($answer.Trim() -match '^(?i:a|all)$') {
            return ($RepoList | ForEach-Object { $_.Key })
        }

        $numbers = @($answer -split '[,;\s]+' | Where-Object { $_ })
        $picked = New-Object 'System.Collections.Generic.List[string]'
        $valid = ($numbers.Count -gt 0)
        foreach ($number in $numbers) {
            $index = 0
            if (-not [int]::TryParse($number, [ref]$index) -or $index -lt 1 -or $index -gt $RepoList.Count) {
                $valid = $false
                break
            }
            $key = [string]$RepoList[$index - 1].Key
            if (-not $picked.Contains($key)) { [void]$picked.Add($key) }
        }
        if ($valid -and $picked.Count -gt 0) { return $picked.ToArray() }
        Write-Warning '올바른 번호를 입력하세요. (예: 1,4)'
    }
}

function Select-TargetsInWindow {
    param([array]$RepoList)
    $form = $null
    try {
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction Stop
        Add-Type -AssemblyName System.Drawing -ErrorAction Stop
        [System.Windows.Forms.Application]::EnableVisualStyles()

        $form = New-Object System.Windows.Forms.Form
        $form.Text = '오토지니 국산차 - GitHub 선택 배포'
        $form.ClientSize = [System.Drawing.Size]::new(470, 385)
        $form.StartPosition = 'CenterScreen'
        $form.FormBorderStyle = 'FixedDialog'
        $form.MaximizeBox = $false
        $form.MinimizeBox = $false
        $form.Font = [System.Drawing.Font]::new('Malgun Gothic', 10)

        $heading = New-Object System.Windows.Forms.Label
        $heading.Text = '배포할 사이트를 체크하세요.'
        $heading.AutoSize = $true
        $heading.Location = [System.Drawing.Point]::new(24, 22)
        $form.Controls.Add($heading)

        $helper = New-Object System.Windows.Forms.Label
        $helper.Text = '선택하지 않은 저장소는 복사·커밋·Push하지 않습니다.'
        $helper.AutoSize = $true
        $helper.ForeColor = [System.Drawing.Color]::DimGray
        $helper.Location = [System.Drawing.Point]::new(24, 50)
        $form.Controls.Add($helper)

        $checkBoxes = New-Object System.Collections.ArrayList
        for ($i = 0; $i -lt $RepoList.Count; $i++) {
            $cb = New-Object System.Windows.Forms.CheckBox
            $cb.Text = ('{0}. {1}' -f ($i + 1), $RepoList[$i].Name)
            $cb.Tag = [string]$RepoList[$i].Key
            $cb.AutoSize = $false
            $cb.Size = [System.Drawing.Size]::new(410, 34)
            $cb.Location = [System.Drawing.Point]::new(30, (82 + 42 * $i))
            $cb.Checked = $false
            [void]$checkBoxes.Add($cb)
            $form.Controls.Add($cb)
        }

        $allButton = New-Object System.Windows.Forms.Button
        $allButton.Text = '전체 선택'
        $allButton.Size = [System.Drawing.Size]::new(100, 34)
        $allButton.Location = [System.Drawing.Point]::new(24, 264)
        $allButton.Add_Click({ foreach ($cb in $checkBoxes) { $cb.Checked = $true } })
        $form.Controls.Add($allButton)

        $clearButton = New-Object System.Windows.Forms.Button
        $clearButton.Text = '선택 해제'
        $clearButton.Size = [System.Drawing.Size]::new(100, 34)
        $clearButton.Location = [System.Drawing.Point]::new(134, 264)
        $clearButton.Add_Click({ foreach ($cb in $checkBoxes) { $cb.Checked = $false } })
        $form.Controls.Add($clearButton)

        $deployButton = New-Object System.Windows.Forms.Button
        $deployButton.Text = $(if ($Preview) { '미리보기' } else { '선택한 사이트 배포' })
        $deployButton.Size = [System.Drawing.Size]::new(175, 42)
        $deployButton.Location = [System.Drawing.Point]::new(171, 325)
        $deployButton.BackColor = [System.Drawing.Color]::FromArgb(50, 107, 250)
        $deployButton.ForeColor = [System.Drawing.Color]::White
        $deployButton.FlatStyle = 'Flat'
        $deployButton.Add_Click({
            $keys = @($checkBoxes | Where-Object { $_.Checked } | ForEach-Object { [string]$_.Tag })
            if ($keys.Count -eq 0) {
                [void][System.Windows.Forms.MessageBox]::Show('배포할 사이트를 하나 이상 선택하세요.', '안내')
                return
            }
            $names = @($RepoList | Where-Object { $keys -contains $_.Key } | ForEach-Object { $_.Name })
            $action = $(if ($Preview) { '변경사항을 미리 확인하시겠습니까?' } else { '선택한 저장소에 실제 Push하시겠습니까?' })
            $question = ($names -join "`r`n") + "`r`n`r`n" + $action
            $decision = [System.Windows.Forms.MessageBox]::Show(
                $question, '배포 대상 확인',
                [System.Windows.Forms.MessageBoxButtons]::YesNo,
                [System.Windows.Forms.MessageBoxIcon]::Question
            )
            if ($decision -eq [System.Windows.Forms.DialogResult]::Yes) {
                $form.Tag = $keys
                $form.DialogResult = [System.Windows.Forms.DialogResult]::OK
                $form.Close()
            }
        })
        $form.Controls.Add($deployButton)
        $form.AcceptButton = $deployButton

        $cancelButton = New-Object System.Windows.Forms.Button
        $cancelButton.Text = '취소'
        $cancelButton.Size = [System.Drawing.Size]::new(100, 42)
        $cancelButton.Location = [System.Drawing.Point]::new(352, 325)
        $cancelButton.Add_Click({ $form.DialogResult = [System.Windows.Forms.DialogResult]::Cancel; $form.Close() })
        $form.Controls.Add($cancelButton)
        $form.CancelButton = $cancelButton

        $result = $form.ShowDialog()
        if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
            return @($form.Tag)
        }
        return
    } catch {
        Write-Warning "체크박스 창을 열지 못해 숫자 입력 방식으로 전환합니다: $($_.Exception.Message)"
        return (Select-TargetsInConsole -RepoList $RepoList)
    } finally {
        if ($null -ne $form) { $form.Dispose() }
    }
}

$knownKeys = @($repos | ForEach-Object { [string]$_.Key })
if ($PSBoundParameters.ContainsKey('Targets')) {
    $inputKeys = @($Targets | ForEach-Object { $_ -split '[,;\s]+' } | Where-Object { $_ } | ForEach-Object { $_.Trim().ToLowerInvariant() })
    if ($inputKeys.Count -eq 0) { throw '배포할 대상이 없습니다. -Targets main,naver-banner 또는 -Targets all로 지정하세요.' }
    $unknown = @($inputKeys | Where-Object { $_ -ne 'all' -and $_ -notin $knownKeys })
    if ($unknown.Count -gt 0) { throw "알 수 없는 배포 대상: $($unknown -join ', '). 사용 가능: $($knownKeys -join ', '), all" }
    if ('all' -in $inputKeys) { $selectedKeys = $knownKeys }
    else { $selectedKeys = @($knownKeys | Where-Object { $_ -in $inputKeys }) }
} else {
    $selectedKeys = @(Select-TargetsInWindow -RepoList $repos)
}
if ($selectedKeys.Count -eq 0) {
    Write-Host '배포가 취소되었습니다. 저장소에 변경사항이 없습니다.' -ForegroundColor DarkYellow
    return
}
$repos = @($repos | Where-Object { $_.Key -in $selectedKeys })
Write-Host "`n선택된 배포 대상: $($repos.Name -join ', ')" -ForegroundColor Cyan
if ($Preview) { Write-Host '[미리보기 모드] 변경사항만 확인하고 커밋/Push하지 않습니다.' -ForegroundColor Yellow }

# PowerShell 5.1에서도 UTF-8로 읽고 쓰기
$utf8 = New-Object System.Text.UTF8Encoding($false)
$indexSource = Join-Path $source 'index.html'
if (-not (Test-Path -LiteralPath $indexSource)) { throw '원본 index.html이 없습니다. deploy.ps1을 사이트 최상위 폴더에 넣으세요.' }

# 원본 HTML의 title 태그 개수를 먼저 확인합니다.
$sourceHtml = [System.IO.File]::ReadAllText($indexSource, $utf8)
$titlePattern = '(?is)<title\b[^>]*>.*?</title>'
$sourceTitleMatches = [regex]::Matches($sourceHtml, $titlePattern)
if ($sourceTitleMatches.Count -ne 1) {
    throw "원본 index.html의 title 태그가 정확히 1개여야 합니다. 현재 $($sourceTitleMatches.Count)개입니다."
}

foreach ($repo in $repos) {
    if ($repo.Url -match '사용자명|저장소' -or $repo.Url -notmatch '^https://github\.com/[^/]+/[^/]+(?:\.git)?$') {
        throw "[$($repo.Name)] 실제 GitHub 저장소 Url을 입력하세요: $($repo.Url)"
    }
}

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('agautoplan-deploy-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null

try {
    foreach ($repo in $repos) {
        Write-Host "`n[$($repo.Name)] 배포 시작" -ForegroundColor Cyan
        $target = Join-Path $tempRoot ([guid]::NewGuid().ToString('N'))
        & git clone --quiet --depth 1 --branch main --single-branch -- $repo.Url $target
        if ($LASTEXITCODE -ne 0) { throw "[$($repo.Name)] 저장소 복제 실패" }

        $cnamePath = Join-Path $target 'CNAME'
        if (-not (Test-Path -LiteralPath $cnamePath)) {
            throw "[$($repo.Name)] 원격 저장소에 CNAME이 없습니다. 도메인 설정을 확인하세요."
        }
        # GitHub에 이미 올라간 CNAME을 바이트 단위로 보관합니다.
        $originalCname = [System.IO.File]::ReadAllBytes($cnamePath)

        # 제목도 원격 저장소의 기존 title 태그를 있는 그대로 보관합니다.
        $indexPath = Join-Path $target 'index.html'
        if (-not (Test-Path -LiteralPath $indexPath)) {
            throw "[$($repo.Name)] 원격 저장소에 index.html이 없습니다."
        }
        $originalHtml = [System.IO.File]::ReadAllText($indexPath, $utf8)
        $remoteTitles = [regex]::Matches($originalHtml, $titlePattern)
        if ($remoteTitles.Count -ne 1) {
            throw "[$($repo.Name)] 기존 index.html의 title 태그가 정확히 1개여야 합니다. 현재 $($remoteTitles.Count)개입니다."
        }
        $preservedTitleTag = $remoteTitles[0].Value

        # 공통 원본의 HTML/CSS/JS 및 추적 소스를 선택한 저장소에 그대로 덮어씁니다.
        # Smartlog 등 특정 소스를 사이트별로 추가하거나 제거하지 않습니다.
        # 단, CNAME/배포 도구/.git/각 저장소의 GitHub Actions는 유지합니다.
        # /E는 원격에만 있는 파일을 자동 삭제하지 않습니다.
        & robocopy $source $target /E /R:1 /W:1 /XF CNAME deploy.ps1 .env .env.* /XD .git .github .vscode node_modules
        if ($LASTEXITCODE -ge 8) { throw "[$($repo.Name)] 파일 복사 실패 (robocopy exit $LASTEXITCODE)" }

        # 원본 HTML을 사용하되 <title> 태그만 원격 저장소의 기존 값으로 복원합니다.
        # MatchEvaluator 사용으로 특수문자가 포함된 제목도 안전하게 보존합니다.
        $html = [regex]::Replace(
            $sourceHtml,
            $titlePattern,
            [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $preservedTitleTag }
        )
        [System.IO.File]::WriteAllText($indexPath, $html, $utf8)

        # 배포 시 title/CNAME이 변경되지 않았는지 확인합니다.
        $afterTitleMatches = [regex]::Matches([System.IO.File]::ReadAllText($indexPath, $utf8), $titlePattern)
        if ($afterTitleMatches.Count -ne 1 -or $afterTitleMatches[0].Value -cne $preservedTitleTag) {
            throw "[$($repo.Name)] title 변경 감지. 배포를 중단합니다."
        }
        $afterCname = [System.IO.File]::ReadAllBytes($cnamePath)
        if ([Convert]::ToBase64String($originalCname) -cne [Convert]::ToBase64String($afterCname)) {
            throw "[$($repo.Name)] CNAME 변경 감지. 배포를 중단합니다."
        }

        Push-Location $target
        try {
            # CNAME은 스테이징에서도 제외해 배포 커밋에 포함시키지 않습니다.
            & git add -A -- . ':!CNAME'
            if ($LASTEXITCODE -ne 0) { throw "[$($repo.Name)] git add 실패" }
            & git diff --cached --quiet
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[$($repo.Name)] 변경사항 없음 (CNAME/title 유지)" -ForegroundColor DarkGray
                continue
            }
            if ($LASTEXITCODE -ne 1) { throw "[$($repo.Name)] 변경사항 확인 실패" }

            Write-Host "[$($repo.Name)] 변경된 파일 목록:" -ForegroundColor Cyan
            & git diff --cached --name-status
            if ($LASTEXITCODE -ne 0) { throw "[$($repo.Name)] 파일 목록 확인 실패" }
            & git diff --cached --stat
            if ($LASTEXITCODE -ne 0) { throw "[$($repo.Name)] 변경사항 통계 확인 실패" }
            if ($Preview) {
                Write-Host "[$($repo.Name)] 미리보기 완료 (커밋/Push 없음)" -ForegroundColor Yellow
                continue
            }

            & git commit -m 'Update common domestic-car source (preserve CNAME and title)'
            if ($LASTEXITCODE -ne 0) { throw "[$($repo.Name)] Git 커밋 실패" }
            & git push origin main
            if ($LASTEXITCODE -ne 0) { throw "[$($repo.Name)] GitHub Push 실패" }
            Write-Host "[$($repo.Name)] 배포 완료 (CNAME/title 유지, 기타 공통 코드 동기화)" -ForegroundColor Green
        } finally {
            Pop-Location
        }
    }
} finally {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}
