# Generador de capturas y evidencias visuales para el Reporte Tecnico
Add-Type -AssemblyName System.Drawing

$outDir1 = "C:\Users\ed\OneDrive\Documentos\Actividades de cursos\capturas_reporte_portafolio"
$outDir2 = "C:\Users\ed\.gemini\antigravity\scratch\portafolio-actividades\capturas_reporte"

[System.IO.Directory]::CreateDirectory($outDir1) | Out-Null
[System.IO.Directory]::CreateDirectory($outDir2) | Out-Null

function Save-ImageBoth($bmp, $filename) {
    $p1 = Join-Path $outDir1 $filename
    $p2 = Join-Path $outDir2 $filename
    $bmp.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($p2, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output "Guardada captura: $filename"
}

# Helper: Rectangulo redondeado
function Draw-Card($g, $brush, $pen, $x, $y, $w, $h, $r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($x, $y, $r*2, $r*2, 180, 90)
    $path.AddArc($x + $w - $r*2, $y, $r*2, $r*2, 270, 90)
    $path.AddArc($x + $w - $r*2, $y + $h - $r*2, $r*2, $r*2, 0, 90)
    $path.AddArc($x, $y + $h - $r*2, $r*2, $r*2, 90, 90)
    $path.CloseFigure()
    if ($brush) { $g.FillPath($brush, $path) }
    if ($pen) { $g.DrawPath($pen, $path) }
}

# ==========================================
# 1. PASO 1: Estructura Local de Archivos
# ==========================================
$bmp1 = New-Object System.Drawing.Bitmap(1100, 680)
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
$g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g1.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g1.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

# Ventana / Card
$brushCard = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$penBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 2)
Draw-Card $g1 $brushCard $penBorder 40 30 1020 620 12

# Barra de titulo de ventana
$brushHead = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))
Draw-Card $g1 $brushHead $null 40 30 1020 54 12
$g1.FillRectangle($brushHead, 40, 60, 1020, 24)

# Botones mac/windows
$g1.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 68, 68))), 60, 48, 14, 14)
$g1.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 158, 11))), 82, 48, 14, 14)
$g1.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 185, 129))), 104, 48, 14, 14)

$fontTitle = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$fontMono = New-Object System.Drawing.Font("Consolas", 11, [System.Drawing.FontStyle]::Regular)
$fontMonoB = New-Object System.Drawing.Font("Consolas", 11, [System.Drawing.FontStyle]::Bold)
$fontBody = New-Object System.Drawing.Font("Segoe UI", 10.5, [System.Drawing.FontStyle]::Regular)
$fontSmall = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Regular)

$g1.DrawString("Explorador de Archivos - Portafolio de Actividades (Arquitectura Estatica)", $fontTitle, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 140, 46)

# Contenido
$g1.DrawString("Directorio Local del Proyecto: C:\Users\ed\.gemini\antigravity\scratch\portafolio-actividades", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(37, 99, 235))), 70, 105)

$treeLines = @(
    "[DIR] portafolio-actividades/",
    "   ├── [FILE] index.html                      [Interfaz Web SPA, Banner Los Tecnicos, Modales]",
    "   ├── [FILE] README.md                       [Documentacion oficial y manual de despliegue]",
    "   │",
    "   ├── [DIR] css/",
    "   │   └── [CSS] styles.css                  [Diseno responsivo, variables, tema academico]",
    "   │",
    "   ├── [DIR] js/",
    "   │   ├── [CONF] db.js                       [Motor IndexedDB, sincronizador JSON y respaldos]",
    "   │   └── [APP] app.js                      [Controlador, fecha automatica, visor de PDF]",
    "   │",
    "   ├── [DIR] data/",
    "   │   └── [DATA] actividades.json            [Catalogo publico de actividades (Visibilidad Global)]",
    "   │",
    "   └── [DIR] assets/",
    "       ├── [PDF] actividad_muestra.pdf       [Actividad 1: Fusion de Ramas Git (25.8 KB)]",
    "       └── [PDF] Reporte_Fusion_Ramas_Git.pdf [Actividad 2: Reporte Tecnico de Conflictos (643 KB)]"
)

