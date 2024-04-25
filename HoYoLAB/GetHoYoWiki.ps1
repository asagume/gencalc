Set-Location -Path $PSScriptRoot
$destFolder = Join-Path (Get-Location).Path -ChildPath "RawData"

$pageIds = @()
### キャラクター
# $pageIds += @(1..51)
# $pageIds += 2252   # 夜蘭
# $pageIds += 2256   # 久岐忍
# $pageIds += 2263   # 鹿野院平蔵
# $pageIds += 2265   # ティナリ
# $pageIds += 2268   # コレイ
# $pageIds += 2269   # ドリー
# $pageIds += 2674   # 旅人(草)
# $pageIds += 2812   # ニィロウ
# $pageIds += 2813   # セノ
# $pageIds += 2815   # キャンディス
# $pageIds += 2850   # ナヒーダ
# $pageIds += 2859   # レイラ
# $pageIds += 2967   # ファルザン
# $pageIds += 2968   # 放浪者
# $pageIds += 3335   # ヨォーヨ
# $pageIds += 3336   # アルハイゼン
# $pageIds += 3463   # ディシア
# $pageIds += 3462   # ミカ
# $pageIds += 3608   # カーヴェ
# $pageIds += 3609   # 白朮
# $pageIds += 3719   # 綺良々
# $pageIds += 3962   # リネット
# $pageIds += 3963   # リネ
# $pageIds += 3964   # フレミネ
# $pageIds += 3997   # 旅人(水)
# $pageIds += 4023   # ヌヴィレット
# $pageIds += 4022   # リオセスリ
# $pageIds += 4376   # フリーナ
# $pageIds += 4377   # シャルロット
# $pageIds += 4576   # ナヴィア
# $pageIds += 4577   # シュヴルーズ
# $pageIds += 4774   # 閑雲
# $pageIds += 4775   # 嘉明
# $pageIds += 4946   # 千織
# $pageIds += 5149   # アルレッキーノ
### 武器
# $pageIds += @(1930..2060)
# $pageIds += 2254   # 若水
# $pageIds += 2255   # 落霞
# $pageIds += 2264   # 籠釣瓶一心
# $pageIds += 2665   # 狩人の道
# $pageIds += 2666   # 竭沢
# $pageIds += 2667   # 原木刀
# $pageIds += 2668   # ムーンピアサー
# $pageIds += 2669   # 満悦の実
# $pageIds += 2670   # 王の近侍
# $pageIds += 2671   # 森林のレガリア
# $pageIds += 2847   # 風信の矛
# $pageIds += 2848   # マカイラの水色
# $pageIds += 2849   # 赤砂の杖
# $pageIds += 2908   # 聖顕の鍵
# $pageIds += 2909   # サイフォスの月明かり
# $pageIds += 2910   # 彷徨える星
# $pageIds += 2966   # 千夜に浮かぶ夢
# $pageIds += 3319   # 東花坊時雨
# $pageIds += 3320   # トゥライトゥーラの記憶
# $pageIds += 3461   # 萃光の裁葉
# $pageIds += 3614   # 鉄彩の花
# $pageIds += 3615   # 葦海の標
# $pageIds += 3692   # 碧落の瓏
# $pageIds += 3902   # トキの嘴
# $pageIds += 3983   # 始まりの大魔術
# $pageIds += 3984   # 海淵のフィナーレ
# $pageIds += 3985   # タイダル・シャドー
# $pageIds += 3986   # 正義の報酬
# $pageIds += 3987   # 静寂の唄
# $pageIds += 3988   # 純水流華
# $pageIds += 3989   # サーンドルの渡し守
# $pageIds += 3999   # 狼牙
# $pageIds += 4000   # 話死合い棒
# $pageIds += 4001   # フィヨルドの歌
# $pageIds += 4002   # 烈日の後嗣
# $pageIds += 4003   # 古祠の瓏
# $pageIds += 4334   # 船渠剣
# $pageIds += 4335   # 携帯型チェーンソー
# $pageIds += 4338   # 果てなき紺碧の唄
# $pageIds += 4339   # 久遠流転の大典
# $pageIds += 4336   # プロスペクタードリル
# $pageIds += 4337   # レンジゲージ
# $pageIds += 4340   # 凛流の監視者
# $pageIds += 4592   # 水仙十字の剣
# $pageIds += 4719   # 裁断
# $pageIds += 4720   # 「スーパーアルティメット覇王魔剣」
# $pageIds += 4941   # 鶴鳴の余韻
# $pageIds += 5150   # 有楽御簾切
# $pageIds += 5151   # 砂中の賢者達の問答
# $pageIds += 5577   # 赤月のシルエット
### 聖遺物
# $pageIds += @(2061..2099)
# $pageIds += 2672   # 深林の記憶
# $pageIds += 2673   # 金メッキの夢
# $pageIds += 3321   # 楽園の絶花
# $pageIds += 3322   # 砂上の楼閣の史話
# $pageIds += 3693   # 水仙の夢
# $pageIds += 3694   # 花海甘露の光
# $pageIds += 3990   # ファントムハンター
# $pageIds += 3991   # 黄金の劇団
# $pageIds += 4716   # 残響の森で囁かれる夜話
# $pageIds += 4717   # 在りし日の歌
# $pageIds += 5578   # 諧律奇想の断章
$pageIds += 5579   # 遂げられなかった想い
# 生物誌
# $pageIds += @(2100..2251)
# 物産誌
# $pageIds += @(52..1929)
# $pageIds += 2253
# $pageIds += 2254
# $pageIds += 2257
# $pageIds += 2258
# $pageIds += 2259
# $pageIds += 2260

