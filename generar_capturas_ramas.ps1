# Generador de capturas de configuracion de ramas y subida de actividades
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

$fontTitle = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$fontMono = New-Object System.Drawing.Font("Consolas", 10.5, [System.Drawing.FontStyle]::Regular)
$fontMonoB = New-Object System.Drawing.Font("Consolas", 10.5, [System.Drawing.FontStyle]::Bold)
$fontBody = New-Object System.Drawing.Font("Segoe UI", 10.5, [System.Drawing.FontStyle]::Regular)
$fontSmall = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Regular)
$fontSmallB = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)

# ========================================================
# 1. RAMA 1: Creación del Repositorio en GitHub
# ========================================================
$bmp1 = New-Object System.Drawing.Bitmap(1100, 680)
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
$g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g1.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g1.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

Draw-Card $g1 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 2)) 40 30 1020 620 12

$brushHead = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(36, 41, 46))
Draw-Card $g1 $brushHead $null 40 30 1020 54 12
$g1.FillRectangle($brushHead, 40, 60, 1020, 24)
$g1.DrawString("GitHub - Creacion y Parametrizacion del Repositorio Remoto", $fontTitle, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 70, 46)

# Formulario de GitHub Mockup
$g1.DrawString("Create a new repository", (New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), 70, 105)
$g1.DrawString("Un repositorio contiene todos los archivos del proyecto, historiales de revision y ramas de trabajo.", $fontSmall, [System.Drawing.Brushes]::Gray, 70, 135)

# Owner y Repo Name
$g1.DrawString("Owner", $fontSmallB, [System.Drawing.Brushes]::Black, 70, 170)
$g1.DrawString("Repository name *", $fontSmallB, [System.Drawing.Brushes]::Black, 280, 170)

Draw-Card $g1 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225))) 70 195 190 38 6
$g1.DrawString("pyedgar", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), 85, 205)

$g1.DrawString("/", (New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)), [System.Drawing.Brushes]::Gray, 265, 202)

Draw-Card $g1 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(37, 99, 235), 2)) 280 195 450 38 6
$g1.DrawString("portafolio-actividades-tecnicos", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(37, 99, 235))), 295, 205)

Draw-Card $g1 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 253, 244))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(187, 247, 208))) 745 195 285 38 6
$g1.DrawString("[OK] Nombre disponible y valido", $fontSmallB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 101, 52))), 760, 205)

# Descripcion
$g1.DrawString("Description (optional)", $fontSmallB, [System.Drawing.Brushes]::Black, 70, 250)
Draw-Card $g1 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225))) 70 275 960 38 6
$g1.DrawString("Portafolio de Actividades y Visor de PDF - Equipo Los Tecnicos (UTC - Cursos Lunes)", $fontBody, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(51, 65, 85))), 85, 284)

# Visibilidad
Draw-Card $g1 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240))) 70 330 960 110 8
$g1.DrawString("(o) Public", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), 90, 345)
$g1.DrawString("    Cualquier persona en Internet puede ver este repositorio y acceder al sitio web desplegado en GitHub Pages.", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(71, 85, 105))), 90, 370)
$g1.DrawString("( ) Private", $fontMono, [System.Drawing.Brushes]::Gray, 90, 400)

# Resumen de Comandos ejecutados
Draw-Card $g1 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 246, 255))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(191, 219, 254))) 70 460 960 170 8
$g1.DrawString("COMANDOS TERMINAL PARA VINCULAR Y SUBIR EL PROYECTO INICIAL:", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(29, 78, 216))), 90, 475)
$g1.DrawString("git init                                                              # 1. Inicia Git localmente", $fontMono, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), 90, 502)
$g1.DrawString("git add . && git commit -m 'feat: Inicializar portafolio'             # 2. Prepara y confirma cambios", $fontMono, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), 90, 526)
$g1.DrawString("git branch -M main                                                    # 3. Define rama principal main", $fontMono, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), 90, 550)
$g1.DrawString("git remote add origin https://github.com/pyedgar/portafolio-actividades-tecnicos.git # 4. Conecta remoto", $fontMono, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), 90, 574)
$g1.DrawString("git push -u origin main                                               # 5. Sube a GitHub", $fontMono, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), 90, 598)

