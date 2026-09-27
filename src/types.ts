export interface ShutterItem {
  id: string;
  description: string;
  widthMm: number;
  lengthMm: number;
  quantity: number;
  unit: string;
  remarks?: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface ChallanHeader {
  passNumber: string;
  date: string;
  time: string;
  recipient: string;
  designation: string;
  sourceProject: string;
  transportNumber: string;
  destination: string;
  receiverSignNote: string;
  notes?: string;
}

export interface ChallanRecord {
  id: string;
  createdAt: string;
  imageUrl?: string;
  header: ChallanHeader;
  items: ShutterItem[];
  ratePerSqft?: number;
}

export interface ItemCalculation {
  areaPerPieceSqm: number;
  areaPerPieceSqft: number;
  totalAreaSqm: number;
  totalAreaSqft: number;
}

export interface SummaryCalculation {
  totalPieces: number;
  totalSqm: number;
  totalSqft: number;
  uniqueSizesCount: number;
  estimatedCost?: number;
}
