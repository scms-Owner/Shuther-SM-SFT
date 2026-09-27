import React from 'react';
import { Camera, FileSpreadsheet, Printer, Share2, HelpCircle, History, Sparkles, Building2 } from 'lucide-react';

interface HeaderProps {
  onOpenScanner: () => void;
  onOpenFormula: () => void;
  onOpenPrint: () => void;
  onExportExcel: () => void;
  onShareWhatsApp: () => void;
  onOpenHistory: () => void;
  savedCount: number;
  lang: 'bn' | 'en';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenScanner,
  onOpenFormula,
  onOpenPrint,
  onExportExcel,
  onShareWhatsApp,
  onOpenHistory,
  savedCount,
  lang,
  onToggleLang,
}) => {
  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>ShutterScan</span>
                <span className="text-emerald-400">AI</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                {lang === 'bn' ? 'সাটার স্ক্যানার' : 'Civil Shuttering'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'bn'
                ? 'রিসিভ চালান থেকে মিলিমিটার → স্কয়ার মিটার ও স্কয়ার ফিট স্বয়ংক্রিয় হিসাব'
                : 'Automated mm to Sqm & Sqft Calculator from Shutter Slips'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Scan Trigger */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>{lang === 'bn' ? 'চালান স্ক্যান করুন' : 'Scan Challan'}</span>
          </button>

          {/* Formula Modal button */}
          <button
            onClick={onOpenFormula}
            title={lang === 'bn' ? 'মেজারমেন্ট ও হিসাবের সূত্র' : 'Calculation Formulas'}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/60 transition"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'সূত্র' : 'Formula'}</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={onExportExcel}
            title={lang === 'bn' ? 'এক্সেল ফাইল ডাউনলোড' : 'Export Excel / CSV'}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/60 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">{lang === 'bn' ? 'এক্সেল' : 'Excel'}</span>
          </button>

          {/* Print / PDF */}
          <button
            onClick={onOpenPrint}
            title={lang === 'bn' ? 'অফিসিয়াল রিপোর্ট প্রিন্ট' : 'Print Official Report'}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/60 transition"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={onShareWhatsApp}
            title={lang === 'bn' ? 'হোয়াটসঅ্যাপে সারসংক্ষেপ কপি' : 'Copy summary for WhatsApp'}
            className="p-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            title={lang === 'bn' ? 'পূর্বের সংরক্ষিত চালান' : 'Challan History'}
            className="relative p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/60 transition"
          >
            <History className="w-4 h-4 text-slate-300" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-[10px] text-white font-bold rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="px-2.5 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/60 transition"
          >
            {lang === 'bn' ? 'EN' : 'বাং'}
          </button>
        </div>
      </div>
    </header>
  );
};
