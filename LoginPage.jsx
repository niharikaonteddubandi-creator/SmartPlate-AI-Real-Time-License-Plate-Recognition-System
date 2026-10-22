import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight, AlertTriangle, ScanLine, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ setActivePage }) {
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setError("Please enter both username/email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(usernameOrEmail, password);
      setActivePage('dashboard');
    } catch (err) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsernameOrEmail('demo@smartplate.ai');
    setPassword('Demo123!');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mx-auto">
            <ScanLine className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Sign In to SmartPlate AI</h2>
          <p className="text-xs text-slate-400">
            Access your private license plate history and recognition telemetry.
          </p>
        </div>

        {/* Demo Quick Fill Card */}
        <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-brand-300">Quick Test Account</p>
            <p className="text-[11px] text-slate-400">demo@smartplate.ai • Demo123!</p>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-[11px] transition-colors"
          >
            Auto Fill
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">Username or Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="operator@smartplate.ai"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Don't have an account?{' '}
          <button
            onClick={() => setActivePage('register')}
            className="text-brand-400 hover:underline font-semibold"
          >
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
}
