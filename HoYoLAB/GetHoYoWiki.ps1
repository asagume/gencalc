$destFolder = ".\RawData"

$pageIds = @()
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
        $contentHashTable = $contentHashTable.data.page

        $contentMLang[$xRpcLanguage] = $contentHashTable

        Remove-Item -Path $tempFile
    } 

    $nameEn = $contentMLang["en-us"].name

    $menuName = $contentMLang["en-us"].menu_name
    $menuName

    if ($menuName -eq "Weapons") {
        foreach ($value in $contentMLang["en-us"]["filter_values"]["weapon_type"]["values"]) {
            $type = $value.ToLower()
        }
        foreach ($value in $contentMLang["en-us"]["filter_values"]["weapon_rarity"]["values"]) {
            $rarity = $value -replace "[^0-9]", ""
        }

        $eliminated = $nameEn -replace "[`"<>`|:`*`?`\/ ]", ""

        $jsonFilePath = $rarity + "_" + $type + "_" + $eliminated + ".json"
        $jsonFilePath

        if ($contentMLang["en-us"]["icon_url"]) {
            $imageUrl = $contentMLang["en-us"]["icon_url"]
            $imageFile = $rarity + "_" + $eliminated + ".png"
            $outDirPath = Join-Path $destFolder -ChildPath ("images\weapon\" + $type)
            New-Item  -Path $outDirPath -ItemType Directory
            Invoke-WebRequest -URI $imageUrl -Headers $headers -OutFile (Join-Path $outDirPath -ChildPath $imageFile)
        }
    }

}

