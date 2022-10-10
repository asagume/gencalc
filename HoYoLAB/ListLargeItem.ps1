Set-Location -Path $PSScriptRoot
Get-ChildItem -Path ".\Resize" -Recurse -File | Where-Object { $_.Length -ge 9000 }