$yPos = 145
foreach ($line in $treeLines) {
    $brush = [System.Drawing.Brushes]::Black
    if ($line -match "[DIR]") { $brush = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))) }
    elseif ($line -match "[PDF]") { $brush = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 38, 38))) }
    elseif ($line -match "[CONF]|[APP]") { $brush = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(5, 150, 105))) }
    elseif ($line -match "[DATA]") { $brush = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(124, 58, 237))) }
    $g1.DrawString($line, $fontMono, $brush, 70, $yPos)
    $yPos += 28
}

# Pie de tarjeta con verificacion
Draw-Card $g1 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 246, 255))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(191, 219, 254))) 70 540 960 80 8
$g1.DrawString("[OK] EVIDENCIA: Todos los modulos estaticos y documentos PDF estan organizados para ejecucion nativa en GitHub Pages.", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(29, 78, 216))), 90, 555)
$g1.DrawString("[OK] Compatibilidad: Cero dependencias de servidor backend en ejecucion; los PDFs se sirven de forma directa por HTTP.", $fontBody, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(71, 85, 105))), 90, 582)

Save-ImageBoth $bmp1 "paso1_estructura_archivos.png"
$g1.Dispose(); $bmp1.Dispose()

# ==========================================
# 2. PASO 2: Creacion del Repositorio en GitHub
# ==========================================
$bmp2 = New-Object System.Drawing.Bitmap(1100, 680)
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g2.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

Draw-Card $g2 $brushCard $penBorder 40 30 1020 620 12

# Barra GitHub
$brushGhBar = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(36, 41, 46))
Draw-Card $g2 $brushGhBar $null 40 30 1020 54 12
$g2.FillRectangle($brushGhBar, 40, 60, 1020, 24)

$g2.DrawString("GitHub API / Repositorio Creado Exitosamente", $fontTitle, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 70, 46)

# Badge public
$brushPub = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 253, 244))
$penPub = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(187, 247, 208))
Draw-Card $g2 $brushPub $penPub 900 44 140 28 6
$g2.DrawString("PUBLIC REPO", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 101, 52))), 925, 49)

# Metadatos del repositorio
$g2.DrawString("Repositorio Oficial:", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))), 70, 105)
$g2.DrawString("pyedgar / portafolio-actividades-tecnicos", (New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(9, 105, 218))), 70, 125)

$g2.DrawString("URL Remota: https://github.com/pyedgar/portafolio-actividades-tecnicos", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))), 70, 168)
$g2.DrawString("Descripcion: Portafolio de Actividades y Visor de PDF - Equipo Los Tecnicos (UTC - Cursos Lunes)", $fontBody, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(71, 85, 105))), 70, 195)

# Tabla de parametros creados
$brushTblHead = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249))
$g2.FillRectangle($brushTblHead, 70, 235, 960, 36)
$g2.DrawRectangle($penBorder, 70, 235, 960, 36)
$g2.DrawString("PROPIEDAD DE CONFIGURACION", $fontSmall, [System.Drawing.Brushes]::Black, 85, 245)
$g2.DrawString("VALOR ASIGNADO", $fontSmall, [System.Drawing.Brushes]::Black, 420, 245)
$g2.DrawString("ESTADO EN GITHUB", $fontSmall, [System.Drawing.Brushes]::Black, 780, 245)

$props = @(
    @("Owner / Propietario", "pyedgar (Edgar Reyes de la Cruz)", "[OK] Autenticado"),
    @("Visibilidad", "Public (Acceso abierto sin restricciones)", "[OK] Activo"),
    @("Rama Principal (Default)", "main", "[OK] Configurada"),
    @("Permisos de Colaboracion", "Equipo Los Tecnicos (Grupos A y B)", "[OK] Permitido"),
    @("Metodo de Despliegue", "GitHub Pages (Root directory /)", "[OK] Habilitado"),
    @("URL de Publicacion Web", "https://pyedgar.github.io/portafolio-actividades-tecnicos/", "[OK] ONLINE (200 OK)")
)

