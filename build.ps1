[CmdletBinding()]
param(
  [switch]$KeepPrevious
)

$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$outputDirectory = Join-Path $projectRoot 'dist'

Set-Location -LiteralPath $projectRoot

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'Node.js e npm devono essere installati per creare i pacchetti.'
}

if (-not $KeepPrevious -and (Test-Path -LiteralPath $outputDirectory)) {
  Remove-Item -LiteralPath $outputDirectory -Recurse -Force
}

& npm run package
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Get-ChildItem -LiteralPath $outputDirectory -File -Filter '*.exe' |
  Sort-Object Name |
  Select-Object Name, @{ Name = 'MB'; Expression = { [math]::Round($_.Length / 1MB, 2) } } |
  Format-Table -AutoSize
