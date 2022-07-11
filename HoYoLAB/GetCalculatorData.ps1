$Cookie = "_MHYUUID=9060a588-f241-480e-bebb-c46fc02c1c9f; _ga=GA1.2.380098274.1657515373; _gid=GA1.2.1308835568.1657515373; mi18nLang=ja-jp; _gat_gtag_UA_168360861_3=1; ltoken=JTwotZW80lEODK8IO3Alv2o7UN5M4KNlaStbOW1p; ltuid=7891322; cookie_token=Lum3QTNC8c7pujy4ouZkRY6ak3Zu0orQ3HRvQEtc; account_id=7891322"

$OutputDir = "..\data"
$AvatarListOutFile = "HoyoAvatarMaster.json"
$WeaponListOutFile = "HoyoWeaponMaster.json"
$ArtifactListOutFile = "HoyoArtifactMaster.json"

# Avatar
# https://sg-public-api.hoyolab.com/event/calculateos/avatar/list
# {
# "element_attr_ids": [],
# "weapon_cat_ids": [],
# "page": 1,
# "size": 20,
# "is_all": true,
# "lang": "ja-jp"
# }
# 
# Weapon
# https://sg-public-api.hoyolab.com/event/calculateos/weapon/list
# {
#     "weapon_cat_ids": [],
#     "weapon_levels": [],
#     "page": 1,
#     "size": 20,
#     "lang": "ja-jp"
# }
#
# Reliquary
# https://sg-public-api.hoyolab.com/event/calculateos/reliquary/list
# {
#     "reliquary_levels": [],
#     "reliquary_cat_id": 1,
#     "page": 1,
#     "size": 20,
#     "lang": "ja-jp"
# }
#

$Headers = @{
    "Accept"          = "application/json, text/plain, */*"
    "Accept-Encoding" = "gzip, deflate, br"
    "Accept-Language" = "ja,en-US;q=0.9,en;q=0.8"
}

########
# キャラクター
$AvatarList = @()

$Uri = "https://sg-public-api.hoyolab.com/event/calculateos/avatar/list"
$Body = @{
    "element_attr_ids" = @()
    "weapon_cat_ids"   = @()
    "page"             = 0
    "size"             = 20
    "is_all"           = $true
    "lang"             = "ja-jp"
}

$MySession = New-Object -TypeName Microsoft.PowerShell.Commands.WebRequestSession

$Cookie -split ';' | ForEach-Object {
    $NameValue = $_ -split "="
    $MyCookie = New-Object -TypeName System.Net.Cookie
    $MyCookie.Name = $NameValue[0].Trim()
    $MyCookie.Value = $NameValue[1].Trim()
    $MySession.Cookies.Add($Uri, $MyCookie)
} 

while ($true) {
    $Body.page ++
    $BodyJson = $Body | ConvertTo-Json

    $Response = Invoke-WebRequest -URI $Uri -Method Post -Headers $Headers -ContentType "application/json;charset=UTF-8" -Body $BodyJson -WebSession $MySession -Verbose

    if ($Response.StatusCode -ne 200) {
        break;
    }

    $ResponseContent = [System.Text.Encoding]::UTF8.GetString( [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($Response.Content) )
    $ContentObj = ConvertFrom-Json -InputObject $ResponseContent

    if ($ContentObj.data.list.Length -eq 0) {
        break;
    }

    $AvatarList = $AvatarList + $ContentObj.data.list
}

$AvatarList | ConvertTo-Json -Depth 100 | Out-File -FilePath (Join-Path $OutputDir -ChildPath $AvatarListOutFile) -Encoding utf8

########
# 武器
$WeaponList = @()

$Uri = "https://sg-public-api.hoyolab.com/event/calculateos/weapon/list"
$Body = @{
    "weapon_cat_ids" = @()
    "weapon_levels"  = @()
    "page"           = 0
    "size"           = 20
    "lang"           = "ja-jp"
}

$MySession = New-Object -TypeName Microsoft.PowerShell.Commands.WebRequestSession

$Cookie -split ';' | ForEach-Object {
    $NameValue = $_ -split "="
    $MyCookie = New-Object -TypeName System.Net.Cookie
    $MyCookie.Name = $NameValue[0].Trim()
    $MyCookie.Value = $NameValue[1].Trim()
    $MySession.Cookies.Add($Uri, $MyCookie)
} 

while ($true) {
    $Body.page ++
    $BodyJson = $Body | ConvertTo-Json

    $Response = Invoke-WebRequest -URI $Uri -Method Post -Headers $Headers -ContentType "application/json;charset=UTF-8" -Body $BodyJson -WebSession $MySession -Verbose

    if ($Response.StatusCode -ne 200) {
        break;
    }

    $ResponseContent = [System.Text.Encoding]::UTF8.GetString( [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($Response.Content) )
    $ContentObj = ConvertFrom-Json -InputObject $ResponseContent

    if ($ContentObj.data.list.Length -eq 0) {
        break;
    }

    $WeaponList = $WeaponList + $ContentObj.data.list
}

$WeaponList | ConvertTo-Json -Depth 100 | Out-File -FilePath (Join-Path $OutputDir -ChildPath $WeaponListOutFile) -Encoding utf8

########
# 聖遺物
$ArtifactList = @()

$Uri = "https://sg-public-api.hoyolab.com/event/calculateos/reliquary/list"
$Body = @{
    "reliquary_levels" = @()
    "reliquary_cat_id" = 1
    "page"             = 0
    "size"             = 20
    "lang"             = "ja-jp"
}

$MySession = New-Object -TypeName Microsoft.PowerShell.Commands.WebRequestSession

$Cookie -split ';' | ForEach-Object {
    $NameValue = $_ -split "="
    $MyCookie = New-Object -TypeName System.Net.Cookie
    $MyCookie.Name = $NameValue[0].Trim()
    $MyCookie.Value = $NameValue[1].Trim()
    $MySession.Cookies.Add($Uri, $MyCookie)
} 

while ($true) {
    $Body.page ++
    $BodyJson = $Body | ConvertTo-Json

    $Response = Invoke-WebRequest -URI $Uri -Method Post -Headers $Headers -ContentType "application/json;charset=UTF-8" -Body $BodyJson -WebSession $MySession -Verbose

    if ($Response.StatusCode -ne 200) {
        break;
    }

    $ResponseContent = [System.Text.Encoding]::UTF8.GetString( [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($Response.Content) )
    $ContentObj = ConvertFrom-Json -InputObject $ResponseContent

    if ($ContentObj.data.list.Length -eq 0) {
        break;
    }

    $ArtifactList = $ArtifactList + $ContentObj.data.list
}

$ArtifactList | ConvertTo-Json -Depth 100 | Out-File -FilePath (Join-Path $OutputDir -ChildPath $ArtifactListOutFile) -Encoding utf8

