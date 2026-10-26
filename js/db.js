/**
 * Base de datos universal y gestor de actividades con sincronización Firebase en la nube
 * Catálogo Oficial con las 6 actividades organizadas en la carpeta actividades_pdf
 */

const OFFICIAL_CATALOG = [
  {
    id: "act-01-acki",
    nombre: "Actividad 1: Portafolio Colaborativo - Equipo ACKI",
    fecha: "2026-09-07 10:00",
    descripcion: "Actividad inicial del curso sobre control de versiones y portafolio de proyectos académicos.",
    grupo: "Los Técnicos - UTC (Equipo ACKI)",
    integrantes: [
      "Edgar Reyes de la Cruz",
      "Fátima Estefanía González Lozano",
      "Kenia Isamara Andrade Cedillo",
      "Ramiro Alejandro Alfaro Alanis",
      "Miguel Fuentes Hernández"
    ],
    pdfName: "Act1 07_09_2026 ACKI.pdf",
    pdfSize: 253387,
    pdfType: "application/pdf",
    pdfUrl: "actividades_pdf/Act1 07_09_2026 ACKI.pdf",
    createdAt: 1788768000000
  },
  {
    id: "act-02-equipo-tecnicos",
    nombre: "Actividad 2: Fusión e Integración de Ramas - Los Técnicos",
    fecha: "2026-09-14 10:00",
    descripcion: "Evidencias y reporte de fusión de ramas colaborativas del equipo Los Técnicos para el portafolio general del curso de los lunes.",
    grupo: "Los Técnicos - UTC (Grupos A y B)",
    integrantes: [
      "Edgar Reyes de la Cruz",
      "Fátima Estefanía González Lozano",
      "Kenia Isamara Andrade Cedillo",
      "Ramiro Alejandro Alfaro Alanis",
      "Miguel Fuentes Hernández"
    ],
    pdfName: "Act2 14_09_2026 Equipo_Tecnicos.pdf",
    pdfSize: 25804,
    pdfType: "application/pdf",
    pdfUrl: "actividades_pdf/Act2 14_09_2026 Equipo_Tecnicos.pdf",
    createdAt: 1789372800000
  },
  {
    id: "act-03-preguntas-git-github",
    nombre: "Cuestionario Técnico: Preguntas sobre Git y Ramas en GitHub",
    fecha: "2026-09-28 12:00",
    descripcion: "Respuestas técnicas y fundamentos teóricos sobre el ciclo de vida de ramas, resolución de conflictos y flujo colaborativo en GitHub.",
    grupo: "Los Técnicos - UTC (Cursos Lunes)",
    integrantes: [
      "Edgar Reyes de la Cruz",
      "Fátima Estefanía González Lozano",
      "Kenia Isamara Andrade Cedillo",
      "Ramiro Alejandro Alfaro Alanis",
      "Miguel Fuentes Hernández"
    ],
    pdfName: "Preguntas_Git_y_GitHub_Ramas.pdf",
    pdfSize: 82515,
    pdfType: "application/pdf",
    pdfUrl: "actividades_pdf/Preguntas_Git_y_GitHub_Ramas.pdf",
    createdAt: 1790582400000
  },
  {
    id: "act-04-proyecto-agencia-marketing",
    nombre: "Presentación de Proyecto: Agencia de Marketing Digital",
    fecha: "2026-10-05 14:00",
    descripcion: "Diapositivas corporativas de propuesta y desarrollo para el proyecto de agencia de marketing digital del equipo.",
    grupo: "Los Técnicos - UTC",
    integrantes: [
      "Edgar Reyes de la Cruz",
      "Fátima Estefanía González Lozano",
      "Kenia Isamara Andrade Cedillo",
      "Ramiro Alejandro Alfaro Alanis",
      "Miguel Fuentes Hernández"
    ],
    pdfName: "Presentacion_Proyecto_Agencia_Marketing.pdf",
    pdfSize: 7303598,
    pdfType: "application/pdf",
    pdfUrl: "actividades_pdf/Presentacion_Proyecto_Agencia_Marketing.pdf",
    createdAt: 1791187200000
  },
  {
    id: "act-05-reporte-ramas",
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
    pdfUrl: "actividades_pdf/Reporte_Fusion_Ramas_Git.pdf",
    createdAt: 1791829800000
  },
  {
    id: "act-06-repositorio-ramas-integrantes",
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
    pdfUrl: "actividades_pdf/Reporte_Actividad_3_Repositorio_Ramas_Integrantes.pdf",
    createdAt: 1792434600000
  }
];

const DEPRECATED_IDS = ['act-03-reporte-portafolio', 'act-04-guia-ramas-actividades'];
const DB_NAME = 'PortafolioTecnicosUniversal_v6';
const DB_VERSION = 1;
const STORE_NAME = 'actividades';

class PortfolioDB {
  constructor() {
    this.db = null;
    this.memoryStore = new Map();
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
    const map = new Map();
    OFFICIAL_CATALOG.forEach(act => {
      if (!DEPRECATED_IDS.includes(act.id)) map.set(act.id, { ...act });
    });

    this.memoryStore.forEach((act, id) => {
      if (!DEPRECATED_IDS.includes(id)) map.set(id, act);
    });

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

    // Sincronizar con Firebase Cloud Firestore si está disponible (100% gratis)
    if (window.firebaseService && window.firebaseService.isAvailable()) {
      try {
        const cloudItems = await window.firebaseService.fetchActivities();
        cloudItems.forEach(act => {
          if (!DEPRECATED_IDS.includes(act.id)) {
            map.set(act.id, act);
            this.memoryStore.set(act.id, act);
          }
        });
      } catch (fbErr) {
        console.warn('No se pudo sincronizar Firestore en getAllActivities:', fbErr);
      }
    }

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
    this.memoryStore.set(activity.id, activity);

    // 1. Guardar en Cloud Firestore (sincronización instantánea para todo el equipo)
    if (window.firebaseService && window.firebaseService.isAvailable()) {
      try {
        await window.firebaseService.saveActivity(activity);
        console.log('✅ Actividad sincronizada en Cloud Firestore');
      } catch (fbErr) {
        console.warn('⚠️ Fallo guardado en Firestore, conservando en almacenamiento local:', fbErr);
      }
    }

    // 2. Guardar en IndexedDB local
    try {
      const db = await this.init();
      if (db) {
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

    // Eliminar de Cloud Firestore
    if (window.firebaseService && window.firebaseService.isAvailable()) {
      try {
        await window.firebaseService.deleteActivity(id);
      } catch (fbErr) {
        console.warn('Error al eliminar de Firestore:', fbErr);
      }
    }

    // Eliminar de IndexedDB local
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
