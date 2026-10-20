/**
 * Base de datos y gestor de actividades
 * Soporta IndexedDB con respaldo en memoria y carga directa de actividades oficiales
 */

const DEFAULT_ACTIVITIES = [
  {
    id: "act-01-fusion-git",
    nombre: "Actividad de Fusión e Integración de Ramas Git",
    fecha: "2026-09-14 10:00",
    descripcion: "Reporte y evidencias de fusión de ramas colaborativas del equipo Los Técnicos para el portafolio general del curso de los lunes.",
    grupo: "Los Técnicos - UTC (Grupos A y B)",
    integrantes: [
      "Edgar Reyes de la Cruz",
      "Fátima Estefanía González Lozano",
      "Kenia Isamara Andrade Cedillo",
      "Ramiro Alejandro Alfaro Alanis",
      "Miguel Fuentes Hernández"
    ],
    pdfName: "Act 14_09_2026 Equipo_Tecnicos.pdf",
    pdfSize: 25804,
    pdfType: "application/pdf",
    pdfUrl: "assets/actividad_muestra.pdf",
    createdAt: 1789372800000
  },
  {
    id: "act-02-reporte-ramas",
    nombre: "Reporte Técnico: Fusión de Ramas en Git y Resolución de Conflictos",
    fecha: "2026-10-12 18:30",
    descripcion: "Documentación técnica detallada sobre el procedimiento de integración de ramas remotas, solución de referencias huérfanas y sincronización en GitHub.",
    grupo: "Los Técnicos - UTC (Grupos A y B)",
    integrantes: [
      "Edgar Reyes de la Cruz",
      "Fátima Estefanía González Lozano",
      "Kenia Isamara Andrade Cedillo",
      "Ramiro Alejandro Alfaro Alanis",
      "Miguel Fuentes Hernández"
    ],
    pdfName: "Reporte_Fusion_Ramas_Git.pdf",
    pdfSize: 643034,
    pdfType: "application/pdf",
    pdfUrl: "assets/Reporte_Fusion_Ramas_Git.pdf",
    createdAt: 1791829800000
  },
  {
    id: "act-03-repositorio-ramas-integrantes",
    nombre: "Actividad 3: Repositorio en GitHub y Subida de Páginas Personales en Ramas por Integrante",
    fecha: "2026-10-19 18:30",
    descripcion: "Reporte oficial y evidencia técnica de la creación en equipo del repositorio en GitHub, configuración de ramas individuales con nomenclatura NOMBRE_APELLIDO (ej. ALAN_DIAZ) para cada integrante, subida de proyectos personales y fusión ordenada a main.",
    grupo: "Los Técnicos - UTC (Cursos Lunes)",
    integrantes: [
      "Edgar Reyes de la Cruz",
      "Fátima Estefanía González Lozano",
      "Kenia Isamara Andrade Cedillo",
      "Ramiro Alejandro Alfaro Alanis",
      "Miguel Fuentes Hernández"
    ],
    pdfName: "Reporte_Actividad_3_Repositorio_Ramas_Integrantes.pdf",
    pdfSize: 740124,
    pdfType: "application/pdf",
    pdfUrl: "assets/Reporte_Actividad_3_Repositorio_Ramas_Integrantes.pdf",
    createdAt: 1792434600000
  }
];

const DEPRECATED_IDS = ['act-03-reporte-portafolio', 'act-04-guia-ramas-actividades'];

const DB_NAME = 'PortafolioActividadesDB_v4';
const DB_VERSION = 1;
const STORE_NAME = 'actividades';

class PortfolioDB {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  async init() {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      try {
        if (typeof indexedDB === 'undefined') {
          console.warn('IndexedDB no soportado.');
          return resolve(null);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onblocked = () => {
          console.warn('IndexedDB bloqueado.');
          resolve(null);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('fecha', 'fecha', { unique: false });
            store.createIndex('grupo', 'grupo', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(this.db);
        };

        request.onerror = (event) => {
          console.warn('Error al abrir IndexedDB:', event.target.error);
          resolve(null);
        };
      } catch (e) {
        console.warn('Excepción al inicializar IndexedDB:', e);
        resolve(null);
      }
    });

    return this.initPromise;
  }

  async getAllActivities() {
    let localItems = [];
    try {
      const db = await this.init();
      if (db) {
        localItems = await new Promise((resolve) => {
          try {
            const tx = db.transaction([STORE_NAME], 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
          } catch (_) {
            resolve([]);
          }
        });
      }
    } catch (_) {}

    // Intentar traer data/actividades.json actualizada
    let publicCatalog = DEFAULT_ACTIVITIES;
    try {
      const res = await fetch('data/actividades.json?v=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          publicCatalog = json;
        }
      }
    } catch (_) {}

    // Fusionar catálogo oficial y actividades locales del usuario
    const map = new Map();
    publicCatalog.forEach(act => {
      if (!DEPRECATED_IDS.includes(act.id)) {
        map.set(act.id, act);
      }
    });

    localItems.forEach(act => {
      if (!DEPRECATED_IDS.includes(act.id)) {
        map.set(act.id, act);
      }
    });

    const list = Array.from(map.values());
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return list;
  }

  async getActivity(id) {
    if (DEPRECATED_IDS.includes(id)) return null;

    try {
      const db = await this.init();
      if (db) {
        const item = await new Promise((resolve) => {
          try {
            const tx = db.transaction([STORE_NAME], 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(id);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
          } catch (_) {
            resolve(null);
          }
        });
        if (item) return item;
      }
    } catch (_) {}

    return DEFAULT_ACTIVITIES.find(a => a.id === id) || null;
  }

  async saveActivity(activity) {
    try {
      const db = await this.init();
      if (db) {
        await new Promise((resolve, reject) => {
          const tx = db.transaction([STORE_NAME], 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(activity);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      }
    } catch (e) {
      console.warn('No se pudo guardar en IndexedDB:', e);
    }
    return activity;
  }

  async deleteActivity(id) {
    try {
      const db = await this.init();
      if (db) {
        await new Promise((resolve) => {
          const tx = db.transaction([STORE_NAME], 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.delete(id);
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        });
      }
    } catch (_) {}
    return true;
  }

  // Exportar todas las actividades como respaldo JSON
  async exportBackup() {
    const activities = await this.getAllActivities();
    const serializable = await Promise.all(
      activities.map(async (act) => {
        const copy = { ...act };
        if (copy.pdfBlob instanceof Blob) {
          copy.pdfBase64 = await this.blobToBase64(copy.pdfBlob);
          delete copy.pdfBlob;
        }
        return copy;
      })
    );
    return JSON.stringify(serializable, null, 2);
  }

  // Importar desde respaldo JSON
  async importBackup(jsonString) {
    const list = JSON.parse(jsonString);
    if (!Array.isArray(list)) throw new Error('El archivo no contiene un respaldo válido.');

    for (const item of list) {
      if (item.pdfBase64) {
        item.pdfBlob = this.base64ToBlob(item.pdfBase64, item.pdfType || 'application/pdf');
        delete item.pdfBase64;
      }
      await this.saveActivity(item);
    }
    return list.length;
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  base64ToBlob(dataUrl, mime = 'application/pdf') {
    const arr = dataUrl.split(',');
    const bstr = atob(arr[1] || arr[0]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }
}

window.portfolioDB = new PortfolioDB();
