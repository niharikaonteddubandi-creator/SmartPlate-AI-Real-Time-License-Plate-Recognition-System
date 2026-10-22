import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Lock, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  Camera,
  Database,
  Layers
} from 'lucide-react';

export default function AboutPage() {
  const faqs = [
    {
      q: "How does SmartPlate AI detect license plates?",
      a: "The system utilizes OpenCV computer vision algorithms (bilateral noise filtering, morphological rectangular closing, and aspect-ratio contour filters) to pinpoint license plate boundaries. If configured, custom YOLO neural weights can also be loaded for multi-vehicle bounding box localization."
    },
    {
      q: "What OCR engine is used for character extraction?",
      a: "Optical Character Recognition is powered by EasyOCR, a PyTorch-based deep learning OCR library with CRNN architectures trained to read alphanumeric vehicle characters under varying illumination, angles, and camera quality."
    },
    {
      q: "Why are detection and OCR confidence separated?",
      a: "Finding the physical plate rectangle (detection confidence) and correctly transcribing the characters (OCR confidence) are distinct machine learning steps. Separating them allows operators to identify when a plate was located but characters are blurred or obscured."
    },
    {
      q: "What happens when a plate is marked 'Uncertain'?",
      a: "When either detection or OCR confidence drops below the configurable threshold (default 35%-40%), the system flags the result as uncertain. The platform never fabricates or silently mutates low-confidence characters."
    },
    {
      q: "Does SmartPlate AI access government or DMV registration records?",
      a: "No. SmartPlate AI is strictly an optical recognition system. It does not connect to law enforcement databases, DMV registries, or personal vehicle owner records."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono">
          DOCUMENTATION & ETHICS
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          About SmartPlate AI & Responsible Use
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Technical architecture, optical processing pipelines, system limitations, and data privacy principles.
        </p>
      </div>

      {/* Technology Architecture Section */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Technical Architecture & Stack</h2>
            <p className="text-xs text-slate-400">Modular design built for high throughput and local execution.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Frontend Layer</h3>
            <p className="text-xs text-slate-300">
              React 18 single-page application styled with Tailwind CSS, Lucide icons, and Recharts interactive SVG graphs. Supports responsive mobile and desktop viewing.
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Backend & API</h3>
            <p className="text-xs text-slate-300">
              FastAPI asynchronous web server with typed Pydantic models, SQLite / PostgreSQL via SQLAlchemy ORM, and JWT bearer token security with bcrypt password hashing.
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AI & Computer Vision</h3>
            <p className="text-xs text-slate-300">
              OpenCV for image enhancement (CLAHE, bilateral filtering, Otsu thresholding), YOLO architecture compatibility, and EasyOCR deep neural network for character recognition.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy & Responsible Use */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Privacy Policy & Ethical AI Principles</h2>
            <p className="text-xs text-slate-400">Clear guidelines on data processing, camera permissions, and user ownership.</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-brand-400" />
              1. Camera & Webcam Stream Consent
            </h4>
            <p>
              SmartPlate AI accesses video cameras only after explicit user interaction via the "Start Webcam" button. 
              The application never activates video recording in the background without user knowledge.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              2. Vehicle License Plates Only – No Facial Recognition
            </h4>
            <p>
              This system is strictly trained and programmed for vehicle license plates. It does not perform facial recognition, 
              biometric tracking, or pedestrian identification under any circumstance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              3. Data Ownership & Deletion Rights
            </h4>
            <p>
              Users have full ownership of their detection logs. Every detection record can be viewed, exported to CSV, or permanently deleted 
              from the system at any time with a single click.
            </p>
          </div>
        </div>
      </section>

      {/* Limitations Section */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Known Limitations & Environmental Factors
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          While SmartPlate AI provides robust ALPR accuracy, recognition performance may vary depending on:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <li className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-amber-400">●</span>
            <span><strong>Extreme Angles:</strong> Severe perspective skew (&gt;45 degrees) reduces character legibility.</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-amber-400">●</span>
            <span><strong>Severe Motion Blur:</strong> High-speed vehicles passing without high-shutter cameras.</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-amber-400">●</span>
            <span><strong>Low Illumination:</strong> Unlit nighttime scenes without infrared or vehicle taillights.</span>
          </li>
          <li className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-amber-400">●</span>
            <span><strong>Physical Plate Damage:</strong> Plates heavily occluded by dirt, snow, or bent brackets.</span>
          </li>
        </ul>
      </section>

      {/* FAQs */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-brand-400" />
          Frequently Asked Questions
        </h3>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-200">{faq.q}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
