import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Loader2,
  Info,
  Building2,
  UserCheck,
  RefreshCw,
  Copy
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAuthErrorMessage } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    activeCompany, 
    currentMember, 
    isLoadingCompany, 
    isConfigured, 
    login, 
    loginWithGoogle,
    register, 
    logout, 
    refreshMembership 
  } = useAuth();
  
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedUid, setCopiedUid] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyUid = () => {
    if (currentUser?.uid) {
      navigator.clipboard.writeText(currentUser.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMembership();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      setSuccessMessage('Login efetuado com sucesso via Google!');
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1000);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isConfigured) {
      setErrorMessage('As variáveis de ambiente do Firebase (VITE_FIREBASE_*) não foram configuradas.');
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, informe e-mail e senha.');
      return;
    }

    if (isRegisterMode && password !== confirmPassword) {
      setErrorMessage('A confirmação de senha não confere com a senha digitada.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegisterMode) {
        await register(email, password);
        setSuccessMessage('Conta criada e autenticada com sucesso!');
      } else {
        await login(email, password);
        setSuccessMessage('Login efetuado com sucesso!');
      }

      setTimeout(() => {
        onClose();
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setSuccessMessage(null);
      }, 1000);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await logout();
      setSuccessMessage('Sessão encerrada com sucesso.');
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 800);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-950/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {currentUser ? 'Perfil de Acesso Industrial' : isRegisterMode ? 'Criar Acesso Industrial' : 'Autenticação no Sistema'}
              </h3>
              <p className="text-xs text-slate-400">
                WebErpMes • Firebase Authentication
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Alerta de Firebase não configurado */}
          {!isConfigured && (
            <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-start gap-2.5 text-xs text-amber-300">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Firebase em Modo Preparação</strong>
                As credenciais em <code className="text-amber-200">.env</code> ainda não foram preenchidas. O sistema continuará operando normalmente em modo local seguro até que os segredos sejam adicionados.
              </div>
            </div>
          )}

          {/* Usuário já autenticado */}
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status da Sessão:</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Autenticado
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">E-mail:</span>
                  <span className="font-mono text-cyan-300 font-medium truncate max-w-[220px]">
                    {currentUser.email}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Identificador Estável (UID):</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 truncate max-w-[170px]" title={currentUser.uid}>
                      {currentUser.uid}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUid}
                      title="Copiar UID"
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded transition-colors"
                    >
                      {copiedUid ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Vínculo de Empresa & Multi-Tenancy (Fase 2B.2) */}
              <div className="p-4 bg-slate-950/80 border border-slate-800/90 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Vínculo Industrial (Empresa)
                  </span>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isRefreshing || isLoadingCompany}
                    title="Recarregar permissões e empresas vinculadas"
                    className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing || isLoadingCompany ? 'animate-spin' : ''}`} />
                    <span>Atualizar</span>
                  </button>
                </div>

                {activeCompany && currentMember ? (
                  <div className="space-y-2 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Empresa:</span>
                      <span className="font-semibold text-white truncate max-w-[180px]">
                        {activeCompany.name}
                      </span>
                    </div>
                    {activeCompany.code && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Código da Empresa:</span>
                        <span className="font-mono text-cyan-300 text-[11px]">
                          {activeCompany.code}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Função do Usuário:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                        currentMember.role === 'admin' 
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80' 
                          : 'bg-blue-950/80 text-blue-300 border border-blue-800/80'
                      }`}>
                        <UserCheck className="w-3 h-3" />
                        {currentMember.role === 'admin' ? 'Administrador' : 'Membro / Operador'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg text-xs space-y-1.5 text-amber-200/90">
                    <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Nenhuma Empresa Vinculada
                    </div>
                    <p className="text-[11px] text-amber-200/80 leading-relaxed">
                      Sua conta foi criada no Firebase, mas ainda não pertence a nenhuma indústria.
                      Para segurança multi-tenant, novos cadastros não recebem acesso nem papel administrativo automaticamente.
                    </p>
                    <p className="text-[10px] text-slate-400 pt-1 border-t border-amber-900/40">
                      Copie seu UID acima e envie ao Administrador da sua empresa para ser incluído no Firestore.
                    </p>
                  </div>
                )}
              </div>

              {/* Informação sobre isolamento e segurança */}
              <div className="p-2.5 bg-slate-950/40 border border-slate-800/60 rounded text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Isolamento ativo: regras do Firestore bloqueiam acesso cruzado entre empresas.</span>
              </div>

              {successMessage && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                onClick={handleLogout}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Encerrar Sessão (Logout)</span>
              </button>
            </div>
          ) : (
            /* Formulário de Login / Registro */
            <div className="space-y-4">
              {/* Botão de Login Direto com Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700/90 text-white font-medium text-xs rounded-lg border border-slate-700 flex items-center justify-center gap-2.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Acessar com Conta Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">ou com e-mail corporativo</span>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
              
              {errorMessage && (
                <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-lg text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Campo E-mail */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail Corporativo:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="usuario@industria.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Senha de Acesso:
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Confirmação de Senha (modo registro) */}
              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirmar Senha:
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-cyan-950/40 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isRegisterMode ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting
                    ? 'Processando...'
                    : isRegisterMode
                    ? 'Criar Nova Conta'
                    : 'Entrar no Sistema'}
                </span>
              </button>

              {/* Alternar entre Login e Cadastro */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
                >
                  {isRegisterMode
                    ? 'Já possui uma conta? Entrar aqui'
                    : 'Primeiro acesso? Criar nova conta de usuário'}
                </button>
              </div>

            </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-cyan-400" /> Sessão Criptografada
          </span>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