Save-ImageBoth $bmp1 "rama1_creacion_repo.png"
$g1.Dispose(); $bmp1.Dispose()

# ========================================================
# 2. RAMA 2: Configuración de Ramas en Git y GitHub
# ========================================================
$bmp2 = New-Object System.Drawing.Bitmap(1100, 680)
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g2.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

Draw-Card $g2 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 2)) 40 30 1020 620 12

Draw-Card $g2 $brushHead $null 40 30 1020 54 12
$g2.FillRectangle($brushHead, 40, 60, 1020, 24)
$g2.DrawString("Estructura y Configuracion de Ramas Colaborativas (Branches)", $fontTitle, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 70, 46)

$g2.DrawString("Mapa de Ramas del Repositorio (pyedgar / portafolio-actividades-tecnicos):", $fontSmallB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))), 70, 105)

# Tabla de Ramas Oficiales
$g2.FillRectangle((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249))), 70, 130, 960, 36)
$g2.DrawRectangle((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225))), 70, 130, 960, 36)
$g2.DrawString("NOMBRE DE LA RAMA", $fontSmallB, [System.Drawing.Brushes]::Black, 85, 140)
$g2.DrawString("RESPONSABLE / INTEGRANTE", $fontSmallB, [System.Drawing.Brushes]::Black, 340, 140)
$g2.DrawString("PROPOSITO Y ROL", $fontSmallB, [System.Drawing.Brushes]::Black, 680, 140)
$g2.DrawString("ESTADO REMOTO", $fontSmallB, [System.Drawing.Brushes]::Black, 890, 140)

$branchRows = @(
    @("main (default)", "Todo el Equipo (Los Tecnicos)", "Rama de Produccion (Despliega GitHub Pages)", "[ACTIVA]"),
    @("E_Reyes", "Edgar Reyes de la Cruz", "Desarrollo, estructura SPA y visor de PDF", "[ACTIVA]"),
    @("F_Gonzalez", "Fatima Estefania Gonzalez Lozano", "Entregas, reportes y revision de actividades", "[ACTIVA]"),
    @("K_Andrade", "Kenia Isamara Andrade Cedillo", "Diseno UI, catalogos y documentacion", "[ACTIVA]"),
    @("R_Alanis", "Ramiro Alejandro Alfaro Alanis", "Control de versiones, scripts y fusion de ramas", "[ACTIVA]"),
    @("M_Fuentes", "Miguel Fuentes Hernandez", "Control de calidad y pruebas multiplataforma", "[ACTIVA]")
)

$yBr = 166
foreach ($b in $branchRows) {
    $bgCol = [System.Drawing.Color]::White
    if ($b[0] -match "main") { $bgCol = [System.Drawing.Color]::FromArgb(240, 253, 244) }
    $g2.FillRectangle((New-Object System.Drawing.SolidBrush($bgCol)), 70, $yBr, 960, 36)
    $g2.DrawRectangle((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240))), 70, $yBr, 960, 36)
    
    $colorText = [System.Drawing.Color]::FromArgb(15, 23, 42)
    if ($b[0] -match "main") { $colorText = [System.Drawing.Color]::FromArgb(22, 101, 52) }
    
    $g2.DrawString($b[0], $fontMonoB, (New-Object System.Drawing.SolidBrush($colorText)), 85, $yBr + 8)
    $g2.DrawString($b[1], $fontBody, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(51, 65, 85))), 340, $yBr + 8)
    $g2.DrawString($b[2], $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(71, 85, 105))), 680, $yBr + 8)
    $g2.DrawString($b[3], $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(5, 150, 105))), 890, $yBr + 8)
    $yBr += 36
}

# Consola de Comandos para trabajar con ramas
Draw-Card $g2 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))) $null 70 400 960 230 8
$g2.DrawString("COMANDOS GIT PARA GESTION Y CONFIGURACION DE RAMAS:", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(56, 189, 248))), 90, 415)