$doDownloadImg = $true
$imgLanguage = 'ja-jp'

$categoryMap = @{
    "2" = "character"
    "4" = "weapon"
    "5" = "reliquary"
    "7" = "enemy_and_monster"
    "9" = "object"
}

$xRpcLanguages = @("zh-cn", "zh-tw", "de-de", "en-us", "es-es", "fr-fr", "id-id", "ja-jp", "ko-kr", "pt-pt", "ru-ru", "th-th", "vi-vn")
# $xRpcLanguages = @("en-us", "ja-jp")

$ProgressPreference = 'SilentlyContinue'

foreach ($pageId in $pageIds) {
    $pageId
    $uri = "https://sg-wiki-api-static.hoyolab.com/hoyowiki/wapi/entry_page?entry_page_id=" + $pageId

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
    $writableName = $writableName -replace "\(.*?\)", ""
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

        if ($contentMLang.$imgLanguage."icon_url" -and $doDownloadImg) {
            $imageUrl = $contentMLang.$imgLanguage."icon_url"
            $imageFile = $basename + ".png"
            $outDirPath = Join-Path $destFolder -ChildPath ("images\" + $categoryMap.$menuId + "\face")
            if (-not (Test-Path $outDirPath)) {
                New-Item -Path $outDirPath -ItemType Directory -Force
            }
            Invoke-WebRequest -URI $imageUrl -Headers $headers -OutFile (Join-Path $outDirPath -ChildPath $imageFile) -Verbose
        }

        if ($contentMLang.$imgLanguage."header_img_url") {
        }

        $outDirPath = Join-Path $destFolder -ChildPath ("images\" + $categoryMap.$menuId + "\" + $basename)
        if (-not (Test-Path $outDirPath)) {
            New-Item -Path $outDirPath -ItemType Directory -Force
        }
        foreach ($xRpcLanguage in $xRpcLanguages) {
            foreach ($module in $contentMLang[$xRpcLanguage].modules) {
                foreach ($component in $module.components) {
                    if ($component.data) {
                        if ($component.data.list) {
                            $index = 0
                            foreach ($entry in $component.data.list) {
                                if ($entry.icon_url) {
                                    $imageFile = $component.component_id + "_" + ($index + 1) + ".png"
                                    if ($xRpcLanguage -eq $imgLanguage -and $doDownloadImg) {
                                        $outFile = (Join-Path $outDirPath -ChildPath $imageFile)
                                        Invoke-WebRequest -URI $entry.icon_url -Headers $headers -OutFile $outFile -Verbose
                                    }
                                    $entry.icon_url = $imageFile
                                    $entry.icon_url
                                }
                                $index++
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

        if ($contentMLang.$imgLanguage."icon_url" -and $doDownloadImg) {
            $imageUrl = $contentMLang.$imgLanguage."icon_url"
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

        $outDirPath = Join-Path $destFolder -ChildPath ("data\" + $categoryMap.$menuId)
        if (-not (Test-Path $outDirPath)) {
            New-Item -Path $outDirPath -ItemType Directory -Force
        }
        # $jsonFilePath = Join-Path $outDirPath -ChildPath $jsonFilePath
        $jsonFileName = $writableName + ".json"
        $jsonFilePath = $outDirPath

        if ($doDownloadImg) {
            if ($contentMLang.$imgLanguage."icon_url") {
                $imageUrl = $contentMLang.$imgLanguage."icon_url"
                $imageFile = $writableName + ".png"
                $outDirPath = Join-Path $destFolder -ChildPath ("images\" + $categoryMap.$menuId)
                if (-not (Test-Path $outDirPath)) {
                    New-Item -Path $outDirPath -ItemType Directory -Force
                }
                Invoke-WebRequest -URI $imageUrl -Headers $headers -OutFile (Join-Path $outDirPath -ChildPath $imageFile) -Verbose
            }
            foreach ($module in $contentMLang.$imgLanguage.modules) {
                foreach ($component in $module.components) {
                    if ($component.component_id -eq "artifact_list") {
                        if ($component.data) {
                            $cats = @("flower_of_life", "plume_of_death", "sands_of_eon", "goblet_of_eonothem", "circlet_of_logos")
                            foreach ($cat in $cats) {
                                if ($component.data.$cat.icon_url) {
                                    $imageUrl = $component.data.$cat.icon_url
                                    $imageFile = $cat + ".png"
                                    $outDirPath = Join-Path $destFolder -ChildPath ("images\" + $categoryMap.$menuId + "\" + $writableName)
                                    if (-not (Test-Path $outDirPath)) {
                                        New-Item -Path $outDirPath -ItemType Directory -Force
                                    }
                                    Invoke-WebRequest -URI $imageUrl -Headers $headers -OutFile (Join-Path $outDirPath -ChildPath $imageFile) -Verbose
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    else {
        $outDirPath = Join-Path $destFolder -ChildPath ("data\" + $categoryMap.$menuId)
        if (-not (Test-Path $outDirPath)) {
            New-Item -Path $outDirPath -ItemType Directory -Force
        }
        # $jsonFilePath = Join-Path $outDirPath -ChildPath $jsonFilePath
        $jsonFileName = $pageId.ToString() + "_" + $writableName + ".json"
        $jsonFilePath = $outDirPath
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
            $outData = (ConvertTo-Json -InputObject $contentMLang.$xRpcLanguage -Depth 100).replace("`u{00a0}", " ");
            [System.IO.File]::WriteAllLines($outFilePath, $outData, $UTF8NoBomEnc)        
        }
    }
}

Write-Host "Done"
