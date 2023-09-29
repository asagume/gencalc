# 育成計算機のlistリクエストヘッダーのCookieの値を入力してください
$Cookie = ""

$OutputDir = ".\public\data"
$AvatarListOutFile = "HoyoAvatarMaster.json"
$SkillListOutFile = "HoyoSkillMaster.json"
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
# GET
# https://sg-public-api.hoyolab.com/event/calculateos/avatar/skill_list?avatar_id=10000069&element_attr_id=4&lang=ja-jp

$Headers = @{
    "Accept"          = "application/json, text/plain, */*"
    "Accept-Encoding" = "gzip, deflate, br"
    "Accept-Language" = "ja,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6"
    "Cookie"          = $Cookie
}

########
# キャラクター
$AvatarList = @()
$SkillList = @()

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

$SkillListUri = "https://sg-public-api.hoyolab.com/event/calculateos/avatar/skill_list"

while ($true) {
    $Body.page ++
    $BodyJson = $Body | ConvertTo-Json

    $Response = Invoke-WebRequest -URI $Uri -Method Post -Headers $Headers -ContentType "application/json; charset=UTF-8" -Body $BodyJson -WebSession $MySession -Verbose
    $Response
    if ($Response.StatusCode -ne 200) {
        break;
    }

    # $ResponseContent = [System.Text.Encoding]::UTF8.GetString( [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($Response.Content) )
    $ContentObj = ConvertFrom-Json -InputObject $Response.Content

    if ($ContentObj.data.list.Length -eq 0) {
        break;
    }

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

        ###
        # キャラクター 詳細
        $GetUrl = $SkillListUri + "?avatar_id=" + $entry.id + "&element_attr_id=" + $entry.element_attr_id + "&lang=ja-jp"
        $Response2 = Invoke-WebRequest -URI $GetUrl -Headers $Headers -WebSession $MySession -Verbose
        $ContentObj2 = ConvertFrom-Json -InputObject $Response2.Content
        if ($ContentObj2.data.list.Length -eq 0) {
            continue;
        }
        foreach ($entry2 in $ContentObj2.data.list) {
            $entry2.icon = $null
        }
        $Json2 = @{
            avatar_id  = $entry.id;
            skill_list = $ContentObj2.data.list;
        }
        $SkillList = $SkillList + $Json2
    }

    $AvatarList = $AvatarList + $ContentObj.data.list
}

$AvatarList | ConvertTo-Json -Depth 100 | Out-File -FilePath (Join-Path $OutputDir -ChildPath $AvatarListOutFile) -Encoding utf8
$SkillList | ConvertTo-Json -Depth 100 | Out-File -FilePath (Join-Path $OutputDir -ChildPath $SkillListOutFile) -Encoding utf8

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

    $Response = Invoke-WebRequest -URI $Uri -Method Post -Headers $Headers -ContentType "application/json; charset=UTF-8" -Body $BodyJson -WebSession $MySession -Verbose

    if ($Response.StatusCode -ne 200) {
        break;
    }

    # $ResponseContent = [System.Text.Encoding]::UTF8.GetString( [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($Response.Content) )
    $ContentObj = ConvertFrom-Json -InputObject $Response.Content

    if ($ContentObj.data.list.Length -eq 0) {
        break;
    }

    foreach ($entry in $ContentObj.data.list) {
        $entry.icon = $null
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

for ($reliquary_cat_id = 1; $reliquary_cat_id -le 5; $reliquary_cat_id++) {    
    $Body.page = 0
    while ($true) {
        $Body.reliquary_cat_id = $reliquary_cat_id
        $Body.page ++
        $BodyJson = $Body | ConvertTo-Json

        $Response = Invoke-WebRequest -URI $Uri -Method Post -Headers $Headers -ContentType "application/json; charset=UTF-8" -Body $BodyJson -WebSession $MySession -Verbose

        if ($Response.StatusCode -ne 200) {
            break;
        }

        # $ResponseContent = [System.Text.Encoding]::UTF8.GetString( [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($Response.Content) )
        $ContentObj = ConvertFrom-Json -InputObject $Response.Content

        if ($ContentObj.data.list.Length -eq 0) {
            break;
        }

        foreach ($entry in $ContentObj.data.list) {
            $entry.icon = $null
        }
        
        $ArtifactList = $ArtifactList + $ContentObj.data.list
    }
}

$ArtifactList | ConvertTo-Json -Depth 100 | Out-File -FilePath (Join-Path $OutputDir -ChildPath $ArtifactListOutFile) -Encoding utf8

