import React, { useState } from 'react';
import { ChallanHeader } from '../types';
import { ChevronDown, ChevronUp, FileText, Calendar, Clock, Truck, MapPin, UserCheck } from 'lucide-react';

interface ChallanInfoFormProps {
  header: ChallanHeader;
  onChange: (header: ChallanHeader) => void;
  lang: 'bn' | 'en';
}

export const ChallanInfoForm: React.FC<ChallanInfoFormProps> = ({ header, onChange, lang }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const update = (key: keyof ChallanHeader, value: string) => {
    onChange({
      ...header,
      [key]: value,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between hover:bg-slate-800/80 transition"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-white text-sm">
            {lang === 'bn' ? 'চালানের মূল বিবরণী (Header Info)' : 'Challan Slip Information'}
          </span>
          {header.passNumber && (
            <span className="px-2 py-0.5 text-xs bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">
              পাস নং: {header.passNumber}
            </span>
          )}
        </div>
        <div className="text-slate-400">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {/* Pass No */}
          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1.5">
              <span>{lang === 'bn' ? 'পাস / চালান নং' : 'Pass / Challan No'}</span>
            </label>
            <input
              type="text"
              value={header.passNumber || ''}
              onChange={(e) => update('passNumber', e.target.value)}
              placeholder="e.g. 96692"
              className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-blue-500 font-mono"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'bn' ? 'তারিখ' : 'Date'}</span>
            </label>
            <input
              type="text"
              value={header.date || ''}
              onChange={(e) => update('date', e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'bn' ? 'সময়' : 'Time'}</span>
            </label>
            <input
              type="text"
              value={header.time || ''}
              onChange={(e) => update('time', e.target.value)}
              placeholder="e.g. 5:40 PM"
              className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Transport / Vehicle */}
          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'bn' ? 'গাড়ি / ট্রান্সপোর্ট নং' : 'Transport No'}</span>
            </label>
            <input
              type="text"
              value={header.transportNumber || ''}
              onChange={(e) => update('transportNumber', e.target.value)}
              placeholder="e.g. TR-59"
              className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'bn' ? 'প্রাপক (Recipient)' : 'Recipient'}</span>
            </label>
            <input
              type="text"
              value={header.recipient || ''}
              onChange={(e) => update('recipient', e.target.value)}
              placeholder="e.g. AL-Amin"
              className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Designation */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              <span>{lang === 'bn' ? 'পদবী / আইডি' : 'Designation / ID'}</span>
            </label>
            <input
              type="text"
              value={header.designation || ''}
              onChange={(e) => update('designation', e.target.value)}
              placeholder="e.g. TR ID"
              className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Source Project */}
          <div className="sm:col-span-2">
            <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'bn' ? 'কোথা থেকে এসেছে (From Site)' : 'From Project'}</span>
            </label>
            <input
              type="text"
              value={header.sourceProject || ''}
              onChange={(e) => update('sourceProject', e.target.value)}
              placeholder="e.g. Demura Scintia to project..."
              className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Received Sign Note */}
          <div className="sm:col-span-2 md:col-span-4">
            <label className="block text-slate-400 font-medium mb-1">
              <span>{lang === 'bn' ? 'স্বাক্ষর / রিসিভ নোট' : 'Received Signature / Note'}</span>
            </label>
            <input
              type="text"
              value={header.receiverSignNote || ''}
              onChange={(e) => update('receiverSignNote', e.target.value)}
              placeholder="e.g. Received Alamin 14/09/24"
              className="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
