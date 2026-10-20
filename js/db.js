/**
 * Base de datos IndexedDB y cargador de actividades globales
 * Garantiza persistencia local y visibilidad universal mediante data/actividades.json
 */
const DB_NAME = 'PortafolioActividadesDB';
const DB_VERSION = 3;
const STORE_NAME = 'actividades';

class PortfolioDB {
  constructor() {
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('fecha', 'fecha', { unique: false });
          store.createIndex('grupo', 'grupo', { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        await this.syncRepositoryActivities();
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('Error al abrir IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Sincroniza las actividades públicas del repositorio (data/actividades.json)
  // para que cualquier persona en cualquier equipo las pueda ver inmediatamente
  async syncRepositoryActivities() {
    try {
      // Eliminar identificadores obsoletos o duplicados anteriores
      const deprecatedIds = ['act-03-reporte-portafolio', 'act-04-guia-ramas-actividades'];
      for (const depId of deprecatedIds) {
        try {
          const obsolete = await this.getActivity(depId);
          if (obsolete) await this.deleteActivity(depId);
        } catch (_) {}
      }

      const response = await fetch('data/actividades.json');
      if (response.ok) {
        const publicActivities = await response.json();
        if (Array.isArray(publicActivities)) {
          for (const act of publicActivities) {
            await this.saveActivity(act);
          }
        }
      }
    } catch (e) {
      console.warn('No se pudo cargar data/actividades.json por fetch directo:', e);
    }
  }

  async countActivities() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllActivities() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getActivity(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async saveActivity(activity) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(activity);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteActivity(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
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
