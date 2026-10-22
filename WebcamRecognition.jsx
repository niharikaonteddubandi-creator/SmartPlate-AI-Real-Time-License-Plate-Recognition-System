import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  VideoOff, 
  Play, 
  Square, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  Save, 
  RefreshCw,
  Sliders
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export default function WebcamRecognition({ onSaveSuccess }) {
  const { isAuthenticated } = useAuth();
  const [isStreaming, setIsStreaming] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [latestDetection, setLatestDetection] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const startWebcam = async () => {
    setPermissionError(null);
    setLatestDetection(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment'
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsStreaming(true);

      // Start processing loop every 1.5 seconds to balance responsiveness and load
      intervalRef.current = setInterval(captureAndProcessFrame, 1500);
    } catch (err) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError("Camera permission was denied. Please allow camera access in browser permissions.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError("No camera hardware found on this system.");
      } else {
        setPermissionError("Failed to access camera: " + err.message);
      }
      setIsStreaming(false);
    }
  };

  const stopWebcam = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const captureAndProcessFrame = async () => {
    if (!videoRef.current || !canvasRef.current || processing) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    setProcessing(true);
    try {
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Data = canvas.toDataURL('image/jpeg', 0.85);

      const res = await api.recognizeWebcamFrame(base64Data);
      setScanCount(c => c + 1);

      if (res.detections && res.detections.length > 0) {
        setLatestDetection(res.detections[0]);
      }
    } catch (err) {
      console.warn("Live frame scan error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveSnapshot = async () => {
    if (!latestDetection) return;
    if (!isAuthenticated) {
      alert("Please sign in or register to save detections.");
      return;
    }

    try {
      await api.saveDetection({
        registration_number: latestDetection.registration_number,
        normalized_number: latestDetection.normalized_number,
        raw_ocr_text: latestDetection.raw_ocr_text,
        detection_confidence: latestDetection.detection_confidence,
        ocr_confidence: latestDetection.ocr_confidence,
        overall_confidence: latestDetection.overall_confidence,
        source_type: 'webcam',
        plate_crop_url: latestDetection.plate_crop_url,
        bounding_box: latestDetection.bounding_box,
        is_uncertain: latestDetection.is_uncertain
      });

      setSavedSuccess(true);
      confetti({ particleCount: 40, spread: 50 });
      setTimeout(() => setSavedSuccess(false), 3000);
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      alert("Failed to save: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-400" />
            Live Camera ALPR Scanner
          </h3>
          <p className="text-xs text-slate-400">
            Real-time optical license plate detection via device camera or connected video source.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isStreaming ? (
            <button
              onClick={startWebcam}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-600/20 transition-all text-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Webcam</span>
            </button>
          ) : (
            <button
              onClick={stopWebcam}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition-all text-sm"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop Webcam</span>
            </button>
          )}
        </div>
      </div>

      {/* Permission or Hardware Error */}
      {permissionError && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div>
            <p className="font-semibold">Camera Access Notice</p>
            <p className="text-xs text-amber-300/90">{permissionError}</p>
          </div>
        </div>
      )}

      {/* Video Viewport & Real-Time Readout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stream Box */}
        <div className="lg:col-span-8">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
            {/* Live Video */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${!isStreaming ? 'hidden' : 'block'}`}
            />
            {/* Hidden canvas for taking snapshot frames */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Offline Placeholder */}
            {!isStreaming && (
              <div className="text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <VideoOff className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">Camera Feed Inactive</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Click "Start Webcam" above to request camera permission and start real-time license plate detection.
                </p>
              </div>
            )}

            {/* Live Badge overlay */}
            {isStreaming && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-mono text-white text-[11px] font-semibold">LIVE CAMERA</span>
                {processing && (
                  <span className="text-[10px] text-brand-300 font-mono flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Scanning
                  </span>
                )}
              </div>
            )}

            {/* Scan target grid guide */}
            {isStreaming && (
              <div className="absolute inset-x-12 inset-y-8 pointer-events-none border-2 border-brand-400/20 rounded-2xl flex items-center justify-center">
                <div className="w-64 h-24 border border-dashed border-brand-400/40 rounded-lg flex items-center justify-center text-center">
                  <span className="text-[10px] font-mono text-brand-400/60 uppercase tracking-wider">
                    Position License Plate Inside Frame
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Detection Feed Panel */}
        <div className="lg:col-span-4 flex flex-col justify-between glass-panel rounded-2xl p-5 border border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Live Recognition Output
              </h4>
              <span className="text-[11px] font-mono text-slate-500">Scans: {scanCount}</span>
            </div>

            {latestDetection ? (
              <div className="space-y-4">
                {/* Physical Plate Graphic */}
                <div className="bg-slate-100 text-slate-900 border-2 border-slate-900 rounded-xl p-3 shadow-xl">
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 border-b border-slate-200 pb-1 mb-1">
                    <span className="text-blue-700">IND • ALPR</span>
                    <span>CONF: {Math.round(latestDetection.overall_confidence * 100)}%</span>
                  </div>
                  <div className="text-center font-mono font-black text-2xl tracking-wider text-slate-900 py-1">
                    {latestDetection.registration_number}
                  </div>
                </div>

                {/* Crop thumbnail */}
                {latestDetection.plate_crop_url && (
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">Detected Plate Snapshot:</p>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex items-center justify-center">
                      <img
                        src={latestDetection.plate_crop_url}
                        alt="Webcam plate crop"
                        className="max-h-16 w-auto object-contain rounded"
                      />
                    </div>
                  </div>
                )}

                {/* Score breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500">Box Confidence</p>
                    <p className="font-semibold text-slate-200">{Math.round(latestDetection.detection_confidence * 100)}%</p>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500">OCR Confidence</p>
                    <p className="font-semibold text-slate-200">{Math.round(latestDetection.ocr_confidence * 100)}%</p>
                  </div>
                </div>

                {latestDetection.is_uncertain && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Low contrast or motion blur. Check lighting.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 space-y-2">
                <Sparkles className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Waiting for vehicle plate in camera view...</p>
                <p className="text-[11px] text-slate-600">Ensure the plate is upright and well illuminated.</p>
              </div>
            )}
          </div>

          {/* Action */}
          {latestDetection && (
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleSaveSnapshot}
                disabled={savedSuccess}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
                  savedSuccess
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-md'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{savedSuccess ? 'Snapshot Saved to Records' : 'Save Live Plate to History'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
