/**
 * Configuración de Firebase para Portafolio de Actividades
 * Proyecto: portafolio-75c1f
 * Almacenamiento 100% GRATUITO sin tarjeta (Cloud Firestore Spark Plan)
 */

const firebaseConfig = {
  apiKey: "AIzaSyCKeiVWu_Jm36Xr83SuOLXsG7KFE21tORg",
  authDomain: "portafolio-75c1f.firebaseapp.com",
  projectId: "portafolio-75c1f",
  storageBucket: "portafolio-75c1f.firebasestorage.app",
  messagingSenderId: "785054488817",
  appId: "1:785054488817:web:b19944b1587f4f56677150",
  measurementId: "G-06ZDYLK7TH"
};

let firebaseApp = null;
let firestoreDb = null;
let isFirebaseOnline = false;

try {
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firestoreDb = firebase.firestore();
    isFirebaseOnline = true;
    console.log('✅ Firebase Cloud Firestore activo y conectado (100% gratuito, plan Spark)');
  }
} catch (e) {
  console.warn('⚠️ No se pudo inicializar Firebase, operando en modo local:', e);
}

window.firebaseService = {
  isAvailable() {
    return Boolean(isFirebaseOnline && firestoreDb);
  },

  /**
   * Guarda o actualiza los datos de la actividad en Cloud Firestore
   * Si el PDF es menor a 850KB, se almacena en Base64 en Firestore directamente
   */
  async saveActivity(activity) {
    if (!firestoreDb) return false;
    try {
      let pdfBase64Cloud = null;

      // Si tenemos el archivo y mide menos de 850 KB, lo guardamos en la nube gratis
      if (activity.pdfBlob instanceof Blob && activity.pdfSize < 850000) {
        try {
          pdfBase64Cloud = await this.blobToBase64(activity.pdfBlob);
        } catch (_) {}
      } else if (activity.pdfBase64 && (activity.pdfSize || 0) < 850000) {
        pdfBase64Cloud = activity.pdfBase64;
      }

      const docData = {
        id: activity.id,
        nombre: activity.nombre || '',
        fecha: activity.fecha || '',
        grupo: activity.grupo || 'Los Técnicos - UTC',
        descripcion: activity.descripcion || '',
        integrantes: Array.isArray(activity.integrantes) ? activity.integrantes : [],
        pdfName: activity.pdfName || '',
        pdfSize: activity.pdfSize || 0,
        pdfType: activity.pdfType || 'application/pdf',
        pdfUrl: activity.pdfUrl || null,
        isGoogleDrive: Boolean(activity.isGoogleDrive),
        driveOriginalUrl: activity.driveOriginalUrl || null,
        pdfBase64: pdfBase64Cloud,
        createdAt: activity.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      await firestoreDb.collection('actividades').doc(activity.id).set(docData, { merge: true });
      return true;
    } catch (err) {
      console.warn('⚠️ Error al guardar en Cloud Firestore:', err);
      return false;
    }
  },

  /**
   * Elimina una actividad de Cloud Firestore
   */
  async deleteActivity(id) {
    if (!firestoreDb) return false;
    try {
      await firestoreDb.collection('actividades').doc(id).delete();
      return true;
    } catch (err) {
      console.warn('⚠️ Error al eliminar de Cloud Firestore:', err);
      return false;
    }
  },

  /**
   * Obtiene todas las actividades guardadas en Cloud Firestore
   */
  async fetchActivities() {
    if (!firestoreDb) return [];
    try {
      const snap = await firestoreDb.collection('actividades').get();
      const list = [];
      snap.forEach(doc => {
        const data = doc.data();
        if (data.pdfBase64 && !data.pdfBlob) {
          try {
            data.pdfBlob = this.base64ToBlob(data.pdfBase64, data.pdfType || 'application/pdf');
          } catch (_) {}
        }
        list.push(data);
      });
      return list;
    } catch (err) {
      console.warn('⚠️ Error al consultar Cloud Firestore:', err);
      return [];
    }
  },

  /**
   * Escucha cambios en tiempo real en Firestore
   */
  onActivitiesChanged(callback) {
    if (!firestoreDb) return () => {};
    try {
      return firestoreDb.collection('actividades').onSnapshot(
        (snapshot) => {
          const list = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.pdfBase64 && !data.pdfBlob) {
              try {
                data.pdfBlob = this.base64ToBlob(data.pdfBase64, data.pdfType || 'application/pdf');
              } catch (_) {}
            }
            list.push(data);
          });
          callback(list);
        },
        (err) => {
          console.warn('⚠️ Error en listener de Firestore:', err);
        }
      );
    } catch (err) {
      console.warn('⚠️ No se pudo iniciar onSnapshot:', err);
      return () => {};
    }
  },

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

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
};
