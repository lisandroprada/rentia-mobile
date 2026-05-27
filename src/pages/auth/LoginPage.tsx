import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../contexts/AuthContext';
import { Auth2FAResponse } from '../../types';
import Spinner from '../../components/ui/Spinner';

interface Props {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: Props) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [twoFA, setTwoFA] = useState<Auth2FAResponse | null>(null);
  const [code, setCode] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if ('require2FA' in res) {
        setTwoFA(res);
      } else {
        login(res);
        onLogin();
      }
    } catch {
      toast.error('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e: FormEvent) => {
    e.preventDefault();
    if (!twoFA || !code) return;
    setLoading(true);
    try {
      const res = await authApi.verify2FA(twoFA.userId, code);
      login(res);
      onLogin();
    } catch {
      toast.error('Código incorrecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      {/* Top brand area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-8">
        <img
          src="/logo-dark.svg"
          alt="Rentia"
          className="h-10 w-auto mb-3"
        />
        <p className="text-sm text-gray-400 mt-1">Gestión inmobiliaria</p>
      </div>

      {/* Form card */}
      <div className="bg-white px-6 pb-10 flex flex-col gap-0">
        {!twoFA ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Iniciar sesión</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#2e3192] text-white font-semibold rounded-2xl mt-2 flex items-center justify-center gap-2 active:opacity-90 disabled:opacity-60 transition-opacity text-base"
              >
                {loading ? <Spinner size={20} /> : 'Ingresar'}
              </button>
            </form>
          </>
        ) : (
          <>
            <button
              onClick={() => setTwoFA(null)}
              className="text-sm text-blue-600 mb-4 text-left"
            >
              ← Volver
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verificación en dos pasos</h2>
            <p className="text-sm text-gray-500 mb-6">Ingresá el código de tu aplicación de autenticación.</p>
            <form onSubmit={handle2FA} className="flex flex-col gap-4">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-2xl font-mono tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000000"
                maxLength={6}
                required
              />
              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full py-4 bg-[#2e3192] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 active:opacity-90 disabled:opacity-60 transition-opacity text-base"
              >
                {loading ? <Spinner size={20} /> : 'Verificar'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
