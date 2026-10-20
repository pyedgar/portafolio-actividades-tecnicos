/**
 * Aplicación de Portafolio de Actividades con Visor de PDF
 * Integrantes oficiales del equipo Los Técnicos (Cursos Lunes - UTC)
 */

const OFFICIAL_MEMBERS = [
  'Edgar Reyes de la Cruz',
  'Fátima Estefanía González Lozano',
  'Kenia Isamara Andrade Cedillo',
  'Ramiro Alejandro Alfaro Alanis',
  'Miguel Fuentes Hernández'
];

let allActivities = [];
let selectedPdfFile = null;
let currentViewerBlobUrl = null;

// Elementos DOM
const dom = {
  teamChipsContainer: document.getElementById('teamChipsContainer'),
  membersCheckboxContainer: document.getElementById('membersCheckboxContainer'),
  activitiesGrid: document.getElementById('activitiesGrid'),
  emptyState: document.getElementById('emptyState'),
  emptyTitle: document.getElementById('emptyTitle'),
  emptySubtitle: document.getElementById('emptySubtitle'),
  searchInput: document.getElementById('searchInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  filterGroup: document.getElementById('filterGroup'),
  filterMember: document.getElementById('filterMember'),

  // Métricas
  statTotalActivities: document.getElementById('statTotalActivities'),
  statTotalPdfs: document.getElementById('statTotalPdfs'),
  statTotalMembers: document.getElementById('statTotalMembers'),

  // Modal Crear
  modalCreateActivity: document.getElementById('modalCreateActivity'),
  activityForm: document.getElementById('activityForm'),
  btnOpenModal: document.getElementById('btnOpenModal'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  btnCancelModal: document.getElementById('btnCancelModal'),
  btnEmptyCreate: document.getElementById('btnEmptyCreate'),
  activityName: document.getElementById('activityName'),
  activityDate: document.getElementById('activityDate'),
  activityGroup: document.getElementById('activityGroup'),
  activityDescription: document.getElementById('activityDescription'),
  btnNowDate: document.getElementById('btnNowDate'),
  btnSelectAllMembers: document.getElementById('btnSelectAllMembers'),
  btnDeselectAllMembers: document.getElementById('btnDeselectAllMembers'),
  extraMemberInput: document.getElementById('extraMemberInput'),
  btnAddExtraMember: document.getElementById('btnAddExtraMember'),

  // Dropzone PDF
  pdfDropzone: document.getElementById('pdfDropzone'),
  pdfFileInput: document.getElementById('pdfFileInput'),
  dropzoneIdle: document.getElementById('dropzoneIdle'),
  dropzoneSelected: document.getElementById('dropzoneSelected'),
  selectedPdfName: document.getElementById('selectedPdfName'),
  selectedPdfSize: document.getElementById('selectedPdfSize'),
  btnRemovePdf: document.getElementById('btnRemovePdf'),

  // Modal Visor
  modalPdfViewer: document.getElementById('modalPdfViewer'),
  btnCloseViewer: document.getElementById('btnCloseViewer'),
  viewerActivityName: document.getElementById('viewerActivityName'),
  viewerFileName: document.getElementById('viewerFileName'),
  viewerDate: document.getElementById('viewerDate'),
  viewerMembers: document.getElementById('viewerMembers'),
  viewerGroup: document.getElementById('viewerGroup'),
  pdfFrame: document.getElementById('pdfFrame'),
  btnDownloadPdf: document.getElementById('btnDownloadPdf'),
  btnOpenNewTab: document.getElementById('btnOpenNewTab'),

  // Backup / Restore
  btnBackup: document.getElementById('btnBackup'),
  btnRestore: document.getElementById('btnRestore'),
  fileRestoreInput: document.getElementById('fileRestoreInput'),

  toastContainer: document.getElementById('toastContainer')
};

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  renderTeamChips();
  renderMemberCheckboxes();
  setupEventListeners();
  setDefaultDateTime();
  await loadAndRenderActivities();
});

// Renderizar badges en el banner principal
function renderTeamChips() {
  dom.teamChipsContainer.innerHTML = OFFICIAL_MEMBERS.map(
    (member) => `<div class="team-chip"><i class="fa-solid fa-user-check"></i> <span>${escapeHtml(member)}</span></div>`
  ).join('');
}

