import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Cpu, 
  History, 
  BarChart3, 
  Info, 
  ShieldCheck, 
  User, 
  LogOut, 
  Menu, 
  X,
  ScanLine
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const data = await api.getHealth();
        setHealthStatus(data);
      } catch (err) {
        setHealthStatus({ status: 'offline' });
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Car },
    { id: 'dashboard', label: 'Recognition', icon: ScanLine },
    { id: 'history', label: 'History', icon: History, requiresAuth: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, requiresAuth: true },
    { id: 'about', label: 'About & Privacy', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0d14]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => setActivePage('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 p-[1px] shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all">
              <div className="w-full h-full bg-dark-900 rounded-[11px] flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
                  SmartPlate<span className="text-brand-400">AI</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  ALPR 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Intelligent Vehicle Recognition</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.requiresAuth && !isAuthenticated) return null;
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action & Auth */}
          <div className="hidden md:flex items-center gap-4">
            {/* System Status Indicator */}
            <div 
              title={healthStatus?.status === 'healthy' ? `System Operational: ${healthStatus?.model_status?.ocr_engine} Active` : 'System Offline'}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400"
            >
              <span className={`w-2 h-2 rounded-full ${healthStatus?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-[11px] font-mono">
                {healthStatus?.status === 'healthy' ? 'AI Ready' : 'Connecting'}
              </span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200">{user?.username}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePage('login')}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActivePage('register')}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-lg shadow-brand-500/25 transition-all"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-dark-900 px-4 pt-2 pb-5 space-y-2">
          {navItems.map((item) => {
            if (item.requiresAuth && !isAuthenticated) return null;
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
          
          <div className="pt-3 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center font-bold text-white text-xs">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-200">{user?.username}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setActivePage('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center rounded-lg text-sm font-medium text-slate-300 bg-slate-800"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setActivePage('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center rounded-lg text-sm font-medium text-white bg-brand-600"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
