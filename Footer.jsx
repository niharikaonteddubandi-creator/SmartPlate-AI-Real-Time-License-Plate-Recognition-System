import React from 'react';
import { Shield, Cpu, Lock, FileCode, CheckCircle2 } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="border-t border-slate-800/80 bg-dark-950/80 text-slate-400 py-10 mt-auto text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base">SmartPlate AI</span>
              <span className="text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded-full font-mono">
                v1.0.0 Stable
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Modern high-precision vehicle registration detection and Optical Character Recognition (OCR). 
              Engineered with OpenCV, YOLO-compatible architecture, and EasyOCR deep learning text recognition.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> OpenCV Edge Pipeline
              </span>
              <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                <Cpu className="w-3.5 h-3.5 text-brand-400" /> EasyOCR Neural Engine
              </span>
              <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                <Lock className="w-3.5 h-3.5 text-cyan-400" /> Privacy First
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">System Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActivePage('dashboard')} className="hover:text-brand-400 transition-colors">
                  Live Recognition Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('history')} className="hover:text-brand-400 transition-colors">
                  Searchable History & CSV
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('analytics')} className="hover:text-brand-400 transition-colors">
                  Recognition Analytics
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('about')} className="hover:text-brand-400 transition-colors">
                  How It Works & Architecture
                </button>
              </li>
            </ul>
          </div>

          {/* Privacy & Legal */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Responsible AI</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActivePage('about')} className="hover:text-brand-400 transition-colors flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-brand-400" /> Privacy Policy
                </button>
              </li>
              <li className="text-slate-500">No Facial Recognition</li>
              <li className="text-slate-500">No External Vehicle Registry Access</li>
              <li className="text-slate-500">Local Processing & User Control</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SmartPlate AI. Built for real-world automated license plate recognition.</p>
          <p className="flex items-center gap-1">
            FastAPI Backend • React 18 • Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