// Renderizar lista de checkboxes de integrantes en el formulario
function renderMemberCheckboxes() {
  dom.membersCheckboxContainer.innerHTML = OFFICIAL_MEMBERS.map((member, index) => {
    const id = `member_cb_${index}`;
    return `
      <label class="member-checkbox-item" for="${id}">
        <input type="checkbox" id="${id}" value="${escapeHtml(member)}" checked>
        <span class="member-name">${escapeHtml(member)}</span>
      </label>
    `;
  }).join('');
}

// Configurar fecha y hora automática (formato YYYY-MM-DDTHH:mm)
function setDefaultDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  dom.activityDate.value = `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Event Listeners
function setupEventListeners() {
  // Abrir / Cerrar modal de creación
  dom.btnOpenModal.addEventListener('click', openCreateModal);
  if (dom.btnEmptyCreate) dom.btnEmptyCreate.addEventListener('click', openCreateModal);
  dom.btnCloseModal.addEventListener('click', closeCreateModal);
  dom.btnCancelModal.addEventListener('click', closeCreateModal);

  // Cerrar al hacer clic en el backdrop
  dom.modalCreateActivity.addEventListener('click', (e) => {
    if (e.target === dom.modalCreateActivity) closeCreateModal();
  });

  // Botón para actualizar a fecha y hora actual
  dom.btnNowDate.addEventListener('click', () => {
    setDefaultDateTime();
    showToast('Fecha y hora sincronizadas al momento actual', 'info');
  });

  // Acciones rápidas de integrantes
  dom.btnSelectAllMembers.addEventListener('click', () => {
    dom.membersCheckboxContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
  });

  dom.btnDeselectAllMembers.addEventListener('click', () => {
    dom.membersCheckboxContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  });

  // Agregar integrante adicional manual
  dom.btnAddExtraMember.addEventListener('click', addExtraMember);
  dom.extraMemberInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExtraMember();
    }
  });

  // Dropzone PDF
  dom.pdfDropzone.addEventListener('click', (e) => {
    if (e.target.closest('#btnRemovePdf')) return;
    dom.pdfFileInput.click();
  });

  dom.pdfFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedPdf(e.target.files[0]);
    }
  });

  // Drag and Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    dom.pdfDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dom.pdfDropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dom.pdfDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dom.pdfDropzone.classList.remove('dragover');
    });
  });

  dom.pdfDropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        handleSelectedPdf(file);
      } else {
        showToast('Por favor, selecciona un archivo en formato PDF.', 'danger');
      }
    }
  });

  dom.btnRemovePdf.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedPdfFile = null;
    dom.pdfFileInput.value = '';
    dom.dropzoneIdle.style.display = 'block';
    dom.dropzoneSelected.style.display = 'none';
  });

  // Form submit
  dom.activityForm.addEventListener('submit', handleFormSubmit);

  // Búsqueda y filtros
  dom.searchInput.addEventListener('input', () => {
    dom.btnClearSearch.style.display = dom.searchInput.value ? 'block' : 'none';
    filterActivities();
  });

  dom.btnClearSearch.addEventListener('click', () => {
    dom.searchInput.value = '';
    dom.btnClearSearch.style.display = 'none';
    filterActivities();
  });

  dom.filterGroup.addEventListener('change', filterActivities);
  dom.filterMember.addEventListener('change', filterActivities);

  // Visor de PDF
  dom.btnCloseViewer.addEventListener('click', closePdfViewer);
  dom.modalPdfViewer.addEventListener('click', (e) => {
    if (e.target === dom.modalPdfViewer) closePdfViewer();
  });

  // Tecla Escape para cerrar modales
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (dom.modalPdfViewer.style.display !== 'none') closePdfViewer();
      if (dom.modalCreateActivity.style.display !== 'none') closeCreateModal();
    }
  });

  // Respaldo e importación
  dom.btnBackup.addEventListener('click', exportDatabase);
  dom.btnRestore.addEventListener('click', () => dom.fileRestoreInput.click());
  dom.fileRestoreInput.addEventListener('change', importDatabase);
}

// Manejar PDF seleccionado
function handleSelectedPdf(file) {
  if (!file) return;
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    showToast('El archivo debe ser un documento PDF (.pdf)', 'danger');
    return;
  }
  selectedPdfFile = file;
  dom.selectedPdfName.textContent = file.name;
  dom.selectedPdfSize.textContent = formatBytes(file.size);
  dom.dropzoneIdle.style.display = 'none';
  dom.dropzoneSelected.style.display = 'flex';
}

// Agregar integrante extra
function addExtraMember() {
  const name = dom.extraMemberInput.value.trim();
  if (!name) return;

  const id = 'member_cb_extra_' + Date.now();
  const label = document.createElement('label');
  label.className = 'member-checkbox-item';
  label.htmlFor = id;
  label.innerHTML = `
    <input type="checkbox" id="${id}" value="${escapeHtml(name)}" checked>
    <span class="member-name">${escapeHtml(name)}</span>
  `;
  dom.membersCheckboxContainer.appendChild(label);
  dom.extraMemberInput.value = '';
  showToast(`Integrante "${name}" añadido a la lista.`, 'info');
}

// Modal Crear
function openCreateModal() {
  setDefaultDateTime();
  dom.modalCreateActivity.style.display = 'flex';
  dom.activityName.focus();
}

function closeCreateModal() {
  dom.modalCreateActivity.style.display = 'none';
  dom.activityForm.reset();
  selectedPdfFile = null;
  dom.dropzoneIdle.style.display = 'block';
  dom.dropzoneSelected.style.display = 'none';
  renderMemberCheckboxes();
}

// Guardar Actividad
async function handleFormSubmit(e) {
  e.preventDefault();

  const nombre = dom.activityName.value.trim();
  const fechaVal = dom.activityDate.value;
  const grupo = dom.activityGroup.value.trim() || 'Los Técnicos - UTC';
  const descripcion = dom.activityDescription.value.trim();

  // Obtener integrantes seleccionados
  const checkedBoxes = dom.membersCheckboxContainer.querySelectorAll('input[type="checkbox"]:checked');
  const integrantes = Array.from(checkedBoxes).map(cb => cb.value);

  if (!nombre) {
    showToast('Por favor, ingresa el nombre de la actividad.', 'danger');
    return;
  }

  if (integrantes.length === 0) {
    showToast('Debes seleccionar al menos un integrante para la actividad.', 'danger');
    return;
  }

  if (!selectedPdfFile) {
    showToast('Debes subir un archivo PDF para la actividad.', 'danger');
    return;
  }

  try {
    const formattedDate = formatDateTimeInput(fechaVal);

    const newActivity = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      nombre,
      fecha: formattedDate,
      grupo,
      descripcion,
      integrantes,
      pdfName: selectedPdfFile.name,
      pdfSize: selectedPdfFile.size,
      pdfType: selectedPdfFile.type || 'application/pdf',
      pdfBlob: selectedPdfFile,
      pdfUrl: null,
      createdAt: new Date(fechaVal).getTime() || Date.now()
    };

    await window.portfolioDB.saveActivity(newActivity);

    // Inmediatamente insertar en allActivities para feedback visual instantáneo
    if (!allActivities.some(a => a.id === newActivity.id)) {
      allActivities.unshift(newActivity);
    }
    updateStats();
    updateFilterDropdowns();
    filterActivities();

    showToast('¡Actividad y archivo PDF guardados correctamente!', 'success');
    closeCreateModal();
    await loadAndRenderActivities();
  } catch (error) {
    console.error('Error al guardar actividad:', error);
    showToast('Ocurrió un error al guardar la actividad.', 'danger');
  }
}

// Cargar y mostrar actividades
async function loadAndRenderActivities() {
  try {
    if (window.portfolioDB) {
      allActivities = await window.portfolioDB.getAllActivities();
    } else if (typeof DEFAULT_ACTIVITIES !== 'undefined') {
      allActivities = DEFAULT_ACTIVITIES;
    }
  } catch (err) {
    console.error('Error al cargar actividades:', err);
    if (typeof DEFAULT_ACTIVITIES !== 'undefined') {
      allActivities = DEFAULT_ACTIVITIES;
    }
  }

  updateStats();
  updateFilterDropdowns();
  filterActivities();
}

// Actualizar estadísticas
function updateStats() {
  dom.statTotalActivities.textContent = allActivities.length;
  dom.statTotalPdfs.textContent = allActivities.filter(a => a.pdfName || a.pdfBlob || a.pdfUrl).length;

  const uniqueMembers = new Set();
  OFFICIAL_MEMBERS.forEach(m => uniqueMembers.add(m));
  allActivities.forEach(a => {
    (a.integrantes || []).forEach(m => uniqueMembers.add(m));
  });
  dom.statTotalMembers.textContent = uniqueMembers.size;
}

// Actualizar opciones de los filtros
function updateFilterDropdowns() {
  const currentGroup = dom.filterGroup.value;
  const currentMember = dom.filterMember.value;

  const groups = new Set();
  const members = new Set();

  OFFICIAL_MEMBERS.forEach(m => members.add(m));

  allActivities.forEach(a => {
    if (a.grupo) groups.add(a.grupo);
    if (Array.isArray(a.integrantes)) {
      a.integrantes.forEach(m => members.add(m));
    }
  });

  dom.filterGroup.innerHTML = '<option value="todos">Todos los grupos</option>' +
    Array.from(groups).map(g => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join('');

  dom.filterMember.innerHTML = '<option value="todos">Todos los integrantes</option>' +
    Array.from(members).map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');

  if (Array.from(groups).includes(currentGroup)) dom.filterGroup.value = currentGroup;
  if (Array.from(members).includes(currentMember)) dom.filterMember.value = currentMember;
}

// Filtrar y renderizar tarjetas
function filterActivities() {
  const query = dom.searchInput.value.toLowerCase().trim();
  const groupFilter = dom.filterGroup.value;
  const memberFilter = dom.filterMember.value;

  const filtered = allActivities.filter(activity => {
    // Filtro por texto
    const matchQuery = !query ||
      (activity.nombre && activity.nombre.toLowerCase().includes(query)) ||
      (activity.descripcion && activity.descripcion.toLowerCase().includes(query)) ||
      (activity.grupo && activity.grupo.toLowerCase().includes(query)) ||
      (activity.integrantes && activity.integrantes.some(m => m.toLowerCase().includes(query)));

    // Filtro por grupo
    const matchGroup = (groupFilter === 'todos') || (activity.grupo === groupFilter);

    // Filtro por integrante
    const matchMember = (memberFilter === 'todos') ||
      (activity.integrantes && activity.integrantes.includes(memberFilter));

    return matchQuery && matchGroup && matchMember;
  });

  renderCards(filtered);
}

// Renderizar tarjetas en el grid
function renderCards(list) {
  if (list.length === 0) {
    dom.activitiesGrid.style.display = 'none';
    dom.emptyState.style.display = 'block';

    if (allActivities.length === 0) {
      dom.emptyTitle.textContent = 'No hay actividades registradas';
      dom.emptySubtitle.textContent = 'Crea tu primera actividad para subir archivos PDF y consultarlos.';
    } else {
      dom.emptyTitle.textContent = 'No se encontraron resultados';
      dom.emptySubtitle.textContent = 'Prueba ajustando los términos de búsqueda o los filtros.';
    }
    return;
  }

  dom.emptyState.style.display = 'none';
  dom.activitiesGrid.style.display = 'grid';

  dom.activitiesGrid.innerHTML = list.map(activity => {
    const hasPdf = Boolean(activity.pdfName || activity.pdfBlob || activity.pdfUrl);
    const pdfSizeText = activity.pdfSize ? formatBytes(activity.pdfSize) : 'Documento PDF';
    const isMainGroup = activity.grupo && activity.grupo.includes('Los Técnicos');

    const memberPillsHtml = (activity.integrantes || []).map(m => `
      <span class="member-pill">
        <i class="fa-solid fa-user"></i> ${escapeHtml(m)}
      </span>
    `).join('');

    return `
      <div class="activity-card" data-id="${activity.id}">
        <div>
          <div class="card-top">
            <span class="group-badge ${isMainGroup ? 'badge-accent' : ''}">
              <i class="fa-solid fa-layer-group"></i> ${escapeHtml(activity.grupo || 'General')}
            </span>
            <span class="date-badge">
              <i class="fa-regular fa-clock"></i> ${escapeHtml(activity.fecha || 'Sin fecha')}
            </span>
          </div>

          <h3 class="card-title">${escapeHtml(activity.nombre)}</h3>

          ${activity.descripcion ? `<p class="card-description">${escapeHtml(activity.descripcion)}</p>` : ''}

          <div class="card-members-section">
            <span class="section-label">Integrantes (${activity.integrantes ? activity.integrantes.length : 0})</span>
            <div class="members-pill-list">
              ${memberPillsHtml}
            </div>
          </div>
        </div>

        <div>
          ${hasPdf ? `
            <div class="pdf-file-box">
              <div class="pdf-file-meta">
                <i class="fa-solid fa-file-pdf pdf-icon-card"></i>
                <div class="pdf-name-wrap">
                  <span class="pdf-filename" title="${escapeHtml(activity.pdfName || 'Documento.pdf')}">${escapeHtml(activity.pdfName || 'Documento.pdf')}</span>
                  <span class="pdf-filesize">${pdfSizeText}</span>
                </div>
              </div>
            </div>
          ` : ''}

          <div class="card-actions">
            ${hasPdf ? `
              <button class="btn btn-read-pdf" onclick="openPdfViewer('${activity.id}')">
                <i class="fa-solid fa-book-open"></i> Leer / Ver PDF
              </button>
            ` : ''}
            <button class="btn btn-delete-card" onclick="deleteActivity('${activity.id}')" title="Eliminar actividad">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Abrir el visor de PDF
