import React, { useState, useRef } from 'react';
import { 
  Video, 
  Upload, 
  Film, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Sparkles,
  Save,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export default function VideoRecognition({ onSaveSuccess }) {
  const { isAuthenticated } = useAuth();
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState({});
  const fileInputRef = useRef(null);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const runVideoRecognition = async () => {
    if (!videoFile) {
      setError("Please select a video file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.recognizeVideo(videoFile);
      setResult(response);
    } catch (err) {
      setError(err.message || "Failed to process video file.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (det, index) => {
    if (!isAuthenticated) {
      alert("Please sign in or register to save detections to your history.");
      return;
    }

    try {
      await api.saveDetection({
        registration_number: det.registration_number,
        normalized_number: det.registration_number,
        raw_ocr_text: det.registration_number,
        detection_confidence: det.detection_confidence,
        ocr_confidence: det.ocr_confidence,
        overall_confidence: det.overall_confidence,
        source_type: 'video',
        original_image_url: det.frame_preview_url,
        annotated_image_url: det.frame_preview_url,
        plate_crop_url: det.plate_crop_url,
        bounding_box: det.bounding_box,
        metadata_info: {
          timestamp_seconds: det.timestamp_seconds,
          frame_number: det.frame_number,
          video_filename: result.video_filename
        }
      });

      setSavedIds(prev => ({ ...prev, [index]: true }));
      confetti({ particleCount: 40, spread: 50 });
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      alert("Could not save: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700/80 hover:border-brand-500/60 rounded-2xl p-8 text-center cursor-pointer bg-dark-850/60 hover:bg-dark-800/80 transition-all flex flex-col items-center justify-center min-h-[200px]"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleVideoChange}
              accept=".mp4,.avi,.mov,.webm,.mkv"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
              <Video className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">
              {videoFile ? videoFile.name : "Select or drag & drop vehicle surveillance video"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-2">
              Supports MP4, WebM, AVI, and MOV video recordings (traffic cameras, parking gates, dashcams).
            </p>
            {videoFile && (
              <span className="text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                Ready ({Math.round(videoFile.size / (1024 * 1024))} MB)
              </span>
            )}
          </div>

          {videoFile && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={runVideoRecognition}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-white bg-gradient-to-r from-cyan-600 via-brand-500 to-indigo-600 hover:opacity-95 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Video Frames (Deduplicating Plates)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Analyze Video with AI</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Video Feature Info */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan-400" />
            Video Pipeline Features
          </h4>
          <ul className="space-y-3 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">✓</span>
              <span><strong>Temporal Deduplication:</strong> Prevents redundant logging when a vehicle is visible in consecutive frames.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">✓</span>
              <span><strong>Keyframe Timeline:</strong> Extracts exact seconds and frame previews for every unique plate pass.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">✓</span>
              <span><strong>Dual-Metric Confidence:</strong> Bounding box localization confidence + OCR neural accuracy.</span>
            </li>
          </ul>

          {videoPreviewUrl && (
            <div className="pt-2 border-t border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 mb-2">Selected Video Preview:</p>
              <video 
                src={videoPreviewUrl} 
                controls 
                className="w-full max-h-36 rounded-lg bg-black object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Banner */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Video Analysis Completed</h3>
                <p className="text-xs text-slate-400">
                  {result.unique_plates.length} unique vehicle(s) recognized across {result.total_frames_analyzed} analyzed frames ({result.duration_seconds}s video).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                Processed in {result.processing_time_ms} ms
              </span>
            </div>
          </div>

          {/* Unique Detected Plates Ticker */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Unique License Plates Identified ({result.unique_plates.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.unique_plates.map((plate, i) => (
                <div 
                  key={i}
                  className="bg-slate-100 text-slate-900 border-2 border-slate-900 font-mono font-bold px-3 py-1 rounded-lg text-sm shadow-md"
                >
                  {plate}
                </div>
              ))}
              {result.unique_plates.length === 0 && (
                <p className="text-xs text-slate-500">No license plates identified in the sampled frames.</p>
              )}
            </div>
          </div>

          {/* Chronological Occurrence Timeline */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h4 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Detection Timeline & Verified Keyframes
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.detections.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-colors"
                >
                  {/* Frame Thumb */}
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                    <img
                      src={item.frame_preview_url}
                      alt="Frame preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300">
                      ⏱ {item.timestamp_seconds}s (Frame #{item.frame_number})
                    </div>
                  </div>

                  {/* Plate Readout */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Detected Plate</p>
                      <p className="text-lg font-bold font-mono text-white tracking-wide">
                        {item.registration_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500">Accuracy</p>
                      <span className="text-xs font-bold text-cyan-400 font-mono">
                        {Math.round(item.overall_confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleSaveItem(item, idx)}
                    disabled={savedIds[idx]}
                    className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                      savedIds[idx]
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savedIds[idx] ? 'Saved' : 'Save to History'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