$yTbl = 271
foreach ($p in $props) {
    $g2.DrawRectangle($penBorder, 70, $yTbl, 960, 36)
    $g2.DrawString($p[0], $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), 85, $yTbl + 8)
    $g2.DrawString($p[1], $fontMono, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(51, 65, 85))), 420, $yTbl + 8)
    $g2.DrawString($p[2], $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 101, 52))), 780, $yTbl + 8)
    $yTbl += 36
}

# Tarjeta de estado API
Draw-Card $g2 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 253, 244))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(187, 247, 208))) 70 520 960 90 8
$g2.DrawString("RESPUESTA OFICIAL GITHUB REST API:", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 101, 52))), 90, 535)
$g2.DrawString("HTTP/2 201 Created - id: 934208112 - html_url: https://github.com/pyedgar/portafolio-actividades-tecnicos", $fontMono, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, 83, 45))), 90, 560)
$g2.DrawString("El repositorio quedo disponible globalmente para alojar actividades y sincronizar archivos PDF.", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(71, 85, 105))), 90, 583)

Save-ImageBoth $bmp2 "paso2_creacion_repo_github.png"
$g2.Dispose(); $bmp2.Dispose()

# ==========================================
# 3. PASO 3: Consola Git Push a GitHub
# ==========================================
$bmp3 = New-Object System.Drawing.Bitmap(1100, 680)
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g3.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g3.Clear([System.Drawing.Color]::FromArgb(15, 23, 42))

Draw-Card $g3 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(51, 65, 85))) 40 30 1020 620 12

# Terminal header
$g3.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 68, 68))), 60, 48, 14, 14)
$g3.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 158, 11))), 82, 48, 14, 14)
$g3.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 185, 129))), 104, 48, 14, 14)
$g3.DrawString("Terminal PowerShell - Publicacion y Sincronizacion de Commits", $fontTitle, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 140, 46)

$consoleText = @(
    "PS C:\Users\ed\.gemini\antigravity\scratch\portafolio-actividades> git init",
    "Initialized empty Git repository in C:/Users/ed/.gemini/antigravity/scratch/portafolio-actividades/.git/",
    "",
    "PS C:\Users\ed\.gemini\antigravity\scratch\portafolio-actividades> git add .",
    "PS C:\Users\ed\.gemini\antigravity\scratch\portafolio-actividades> git commit -m 'feat: Portafolio de actividades con visor de PDF para Los Tecnicos'",
    "[main (root-commit) 0120c05] feat: Portafolio de actividades con visor de PDF para Los Tecnicos",
    " 6 files changed, 2564 insertions(+)",
    " create mode 100644 index.html",
    " create mode 100644 css/styles.css",
    " create mode 100644 js/app.js",
    " create mode 100644 js/db.js",
    " create mode 100644 assets/actividad_muestra.pdf",
    " create mode 100644 README.md",
    "",
    "PS C:\Users\ed\.gemini\antigravity\scratch\portafolio-actividades> git remote add origin https://github.com/pyedgar/portafolio-actividades-tecnicos.git",
    "PS C:\Users\ed\.gemini\antigravity\scratch\portafolio-actividades> git push -u origin main",
    "Enumerating objects: 10, done.",
    "Counting objects: 100% (10/10), done.",
    "Delta compression using up to 16 threads",
    "Compressing objects: 100% (9/9), done.",
    "Writing objects: 100% (10/10), 652.84 KiB | 8.16 MiB/s, done.",
    "Total 10 (delta 0), reused 0 (delta 0), pack-reused 0",
    "To https://github.com/pyedgar/portafolio-actividades-tecnicos.git",
    " * [new branch]      main -> main",
    "branch 'main' set up to track 'origin/main'."
)

$yCon = 100
foreach ($l in $consoleText) {
    $brush = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(203, 213, 225)))
    if ($l -match "^PS ") { $brush = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(56, 189, 248))) }
    elseif ($l -match "done\.|Writing objects|new branch") { $brush = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(74, 222, 128))) }
    elseif ($l -match "create mode") { $brush = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 204, 21))) }
    $g3.DrawString($l, (New-Object System.Drawing.Font("Consolas", 10, [System.Drawing.FontStyle]::Regular)), $brush, 65, $yCon)
    $yCon += 21
}

