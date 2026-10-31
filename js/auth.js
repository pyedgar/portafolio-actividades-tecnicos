/**
 * Sistema de Autenticación y Control de Acceso por Roles
 * Portafolio de Actividades - Los Técnicos UTC
 * 
 * Roles:
 * - Invitado (Vista General): Solo lectura de actividades y visor de PDF.
 * - Técnico (Registrado): Puede crear y eliminar actividades.
 * - Administrador (Admin): Control total + Gestión y creación de cuentas de técnicos.
 * 
 * Almacenamiento en Cloud Firestore (Colección: 'usuarios') con sincronización en tiempo real
 * y respaldo en caché local (localStorage).
 */

(function () {
  const STORAGE_KEY_USER = 'portfolio_auth_user';
  const STORAGE_KEY_USERS_CACHE = 'portfolio_users_cache';
  const PASSWORD_SALT = '_utc_tecnicos_auth_salt_2026_';

  let currentUser = null;
  let cachedUsers = [];
  const authListeners = [];

  // Función para generar Hash SHA-256 seguro en el navegador
  async function hashPassword(plainText) {
    if (!plainText) return '';
    try {
      const msgUint8 = new TextEncoder().encode(plainText + PASSWORD_SALT);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback básico si crypto.subtle no estuviera disponible
      let hash = 0;
      const str = plainText + PASSWORD_SALT;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
      }
      return 'fb_' + Math.abs(hash).toString(16);
    }
  }

  // Notificar a los listeners del cambio de sesión
  function notifyListeners() {
    authListeners.forEach(fn => {
      try {
        fn(currentUser);
      } catch (e) {
        console.error('Error en listener de auth:', e);
      }
    });
  }

  // Obtener referencia a Firestore si está disponible
  function getDb() {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      try {
        return firebase.firestore();
      } catch (_) {}
    }
    return null;
  }

  const authService = {
    /**
     * Inicializa el servicio de autenticación
     */
    async init() {
      // 1. Cargar usuario de sesión activa de localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        if (stored) {
          currentUser = JSON.parse(stored);
        }
      } catch (e) {
        currentUser = null;
      }

      // 2. Cargar caché local de usuarios
      try {
        const localCached = localStorage.getItem(STORAGE_KEY_USERS_CACHE);
        if (localCached) {
          cachedUsers = JSON.parse(localCached);
        }
      } catch (_) {
        cachedUsers = [];
      }

      // 3. Sincronizar con Firestore y crear Admin por defecto si no hay usuarios
      await this.syncUsersWithFirestore();

      // 4. Notificar estado inicial
      notifyListeners();
      return currentUser;
    },

    /**
     * Sincroniza la lista de usuarios con Cloud Firestore
     */
    async syncUsersWithFirestore() {
      const db = getDb();
      if (!db) {
        // Modo sin Firestore: asegurar que exista al menos el Admin por defecto local
        if (cachedUsers.length === 0) {
          const defaultAdmin = {
            id: 'admin_master_1',
            username: 'admin',
            email: 'admin@utc.edu.mx',
            nombre: 'Edgar Reyes (Admin)',
            rol: 'admin',
            passwordHash: await hashPassword('admin123'),
            createdAt: Date.now(),
            activo: true
          };
          cachedUsers = [defaultAdmin];
          localStorage.setItem(STORAGE_KEY_USERS_CACHE, JSON.stringify(cachedUsers));
        }
        return;
      }

      try {
        const snapshot = await db.collection('usuarios').get();
        if (snapshot.empty) {
          // Crear el usuario Administrador maestro inicial
          const defaultAdmin = {
            id: 'admin_master_1',
            username: 'admin',
            email: 'admin@utc.edu.mx',
            nombre: 'Edgar Reyes (Admin)',
            rol: 'admin',
            passwordHash: await hashPassword('admin123'),
            createdAt: Date.now(),
            activo: true
          };
          await db.collection('usuarios').doc(defaultAdmin.id).set(defaultAdmin);
          cachedUsers = [defaultAdmin];
        } else {
          const list = [];
          snapshot.forEach(doc => {
            list.push(doc.data());
          });
          cachedUsers = list;
        }

        // Guardar respaldo en caché local
        localStorage.setItem(STORAGE_KEY_USERS_CACHE, JSON.stringify(cachedUsers));

        // Escuchar cambios en vivo en la colección de usuarios
        db.collection('usuarios').onSnapshot(snap => {
          const updated = [];
          snap.forEach(d => updated.push(d.data()));
          cachedUsers = updated;
          localStorage.setItem(STORAGE_KEY_USERS_CACHE, JSON.stringify(cachedUsers));
          
          // Si el usuario actual fue eliminado o deshabilitado, cerrar sesión
          if (currentUser) {
            const currentInDb = cachedUsers.find(u => u.id === currentUser.id);
            if (!currentInDb || currentInDb.activo === false) {
              authService.logout();
            } else if (currentInDb.rol !== currentUser.rol || currentInDb.nombre !== currentUser.nombre) {
              currentUser.rol = currentInDb.rol;
              currentUser.nombre = currentInDb.nombre;
              localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
              notifyListeners();
            }
          }
        }, err => console.warn('Listener de usuarios:', err));

      } catch (err) {
        console.warn('⚠️ No se pudo conectar a Firestore para usuarios, usando caché local:', err);
      }
    },

    /**
     * Iniciar sesión con Usuario o Correo y Contraseña
     */
    async login(identifier, password) {
      if (!identifier || !password) {
        return { success: false, message: 'Ingresa tu usuario y contraseña.' };
      }

      const cleanId = identifier.trim().toLowerCase();
      const pwdHash = await hashPassword(password);

      // Buscar en caché actualizado
      let user = cachedUsers.find(u => 
        (u.username && u.username.toLowerCase() === cleanId) || 
        (u.email && u.email.toLowerCase() === cleanId)
      );

      // Si no está en caché y Firestore está en línea, verificar directo
      const db = getDb();
      if (!user && db) {
        try {
          const qByUsername = await db.collection('usuarios').where('username', '==', cleanId).limit(1).get();
          if (!qByUsername.empty) {
            user = qByUsername.docs[0].data();
          } else {
            const qByEmail = await db.collection('usuarios').where('email', '==', cleanId).limit(1).get();
            if (!qByEmail.empty) {
              user = qByEmail.docs[0].data();
            }
          }
        } catch (_) {}
      }

      if (!user) {
        return { 
          success: false, 
          message: 'Usuario no registrado. Solicita tu cuenta al Administrador.' 
        };
      }

      if (user.activo === false) {
        return { 
          success: false, 
          message: 'Esta cuenta ha sido desactivada por el Administrador.' 
        };
      }

      if (user.passwordHash !== pwdHash) {
        return { 
          success: false, 
          message: 'Contraseña incorrecta. Verifica e intenta nuevamente.' 
        };
      }

      // Inicio de sesión exitoso
      currentUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        nombre: user.nombre || user.username,
        rol: user.rol || 'tecnico',
        loginTime: Date.now()
      };

      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      } catch (_) {}

      notifyListeners();
      return { success: true, user: currentUser };
    },

    /**
     * Cerrar sesión
     */
    logout() {
      currentUser = null;
      try {
        localStorage.removeItem(STORAGE_KEY_USER);
      } catch (_) {}
      notifyListeners();
    },

    /**
     * Obtiene el usuario actual
     */
    getCurrentUser() {
      return currentUser;
    },

    /**
     * ¿Hay un usuario con sesión iniciada?
     */
    isLoggedIn() {
      return Boolean(currentUser && currentUser.id);
    },

    /**
     * ¿El usuario logueado es Administrador?
     */
    isAdmin() {
      return Boolean(currentUser && currentUser.rol === 'admin');
    },

    /**
     * ¿El usuario puede crear o eliminar actividades?
     * (Cualquier usuario registrado: admin o técnico)
     */
    canManageActivities() {
      return Boolean(currentUser && (currentUser.rol === 'admin' || currentUser.rol === 'tecnico'));
    },

    /**
     * Obtener listado de usuarios (solo disponible si es Admin)
     */
    async getUsers() {
      if (!this.isAdmin()) {
        throw new Error('Solo el Administrador puede ver el listado de usuarios.');
      }
      return cachedUsers.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        nombre: u.nombre,
        rol: u.rol,
        activo: u.activo !== false,
        createdAt: u.createdAt
      }));
    },

    /**
     * Crear una nueva cuenta de técnico o admin (Exclusivo del Administrador)
     */
    async createUser({ username, email, nombre, password, rol = 'tecnico' }) {
      if (!this.isAdmin()) {
        return { success: false, message: 'Acción no permitida: Solo el Administrador puede registrar cuentas.' };
      }

      const cleanUser = (username || '').trim().toLowerCase();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanNombre = (nombre || '').trim();

      if (!cleanUser || cleanUser.length < 3) {
        return { success: false, message: 'El nombre de usuario debe tener al menos 3 caracteres.' };
      }

      if (!password || password.length < 4) {
        return { success: false, message: 'La contraseña debe tener al menos 4 caracteres.' };
      }

      // Validar que no exista ya
      const exists = cachedUsers.some(u => 
        (u.username && u.username.toLowerCase() === cleanUser) || 
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
      );

      if (exists) {
        return { success: false, message: 'Ya existe un usuario con ese nombre de usuario o correo.' };
      }

      const newId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const pwdHash = await hashPassword(password);

      const newUserDoc = {
        id: newId,
        username: cleanUser,
        email: cleanEmail || `${cleanUser}@utc.edu.mx`,
        nombre: cleanNombre || cleanUser,
        rol: rol === 'admin' ? 'admin' : 'tecnico',
        passwordHash: pwdHash,
        activo: true,
        createdBy: currentUser.username,
        createdAt: Date.now()
      };

      // Guardar en Firestore
      const db = getDb();
      if (db) {
        try {
          await db.collection('usuarios').doc(newId).set(newUserDoc);
        } catch (err) {
          console.warn('Error al guardar usuario en Firestore:', err);
        }
      }

      // Guardar en caché local
      cachedUsers.push(newUserDoc);
      localStorage.setItem(STORAGE_KEY_USERS_CACHE, JSON.stringify(cachedUsers));

      return { 
        success: true, 
        message: `Cuenta de ${newUserDoc.nombre} (${newUserDoc.rol}) creada exitosamente.`,
        user: newUserDoc 
      };
    },

    /**
     * Eliminar una cuenta de usuario (Exclusivo del Administrador)
     */
    async deleteUser(userId) {
      if (!this.isAdmin()) {
        return { success: false, message: 'Solo el Administrador puede eliminar cuentas.' };
      }

      if (currentUser.id === userId) {
        return { success: false, message: 'No puedes eliminar tu propia cuenta de administrador activa.' };
      }

      const db = getDb();
      if (db) {
        try {
          await db.collection('usuarios').doc(userId).delete();
        } catch (err) {
          console.warn('Error al eliminar en Firestore:', err);
        }
      }

      cachedUsers = cachedUsers.filter(u => u.id !== userId);
      localStorage.setItem(STORAGE_KEY_USERS_CACHE, JSON.stringify(cachedUsers));

      return { success: true, message: 'Usuario eliminado correctamente.' };
    },

    /**
     * Cambiar contraseña de un usuario o de la propia cuenta
     */
    async updatePassword(userId, newPassword) {
      if (!newPassword || newPassword.length < 4) {
        return { success: false, message: 'La nueva contraseña debe tener al menos 4 caracteres.' };
      }

      if (currentUser.id !== userId && !this.isAdmin()) {
        return { success: false, message: 'No tienes permisos para modificar esta cuenta.' };
      }

      const pwdHash = await hashPassword(newPassword);
      const db = getDb();

      if (db) {
        try {
          await db.collection('usuarios').doc(userId).update({ passwordHash: pwdHash, updatedAt: Date.now() });
        } catch (err) {
          console.warn('Error al actualizar contraseña en Firestore:', err);
        }
      }

      const found = cachedUsers.find(u => u.id === userId);
      if (found) {
        found.passwordHash = pwdHash;
        localStorage.setItem(STORAGE_KEY_USERS_CACHE, JSON.stringify(cachedUsers));
      }

      return { success: true, message: 'Contraseña actualizada con éxito.' };
    },

    /**
     * Suscribirse a cambios en el estado de autenticación
     */
    onAuthStateChanged(callback) {
      if (typeof callback === 'function') {
        authListeners.push(callback);
        // Llamada inmediata con estado actual
        callback(currentUser);
      }
    }
  };

  window.authService = authService;
})();
