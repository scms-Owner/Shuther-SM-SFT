import React from 'react';
import { ChallanHeader, ShutterItem, SummaryCalculation } from '../types';
import { calculateItemArea, formatDec } from '../utils/calculator';
import { Printer, X, Download } from 'lucide-react';

interface PrintableViewProps {
  header: ChallanHeader;
  items: ShutterItem[];
  summary: SummaryCalculation;
  ratePerSqft: number;
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const PrintableView: React.FC<PrintableViewProps> = ({
  header,
  items,
  summary,
  ratePerSqft,
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-4 sm:p-6 flex flex-col items-center">
      {/* Action Header Bar (Hidden during print) */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 bg-slate-900 border border-slate-800 p-3 rounded-2xl print:hidden">
        <div className="flex items-center gap-2">
          <Printer className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-bold text-white">
            {lang === 'bn' ? 'প্রিন্ট ও অফিসিয়াল চালান রিপোর্ট ভিউ' : 'Print & Official Challan Report'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow transition"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'bn' ? 'প্রিন্ট বা PDF সেভ করুন' : 'Print / Save PDF'}</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* The Printable A4 Sheet */}
      <div className="w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-10 font-sans print:shadow-none print:p-2 print:m-0 print:max-w-none">
        {/* Header Document Section */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                STEEL SHUTTER RECEIVE & MEASUREMENT REPORT
              </h1>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                স্টিল সাটার রিসিভ চালান ও মেজারমেন্ট বিবরণী
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 rounded border border-slate-300 inline-block">
                PASS NO: {header.passNumber || 'N/A'}
              </div>
              <div className="text-[11px] text-slate-600 mt-1 font-mono">
                DATE: {header.date || 'N/A'} | TIME: {header.time || 'N/A'}
              </div>
            </div>
          </div>

          {/* Meta Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Recipient (প্রাপক)</span>
              <span className="font-semibold text-slate-800">{header.recipient || '—'}</span>
              {header.designation && <span className="text-slate-500 block text-[11px]">({header.designation})</span>}
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Transport (গাড়ি নং)</span>
              <span className="font-semibold text-slate-800 font-mono">{header.transportNumber || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Source Project (উৎস)</span>
              <span className="font-semibold text-slate-800">{header.sourceProject || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Destination (গন্তব্য)</span>
              <span className="font-semibold text-slate-800">{header.destination || 'Site Yard'}</span>
            </div>
          </div>
        </div>

        {/* Shutter Items Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold text-[11px]">
                <th className="py-2 px-2 text-center border-r border-slate-300 w-8">SL</th>
                <th className="py-2 px-3 border-r border-slate-300">Name of Materials / সাইজ</th>
                <th className="py-2 px-2 text-right border-r border-slate-300">প্রস্থ (mm)</th>
                <th className="py-2 px-2 text-right border-r border-slate-300">দৈর্ঘ্য (mm)</th>
                <th className="py-2 px-2 text-right border-r border-slate-300">প্রতি পিস (m²)</th>
                <th className="py-2 px-2 text-right border-r border-slate-300">প্রতি পিস (sqft)</th>
                <th className="py-2 px-2 text-center border-r border-slate-300">Qty (পিস)</th>
                <th className="py-2 px-2 text-right border-r border-slate-300 bg-slate-50 font-bold">মোট (m²)</th>
                <th className="py-2 px-2 text-right border-r border-slate-300 bg-slate-50 font-bold">মোট (sqft)</th>
                <th className="py-2 px-2">মন্তব্য</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, index) => {
                const calc = calculateItemArea(item.widthMm, item.lengthMm, item.quantity);
                return (
                  <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono text-slate-500">
                      {index + 1}
                    </td>
                    <td className="py-1.5 px-3 border-r border-slate-200 font-medium text-slate-900">
                      {item.description || 'Steel Shutter'} ({item.widthMm} × {item.lengthMm} mm)
                    </td>
                    <td className="py-1.5 px-2 text-right border-r border-slate-200 font-mono font-semibold">
                      {item.widthMm}
                    </td>
                    <td className="py-1.5 px-2 text-right border-r border-slate-200 font-mono font-semibold">
                      {item.lengthMm}
                    </td>
                    <td className="py-1.5 px-2 text-right border-r border-slate-200 font-mono text-slate-700">
                      {formatDec(calc.areaPerPieceSqm, 3)}
                    </td>
                    <td className="py-1.5 px-2 text-right border-r border-slate-200 font-mono text-slate-700">
                      {formatDec(calc.areaPerPieceSqft, 3)}
                    </td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-200 font-mono font-bold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="py-1.5 px-2 text-right border-r border-slate-200 font-mono font-bold bg-slate-50">
                      {formatDec(calc.totalAreaSqm, 3)}
                    </td>
                    <td className="py-1.5 px-2 text-right border-r border-slate-200 font-mono font-bold bg-slate-50 text-blue-900">
                      {formatDec(calc.totalAreaSqft, 3)}
                    </td>
                    <td className="py-1.5 px-2 text-slate-500 text-[11px]">
                      {item.remarks || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Grand Total Row */}
            <tfoot>
              <tr className="bg-slate-200 font-black border-t-2 border-slate-400 text-slate-900 text-xs">
                <td colSpan={6} className="py-2.5 px-3 text-right uppercase border-r border-slate-300">
                  সর্বমোট (GRAND TOTAL):
                </td>
                <td className="py-2.5 px-2 text-center font-mono text-sm border-r border-slate-300">
                  {summary.totalPieces} pcs
                </td>
                <td className="py-2.5 px-2 text-right font-mono text-sm border-r border-slate-300">
                  {formatDec(summary.totalSqm, 3)} m²
                </td>
                <td className="py-2.5 px-2 text-right font-mono text-sm border-r border-slate-300 text-blue-900">
                  {formatDec(summary.totalSqft, 3)} sqft
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Calculation Summary Box */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-8 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">মোট সাটার পরিমাণ</span>
            <span className="text-lg font-bold text-slate-900">{summary.totalPieces} পিস</span>
            <span className="text-slate-500 block text-[10px]">({summary.uniqueSizesCount} টি সাইজ)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">মোট স্কয়ার মিটার (m²)</span>
            <span className="text-lg font-bold text-emerald-800 font-mono">{formatDec(summary.totalSqm, 2)} m²</span>
            <span className="text-slate-500 block text-[10px]">({formatDec(summary.totalSqm, 4)} m²)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">মোট স্কয়ার ফিট (sqft)</span>
            <span className="text-lg font-bold text-blue-800 font-mono">{formatDec(summary.totalSqft, 2)} sqft</span>
            {ratePerSqft > 0 && (
              <span className="text-slate-700 block text-[11px] font-semibold">
                দর: ৳{ratePerSqft} | মোট: ৳{formatDec(summary.totalSqft * ratePerSqft, 2)}
              </span>
            )}
          </div>
        </div>

        {/* Signatures Block for Construction Site Delivery */}
        <div className="pt-12 grid grid-cols-4 gap-4 text-center text-xs text-slate-700 border-t border-slate-200">
          <div>
            <div className="border-t border-slate-400 pt-1.5 font-semibold">Site Engineer</div>
            <div className="text-[10px] text-slate-500">সাইট ইঞ্জিনিয়ার</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1.5 font-semibold">Store Keeper</div>
            <div className="text-[10px] text-slate-500">স্টোর কিপার</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1.5 font-semibold">Inventory Officer</div>
            <div className="text-[10px] text-slate-500">ইনভেন্টরি অফিসার</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1.5 font-semibold">Confirmed By / PM</div>
            <div className="text-[10px] text-slate-500">অনুমোদনকারী</div>
          </div>
        </div>

        {/* Receiver Note Note */}
        {header.receiverSignNote && (
          <div className="mt-6 text-center text-xs italic text-slate-600">
            &quot;{header.receiverSignNote}&quot;
          </div>
        )}
      </div>
    </div>
  );
};
