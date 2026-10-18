$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$areasFile = Join-Path $root 'js\areas.js'
$js = [System.IO.File]::ReadAllText($areasFile)
foreach ($id in @('nord','sud')) {
  $jsonFile = Join-Path $root ("data\area_{0}_collisions.json" -f $id)
  $raw = [System.IO.File]::ReadAllText($jsonFile)
  $obj = $raw | ConvertFrom-Json
  if ($obj.areaId -ne $id -or $null -eq $obj.walkable -or $null -eq $obj.obstacles -or $null -eq $obj.gates -or $null -eq $obj.hotspots) { throw "JSON non valido: $jsonFile" }
  $compact = $obj | ConvertTo-Json -Depth 100 -Compress
  # A dedicated payload appended once, independent from older built-in values.
  $marker = "/* SYNC_MAPPE_OFFLINE */"
  $pos = $js.IndexOf($marker)
  if ($pos -ge 0) { $js = $js.Substring(0, $pos).TrimEnd() + "`r`n" }
  if ($id -eq 'nord') { $payload = @{}; $decorPayload = @{} }
  $payload[$id] = $compact
  $decorFile = Join-Path $root ("data\area_{0}_decor.json" -f $id)
  $decor = [System.IO.File]::ReadAllText($decorFile) | ConvertFrom-Json
  if ($decor.areaId -ne $id -or $null -eq $decor.objects) { throw "JSON Decor non valido: $decorFile" }
  $decorPayload[$id] = ConvertTo-Json -InputObject @($decor.objects) -Depth 100 -Compress
  if ($decor.objects.Count -eq 0) { $decorPayload[$id] = '[]' }
}
$append = "`r`n/* SYNC_MAPPE_OFFLINE */`r`n(function(){`r`n"
foreach ($id in @('nord','sud')) {
  $append += "  Object.assign(window.EsposizioneAreas['$id'], $($payload[$id]));`r`n"
  $append += "  window.EsposizioneAreas['$id'].decor = $($decorPayload[$id]);`r`n"
}
$append += "})();`r`n"
[System.IO.File]::WriteAllText($areasFile, $js + $append, (New-Object System.Text.UTF8Encoding($false)))
Write-Host 'Mappe offline aggiornate dai JSON della cartella data.'
