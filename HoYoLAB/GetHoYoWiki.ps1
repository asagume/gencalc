$destFolder = ".\RawData"

$pageIds = @()
$pageIds += 30
$pageIds += 1930

# $xRpcLanguages = @("zh-cn", "zh-tw", "de-de", "en-us", "es-es", "fr-fr", "id-id", "ja-jp", "ko-kr", "pt-pt", "ru-ru", "th-th", "vi-vn")
$xRpcLanguages = @("en-us", "ja-jp")

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
        $contentHashTable = (New-Object System.Web.Script.Serialization.JavaScriptSerializer).Deserialize($rawContent, [System.Collections.HashTable])
        if ($contentHashTable.retcode -ne 0) {
            continue
        }
        $contentMLang[$xRpcLanguage] = $contentHashTable.data.page

        Remove-Item -Path $tempFile
    } 

    $nameEn = $contentMLang["en-us"].name
    $writableName = $nameEn -replace "[`"<>`|:`*`?`\/ ]", ""
    $menuId = $contentMLang["en-us"].menu_id

    $jsonFilePath = ""

    if ($menuId -eq 2) {
        # キャラクター
        foreach ($value in $contentMLang["en-us"]["filter_values"]["character_rarity"]["values"]) {
            $rarity = $value -replace "[^0-9]", ""
        }
        foreach ($value in $contentMLang["en-us"]["filter_values"]["character_vision"]["values"]) {
            $vision = $value.ToLower()
        }
        foreach ($value in $contentMLang["en-us"]["filter_values"]["character_weapon"]["values"]) {
            $weapon = $value.ToLower()
        }

        $dirName = $vision + "_" + $rarity + "_" + $weapon + "_" + $writableName
        $dirPath = Join-Path $destFolder -ChildPath (Join-Path "images\characters" -ChildPath $dirName)
        if (-not (Test-Path $dirPath)) {
            New-Item -Path $dirPath -ItemType Directory -Force
        }

        if ($contentMLang["en-us"]["icon_url"]) {
            $imageUrl = $contentMLang["en-us"]["icon_url"]
            $imageFile = $dirName + ".png"
            $iconDirPath = Join-Path $destFolder -ChildPath ("images\characters\face")
            if (-not (Test-Path $iconDirPath)) {
                New-Item -Path $iconDirPath -ItemType Directory -Force
            }
            Invoke-WebRequest -URI $imageUrl -Headers $headers -OutFile (Join-Path $iconDirPath -ChildPath $imageFile)
        }

        if ($contentMLang["en-us"]["header_img_url"]) {
        }
    }
    elseif ($menuId -eq 4) {
        # 武器
        foreach ($value in $contentMLang["en-us"]["filter_values"]["weapon_type"]["values"]) {
            $type = $value.ToLower()
        }
        foreach ($value in $contentMLang["en-us"]["filter_values"]["weapon_rarity"]["values"]) {
            $rarity = $value -replace "[^0-9]", ""
        }

        $jsonFilePath = $rarity + "_" + $type + "_" + $writableName + ".json"
        $jsonFilePath = Join-Path $destFolder -ChildPath $jsonFilePath

        if ($contentMLang["en-us"]["icon_url"]) {
            $imageUrl = $contentMLang["en-us"]["icon_url"]
            $imageFile = $rarity + "_" + $writableName + ".png"
            $iconDirPath = Join-Path $destFolder -ChildPath ("images\weapons\" + $type)
            if (-not (Test-Path $iconDirPath)) {
                New-Item -Path $iconDirPath -ItemType Directory -Force
            }
            Invoke-WebRequest -URI $imageUrl -Headers $headers -OutFile (Join-Path $iconDirPath -ChildPath $imageFile)
        }
    }
    elseif ($menuId -eq 5) {
        # 聖遺物
    }

    if ($jsonFilePath -ne "") {
        $jsonFilePath
        Out-File -FilePath $jsonFilePath -Encoding utf8 -InputObject (ConvertTo-Json -InputObject $contentMLang["ja-jp"] -Depth 100)
    }
}