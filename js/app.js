/**
 * Aplicación de Portafolio de Actividades con Visor de PDF, Sincronización en la Nube y Soporte Móvil
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
let currentDocSource = 'file'; // 'file' o 'drive'

// Galería de estilos anime con colores neón (Rojos, Rosas y Morados)
const ANIME_DEFAULTS = [
  { img: 'assets/images/anime/anime_pin_1.jpg', theme: 'neon-purple', tag: 'GOJO SATORU // 呪術廻戦', kanji: '虚式「茈」' },
  { img: 'assets/images/anime/anime_pin_2.png', theme: 'neon-pink', tag: 'TOGA HIMIKO // 渡我被身子', kanji: '狂気・愛' },
  { img: 'assets/images/anime/anime_neon_gojo_purple.jpg', theme: 'neon-purple', tag: 'HOLLOW PURPLE // 領域展開', kanji: '無量空処' },
  { img: 'assets/images/anime/anime_neon_cyberpunk_pink.jpg', theme: 'neon-pink', tag: 'CYBERPUNK // ネオン', kanji: '電脳都市' },
  { img: 'assets/images/anime/anime_pin_3.jpg', theme: 'neon-red', tag: 'MANGA ART // 漫画美学', kanji: '覚醒・血界' },
  { img: 'assets/images/anime/anime_neon_samurai.jpg', theme: 'neon-red', tag: 'SAMURAI SILHOUETTE // 侍の影', kanji: '一閃・斬撃' },
  { img: 'assets/images/anime/anime_neon_tokyo_night.jpg', theme: 'neon-purple', tag: 'TOKYO NIGHT // 東京の夜', kanji: '夜桜・月下' },
  { img: 'assets/images/anime/anime_neon_samurai_red.jpg', theme: 'neon-red', tag: 'BLADE MASTER // 鬼神の刃', kanji: '紅蓮・刃' },
  { img: 'assets/images/anime/anime_neon_synthwave_purple.jpg', theme: 'neon-purple', tag: 'SYNTHWAVE // シンセ', kanji: '超光速' }
];

function getAnimeMetaForActivity(activity, index) {
  if (activity && activity.animeImage) {
    return {
      img: activity.animeImage,
      theme: activity.animeTheme || 'neon-pink',
      tag: activity.animeTag || 'ANIME OTAKU',
      kanji: activity.animeKanji || '活動'
    };
  }
  const fallback = ANIME_DEFAULTS[index % ANIME_DEFAULTS.length];
  return {
    img: fallback.img,
    theme: fallback.theme,
    tag: fallback.tag,
    kanji: fallback.kanji
  };
}

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
  customAnimeUrlInput: document.getElementById('customAnimeUrlInput'),

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

  // Selector de Fuente de Documento
  btnSourceFile: document.getElementById('btnSourceFile'),
  btnSourceDrive: document.getElementById('btnSourceDrive'),
  sectionSourceFile: document.getElementById('sectionSourceFile'),
  sectionSourceDrive: document.getElementById('sectionSourceDrive'),
  driveUrlInput: document.getElementById('driveUrlInput'),

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
  viewerContainer: document.getElementById('viewerContainer'),
  btnDownloadPdf: document.getElementById('btnDownloadPdf'),
  btnOpenNewTab: document.getElementById('btnOpenNewTab'),

  // Backup / Restore
  btnBackup: document.getElementById('btnBackup'),
  btnRestore: document.getElementById('btnRestore'),
  fileRestoreInput: document.getElementById('fileRestoreInput'),

  toastContainer: document.getElementById('toastContainer')
};

// Detectar si el usuario está en un dispositivo móvil (Android / iOS)
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  setupNavbarAutoHide();
  setupPreferencesDrawer();
  setupTeamMembersModal();
  setupFirebaseStorageModal();
  setupAnimeVideoControls();
  setupAnimeCoverSelector();
  setupOtakuRadio();
  renderTeamChips();
  renderMemberCheckboxes();
  setupEventListeners();
  setDefaultDateTime();
  updateCloudBadge();
  await loadAndRenderActivities();

  // Escuchar sincronización en tiempo real desde Firebase
  if (window.firebaseService && window.firebaseService.isAvailable()) {
    window.firebaseService.onActivitiesChanged(async (cloudList) => {
      console.log('🔄 Sincronización en tiempo real desde Firebase:', cloudList.length);
      await loadAndRenderActivities();
      if (typeof updateStorageQuotaDisplay === 'function') {
        updateStorageQuotaDisplay();
      }
    });
  }
});

// Auto-hide Navbar al hacer scroll hacia abajo para mayor comodidad
function setupNavbarAutoHide() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // Siempre visible al inicio de la página
        if (currentScrollY <= 40) {
          navbar.classList.remove('navbar-hidden');
        } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
          // Scroll hacia abajo: ocultar navbar y título para máxima inmersión
          navbar.classList.add('navbar-hidden');
        } else if (currentScrollY < lastScrollY) {
          // Scroll hacia arriba: mostrar inmediatamente
          navbar.classList.remove('navbar-hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Control del Video Anime Vertical y Ambiente (Autoplay 100% silencioso y fluido)
function setupAnimeVideoControls() {
  const bgVideo = document.getElementById('bgVideo');
  const bgVideoAmbient = document.getElementById('bgVideoAmbient');

  if (!bgVideo) return;

  // El video de fondo permanece estrictamente silenciado (el audio proviene exclusivamente de la Radio Otaku)
  bgVideo.muted = true;
  if (bgVideoAmbient) bgVideoAmbient.muted = true;

  const playVideos = () => {
    bgVideo.play().catch(() => {});
    if (bgVideoAmbient) bgVideoAmbient.play().catch(() => {});
  };

  // Autoplay silencioso con reintento si el navegador restringe inicialmente
  playVideos();
  window.addEventListener('click', () => {
    playVideos();
  }, { once: true });
}

// =========================================================
// RADIO OTAKU CLÁSICA & TRANQUI (REPRODUCTOR DE MÚSICA ANIME)
// =========================================================
const OTAKU_RADIO_PLAYLIST = [
  {
    title: "Spirited Away - One Summer's Day",
    artist: "Studio Ghibli / Joe Hisaishi (Lo-Fi Chill)",
    badge: "GHIBLI CLÁSICO TRANQUI",
    cover: "assets/images/anime/anime_pin_1.jpg",
    url: "assets/audio/03_spirited_away_lofi.mp3",
    isLive: false
  },
  {
    title: "My Neighbor Totoro - Wind Path",
    artist: "Studio Ghibli (Piano Chill Vibes)",
    badge: "PIANO CLÁSICO TRANQUI",
    cover: "assets/images/anime/anime_pin_2.png",
    url: "assets/audio/01_totoro_ghibli_chill.mp3",
    isLive: false
  },
  {
    title: "Princess Mononoke - Ashitaka Theme",
    artist: "Studio Ghibli / Joe Hisaishi (Relax)",
    badge: "ORQUESTA & CHILL",
    cover: "assets/images/anime/anime_neon_samurai.jpg",
    url: "assets/audio/02_princess_mononoke_chill.mp3",
    isLive: false
  },
  {
    title: "LISTEN.moe Anime Radio Live",
    artist: "J-Pop & Anime Soundtracks 24/7",
    badge: "RADIO EN VIVO 24/7",
    cover: "assets/images/anime/anime_neon_cyberpunk_pink.jpg",
    url: "https://listen.moe/stream",
    isLive: true
  },
  {
    title: "Anime Chillhop & Groove",
    artist: "Future Funk & Anime Beats",
    badge: "RADIO EN VIVO 24/7",
    cover: "assets/images/anime/anime_neon_gojo_purple.jpg",
    url: "https://radio.yumi.moe/stream/1/",
    isLive: true
  }
];

let currentRadioTrackIndex = 0;
let isRadioPlaying = false;

function setupOtakuRadio() {
  const audio = document.getElementById('otakuAudioElement');
  const widget = document.getElementById('otakuRadioWidget');
  const btnToggleRadioPill = document.getElementById('btnToggleRadioPill');
  const btnFloatingRadioTrigger = document.getElementById('btnFloatingRadioTrigger');
  const btnCloseRadioWidget = document.getElementById('btnCloseRadioWidget');
  const btnMinimizeRadio = document.getElementById('btnMinimizeRadio');
  const iconMinimizeRadio = document.getElementById('iconMinimizeRadio');

  const btnPlayPause = document.getElementById('btnRadioPlayPause');
  const iconPlayPause = document.getElementById('iconRadioPlayPause');
  const btnPrev = document.getElementById('btnRadioPrev');
  const btnNext = document.getElementById('btnRadioNext');
  const btnMute = document.getElementById('btnRadioMute');
  const iconMute = document.getElementById('iconRadioMute');
  const volumeSlider = document.getElementById('radioVolumeSlider');
  const stationSelect = document.getElementById('radioStationSelect');

  const trackTitle = document.getElementById('radioTrackTitle');
  const trackArtist = document.getElementById('radioTrackArtist');
  const trackBadge = document.getElementById('radioStationBadge');
  const trackCover = document.getElementById('radioTrackCover');
  const coverWrap = document.querySelector('.track-cover-art');
  const eqBars = document.getElementById('radioEqBars');
  const liveDot = document.getElementById('radioLiveDot');

  const progressBar = document.getElementById('radioProgressBar');
  const progressFill = document.getElementById('radioProgressFill');
  const currentTimeLabel = document.getElementById('radioCurrentTime');
  const totalTimeLabel = document.getElementById('radioTotalTime');

  if (!audio || !widget) return;

  function loadTrack(index, autoPlay = false) {
    currentRadioTrackIndex = (index + OTAKU_RADIO_PLAYLIST.length) % OTAKU_RADIO_PLAYLIST.length;
    const track = OTAKU_RADIO_PLAYLIST[currentRadioTrackIndex];

    audio.src = track.url;
    audio.load();

    if (trackTitle) trackTitle.textContent = track.title;
    if (trackArtist) trackArtist.textContent = track.artist;
    if (trackBadge) trackBadge.textContent = track.badge;
    if (trackCover) trackCover.src = track.cover;
    if (stationSelect) stationSelect.value = currentRadioTrackIndex;

    progressFill.style.width = '0%';
    currentTimeLabel.textContent = '0:00';
    totalTimeLabel.textContent = track.isLive ? 'EN VIVO' : '--:--';

    if (autoPlay) {
      playRadio();
    }
  }

  function playRadio() {
    audio.play().then(() => {
      isRadioPlaying = true;
      updateRadioUI(true);
    }).catch(err => {
      console.warn('Reproducción de audio bloqueada o en espera de interacción:', err);
    });
  }

  function pauseRadio() {
    audio.pause();
    isRadioPlaying = false;
    updateRadioUI(false);
  }

  function updateRadioUI(playing) {
    if (iconPlayPause) {
      iconPlayPause.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }
    if (eqBars) {
      eqBars.classList.toggle('playing', playing);
    }
    if (coverWrap) {
      coverWrap.classList.toggle('playing', playing);
    }
    if (btnFloatingRadioTrigger) {
      btnFloatingRadioTrigger.classList.toggle('playing', playing);
    }
    if (liveDot) {
      liveDot.style.background = playing ? '#ff2a85' : '#10b981';
      liveDot.style.boxShadow = playing ? '0 0 10px #ff2a85' : '0 0 8px #10b981';
    }
  }

  // Cargar primera canción
  loadTrack(0, false);

  // Botón Play / Pause
  if (btnPlayPause) {
    btnPlayPause.addEventListener('click', () => {
      if (isRadioPlaying) {
        pauseRadio();
      } else {
        playRadio();
      }
    });
  }

  // Siguiente y Anterior
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      loadTrack(currentRadioTrackIndex + 1, isRadioPlaying);
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      loadTrack(currentRadioTrackIndex - 1, isRadioPlaying);
    });
  }

  // Cambio desde select
  if (stationSelect) {
    stationSelect.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10);
      loadTrack(idx, true);
    });
  }

  // Actualización de tiempo y barra de progreso
  audio.addEventListener('timeupdate', () => {
    const track = OTAKU_RADIO_PLAYLIST[currentRadioTrackIndex];
    if (track.isLive) {
      progressFill.style.width = '100%';
      currentTimeLabel.textContent = 'LIVE';
      totalTimeLabel.textContent = '24/7';
      return;
    }
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = pct + '%';
      currentTimeLabel.textContent = formatAudioTime(audio.currentTime);
      totalTimeLabel.textContent = formatAudioTime(audio.duration);
    }
  });

  audio.addEventListener('ended', () => {
    // Pasar a la siguiente canción automáticamente
    loadTrack(currentRadioTrackIndex + 1, true);
  });

  // Clic en la barra de progreso para adelantar/retroceder
  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      const track = OTAKU_RADIO_PLAYLIST[currentRadioTrackIndex];
      if (track.isLive) return;
      const rect = progressBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      if (audio.duration) {
        audio.currentTime = pos * audio.duration;
      }
    });
  }

  // Control de volumen
  if (volumeSlider) {
    audio.volume = parseFloat(volumeSlider.value);
    volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      audio.volume = val;
      audio.muted = (val === 0);
      if (iconMute) {
        iconMute.className = val === 0 ? 'fa-solid fa-volume-xmark' : (val < 0.5 ? 'fa-solid fa-volume-low' : 'fa-solid fa-volume-high');
      }
    });
  }

  // Botón silenciar
  if (btnMute) {
    btnMute.addEventListener('click', () => {
      audio.muted = !audio.muted;
      if (iconMute) {
        iconMute.className = audio.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
      }
      if (!audio.muted && volumeSlider && volumeSlider.value === '0') {
        volumeSlider.value = '0.5';
        audio.volume = 0.5;
      }
    });
  }

  // Minimizar / Expandir widget
  function toggleMinimize() {
    widget.classList.toggle('minimized');
    const isMin = widget.classList.contains('minimized');
    if (iconMinimizeRadio) {
      iconMinimizeRadio.className = isMin ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
    }
  }

  if (btnMinimizeRadio) {
    btnMinimizeRadio.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMinimize();
    });
  }

  // Cerrar y ocultar hacia el botón flotante
  function closeWidget() {
    widget.style.display = 'none';
    if (btnFloatingRadioTrigger) {
      btnFloatingRadioTrigger.style.display = 'flex';
    }
  }

  function openWidget() {
    widget.style.display = 'block';
    if (btnFloatingRadioTrigger) {
      btnFloatingRadioTrigger.style.display = 'none';
    }
  }

  if (btnCloseRadioWidget) {
    btnCloseRadioWidget.addEventListener('click', closeWidget);
  }

  if (btnFloatingRadioTrigger) {
    btnFloatingRadioTrigger.addEventListener('click', openWidget);
  }

  if (btnToggleRadioPill) {
    btnToggleRadioPill.addEventListener('click', () => {
      if (widget.style.display === 'none') {
        openWidget();
        if (!isRadioPlaying) playRadio();
      } else {
        if (widget.classList.contains('minimized')) {
          widget.classList.remove('minimized');
          if (iconMinimizeRadio) iconMinimizeRadio.className = 'fa-solid fa-chevron-down';
        } else {
          closeWidget();
        }
      }
    });
  }
}

function formatAudioTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Selector visual de portadas anime en el formulario de creación
function setupAnimeCoverSelector() {
  const container = document.getElementById('animeCoversSelector');
  if (!container) return;

  const options = container.querySelectorAll('.anime-cover-option');
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });
}

// Actualizar indicador de estado de la nube
function updateCloudBadge() {
  const badge = document.getElementById('cloudStatusBadge');
  const text = document.getElementById('cloudStatusText');
  if (!badge || !text) return;

  if (window.firebaseService && window.firebaseService.isAvailable()) {
    badge.className = 'cloud-status-badge';
    badge.innerHTML = '<i class="fa-solid fa-cloud"></i> <span>Firebase Conectado</span>';
    badge.title = 'Conectado a Firebase: sincronización en la nube activa';
  } else {
    badge.className = 'cloud-status-badge offline';
    badge.innerHTML = '<i class="fa-solid fa-hard-drive"></i> <span>Modo Local (IndexedDB)</span>';
    badge.title = 'Guardando en almacenamiento local del navegador';
  }
}

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

  // Botón ahora para la fecha
  dom.btnNowDate.addEventListener('click', () => {
    setDefaultDateTime();
    showToast('Fecha y hora actualizadas al momento actual.', 'info');
  });

  // Alternar entre Archivo Local y Google Drive
  if (dom.btnSourceFile && dom.btnSourceDrive) {
    dom.btnSourceFile.addEventListener('click', () => setDocSource('file'));
    dom.btnSourceDrive.addEventListener('click', () => setDocSource('drive'));
  }

  // Acciones rápidas de integrantes
  dom.btnSelectAllMembers.addEventListener('click', () => {
    dom.membersCheckboxContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
  });

  dom.btnDeselectAllMembers.addEventListener('click', () => {
    dom.membersCheckboxContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  });

  // Añadir integrante extra
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
    const file = e.target.files && e.target.files[0];
    if (file) handleSelectedPdf(file);
  });

  // Drag and Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    dom.pdfDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dom.pdfDropzone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dom.pdfDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dom.pdfDropzone.classList.remove('drag-over');
    });
  });

  dom.pdfDropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt.files && dt.files[0];
    if (file) handleSelectedPdf(file);
  });

  // Quitar archivo PDF
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

// Cambiar tipo de fuente de documento
function setDocSource(type) {
  currentDocSource = type;
  if (type === 'drive') {
    dom.btnSourceDrive.classList.add('active');
    dom.btnSourceFile.classList.remove('active');
    dom.sectionSourceDrive.style.display = 'block';
    dom.sectionSourceFile.style.display = 'none';
    dom.driveUrlInput.focus();
  } else {
    dom.btnSourceFile.classList.add('active');
    dom.btnSourceDrive.classList.remove('active');
    dom.sectionSourceFile.style.display = 'block';
    dom.sectionSourceDrive.style.display = 'none';
  }
}

// Convertir enlaces de Google Drive a formato embebible (/preview)
function convertGoogleDriveUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();

  let fileId = null;
  const matchFile = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFile) {
    fileId = matchFile[1];
  } else {
    const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchId) {
      fileId = matchId[1];
    } else {
      const matchDoc = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (matchDoc) fileId = matchDoc[1];
    }
  }

  if (fileId) {
    return {
      fileId,
      previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      viewUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`
    };
  }

  // Si no se detectó ID pero parece enlace de Google, usarlo directamente
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const preview = trimmed.replace(/\/view(\?.*)?$/, '/preview');
    return {
      fileId: 'drive',
      previewUrl: preview,
      viewUrl: trimmed,
      downloadUrl: trimmed
    };
  }

  return null;
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
  setDocSource('file');
  dom.modalCreateActivity.style.display = 'flex';
  dom.activityName.focus();
}

function closeCreateModal() {
  dom.modalCreateActivity.style.display = 'none';
  dom.activityForm.reset();
  selectedPdfFile = null;
  if (dom.driveUrlInput) dom.driveUrlInput.value = '';
  if (dom.customAnimeUrlInput) dom.customAnimeUrlInput.value = '';
  const firstCover = document.querySelector('.anime-cover-option');
  if (firstCover) {
    document.querySelectorAll('.anime-cover-option').forEach(o => o.classList.remove('selected'));
    firstCover.classList.add('selected');
    const radio = firstCover.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }
  setDocSource('file');
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

  let pdfName = 'documento.pdf';
  let pdfSize = 0;
  let pdfType = 'application/pdf';
  let pdfBlob = null;
  let pdfUrl = null;
  let isGoogleDrive = false;
  let driveOriginalUrl = null;

  if (currentDocSource === 'drive') {
    const driveInputVal = dom.driveUrlInput.value.trim();
    if (!driveInputVal) {
      showToast('Por favor, pega el enlace de Google Drive.', 'danger');
      dom.driveUrlInput.focus();
      return;
    }

    const driveInfo = convertGoogleDriveUrl(driveInputVal);
    if (!driveInfo) {
      showToast('Enlace de Google Drive inválido. Asegúrate de copiar el enlace compartido.', 'danger');
      return;
    }

    isGoogleDrive = true;
    pdfUrl = driveInfo.previewUrl;
    driveOriginalUrl = driveInputVal;
    pdfName = `${nombre} (Google Drive)`;
    pdfSize = 0;
  } else {
    if (!selectedPdfFile) {
      showToast('Debes seleccionar un archivo PDF o elegir la opción de Google Drive.', 'danger');
      return;
    }
    pdfName = selectedPdfFile.name;
    pdfSize = selectedPdfFile.size;
    pdfType = selectedPdfFile.type || 'application/pdf';
    pdfBlob = selectedPdfFile;
  }

  const submitBtn = dom.activityForm.querySelector('button[type="submit"]');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando en la nube...';
    }

    const formattedDate = formatDateTimeInput(fechaVal);

    // Portada anime seleccionada (Rojo, Rosa o Morado Neón)
    let animeImage = 'assets/images/anime/anime_neon_gojo_purple.jpg';
    let animeTheme = 'neon-purple';
    let animeTag = 'GOJO SATORU // 呪術廻戦';
    let animeKanji = '虚式「茈」';

    const customUrl = dom.customAnimeUrlInput ? dom.customAnimeUrlInput.value.trim() : '';
    if (customUrl) {
      animeImage = customUrl;
      animeTheme = 'neon-pink';
      animeTag = 'CUSTOM ANIME // カスタム';
      animeKanji = '特別';
    } else {
      const selectedRadio = document.querySelector('input[name="animeCoverOption"]:checked');
      if (selectedRadio) {
        animeImage = selectedRadio.value;
        animeTheme = selectedRadio.getAttribute('data-theme') || 'neon-purple';
        animeTag = selectedRadio.getAttribute('data-tag') || 'ANIME OTAKU';
        animeKanji = '活動';
      }
    }

    const newActivity = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      nombre,
      fecha: formattedDate,
      grupo,
      descripcion,
      integrantes,
      pdfName,
      pdfSize,
      pdfType,
      pdfBlob,
      pdfUrl,
      isGoogleDrive,
      driveOriginalUrl,
      animeImage,
      animeTheme,
      animeTag,
      animeKanji,
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

    showToast('¡Actividad guardada y sincronizada correctamente!', 'success');
    closeCreateModal();
    await loadAndRenderActivities();
  } catch (error) {
    console.error('Error al guardar actividad:', error);
    showToast('Ocurrió un error al guardar la actividad.', 'danger');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
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

  const allMembersSet = new Set(OFFICIAL_MEMBERS);
  allActivities.forEach(a => {
    if (Array.isArray(a.integrantes)) {
      a.integrantes.forEach(m => allMembersSet.add(m));
    }
  });
  dom.statTotalMembers.textContent = allMembersSet.size;
}

// Actualizar opciones de los desplegables de filtro
function updateFilterDropdowns() {
  const currentGroup = dom.filterGroup.value;
  const currentMember = dom.filterMember.value;

  const groups = new Set();
  const members = new Set();

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

  dom.activitiesGrid.innerHTML = list.map((activity, index) => {
    const hasPdf = Boolean(activity.pdfName || activity.pdfBlob || activity.pdfUrl);
    const isDrive = Boolean(activity.isGoogleDrive || (activity.pdfUrl && activity.pdfUrl.includes('drive.google.com')));
    const pdfSizeText = isDrive ? 'Google Drive' : (activity.pdfSize ? formatBytes(activity.pdfSize) : 'Documento PDF');
    const isMainGroup = activity.grupo && activity.grupo.includes('Los Técnicos');
    const animeMeta = getAnimeMetaForActivity(activity, index);

    const memberPillsHtml = (activity.integrantes || []).map(m => `
      <span class="member-pill">
        <i class="fa-solid fa-user"></i> ${escapeHtml(m)}
      </span>
    `).join('');

    return `
      <div class="activity-card theme-${animeMeta.theme}" data-id="${activity.id}">
        <div>
          <!-- Portada Anime Neón (Rojos, Rosas y Morados) -->
          <div class="card-anime-header">
            <img src="${escapeHtml(animeMeta.img)}" alt="${escapeHtml(activity.nombre)}" class="card-anime-img" loading="lazy" onerror="this.src='assets/images/anime/anime_neon_samurai.jpg'">
            <div class="card-anime-gradient"></div>
            <div class="anime-card-badge-row">
              <span class="anime-category-badge theme-${animeMeta.theme}">
                <i class="fa-solid fa-bolt"></i> ${escapeHtml(animeMeta.tag)}
              </span>
              <span class="anime-kanji-badge">${escapeHtml(animeMeta.kanji || '活動')}</span>
            </div>
          </div>

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
                <i class="${isDrive ? 'fa-brands fa-google-drive text-emerald' : 'fa-solid fa-file-pdf'} pdf-icon-card"></i>
                <div class="pdf-name-wrap">
                  <span class="pdf-filename" title="${escapeHtml(activity.pdfName || 'Documento.pdf')}">
                    ${escapeHtml(activity.pdfName || 'Documento.pdf')}
                  </span>
                  <div style="display:flex; align-items:center; gap:0.4rem; margin-top:2px;">
                    <span class="pdf-filesize">${pdfSizeText}</span>
                    ${isDrive ? '<span class="badge-drive"><i class="fa-brands fa-google-drive"></i> Drive</span>' : ''}
                  </div>
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

// Abrir el visor de PDF con soporte optimizado para celulares y Google Drive
window.openPdfViewer = async function(activityId) {
  const activity = allActivities.find(a => a.id === activityId);
  if (!activity) return;

  // Revocar URL previa si existe
  if (currentViewerBlobUrl) {
    URL.revokeObjectURL(currentViewerBlobUrl);
    currentViewerBlobUrl = null;
  }

  let pdfSrc = null;
  const isDrive = Boolean(activity.isGoogleDrive || (activity.pdfUrl && activity.pdfUrl.includes('drive.google.com')));

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

  // En celulares, los iframes con blobs locales son bloqueados por Android.
  // Proporcionamos un contenedor adaptado si es móvil con botón grande de lectura nativa.
  const mobile = isMobileDevice();

  if (mobile && !isDrive) {
    dom.viewerContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; padding:2rem; text-align:center; color:#f8fafc;">
        <div style="font-size:3.5rem; color:#ef4444; margin-bottom:1rem;">
          <i class="fa-solid fa-file-pdf"></i>
        </div>
        <h3 style="font-size:1.15rem; margin-bottom:0.5rem; color:#ffffff;">${escapeHtml(activity.pdfName || 'Documento PDF')}</h3>
        <p style="font-size:0.85rem; color:#94a3b8; max-width:320px; margin-bottom:1.5rem; line-height:1.4;">
          Para leerlo en tu celular sin restricciones, pulsa el botón para abrirlo en el visor nativo de tu teléfono.
        </p>
        <div style="display:flex; flex-direction:column; gap:0.75rem; width:100%; max-width:280px;">
          <button id="btnMobileOpen" class="btn btn-primary" style="padding:0.75rem 1.25rem; font-size:0.95rem; justify-content:center;">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir en Lector del Celular
          </button>
          <button id="btnMobileDownload" class="btn btn-secondary" style="padding:0.65rem 1.25rem; font-size:0.9rem; justify-content:center;">
            <i class="fa-solid fa-download"></i> Descargar Archivo
          </button>
        </div>
      </div>
    `;

    document.getElementById('btnMobileOpen').onclick = () => {
      window.open(pdfSrc, '_blank');
    };
    document.getElementById('btnMobileDownload').onclick = () => {
      downloadFile(pdfSrc, activity.pdfName || 'actividad.pdf');
    };
  } else {
    // Computadora o enlace interactivo de Google Drive
    dom.viewerContainer.innerHTML = `<iframe id="pdfFrame" src="${encodeURI(pdfSrc)}" frameborder="0"></iframe>`;
  }

  // Configurar botones de barra superior
  if (isDrive) {
    const driveOpenUrl = activity.driveOriginalUrl || activity.pdfUrl.replace('/preview', '/view');
    dom.btnDownloadPdf.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir en Google Drive';
    dom.btnDownloadPdf.onclick = () => window.open(driveOpenUrl, '_blank');
    dom.btnOpenNewTab.onclick = () => window.open(pdfSrc, '_blank');
  } else {
    dom.btnDownloadPdf.innerHTML = '<i class="fa-solid fa-download"></i> Descargar';
    dom.btnDownloadPdf.onclick = () => downloadFile(pdfSrc, activity.pdfName || 'actividad.pdf');
    dom.btnOpenNewTab.onclick = () => window.open(pdfSrc, '_blank');
  }

  dom.modalPdfViewer.style.display = 'flex';
};

// Cerrar el visor
function closePdfViewer() {
  dom.modalPdfViewer.style.display = 'none';
  if (dom.viewerContainer) {
    dom.viewerContainer.innerHTML = '<iframe id="pdfFrame" src="about:blank" frameborder="0"></iframe>';
  }
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

// =========================================================
// MÓDULO 1: PREFERENCIAS DE TEMA Y COLORES GLOBALES
// =========================================================
const PREF_BG_PALETTE = [
  { id: 'onyx', name: 'Negro Ónix', color: '#08040d', cardBg: '#120b1c' },
  { id: 'midnight', name: 'Azul Noche', color: '#070d18', cardBg: '#0f172a' },
  { id: 'otaku-purple', name: 'Púrpura Anime', color: '#100520', cardBg: '#1a0b33' },
  { id: 'indigo', name: 'Índigo Profundo', color: '#090a1f', cardBg: '#13143d' },
  { id: 'emerald', name: 'Cyber Esmeralda', color: '#041411', cardBg: '#09241e' },
  { id: 'crimson', name: 'Carmesí Oscuro', color: '#18050c', cardBg: '#280915' },
  { id: 'oled', name: 'Negro OLED', color: '#010102', cardBg: '#0c0c10' }
];

const PREF_ACCENT_PALETTE = [
  { id: 'amber', name: 'Dorado / Ámbar', color: '#d4973b', secondary: '#f97316', tertiary: '#ffd166', glow: 'rgba(212, 151, 59, 0.5)' },
  { id: 'yellow', name: 'Amarillo Neón', color: '#eab308', secondary: '#f59e0b', tertiary: '#fde047', glow: 'rgba(234, 179, 8, 0.5)' },
  { id: 'orange', name: 'Naranja Neón', color: '#f97316', secondary: '#ef4444', tertiary: '#fb923c', glow: 'rgba(249, 115, 22, 0.5)' },
  { id: 'coral', name: 'Rojo Carmesí', color: '#ff2e56', secondary: '#a855f7', tertiary: '#ff758f', glow: 'rgba(255, 46, 86, 0.5)' },
  { id: 'pink', name: 'Rosa Neón', color: '#ff2a85', secondary: '#a855f7', tertiary: '#ff70a6', glow: 'rgba(255, 42, 133, 0.5)' },
  { id: 'magenta', name: 'Fucsia Magenta', color: '#ec4899', secondary: '#8b5cf6', tertiary: '#f472b6', glow: 'rgba(236, 72, 153, 0.5)' },
  { id: 'violet', name: 'Violeta Neón', color: '#a855f7', secondary: '#ff2a85', tertiary: '#c084fc', glow: 'rgba(168, 85, 247, 0.5)' },
  { id: 'purple', name: 'Púrpura Místico', color: '#8b5cf6', secondary: '#06b6d4', tertiary: '#a78bfa', glow: 'rgba(139, 92, 246, 0.5)' },
  { id: 'periwinkle', name: 'Azul Periwinkle', color: '#6366f1', secondary: '#ec4899', tertiary: '#818cf8', glow: 'rgba(99, 102, 241, 0.5)' },
  { id: 'skyblue', name: 'Azul Cielo', color: '#38bdf8', secondary: '#818cf8', tertiary: '#7dd3fc', glow: 'rgba(56, 189, 248, 0.5)' },
  { id: 'cyan', name: 'Cyan Eléctrico', color: '#00f0ff', secondary: '#a855f7', tertiary: '#67e8f9', glow: 'rgba(0, 240, 255, 0.5)' },
  { id: 'mint', name: 'Menta / Esmeralda', color: '#10b981', secondary: '#06b6d4', tertiary: '#34d399', glow: 'rgba(16, 185, 129, 0.5)' },
  { id: 'lime', name: 'Verde Lima Neón', color: '#84cc16', secondary: '#10b981', tertiary: '#a3e635', glow: 'rgba(132, 204, 22, 0.5)' }
];

const PREF_STORAGE_KEY = 'portafolio_user_preferences_v2';

let userPrefs = {
  themeMode: 'dark',
  bgMode: 'video', // 'video' (con filtro de color y glassmorphism) | 'solid'
  bgId: 'onyx',
  accentId: 'pink',
  glowIntensity: 100
};

function setupPreferencesDrawer() {
  const btnOpen = document.getElementById('btnOpenPreferences');
  const btnClose = document.getElementById('btnClosePreferences');
  const overlay = document.getElementById('preferencesOverlay');
  const drawer = document.getElementById('preferencesDrawer');
  const bgSwatches = document.getElementById('prefBgSwatches');
  const accentSwatches = document.getElementById('prefAccentSwatches');
  const glowSlider = document.getElementById('prefGlowSlider');
  const prefGlowVal = document.getElementById('prefGlowVal');
  const prefBgName = document.getElementById('prefBgName');
  const prefColorName = document.getElementById('prefColorName');
  const btnReset = document.getElementById('btnResetPreferences');
  const themeButtons = document.querySelectorAll('.pref-theme-btn:not(.pref-bg-mode-btn)');
  const bgModeButtons = document.querySelectorAll('.pref-bg-mode-btn');

  if (!drawer) return;

  // Cargar preferencias guardadas
  try {
    const saved = localStorage.getItem(PREF_STORAGE_KEY);
    if (saved) {
      userPrefs = Object.assign(userPrefs, JSON.parse(saved));
    }
  } catch (e) {
    console.warn('No se pudieron leer las preferencias guardadas', e);
  }

  // Inicializar estado del modo de fondo ('video' por defecto)
  if (!userPrefs.bgMode) {
    userPrefs.bgMode = 'video';
  }
  if (bgModeButtons.length > 0) {
    bgModeButtons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-bg-mode') === userPrefs.bgMode);
      b.addEventListener('click', () => {
        bgModeButtons.forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        userPrefs.bgMode = b.getAttribute('data-bg-mode') || 'video';
        applyPreferences();
      });
    });
  }

  // Renderizar swatches de fondo
  if (bgSwatches) {
    bgSwatches.innerHTML = PREF_BG_PALETTE.map(bg => `
      <button type="button" class="pref-swatch-circle ${bg.id === userPrefs.bgId ? 'active' : ''}" 
        data-bg-id="${bg.id}" 
        title="${escapeHtml(bg.name)}" 
        style="background-color: ${bg.color};">
      </button>
    `).join('');

    bgSwatches.querySelectorAll('.pref-swatch-circle').forEach(btn => {
      btn.addEventListener('click', () => {
        const bgId = btn.getAttribute('data-bg-id');
        userPrefs.bgId = bgId;
        bgSwatches.querySelectorAll('.pref-swatch-circle').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyPreferences();
      });
    });
  }

  // Renderizar swatches de color de acento
  if (accentSwatches) {
    accentSwatches.innerHTML = PREF_ACCENT_PALETTE.map(acc => `
      <button type="button" class="pref-swatch-circle ${acc.id === userPrefs.accentId ? 'active' : ''}" 
        data-accent-id="${acc.id}" 
        title="${escapeHtml(acc.name)}" 
        style="background-color: ${acc.color}; color: ${acc.color};">
      </button>
    `).join('');

    accentSwatches.querySelectorAll('.pref-swatch-circle').forEach(btn => {
      btn.addEventListener('click', () => {
        const accentId = btn.getAttribute('data-accent-id');
        userPrefs.accentId = accentId;
        accentSwatches.querySelectorAll('.pref-swatch-circle').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyPreferences();
      });
    });
  }

  // Manejar cambio de tema (Oscuro | Claro | Sistema)
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      userPrefs.themeMode = btn.getAttribute('data-theme-mode');
      applyPreferences();
    });
  });

  // Slider de brillo neón
  if (glowSlider) {
    glowSlider.value = userPrefs.glowIntensity || 100;
    if (prefGlowVal) prefGlowVal.textContent = `${glowSlider.value}%`;
    glowSlider.addEventListener('input', (e) => {
      userPrefs.glowIntensity = Number(e.target.value);
      if (prefGlowVal) prefGlowVal.textContent = `${userPrefs.glowIntensity}%`;
      applyPreferences();
    });
  }

  // Botón restablecer
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      userPrefs = {
        themeMode: 'dark',
        bgMode: 'video',
        bgId: 'onyx',
        accentId: 'pink',
        glowIntensity: 100
      };
      if (glowSlider) glowSlider.value = 100;
      if (prefGlowVal) prefGlowVal.textContent = '100%';
      bgSwatches.querySelectorAll('.pref-swatch-circle').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-bg-id') === 'onyx');
      });
      accentSwatches.querySelectorAll('.pref-swatch-circle').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-accent-id') === 'pink');
      });
      themeButtons.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-theme-mode') === 'dark');
      });
      if (bgModeButtons.length > 0) {
        bgModeButtons.forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-bg-mode') === 'video');
        });
      }
      applyPreferences();
      showToast('Colores restablecidos a los valores anime originales.', 'info');
    });
  }

  // Abrir y cerrar Drawer
  const openDrawer = () => {
    overlay.style.display = 'block';
    setTimeout(() => drawer.classList.add('open'), 10);
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  };

  if (btnOpen) btnOpen.addEventListener('click', openDrawer);
  if (btnClose) btnClose.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Aplicar preferencias iniciales
  applyPreferences();
}

function applyPreferences() {
  const root = document.documentElement;
  const currentBg = PREF_BG_PALETTE.find(b => b.id === userPrefs.bgId) || PREF_BG_PALETTE[0];
  const currentAccent = PREF_ACCENT_PALETTE.find(a => a.id === userPrefs.accentId) || PREF_ACCENT_PALETTE[4];

  // Actualizar nombres en panel
  const prefBgName = document.getElementById('prefBgName');
  const prefColorName = document.getElementById('prefColorName');
  if (prefBgName) prefBgName.textContent = currentBg.name;
  if (prefColorName) prefColorName.textContent = currentAccent.name;

  // Variables CSS dinámicas
  const isLight = (userPrefs.themeMode === 'light') || 
    (userPrefs.themeMode === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);

  if (isLight) {
    root.style.setProperty('--bg-main', '#f8fafc');
    root.style.setProperty('--bg-card', '#ffffff');
    root.style.setProperty('--bg-card-hover', '#f1f5f9');
    root.style.setProperty('--text-main', '#0f172a');
    root.style.setProperty('--text-muted', '#475569');
    root.style.setProperty('--text-light', '#64748b');
    root.style.setProperty('--navbar-bg', 'rgba(255, 255, 255, 0.94)');
    root.style.setProperty('--navbar-border', 'rgba(203, 213, 225, 0.8)');
    root.style.setProperty('--drawer-bg', '#ffffff');
    document.body.classList.add('theme-light');
  } else {
    root.style.setProperty('--bg-main', currentBg.color);
    root.style.setProperty('--bg-card', currentBg.cardBg);
    root.style.setProperty('--bg-card-hover', '#1c1333');
    root.style.setProperty('--text-main', '#ffffff');
    root.style.setProperty('--text-muted', '#cbd5e1');
    root.style.setProperty('--text-light', '#94a3b8');
    root.style.setProperty('--navbar-bg', `${currentBg.color}e6`);
    root.style.setProperty('--navbar-border', `${currentAccent.color}55`);
    root.style.setProperty('--drawer-bg', currentBg.cardBg);
    document.body.classList.remove('theme-light');
  }

  // Paleta Armónica Global
  const p = currentAccent.color;
  const s = currentAccent.secondary;
  const t = currentAccent.tertiary;
  const glow = currentAccent.glow;
  const glowFactor = (userPrefs.glowIntensity || 100) / 100;

  root.style.setProperty('--primary', p);
  root.style.setProperty('--primary-hover', t);
  root.style.setProperty('--primary-light', `${p}26`);
  root.style.setProperty('--primary-border', `${p}66`);
  root.style.setProperty('--color-primary', p);
  root.style.setProperty('--color-primary-hover', t);
  root.style.setProperty('--color-primary-glow', glow);
  root.style.setProperty('--color-secondary', s);
  root.style.setProperty('--color-accent', p);
  root.style.setProperty('--border-hover', p);

  // Armonizar variables neón anime
  root.style.setProperty('--neon-pink', p);
  root.style.setProperty('--neon-purple', s);
  root.style.setProperty('--neon-red', t);
  root.style.setProperty('--neon-pink-glow', glow);
  root.style.setProperty('--neon-purple-glow', `${s}70`);

  // Gradiente global
  root.style.setProperty('--anime-gradient-main', `linear-gradient(135deg, ${p}, ${s})`);

  // Inyección dinámica exhaustiva para aplicar a TODO el código (Fondo, Botones, Texto, Cards, Modales)
  let styleTag = document.getElementById('themeDynamicOverride');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'themeDynamicOverride';
    document.head.appendChild(styleTag);
  }

  const bgCol = isLight ? '#f8fafc' : currentBg.color;
  const cardBgCol = isLight ? '#ffffff' : currentBg.cardBg;
  const textCol = isLight ? '#0f172a' : '#f8fafc';
  const textMutedCol = isLight ? '#475569' : '#cbd5e1';
  const isBgVideo = (userPrefs.bgMode !== 'solid');

  // Controlar visibilidad y reproducción del video de fondo según modo seleccionado
  const bgContainer = document.getElementById('animeVideoContainer');
  const bgVideo = document.getElementById('bgVideo');
  const bgVideoAmbient = document.getElementById('bgVideoAmbient');
  if (bgContainer) {
    if (isBgVideo) {
      bgContainer.style.display = 'flex';
      if (bgVideo && bgVideo.paused) bgVideo.play().catch(() => {});
      if (bgVideoAmbient && bgVideoAmbient.paused) bgVideoAmbient.play().catch(() => {});
    } else {
      bgContainer.style.display = 'none';
      if (bgVideo) bgVideo.pause();
      if (bgVideoAmbient) bgVideoAmbient.pause();
    }
  }

  styleTag.textContent = `
    /* Fondo General y Video */
    ${isBgVideo ? `
      body, body.anime-theme, .main-content {
        background-color: transparent !important;
        background: transparent !important;
        color: ${textCol} !important;
      }
      .anime-video-bg-container {
        display: flex !important;
        background-color: #06020c !important;
      }
      .anime-video-vertical-wrapper, .anime-video-ambient {
        display: flex !important;
      }
      .anime-video-overlay {
        display: block !important;
        background: 
          radial-gradient(circle at 50% 45%, ${p}38 0%, ${bgCol}60 55%, ${bgCol}cc 100%),
          linear-gradient(180deg, ${p}24 0%, ${s}18 50%, ${bgCol}f2 100%) !important;
        backdrop-filter: blur(0.5px) !important;
        -webkit-backdrop-filter: blur(0.5px) !important;
      }
      .team-banner {
        background: ${isLight ? 'rgba(255, 255, 255, 0.84)' : 'rgba(15, 10, 26, 0.75)'} !important;
        backdrop-filter: blur(14px) !important;
        -webkit-backdrop-filter: blur(14px) !important;
        border-bottom-color: ${p}45 !important;
      }
      .activity-card {
        background-color: ${isLight ? 'rgba(255, 255, 255, 0.88)' : (cardBgCol.startsWith('#') ? cardBgCol + 'c4' : 'rgba(18, 12, 30, 0.80)')} !important;
        backdrop-filter: blur(14px) !important;
        -webkit-backdrop-filter: blur(14px) !important;
        border-color: ${p}45 !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.75), 0 0 ${Math.round(18 * glowFactor)}px ${glow} !important;
      }
      .stat-card {
        background: ${isLight ? 'rgba(255, 255, 255, 0.86)' : 'rgba(18, 12, 30, 0.80)'} !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border: 1px solid ${p}35 !important;
      }
      .otaku-radio-widget {
        background-color: ${isLight ? 'rgba(255, 255, 255, 0.90)' : 'rgba(18, 12, 30, 0.88)'} !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
      }
    ` : `
      body, body.anime-theme, .main-content {
        background-color: ${bgCol} !important;
        color: ${textCol} !important;
      }
      .anime-video-bg-container {
        display: none !important;
      }
      .anime-video-overlay {
        display: none !important;
      }
      .team-banner {
        background: linear-gradient(180deg, ${cardBgCol} 0%, ${bgCol} 100%) !important;
        border-bottom-color: ${p}45 !important;
      }
      .activity-card {
        background-color: ${cardBgCol} !important;
        border-color: ${p}40 !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 ${Math.round(18 * glowFactor)}px ${glow} !important;
      }
      .stat-card {
        background: ${cardBgCol} !important;
        border: 1px solid ${p}35 !important;
      }
      .otaku-radio-widget {
        background-color: ${cardBgCol} !important;
      }
    `}

    /* Navbar */
    .navbar {
      background-color: ${isLight ? 'rgba(255, 255, 255, 0.96)' : bgCol + 'ee'} !important;
      border-bottom-color: ${p}55 !important;
    }
    .brand-text h1 {
      color: ${textCol} !important;
      text-shadow: 0 0 12px ${glow} !important;
    }
    .anime-brand-glow, .modal-title-icon {
      background: linear-gradient(135deg, ${p}, ${s}) !important;
      box-shadow: 0 0 16px ${glow}, 0 0 28px ${s}50 !important;
    }
    .anime-pill-badge, .anime-glow-badge, .badge-anime {
      background: ${p}22 !important;
      border-color: ${p}66 !important;
      color: ${p} !important;
    }

    /* Botones Principales */
    .btn-primary, .btn-anime-glow {
      background: linear-gradient(135deg, ${p} 0%, ${s} 100%) !important;
      color: #ffffff !important;
      border-color: rgba(255, 255, 255, 0.35) !important;
      box-shadow: 0 4px 18px ${glow}, 0 0 25px ${s}45 !important;
    }
    .btn-primary:hover, .btn-anime-glow:hover {
      background: linear-gradient(135deg, ${t} 0%, ${p} 100%) !important;
      box-shadow: 0 6px 24px ${glow}, 0 0 35px ${s}75 !important;
    }

    /* Botones Secundarios */
    .btn-secondary:hover {
      border-color: ${p} !important;
      color: ${p} !important;
      box-shadow: 0 0 12px ${glow} !important;
    }

    /* Botones de Navegación */
    .btn-anime-radio:hover, .btn-anime-pref:hover, .btn-anime-team:hover, .btn-anime-cloud-storage:hover {
      border-color: ${p} !important;
      box-shadow: 0 0 18px ${glow} !important;
    }

    /* Elementos del Banner del Equipo */
    .banner-badge {
      background: ${p}20 !important;
      border-color: ${p}60 !important;
      color: ${p} !important;
    }
    .team-chip:hover {
      border-color: ${p} !important;
      box-shadow: 0 0 12px ${glow} !important;
    }

    .activity-card:hover {
      border-color: ${p} !important;
      box-shadow: 0 16px 45px rgba(0, 0, 0, 0.92), 0 0 ${Math.round(28 * glowFactor)}px ${glow}, 0 0 ${Math.round(50 * glowFactor)}px ${s}65 !important;
    }
    .card-title {
      color: ${textCol} !important;
    }
    .card-anime-gradient {
      background: linear-gradient(180deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.4) 60%, ${cardBgCol} 100%) !important;
    }

    /* Modales */
    .modal-card {
      background-color: ${cardBgCol} !important;
      border-color: ${p}55 !important;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px ${glow} !important;
    }
    .modal-header, .modal-footer {
      background-color: rgba(0, 0, 0, 0.25) !important;
      border-color: ${p}35 !important;
    }
    .modal-header h3 {
      color: ${textCol} !important;
    }

    /* Inputs de Búsqueda y Filtros */
    .search-box:focus-within, .filter-group select:focus, .storage-table-search input:focus {
      border-color: ${p} !important;
      box-shadow: 0 0 15px ${glow} !important;
    }

    /* Radio Otaku */
    .otaku-radio-widget {
      background-color: ${cardBgCol} !important;
      border-color: ${p}55 !important;
      box-shadow: 0 10px 35px rgba(0,0,0,0.8), 0 0 25px ${glow} !important;
    }
    .radio-progress-fill, .btn-radio-play {
      background: linear-gradient(135deg, ${p}, ${s}) !important;
    }
    .radio-eq-bars span {
      background: ${p} !important;
    }
    .floating-radio-trigger {
      background: linear-gradient(135deg, ${p}, ${s}) !important;
      box-shadow: 0 4px 18px ${glow} !important;
    }

    /* Textos y Acentos */
    .text-accent, .dash-num-val.text-accent {
      color: ${p} !important;
    }
    a:hover {
      color: ${p} !important;
    }

    /* Scrollbars */
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, ${p}, ${s}) !important;
    }

    /* Tipografía Global adaptativa */
    ${isLight ? `
      body, .brand-text span, .banner-content p, .activity-card p, .card-body p, .stat-label, td, th {
        color: #1e293b !important;
      }
      .brand-text h1, h2, h3, h4, strong {
        color: #0f172a !important;
      }
    ` : `
      body, .brand-text span, .banner-content p, .activity-card p, .card-body p, .stat-label, td, th {
        color: #e2e8f0 !important;
      }
      .brand-text h1, h2, h3, h4, strong {
        color: #ffffff !important;
      }
    `}
  `;

  try {
    localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(userPrefs));
  } catch (e) {}
}

// =========================================================
// MÓDULO 2: INTEGRANTES DEL EQUIPO CON ORDEN CIRCULAR 360°
// =========================================================
const TEAM_MEMBERS_DATA = [
  {
    name: 'Edgar Reyes de la Cruz',
    branch: 'EDGAR_REYES',
    role: 'Líder de Proyecto • Arquitectura Web & Git',
    project: 'Página personal, estructura del repositorio y calculadora técnica',
    defaultAvatar: 'assets/images/team/edgar_reyes.jpg',
    onlineFallback: 'https://github.com/pyedgar.png',
    github: 'https://github.com/pyedgar',
    theme: 'neon-purple'
  },
  {
    name: 'Fátima Estefanía González Lozano',
    branch: 'FATIMA_GONZALEZ',
    role: 'Documentación & Portafolio de Evidencias',
    project: 'Página personal, formatos de reporte y gestión de evidencias',
    defaultAvatar: 'assets/images/team/fatima_gonzalez.png',
    onlineFallback: 'assets/images/anime/anime_pin_2.png',
    theme: 'neon-pink'
  },
  {
    name: 'Kenia Isamara Andrade Cedillo',
    branch: 'KENIA_ANDRADE',
    role: 'Desarrollo & Calculadora Técnica',
    project: 'Página personal y componentes de cálculo para cursos lunes',
    defaultAvatar: 'assets/images/team/kenia_andrade.jpg',
    onlineFallback: 'assets/images/anime/anime_neon_gojo_purple.jpg',
    theme: 'neon-purple'
  },
  {
    name: 'Ramiro Alejandro Alfaro Alanis',
    branch: 'RAMIRO_ALFARO',
    role: 'Desarrollo & Calculadora Técnica',
    project: 'Página personal y validaciones técnicas de entrega',
    defaultAvatar: 'assets/images/team/ramiro_alfaro.jpg',
    onlineFallback: 'assets/images/anime/anime_card_1.jpg',
    theme: 'neon-cyan'
  },
  {
    name: 'Miguel Fuentes Hernández',
    branch: 'MIGUEL_FUENTES',
    role: 'Desarrollo & Componentes de Presentación',
    project: 'Página personal y estilos visuales de interfaces',
    defaultAvatar: 'assets/images/team/miguel_fuentes.jpg',
    onlineFallback: 'assets/images/anime/anime_neon_samurai.jpg',
    theme: 'neon-red'
  }
];

let currentOrbitIndex = 0;
let teamLayoutMode = 'circular'; // 'circular' o 'grid'

function setupTeamMembersModal() {
  const btnOpen = document.getElementById('btnOpenTeamModal');
  const btnClose = document.getElementById('btnCloseTeamModal');
  const btnCloseBtn = document.getElementById('btnCloseTeamModalBtn');
  const modal = document.getElementById('modalTeamMembers');
  const orbitNodesContainer = document.getElementById('teamOrbitNodes');
  const spotlightCard = document.getElementById('teamSpotlightCard');
  const orbitDotsContainer = document.getElementById('teamOrbitDots');
  const btnOrbitPrev = document.getElementById('btnOrbitPrev');
  const btnOrbitNext = document.getElementById('btnOrbitNext');
  const btnToggleLayout = document.getElementById('btnToggleTeamLayout');
  const circularStage = document.getElementById('teamCircularStage');
  const gridContainer = document.getElementById('teamMembersGrid');

  if (!modal) return;

  // Renderizar la Vista Circular Orbital (360 grados repartidos en 5 integrantes)
  const renderCircularOrbit = () => {
    if (!orbitNodesContainer) return;

    // 5 nodos posicionados geométricamente en un círculo (72 grados cada uno)
    // Comenzando en -90deg (arriba al centro para el líder Edgar)
    const total = TEAM_MEMBERS_DATA.length;
    const radius = 42; // radio en porcentaje

    orbitNodesContainer.innerHTML = TEAM_MEMBERS_DATA.map((member, i) => {
      const angleDeg = (360 / total) * i - 90;
      const angleRad = (angleDeg * Math.PI) / 180;
      const left = 50 + radius * Math.cos(angleRad);
      const top = 50 + radius * Math.sin(angleRad);

      const customAvatar = localStorage.getItem(`team_avatar_${member.branch}`);
      const avatarSrc = customAvatar || member.defaultAvatar;
      const isActive = i === currentOrbitIndex;

      return `
        <button type="button" 
          class="team-orbit-node ${isActive ? 'active' : ''}" 
          data-index="${i}" 
          title="${escapeHtml(member.name)} (${escapeHtml(member.branch)})"
          style="left: ${left.toFixed(2)}%; top: ${top.toFixed(2)}%;">
          <img src="${escapeHtml(avatarSrc)}" alt="${escapeHtml(member.name)}" onerror="this.onerror=null; this.src='${escapeHtml(member.onlineFallback)}';">
          <span class="node-num-badge">#${i + 1}</span>
        </button>
      `;
    }).join('');

    // Indicadores circulares (dots)
    if (orbitDotsContainer) {
      orbitDotsContainer.innerHTML = TEAM_MEMBERS_DATA.map((m, i) => `
        <span class="orbit-dot ${i === currentOrbitIndex ? 'active' : ''}" data-index="${i}"></span>
      `).join('');

      orbitDotsContainer.querySelectorAll('.orbit-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          selectOrbitMember(Number(dot.getAttribute('data-index')));
        });
      });
    }

    // Eventos de clic en nodos orbitales
    orbitNodesContainer.querySelectorAll('.team-orbit-node').forEach(node => {
      node.addEventListener('click', () => {
        const idx = Number(node.getAttribute('data-index'));
        selectOrbitMember(idx);
      });
    });

    renderSpotlightCard();
  };

  // Renderizar tarjeta destacada del integrante activo
  const renderSpotlightCard = () => {
    if (!spotlightCard) return;
    const member = TEAM_MEMBERS_DATA[currentOrbitIndex];
    const customAvatar = localStorage.getItem(`team_avatar_${member.branch}`);
    const avatarSrc = customAvatar || member.defaultAvatar;

    spotlightCard.innerHTML = `
      <div class="spotlight-avatar-wrap">
        <img src="${escapeHtml(avatarSrc)}" alt="${escapeHtml(member.name)}" class="spotlight-avatar-img" id="spotlightAvatarImg" onerror="this.onerror=null; this.src='${escapeHtml(member.onlineFallback)}';">
      </div>
      <div class="spotlight-info">
        <div class="spotlight-header">
          <h4 class="spotlight-name">${escapeHtml(member.name)}</h4>
          <span class="spotlight-branch"><i class="fa-solid fa-code-branch"></i> ${escapeHtml(member.branch)}</span>
        </div>
        <div class="spotlight-role">${escapeHtml(member.role)}</div>
        <div class="spotlight-project">📝 ${escapeHtml(member.project)}</div>
        <div class="spotlight-actions">
          <button class="btn btn-primary btn-sm btn-filter-spotlight" data-member="${escapeHtml(member.name)}">
            <i class="fa-solid fa-filter"></i> Ver Actividades
          </button>
          <label class="btn btn-secondary btn-sm" title="Cambiar foto de este integrante">
            <i class="fa-solid fa-camera"></i> Cambiar Foto
            <input type="file" accept="image/*" class="spotlight-file-input" data-branch="${escapeHtml(member.branch)}" style="display:none;">
          </label>
        </div>
      </div>
    `;

    // Filtro rápido
    const btnFilter = spotlightCard.querySelector('.btn-filter-spotlight');
    if (btnFilter) {
      btnFilter.addEventListener('click', () => {
        const memberName = btnFilter.getAttribute('data-member');
        closeTeamModal();
        if (dom.filterMember) {
          dom.filterMember.value = memberName;
          handleFilters();
          const target = document.getElementById('activitiesGrid');
          if (target) target.scrollIntoView({ behavior: 'smooth' });
          showToast(`Filtrando actividades de: ${memberName}`, 'info');
        }
      });
    }

    // Subir foto personalizada
    const fileInput = spotlightCard.querySelector('.spotlight-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const branch = fileInput.getAttribute('data-branch');

        if (file.size > 2 * 1024 * 1024) {
          showToast('La imagen debe ser menor a 2 MB.', 'danger');
          return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          const base64 = loadEvt.target.result;
          try {
            localStorage.setItem(`team_avatar_${branch}`, base64);
            showToast(`Foto actualizada para ${branch}.`, 'success');
            renderCircularOrbit();
            renderGridMembers();
          } catch (err) {
            showToast('Almacenamiento local lleno.', 'danger');
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const selectOrbitMember = (index) => {
    currentOrbitIndex = (index + TEAM_MEMBERS_DATA.length) % TEAM_MEMBERS_DATA.length;
    renderCircularOrbit();
  };

  if (btnOrbitPrev) {
    btnOrbitPrev.addEventListener('click', () => selectOrbitMember(currentOrbitIndex - 1));
  }
  if (btnOrbitNext) {
    btnOrbitNext.addEventListener('click', () => selectOrbitMember(currentOrbitIndex + 1));
  }

  // Renderizar la Vista Cuadrícula Clásica (como respaldo)
  const renderGridMembers = () => {
    if (!gridContainer) return;
    gridContainer.innerHTML = TEAM_MEMBERS_DATA.map((member, idx) => {
      const customAvatar = localStorage.getItem(`team_avatar_${member.branch}`);
      const avatarSrc = customAvatar || member.defaultAvatar;

      return `
        <div class="team-member-card">
          <div class="team-avatar-wrap">
            <img src="${escapeHtml(avatarSrc)}" alt="${escapeHtml(member.name)}" class="team-member-avatar" onerror="this.onerror=null; this.src='${escapeHtml(member.onlineFallback)}';">
          </div>
          <h4 class="team-member-name">${escapeHtml(member.name)}</h4>
          <span class="team-member-branch"><i class="fa-solid fa-code-branch"></i> ${escapeHtml(member.branch)}</span>
          <div class="team-member-role">${escapeHtml(member.role)}</div>
          <div class="team-member-project">📝 ${escapeHtml(member.project)}</div>
          
          <div class="team-member-actions">
            <button class="btn btn-secondary btn-sm btn-filter-member" data-member="${escapeHtml(member.name)}">
              <i class="fa-solid fa-filter"></i> Actividades
            </button>
          </div>
        </div>
      `;
    }).join('');

    gridContainer.querySelectorAll('.btn-filter-member').forEach(btn => {
      btn.addEventListener('click', () => {
        const memberName = btn.getAttribute('data-member');
        closeTeamModal();
        if (dom.filterMember) {
          dom.filterMember.value = memberName;
          handleFilters();
          const target = document.getElementById('activitiesGrid');
          if (target) target.scrollIntoView({ behavior: 'smooth' });
          showToast(`Filtrando actividades de: ${memberName}`, 'info');
        }
      });
    });
  };

  // Alternar entre Vista Circular y Cuadrícula
  if (btnToggleLayout) {
    btnToggleLayout.addEventListener('click', () => {
      const icon = document.getElementById('iconTeamLayout');
      const text = document.getElementById('textTeamLayout');
      if (teamLayoutMode === 'circular') {
        teamLayoutMode = 'grid';
        if (circularStage) circularStage.style.display = 'none';
        if (gridContainer) gridContainer.style.display = 'grid';
        if (icon) icon.className = 'fa-solid fa-circle-notch';
        if (text) text.textContent = 'Vista Circular 360°';
        renderGridMembers();
      } else {
        teamLayoutMode = 'circular';
        if (circularStage) circularStage.style.display = 'flex';
        if (gridContainer) gridContainer.style.display = 'none';
        if (icon) icon.className = 'fa-solid fa-table-cells';
        if (text) text.textContent = 'Vista Cuadrícula';
        renderCircularOrbit();
      }
    });
  }

  const openTeamModal = () => {
    renderCircularOrbit();
    renderGridMembers();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  const closeTeamModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  if (btnOpen) btnOpen.addEventListener('click', openTeamModal);
  if (btnClose) btnClose.addEventListener('click', closeTeamModal);
  if (btnCloseBtn) btnCloseBtn.addEventListener('click', closeTeamModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeTeamModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeTeamModal();
    }
  });

  renderCircularOrbit();
}

// =========================================================
// MÓDULO 3: MONITOR Y AUDITORÍA PROFESIONAL DE FIREBASE
// =========================================================
let storageSearchQuery = '';
let storageSortMode = 'size-desc';
let storageViewMode = 'list'; // 'list' o 'grid'
let storageCurrentPage = 1;
const STORAGE_ITEMS_PER_PAGE = 10;

function setupFirebaseStorageModal() {
  const btnOpen = document.getElementById('btnOpenFirebaseModal');
  const btnClose = document.getElementById('btnCloseFirebaseModal');
  const btnCloseBtn = document.getElementById('btnCloseFirebaseModalBtn');
  const modal = document.getElementById('modalFirebaseStorage');
  const btnRecalc = document.getElementById('btnRecalculateStorage');
  const searchInput = document.getElementById('storageTableSearch');
  const sortSelect = document.getElementById('storageTableSort');
  const btnViewList = document.getElementById('btnStorageViewList');
  const btnViewGrid = document.getElementById('btnStorageViewGrid');
  const btnPrevPage = document.getElementById('btnStoragePrevPage');
  const btnNextPage = document.getElementById('btnStorageNextPage');

  if (!modal) return;

  const openStorageModal = () => {
    storageCurrentPage = 1;
    updateStorageQuotaDisplay();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  const closeStorageModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  if (btnOpen) btnOpen.addEventListener('click', openStorageModal);
  if (btnClose) btnClose.addEventListener('click', closeStorageModal);
  if (btnCloseBtn) btnCloseBtn.addEventListener('click', closeStorageModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeStorageModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeStorageModal();
    }
  });

  // Selector de vista: Lista vs Cuadrícula
  if (btnViewList) {
    btnViewList.addEventListener('click', () => {
      storageViewMode = 'list';
      btnViewList.classList.add('active');
      if (btnViewGrid) btnViewGrid.classList.remove('active');
      updateStorageQuotaDisplay();
    });
  }

  if (btnViewGrid) {
    btnViewGrid.addEventListener('click', () => {
      storageViewMode = 'grid';
      btnViewGrid.classList.add('active');
      if (btnViewList) btnViewList.classList.remove('active');
      updateStorageQuotaDisplay();
    });
  }

  // Controles de Paginación
  if (btnPrevPage) {
    btnPrevPage.addEventListener('click', () => {
      if (storageCurrentPage > 1) {
        storageCurrentPage--;
        updateStorageQuotaDisplay();
      }
    });
  }

  if (btnNextPage) {
    btnNextPage.addEventListener('click', () => {
      storageCurrentPage++;
      updateStorageQuotaDisplay();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      storageSearchQuery = e.target.value.toLowerCase().trim();
      storageCurrentPage = 1;
      updateStorageQuotaDisplay();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      storageSortMode = e.target.value;
      storageCurrentPage = 1;
      updateStorageQuotaDisplay();
    });
  }

  if (btnRecalc) {
    btnRecalc.addEventListener('click', () => {
      btnRecalc.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Auditando...';
      setTimeout(() => {
        updateStorageQuotaDisplay();
        btnRecalc.innerHTML = '<i class="fa-solid fa-rotate"></i> Recalcular';
        showToast('Cuotas y métricas recalculadas en tiempo real.', 'success');
      }, 350);
    });
  }

  // Actualización inicial
  updateStorageQuotaDisplay();
}

function updateStorageQuotaDisplay() {
  const gaugeFill = document.getElementById('storageGaugeFill');
  const gaugePercent = document.getElementById('storageGaugePercent');
  const storageUsedMb = document.getElementById('storageUsedMb');
  const storageRemainingMb = document.getElementById('storageRemainingMb');
  const storagePercentLeft = document.getElementById('storagePercentLeft');
  const storageDocsCount = document.getElementById('storageDocsCount');
  const storagePdfsCount = document.getElementById('storagePdfsCount');
  const navStorageBadge = document.getElementById('navStorageBadge');
  const segmentPdf = document.getElementById('storageSegmentPdf');
  const segmentJson = document.getElementById('storageSegmentJson');
  const segmentFree = document.getElementById('storageSegmentFree');
  const legendPdf = document.getElementById('storageLegendPdfBytes');
  const legendJson = document.getElementById('storageLegendJsonBytes');
  const tableBody = document.getElementById('storageBreakdownTableBody');
  const countBadge = document.getElementById('storageTableCountBadge');
  const tableWrapper = document.getElementById('storageTableWrapper');
  const gridWrapper = document.getElementById('storageGridWrapper');
  const pageInfo = document.getElementById('storagePageInfo');
  const pageIndicator = document.getElementById('storagePageIndicator');
  const btnPrev = document.getElementById('btnStoragePrevPage');
  const btnNext = document.getElementById('btnStorageNextPage');

  const SPARK_QUOTA_BYTES = 1024 * 1024 * 1024; // 1 GB = 1,024 MB
  const DOC_LIMIT_BYTES = 1024 * 1024; // 1 MB límite doc

  let totalBytes = 0;
  let totalPdfBytes = 0;
  let totalJsonBytes = 0;
  let pdfCount = 0;
  const activities = (allActivities && allActivities.length > 0) ? allActivities : [];

  // Calcular pesos
  const enrichedActivities = activities.map(act => {
    let jsonSize = 0;
    try {
      jsonSize = new Blob([JSON.stringify(act)]).size;
    } catch (e) {
      jsonSize = 2048;
    }

    const pdfSize = act.pdfSize || 0;
    if (pdfSize > 0) pdfCount++;

    const totalActSize = Math.max(jsonSize, pdfSize);
    totalPdfBytes += pdfSize;
    totalJsonBytes += jsonSize;
    totalBytes += totalActSize;

    return {
      activity: act,
      sizeBytes: totalActSize,
      pdfSize,
      name: act.nombre || 'Sin nombre',
      pdfName: act.pdfName || 'documento.pdf'
    };
  });

  // Filtrado y ordenamiento de la tabla
  let filtered = enrichedActivities.filter(item => {
    if (!storageSearchQuery) return true;
    return item.name.toLowerCase().includes(storageSearchQuery) || 
           item.pdfName.toLowerCase().includes(storageSearchQuery);
  });

  if (storageSortMode === 'size-desc') {
    filtered.sort((a, b) => b.sizeBytes - a.sizeBytes);
  } else if (storageSortMode === 'size-asc') {
    filtered.sort((a, b) => a.sizeBytes - b.sizeBytes);
  } else if (storageSortMode === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Cálculos de cuota y porcentajes
  const usedMb = (totalBytes / (1024 * 1024)).toFixed(2);
  const remainingMb = Math.max(0, ((SPARK_QUOTA_BYTES - totalBytes) / (1024 * 1024))).toFixed(1);
  const percentUsed = Math.max(0.05, (totalBytes / SPARK_QUOTA_BYTES) * 100);
  const percentUsedFormatted = percentUsed < 0.1 ? percentUsed.toFixed(2) : percentUsed.toFixed(1);
  const percentFree = (100 - percentUsed).toFixed(1);

  // SVG Gauge Circular (Circunferencia = 2 * PI * 50 = 314.16)
  const circumference = 314.16;
  const strokeOffset = circumference * (1 - Math.min(1, Math.max(0.01, percentUsed / 100)));

  if (gaugeFill) {
    gaugeFill.style.strokeDashoffset = strokeOffset;
    if (percentUsed > 85) {
      gaugeFill.style.stroke = '#ef4444';
    } else if (percentUsed > 60) {
      gaugeFill.style.stroke = '#f59e0b';
    } else {
      gaugeFill.style.stroke = '#10b981';
    }
  }

  if (gaugePercent) gaugePercent.textContent = `${percentUsedFormatted}%`;
  if (storageUsedMb) storageUsedMb.textContent = `${usedMb} MB`;
  if (storageRemainingMb) storageRemainingMb.textContent = `${remainingMb} MB`;
  if (storagePercentLeft) storagePercentLeft.textContent = `Espacio Disponible (${percentFree}% libre)`;
  if (storageDocsCount) storageDocsCount.textContent = activities.length;
  if (storagePdfsCount) storagePdfsCount.textContent = pdfCount;
  if (navStorageBadge) navStorageBadge.textContent = `${Math.round(remainingMb)} MB libre`;

  const proBarFill = document.getElementById('storageProBarFill');
  const percentText = document.getElementById('storagePercentText');
  if (proBarFill) proBarFill.style.width = `${Math.min(100, Math.max(1, percentUsed)).toFixed(2)}%`;
  if (percentText) percentText.textContent = `${percentUsedFormatted}% ocupado`;

  // Barra segmentada
  const pdfPercent = Math.max(0.5, (totalPdfBytes / SPARK_QUOTA_BYTES) * 100);
  const jsonPercent = Math.max(0.3, (totalJsonBytes / SPARK_QUOTA_BYTES) * 100);
  const freePercent = Math.max(0, 100 - pdfPercent - jsonPercent);

  if (segmentPdf) segmentPdf.style.width = `${pdfPercent.toFixed(2)}%`;
  if (segmentJson) segmentJson.style.width = `${jsonPercent.toFixed(2)}%`;
  if (segmentFree) segmentFree.style.width = `${freePercent.toFixed(2)}%`;
  if (legendPdf) legendPdf.textContent = formatBytes(totalPdfBytes);
  if (legendJson) legendJson.textContent = formatBytes(totalJsonBytes);
  if (countBadge) countBadge.textContent = `${filtered.length} de ${activities.length} archivos`;

  // Paginación de 10 en 10
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / STORAGE_ITEMS_PER_PAGE));
  if (storageCurrentPage > totalPages) storageCurrentPage = totalPages;
  if (storageCurrentPage < 1) storageCurrentPage = 1;

  const startIndex = (storageCurrentPage - 1) * STORAGE_ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + STORAGE_ITEMS_PER_PAGE, totalItems);
  const pagedItems = filtered.slice(startIndex, endIndex);

  if (pageInfo) {
    pageInfo.textContent = totalItems === 0 ? 'Sin archivos' : `Mostrando ${startIndex + 1} - ${endIndex} de ${totalItems} archivos`;
  }
  if (pageIndicator) {
    pageIndicator.textContent = `Página ${storageCurrentPage} de ${totalPages}`;
  }
  if (btnPrev) btnPrev.disabled = (storageCurrentPage <= 1);
  if (btnNext) btnNext.disabled = (storageCurrentPage >= totalPages);

  // Renderizar según Modo: Vista Lista vs Vista Cuadrícula
  if (storageViewMode === 'grid') {
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (gridWrapper) {
      gridWrapper.style.display = 'grid';
      if (pagedItems.length === 0) {
        gridWrapper.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: #94a3b8;">
            No se encontraron archivos que coincidan.
          </div>
        `;
      } else {
        gridWrapper.innerHTML = pagedItems.map(item => {
          const percentOfDoc = Math.min(100, ((item.sizeBytes / DOC_LIMIT_BYTES) * 100)).toFixed(1);
          let statusBadge = '<span class="status-pill status-approved"><i class="fa-solid fa-check"></i> Óptimo</span>';
          if (item.sizeBytes > 800000) {
            statusBadge = '<span class="status-pill status-pending"><i class="fa-solid fa-triangle-exclamation"></i> Casi Lleno</span>';
          }

          return `
            <div class="storage-file-card">
              <div class="storage-file-top">
                <div class="storage-file-icon">
                  <i class="fa-solid fa-file-pdf"></i>
                </div>
                <div class="storage-file-titles">
                  <h5 class="storage-file-title" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</h5>
                  <span class="storage-file-pdf" title="${escapeHtml(item.pdfName)}"><i class="fa-solid fa-paperclip"></i> ${escapeHtml(item.pdfName)}</span>
                </div>
              </div>
              <div class="storage-file-progress-bar">
                <div class="storage-file-progress-fill" style="width: ${percentOfDoc}%;"></div>
              </div>
              <div class="storage-file-meta-row">
                <span class="storage-file-size">${formatBytes(item.sizeBytes)}</span>
                <span class="anime-pill-badge-sm">${percentOfDoc}% de 1MB</span>
                ${statusBadge}
              </div>
            </div>
          `;
        }).join('');
      }
    }
  } else {
    // Vista Lista
    if (gridWrapper) gridWrapper.style.display = 'none';
    if (tableWrapper) tableWrapper.style.display = 'block';
    if (tableBody) {
      if (pagedItems.length === 0) {
        tableBody.innerHTML = `
          <tr><td colspan="5" class="text-center" style="padding:1.5rem; color:#94a3b8;">No se encontraron archivos que coincidan.</td></tr>
        `;
      } else {
        tableBody.innerHTML = pagedItems.map(item => {
          const percentOfDoc = Math.min(100, ((item.sizeBytes / DOC_LIMIT_BYTES) * 100)).toFixed(1);
          let statusBadge = '<span class="status-pill status-approved"><i class="fa-solid fa-check"></i> Óptimo</span>';
          if (item.sizeBytes > 800000) {
            statusBadge = '<span class="status-pill status-pending"><i class="fa-solid fa-triangle-exclamation"></i> Casi Lleno</span>';
          }

          return `
            <tr>
              <td><strong>${escapeHtml(item.name)}</strong></td>
              <td><i class="fa-solid fa-file-pdf text-accent"></i> ${escapeHtml(item.pdfName)}</td>
              <td><strong>${formatBytes(item.sizeBytes)}</strong></td>
              <td>
                <span class="anime-pill-badge-sm">${percentOfDoc}% de 1 MB</span>
              </td>
              <td>${statusBadge}</td>
            </tr>
          `;
        }).join('');
      }
    }
  }
}