window.openPdfViewer = async function(activityId) {
  const activity = allActivities.find(a => a.id === activityId);
  if (!activity) return;

  // Revocar URL previa si existe
  if (currentViewerBlobUrl) {
    URL.revokeObjectURL(currentViewerBlobUrl);
    currentViewerBlobUrl = null;
  }

  let pdfSrc = null;

  if (activity.pdfBlob instanceof Blob) {
    currentViewerBlobUrl = URL.createObjectURL(activity.pdfBlob);
    pdfSrc = currentViewerBlobUrl;
  } else if (activity.pdfUrl) {
    pdfSrc = activity.pdfUrl;
  }

  if (!pdfSrc) {
    showToast('El archivo PDF no está disponible en este momento.', 'danger');
    return;
  }

  dom.viewerActivityName.textContent = activity.nombre;
  dom.viewerFileName.textContent = activity.pdfName || 'documento.pdf';
  dom.viewerDate.textContent = activity.fecha || 'Sin fecha';
  dom.viewerGroup.textContent = activity.grupo || 'General';
  dom.viewerMembers.textContent = (activity.integrantes || []).join(', ');

  dom.pdfFrame.src = pdfSrc;

  // Configurar descarga
  dom.btnDownloadPdf.onclick = () => {
    downloadFile(pdfSrc, activity.pdfName || 'actividad.pdf');
  };

  // Abrir en nueva pestaña
  dom.btnOpenNewTab.onclick = () => {
    window.open(pdfSrc, '_blank');
  };

  dom.modalPdfViewer.style.display = 'flex';
};