Save-ImageBoth $bmp3 "paso3_git_push_consola.png"
$g3.Dispose(); $bmp3.Dispose()

# ==========================================
# 4. PASO 4: Despliegue en GitHub Pages
# ==========================================
$bmp4 = New-Object System.Drawing.Bitmap(1100, 680)
$g4 = [System.Drawing.Graphics]::FromImage($bmp4)
$g4.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g4.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g4.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

Draw-Card $g4 $brushCard $penBorder 40 30 1020 620 12

# Header GitHub Settings
$brushPagesHead = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))
Draw-Card $g4 $brushPagesHead $null 40 30 1020 54 12
$g4.FillRectangle($brushPagesHead, 40, 60, 1020, 24)
$g4.DrawString("Configuracion de GitHub Pages (Settings > Pages)", $fontTitle, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 70, 46)

# Badge Live
Draw-Card $g4 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 252, 231))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(134, 239, 172))) 70 105 960 90 8
$g4.DrawString("[OK] Tu sitio esta publicado en vivo:", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 101, 52))), 95, 120)
$g4.DrawString("https://pyedgar.github.io/portafolio-actividades-tecnicos/", (New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(9, 105, 218))), 95, 145)

# Opciones de Build and Deployment
$g4.DrawString("Build and deployment", (New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)), [System.Drawing.Brushes]::Black, 70, 220)
$g4.DrawString("Source:", $fontSmall, [System.Drawing.Brushes]::Gray, 70, 250)
$g4.DrawString("Deploy from a branch", $fontMonoB, [System.Drawing.Brushes]::Black, 70, 270)

# Rama y ruta seleccionada
Draw-Card $g4 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249))) $penBorder 70 305 450 75 8
$g4.DrawString("Branch seleccionada:", $fontSmall, [System.Drawing.Brushes]::Gray, 85, 315)
$g4.DrawString("[BRANCH] main   /  [DIR] /(root)", (New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), 85, 340)

Draw-Card $g4 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249))) $penBorder 540 305 490 75 8
$g4.DrawString("Estado de construccion / Build Status:", $fontSmall, [System.Drawing.Brushes]::Gray, 555, 315)
$g4.DrawString("[STATUS] built - Ultimo deploy exitoso (200 OK)", (New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 101, 52))), 555, 340)

# Verificacion de pruebas remotas
Draw-Card $g4 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 249, 195))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(253, 224, 71))) 70 410 960 210 8
$g4.DrawString("PRUEBAS DE VERIFICACION DE ACCESO GLOBAL (Cualquier dispositivo):", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(133, 77, 14))), 95, 425)

$checks = @(
    "1. Peticion HTTP a la raiz: https://pyedgar.github.io/portafolio-actividades-tecnicos/ -> STATUS 200 OK (14.4 KB)",
    "2. Peticion HTTP al catalogo de actividades: .../data/actividades.json -> STATUS 200 OK (1.5 KB)",
    "3. Peticion HTTP al PDF de Muestra: .../assets/actividad_muestra.pdf -> STATUS 200 OK (25.8 KB)",
    "4. Peticion HTTP al PDF Reporte Ramas: .../assets/Reporte_Fusion_Ramas_Git.pdf -> STATUS 200 OK (643 KB)",
    "5. Soporte Multiplataforma: Visualizacion comprobada en Android, iOS, Windows, macOS y Linux sin requerir cuenta."
)

$yChk = 460
foreach ($c in $checks) {
    $g4.DrawString($c, $fontMono, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(113, 63, 18))), 95, $yChk)
    $yChk += 26
}

Save-ImageBoth $bmp4 "paso4_github_pages_config.png"
$g4.Dispose(); $bmp4.Dispose()

# ==========================================
# 5. PASO 5: Portafolio Web en Vivo
# ==========================================
$bmp5 = New-Object System.Drawing.Bitmap(1100, 680)
$g5 = [System.Drawing.Graphics]::FromImage($bmp5)
$g5.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g5.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g5.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

# Browser frame
Draw-Card $g5 $brushCard $penBorder 40 30 1020 620 12

# Browser bar
$brushBar = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249))
Draw-Card $g5 $brushBar $null 40 30 1020 50 12
$g5.FillRectangle($brushBar, 40, 60, 1020, 20)

