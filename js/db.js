/**
 * Base de datos universal y gestor de actividades
 * Triple redundancia: Memoria + IndexedDB + Catálogo Oficial
 */

const OFFICIAL_CATALOG = [
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
const DB_NAME = 'PortafolioTecnicosUniversal_v5';
const DB_VERSION = 1;
const STORE_NAME = 'actividades';

class PortfolioDB {
  constructor() {
    this.db = null;
    this.memoryStore = new Map();
    // Pre-cargar catálogo oficial en memoria
    OFFICIAL_CATALOG.forEach(act => this.memoryStore.set(act.id, { ...act }));
  }

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') {
        return resolve(null);
      }

      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onblocked = () => {
          console.warn('IndexedDB blocked');
          resolve(null);
        };

        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };

        req.onsuccess = (e) => {
          this.db = e.target.result;
          resolve(this.db);
        };

        req.onerror = () => {
          console.warn('IndexedDB open error');
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB exception', err);
        resolve(null);
      }
    });
  }

  async getAllActivities() {
    // 1. Catálogo oficial base
    const map = new Map();
    OFFICIAL_CATALOG.forEach(act => {
      if (!DEPRECATED_IDS.includes(act.id)) map.set(act.id, { ...act });
    });

    // 2. Actividades en memoria de la sesión
    this.memoryStore.forEach((act, id) => {
      if (!DEPRECATED_IDS.includes(id)) map.set(id, act);
    });

    // 3. Actividades en IndexedDB
    try {
      const db = await this.init();
      if (db) {
        const idbItems = await new Promise((resolve) => {
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

        idbItems.forEach(act => {
          if (!DEPRECATED_IDS.includes(act.id)) {
            map.set(act.id, act);
            this.memoryStore.set(act.id, act);
          }
        });
      }
    } catch (_) {}

    const list = Array.from(map.values());
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return list;
  }

  async getActivity(id) {
    if (DEPRECATED_IDS.includes(id)) return null;
    if (this.memoryStore.has(id)) return this.memoryStore.get(id);

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
        if (item) {
          this.memoryStore.set(id, item);
          return item;
        }
      }
    } catch (_) {}

    return OFFICIAL_CATALOG.find(a => a.id === id) || null;
  }

  async saveActivity(activity) {
    // 1. Inmediatamente registrar en memoria (garantiza que la interfaz actualice siempre)
    this.memoryStore.set(activity.id, activity);

    // 2. Persistir en IndexedDB de forma asíncrona segura
    try {
      const db = await this.init();
      if (db) {
        // Asegurarse de que pdfBlob sea un Blob estándar para evitar DataCloneError
        let serializable = { ...activity };
        if (serializable.pdfBlob && typeof serializable.pdfBlob.slice === 'function') {
          serializable.pdfBlob = new Blob([serializable.pdfBlob], { type: serializable.pdfType || 'application/pdf' });
        }

        await new Promise((resolve) => {
          try {
            const tx = db.transaction([STORE_NAME], 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.put(serializable);
            req.onsuccess = () => resolve(true);
            req.onerror = (e) => {
              console.warn('Error al guardar en IndexedDB store:', e);
              resolve(false);
            };
          } catch (e) {
            console.warn('Excepción de transacción al guardar:', e);
            resolve(false);
          }
        });
      }
    } catch (e) {
      console.warn('No se pudo guardar en IndexedDB:', e);
    }

    return activity;
  }

  async deleteActivity(id) {
    this.memoryStore.delete(id);

    try {
      const db = await this.init();
      if (db) {
        await new Promise((resolve) => {
          try {
            const tx = db.transaction([STORE_NAME], 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.delete(id);
            req.onsuccess = () => resolve(true);
            req.onerror = () => resolve(false);
          } catch (_) {
            resolve(false);
          }
        });
      }
    } catch (_) {}

    return true;
  }

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
