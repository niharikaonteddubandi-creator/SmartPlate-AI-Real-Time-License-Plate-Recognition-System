import React from 'react';
import { 
  ScanLine, 
  Car, 
  Video, 
  Camera, 
  History, 
  BarChart3, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export default function HomePage({ setActivePage }) {
  const features = [
    {
      id: 'image',
      icon: Car,
      title: 'Vehicle Image Recognition',
      desc: 'Upload high-resolution vehicle photos in JPG, PNG, or WEBP. Automatically locates plates with OpenCV and extracts characters using EasyOCR.',
      action: 'dashboard',
      color: 'from-blue-600 to-cyan-500',
    },
    {
      id: 'video',
      icon: Video,
      title: 'Video Stream Processing',
      desc: 'Batch-process surveillance video feeds and dashcam footage. Features smart temporal deduplication to prevent duplicate logging of the same car.',
      action: 'dashboard',
      color: 'from-cyan-600 to-teal-500',
    },
    {
      id: 'webcam',
      icon: Camera,
      title: 'Live Webcam Scanner',
      desc: 'Stream frames in near real time from device cameras or traffic feeds with instant bounding-box visualization and live character tickers.',
      action: 'dashboard',
      color: 'from-emerald-600 to-green-500',
    },
    {
      id: 'history',
      icon: History,
      title: 'Searchable Audit History',
      desc: 'Manage private detection records, search by vehicle registration number, filter by date ranges, and export your database to CSV.',
      action: 'history',
      color: 'from-indigo-600 to-brand-500',
    },
  ];

  const workflowSteps = [
    {
      num: '01',
      title: 'Frame Input & Validation',
      desc: 'Accepts high-res images, video keyframes, or live webcam video feeds with input validation.'
    },
    {
      num: '02',
      title: 'YOLO & Morphological Detection',
      desc: 'Applies bilateral edge filtering and rectangular contour aspect-ratio localization to isolate plate regions.'
    },
    {
      num: '03',
      title: 'OpenCV Preprocessing',
      desc: 'CLAHE contrast enhancement, adaptive Gaussian thresholding, and perspective rectification.'
    },
    {
      num: '04',
      title: 'EasyOCR Neural Recognition',
      desc: 'Deep learning character classification with separate detection and OCR confidence scoring.'
    },
    {
      num: '05',
      title: 'Normalization & Storage',
      desc: 'Plate syntax formatting, uncertain character alerts, and secure private SQLite storage.'
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 text-center space-y-6 max-w-4xl mx-auto px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-2 shadow-sm">
          <Zap className="w-3.5 h-3.5" />
          <span>Real-Time Computer Vision & Optical Character Recognition</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          SmartPlate <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">AI</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto">
          Intelligent Vehicle Number Plate Recognition in Real Time
        </p>

        {/* Description */}
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          High-performance ALPR web platform for security checkpoints, parking management, and traffic monitoring.
          Combines OpenCV computer vision, YOLO plate localization, and EasyOCR deep neural networks.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActivePage('dashboard')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 shadow-xl shadow-brand-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <ScanLine className="w-5 h-5" />
            <span>Launch Recognition Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={() => setActivePage('about')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all"
          >
            <Cpu className="w-4 h-4 text-brand-400" />
            <span>How The Pipeline Works</span>
          </button>
        </div>

        {/* Trust & Architecture Badges */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> OpenCV Preprocessing
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> EasyOCR Neural Net
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dual-Metric Confidence
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SQLite / PostgreSQL
          </span>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl font-bold text-white">Full-Featured ALPR Capabilities</h2>
          <p className="text-sm text-slate-400">Engineered for accuracy, deduplication, and production deployments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => setActivePage(feat.action)}
                className="glass-panel-interactive rounded-2xl p-6 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} p-[1px] mb-4`}>
                    <div className="w-full h-full bg-dark-900 rounded-[11px] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-brand-400 group-hover:text-cyan-300">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Pipeline Architecture Explanation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 md:p-12 border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
              System Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              End-to-End Recognition Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              How SmartPlate AI processes raw pixels into verified vehicle registration numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {workflowSteps.map((step, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 relative space-y-2 hover:border-brand-500/40 transition-colors"
              >
                <div className="font-mono text-2xl font-black text-brand-500/40">{step.num}</div>
                <h4 className="text-sm font-bold text-white">{step.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-r from-brand-900/60 via-slate-900/80 to-dark-900 border border-brand-500/30 p-8 sm:p-12 text-center space-y-5 shadow-2xl">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to test real vehicle plates?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Try our instant demo vehicles or upload your own vehicle pictures to see live AI plate detection and character OCR in action.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActivePage('dashboard')}
              className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-400 shadow-xl shadow-brand-500/30 transition-all"
            >
              Start Free Demo Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
