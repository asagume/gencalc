$Cookie = ""

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

    # $ResponseContent = [System.Text.Encoding]::UTF8.GetString( [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($Response.Content) )
    $ContentObj = ConvertFrom-Json -InputObject $Response.Content

    if ($ContentObj.data.list.Length -eq 0) {
        break;
    }

    foreach ($entry in $ContentObj.data.list) {
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

    # $ResponseContent = [System.Text.Encoding]::UTF8.GetString( [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($Response.Content) )
    $ContentObj = ConvertFrom-Json -InputObject $Response.Content

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

for ($reliquary_cat_id = 1; $reliquary_cat_id -lt 5; $reliquary_cat_id++) {    
    $Body.page = 0
    while ($true) {
        $Body.reliquary_cat_id = $reliquary_cat_id
        $Body.page ++
        $BodyJson = $Body | ConvertTo-Json

        $Response = Invoke-WebRequest -URI $Uri -Method Post -Headers $Headers -ContentType "application/json;charset=UTF-8" -Body $BodyJson -WebSession $MySession -Verbose

        if ($Response.StatusCode -ne 200) {
            break;
        }

        # $ResponseContent = [System.Text.Encoding]::UTF8.GetString( [System.Text.Encoding]::GetEncoding("ISO-8859-1").GetBytes($Response.Content) )
        $ContentObj = ConvertFrom-Json -InputObject $Response.Content

        if ($ContentObj.data.list.Length -eq 0) {
            break;
        }

        $ArtifactList = $ArtifactList + $ContentObj.data.list
    }
}

$ArtifactList | ConvertTo-Json -Depth 100 | Out-File -FilePath (Join-Path $OutputDir -ChildPath $ArtifactListOutFile) -Encoding utf8

