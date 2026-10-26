# Portafolio de Actividades y Visor de PDF 📚

Plataforma web interactiva para el registro, consulta y lectura de actividades académicas con archivos PDF integrados, desarrollada para el equipo **Los Técnicos** de la **Universidad Tecnológica de Coahuila (UTC)** para las materias y actividades del **Portafolio General de Cursos Lunes**.

![GitHub Pages](https://img.shields.io/badge/Despliegue-GitHub%20Pages-brightgreen)
![Firebase](https://img.shields.io/badge/Backend-Firebase%20Cloud-orange)
![Estado](https://img.shields.io/badge/Estado-100%25%20Funcional-blue)
![Tecnologías](https://img.shields.io/badge/Tecnolog%C3%ADas-HTML5%20%7C%20CSS3%20%7C%20JavaScript%20%7C%20Firebase-orange)

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

- **Sincronización en la Nube con Firebase (100% Gratuito):**
  - **Cloud Firestore:** Almacena los registros, datos de la actividad y autores en tiempo real.
  - **Firebase Storage:** Almacena los archivos PDF en los servidores seguros de Google.
  - **Tiempo Real:** Cualquier actividad que registre o elimine un integrante se actualiza automáticamente en las pantallas de los demás.
  - **Respaldo Local (IndexedDB):** Si no hay conexión o se usa offline, sigue guardando localmente sin fallar.
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
- **Búsqueda y Filtros Dinámicos:**
  - Buscador predictivo por título, contenido, grupo o integrante.
  - Filtros desplegables para consultar actividades por grupo específico o por integrante.
- **Copia de Seguridad e Importación:**
  - Botón **"Respaldar"**: Descarga una copia completa de las actividades y sus archivos PDF en un archivo JSON transportable.
  - Botón **"Importar"**: Restaura actividades y PDFs en cualquier computadora.
- **100% Listo para GitHub Pages:**
  - Despliegue estático, rápido y gratuito con certificado SSL (HTTPS).

---

## 📂 Estructura del Proyecto

```text
portafolio-actividades/
│
├── index.html                   # Estructura principal, modales y visor PDF
├── README.md                    # Documentación y guía de despliegue
│
├── css/
│   └── styles.css               # Estilos modernos, responsivos e indicadores de nube
│
├── js/
│   ├── firebase-config.js       # Conexión oficial a Firebase (Firestore y Storage)
│   ├── db.js                    # Motor híbrido (Cloud Firestore + IndexedDB)
│   └── app.js                   # Lógica de la app, fecha automática, filtros y visor
│
└── actividades_pdf/             # Documentos PDF oficiales del equipo
```

---

## 🌐 Pasos para Subir y Desplegar en GitHub Pages

### 1. Guardar y Subir Cambios a GitHub

En tu terminal (PowerShell o Git Bash):

```powershell
git add .
git commit -m "feat: Integrar Firebase Cloud Firestore y Storage para guardado en linea gratuito"
git push origin main
```

### 2. Activar GitHub Pages en 2 Clics

1. Entra a tu repositorio en GitHub: [github.com/pyedgar/portafolio-actividades-tecnicos](https://github.com/pyedgar/portafolio-actividades-tecnicos)
2. Ve a la pestaña **Settings** (Configuración).
3. En el menú izquierdo, haz clic en **Pages**.
4. En **Build and deployment**:
   - **Source:** Selecciona `Deploy from a branch`.
   - **Branch:** Selecciona `main` y la carpeta `/(root)`.
   - Haz clic en **Save** (Guardar).
5. Espera unos segundos y tu portafolio estará disponible en internet:
   👉 **`https://pyedgar.github.io/portafolio-actividades-tecnicos/`**
