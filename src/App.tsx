import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { EditableTable } from './components/EditableTable';
import { ChallanInfoForm } from './components/ChallanInfoForm';
import { ImageViewer } from './components/ImageViewer';
import { ScannerModal } from './components/ScannerModal';
import { FormulaModal } from './components/FormulaModal';
import { PrintableView } from './components/PrintableView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ChallanHeader, ShutterItem, ChallanRecord } from './types';
import {
  calculateChallanSummary,
  exportToCSV,
  generateShareableText,
} from './utils/calculator';
import {
  Sparkles,
  Camera,
  Layers,
  CheckCircle,
  Copy,
  PlusCircle,
  Split,
  Eye,
  RotateCcw,
} from 'lucide-react';

// Initial real blank state for construction site
const INITIAL_HEADER: ChallanHeader = {
  passNumber: '',
  date: new Date().toLocaleDateString('en-GB'),
  time: '',
  recipient: '',
  designation: '',
  sourceProject: '',
  transportNumber: '',
  destination: '',
  receiverSignNote: '',
  notes: '',
};

const INITIAL_ITEMS: ShutterItem[] = [];

export default function App() {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [header, setHeader] = useState<ChallanHeader>(INITIAL_HEADER);
  const [items, setItems] = useState<ShutterItem[]>(INITIAL_ITEMS);
  const [ratePerSqft, setRatePerSqft] = useState<number>(0);
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  // Layout mode: split view with image or full table
  const [showImageViewer, setShowImageViewer] = useState<boolean>(true);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isFormulaOpen, setIsFormulaOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // History storage
  const [savedRecords, setSavedRecords] = useState<ChallanRecord[]>([]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('shutter_challan_history');
      if (stored) {
        setSavedRecords(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save record to local storage
  const saveCurrentChallan = () => {
    const newRecord: ChallanRecord = {
      id: `record_${Date.now()}`,
      createdAt: new Date().toISOString(),
      header,
      items,
      ratePerSqft,
      imageUrl: scannedImage || undefined,
    };

    const updated = [newRecord, ...savedRecords.slice(0, 24)];
    setSavedRecords(updated);
    try {
      localStorage.setItem('shutter_challan_history', JSON.stringify(updated));
      triggerToast(lang === 'bn' ? 'চালান হিস্ট্রিতে সংরক্ষিত হয়েছে!' : 'Challan saved to history!');
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRecord = (id: string) => {
    const updated = savedRecords.filter((r) => r.id !== id);
    setSavedRecords(updated);
    try {
      localStorage.setItem('shutter_challan_history', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const loadRecord = (record: ChallanRecord) => {
    setHeader(record.header);
    setItems(record.items);
    if (record.ratePerSqft) setRatePerSqft(record.ratePerSqft);
    if (record.imageUrl) setScannedImage(record.imageUrl);
    triggerToast(lang === 'bn' ? `পাস নং ${record.header.passNumber || ''} লোড হয়েছে` : 'Challan loaded');
  };

  // Summary calculations
  const summary = calculateChallanSummary(items, ratePerSqft);

  // Handle Scan Completed
  const handleScanComplete = (data: {
    header: ChallanHeader;
    items: ShutterItem[];
    imageUrl?: string;
  }) => {
    setHeader(data.header);
    setItems(data.items);
    if (data.imageUrl) {
      setScannedImage(data.imageUrl);
      setShowImageViewer(true);
    }
    triggerToast(
      lang === 'bn'
        ? `চালান স্ক্যান সফল! ${data.items.length} টি শাটারের সাইজ বের করা হয়েছে।`
        : `Successfully scanned ${data.items.length} shutter items.`
    );
  };

  // Export to Excel CSV
  const handleExportCSV = () => {
    exportToCSV(header, items, summary);
    triggerToast(lang === 'bn' ? 'এক্সেল ফাইল ডাউনলোড শুরু হয়েছে' : 'Excel file downloaded');
  };

  // Copy WhatsApp summary
  const handleShareWhatsApp = async () => {
    const text = generateShareableText(header, summary, items.length);
    try {
      await navigator.clipboard.writeText(text);
      triggerToast(
        lang === 'bn'
          ? 'হোয়াটসঅ্যাপে পাঠানোর মতো সারসংক্ষেপ কপি হয়েছে!'
          : 'Summary copied to clipboard!'
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Reset to blank challan
  const handleNewChallan = () => {
    setHeader({
      passNumber: '',
      date: new Date().toLocaleDateString('en-GB'),
      time: '',
      recipient: '',
      designation: '',
      sourceProject: '',
      transportNumber: '',
      destination: '',
      receiverSignNote: '',
      notes: '',
    });
    setItems([
      {
        id: `row_${Date.now()}`,
        description: 'Steel Shutter',
        widthMm: 450,
        lengthMm: 1000,
        quantity: 1,
        unit: 'u',
        remarks: '',
        confidence: 'high',
      },
    ]);
    setScannedImage(null);
    triggerToast(lang === 'bn' ? 'নতুন ফাঁকা চালান তৈরি হয়েছে' : 'New blank challan created');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenFormula={() => setIsFormulaOpen(true)}
        onOpenPrint={() => setIsPrintOpen(true)}
        onExportExcel={handleExportCSV}
        onShareWhatsApp={handleShareWhatsApp}
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedCount={savedRecords.length}
        lang={lang}
        onToggleLang={() => setLang(lang === 'bn' ? 'en' : 'bn')}
      />

      {/* Hero Site Status Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">
              {lang === 'bn' ? 'বর্তমান সক্রিয় চালান:' : 'Active Slip:'}
            </span>
            <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {header.passNumber ? `#${header.passNumber}` : (lang === 'bn' ? 'নতুন চালান' : 'New Slip')}
            </span>
            {header.sourceProject && (
              <span className="text-slate-400 hidden sm:inline">
                | {header.sourceProject}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImageViewer(!showImageViewer)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                showImageViewer
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>
                {showImageViewer
                  ? lang === 'bn'
                    ? 'আসল কপি হাইড করুন'
                    : 'Hide Image'
                  : lang === 'bn'
                  ? 'আসল কপি দেখুন'
                  : 'Show Image'}
              </span>
            </button>

            <button
              onClick={saveCurrentChallan}
              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition"
            >
              {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save'}
            </button>

            <button
              onClick={handleNewChallan}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition"
            >
              {lang === 'bn' ? 'নতুন চালান' : 'New Slip'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* KPI Summary Cards */}
        <SummaryCards
          summary={summary}
          ratePerSqft={ratePerSqft}
          onRateChange={setRatePerSqft}
          lang={lang}
        />

        {/* Challan Info Form Accordion */}
        <ChallanInfoForm header={header} onChange={setHeader} lang={lang} />

        {/* Split View: Left Image Preview (optional), Right Table */}
        <div className={`grid grid-cols-1 ${showImageViewer ? 'lg:grid-cols-12' : ''} gap-6`}>
          {showImageViewer && (
            <div className="lg:col-span-5 flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  {lang === 'bn' ? 'চালানের আসল ছবি' : 'Original Challan Photo'}
                </span>
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  <Camera className="w-3 h-3" />
                  <span>{lang === 'bn' ? 'অন্য ছবি তুলুন' : 'New Photo'}</span>
                </button>
              </div>

              {/* ImageViewer with Zoom/Rotate Controls */}
              <ImageViewer
                imageUrl={scannedImage}
                lang={lang}
                onUploadNew={() => setIsScannerOpen(true)}
              />
            </div>
          )}

          {/* Editable Measurement Table */}
          <div className={showImageViewer ? 'lg:col-span-7' : 'w-full'}>
            <EditableTable items={items} onChange={setItems} lang={lang} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-400">ShutterScan AI</span> —{' '}
            {lang === 'bn'
              ? 'সিভিল ও কন্সট্রাকশন সাইট শাটারিং এরিয়া ক্যালকুলেটর'
              : 'Civil Construction Shuttering Area Calculator'}
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>১ m² = ১০.৭৬৩৯ sqft</span>
            <span>•</span>
            <span>১ মিটার = ১০০০ মিমি</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
        lang={lang}
      />

      <FormulaModal
        isOpen={isFormulaOpen}
        onClose={() => setIsFormulaOpen(false)}
        lang={lang}
      />

      <PrintableView
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        header={header}
        items={items}
        summary={summary}
        ratePerSqft={ratePerSqft}
        lang={lang}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={savedRecords}
        onSelectRecord={loadRecord}
        onDeleteRecord={deleteRecord}
        lang={lang}
      />
    </div>
  );
}
