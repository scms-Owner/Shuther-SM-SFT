import React from 'react';
import { SummaryCalculation } from '../types';
import { formatDec } from '../utils/calculator';
import { Layers, Maximize, Ruler, Sparkles, DollarSign } from 'lucide-react';

interface SummaryCardsProps {
  summary: SummaryCalculation;
  ratePerSqft: number;
  onRateChange: (rate: number) => void;
  lang: 'bn' | 'en';
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  ratePerSqft,
  onRateChange,
  lang,
}) => {
  return (
    <div className="space-y-4">
      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Pieces */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {lang === 'bn' ? 'মোট শাটার সংখ্যা' : 'Total Pieces'}
            </span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {summary.totalPieces}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {lang === 'bn' ? 'পিস' : 'pcs'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {lang === 'bn' ? `${summary.uniqueSizesCount} টি ভিন্ন সাইজ` : `${summary.uniqueSizesCount} unique sizes`}
          </div>
        </div>

        {/* Total Square Meters */}
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-4 shadow-lg relative overflow-hidden group hover:border-emerald-600/40 transition">
          <div className="flex items-center justify-between text-emerald-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {lang === 'bn' ? 'মোট স্কয়ার মিটার' : 'Total Area (Sqm)'}
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Maximize className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {formatDec(summary.totalSqm, 2)}
            </span>
            <span className="text-xs text-emerald-500 font-mono font-semibold">
              m²
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            {formatDec(summary.totalSqm, 4)} m²
          </div>
        </div>

        {/* Total Square Feet */}
        <div className="bg-slate-900/90 border border-blue-900/40 rounded-2xl p-4 shadow-lg relative overflow-hidden group hover:border-blue-600/40 transition">
          <div className="flex items-center justify-between text-blue-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {lang === 'bn' ? 'মোট স্কয়ার ফিট' : 'Total Area (Sqft)'}
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
              {formatDec(summary.totalSqft, 2)}
            </span>
            <span className="text-xs text-blue-500 font-mono font-semibold">
              sqft
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            {formatDec(summary.totalSqft, 3)} sqft
          </div>
        </div>

        {/* Unique Sizes & Rate Estimator */}
        <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-4 shadow-lg relative overflow-hidden group hover:border-amber-600/40 transition">
          <div className="flex items-center justify-between text-amber-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {lang === 'bn' ? 'ভাড়া / রেট হিসাব' : 'Rate / Rent Estimate'}
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs text-slate-400">{lang === 'bn' ? 'দর:' : 'Rate:'}</span>
            <input
              type="number"
              min="0"
              placeholder="0.00"
              value={ratePerSqft || ''}
              onChange={(e) => onRateChange(Number(e.target.value))}
              className="w-20 px-2 py-0.5 bg-slate-950/80 border border-slate-700 rounded text-xs font-mono text-amber-300 focus:outline-hidden focus:border-amber-400 text-right"
            />
            <span className="text-[11px] text-slate-400">৳/sqft</span>
          </div>

          <div className="text-sm font-bold text-amber-300 font-mono">
            {ratePerSqft > 0 ? (
              <span>৳ {formatDec(summary.totalSqft * ratePerSqft, 2)}</span>
            ) : (
              <span className="text-xs text-slate-500 font-normal">
                {lang === 'bn' ? 'দর দিলে মোট বিল দেখাবে' : 'Enter rate for cost'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
