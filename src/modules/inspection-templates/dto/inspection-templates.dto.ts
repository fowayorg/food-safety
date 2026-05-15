import { InspectionType } from '@prisma/client';

export class CreateInspectionTemplateDto {
  name: string;
  type: InspectionType;
  items?: {
    name: string;
    required: boolean;
    type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'PHOTO' | 'SIGNATURE';
  }[];
}

export class UpdateInspectionTemplateDto {
  name?: string;
  type?: InspectionType;
  items?: {
    id?: string;
    name: string;
    required: boolean;
    type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'PHOTO' | 'SIGNATURE';
  }[];
}
