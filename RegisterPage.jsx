import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight, AlertTriangle, ScanLine, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ setActivePage }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register(username, email, password, fullName);
      setActivePage('dashboard');
    } catch (err) {
      setError(err.message || "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mx-auto">
            <ScanLine className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Operator Account</h2>
          <p className="text-xs text-slate-400">
            Set up credentials to manage detection records, run video analytics, and export CSV logs.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="operator_one"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@smartplate.ai"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Full Name (Optional)</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Henderson"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already have an account?{' '}
          <button
            onClick={() => setActivePage('login')}
            className="text-brand-400 hover:underline font-semibold"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}
