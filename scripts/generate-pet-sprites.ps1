Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "public/assets/pets"
New-Item -ItemType Directory -Force $outDir | Out-Null

$cell = 256
$stages = @("egg", "baby", "adolescent", "adult")
$moods = @("idle", "happy", "hungry", "sleepy", "hyped", "sad", "sick")
$colors = @(
  @{ name = "blue"; base = "#6fd7ff"; light = "#c9f5ff"; dark = "#238ac2"; accent = "#ff73b7"; accentDark = "#d9438b"; cheek = "#ff9acb"; wing = "#b9e9ff"; sick = "#b9e5cf" },
  @{ name = "pink"; base = "#ff8fc7"; light = "#ffd8ec"; dark = "#d84d96"; accent = "#ffe156"; accentDark = "#e3a70e"; cheek = "#ffbad8"; wing = "#ffe6f4"; sick = "#c9e4c9" },
  @{ name = "green"; base = "#7ee36f"; light = "#d7ffd1"; dark = "#379940"; accent = "#28a8ff"; accentDark = "#1669b2"; cheek = "#ffd0dc"; wing = "#c6f9d0"; sick = "#bddfbc" },
  @{ name = "purple"; base = "#ad8cff"; light = "#eadfff"; dark = "#6647c8"; accent = "#4de5b1"; accentDark = "#219879"; cheek = "#ffa8cf"; wing = "#e5d9ff"; sick = "#c9d8cf" },
  @{ name = "orange"; base = "#ffad4f"; light = "#ffe2b8"; dark = "#cb6427"; accent = "#8758ff"; accentDark = "#5d35c8"; cheek = "#ffb3c9"; wing = "#ffe2cc"; sick = "#d4d7ba" },
  @{ name = "white"; base = "#fff7df"; light = "#ffffff"; dark = "#c9bfa3"; accent = "#ff5fa8"; accentDark = "#c73b78"; cheek = "#ffb4d3"; wing = "#ecf7ff"; sick = "#dce7d4" }
)
$accessories = @("ruby_crown", "javascript_shades", "typescript_visor", "python_wizard_hat", "rust_armor_accent", "go_jetpack", "caretaker_crown")
$ink = "#241633"
$white = "#fffdf8"

function C($hex, $alpha = 255) {
  $color = [System.Drawing.ColorTranslator]::FromHtml($hex)
  [System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B)
}

function Brush($hex, $alpha = 255) { New-Object System.Drawing.SolidBrush (C $hex $alpha) }
function Pen($hex, $width = 4) {
  $pen = New-Object System.Drawing.Pen (C $hex), $width
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $pen
}