// Cerrar el visor
function closePdfViewer() {
  dom.modalPdfViewer.style.display = 'none';
  dom.pdfFrame.src = 'about:blank';
  if (currentViewerBlobUrl) {
    URL.revokeObjectURL(currentViewerBlobUrl);
    currentViewerBlobUrl = null;
  }
}

// Eliminar actividad
window.deleteActivity = async function(id) {
  const activity = allActivities.find(a => a.id === id);
  const name = activity ? activity.nombre : 'esta actividad';

  if (!confirm(`¿Estás seguro de eliminar "${name}"?\nEsta acción no se puede deshacer.`)) {
    return;
  }

  try {
    await window.portfolioDB.deleteActivity(id);
    showToast('Actividad eliminada con éxito.', 'info');
    await loadAndRenderActivities();
  } catch (error) {
    console.error('Error al eliminar:', error);
    showToast('Error al intentar eliminar la actividad.', 'danger');
  }
};

// Descargar archivo
function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Exportar respaldo de base de datos
async function exportDatabase() {
  try {
    showToast('Generando archivo de respaldo con documentos...', 'info');
    const jsonStr = await window.portfolioDB.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(url, `respaldo_portafolio_actividades_${dateStr}.json`);
    URL.revokeObjectURL(url);
    showToast('Respaldo descargado correctamente.', 'success');
  } catch (err) {
    console.error('Error al exportar:', err);
    showToast('No se pudo generar el respaldo.', 'danger');
  }
}

// Importar respaldo de base de datos
async function importDatabase(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  try {
    showToast('Importando actividades...', 'info');
    const text = await file.text();
    const count = await window.portfolioDB.importBackup(text);
    showToast(`Se importaron ${count} actividades exitosamente.`, 'success');
    dom.fileRestoreInput.value = '';
    await loadAndRenderActivities();
  } catch (err) {
    console.error('Error al importar:', err);
    showToast('Archivo de respaldo inválido o corrupto.', 'danger');
  }
}

// Utilidades
function formatDateTimeInput(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'danger') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
