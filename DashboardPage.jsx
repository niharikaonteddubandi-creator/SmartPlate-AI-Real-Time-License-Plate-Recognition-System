import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  Camera, 
  Sparkles, 
  ShieldCheck, 
  SlidersHorizontal,
  History
} from 'lucide-react';
import ImageRecognition from '../components/ImageRecognition';
import VideoRecognition from '../components/VideoRecognition';
import WebcamRecognition from '../components/WebcamRecognition';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage({ setActivePage }) {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('image'); // 'image', 'video', 'webcam'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const tabs = [
    { id: 'image', label: 'Image Recognition', icon: ImageIcon, badge: 'Popular' },
    { id: 'video', label: 'Surveillance Video', icon: Video, badge: 'Deduplicated' },
    { id: 'webcam', label: 'Live Camera Stream', icon: Camera, badge: 'Real-Time' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm shadow-xl flex items-center gap-2 animate-bounce">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            Recognition Workspace
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono">
              ALPR ENGINE
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Detect vehicle license plates and extract registration numbers using OpenCV & EasyOCR.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => setActivePage('history')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <History className="w-4 h-4 text-brand-400" />
              <span>View Saved Detections</span>
            </button>
          ) : (
            <button
              onClick={() => setActivePage('login')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-500/15 hover:bg-brand-500/25 text-brand-300 border border-brand-500/30 transition-colors"
            >
              <span>Sign In to Save History</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isActive ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Workspace Panel */}
      <div className="animate-fadeIn">
        {activeTab === 'image' && (
          <ImageRecognition onSaveSuccess={() => showToast("Detection saved to your personal history!")} />
        )}
        {activeTab === 'video' && (
          <VideoRecognition onSaveSuccess={() => showToast("Video detection saved to your personal history!")} />
        )}
        {activeTab === 'webcam' && (
          <WebcamRecognition onSaveSuccess={() => showToast("Live webcam frame saved to your personal history!")} />
        )}
      </div>
    </div>
  );
}
