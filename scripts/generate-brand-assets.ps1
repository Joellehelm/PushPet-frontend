Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "public/assets/brand"
New-Item -ItemType Directory -Force $outDir | Out-Null

function C($hex, $alpha = 255) {
  $color = [System.Drawing.ColorTranslator]::FromHtml($hex)
  [System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B)
}

$bmp = New-Object System.Drawing.Bitmap 520, 160, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::Transparent)

$ink = C "#241633"
$pink = C "#ff5fa8"
$yellow = C "#ffe156"
$mint = C "#4de5b1"
$blue = C "#28a8ff"
$white = C "#fffdf8"

$pen = New-Object System.Drawing.Pen $ink, 8
$pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$brushPink = New-Object System.Drawing.SolidBrush $pink
$brushYellow = New-Object System.Drawing.SolidBrush $yellow
$brushMint = New-Object System.Drawing.SolidBrush $mint
$brushBlue = New-Object System.Drawing.SolidBrush $blue
$brushWhite = New-Object System.Drawing.SolidBrush $white
$brushInk = New-Object System.Drawing.SolidBrush $ink

$g.FillEllipse($brushBlue, 18, 26, 104, 104)
$g.DrawEllipse($pen, 18, 26, 104, 104)
$g.FillEllipse($brushYellow, 46, 54, 48, 48)
$g.DrawEllipse($pen, 46, 54, 48, 48)
$g.FillPolygon($brushPink, [System.Drawing.PointF[]]@(
  [System.Drawing.PointF]::new(43, 48),
  [System.Drawing.PointF]::new(57, 22),
  [System.Drawing.PointF]::new(70, 48)
))
$g.DrawPolygon($pen, [System.Drawing.PointF[]]@(
  [System.Drawing.PointF]::new(43, 48),
  [System.Drawing.PointF]::new(57, 22),
  [System.Drawing.PointF]::new(70, 48)
))
$g.FillPolygon($brushPink, [System.Drawing.PointF[]]@(
  [System.Drawing.PointF]::new(84, 48),
  [System.Drawing.PointF]::new(98, 22),
  [System.Drawing.PointF]::new(111, 48)
))
$g.DrawPolygon($pen, [System.Drawing.PointF[]]@(
  [System.Drawing.PointF]::new(84, 48),
  [System.Drawing.PointF]::new(98, 22),
  [System.Drawing.PointF]::new(111, 48)
))
$g.FillEllipse($brushInk, 58, 75, 9, 13)
$g.FillEllipse($brushInk, 79, 75, 9, 13)
$g.DrawArc($pen, 61, 88, 28, 20, 10, 160)
$g.FillEllipse($brushMint, 98, 18, 28, 28)
$g.DrawEllipse($pen, 98, 18, 28, 28)

$font = New-Object System.Drawing.Font "Arial Black", 48, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$smallFont = New-Object System.Drawing.Font "Arial Black", 21, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString("Pushpet", $font, $brushInk, 145, 35)
$g.DrawString("GitHub pet lab", $smallFont, $brushInk, 151, 96)
$g.DrawString("Pushpet", $font, $brushPink, 150, 40)
$g.DrawString("GitHub pet lab", $smallFont, $brushMint, 154, 99)

$path = Join-Path $outDir "pushpet-logo.png"
$bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

$font.Dispose(); $smallFont.Dispose(); $pen.Dispose()
$brushPink.Dispose(); $brushYellow.Dispose(); $brushMint.Dispose(); $brushBlue.Dispose(); $brushWhite.Dispose(); $brushInk.Dispose()
$g.Dispose(); $bmp.Dispose()

Write-Host "Generated Pushpet logo at $path"
