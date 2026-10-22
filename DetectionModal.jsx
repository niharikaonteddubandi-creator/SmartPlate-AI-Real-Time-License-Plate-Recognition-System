import React from 'react';
import { X, Trash2, Calendar, HardDrive, Percent, Tag, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

export default function DetectionModal({ record, onClose, onDelete }) {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono">
              RECORD #{record.id}
            </span>
            <span className="text-sm font-bold text-white">Detection Details</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Plate Number Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Registration Number</p>
              <div className="inline-block mt-1 bg-slate-100 text-slate-900 border-2 border-slate-900 font-mono font-black text-2xl px-4 py-1.5 rounded-lg shadow-md">
                {record.registration_number}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="text-right">
                <p className="text-slate-500">Overall Accuracy</p>
                <p className="font-bold text-lg text-brand-400 font-mono">
                  {Math.round(record.overall_confidence * 100)}%
                </p>
              </div>
              <div className="text-right pl-3 border-l border-slate-800">
                <p className="text-slate-500">Status</p>
                {record.is_uncertain ? (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Uncertain
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> High Confidence
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Plate Crop & Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {record.plate_crop_path && (
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">License Plate Crop</p>
                <div className="bg-black rounded-xl p-3 border border-slate-800 flex items-center justify-center min-h-[120px]">
                  <img
                    src={record.plate_crop_path}
                    alt="Plate Crop"
                    className="max-h-24 object-contain rounded"
                  />
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Original Vehicle Frame</p>
              <div className="bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[120px]">
                {record.annotated_image_path || record.original_image_path ? (
                  <img
                    src={record.annotated_image_path || record.original_image_path}
                    alt="Vehicle frame"
                    className="max-h-36 w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-500">No original image archived</span>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Table */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Timestamp
              </span>
              <span className="text-slate-200 font-mono">
                {new Date(record.created_at).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" /> Source Channel
              </span>
              <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
                {record.source_type}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-slate-500" /> Bounding Box Score
              </span>
              <span className="text-slate-200 font-mono">
                {Math.round(record.detection_confidence * 100)}%
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" /> Raw OCR Output
              </span>
              <span className="text-slate-200 font-mono truncate max-w-[200px]">
                {record.raw_ocr_text || record.registration_number}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm("Delete this detection record from your history?")) {
                onDelete(record.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Record</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
