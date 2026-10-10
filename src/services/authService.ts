import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User, 
  AuthError 
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase';

/**
 * Traduz os códigos de erro do Firebase Authentication para mensagens amigáveis em português
 */
export const getAuthErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== 'object') {
    return 'Ocorreu um erro inesperado durante a autenticação.';
  }

  const authError = error as AuthError;
  switch (authError.code) {
    case 'auth/invalid-email':
      return 'O formato do e-mail informado é inválido.';
    case 'auth/user-disabled':
      return 'Este usuário foi desativado pelo administrador.';
    case 'auth/user-not-found':
      return 'Nenhum usuário cadastrado com este e-mail.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Já existe uma conta cadastrada com este e-mail.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Utilize no mínimo 6 caracteres com números ou símbolos.';
    case 'auth/network-request-failed':
      return 'Falha de conexão com a internet. Verifique sua rede.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas consecutivas. Aguarde alguns instantes antes de tentar novamente.';
    case 'auth/operation-not-allowed':
      return 'O provedor de autenticação selecionado não está habilitado no Console do Firebase.';
    case 'auth/popup-closed-by-user':
      return 'A janela de autenticação Google foi fechada antes de concluir o acesso.';
    case 'auth/cancelled-popup-request':
      return 'Solicitação de acesso cancelada pelo usuário.';
    case 'auth/popup-blocked':
      return 'O navegador bloqueou a janela pop-up de login. Permita pop-ups para este site.';
    default:
      return authError.message || 'Falha ao processar a autenticação.';
  }
};

/**
 * Serviço centralizado de Autenticação do WebErpMes Industrial
 */
export const authService = {
  /**
   * Verifica se o serviço de autenticação está configurado e disponível
   */
  isAvailable(): boolean {
    return isFirebaseConfigured() && getFirebaseAuth() !== null;
  },

  /**
   * Realiza login com o Google (Configurado por padrão pelo provisionamento)
   */
  async loginWithGoogle(): Promise<User> {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('O Firebase Authentication não está configurado no ambiente.');
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  },

  /**
   * Realiza login com e-mail e senha
   */
  async login(email: string, password: string): Promise<User> {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('O Firebase Authentication não está configurado no ambiente.');
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    return userCredential.user;
  },

  /**
   * Cria uma nova conta com e-mail e senha
   */
  async register(email: string, password: string): Promise<User> {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('O Firebase Authentication não está configurado no ambiente.');
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    if (password.length < 6) {
      throw new Error('A senha deve conter no mínimo 6 caracteres.');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
    return userCredential.user;
  },

  /**
   * Encerra a sessão do usuário atual
   */
  async logout(): Promise<void> {
    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }

    await firebaseSignOut(auth);
  },

  /**
   * Observa mudanças no estado de autenticação (persiste automaticamente pela sessão do Firebase)
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const auth = getFirebaseAuth();
    if (!auth) {
      callback(null);
      return () => {};
    }

    return onAuthStateChanged(auth, callback);
  },

  /**
   * Retorna o usuário autenticado atualmente, se houver
   */
  getCurrentUser(): User | null {
    const auth = getFirebaseAuth();
    return auth ? auth.currentUser : null;
  }
};