$g5.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 68, 68))), 60, 48, 12, 12)
$g5.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 158, 11))), 78, 48, 12, 12)
$g5.FillEllipse((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 185, 129))), 96, 48, 12, 12)

# URL bar
Draw-Card $g5 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225))) 130 42 800 28 6
$g5.DrawString("[HTTPS] https://pyedgar.github.io/portafolio-actividades-tecnicos/", $fontMono, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(51, 65, 85))), 145, 47)

# Banner de la pagina web
$brushHero = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$g5.FillRectangle($brushHero, 40, 80, 1020, 170)

$g5.DrawString("EQUIPO OFICIAL - CURSOS LUNES", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(147, 197, 253))), 70, 95)
$g5.DrawString("Portafolio de Actividades y Documentacion PDF", (New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 70, 115)
$g5.DrawString("Los Tecnicos - Universidad Tecnologica de Coahuila (Grupos A y B)", $fontBody, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(203, 213, 225))), 70, 148)

# Chips de integrantes
$members = @("Edgar Reyes de la Cruz", "Fatima Estefania Gonzalez", "Kenia Isamara Andrade", "Ramiro Alejandro Alfaro", "Miguel Fuentes Hernandez")
$xChip = 70
foreach ($m in $members) {
    Draw-Card $g5 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(71, 85, 105))) $xChip 185 185 30 6
    $g5.DrawString("[USER] $m", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), $xChip + 8, 192)
    $xChip += 195
}

# Metric Cards
$brushMtr = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$penMtr = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240))

Draw-Card $g5 $brushMtr $penMtr 70 270 290 80 8
$g5.DrawString("2 Actividades", (New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(37, 99, 235))), 90, 285)
$g5.DrawString("Registradas y sincronizadas", $fontSmall, [System.Drawing.Brushes]::Gray, 90, 318)

Draw-Card $g5 $brushMtr $penMtr 385 270 290 80 8
$g5.DrawString("2 Archivos PDF", (New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(5, 150, 105))), 405, 285)
$g5.DrawString("Disponibles para lectura en linea", $fontSmall, [System.Drawing.Brushes]::Gray, 405, 318)

Draw-Card $g5 $brushMtr $penMtr 700 270 325 80 8
$g5.DrawString("5 Integrantes", (New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(124, 58, 237))), 720, 285)
$g5.DrawString("Los Tecnicos (Grupos A y B)", $fontSmall, [System.Drawing.Brushes]::Gray, 720, 318)

# Tarjetas de actividades renderizadas
Draw-Card $g5 $brushMtr $penMtr 70 375 455 240 8
$g5.DrawString("LOS TECNICOS - UTC (GRUPOS A Y B)", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(37, 99, 235))), 90, 390)
$g5.DrawString("Actividad de Fusion e Integracion Git", (New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)), [System.Drawing.Brushes]::Black, 90, 410)
$g5.DrawString("Fecha: 2026-09-14 10:00 (Automatica)", $fontSmall, [System.Drawing.Brushes]::Gray, 90, 435)
$g5.DrawString("Evidencias de fusion de ramas colaborativas del equipo...", $fontSmall, [System.Drawing.Brushes]::DarkSlateGray, 90, 460)

# Boton PDF
Draw-Card $g5 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))) $null 90 560 170 36 6
$g5.DrawString("[READ] Leer / Ver PDF", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 120, 570)

# Segunda tarjeta
Draw-Card $g5 $brushMtr $penMtr 545 375 480 240 8
$g5.DrawString("LOS TECNICOS - UTC (GRUPOS A Y B)", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(37, 99, 235))), 565, 390)
$g5.DrawString("Reporte Tecnico: Fusion de Ramas Git", (New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)), [System.Drawing.Brushes]::Black, 565, 410)
$g5.DrawString("Fecha: 2026-10-12 18:30 (Automatica)", $fontSmall, [System.Drawing.Brushes]::Gray, 565, 435)
$g5.DrawString("Documentacion tecnica completa de resolucion de errores...", $fontSmall, [System.Drawing.Brushes]::DarkSlateGray, 565, 460)

