<#
    Round Rock PM - zero-install local preview server for Windows.
    Serves the .\public folder on http://localhost:8080/ using only
    PowerShell (no Python, no Node). Press Ctrl+C in the window to stop.

    Run directly with:
        powershell -ExecutionPolicy Bypass -File preview.ps1
#>
param([int]$Port = 8080)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot 'public')).Path

$mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8';
  '.js'='application/javascript; charset=utf-8'; '.json'='application/json; charset=utf-8';
  '.svg'='image/svg+xml'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg';
  '.webp'='image/webp'; '.ico'='image/x-icon'; '.txt'='text/plain; charset=utf-8';
  '.xml'='application/xml; charset=utf-8'; '.csv'='text/csv; charset=utf-8';
  '.woff'='font/woff'; '.woff2'='font/woff2'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try {
  $listener.Start()
} catch {
  Write-Host "Could not open port $Port. Another program may be using it." -ForegroundColor Red
  Write-Host "Try:  powershell -ExecutionPolicy Bypass -File preview.ps1 -Port 8090"
  exit 1
}

Write-Host ""
Write-Host "  Round Rock PM preview running at http://localhost:$Port/" -ForegroundColor Green
Write-Host "  Serving: $root"
Write-Host "  Press Ctrl+C to stop."
Write-Host ""
Start-Process "http://localhost:$Port/"

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($rel -eq '/') { $rel = '/index.html' }

    $file = Join-Path $root ($rel.TrimStart('/') -replace '/', '\')
    if (-not (Test-Path -LiteralPath $file -PathType Leaf) -and
             (Test-Path -LiteralPath "$file.html" -PathType Leaf)) { $file = "$file.html" }

    $status = 200
    if (Test-Path -LiteralPath $file -PathType Leaf) {
      # keep requests inside the public folder
      $full = (Resolve-Path -LiteralPath $file).Path
      if (-not $full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
        $full = Join-Path $root '404.html'; $status = 403
      }
    } else {
      $full = Join-Path $root '404.html'; $status = 404
    }

    $bytes = [System.IO.File]::ReadAllBytes($full)
    $ext = [System.IO.Path]::GetExtension($full).ToLower()
    $ctx.Response.StatusCode  = $status
    $ctx.Response.ContentType = $(if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' })
    $ctx.Response.Headers.Add('Cache-Control', 'no-store')
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    Write-Host ("  {0}  {1}" -f $status, $rel)
  } catch {
    # a browser that hangs up mid-request should not kill the server
  } finally {
    if ($ctx) { try { $ctx.Response.Close() } catch {} }
  }
}
