import React, { useState } from 'react';
import { ShutterItem } from '../types';
import { calculateItemArea, formatDec } from '../utils/calculator';
import { Plus, Trash2, Copy, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

interface EditableTableProps {
  items: ShutterItem[];
  onChange: (items: ShutterItem[]) => void;
  lang: 'bn' | 'en';
}

export const EditableTable: React.FC<EditableTableProps> = ({ items, onChange, lang }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const updateItem = (index: number, field: keyof ShutterItem, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const handleQtyDelta = (index: number, delta: number) => {
    const updated = [...items];
    const current = Number(updated[index].quantity) || 0;
    const newQty = Math.max(1, current + delta);
    updated[index] = { ...updated[index], quantity: newQty };
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleDuplicate = (index: number) => {
    const target = items[index];
    const duplicate: ShutterItem = {
      ...target,
      id: `copy_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...items];
    updated.splice(index + 1, 0, duplicate);
    onChange(updated);
  };

  const handleAddRow = () => {
    const newItem: ShutterItem = {
      id: `manual_${Date.now()}`,
      description: 'Steel Shutter',
      widthMm: 0,
      lengthMm: 0,
      quantity: 1,
      unit: 'u',
      remarks: '',
      confidence: 'high',
    };
    onChange([...items, newItem]);
  };

  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.widthMm.toString().includes(q) ||
      item.lengthMm.toString().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.remarks && item.remarks.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Table Action Bar */}
      <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <span>{lang === 'bn' ? 'শাটার মেজারমেন্ট তালিকা' : 'Shutter Measurement List'}</span>
            <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full font-mono">
              {items.length} {lang === 'bn' ? 'টি এন্ট্রি' : 'entries'}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'সাইজ খুঁজুন (উদা: 475)...' : 'Filter size...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-950/70 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 w-36 sm:w-48"
            />
          </div>

          <button
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন শাটার যোগ করুন' : 'Add Shutter'}</span>
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-950/80 sticky top-0 z-10 text-slate-300 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-3 min-w-[130px]">{lang === 'bn' ? 'মালের নাম (Item)' : 'Item'}</th>
              <th className="py-3 px-3 min-w-[110px] text-right">
                {lang === 'bn' ? 'প্রস্থ (মিমি)' : 'Width (mm)'}
              </th>
              <th className="py-3 px-3 min-w-[110px] text-right">
                {lang === 'bn' ? 'দৈর্ঘ্য (মিমি)' : 'Length (mm)'}
              </th>
              <th className="py-3 px-3 min-w-[100px] text-right text-emerald-400 bg-emerald-950/20">
                {lang === 'bn' ? 'প্রতি পিস (m²)' : 'Area/Pc (m²)'}
              </th>
              <th className="py-3 px-3 min-w-[100px] text-right text-blue-400 bg-blue-950/20">
                {lang === 'bn' ? 'প্রতি পিস (sqft)' : 'Area/Pc (sqft)'}
              </th>
              <th className="py-3 px-3 min-w-[120px] text-center">{lang === 'bn' ? 'পরিমাণ (পিস)' : 'Quantity'}</th>
              <th className="py-3 px-3 min-w-[110px] text-right text-emerald-300 bg-emerald-950/30 font-bold">
                {lang === 'bn' ? 'মোট (m²)' : 'Total (m²)'}
              </th>
              <th className="py-3 px-3 min-w-[110px] text-right text-blue-300 bg-blue-950/30 font-bold">
                {lang === 'bn' ? 'মোট (sqft)' : 'Total (sqft)'}
              </th>
              <th className="py-3 px-3 min-w-[100px]">{lang === 'bn' ? 'মন্তব্য' : 'Remarks'}</th>
              <th className="py-3 px-2 w-16 text-center">{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p className="text-sm font-medium text-slate-300">
                      {lang === 'bn' ? 'কোনো শাটার এন্ট্রি নেই' : 'No shutter items entered yet'}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {lang === 'bn'
                        ? 'উপরের "চালান স্ক্যান করুন" বাটনে ক্লিক করে ছবি তুলুন অথবা সরাসরি নিচে ক্লিক করে হাতে সাইজ লিখুন।'
                        : 'Scan your slip with camera or click below to enter dimensions manually.'}
                    </p>
                    <button
                      onClick={handleAddRow}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'নতুন শাটার যোগ করুন' : 'Add First Shutter'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => {
                const calc = calculateItemArea(item.widthMm, item.lengthMm, item.quantity);
                const isUncertain = item.confidence === 'low' || item.confidence === 'medium';

                return (
                  <tr
                    key={item.id || index}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      isUncertain ? 'bg-amber-950/20' : index % 2 === 0 ? 'bg-transparent' : 'bg-slate-900/40'
                    }`}
                  >
                    {/* Index & Confidence */}
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                      <div className="flex items-center justify-center gap-1">
                        <span>{index + 1}</span>
                        {isUncertain && (
                          <span
                            title={
                              lang === 'bn'
                                ? 'হাতের লেখা কিছুটা অস্পষ্ট ছিল, দয়া করে সাইজ যাচাই করুন'
                                : 'Handwritten text was faint, please verify'
                            }
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.description || 'Steel Shutter'}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full bg-slate-950/60 border border-transparent hover:border-slate-700 focus:border-blue-500 rounded px-2 py-1 text-slate-200 focus:outline-hidden text-xs"
                      />
                    </td>

                    {/* Width (mm) */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="relative">
                        <input
                          type="number"
                          value={item.widthMm || ''}
                          onChange={(e) => updateItem(index, 'widthMm', Number(e.target.value))}
                          className="w-full text-right bg-slate-950/70 border border-slate-700 hover:border-slate-500 focus:border-amber-400 rounded px-2 py-1 text-amber-300 font-mono font-bold focus:outline-hidden text-xs"
                        />
                      </div>
                    </td>

                    {/* Length (mm) */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="relative">
                        <input
                          type="number"
                          value={item.lengthMm || ''}
                          onChange={(e) => updateItem(index, 'lengthMm', Number(e.target.value))}
                          className="w-full text-right bg-slate-950/70 border border-slate-700 hover:border-slate-500 focus:border-amber-400 rounded px-2 py-1 text-amber-300 font-mono font-bold focus:outline-hidden text-xs"
                        />
                      </div>
                    </td>

                    {/* Per piece sqm */}
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 bg-emerald-950/10">
                      {formatDec(calc.areaPerPieceSqm, 3)}
                    </td>

                    {/* Per piece sqft */}
                    <td className="py-2.5 px-3 text-right font-mono text-blue-400 bg-blue-950/10">
                      {formatDec(calc.areaPerPieceSqft, 3)}
                    </td>

                    {/* Quantity with quick buttons */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleQtyDelta(index, -1)}
                          disabled={item.quantity <= 1}
                          className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded text-xs transition"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={(e) => updateItem(index, 'quantity', Math.max(1, Number(e.target.value)))}
                          className="w-12 text-center bg-slate-950/80 border border-slate-700 rounded px-1 py-1 font-mono text-white font-bold text-xs"
                        />
                        <button
                          onClick={() => handleQtyDelta(index, 1)}
                          className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Total sqm */}
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-300 bg-emerald-950/20 font-bold">
                      {formatDec(calc.totalAreaSqm, 3)}
                    </td>

                    {/* Total sqft */}
                    <td className="py-2.5 px-3 text-right font-mono text-blue-300 bg-blue-950/20 font-bold">
                      {formatDec(calc.totalAreaSqft, 3)}
                    </td>

                    {/* Remarks */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder="—"
                        value={item.remarks || ''}
                        onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                        className="w-full bg-slate-950/40 border border-transparent hover:border-slate-800 focus:border-slate-600 rounded px-1.5 py-1 text-slate-400 focus:text-slate-200 text-xs"
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleDuplicate(index)}
                          title={lang === 'bn' ? 'কপি করুন' : 'Duplicate'}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          title={lang === 'bn' ? 'ডিলিট করুন' : 'Delete'}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Helpful Hint Footer */}
      <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {lang === 'bn'
              ? 'সাইজ বা পিস পরিবর্তন করলেই স্বয়ংক্রিয়ভাবে স্কয়ার মিটার ও স্কয়ার ফিট হিসাব রিক্যালকুলেট হয়ে যাবে।'
              : 'Directly edit width, length or quantity; sqm and sqft will recalculate instantly.'}
          </span>
        </div>
        <div className="text-slate-500 font-mono">
          সূত্র: এরিয়া = (মিমি × মিমি ÷ ১০,০০,০০০) × ১০.৭৬৩৯ sqft
        </div>
      </div>
    </div>
  );
};