function FillEllipse($g, $hex, $x, $y, $w, $h, $alpha = 255) { $b = Brush $hex $alpha; $g.FillEllipse($b, $x, $y, $w, $h); $b.Dispose() }
function StrokeEllipse($g, $hex, $x, $y, $w, $h, $width = 4) { $p = Pen $hex $width; $g.DrawEllipse($p, $x, $y, $w, $h); $p.Dispose() }
function FillRect($g, $hex, $x, $y, $w, $h, $alpha = 255) { $b = Brush $hex $alpha; $g.FillRectangle($b, $x, $y, $w, $h); $b.Dispose() }
function StrokeLine($g, $hex, $width, [float[]]$points) {
  $p = Pen $hex $width
  for ($i = 0; $i -lt $points.Length - 2; $i += 2) {
    $g.DrawLine($p, $points[$i], $points[$i + 1], $points[$i + 2], $points[$i + 3])
  }
  $p.Dispose()
}
function FillPoly($g, $hex, [float[]]$points, $alpha = 255) {
  $pts = @()
  for ($i = 0; $i -lt $points.Length; $i += 2) { $pts += New-Object System.Drawing.PointF($points[$i], $points[$i + 1]) }
  $b = Brush $hex $alpha
  $g.FillPolygon($b, [System.Drawing.PointF[]]$pts)
  $b.Dispose()
}
function ClosedCurvePath([float[]]$points, $tension = 0.35) {
  $pts = @()
  for ($i = 0; $i -lt $points.Length; $i += 2) { $pts += New-Object System.Drawing.PointF($points[$i], $points[$i + 1]) }
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddClosedCurve([System.Drawing.PointF[]]$pts, $tension)
  $path
}
function FillClosedCurve($g, $hex, [float[]]$points, $alpha = 255, $tension = 0.35) {
  $path = ClosedCurvePath $points $tension
  $b = Brush $hex $alpha
  $g.FillPath($b, $path)
  $b.Dispose(); $path.Dispose()
}
function StrokeClosedCurve($g, $hex, [float[]]$points, $width = 4, $tension = 0.35) {
  $path = ClosedCurvePath $points $tension
  $p = Pen $hex $width
  $g.DrawPath($p, $path)
  $p.Dispose(); $path.Dispose()
}
function StrokePoly($g, $hex, [float[]]$points, $width = 4) {
  $pts = @()
  for ($i = 0; $i -lt $points.Length; $i += 2) { $pts += New-Object System.Drawing.PointF($points[$i], $points[$i + 1]) }
  $p = Pen $hex $width
  $g.DrawPolygon($p, [System.Drawing.PointF[]]$pts)
  $p.Dispose()
}
function EggPath() {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddBezier(128, 42, 85, 45, 66, 100, 75, 148)
  $path.AddBezier(75, 148, 82, 196, 101, 216, 128, 216)
  $path.AddBezier(128, 216, 155, 216, 174, 196, 181, 148)
  $path.AddBezier(181, 148, 190, 100, 171, 45, 128, 42)
  $path.CloseFigure()
  $path
}
function FillPath($g, $path, $fill, $stroke = $ink, $strokeWidth = 7) {
  $b = Brush $fill
  $p = Pen $stroke $strokeWidth
  $g.FillPath($b, $path)
  $g.DrawPath($p, $path)
  $b.Dispose(); $p.Dispose(); $path.Dispose()
}
function DrawGloss($g, $x, $y, $w, $h, $alpha = 150) {
  FillEllipse $g $white $x $y $w $h $alpha
  FillEllipse $g $white ($x + $w * 0.22) ($y + $h * 0.14) ($w * 0.38) ($h * 0.38) ([Math]::Min(210, $alpha + 30))
}
function DrawFur($g, $pal, [float[]]$points) {
  for ($i = 0; $i -lt $points.Length; $i += 4) {
    StrokeLine $g $pal.light 4 @($points[$i], $points[$i + 1], $points[$i + 2], $points[$i + 3])
    StrokeLine $g $ink 2 @($points[$i], $points[$i + 1], $points[$i + 2], $points[$i + 3])
  }
}
function DrawPaws($g, $pal, $leftX, $rightX, $y) {
  FillEllipse $g $pal.light $leftX $y 26 19
  StrokeEllipse $g $ink $leftX $y 26 19 4
  FillEllipse $g $pal.light $rightX $y 26 19
  StrokeEllipse $g $ink $rightX $y 26 19 4
}
function DrawEgg($g, $pal, $species) {
  FillEllipse $g "#241633" 72 198 112 26 45
  FillPath $g (EggPath) $pal.light
  DrawGloss $g 104 66 22 42 150
  if ($species -eq "raccoon") {
    FillPoly $g $pal.dark @(86,119,108,104,148,104,170,119,149,132,107,132) 235
    StrokePoly $g $ink @(86,119,108,104,148,104,170,119,149,132,107,132) 5
    StrokeLine $g $pal.base 8 @(90,154,113,164,143,164,166,154)
    StrokeLine $g $pal.dark 6 @(99,181,117,189,139,189,157,181)
  } elseif ($species -eq "star_axolotl") {
    StrokeLine $g $pal.base 8 @(93,106,112,96,144,96,163,106)
    StrokeLine $g $pal.accent 7 @(94,143,114,154,142,154,162,143)
    StrokeLine $g $pal.dark 6 @(103,177,119,185,137,185,153,177)
  } else {
    FillPoly $g $pal.accent @(101,96,92,74,113,89) 230
    StrokePoly $g $ink @(101,96,92,74,113,89) 4
    FillPoly $g $pal.accent @(155,96,164,74,143,89) 230
    StrokePoly $g $ink @(155,96,164,74,143,89) 4
    StrokeLine $g $pal.base 8 @(94,139,114,150,142,150,162,139)
    StrokeLine $g $pal.dark 6 @(104,174,120,182,136,182,152,174)
  }
}
function Face($g, $pal, $mood, $x1, $x2, $y) {
  if ($mood -eq "sleepy") {
    StrokeLine $g $ink 5 @(($x1 - 8), $y, $x1, ($y + 5), ($x1 + 9), $y, ($x2 - 9), $y, $x2, ($y + 5), ($x2 + 8), $y)
    StrokeLine $g $ink 4 @(119, ($y + 31), 128, ($y + 35), 137, ($y + 31))
  } elseif ($mood -eq "hyped") {
    FillEllipse $g "#ffe156" ($x1 - 9) ($y - 12) 18 18
    FillEllipse $g "#ffe156" ($x2 - 9) ($y - 12) 18 18
    StrokeEllipse $g $ink ($x1 - 9) ($y - 12) 18 18 4
    StrokeEllipse $g $ink ($x2 - 9) ($y - 12) 18 18 4
    FillEllipse $g "#ff5f83" 116 ($y + 26) 24 17
    StrokeEllipse $g $ink 116 ($y + 26) 24 17 4
  } elseif ($mood -eq "sad" -or $mood -eq "sick") {
    FillEllipse $g $ink ($x1 - 7) ($y - 8) 14 21
    FillEllipse $g $ink ($x2 - 7) ($y - 8) 14 21
    StrokeLine $g $ink 4 @(119, ($y + 35), 128, ($y + 27), 137, ($y + 35))
    FillEllipse $g "#7de1ff" ($x2 + 7) ($y + 8) 9 17
    if ($mood -eq "sick") { StrokeLine $g "#6da66f" 5 @(98, ($y - 28), 112, ($y - 35), 138, ($y - 28)) }
  } elseif ($mood -eq "hungry") {
    FillEllipse $g $ink ($x1 - 7) ($y - 8) 14 20
    FillEllipse $g $ink ($x2 - 7) ($y - 8) 14 20
    FillEllipse $g $white 116 ($y + 25) 24 26
    StrokeEllipse $g $ink 116 ($y + 25) 24 26 4
  } else {
    FillEllipse $g $ink ($x1 - 8) ($y - 8) 16 23
    FillEllipse $g $ink ($x2 - 8) ($y - 8) 16 23
    FillEllipse $g $white ($x1 - 2) ($y - 4) 5 5
    FillEllipse $g $white ($x2 - 2) ($y - 4) 5 5
    StrokeLine $g $ink 4 @(116, ($y + 32), 128, ($y + 43), 140, ($y + 32))
  }
}
function DrawGoatDragon($g, $pal, $stage, $mood) {
  if ($stage -eq "egg") { DrawEgg $g $pal "goat"; return }
  $scale = if ($stage -eq "baby") { .86 } elseif ($stage -eq "adolescent") { 1.0 } else { 1.12 }
  $bodyFill = if ($mood -eq "sick") { $pal.sick } else { $pal.base }
  FillEllipse $g "#241633" 62 204 132 28 45
  FillPoly $g $pal.wing @(83,135,49,112,62,78,100,128) 255; StrokePoly $g $ink @(83,135,49,112,62,78,100,128) 6
  FillPoly $g $pal.wing @(173,135,207,112,194,78,156,128) 255; StrokePoly $g $ink @(173,135,207,112,194,78,156,128) 6
  FillPoly $g $pal.accent @(174,166,214,176,199,205,166,181) 255; StrokePoly $g $ink @(174,166,214,176,199,205,166,181) 6
  FillEllipse $g $bodyFill (128 - 59 * $scale) (150 - 51 * $scale) (118 * $scale) (102 * $scale)
  StrokeEllipse $g $ink (128 - 59 * $scale) (150 - 51 * $scale) (118 * $scale) (102 * $scale) 7
  FillEllipse $g $bodyFill (128 - 50 * $scale) (91 - 41 * $scale) (100 * $scale) (82 * $scale)
  StrokeEllipse $g $ink (128 - 50 * $scale) (91 - 41 * $scale) (100 * $scale) (82 * $scale) 7
  FillPoly $g $pal.accent @(97,65,84,32,112,57) 255; StrokePoly $g $ink @(97,65,84,32,112,57) 5
  FillPoly $g $pal.accent @(159,65,172,32,144,57) 255; StrokePoly $g $ink @(159,65,172,32,144,57) 5
  FillEllipse $g $pal.light 103 100 50 34
  StrokeEllipse $g $ink 103 100 50 34 5
  Face $g $pal $mood 110 146 90
}
function DrawRaccoon($g, $pal, $stage, $mood) {
  if ($stage -eq "egg") { DrawEgg $g $pal "raccoon"; return }
  $scale = if ($stage -eq "baby") { .86 } elseif ($stage -eq "adolescent") { 1.0 } else { 1.12 }
  $bodyFill = if ($mood -eq "sick") { $pal.sick } else { $pal.base }
  FillEllipse $g "#241633" 61 205 134 28 45
  FillPoly $g $pal.light @(166,167,215,142,204,204) 255; StrokePoly $g $ink @(166,167,215,142,204,204) 7
  StrokeLine $g $pal.dark 8 @(184,156,199,170,198,190,204,145,218,163,214,184)
  FillEllipse $g $bodyFill (128 - 58 * $scale) (154 - 52 * $scale) (116 * $scale) (104 * $scale)
  StrokeEllipse $g $ink (128 - 58 * $scale) (154 - 52 * $scale) (116 * $scale) (104 * $scale) 7
  FillEllipse $g $pal.light 96 131 64 62
  StrokeEllipse $g $ink 96 131 64 62 5
  FillPoly $g $bodyFill @(92,77,82,48,111,59) 255; StrokePoly $g $ink @(92,77,82,48,111,59) 6
  FillPoly $g $bodyFill @(164,77,174,48,145,59) 255; StrokePoly $g $ink @(164,77,174,48,145,59) 6
  FillEllipse $g $bodyFill (128 - 52 * $scale) (91 - 42 * $scale) (104 * $scale) (84 * $scale)
  StrokeEllipse $g $ink (128 - 52 * $scale) (91 - 42 * $scale) (104 * $scale) (84 * $scale) 7
  FillPoly $g $pal.dark @(84,91,105,66,151,66,172,91,151,117,105,117) 255; StrokePoly $g $ink @(84,91,105,66,151,66,172,91,151,117,105,117) 5
  FillEllipse $g $pal.light 104 106 48 30
  StrokeEllipse $g $ink 104 106 48 30 5
  Face $g $pal $mood 109 147 91
}
function DrawAxolotl($g, $pal, $stage, $mood) {
  if ($stage -eq "egg") { DrawEgg $g $pal "star_axolotl"; return }
  $scale = if ($stage -eq "baby") { .86 } elseif ($stage -eq "adolescent") { 1.0 } else { 1.12 }
  $bodyFill = if ($mood -eq "sick") { $pal.sick } else { $pal.base }
  FillEllipse $g "#241633" 61 205 134 28 45
  FillPoly $g $pal.wing @(172,162,211,152,198,194) 255; StrokePoly $g $ink @(172,162,211,152,198,194) 7
  FillEllipse $g $bodyFill (128 - 58 * $scale) (154 - 50 * $scale) (116 * $scale) (100 * $scale)
  StrokeEllipse $g $ink (128 - 58 * $scale) (154 - 50 * $scale) (116 * $scale) (100 * $scale) 7
  FillPoly $g $pal.accent @(74,92,85,79,101,83,91,96,96,113,80,105,65,113,70,96) 255; StrokePoly $g $ink @(74,92,85,79,101,83,91,96,96,113,80,105,65,113,70,96) 5
  FillPoly $g $pal.accent @(182,92,171,79,155,83,165,96,160,113,176,105,191,113,186,96) 255; StrokePoly $g $ink @(182,92,171,79,155,83,165,96,160,113,176,105,191,113,186,96) 5
  FillEllipse $g $bodyFill (128 - 55 * $scale) (93 - 41 * $scale) (110 * $scale) (82 * $scale)
  StrokeEllipse $g $ink (128 - 55 * $scale) (93 - 41 * $scale) (110 * $scale) (82 * $scale) 7
  StrokeLine $g $pal.light 8 @(91,113,111,126,145,126,165,113)
  FillEllipse $g $pal.cheek 99 110 14 14
  FillEllipse $g $pal.cheek 143 110 14 14
  Face $g $pal $mood 111 145 91
}
function DrawAccessory($g, $species, $stage, $accessory) {
  if ($stage -eq "egg") { return }
  $headY = if ($stage -eq "baby") { 62 } elseif ($stage -eq "adolescent") { 51 } else { 43 }
  $faceY = if ($stage -eq "baby") { 96 } elseif ($stage -eq "adolescent") { 89 } else { 82 }
  if ($species -eq "star_axolotl") { $headY += 2; $faceY += 6 }
  if ($accessory -eq "ruby_crown") {
    FillPoly $g "#e3315d" @(92, $headY, 103, 30, 120, $headY, 128, 30, 136, $headY, 153, 30, 164, $headY, 158, ($headY + 20), 98, ($headY + 20)) 255
    StrokePoly $g $ink @(92, $headY, 103, 30, 120, $headY, 128, 30, 136, $headY, 153, 30, 164, $headY, 158, ($headY + 20), 98, ($headY + 20)) 5
  } elseif ($accessory -eq "caretaker_crown") {
    FillPoly $g "#ffe156" @(88, ($headY + 4), 101, 29, 119, $headY, 128, 25, 137, $headY, 155, 29, 168, ($headY + 4), 159, ($headY + 24), 97, ($headY + 24)) 255
    StrokePoly $g $ink @(88, ($headY + 4), 101, 29, 119, $headY, 128, 25, 137, $headY, 155, 29, 168, ($headY + 4), 159, ($headY + 24), 97, ($headY + 24)) 5
  } elseif ($accessory -eq "javascript_shades") {
    FillRect $g "#ffe156" 88 ($faceY-13) 36 27
    FillRect $g "#ffe156" 132 ($faceY-13) 36 27
    StrokeLine $g $ink 6 @(88,$faceY,168,$faceY)
    StrokeLine $g $ink 5 @(88, ($faceY - 13), 124, ($faceY - 13), 124, ($faceY + 14), 88, ($faceY + 14), 88, ($faceY - 13), 132, ($faceY - 13), 168, ($faceY - 13), 168, ($faceY + 14), 132, ($faceY + 14), 132, ($faceY - 13))
  } elseif ($accessory -eq "typescript_visor") {
    FillPoly $g "#2f78ff" @(80, ($faceY - 16), 176, ($faceY - 16), 166, ($faceY + 18), 90, ($faceY + 18)) 255
    StrokePoly $g $ink @(80, ($faceY - 16), 176, ($faceY - 16), 166, ($faceY + 18), 90, ($faceY + 18)) 5
    StrokeLine $g "#bde9ff" 5 @(98, ($faceY - 3), 128, ($faceY - 9), 158, ($faceY - 3))
  } elseif ($accessory -eq "python_wizard_hat") {
    FillPoly $g "#7d6cff" @(107, ($headY + 10), 130, 16, 153, ($headY + 11)) 255
    StrokePoly $g $ink @(107, ($headY + 10), 130, 16, 153, ($headY + 11)) 5
    FillEllipse $g "#5a4fcf" 86 ($headY+4) 84 23
    StrokeEllipse $g $ink 86 ($headY+4) 84 23 5
  } elseif ($accessory -eq "rust_armor_accent" -and $stage -ne "baby") {
    FillPoly $g "#c56332" @(88,139,128,121,168,139,158,184,98,184) 255
    StrokePoly $g $ink @(88,139,128,121,168,139,158,184,98,184) 5
    StrokeLine $g "#ffbf7a" 5 @(128,126,128,183,103,151,153,151)
  } elseif ($accessory -eq "go_jetpack" -and $stage -ne "baby") {
    $x = if ($species -eq "raccoon") { 70 } else { 59 }
    FillRect $g "#47c7ff" $x 123 20 56
    FillRect $g "#47c7ff" ($x + 28) 123 20 56
    StrokeLine $g $ink 5 @($x, 123, ($x + 20), 123, ($x + 20), 179, $x, 179, $x, 123, ($x + 28), 123, ($x + 48), 123, ($x + 48), 179, ($x + 28), 179, ($x + 28), 123)
    FillPoly $g "#ff8b2b" @(($x + 2), 179, ($x + 10), 205, ($x + 18), 179, ($x + 30), 179, ($x + 38), 205, ($x + 46), 179) 255
  }
}
function NewSheet($width, $height) {
  $bmp = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)
  @{ bmp = $bmp; g = $g }
}

