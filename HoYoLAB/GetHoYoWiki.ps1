$destFolder = Join-Path (Get-Location).Path -ChildPath "RawData"

$pageIds = @()
# キャラクター
# $pageIds += @(1..51)
# $pageIds += 2252   # 夜蘭
# $pageIds += 2256   # 久岐忍
# $pageIds += 2263   # 鹿野院平蔵
# 武器
$pageIds += @(1930..2060)
$pageIds += 2254   # 若水
$pageIds += 2255   # 落霞
$pageIds += 2264   # 籠釣瓶一心
# 聖遺物

$doDownloadImg = $false

$categoryMap = @{
    "2" = "characters"
    "4" = "weapons"
    "5" = "artifacts"
}

$xRpcLanguages = @("zh-cn", "zh-tw", "de-de", "en-us", "es-es", "fr-fr", "id-id", "ja-jp", "ko-kr", "pt-pt", "ru-ru", "th-th", "vi-vn")
# $xRpcLanguages = @("en-us", "ja-jp")

foreach ($pageId in $pageIds) {
    $uri = "https://sg-wiki-api-static.hoyolab.com/hoyowiki/wapi/entry_page?entry_page_id=" + $pageId
    $uri

    $contentMLang = @{}

    foreach ($xRpcLanguage in $xRpcLanguages) {
        $headers = @{
            "x-rpc-language" = $xRpcLanguage;
        }

        $tempFile = New-TemporaryFile

        Invoke-WebRequest -URI $uri -Headers $headers -OutFile $tempFile
        $rawContent = Get-Content -Path $tempFile -Encoding UTF8
        $contentHashTable = ConvertFrom-Json $rawContent
        if ($contentHashTable.retcode -ne 0) {
            continue
        }

        $contentMLang[$xRpcLanguage] = $contentHashTable.data.page

        foreach ($module in $contentMLang[$xRpcLanguage].modules) {
            foreach ($component in $module.components) {
                if ($component.data) {
                    $component.data = ConvertFrom-Json $component.data
                }
            }
        }

        Remove-Item -Path $tempFile
    } 

    $nameEn = $contentMLang."en-us".name
    $writableName = $nameEn -replace "[`"<>`|:`*`?`\/ ]", ""
    $menuId = $contentMLang."en-us".menu_id

    $jsonFilePath = ""
    $jsonFileName = ""

    if ($menuId -eq 2) {
        # キャラクター
        $rarity = $null
        foreach ($value in $contentMLang."en-us"."filter_values"."character_rarity"."values") {
            $rarity = $value -replace "[^0-9]", ""
        }
        $vision = $null
        foreach ($value in $contentMLang."en-us"."filter_values"."character_vision"."values") {
            $vision = $value.ToLower()
        }
        $weapon = $null
        foreach ($value in $contentMLang."en-us"."filter_values"."character_weapon"."values") {
            $weapon = $value.ToLower()
        }

        if ($null -eq $vision) {
            continue
        }

        $basename = $vision + "_" + $rarity + "_" + $weapon + "_" + $writableName

        $outDirPath = Join-Path $destFolder -ChildPath ("data\" + $categoryMap.$menuId)
        if (-not (Test-Path $outDirPath)) {
            New-Item -Path $outDirPath -ItemType Directory -Force
        }
        # $jsonFilePath = Join-Path $outDirPath -ChildPath $jsonFilePath
        $jsonFileName = $basename + ".json"
        $jsonFilePath = $outDirPath

        if ($contentMLang."en-us"."icon_url" -and $doDownloadImg) {
            $imageUrl = $contentMLang."en-us"."icon_url"
            $imageFile = $basename + ".png"
            $outDirPath = Join-Path $destFolder -ChildPath ("images\" + $categoryMap.$menuId + "\face")
            if (-not (Test-Path $outDirPath)) {
                New-Item -Path $outDirPath -ItemType Directory -Force
            }
            Invoke-WebRequest -URI $imageUrl -Headers $headers -OutFile (Join-Path $outDirPath -ChildPath $imageFile) -Verbose
        }

        if ($contentMLang."en-us"."header_img_url") {
        }

        $outDirPath = Join-Path $destFolder -ChildPath ("images\" + $categoryMap.$menuId + "\" + $basename)
        if (-not (Test-Path $outDirPath)) {
            New-Item -Path $outDirPath -ItemType Directory -Force
        }
        foreach ($module in $contentMLang."en-us".modules) {
            foreach ($component in $module.components) {
                if ($component.data -and $doDownloadImg) {
                    if ($component.data.list) {
                        foreach ($entry in $component.data.list) {
                            if ($entry.icon_url) {
                                $workArr = $entry.icon_url -split "/"
                                Invoke-WebRequest -URI $entry.icon_url -Headers $headers -OutFile (Join-Path $outDirPath -ChildPath $workArr[$workArr.Length - 1]) -Verbose
                            }
                        }
                    }
                }
            }
        }
    }
    elseif ($menuId -eq 4) {
        # 武器
        foreach ($value in $contentMLang."en-us"."filter_values"."weapon_type"."values") {
            $type = $value.ToLower()
        }
        foreach ($value in $contentMLang."en-us"."filter_values"."weapon_rarity"."values") {
            $rarity = $value -replace "[^0-9]", ""
        }

        $outDirPath = Join-Path $destFolder -ChildPath ("data\" + $categoryMap.$menuId + "\" + $type)
        if (-not (Test-Path $outDirPath)) {
            New-Item -Path $outDirPath -ItemType Directory -Force
        }
        # $jsonFilePath = Join-Path $outDirPath -ChildPath $jsonFilePath
        $jsonFileName = $rarity + "_" + $writableName + ".json"
        $jsonFilePath = $outDirPath

        if ($contentMLang."en-us"."icon_url" -and $doDownloadImg) {
            $imageUrl = $contentMLang."en-us"."icon_url"
            $imageFile = $rarity + "_" + $writableName + ".png"
            $outDirPath = Join-Path $destFolder -ChildPath ("images\" + $categoryMap.$menuId + "\" + $type)
            if (-not (Test-Path $outDirPath)) {
                New-Item -Path $outDirPath -ItemType Directory -Force
            }
            Invoke-WebRequest -URI $imageUrl -Headers $headers -OutFile (Join-Path $outDirPath -ChildPath $imageFile) -Verbose
        }
    }
    elseif ($menuId -eq 5) {
        # 聖遺物
    }

    if ($jsonFileName -ne "") {
        foreach ($xRpcLanguage in $xRpcLanguages) {
            $outFilePath = Join-Path $jsonFilePath -ChildPath $xRpcLanguage
            if (-not (Test-Path $outFilePath)) {
                New-Item -Path $outFilePath -ItemType Directory -Force
            }
                $outFilePath = Join-Path $outFilePath -ChildPath $jsonFileName
            $outFilePath = [System.IO.Path]::GetFullPath($outFilePath)
            $outFilePath
    
            $UTF8NoBomEnc = New-Object System.Text.UTF8Encoding $False
            [System.IO.File]::WriteAllLines($outFilePath, (ConvertTo-Json -InputObject $contentMLang.$xRpcLanguage -Depth 100), $UTF8NoBomEnc)        
        }
    }
}