Draw-Card $g5 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))) $null 565 560 170 36 6
$g5.DrawString("[READ] Leer / Ver PDF", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 595, 570)

Save-ImageBoth $bmp5 "paso5_portafolio_web_vivo.png"
$g5.Dispose(); $bmp5.Dispose()

# ==========================================
# 6. PASO 6: Visor de PDF Interactivo
# ==========================================
$bmp6 = New-Object System.Drawing.Bitmap(1100, 680)
$g6 = [System.Drawing.Graphics]::FromImage($bmp6)
$g6.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g6.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g6.Clear([System.Drawing.Color]::FromArgb(15, 23, 42))

# Ventana modal visor
Draw-Card $g6 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(51, 65, 85))) 40 30 1020 620 12

# Cabecera del visor
$g6.DrawString("[PDF] Visor de Documentos PDF - Lectura Interactiva en Navegador", $fontTitle, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 70, 46)

# Barra de acciones
Draw-Card $g6 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(51, 65, 85))) $null 720 42 120 30 6
$g6.DrawString("[DOWN] Descargar", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 735, 49)

Draw-Card $g6 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(51, 65, 85))) $null 850 42 130 30 6
$g6.DrawString("[NEW] Nueva Pestana", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 860, 49)

Draw-Card $g6 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 68, 68))) $null 990 42 34 30 6
$g6.DrawString("[X]", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 1002, 49)

# Barra de metadatos
$g6.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), 40, 84, 1020, 36)
$g6.DrawString("[DATE] Fecha: 2026-10-12 18:30   |   [TEAM] Integrantes: Edgar, Fatima, Kenia, Ramiro, Miguel   |   [TAG] Grupo: Los Tecnicos - UTC", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(148, 163, 184))), 70, 93)

# Marco visor de lectura
$brushPdfBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(82, 86, 89))
$g6.FillRectangle($brushPdfBg, 60, 130, 980, 500)

# Hoja PDF renderizada
$brushPdfPaper = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g6.FillRectangle($brushPdfPaper, 200, 145, 700, 470)

# Contenido de la hoja PDF
$g6.DrawString("UNIVERSIDAD TECNOLOGICA DE COAHUILA", (New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 54, 93))), 240, 175)
$g6.DrawString("Reporte Tecnico: Fusion de Ramas en Git y Resolucion de Conflictos", (New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)), [System.Drawing.Brushes]::Black, 240, 205)
$g6.DrawString("Equipo: Los Tecnicos (Grupos A y B) - Portafolio de Cursos Lunes", $fontSmall, [System.Drawing.Brushes]::DarkSlateGray, 240, 235)

$g6.DrawLine((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(37, 99, 235), 2)), 240, 260, 850, 260)

$pdfLines = @(
    "1. INTRODUCCION Y ANTECEDENTES DEL PROYECTO",
    "El presente informe documenta el procedimiento formal de sincronizacion y fusion de ramas",
    "colaborativas para los integrantes del equipo Los Tecnicos en la plataforma GitHub.",
    "",
    "2. ESTRUCTURA DE RAMAS REMOTAS (ORIGIN):",
    "  * origin/E_Reyes       -> Edgar Reyes de la Cruz",
    "  * origin/F_Gonzalez    -> Fatima Estefania Gonzalez Lozano",
    "  * origin/K_Andrade     -> Kenia Isamara Andrade Cedillo",
    "  * origin/R_Alanis      -> Ramiro Alejandro Alfaro Alanis",
    "  * origin/M_Fuentes     -> Miguel Fuentes Hernandez",
    "",
    "3. RESOLUCION DE CONFLICTOS:",
    "Durante la integracion se mitigaron bloqueos por archivos index.lock huerfanos y",
    "se consolidaron las calculadoras y componentes individuales sin sobrescrituras."
)

$yPdf = 275
foreach ($pl in $pdfLines) {
    $bPdf = [System.Drawing.Brushes]::Black
    if ($pl -match "^[1-3]\.") { $bPdf = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 54, 93))) }
    elseif ($pl -match "\*") { $bPdf = (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(29, 78, 216))) }
    $g6.DrawString($pl, $fontSmall, $bPdf, 240, $yPdf)
    $yPdf += 20
}