$branchCmds = @(
    "# 1. Ver todas las ramas locales y remotas",
    "git branch -a",
    "",
    "# 2. Crear y situarse en una rama personal de trabajo (ejemplo: E_Reyes)",
    "git checkout -b E_Reyes",
    "",
    "# 3. Publicar la nueva rama hacia GitHub para colaborar con el equipo",
    "git push -u origin E_Reyes",
    "",
    "# 4. Cambiar entre ramas existentes",
    "git checkout main   # Regresa a la rama principal",
    "git checkout E_Reyes # Regresa a la rama individual"
)

$yCmd = 445
foreach ($c in $branchCmds) {
    $bCol = [System.Drawing.Color]::FromArgb(203, 213, 225)
    if ($c -match "^#") { $bCol = [System.Drawing.Color]::FromArgb(148, 163, 184) }
    elseif ($c -match "checkout|push") { $bCol = [System.Drawing.Color]::FromArgb(74, 222, 128) }
    $g2.DrawString($c, (New-Object System.Drawing.Font("Consolas", 10, [System.Drawing.FontStyle]::Regular)), (New-Object System.Drawing.SolidBrush($bCol)), 90, $yCmd)
    $yCmd += 18
}

Save-ImageBoth $bmp2 "rama2_configuracion_ramas.png"
$g2.Dispose(); $bmp2.Dispose()

# ========================================================
# 3. RAMA 3: Cómo Subir Actividades desde la Plataforma Web
# ========================================================
$bmp3 = New-Object System.Drawing.Bitmap(1100, 680)
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g3.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g3.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

Draw-Card $g3 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 2)) 40 30 1020 620 12

$brushWebHead = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(37, 99, 235))
Draw-Card $g3 $brushWebHead $null 40 30 1020 54 12
$g3.FillRectangle($brushWebHead, 40, 60, 1020, 24)
$g3.DrawString("Metodo 1: Subida de Actividades desde la Interfaz Web del Portafolio", $fontTitle, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 70, 46)

# Diagrama en 4 Pasos Visuales
$stepCols = @(
    @("PASO 1: Formulario", "Abrir '+ Nueva Actividad'", "1. Escribir nombre de actividad`n2. La FECHA se establece AUTOMATICAMENTE`n3. Seleccionar grupo oficial"),
    @("PASO 2: Integrantes", "Seleccionar Miembros", "1. Marcar integrantes de Los Tecnicos`n2. Edgar, Fatima, Kenia, Ramiro, Miguel`n3. Opcion para integrante extra"),
    @("PASO 3: Subir PDF", "Cargar Archivo .PDF", "1. Arrastrar y soltar archivo PDF`n2. Validacion de formato y tamano`n3. Vista previa del documento"),
    @("PASO 4: Guardar y Ver", "Almacenar y Visualizar", "1. Guardar en base de datos local`n2. Tarjeta visible en la rejilla`n3. Clic en 'Leer / Ver PDF' en visor")
)

$xStep = 70
foreach ($st in $stepCols) {
    Draw-Card $g3 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240))) $xStep 105 225 310 8
    
    # Header del paso
    Draw-Card $g3 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))) $null $xStep 105 225 36 8
    $g3.DrawString($st[0], $fontSmallB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), $xStep + 12, 115)
    
    $g3.DrawString($st[1], (New-Object System.Drawing.Font("Segoe UI", 10.5, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(37, 99, 235))), $xStep + 12, 155)
    
    $g3.DrawString($st[2], $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(51, 65, 85))), $xStep + 12, 185)
    
    $xStep += 245
}

# Tarjeta de caracteristicas avanzadas
Draw-Card $g3 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 253, 244))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(187, 247, 208))) 70 435 960 195 8
$g3.DrawString("VENTAJAS DE LA SUBIDA POR PLATAFORMA WEB:", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 101, 52))), 95, 450)

$webAdv = @(
    "[OK] Fecha y Hora Automatizadas: El sistema registra el instante de subida sin margen de error humano.",
    "[OK] Almacenamiento en IndexedDB: No se llena el navegador; soporta documentos PDF de decenas de Megabytes.",
    "[OK] Visor Nativo Embebido: El PDF se lee de inmediato en pantalla completa sin salir de la plataforma.",
    "[OK] Opcion de Respaldo Exportable: El boton 'Respaldar' descarga todas las actividades y PDFs en un archivo JSON transportable."
)

