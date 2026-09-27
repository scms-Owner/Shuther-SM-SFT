import React from 'react';
import { X, Calculator, CheckCircle2 } from 'lucide-react';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-slate-700/60 pb-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {lang === 'bn' ? 'শাটার মেজারমেন্ট ও কনভার্সন সূত্র' : 'Shutter Measurement & Conversion Formulas'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'সিভিল ইঞ্জিনিয়ারিং সাইট স্ট্যান্ডার্ড অনুযায়ী মিলিমিটার থেকে স্কয়ার মিটার ও স্কয়ার ফিট হিসাব'
                : 'Civil engineering standard calculation from Millimeters (mm) to Sqm and Sqft'}
            </p>
          </div>
        </div>

        <div className="space-y-5 text-sm text-slate-300">
          {/* Formula 1: Sqm */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ১. স্কয়ার মিটার (Square Meter - m²) বের করার নিয়ম:
            </h4>
            <p className="text-xs text-slate-400 mb-2">
              যেহেতু ১ মিটার = ১,০০০ মিলিমিটার (১,০০০ × ১,০০০ = ১০,০০,০০০ বর্গ মিমি):
            </p>
            <div className="bg-slate-950 p-3 rounded-lg font-mono text-center text-emerald-300 text-sm border border-emerald-950">
              এরিয়া (m²) = [দৈর্ঘ্য (মিমি) × প্রস্থ (মিমি)] ÷ ১,০০,০০০০
            </div>
            <p className="text-xs text-slate-400 mt-2">
              উদাহরণ: ৩৩০ মিমি × ১২৩০ মিমি = (৩৩০ × ১২৩০) ÷ ১০,০০,০০০ = <strong>০.৪০৫৯ m²</strong>
            </p>
          </div>

          {/* Formula 2: Sqft */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              ২. স্কয়ার ফিট (Square Feet - sqft / sft) বের করার নিয়ম:
            </h4>
            <p className="text-xs text-slate-400 mb-2">
              আন্তর্জাতিক নির্মাণ মানদণ্ড অনুযায়ী, ১ বর্গ মিটার = <strong>১০.৭৬৩৯ স্কয়ার ফিট</strong> (বা ১ ফিট = ৩০৪.৮ মিমি):
            </p>
            <div className="bg-slate-950 p-3 rounded-lg font-mono text-center text-blue-300 text-sm border border-blue-950">
              এরিয়া (sqft) = এরিয়া (m²) × ১০.৭৬৩৯
            </div>
            <p className="text-xs text-slate-400 mt-2">
              উদাহরণ: ০.৪০৫৯ m² × ১০.৭৬৩৯ = <strong>৪.৩৬৯ sqft</strong> প্রতি পিস।
            </p>
          </div>

          {/* Formula 3: Total */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              ৩. সর্বমোট এরিয়া হিসাব (Grand Total Area):
            </h4>
            <div className="bg-slate-950 p-3 rounded-lg font-mono text-center text-amber-300 text-sm border border-amber-950">
              মোট স্কয়ার ফিট = প্রতিটি সাইজের [প্রতি পিস sqft × পিস সংখ্যা] এর যোগফল
            </div>
          </div>

          {/* Tips for handwriting recognition */}
          <div className="bg-indigo-950/40 border border-indigo-800/40 p-3.5 rounded-xl text-xs text-indigo-200">
            <p className="font-semibold text-indigo-300 mb-1">💡 চালানের হাতের লেখা সম্পর্কিত টিপস:</p>
            <p>
              চালানে সাধারণত &quot;01/00&quot; বা &quot;02/00&quot; বলতে যথাক্রমে ১ পিস এবং ২ পিস শাটার বোঝানো হয়।
              আমাদের AI স্বয়ংক্রিয়ভাবে এটি ১ বা ২ হিসেবে সনাক্ত করে। কোনো অস্পষ্ট লেখা থাকলে আপনি টেবিলে সরাসরি ক্লিক করে তা পরিবর্তন করতে পারেন।
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition"
          >
            {lang === 'bn' ? 'বুঝেছি' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
