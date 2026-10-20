# Optional local server: needed for auto read/write of profile.json, and for phone access.
# Usage: powershell -ExecutionPolicy Bypass -File .\run-server.ps1
# Phone: http://<PC-IP>:7788
$port = 7788
$root = $PSScriptRoot
$profile = Join-Path $root 'profile.json'
$utf8 = New-Object System.Text.UTF8Encoding($false)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$port/")
try {
  $listener.Start()
} catch {
  Write-Host "Falling back to localhost only (phone access will not work)."
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add("http://localhost:$port/")
  $listener.Start()
}
Write-Host "Serving $root at http://localhost:$port/ - Ctrl+C to stop"
Write-Host "Progress file: $profile"

$types = @{ '.html'='text/html; charset=utf-8'; '.js'='application/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.json'='application/json; charset=utf-8' }

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $rel = $ctx.Request.Url.LocalPath.TrimStart('/')
  if ([string]::IsNullOrEmpty($rel)) { $rel = 'index.html' }

  if ($rel -eq 'api/profile') {
    $ctx.Response.Headers['Cache-Control'] = 'no-store'
    if ($ctx.Request.HttpMethod -eq 'POST') {
      $reader = New-Object System.IO.StreamReader($ctx.Request.InputStream, $utf8)
      $body = $reader.ReadToEnd()
      $reader.Close()
      $ok = $false
      try { $null = $body | ConvertFrom-Json; $ok = $true } catch { $ok = $false }
      if (-not $ok) {
        $ctx.Response.StatusCode = 400
        $bytes = $utf8.GetBytes('{"error":"invalid json"}')
      } else {
        [System.IO.File]::WriteAllText($profile, $body, $utf8)
        $ctx.Response.StatusCode = 204
        $bytes = @()
      }
    } else {
      if (Test-Path $profile) {
        $ctx.Response.ContentType = 'application/json; charset=utf-8'
        $bytes = [System.IO.File]::ReadAllBytes($profile)
      } else {
        $ctx.Response.StatusCode = 404
        $bytes = @()
      }
    }
  } else {
    $file = Join-Path $root $rel
    if (Test-Path $file -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($file)
      $ctx.Response.ContentType = if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' }
      $bytes = [System.IO.File]::ReadAllBytes($file)
    } else {
      $ctx.Response.StatusCode = 404
      $bytes = @()
    }
  }

  if ($bytes.Length -gt 0) { $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length) }
  $ctx.Response.Close()
}