$yAdv = 485
foreach ($a in $webAdv) {
    $g3.DrawString($a, $fontMono, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, 83, 45))), 95, $yAdv)
    $yAdv += 32
}

Save-ImageBoth $bmp3 "rama3_subir_actividades_web.png"
$g3.Dispose(); $bmp3.Dispose()

# ========================================================
# 4. RAMA 4: Cómo Subir Actividades con Git al Repositorio
# ========================================================
$bmp4 = New-Object System.Drawing.Bitmap(1100, 680)
$g4 = [System.Drawing.Graphics]::FromImage($bmp4)
$g4.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g4.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g4.Clear([System.Drawing.Color]::FromArgb(15, 23, 42))

Draw-Card $g4 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(51, 65, 85))) 40 30 1020 620 12

$g4.DrawString("Metodo 2: Subida y Sincronizacion de Actividades mediante Git (Visibilidad Global)", $fontTitle, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 70, 46)

$gitWorkflowText = @(
    "# FLUJO PROFESIONAL PARA PUBLICAR NUEVAS ACTIVIDADES EN GITHUB PAGES:",
    "",
    "# PASO 1: Copiar el documento PDF en la carpeta de activos (assets/)",
    "Copy-Item 'Mi_Actividad_Nueva.pdf' 'portafolio-actividades\\assets\\Actividad_04.pdf'",
    "",
    "# PASO 2: Agregar la actividad al catalogo publico (data/actividades.json)",
    "# {",
    "#   'id': 'act-04-servicios',",
    "#   'nombre': 'Actividad 4 - Arquitectura de Servicios SOA',",
    "#   'fecha': '2026-10-26 12:00',",
    "#   'descripcion': 'Investigacion y diagramas de arquitectura...',",
    "#   'grupo': 'Los Tecnicos - UTC (Grupos A y B)',",
    "#   'integrantes': ['Edgar Reyes de la Cruz', 'Fatima Estefania Gonzalez', ...],",
    "#   'pdfName': 'Actividad_04.pdf',",
    "#   'pdfUrl': 'assets/Actividad_04.pdf'",
    "# }",
    "",
    "# PASO 3: Confirmar cambios en tu rama individual",
    "git checkout -b E_Reyes            # O sitdate en tu rama existente",
    "git add assets/Actividad_04.pdf data/actividades.json",
    "git commit -m 'feat: Agregar Actividad 4 y documento PDF'",
    "git push origin E_Reyes           # Sube tu entrega a tu rama en GitHub"
)

$yGit = 90
foreach ($gw in $gitWorkflowText) {
    $cBrush = [System.Drawing.Color]::FromArgb(203, 213, 225)
    if ($gw -match "^#") { $cBrush = [System.Drawing.Color]::FromArgb(148, 163, 184) }
    elseif ($gw -match "checkout|add|commit|push") { $cBrush = [System.Drawing.Color]::FromArgb(74, 222, 128) }
    elseif ($gw -match "Copy-Item") { $cBrush = [System.Drawing.Color]::FromArgb(56, 189, 248) }
    $g4.DrawString($gw, (New-Object System.Drawing.Font("Consolas", 9.5, [System.Drawing.FontStyle]::Regular)), (New-Object System.Drawing.SolidBrush($cBrush)), 70, $yGit)
    $yGit += 22
}

Draw-Card $g4 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(59, 130, 246))) 70 515 960 110 8
$g4.DrawString("RESULTADO DE LA PUBLICACION:", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(96, 165, 250))), 90, 530)
$g4.DrawString("Cualquier actividad consolidada en data/actividades.json queda visible para todos los integrantes y profesores", $fontSmall, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(226, 232, 240))), 90, 555)
$g4.DrawString("al acceder a: https://pyedgar.github.io/portafolio-actividades-tecnicos/", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(74, 222, 128))), 90, 580)

Save-ImageBoth $bmp4 "rama4_subir_actividades_git.png"
$g4.Dispose(); $bmp4.Dispose()

# ========================================================
# 5. RAMA 5: Fusión de Ramas y Despliegue en GitHub Pages
# ========================================================
$bmp5 = New-Object System.Drawing.Bitmap(1100, 680)
$g5 = [System.Drawing.Graphics]::FromImage($bmp5)
$g5.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g5.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g5.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

