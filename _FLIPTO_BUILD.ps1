$distFolder = "C:\Git\snowplow-javascript-tracker\trackers\javascript-tracker\dist\"
$spLite = "sp.lite.js"
$ftSa = "ftsa2.js"
$spLitePath = $distFolder + $spLite
$spLiteMapPath = $spLitePath + ".map"
$ftSaPath = $distFolder + $ftSa
$ftsaMapPath = $ftSaPath + ".map";

cd C:\Git\snowplow-javascript-tracker\
if (Test-Path $ftSaPath) {
  Remove-Item $ftSaPath
}
if (Test-Path $ftsaMapPath) {
  Remove-Item $ftsaMapPath
}

rush update
rush build

(Get-Content $spLitePath).Replace($spLite, $ftSa) | Set-Content $ftSaPath
(Get-Content $spLiteMapPath).Replace($spLite, $ftSa) | Set-Content $ftsaMapPath

# Rename-Item -Path $spLitePath -NewName $ftSaPath
# Rename-Item -Path $spLiteMapPath -NewName $ftsaMapPath