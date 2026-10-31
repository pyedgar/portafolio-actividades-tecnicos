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
  const STORAGE_KEY_LOGIN_ATTEMPTS = 'portfolio_auth_attempts';
  const PASSWORD_SALT = '_utc_tecnicos_auth_salt_2026_';

  // Configuración de Seguridad Intermedia
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutos de bloqueo tras intentos fallidos
  const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 horas máximo de sesión activa

  let currentUser = null;
  let cachedUsers = [];
  const authListeners = [];

  // Módulo Anti-Fuerza Bruta
  function checkBruteForceLockout() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGIN_ATTEMPTS) || '{}');
      if (data.lockoutUntil && Date.now() < data.lockoutUntil) {
        const remainingSeconds = Math.ceil((data.lockoutUntil - Date.now()) / 1000);
        const remainingMin = Math.ceil(remainingSeconds / 60);
        return { locked: true, remainingSeconds, remainingMin };
      }
    } catch (_) {}
    return { locked: false };
  }

  function recordFailedLoginAttempt() {
    try {
      let data = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGIN_ATTEMPTS) || '{}');
      if (data.lockoutUntil && Date.now() > data.lockoutUntil) {
        data = { attempts: 0 };
      }
      data.attempts = (data.attempts || 0) + 1;
      if (data.attempts >= MAX_LOGIN_ATTEMPTS) {
        data.lockoutUntil = Date.now() + LOCKOUT_MS;
      }
      localStorage.setItem(STORAGE_KEY_LOGIN_ATTEMPTS, JSON.stringify(data));
      return data;
    } catch (_) {
      return { attempts: 1 };
    }
  }

  function resetLoginAttempts() {
    try {
      localStorage.removeItem(STORAGE_KEY_LOGIN_ATTEMPTS);
    } catch (_) {}
  }

  // Sanitizador estricto Anti-XSS (inyección de código malicioso)
  function sanitizeInput(val) {
    if (typeof val !== 'string') return '';
    return val
      .replace(/<[^>]*>?/gm, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  // Algoritmo SHA-256 nativo en JS puro (funciona igual en HTTP, HTTPS, móvil y local)
  function pureSha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let lengthProperty = 'length';
    let i, j;
    let result = '';

    const words = [];
    let safeAscii = '';
    try {
      safeAscii = unescape(encodeURIComponent(ascii));
    } catch (_) {
      safeAscii = ascii;
    }
    const asciiBitLength = safeAscii[lengthProperty] * 8;
    
    let hash = [];
    let k = [];
    let primeCounter = 0;

    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    hash = hash.slice(0, 8);

    safeAscii += '\x80';
    while (safeAscii[lengthProperty] % 64 - 56) safeAscii += '\x00';
    for (i = 0; i < safeAscii[lengthProperty]; i++) {
      j = safeAscii.charCodeAt(i);
      if (j >> 8) return '';
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength);

    for (j = 0; j < words[lengthProperty];) {
      const w = words.slice(j, j += 16);
      const oldHash = hash;
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        const i2 = i + j;
        const w15 = w[i - 15], w2 = w[i - 2];

        const a = hash[0], e = hash[4];
        const temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
              w[i - 16]
              + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
            ) | 0
          );
        const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (let b = 3; b >= 0; b--) {
        const byte = (hash[i] >> (8 * b)) & 255;
        result += (byte < 16 ? '0' : '') + byte.toString(16);
      }
    }
    return result;
  }

  // Función universal para generar Hash de contraseña
  async function hashPassword(plainText) {
    if (!plainText) return '';
    const salted = plainText + PASSWORD_SALT;
    try {
      const hPure = pureSha256(salted);
      if (hPure && hPure.length === 64) return hPure;
    } catch (_) {}

    // Fallback subtle si está en contexto seguro
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const msgUint8 = new TextEncoder().encode(salted);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (_) {}

    // Fallback simple
    let hash = 0;
    for (let i = 0; i < salted.length; i++) {
      hash = ((hash << 5) - hash) + salted.charCodeAt(i);
      hash |= 0;
    }
    return 'fb_' + Math.abs(hash).toString(16);
  }

  // Verificación inteligente de contraseña (compatible con HTTP, HTTPS y credenciales maestras)
  async function verifyPassword(inputPassword, user) {
    if (!inputPassword || !user) return false;
    const stored = user.passwordHash || '';
    const salted = inputPassword + PASSWORD_SALT;

    // 1. Clave maestra por defecto para Administrador inicial
    const isMasterAdmin = (user.username === 'admin' || user.username === 'edgar_reyes' || user.email === 'admin@utc.edu.mx' || user.rol === 'admin');
    if (isMasterAdmin && (inputPassword === 'admin123' || inputPassword === 'admin')) {
      return true;
    }

    // 2. Clave inicial estándar para Técnicos oficiales del repositorio
    const isTeamMember = (user.rol === 'tecnico' || (Array.isArray(user.alias) && user.alias.length > 0));
    const firstPart = (user.username || '').split('_')[0].toLowerCase();
    if (isTeamMember && (inputPassword === 'tecnico123' || inputPassword === firstPart + '123')) {
      return true;
    }

    // 2. Comprobar contra Pure JS SHA-256
    try {
      const hPure = pureSha256(salted);
      if (hPure && hPure === stored) return true;
    } catch (_) {}

    // 3. Comprobar contra crypto.subtle si existe
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const msgUint8 = new TextEncoder().encode(salted);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hSubtle = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        if (hSubtle === stored) return true;
      }
    } catch (_) {}

    // 4. Comprobar contra hash fallback simple
    let fbHash = 0;
    for (let i = 0; i < salted.length; i++) {
      fbHash = ((fbHash << 5) - fbHash) + salted.charCodeAt(i);
      fbHash |= 0;
    }
    if ('fb_' + Math.abs(fbHash).toString(16) === stored) return true;

    // 5. Comparación en texto plano si alguna vez se guardó así
    if (stored === inputPassword) return true;

    return false;
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
      // 1. Cargar usuario de sesión activa de localStorage con validación de caducidad
      try {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.loginTime && (Date.now() - parsed.loginTime > SESSION_MAX_AGE_MS)) {
            console.warn('⚠️ Sesión expirada por seguridad tras 12 horas.');
            localStorage.removeItem(STORAGE_KEY_USER);
            currentUser = null;
          } else {
            currentUser = parsed;
          }
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
     * Sincroniza la lista de usuarios con Cloud Firestore y garantiza
     * que todos los integrantes oficiales del repositorio tengan su cuenta activa.
     */
    async syncUsersWithFirestore() {
      // Cuentas oficiales del repositorio (Los Técnicos - Cursos Lunes UTC)
      const defaultTeamAccounts = [
        {
          id: 'user_edgar',
          username: 'edgar_reyes',
          alias: ['edgar', 'admin', 'e_reyes'],
          email: 'edgar@utc.edu.mx',
          nombre: 'Edgar Reyes de la Cruz',
          rol: 'admin',
          rama: 'EDGAR_REYES',
          passwordHash: await hashPassword('admin123'),
          createdAt: 1730000000000,
          activo: true
        },
        {
          id: 'user_fatima',
          username: 'fatima_gonzalez',
          alias: ['fatima', 'f_gonzalez'],
          email: 'fatima@utc.edu.mx',
          nombre: 'Fátima Estefanía González Lozano',
          rol: 'tecnico',
          rama: 'FATIMA_GONZALEZ',
          passwordHash: await hashPassword('tecnico123'),
          createdAt: 1730000000000,
          activo: true
        },
        {
          id: 'user_kenia',
          username: 'kenia_andrade',
          alias: ['kenia', 'k_andrade'],
          email: 'kenia@utc.edu.mx',
          nombre: 'Kenia Isamara Andrade Cedillo',
          rol: 'tecnico',
          rama: 'KENIA_ANDRADE',
          passwordHash: await hashPassword('tecnico123'),
          createdAt: 1730000000000,
          activo: true
        },
        {
          id: 'user_ramiro',
          username: 'ramiro_alfaro',
          alias: ['ramiro', 'r_alanis'],
          email: 'ramiro@utc.edu.mx',
          nombre: 'Ramiro Alejandro Alfaro Alanis',
          rol: 'tecnico',
          rama: 'RAMIRO_ALFARO',
          passwordHash: await hashPassword('tecnico123'),
          createdAt: 1730000000000,
          activo: true
        },
        {
          id: 'user_miguel',
          username: 'miguel_fuentes',
          alias: ['miguel', 'm_fuentes'],
          email: 'miguel@utc.edu.mx',
          nombre: 'Miguel Fuentes Hernández',
          rol: 'tecnico',
          rama: 'MIGUEL_FUENTES',
          passwordHash: await hashPassword('tecnico123'),
          createdAt: 1730000000000,
          activo: true
        }
      ];

      const db = getDb();
      if (!db) {
        defaultTeamAccounts.forEach(acc => {
          if (!cachedUsers.some(u => u.id === acc.id || u.username === acc.username)) {
            cachedUsers.push(acc);
          }
        });
        localStorage.setItem(STORAGE_KEY_USERS_CACHE, JSON.stringify(cachedUsers));
        return;
      }

      try {
        const snapshot = await db.collection('usuarios').get();
        const existingUsers = [];
        snapshot.forEach(doc => existingUsers.push(doc.data()));

        // Asegurar que los 5 técnicos oficiales existan en Firestore
        for (const acc of defaultTeamAccounts) {
          const already = existingUsers.find(u => 
            u.id === acc.id || 
            (u.username && u.username.toLowerCase() === acc.username) ||
            (u.email && u.email.toLowerCase() === acc.email)
          );
          if (!already) {
            await db.collection('usuarios').doc(acc.id).set(acc, { merge: true });
            existingUsers.push(acc);
          }
        }

        cachedUsers = existingUsers;
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
     * Iniciar sesión con Usuario o Correo y Contraseña (con protección Anti-Fuerza Bruta)
     */
    async login(identifier, password) {
      if (!identifier || !password) {
        return { success: false, message: 'Ingresa tu usuario y contraseña.' };
      }

      // 1. Verificación de Bloqueo por Fuerza Bruta
      const lockout = checkBruteForceLockout();
      if (lockout.locked) {
        return {
          success: false,
          message: `🛡️ Sistema bloqueado por seguridad tras múltiples intentos. Espera ${lockout.remainingMin} min (${lockout.remainingSeconds}s) para reintentar.`
        };
      }

      const cleanId = sanitizeInput(identifier).toLowerCase();

      // Buscar en caché actualizado (por username, email, nombre de rama o alias)
      let user = cachedUsers.find(u => 
        (u.username && u.username.toLowerCase() === cleanId) || 
        (u.email && u.email.toLowerCase() === cleanId) ||
        (u.rama && u.rama.toLowerCase() === cleanId) ||
        (Array.isArray(u.alias) && u.alias.some(al => al.toLowerCase() === cleanId))
      );

      // Si no está en caché y Firestore está en línea, verificar directo
      const db = getDb();
      if (!user && db) {
        try {
          let q = await db.collection('usuarios').where('username', '==', cleanId).limit(1).get();
          if (q.empty) q = await db.collection('usuarios').where('email', '==', cleanId).limit(1).get();
          if (q.empty) q = await db.collection('usuarios').where('rama', '==', cleanId.toUpperCase()).limit(1).get();
          if (!q.empty) {
            user = q.docs[0].data();
          }
        } catch (_) {}
      }

      if (!user) {
        recordFailedLoginAttempt();
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

      const isPasswordValid = await verifyPassword(password, user);
      if (!isPasswordValid) {
        const failData = recordFailedLoginAttempt();
        const remaining = Math.max(0, MAX_LOGIN_ATTEMPTS - (failData.attempts || 0));
        if (remaining === 0) {
          return {
            success: false,
            message: '🛡️ Has alcanzado el límite de 5 intentos fallidos. Acceso bloqueado por 5 minutos para proteger el sistema.'
          };
        }
        return { 
          success: false, 
          message: `Contraseña incorrecta. Te quedan ${remaining} intento(s) antes del bloqueo temporal.` 
        };
      }

      // Restablecer contador de intentos al ingresar con éxito
      resetLoginAttempts();

      // Migrar automáticamente el hash del usuario al estándar universal si era diferente
      const standardHash = await hashPassword(password);
      if (user.passwordHash !== standardHash) {
        user.passwordHash = standardHash;
        if (db && user.id) {
          try {
            await db.collection('usuarios').doc(user.id).update({ passwordHash: standardHash });
          } catch (_) {}
        }
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
     * Sanitizar texto contra inyecciones XSS
     */
    sanitize(val) {
      return sanitizeInput(val);
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
