import { InspectionResult } from '@prisma/client';

export class CreateInspectionDto {
  taskId: string;
  result?: InspectionResult;
  itemResults?: {
    itemId: string;
    result: 'PASS' | 'FAIL' | 'NA';
    notes?: string;
  }[];
  description?: string;
  photos?: string[];
  signature?: string;
  location?: string;
  spotCheck?: boolean;
  geoLocation?: string;
}

export class UpdateInspectionDto {
  result?: InspectionResult;
  itemResults?: {
    itemId: string;
    result: 'PASS' | 'FAIL' | 'NA';
    notes?: string;
  }[];
  description?: string;
  photos?: string[];
  signature?: string;
  location?: string;
  spotCheck?: boolean;
  geoLocation?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'CONFIRMED';
}
