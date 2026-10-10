import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseAppletConfig from '../../firebase-applet-config.json';

/**
 * Interface que representa as variáveis de configuração do cliente Firebase
 */
export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

/**
 * Lê a configuração do Firebase, priorizando firebase-applet-config.json
 * e utilizando variáveis de ambiente do Vite (import.meta.env) como fallback.
 */
export const getFirebaseConfig = (): FirebaseClientConfig => {
  if (firebaseAppletConfig && firebaseAppletConfig.apiKey && firebaseAppletConfig.projectId) {
    return {
      apiKey: firebaseAppletConfig.apiKey,
      authDomain: firebaseAppletConfig.authDomain,
      projectId: firebaseAppletConfig.projectId,
      storageBucket: firebaseAppletConfig.storageBucket,
      messagingSenderId: firebaseAppletConfig.messagingSenderId,
      appId: firebaseAppletConfig.appId,
      measurementId: firebaseAppletConfig.measurementId,
      firestoreDatabaseId: firebaseAppletConfig.firestoreDatabaseId,
    };
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID,
  };
};

/**
 * Valida se as credenciais mínimas obrigatórias do Firebase estão preenchidas
 */
export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  return Boolean(
    config.apiKey &&
    config.projectId &&
    config.appId
  );
};

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;
let cachedAuth: Auth | null = null;

/**
 * Obtém ou inicializa a instância do FirebaseApp de forma segura e idempotente.
 */
export const getFirebaseAppInstance = (): FirebaseApp | null => {
  if (cachedApp) return cachedApp;

  if (!isFirebaseConfigured()) {
    return null;
  }

  const config = getFirebaseConfig();

  if (getApps().length > 0) {
    cachedApp = getApp();
  } else {
    cachedApp = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
      measurementId: config.measurementId,
    });
  }

  return cachedApp;
};

/**
 * Obtém a instância do Cloud Firestore conectada ao banco provisionado.
 */
export const getFirestoreDb = (): Firestore | null => {
  if (cachedDb) return cachedDb;

  const appInstance = getFirebaseAppInstance();
  if (!appInstance) return null;

  const config = getFirebaseConfig();
  if (config.firestoreDatabaseId) {
    cachedDb = getFirestore(appInstance, config.firestoreDatabaseId);
  } else {
    cachedDb = getFirestore(appInstance);
  }

  return cachedDb;
};

/**
 * Obtém a instância do Firebase Authentication de forma segura.
 */
export const getFirebaseAuth = (): Auth | null => {
  if (cachedAuth) return cachedAuth;

  const appInstance = getFirebaseAppInstance();
  if (!appInstance) return null;

  cachedAuth = getAuth(appInstance);
  return cachedAuth;
};

// Exportações diretas padrão
export const app = getFirebaseAppInstance();
export const db = getFirestoreDb();
export const auth = getFirebaseAuth();

// Validação de conexão inicial com o Firestore
async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();
