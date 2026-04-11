$jsFiles = Get-ChildItem -Path js\*.js
foreach ($file in $jsFiles) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    
    # Check if the file already has a UTF-8 BOM
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        continue
    }

    # Read the text (assuming it's written in UTF-8 without BOM or ANSI)
    # The safest way is to read as UTF-8
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # Write back with UTF-8 BOM
    $utf8WithBom = New-Object System.Text.UTF8Encoding($true)
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8WithBom)
}

# Also fix the HTML files just in case
$htmlFiles = Get-ChildItem -Filter *.html
foreach ($file in $htmlFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $utf8WithBom = New-Object System.Text.UTF8Encoding($true)
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8WithBom)
}

# And JSON language files
$jsonFiles = Get-ChildItem -Path assets\lang\*.json
foreach ($file in $jsonFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $utf8WithBom = New-Object System.Text.UTF8Encoding($true)
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8WithBom)
}
