Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('assets/images/sd-logo.png')
Write-Host $img.Width $img.Height
$img.Dispose()
