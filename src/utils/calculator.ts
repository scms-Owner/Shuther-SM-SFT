import { ShutterItem, ItemCalculation, SummaryCalculation, ChallanHeader } from '../types';

export const SQM_TO_SQFT_FACTOR = 10.76391042;

/**
 * Calculates single piece and total area in sqm and sqft
 */
export function calculateItemArea(widthMm: number, lengthMm: number, quantity: number): ItemCalculation {
  const w = Math.max(0, Number(widthMm) || 0);
  const l = Math.max(0, Number(lengthMm) || 0);
  const qty = Math.max(0, Number(quantity) || 0);

  // Area in square meters = (mm * mm) / 1,000,000
  const areaPerPieceSqm = (w * l) / 1_000_000;
  // Area in square feet = sqm * 10.76391042
  const areaPerPieceSqft = areaPerPieceSqm * SQM_TO_SQFT_FACTOR;

  const totalAreaSqm = areaPerPieceSqm * qty;
  const totalAreaSqft = areaPerPieceSqft * qty;

  return {
    areaPerPieceSqm,
    areaPerPieceSqft,
    totalAreaSqm,
    totalAreaSqft,
  };
}

/**
 * Calculates grand summary for all shutter items
 */
export function calculateChallanSummary(items: ShutterItem[], ratePerSqft?: number): SummaryCalculation {
  let totalPieces = 0;
  let totalSqm = 0;
  let totalSqft = 0;

  const sizeSet = new Set<string>();

  for (const item of items) {
    const calc = calculateItemArea(item.widthMm, item.lengthMm, item.quantity);
    totalPieces += item.quantity || 0;
    totalSqm += calc.totalAreaSqm;
    totalSqft += calc.totalAreaSqft;

    const minDim = Math.min(item.widthMm, item.lengthMm);
    const maxDim = Math.max(item.widthMm, item.lengthMm);
    sizeSet.add(`${minDim}x${maxDim}`);
  }

  const estimatedCost = ratePerSqft ? totalSqft * ratePerSqft : undefined;

  return {
    totalPieces,
    totalSqm,
    totalSqft,
    uniqueSizesCount: sizeSet.size,
    estimatedCost,
  };
}

/**
 * Format decimal to fixed precision
 */
export function formatDec(num: number, decimals = 3): string {
  if (isNaN(num)) return '0.000';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Generates an Excel-compatible CSV file with UTF-8 BOM
 */
export function exportToCSV(header: ChallanHeader, items: ShutterItem[], summary: SummaryCalculation): void {
  const headers = [
    'ক্রমিক (SL)',
    'বিবরণ (Description)',
    'প্রস্থ মিমি (Width mm)',
    'দৈর্ঘ্য মিমি (Length mm)',
    'প্রতি পিস স্কয়ার মিটার (Sqm/Pc)',
    'প্রতি পিস স্কয়ার ফিট (Sqft/Pc)',
    'পিস (Qty)',
    'মোট স্কয়ার মিটার (Total Sqm)',
    'মোট স্কয়ার ফিট (Total Sqft)',
    'মন্তব্য (Remarks)',
  ];

  const metaRows = [
    ['শাটার রিসিভ চালান ও মেজারমেন্ট রিপোর্ট (Steel Shutter Measurement Report)'],
    [`চালান / পাস নং:`, header.passNumber || 'N/A', `তারিখ:`, header.date || 'N/A', `সময়:`, header.time || 'N/A'],
    [`প্রাপক:`, header.recipient || 'N/A', `পদবী:`, header.designation || 'N/A', `গাড়ি নং:`, header.transportNumber || 'N/A'],
    [`উৎস প্রজেক্ট:`, header.sourceProject || 'N/A', `গন্তব্য:`, header.destination || 'N/A'],
    [`রিসিভ নোট:`, header.receiverSignNote || 'N/A'],
    [],
  ];

  const itemRows = items.map((item, index) => {
    const calc = calculateItemArea(item.widthMm, item.lengthMm, item.quantity);
    return [
      index + 1,
      `"${(item.description || 'Steel Shutter').replace(/"/g, '""')}"`,
      item.widthMm,
      item.lengthMm,
      formatDec(calc.areaPerPieceSqm, 3),
      formatDec(calc.areaPerPieceSqft, 3),
      item.quantity,
      formatDec(calc.totalAreaSqm, 3),
      formatDec(calc.totalAreaSqft, 3),
      `"${(item.remarks || '').replace(/"/g, '""')}"`,
    ];
  });

  const summaryRows = [
    [],
    ['সর্বমোট (GRAND TOTAL)', '', '', '', '', '', summary.totalPieces, formatDec(summary.totalSqm, 3), formatDec(summary.totalSqft, 3)],
    [`মোট সাইজ সংখ্যা:`, summary.uniqueSizesCount],
  ];

  if (summary.estimatedCost) {
    summaryRows.push([`মোট আনুমানিক মূল্য:`, formatDec(summary.estimatedCost, 2)]);
  }

  const allRows = [...metaRows, headers, ...itemRows, ...summaryRows];
  const csvContent = '\uFEFF' + allRows.map((e) => e.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Shutter_Report_${header.passNumber || 'Challan'}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format summary for WhatsApp or SMS sharing
 */
export function generateShareableText(header: ChallanHeader, summary: SummaryCalculation, itemsCount: number): string {
  return `📋 *শাটার রিসিভ চালান বিবরণী*
-------------------------------
পাস/চালান নং: ${header.passNumber || 'N/A'}
তারিখ: ${header.date || 'N/A'} | সময়: ${header.time || 'N/A'}
প্রাপক: ${header.recipient || 'N/A'} (${header.designation || ''})
গাড়ি নং: ${header.transportNumber || 'N/A'}
প্রজেক্ট: ${header.sourceProject || 'N/A'}

📊 *মেজারমেন্ট সারসংক্ষেপ:*
- মোট আইটেম: ${itemsCount} টি সাইজ
- মোট শাটার: ${summary.totalPieces} পিস
- *মোট এরিয়া (স্কয়ার মিটার):* ${formatDec(summary.totalSqm, 2)} m²
- *মোট এরিয়া (স্কয়ার ফিট):* ${formatDec(summary.totalSqft, 2)} sqft
${summary.estimatedCost ? `- আনুমানিক মূল্য: ${formatDec(summary.estimatedCost, 2)} টাকা\n` : ''}
স্বাক্ষর ও রিসিভ: ${header.receiverSignNote || 'Alamin'}
-------------------------------
_ShutterScan AI দ্বারা তৈরি_`;
}