$speciesDraw = @{
  goat_dragon = ${function:DrawGoatDragon}
  raccoon = ${function:DrawRaccoon}
  star_axolotl = ${function:DrawAxolotl}
}

foreach ($species in @("goat_dragon", "raccoon", "star_axolotl")) {
  $sheet = NewSheet ($cell * 4) ($cell * $colors.Count * $moods.Count)
  for ($c = 0; $c -lt $colors.Count; $c++) {
    for ($m = 0; $m -lt $moods.Count; $m++) {
      for ($s = 0; $s -lt $stages.Count; $s++) {
        $state = $sheet.g.Save()
        $sheet.g.TranslateTransform($s * $cell, (($c * $moods.Count) + $m) * $cell)
        & $speciesDraw[$species] $sheet.g $colors[$c] $stages[$s] $moods[$m]
        $sheet.g.Restore($state)
      }
    }
  }
  $basePath = Join-Path $outDir "$species-base.png"
  $sheet.bmp.Save($basePath, [System.Drawing.Imaging.ImageFormat]::Png)
  $sheet.g.Dispose(); $sheet.bmp.Dispose()

  $accessorySheet = NewSheet ($cell * 4) ($cell * $accessories.Count)
  for ($a = 0; $a -lt $accessories.Count; $a++) {
    for ($s = 0; $s -lt $stages.Count; $s++) {
      $state = $accessorySheet.g.Save()
      $accessorySheet.g.TranslateTransform($s * $cell, $a * $cell)
      DrawAccessory $accessorySheet.g $species $stages[$s] $accessories[$a]
      $accessorySheet.g.Restore($state)
    }
  }
  $accPath = Join-Path $outDir "$species-accessories.png"
  $accessorySheet.bmp.Save($accPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $accessorySheet.g.Dispose(); $accessorySheet.bmp.Dispose()
}

Write-Host "Generated Pushpet PNG sprite sheets in $outDir"
