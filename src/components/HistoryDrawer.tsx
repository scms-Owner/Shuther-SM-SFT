import React from 'react';
import { ChallanRecord } from '../types';
import { calculateChallanSummary, formatDec } from '../utils/calculator';
import { X, Clock, Trash2, ArrowRight, FileText } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: ChallanRecord[];
  onSelectRecord: (record: ChallanRecord) => void;
  onDeleteRecord: (id: string) => void;
  lang: 'bn' | 'en';
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  records,
  onSelectRecord,
  onDeleteRecord,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">
              {lang === 'bn' ? 'সংরক্ষিত চালান হিস্ট্রি' : 'Saved Challan History'}
            </h3>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
              {records.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {records.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
              <FileText className="w-10 h-10 mb-2 text-slate-600" />
              <p className="text-sm font-medium">
                {lang === 'bn' ? 'কোনো সংরক্ষিত চালান নেই' : 'No saved challans yet'}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {lang === 'bn' ? 'নতুন চালান স্ক্যান করলে তা এখানে সংরক্ষিত হবে' : 'Scanned challans will appear here'}
              </p>
            </div>
          ) : (
            records.map((rec) => {
              const summary = calculateChallanSummary(rec.items, rec.ratePerSqft);
              return (
                <div
                  key={rec.id}
                  className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl transition group flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <span>পাস নং: {rec.header.passNumber || 'N/A'}</span>
                        {rec.header.transportNumber && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded">
                            {rec.header.transportNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {rec.header.date || new Date(rec.createdAt).toLocaleDateString()} | {rec.header.recipient || 'Site Recipient'}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteRecord(rec.id)}
                      className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                      title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-2 rounded-lg text-center font-mono text-xs border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 block">শাটার</span>
                      <span className="font-semibold text-slate-200">{summary.totalPieces} পিস</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">m²</span>
                      <span className="font-semibold text-emerald-400">{formatDec(summary.totalSqm, 1)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">sqft</span>
                      <span className="font-semibold text-blue-400">{formatDec(summary.totalSqft, 1)}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        onSelectRecord(rec);
                        onClose();
                      }}
                      className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition"
                    >
                      <span>{lang === 'bn' ? 'এই চালানটি খুলুন' : 'Open Challan'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
