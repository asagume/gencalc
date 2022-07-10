# 聖遺物
$uri = "https://sg-public-api.hoyolab.com/event/calculateos/reliquary/list"
$uri

$headers = @{
    Cookie = "";
}

$body = @{
    reliquary_levels = @();
    reliquary_cat_id = 1;
    page             = 1;
    size             = 20;
    lang             = "ja-jp";
}

$Response = Invoke-WebRequest -URI $uri -Method Post -Headers $headers -Body (ConvertTo-Json -InputObject $body)
$Response
