# Portafolio de Actividades y Visor de PDF 📚

Plataforma web interactiva para el registro, consulta y lectura de actividades académicas con archivos PDF integrados, desarrollada para el equipo **Los Técnicos** de la **Universidad Tecnológica de Coahuila (UTC)** para las materias y actividades del **Portafolio General de Cursos Lunes**.

![GitHub Pages](https://img.shields.io/badge/Despliegue-GitHub%20Pages-brightgreen)
![Estado](https://img.shields.io/badge/Estado-100%25%20Funcional-blue)
![Tecnologías](https://img.shields.io/badge/Tecnolog%C3%ADas-HTML5%20%7C%20CSS3%20%7C%20JavaScript%20%7C%20IndexedDB-orange)

---

## 👥 Integrantes del Equipo (Los Técnicos - Grupos A y B)

Los mismos integrantes oficiales del portafolio general:

1. **Edgar Reyes de la Cruz**
2. **Fátima Estefanía González Lozano**
3. **Kenia Isamara Andrade Cedillo**
4. **Ramiro Alejandro Alfaro Alanis**
5. **Miguel Fuentes Hernández**

---

## 🚀 Características Principales

- **Registro de Actividades Completo:**
  - **Nombre de la actividad:** Título descriptivo de la entrega.
  - **Fecha automática:** Se captura y asigna en el momento exacto actual (`YYYY-MM-DD HH:mm`) con botón para resincronizar al instante.
  - **Descripción:** Detalles, instrucciones o notas adicionales.
  - **Grupo:** Selección rápida ("Los Técnicos - UTC", "Grupo A", "Grupo B", "Cursos Lunes" o grupo personalizado).
  - **Integrantes:** Selector dinámico con los 5 integrantes oficiales mediante checkboxes, con botones de "Seleccionar todos", "Deseleccionar" y la opción de añadir integrantes colaboradores adicionales.
- **Visor y Lector de PDFs Embebido:**
  - Drag & drop para arrastrar y soltar archivos `.pdf`.
  - Visor modal integrado que permite leer el PDF completo dentro del navegador (zoom, paginación, navegación, búsqueda de texto).
  - Botones directos para **Descargar PDF** y **Abrir en nueva pestaña**.
- **Almacenamiento Local de Alta Capacidad (IndexedDB):**
  - Los archivos PDF y las actividades se guardan localmente en el navegador mediante **IndexedDB**, lo que permite almacenar archivos grandes sin límites restrictivos.
- **Búsqueda y Filtros Dinámicos:**
  - Buscador predictivo por título, contenido, grupo o integrante.
  - Filtros desplegables para consultar actividades por grupo específico o por integrante.
- **Copia de Seguridad e Importación:**
  - Botón **"Respaldar"**: Descarga una copia completa de las actividades y sus archivos PDF en un archivo JSON transportable.
  - Botón **"Importar"**: Restaura actividades y PDFs en cualquier computadora.
- **100% Listo para GitHub Pages:**
  - No requiere servidor backend, base de datos externa ni configuraciones complejas de Node.js en tiempo de ejecución. Funciona de manera estática y fluida en GitHub Pages.

---

## 📂 Estructura del Proyecto

```text
portafolio-actividades/
│
├── index.html                   # Estructura principal y modales
├── README.md                    # Documentación y guía de despliegue
│
├── css/
│   └── styles.css               # Estilos modernos, responsivos y tema oscuro/claro
│
├── js/
│   ├── db.js                    # Motor IndexedDB para actividades y PDFs
│   └── app.js                   # Lógica de la app, fecha automática y visor
│
└── assets/
    └── actividad_muestra.pdf    # PDF de ejemplo inicial del equipo Los Técnicos
```

---

## 🌐 Pasos para Subir a GitHub y Activar GitHub Pages

### 1. Inicializar Git y Crear el Commit

Abre una terminal (PowerShell o Git Bash) en la carpeta del proyecto:

```powershell
cd "C:\Users\ed\.gemini\antigravity\scratch\portafolio-actividades"
git init
git add .
git commit -m "feat: Portafolio de actividades con visor de PDF y equipo Los Tecnicos"
git branch -M main
```

### 2. Crear Repositorio en GitHub

1. Entra a tu cuenta en [GitHub](https://github.com/new).
2. Crea un nuevo repositorio público, por ejemplo: `portafolio-actividades-tecnicos`.
3. Copia el enlace HTTPS del repositorio.

### 3. Vincular y Subir a GitHub

Ejecuta en tu terminal:

```powershell
git remote add origin https://github.com/pyedgar/portafolio-actividades-tecnicos.git
git push -u origin main
```

### 4. Activar GitHub Pages en 2 Clics

1. En tu repositorio en GitHub, entra a la pestaña **Settings** (Configuración).
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección **Build and deployment** -> **Branch**:
   - Selecciona la rama **`main`**.
   - Carpeta: **`/(root)`**.
   - Haz clic en **Save**.
4. ¡Listo! En 1 minuto tu portafolio estará en línea en:
   `https://pyedgar.github.io/portafolio-actividades-tecnicos/`