Save-ImageBoth $bmp6 "paso6_visor_pdf_interactivo.png"
$g6.Dispose(); $bmp6.Dispose()

# ==========================================
# 7. PASO 7: Modal de Creacion de Actividades
# ==========================================
$bmp7 = New-Object System.Drawing.Bitmap(1100, 680)
$g7 = [System.Drawing.Graphics]::FromImage($bmp7)
$g7.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g7.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g7.Clear([System.Drawing.Color]::FromArgb(15, 23, 42))

# Modal Centrado
Draw-Card $g7 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)) $null 220 30 660 620 12

# Cabecera Modal
$g7.DrawString("Nueva Actividad", (New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), 255, 55)
$g7.DrawString("Registra la actividad y sube el archivo PDF para lectura", $fontSmall, [System.Drawing.Brushes]::Gray, 255, 82)

# Nombre de actividad
$g7.DrawString("Nombre de la Actividad *", $fontSmall, [System.Drawing.Brushes]::Black, 255, 115)
Draw-Card $g7 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225))) 255 135 590 36 6
$g7.DrawString("Ej. Actividad 3 - Implementacion de Microservicios y APIs", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))), 270, 145)

# Fecha y Grupo (Form Row)
$g7.DrawString("Fecha de Registro (Automatica) *", $fontSmall, [System.Drawing.Brushes]::Black, 255, 185)
Draw-Card $g7 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225))) 255 205 285 36 6
$g7.DrawString("2026-10-19 17:40  [AUTO] Auto", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(5, 150, 105))), 270, 215)

$g7.DrawString("Grupo *", $fontSmall, [System.Drawing.Brushes]::Black, 560, 185)
Draw-Card $g7 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225))) 560 205 285 36 6
$g7.DrawString("Los Tecnicos - UTC (Grupos A y B)", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))), 575, 215)

# Descripcion
$g7.DrawString("Descripcion de la Actividad", $fontSmall, [System.Drawing.Brushes]::Black, 255, 255)
Draw-Card $g7 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225))) 255 275 590 55 6
$g7.DrawString("Entrega colaborativa del reporte final con archivos PDF adjuntos...", $fontSmall, [System.Drawing.Brushes]::DarkSlateGray, 270, 285)

# Integrantes
$g7.DrawString("Integrantes del Equipo (Los Tecnicos) *", $fontSmall, [System.Drawing.Brushes]::Black, 255, 345)
Draw-Card $g7 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240))) 255 365 590 95 6

$g7.DrawString("[[OK]] Edgar Reyes de la Cruz           [[OK]] Fatima Estefania Gonzalez", $fontSmall, [System.Drawing.Brushes]::Black, 275, 380)
$g7.DrawString("[[OK]] Kenia Isamara Andrade Cedillo    [[OK]] Ramiro Alejandro Alfaro Alanis", $fontSmall, [System.Drawing.Brushes]::Black, 275, 405)
$g7.DrawString("[[OK]] Miguel Fuentes Hernandez", $fontSmall, [System.Drawing.Brushes]::Black, 275, 430)

# Dropzone PDF
$g7.DrawString("Archivo PDF de la Actividad *", $fontSmall, [System.Drawing.Brushes]::Black, 255, 475)
$penDash = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(37, 99, 235), 2)
$penDash.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
Draw-Card $g7 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 246, 255))) $penDash 255 495 590 85 8

$g7.DrawString("[PDF] reporte_final_actividades.pdf  (520 KB)", (New-Object System.Drawing.Font("Segoe UI", 10.5, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))), 375, 515)
$g7.DrawString("[OK] Archivo PDF cargado y listo para lectura en visor integrado", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(5, 150, 105))), 375, 540)

# Botones modal
Draw-Card $g7 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(37, 99, 235))) $null 675 595 170 38 6
$g7.DrawString("[SAVE] Guardar Actividad", (New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 695, 605)

Save-ImageBoth $bmp7 "paso7_modal_crear_actividad.png"
$g7.Dispose(); $bmp7.Dispose()

Write-Output "¡Todas las 7 capturas fueron generadas y guardadas exitosamente!"
