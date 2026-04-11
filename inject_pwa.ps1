$htmlFiles = Get-ChildItem -Filter *.html
$tags = @"

  <meta name="theme-color" content="#060b16" />
  <link rel="manifest" href="manifest.json" />
  <link rel="apple-touch-icon" href="assets/images/logo.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
"@

foreach ($file in $htmlFiles) {
    if ((Get-Content $file.FullName -Raw) -match 'manifest\.json') {
        continue
    }

    $c = Get-Content $file.FullName -Raw
    $c = $c -replace '</title>', ("</title>" + $tags)
    [IO.File]::WriteAllText($file.FullName, $c)
}
