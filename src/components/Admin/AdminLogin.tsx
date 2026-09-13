import React, { useState } from 'react';
import { api } from '../../services/api';
import { Lock, ShieldAlert, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onExit: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onExit }) => {
  const [email, setEmail] = useState('admin@deniqwears.com');
  const [password, setPassword] = useState('deniq2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.adminLogin(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#171714] text-[#FAF9F6] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-[#22221E] border border-[#3A3935] p-8 shadow-xl">
        <button
          onClick={onExit}
          className="inline-flex items-center space-x-2 text-xs text-[#8A8780] hover:text-[#FAF9F6] transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Storefront</span>
        </button>

        <div className="space-y-2 mb-8">
          <div className="flex items-center space-x-2 text-[#C4828E]">
            <Lock className="w-4 h-4" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold">
              Restricted Back-Office
            </span>
          </div>
          <h1 className="font-serif text-2xl text-[#FAF9F6]">Deniq Atelier Admin</h1>
          <p className="text-xs text-[#8A8780]">
            Authenticate with your showroom management credentials to access live inventory, orders, and pricing controls.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2 mb-6">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#8A8780] mb-1 font-semibold">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#171714] border border-[#3A3935] px-3 py-2.5 text-xs text-[#FAF9F6] focus:outline-none focus:border-[#C4828E]"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#8A8780] mb-1 font-semibold">
              Passcode
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#171714] border border-[#3A3935] px-3 py-2.5 text-xs text-[#FAF9F6] focus:outline-none focus:border-[#C4828E]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FAF9F6] text-[#171714] hover:bg-[#C4828E] hover:text-white text-xs font-semibold uppercase tracking-[0.16em] py-3 transition-colors cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Back-Office'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-[#3A3935] text-[11px] text-[#8A8780]">
          <p>Demo Showroom Access:</p>
          <p className="font-mono text-xs text-[#FAF9F6] mt-0.5">admin@deniqwears.com / deniq2026</p>
        </div>
      </div>
    </div>
  );
};
