import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Save, 
  Clock, 
  Percent, 
  Sparkles,
  RefreshCw,
  Eye,
  Sliders,
  Car
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ImageRecognition({ onSaveSuccess }) {
  const { isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadSamples() {
      try {
        const data = await api.getSamples();
        setSamples(data);
      } catch (err) {
        console.error("Could not fetch samples", err);
      }
    }
    loadSamples();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      setSaveSuccess(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      setSaveSuccess(false);
    }
  };

  const handleSelectSample = (sample) => {
    setSelectedFile(null);
    setPreviewUrl(sample.url);
    setResult(null);
    setError(null);
    setSaveSuccess(false);
    runRecognition({ sampleFilename: sample.filename });
  };

  const runRecognition = async (opts = {}) => {
    const fileToUse = opts.file || selectedFile;
    const sampleToUse = opts.sampleFilename;

    if (!fileToUse && !sampleToUse) {
      setError("Please select an image file or choose a sample vehicle.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSaveSuccess(false);

    try {
      setLoadingStep('1/3: Localizing license plate boundaries...');
      await new Promise(r => setTimeout(r, 200));

      setLoadingStep('2/3: Applying OpenCV bilateral filter & thresholding...');
      const response = await api.recognizeImage({
        file: fileToUse,
        sampleFilename: sampleToUse
      });

      setLoadingStep('3/3: Running EasyOCR neural text reader...');
      await new Promise(r => setTimeout(r, 200));

      setResult(response);
    } catch (err) {
      setError(err.message || "Failed to process image. Please try another file.");
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleSaveResult = async (detection) => {
    if (!isAuthenticated) {
      alert("Please sign in or register to save detections to your private history.");
      return;
    }

    setSaving(true);
    try {
      await api.saveDetection({
        registration_number: detection.registration_number,
        normalized_number: detection.normalized_number,
        raw_ocr_text: detection.raw_ocr_text,
        detection_confidence: detection.detection_confidence,
        ocr_confidence: detection.ocr_confidence,
        overall_confidence: detection.overall_confidence,
        source_type: 'image',
        original_image_url: result.original_image_url,
        annotated_image_url: result.annotated_image_url,
        plate_crop_url: detection.plate_crop_url,
        bounding_box: detection.bounding_box,
        is_uncertain: detection.is_uncertain
      });

      setSaveSuccess(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone & Quick Samples */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dropzone */}
        <div className="lg:col-span-2">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700/80 hover:border-brand-500/60 rounded-2xl p-8 text-center cursor-pointer bg-dark-850/60 hover:bg-dark-800/80 transition-all flex flex-col items-center justify-center min-h-[220px] group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.webp,.bmp"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:scale-110 group-hover:bg-brand-500/20 transition-all mb-4">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">
              {selectedFile ? selectedFile.name : "Click to upload or drag & drop vehicle image"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-3">
              Supports high-resolution JPG, PNG, WEBP, or BMP photos of cars, trucks, and motorcycles.
            </p>
            {selectedFile && (
              <span className="text-xs text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/30">
                Ready for Analysis ({Math.round(selectedFile.size / 1024)} KB)
              </span>
            )}
          </div>

          {/* Action Trigger Button */}
          {previewUrl && (
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => runRecognition()}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-white bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 shadow-lg shadow-brand-500/25 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing Plate...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Run AI License Plate Recognition</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setResult(null);
                  setError(null);
                }}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Quick Demo Vehicles */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Car className="w-4 h-4 text-brand-400" />
              <h4 className="text-sm font-semibold text-slate-200">1-Click Test Samples</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Don't have a vehicle photo ready? Test instantly with pre-rendered vehicle plates:
            </p>
            <div className="space-y-2">
              {samples.map((s) => (
                <button
                  key={s.filename}
                  onClick={() => handleSelectSample(s)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/40 text-left transition-all group"
                >
                  <img
                    src={s.url}
                    alt={s.name}
                    className="w-12 h-9 object-cover rounded-lg border border-slate-700 group-hover:border-brand-400"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate group-hover:text-brand-300">
                      {s.name}
                    </p>
                    <p className="text-[10px] text-slate-500">Instant AI Scan</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Powered by EasyOCR & OpenCV</span>
            <span className="text-emerald-400">● Operational</span>
          </div>
        </div>
      </div>

      {/* Loading Progress State */}
      {loading && (
        <div className="glass-panel rounded-2xl p-8 border border-brand-500/30 text-center animate-pulse">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-200 mb-1">Deep Learning ALPR in Progress</h4>
          <p className="text-xs text-brand-400 font-mono">{loadingStep}</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-semibold">Recognition Notice</p>
            <p className="text-xs text-rose-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* Recognition Results View */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Stats */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Recognition Complete</h3>
                <p className="text-xs text-slate-400">
                  {result.detections.length > 0 
                    ? `Detected ${result.detections.length} license plate region(s)` 
                    : "No license plate found. Try an image with higher contrast or closer view."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                <span>{result.processing_time_ms} ms</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>{result.model_info?.ocr_engine || 'OCR'} Engine</span>
              </div>
            </div>
          </div>

          {/* Detections Showcase */}
          {result.detections.map((det, idx) => (
            <div 
              key={idx}
              className={`glass-panel rounded-2xl p-6 border transition-all ${
                det.is_uncertain ? 'border-amber-500/30' : 'border-brand-500/40 shadow-lg shadow-brand-500/5'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Plate Crop Preview */}
                <div className="lg:col-span-4 flex flex-col items-center">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 self-start">
                    Cropped & Enhanced Plate
                  </p>
                  <div className="w-full bg-slate-900 rounded-xl p-2 border border-slate-800 flex items-center justify-center min-h-[100px]">
                    {det.plate_crop_url ? (
                      <img 
                        src={det.plate_crop_url} 
                        alt="Plate crop" 
                        className="max-h-24 w-auto rounded object-contain shadow-md"
                      />
                    ) : (
                      <span className="text-xs text-slate-500">Plate Region</span>
                    )}
                  </div>
                </div>

                {/* Number Plate Graphic & Readout */}
                <div className="lg:col-span-5 flex flex-col items-center lg:items-start space-y-3">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Extracted Registration Number
                  </p>

                  {/* High Contrast Physical Plate Styled Badge */}
                  <div className="relative inline-flex items-center rounded-xl bg-slate-100 border-2 border-slate-900 px-4 py-2.5 shadow-2xl text-slate-900">
                    <div className="mr-3 pr-2.5 border-r border-slate-300 flex flex-col items-center">
                      <span className="text-[9px] font-bold tracking-tighter text-blue-700 leading-none">IND</span>
                      <span className="text-[8px] text-slate-500">ALPR</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider">
                      {det.registration_number}
                    </span>
                  </div>

                  {det.is_uncertain && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Uncertain characters detected (Confidence &lt; threshold)</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-400">
                    Raw OCR Output: <span className="font-mono text-slate-200">"{det.raw_ocr_text}"</span>
                  </p>
                </div>

                {/* Confidence Scores & Actions */}
                <div className="lg:col-span-3 flex flex-col space-y-3 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                  {/* Confidence Bars */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Overall Accuracy</span>
                      <span className="font-bold text-brand-400">{Math.round(det.overall_confidence * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${det.overall_confidence > 0.75 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                        style={{ width: `${Math.round(det.overall_confidence * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                      <p className="text-slate-500">Detection Conf</p>
                      <p className="font-semibold text-slate-200">{Math.round(det.detection_confidence * 100)}%</p>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
                      <p className="text-slate-500">OCR Conf</p>
                      <p className="font-semibold text-slate-200">{Math.round(det.ocr_confidence * 100)}%</p>
                    </div>
                  </div>

                  {/* Save to History Button */}
                  <button
                    onClick={() => handleSaveResult(det)}
                    disabled={saving || saveSuccess}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                      saveSuccess
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-brand-600 hover:bg-brand-500 text-white shadow-md'
                    }`}
                  >
                    {saveSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Saved to History</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Saving...' : 'Save Result to History'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Full Annotated Image Viewer */}
          {result.annotated_image_url && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-brand-400" />
                  <h4 className="text-sm font-semibold text-slate-200">Annotated Vehicle Image with Bounding Boxes</h4>
                </div>
                <a
                  href={result.annotated_image_url}
                  download="smartplate_annotated.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download Result
                </a>
              </div>
              <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <img
                  src={result.annotated_image_url}
                  alt="Annotated detection"
                  className="max-h-[500px] w-auto object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
