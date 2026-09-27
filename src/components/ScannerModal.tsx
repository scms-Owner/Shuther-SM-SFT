import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Sparkles, X, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { ChallanHeader, ShutterItem } from '../types';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (data: {
    header: ChallanHeader;
    items: ShutterItem[];
    imageUrl?: string;
  }) => void;
  lang: 'bn' | 'en';
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'sample'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream when unmounting or switching tabs
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setSelectedImage(null);
      setError(null);
      setIsScanning(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'camera' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        lang === 'bn'
          ? 'ক্যামেরা চালু করা সম্ভব হয়নি। অনুগ্রহ করে ফাইল আপলোড অপশনটি ব্যবহার করুন।'
          : 'Unable to access camera. Please use file upload instead.'
      );
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setSelectedImage(dataUrl);
    stopCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Perform AI scan using Express backend + Gemini 3.8 Flash
  const processImageWithAI = async (base64Image: string) => {
    setIsScanning(true);
    setError(null);
    setScanProgress(lang === 'bn' ? 'ছবি প্রসেস হচ্ছে ও AI এর কাছে পাঠানো হচ্ছে...' : 'Processing image with Gemini AI...');

    try {
      setScanProgress(
        lang === 'bn'
          ? 'চালানের হাতের লেখা ও সাটারের মাপ বিশ্লেষণ করা হচ্ছে...'
          : 'Reading handwritten dimensions and pieces...'
      );

      const response = await fetch('/api/scan-challan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: base64Image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to scan challan');
      }

      setScanProgress(lang === 'bn' ? 'টেবিল তৈরি হচ্ছে এবং এরিয়া গণনা শেষ...' : 'Finalizing calculations...');

      const extracted = result.data;

      const header: ChallanHeader = {
        passNumber: extracted.passNumber || '',
        date: extracted.date || '',
        time: extracted.time || '',
        recipient: extracted.recipient || '',
        designation: extracted.designation || '',
        sourceProject: extracted.sourceProject || '',
        transportNumber: extracted.transportNumber || '',
        destination: extracted.destination || '',
        receiverSignNote: extracted.receiverSignNote || '',
        notes: extracted.notes || '',
      };

      const items: ShutterItem[] = (extracted.items || []).map((item: any, idx: number) => ({
        id: `scan_${Date.now()}_${idx}`,
        description: item.description || 'Steel Shutter',
        widthMm: Number(item.widthMm) || 0,
        lengthMm: Number(item.lengthMm) || 0,
        quantity: Number(item.quantity) || 1,
        unit: item.unit || 'u',
        remarks: item.remarks || '',
        confidence: item.confidence || 'high',
      }));

      onScanComplete({
        header,
        items,
        imageUrl: base64Image,
      });

      onClose();
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(
        err.message ||
          (lang === 'bn'
            ? 'ছবিটি পড়তে ব্যর্থ হয়েছে। আপনি ডেমো চালানটি লোড করে দেখতে পারেন।'
            : 'Failed to read image. You can try loading the sample challan.')
      );
    } finally {
      setIsScanning(false);
    }
  };

  // One-click load sample
  const handleLoadSample = async () => {
    setIsScanning(true);
    setError(null);
    setScanProgress(lang === 'bn' ? 'আপনার আপলোডকৃত চালানের ডেটা লোড হচ্ছে...' : 'Loading sample challan data...');

    try {
      const res = await fetch('/api/sample-challan');
      const json = await res.json();
      if (json.success) {
        onScanComplete({
          header: json.data,
          items: json.data.items,
        });
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load sample');
    } finally {
      setIsScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {lang === 'bn' ? 'সাটার রিসিভ চালান স্ক্যান করুন' : 'Scan Shutter Receive Challan'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'ছবি তুলুন বা ফাইল আপলোড করুন, AI স্বয়ংক্রিয়ভাবে মিলিমিটার মাপ পড়ে হিসাব করে দেবে'
                  : 'Capture or upload slip, AI will automatically read mm dimensions and calculate'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ছবি আপলোড' : 'Upload Image'}</span>
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'camera' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সরাসরি ক্যামেরা' : 'Live Camera'}</span>
          </button>

          <button
            onClick={() => setActiveTab('sample')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'sample' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ডেমো চালান (১-ক্লিক)' : 'Demo Challan'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                  <p className="text-slate-400 mt-1">
                    {lang === 'bn'
                      ? 'AI সার্ভারে কখনো সাময়িক চাপ থাকলে কয়েক সেকেন্ড পর পুনরায় চেষ্টা করুন অথবা সরাসরি ডেমো চালানটি লোড করুন।'
                      : 'If AI servers experience temporary spikes, retry in a moment or load the sample slip.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-500/20">
                {selectedImage && (
                  <button
                    onClick={() => processImageWithAI(selectedImage)}
                    disabled={isScanning}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold rounded-lg text-xs transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{lang === 'bn' ? 'পুনরায় চেষ্টা করুন (Retry)' : 'Retry Scanning'}</span>
                  </button>
                )}

                <button
                  onClick={handleLoadSample}
                  disabled={isScanning}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-semibold rounded-lg text-xs transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'ডেমো চালানটি লোড করুন' : 'Load Sample Challan'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-blue-950/10 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition text-center group"
                >
                  <div className="p-4 bg-slate-800 group-hover:bg-blue-600/20 text-slate-300 group-hover:text-blue-400 rounded-2xl mb-3 transition">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    {lang === 'bn' ? 'চালানের ছবি এখানে ক্লিক করে সিলেক্ট করুন' : 'Click to browse Challan Image'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    JPG, PNG, WEBP (সর্বোচ্চ ২৫ মেগাবাইট)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative max-h-64 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
                    <img src={selectedImage} alt="Selected preview" className="max-h-64 object-contain" />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg text-xs"
                    >
                      {lang === 'bn' ? 'অন্য ছবি' : 'Change'}
                    </button>
                  </div>

                  <button
                    onClick={() => processImageWithAI(selectedImage)}
                    disabled={isScanning}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 transition"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{scanProgress || (lang === 'bn' ? 'স্ক্যান হচ্ছে...' : 'Scanning...')}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'AI দিয়ে চার্ট ও এরিয়া বের করুন' : 'Process with AI & Calculate Area'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Live Camera */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              {cameraError ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 text-center">
                  <p className="font-semibold">{cameraError}</p>
                </div>
              ) : !selectedImage ? (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border border-slate-800">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Camera guides */}
                  <div className="absolute inset-6 border border-white/30 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                    <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded text-white self-start">
                      {lang === 'bn' ? 'চালানের টেবিলটি ফ্রেমের মধ্যে রাখুন' : 'Align Challan inside frame'}
                    </span>
                  </div>

                  {/* Shutter Button */}
                  <button
                    onClick={handleCapturePhoto}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 p-3 bg-white text-slate-900 hover:bg-slate-200 rounded-full shadow-2xl transition transform active:scale-95 flex items-center justify-center"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-slate-900 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-slate-900" />
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative max-h-64 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
                    <img src={selectedImage} alt="Captured" className="max-h-64 object-contain" />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        startCamera();
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg text-xs"
                    >
                      {lang === 'bn' ? 'আবার তুলুন' : 'Retake'}
                    </button>
                  </div>

                  <button
                    onClick={() => processImageWithAI(selectedImage)}
                    disabled={isScanning}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 transition"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{scanProgress || (lang === 'bn' ? 'স্ক্যান হচ্ছে...' : 'Scanning...')}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'এই ছবি দিয়ে হিসাব করুন' : 'Scan & Calculate'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Sample / Demo Challan */}
          {activeTab === 'sample' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <Check className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'আপনার আপলোড করা স্টিল শাটার রিসিভ চালান' : 'Your uploaded Shutter Receipt'}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'bn'
                    ? 'আপনার ছবির পাস নং ৯৬৬৯২, ট্রান্সপোর্ট TR-59, রিসিভার AL-Amin এর চালানটির ১৫টি শাটারের সম্পূর্ণ মেজারমেন্ট চার্ট ও মিলিমিটার থেকে স্কয়ার মিটার ও স্কয়ার ফিট হিসাব এখনই দেখতে ক্লিক করুন।'
                    : 'Instant test with the 15 shutter line items from Pass #96692, TR-59, Al-Amin.'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <div>পাস নং: 96692</div>
                  <div>গাড়ি: TR-59</div>
                  <div>মোট আইটেম: 15 টি সাইজ</div>
                  <div>মোট শাটার: 17 পিস</div>
                </div>

                <button
                  onClick={handleLoadSample}
                  disabled={isScanning}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 transition"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{scanProgress}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'এই চালানটি লোড করে টেস্ট করুন' : 'Load and Test this Challan'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
