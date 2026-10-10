# 育成計算機のlistリクエストヘッダーのCookieの値を入力してください
$Cookie = ""

$OutputDir = Join-Path (Split-Path -Path $PSScriptRoot -Parent) -ChildPath "public\data"
$AvatarListOutFile = "HoyoAvatarMaster.json"
$SkillListOutFile = "HoyoSkillMaster.json"
$WeaponListOutFile = "HoyoWeaponMaster.json"
$ArtifactListOutFile = "HoyoArtifactMaster.json"

# Avatar
# https://sg-act-public-api.hoyolab.com/event/e20200928calculate/v1/avatar/list
# {
# "element_attr_ids": [],
# "weapon_cat_ids": [],
# "page": 1,
# "size": 200,
# "is_all": true,
# "lang": "ja-jp"
# }
#
# Weapon
# https://sg-act-public-api.hoyolab.com/event/e20200928calculate/v1/weapon/list
# {
#     "weapon_cat_ids": [],
#     "weapon_levels": [],
#     "page": 1,
#     "size": 20,
#     "lang": "ja-jp"
# }
#
# Reliquary
# https://sg-act-public-api.hoyolab.com/event/e20200928calculate/v1/reliquary/list
# {
#     "reliquary_levels": [],
#     "reliquary_cat_id": 1,
#     "page": 1,
#     "size": 20,
#     "lang": "ja-jp"
# }
# 
# GET
# https://sg-public-api.hoyolab.com/event/calculateos/avatar/skill_list?avatar_id=10000069&element_attr_id=4&lang=ja-jp

# 注意: PowerShell/.NET は -Headers の "Cookie" を無視する（Cookie は -WebSession
# の CookieContainer 経由でのみ送られる）。ここに入れても効果はない。
$Headers = @{
    "Accept"            = "application/json, text/plain, */*"
    "Accept-Language"   = "ja,en-US;q=0.9,en;q=0.8"
    "User-Agent"        = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    "Origin"            = "https://www.hoyolab.com"
    "Referer"           = "https://www.hoyolab.com/"
    "x-rpc-client_type" = "10"
    "x-rpc-language"    = "ja-jp"
}

# -UseBasicParsing がないと非対話実行時に解析警告のプロンプトで停止する
$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Stop'

