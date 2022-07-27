Set-Location -Path $PSScriptRoot
Get-ChildItem -Path ".\RawData" -Recurse -File | Where-Object { $_.Length -le 10 } | Remove-Item