Draw-Card $g5 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240), 2)) 40 30 1020 620 12

Draw-Card $g5 $brushHead $null 40 30 1020 54 12
$g5.FillRectangle($brushHead, 40, 60, 1020, 24)
$g5.DrawString("Fusion de Ramas hacia 'main' y Despliegue Automatico en GitHub Pages", $fontTitle, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), 70, 46)

# Diagrama de ramas (Flowchart visual)
$g5.DrawString("Flujo de Integracion Continua (CI/CD) de GitHub Pages:", $fontSmallB, [System.Drawing.Brushes]::Gray, 70, 105)

# Ramas de integrantes (Izquierda)
$xRamas = 70
$yRamas = 135
$subRamas = @("E_Reyes", "F_Gonzalez", "K_Andrade", "R_Alanis", "M_Fuentes")
foreach ($sr in $subRamas) {
    Draw-Card $g5 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(241, 245, 249))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(203, 213, 225))) $xRamas $yRamas 160 36 6
    $g5.DrawString("🌿 $sr", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))), $xRamas + 15, $yRamas + 8)
    $yRamas += 46
}

# Flechas y Rama Main
$penArrow = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(37, 99, 235), 3)
$penArrow.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(4, 4)
$g5.DrawLine($penArrow, 240, 230, 400, 230)

# Caja de Merge
Draw-Card $g5 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 246, 255))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(191, 219, 254), 2)) 410 180 230 100 8
$g5.DrawString("PULL REQUEST / MERGE", $fontSmallB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(29, 78, 216))), 430, 195)
$g5.DrawString("🌿 main (Produccion)", (New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))), 430, 220)
$g5.DrawString("Consolidacion sin conflictos", $fontSmall, [System.Drawing.Brushes]::Gray, 430, 250)

# Flecha a GitHub Pages
$g5.DrawLine($penArrow, 650, 230, 780, 230)

# Caja GitHub Pages
Draw-Card $g5 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 253, 244))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(187, 247, 208), 2)) 790 180 240 100 8
$g5.DrawString("GITHUB PAGES (LIVE)", $fontSmallB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 101, 52))), 810, 195)
$g5.DrawString("🚀 Build & Deploy", (New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 101, 52))), 810, 220)
$g5.DrawString("Sitio web actualizado en 60s", $fontSmall, [System.Drawing.Brushes]::Gray, 810, 250)

# Pasos de comando para hacer merge
Draw-Card $g5 (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))) (New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 232, 240))) 70 380 960 250 8
$g5.DrawString("COMANDOS PARA FUSIONAR UNA RAMA HACIA MAIN Y DESPLEGAR:", $fontMonoB, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 41, 59))), 90, 395)

$mergeCmds = @(
    "# 1. Situarse en la rama principal main",
    "git checkout main",
    "",
    "# 2. Traer el estado mas reciente del repositorio remoto",
    "git pull origin main",
    "",
    "# 3. Fusionar los cambios de la rama del integrante",
    "git merge origin/E_Reyes   # O la rama correspondiente (F_Gonzalez, K_Andrade, R_Alanis, M_Fuentes)",
    "",
    "# 4. Publicar la rama main consolidada hacia GitHub",
    "git push origin main",
    "# El pipeline de GitHub Pages se activa automaticamente y publica la nueva version."
)

$yM = 425
foreach ($mc in $mergeCmds) {
    $cM = [System.Drawing.Color]::FromArgb(51, 65, 85)
    if ($mc -match "^#") { $cM = [System.Drawing.Color]::FromArgb(100, 116, 139) }
    elseif ($mc -match "checkout|pull|merge|push") { $cM = [System.Drawing.Color]::FromArgb(37, 99, 235) }
    $g5.DrawString($mc, (New-Object System.Drawing.Font("Consolas", 10, [System.Drawing.FontStyle]::Regular)), (New-Object System.Drawing.SolidBrush($cM)), 90, $yM)
    $yM += 20
}

Save-ImageBoth $bmp5 "rama5_fusion_despliegue_pages.png"
$g5.Dispose(); $bmp5.Dispose()

Write-Output "¡Todas las 5 capturas especializadas de ramas y subida de actividades fueron creadas!"
