# 推送前的隐私检查：扫描 git 将要提交的所有文件，发现密钥 / 本机用户路径 / 手机号 / 邮箱 / 私人词就报错。
#   powershell -ExecutionPolicy Bypass -File scripts\check-privacy.ps1
# 私人词（名字、私人目录名、课程名…）写在 scripts\privacy-words.local.txt，一行一个；这个文件不会被提交。
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Push-Location $root
try {
  [Console]::OutputEncoding = New-Object Text.UTF8Encoding $false # 中文文件名
  $files = @(git -c core.quotepath=false ls-files --cached --others --exclude-standard) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }
  $rules = [ordered]@{
    '本机用户目录'   = '[A-Za-z]:\\{1,2}Users\\{1,2}(?!你的用户名|<)[^\\\s"''`<>]+'
    'API 密钥'       = 'sk-[A-Za-z0-9_\-]{20,}|sk-ant-[A-Za-z0-9_\-]{10,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|xox[bpas]-[A-Za-z0-9\-]{10,}|AIza[0-9A-Za-z_\-]{30,}'
    '私钥'           = '-----BEGIN [A-Z ]*PRIVATE KEY-----'
    '登录 Cookie'    = '(SESSDATA|bili_jct|DedeUserID)\s*[=:]\s*[A-Za-z0-9%]{8,}'
    'Bearer 令牌'    = 'Bearer\s+[A-Za-z0-9\-_.=]{24,}'
    '手机号'         = '(?<![\d.])1[3-9]\d{9}(?![\d.])'
    '邮箱'           = '[A-Za-z0-9._%+\-]+@(?!users\.noreply\.github\.com|example\.com)[A-Za-z0-9\-]+\.[A-Za-z0-9.\-]*[A-Za-z]{2,}'
    '课程回放地址'   = 'polyv\.cn/watch/\d+|playBackVid=[0-9a-f]{8,}'
  }
  $wordsFile = Join-Path $root 'scripts\privacy-words.local.txt'
  if (Test-Path $wordsFile) {
    $words = Get-Content -LiteralPath $wordsFile -Encoding UTF8 | Where-Object { $_.Trim() -and -not $_.StartsWith('#') } | ForEach-Object { [regex]::Escape($_.Trim()) }
    if ($words) { $rules['私人词'] = ($words -join '|') }
  } else {
    Write-Host '提示：没有 scripts\privacy-words.local.txt，只做通用检查（名字、私人目录名不会被查）。' -ForegroundColor Yellow
  }
  $self = 'scripts/check-privacy.ps1'
  $hits = 0
  foreach ($f in $files) {
    $item = Get-Item -LiteralPath $f
    if ($item.Length -gt 5MB) { Write-Host "[文件太大] $f  $([math]::Round($item.Length / 1MB, 1)) MB" -ForegroundColor Red; $hits++ }
    if ($f -match '\.(ico|png|jpg|jpeg|gif|webp|onnx|woff2?)$') { continue }
    $n = 0
    foreach ($line in [IO.File]::ReadAllLines($item.FullName)) {
      $n++
      foreach ($k in $rules.Keys) {
        if ($f -eq $self -and $k -ne '私人词') { continue } # 规则本身就写在这个文件里
        $m = [regex]::Match($line, $rules[$k], 'IgnoreCase')
        if ($m.Success) {
          Write-Host ("[{0}] {1}:{2}  {3}" -f $k, $f, $n, $m.Value) -ForegroundColor Red
          $hits++
        }
      }
    }
  }
  Write-Host ''
  if ($hits) { Write-Host "发现 $hits 处，改掉再提交。" -ForegroundColor Red; exit 1 }
  Write-Host "检查了 $($files.Count) 个文件，没有发现问题。" -ForegroundColor Green
  exit 0
} finally { Pop-Location }
