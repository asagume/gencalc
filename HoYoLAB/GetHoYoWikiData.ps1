$DownloadPath = ".\RawData"

# zh-cn 中国語（簡体）
# zh-tw 中国語（繁体）
# de-de ドイツ語
# en-us 英語
# es-es スペイン語
# fr-fr フランス語
# id-id インドネシア語
# ja-jp 日本語
# ko-kr 韓国語
# pt-pt ポルトガル語
# ru-ru ロシア語
# th-th タイ語
# vi-vn ベトナム語

#$page_ids = @()
$page_ids = @(1..51)
$page_ids += 2252   # 夜蘭
$page_ids += 2256   # 久岐忍
$page_ids = @(2000..2999)

foreach ($i in $page_ids) {
    $uri = "https://sg-wiki-api-static.hoyolab.com/hoyowiki/wapi/entry_page?entry_page_id=" + $i
    $uri

    $headers = @{
        "x-rpc-language" = "ja-jp";
    }

    $TempFile = New-TemporaryFile

    #    Invoke-WebRequest -URI $uri -Headers $headers -OutFile $OutputPath
    Invoke-WebRequest -URI $uri -Headers $headers -OutFile $TempFile

    $Content = Get-Content -Path $TempFile -Encoding UTF8

    $JsonContent = ConvertFrom-Json -InputObject $Content
    $JsonContent

    if ($JsonContent.retcode -eq 0) {
        $OutputPath = Join-Path -Path $DownloadPath -ChildPath ([string]$JsonContent.data.page.menu_id + "_" + [string]$JsonContent.data.page.id + "_" + $JsonContent.data.page.name + ".json")
        Set-Content -Path $OutputPath -Value ($JsonContent.data | ConvertTo-Json -Depth 100) -Encoding UTF8

        $uris = @(
            $JsonContent.data.page.icon_url,
            $JsonContent.data.page.header_img_url
        )

        foreach ($module in $JsonContent.data.page.modules) {
            if ($module.name -eq "ギャラリー") {
                foreach ($component in $module.components) {
                    $JsonData = ConvertFrom-Json -InputObject $component.data
                    $uri = $JsonData.pic
                    if ($uri.Length -gt 0) {
                        $uris += $uri
                    }
                }
            }
            if ($module.name -eq "天賦") {
                foreach ($component in $module.components) {
                    foreach ($component in $module.components) {
                        $JsonData = ConvertFrom-Json -InputObject $component.data
                        foreach ($entry in $JsonData.list) {
                            $uri = $entry.icon_url
                            if ($uri.Length -gt 0) {
                                $uris += $uri
                            }
                        }
                    }
                }
            }
        }

        foreach ($uri in $uris) {
            $uri
            $ChildPath = $uri.Substring($uri.IndexOf("picture") + "picture".Length + 1).Replace("/", "\");
            $OutputPath = Join-Path -Path $DownloadPath -ChildPath ("images\" + $ChildPath)
            $splitted = $OutputPath -split "\\"
            $splitted = $splitted[0..($splitted.Length - 2)]
            $OutputDir = $splitted -join "\"
            $OutputDir
            if (-not (Test-Path -Path $OutputDir)) {
                New-Item -Path $OutputDir -ItemType Directory
            }
            Invoke-WebRequest -URI $uri -OutFile $OutputPath
        }        
    }

    Write-Host ""

    Remove-Item -Path $TempFile
}
