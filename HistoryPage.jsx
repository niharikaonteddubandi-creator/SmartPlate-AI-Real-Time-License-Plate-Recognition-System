import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Trash2, 
  Eye, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Car, 
  AlertTriangle,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DetectionModal from '../components/DetectionModal';

export default function HistoryPage({ setActivePage }) {
  const { isAuthenticated } = useAuth();
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sourceType, setSourceType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, currentPage, sourceType]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getDetections({
        page: currentPage,
        pageSize,
        search,
        sourceType,
        startDate,
        endDate,
      });
      setRecords(data.items);
      setTotalRecords(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error("Error loading detections:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadHistory();
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteDetection(id);
      loadHistory();
    } catch (err) {
      alert("Failed to delete record: " + err.message);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await api.downloadCsv();
    } catch (err) {
      alert("Could not export CSV: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mx-auto">
          <History className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Authentication Required</h2>
        <p className="text-xs text-slate-400">
          Detection records and personal vehicle history are securely protected. Please sign in or register to view your detections.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setActivePage('login')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20"
          >
            Sign In to Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            Detection History
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono">
              {totalRecords} RECORDS
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Searchable audit trail of verified vehicle license plates and optical recognition scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={exporting || totalRecords === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Exporting...' : 'Export to CSV'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Plate Search Input */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search registration number (e.g. MH 12, DL 01)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
            />
          </div>

          {/* Source Type Filter */}
          <div className="lg:col-span-3">
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500/50"
            >
              <option value="all">All Channels (Image, Video, Webcam)</option>
              <option value="image">Uploaded Images</option>
              <option value="video">Surveillance Video</option>
              <option value="webcam">Live Webcam</option>
            </select>
          </div>

          {/* Date Picker Start */}
          <div className="lg:col-span-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500/50"
            />
          </div>

          {/* Search Trigger Button */}
          <div className="lg:col-span-2 flex gap-2">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </form>

      {/* History Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Plate Crop</th>
                <th className="py-3.5 px-4">Registration Number</th>
                <th className="py-3.5 px-4">Accuracy / Status</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-400" />
                    <span>Loading detection records...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <HardDrive className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-400">No detection records found</p>
                    <p className="text-xs text-slate-600 mt-1">Run an image, video, or webcam recognition scan to save records.</p>
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Plate Crop Thumbnail */}
                    <td className="py-3 px-4">
                      {r.plate_crop_path ? (
                        <img
                          src={r.plate_crop_path}
                          alt="Plate thumb"
                          className="w-16 h-8 object-cover rounded bg-black border border-slate-700"
                        />
                      ) : (
                        <div className="w-16 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px] text-slate-600">
                          N/A
                        </div>
                      )}
                    </td>

                    {/* Registration Number */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white text-sm tracking-wide">
                        {r.registration_number}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        Raw: {r.raw_ocr_text || r.registration_number}
                      </div>
                    </td>

                    {/* Accuracy Score */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-brand-400">
                          {Math.round(r.overall_confidence * 100)}%
                        </span>
                        {r.is_uncertain ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Uncertain
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Verified
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Source Channel */}
                    <td className="py-3 px-4 capitalize">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 font-mono text-[11px] border border-slate-700/60">
                        {r.source_type}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(r.created_at).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRecord(r)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete record for ${r.registration_number}?`)) {
                              handleDelete(r.id);
                            }
                          }}
                          title="Delete Record"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900/40 text-xs">
            <span className="text-slate-400">
              Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
              <span className="font-semibold text-white">{totalPages}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <DetectionModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