# PowerShell 5.1 は Content-Type に charset がないとレスポンス本文を ISO-8859-1 で
# デコードするため、日本語が文字化けする（gzip は PowerShell が展開済み）。
# RawContentStream の生バイトを UTF-8 でデコードするのが確実。
function Get-Utf8Content($Response) {
    if ($Response.RawContentStream) {
        return [System.Text.Encoding]::UTF8.GetString($Response.RawContentStream.ToArray())
    }
    return [System.Text.Encoding]::UTF8.GetString([System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($Response.Content))
}

# PS 5.1 の ConvertTo-Json は要素数1の配列をオブジェクト化し、空配列だと空文字になる。
# また Out-File -Encoding utf8 は BOM を書くため、ブラウザの fetch().json() や
# Python の json.load(encoding='utf-8') で失敗する。BOM なし UTF-8 で書き出す。
function Write-JsonArray($List, $FilePath) {
    $Array = @($List)
    if ($Array.Count -eq 0) {
        $Json = "[]"
    } elseif ($Array.Count -eq 1) {
        $Json = "[" + ($Array[0] | ConvertTo-Json -Depth 100) + "]"
    } else {
        $Json = $Array | ConvertTo-Json -Depth 100
    }
    [System.IO.File]::WriteAllText($FilePath, $Json, (New-Object System.Text.UTF8Encoding($false)))
}

########
# キャラクター
$AvatarList = @()
$SkillList = @()

$Uri = "https://sg-act-public-api.hoyolab.com/event/e20200928calculate/v1/avatar/list"
$Body = @{
    "element_attr_ids" = @()
    "weapon_cat_ids"   = @()
    "page"             = 0
    "size"             = 200
    "lang"             = "ja-jp"
    "is_all"           = $true
}

$MySession = New-Object -TypeName Microsoft.PowerShell.Commands.WebRequestSession

$Cookie -split ';' | ForEach-Object {
    $NameValue = $_ -split "=", 2
    if (-not $NameValue[0].Trim()) { continue }
    $MyCookie = New-Object -TypeName System.Net.Cookie
    $MyCookie.Name = $NameValue[0].Trim()
    if ($NameValue.Length -gt 1) { $MyCookie.Value = $NameValue[1].Trim() }
    try { $MySession.Cookies.Add($Uri, $MyCookie) } catch { Write-Warning "skip cookie: $($_.Exception.Message)" }
} 

# $SkillListUri = "https://sg-public-api.hoyolab.com/event/calculateos/avatar/skill_list"

while ($true) {
    $Body.page ++
    $BodyJson = $Body | ConvertTo-Json

    try {
        $Response = Invoke-WebRequest -URI $Uri -Method Post -Headers $Headers -ContentType "application/json;charset=UTF-8" -Body $BodyJson -WebSession $MySession -UseBasicParsing
    } catch {
        throw "Avatar request failed: $($_.Exception.Message)"
    }
    if ($Response.StatusCode -ne 200) {
        throw "Avatar request returned HTTP $($Response.StatusCode)."
    }

    $ContentObj = ConvertFrom-Json -InputObject (Get-Utf8Content $Response)

    if ($ContentObj.retcode -ne 0) {
        throw "Avatar request failed: retcode=$($ContentObj.retcode) / $($ContentObj.message)"
    }

    if (-not $ContentObj.data -or (@($ContentObj.data.list).Count -eq 0)) {
        break
    }

    if ($Body.page -eq 1) { $ExpectedAvatarCount = [int]$ContentObj.data.total }

    foreach ($entry in $ContentObj.data.list) {
        $entry.icon = $null
        if ($entry.name -eq "旅人") {
            switch ($entry.element_attr_id) {
                1 {
                    $entry.name += "(炎)"
                }
                2 {
                    $entry.name += "(風)"
                }
                3 {
                    $entry.name += "(岩)"
                }
                4 {
                    $entry.name += "(草)"
                }
                5 {
                    $entry.name += "(雷)"
                }
                6 {
                    $entry.name += "(水)"
                }
                7 {
                    $entry.name += "(氷)"
                }
            }
        }
        if ($null -ne $entry.item_icon) {
            $entry.item_icon = $null
        }
        if ($null -ne $entry.talent_icons) {
            $entry.talent_icons = $null
        }
        if ($null -ne $entry.side_icon) {
            $entry.side_icon = $null
        }
        if ($null -ne $entry.profile_pictures) {
            $entry.profile_pictures = $null
        }
        foreach ($entry2 in $entry.talents) {
            $entry2.icon = $null
        }
        foreach ($entry2 in $entry.skill_list) {
            $entry2.icon = $null
        }

        ###
        # # キャラクター 詳細
        # $GetUrl = $SkillListUri + "?avatar_id=" + $entry.id + "&element_attr_id=" + $entry.element_attr_id + "&lang=ja-jp"
        # $Response2 = Invoke-WebRequest -URI $GetUrl -Headers $Headers -WebSession $MySession -Verbose
        # $ContentObj2 = ConvertFrom-Json -InputObject $Response2.Content
        # # $ResponseContent2 = [System.Text.Encoding]::UTF8.GetString( [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($Response2.Content) )
        # # $ContentObj2 = ConvertFrom-Json -InputObject $ResponseContent2
        # if ($ContentObj2.data.list.Length -eq 0) {
        #     continue;
        # }
        # foreach ($entry2 in $ContentObj2.data.list) {
        #     $entry2.icon = $null
        # }
        # $Json2 = @{
        #     avatar_id  = $entry.id;
        #     skill_list = $ContentObj2.data.list;
        # }
        $Json2 = @{
            avatar_id  = $entry.id;
            skill_list = $entry.skill_list;
        }
        $SkillList = $SkillList + $Json2
    }

    $AvatarList = $AvatarList + $ContentObj.data.list
}

if ($AvatarList.Count -ne $ExpectedAvatarCount) {
    throw "Avatar list is incomplete: expected $ExpectedAvatarCount, received $($AvatarList.Count)."
}

########
# 武器
$WeaponList = @()

$Uri = "https://sg-act-public-api.hoyolab.com/event/e20200928calculate/v1/weapon/list"
$Body = @{
    "weapon_cat_ids" = @()
    "weapon_levels"  = @()
    "page"           = 0
    "size"           = 200
    "lang"           = "ja-jp"
}

$MySession = New-Object -TypeName Microsoft.PowerShell.Commands.WebRequestSession

$Cookie -split ';' | ForEach-Object {
    $NameValue = $_ -split "=", 2
    if (-not $NameValue[0].Trim()) { continue }
    $MyCookie = New-Object -TypeName System.Net.Cookie
    $MyCookie.Name = $NameValue[0].Trim()
    if ($NameValue.Length -gt 1) { $MyCookie.Value = $NameValue[1].Trim() }
    try { $MySession.Cookies.Add($Uri, $MyCookie) } catch { Write-Warning "skip cookie: $($_.Exception.Message)" }
} 

while ($true) {
    $Body.page ++
    $BodyJson = $Body | ConvertTo-Json

    $Response = Invoke-WebRequest -URI $Uri -Method Post -Headers $Headers -ContentType "application/json; charset=UTF-8" -Body $BodyJson -WebSession $MySession -UseBasicParsing

    if ($Response.StatusCode -ne 200) {
        throw "Weapon request returned HTTP $($Response.StatusCode)."
    }

    $ContentObj = ConvertFrom-Json -InputObject (Get-Utf8Content $Response)

    if ($ContentObj.retcode -ne 0) {
        throw "Weapon request failed: retcode=$($ContentObj.retcode) / $($ContentObj.message)"
    }

    if (-not $ContentObj.data -or (@($ContentObj.data.list).Count -eq 0)) {
        break
    }

    if ($Body.page -eq 1) { $ExpectedWeaponCount = [int]$ContentObj.data.total }

    foreach ($entry in $ContentObj.data.list) {
        $entry.icon = $null
        $entry.wiki_url = $null;
    }

    $WeaponList = $WeaponList + $ContentObj.data.list
}

if ($WeaponList.Count -ne $ExpectedWeaponCount) {
    throw "Weapon list is incomplete: expected $ExpectedWeaponCount, received $($WeaponList.Count)."
}

########
# 聖遺物
$ArtifactList = @()

$Uri = "https://sg-act-public-api.hoyolab.com/event/e20200928calculate/v1/reliquary/list"
$Body = @{
    "reliquary_levels" = @()
    "reliquary_cat_id" = 1
    "page"             = 0
    "size"             = 20
    "lang"             = "ja-jp"
}

$MySession = New-Object -TypeName Microsoft.PowerShell.Commands.WebRequestSession
$ExpectedArtifactCount = 0

$Cookie -split ';' | ForEach-Object {
    $NameValue = $_ -split "=", 2
    if (-not $NameValue[0].Trim()) { continue }
    $MyCookie = New-Object -TypeName System.Net.Cookie
    $MyCookie.Name = $NameValue[0].Trim()
    if ($NameValue.Length -gt 1) { $MyCookie.Value = $NameValue[1].Trim() }
    try { $MySession.Cookies.Add($Uri, $MyCookie) } catch { Write-Warning "skip cookie: $($_.Exception.Message)" }
} 

for ($reliquary_cat_id = 1; $reliquary_cat_id -le 5; $reliquary_cat_id++) {    
    $Body.page = 0
    while ($true) {
        $Body.reliquary_cat_id = $reliquary_cat_id
        $Body.page ++
        $BodyJson = $Body | ConvertTo-Json

        $Response = Invoke-WebRequest -URI $Uri -Method Post -Headers $Headers -ContentType "application/json; charset=UTF-8" -Body $BodyJson -WebSession $MySession -UseBasicParsing

        if ($Response.StatusCode -ne 200) {
            throw "Reliquary request returned HTTP $($Response.StatusCode)."
        }

        $ContentObj = ConvertFrom-Json -InputObject (Get-Utf8Content $Response)

        if ($ContentObj.retcode -ne 0) {
            throw "Reliquary request failed: retcode=$($ContentObj.retcode) / $($ContentObj.message)"
        }

        if (-not $ContentObj.data -or (@($ContentObj.data.list).Count -eq 0)) {
            break
        }

        if ($Body.page -eq 1) { $ExpectedArtifactCount += [int]$ContentObj.data.total }

        foreach ($entry in $ContentObj.data.list) {
            $entry.icon = $null
        }
        
        $ArtifactList = $ArtifactList + $ContentObj.data.list
    }
}

if ($ArtifactList.Count -ne $ExpectedArtifactCount) {
    throw "Reliquary list is incomplete: expected $ExpectedArtifactCount, received $($ArtifactList.Count)."
}

Write-JsonArray -List $AvatarList -FilePath (Join-Path $OutputDir -ChildPath $AvatarListOutFile)
Write-JsonArray -List $SkillList -FilePath (Join-Path $OutputDir -ChildPath $SkillListOutFile)
Write-JsonArray -List $WeaponList -FilePath (Join-Path $OutputDir -ChildPath $WeaponListOutFile)
Write-JsonArray -List $ArtifactList -FilePath (Join-Path $OutputDir -ChildPath $ArtifactListOutFile)

