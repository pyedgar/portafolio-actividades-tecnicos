/**
 * Configuración de Firebase para Portafolio de Actividades
 * Proyecto: portafolio-75c1f
 * Almacenamiento en la nube (Firestore Database + Firebase Storage)
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
let firebaseStorage = null;
let isFirebaseOnline = false;

try {
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firestoreDb = firebase.firestore();
    firebaseStorage = firebase.storage();
    isFirebaseOnline = true;
    console.log('✅ Firebase inicializado correctamente para el proyecto portafolio-75c1f');
  }
} catch (e) {
  console.warn('⚠️ No se pudo inicializar Firebase, operando en modo local:', e);
}

window.firebaseService = {
  isAvailable() {
    return Boolean(isFirebaseOnline && firestoreDb);
  },

  /**
   * Sube un archivo PDF a Firebase Storage y retorna la URL pública de descarga
   */
  async uploadPdf(file, activityId) {
    if (!firebaseStorage || !file) return null;
    try {
      const cleanFileName = (file.name || 'actividad.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `actividades_pdf/${activityId}_${Date.now()}_${cleanFileName}`;
      const storageRef = firebaseStorage.ref().child(storagePath);

      const metadata = {
        contentType: file.type || 'application/pdf',
        customMetadata: {
          originalName: file.name,
          activityId: activityId
        }
      };

      const snapshot = await storageRef.put(file, metadata);
      const downloadUrl = await snapshot.ref.getDownloadURL();
      return downloadUrl;
    } catch (err) {
      console.warn('⚠️ Error al subir PDF a Firebase Storage:', err);
      return null;
    }
  },

  /**
   * Guarda o actualiza los datos de la actividad en Cloud Firestore
   */
  async saveActivity(activity) {
    if (!firestoreDb) return false;
    try {
      // Objeto limpio sin Blobs para Firestore
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
   * Elimina una actividad de Firestore
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
   * Obtiene todas las actividades guardadas en Firestore
   */
  async fetchActivities() {
    if (!firestoreDb) return [];
    try {
      const snap = await firestoreDb.collection('actividades').get();
      const list = [];
      snap.forEach(doc => {
        list.push(doc.data());
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
            list.push(doc.data());
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
  }
};
