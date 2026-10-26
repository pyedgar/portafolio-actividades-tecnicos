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
    });
  }
});

// Control del Video Anime Vertical y Ambiente (Pausa/Reanudar y Audio)
function setupAnimeVideoControls() {
  const bgVideo = document.getElementById('bgVideo');
  const bgVideoAmbient = document.getElementById('bgVideoAmbient');
  const btnToggleVideoPlay = document.getElementById('btnToggleVideoPlay');
  const btnToggleVideoAudio = document.getElementById('btnToggleVideoAudio');

  if (!bgVideo) return;

  const playVideos = () => {
    bgVideo.play().catch(() => {});
    if (bgVideoAmbient) bgVideoAmbient.play().catch(() => {});
  };

  const pauseVideos = () => {
    bgVideo.pause();
    if (bgVideoAmbient) bgVideoAmbient.pause();
  };

  // Autoplay silencioso con reintento si el navegador restringe
  const attemptPlay = () => {
    playVideos();
    window.addEventListener('click', () => {
      playVideos();
    }, { once: true });
  };
  attemptPlay();

  if (btnToggleVideoPlay) {
    btnToggleVideoPlay.addEventListener('click', () => {
      if (bgVideo.paused) {
        playVideos();
        btnToggleVideoPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
        btnToggleVideoPlay.title = 'Pausar video anime vertical';
      } else {
        pauseVideos();
        btnToggleVideoPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
        btnToggleVideoPlay.title = 'Reproducir video anime vertical';
      }
    });
  }

  if (btnToggleVideoAudio) {
    btnToggleVideoAudio.addEventListener('click', () => {
      bgVideo.muted = !bgVideo.muted;
      if (bgVideo.muted) {
        btnToggleVideoAudio.classList.remove('active-sound');
        btnToggleVideoAudio.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <span class="btn-label-mobile-hide">Audio BG</span>';
        showToast('Audio de fondo silenciado.', 'info');
      } else {
        btnToggleVideoAudio.classList.add('active-sound');
        btnToggleVideoAudio.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span class="btn-label-mobile-hide">Audio ON</span>';
        showToast('¡Audio de fondo activado!', 'success');
      }
    });
  }
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
